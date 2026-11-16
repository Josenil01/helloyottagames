"""Same avatar, changing only its independent hair mesh."""
import bpy, math, json, hashlib
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'tools/3DSVG/Repository/HelloYotta/avatar-mii-kenney-01'
NAME='avatar-mii-kenney-cabelo-volumoso-01'
OUT=BASE.parent/NAME
for d in ['GLB format','FBX format','OBJ format','Blender','Previews']:(OUT/d).mkdir(parents=True,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(BASE/'Blender/avatar-mii-kenney-01.blend'))
def fingerprint(o):
    return hashlib.sha256(repr((tuple(o.matrix_world),[tuple(v.co) for v in o.data.vertices], [tuple(p.vertices) for p in o.data.polygons])).encode()).hexdigest()
before={o.name:fingerprint(o) for o in bpy.context.scene.objects if o.type=='MESH' and o.name!='Cabelo_01'}
hair=bpy.data.objects['Cabelo_01']
# Keep the hairline seated on the head, expanding the crown and back.
# The original cap has one apex followed by nine 32-vertex rings.
for v in hair.data.vertices:
    ring=0 if v.index==0 else (v.index-1)//32+1
    t=ring/9
    w=math.sin(math.pi*t)**.7
    v.co.x*=1+.23*w
    v.co.y*=1+.18*w
    v.co.z+=.30*(1-t)**1.1
    # Broad swept quiff, integrated into this one removable hair object.
    if ring>0:
        a=2*math.pi*((v.index-1)%32)/32
        front=max(0,-math.sin(a))
        v.co.z+=.22*front*w*(.75+.25*math.cos(a))
        v.co.x+=.09*front*w
hair.name='Cabelo_volumoso_01'
hair['modular_piece']='Independent removable hair mesh; head unchanged'
assert all(fingerprint(bpy.data.objects[n])==value for n,value in before.items())
bpy.ops.object.select_all(action='DESELECT')
for o in bpy.context.scene.objects:
    if o.type=='MESH':o.select_set(True)
bpy.context.view_layer.objects.active=hair
bpy.ops.export_scene.gltf(filepath=str(OUT/'GLB format'/f'{NAME}.glb'),export_format='GLB',use_selection=True)
bpy.ops.export_scene.fbx(filepath=str(OUT/'FBX format'/f'{NAME}.fbx'),use_selection=True,object_types={'MESH'},add_leaf_bones=False,bake_anim=False,axis_forward='-Z',axis_up='Y')
bpy.ops.wm.obj_export(filepath=str(OUT/'OBJ format'/f'{NAME}.obj'),export_selected_objects=True,export_materials=True,forward_axis='NEGATIVE_Z',up_axis='Y')
scene=bpy.context.scene;cam=scene.camera
cam.location=(3,-8,3.05);cam.rotation_euler=(Vector((0,0,1.33))-cam.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'Blender'/f'{NAME}.blend'))
for label,loc in [('tres-quartos',(3,-8,3.05)),('frente',(0,-8,1.75))]:
    cam.location=loc;cam.rotation_euler=(Vector((0,0,1.33))-cam.location).to_track_quat('-Z','Y').to_euler()
    scene.render.filepath=str(OUT/'Previews'/f'{label}.png');bpy.ops.render.render(write_still=True)
(OUT/'validation.json').write_text(json.dumps({'models':1,'non_hair_meshes_unchanged':len(before),'hair_separate':True,'rig':False},indent=2),encoding='utf-8')
(OUT/'README.md').write_text('# Avatar com cabelo volumoso\n\nMesmo personagem de avatar-mii-kenney-01. Apenas a malha separada de cabelo foi alterada, com maior volume na coroa e topete lateral. Cabeça, rosto, corpo, materiais e roupas preservados. Conferência por comparação dos dados geométricos e transformações das 26 malhas restantes. Modelo estático, sem rig. GLB, FBX, OBJ/MTL e Blender; duas vistas do mesmo modelo.\n',encoding='utf-8')
print('VOLUME_HAIR_DONE',len(before),'unchanged meshes')
