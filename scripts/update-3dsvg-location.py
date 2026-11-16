"""Update known local tooling references after the user moved 3DSVG to tools/."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
names=['prepare-game-svg.py','prepare-game-svg-blender.py','prepare-game-svg-details.py','export-game-svg.cjs','verify-game-svg.py','review-svg-fronts.cjs','set-svg-front-views.py','verify-blockie-svg.cjs','build-gpt-blockie-test.py','build-gpt-blockie-items.py','build-blockie-viewer-data.py','verify-gpt-blockie-test.py','verify-gpt-blockie-items.py','verify-3dsvg.py','verify-3dsvg-normalized.py','verify-3dsvg-repository.py','verify-3dsvg-repository-http.py']
for name in names:
 path=ROOT/'scripts'/name
 if path.is_file():
  text=path.read_text(encoding='utf-8');updated=text.replace('assets/image/3DSVG','tools/3DSVG')
  if text!=updated:path.write_text(updated,encoding='utf-8');print(name)
for path in [ROOT/'CLAUDE.md',ROOT/'docs/biblioteca-visual.md',ROOT/'assets/image/SVG/README.md']:
 text=path.read_text(encoding='utf-8');text=text.replace('assets/image/3DSVG','tools/3DSVG').replace('../3DSVG/Repository/Kenney/','../../../tools/3DSVG/Repository/Kenney/')
 path.write_text(text,encoding='utf-8')
# Cached job metadata is rebuilt from live source locations, not the old path.
cache=ROOT/'tools/3DSVG/.cache/game-svg/jobs.json'
if cache.is_file():cache.write_text(cache.read_text(encoding='utf-8').replace('assets/image/3DSVG','tools/3DSVG'),encoding='utf-8')
