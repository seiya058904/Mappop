# Changelog

## v1.4.0 — 2026-11-04

- Added eight "Signature" themes, each exploring a different axis instead of a recolor: Porcelain Blue (cloud-tablet root, concave 开光 cartouches), Dunhuang Mural (flame-finial niche, coffered mineral panels, 飞天 ribbons), Herbarium (pressed-sprig specimen sheet, kraft tags that face their stem), Tarot Arcana (arch-top cards with a sun crown), Isometric Blocks (toy bricks with studs and extruded faces), Midnight Studio (product-grade dark cards with status dots), Y2K Chrome (liquid-chrome capsule with an iridescent rim) and Morandi (framed canvas on a mat board, underlined wall labels). All 32 earlier IDs are retained.
- Added a render-time line language: optional `lineTaper` (trunk-to-twig widths per depth), `lineDash`, `lineCap`, `underline` (upstream `nodeUseLineStyle`) and declarative `gradients`. Manual line width, color and dash at any scope still win, and nothing is written to node data.
- Refined all 32 existing themes with tapered hierarchy lines and signature line patterns: running-stitch thread (Stitched Linen), dotted constellations (Celestial Atlas), dotted classic file-tree branches (Retro Desktop), trail markings (Topographic), dashed routes (Travel Tickets), construction lines (Blueprint Lab) and data streams (Cyber Neon). Vintage Editorial leaves become underlined index entries, and Zen Japan's corner mark becomes a real name seal instead of a "+"-like glyph.
- Leaf, tag and stem marks now mirror on the left side of a mindMap so they always face their parent.
- Fixed textures that use SVG paint references being silently dropped: upstream writes an unquoted CSS `url()`, so parentheses are now escaped. Glass Aurora's aurora ground now actually renders, and large glows stay inside their tiles to avoid seams.
- Raised the release assertion to at least 40 themes retaining all 32 earlier IDs; regenerated all 40 selector previews from the real editor.

## v1.3.0 — 2026-10-31

- Rebuilt all 32 art themes for stronger presence: every root is now a solid focal block, second tiers take per-branch color fills, and relationship lines are thicker and often follow their branch color. All 32 saved-theme IDs and font families are retained.
- Added render-time `secondPalette` (per-branch heading fills with one shared ink) and `branchStroke` (per-branch heading outlines). Neither writes node data; explicit user fills, borders and shapes still suppress them.
- Re-tuned palettes so the 32 themes are further apart in hue; Glass Aurora becomes a night aurora theme (nine After dark themes in total). Stained Glass gains full jewel headings, Swiss Type a red title block, Metro Transit filled route stations, Retro Desktop a teal desktop with title-bar windows.
- Made background materials visible at reading scale while staying calm at overview scale; textures remain local SVG and export-safe.
- Extended the art contract: every per-branch fill must meet 4.5:1 against its heading ink.
- Polished the editor chrome: floating rounded toolbar, sidebar and status panels with soft depth, borderless icon buttons with an accent hover, an active indicator in the right rail, pill filters, a search field with icon, lifted theme cards with visible color swatches, and matching dark mode. Fixed a duplicate-key warning when a theme's swatch colors repeat.
- Regenerated all 32 selector previews from the real editor.

## v1.2.1 — 2026-10-30

- Fixed the theme picker in landscape and short windows: at heights up to 640px, tabs, filters, cards and status share one scroll area while the title and close control remain visible.
- Added responsive regression coverage for 844×390, 667×375, 390×844 and both sides of the height breakpoint, including full-card visibility, search recovery, keyboard selection and resizing an open panel.
- Reserved the existing 480×280 preview dimensions during lazy loading and added scroll clearance for card focus rings.
- Retained raw screenshot-source hashes and added LF-normalized SHA-256 digests to make future evidence comparable across Windows and Linux checkouts.
- Run CI browser tests with two isolated workers while retaining all existing assertions and the test-before-deploy gate.

## v1.2.0 — 2026-10-30

- Added 16 independent art styles, bringing the original collection to 32 while retaining all 16 saved-theme IDs.
- Added Swiss Type, Metro Transit, Chalk Classroom, Terminal Tree, Circuit Board, Art Deco, Risograph, Memphis Play, Neo Brutalist, Retro Desktop, Stitched Linen, Clay Studio, Stained Glass, Topographic, Film Storyboard and Travel Tickets.
- Strengthened structural lines in Anime Pop, Zen Japan, Watercolor Garden, Paper Cut, Glass Aurora and Vintage Editorial; retained their quieter decorative materials.
- Added bilingual search, independent family/appearance filters, accurate counts, Chinese-first names and recoverable empty states.
- Deferred theme thumbnails until the selector opens, avoiding hidden-panel requests on first load.
- Made closed sidebars inert and restored keyboard focus to their triggers; malformed or non-object preferences now safely fall back without clearing map storage or import backups.
- Fixed immediate SVG/PNG/PDF export after a themed SMM import by waiting for fonts and stable layout, with bounded waits, cancellation and explicit font-failure recovery.
- Unified registry-driven tests and capture tools, preserving v1.1 evidence and recording all 16 before / 32 after themes in v1.2.
- Reused the existing font files, engine, Vue architecture, API and deployment workflow; no dependency versions changed.

## v1.1.0 — 2026-10-30

- Refined all eight existing art themes; retained their saved-document IDs.
- Added Watercolor Garden, Paper Cut, Ukiyo-e Print, Blueprint Lab, Bauhaus
  Geometry, Glass Aurora, Vintage Editorial and Celestial Atlas.
- Added Chinese pixel, handwriting, brush, comic and serif web fonts with
  documented licenses, glyph coverage, reproducible subsets and local fallback.
  Default theme font transfer falls from 8.03 MB to 2.57 MB (uncompressed bytes).
- Replaced illustrated preview diagrams with actual editor captures; added
  categories, bilingual names and a responsive two-column selector.
- Made geometry respect manual node/custom-theme overrides; limited filtered
  depth to title tiers and retained native SVG/PNG/PDF export.
- Added real before/after, 43-node, 121-node and mobile evidence; regression
  coverage for 16 themes, 500 nodes, rapid switching, fonts, images and geometry.
- Added a static `build-info.json` so deployed version and commit can be verified.

## v1.0.0 — 2026-10-30 (Asia/Singapore)

Initial Mappop release: eight art themes, the retained Simple mind map editor,
authenticated Markdown draft API, D1 storage, safe share-link editing, local
font exports and Cloudflare Workers deployment. Original tag remains unchanged.
