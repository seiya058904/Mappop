// Render the real standalone files in Chromium, independent of the editor.
const { chromium } = require('@playwright/test')
const fs = require('node:fs/promises')
const path = require('node:path')
const assert = require('node:assert/strict')
const { raw } = require('./art-options.cjs')
const { slugs } = require('./art-registry.cjs')
;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1200, height: 720 } })
  const dir = path.join(raw, 'exports/after')
  const output = path.join(raw, 'export-review')
  await fs.mkdir(output, { recursive: true })
  const files = await fs.readdir(dir)
  assert.deepEqual(files.filter(f => f.endsWith('.svg')).map(f => f.slice(0, -4)).sort(), [...slugs].sort())
  const results = []
  for (const slug of slugs) {
    const svg = await fs.readFile(path.join(dir, `${slug}.svg`), 'utf8')
    assert.equal((svg.match(/class="smm-node"/g) || []).length, 43)
    await page.setContent(svg)
    await page.evaluate(() => document.fonts.ready)
    const clipped = await page.locator('foreignObject').evaluateAll(els => els.flatMap(el => {
      const text = el.querySelector('.smm-richtext-node-wrap')
      if (!text) return []
      const a = text.getBoundingClientRect(), b = el.getBoundingClientRect()
      return a.height > b.height + 1 || a.width > b.width + 1 ? [text.textContent] : []
    }))
    assert.deepEqual(clipped, [], slug)
    for (const type of ['svg', 'png']) {
      const bytes = await fs.readFile(path.join(dir, `${slug}.${type}`))
      await page.setContent(`<html><body style="margin:0;background:#eeeae2;display:grid;place-items:center;width:1200px;height:720px"><img style="max-width:1200px;max-height:720px" src="data:image/${type === 'svg' ? 'svg+xml' : 'png'};base64,${bytes.toString('base64')}"></body></html>`)
      await page.waitForFunction(() => document.querySelector('img').complete && document.querySelector('img').naturalWidth > 0)
      if (type === 'svg') await page.screenshot({ path: path.join(output, `${slug}.png`) })
    }
    results.push({ slug, nodes: 43, clipped, svgAndPngDecoded: true })
  }
  await fs.writeFile(path.join(output, 'review.json'), JSON.stringify(results, null, 2) + '\n')
  console.log(`${results.length} standalone SVG/PNG pairs rendered without text overflow`)
  await browser.close()
})().catch(error => { console.error(error); process.exit(1) })
