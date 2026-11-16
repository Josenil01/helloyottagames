"""Package the real GLB meshes for an offline file:// WebGL preview (no fetch/CORS)."""
import io
import json
import struct
from pathlib import Path
import numpy as np
from PIL import Image

OUT=Path(__file__).resolve().parents[1]/'tools/3DSVG'
models=[]
for name,label in [('cogumelo','Cogumelo'),('cano','Cano verde'),('moeda','Moeda'),('bloco','Bloco de interrogação')]:
    path=OUT/f'Models/GLB format/{name}-blockie.glb'
    data=path.read_bytes()
    assert data[:4]==b'glTF'
    offset=12
    chunks={}
    while offset<len(data):
        size,kind=struct.unpack_from('<II',data,offset)
        chunks[kind]=data[offset+8:offset+8+size]
        offset+=size+8
    gltf=json.loads(chunks[0x4E4F534A]);binary=chunks[0x004E4942]
    def accessor(index):
        a=gltf['accessors'][index];v=gltf['bufferViews'][a['bufferView']]
        dtype={5126:'<f4',5125:'<u4',5123:'<u2',5121:'u1'}[a['componentType']]
        columns={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}[a['type']]
        start=v.get('byteOffset',0)+a.get('byteOffset',0)
        stride=v.get('byteStride',np.dtype(dtype).itemsize*columns)
        return np.ndarray((a['count'],columns),dtype=dtype,buffer=binary,offset=start,strides=(stride,np.dtype(dtype).itemsize)).copy()
    def matrix(node):
        if 'matrix' in node:return np.array(node['matrix']).reshape(4,4).T
        x,y,z,w=node.get('rotation',[0,0,0,1])
        r=np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],
                    [2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],
                    [2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
        m=np.eye(4);m[:3,:3]=r@np.diag(node.get('scale',[1,1,1]));m[:3,3]=node.get('translation',[0,0,0])
        return m
    positions=[];normals=[];colours=[];indices=[]
    def visit(index,parent):
        node=gltf['nodes'][index];m=parent@matrix(node)
        if 'mesh' in node:
            for primitive in gltf['meshes'][node['mesh']]['primitives']:
                attr=primitive['attributes'];p=accessor(attr['POSITION']);n=accessor(attr['NORMAL']);uv=accessor(attr['TEXCOORD_0'])
                p=(np.column_stack([p,np.ones(len(p))])@m.T)[:,:3]
                n=n@np.linalg.inv(m[:3,:3]);n/=np.linalg.norm(n,axis=1)[:,None]
                mat=gltf['materials'][primitive['material']]['pbrMetallicRoughness']
                factor=np.array(mat.get('baseColorFactor',[1,1,1,1]))[:3]
                if 'baseColorTexture' in mat:
                    tex=gltf['textures'][mat['baseColorTexture']['index']]
                    source=gltf['images'][tex['source']];view=gltf['bufferViews'][source['bufferView']]
                    start=view.get('byteOffset',0)
                    image=Image.open(io.BytesIO(binary[start:start+view['byteLength']])).convert('RGB')
                    pixels=np.asarray(image)/255
                    # GLTF UV origin is upper left. These authored textures are palette swatches.
                    c=np.array([pixels[min(int(v*image.height),image.height-1),min(int(u*image.width),image.width-1)] for u,v in uv])*factor
                else:c=np.tile(factor,(len(p),1))
                base=len(positions)
                positions.extend(p.tolist());normals.extend(n.tolist());colours.extend(c.tolist())
                indices.extend((accessor(primitive['indices']).ravel()+base).tolist())
        for child in node.get('children',[]):visit(child,m)
    for node in gltf['scenes'][gltf.get('scene',0)]['nodes']:visit(node,np.eye(4))
    p=np.array(positions);center=(p.min(axis=0)+p.max(axis=0))/2
    radius=float(np.linalg.norm(p-center,axis=1).max())
    def flat(values):return np.round(np.array(values).ravel(),6).tolist()
    models.append({'id':name,'label':label,'source':f'Models/GLB format/{name}-blockie.glb',
        'positions':flat(positions),'normals':flat(normals),'colours':flat(colours),'indices':indices,
        'center':center.tolist(),'radius':radius,'triangles':len(indices)//3})
(OUT/'blockie-model-data.js').write_text('// Generated from the actual GLB meshes by scripts/build-blockie-viewer-data.py.\nwindow.BLOCKIE_MODELS='+json.dumps(models,separators=(',',':'),ensure_ascii=False)+';\n',encoding='utf-8')
print('Packaged',len(models),'GLB meshes:',[(m['id'],m['triangles']) for m in models])
