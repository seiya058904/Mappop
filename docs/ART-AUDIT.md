# Mappop visual audit

## v1.3.0: "Vivid" rebuild of all 32 themes

Baseline: clean `main` at `1a58f471`. The before stage was captured from a build of
that commit's sources; the after stage from the candidate working tree. Both use the
same 43-node fixture, `mindMap` layout, 1600×1100 desktop and 390×844 mobile views.
The [candidate manifest](assets/v1.3/after/metrics.json) records SHA-256 hashes of
the five visual source modules.

**Finding.** v1.2 deliberately favored restraint. At overview scale about half the
themes had a root nearly the same color as the canvas, unfilled or low-saturation
headings, thin grey relationship lines and textures too faint to read, so many
thumbnails looked alike.

**Direction.** Each theme keeps its stable ID, type family and core silhouette, but:

- the root is always a solid, high-contrast focal block with one signature mark;
- second tiers take per-branch fills from `secondPalette` (all sharing one ink that
  meets 4.5:1), or per-branch outlines via `branchStroke`;
- relationship lines are 0.4–1px heavier and many follow `branchPalette`;
- palettes were re-tuned to spread the 32 themes across hue; Glass Aurora became a
  night theme;
- textures are visible at reading scale. The worst-composited-pixel line test still applies.

Evidence: [32 before/after comparisons](assets/v1.3/after/) (`*-comparison.jpg`),
[labelled](assets/v1.3/after/contact-sheet.jpg) and
[unlabelled](assets/v1.3/after/contact-sheet-unlabelled.jpg) sheets,
[80% details](assets/v1.3/after/contact-sheet-detail.jpg),
[121-node](assets/v1.3/after/contact-sheet-121.jpg) and
[mobile reading](assets/v1.3/after/contact-sheet-mobile-reading.jpg) views,
independent [SVG](assets/v1.3/svg-exports.jpg) and [PNG](assets/v1.3/png-exports.jpg)
exports, and the [selector](assets/v1.3/theme-selector.png) /
[390px selector](assets/v1.3/theme-selector-mobile.png).

Review notes from iteration: Stitched Linen's root cross-stitches read as close
buttons and were removed; Swiss Type leaf dashes looked like rendering glitches and
were removed; Zen Japan's tiled ring and Ink Wash's filled mist band produced visible
stripes and were replaced; the Watercolor sprig moved off heading text; Glass Aurora
headings were tinted per branch after looking grey.

## v1.2.0: 32 complete themes

Baseline: clean `main` at `1a6fc63662aba0cb9c5ef97e783680e99117aa22`,
matching origin/main, GitHub main and the live v1.1.0 build. The baseline below
was captured before changing theme sources. Historical v1.1 evidence is retained.
The candidate [manifest](assets/v1.2/after/metrics.json) records that base commit,
`working-tree-candidate` and SHA-256 hashes of all five visual source modules;
it does **not** claim the uncommitted candidate was already deployed.

The result keeps the Vue 2/editor architecture, all sixteen original IDs, the
upstream theme groups, seven local type families and existing document semantics.
Sixteen new SVG treatments bring the art collection to 32, with no new dependency,
remote image, font download or layout engine. [Theme specifications](THEMES.md)
record geometry, typography, materials, closest relatives, family and appearance.

### Evidence and review

All themes use the same 43-node, four-level bilingual fixture and `mindMap`
layout, desktop 1600×1100 and mobile 390×844. Fit images show the complete tree;
detail images hold the zoom at 80% and can extend beyond the viewport. The
seven-node selector thumbnails use a separate, identical small fixture and
`logicalStructure` layout, photographed from the editor and converted to WebP.
Neither fixture is rewritten for a more flattering theme composition.

- Actual editor: [32 labelled](assets/v1.2/after/contact-sheet.jpg),
  [32 unlabelled](assets/v1.2/after/contact-sheet-unlabelled.jpg),
  [80% details](assets/v1.2/after/contact-sheet-detail.jpg),
  [121-node overview](assets/v1.2/after/contact-sheet-121.jpg),
  [121-node details](assets/v1.2/after/contact-sheet-121-detail.jpg),
  [mobile reading views](assets/v1.2/after/contact-sheet-mobile-reading.jpg).
- Independent exports: [32 SVG](assets/v1.2/svg-exports.jpg),
  [32 PNG](assets/v1.2/png-exports.jpg), [six PDF](assets/v1.2/pdf-exports.jpg).
  These come from exported files, not editor screenshots substituted for exports.
- Readable originals: [Swiss type](assets/v1.2/after/swiss-type-detail.png),
  [circuit density](assets/v1.2/after/circuit-board-121-detail.png),
  [matte clay](assets/v1.2/after/clay-studio-detail.png),
  [stained-glass corners](assets/v1.2/after/stained-glass-detail.png).
- Selector: [desktop](assets/v1.2/theme-selector.png),
  [390px](assets/v1.2/theme-selector-mobile.png); see [QA](QA.md) for interaction gates.

The review inspected the original sixteen first, all sixteen additions together,
then the full 32-theme unlabelled/labelled sheets, density details and exported
images. Serif glass contours, circuit density and clay PDF shading were also
inspected at readable sizes. The frontend-design and Impeccable craft guidance
informed this pass; the mechanical detector returned no findings on the scoped
components. Automated checks are evidence for function, not an aesthetic rating.
No subagents or independent-reviewer claims are used.

### Original sixteen: retain identity, improve weak relationships

The existing contours and Chinese type systems already work. Six themes needed
stronger structural lines over their actual texture, rather than new identities.
Zen and Editorial also gain 1.25px lines from 1px. Default text colors remain;
the new test samples every composited texture pixel for the 3:1 relationship-line
floor. Anime measured 2.92:1 at its worst pixel before its final correction.

| Original theme | Real before/after | Decision |
| --- | --- | --- |
| Pixel Arcade | [Compare](assets/v1.2/after/pixel-arcade-comparison.jpg) | Keep Chinese pixel type, stair steps and hierarchy |
| Anime Pop | [Compare](assets/v1.2/after/anime-pop-comparison.jpg) | Darker mauve links; retain sakura panels and pen lettering |
| Toon Motion | [Compare](assets/v1.2/after/toon-motion-comparison.jpg) | Keep integrated balloons and readable compact comic type |
| Zen Japan | [Compare](assets/v1.2/after/zen-japan-comparison.jpg) | Darker, slightly thicker rules; retain open serif leaves |
| Ink Wash | [Compare](assets/v1.2/after/ink-wash-comparison.jpg) | Keep brush silhouettes and dry strokes |
| Sketchbook | [Compare](assets/v1.2/after/sketchbook-comparison.jpg) | Keep pencil double contours and ruled open leaves |
| Marker Notes | [Compare](assets/v1.2/after/marker-notes-comparison.jpg) | Keep clipped headings, tape and light highlighter leaves |
| Cyber Neon | [Compare](assets/v1.2/after/cyber-neon-comparison.jpg) | Keep asymmetric terminals and restrained title glow |
| Watercolor Garden | [Compare](assets/v1.2/after/watercolor-garden-comparison.jpg) | Darker green links; preserve botanical wash edges |
| Paper Cut | [Compare](assets/v1.2/after/paper-cut-comparison.jpg) | Darker brown links; preserve offset paper layers |
| Ukiyo-e Print | [Compare](assets/v1.2/after/ukiyo-e-print-comparison.jpg) | Keep keyline cartouches and waves |
| Blueprint Lab | [Compare](assets/v1.2/after/blueprint-lab-comparison.jpg) | Keep dimension marks, technical frames and grid |
| Bauhaus Geometry | [Compare](assets/v1.2/after/bauhaus-geometry-comparison.jpg) | Keep disc/semicircle hierarchy and direct links |
| Glass Aurora | [Compare](assets/v1.2/after/glass-aurora-comparison.jpg) | Darker slate links; preserve opal gradients |
| Vintage Editorial | [Compare](assets/v1.2/after/vintage-editorial-comparison.jpg) | Stronger sepia rules; preserve letterpress title plate |
| Celestial Atlas | [Compare](assets/v1.2/after/celestial-atlas-comparison.jpg) | Keep orbital frames and sparse stars |

### New sixteen: differences beyond color

Swiss Type uses bold baselines and open typography where Editorial uses a serif
book-title plate. Metro uses rounded station outlines, junction rings and stable
branch colors; Circuit instead uses square components, pins and solder-pad leaves.
Chalk has open chalk brackets and playful writing; Terminal has command prompts,
directory brackets and no leaf boxes. Neither is Cyber's framed neon terminal.

Art Deco uses stepped double frames and vertical ornament rather than Atlas's
orbits. Risograph offsets ink keylines without doubling text; Memphis uses slanted
blocks and playful dots; Neo Brutalist uses square heavy rules and hard shadows.
Retro Desktop has restrained bevels and window-title strips, without fake buttons
or Pixel's game lettering. Linen uses seams on flat cloth labels; Clay uses opaque
rounded matte relief. Stained Glass has hard jewel corners and lead-like borders,
distinct from Aurora's opal panels. Topographic uses map cartouches and contour
lines, Film uses frame edges and sprocket marks, and Tickets uses notches and
perforations. All simplify their deeper leaves and keep text on clear surfaces.
The chosen sixteen needed no substitutions or extra themes.

Mechanisms, not borrowed artwork, informed the comparison: Xmind's
[shape/line controls](https://xmind.com/user-guide/skeleton-new), MindNode's
[hierarchical themes](https://www.mindnode.com/support/guides/themes), Coggle's
[branch weight guidance](https://coggle.help/article/58-adjust-the-thickness-and-style-of-branches),
and W3C's [non-text contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast).
The implementations and deterministic SVG motifs are original repository assets.

### Reproduction

Use an isolated local editor and local D1. Dependencies were already installed;
no lockfile dependency versions changed. The explicit version argument prevents
accidentally writing the previous release's output directory.

```sh
npm test
npm run build
npm run db:local
npm run dev
npm run test:e2e
node scripts/capture-art.cjs --version v1.2 --exports
node scripts/capture-previews.cjs --version v1.2
node scripts/measure-live-art.cjs --version v1.2
node scripts/measure-art-startup.cjs --version v1.2
node scripts/review-exports.cjs --version v1.2
uv run --offline --with pymupdf --with pillow python scripts/review-art-pdf.py --version v1.2
python scripts/art-contact-sheets.py --version v1.2
```

`--baseline` was used on the **unmodified sixteen-theme build** before this work;
running it now would not recreate the historical baseline. The new registry helper
must be paired with the source being captured. Bulk originals and 70 exported files
remain in ignored `.output/art-v1.2`; compressed sheets, a few clear originals,
metrics and reproduction scripts are committed. The selected six export triplets
are delivered in the release ZIP. No dependency cache or standalone full font set
is added to that package. [QA](QA.md) documents remaining viewing limitations.

## Archived v1.1 visual audit

Baseline: `23e8c018af739dc766f3e8435114c359b70e1da5`, clean `main`, origin/main 0/0.
Mappop release `v1.0.0` confirmed through `gh release list -R seiya058904/Mappop`;
the matching main Actions deployment succeeded. Production returned HTTP 200.
`upstream` remains wanglin2/mind-map, with push disabled; history and MIT notices remain.

## Reproducible evidence

`tests/fixtures/art-map.cjs` supplies the same 43 nodes (four levels, Chinese,
English, punctuation and long phrases) and the existing 121-node Chinese network
fixture. Every theme uses `mindMap` layout and the same data. Fit-to-canvas may
change scale because font metrics and spacing differ. Detail images use 80%.

Run the unmodified build and `node scripts/capture-art.cjs --baseline --exports`.
Run the updated build and `node scripts/capture-art.cjs --exports`.
Assemble unchanged captures with `uv run --with pillow python scripts/art-contact-sheets.py`.
Desktop: 1600×1100; mobile: 390×844; Chromium; reduced motion.
The Browser plugin is not available; repository Playwright is used as requested.

[Old 8-theme overview](assets/v1.1/before/contact-sheet.jpg) ·
[Old typography details](assets/v1.1/before/contact-sheet-detail.jpg) ·
[Old 121-node density](assets/v1.1/before/contact-sheet-121.jpg) ·
[Old mobile views](assets/v1.1/before/contact-sheet-mobile.jpg)

## Baseline observations and direction

| Theme | Keep | Concrete issue in real renders | Upgrade target |
| --- | --- | --- | --- |
| Pixel Arcade | Stair-stepped outlines, orthogonal branches, gold root | [Detail](assets/v1.1/before/pixel-arcade-detail.png): Latin pixels and smooth Chinese are visibly different; the 64px grid competes with small outlines. Leaf/heading framing is nearly identical. | Chinese pixel face; double-step title frame; quieter grid, clearer title tiers. |
| Anime Pop | Light sakura, curved connections, rounded leaves | [Detail](assets/v1.1/before/anime-pop-detail.png): repeated capsules feel generic; tiny sparkle is lost in the full map; mixed Japanese/Chinese font coverage changes stroke texture within phrases. | Consistent Chinese handwriting, panel-like branch headings, restrained printed dots and sakura corners. |
| Toon Motion | Speech tails, confident outlines | [43 nodes](assets/v1.1/before/toon-motion.png): saturated yellow fills the viewport; 22px body/26px headings and thick shadows compete in dense branches. Chinese is plain sans next to dramatic Latin. | Comic Chinese face, integrated balloon contour, softer ground, smaller body text and fewer filtered nodes. |
| Zen Japan | Quiet thin orthogonal connections, rice-paper palette | [Detail](assets/v1.1/before/zen-japan-detail.png): framed grey-green rectangles and shadows resemble Ink Wash. Seals on every leaf become punctuation noise. | Unboxed leaves, fine branch rules, title-only vermilion seal, Chinese serif and wider breathing room. |
| Ink Wash | Flowing branches, restrained stamp | [Detail](assets/v1.1/before/ink-wash-detail.png): ordinary framed rectangles with two small accent strokes do not read as ink. Shares serif and grey-green hierarchy with Zen. | Chinese brush calligraphy, irregular ink title/branch silhouettes, dry lower strokes and open leaves. |
| Sketchbook | Notebook ground, pencil double contours | [Detail](assets/v1.1/before/sketchbook-detail.png): only Latin is handwritten; Chinese at 25px looks unusually rigid and large. Uniform filled boxes overpower the pencil linework. | Chinese pen-handwriting, open leaf underlines, irregular double contours on headings, lighter horizontal rules. |
| Marker Notes | Peach/lime/yellow grouping, tape and folded corner | [43 nodes](assets/v1.1/before/marker-notes.png): every leaf is a yellow rectangular card; tape loses meaning by repeating everywhere. | Tape on title tiers only, clipped paper headings, broad uneven highlighter leaves, unified playful Chinese. |
| Cyber Neon | Restrained teal, technical paths, dark canvas | [Detail](assets/v1.1/before/cyber-neon-detail.png): same framed-node rhythm as Pixel; every leaf glows, reducing edge precision. | Asymmetric terminal cuts, small hardware marks, sparse larger circuitry, glow only on title tiers. |

For all eight: the 121-node fit view becomes a tall, tiny overview; no claim is
made that all labels can be read simultaneously. Mobile fit views are navigation
overviews, requiring zoom/pan for reading. Retain layout and editing behavior.
The former font pipeline embeds a full 4.19 MB Chinese fallback plus the display
font in each SVG (Zen's extra display font is 5.44 MB). All baseline SVG/PNG
exports are retained locally in `.output/art-exports/before`; sizes and three
121-node render timings per theme are recorded in the committed metrics JSON.

The initial capture runner revealed that immediately replacing the tree during
a responsive resize can overlap upstream renders (164 DOM nodes for 121 data
nodes). Captures now wait for viewport settling before replacing fixtures. This
does not change application code or conceal an editor test failure.


## Final comparison and bounded review

[Sixteen-theme overview](assets/v1.1/after/contact-sheet.jpg) ·
[Unlabelled comparison](assets/v1.1/after/contact-sheet-unlabelled.jpg) ·
[121-node detail](assets/v1.1/after/contact-sheet-121-detail.jpg) ·
[390px reading views](assets/v1.1/after/contact-sheet-mobile-reading.jpg) ·
[Desktop selector](assets/v1.1/theme-selector.png) ·
[Mobile selector](assets/v1.1/theme-selector-mobile.png)

The review used an original-eight pass, a full-sixteen pass and a final export/UI
pass. It did not equate automated assertions with aesthetic approval.

| Original theme | Actual before/after | Visible result |
| --- | --- | --- |
| Pixel Arcade | [Compare](assets/v1.1/after/pixel-arcade-comparison.jpg) | Chinese pixel strokes, stepped title tiers, quieter grid |
| Anime Pop | [Compare](assets/v1.1/after/anime-pop-comparison.jpg) | Chinese handwriting, sakura panel headings, rounded light leaves |
| Toon Motion | [Compare](assets/v1.1/after/toon-motion-comparison.jpg) | Integrated balloons, softer yellow, tighter comic Chinese typography |
| Zen Japan | [Compare](assets/v1.1/after/zen-japan-comparison.jpg) | Open leaves, fine rules, serif Chinese and title-only seal |
| Ink Wash | [Compare](assets/v1.1/after/ink-wash-comparison.jpg) | Brush Chinese, dark irregular ink root, dry lower strokes |
| Sketchbook | [Compare](assets/v1.1/after/sketchbook-comparison.jpg) | Chinese pen handwriting, double pencil headings, open ruled leaves |
| Marker Notes | [Compare](assets/v1.1/after/marker-notes-comparison.jpg) | Title-tier tape, cut paper, uneven highlighter leaves |
| Cyber Neon | [Compare](assets/v1.1/after/cyber-neon-comparison.jpg) | Asymmetric terminal cuts, hardware accents, title-only glow |

Pairwise review keeps Zen's fine open serif system separate from Ink's brush
silhouettes; Sketchbook's pen outlines separate from Marker's filled highlighter
strips; Pixel's square Chinese glyphs and stair steps separate from Cyber's cut
terminals and thin technical type. Editorial was revised to a dark book-title
plate so it no longer resembles Zen's open title. Watercolor uses botanical
pigment contours while Paper Cut uses angular layers and offset backing; Ukiyo-e
uses indigo/vermilion keylines and waves; Blueprint uses dimension marks and a
quiet grid; Bauhaus uses circles/semicircles and open leaves; Glass uses exportable
opal gradients; Atlas uses fine orbital frames and stars.

Concrete final corrections included Blueprint's accidentally filled grid path,
Paper Cut's body contrast, serif SVG text rounding and compressed selector rows.
[QA](QA.md) records assertions, performance samples and remaining limitations.
The paper/ink/glass treatments are lightweight vector interpretations, not
photorealistic material simulations. All compositions remain native editable maps.
