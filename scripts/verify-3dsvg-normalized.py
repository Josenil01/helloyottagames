"""Load representative assets from the adapted per-model Kenney repository."""
import json
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1];TOOL=ROOT/'tools/3DSVG'
sys.path.insert(0,str(TOOL));import server
server.BLENDER=server.find_blender()
destination=TOOL/'Repository/Kenney'
manifest=json.loads((destination/'repository-manifest.json').read_text(encoding='utf-8'))
samples=[]
for pack,name in [('kenney_pirate-kit','ship-pirate-medium'),('kenney_cube-pets_1.0','animal-bee'),
                  ('kenney_food-kit',None),('kenney_furniture-kit',None),('kenney_space-kit','craft_cargoA'),('kenney_nature-kit',None)]:
    item=next(m for m in manifest['entries'] if m['pack']==pack and (not name or m['name']==name))
    samples.append(item)
checks=[]
for item in samples:
    folder=destination/item['folder']
    for ext,format_folder in [('glb','GLB format'),('obj','OBJ format'),('fbx','FBX format')]:
        if ext!='glb' and item['pack'] not in ['kenney_cube-pets_1.0','kenney_space-kit']:continue
        file=next((folder/format_folder).glob('*.'+ext))
        packet=server.convert(file,model_root=folder)
        assert packet['triangles']>0 and len(packet['positions'])==len(packet['colours'])
        assert not any('não encontrada' in w for w in packet['warnings']),packet['warnings']
        checks.append({'model':item['name'],'pack':item['pack'],'format':ext,'triangles':packet['triangles'],'missingTextures':False})
        print('NORMALIZED_MODEL_OK',item['pack'],item['name'],ext,packet['triangles'],flush=True)
report={'models':manifest['models'],'packs':manifest['packs'],'samples':checks,'blenderProjectsCreated':0}
(TOOL/'.cache/test-fixtures/normalized-conversion-test.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print('NORMALIZED_CONVERSION_OK',len(checks),'loads from independent model folders.',flush=True)
