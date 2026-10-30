# v1.1.0 release verification

Verified 2026-10-30, Asia/Singapore. The release extends the existing Vue 2 theme
layer; `simple-mind-map/`, API handlers, D1 schema and sharing service are unchanged.
No subagents were used under the user's working rules; visual review was performed
in this chat, not presented as an independent reviewer endorsement.

## Local gates

- Production build succeeded (Node 24 / Windows); inherited bundle-size,
  Browserslist and webpack/Vue deprecation warnings remain.
- **12 API tests + 3 art/resource tests + 17 Chromium browser tests passed.**
- Changed frontend JavaScript/Vue files pass inherited ESLint. Diff whitespace
  checks pass except original third-party license whitespace, preserved verbatim.
- GitHub Actions repeats API/art checks, build and all browser tests before its
  existing production migration/deploy step. Final CI and production verification
  are linked from the [v1.1.0 release](https://github.com/seiya058904/Mappop/releases/tag/v1.1.0).
  `build-info.json` exposes only version and commit, enabling exact deployment checks.

| Check | Evidence / outcome |
| --- | --- |
| Page identity, blank/error overlays | Mappop page and real SVG nodes; no framework error overlay in captures |
| Console health | No `pageerror` in final theme capture and regression runs |
| Same-content audit | Same 43-node, four-level Chinese/English fixture and mindMap layout; all eight old themes retained in [before](assets/v1.1/before/contact-sheet.jpg) |
| Theme distinction | [16 actual themes](assets/v1.1/after/contact-sheet.jpg), [unlabelled view](assets/v1.1/after/contact-sheet-unlabelled.jpg), per-theme before/after links in [audit](ART-AUDIT.md) |
| Selector interaction | Open Themes → category → keyboard focus/Enter → selected state + dark UI; sixteen real thumbnails load, 390px document has no horizontal overflow |
| Persistence and compatibility | All original IDs retained; switching preserves data/layout; reload restores final theme; original upstream themes and imported 121-node SMM remain functional |
| Manual styles / rich content | Custom diamond, fill, border and size, image bytes via native imgMap, associative targets and all 43 nodes preserved through 16 themes and rapid switching |
| Native editing | Keyboard insertion, rich-text edit, undo/redo, drag, layout change, Markdown import, saved reload and share-link protection retained |
| Chinese typography | All 16 themes checked with long multi-paragraph mixed labels; text stays within foreignObject bounds; CDP platform-font inspection confirms actual local custom glyphs |
| Density | 43 and 121 nodes captured desktop/mobile for every theme; 500 nodes switched through all 16, then edited, zoomed, collapsed and expanded |
| Accessibility | Default token text contrast ≥4.5:1 (body/headings), ≥3:1 (large root); keyboard focus and reduced-motion behavior tested; thin decoration is not treated as text |
| SVG | All 16 real 43-node SVGs exported, checked for node count/content and opened independently in Chromium's SVG image renderer: [contact sheet](assets/v1.1/svg-exports.jpg) |
| PNG | All 16 exported and visually compared: [contact sheet](assets/v1.1/png-exports.jpg); native pipeline retains background, local fonts and decoration |
| PDF | Toon Motion and Vintage Editorial exported; valid signatures and single-page files; independently rasterized with PyMuPDF and visually inspected |
| Resource lifecycle | One owned defs group and active font style after each switch; no leaf shadow filters, ≤26 filtered title-tier nodes on the 500-node fixture |

The first local run found an uninitialized local D1 schema (HTTP 503), resolved
by the repository's `npm run db:local`. A new content-invariance test initially
captured data before the upstream image store converted the URL to an imgMap key;
its baseline now waits for native normalization. Neither required API changes.
Independent SVG rendering also exposed subpixel text wrapping in serif themes.
The export hook adds 2px to foreignObject text bounds in the cloned SVG only,
inside existing padding. A dedicated standalone-render test checks every theme
and confirms live node geometry stays unchanged. The mobile gallery review
also fixed compressed grid rows that clipped bilingual names; each card now
keeps its natural content height, covered by a bounds assertion.
The visual review corrected a default-filled blue-grid SVG path (black triangles),
raised Paper Cut text contrast from 4.39:1, and distinguished Editorial's book-title
plate from Zen's open frame. The inherited Toon hover easing warning from the
mechanical design detector is intentional comic motion and disabled for reduced motion.

## Performance and size

Evidence: [before metrics](assets/v1.1/before/metrics.json),
[after metrics](assets/v1.1/after/metrics.json). Each 121-node re-render was measured
three times per theme on the same machine. These wall-clock samples include
120ms of deliberate capture settling and Playwright polling; they are not FPS or
pure engine CPU timings. Median old-theme values remain 182–203ms after (185–202ms
before), with no substantial regression established by this small local sample.

| Theme | Median 121-node render before → after | SVG bytes before → after |
| --- | --- | --- |
| Pixel Arcade | 187 → 203 ms | 5,696,886 → 1,685,977 |
| Anime Pop | 185 → 182 ms | 10,771,483 → 3,492,027 |
| Toon Motion | 185 → 190 ms | 5,784,997 → 2,526,444 |
| Zen Japan | 185 → 188 ms | 12,920,030 → 3,132,650 |
| Ink Wash | 202 → 187 ms | 12,924,023 → 5,706,729 |
| Sketchbook | 186 → 190 ms | 6,201,178 → 3,490,338 |
| Marker Notes | 188 → 203 ms | 5,765,103 → 2,524,714 |
| Cyber Neon | 189 → 186 ms | 6,181,264 → 1,411,415 |

The default font pair falls **8,026,152 → 2,565,616 bytes (68% less)**. Recorded
first-screen encoded resource bodies fall **8,103,890 → 4,458,307 bytes**; local
first-ready samples are 903 → 749ms, provided as observations, not a benchmark
claim from one navigation. New first-visit theme changes ranged 188–374ms for
these eight; they share font caches and must not be described as eight cold loads.
The main editor bundle rises about 14 KiB uncompressed / 4.2 KiB gzip; framework
bundles are unchanged. SVGs across all sixteen range 1.38–5.71 MB with active
fonts embedded. Legacy full font files remain available but are not requested.

For repeatable switch evidence beyond one sample, `scripts/measure-live-art.cjs`
warms the original eight themes then measures three full 121-node switch rounds
on production. [v1.0 production measurements](assets/v1.1/before/live-performance.json)
are committed; post-deployment measurements are attached to the release, avoiding
an unrelated post-verification source edit. Browser navigation uses the same proxy.

## Evidence and reproduction

```
npm test
npm run build
npm run db:local
npm run test:e2e
# With the local server running:
node scripts/capture-art.cjs --exports
node scripts/capture-previews.cjs
uv run --with pillow python scripts/art-contact-sheets.py
node scripts/review-exports.cjs
```

[43-node detail](assets/v1.1/after/contact-sheet-detail.jpg) ·
[121-node overview](assets/v1.1/after/contact-sheet-121.jpg) ·
[121-node detail](assets/v1.1/after/contact-sheet-121-detail.jpg) ·
[390px overview](assets/v1.1/after/contact-sheet-mobile.jpg) ·
[390px zoomed reading](assets/v1.1/after/contact-sheet-mobile-reading.jpg)

Capture scripts are explicit artifact-writing commands. Routine tests and CI use
ignored `test-results/`. Full SVG/PNG/PDF exports are packaged as a release asset;
font provenance is in [ART-FONTS.md](../web/public/mappop/fonts/ART-FONTS.md).

## Limits

- Chromium on Windows and Linux CI; 390px emulation. Physical phones and Safari/
  Firefox are not certified. A full 121-node/500-node map still requires zoom,
  pan or collapse; fit-to-canvas is an overview. Zoomed images intentionally show
  only part of the map.
- Local subsets cover GB2312, not every rare/traditional character. Pixel's 116
  missing GB2312 glyphs use bundled Sans. Beyond the local subset, platform fonts
  remain the fallback. User-selected external fonts retain upstream export limits.
- Some third-party SVG viewers do not implement HTML foreignObject or embedded
  fonts; PNG/PDF are fixed-appearance alternatives. Glass uses SVG gradients,
  not real browser backdrop blur. Watercolor/ink are lightweight vector materials.
- Per-node user overrides can intentionally change contrast/appearance. Default
  tokens meet text contrast checks; this is not a full application WCAG audit.
- No framework migration, dependency refresh, independent security audit, AI/API
  rewrite or product-scope expansion was performed. See the retained v1.0 notes
  below for storage and public-share limitations.

---

# v1.0.0 verification archive

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
