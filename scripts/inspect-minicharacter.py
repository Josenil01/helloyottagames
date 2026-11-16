import bpy
from pathlib import Path
root=Path(__file__).resolve().parents[1]
file=root/'tools/3DSVG/Repository/Kenney/kenney_mini-characters/character-female-a/GLB format/character-female-a.glb'
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=str(file))
for obj in bpy.context.scene.objects:
 print('IMPORTED',obj.name,obj.type,'render',not obj.hide_render,'visible',obj.visible_get(),'scale',list(obj.scale),'dims',list(obj.dimensions),'collections',[c.name for c in obj.users_collection],flush=True)
