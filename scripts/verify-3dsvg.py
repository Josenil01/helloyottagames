"""Integration checks for catalogue discovery and real Blender conversions."""
import importlib.util
import json
import struct
import subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
TOOL=ROOT/'tools/3DSVG'
spec=importlib.util.spec_from_file_location('threedsvg_server',TOOL/'server.py')
server=importlib.util.module_from_spec(spec);spec.loader.exec_module(server)
server.BLENDER=server.find_blender()
assert server.BLENDER
catalog=server.scan()
assert len(catalog)>4000
assert len({m['pack'] for m in catalog.values()})>=45
cases=[
 'kenney_pirate-kit/Models/GLB format/ship-pirate-medium.glb',
 'kenney_cube-pets_1.0/Models/OBJ format/animal-bee.obj',
 'kenney_space-kit/Models/FBX format/craft_cargoA.fbx',
 '3DSVG/Models/Blender/cogumelo-blockie.blend',
 '3DSVG/Models/FBX format/cano-blockie.fbx',
]
for relative in cases:
    packet=server.convert(ROOT/'assets/image'/relative)
    assert packet['triangles']>0
    assert len(packet['positions'])==len(packet['normals'])==len(packet['colours'])
    assert len(packet['indices'])==packet['triangles']*3
    assert packet['radius']==1
    assert all(0<=c<=1 for c in packet['colours'])
    assert len({tuple(packet['colours'][i:i+3]) for i in range(0,len(packet['colours']),3)})>1,relative
    print('CONVERT_OK',Path(relative).suffix,packet['triangles'],packet['label'],flush=True)

# Real GLTF with an external BIN dependency, derived from a known valid GLB.
fixture=TOOL/'.cache/test-fixtures';fixture.mkdir(parents=True,exist_ok=True)
binary=(TOOL/'Models/GLB format/cano-blockie.glb').read_bytes();offset=12;chunks={}
while offset<len(binary):
    size,kind=struct.unpack_from('<II',binary,offset);chunks[kind]=binary[offset+8:offset+8+size];offset+=size+8
gltf=json.loads(chunks[0x4E4F534A]);gltf['buffers'][0]['uri']='pipe.bin'
(fixture/'pipe.bin').write_bytes(chunks[0x004E4942]);(fixture/'pipe.gltf').write_text(json.dumps(gltf),encoding='utf-8')
packet=server.convert(fixture/'pipe.gltf');assert packet['triangles']==156
print('CONVERT_OK .gltf external BIN',packet['triangles'],flush=True)

# A deliberately detailed mesh exercises the opt-in simplification path.
blend=fixture/'dense.blend'
if not blend.exists():
    script=fixture/'make_dense.py'
    script.write_text('import bpy\nbpy.ops.wm.read_factory_settings(use_empty=True)\nbpy.ops.mesh.primitive_grid_add(x_subdivisions=90,y_subdivisions=90,size=2)\nbpy.ops.wm.save_as_mainfile(filepath='+repr(str(blend))+')\n',encoding='utf-8')
    subprocess.run([server.BLENDER,'--background','--factory-startup','--python',str(script)],check=True,capture_output=True)
packet=server.convert(blend,True);assert packet['sourceTriangles']>6000 and packet['triangles']<=6500 and packet['simplified']
print('SIMPLIFICATION_OK',packet['sourceTriangles'],'to',packet['triangles'],flush=True)
print('CATALOG_OK',len(catalog),'models',len({m['pack'] for m in catalog.values()}),'packs',flush=True)
