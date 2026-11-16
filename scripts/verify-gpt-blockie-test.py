"""Blender round-trip import check for the Blockie test asset."""
import bpy
import json
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'tools/3DSVG'
checks = []
for extension, folder in [('fbx','FBX format'), ('glb','GLB format'), ('obj','OBJ format')]:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    path = str(OUT / 'Models' / folder / ('cogumelo-blockie.' + extension))
    if extension == 'fbx':
        bpy.ops.import_scene.fbx(filepath=path)
    elif extension == 'glb':
        bpy.ops.import_scene.gltf(filepath=path)
    else:
        bpy.ops.wm.obj_import(filepath=path)
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
    assert meshes, extension
    assert all(obj.data.uv_layers for obj in meshes), extension
    assert all(obj.data.materials for obj in meshes), extension
    images = [image for image in bpy.data.images if image.type == 'IMAGE']
    assert images and all(image.size[0] > 0 for image in images), extension
    bounds = [obj.matrix_world @ Vector(v) for obj in meshes for v in obj.bound_box]
    dimensions = sorted(max(v[i] for v in bounds) - min(v[i] for v in bounds) for i in range(3))
    assert all(abs(a-b) < 0.01 for a,b in zip(dimensions, [1.56,1.586,1.92])), (extension, dimensions)
    checks.append({'format':extension, 'meshes':len(meshes), 'uv':True,
                   'materials':True, 'textures_loaded':len(images), 'dimensions_sorted':dimensions})
(OUT / 'validation.json').write_text(json.dumps(checks,indent=2),encoding='utf-8')
print('ROUND_TRIP_OK',json.dumps(checks),flush=True)
