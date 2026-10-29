# Noto Sans SC fallback

Source: https://github.com/google/fonts/tree/main/ofl/notosanssc

Downloaded 2026-10-30 from the official Google Fonts repository:

- Font: https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf
- License: https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/OFL.txt
- Input SHA-256: `a3041811a78c361b1de50f953c805e0244951c21c5bd412f7232ef0d899af0da`
- Output: `NotoSansSC-Regular.woff2`, 4,193,396 bytes, weight 400.
- Output SHA-256: `81b7cc58fc85fae33bca0b44556314f9097c44e5dd86b518bb0701c406b2348f`

The original OFL is included as `notosanssc-OFL.txt`. The license reserves the name “Source”; the generated font family is “Noto Sans SC” and style “Regular”. No glyph subset or artwork changes were made. The variable weight axis was instantiated at 400, style names updated by FontTools, and the complete font compressed to WOFF2. The source modification timestamp is preserved for repeatable output.

Conversion used isolated temporary Python tooling in `.output/font-tools/python`: FontTools 4.68.0, Brotli 1.2.1 (and its optional Zopfli 0.4.3 dependency). This is build-time tooling only; no Python or font tooling dependency was added to the application.

Reproduce after downloading the source and installing those versions into an isolated directory:

```python
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

font = instantiateVariableFont(
    TTFont("NotoSansSC[wght].ttf", recalcTimestamp=False),
    {"wght": 400},
    inplace=True,
    updateFontNames=True,
)
font.flavor = "woff2"
font.save("NotoSansSC-Regular.woff2")
```

Validation reopened the generated WOFF2 with FontTools, checked `OS/2.usWeightClass == 400`, and inspected `getBestCmap()`: 30,890 mapped Unicode code points; none missing from `计算机网络知识点已编辑中文`. All 6,763 Chinese characters in the GB2312 Han range are also mapped (zero missing). The app loads this local font for every art theme and embeds it into exported SVG, so these characters do not depend on Windows or macOS fonts.
