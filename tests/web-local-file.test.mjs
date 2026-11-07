// Checks preference recovery against the real API module.
// File persistence regressions live in web-document-session.test.mjs.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'

const root = new URL('../web/src/', import.meta.url)

function loadModule(source, globals, setup = () => {}) {
  const code = source
    // Imports become inert stubs unless the test supplies a global of that name.
    .replace(/^import\s+(\w+)\s+from\s+['"][^'"]+['"]\s*$/gm, (_, n) => n in globals ? '' : `var ${n} = {}`)
    .replace(/^import\s+\{([^}]*)\}\s+from\s+['"][^'"]+['"]\s*$/gm, (_, names) =>
      names.split(',').map(n => n.trim()).filter(n => n && !(n in globals)).map(n => `var ${n} = () => ({})`).join('\n'))
    .replace(/^export const (\w+)/gm, 'exports.$1')
    .replace(/^export default/m, 'exports.default =')
  const context = vm.createContext({ exports: {}, console: { log() {} }, ...globals })
  setup(context)
  vm.runInContext(code, context)
  return context.exports
}

function loadApi(storage) {
  const source = fs.readFileSync(new URL('api/index.js', root), 'utf8')
  return loadModule(source, { window: {} }, ctx => Object.defineProperty(ctx, 'localStorage', { get: storage }))
}

test('getLang falls back to en when storage is blocked or full', () => {
  const blocked = loadApi(() => { throw new Error('SecurityError') })
  assert.equal(blocked.getLang(), 'en')
  const full = loadApi(() => ({ getItem: () => null, setItem() { throw new Error('QuotaExceededError') } }))
  assert.equal(full.getLang(), 'en')
  const saved = loadApi(() => ({ getItem: () => 'zh', setItem() {} }))
  assert.equal(saved.getLang(), 'zh')
})
