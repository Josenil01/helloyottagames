"""Blender integration: every humanoid GLB in both packs, static OBJ comparison.

Assert that hidden rig control geometry never enters the 3DSVG packet.
"""
import bpy,json,sys,runpy,math
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];TOOL=ROOT/'tools/3DSVG';OUT=TOOL/'.cache/minicharacter-validation';OUT.mkdir(exist_ok=True)
checks=[]
for pack in ['kenney_mini-characters','kenney_mini-characters (1)']:
 for folder in sorted((TOOL/'Repository/Kenney'/pack).glob('character-*')):
  packets={}
  for directory,ext in [('GLB format','glb'),('OBJ format','obj')]:
   source=folder/directory/(folder.name+'.'+ext);output=OUT/(pack+'-'+folder.name+'-'+ext+'.json')
   sys.argv=['blender','--',str(source),str(output),'--root',str(folder)]
   runpy.run_path(str(TOOL/'convert_model.py'),run_name='__main__')
   packet=json.loads(output.read_text(encoding='utf-8'));packets[ext]=packet
   assert packet['triangles']>0 and not packet['warnings'],(source,packet['warnings'])
   assert all(math.isfinite(v) for key in ['positions','normals','colours'] for v in packet[key]),source
   helpers=[o for o in bpy.context.scene.objects if any(c.name=='glTF_not_exported' for c in o.users_collection)]
   actual=sum(len(o.data.loop_triangles) for o in bpy.context.scene.objects if o.type=='MESH' and o not in helpers and not o.hide_render)
   assert packet['triangles']==actual,(source,packet['triangles'],actual)
   if ext=='glb':assert helpers,'Fixture must contain the hidden imported bone shape.'
  # Source formats can triangulate the authored faces differently; the exact
  # assertion above compares each packet to its own imported visible mesh.
  checks.append({'pack':pack,'model':folder.name,'triangles':packets['glb']['triangles'],'objTriangles':packets['obj']['triangles'],'hiddenControlsExcluded':True,'texturesLoaded':True})
  print('MINICHARACTER_OK',pack,folder.name,flush=True)
assert len(checks)==24,len(checks)
# An authored sphere with this same name must remain visible: only rig controls
# are excluded, not arbitrary meshes named Icosphere.
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2,radius=1)
bpy.context.object.name='Icosphere';bpy.context.object.data.calc_loop_triangles()
expected=len(bpy.context.object.data.loop_triangles)
source=OUT/'visible-icosphere.glb';output=OUT/'visible-icosphere.json'
bpy.ops.export_scene.gltf(filepath=str(source),export_format='GLB')
sys.argv=['blender','--',str(source),str(output),'--root',str(OUT)]
runpy.run_path(str(TOOL/'convert_model.py'),run_name='__main__')
assert json.loads(output.read_text(encoding='utf-8'))['triangles']==expected
(OUT/'report.json').write_text(json.dumps({'characters':len(checks),'conversions':len(checks)*2,'visibleSpherePreserved':True,'checks':checks},indent=2),encoding='utf-8')
print('MINICHARACTERS_VERIFIED',len(checks),flush=True)
