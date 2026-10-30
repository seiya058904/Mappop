# Chinese art fonts, v1.1

These are locally hosted **web-only WOFF2 subsets**, derived under SIL OFL 1.1.
New family names (`Mappop …`) avoid reserved-name ambiguity. Copyright and OFL
notices are unchanged and shipped beside the fonts. The repository MIT license
does not replace them. No font service is contacted by the browser.

| Local web family | Original / pinned official source | License |
| --- | --- | --- |
| Mappop Pixel | [Fusion Pixel 12px proportional, Simplified Chinese, 2026.10.25](https://github.com/TakWolf/fusion-pixel-font/releases/tag/2026.10.25), `fusion-pixel-font-12px-proportional-ttf.woff2-v2026.10.25.zip` | `fusion-pixel-OFL.txt`; constituent `fusion-ark-pixel-OFL.txt`, `fusion-cubic-11-OFL.txt`, `fusion-galmuri-LICENSE.txt` |
| Mappop Hand | [LXGW WenKai Regular, db34daf](https://github.com/lxgw/LxgwWenKai/blob/db34daf997d8f38e3f5595db0a56e00368d1323f/fonts/TTF/LXGWWenKai-Regular.ttf) | `wenkai-OFL.txt` |
| Mappop Comic | [ZCOOL KuaiLe](https://github.com/google/fonts/tree/6157dfaa640ca5738b4d1a7070fe389c3036d7fc/ofl/zcoolkuaile) | `zcoolkuaile-OFL.txt` |
| Mappop Brush | [Ma Shan Zheng](https://github.com/google/fonts/tree/6157dfaa640ca5738b4d1a7070fe389c3036d7fc/ofl/mashanzheng) | `mashanzheng-OFL.txt` |
| Mappop Serif | [Noto Serif SC, weight 400](https://github.com/google/fonts/tree/6157dfaa640ca5738b4d1a7070fe389c3036d7fc/ofl/notoserifsc) | `notoserifsc-OFL.txt` |
| Mappop Sans (CSS alias Noto Sans SC) | Existing local [Noto Sans SC static 400](NotoSansSC-PROVENANCE.md) | `notosanssc-OFL.txt` |
| Mappop Tech | Existing local Rajdhani Semibold, Latin display only | `rajdhani-OFL.txt` |

`art-font-manifest.json` records source/output SHA-256, exact output sizes and
glyph coverage. Reproduce with `scripts/prepare-art-fonts.py` (FontTools 4.68.0,
Brotli 1.2.1 in this run), using the pinned sources above in `.output/font-sources`.
The script preserves timestamps, instantiates Serif at 400, selects all 6,763
GB2312 Han characters plus Latin, punctuation and arrows, and renames families.
Glyphs are never redrawn. Only web subsets are distributed under the new names.

Hand, Comic, Brush, Serif and Sans each cover all 6,763 GB2312 Han characters.
Pixel lacks **116** (listed verbatim in the manifest); the local Sans companion
covers them. Beyond these subsets, Windows/macOS/system sans fonts are the final
fallback. Full rare/traditional-character coverage is not claimed. Explicit user
font overrides retain the upstream behavior and are not automatically embedded.

Chromium's `CSS.getPlatformFontsForNode` verifies actual local glyph use in the
16-theme multilingual test, rather than merely checking that a font downloaded.

The initial Anime theme loads Hand + Sans: **2,565,616 bytes**, versus the former
Zen Maru Gothic + full Noto Sans SC **8,026,152 bytes**. The largest new pair,
Brush + Sans, is 4,224,556 bytes and only loads when selected. One cached promise
and FontFace per family serve subsequent switches. SVG includes only the active
pair; PNG/PDF use the same embedded SVG. Typography is prepared before UI theme
application; imported themes queue one remeasure when their font is ready.

Legacy full fonts and their notices remain at their existing URLs for historic
asset links. The 1.1 theme selector does not request them.
