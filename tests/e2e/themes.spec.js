const { test, expect } = require('@playwright/test')
const fs = require('node:fs/promises')
const path = require('node:path')

test.use({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })

const themes = [
  ['pixel-arcade', 'Pixel Arcade'], ['anime-pop', 'Anime Pop'],
  ['toon-motion', 'Toon Motion'], ['zen-japan', 'Zen Japan'],
  ['ink-wash', 'Ink Wash'], ['sketchbook', 'Sketchbook'],
  ['marker-notes', 'Marker Notes'], ['cyber-neon', 'Cyber Neon'],
  ['watercolor-garden', 'Watercolor Garden'], ['paper-cut', 'Paper Cut'],
  ['ukiyo-e-print', 'Ukiyo-e Print'], ['blueprint-lab', 'Blueprint Lab'],
  ['bauhaus-geometry', 'Bauhaus Geometry'], ['glass-aurora', 'Glass Aurora'],
  ['vintage-editorial', 'Vintage Editorial'], ['celestial-atlas', 'Celestial Atlas']
]

async function ready(page, slug = 'anime-pop') {
  await expect(page.locator('#mindMapContainer')).toHaveAttribute('data-mappop-art', slug)
  await expect(page.locator(`[data-mappop-font][data-theme="mappop-${slug}"]`)).toHaveCount(1)
  await expect(page.locator('.smm-node')).toHaveCount(10)
  await page.evaluate(() => document.fonts.ready)
  expect(await page.evaluate(() => Array.from(document.fonts).some(font => font.family.replace(/^["']|["']$/g, '') === 'Noto Sans SC' && font.status === 'loaded'))).toBe(true)
}

async function openThemes(page) {
  await page.locator('.sidebarTriggerContainer .triggerItem').filter({ hasText: /^Themes$/ }).click()
  await expect(page.getByRole('button', { name: 'Pixel Arcade', exact: true })).toBeVisible()
}

async function closeThemes(page) {
  await page.locator('.sidebarContainer.show').filter({ has: page.locator('.themeGroupList') }).locator('.closeBtn').click()
}

async function documentContent(page) {
  return page.evaluate(() => {
    const map = document.querySelector('.editContainer').__vue__.mindMap
    const result = map.getData(true)
    const clean = node => {
      const data = { ...node.data }
      delete data.isActive
      return { data, children: (node.children || []).map(clean) }
    }
    return { root: clean(result.root), layout: result.layout }
  })
}

test('all sixteen art themes switch through UI, preserve the document, export SVG/PNG and persist', async ({ page }, testInfo) => {
  test.setTimeout(180000)
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  await ready(page)
  const original = await documentContent(page)
  const screenshots = process.env.UPDATE_SCREENSHOTS === '1'
    ? path.resolve('docs/assets/styles')
    : testInfo.outputPath('styles')
  await fs.mkdir(screenshots, { recursive: true })
  const signatures = new Set()
  for (const [slug, name] of themes) {
    await openThemes(page)
    const button = page.getByRole('button', { name, exact: true })
    await button.click()
    await ready(page, slug)
    await expect(button).toHaveAttribute('aria-pressed', 'true')
    expect(await documentContent(page)).toEqual(original)
    const signature = await page.evaluate(() => {
      const map = document.querySelector('.editContainer').__vue__.mindMap
      const { backgroundColor, lineStyle, root } = map.themeConfig
      return JSON.stringify([backgroundColor, lineStyle, root.fontFamily, root.borderRadius])
    })
    signatures.add(signature)
    await closeThemes(page)
    // The editor's public Fit canvas shortcut keeps each different typeface's
    // real node metrics inside the capture, with no content or layout changes.
    await page.locator('#mindMapContainer').click({ position: { x: 40, y: 250 } })
    await page.keyboard.press('Control+i')
    await page.mouse.move(10, 90)
    await page.waitForTimeout(300)
    await page.screenshot({ path: path.join(screenshots, `${slug}.png`), animations: 'disabled' })
    const svgChecks = await page.evaluate(async slug => {
      const map = document.querySelector('.editContainer').__vue__.mindMap
      const data = await map.export('svg', false, 'Mappop art theme')
      const svg = await fetch(data).then(response => response.text())
      return {
        decoration: svg.includes(`data-mappop-decoration="${slug}"`),
        primaryFont: svg.includes('@font-face'),
        chineseFallback: svg.includes('font-family:"Noto Sans SC"'),
        compressedFallback: svg.includes('format("woff2")'),
        shadows: svg.includes('feDropShadow'),
        content: svg.includes('Make room for ideas'),
        remoteFont: svg.includes('https://fonts.'),
        nodes: new DOMParser().parseFromString(svg, 'image/svg+xml').querySelectorAll('.smm-node').length
      }
    }, slug)
    expect(svgChecks).toEqual({
      decoration: true, primaryFont: true, chineseFallback: true,
      compressedFallback: true, shadows: true, content: true,
      remoteFont: false, nodes: 10
    })
    const png = await page.evaluate(() => document.querySelector('.editContainer').__vue__.mindMap.export('png', false, 'Theme export'))
    const bytes = Buffer.from(png.split(',')[1], 'base64')
    expect(bytes.subarray(1, 4).toString()).toBe('PNG')
    expect(bytes.length).toBeGreaterThan(10000)
  }
  expect(signatures.size).toBe(16)
  await page.reload()
  await ready(page, 'celestial-atlas')
  expect(await documentContent(page)).toEqual(original)
  await openThemes(page)
  await page.getByRole('button', { name: 'Anime Pop', exact: true }).click()
  await ready(page, 'anime-pop')
  await page.mouse.move(10, 90)
  await page.screenshot({ path: path.join(screenshots, 'theme-selector.png'), animations: 'disabled' })
  expect(errors).toEqual([])
})

test('keyboard selection, original themes, fixed-image exports and reduced motion remain usable', async ({ page }, testInfo) => {
  test.setTimeout(120000)
  await page.goto('/')
  await ready(page)
  await openThemes(page)
  const toon = page.getByRole('button', { name: 'Toon Motion', exact: true })
  await toon.focus()
  await expect(toon).toBeFocused()
  await page.keyboard.press('Enter')
  await ready(page, 'toon-motion')
  await expect(toon).toHaveAttribute('aria-pressed', 'true')
  await closeThemes(page)
  const duration = await page.locator('[data-mappop-decoration]').first().evaluate(el => getComputedStyle(el).transitionDuration)
  expect(duration).toBe('0s')

  for (const type of ['png', 'pdf']) {
    const base64 = await page.evaluate(async type => {
      const map = document.querySelector('.editContainer').__vue__.mindMap
      return map.export(type, false, 'Mappop export check')
    }, type)
    const bytes = Buffer.from(base64.split(',')[1], 'base64')
    expect(bytes.length).toBeGreaterThan(10000)
    expect(type === 'png' ? bytes.subarray(1, 4).toString() : bytes.subarray(0, 4).toString()).toBe(type === 'png' ? 'PNG' : '%PDF')
    await fs.writeFile(testInfo.outputPath(`toon-motion.${type}`), bytes)
  }

  // Upstream themes are still available alongside the art collection.
  await openThemes(page)
  await page.getByRole('tab', { name: 'Classics', exact: true }).click()
  const originalTheme = page.locator('.themeGroupList .themeItem').first()
  await originalTheme.click()
  await expect(page.locator('#mindMapContainer')).not.toHaveAttribute('data-mappop-art')
  await expect(page.locator('[data-mappop-decoration]')).toHaveCount(0)
  await expect(page.locator('.smm-node')).toHaveCount(10)
})

test('an imported theme font settles without leaving nodes from the previous document', async ({ page }) => {
  await page.goto('/')
  await ready(page)
  // Native SMM import changes data and theme together. This typeface has not
  // been loaded in this context, unlike the preloaded theme-picker UI path.
  await page.evaluate(() => {
    const map = document.querySelector('.editContainer').__vue__.mindMap
    map.setFullData({
      root: {
        data: { text: '计算机网络知识点 · 已编辑中文' },
        children: Array.from({ length: 12 }, (_, branch) => ({
          data: { text: `Branch ${branch + 1}` },
          children: Array.from({ length: 9 }, (_, node) => ({
            data: { text: `Idea ${branch + 1}.${node + 1}` }
          }))
        }))
      },
      layout: 'mindMap',
      theme: { template: 'mappop-zen-japan', config: {} }
    })
  })
  await expect(page.locator('[data-mappop-font][data-theme="mappop-zen-japan"]')).toHaveCount(1)
  await expect.poll(() => page.evaluate(() => document.querySelector('.editContainer').__vue__.mindMap.renderer.isRendering)).toBe(false)
  await expect(page.locator('.smm-node')).toHaveCount(121)
  await expect(page.locator('.smm-node').filter({ hasText: 'Make room for ideas' })).toHaveCount(0)
  const svgNodeCount = await page.evaluate(async () => {
    const map = document.querySelector('.editContainer').__vue__.mindMap
    const data = await map.export('svg', false, 'Imported project')
    const xml = await fetch(data).then(response => response.text())
    return new DOMParser().parseFromString(xml, 'image/svg+xml').querySelectorAll('.smm-node').length
  })
  expect(svgNodeCount).toBe(121)
})
