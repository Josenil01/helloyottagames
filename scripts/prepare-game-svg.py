"""Prepare game meshes using the actual 3DSVG conversion pipeline."""
import json, re, sys, subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
TOOL=ROOT/'tools/3DSVG'
sys.path.insert(0,str(TOOL))
import server
server.BLENDER=server.find_blender()
manifest=json.loads((ROOT/'assets/visuals/manifest.json').read_text(encoding='utf-8'))
out=TOOL/'.cache/game-svg';out.mkdir(parents=True,exist_ok=True)
jobs={key:dict(value) for key,value in manifest['assets'].items() if value['pack'].startswith('kenney_')}
pirate_text='\n'.join(p.read_text(encoding='utf-8') for p in (ROOT/'Matematica Pirata').glob('*.js'))
names=set(re.findall(r'name="([\w-]+)"',pirate_text))
names.update(['patch-sand','patch-grass','patch-sand-foliage','palm-bend','crate','barrel','boat-row-small','cannon','ship-pirate-small','tower-complete-small','ship-pirate-medium','chest'])
for name in names:
    if (TOOL/'Repository/Kenney/kenney_pirate-kit'/name).is_dir():
        jobs['pirate-'+name]={'pack':'kenney_pirate-kit','model':name,'camera':[6,4,8]}
for key,name in [('sphinx','esfinge-blockie'),('sphinx-happy','esfinge-blockie-feliz'),('sphinx-sucking','esfinge-blockie-redemoinho')]:
    jobs[key]={'pack':'Hello Yotta · Blockie','model':name,'camera':[1.2,2,8]}
for key,item in jobs.items():
    folder=(TOOL/'Repository/HelloYotta'/item['model']) if key.startswith('sphinx') else TOOL/'Repository/Kenney'/item['pack']/item['model']
    # Static OBJ avoids the animated armature rest-pose envelope in this GLB.
    file=folder/('OBJ format' if key=='orc' else 'GLB format')/(item['model']+('.obj' if key=='orc' else '.glb'))
    assert file.is_file(),file
    item['source']=file.relative_to(ROOT).as_posix()
    if key in ['mirror','laptop']:item['camera']=[6,5,8]
(out/'jobs.json').write_text(json.dumps(jobs,ensure_ascii=False,indent=2),encoding='utf-8')
subprocess.run([server.BLENDER,'--background','--factory-startup','--disable-autoexec','--python',str(ROOT/'scripts/prepare-game-svg-blender.py')],check=True)
subprocess.run([server.BLENDER,'--background','--factory-startup','--disable-autoexec','--python',str(ROOT/'scripts/prepare-game-svg-details.py')],check=True)
print('READY',len(jobs),flush=True)
