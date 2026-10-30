const { test, expect } = require('@playwright/test')
const fs = require('node:fs/promises')
const { artMap } = require('../fixtures/art-map.cjs')
const { definitions: themes } = require('../../scripts/art-registry.cjs')
const ready = async page => {
  await page.goto('/')
  await page.waitForFunction(() => document.querySelector('.editContainer')?.__vue__?.mindMap?.waitForArtTheme)
  await page.evaluate(() => document.querySelector('.editContainer').__vue__.mindMap.waitForArtTheme())
}

test('closing a sidebar removes every hidden panel from Tab navigation and restores its trigger', async ({ page }) => {
  await ready(page)
  const trigger = page.locator('.sidebarTriggerContainer').getByRole('button', { name: 'Themes', exact: true })
  await trigger.focus()
  await page.keyboard.press('Enter')
  const close = page.locator('.sidebarContainer.show .closeBtn')
  await close.focus()
  await page.keyboard.press('Enter')
  await expect(trigger).toBeFocused()
  await expect(page.locator('.sidebarContainer.show')).toHaveCount(0)
  for (let i = 0; i < 24; i++) {
    await page.keyboard.press('Tab')
    expect(await page.evaluate(() => !!document.activeElement.closest('.sidebarContainer:not(.show)'))).toBe(false)
  }
  await trigger.click()
  await page.getByRole('tab', { name: 'Mappop Styles' }).focus()
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
  expect(await page.locator('.sidebarContainer').evaluateAll(els => els.every(el => el.inert))).toBe(true)
})

test('corrupt or non-object preferences recover without losing the saved map, backup or other storage', async ({ browser }) => {
  for (const value of ['{broken', '[]', 'null', '"text"', '23', 'false']) {
    const context = await browser.newContext()
    await context.addInitScript(({ value, root }) => {
      localStorage.setItem('SIMPLE_MIND_MAP_CONFIG', value)
      localStorage.setItem('SIMPLE_MIND_MAP_LOCAL_CONFIG', value)
      localStorage.setItem('SIMPLE_MIND_MAP_DATA', JSON.stringify({ root, layout: 'mindMap', theme: { template: 'mappop-anime-pop', config: {} } }))
      localStorage.setItem('MAPPOP_PRE_IMPORT_BACKUP', 'retained backup')
      localStorage.setItem('unrelated-storage', 'retained value')
    }, { value, root: artMap })
    const page = await context.newPage(), errors = []
    page.on('pageerror', e => errors.push(e.message))
    await ready(page)
    await expect(page.locator('.smm-node')).toHaveCount(43)
    const storage = await page.evaluate(() => ({
      backup: localStorage.getItem('MAPPOP_PRE_IMPORT_BACKUP'),
      other: localStorage.getItem('unrelated-storage'),
      root: new DOMParser().parseFromString(JSON.parse(localStorage.getItem('SIMPLE_MIND_MAP_DATA')).root.data.text, 'text/html').body.textContent
    }))
    expect(storage).toEqual({ backup: 'retained backup', other: 'retained value', root: artMap.data.text })
    expect(errors).toEqual([])
    await context.close()
  }
})

for (const type of ['svg', 'png']) {
  test(`immediate imported-theme ${type} export waits for an uncached slow font and matches the ready map`, async ({ page }, testInfo) => {
    await ready(page)
    await page.route('**/MappopSerif.woff2', async route => {
      await new Promise(resolve => setTimeout(resolve, 800))
      await route.continue()
    })
    const result = await page.evaluate(async ({ root, type }) => {
      const map = document.querySelector('.editContainer').__vue__.mindMap
      map.setFullData({ root, layout: 'mindMap', theme: { template: 'mappop-vintage-editorial', config: {} } })
      const start = performance.now()
      const immediate = await map.export(type, false, 'Immediate import')
      const elapsed = performance.now() - start
      const later = await map.export(type, false, 'Immediate import')
      const svg = await fetch(type === 'svg' ? immediate : await map.export('svg', false)).then(r => r.text())
      const exportedDocument = new DOMParser().parseFromString(svg, 'image/svg+xml')
      return { immediate, later, elapsed, nodes: exportedDocument.querySelectorAll('.smm-node').length, embedded: svg.includes('font-family:"Mappop Serif";src:') }
    }, { root: artMap, type })
    expect(result.elapsed).toBeGreaterThanOrEqual(700)
    expect(result.nodes).toBe(43)
    expect(result.embedded).toBe(true)
    // Exact image bytes prove that the first export uses the final measured layout.
    expect(result.immediate).toBe(result.later)
    await fs.writeFile(testInfo.outputPath(`immediate.${type}`), Buffer.from(result.immediate.split(',')[1], 'base64'))
  })
}

test('export toolbar also waits for imported font readiness before downloading', async ({ page }) => {
  await ready(page)
  let releaseFont
  const blocked = new Promise(resolve => { releaseFont = resolve })
  await page.route('**/MappopBrush.woff2', async route => { await blocked; await route.continue() })
  await page.evaluate(root => document.querySelector('.editContainer').__vue__.mindMap.setFullData({ root, theme: { template: 'mappop-ink-wash', config: {} } }), artMap)
  await page.locator('.toolbarBtn').filter({ hasText: /^Export$/ }).click()
  await page.locator('.nodeExportDialog .downloadTypeItem').filter({ hasText: /SVG/i }).click()
  const downloads = []
  page.on('download', download => downloads.push(download))
  await page.locator('.nodeExportDialog .btnList .el-button--primary').click()
  await expect(page.locator('.el-loading-mask').first()).toBeVisible()
  expect(downloads).toHaveLength(0)
  const downloaded = page.waitForEvent('download')
  releaseFont()
  const download = await downloaded
  const xml = await fs.readFile(await download.path(), 'utf8')
  expect(xml).toContain('font-family:"Mappop Brush";src:')
  expect((xml.match(/class="smm-node"/g) || []).length).toBe(43)
})

test('failed fonts explain the fallback and preserve editable export; stale exports can cancel and time out', async ({ page }) => {
  await ready(page)
  await page.route('**/MappopSerif.woff2', route => route.abort())
  await page.evaluate(root => document.querySelector('.editContainer').__vue__.mindMap.setFullData({ root, theme: { template: 'mappop-zen-japan', config: {} } }), artMap)
  await expect(page.locator('[data-mappop-font][data-font-state="fallback"]')).toHaveCount(1)
  await page.locator('.sidebarTriggerContainer').getByRole('button', { name: 'Themes', exact: true }).click()
  await expect(page.locator('.themeStatus')).toContainText('fallback')
  const result = await page.evaluate(async () => {
    const map = document.querySelector('.editContainer').__vue__.mindMap
    const code = promise => promise.then(() => 'unexpected success', error => error.code || error.name)
    const failed = await code(map.export('svg', false))
    const smm = await map.export('smm', false)
    const cancelled = map.waitForArtTheme()
    map.setTheme('mappop-anime-pop')
    const changed = await code(cancelled)
    const timeout = await code(map.waitForArtTheme({ timeoutMs: 1 }))
    const controller = new AbortController()
    const pending = map.waitForArtTheme({ signal: controller.signal })
    controller.abort()
    return { failed, smm: !!smm, changed, timeout, aborted: await code(pending) }
  })
  expect(result).toEqual({ failed: 'MAPPOP_FONT_UNAVAILABLE', smm: true, changed: 'MAPPOP_EXPORT_CANCELLED', timeout: 'MAPPOP_EXPORT_TIMEOUT', aborted: 'MAPPOP_EXPORT_CANCELLED' })
  await expect(page.locator('.smm-node')).toHaveCount(43)
})

test('search, family and appearance combine with accurate counts and a recoverable empty state', async ({ page }) => {
  const previewRequests = []
  page.on('request', request => { if (request.url().includes('/mappop/previews/')) previewRequests.push(request.url()) })
  await page.addInitScript(() => localStorage.setItem('SIMPLE_MIND_MAP_LANG', 'zh'))
  await page.setViewportSize({ width: 390, height: 844 })
  await ready(page)
  expect(previewRequests).toEqual([])
  await page.locator('.sidebarTriggerContainer').getByRole('button', { name: '主题', exact: true }).click()
  await expect(page.locator('.artThemeItem img').first()).toBeVisible()
  await expect.poll(() => page.locator('.artThemeItem img').first().evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true)
  await page.getByRole('button', { name: '夜色', exact: true }).click()
  await expect(page.getByRole('button', { name: '像素街机 · Pixel Arcade', exact: true })).toBeVisible()
  await expect(page.locator('.artThemeItem')).toHaveCount(themes.filter(t => t.dark).length)
  await page.getByRole('button', { name: '技术', exact: true }).click()
  await expect(page.locator('.artThemeItem')).toHaveCount(themes.filter(t => t.dark && t.category === 'technical').length)
  const search = page.getByRole('searchbox', { name: '搜索画风' })
  await search.fill('terminal tree')
  await expect(page.locator('.artThemeItem')).toHaveCount(1)
  await expect(page.locator('.artThemeItem .name')).toHaveText('终端目录')
  await search.fill('不存在的画风')
  await expect(page.locator('.themeResultCount')).toHaveText('0 款')
  await page.getByRole('button', { name: '清除筛选' }).click()
  await expect(page.locator('.artThemeItem')).toHaveCount(themes.length)
  await search.fill('缝线')
  await expect(page.locator('.artThemeItem .name')).toHaveText('布艺刺绣')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('an unknown saved theme falls back without losing content or upstream editing', async ({ page }) => {
  await ready(page)
  await page.evaluate(root => document.querySelector('.editContainer').__vue__.mindMap.setFullData({ root, layout: 'mindMap', theme: { template: 'mappop-no-longer-known', config: {} } }), artMap)
  await expect(page.locator('.smm-node')).toHaveCount(43)
  await expect(page.locator('[data-mappop-decoration]')).toHaveCount(0)
  const nodes = await page.evaluate(async () => {
    const map = document.querySelector('.editContainer').__vue__.mindMap
    const xml = await fetch(await map.export('svg', false)).then(r => r.text())
    return (xml.match(/class="smm-node"/g) || []).length
  })
  expect(nodes).toBe(43)
})

test('a delayed picker choice cannot replace a newer imported theme; metro respects manual line colors', async ({ page }) => {
  await ready(page)
  let releaseFont
  const blocked = new Promise(resolve => { releaseFont = resolve })
  await page.route('**/MappopPixel.woff2', async route => { await blocked; await route.continue() })
  await page.locator('.sidebarTriggerContainer').getByRole('button', { name: 'Themes', exact: true }).click()
  await page.getByRole('button', { name: 'Pixel Arcade', exact: true }).click()
  await expect(page.locator('.themeListTheme')).toHaveAttribute('aria-busy', 'true')
  await page.evaluate(() => document.querySelector('.editContainer').__vue__.mindMap.setTheme('mappop-travel-tickets'))
  releaseFont()
  await expect(page.locator('.themeListTheme')).toHaveAttribute('aria-busy', 'false')
  await expect(page.locator('#mindMapContainer')).toHaveAttribute('data-mappop-art', 'travel-tickets')
  const colors = await page.evaluate(async () => {
    const map = document.querySelector('.editContainer').__vue__.mindMap
    map.setTheme('mappop-metro-transit')
    map.setThemeConfig({ lineColor: '#914234' }, true)
    map.reRender()
    await map.waitForArtTheme()
    return map.renderer.root._lines.map(line => line.attr('stroke'))
  })
  expect(colors.length).toBeGreaterThan(0)
  expect(colors.every(color => color === '#914234')).toBe(true)
})

test('relationship lines keep 3:1 against the worst actual composited texture pixel', async ({ page }) => {
  await ready(page)
  const results = []
  for (const theme of themes) {
    const minimum = await page.evaluate(async theme => {
      const map = document.querySelector('.editContainer').__vue__.mindMap
      map.setTheme(`mappop-${theme.slug}`)
      await map.waitForArtTheme()
      const image = new Image()
      image.src = map.themeConfig.backgroundImage
      await image.decode()
      const canvas = document.createElement('canvas')
      canvas.width = image.width; canvas.height = image.height
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = theme.background; ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(image, 0, 0)
      const lum = rgb => rgb.map(x => x / 255).map(x => x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4).reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0)
      const colors = (theme.branchPalette || [theme.line]).map(hex => lum(hex.slice(1).match(/../g).map(x => parseInt(x, 16))))
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data
      let minimum = 100
      for (let i = 0; i < pixels.length; i += 4) {
        const bg = lum([pixels[i], pixels[i + 1], pixels[i + 2]])
        for (const line of colors) minimum = Math.min(minimum, (Math.max(line, bg) + 0.05) / (Math.min(line, bg) + 0.05))
      }
      return minimum
    }, theme)
    results.push({ slug: theme.slug, minimum })
  }
  expect(results.filter(result => result.minimum < 3)).toEqual([])
})
