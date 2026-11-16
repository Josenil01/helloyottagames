"""Check vector-only exports, sources, runtime paths and all 40 entry points."""
import json,re,xml.etree.ElementTree as ET
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'assets/image/SVG'
manifest=json.loads((OUT/'manifest.json').read_text(encoding='utf-8'))
views=json.loads((ROOT/'scripts/svg-front-views.json').read_text(encoding='utf-8'))['views']
jobs=json.loads((ROOT/'tools/3DSVG/.cache/game-svg/jobs.json').read_text(encoding='utf-8'))
assert set(views)==set(jobs),'Every exported mesh must have its own reviewed front.'
axes={'+X':[1,0,0],'-X':[-1,0,0],'+Z':[0,0,1],'-Z':[0,0,-1]}
for key,view in views.items():
    assert sum(a*b for a,b in zip(view['camera'],axes[view['front']]))>0,key
    if key in manifest['assets']:
        assert manifest['assets'][key]['camera']==view['camera'],key
        assert manifest['assets'][key]['front']==view['front'],key
assert len(manifest['games'])==40
svgfiles=[file for directory in ['objects','games','pirate'] for file in (OUT/directory).glob('*.svg')];assert len(svgfiles)==len(jobs)+len(manifest['games']),len(svgfiles)
total=0
for file in svgfiles:
    text=file.read_text(encoding='utf-8');tree=ET.fromstring(text)
    assert tree.attrib.get('viewBox'),file
    assert not re.search(r'<(?:image|script|foreignObject)\b|base64|NaN|Infinity',text),file
    assert not re.search(r'(?:href|url\()\s*[=\(]?\s*[\"\']?https?://',text),file
    assert any(e.tag.endswith('path') for e in tree.iter()),file
    total+=file.stat().st_size
for item in manifest['assets'].values():
    assert (OUT/item['file']).is_file(),item
    assert (ROOT/item['source']).is_file(),item
for folder,game in manifest['games'].items():
    assert (OUT/game['hero']).is_file()
    entry=ROOT/folder/('vowel.html' if folder=='vowel' else 'index.html')
    html=entry.read_text(encoding='utf-8-sig')
    for dep in ['visual-assets.css','visual-manifest.js','visual-assets.js']:assert html.count(dep)==1,(folder,dep)
code=(ROOT/'utils/visual-manifest.js').read_text(encoding='utf-8')
assert json.loads(code.split('window.HYArtwork = ',1)[1].strip().rstrip(';'))==manifest
assert 'library.base' in (ROOT/'utils/visual-assets.js').read_text(encoding='utf-8')
pirate='\n'.join(f.read_text(encoding='utf-8') for f in (ROOT/'Matematica Pirata').glob('*.js'))
names=set(re.findall(r'name="([\w-]+)"',pirate))
tracks=pirate.split('tracks: [')[1].split(']')[0];names.update(re.findall(r"'([\w-]+)'",tracks))
for name in names:assert (OUT/'pirate'/(name+'.svg')).is_file(),name
assert 'kenney_pirate-kit/Rendered/' not in pirate
report={'svgFiles':len(svgfiles),'gameCards':40,'objects':len(manifest['assets']),'pirateObjects':len(list((OUT/'pirate').glob('*.svg'))),'bytes':total,'vectorOnly':True,'sourceModelsExist':True,'gameEntryPoints':40,'generator':manifest['generator']}
report['reviewedFrontDirections']=len(views)
(OUT/'validation.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report))
