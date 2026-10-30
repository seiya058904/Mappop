"""Independent PDF raster review. Use the cached PyMuPDF/Pillow tool environment."""
import argparse
import json
from pathlib import Path
import pymupdf
from PIL import Image, ImageDraw, ImageOps

parser = argparse.ArgumentParser()
parser.add_argument('--version', required=True)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
raw = root / f'.output/art-{args.version}'
source = raw / 'exports/after'
output = raw / 'pdf-review'
output.mkdir(exist_ok=True)
expected = {'toon-motion', 'vintage-editorial', 'terminal-tree', 'glass-aurora', 'clay-studio', 'stained-glass'}
assert {p.stem for p in source.glob('*.pdf')} == expected, 'Incomplete representative PDF coverage'
sheet = Image.new('RGB', (1800, 768), '#f6f4ef')
results = []
for index, slug in enumerate(sorted(expected)):
    document = pymupdf.open(source / f'{slug}.pdf')
    assert len(document) == 1, slug
    page = document[0]
    scale = 1600 / max(page.rect.width, page.rect.height)
    pixmap = page.get_pixmap(matrix=pymupdf.Matrix(scale, scale), alpha=False)
    target = output / f'{slug}.png'
    pixmap.save(target)
    image = Image.open(target).convert('RGB')
    assert len(image.getcolors(image.width * image.height)) > 100, f'Blank PDF: {slug}'
    tile = ImageOps.pad(image, (600, 360), Image.Resampling.LANCZOS, color=image.getpixel((0, 0)))
    x, y = index % 3 * 600, index // 3 * 384
    sheet.paste(tile, (x, y))
    ImageDraw.Draw(sheet).text((x + 10, y + 365), slug, fill='#26352f')
    results.append({'slug': slug, 'pages': 1, 'raster': [image.width, image.height], 'bytes': (source / f'{slug}.pdf').stat().st_size})
    document.close()
sheet.save(root / f'docs/assets/{args.version}/pdf-exports.jpg', quality=92)
(output / 'review.json').write_text(json.dumps({'renderer': f'PyMuPDF {pymupdf.VersionBind}', 'results': results}, indent=2)+'\n')
print(f'{len(results)} single-page PDFs independently rasterized: {output}')
