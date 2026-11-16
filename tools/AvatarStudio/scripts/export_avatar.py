"""Blender worker: one static mesh/material, no duplicate rigs or animation clips."""
import bpy, sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]
out=Path(sys.argv[sys.argv.index('--')+1]).resolve()
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(root/'library/base.glb'))
meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
assert len(meshes)==1
obj=meshes[0]
assert len(obj.data.materials)==1
image=bpy.data.images.load(str(out/'Textures/atlas.png'))
mat=obj.data.materials[0]
for node in mat.node_tree.nodes:
    if node.type=='TEX_IMAGE':node.image=image;node.interpolation='Linear'
bpy.ops.object.select_all(action='DESELECT')
obj.select_set(True);bpy.context.view_layer.objects.active=obj
for folder in ['GLB format','FBX format','OBJ format','Blender']:(out/folder).mkdir(exist_ok=True)
bpy.ops.export_scene.gltf(filepath=str(out/'GLB format/avatar.glb'),export_format='GLB',use_selection=True,export_animations=False)
bpy.ops.export_scene.fbx(filepath=str(out/'FBX format/avatar.fbx'),use_selection=True,object_types={'MESH'},path_mode='COPY',embed_textures=True,bake_anim=False)
bpy.ops.wm.obj_export(filepath=str(out/'OBJ format/avatar.obj'),export_selected_objects=True,path_mode='RELATIVE')
image.pack()
bpy.ops.wm.save_as_mainfile(filepath=str(out/'Blender/avatar.blend'))
