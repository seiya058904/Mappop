const { test, expect } = require('@playwright/test')
const { artMap } = require('../fixtures/art-map.cjs')
const { definitions: themes } = require('../../scripts/art-registry.cjs')
const mapReady = async page => {
  await page.waitForFunction(() => !!document.querySelector('[data-mappop-font]') && !document.querySelector('.editContainer').__vue__.mindMap.renderer.isRendering)
}

test('All real previews, Chinese font files and category/focus controls load on a 390px screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const failures = []
  page.on('response', r => { if (r.status() >= 400 && /mappop\//.test(r.url())) failures.push(r.url()) })
  await page.goto('/')
  await mapReady(page)
  await page.locator('.sidebarTriggerContainer .triggerItem').filter({ hasText: /^Themes$/ }).click()
  await expect(page.locator('.artThemeItem')).toHaveCount(themes.length)
  for (const theme of themes) {
    const image = page.getByRole('button', { name: theme.name, exact: true }).locator('img')
    await image.scrollIntoViewIfNeeded()
    await expect.poll(() => image.evaluate(el => el.complete && el.naturalWidth > 200)).toBe(true)
    const card = image.locator('..').locator('..')
    expect(await card.evaluate(el => {
      const box = el.getBoundingClientRect()
      const name = el.querySelector('.themeChineseName').getBoundingClientRect()
      return name.bottom <= box.bottom && name.top >= box.top && box.height > 150
    })).toBe(true)
  }
  await page.getByRole('button', { name: 'After dark', exact: true }).click()
  await expect(page.locator('.artThemeItem')).toHaveCount(themes.filter(t => t.dark).length)
  const atlas = page.getByRole('button', { name: 'Celestial Atlas', exact: true })
  await atlas.focus()
  await page.keyboard.press('Enter')
  await expect(atlas).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.themeGroupList')).toHaveClass(/isDark/)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: 'test-results/art-selector-mobile.png' })
  expect(failures).toEqual([])
})

test('manual geometry, image, relationship and four-level content survive all themes and fast switches', async ({ page }) => {
  test.setTimeout(120000)
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  await page.goto('/')
  await mapReady(page)
  const root = JSON.parse(JSON.stringify(artMap))
  root.children[0].data = { ...root.children[0].data, uid: 'custom-node', shape: 'diamond', fillColor: '#ee9988', borderColor: '#882211', borderWidth: 3, fontSize: 24, associativeLineTargets: ['image-node'] }
  root.children[1].data = { ...root.children[1].data, uid: 'image-node', image: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="30"><rect width="40" height="30" fill="#c76b49"/></svg>'), imageSize: { width: 40, height: 30 } }
  await page.evaluate(root => document.querySelector('.editContainer').__vue__.mindMap.setFullData({ root, layout: 'mindMap' }), root)
  await expect(page.locator('.smm-node')).toHaveCount(43)
  // Upstream's asynchronous image store replaces the URL with an imgMap key.
  // Establish the baseline after that native normalization, before any switch.
  await expect.poll(() => page.evaluate(() => !!document.querySelector('.editContainer').__vue__.mindMap.getData().data.imgMap)).toBe(true)
  const original = await page.evaluate(() => document.querySelector('.editContainer').__vue__.mindMap.getData())
  for (const theme of themes) {
    await page.evaluate(slug => document.querySelector('.editContainer').__vue__.mindMap.setTheme(`mappop-${slug}`), theme.slug)
    await expect(page.locator(`[data-mappop-font][data-theme="mappop-${theme.slug}"]`)).toHaveCount(1)
    await mapReady(page)
    expect(await page.evaluate(() => document.querySelector('.editContainer').__vue__.mindMap.getData())).toEqual(original)
    const custom = page.locator('.smm-node').filter({ hasText: '观察 · Observe' }).first()
    await expect(custom.locator('[data-mappop-decoration]')).toHaveCount(0)
    await expect(page.locator('.smm-node image')).toHaveCount(1)
    await expect(page.locator('[data-mappop-defs]')).toHaveCount(1)
    await expect(page.locator('[data-mappop-font]')).toHaveCount(1)
  }
  await page.evaluate(slugs => { const map = document.querySelector('.editContainer').__vue__.mindMap; slugs.forEach(slug => map.setTheme(`mappop-${slug}`)) }, themes.map(t => t.slug))
  await expect(page.locator('[data-mappop-font][data-theme="mappop-' + themes[themes.length - 1].slug + '"]')).toHaveCount(1)
  await expect(page.locator('.smm-node')).toHaveCount(43)
  expect(errors).toEqual([])
})

test('500-node map remains editable, collapsible and zoomable through all registered themes', async ({ page }) => {
  test.setTimeout(120000)
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  await page.goto('/')
  await mapReady(page)
  await page.evaluate(() => {
    const root = { data: { text: '500 节点 · Density' }, children: Array.from({ length: 25 }, (_, i) => ({ data: { text: `主题 ${i}` }, children: Array.from({ length: i === 24 ? 18 : 19 }, (_, j) => ({ data: { text: `中文长句与 English ${i}.${j}：保留每一个想法` } })) })) }
    document.querySelector('.editContainer').__vue__.mindMap.setData(root)
  })
  await expect(page.locator('.smm-node')).toHaveCount(500)
  for (const theme of themes) {
    await page.evaluate(slug => document.querySelector('.editContainer').__vue__.mindMap.setTheme(`mappop-${slug}`), theme.slug)
    await expect(page.locator(`[data-mappop-font][data-theme="mappop-${theme.slug}"]`)).toHaveCount(1)
    await mapReady(page)
    await expect(page.locator('.smm-node')).toHaveCount(500)
    // Decoration cost is bounded: a filter per title-tier node, not per leaf.
    expect(await page.locator('[data-mappop-filter]').count()).toBeLessThanOrEqual(26)
  }
  await page.evaluate(() => {
    const map = document.querySelector('.editContainer').__vue__.mindMap
    map.view.setScale(0.8)
    map.execCommand('SET_NODE_TEXT', map.renderer.root.children[0], '可编辑 · Edited')
  })
  await expect(page.locator('.smm-node').filter({ hasText: '可编辑 · Edited' })).toHaveCount(1)
  await page.evaluate(() => { const map = document.querySelector('.editContainer').__vue__.mindMap; map.execCommand('SET_NODE_EXPAND', map.renderer.root.children[0], false) })
  await expect(page.locator('.smm-node')).toHaveCount(481)
  await page.evaluate(() => { const map = document.querySelector('.editContainer').__vue__.mindMap; map.execCommand('SET_NODE_EXPAND', map.renderer.root.children[0], true) })
  await expect(page.locator('.smm-node')).toHaveCount(500)
  expect(errors).toEqual([])
})

test('all Chinese display faces render local glyphs and long multiline labels without clipping', async ({ page }) => {
  test.setTimeout(120000)
  await page.goto('/')
  await mapReady(page)
  const root = JSON.parse(JSON.stringify(artMap))
  root.data.text = '<p>灵感生长 ABC 中文标点。</p><p>让每一个复杂的想法都有可以展开的空间：记录观察、连接知识，在日常生活中找到值得继续探索的问题。</p><p>繁體中文（計畫與觀察）· 罕见字龘 · 123 · 🚀</p>'
  root.data.richText = true
  await page.evaluate(root => document.querySelector('.editContainer').__vue__.mindMap.setData(root), root)
  await expect(page.locator('.smm-node')).toHaveCount(43)
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('DOM.enable')
  await cdp.send('CSS.enable')
  for (const theme of themes) {
    await page.evaluate(slug => document.querySelector('.editContainer').__vue__.mindMap.setTheme(`mappop-${slug}`), theme.slug)
    await expect(page.locator(`[data-mappop-font][data-theme="mappop-${theme.slug}"]`)).toHaveCount(1)
    await mapReady(page)
    const { root: document } = await cdp.send('DOM.getDocument')
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: document.nodeId, selector: '.smm-node foreignObject p' })
    const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId })
    expect(fonts.length).toBeGreaterThan(0)
    expect(fonts.every(font => font.isCustomFont)).toBe(true)
    const bounds = await page.locator('.smm-node foreignObject').first().evaluate(el => {
      const text = el.firstElementChild.getBoundingClientRect()
      const box = el.getBoundingClientRect()
      return { fits: text.height <= box.height + 1 && text.width <= box.width + 1, height: el.height.baseVal.value }
    })
    expect(bounds.fits).toBe(true)
    expect(bounds.height).toBeGreaterThan(theme.rootSize * 2)
  }
})

test('standalone exports retain every label including serif ellipses without changing live geometry', async ({ page, context }) => {
  test.setTimeout(120000)
  await page.goto('/')
  await mapReady(page)
  await page.evaluate(root => document.querySelector('.editContainer').__vue__.mindMap.setFullData({ root, layout: 'mindMap' }), artMap)
  await expect(page.locator('.smm-node')).toHaveCount(43)
  const exported = await context.newPage()
  for (const theme of themes) {
    await page.evaluate(slug => document.querySelector('.editContainer').__vue__.mindMap.setTheme(`mappop-${slug}`), theme.slug)
    await expect(page.locator(`[data-mappop-font][data-theme="mappop-${theme.slug}"]`)).toHaveCount(1)
    await mapReady(page)
    const { xml, unchanged } = await page.evaluate(async () => {
      const map = document.querySelector('.editContainer').__vue__.mindMap
      const widths = () => [...document.querySelectorAll('.smm-node foreignObject')].map(el => el.getAttribute('width')).join(',')
      const before = widths()
      const url = await map.export('svg', false, 'Standalone glyph check')
      return { xml: await fetch(url).then(r => r.text()), unchanged: widths() === before }
    })
    expect(unchanged).toBe(true)
    await exported.setContent(xml)
    await exported.evaluate(() => document.fonts.ready)
    await expect(exported.locator('.smm-node')).toHaveCount(43)
    const clipped = await exported.locator('foreignObject').evaluateAll(els => els.flatMap(el => {
      const text = el.querySelector('.smm-richtext-node-wrap')
      if (!text) return []
      const rect = text.getBoundingClientRect(), box = el.getBoundingClientRect()
      return rect.height > box.height + 1 || rect.width > box.width + 1 ? [text.textContent] : []
    }))
    expect(clipped, theme.slug).toEqual([])
  }
  await exported.close()
})
