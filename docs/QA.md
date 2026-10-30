# Release verification

## v1.2.1 candidate verification

Verified locally on 2026-10-30, Windows / Chromium at `http://127.0.0.1:8787`.
The Browser plugin was unavailable; the existing Playwright suite was used.
Impeccable adapt/polish guided the scoped layout and visual checks.

- Reproduced the original 844×390 defect: the list was 18px high, with an approximately 184px card. The new full-card clipping assertion failed against that build.
- At heights up to 640px the theme sidebar body owns scrolling. Measured scrollports are 236px at 844×390 and 221px at 667×375; the header and close control stay visible. A 560px breakpoint was insufficient for narrow English layouts, so both sides of 640px are covered.
- Seven added browser cases cover Chinese at 844×390, 667×375, 390×844, 1440×640 and 1440×641, plus English at 844×390 and 390×641. They assert first/last-card visibility, status access, search and empty-state recovery, all 32 cards via native Tab, keyboard selection, orientation changes and keyboard closing with focus restoration.
- All 34 existing browser cases passed on the final application build. The seven new cases initially failed at their final Escape step because applying a theme disables the focused card. The tests now explicitly focus the close control and press Enter; all seven passed separately in 30.9s. Final CI runs the combined 41-test suite before deployment.
- `npm test`: 12 API and 5 resource/provenance tests passed. Production build, scoped Theme.vue ESLint, script syntax checks and `git diff --check` passed. The Impeccable detector reported no findings on the scoped component; rendered light/dark, portrait/landscape and classic-theme checks also passed with no observed page errors.
- Preview dimensions are reserved before lazy images arrive, and cards have scroll clearance for focus rings. Screenshot inspection confirmed readable names and descriptions through the last theme. No new fonts, art assets or dependencies were introduced.
- Future capture manifests retain raw hashes and add `sourcesLfSha256`; first-screen evidence adds `themePickerSourceLfSha256`. Tests distinguish real content changes from CRLF/LF differences. All five current art modules also matched their Git blob after LF normalization. Historical evidence was not rewritten or recaptured.
- CI uses two workers across independent spec files, preserving all assertions and isolated browser contexts. Actual CI duration, deployed revision and production results are recorded in the [v1.2.1 release](https://github.com/seiya058904/Mappop/releases/tag/v1.2.1).

Limits: browser viewport emulation, not physical iOS/Android devices or Safari/Firefox. Existing bundle-size, Browserslist and Node deprecation warnings remain. This patch does not revise Stained Glass/Memphis artwork or regenerate the historical 70-file export audit.

## v1.2.0 candidate verification

Verified locally on 2026-10-30, Windows / Node 24 / Chromium. Base:
`1a6fc63662aba0cb9c5ef97e783680e99117aa22`. All visual sources are hashed in the
[candidate manifest](assets/v1.2/after/metrics.json). The [v1.2.0 release](https://github.com/seiya058904/Mappop/releases/tag/v1.2.0)
records the final CI run, deployed full SHA and read-only production results after
commit, avoiding an endless documentation-only redeploy cycle.

### Gates and risk matrix

- `npm test`: **12 API + 4 art/resource tests pass**. The art gate independently
  requires at least 32 IDs, all original 16 IDs and real font/preview/texture assets.
- Production build and scoped frontend ESLint pass. Existing bundle-size,
  Browserslist and webpack warnings remain; no dependencies were upgraded.
- The complete local browser run passed **33 tests in 3.5 minutes**. A later
  race/manual-line-color test brings the final suite to **34**; the changed long
  multilingual-label and race tests passed together. The final thumbnail-loading
  change passed eight affected checks, including search and three responsive-sidebar flows.
  The final CI runs all 34 together before deployment; its status is in the release.
- Only local D1 migrations and isolated browser contexts were used for write tests.
  The API implementation, D1 schema, editor engine and production documents are unchanged.

| Area | Actual coverage and result |
| --- | --- |
| Visual completeness | All 32 themes: 43-node desktop/mobile, fixed 80% detail, 121-node overview and reading detail; [audit](ART-AUDIT.md) includes original-16 comparisons |
| Editing/data | All 32 traversed with stable node IDs, notes, links, rich text, images, associative targets, custom shapes/styles and layout; native editing, drag, undo/redo, SMM/Markdown import and saved reload retained |
| Large maps | All 32 on the 500-node fixture; no node loss, editing/zoom/collapse/expand work; at most 26 title-tier filters and one owned defs/font style after switching |
| Chinese typography | Long paragraphs, Chinese/English, punctuation, numbers, traditional Chinese, a rare glyph and emoji; all 32 fit their text bounds; CDP confirms local Chinese fonts for the covered subset |
| SVG/PNG | 32 actual 43-node pairs; independent SVG DOM bounds plus image-renderer decoding; [results](assets/v1.2/export-review.json), [SVG sheet](assets/v1.2/svg-exports.jpg), [PNG sheet](assets/v1.2/png-exports.jpg) |
| PDF | Toon, Editorial, Terminal, Aurora, Clay and Stained Glass; six single pages independently rasterized with PyMuPDF 2.0 and visually reviewed; [results](assets/v1.2/pdf-review.json), [sheet](assets/v1.2/pdf-exports.jpg) |
| Selector | Chinese/English/keyword search, five families separate from light/dark, truthful counts including eight dark themes, empty-state reset, all cards reachable; 1440px, 768px and 390×844px flows |
| Focus | Closed sidebars are inert and hidden from Tab navigation; 24 successive Tabs checked; close button and Escape return focus to the opener |
| Slow font/import export | Fresh context, delayed uncached Serif, import then immediate SVG/PNG; resulting bytes equal a subsequent ready export; toolbar download follows the same barrier |
| Failure/cancellation | Blocked font gives fallback status and a clear image-export error while SMM remains saveable; newer theme, AbortSignal and bounded timeout cancel waits |
| Preferences | Invalid JSON, array, null, string, number and boolean config values recover without losing the 43-node saved document, pre-import backup or unrelated storage |
| Theme compatibility | Unknown saved theme falls back without losing content; delayed picker cannot override a newer theme; Metro honors manual/global line colors |
| Contrast | Body text ≥4.5:1, large root text ≥3:1; all 32 relationship palettes ≥3:1 against the worst composited texture pixel; nonstructural decoration excluded |
| Requests | Hidden theme picker now creates no preview images; a fresh first screen makes **zero** preview requests, and opening the selector loads real thumbnails |

Before the fix, importing a serif theme with a delayed font and immediately
exporting returned in 53.7ms with **zero nodes and no embedded Serif**; a later
export contained the font. A shared bounded readiness barrier now covers direct
and toolbar SVG/PNG/PDF calls after font preparation and layout. Failed fonts are
not silently represented as portable successful exports. A separate baseline
reproduction showed corrupt preferences could leave zero editor nodes while the
backup still existed; guarded object parsing repairs this without clearing storage.
Tests also found and corrected Anime's 2.92:1 worst texture-pixel line contrast.
No speculative security or data-loss defect is claimed beyond these reproductions.

### Performance: small samples, explicit methods

Before/after use the same Windows machine and Chromium, 121 nodes. Three render
samples measure `reRender()` to `node_tree_render_end` **inside the page**, excluding
capture sleeps and file downloads. Warm switches use one warmup and three rounds,
`setTheme()` to two stable animation frames. They include browser scheduling and
layout, not only engine CPU. Original [before](assets/v1.2/before/switch-performance.json)
and [after](assets/v1.2/after/switch-performance.json) samples are retained.

| Theme | Median 121-node render before → after (ms) | Warm switch before → after (ms) |
| --- | --- | --- |
| Pixel Arcade | 65.7 → 72.7 | 88.5 → 113.5 |
| Anime Pop | 60.8 → 62.4 | 112.9 → 113.2 |
| Toon Motion | 66.1 → 62.3 | 98.6 → 89.1 |
| Zen Japan | 74.8 → 61.0 | 79.3 → 84.5 |
| Ink Wash | 82.8 → 62.4 | 106.8 → 117.0 |
| Sketchbook | 69.0 → 66.9 | 80.0 → 84.6 |
| Marker Notes | 77.7 → 65.0 | 80.7 → 84.9 |
| Cyber Neon | 90.6 → 69.8 | 109.9 → 118.3 |
| Watercolor Garden | 88.3 → 68.1 | 107.0 → 112.4 |
| Paper Cut | 78.9 → 67.2 | 86.4 → 84.6 |
| Ukiyo-e Print | 79.2 → 66.3 | 84.4 → 87.6 |
| Blueprint Lab | 70.6 → 68.3 | 105.2 → 116.2 |
| Bauhaus Geometry | 88.0 → 71.9 | 104.9 → 113.9 |
| Glass Aurora | 89.5 → 74.3 | 89.3 → 93.6 |
| Vintage Editorial | 80.9 → 70.5 | 85.1 → 89.9 |
| Celestial Atlas | 102.5 → 68.6 | 107.7 → 112.8 |

The sixteen additions range from 73.5–97.3ms median render and 86.6–118.9ms warm
switch. Pixel's initial **+28.2%** switch signal triggered a bounded investigation,
not an assertion of stable regression or a replacement of the original samples.
The collection loops have different predecessors (Atlas versus Tickets). Five
interleaved samples with the same Atlas predecessor compared the still-live
v1.1.0 baseline against the local candidate on the same machine: **75.9ms versus
74.3ms**, one render-end in every sample, no new page errors. A stable additional
render/workload was not reproduced. This follow-up used different serving origins,
already-warm fonts and only GET/HEAD requests. [Raw investigation](assets/v1.2/switch-investigation.json)
records those limits; `profile-art-switch.cjs --version v1.2 --baseline-url URL`
reproduces the method when a matching old deployment is available.

### Resources and first screen

The main editor chunk grows from **3187.07 to 3211.99 KiB raw** (1117.68 to
1125.32 KiB gzip); its CSS grows from **280.60 to 282.65 KiB** (131.47 to
131.74 KiB gzip). The vendor chunk is unchanged. Existing font binary bytes and
licenses are unchanged; a few documentation bytes explain the new failure behavior.
All WebP previews total **120,632 → 229,728 bytes**, sixteen to thirty-two images.

The original capture pass observed 4,461,556 → 4,578,705 encoded response-body
bytes: all 32 thumbnails were still fetched despite native `loading="lazy"` on
the hidden sidebar. Creating those images only while the theme panel is open fixes
the cause. The final [fresh-context measurement](assets/v1.2/after/first-screen-final.json)
records **4,349,041 bytes and zero preview requests**, about 2.5% below baseline.
Only the default Hand + Sans art fonts load, alongside the existing icon fonts;
theme expansion does not download seven families up front.

Cold default-map readiness was 715ms before, 856ms in the first candidate capture,
and 802ms in the final targeted check. These single observations include font
network/loading, automation and 120ms settling, and the candidate adds a readiness
barrier. They are **not** comparable pure CPU benchmarks or universal startup
claims. Per-theme `firstVisitSwitchMs` also includes capture settling and shared
font caches; it is not a cold-font benchmark for every theme. Warm-switch results
above are separate. [Resource breakdown](assets/v1.2/resource-sizes.json).

### Limits and release procedure

This machine has Chromium; Firefox/WebKit are not installed and were not tested.
390px is an emulated viewport, not an Android/iOS device. Dense fit views remain
navigation overviews; users zoom/pan/collapse to read. GB2312 subsets do not cover
all Chinese; traditional/rare characters and emoji can use platform fallback.
SVG retains editable vector shapes plus `foreignObject` and embedded fonts, whose
support varies by viewer. PNG and PDF preserve a fixed appearance; PDF is the
existing raster export pipeline, not a claim of editable vector PDF text.

Final publication uses the existing main Actions workflow only. Verify the final
run, full SHA in `/build-info.json`, real theme/filter/thumbnail/font/export UI and
GitHub README rendering. Production checks use isolated contexts and read-only
requests, never the POST-creating API smoke/E2E suite. The release carries those
post-commit results and a small selected export ZIP. Local ignored bulk evidence
and previous font/source/backup material are retained; cleanup is exact-file only.

## Archived v1.1.0 release verification

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
