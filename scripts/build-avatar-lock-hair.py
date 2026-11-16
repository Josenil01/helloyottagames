"""Same avatar, changing only its independent hair mesh."""
import bpy, math, json, hashlib
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'tools/3DSVG/Repository/HelloYotta/avatar-mii-kenney-01'
NAME='avatar-mii-kenney-cabelo-mechas-01'
OUT=BASE.parent/NAME
for d in ['GLB format','FBX format','OBJ format','Blender','Previews']:(OUT/d).mkdir(parents=True,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(BASE/'Blender/avatar-mii-kenney-01.blend'))
def fingerprint(o):
    return hashlib.sha256(repr((tuple(o.matrix_world),[tuple(v.co) for v in o.data.vertices], [tuple(p.vertices) for p in o.data.polygons])).encode()).hexdigest()
before={o.name:fingerprint(o) for o in bpy.context.scene.objects if o.type=='MESH' and o.name!='Cabelo_01'}
hair=bpy.data.objects['Cabelo_01']
# Thick angular locks with cross sections, not flat triangles or painted regions.
hair.name='Cabelo_mechas_01'
locks=[hair]
material=hair.data.materials[0]
def lock(name,root,tip,width,depth):
    root=Vector(root);tip=Vector(tip);axis=(tip-root).normalized()
    ref=Vector((0,1,0))
    if abs(axis.dot(ref))>.9:ref=Vector((1,0,0))
    u=axis.cross(ref).normalized();v=axis.cross(u).normalized()
    verts=[]
    for t,scale in [(0,.8),(.43,1)]:
        c=root.lerp(tip,t)
        for du,dv in [(-1,-1),(1,-1),(1,1),(-1,1)]:
            verts.append(tuple(c+u*du*width*scale/2+v*dv*depth*scale/2))
    verts.append(tuple(tip))
    faces=[(3,2,1,0)]
    for i in range(4):
        j=(i+1)%4;faces.append((i,j,4+j,4+i));faces.append((4+i,4+j,8))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj);mesh.materials.append(material);locks.append(obj)
# Crown and lateral silhouette.
for name,root,tip,w,d in [
 ('Topo_central',(0,.02,2.60),(.02,.06,3.12),.29,.27),
 ('Topo_esquerdo',(-.22,.03,2.53),(-.64,.10,2.97),.32,.27),
 ('Topo_direito',(.22,.04,2.53),(.69,.13,2.94),.32,.28),
 ('Lateral_esquerda',(-.36,.04,2.40),(-.86,.13,2.59),.27,.27),
 ('Lateral_direita',(.36,.04,2.40),(.86,.14,2.60),.27,.27),
 ('Nuca_esquerda',(-.30,.26,2.22),(-.64,.64,2.13),.26,.24),
 ('Nuca_direita',(.30,.26,2.22),(.64,.64,2.13),.26,.24),
 ('Traseira_alta',(0,.27,2.51),(.04,.83,2.79),.35,.31),
 ('Traseira_media',(0,.33,2.34),(0,.88,2.36),.34,.29),
 ('Traseira_baixa',(0,.30,2.20),(.04,.66,1.99),.28,.23),
 ('Franja_esquerda',(-.21,-.23,2.55),(-.34,-.58,2.21),.22,.18),
 ('Franja_direita',(.20,-.24,2.56),(.34,-.57,2.24),.22,.18),
 ('Franja_central',(-.03,-.28,2.59),(.06,-.60,2.36),.20,.17),
]:lock(name,root,tip,w,d)
bpy.ops.object.select_all(action='DESELECT')
for o in locks:o.select_set(True)
bpy.context.view_layer.objects.active=hair;bpy.ops.object.join()
hair['modular_piece']='One separate removable hair object with 13 solid polygonal locks'
assert all(fingerprint(bpy.data.objects[n])==value for n,value in before.items())
bpy.ops.object.select_all(action='DESELECT')
for o in bpy.context.scene.objects:
    if o.type=='MESH':o.select_set(True)
bpy.context.view_layer.objects.active=hair
bpy.ops.export_scene.gltf(filepath=str(OUT/'GLB format'/f'{NAME}.glb'),export_format='GLB',use_selection=True)
bpy.ops.export_scene.fbx(filepath=str(OUT/'FBX format'/f'{NAME}.fbx'),use_selection=True,object_types={'MESH'},add_leaf_bones=False,bake_anim=False,axis_forward='-Z',axis_up='Y')
bpy.ops.wm.obj_export(filepath=str(OUT/'OBJ format'/f'{NAME}.obj'),export_selected_objects=True,export_materials=True,forward_axis='NEGATIVE_Z',up_axis='Y')
scene=bpy.context.scene;cam=scene.camera;cam.data.ortho_scale=3.65
cam.location=(3,-8,3.05);cam.rotation_euler=(Vector((0,0,1.33))-cam.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'Blender'/f'{NAME}.blend'))
for label,loc in [('tres-quartos',(3,-8,3.05)),('frente',(0,-8,1.75)),('costas',(3,8,3.05)),('perfil',(8,0,2.7))]:
    cam.location=loc;cam.rotation_euler=(Vector((0,0,1.33))-cam.location).to_track_quat('-Z','Y').to_euler()
    scene.render.filepath=str(OUT/'Previews'/f'{label}.png');bpy.ops.render.render(write_still=True)
(OUT/'validation.json').write_text(json.dumps({'models':1,'non_hair_meshes_unchanged':len(before),'hair_separate':True,'rig':False},indent=2),encoding='utf-8')
(OUT/'README.md').write_text('# Avatar com cabelo volumoso\n\nMesmo personagem de avatar-mii-kenney-01. Apenas a malha separada de cabelo foi alterada, com 13 mechas s�lidas na frente, no topo, nas laterais e atr�s. Cabeça, rosto, corpo, materiais e roupas preservados. Conferência por comparação dos dados geométricos e transformações das 26 malhas restantes. Modelo estático, sem rig. GLB, FBX, OBJ/MTL e Blender; quatro vistas do mesmo modelo.\n',encoding='utf-8')
print('VOLUME_HAIR_DONE',len(before),'unchanged meshes')
