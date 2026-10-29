# Release verification

Verification date: 2026-10-30 (Asia/Singapore).

The unchanged upstream editor was installed, built, opened and captured before
the Mappop extensions were implemented. The upstream baseline is recorded in
[UPSTREAM.md](UPSTREAM.md).

## Automated checks

The release candidate passes 12 API tests and 12 Chromium browser tests.
Browser coverage runs against the built Worker locally and against the actual
[production site](https://mappop.seiya-api.workers.dev). The repository's
[Actions workflow](../.github/workflows/deploy.yml) repeats API, build and browser
checks before deploying `main`.

| Area | Checks performed |
| --- | --- |
| API | Authenticated creation, immediate D1 read, exact Markdown, public read without credentials, HTTP 401/404/413/415/422/429/503 behavior, body and outline limits, invalid UTF-8, safe error responses, concurrent daily quota and total storage cap |
| Original editor | Keyboard insertion, rich-text editing, undo/redo, browser persistence, native Markdown import, editable SMM export, image insertion, associative line, layout change and node drag |
| Share links | Actual POST → returned hash URL → editable 121-node Chinese map → save/reload → SMM and PNG export; original public draft remains unchanged |
| Data protection | Cancel incoming draft, confirm and back up existing map, restore backup, failed link retains content, saved zen mode, stale request superseded by newer link |
| Themes | All eight selected through UI, unchanged content/layout, distinct configurations, reload persistence, native SVG decorations and embedded local fonts, original themes still selectable |
| Exports | Eight SVG exports retain nodes, theme decoration and local fonts; Toon Motion PNG/PDF have valid signatures and nonempty output; 121-node Chinese PNG and imported-theme SVG retain content |
| Accessibility and mobile | Keyboard theme selection, visible focus, reduced-motion behavior, 390-pixel touch viewport, working mobile controls and branch expansion |
| Rendering | Desktop/mobile and eight theme screenshots inspected; 121-node map and Chinese PNG inspected; no page errors in the theme/primary editor regression checks |

Changed frontend JavaScript and Vue files pass the inherited ESLint rules.
Application changes pass `git diff --check`; the redistributed original font
license texts retain their upstream trailing spaces. The complete legacy
repository was not reformatted or subjected to a new lint gate.

## Fonts and screenshots

The bundled Noto Sans SC fallback contains all 6,763 GB2312 Han characters.
Chromium's platform-font inspection confirmed that a 13-character Simplified
Chinese fixture uses the bundled custom font rather than a Windows fallback.
Every Mappop SVG embeds both the display font and this Chinese fallback. See
[font provenance](../web/public/mappop/fonts/NotoSansSC-PROVENANCE.md).

The README images under `docs/assets/` are real browser captures, not concept
art. Updating them is explicit (`UPDATE_SCREENSHOTS=1`); routine tests and CI
write evidence into ignored test-output directories.

## Practical limits

- Testing covers Chromium on Windows and Linux CI, with an emulated mobile
  viewport. Physical iOS/Android devices and Safari/Firefox were not tested.
- The inherited Vue 2 / webpack 4 build reports dependency deprecations,
  browser-data and bundle-size warnings. The build succeeds; this release does
  not claim a framework migration or a dependency security audit.
- SVG files embed fonts and can be large. Some external SVG viewers do not
  support HTML text or all SVG filters. PNG and PDF provide a fixed appearance.
  Decorative motion is intentionally absent from exported files.
- Browser storage holds edits and the most recent pre-import backup. Export
  important work; clearing browser data removes these local copies.
- API drafts are immutable, public to anyone with the high-entropy link, and
  have no automatic expiry. Creation is limited to 100 drafts per UTC day and
  10,000 total drafts, in addition to request rate limits. The total cap needs
  operator action when reached; there is no user account or deletion UI.

See [API.md](API.md) for exact protocol and retention details.
