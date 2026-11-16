import bpy
from pathlib import Path
root=Path(__file__).resolve().parents[1];folder=root/'tools/3DSVG/Repository/Kenney/kenney_mini-characters/character-female-d'
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=str(folder/'GLB format/character-female-d.glb'))
for o in bpy.context.scene.objects:
 if o.type=='ARMATURE':
  for b in o.pose.bones:print('BONE',b.name,tuple(b.head),tuple(b.tail))
 if o.type=='MESH' and o.visible_get():print('MESH',o.name,'bounds',[tuple(v) for v in o.bound_box])
