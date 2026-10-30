// Real Chromium/editor captures. Run before edits with --baseline; rerun after build.
const { chromium } = require('@playwright/test')
const fs = require('node:fs/promises')
const path = require('node:path')
const assert = require('node:assert/strict')
const { artMap, stressMap } = require('../tests/fixtures/art-map.cjs')
const baseline = process.argv.includes('--baseline')
const exportImages = process.argv.includes('--exports')
const slugs = ['pixel-arcade', 'anime-pop', 'toon-motion', 'zen-japan', 'ink-wash', 'sketchbook', 'marker-notes', 'cyber-neon', ...(!baseline && !process.argv.includes('--only-original') ? ['watercolor-garden', 'paper-cut', 'ukiyo-e-print', 'blueprint-lab', 'bauhaus-geometry', 'glass-aurora', 'vintage-editorial', 'celestial-atlas'] : [])]
const folder = path.resolve(`docs/assets/v1.1/${baseline ? 'before' : 'after'}`)
async function settled(page, slug, count) {
  await page.waitForFunction(({ slug, count }) => {
    const map = document.querySelector('.editContainer')?.__vue__?.mindMap
    return map && !map.renderer.isRendering && document.querySelector(`[data-mappop-font][data-theme="mappop-${slug}"]`) && document.querySelectorAll('.smm-node').length === count
  }, { slug, count }).catch(async error => {
    console.error(await page.evaluate(() => ({ count: document.querySelectorAll('.smm-node').length, theme: document.querySelector('.editContainer')?.__vue__?.mindMap.getTheme(), rendering: document.querySelector('.editContainer')?.__vue__?.mindMap.renderer.isRendering, fonts: [...document.querySelectorAll('[data-mappop-font]')].map(el => el.getAttribute('data-theme')) })))
    throw error
  })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(120)
}
async function fit(page) {
  await page.evaluate(() => document.querySelector('.editContainer').__vue__.mindMap.view.fit())
  await page.mouse.move(1, 1)
  await page.waitForTimeout(150)
}
;(async () => {
  await fs.mkdir(folder, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, reducedMotion: 'reduce' })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  const start = Date.now()
  await page.goto(process.env.MAPPOP_TEST_URL || 'http://127.0.0.1:8787')
  await settled(page, 'anime-pop', 10)
  const metrics = { captured: new Date().toISOString(), initialMs: Date.now() - start, resources: await page.evaluate(() => performance.getEntriesByType('resource').map(r => ({ name: new URL(r.name).pathname, bytes: r.encodedBodySize }))), themes: {} }
  await page.evaluate(root => document.querySelector('.editContainer').__vue__.mindMap.setFullData({ root, layout: 'mindMap', theme: { template: 'mappop-anime-pop', config: {} } }), artMap)
  for (const slug of slugs) {
    const before = Date.now()
    await page.evaluate(slug => document.querySelector('.editContainer').__vue__.mindMap.setTheme(`mappop-${slug}`), slug)
    await settled(page, slug, 43)
    metrics.themes[slug] = { coldSwitchMs: Date.now() - before }
    await fit(page)
    await page.screenshot({ path: path.join(folder, `${slug}.png`) })
    // A close reading view is evidence for typography; the fit view shows density.
    await page.evaluate(() => document.querySelector('.editContainer').__vue__.mindMap.view.setScale(0.8))
    await page.screenshot({ path: path.join(folder, `${slug}-detail.png`) })
    if (exportImages) {
      for (const type of ['svg', 'png', ...(slug === 'vintage-editorial' || slug === 'toon-motion' ? ['pdf'] : [])]) {
        const data = await page.evaluate(type => document.querySelector('.editContainer').__vue__.mindMap.export(type, false, 'Art collection'), type)
        const bytes = data.includes(';base64,') ? Buffer.from(data.split(',')[1], 'base64') : Buffer.from(decodeURIComponent(data.slice(data.indexOf(',') + 1)))
        const exportFolder = path.resolve(`.output/art-exports/${baseline ? 'before' : 'after'}`)
        await fs.mkdir(exportFolder, { recursive: true })
        await fs.writeFile(path.join(exportFolder, `${slug}.${type}`), bytes)
        metrics.themes[slug][`${type}Bytes`] = bytes.length
        if (type === 'svg') {
          assert.equal((bytes.toString().match(/class="smm-node"/g) || []).length, 43)
          assert(bytes.toString().includes('灵感生长'))
        }
      }
    }
    await page.setViewportSize({ width: 390, height: 844 })
    await fit(page)
    await page.screenshot({ path: path.join(folder, `${slug}-mobile.png`) })
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    if (!baseline) {
      await page.evaluate(() => document.querySelector('.editContainer').__vue__.mindMap.view.setScale(0.8))
      await page.screenshot({ path: path.join(folder, `${slug}-mobile-reading.png`) })
    }
    await page.setViewportSize({ width: 1600, height: 1100 })
    await page.waitForTimeout(450)
    await page.evaluate(root => document.querySelector('.editContainer').__vue__.mindMap.setFullData({ root }), stressMap)
    await settled(page, slug, 121)
    await fit(page)
    await page.screenshot({ path: path.join(folder, `${slug}-121.png`) })
    if (!baseline) {
      await page.evaluate(() => document.querySelector('.editContainer').__vue__.mindMap.view.setScale(0.8))
      await page.screenshot({ path: path.join(folder, `${slug}-121-detail.png`) })
    }
    const times = []
    for (let i = 0; i < 3; i++) {
      const time = Date.now()
      await page.evaluate(() => document.querySelector('.editContainer').__vue__.mindMap.reRender())
      await settled(page, slug, 121)
      times.push(Date.now() - time)
    }
    metrics.themes[slug].render121Ms = times
    await page.setViewportSize({ width: 390, height: 844 })
    await fit(page)
    await page.screenshot({ path: path.join(folder, `${slug}-121-mobile.png`) })
    await page.setViewportSize({ width: 1600, height: 1100 })
    await page.waitForTimeout(450)
    await page.evaluate(root => document.querySelector('.editContainer').__vue__.mindMap.setFullData({ root }), artMap)
    await settled(page, slug, 43)
    console.log(`Captured ${slug}`)
  }
  metrics.errors = errors
  await fs.writeFile(path.join(folder, 'metrics.json'), JSON.stringify(metrics, null, 2) + '\n')
  await browser.close()
  assert.deepEqual(errors, [])
})().catch(error => { console.error(error); process.exit(1) })
