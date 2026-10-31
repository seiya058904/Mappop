# AGENTS.md

## Project and verification

Mappop combines the Vue editor in `web/` and `simple-mind-map/` with a Cloudflare Worker in `worker/`, static assets and D1 migrations. Preserve map import/export, themes and editor compatibility; protect credentials and user maps.

Use the Node and locked dependencies specified by `package.json`. Run relevant `npm test`, `npm run build` and `npm run test:e2e` checks for substantive changes; browser/API checks use isolated fixtures and local D1. Follow the existing CI for verification and report untested paths. Documentation-only changes need proportionate checks.

Remote D1 migrations, deployment, publishing, pushing, merging and dependency changes require explicit authorization. Never commit `.dev.vars`, credentials, local databases, build output or test profiles; inspect and stage only task-owned files.

## Browser tool selection

- Prefer Ego Browser for exploratory navigation, visual review and interactive checks when available. Use Playwright for repeatable regression, CI, isolation, request interception or other automation requiring its APIs; combine tools when useful. If Ego is unavailable, use a suitable existing browser tool.
- Keep this repository's required browser commands, versions, profiles and safety boundaries; an exploratory check does not replace required automated tests. Do not alter real user data or production state for testing. Report the tools, coverage and any untested paths.
