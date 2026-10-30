# Changelog

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
