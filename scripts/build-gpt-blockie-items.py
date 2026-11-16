"""Blender: create the pipe, coin and question block to match the approved mushroom."""
import bpy
import json
import math
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'tools/3DSVG'
PALETTE = [(0.10,0.61,0.20,1),(0.16,0.75,0.25,1),(0.035,0.25,0.075,1),
           (0.97,0.61,0.07,1),(1.0,0.78,0.17,1),(0.71,0.36,0.045,1),
           (0.97,0.95,0.86,1),(0.055,0.045,0.06,1)]
texture_path = OUT / 'Models/Textures/blockie-items-palette.png'
reports = []

def reset():
    global parts, material, texture
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.scene.unit_settings.system='METRIC'
    parts=[]
    texture=bpy.data.images.new('GPT_Blockie_Items_Palette',width=512,height=64,alpha=True)
    texture.colorspace_settings.name='sRGB'
    pixels=[]
    for y in range(64):
        for x in range(512):pixels.extend(PALETTE[x//64])
    texture.pixels.foreach_set(pixels)
    texture.filepath_raw=str(texture_path)
    texture.file_format='PNG'
    texture.save()
    material=bpy.data.materials.new('GPT_Blockie_Items_Matte')
    material.use_nodes=True
    shader=material.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Roughness'].default_value=0.85
    shader.inputs['Metallic'].default_value=0
    node=material.node_tree.nodes.new('ShaderNodeTexImage')
    node.image=texture
    node.interpolation='Closest'
    material.node_tree.links.new(node.outputs['Color'],shader.inputs['Base Color'])

def finish_part(obj,colour):
    obj.data.materials.append(material)
    uv=obj.data.uv_layers.active or obj.data.uv_layers.new(name='UVMap')
    for p in obj.data.polygons:
        p.use_smooth=False
        for i in p.loop_indices:uv.data[i].uv=((colour+0.5)/8,0.5)
    parts.append(obj)
    return obj

def bevel(obj,width):
    modifier=obj.modifiers.new('Blockie_chamfer','BEVEL')
    modifier.width=width
    modifier.segments=1
    bpy.ops.object.modifier_apply(modifier=modifier.name)

def box(name,size,location,colour,chamfer=0):
    bpy.ops.mesh.primitive_cube_add(size=1,location=location)
    obj=bpy.context.object
    obj.name=name
    obj.dimensions=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if chamfer:bevel(obj,chamfer)
    return finish_part(obj,colour)

def pipe():
    # A continuous hollow tube, not a capped cube with a dark decal.
    # Rings follow the outer wall upwards, across the lip and down the inner wall.
    rings=[(.63,.055,0),(.67,.075,.045),(.67,.075,1.08),
           (.80,.095,1.08),(.84,.115,1.12),(.84,.115,1.43),
           (.80,.095,1.48),(.51,.055,1.48),(.47,.05,1.44),(.47,.05,.13)]
    vertices=[]
    for h,b,z in rings:
        vertices += [(x,y,z) for x,y in [(-h+b,-h),(h-b,-h),(h,-h+b),(h,h-b),
                     (h-b,h),(-h+b,h),(-h,h-b),(-h,-h+b)]]
    faces=[]
    for r in range(len(rings)-1):
        for i in range(8):faces.append((r*8+i,r*8+(i+1)%8,(r+1)*8+(i+1)%8,(r+1)*8+i))
    faces += [tuple(reversed(range(8))),tuple(range((len(rings)-1)*8,len(rings)*8))]
    mesh=bpy.data.meshes.new('Hollow_pipe_mesh')
    mesh.from_pydata(vertices,[],faces)
    mesh.update()
    obj=bpy.data.objects.new('Hollow_pipe',mesh)
    bpy.context.collection.objects.link(obj)
    bpy.context.view_layer.objects.active=obj
    obj.select_set(True)
    finish_part(obj,0)
    uv=mesh.uv_layers.active
    for p in mesh.polygons:
        # Lip lighter, inner shaft dark green for readable depth.
        ring=p.index//8
        c=2 if ring>=8 or p.index==len(mesh.polygons)-1 else (1 if ring in [4,5,6,7] else 0)
        for i in p.loop_indices:uv.data[i].uv=((c+0.5)/8,0.5)
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.normals_make_consistent(inside=False)
    bpy.ops.object.mode_set(mode='OBJECT')

def disc(name,radius,depth,y,colour,chamfer=0):
    bpy.ops.mesh.primitive_cylinder_add(vertices=12,radius=radius,depth=depth,
        end_fill_type='NGON',location=(0,y,.82),rotation=(math.pi/2,0,0))
    obj=bpy.context.object
    obj.name=name
    bpy.ops.object.transform_apply(location=False,rotation=True,scale=True)
    if chamfer:bevel(obj,chamfer)
    return finish_part(obj,colour)

def coin():
    disc('Coin_rim',.82,.25,0,3,.025)
    for side in [-1,1]:
        disc('Coin_inset',.66,.016,side*.130,5)
        disc('Coin_face',.61,.018,side*.140,4)
        box('Coin_mark',(.135,.030,.73),(0,side*.165,.82),3,.012)

def block():
    box('Question_block',(1.5,1.5,1.5),(0,0,.75),3,.075)
    box('Front_panel',(1.29,.018,1.29),(0,-.753,.75),4,.008)
    box('Right_panel',(.018,1.29,1.29),(.753,0,.75),4,.008)
    # Pixel-built white question marks on both visible faces.
    pattern=['01110','11011','00011','00110','00100','00000','00100']
    step=.13
    for row,line in enumerate(pattern):
        for column,pixel in enumerate(line):
            if pixel=='1':
                u=(column-2)*step
                z=.75+(3-row)*step
                box('Question_front',(.131,.025,.131),(u,-.777,z),6)
                box('Question_right',(.025,.131,.131),(.777,u,z),6)
    for u in [-.56,.56]:
        for z in [.19,1.31]:
            box('Front_rivet',(.065,.025,.065),(u,-.777,z),5,.01)
            box('Right_rivet',(.025,.065,.065),(.777,u,z),5,.01)

def aim(obj,point):obj.rotation_euler=(Vector(point)-obj.location).to_track_quat('-Z','Y').to_euler()

def studio():
    scene=bpy.context.scene
    world=bpy.data.worlds.new('Soft_studio')
    world.use_nodes=True
    world.node_tree.nodes.get('Background').inputs['Color'].default_value=(.65,.70,.80,1)
    world.node_tree.nodes.get('Background').inputs['Strength'].default_value=.5
    scene.world=world
    for name,pos,energy,size in [('Key',(-3,-4,7),450,4),('Fill',(5,-1,3),180,4),('Rim',(0,4,5),220,3)]:
        bpy.ops.object.light_add(type='AREA',location=pos)
        lamp=bpy.context.object
        lamp.name=name
        lamp.data.energy=energy
        lamp.data.shape='DISK'
        lamp.data.size=size
        aim(lamp,(0,0,.8))
    bpy.ops.object.camera_add(location=(3.4,-5.8,3.5))
    camera=bpy.context.object
    camera.data.type='ORTHO'
    camera.data.ortho_scale=2.65
    aim(camera,(0,0,.8))
    scene.camera=camera
    scene.render.engine='CYCLES'
    scene.cycles.device='CPU'
    scene.cycles.samples=48
    scene.cycles.use_denoising=True
    scene.render.resolution_x=scene.render.resolution_y=1024
    scene.render.resolution_percentage=100
    scene.render.film_transparent=True
    scene.render.image_settings.file_format='PNG'
    scene.render.image_settings.color_mode='RGBA'
    scene.view_settings.view_transform='Standard'
    scene.view_settings.look='None'
    return camera

for name,builder in [('cano-blockie',pipe),('moeda-blockie',coin),('bloco-blockie',block)]:
    reset()
    builder()
    bpy.ops.object.select_all(action='DESELECT')
    for obj in parts:obj.select_set(True)
    bpy.context.view_layer.objects.active=parts[0]
    if len(parts)>1:bpy.ops.object.join()
    model=bpy.context.object
    model.name=name
    bpy.context.scene.cursor.location=(0,0,0)
    bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    model['style']='Blockie: flat faces, cubic details, single-segment chamfers'
    model.data.calc_loop_triangles()
    stats={'vertices':len(model.data.vertices),'polygons':len(model.data.polygons),
           'triangles':len(model.data.loop_triangles),'materials':len(model.data.materials),
           'dimensions_m':list(model.dimensions)}
    bpy.ops.export_scene.fbx(filepath=str(OUT/f'Models/FBX format/{name}.fbx'),use_selection=True,
        object_types={'MESH'},axis_forward='-Z',axis_up='Y',path_mode='COPY',embed_textures=True,
        add_leaf_bones=False,bake_anim=False)
    bpy.ops.export_scene.gltf(filepath=str(OUT/f'Models/GLB format/{name}.glb'),export_format='GLB',
        use_selection=True,export_yup=True,export_materials='EXPORT',export_texcoords=True,export_normals=True)
    bpy.ops.wm.obj_export(filepath=str(OUT/f'Models/OBJ format/{name}.obj'),export_selected_objects=True,
        export_materials=True,export_uv=True,export_normals=True,forward_axis='NEGATIVE_Z',up_axis='Y',path_mode='RELATIVE')
    camera=studio()
    bpy.ops.object.select_all(action='DESELECT')
    model.select_set(True)
    bpy.context.view_layer.objects.active=model
    texture.pack()
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT/f'Models/Blender/{name}.blend'))
    scene=bpy.context.scene
    scene.render.filepath=str(OUT/f'Previews/{name}.png')
    bpy.ops.render.render(write_still=True)
    for suffix,pos in [('frente',(0,-6,.8)),('costas',(-3.4,5.8,3.5))]:
        camera.location=pos
        aim(camera,(0,0,.8))
        scene.render.resolution_x=scene.render.resolution_y=512
        scene.cycles.samples=24
        scene.render.filepath=str(OUT/f'Previews/{name}-{suffix}.png')
        bpy.ops.render.render(write_still=True)
    reports.append({'asset':name,'statistics':stats,'texture':'Models/Textures/blockie-items-palette.png'})
    print('ITEM_EXPORT_OK',name,json.dumps(stats),flush=True)

(OUT/'blockie-items-manifest.json').write_text(json.dumps({'created':'2026-10-29',
    'blender':bpy.app.version_string,'generator':Path(__file__).name,'assets':reports},indent=2),encoding='utf-8')

# Render a set overview from the actual meshes, using the same studio.
bpy.ops.wm.read_factory_settings(use_empty=True)
for index,name in enumerate(['cogumelo-blockie','cano-blockie','moeda-blockie','bloco-blockie']):
    with bpy.data.libraries.load(str(OUT/f'Models/Blender/{name}.blend'),link=False) as (source,target):
        target.objects=[name]
    obj=target.objects[0]
    bpy.context.collection.objects.link(obj)
    obj.location.x=(index-1.5)*2.35
camera=studio()
camera.location=(2.8,-12,6)
aim(camera,(0,0,.7))
camera.data.ortho_scale=10.1
scene=bpy.context.scene
scene.render.resolution_x=1920
scene.render.resolution_y=750
scene.render.filepath=str(OUT/'Preview-blockie-set.png')
bpy.ops.render.render(write_still=True)
print('BLOCKIE_SET_OK',flush=True)
