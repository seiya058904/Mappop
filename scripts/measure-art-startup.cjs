// Fresh-context first screen, separate from the full visual capture workload.
const { chromium } = require('@playwright/test')
const fs = require('node:fs/promises')
const path = require('node:path')
const { sourceHashes } = require('./source-hashes.cjs')
const { raw, docs, url } = require('./art-options.cjs')
;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, reducedMotion: 'reduce' })
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  const start = Date.now()
  await page.goto(url)
  await page.waitForFunction(() => document.querySelector('[data-mappop-font]') && document.querySelectorAll('.smm-node').length === 10)
  await page.evaluate(() => document.querySelector('.editContainer').__vue__.mindMap.waitForArtTheme())
  await page.waitForTimeout(120)
  const pickerHashes = sourceHashes(await fs.readFile('web/src/pages/Edit/components/Theme.vue'))
  const result = {
    method: 'Fresh Chromium context, default ten-node map, current-theme font barrier plus 120ms capture settling. Encoded response bodies exclude headers; not pure CPU timing.',
    initialMs: Date.now() - start,
    themePickerSourceSha256: pickerHashes.rawSha256,
    themePickerSourceLfSha256: pickerHashes.lfSha256,
    resources: await page.evaluate(() => performance.getEntriesByType('resource').filter(r => /^https?:/.test(r.name)).map(r => ({ name: new URL(r.name).pathname, bytes: r.encodedBodySize }))),
    errors
  }
  result.totalBytes = result.resources.reduce((sum, r) => sum + r.bytes, 0)
  result.previewRequests = result.resources.filter(r => r.name.includes('/mappop/previews/')).length
  await fs.writeFile(path.join(raw, 'after/first-screen-final.json'), JSON.stringify(result, null, 2) + '\n')
  await fs.writeFile(path.join(docs, 'after/first-screen-final.json'), JSON.stringify(result, null, 2) + '\n')
  await browser.close()
  console.log(JSON.stringify({ initialMs: result.initialMs, totalBytes: result.totalBytes, previewRequests: result.previewRequests, errors }))
  if (errors.length || result.previewRequests) process.exitCode = 1
})().catch(error => { console.error(error); process.exit(1) })
