// Read-only production measurement: edits exist only in a fresh browser context.
const { chromium } = require('@playwright/test')
const fs = require('node:fs/promises')
const { stressMap } = require('../tests/fixtures/art-map.cjs')
const slugs = ['pixel-arcade', 'anime-pop', 'toon-motion', 'zen-japan', 'ink-wash', 'sketchbook', 'marker-notes', 'cyber-neon']
;(async () => {
  const proxyUrl = process.env.MAPPOP_BROWSER_PROXY || process.env.HTTPS_PROXY
  const options = { headless: true }
  if (proxyUrl) {
    const url = new URL(proxyUrl)
    options.proxy = { server: `${url.protocol}//${url.host}` }
    if (url.username) { options.proxy.username = decodeURIComponent(url.username); options.proxy.password = decodeURIComponent(url.password) }
  }
  const browser = await chromium.launch(options)
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  await page.goto('https://mappop.seiya-api.workers.dev/', { timeout: 60000 })
  await page.waitForSelector('[data-mappop-font]', { state: 'attached', timeout: 60000 })
  await page.waitForFunction(() => !document.querySelector('.editContainer').__vue__.mindMap.renderer.isRendering)
  await page.evaluate(root => document.querySelector('.editContainer').__vue__.mindMap.setFullData({ root, layout: 'mindMap' }), stressMap)
  await page.waitForFunction(() => document.querySelectorAll('.smm-node').length === 121)
  const result = { url: page.url(), versionStage: process.argv[2], warmSwitchMs: {}, errors }
  for (let round = 0; round < 4; round++) {
    for (const slug of slugs) {
      const start = Date.now()
      await page.evaluate(slug => document.querySelector('.editContainer').__vue__.mindMap.setTheme(`mappop-${slug}`), slug)
      await page.waitForFunction(slug => document.querySelector(`[data-mappop-font][data-theme="mappop-${slug}"]`) && !document.querySelector('.editContainer').__vue__.mindMap.renderer.isRendering && document.querySelectorAll('.smm-node').length === 121, slug)
      if (round) (result.warmSwitchMs[slug] ||= []).push(Date.now() - start)
    }
  }
  const output = process.argv[2] === 'before' ? 'docs/assets/v1.1/before/live-performance.json' : '.output/release/live-performance-after.json'
  await fs.mkdir('.output/release', { recursive: true })
  await fs.writeFile(output, JSON.stringify(result, null, 2) + '\n')
  console.log(JSON.stringify(result))
  await browser.close()
  if (errors.length) process.exitCode = 1
})().catch(error => { console.error(error); process.exit(1) })
