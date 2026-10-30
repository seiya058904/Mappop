"""Build web-only GB2312 subsets; source downloads live in .output/font-sources.
Run: uv run --with fonttools --with brotli python scripts/prepare-art-fonts.py
Original licenses and source hashes are retained; no desktop font is distributed.
"""
import hashlib
import json
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools import subset

root = Path(__file__).resolve().parents[1]
dest = root / 'web/public/mappop/fonts'
source = root / '.output/font-sources'
chars = set(range(0x20, 0x100)) | set(range(0x2000, 0x2070)) | set(range(0x3000, 0x3040)) | set(range(0xff00, 0xffef)) | {0x2192, 0x2190, 0x2713}
han = set()
for first in range(0xb0, 0xf8):
    for second in range(0xa1, 0xff):
        try:
            han.add(ord(bytes([first, second]).decode('gb2312')))
        except UnicodeDecodeError:
            pass
chars |= han
jobs = [
    (source/'fusion/fusion-pixel-12px-proportional-zh_hans.ttf.woff2', 'Mappop Pixel', None),
    (source/'LXGWWenKai-Regular.ttf', 'Mappop Hand', None),
    (source/'ZCOOLKuaiLe-Regular.ttf', 'Mappop Comic', None),
    (source/'MaShanZheng-Regular.ttf', 'Mappop Brush', None),
    (source/'NotoSerifSC.ttf', 'Mappop Serif', 400),
    (dest/'NotoSansSC-Regular.woff2', 'Mappop Sans', None),
    (dest/'Rajdhani-SemiBold.ttf', 'Mappop Tech', None),
]
report = []
for file, family, weight in jobs:
    font = TTFont(file, recalcTimestamp=False)
    if weight:
        font = instantiateVariableFont(font, {'wght': weight}, inplace=True, updateFontNames=True)
    options = subset.Options()
    options.flavor = 'woff2'
    options.recalc_timestamp = False
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=chars)
    subsetter.subset(font)
    # New names avoid reserved font-name ambiguity for modified subsets.
    for record in font['name'].names:
        if record.nameID in (1, 2, 3, 4, 6, 16, 17):
            value = 'Regular' if record.nameID in (2, 17) else family.replace(' ', '') if record.nameID == 6 else family
            record.string = value.encode(record.getEncoding())
    font.flavor = 'woff2'
    out = dest / (family.replace(' ', '') + '.woff2')
    font.save(out)
    cmap = TTFont(out).getBestCmap()
    report.append({'family': family, 'file': out.name, 'bytes': out.stat().st_size, 'sourceSHA256': hashlib.sha256(file.read_bytes()).hexdigest(), 'sha256': hashlib.sha256(out.read_bytes()).hexdigest(), 'gb2312Missing': ''.join(chr(c) for c in sorted(han-set(cmap))) if family != 'Mappop Tech' else 'Latin display face; Sans companion', 'glyphs': len(cmap)})
    print(f'{family}: {out.stat().st_size:,} bytes; {len(cmap)} codepoints')
(dest/'art-font-manifest.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
