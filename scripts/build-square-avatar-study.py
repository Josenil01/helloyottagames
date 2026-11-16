import bpy,json,math
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
NAME='avatar-quadrado-01';OUT=ROOT/'tools/3DSVG/Repository/HelloYotta'/NAME
for d in ['GLB format','FBX format','OBJ format','Blender','Textures','Previews']:(OUT/d).mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
colors=[(.73,.45,.24,1),(.12,.075,.045,1),(.12,.36,.32,1),(.12,.16,.19,1),(.20,.105,.055,1),(.72,.56,.28,1),(.035,.03,.025,1)]
pixels=list(colors[0])*4096
def rect(x0,y0,x1,y1,col):
 for y in range(y0,y1):
  for x in range(x0,x1):pixels[(y*64+x)*4:(y*64+x)*4+4]=col
# Face tile, 32x32; discrete details match the graphic reference.
rect(0,0,32,32,colors[0])
rect(5,21,12,23,colors[1]);rect(20,21,27,23,colors[1])
rect(7,16,11,19,colors[6]);rect(21,16,25,19,colors[6])
rect(14,11,18,14,(.59,.33,.16,1));rect(10,6,23,8,colors[1])
for i,c in enumerate(colors):rect(40,i*8,64,(i+1)*8,c)
tex=bpy.data.images.new('Atlas_64',width=64,height=64,alpha=True);tex.pixels.foreach_set(pixels);tex.filepath_raw=str(OUT/'Textures/atlas-64.png');tex.file_format='PNG';tex.save()
mat=bpy.data.materials.new('Atlas_unico');mat.use_nodes=True
shader=mat.node_tree.nodes['Principled BSDF'];shader.inputs['Roughness'].default_value=.9
node=mat.node_tree.nodes.new('ShaderNodeTexImage');node.image=tex;node.interpolation='Closest';mat.node_tree.links.new(node.outputs['Color'],shader.inputs['Base Color'])
parts=[]
def box(name,loc,size,c,face=False):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=size
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(mat)
 uv=o.data.uv_layers.active
 for p in o.data.polygons:
  for li in p.loop_indices:
   v=o.data.vertices[o.data.loops[li].vertex_index].co
   if face and p.normal.y<-.9:uv.data[li].uv=((.5+31*(v.x/size[0]+.5))/64,(.5+31*(v.z/size[2]+.5))/64)
   else:uv.data[li].uv=(52/64,(c*8+4)/64)
 parts.append(o);return o
box('Cabeca',(0,0,1.75),(.88,.70,.90),0,True)
box('Cabelo_topo',(0,.015,2.235),(.94,.76,.13),1)
box('Cabelo_atras',(0,.355,1.96),(.94,.09,.43),1)
box('Cabelo_lado',(-.455,.15,2.04),(.07,.43,.30),1)
box('Corpo',(0,.015,.99),(.52,.36,.55),2)
box('Cinto',(0,0,.70),(.53,.37,.09),4)
box('Fivela',(0,-.193,.70),(.09,.025,.07),5)
for s in [-1,1]:
 box('Manga',(s*.335,.015,1.11),(.15,.30,.22),2)
 box('Mao',(s*.35,-.015,.91),(.15,.19,.21),0)
 box('Perna',(s*.15,.02,.43),(.16,.20,.46),3)
 box('Sapato',(s*.15,-.055,.145),(.20,.34,.13),4)
bpy.ops.object.select_all(action='DESELECT')
for o in parts:o.select_set(True)
bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join();model=bpy.context.object;model.name=NAME
# Consolidate duplicate material slots after joining: one render primitive.
model.data.materials.clear();model.data.materials.append(mat)
for p in model.data.polygons:p.material_index=0
model.data.calc_loop_triangles()
stats={'mesh_objects':1,'materials':1,'vertices':len(model.data.vertices),'triangles':len(model.data.loop_triangles),'texture':'64x64 PNG','rig':False}
bpy.ops.export_scene.gltf(filepath=str(OUT/'GLB format'/f'{NAME}.glb'),export_format='GLB',use_selection=True)
bpy.ops.export_scene.fbx(filepath=str(OUT/'FBX format'/f'{NAME}.fbx'),use_selection=True,object_types={'MESH'},path_mode='COPY',embed_textures=True,bake_anim=False)
bpy.ops.wm.obj_export(filepath=str(OUT/'OBJ format'/f'{NAME}.obj'),export_selected_objects=True,path_mode='RELATIVE')
scene=bpy.context.scene
world=bpy.data.worlds.new('Studio');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[1].default_value=.6;scene.world=world
def aim(o):o.rotation_euler=(Vector((0,0,1.2))-o.location).to_track_quat('-Z','Y').to_euler()
for loc,power in [((-3,-4,6),400),((3,-1,4),150)]:
 bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.data.energy=power;o.data.size=4;aim(o)
bpy.ops.object.camera_add(location=(3,-6,3.5));cam=bpy.context.object;cam.data.type='ORTHO';cam.data.ortho_scale=2.85;aim(cam);scene.camera=cam
scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True;scene.render.resolution_x=900;scene.render.resolution_y=900;scene.render.resolution_percentage=100;scene.render.film_transparent=True
tex.pack();bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'Blender'/f'{NAME}.blend'))
for label,loc in [('tres-quartos',(3,-6,3.5)),('frente',(0,-6,2.4))]:
 cam.location=loc;aim(cam);scene.render.filepath=str(OUT/'Previews'/f'{label}.png');bpy.ops.render.render(write_still=True)
stats['glb_bytes']=(OUT/'GLB format'/f'{NAME}.glb').stat().st_size
(OUT/'validation.json').write_text(json.dumps(stats,indent=2),encoding='utf-8')
(OUT/'README.md').write_text('# Avatar quadrado 01\n\nEstudo original inspirado na imagem fornecida. Uma malha, um material, atlas de 64x64 pixels. Olhos, sobrancelhas, nariz e boca na textura; cabelo formado por volumes geométricos incorporados à malha final. Sem esqueleto ou animações nesta amostra. Frente -Y no Blender. GLB com textura incorporada, FBX, OBJ/MTL e Blender. A redução de objetos não elimina o custo de vértices, materiais, animação e renderização; números medidos em validation.json.\n',encoding='utf-8')
print('SQUARE_AVATAR_DONE',stats)
