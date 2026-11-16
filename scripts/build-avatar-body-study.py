"""Combine the approved head study with an original Kenney-style blocky body."""
import bpy, json, math
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
NAME='avatar-mii-kenney-01'
OUT=ROOT/'tools/3DSVG/Repository/HelloYotta'/NAME
for folder in ['GLB format','FBX format','OBJ format','Blender','Previews']:
    (OUT/folder).mkdir(parents=True,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'tools/3DSVG/Repository/HelloYotta/cabeca-mii-poligonal-01/Blender/cabeca-mii-poligonal-01.blend'))
scene=bpy.context.scene
headparts=[o for o in scene.objects if o.type=='MESH']
# Preserve the face exactly; scale uniformly and seat it above a compact body.
factor=.55
for o in headparts:
    o.location=o.location*factor+Vector((0,0,1.48))
    o.scale*=factor
def mat(name,col):
    m=bpy.data.materials.new(name);m.diffuse_color=(*col,1);m.use_nodes=True
    p=m.node_tree.nodes['Principled BSDF'];p.inputs['Base Color'].default_value=(*col,1);p.inputs['Roughness'].default_value=.85
    return m
shirt=mat('Camisa_azul',(.035,.28,.50));pants=mat('Calca_azul_escura',(.035,.065,.12));shoe=mat('Sapatos',(.045,.035,.028));sole=mat('Sola',(.19,.17,.15))
skin=bpy.data.materials['Pele']
def block(name,loc,size,material,bevel=.025):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        mod=o.modifiers.new('Chanfro_poligonal','BEVEL');mod.width=bevel;mod.segments=1
        bpy.ops.object.modifier_apply(modifier=mod.name)
    o.data.materials.append(material)
    return o
# Short box-like limbs, chamfered volumes, flat materials and broad toy-like shoes.
torso=block('Corpo_01',(0,0,1.22),(.67,.37,.62),shirt,.035)
for v in torso.data.vertices:
    if v.co.z<0:v.co.x*=.88
block('Quadril',(0,0,.875),(.55,.33,.17),pants)
block('Pescoco',(0,0,1.565),(.22,.23,.18),skin,.02)
for side in [-1,1]:
    x=side*.17
    block('Perna_L' if side<0 else 'Perna_R',(x,0,.49),(.245,.27,.67),pants,.018)
    block('Sapato_L' if side<0 else 'Sapato_R',(x,-.055,.115),(.29,.43,.19),shoe,.035)
    block('Sola',(x,-.055,.035),(.30,.44,.065),sole,.012)
    arm=block('Manga',(side*.435,0,1.34),(.22,.32,.31),shirt,.025)
    arm.rotation_euler.y=side*-.12
    block('Antebraco',(side*.46,-.005,1.095),(.17,.23,.27),skin,.025)
    block('Mao',(side*.47,-.015,.915),(.20,.255,.20),skin,.035)
bpy.ops.object.select_all(action='DESELECT')
meshes=[o for o in scene.objects if o.type=='MESH']
for o in meshes:o.select_set(True)
bpy.context.view_layer.objects.active=torso
bpy.ops.export_scene.gltf(filepath=str(OUT/'GLB format'/f'{NAME}.glb'),export_format='GLB',use_selection=True)
bpy.ops.export_scene.fbx(filepath=str(OUT/'FBX format'/f'{NAME}.fbx'),use_selection=True,object_types={'MESH'},add_leaf_bones=False,bake_anim=False,axis_forward='-Z',axis_up='Y')
bpy.ops.wm.obj_export(filepath=str(OUT/'OBJ format'/f'{NAME}.obj'),export_selected_objects=True,export_materials=True,forward_axis='NEGATIVE_Z',up_axis='Y')
cam=scene.camera;cam.data.ortho_scale=3.25
def aim():cam.rotation_euler=(Vector((0,0,1.33))-cam.location).to_track_quat('-Z','Y').to_euler()
cam.location=(3,-8,3.05);aim()
scene.cycles.samples=24
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'Blender'/f'{NAME}.blend'))
for label,loc in [('tres-quartos',(3,-8,3.05)),('frente',(0,-8,1.75))]:
    cam.location=loc;aim();scene.render.filepath=str(OUT/'Previews'/f'{label}.png');bpy.ops.render.render(write_still=True)
(OUT/'README.md').write_text('# Avatar Mii / Kenney 01\n\nUm único personagem de estudo visual: a cabeça anterior preservada e escalada uniformemente, com corpo original inspirado nos volumes compactos dos Mini Characters Kenney. Sem extração de malhas Nintendo ou Kenney. Formatos GLB, FBX, OBJ/MTL e Blender; previews transparentes frontal e três quartos. Frente: -Y no Blender. Materiais sólidos, sem texturas externas.\n\nEsta amostra é estática, sem esqueleto ou animações; não representa a implementação do sistema de rig compartilhado. O modelo anterior somente de cabeça permanece intacto.\n',encoding='utf-8')
stats={'models':1,'mesh_parts':len(meshes),'vertices':sum(len(o.data.vertices) for o in meshes),'rig':False,'head_source':'cabeca-mii-poligonal-01, uniformly scaled .55','body':'original procedural Kenney-style study'}
(OUT/'validation.json').write_text(json.dumps(stats,indent=2),encoding='utf-8')
print('BODY_STUDY_DONE',stats)
