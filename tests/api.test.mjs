import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { randomBytes } from 'node:crypto'
import worker from '../worker/index.mjs'
import { LIMITS, validateMarkdown } from '../worker/markdown.mjs'

const markdown = '# API 测试\n\n## First\n- **Bold** and `code`\n  - [Child](https://example.com)\n## Second\n1. Ordered\n'
const schema = readFileSync(new URL('../migrations/0001_maps.sql', import.meta.url), 'utf8')

function fixture(t) {
  const database = new DatabaseSync(':memory:')
  database.exec(schema)
  t.after(() => database.close())
  const sessions = []
  const limitCalls = []
  const env = {
    MAPPOP_API_TOKEN: randomBytes(32).toString('hex'),
    DB: {
      withSession(mode) {
        sessions.push(mode)
        return {
          prepare(sql) {
            return {
              bind(...values) {
                return { async first() { return database.prepare(sql).get(...values) || null } }
              }
            }
          }
        }
      }
    },
    WRITE_LIMITER: { async limit(args) { limitCalls.push(args); return { success: true } } },
    READ_LIMITER: { async limit(args) { limitCalls.push(args); return { success: true } } },
    ASSETS: { async fetch() { return new Response('static app') } }
  }
  function post(body = { markdown }, options = {}) {
    return worker.fetch(new Request('https://mappop.example/api/maps', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.MAPPOP_API_TOKEN}`, 'Content-Type': 'application/json', ...options.headers },
      body: typeof body === 'string' ? body : JSON.stringify(body),
      ...options.request
    }), env)
  }
  return { env, database, sessions, limitCalls, post }
}

test('creates an immutable public draft and reads exact original Markdown through the primary', async t => {
  const { env, post, sessions, database } = fixture(t)
  const response = await post()
  assert.equal(response.status, 201)
  const map = await response.json()
  assert.match(map.id, /^[a-f0-9]{48}$/)
  assert.equal(map.title, 'API 测试')
  assert.equal(map.nodeCount, 6)
  assert.equal(map.url, `https://mappop.example/#/?fileURL=%2Fapi%2Fmaps%2F${map.id}.md`)
  assert.equal(response.headers.get('location'), map.markdownUrl)
  assert.equal(response.headers.get('cache-control'), 'no-store')
  const raw = await worker.fetch(new Request(map.markdownUrl), env)
  assert.equal(raw.status, 200)
  assert.match(raw.headers.get('content-type'), /^text\/markdown; charset=utf-8$/)
  assert.equal(raw.headers.get('x-content-type-options'), 'nosniff')
  assert.equal(await raw.text(), markdown)
  assert.deepEqual(sessions, ['first-primary', 'first-primary'])
  const head = await worker.fetch(new Request(map.markdownUrl, { method: 'HEAD' }), env)
  assert.equal(head.status, 200)
  assert.equal(await head.text(), '')
  const update = await worker.fetch(new Request(map.markdownUrl, { method: 'PUT', body: 'changed' }), env)
  assert.equal(update.status, 405)
  assert.equal(database.prepare('SELECT markdown FROM maps').get().markdown, markdown)
  const second = await (await post()).json()
  assert.notEqual(map.id, second.id)
})

test('authentication rejects missing/invalid tokens before inspecting body or storage', async t => {
  const { post, database, env, limitCalls } = fixture(t)
  for (const Authorization of ['', 'Bearer wrong', `Basic ${env.MAPPOP_API_TOKEN}`]) {
    const response = await post('invalid-json', { headers: { Authorization } })
    assert.equal(response.status, 401)
    assert.equal(response.headers.get('www-authenticate'), 'Bearer')
    assert.equal(response.headers.get('access-control-allow-origin'), null)
  }
  assert.equal(limitCalls.some(({ key }) => key === 'mappop:create'), false)
  assert.equal(database.prepare('SELECT COUNT(*) AS n FROM maps').get().n, 0)
  env.MAPPOP_API_TOKEN = ''
  assert.equal((await post()).status, 503)
})

test('SQL-like labels are stored as text through bound parameters', async t => {
  const { post, database } = fixture(t)
  const source = "# O'Reilly\n- '); DROP TABLE maps; --"
  assert.equal((await post({ markdown: source })).status, 201)
  assert.equal(database.prepare('SELECT markdown FROM maps').get().markdown, source)
})

test('JSON and media validation produce stable errors and never write rows', async t => {
  const { post, database } = fixture(t)
  const cases = [
    ['{bad', {}, 400],
    [{ markdown }, { 'Content-Type': 'text/plain' }, 415],
    [{ markdown }, { 'Content-Encoding': 'gzip' }, 415],
    [{ markdown }, { 'Content-Length': String(LIMITS.requestBytes + 1) }, 413],
    [null, {}, 422], [[], {}, 422], [{}, {}, 422], [{ markdown: 5 }, {}, 422],
    [{ markdown, title: 'unrecognized' }, {}, 422], [{ markdown: '# Title\n- ' + '字'.repeat(23000) }, {}, 413]
  ]
  for (const [body, headers, expected] of cases) {
    const response = await post(body, { headers })
    assert.equal(response.status, expected)
    assert.ok((await response.json()).error.code)
  }
  assert.equal(database.prepare('SELECT COUNT(*) AS n FROM maps').get().n, 0)
})

test('streamed bodies cannot bypass the byte cap without Content-Length', async t => {
  const { env, database } = fixture(t)
  let cancelled = false
  const body = new ReadableStream({
    pull(controller) { controller.enqueue(new Uint8Array(32768).fill(32)) },
    cancel() { cancelled = true }
  })
  const response = await worker.fetch(new Request('https://mappop.example/api/maps', {
    method: 'POST', headers: { Authorization: `Bearer ${env.MAPPOP_API_TOKEN}`, 'Content-Type': 'application/json' },
    body, duplex: 'half'
  }), env)
  assert.equal(response.status, 413)
  assert.equal(cancelled, true)
  assert.equal(database.prepare('SELECT COUNT(*) AS n FROM maps').get().n, 0)
})

test('invalid UTF-8 is rejected rather than silently replaced', async t => {
  const { env } = fixture(t)
  const response = await worker.fetch(new Request('https://mappop.example/api/maps', {
    method: 'POST', headers: { Authorization: `Bearer ${env.MAPPOP_API_TOKEN}`, 'Content-Type': 'application/json' },
    body: new Uint8Array([0xc3, 0x28])
  }), env)
  assert.equal(response.status, 400)
})

test('outline parser validates actual Markdown hierarchy and preserves supported inline labels', () => {
  assert.deepEqual(validateMarkdown('# **A** &amp; `B`\n- escaped \\*literal\\*\n  1. [link label](https://example.com)\n'), { title: 'A & B', nodeCount: 3 })
  assert.equal(validateMarkdown('# Root\n## A\n### B\n## C\n- Item').nodeCount, 5)
  const invalid = [
    '', 'plain text', '## Wrong root\n- Item', '# Root', '# Root\n# Other\n- Item', '# Root\n### Skipped',
    '# Root\n\nParagraph ignored by importer', '# Root\n- Item\n\n  Another paragraph',
    '# Root\n> Quote', '# Root\n```js\nalert(1)\n```', '# Root\n- ![image](https://example.com/a.png)',
    '# Root\n- <img src=x onerror=alert(1)>', '# Root\n---', '# Root\n- ** **',
    '# Root\n- [label][ref]\n\n[ref]: https://example.com', '# Root\n- hello\u0000',
    '# ' + '字'.repeat(201) + '\n- Child', '# Root\n- ' + 'a'.repeat(2001),
    '# Root\n' + '- Node\n'.repeat(500),
    '# Root\n' + Array.from({ length: 12 }, (_, i) => '  '.repeat(i) + '- Nested').join('\n')
  ]
  for (const markdown of invalid) assert.throws(() => validateMarkdown(markdown), error => error.status === 422, JSON.stringify(markdown.slice(0, 100)))
  assert.equal(validateMarkdown('# Root\n' + '- Node\n'.repeat(499)).nodeCount, 500)
})

test('unknown API routes and map ids never return the SPA shell', async t => {
  const { env } = fixture(t)
  for (const path of ['/api', '/api/unknown', '/api/maps/nope.md', `/api/maps/${'a'.repeat(48)}.md`, '/api/maps/a/b.md']) {
    const response = await worker.fetch(new Request(`https://mappop.example${path}`), env)
    assert.equal(response.status, 404)
    assert.match(response.headers.get('content-type'), /application\/json/)
  }
  assert.equal((await worker.fetch(new Request('https://mappop.example/api/maps'), env)).status, 405)
  assert.equal(await (await worker.fetch(new Request('https://mappop.example/'), env)).text(), 'static app')
})

test('configured rate limits fail closed, without reading or writing D1', async t => {
  const { env, post, sessions } = fixture(t)
  env.WRITE_LIMITER = { async limit() { return { success: false } } }
  const response = await post()
  assert.equal(response.status, 429)
  assert.equal(response.headers.get('retry-after'), '60')
  env.READ_LIMITER = { async limit() { return { success: false } } }
  assert.equal((await worker.fetch(new Request(`https://mappop.example/api/maps/${'a'.repeat(48)}.md`), env)).status, 429)
  env.WRITE_LIMITER = undefined
  assert.equal((await post()).status, 503)
  assert.deepEqual(sessions, [])
})

test('atomic daily quota permits only the final available row under concurrent requests', async t => {
  const { database, post } = fixture(t)
  const now = Math.floor(Date.now() / 1000)
  const insert = database.prepare('INSERT INTO maps VALUES (?, ?, ?, ?, ?)')
  for (let i = 0; i < LIMITS.dailyMaps - 1; i++) insert.run(i.toString(16).padStart(48, '0'), 'Seed', '# Seed\n- Child', 2, now)
  const responses = await Promise.all([post(), post(), post(), post()])
  assert.deepEqual(responses.map(response => response.status).sort(), [201, 429, 429, 429])
  assert.equal(database.prepare('SELECT COUNT(*) AS n FROM maps').get().n, LIMITS.dailyMaps)
})

test('total storage quota applies even when previous drafts were created on other days', async t => {
  const { database, post } = fixture(t)
  database.exec(`WITH RECURSIVE numbers(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM numbers WHERE n < ${LIMITS.totalMaps})
    INSERT INTO maps SELECT printf('%048x', n), 'Seed', '# Seed\n- Child', 2, 1 FROM numbers`)
  const response = await post()
  assert.equal(response.status, 429)
  assert.equal((await response.json()).error.code, 'storage_quota_reached')
})

test('database failure exposes no SQL, token or submitted content', async t => {
  const { env, post } = fixture(t)
  env.DB.withSession = () => { throw new Error(`SQL with ${env.MAPPOP_API_TOKEN} and private content`) }
  const response = await post()
  assert.equal(response.status, 503)
  const text = await response.text()
  assert.equal(text.includes(env.MAPPOP_API_TOKEN), false)
  assert.equal(text.includes('SQL'), false)
  assert.equal(text.includes('private content'), false)
})
