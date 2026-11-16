"""Derive a textured Blockie zombie from the actual Kenney character-female-d."""
import bpy,json,math,colorsys,shutil,sys,runpy
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1];TOOL=ROOT/'tools/3DSVG'
SOURCE=TOOL/'Repository/Kenney/kenney_mini-characters/character-female-d'
NAME='zombie-female-d-blockie';OUT=TOOL/'Repository/HelloYotta'/NAME
for d in ['Blender','FBX format','GLB format','OBJ format','Textures','Previews']:(OUT/d).mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(SOURCE/'GLB format/character-female-d.glb'))
for image in bpy.data.images:
 if image.type=='IMAGE' and not image.size[0] and image.filepath:
  image.filepath=str(SOURCE/'Textures/GLB'/Path(image.filepath).name);image.reload()
for rig in [o for o in bpy.context.scene.objects if o.type=='ARMATURE']:
 for name,angle in [('arm-left',-68),('arm-right',68)]:
  bone=rig.pose.bones.get(name)
  if bone:bone.rotation_mode='XYZ';bone.rotation_euler.y=math.radians(angle)
 bone=rig.pose.bones.get('head')
 if bone:bone.rotation_mode='XYZ';bone.rotation_euler.z=math.radians(-5)
bpy.context.view_layer.update()
meshes=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.visible_get()]
# Preserve the real source topology, UV colours and hairstyle, baking this pose.
deps=bpy.context.evaluated_depsgraph_get()
for obj in meshes:
 evaluated=obj.evaluated_get(deps);mesh=bpy.data.meshes.new_from_object(evaluated,preserve_all_data_layers=True,depsgraph=deps);matrix=evaluated.matrix_world.copy()
 obj.modifiers.clear();obj.parent=None;obj.data=mesh;obj.matrix_world=matrix
palette=[(.39,.57,.25,1),(.25,.36,.16,1),(.27,.18,.13,1),(.18,.28,.22,1),(.28,.23,.35,1),(.075,.09,.07,1),(.94,.91,.66,1),(.69,.78,.29,1)]
texture=bpy.data.images.new('Zombie_Blockie_Palette',width=512,height=64,alpha=True);texture.colorspace_settings.name='sRGB'
texture.pixels.foreach_set([v for y in range(64) for x in range(512) for v in palette[x//64]])
texture.filepath_raw=str(OUT/'Textures/zombie-palette.png');texture.file_format='PNG';texture.save()
material=bpy.data.materials.new('Zombie_Matte_Atlas');material.use_nodes=True
shader=material.node_tree.nodes.get('Principled BSDF');shader.inputs['Roughness'].default_value=.92
node=material.node_tree.nodes.new('ShaderNodeTexImage');node.image=texture;node.interpolation='Closest'
material.node_tree.links.new(node.outputs['Color'],shader.inputs['Base Color'])
def srgb(c):return 12.92*c if c<=.0031308 else 1.055*c**(1/2.4)-.055
for obj in meshes:
 old=obj.data.materials[0];image=next(n.image for n in old.node_tree.nodes if n.type=='TEX_IMAGE');pixels=list(image.pixels);w,h=image.size;uv=obj.data.uv_layers.active
 # Classify whole disconnected hair volumes, not individual shaded triangles.
 parents=list(range(len(obj.data.vertices)))
 def root(i):
  while parents[i]!=i:parents[i]=parents[parents[i]];i=parents[i]
  return i
 for edge in obj.data.edges:parents[root(edge.vertices[0])]=root(edge.vertices[1])
 groups={}
 for vertex in obj.data.vertices:groups.setdefault(root(vertex.index),[]).append(obj.matrix_world@vertex.co)
 centers={key:sum(points,Vector())/len(points) for key,points in groups.items()}
 for poly in obj.data.polygons:
  u,v=uv.data[poly.loop_indices[0]].uv;x=min(w-1,int(u*w));y=min(h-1,int(v*h));i=(y*w+x)*image.channels
  rgb=[srgb(c) for c in pixels[i:i+3]];hue,sat,value=colorsys.rgb_to_hsv(*rgb)
  if value<.30:colour=5
  elif .015<hue<.14 and sat>.34:colour=2
  elif .015<hue<.17 and sat>.12:colour=0
  elif .17<hue<.49 and sat>.08:colour=3
  elif .49<hue<.85 and sat>.12:colour=4
  else:colour=1 if value<.70 else 6
  center=centers[root(poly.vertices[0])]
  if obj.name.startswith('head'):
   colour=2 if center.z>.60 or (center.y>.13 and center.z>.45) else (5 if value<.30 else 0)
  else:
   point=obj.matrix_world@poly.center
   if abs(point.x)<.15 and -.13<point.y<.13 and .18<point.z<.34:colour=3
   elif .06<point.z<.17:colour=4
   elif point.z<=.06:colour=2
  for loop in poly.loop_indices:uv.data[loop].uv=((colour+.5)/8,.5)
 obj.data.materials.clear();obj.data.materials.append(material)
 for poly in obj.data.polygons:poly.material_index=0;poly.use_smooth=False
def box(label,size,pos,c,bevel=.004):
 bpy.ops.mesh.primitive_cube_add(size=1,location=pos);obj=bpy.context.object;obj.name=label;obj.dimensions=size;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if bevel:
  modifier=obj.modifiers.new('Blockie chamfer','BEVEL');modifier.width=bevel;modifier.segments=1;bpy.ops.object.modifier_apply(modifier=modifier.name)
 obj.data.materials.append(material);uv=obj.data.uv_layers.active
 for loop in uv.data:loop.uv=((c+.5)/8,.5)
 meshes.append(obj)
# Graphic, non-gory facial details and missing-tooth grin.
for x,size in [(-.075,.057),(.075,.045)]:
 box('Sunken eye socket',(size+.018,.025,.062),(x,-.213,.535),1)
 box('Pale zombie eye',(size,.012,.043),(x,-.231,.535),6,.002)
 box('Small pupil',(.014,.009,.023),(x+.005,-.24,.532),5,.001)
box('Dark grin',(.125,.02,.048),(0,-.22,.455),5)
for x in [-.036,.007]:box('Uneven tooth',(.023,.01,.023),(x,-.234,.466),6,.001)
for x,z in [(-.13,.48),(.11,.60),(.13,.455)]:box('Skin patch',(.025,.012,.022),(x,-.216,z),1,.002)
# Ragged hem and worn seams remain cubic, matching the source pack.
for x,z in [(-.065,.20),(-.018,.18),(.045,.19),(.075,.23)]:box('Torn shirt',(.028,.018,.036),(x,-.126,z),5,.002)
for x,z in [(-.045,.274),(.032,.25)]:box('Exposed green patch',(.033,.02,.023),(x,-.137,z),0,.002)
box('Trouser patch',(.055,.02,.048),(.082,-.112,.10),3)
bpy.ops.object.select_all(action='DESELECT')
for obj in meshes:obj.select_set(True)
bpy.context.view_layer.objects.active=meshes[0];bpy.ops.object.join();model=bpy.context.object;model.name=NAME
bpy.context.scene.cursor.location=(0,0,0);bpy.ops.object.origin_set(type='ORIGIN_CURSOR');model.data.calc_loop_triangles()
stats={'vertices':len(model.data.vertices),'triangles':len(model.data.loop_triangles)}
bpy.ops.export_scene.fbx(filepath=str(OUT/'FBX format'/(NAME+'.fbx')),use_selection=True,object_types={'MESH'},axis_forward='-Z',axis_up='Y',path_mode='COPY',embed_textures=True,add_leaf_bones=False,bake_anim=False)
bpy.ops.export_scene.gltf(filepath=str(OUT/'GLB format'/(NAME+'.glb')),export_format='GLB',use_selection=True)
bpy.ops.wm.obj_export(filepath=str(OUT/'OBJ format'/(NAME+'.obj')),export_selected_objects=True,forward_axis='NEGATIVE_Z',up_axis='Y',path_mode='RELATIVE')
scene=bpy.context.scene
def aim(obj,p):obj.rotation_euler=(Vector(p)-obj.location).to_track_quat('-Z','Y').to_euler()
world=bpy.data.worlds.new('Soft studio');world.use_nodes=True;world.node_tree.nodes['Background'].inputs['Strength'].default_value=.45;scene.world=world
for loc,power,size in [((-2,-3,4),300,3),((3,-1,2),120,3),((0,3,3),180,2)]:
 bpy.ops.object.light_add(type='AREA',location=loc);obj=bpy.context.object;obj.data.energy=power;obj.data.size=size;aim(obj,(0,0,.4))
bpy.ops.object.camera_add(location=(.18,-2.6,1.0));camera=bpy.context.object;camera.data.type='ORTHO';camera.data.ortho_scale=1.08;aim(camera,(0,-.01,.39));scene.camera=camera
scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=True;scene.render.resolution_x=scene.render.resolution_y=1024;scene.render.resolution_percentage=100;scene.render.film_transparent=True;scene.render.image_settings.color_mode='RGBA';scene.view_settings.view_transform='Standard';scene.view_settings.look='None'
texture.pack();bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'Blender'/(NAME+'.blend')))
scene.render.filepath=str(OUT/'Preview.png');bpy.ops.render.render(write_still=True);shutil.copy2(OUT/'Preview.png',OUT/'Previews'/(NAME+'.png'))
shutil.copy2(SOURCE.parent/'License.txt',OUT/'License-Kenney.txt')
(OUT/'model.json').write_text(json.dumps({'name':NAME,'pack':'Hello Yotta · Blockie','status':'ready','sourceModel':'Kenney Mini Characters / character-female-d','sourceLicense':'CC0','changes':'Zombie palette, forward arm pose, asymmetric pale eyes, missing-tooth smile, worn shirt and patches. Non-gory.','statistics':stats,'formats':['blend','fbx','glb','obj'],'front':'Blender -Y / 3DSVG +Z'},ensure_ascii=False,indent=2),encoding='utf-8')
sys.argv=['blender','--',str(OUT/'GLB format'/(NAME+'.glb')),str(TOOL/'.cache/zombie-model.json'),'--root',str(OUT)]
runpy.run_path(str(TOOL/'convert_model.py'),run_name='__main__')
print('ZOMBIE_EXPORT_OK',stats,flush=True)
