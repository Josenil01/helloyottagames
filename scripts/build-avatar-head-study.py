"""One original polygonal Mii-inspired head study; run with Blender background."""
import bpy, math, json
from pathlib import Path
from mathutils import Vector

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'tools/3DSVG/Repository/HelloYotta/cabeca-mii-poligonal-01'
for d in ['GLB format','FBX format','OBJ format','Blender','Previews']:
    (OUT/d).mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
def mat(name,c):
    m=bpy.data.materials.new(name); m.diffuse_color=(*c,1); m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*c,1); p.inputs['Roughness'].default_value=.83
    return m
skin=mat('Pele',(0.67,.39,.23)); hair=mat('Cabelo',(.055,.026,.017)); dark=mat('Olhos',(.022,.016,.014)); mouth=mat('Boca',(.19,.055,.028)); white=mat('Brilho',(.95,.94,.88))
parts=[]
def ell(name,loc,scale,material,segments=24,rings=16):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,location=loc)
    o=bpy.context.object; o.name=name; o.scale=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    o.data.materials.append(material)
    for f in o.data.polygons:f.use_smooth=False
    parts.append(o); return o
# Face front is -Y. Broad upper head, gently tapered jaw and short Mii-like chin.
head=ell('Cabeca_01',(0,0,1.2),(.80,.66,1.0),skin,32,20)
for v in head.data.vertices:
    z=v.co.z
    if z<-.15:v.co.x*=1-.20*min(1,(-z-.15)/.75)
ell('Orelha_L',(-.79,.015,1.19),(.15,.13,.245),skin,12,8)
ell('Orelha_R',(.79,.015,1.19),(.15,.13,.245),skin,12,8)
for x in [-.285,.285]:
    ell('Olho_L' if x<0 else 'Olho_R',(x,-.625,1.30),(.078,.045,.117),dark,12,8)
    ell('Brilho_olho',(x-.018,-.666,1.337),(.018,.009,.025),white,8,6)
    brow=ell('Sobrancelha',(x,-.608,1.535),(.155,.034,.032),hair,12,6)
    brow.rotation_euler.y=(-.10 if x<0 else .10)
# Small angular projecting nose, rather than a realistic human nose.
verts=[(-.09,-.61,1.21),(.09,-.61,1.21),(-.085,-.63,1.04),(.085,-.63,1.04),(0,-.84,1.075)]
me=bpy.data.meshes.new('Nariz');me.from_pydata(verts,[],[(0,1,4),(1,3,4),(3,2,4),(2,0,4),(0,2,3,1)]);me.update()
o=bpy.data.objects.new('Nariz_01',me);bpy.context.collection.objects.link(o);me.materials.append(skin);parts.append(o)
def line(name,points,r,material):
    c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.bevel_depth=r;c.bevel_resolution=0;c.resolution_u=1
    s=c.splines.new('POLY');s.points.add(len(points)-1)
    for p,co in zip(s.points,points):p.co=(*co,1)
    o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);o.data.materials.append(material)
    bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');o.select_set(False);parts.append(o)
line('Boca_01',[(-.19,-.596,.88),(-.10,-.632,.825),(0,-.646,.81),(.10,-.632,.825),(.19,-.596,.88)],.018,mouth)
# A single faceted hair cap with a shaped hairline, leaving the forehead visible.
n=32; levels=9;vs=[(0,.015,2.245)];fs=[]
for j in range(1,levels+1):
    for i in range(n):
        a=2*math.pi*i/n
        front=max(0,-math.sin(a))
        edge=1.67-.53*front
        # asymmetric side part at the forehead
        edge+=.10*front*math.cos(a)
        t=(j/levels)*edge
        vs.append((.825*math.sin(t)*math.cos(a),.015+.69*math.sin(t)*math.sin(a),1.2+1.045*math.cos(t)))
for i in range(n):fs.append((0,1+i,1+(i+1)%n))
for j in range(levels-1):
    for i in range(n):
        a=1+j*n+i;b=1+j*n+(i+1)%n;fs.append((a,a+n,b+n,b))
me=bpy.data.meshes.new('Cabelo_01');me.from_pydata(vs,[],fs);me.update();o=bpy.data.objects.new('Cabelo_01',me);bpy.context.collection.objects.link(o);me.materials.append(hair);parts.append(o)
bpy.ops.object.select_all(action='DESELECT')
for o in parts:o.select_set(True)
bpy.context.view_layer.objects.active=head
name='cabeca-mii-poligonal-01'
bpy.ops.export_scene.gltf(filepath=str(OUT/'GLB format'/f'{name}.glb'),export_format='GLB',use_selection=True)
bpy.ops.export_scene.fbx(filepath=str(OUT/'FBX format'/f'{name}.fbx'),use_selection=True,object_types={'MESH'},add_leaf_bones=False,bake_anim=False,axis_forward='-Z',axis_up='Y')
bpy.ops.wm.obj_export(filepath=str(OUT/'OBJ format'/f'{name}.obj'),export_selected_objects=True,export_materials=True,forward_axis='NEGATIVE_Z',up_axis='Y')
scene=bpy.context.scene
world=bpy.data.worlds.new('Studio');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.65,.72,.85,1);world.node_tree.nodes['Background'].inputs[1].default_value=.4;scene.world=world
def aim(o):o.rotation_euler=(Vector((0,0,1.2))-o.location).to_track_quat('-Z','Y').to_euler()
for loc,power,size in [((-3,-4,6),450,4),((4,-2,3),220,4),((1,3,5),350,3)]:
    bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.data.energy=power;o.data.shape='DISK';o.data.size=size;aim(o)
bpy.ops.object.camera_add(location=(2.5,-7,2.6));cam=bpy.context.object;cam.data.type='ORTHO';cam.data.ortho_scale=2.85;aim(cam);scene.camera=cam
scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=True
scene.render.resolution_x=1000;scene.render.resolution_y=1000;scene.render.resolution_percentage=100;scene.render.film_transparent=True
scene.view_settings.view_transform='AgX'
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'Blender'/f'{name}.blend'))
for label,loc in [('tres-quartos',(2.5,-7,2.6)),('frente',(0,-7,1.5))]:
    cam.location=loc;aim(cam);scene.render.filepath=str(OUT/'Previews'/f'{label}.png');bpy.ops.render.render(write_still=True)
stats={'models':1,'mesh_parts':len(parts),'vertices':sum(len(o.data.vertices) for o in parts),'polygons':sum(len(o.data.polygons) for o in parts),'front':'-Y','rig':None,'purpose':'visual head study only; no body or duplicate skeleton','source':'original procedural geometry; Mii-inspired facial proportions'}
(OUT/'validation.json').write_text(json.dumps(stats,indent=2),encoding='utf-8')
(OUT/'README.md').write_text('# Cabeça Mii poligonal 01\n\nUm único modelo de estudo visual: cabeça e rosto com proporções inspiradas nos Miis e superfícies facetadas. Geometria própria, sem extrair assets Nintendo. Partes separadas para futura personalização. Frente: -Y no Blender. Sem corpo, esqueleto ou animações; não representa ainda uma peça integrada ao rig compartilhado.\n\nFormatos: GLB, FBX, OBJ/MTL e projeto Blender. Previews transparentes frontal e três quartos representam o mesmo modelo. Materiais de cores sólidas; não há texturas externas necessárias.\n',encoding='utf-8')
print('HEAD_STUDY_DONE',stats)
