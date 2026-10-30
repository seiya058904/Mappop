# Run and deploy Mappop

Mappop uses one Cloudflare Worker to serve the built editor and `/api/*`, one D1 database for immutable Markdown drafts, and two rate-limit bindings. There is no model provider, account system, or separate application server.

## Local setup

Use a current Node.js 22 or 24 release and npm. Install all three lockfile-controlled package sets from the repository root:

```sh
npm ci
npm run setup
npm run build
npm run db:local
```

`npm run setup` installs the `web/` and `simple-mind-map/` dependencies. `npm run build` writes `.output/public`; its wrapper passes `--openssl-legacy-provider` only to the inherited Vue CLI / webpack build. `npm run db:local` applies `migrations/` to Wrangler's local D1 database, not production.

Create an ignored `.dev.vars` beside `wrangler.jsonc`:

```dotenv
MAPPOP_API_TOKEN="replace-with-a-cryptographically-random-token-of-at-least-32-characters"
```

Use your own generated value; the example is not a credential. Keep a separate local token from production. Never put tokens in `wrangler.jsonc`, frontend environment variables, links, or committed files. Wrangler loads local secrets from `.dev.vars`. [Cloudflare secret handling](https://developers.cloudflare.com/workers/configuration/secrets/).

```sh
npm run dev
```

Open [http://localhost:8787](http://localhost:8787). The editor can run without a write token; API creation returns `503` until a valid server secret is configured. See [API.md](API.md) for requests and map-link behavior.

## Checks

```sh
npm test
npx playwright install chromium
npm run test:e2e
```

API tests run locally. Browser tests exercise the built editor. A passing local suite does not establish that a deployment or remote D1 binding works; verify the deployed editor and API after publishing.

For an established deployment's theme-only release, keep the full E2E/API smoke
suite on local D1: it creates public drafts. Use isolated browser contexts and
read-only production page/resource requests instead. Compare the full commit in
`/build-info.json` with the successful final Actions run and GitHub main; inspect
theme counts, filters, fonts, thumbnails and export entry points. Do not create
new permanent production test maps simply to repeat a local API gate.

## Provision your own Cloudflare account

The committed `account_id` and D1 `database_id` identify the maintainer's deployment. They are identifiers, not credentials. A fork must replace them with its own account and database before deployment.

1. Authenticate with `npx wrangler login`, or provide a scoped Cloudflare API token through your environment.
2. Run `npx wrangler d1 create mappop-maps` in the intended account.
3. Update `account_id` in `wrangler.jsonc` and replace `d1_databases[0].database_id` with the returned ID. Keep `binding: "DB"`, `database_name: "mappop-maps"`, and `migrations_dir: "migrations"`. If you choose another database name, update the `db:local` and `db:remote` scripts too.
4. Keep `ASSETS` pointed at `.output/public`, the API-first routes, and both `WRITE_LIMITER` / `READ_LIMITER` bindings. Choose a different Worker `name` if your account already uses `mappop`.

Cloudflare's [D1 setup guide](https://developers.cloudflare.com/d1/get-started/) explains creation and database bindings. Inspect the target account and database ID before applying remote migrations.

## First production deployment

```sh
npm test
npm run db:remote
npm run deploy
npx wrangler secret put MAPPOP_API_TOKEN
```

`db:remote` changes the configured remote D1 database. `deploy` builds the editor and publishes the Worker with static assets. The first deployment serves the editor with API writes disabled until the secret is set. Enter a cryptographically random token of at least 32 characters at Wrangler's secret prompt; keep it in your password manager or server-side caller configuration. `secret put` creates and deploys a Worker version, so treat secret rotation as a production change. [Worker secrets](https://developers.cloudflare.com/workers/configuration/secrets/).

Use the HTTPS URL printed by Wrangler. Verify that the editor loads, an authenticated `POST /api/maps` returns `201`, the returned `markdownUrl` returns the original text, and the returned `url` opens the map. Verify an unauthenticated POST returns `401` and an unknown API path returns JSON `404` instead of the editor HTML.

Generated map links are public, immutable, and have no automatic expiry. Browser edits do not update D1. Review [API limits and retention](API.md#read-a-public-draft) before sharing a deployment with other people.

## GitHub Actions

The [`deploy.yml`](../.github/workflows/deploy.yml) workflow runs dependency installation, API tests, the production build, local D1 migrations, and Playwright checks on pull requests, pushes to `main`, and manual dispatch. Remote migrations and deployment run only on `main` for a push or manual dispatch, after those checks pass. They require the following GitHub Actions repository secrets:

| Secret | Purpose |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | A Cloudflare token scoped to the target account, with Worker deployment and D1 migration permissions |
| `CLOUDFLARE_ACCOUNT_ID` | The target Cloudflare account ID |

The Cloudflare deployment token is separate from `MAPPOP_API_TOKEN`. Set the latter directly on the Worker; do not expose it to a frontend build or use it as the Cloudflare credential. The workflow should retain the existing Worker secret across regular deploys. See Cloudflare's [GitHub Actions setup](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/) for credential configuration.

Review workflow permissions and deployment triggers before enabling a fork. Do not grant deployment credentials to untrusted pull-request code. Keep the configured account and D1 identifiers aligned with the account used by Actions.
