"""Keep the approved complete castle and recognizable keyboard details in 3D."""
import bpy,json,runpy,sys
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1];TOOL=ROOT/'tools/3DSVG';cache=TOOL/'.cache/game-svg'
jobs=json.loads((cache/'jobs.json').read_text(encoding='utf-8'))
for key in ['castle','keyboard']:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    item=jobs[key];height=0
    names=item['assembly'] if key=='castle' else [item['model']]
    for name in names:
        folder=TOOL/'Repository/Kenney'/item['pack']/name
        bpy.ops.import_scene.gltf(filepath=str(folder/'GLB format'/(name+'.glb')))
        objects=list(bpy.context.selected_objects)
        # Reconnect external GLB palettes before embedding the assembled model.
        for image in bpy.data.images:
            if image.type=='IMAGE' and not image.size[0] and image.filepath:
                matches=list((folder/'Textures').rglob(Path(image.filepath).name))
                if matches:image.filepath=str(matches[0]);image.reload()
        meshes=[o for o in objects if o.type=='MESH']
        corners=[o.matrix_world@Vector(c) for o in meshes for c in o.bound_box]
        if key=='castle':
            low=min(c.z for c in corners);high=max(c.z for c in corners)
            for o in objects:
                if o.parent not in objects:o.location.z+=height-low
            height+=high-low
    if key=='keyboard':
        corners=[o.matrix_world@Vector(c) for o in bpy.context.scene.objects if o.type=='MESH' for c in o.bound_box]
        low=[min(c[i] for c in corners) for i in range(3)];high=[max(c[i] for c in corners) for i in range(3)]
        material=bpy.data.materials.new('HY keycaps');material.diffuse_color=(.60,.71,.75,1)
        for row in range(4):
            for col in range(12):
                w=(high[0]-low[0])/13;d=(high[1]-low[1])/5;h=max(w,d)*.12
                bpy.ops.mesh.primitive_cube_add(size=1,location=(low[0]+(col+1)*w,low[1]+(row+1)*d,high[2]+h/2))
                o=bpy.context.object;o.scale=(w*.78,d*.72,h);o.data.materials.append(material)
    source=cache/(key+'-assembled.glb')
    bpy.ops.export_scene.gltf(filepath=str(source),export_format='GLB')
    sys.argv=['blender','--',str(source),str(cache/(key+'.json')),'--root',str(cache)]
    runpy.run_path(str(TOOL/'convert_model.py'),run_name='__main__')
    print('DETAILS_OK',key,flush=True)
