// Runs the real Toolbar.vue / api/index.js code in a VM with stubbed imports,
// fake timers and in-memory file handles.
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

function loadToolbar() {
  const vue = fs.readFileSync(new URL('pages/Edit/components/Toolbar.vue', root), 'utf8')
  const script = vue.match(/<script>([\s\S]*?)<\/script>/)[1]
  let now = 0
  let timers = []
  const clock = {
    setTimeout(fn, ms) { const t = { fn, at: now + ms }; timers.push(t); return t },
    clearTimeout(t) { timers = timers.filter(x => x !== t) },
    async tick(ms) {
      now += ms
      for (const t of timers.filter(x => x.at <= now)) { timers = timers.filter(x => x !== t); t.fn() }
      for (let i = 0; i < 10; i++) await Promise.resolve()
    }
  }
  let pendingReaders = []
  class FileReader {
    readAsText(file) { pendingReaders.push(() => { this.result = file.text; this.onload() }) }
  }
  const exports = loadModule(script, {
    setTimeout: clock.setTimeout,
    clearTimeout: clock.clearTimeout,
    FileReader,
    Notification: Object.assign(() => {}, { closeAll() {} }),
    exampleData: { root: {} },
    window: {}
  })
  const comp = exports.default
  const vmThis = { ...comp.data(), isHandleLocalFile: false, $t: k => k, $message: { error() {}, warning() {} }, $bus: { $emit() {} } }
  vmThis.$store = { commit: (_, v) => { vmThis.isHandleLocalFile = v } }
  for (const [k, fn] of Object.entries(comp.methods)) vmThis[k] = fn.bind(vmThis)
  const finishReads = async () => {
    const r = pendingReaders; pendingReaders = []
    r.forEach(fn => fn())
    for (let i = 0; i < 10; i++) await Promise.resolve()
  }
  return { vmThis, clock, finishReads }
}

const handle = (name, text) => {
  const h = {
    name, text, kind: 'file',
    async getFile() { return { name, text: h.text } },
    async createWritable() { let buf; return { async write(s) { buf = s }, async close() { h.text = buf } } }
  }
  return h
}
const flush = async () => { for (let i = 0; i < 10; i++) await Promise.resolve() }

test('switching files never writes A\'s pending save into B, and A is saved', async () => {
  const { vmThis, clock, finishReads } = loadToolbar()
  const a = handle('A.smm', JSON.stringify({ root: { data: { text: 'A original' } } }))
  const b = handle('B.smm', JSON.stringify({ root: { data: { text: 'B valuable original' } } }))
  vmThis.readFile(a)
  await flush(); await finishReads()
  vmThis.onWriteLocalFile({ root: { data: { text: 'A changed' } } })
  assert.equal(vmThis.waitingWriteToLocalFile, true)
  await clock.tick(900)
  vmThis.editLocalFile({ handle: b })
  await clock.tick(200) // A's timer fires while B is still being read
  await flush()
  assert.equal(JSON.parse(b.text).root.data.text, 'B valuable original')
  assert.equal(JSON.parse(a.text).root.data.text, 'A changed')
  await finishReads()
  // An edit after the switch targets B.
  vmThis.onWriteLocalFile({ root: { data: { text: 'B changed' } } })
  await clock.tick(1000); await flush()
  assert.equal(JSON.parse(b.text).root.data.text, 'B changed')
  assert.equal(JSON.parse(a.text).root.data.text, 'A changed')
  assert.equal(vmThis.waitingWriteToLocalFile, false)
})

test('switching before the debounce fires flushes A to A first', async () => {
  const { vmThis, clock, finishReads } = loadToolbar()
  const a = handle('A.smm', JSON.stringify({ root: { data: { text: 'A original' } } }))
  const b = handle('B.smm', JSON.stringify({ root: { data: { text: 'B original' } } }))
  vmThis.readFile(a); await flush(); await finishReads()
  vmThis.onWriteLocalFile({ root: { data: { text: 'A changed' } } })
  vmThis.editLocalFile({ handle: b }); await flush(); await finishReads()
  assert.equal(JSON.parse(a.text).root.data.text, 'A changed')
  assert.equal(JSON.parse(b.text).root.data.text, 'B original')
  await clock.tick(2000); await flush()
  assert.equal(JSON.parse(b.text).root.data.text, 'B original')
  assert.equal(vmThis.waitingWriteToLocalFile, false)
})

test('a failed write keeps the unsaved warning on', async () => {
  const { vmThis, clock, finishReads } = loadToolbar()
  const a = handle('A.smm', JSON.stringify({ root: {} }))
  vmThis.readFile(a); await flush(); await finishReads()
  a.createWritable = async () => { throw new Error('denied') }
  vmThis.onWriteLocalFile({ root: { data: { text: 'A changed' } } })
  await clock.tick(1000); await flush()
  assert.equal(vmThis.waitingWriteToLocalFile, true)
})

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
