// Open the exported standalone SVGs in Chromium's image renderer, not the editor.
const { chromium } = require('@playwright/test')
const fs = require('node:fs/promises')
const path = require('node:path')
;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1200, height: 720 } })
  const dir = '.output/art-exports/after'
  await fs.mkdir('.output/export-review', { recursive: true })
  if (process.argv.includes('--refresh')) {
    const { artMap } = require('../tests/fixtures/art-map.cjs')
    const editor = await browser.newPage()
    await editor.goto('http://127.0.0.1:8787')
    await editor.waitForSelector('[data-mappop-font]', { state: 'attached' })
    await editor.evaluate(root => document.querySelector('.editContainer').__vue__.mindMap.setFullData({ root, layout: 'mindMap' }), artMap)
    await editor.waitForFunction(() => document.querySelectorAll('.smm-node').length === 43)
    const metrics = JSON.parse(await fs.readFile('docs/assets/v1.1/after/metrics.json', 'utf8'))
    for (const slug of Object.keys(metrics.themes)) {
      await editor.evaluate(slug => document.querySelector('.editContainer').__vue__.mindMap.setTheme(`mappop-${slug}`), slug)
      await editor.waitForFunction(slug => document.querySelector(`[data-mappop-font][data-theme="mappop-${slug}"]`) && !document.querySelector('.editContainer').__vue__.mindMap.renderer.isRendering, slug)
      for (const type of ['svg', 'png', ...(['toon-motion', 'vintage-editorial'].includes(slug) ? ['pdf'] : [])]) {
        const data = await editor.evaluate(type => document.querySelector('.editContainer').__vue__.mindMap.export(type, false, 'Art collection'), type)
        const bytes = Buffer.from(data.split(',')[1], 'base64')
        await fs.writeFile(path.join(dir, `${slug}.${type}`), bytes)
        metrics.themes[slug][`${type}Bytes`] = bytes.length
      }
    }
    await fs.writeFile('docs/assets/v1.1/after/metrics.json', JSON.stringify(metrics, null, 2) + '\n')
    await editor.close()
  }
  for (const file of (await fs.readdir(dir)).filter(f => f.endsWith('.svg'))) {
    const bytes = await fs.readFile(path.join(dir, file))
    await page.setContent(`<html><body style="margin:0;background:#eeeae2;display:grid;place-items:center;width:1200px;height:720px"><img style="max-width:1200px;max-height:720px" src="data:image/svg+xml;base64,${bytes.toString('base64')}"></body></html>`)
    await page.waitForFunction(() => document.querySelector('img').complete && document.querySelector('img').naturalWidth > 0)
    await page.screenshot({ path: `.output/export-review/${file.replace('.svg', '.png')}` })
  }
  await browser.close()
})().catch(error => { console.error(error); process.exit(1) })
