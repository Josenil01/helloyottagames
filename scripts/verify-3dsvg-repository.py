"""Validate directory identity, format grouping and lossless Kenney adaptation."""
import json
import shutil
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
TOOL=ROOT/'tools/3DSVG'
sys.path.insert(0,str(TOOL))
from repository import discover
from organize_kenney import build,verify

fixture=TOOL/'.cache/test-fixtures/root-folder'
for label,asset in [('Modelo A','cogumelo-blockie'),('Modelo B','cano-blockie')]:
    folder=fixture/label
    for fmt in ['GLB format','FBX format','OBJ format','Textures']:(folder/fmt).mkdir(parents=True,exist_ok=True)
    shutil.copy2(TOOL/f'Models/GLB format/{asset}.glb',folder/'GLB format/scene.glb')
    shutil.copy2(TOOL/f'Models/FBX format/{asset}.fbx',folder/'FBX format/export.fbx')
    obj=(TOOL/f'Models/OBJ format/{asset}.obj').read_text(encoding='utf-8')
    obj=obj.replace(asset+'.mtl','mesh.mtl');(folder/'OBJ format/mesh.obj').write_text(obj,encoding='utf-8')
    shutil.copy2(TOOL/f'Models/OBJ format/{asset}.mtl',folder/'OBJ format/mesh.mtl')
    for image in (TOOL/'Models/Textures').glob('*.png'):shutil.copy2(image,folder/'Textures'/image.name)
found=discover(fixture)
assert len(found)==2,found
assert {m['name'] for m in found.values()}=={'Modelo A','Modelo B'}
assert len({m['id'] for m in found.values()})==2
assert all(m['formats']==['fbx','glb','obj'] for m in found.values())
assert all(m['file'].name=='scene.glb' for m in found.values())
print('ROOT_FOLDER_OK: same filenames, different model folders; one entry per model.',flush=True)
shutil.copy2(fixture/'Modelo A/GLB format/scene.glb',fixture/'Modelo A/GLB format/alternate.glb')
assert len(discover(fixture))==2,'Variações de um mesmo modelo não podem duplicar a entrada.'

source=TOOL/'.cache/test-fixtures/kenney-source';pack=source/'kenney_fixture'
for fmt in ['GLB format','FBX format','OBJ format','Textures']:(pack/'Models'/fmt).mkdir(parents=True,exist_ok=True)
(pack/'Previews').mkdir(exist_ok=True)
for name in ['cano-blockie','cogumelo-blockie']:
    for ext,fmt in [('glb','GLB format'),('fbx','FBX format'),('obj','OBJ format'),('mtl','OBJ format')]:
        shutil.copy2(TOOL/'Models'/fmt/(name+'.'+ext),pack/'Models'/fmt/(name+'.'+ext))
    shutil.copy2(TOOL/'Preview.png',pack/'Previews'/(name+'.png'))
for image in (TOOL/'Models/Textures').glob('*.png'):shutil.copy2(image,pack/'Models/Textures'/image.name)
(pack/'License.txt').write_text('Private integration-test fixture. No license grant.',encoding='utf-8')
destination=TOOL/'.cache/test-fixtures/normalized-kenney'
result=build(source,destination);assert result['models']==2
verify(source,destination)
result=build(source,destination);assert result['models']==2
verify(source,destination)
print('ORGANIZER_OK: texture/material paths, source hashes, previews and idempotent rerun.',flush=True)
