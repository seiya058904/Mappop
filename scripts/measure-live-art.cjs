// Read-only production measurement: edits exist only in a fresh browser context.
const { chromium } = require('@playwright/test')
const fs = require('node:fs/promises')
const { stressMap } = require('../tests/fixtures/art-map.cjs')
const path = require('node:path')
const { raw, stage, url } = require('./art-options.cjs')
const { slugs: registry } = require('./art-registry.cjs')
;(async () => {
  const slugs = stage === 'before' ? JSON.parse(await fs.readFile(path.join(raw, 'before/metrics.json'), 'utf8')).slugs : registry
  const proxyUrl = process.env.MAPPOP_BROWSER_PROXY || process.env.HTTPS_PROXY
  const options = { headless: true }
  if (proxyUrl && !/127\.0\.0\.1|localhost/.test(url)) {
    const url = new URL(proxyUrl)
    options.proxy = { server: `${url.protocol}//${url.host}` }
    if (url.username) { options.proxy.username = decodeURIComponent(url.username); options.proxy.password = decodeURIComponent(url.password) }
  }
  const browser = await chromium.launch(options)
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  await page.goto(url, { timeout: 60000 })
  await page.waitForSelector('[data-mappop-font]', { state: 'attached', timeout: 60000 })
  await page.waitForFunction(() => !document.querySelector('.editContainer').__vue__.mindMap.renderer.isRendering)
  await page.evaluate(root => document.querySelector('.editContainer').__vue__.mindMap.setFullData({ root, layout: 'mindMap' }), stressMap)
  await page.waitForFunction(() => document.querySelectorAll('.smm-node').length === 121)
  const result = { url: page.url(), versionStage: stage, warmSwitchMs: {}, errors }
  for (let round = 0; round < 4; round++) {
    for (const slug of slugs) {
      const elapsed = await page.evaluate(async slug => {
        const map = document.querySelector('.editContainer').__vue__.mindMap
        const start = performance.now()
        map.setTheme(`mappop-${slug}`)
        await new Promise(resolve => {
          let stable = 0
          const check = () => {
            const ready = document.querySelector(`[data-mappop-font][data-theme="mappop-${slug}"]`) && !map.renderer.isRendering && document.querySelectorAll('.smm-node').length === 121
            stable = ready ? stable + 1 : 0
            if (stable >= 2) resolve()
            else requestAnimationFrame(check)
          }
          requestAnimationFrame(check)
        })
        return performance.now() - start
      }, slug)
      if (round) (result.warmSwitchMs[slug] ||= []).push(elapsed)
    }
  }
  const output = path.join(raw, stage, 'switch-performance.json')
  result.method = 'Three rounds after one warmup; setTheme to two stable animation frames, no capture/download or fixed sleep.'
  await fs.writeFile(output, JSON.stringify(result, null, 2) + '\n')
  console.log(`${slugs.length} themes measured: ${output}`)
  await browser.close()
  if (errors.length) process.exitCode = 1
})().catch(error => { console.error(error); process.exit(1) })
