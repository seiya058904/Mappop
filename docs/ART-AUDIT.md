# Mappop 1.1 visual audit

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
