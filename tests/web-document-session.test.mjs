import test from 'node:test'
import assert from 'node:assert/strict'
import { createDocumentSession, DRAFT_KEY, BACKUP_KEY, RECOVERY_KEY } from '../web/src/utils/documentSession.mjs'
import { normalizeDocument } from '../web/src/utils/mapDocument.mjs'
import { parseMarkdownImport } from '../web/src/utils/markdownImport.mjs'

const doc = text => ({ root: { data: { text }, children: [] }, layout: 'mindMap', theme: { template: 'mappop-anime-pop', config: {} } })
const gate = () => { let resolve; const promise = new Promise(r => { resolve = r }); return { promise, resolve } }
function lockManager() {
  let held = false
  return { async request(name, options, fn) {
    if (held) return fn(null)
    held = true
    try { return await fn({ name }) } finally { held = false }
  } }
}
function storage() {
  const map = new Map([[DRAFT_KEY, JSON.stringify(doc('original'))]])
  return { map, getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value), removeItem: key => map.delete(key) }
}
async function setup(options = {}) {
  const disk = options.disk || storage(), locks = options.locks === undefined ? lockManager() : options.locks
  const timers = new Set()
  const session = createDocumentSession({ storage: () => disk, locks,
    schedule: fn => { timers.add(fn); return fn }, cancel: fn => timers.delete(fn) })
  let live = await session.initialize(doc('welcome'))
  return { session, disk, timers,
    live: () => live,
    apply: async value => { live = value },
    edit(text) { live = doc(text); session.update(live) },
    async tick() { const jobs = [...timers]; timers.clear(); jobs.forEach(fn => fn()); await Promise.resolve() }
  }
}
function file(name, full = true) {
  const handle = { name, contents: JSON.stringify(full ? doc(name) : doc(name).root), writes: [],
    async createWritable() {
      let value
      return { async write(raw) { value = raw }, async close() { handle.contents = value; handle.writes.push(value) } }
    } }
  return { handle, full }
}
const open = (h, binding) => h.session.replace(doc(binding.handle.name), { file: binding, live: h.live, apply: h.apply })

test('switching files flushes A to A before binding B, preserving root-only formats', async () => {
  const h = await setup(), a = file('A', false), b = file('B')
  await open(h, a)
  h.edit('A edited')
  await open(h, b)
  assert.equal(JSON.parse(a.handle.contents).data.text, 'A edited')
  assert.equal(JSON.parse(b.handle.contents).root.data.text, 'B')
  h.edit('B edited'); await h.session.flush()
  assert.equal(JSON.parse(b.handle.contents).root.data.text, 'B edited')
  assert.equal(JSON.parse(a.handle.contents).data.text, 'A edited')
  assert.equal(h.session.state.dirty, false)
  h.session.release()
})

test('in-flight writes are serialized and a newer edit is not marked saved early', async () => {
  const h = await setup(), a = file('A'), started = gate(), finish = gate()
  await open(h, a)
  const normal = a.handle.createWritable
  let calls = 0
  a.handle.createWritable = async () => {
    calls++
    if (calls === 1) { started.resolve(); await finish.promise }
    return normal()
  }
  h.edit('first')
  const saving = h.session.flush()
  await started.promise
  h.edit('latest')
  assert.equal(h.session.state.dirty, true)
  assert.equal(calls, 1)
  finish.resolve(); await saving
  assert.equal(calls, 2)
  assert.equal(JSON.parse(a.handle.contents).root.data.text, 'latest')
  assert.equal(h.session.state.dirty, false)
  h.session.release()
})

test('failed file writes remain dirty, block switching, and can be retried', async () => {
  const h = await setup(), a = file('A'), b = file('B'), normal = a.handle.createWritable
  await open(h, a)
  a.handle.createWritable = async () => { throw new Error('denied') }
  h.edit('valuable edit')
  await assert.rejects(h.session.flush())
  await assert.rejects(open(h, b))
  assert.equal(h.session.state.fileName, 'A')
  assert.equal(h.live().root.data.text, 'valuable edit')
  assert.equal(h.session.hasUnsaved(), true)
  assert.equal(JSON.parse(b.handle.contents).root.data.text, 'B')
  a.handle.createWritable = normal
  await h.session.flush()
  assert.equal(JSON.parse(a.handle.contents).root.data.text, 'valuable edit')
  h.session.release()
})

test('Save As uses the live snapshot after browser quota failure and does not reload stale data', async () => {
  const h = await setup(), target = file('recovery')
  h.disk.setItem = () => { throw new DOMException('full', 'QuotaExceededError') }
  h.edit('latest precious work')
  assert.equal(h.session.state.issue, 'quota')
  assert.equal(JSON.parse(h.disk.getItem(DRAFT_KEY)).root.data.text, 'original')
  await h.session.saveAs(target.handle, h.live)
  assert.equal(JSON.parse(target.handle.contents).root.data.text, 'latest precious work')
  assert.equal(h.live().root.data.text, 'latest precious work')
  assert.equal(h.session.state.dirty, false)
  h.session.release()
})

test('creating a new document flushes and backs up the old one before writing the target', async () => {
  const h = await setup(), a = file('A')
  await open(h, a)
  h.edit('latest A')
  await h.session.createFile(a.handle, doc('new map'), { live: h.live, apply: h.apply })
  assert.deepEqual(a.handle.writes.map(raw => JSON.parse(raw).root.data.text), ['latest A', 'new map'])
  assert.equal(JSON.parse(h.disk.getItem(BACKUP_KEY)).root.data.text, 'latest A')
  assert.equal(h.live().root.data.text, 'new map')
  assert.equal(h.session.state.dirty, false)
  h.session.release()
})

test('quota or backup failure leaves current content and file binding untouched', async () => {
  for (const failingKey of [BACKUP_KEY, DRAFT_KEY]) {
    const h = await setup(), before = h.disk.getItem(DRAFT_KEY), normal = h.disk.setItem
    h.disk.setItem = (key, value) => { if (key === failingKey) throw new DOMException('full', 'QuotaExceededError'); normal(key, value) }
    await assert.rejects(h.session.replace(doc('incoming'), { live: h.live, apply: h.apply }))
    assert.equal(h.live().root.data.text, 'original')
    assert.equal(h.session.state.mode, 'browser')
    assert.equal(h.disk.getItem(DRAFT_KEY), before)
    h.session.release()
  }
})

test('import and restore keep both documents, and renderer failure restores the old document', async () => {
  const h = await setup()
  await h.session.replace(doc('imported'), { live: h.live, apply: h.apply })
  assert.equal(JSON.parse(h.disk.getItem(BACKUP_KEY)).root.data.text, 'original')
  await h.session.replace(h.session.readBackup(h.live()), { live: h.live, apply: h.apply })
  assert.equal(h.live().root.data.text, 'original')
  assert.equal(JSON.parse(h.disk.getItem(BACKUP_KEY)).root.data.text, 'imported')
  await assert.rejects(h.session.replace(doc('broken render'), { live: h.live, apply: async value => {
    if (value.root.data.text === 'broken render') throw new Error('render')
    await h.apply(value)
  } }))
  assert.equal(h.live().root.data.text, 'original')
  assert.equal(JSON.parse(h.disk.getItem(DRAFT_KEY)).root.data.text, 'original')
  assert.equal(JSON.parse(h.disk.getItem(BACKUP_KEY)).root.data.text, 'imported')
  h.session.release()
})

test('explicit restoration archives a damaged draft before replacing it', async () => {
  const disk = storage(), raw = '{damaged original'
  disk.map.set(DRAFT_KEY, raw)
  disk.map.set(BACKUP_KEY, JSON.stringify(doc('recovered work')))
  const h = await setup({ disk })
  const backup = h.session.readBackup(h.live())
  await h.session.replace(backup, { live: h.live, apply: h.apply })
  assert.equal(h.live().root.data.text, 'recovered work')
  assert.equal(JSON.parse(disk.getItem(DRAFT_KEY)).root.data.text, 'recovered work')
  assert.equal(disk.getItem(RECOVERY_KEY), raw)
  assert.equal(h.session.rawRecovery(), raw)
  assert.equal(h.session.state.status, 'saved')
  h.session.release()
  const reopened = await setup({ disk })
  assert.equal(reopened.session.rawRecovery(), raw)
  assert.equal(reopened.session.state.hasRawRecovery, true)
  reopened.session.release()
})

test('cancelled replacement leaves content, draft and previous recovery point untouched', async () => {
  const h = await setup(), backup = JSON.stringify(doc('older recovery'))
  h.disk.setItem(BACKUP_KEY, backup)
  const before = h.disk.getItem(DRAFT_KEY)
  await assert.rejects(h.session.replace(doc('cancelled'), { live: h.live, apply: h.apply, isCurrent: () => false }), /cancel/)
  assert.equal(h.live().root.data.text, 'original')
  assert.equal(h.disk.getItem(DRAFT_KEY), before)
  assert.equal(h.disk.getItem(BACKUP_KEY), backup)
  h.session.release()
})

test('blocked storage and malformed draft data remain recoverable without overwriting their bytes', async () => {
  const blocked = { getItem() { throw new DOMException('blocked', 'SecurityError') }, setItem() { throw new DOMException('blocked', 'SecurityError') } }
  const b = await setup({ disk: blocked })
  b.edit('temporary work')
  assert.equal(b.session.snapshot().root.data.text, 'temporary work')
  assert.equal(b.session.state.issue, 'storage')
  for (const raw of ['{}', 'null', '{broken', JSON.stringify({ root: { data: { text: 'bad' }, children: [null] } })]) {
    const disk = storage(); disk.map.set(DRAFT_KEY, raw)
    const h = await setup({ disk })
    h.edit('temporary work')
    assert.equal(disk.getItem(DRAFT_KEY), raw)
    assert.equal(h.session.rawRecovery(), raw)
    assert.equal(h.session.state.issue, 'damaged')
    h.session.release()
  }
})

test('two tabs cannot overwrite each other; acquiring a released lock still checks the revision', async () => {
  const disk = storage(), locks = lockManager()
  const a = await setup({ disk, locks }), b = await setup({ disk, locks })
  assert.equal(b.session.state.status, 'conflict')
  a.edit('A changes')
  b.edit('B changes')
  assert.equal(JSON.parse(disk.getItem(DRAFT_KEY)).root.data.text, 'A changes')
  assert.equal(b.session.snapshot().root.data.text, 'B changes')
  a.session.release(); await Promise.resolve(); await Promise.resolve()
  await assert.rejects(b.session.flush())
  assert.equal(b.session.state.issue, 'changedElsewhere')
  assert.equal(JSON.parse(disk.getItem(DRAFT_KEY)).root.data.text, 'A changes')
  b.session.release()
})

test('legacy writes and missing lock support fail closed instead of silently overwriting', async () => {
  const h = await setup()
  h.disk.setItem(DRAFT_KEY, JSON.stringify(doc('legacy tab')))
  h.session.checkRevision(); h.edit('my version')
  assert.equal(h.session.state.issue, 'changedElsewhere')
  assert.equal(JSON.parse(h.disk.getItem(DRAFT_KEY)).root.data.text, 'legacy tab')
  h.session.release()
  const noLocks = await setup({ locks: null })
  noLocks.edit('my version')
  assert.equal(noLocks.session.state.issue, 'coordination')
  assert.equal(JSON.parse(noLocks.disk.getItem(DRAFT_KEY)).root.data.text, 'original')
})

test('document validation rejects malformed trees while preserving native fields', () => {
  for (const value of [null, [], {}, { data: {} }, { data: { text: 'root' }, children: {} }]) assert.throws(() => normalizeDocument(value))
  const value = doc('valid'); value.root.data.note = 'note'; value.root.data.image = 'data:image/png;base64,x'
  value.theme.config = { lineColor: '#123456' }; value.root.data.associativeLineTargets = ['child']
  assert.deepEqual(normalizeDocument(value), value)
})

test('Markdown keeps all top-level items and reports content the native format cannot represent', () => {
  const headings = parseMarkdownImport('# A\n## A child\n# B\n## B child', 'notes')
  assert.equal(headings.data.data.text, 'notes')
  assert.deepEqual(headings.data.children.map(n => n.data.text), ['A', 'B'])
  const list = parseMarkdownImport('- First\n- Second\n- Third', 'list')
  assert.equal(list.data.children.length, 3)
  const warnings = parseMarkdownImport('# Title\nA paragraph\n\n> quote\n\n```js\ncode\n```\n\n- **Kept** `code`')
  assert.deepEqual(warnings.warnings.map(w => w.type), ['paragraph', 'blockquote', 'code'])
  assert.equal(warnings.warnings[0].line, 2)
  assert.equal(warnings.data.children[0].data.text, 'Kept code')
})
