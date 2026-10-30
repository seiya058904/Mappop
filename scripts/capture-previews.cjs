// Preview thumbnails are photographs of the actual SVG editor, never mockups.
const { chromium } = require('@playwright/test')
const fs = require('node:fs/promises')
const path = require('node:path')
const { definitions: themes } = require('./art-registry.cjs')
const { raw, docs, url } = require('./art-options.cjs')
;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 960, height: 560 }, reducedMotion: 'reduce' })
  const output = path.join(raw, 'previews')
  await fs.mkdir(output, { recursive: true })
  await fs.mkdir(docs, { recursive: true })
  await page.addInitScript(() => localStorage.setItem('SIMPLE_MIND_MAP_LANG', 'zh'))
  await page.goto(url)
  await page.waitForSelector('[data-mappop-font]', { state: 'attached' })
  const root = { data: { text: '灵感花园 · Ideas' }, children: [
    { data: { text: '观察 · Observe' }, children: [{ data: { text: '发现日常的美' } }, { data: { text: 'Collect moments' } }] },
    { data: { text: '创造 · Create' }, children: [{ data: { text: '让想法生长' } }, { data: { text: 'Try something new' } }] }
  ] }
  await page.evaluate(root => document.querySelector('.editContainer').__vue__.mindMap.setFullData({ root, layout: 'logicalStructure' }), root)
  await page.waitForTimeout(300)
  const index = process.argv.indexOf('--theme')
  const selected = index < 0 ? themes : themes.filter(theme => theme.slug === process.argv[index + 1])
  if (!selected.length) throw new Error('Unknown preview theme')
  for (const theme of selected) {
    await page.evaluate(value => document.querySelector('.editContainer').__vue__.mindMap.setTheme(value), `mappop-${theme.slug}`)
    await page.waitForFunction(slug => document.querySelector(`[data-mappop-font][data-theme="mappop-${slug}"]`) && !document.querySelector('.editContainer').__vue__.mindMap.renderer.isRendering && document.querySelectorAll('.smm-node').length === 7, theme.slug)
    await page.evaluate(() => document.querySelector('.editContainer').__vue__.mindMap.view.fit())
    await page.mouse.move(0, 0)
    await page.waitForTimeout(150)
    const clip = await page.evaluate(() => {
      const boxes = [...document.querySelectorAll('.smm-node')].map(node => node.getBoundingClientRect())
      const left = Math.max(0, Math.min(...boxes.map(b => b.left)) - 24)
      const top = Math.max(110, Math.min(...boxes.map(b => b.top)) - 24)
      const right = Math.min(innerWidth - 60, Math.max(...boxes.map(b => b.right)) + 24)
      const bottom = Math.min(innerHeight - 50, Math.max(...boxes.map(b => b.bottom)) + 24)
      return { x: left, y: top, width: right - left, height: bottom - top }
    })
    await page.screenshot({ path: path.join(output, `${theme.slug}.png`), clip })
  }
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.waitForTimeout(350)
  await page.evaluate(() => { const map = document.querySelector('.editContainer').__vue__.mindMap; map.setTheme('mappop-anime-pop') })
  await page.waitForSelector('[data-theme="mappop-anime-pop"]', { state: 'attached' })
  await page.evaluate(() => document.querySelector('.editContainer').__vue__.mindMap.view.fit())
  await page.locator('.sidebarTriggerContainer .triggerItem').filter({ hasText: /^主题$/ }).click()
  await page.waitForTimeout(350)
  await page.screenshot({ path: path.join(docs, 'theme-selector.png') })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.waitForTimeout(350)
  await page.screenshot({ path: path.join(docs, 'theme-selector-mobile.png') })
  await browser.close()
})().catch(error => { console.error(error); process.exit(1) })
