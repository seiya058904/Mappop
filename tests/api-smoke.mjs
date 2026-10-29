// Explicit opt-in: this creates one permanent public draft on the target origin.
// Example: set API_BASE_URL and MAPPOP_API_TOKEN in your process environment,
// then run `node tests/api-smoke.mjs`. No token or submitted text is logged.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const origin = process.env.API_BASE_URL
if (!origin) throw new Error('Set API_BASE_URL to the explicitly selected test origin.')
const base = new URL(origin)
if (base.pathname !== '/' || base.hash || base.search) throw new Error('API_BASE_URL must be an origin without a path, query or fragment.')
let token = process.env.MAPPOP_API_TOKEN
if (!token && ['127.0.0.1', 'localhost'].includes(base.hostname)) {
  const vars = readFileSync(new URL('../.dev.vars', import.meta.url), 'utf8')
  token = /^MAPPOP_API_TOKEN\s*=\s*([^\r\n]+)/m.exec(vars)?.[1].trim().replace(/^(["'])(.*)\1$/, '$2')
}
if (!token) throw new Error('Provide MAPPOP_API_TOKEN without putting it in command arguments.')
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
const markdown = '# API integration 测试\n## Research\n- First item\n  - Nested child\n## Delivery\n- Prototype\n'
const created = await fetch(new URL('/api/maps', base), { method: 'POST', headers, body: JSON.stringify({ markdown }) })
assert.equal(created.status, 201, `Creation failed with HTTP ${created.status}`)
const result = await created.json()
assert.match(result.id, /^[a-f0-9]{48}$/)
assert.equal(result.nodeCount, 6)
assert.equal(result.title, 'API integration 测试')
assert.equal(result.url, `${base.origin}/#/?fileURL=%2Fapi%2Fmaps%2F${result.id}.md`)
assert.equal(new URL(result.markdownUrl).origin, base.origin)
const raw = await fetch(result.markdownUrl)
assert.equal(raw.status, 200)
assert.equal(await raw.text(), markdown)
assert.match(raw.headers.get('content-type'), /^text\/markdown/)
assert.equal(raw.headers.get('x-content-type-options'), 'nosniff')
const missing = await fetch(new URL(`/api/maps/${'0'.repeat(48)}.md`, base))
assert.equal(missing.status, 404)
assert.match(missing.headers.get('content-type'), /application\/json/)
const unknown = await fetch(new URL('/api/does-not-exist', base), { headers: { Accept: 'text/html' } })
assert.equal(unknown.status, 404)
assert.match(unknown.headers.get('content-type'), /application\/json/)
const unauthorized = await fetch(new URL('/api/maps', base), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markdown }) })
assert.equal(unauthorized.status, 401)
const malformed = await fetch(new URL('/api/maps', base), { method: 'POST', headers, body: JSON.stringify({ markdown: '# Root\n### Skipped' }) })
assert.equal(malformed.status, 422)
console.log(JSON.stringify({ status: 'passed', checks: ['create', 'public immediate read', 'exact markdown', 'editor URL', '404 JSON', '401 auth', '422 hierarchy'], mapUrl: result.url }))
