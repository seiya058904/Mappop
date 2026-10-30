# Mappop artwork and fonts

## v1.2 active collection

The active thirty-two-theme collection uses original SVG geometry in `web/src/mappop/textures.js` `decorations.js` and `decoration-presets.js`. No new fonts or third-party artwork were introduced in v1.2. Its WebP previews are real editor captures from `scripts/capture-previews.cjs`. See [Chinese font provenance, coverage and licenses](fonts/ART-FONTS.md). The older assets listed below remain available for historical links but are not requested by the active theme selector.

## v1.0 legacy assets (retained)

The sixteen `theme-*-texture.svg` and `theme-*-preview.svg` files are original geometric vector artwork authored for Mappop. No franchise characters or third-party illustrations are used. Artwork follows this repository's MIT license. `web/src/mappop/textures.js` contains the same original tile sources as data URIs for reliable offline image exports.

The seven display families are redistributed unmodified from the official Google Fonts repository. The Noto Sans SC fallback is a complete, non-subsetted static 400-weight WOFF2 instance of the official variable font; its reproducible conversion is recorded in `fonts/NotoSansSC-PROVENANCE.md`. Seven families use SIL Open Font License 1.1 (`fonts/*-OFL.txt`); Permanent Marker uses Apache License 2.0 (`fonts/permanentmarker-LICENSE.txt`).

| Font | Source directory | Used by |
| --- | --- | --- |
| Silkscreen | https://github.com/google/fonts/tree/main/ofl/silkscreen | Pixel Arcade |
| Zen Maru Gothic | https://github.com/google/fonts/tree/main/ofl/zenmarugothic | Anime Pop |
| Bangers | https://github.com/google/fonts/tree/main/ofl/bangers | Toon Motion |
| Zen Old Mincho | https://github.com/google/fonts/tree/main/ofl/zenoldmincho | Zen Japan, Ink Wash |
| Caveat | https://github.com/google/fonts/tree/main/ofl/caveat | Sketchbook |
| Permanent Marker | https://github.com/google/fonts/tree/main/apache/permanentmarker | Marker Notes |
| Rajdhani | https://github.com/google/fonts/tree/main/ofl/rajdhani | Cyber Neon |
| Noto Sans SC | https://github.com/google/fonts/tree/main/ofl/notosanssc | Local Simplified Chinese fallback for all eight themes |

Fetched 2026-10-30. Font and license SHA-256 hashes are recorded in `fonts/SHA256SUMS.txt`. Fonts are served locally; no runtime Google Fonts/CDN request is made. Every art theme loads Noto Sans SC alongside its display face before rendering and embeds both font files in SVG exports. Its 30,890 Unicode mappings cover all characters in `计算机网络知识点已编辑中文`, including the five absent from the Japanese display fonts. Glyphs outside both local fonts' coverage use Microsoft YaHei / PingFang SC / sans-serif. Explicit per-node font overrides remain governed by the original editor. Rendering software that does not support SVG fonts, filters or foreignObject can fall back to system typography or flat shadows; PNG and PDF are the fixed-appearance alternatives.
