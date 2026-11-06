import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const entries = [
  { directory: 'web', script: 'scripts/ai.js', command: 'ai:serve', message: /legacy AI proxy is retired/ },
  { directory: 'simple-mind-map', script: 'bin/wsServer.mjs', command: 'wsServe', message: /legacy collaboration signaling server is retired/ }
]

for (const entry of entries) {
  const url = new URL(`../${entry.directory}/${entry.script}`, import.meta.url)

  test(`${entry.command} stays inert without modules, network APIs or timers`, () => {
    const messages = []
    const processStub = { exitCode: 0 }
    // Static imports fail to parse here, require/fetch/timers are unavailable,
    // and dynamic imports have no loader. A disabled entry needs none of them.
    vm.runInNewContext(readFileSync(url, 'utf8'), {
      process: processStub,
      console: { error: message => messages.push(message) }
    }, { timeout: 1000, filename: fileURLToPath(url) })
    assert.equal(processStub.exitCode, 1)
    assert.equal(messages.length, 1)
    assert.match(messages[0], entry.message)
    assert.match(messages[0], /will not start/)
  })

  test(`${entry.command} and direct execution retain the same disabled entry`, () => {
    const pkg = JSON.parse(readFileSync(new URL(`../${entry.directory}/package.json`, import.meta.url), 'utf8'))
    assert.equal(pkg.scripts[entry.command], `node ./${entry.script}`)
    const result = spawnSync(process.execPath, [fileURLToPath(url)], {
      encoding: 'utf8', timeout: 5000, windowsHide: true,
      env: { ...process.env, NODE_OPTIONS: '', PORT: '0' }
    })
    assert.equal(result.error, undefined)
    assert.equal(result.status, 1)
    assert.equal(result.signal, null)
    assert.equal(result.stdout, '')
    assert.match(result.stderr, entry.message)
  })
}
