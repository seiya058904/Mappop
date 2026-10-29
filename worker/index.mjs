import { createHash, timingSafeEqual } from 'node:crypto'
import { ApiError, LIMITS, validateMarkdown } from './markdown.mjs'

const API_HEADERS = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'Referrer-Policy': 'no-referrer'
}
const ID_PATTERN = /^[a-f0-9]{48}$/

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...API_HEADERS, 'Content-Type': 'application/json; charset=utf-8', ...headers }
  })
}

async function rateLimit(binding, key) {
  if (!binding) throw new ApiError(503, 'service_unavailable', 'The API is not configured.')
  if (!(await binding.limit({ key })).success) {
    throw new ApiError(429, 'rate_limited', 'Too many requests. Try again later.', { 'Retry-After': '60' })
  }
}

function authorize(request, env) {
  if (typeof env.MAPPOP_API_TOKEN !== 'string' || env.MAPPOP_API_TOKEN.length < 32) {
    throw new ApiError(503, 'service_unavailable', 'The API is not configured.')
  }
  const match = /^Bearer ([^\s]+)$/i.exec(request.headers.get('Authorization') || '')
  const digest = value => createHash('sha256').update(value).digest()
  if (!match || !timingSafeEqual(digest(match[1]), digest(env.MAPPOP_API_TOKEN))) {
    throw new ApiError(401, 'unauthorized', 'A valid bearer token is required.', { 'WWW-Authenticate': 'Bearer' })
  }
}

async function readJson(request) {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('Content-Type') || '')) {
    throw new ApiError(415, 'unsupported_media_type', 'Use Content-Type: application/json.')
  }
  if (request.headers.has('Content-Encoding') && request.headers.get('Content-Encoding') !== 'identity') {
    throw new ApiError(415, 'unsupported_media_type', 'Compressed request bodies are not supported.')
  }
  const length = request.headers.get('Content-Length')
  if (length && (!/^\d+$/.test(length) || Number(length) > LIMITS.requestBytes)) {
    throw new ApiError(413, 'request_too_large', `JSON must not exceed ${LIMITS.requestBytes} bytes.`)
  }
  const reader = request.body?.getReader()
  if (!reader) throw new ApiError(400, 'invalid_json', 'A JSON request body is required.')
  const chunks = []
  let size = 0
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > LIMITS.requestBytes) {
        await reader.cancel()
        throw new ApiError(413, 'request_too_large', `JSON must not exceed ${LIMITS.requestBytes} bytes.`)
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  let body
  try {
    body = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
  } catch {
    throw new ApiError(400, 'invalid_json', 'The body must be valid UTF-8 JSON.')
  }
  if (!body || Array.isArray(body) || typeof body !== 'object' || Object.keys(body).length !== 1 || !Object.hasOwn(body, 'markdown')) {
    throw new ApiError(422, 'invalid_request', 'Provide exactly one JSON property: markdown.')
  }
  return body
}

async function createMap(request, env, url) {
  // Coarse pre-auth IP protection keeps invalid tokens from exhausting the shared
  // authenticated allowance. Never put credential values into limiter keys.
  await rateLimit(env.WRITE_LIMITER, `mappop:auth:${request.headers.get('CF-Connecting-IP') || 'local'}`)
  authorize(request, env)
  await rateLimit(env.WRITE_LIMITER, 'mappop:create')
  const { markdown } = await readJson(request)
  const { title, nodeCount } = validateMarkdown(markdown)
  const id = Array.from(crypto.getRandomValues(new Uint8Array(24)), byte => byte.toString(16).padStart(2, '0')).join('')
  const createdAt = Math.floor(Date.now() / 1000)
  const dayStart = createdAt - (createdAt % 86400)
  // The quota check and insert are one SQL statement: concurrent locations cannot
  // pass a separate check together. Only successful inserts consume the quota.
  const row = await env.DB.withSession('first-primary').prepare(`
    INSERT INTO maps (id, title, markdown, node_count, created_at)
    SELECT ?, ?, ?, ?, ?
    WHERE (SELECT COUNT(*) FROM maps WHERE created_at >= ?) < ?
      AND (SELECT COUNT(*) FROM maps) < ?
    RETURNING id
  `).bind(id, title, markdown, nodeCount, createdAt, dayStart, LIMITS.dailyMaps, LIMITS.totalMaps).first()
  if (!row) {
    throw new ApiError(429, 'storage_quota_reached', 'The daily or total map quota has been reached.', { 'Retry-After': String(dayStart + 86400 - createdAt) })
  }
  const path = `/api/maps/${id}.md`
  const markdownUrl = new URL(path, url.origin).href
  const mapUrl = `${url.origin}/#/?fileURL=${encodeURIComponent(path)}`
  return json({ id, title, nodeCount, createdAt: new Date(createdAt * 1000).toISOString(), url: mapUrl, markdownUrl }, 201, { Location: markdownUrl })
}

async function readMap(request, env, id) {
  if (!ID_PATTERN.test(id)) throw new ApiError(404, 'not_found', 'Map not found.')
  // Public links have no account identity. IP limiting is a coarse abuse guard;
  // users sharing a network also share its allowance.
  await rateLimit(env.READ_LIMITER, `mappop:read:${request.headers.get('CF-Connecting-IP') || 'local'}`)
  const row = await env.DB.withSession('first-primary').prepare('SELECT markdown FROM maps WHERE id = ?').bind(id).first()
  if (!row) throw new ApiError(404, 'not_found', 'Map not found.')
  return new Response(request.method === 'HEAD' ? null : row.markdown, {
    headers: {
      ...API_HEADERS,
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Security-Policy': "default-src 'none'; sandbox",
      'Content-Disposition': `inline; filename="${id}.md"`
    }
  })
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (url.pathname !== '/api' && !url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request)
    try {
      if (url.pathname === '/api/maps') {
        if (request.method !== 'POST') throw new ApiError(405, 'method_not_allowed', 'Use POST to create a map.', { Allow: 'POST' })
        return await createMap(request, env, url)
      }
      const match = /^\/api\/maps\/([^/]+)\.md$/.exec(url.pathname)
      if (match) {
        if (!['GET', 'HEAD'].includes(request.method)) throw new ApiError(405, 'method_not_allowed', 'Maps are immutable. Use GET or HEAD.', { Allow: 'GET, HEAD' })
        return await readMap(request, env, match[1])
      }
      throw new ApiError(404, 'not_found', 'API route not found.')
    } catch (error) {
      if (error instanceof ApiError) return json({ error: { code: error.code, message: error.message } }, error.status, error.headers)
      // D1 exceptions may include SQL and submitted content. Never expose or log them.
      return json({ error: { code: 'service_unavailable', message: 'The API is temporarily unavailable.' } }, 503, { 'Retry-After': '60' })
    }
  }
}
