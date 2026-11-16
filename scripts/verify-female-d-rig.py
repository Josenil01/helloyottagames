"""Validate the original character's rig and actual evaluated deformation in Blender."""
import bpy,json,math
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];TOOL=ROOT/'tools/3DSVG'
source=TOOL/'Repository/Kenney/kenney_mini-characters/character-female-d/GLB format/character-female-d.glb'
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=str(source))
rigs=[o for o in bpy.context.scene.objects if o.type=='ARMATURE'];assert len(rigs)==1
rig=rigs[0];meshes=[o for o in bpy.context.scene.objects if o.type=='MESH' and any(m.type=='ARMATURE' and m.object==rig for m in o.modifiers)]
assert len(meshes)==2,len(meshes)
bone_names=set(rig.data.bones.keys());weights=[]
for obj in meshes:
 for vertex in obj.data.vertices:
  influences=[g for g in vertex.groups if obj.vertex_groups[g.group].name in bone_names and g.weight>0]
  assert influences,(obj.name,vertex.index,'unweighted')
  total=sum(g.weight for g in influences);assert abs(total-1)<.0001,(obj.name,vertex.index,total)
 weights.append({'mesh':obj.name,'vertices':len(obj.data.vertices),'allVerticesWeighted':True,'normalizedWeights':True})
def evaluated_positions():
 bpy.context.view_layer.update();deps=bpy.context.evaluated_depsgraph_get();result={}
 for obj in meshes:
  evaluated=obj.evaluated_get(deps);mesh=evaluated.to_mesh()
  result[obj.name]=[tuple(evaluated.matrix_world@v.co) for v in mesh.vertices];evaluated.to_mesh_clear()
 return result
rest=evaluated_positions();tests=[]
original_modes={b.name:b.rotation_mode for b in rig.pose.bones}
for name in ['head','torso','arm-left','arm-right','leg-left','leg-right']:
 bone=rig.pose.bones[name];bone.rotation_mode='XYZ';bone.rotation_euler.x=math.radians(25)
 posed=evaluated_positions();moved={key:sum(math.dist(a,b)>.000001 for a,b in zip(rest[key],posed[key])) for key in rest}
 assert sum(moved.values())>0,(name,'does not deform its mesh')
 assert all(math.isfinite(v) for points in posed.values() for point in points for v in point)
 tests.append({'bone':name,'movedVertices':moved,'finiteGeometry':True})
 bone.rotation_euler=(0,0,0)
for bone in rig.pose.bones:bone.rotation_mode=original_modes[bone.name]
assert evaluated_positions()==rest
animation_tests=[]
for name in ['walk','jump','die']:
 action=bpy.data.actions.get(name);assert action,name
 rig.animation_data_create();rig.animation_data.action=action
 if action.slots:rig.animation_data.action_slot=action.slots[0]
 bpy.context.scene.frame_set(int(sum(action.frame_range)/2));posed=evaluated_positions()
 moved=sum(math.dist(a,b)>.000001 for key in rest for a,b in zip(rest[key],posed[key]))
 assert moved>0,(name,'no evaluated motion')
 assert all(math.isfinite(v) for points in posed.values() for point in points for v in point)
 animation_tests.append({'name':name,'frameRange':list(action.frame_range),'movedVertices':moved})
report={'source':source.relative_to(ROOT).as_posix(),'armatures':1,'bones':[{'name':b.name,'parent':b.parent.name if b.parent else None,'deform':b.use_deform} for b in rig.data.bones], 'weights':weights,'poseTests':tests,'restPoseRestored':True,'availableActions':[a.name for a in bpy.data.actions],'animationTests':animation_tests}
out=TOOL/'.cache/female-d-rig-validation.json';out.write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print('FEMALE_D_RIG_OK',json.dumps(report),flush=True)
