# Mappop Markdown API

This API stores an immutable Markdown draft and returns a link that opens it in the existing Mappop editor. It does not generate content, run an LLM, provide MCP, create user accounts, or synchronize later edits back to the draft.

The Worker and static app share an origin. The maintained deployment is [mappop.seiya-api.workers.dev](https://mappop.seiya-api.workers.dev); use your own origin when self-hosting. Creation requires that deployment's write token. The machine-readable contract is [openapi.json](./openapi.json).

## Create a draft

`POST /api/maps`

Required headers:

```http
Authorization: Bearer <MAPPOP_API_TOKEN>
Content-Type: application/json
```

The JSON object accepts exactly one property:

```json
{
  "markdown": "# Product launch\n\n## Research\n- Interview customers\n  - Summarize needs\n## Delivery\n- Ship a prototype\n"
}
```

The `MAPPOP_API_TOKEN` secret belongs on a trusted server or in a local environment variable. Never include it in frontend bundles, links, screenshots, source control, or a public client. A missing/short server secret disables writes. Configure a cryptographically random secret of at least 32 characters with `wrangler secret put MAPPOP_API_TOKEN`; use an ignored `.dev.vars` file for local development.

Example using PowerShell with an already-configured environment variable:

```powershell
$body = @{ markdown = "# Product launch`n## Research`n- Interview customers" } | ConvertTo-Json
$map = Invoke-RestMethod -Method Post -Uri 'https://mappop.seiya-api.workers.dev/api/maps' `
  -Headers @{ Authorization = "Bearer $env:MAPPOP_API_TOKEN" } `
  -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($body))
$map.url
```

Successful response: `201 Created`, with a `Location` header pointing to the Markdown resource:

```json
{
  "id": "c5b142645a04c95b5cc670f6963244eb6c8def8402e764ed",
  "title": "Product launch",
  "nodeCount": 6,
  "createdAt": "2026-10-30T00:00:00.000Z",
  "url": "https://mappop.seiya-api.workers.dev/#/?fileURL=%2Fapi%2Fmaps%2Fc5b142645a04c95b5cc670f6963244eb6c8def8402e764ed.md",
  "markdownUrl": "https://mappop.seiya-api.workers.dev/api/maps/c5b142645a04c95b5cc670f6963244eb6c8def8402e764ed.md"
}
```

Open `url` in a browser. The hash route is intentional: Mappop uses Vue Router's hash routing and its existing `fileURL` Markdown import. Each successful POST creates a different 192-bit random ID, even for identical content. POST is not idempotent; do not blindly retry an uncertain success or network timeout, because it can create a second draft.

## Supported Markdown and limits

The API validates with the same `mdast-util-from-markdown` version as the editor's importer. It keeps the submitted Markdown unchanged in D1.

- Begin with exactly one level-one heading, followed by at least one child heading or list item. Heading depth must increase one level at a time; returning to a shallower heading is allowed.
- Use headings and ordered or unordered lists. Indent nested list items according to Markdown syntax. Each item supports one paragraph label followed by nested lists.
- Emphasis, strong emphasis, inline code, escaped characters, entities, and inline links are accepted in labels. The editor displays their text: formatting and link destinations do not become interactive map links.
- Free-standing paragraphs, multi-paragraph list items, block quotes, fenced/indented code blocks, thematic breaks, HTML, images, reference definitions, and hard line breaks are rejected. These structures would otherwise be omitted or lose content in the existing importer.
- Maximum JSON request body: 131,072 bytes (128 KiB), enforced while streaming even without `Content-Length`. Send uncompressed UTF-8 JSON.
- Maximum Markdown: 65,536 UTF-8 bytes (64 KiB), 500 nodes, and 12 levels including the root. Maximum title: 200 Unicode code points; each node label: 2,000 code points.

Malformed JSON returns `400`; structurally invalid Markdown returns `422` with a useful error. Unsupported JSON properties are rejected to catch client mistakes.

## Read a public draft

`GET /api/maps/{id}.md` returns the exact submitted Markdown with `Content-Type: text/markdown; charset=utf-8`. `HEAD` returns the same headers without a body. Reads start with a D1 `first-primary` session, so a successful creation is immediately readable even if read replication is enabled later.

Anyone with the URL can read the draft without authentication. IDs resist guessing, but links are not an access-control mechanism. Links have no automatic expiry. Do not upload secrets or private content. There is no listing, overwrite, update, or deletion endpoint. Editing/exporting in the browser does not update this original stored draft. An operator can perform exceptional removal directly in D1.

API responses use `Cache-Control: no-store`, `X-Content-Type-Options: nosniff`, and `X-Robots-Tag: noindex, nofollow, noarchive`. Raw Markdown also has a restrictive Content Security Policy. No cross-origin CORS permission is granted; server-to-server callers can use the bearer token normally.

## Abuse protection and errors

Cloudflare rate-limit bindings enforce approximate limits per Cloudflare location:

- Creation: 20 authenticated requests per 60 seconds shared by the API credential, plus 20 authentication attempts per IP per 60 seconds. Invalid credentials do not consume the authenticated allowance.
- Reads: 120 requests per IP per 60 seconds. People sharing an IP share this allowance.

These are coarse abuse guards, not exact global counters. Independently, a single atomic D1 `INSERT … SELECT` enforces at most 100 successful creations per UTC day and 10,000 drafts total. Concurrent writes cannot bypass the quota. Failed validation does not consume storage quota. The daily quota resets at UTC midnight; reaching the total cap requires operator action. Limits are deliberate application settings in `worker/markdown.mjs` and `wrangler.jsonc`, not Cloudflare plan limits.

Error format:

```json
{ "error": { "code": "invalid_markdown", "message": "Start with one level-one title (# Title)." } }
```

| HTTP status | Meaning |
| --- | --- |
| 400 | Invalid JSON or UTF-8 body |
| 401 | Missing or invalid bearer token; includes `WWW-Authenticate: Bearer` |
| 404 | Unknown API route, malformed ID, or missing draft; always JSON, never the app shell |
| 405 | Unsupported method; includes `Allow` |
| 413 | JSON or Markdown byte limit exceeded |
| 415 | Unsupported content type or compressed body |
| 422 | Invalid request shape, title, hierarchy, unsupported Markdown, or node/depth limit |
| 429 | Rate limit or storage quota; includes `Retry-After` (daily reset for storage quota; total cap still needs operator action) |
| 503 | Secret/binding missing, rate-limit service unavailable, or database failure |

Database exceptions, SQL statements, request bodies, and token values are never returned or logged by application code. Worker request metrics are sampled through Cloudflare Observability. Public draft paths may appear in platform request logs; restrict access to those logs.

## Local validation and deployment

From the repository root, after installing dependencies and building static assets:

```text
npm run db:local
npm run test:api
npm run dev
```

The API tests exercise request handling plus the actual migration/SQL against an isolated in-memory SQLite database. They test quota concurrency, authentication, malformed input, streaming caps, immutable retrieval, error redaction, and routing. They do not substitute for the deployed D1/Workers and browser smoke test.

For an explicit live smoke test, set `API_BASE_URL` to the selected origin and `MAPPOP_API_TOKEN` in the process environment, then run `node tests/api-smoke.mjs`. This creates one permanent public test draft. For localhost only, the script can read the ignored `.dev.vars` secret instead. It prints the public result URL, never the token.

Production setup uses one D1 database (`mappop-maps`), its `DB` binding and the two rate-limit bindings. Apply migrations before deploying. Keep the `database_id` in `wrangler.jsonc` aligned with the target database. Only `.output/public` is uploaded as static assets; API paths are explicitly routed to the Worker first.

Official references: [D1 sessions](https://developers.cloudflare.com/d1/worker-api/d1-database/#withsession), [rate-limit accuracy](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/#accuracy), [selective Worker-first routing](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/#run-worker-first-for-selective-paths), and [Worker secrets](https://developers.cloudflare.com/workers/configuration/secrets/).
