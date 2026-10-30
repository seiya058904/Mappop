"""Assemble real captures, with registry/manifest completeness checks. Never invent art."""
import argparse, json, math, subprocess, shutil
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

parser = argparse.ArgumentParser()
parser.add_argument('--version', required=True)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
raw = root / f'.output/art-{args.version}'
docs = root / f'docs/assets/{args.version}'
slugs = json.loads(subprocess.check_output(['node', '-e', "console.log(JSON.stringify(require('./scripts/art-registry.cjs').slugs))"], cwd=root))
docs.mkdir(parents=True, exist_ok=True)
preview_source = raw / 'previews'
if preview_source.exists():
    assert {p.stem for p in preview_source.glob('*.png')} == set(slugs), 'Incomplete preview captures'
    previews = root / 'web/public/mappop/previews'
    for slug in slugs:
        im = Image.open(preview_source/f'{slug}.png').convert('RGB')
        ImageOps.pad(im, (480, 280), Image.Resampling.LANCZOS, color=im.getpixel((0, 0))).save(previews/f'{slug}.webp', quality=88)

manifests = {}
for stage in ['before', 'after']:
    folder = raw / stage
    if not (folder/'metrics.json').exists():
        continue
    manifest = json.loads((folder/'metrics.json').read_text())
    items = manifest['slugs']
    assert set(items) == set(manifest['themes']), f'{stage}: missing metrics'
    if stage == 'after':
        assert items == slugs, 'After evidence does not match the current registry'
    manifests[stage] = manifest
    target = docs / stage
    target.mkdir(exist_ok=True)
    (target/'metrics.json').write_text(json.dumps(manifest, indent=2)+'\n')
    if (folder/'switch-performance.json').exists():
        shutil.copy2(folder/'switch-performance.json', target/'switch-performance.json')
    suffixes = ['', '-detail', '-121', '-mobile', '-121-mobile']
    if stage == 'after': suffixes += ['-mobile-reading', '-121-detail']
    for suffix in suffixes:
        width, height = (300, 650) if 'mobile' in suffix else (600, 413)
        sheet = Image.new('RGB', (width*4, (height+24)*math.ceil(len(items)/4)), '#f6f4ef')
        draw = ImageDraw.Draw(sheet)
        for i, slug in enumerate(items):
            source = folder/f'{slug}{suffix}.png'
            assert source.exists(), f'Missing {source}'
            im = Image.open(source).convert('RGB').resize((width, height), Image.Resampling.LANCZOS)
            x, y = i%4*width, i//4*(height+24)
            sheet.paste(im, (x, y))
            draw.text((x+10, y+height+5), slug, fill='#26352f')
        sheet.save(target/f'contact-sheet{suffix}.jpg', quality=88)
    sheet = Image.new('RGB', (2400, 360*math.ceil(len(items)/4)))
    for i, slug in enumerate(items):
        im = Image.open(folder/f'{slug}.png').crop((0, 130, 1600, 1010)).resize((600, 360), Image.Resampling.LANCZOS)
        sheet.paste(im, (i%4*600, i//4*360))
    sheet.save(target/'contact-sheet-unlabelled.jpg', quality=90)

if 'after' in manifests:
    # Keep a few readable originals; the full capture set stays in ignored output.
    for name in ['anime-pop.png', 'swiss-type-detail.png', 'circuit-board-121-detail.png', 'clay-studio-detail.png', 'stained-glass-detail.png']:
        shutil.copy2(raw/'after'/name, docs/'after'/name)
    featured = ['ink-wash', 'swiss-type', 'circuit-board', 'clay-studio']
    sheet = Image.new('RGB', (1600, 980), '#f6f4ef')
    for index, slug in enumerate(featured):
        im = Image.open(raw/'previews'/f'{slug}.png').convert('RGB')
        tile = ImageOps.pad(im, (800, 464), Image.Resampling.LANCZOS, color=im.getpixel((0, 0)))
        x, y = index%2*800, index//2*490
        sheet.paste(tile, (x, y))
        ImageDraw.Draw(sheet).text((x+14, y+470), slug, fill='#26352f')
    sheet.save(docs/'featured.jpg', quality=92)
    for source, target in [(raw/'switch-investigation.json', docs/'switch-investigation.json'), (raw/'export-review/review.json', docs/'export-review.json'), (raw/'pdf-review/review.json', docs/'pdf-review.json')]:
        if source.exists(): shutil.copy2(source, target)

if 'before' in manifests and 'after' in manifests:
    for slug in manifests['before']['slugs']:
        assert slug in manifests['after']['slugs'], f'Lost original theme: {slug}'
        sheet = Image.new('RGB', (1600, 570), '#f6f4ef')
        for i, stage in enumerate(['before', 'after']):
            im = Image.open(raw/stage/f'{slug}.png').resize((800, 550), Image.Resampling.LANCZOS)
            sheet.paste(im, (i*800, 20))
        ImageDraw.Draw(sheet).text((10, 4), f'BEFORE: {manifests["before"]["sourceCommit"][:12]}                                              AFTER: {args.version}', fill='#26352f')
        sheet.save(docs/'after'/f'{slug}-comparison.jpg', quality=90)

for kind, folder in [('svg', raw/'export-review'), ('png', raw/'exports/after')]:
    if not folder.exists(): continue
    assert {p.stem for p in folder.glob('*.png')} >= set(slugs), f'Incomplete {kind} review'
    sheet = Image.new('RGB', (2400, 384*math.ceil(len(slugs)/4)), '#f6f4ef')
    for i, slug in enumerate(slugs):
        im = Image.open(folder/f'{slug}.png').convert('RGB')
        im = ImageOps.pad(im, (600, 360), Image.Resampling.LANCZOS, color=im.getpixel((0, 0)))
        x, y = i%4*600, i//4*384
        sheet.paste(im, (x, y))
        ImageDraw.Draw(sheet).text((x+10, y+365), slug, fill='#26352f')
    sheet.save(docs/f'{kind}-exports.jpg', quality=90)
print(f'Evidence: {docs}; registry: {len(slugs)}; stages: {list(manifests)}')
