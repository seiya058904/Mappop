"""Assemble unchanged real editor captures; no simulated artwork."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

root = Path(__file__).resolve().parents[1]
slugs = ['pixel-arcade', 'anime-pop', 'toon-motion', 'zen-japan', 'ink-wash', 'sketchbook', 'marker-notes', 'cyber-neon', 'watercolor-garden', 'paper-cut', 'ukiyo-e-print', 'blueprint-lab', 'bauhaus-geometry', 'glass-aurora', 'vintage-editorial', 'celestial-atlas']
# The full-size captures stay in ignored output; only small WebPs ship to users.
previews = root/'web/public/mappop/previews'
previews.mkdir(exist_ok=True)
for source in (root/'.output/theme-previews').glob('*.png'):
    im = Image.open(source).convert('RGB')
    ImageOps.pad(im, (480, 280), Image.Resampling.LANCZOS, color=im.getpixel((0, 0))).save(previews/(source.stem+'.webp'), quality=88)
for stage in ['before', 'after']:
    folder = root / f'docs/assets/v1.1/{stage}'
    items = [slug for slug in slugs if (folder/f'{slug}.png').exists()]
    if not items:
        continue
    for suffix in ['', '-detail', '-121', '-mobile', '-121-mobile', *(['-mobile-reading', '-121-detail'] if (folder/'pixel-arcade-mobile-reading.png').exists() else [])]:
        width, height = (300, 650) if 'mobile' in suffix else (600, 413)
        sheet = Image.new('RGB', (width*4, (height+24)*((len(items)+3)//4)), '#f6f4ef')
        draw = ImageDraw.Draw(sheet)
        for i, slug in enumerate(items):
            im = Image.open(folder/f'{slug}{suffix}.png').convert('RGB')
            im = im.resize((width, height), Image.Resampling.LANCZOS)
            x, y = (i%4)*width, (i//4)*(height+24)
            sheet.paste(im, (x, y))
            draw.text((x+10, y+height+5), slug, fill='#26352f')
        sheet.save(folder/f'contact-sheet{suffix}.jpg', quality=90)
    # Identical crops, no names: compare visual identities without labels.
    sheet = Image.new('RGB', (2400, 360*((len(items)+3)//4)))
    for i, slug in enumerate(items):
        im = Image.open(folder/f'{slug}.png').crop((0, 130, 1600, 1010)).resize((600, 360), Image.Resampling.LANCZOS)
        sheet.paste(im, ((i%4)*600, (i//4)*360))
    sheet.save(folder/'contact-sheet-unlabelled.jpg', quality=92)
after = root/'docs/assets/v1.1/after'
before = root/'docs/assets/v1.1/before'
if (after/'pixel-arcade.png').exists():
    for slug in slugs[:8]:
        sheet = Image.new('RGB', (1600, 570), '#f6f4ef')
        for i, stage in enumerate([before, after]):
            im = Image.open(stage/f'{slug}.png').resize((800, 550), Image.Resampling.LANCZOS)
            sheet.paste(im, (i*800, 20))
        ImageDraw.Draw(sheet).text((10, 4), 'v1.0.0 / BEFORE                                                        v1.1.0 / AFTER', fill='#26352f')
        sheet.save(after/f'{slug}-comparison.jpg', quality=92)

# Independent renderings of the actual exported files, with preserved aspect ratio.
for kind, folder in [('svg', root/'.output/export-review'), ('png', root/'.output/art-exports/after')]:
    if not (folder/'pixel-arcade.png').exists():
        continue
    sheet = Image.new('RGB', (2400, 384*4), '#f6f4ef')
    for i, slug in enumerate(slugs):
        im = Image.open(folder/f'{slug}.png').convert('RGB')
        im = ImageOps.pad(im, (600, 360), Image.Resampling.LANCZOS, color=im.getpixel((0, 0)))
        x, y = i%4*600, i//4*384
        sheet.paste(im, (x, y))
        ImageDraw.Draw(sheet).text((x+10, y+365), slug, fill='#26352f')
    sheet.save(root/f'docs/assets/v1.1/{kind}-exports.jpg', quality=92)
