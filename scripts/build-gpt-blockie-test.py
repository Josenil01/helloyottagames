"""Run with Blender --background --python scripts/build-gpt-blockie-test.py.
Creates a real, textured low-poly mesh and exports it in three interchange formats.
"""
import bpy
import json
import math
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'tools/3DSVG'
NAME = 'cogumelo-blockie'
for folder in ['Models/Blender', 'Models/FBX format', 'Models/GLB format',
               'Models/OBJ format', 'Models/Textures', 'Previews']:
    (OUT / folder).mkdir(parents=True, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.unit_settings.scale_length = 1

# A four-colour atlas: each polygon samples the centre of one swatch.
# UVs are embedded in every export; the GLB additionally embeds its texture.
palette = [(0.82, 0.095, 0.075, 1), (0.97, 0.95, 0.86, 1),
           (0.93, 0.77, 0.48, 1), (0.055, 0.045, 0.06, 1)]
texture = bpy.data.images.new('GPT_Blockie_Palette', width=256, height=64, alpha=True)
texture.colorspace_settings.name = 'sRGB'
pixels = []
for y in range(64):
    for x in range(256):
        pixels.extend(palette[x // 64])
texture.pixels.foreach_set(pixels)
texture.filepath_raw = str(OUT / 'Models/Textures/blockie-palette.png')
texture.file_format = 'PNG'
texture.save()

material = bpy.data.materials.new('GPT_Blockie_Matte')
material.use_nodes = True
nodes = material.node_tree.nodes
shader = nodes.get('Principled BSDF')
shader.inputs['Roughness'].default_value = 0.85
shader.inputs['Metallic'].default_value = 0
image_node = nodes.new('ShaderNodeTexImage')
image_node.image = texture
image_node.interpolation = 'Closest'
material.node_tree.links.new(image_node.outputs['Color'], shader.inputs['Base Color'])

parts = []
def box(name, size, location, colour, bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        modifier = obj.modifiers.new('Single_segment_chamfer', 'BEVEL')
        modifier.width = bevel
        modifier.segments = 1
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    obj.data.materials.append(material)
    uv = obj.data.uv_layers.active or obj.data.uv_layers.new(name='UVMap')
    for loop in uv.data:
        loop.uv = ((colour + 0.5) / 4, 0.5)
    for polygon in obj.data.polygons:
        polygon.use_smooth = False
    parts.append(obj)
    return obj

box('Stem', (0.96, 0.86, 0.79), (0, 0, 0.395), 2, 0.065)
box('Cap', (1.9, 1.54, 0.89), (0, 0, 1.13), 0, 0.14)
# Inlaid-looking square spots keep the language blocky, rather than spherical.
box('Spot_top_left', (0.42, 0.39, 0.012), (-0.39, -0.26, 1.58), 1, 0.006)
box('Spot_top_right', (0.34, 0.35, 0.012), (0.37, 0.24, 1.58), 1, 0.006)
box('Spot_front_left', (0.30, 0.012, 0.29), (-0.47, -0.774, 1.12), 1, 0.006)
box('Spot_front_right', (0.30, 0.012, 0.29), (0.47, -0.774, 1.12), 1, 0.006)
box('Spot_right', (0.012, 0.36, 0.31), (0.954, 0.12, 1.12), 1, 0.006)
box('Spot_left', (0.012, 0.31, 0.27), (-0.954, 0.12, 1.12), 1, 0.006)
box('Spot_back', (0.36, 0.012, 0.30), (0, 0.774, 1.12), 1, 0.006)
for x in [-0.20, 0.20]:
    box('Eye', (0.10, 0.018, 0.24), (x, -0.435, 0.365), 3, 0.008)

bpy.ops.object.select_all(action='DESELECT')
for part in parts:
    part.select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.join()
model = bpy.context.object
model.name = NAME
# Ground-centred origin. One mesh, one atlas, no external object dependencies.
scene.cursor.location = (0, 0, 0)
bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
model['style'] = 'Blockie: cubic volumes, one-segment chamfers, flat shading'
model['theme'] = 'Super Mario Mushroom Kingdom fan art study'

mesh = model.data
mesh.calc_loop_triangles()
statistics = {'vertices': len(mesh.vertices), 'polygons': len(mesh.polygons),
              'triangles': len(mesh.loop_triangles), 'materials': len(mesh.materials),
              'dimensions_m': list(model.dimensions)}

# Export only the asset; lights and cameras must not enter the game model files.
bpy.ops.export_scene.fbx(filepath=str(OUT / f'Models/FBX format/{NAME}.fbx'),
    use_selection=True, object_types={'MESH'}, apply_unit_scale=True,
    axis_forward='-Z', axis_up='Y', path_mode='COPY', embed_textures=True,
    add_leaf_bones=False, bake_anim=False)
bpy.ops.export_scene.gltf(filepath=str(OUT / f'Models/GLB format/{NAME}.glb'),
    export_format='GLB', use_selection=True, export_yup=True,
    export_materials='EXPORT', export_texcoords=True, export_normals=True)
bpy.ops.wm.obj_export(filepath=str(OUT / f'Models/OBJ format/{NAME}.obj'),
    export_selected_objects=True, export_materials=True,
    export_uv=True, export_normals=True, forward_axis='NEGATIVE_Z', up_axis='Y',
    path_mode='RELATIVE')

def aim(obj, point):
    obj.rotation_euler = (Vector(point) - obj.location).to_track_quat('-Z', 'Y').to_euler()

def light(name, location, energy, size):
    bpy.ops.object.light_add(type='AREA', location=location)
    obj = bpy.context.object
    obj.name = name
    obj.data.energy = energy
    obj.data.shape = 'DISK'
    obj.data.size = size
    aim(obj, (0, 0, 0.8))

world = bpy.data.worlds.new('Soft_studio')
world.use_nodes = True
world.node_tree.nodes.get('Background').inputs['Color'].default_value = (0.65, 0.70, 0.80, 1)
world.node_tree.nodes.get('Background').inputs['Strength'].default_value = 0.5
scene.world = world
light('Key', (-3, -4, 7), 450, 4)
light('Fill', (5, -1, 3), 180, 4)
light('Rim', (0, 4, 5), 220, 3)
bpy.ops.object.camera_add(location=(3.4, -5.8, 3.5))
camera = bpy.context.object
camera.name = 'Preview_camera'
camera.data.type = 'ORTHO'
camera.data.ortho_scale = 2.65
aim(camera, (0, 0, 0.80))
scene.camera = camera
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = 48
scene.cycles.use_denoising = True
scene.render.resolution_x = 1024
scene.render.resolution_y = 1024
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.view_settings.view_transform = 'Standard'
scene.view_settings.look = 'None'

# Keep the editable source with its render setup; selection remains on the model.
bpy.ops.object.select_all(action='DESELECT')
model.select_set(True)
bpy.context.view_layer.objects.active = model
texture.pack()
bpy.ops.wm.save_as_mainfile(filepath=str(OUT / f'Models/Blender/{NAME}.blend'))
scene.render.filepath = str(OUT / f'Previews/{NAME}.png')
bpy.ops.render.render(write_still=True)

for suffix, position in [('frente', (0, -6, 0.8)), ('costas', (-3.4, 5.8, 3.5))]:
    camera.location = position
    aim(camera, (0, 0, 0.8))
    scene.render.resolution_x = scene.render.resolution_y = 512
    scene.cycles.samples = 24
    scene.render.filepath = str(OUT / f'Previews/{NAME}-{suffix}.png')
    bpy.ops.render.render(write_still=True)

report = {'asset': NAME, 'created': '2026-10-29', 'generator': Path(__file__).name,
          'blender': bpy.app.version_string, 'statistics': statistics,
          'texture': 'Models/Textures/blockie-palette.png', 'texture_size': [256,64],
          'style': 'Cubic volumes, flat-shaded geometry, square spots, matte palette',
          'formats': ['blend', 'fbx', 'glb', 'obj', 'mtl'],
          'note': 'Real authored mesh; not reconstructed from the earlier generated PNG.'}
(OUT / 'blockie-manifest.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print('BLOCKIE_EXPORT_OK', json.dumps(statistics), flush=True)
