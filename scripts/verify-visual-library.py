"""Verify generated artwork, entry points and unchanged game logic."""
import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/visuals'
manifest = json.loads((OUT / 'manifest.json').read_text(encoding='utf-8'))
assert len(manifest['games']) == 40
files = [a['file'] for a in manifest['assets'].values()]
files += [g['hero'] for g in manifest['games'].values()]
for file in files:
    with Image.open(OUT / file) as image:
        assert image.mode == 'RGBA', file
        assert image.width >= 512 and image.height >= 512, file
        assert image.getchannel('A').getextrema()[0] == 0, file
for folder in manifest['games']:
    entry = ROOT / folder / ('vowel.html' if folder == 'vowel' else 'index.html')
    html = entry.read_text(encoding='utf-8-sig')
    for dependency in ['visual-assets.css', 'visual-manifest.js', 'visual-assets.js']:
        assert html.count(dependency) == 1, (folder, dependency)
baseline = json.loads((OUT / 'baseline.json').read_text(encoding='utf-8'))
checked = 0
for name, digest in baseline.items():
    if not name.endswith('.js') or name.startswith('utils/visual-'):
        continue
    assert hashlib.sha256((ROOT / name).read_bytes()).hexdigest() == digest, name
    checked += 1
print(f'OK: 40 games, {len(files)} transparent images, {checked} existing scripts unchanged.')
