"""Static mesh adapter for legacy ASCII FBX 7.x (common in older Kenney packs).
Animation/rigging is intentionally outside this static SVG workflow.
"""
import csv
import math
import re
from pathlib import Path
import bpy
from mathutils import Matrix,Vector,Euler
from bpy_extras.io_utils import axis_conversion

def load(path,dependency_root=None):
    text=Path(path).read_text(encoding='utf-8-sig',errors='replace')
    def blocks(kind):
        result={}
        for match in re.finditer(r'^\s*'+kind+r':\s*(-?\d+),\s*"([^"]*)",\s*"([^"]*)"\s*\{',text,re.M):
            start=match.end();depth=1;quoted=False;escaped=False;i=start
            while i<len(text) and depth:
                char=text[i]
                if char=='"' and not escaped:quoted=not quoted
                if not quoted:
                    if char=='{':depth+=1
                    elif char=='}':depth-=1
                escaped=char=='\\' and not escaped;i+=1
            result[int(match[1])]={'name':match[2].split('::')[-1],'type':match[3],'body':text[start:i-1]}
        return result
    def numbers(body,name,cast=float):
        match=re.search(r'\b'+name+r':\s*\*\d+\s*\{\s*a:\s*([^}]*)\}',body,re.S)
        return [cast(v) for v in re.findall(r'[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?',match[1])] if match else []
    def prop(body,name,fallback):
        match=re.search(r'P:\s*"'+re.escape(name)+r'"([^\r\n]*)',body)
        if not match:return fallback
        values=next(csv.reader([('"'+name+'"'+match[1])]))
        try:return [float(v) for v in values[-len(fallback):]]
        except ValueError:return fallback
    models=blocks('Model');geometries=blocks('Geometry');materials=blocks('Material');textures=blocks('Texture')
    connections=[(int(a),int(b)) for a,b in re.findall(r'C:\s*"O[OP]",\s*(-?\d+),\s*(-?\d+)',text)]
    if not geometries:raise ValueError('Este FBX ASCII não contém geometria de malha suportada.')
    up=int(prop(text,'UpAxis',[1])[0]);up_sign=int(prop(text,'UpAxisSign',[1])[0])
    coord=int(prop(text,'CoordAxis',[0])[0]);coord_sign=int(prop(text,'CoordAxisSign',[1])[0])
    front=int(prop(text,'FrontAxis',[2])[0]);front_sign=int(prop(text,'FrontAxisSign',[1])[0])
    # FBX front-axis convention is opposite the forward direction in Blender.
    axis_up=('-' if up_sign<0 else '')+'XYZ'[up]
    axis_forward=('-' if front_sign>0 else '')+'XYZ'[front]
    correction=axis_conversion(from_forward=axis_forward,from_up=axis_up).to_4x4()
    mapped_materials={}
    def linear(c):return c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4
    for key,item in materials.items():
        mat=bpy.data.materials.new(item['name']);mat.use_nodes=True
        colour=prop(item['body'],'DiffuseColor',prop(item['body'],'Diffuse',[.65,.65,.65]))
        shader=mat.node_tree.nodes.get('Principled BSDF');shader.inputs['Base Color'].default_value=(*[linear(c) for c in colour],1)
        shader.inputs['Roughness'].default_value=.85
        for child,parent in connections:
            if parent!=key or child not in textures:continue
            body=textures[child]['body']
            match=re.search(r'(?:RelativeFilename|FileName):\s*"([^"]+)"',body)
            if not match:continue
            filename=match[1].replace('\\','/');file=Path(path).parent/filename
            if not file.is_file():
                root=Path(dependency_root) if dependency_root else Path(path).parent
                preferred=root/'Textures/FBX'
                candidates=(list(preferred.rglob(Path(filename).name)) if preferred.is_dir() else [])+list(root.rglob(Path(filename).name));file=candidates[0] if candidates else file
            if file.is_file():
                image=bpy.data.images.load(str(file),check_existing=True);node=mat.node_tree.nodes.new('ShaderNodeTexImage');node.image=image
                mat.node_tree.links.new(node.outputs['Color'],shader.inputs['Base Color'])
        mapped_materials[key]=mat
    cache={}
    def transform(key,seen=None):
        if key in cache:return cache[key]
        seen=set() if seen is None else seen
        if key in seen:raise ValueError('Hierarquia cíclica no FBX.')
        seen.add(key);body=models[key]['body']
        loc=Vector(prop(body,'Lcl Translation',[0,0,0]));scale=Vector(prop(body,'Lcl Scaling',[1,1,1]));rot=Euler([math.radians(v) for v in prop(body,'Lcl Rotation',[0,0,0])],'XYZ')
        local=Matrix.LocRotScale(loc,rot,scale)
        parent=next((b for a,b in connections if a==key and b in models),None)
        result=transform(parent,seen)@local if parent else correction@local
        cache[key]=result;return result
    for key,item in geometries.items():
        if item['type']!='Mesh':continue
        body=item['body'];coords=numbers(body,'Vertices');raw=numbers(body,'PolygonVertexIndex',int)
        if len(coords)%3 or not raw:continue
        vertices=list(zip(coords[::3],coords[1::3],coords[2::3]));faces=[];face=[]
        for value in raw:
            face.append(-value-1 if value<0 else value)
            if value<0:faces.append(face);face=[]
        for model_id in [b for a,b in connections if a==key and b in models] or [None]:
            mesh=bpy.data.meshes.new(item['name'] or 'FBX mesh');mesh.from_pydata(vertices,[],faces);mesh.update()
            obj=bpy.data.objects.new(models[model_id]['name'] if model_id else 'FBX mesh',mesh);bpy.context.collection.objects.link(obj)
            if model_id:obj.matrix_world=transform(model_id)
            material_ids=[a for a,b in connections if b==model_id and a in mapped_materials]
            for material_id in material_ids:mesh.materials.append(mapped_materials[material_id])
            assignments=numbers(body,'Materials',int)
            for i,polygon in enumerate(mesh.polygons):
                value=assignments[min(i,len(assignments)-1)] if assignments else 0
                polygon.material_index=max(0,min(value,max(0,len(material_ids)-1)))
            uv=numbers(body,'UV');uv_indices=numbers(body,'UVIndex',int)
            if uv:
                layer=mesh.uv_layers.new(name='UVMap')
                for i,loop in enumerate(mesh.loops):
                    index=uv_indices[i] if i<len(uv_indices) else loop.vertex_index
                    if 0<=index*2+1<len(uv):layer.data[i].uv=(uv[index*2],uv[index*2+1])
    return 'FBX ASCII legado: geometria estática, materiais e UV importados.'
