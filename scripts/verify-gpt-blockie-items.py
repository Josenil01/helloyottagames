"""Reimport all three new assets in FBX, GLB and OBJ and verify interchange data."""
import bpy
import json
from pathlib import Path
from mathutils import Vector

OUT=Path(__file__).resolve().parents[1]/'tools/3DSVG'
manifest=json.loads((OUT/'blockie-items-manifest.json').read_text(encoding='utf-8'))
checks=[]
for asset in manifest['assets']:
    name=asset['asset']
    expected=sorted(asset['statistics']['dimensions_m'])
    for extension,folder in [('fbx','FBX format'),('glb','GLB format'),('obj','OBJ format')]:
        bpy.ops.wm.read_factory_settings(use_empty=True)
        path=str(OUT/'Models'/folder/(name+'.'+extension))
        if extension=='fbx':bpy.ops.import_scene.fbx(filepath=path)
        elif extension=='glb':bpy.ops.import_scene.gltf(filepath=path)
        else:bpy.ops.wm.obj_import(filepath=path)
        meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
        assert len(meshes)==1,(name,extension,'mesh count')
        assert all(o.data.uv_layers and o.data.materials for o in meshes),(name,extension,'UV/material')
        images=[im for im in bpy.data.images if im.type=='IMAGE']
        assert images and all(im.size[0]>0 for im in images),(name,extension,'texture')
        assert all(len(o.data.materials)==1 for o in meshes),(name,extension,'material count')
        bounds=[o.matrix_world@Vector(v) for o in meshes for v in o.bound_box]
        dimensions=sorted(max(v[i] for v in bounds)-min(v[i] for v in bounds) for i in range(3))
        assert all(abs(a-b)<.001 for a,b in zip(dimensions,expected)),(name,extension,dimensions)
        triangles=0
        for obj in meshes:
            obj.data.calc_loop_triangles()
            triangles+=len(obj.data.loop_triangles)
        assert triangles==asset['statistics']['triangles'],(name,extension,triangles)
        checks.append({'asset':name,'format':extension,'mesh':True,'uv':True,'texture':True,
                       'dimensions':True,'triangles':triangles})
(OUT/'validation-items.json').write_text(json.dumps(checks,indent=2),encoding='utf-8')
print('ITEMS_ROUND_TRIP_OK',len(checks),'exports',flush=True)
