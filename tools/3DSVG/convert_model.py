"""Blender conversion worker. No rendering, external services or execution of .blend scripts."""
import bpy
import json
import math
import sys
import hashlib
from array import array
from pathlib import Path
from mathutils import Vector,Matrix,Euler
sys.path.insert(0,str(Path(__file__).resolve().parent))
from pose_support import validate_pose

args=sys.argv[sys.argv.index('--')+1:]
source=Path(args[0]).resolve();output=Path(args[1]).resolve();simplify='--simplify' in args
dependency_root=Path(args[args.index('--root')+1]).resolve() if '--root' in args else source.parent
warnings=[]
bpy.ops.wm.read_factory_settings(use_empty=True)
suffix=source.suffix.lower()
if suffix=='.blend':bpy.ops.wm.open_mainfile(filepath=str(source),load_ui=False,use_scripts=False)
elif suffix in ['.glb','.gltf']:bpy.ops.import_scene.gltf(filepath=str(source))
elif suffix=='.fbx':
    if source.read_bytes()[:20].startswith(b'Kaydara FBX Binary'):
        bpy.ops.import_scene.fbx(filepath=str(source),use_image_search=True)
    else:
        sys.path.insert(0,str(Path(__file__).parent))
        from import_ascii_fbx import load
        warnings.append(load(source,dependency_root))
elif suffix=='.obj':bpy.ops.wm.obj_import(filepath=str(source))
else:raise ValueError('Formato não suportado.')

# Apply pose to the disposable imported scene, before evaluating modifiers.
rigs=[o for o in bpy.context.scene.objects if o.type=='ARMATURE' and o.pose]
pose_rigs=[{'name':r.name,'bones':[{'id':str(i)+':'+b.name,'name':b.name,'parent':b.parent.name if b.parent else None} for b in r.pose.bones]} for i,r in enumerate(rigs)]
pose_actions=[{'name':a.name,'start':float(a.frame_range[0]),'end':float(a.frame_range[1])} for a in bpy.data.actions] if rigs else []
pose=None
if '--pose' in args:
    pose=validate_pose(json.loads(args[args.index('--pose')+1]))
    if not rigs:raise ValueError('Este formato não contém um esqueleto para editar poses.')
    if pose['action']:
        action=bpy.data.actions.get(pose['action'])
        if not action:raise ValueError('A animação escolhida não existe neste modelo.')
        for rig in rigs:
            rig.animation_data_create();rig.animation_data.action=action
            if action.slots:rig.animation_data.action_slot=action.slots[0]
        frame=float(action.frame_range[0])+(float(action.frame_range[1])-float(action.frame_range[0]))*pose['time']
        bpy.context.scene.frame_set(math.floor(frame),subframe=frame-math.floor(frame))
    bpy.context.view_layer.update()
    controls={str(i)+':'+bone.name:bone for i,rig in enumerate(rigs) for bone in rig.pose.bones}
    for key,angles in pose['bones'].items():
        if key not in controls:raise ValueError('O osso escolhido não existe neste modelo.')
        bone=controls[key]
        base=bone.rotation_quaternion.copy() if bone.rotation_mode=='QUATERNION' else bone.rotation_euler.to_quaternion()
        bone.rotation_mode='QUATERNION';bone.rotation_quaternion=base@Euler([math.radians(a) for a in angles],'XYZ').to_quaternion()
    bpy.context.view_layer.update()

# A multi-file picker flattens directory names; reconnect selected texture
# sidecars by basename when the original relative path is no longer available.
search_root=dependency_root
for parent in source.parents:
    if parent.parent.name=='imports' and parent.parent.parent.name=='.cache':
        search_root=parent;break
for image in bpy.data.images:
    if image.type!='IMAGE' or image.size[0] or not image.filepath:continue
    basename=Path(image.filepath.replace('\\','/')).name
    format_name={'.fbx':'FBX','.obj':'OBJ','.glb':'GLB','.gltf':'GLB'}.get(suffix,'')
    preferred=search_root/'Textures'/format_name
    matches=(list(preferred.rglob(basename)) if preferred.is_dir() else [])+list(search_root.rglob(basename))
    if matches:
        image.filepath=str(matches[0])
        try:image.reload()
        except RuntimeError:pass
    if not image.size[0]:warnings.append('Textura não encontrada: '+basename+'. Usando a cor base do material.')

# Rig custom shapes are controls, not model geometry. The glTF importer links
# its hidden Icosphere into glTF_not_exported without setting hide_render.
# Including it encloses small humanoids and makes the preview look empty/solid.
bone_shapes={bone.custom_shape for rig in bpy.context.scene.objects if rig.type=='ARMATURE' and rig.pose for bone in rig.pose.bones if bone.custom_shape}
objects=[obj for obj in bpy.context.scene.objects if obj.type in ['MESH','CURVE','SURFACE','FONT'] and not obj.hide_render
         and obj not in bone_shapes and not any(collection.name=='glTF_not_exported' for collection in obj.users_collection)]
if not objects:raise ValueError('O arquivo não contém malhas visíveis.')
for obj in objects:
    if obj.type!='MESH':
        bpy.context.view_layer.objects.active=obj;obj.select_set(True)
        bpy.ops.object.convert(target='MESH');obj.select_set(False)
    obj.data.calc_loop_triangles()
# Bake evaluated modifiers into this disposable conversion session. This makes
# the triangle budget and simplification reflect what the user actually sees.
deps=bpy.context.evaluated_depsgraph_get()
for obj in objects:
    evaluated=obj.evaluated_get(deps)
    baked=bpy.data.meshes.new_from_object(evaluated,preserve_all_data_layers=True,depsgraph=deps)
    matrix=evaluated.matrix_world.copy()
    obj.modifiers.clear();obj.data=baked;obj.matrix_world=matrix
    obj.data.calc_loop_triangles()
original=sum(len(obj.data.loop_triangles) for obj in objects)
if simplify and original>6000:
    for obj in objects:
        bpy.context.view_layer.objects.active=obj
        modifier=obj.modifiers.new('3DSVG_preview_simplification','DECIMATE')
        modifier.ratio=6000/original
        bpy.ops.object.modifier_apply(modifier=modifier.name)
if original>150000 and not simplify:raise ValueError('Modelo muito detalhado para este preview. Ative “Simplificar para SVG” e abra novamente.')

positions=[];normals=[];colours=[];indices=[];image_cache={}
axis=Matrix(((1,0,0),(0,0,1),(0,-1,0)))
def srgb(value):return max(0,min(1,12.92*value if value<=.0031308 else 1.055*value**(1/2.4)-.055))
def material_data(material):
    colour=(.65,.65,.65,1);image=None
    if material:
        colour=material.diffuse_color[:]
        if material.use_nodes:
            shader=next((n for n in material.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None)
            if shader:
                socket=shader.inputs['Base Color'];colour=socket.default_value[:]
                if socket.is_linked:
                    upstream=socket.links[0].from_node
                    if upstream.type=='TEX_IMAGE':image=upstream.image
                    else:warnings.append('Um material procedural foi aproximado pela cor base.')
    return colour,image
def sample(image,uv,fallback):
    if not image or not image.size[0]:return fallback
    key=image.as_pointer()
    if key not in image_cache:
        pixels=array('f',[0])*(len(image.pixels));image.pixels.foreach_get(pixels)
        image_cache[key]=(pixels,image.size[0],image.size[1],image.channels)
    pixels,w,h,c=image_cache[key];x=min(w-1,int((uv.x%1)*w));y=min(h-1,int((uv.y%1)*h));i=(y*w+x)*c
    return tuple(pixels[i+j] if j<c else 1 for j in range(4))
deps=bpy.context.evaluated_depsgraph_get()
for obj in objects:
    evaluated=obj.evaluated_get(deps);mesh=evaluated.to_mesh();mesh.calc_loop_triangles()
    world=axis@obj.matrix_world.to_3x3();normal_matrix=world.inverted_safe().transposed()
    materials=[material_data(mat) for mat in mesh.materials]
    uv_layer=mesh.uv_layers.active
    for tri in mesh.loop_triangles:
        colour,image=materials[tri.material_index] if tri.material_index<len(materials) else ((.65,.65,.65,1),None)
        uv=sum((uv_layer.data[i].uv for i in tri.loops),Vector((0,0)))/3 if uv_layer else Vector((.5,.5))
        colour=sample(image,uv,colour)
        if colour[3]<.05:continue
        rgb=[srgb(c) for c in colour[:3]]
        for index in (reversed(tri.vertices) if world.determinant()<0 else tri.vertices):
            position=axis@(obj.matrix_world@mesh.vertices[index].co)
            normal=(normal_matrix@tri.normal).normalized()
            indices.append(len(positions)//3)
            positions.extend(round(v,6) for v in position)
            normals.extend(round(v,6) for v in normal)
            colours.extend(round(v,6) for v in rgb)
    evaluated.to_mesh_clear()
if not positions:raise ValueError('Nenhuma superfície visível foi encontrada.')
lo=[min(positions[i::3]) for i in range(3)];hi=[max(positions[i::3]) for i in range(3)]
center=[(a+b)/2 for a,b in zip(lo,hi)]
radius=max(math.dist(positions[i:i+3],center) for i in range(0,len(positions),3))
if radius<=.0000001:raise ValueError('O modelo não tem dimensões válidas.')
# Normalize scale to make tiny/very large source units equally usable in the camera.
positions=[round((v-center[i%3])/radius,6) for i,v in enumerate(positions)]
packet={'id':hashlib.sha256(str(source).encode()).hexdigest()[:20],'label':source.stem,
    'positions':positions,'normals':normals,'colours':colours,'indices':indices,
    'center':[0,0,0],'radius':1,'triangles':len(indices)//3,'sourceTriangles':original,
    'simplified':simplify and original>6000,'warnings':sorted(set(warnings)),
    'source':source.name,'textureMode':'Cor amostrada por face; imagem SVG sem raster.'}
output.parent.mkdir(parents=True,exist_ok=True)
packet['rig']={'rigs':pose_rigs,'actions':pose_actions} if rigs else None
packet['pose']=pose
output.write_text(json.dumps(packet,separators=(',',':')),encoding='utf-8')
print('3DSVG_CONVERT_OK',source.name,packet['triangles'],flush=True)
