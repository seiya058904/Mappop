// Preview thumbnails are photographs of the actual SVG editor, never mockups.
const { chromium } = require('@playwright/test')
const fs = require('node:fs/promises')
const path = require('node:path')
const vm = require('node:vm')
;(async () => {
  const source = await fs.readFile('web/src/mappop/theme-tokens.js', 'utf8')
  const themes = vm.runInNewContext(source.replace('export const definitions =', 'globalThis.definitions ='))
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 960, height: 560 }, reducedMotion: 'reduce' })
  const output = path.resolve('.output/theme-previews')
  await fs.mkdir(output, { recursive: true })
  await page.goto('http://127.0.0.1:8787')
  await page.waitForSelector('[data-mappop-font]', { state: 'attached' })
  const root = { data: { text: '灵感花园 · Ideas' }, children: [
    { data: { text: '观察 · Observe' }, children: [{ data: { text: '发现日常的美' } }, { data: { text: 'Collect moments' } }] },
    { data: { text: '创造 · Create' }, children: [{ data: { text: '让想法生长' } }, { data: { text: 'Try something new' } }] }
  ] }
  await page.evaluate(root => document.querySelector('.editContainer').__vue__.mindMap.setFullData({ root, layout: 'logicalStructure' }), root)
  await page.waitForTimeout(300)
  for (const theme of themes) {
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
  await page.locator('.sidebarTriggerContainer .triggerItem').filter({ hasText: /^Themes$/ }).click()
  await page.waitForTimeout(350)
  await page.screenshot({ path: 'docs/assets/v1.1/theme-selector.png' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.waitForTimeout(350)
  await page.screenshot({ path: 'docs/assets/v1.1/theme-selector-mobile.png' })
  await browser.close()
})().catch(error => { console.error(error); process.exit(1) })
