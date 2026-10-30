// Bounded follow-up for a measured regression signal, not a replacement baseline.
const { chromium } = require('@playwright/test')
const fs = require('node:fs/promises')
const path = require('node:path')
const { stressMap } = require('../tests/fixtures/art-map.cjs')
const { raw, url } = require('./art-options.cjs')
const index = process.argv.indexOf('--baseline-url')
if (index < 0) throw new Error('Pass the read-only baseline URL explicitly')
;(async () => {
  const result = { method: '121 nodes; one warmup, five interleaved samples per target; same Atlas predecessor; two stable frames; render-end counts; no capture or download in timings.', targets: {} }
  const entries = [['baseline', process.argv[index + 1]], ['candidate', url]]
  const opened = []
  for (const [name, address] of entries) {
    const options = { headless: true }
    const proxy = process.env.MAPPOP_BROWSER_PROXY || process.env.HTTPS_PROXY
    if (proxy && !/localhost|127\.0\.0\.1/.test(address)) {
      const p = new URL(proxy)
      options.proxy = { server: `${p.protocol}//${p.host}` }
      if (p.username) options.proxy.username = decodeURIComponent(p.username)
      if (p.password) options.proxy.password = decodeURIComponent(p.password)
    }
    const browser = await chromium.launch(options)
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    const errors = []
    page.on('pageerror', e => errors.push(e.message))
    await page.route('**/*', route => ['GET', 'HEAD'].includes(route.request().method()) ? route.continue() : route.abort())
    await page.goto(address, { timeout: 60000 })
    await page.waitForSelector('[data-mappop-font]', { state: 'attached' })
    const build = await page.evaluate(() => fetch('/build-info.json').then(r => r.json()))
    await page.evaluate(async root => {
      const map = document.querySelector('.editContainer').__vue__.mindMap
      while (map.renderer.isRendering) await new Promise(requestAnimationFrame)
      map.setFullData({ root, layout: 'mindMap' })
    }, stressMap)
    await page.waitForFunction(() => document.querySelectorAll('.smm-node').length === 121 && !document.querySelector('.editContainer').__vue__.mindMap.renderer.isRendering)
    result.targets[name] = { url: address, build, errors, samples: [] }
    opened.push({ name, browser, page })
  }
  for (let round = 0; round < 6; round++) {
    for (const { name, page } of opened) {
      const sample = await page.evaluate(async () => {
        const map = document.querySelector('.editContainer').__vue__.mindMap
        const switchTo = async slug => {
          let renders = 0
          const times = []
          const start = performance.now()
          const ended = () => { renders++; times.push(performance.now() - start) }
          map.on('node_tree_render_end', ended)
          map.setTheme(`mappop-${slug}`)
          let stable = 0
          while (stable < 2) {
            await new Promise(requestAnimationFrame)
            stable = document.querySelector(`[data-mappop-font][data-theme="mappop-${slug}"]`) && !map.renderer.isRendering && document.querySelectorAll('.smm-node').length === 121 ? stable + 1 : 0
          }
          map.off('node_tree_render_end', ended)
          return { ms: performance.now() - start, renders, renderEndsMs: times }
        }
        await switchTo('celestial-atlas')
        return switchTo('pixel-arcade')
      })
      if (round) result.targets[name].samples.push(sample)
    }
  }
  await fs.writeFile(path.join(raw, 'switch-investigation.json'), JSON.stringify(result, null, 2) + '\n')
  for (const { browser } of opened) await browser.close()
  console.log(JSON.stringify(result, null, 2))
})().catch(error => { console.error(error); process.exit(1) })
