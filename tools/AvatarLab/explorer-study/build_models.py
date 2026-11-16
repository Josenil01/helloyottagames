import bpy,math,json
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parent
variants=['sorridente','apaixonado','surpreso']
bpy.ops.wm.read_factory_settings(use_empty=True)
mat=bpy.data.materials.new('Atlas_unico');mat.use_nodes=True
shader=mat.node_tree.nodes.get('Principled BSDF');shader.inputs['Roughness'].default_value=.85
texnode=mat.node_tree.nodes.new('ShaderNodeTexImage');mat.node_tree.links.new(texnode.outputs['Color'],shader.inputs['Base Color'])
parts=[]
def uvmap(o,c,tile=None,size=None):
    o.data.materials.append(mat)
    uv=o.data.uv_layers.active or o.data.uv_layers.new()
    for p in o.data.polygons:
        for li in p.loop_indices:
            v=o.data.vertices[o.data.loops[li].vertex_index].co
            if tile and p.normal.y<-.99:
                u=(v.x/size[0]+.5);w=(v.z/size[2]+.5)
                uv.data[li].uv=((.003+.494*u) if tile=='face' else (.502+.245*u),.503+.494*w)
            else:uv.data[li].uv=((c+.5)/8,.11)
    parts.append(o)
    return o
def box(name,loc,size,c,bevel=0,tile=None,angle=0):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        mod=o.modifiers.new('Chanfro simples','BEVEL');mod.width=bevel;mod.segments=1
        bpy.ops.object.modifier_apply(modifier=mod.name)
    uvmap(o,c,tile,size);o.rotation_euler.y=angle
    return o
def prism(name,points,front,back,c):
    n=len(points);verts=[(x,y,z) for y in (front,back) for x,z in points]
    faces=[tuple(range(n-1,-1,-1)),tuple(range(n,n*2))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o);return uvmap(o,c)
# Taller silhouette, square head and a dimensional swept hairstyle.
box('Cabeca',(0,0,2.15),(.88,.67,.86),0,.045,'face')
box('Pescoco',(0,0,1.68),(.25,.28,.18),0)
box('Cabelo_atras',(0,.305,2.31),(.91,.13,.61),1,.025)
box('Cabelo_lateral',(-.437,-.01,2.26),(.095,.65,.55),1,.018)
prism('Cabelo_topo',[(-.46,2.50),(-.46,2.66),(-.18,2.68),(.12,2.68),(.34,2.76),(.45,2.72),(.48,2.60),(.25,2.53)],-.36,.37,1)
prism('Mecha_frontal',[(-.43,2.49),(-.43,2.65),(-.05,2.64),(.30,2.72),(.33,2.60),(.15,2.53)],-.405,-.30,1)
# Fixed nose has actual depth, shared by all three; joins the single output mesh.
prism('Nariz_fixo',[(-.058,2.13),(.045,2.16),(.06,2.035),(-.065,2.035)],-.405,-.325,0)
box('Camisa',(0,0,1.275),(.72,.46,.76),2,.018,'shirt')
prism('Gola_esquerda',[(-.33,1.65),(-.07,1.62),(-.16,1.46)],-.26,-.235,5)
prism('Gola_direita',[(.33,1.65),(.07,1.62),(.16,1.46)],-.26,-.235,5)
box('Quadril',(0,.01,.85),(.68,.43,.19),3)
for s in [-1,1]:
    box('Manga_inteira',(s*.485,0,1.265),(.23,.35,.72),3,.012,angle=s*-.14)
    # Open stylized hands, no individual finger meshes in the final asset.
    box('Palma',(s*.53,-.01,.86),(.20,.18,.15),0,.012)
    box('Dedos',(s*.60,-.045,.76),(.075,.15,.17),0,.008,angle=s*.28)
    box('Polegar',(s*.45,-.055,.78),(.07,.15,.15),0,.008,angle=-s*.45)
    box('Perna',(s*.18,.015,.48),(.26,.31,.65),3,.012)
    box('Sapato',(s*.18,-.075,.13),(.30,.49,.18),4,.018)
bpy.ops.object.select_all(action='DESELECT')
for o in parts:o.select_set(True)
bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join();model=bpy.context.object;model.name='Explorador_HelloYotta'
model.data.materials.clear();model.data.materials.append(mat)
for p in model.data.polygons:p.material_index=0
model.data.calc_loop_triangles()
stats={'mesh_objects':1,'materials':1,'vertices':len(model.data.vertices),'triangles':len(model.data.loop_triangles),'atlas':'512x512','rig':False}
scene=bpy.context.scene
world=bpy.data.worlds.new('Estudio');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.72,.69,.64,1);world.node_tree.nodes['Background'].inputs[1].default_value=.45;scene.world=world
def aim(o,target=(0,0,1.4)):o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
for loc,power,size in [((-3,-4,6),400,4),((4,-2,3),190,3),((1,4,5),300,3)]:
    bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.data.energy=power;o.data.size=size;aim(o)
bpy.ops.object.camera_add(location=(3,-8,3.1));camera=bpy.context.object;camera.data.type='ORTHO';camera.data.ortho_scale=3.35;aim(camera);scene.camera=camera
scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=True
scene.render.resolution_x=800;scene.render.resolution_y=900;scene.render.resolution_percentage=100;scene.render.film_transparent=True
scene.view_settings.view_transform='AgX'
bpy.context.preferences.filepaths.save_version=0
for variant in variants:
    out=ROOT/variant
    for folder in ['GLB format','FBX format','OBJ format','Blender','Previews']:(out/folder).mkdir(exist_ok=True)
    image=bpy.data.images.load(str(out/'Textures/atlas.png'));texnode.image=image
    bpy.ops.object.select_all(action='DESELECT');model.select_set(True);bpy.context.view_layer.objects.active=model
    bpy.ops.export_scene.gltf(filepath=str(out/'GLB format'/f'{variant}.glb'),export_format='GLB',use_selection=True,export_animations=False)
    bpy.ops.export_scene.fbx(filepath=str(out/'FBX format'/f'{variant}.fbx'),use_selection=True,object_types={'MESH'},path_mode='COPY',embed_textures=True,bake_anim=False)
    bpy.ops.wm.obj_export(filepath=str(out/'OBJ format'/f'{variant}.obj'),export_selected_objects=True,path_mode='RELATIVE')
    image.pack();camera.location=(3,-8,3.1);aim(camera)
    # Remove unused previous variant images before saving this self-contained project.
    for old in list(bpy.data.images):
        if old!=image and old.users==0:bpy.data.images.remove(old)
    bpy.ops.wm.save_as_mainfile(filepath=str(out/'Blender'/f'{variant}.blend'))
    scene.render.filepath=str(out/'Previews/tres-quartos.png');bpy.ops.render.render(write_still=True)
    camera.location=(0,-8,2.6);aim(camera);scene.render.filepath=str(out/'Previews/frente.png');bpy.ops.render.render(write_still=True)
    (out/'validation.json').write_text(json.dumps({**stats,'glb_bytes':(out/'GLB format'/f'{variant}.glb').stat().st_size},indent=2))
print('EXPLORER_STUDY_DONE',stats)
