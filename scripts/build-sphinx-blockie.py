"""Author the Hello Yotta Sphinx as real Blockie meshes, texture and model formats."""
import bpy,json,math,sys,runpy,shutil
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1];TOOL=ROOT/'tools/3DSVG';OUT=TOOL/'Repository/HelloYotta'
palette=[(.78,.49,.20,1),(.96,.72,.35,1),(.98,.83,.51,1),(.025,.25,.30,1),(.045,.40,.47,1),(.10,.075,.065,1),(.99,.93,.76,1),(.83,.35,.20,1)]
for mood,suffix in [('idle',''),('happy','-feliz'),('sucking','-redemoinho')]:
 name='esfinge-blockie'+suffix;folder=OUT/name
 for d in ['Blender','FBX format','GLB format','OBJ format','Textures','Previews']:(folder/d).mkdir(parents=True,exist_ok=True)
 bpy.ops.wm.read_factory_settings(use_empty=True);scene=bpy.context.scene
 texture=bpy.data.images.new('Sphinx_Blockie_Palette',width=512,height=64,alpha=True);texture.colorspace_settings.name='sRGB'
 texture.pixels.foreach_set([v for y in range(64) for x in range(512) for v in palette[x//64]])
 texture.filepath_raw=str(folder/'Textures/sphinx-palette.png');texture.file_format='PNG';texture.save()
 material=bpy.data.materials.new('Sphinx_Matte_Atlas');material.use_nodes=True
 shader=material.node_tree.nodes.get('Principled BSDF');shader.inputs['Roughness'].default_value=.85
 node=material.node_tree.nodes.new('ShaderNodeTexImage');node.image=texture;node.interpolation='Closest'
 material.node_tree.links.new(node.outputs['Color'],shader.inputs['Base Color'])
 parts=[]
 def box(label,size,pos,c,bevel=.035,rotation=0):
  bpy.ops.mesh.primitive_cube_add(size=1,location=pos);o=bpy.context.object;o.name=label;o.dimensions=size
  bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
  if bevel:
   m=o.modifiers.new('Blockie chamfer','BEVEL');m.width=bevel;m.segments=1;bpy.ops.object.modifier_apply(modifier=m.name)
  o.rotation_euler.y=rotation;o.data.materials.append(material)
  uv=o.data.uv_layers.active or o.data.uv_layers.new()
  for loop in uv.data:loop.uv=((c+.5)/len(palette),.5)
  for poly in o.data.polygons:poly.use_smooth=False
  parts.append(o);return o
 # Reclining lion: broad chest, long body, paired forelegs and visible toes.
 box('Stone plinth',(2.35,3.10,.16),(0,.05,.08),0,.06)
 box('Lion body',(1.46,1.88,.78),(0,.52,.60),1,.16)
 box('Lion shoulders',(1.55,.78,1.04),(0,-.25,.85),1,.12)
 for x in [-.56,.56]:
  box('Foreleg',(.50,1.08,.40),(x,-.96,.40),1,.075)
  box('Front paw',(.62,.60,.31),(x,-1.34,.31),2,.06)
  box('Hind haunch',(.59,.65,.48),(x,.98,.47),0,.10)
  for dx in [-.16,0,.16]:box('Toe',(.105,.13,.09),(x+dx,-1.655,.34),0,.015)
 # Segmented square tail along the rear side, never hidden inside the body.
 for pos,size in [((.88,.88,.40),(.20,.95,.19)),((.75,1.35,.40),(.42,.20,.19))]:box('Tail',size,pos,0,.04)
 box('Neck',(.72,.66,.48),(0,-.36,1.37),1,.07)
 # Nemes headdress: stepped cubic blue flaps and gold bands.
 box('Nemes crown',(1.38,.79,.83),(0,-.40,2.02),3,.13)
 for x in [-.64,.64]:
  box('Nemes side flap',(.36,.71,1.12),(x,-.43,1.57),3,.055)
  for z in [1.12,1.31,1.50,1.69,1.88]:box('Gold nemes stripe',(.37,.045,.075),(x,-.805,z),2,.008)
 box('Human face',(.88,.46,.93),(0,-.81,1.89),2,.10)
 box('Forehead band',(1.01,.13,.15),(0,-1.055,2.30),1,.025)
 box('Cobra base',(.16,.14,.22),(0,-1.105,2.43),1,.028)
 box('Cobra hood',(.23,.11,.14),(0,-1.12,2.54),2,.035)
 box('Cobra eye',(.045,.025,.035),(.055,-1.185,2.55),5,.004)
 for x in [-.22,.22]:
  if mood=='happy':
   for dx,dz in [(-.045,0),(0,.035),(.045,0)]:box('Happy eye',(.06,.032,.035),(x+dx,-1.053,1.99+dz),5,.006)
  else:box('Eye',(.105,.035,.13),(x,-1.053,1.99),5,.018)
  box('Brow',(.16,.04,.043),(x,-1.06,2.105),3,.007)
 box('Nose',(.145,.15,.18),(0,-1.115,1.855),1,.022)
 if mood=='sucking':box('Open mouth',(.30,.045,.30),(0,-1.061,1.665),5,.045)
 elif mood=='happy':
  box('Smile',(.33,.035,.13),(0,-1.056,1.685),5,.025)
  box('Teeth',(.23,.022,.045),(0,-1.079,1.715),6,.007)
 else:
  for x,z in [(-.11,1.715),(0,1.685),(.11,1.715)]:box('Gentle smile',(.09,.035,.035),(x,-1.055,z),5,.008)
 box('Royal beard',(.19,.24,.32),(0,-1.02,1.40),3,.027)
 for z in [1.30,1.40,1.50]:box('Beard gold band',(.195,.025,.028),(0,-1.15,z),1,.004)
 bpy.ops.object.select_all(action='DESELECT')
 for o in parts:o.select_set(True)
 bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join();model=bpy.context.object;model.name=name
 scene.cursor.location=(0,0,0);bpy.ops.object.origin_set(type='ORIGIN_CURSOR');model.data.calc_loop_triangles()
 stats={'vertices':len(model.data.vertices),'triangles':len(model.data.loop_triangles),'dimensions':list(model.dimensions)}
 bpy.ops.export_scene.fbx(filepath=str(folder/'FBX format'/(name+'.fbx')),use_selection=True,object_types={'MESH'},axis_forward='-Z',axis_up='Y',path_mode='COPY',embed_textures=True,add_leaf_bones=False,bake_anim=False)
 bpy.ops.export_scene.gltf(filepath=str(folder/'GLB format'/(name+'.glb')),export_format='GLB',use_selection=True)
 bpy.ops.wm.obj_export(filepath=str(folder/'OBJ format'/(name+'.obj')),export_selected_objects=True,forward_axis='NEGATIVE_Z',up_axis='Y',path_mode='RELATIVE')
 def aim(obj,p):obj.rotation_euler=(Vector(p)-obj.location).to_track_quat('-Z','Y').to_euler()
 world=bpy.data.worlds.new('Soft studio');world.use_nodes=True;world.node_tree.nodes['Background'].inputs['Strength'].default_value=.45;scene.world=world
 for loc,power,size in [((-3,-4,6),500,4),((4,-2,4),200,4),((0,4,5),250,3)]:
  bpy.ops.object.light_add(type='AREA',location=loc);light=bpy.context.object;light.data.energy=power;light.data.shape='DISK';light.data.size=size;aim(light,(0,0,1.1))
 bpy.ops.object.camera_add(location=(.8,-7,3.5));camera=bpy.context.object;camera.data.type='ORTHO';camera.data.ortho_scale=3.75;aim(camera,(0,0,1.22));scene.camera=camera
 scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True
 scene.render.resolution_x=scene.render.resolution_y=1024;scene.render.resolution_percentage=100;scene.render.film_transparent=True;scene.render.image_settings.color_mode='RGBA'
 scene.view_settings.view_transform='Standard';scene.view_settings.look='None'
 texture.pack();bpy.ops.wm.save_as_mainfile(filepath=str(folder/'Blender'/(name+'.blend')))
 scene.render.filepath=str(folder/'Preview.png');bpy.ops.render.render(write_still=True)
 shutil.copy2(folder/'Preview.png',folder/'Previews'/(name+'.png'))
 (folder/'model.json').write_text(json.dumps({'name':name,'pack':'Hello Yotta · Blockie','status':'ready','style':'Blockie, cubic volumes, single-segment chamfers, flat faces, matte palette','mood':mood,'author':'Hello Yotta / authored locally with Blender','statistics':stats,'front':'Blender -Y / 3DSVG +Z','formats':['blend','fbx','glb','obj']},ensure_ascii=False,indent=2),encoding='utf-8')
 cache=TOOL/'.cache/game-svg';cache.mkdir(parents=True,exist_ok=True)
 key={'idle':'sphinx','happy':'sphinx-happy','sucking':'sphinx-sucking'}[mood]
 sys.argv=['blender','--',str(folder/'GLB format'/(name+'.glb')),str(cache/(key+'.json')),'--root',str(folder)]
 runpy.run_path(str(TOOL/'convert_model.py'),run_name='__main__')
 print('SPHINX_BLOCKIE_OK',mood,stats,flush=True)
