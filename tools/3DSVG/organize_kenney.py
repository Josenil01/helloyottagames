"""Create independent per-model folders from Kenney packs, preserving source packs.
Usage: python organize_kenney.py --apply --verify
"""
import argparse
import hashlib
import json
import os
import re
import shlex
import shutil
from pathlib import Path
from repository import discover,PREFERENCE,SUPPORTED

TOOL=Path(__file__).resolve().parent
IMAGES={'.png','.jpg','.jpeg','.webp','.tga','.bmp','.exr','.hdr'}
FORMAT_NAMES={'.glb':'GLB format','.gltf':'GLB format','.fbx':'FBX format','.obj':'OBJ format','.blend':'Blender'}
GENERATOR='3DSVG Kenney organizer v1'
IMAGE_CACHE={}

def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()

def plan(source):
    result=[]
    for pack in sorted(source.glob('kenney_*')):
        if not (pack/'Models').is_dir():continue
        groups={}
        for file in sorted((pack/'Models').rglob('*')):
            if file.is_file() and file.suffix.lower() in SUPPORTED:groups.setdefault(file.stem,[]).append(file)
        result.extend((pack,name,files) for name,files in groups.items())
    return result

def organize_model(pack,name,files,destination):
    folder=destination/pack.name/name
    metadata_path=folder/'model.json'
    if folder.exists() and any(folder.iterdir()):
        if not metadata_path.exists() or json.loads(metadata_path.read_text(encoding='utf-8')).get('generatedBy')!=GENERATOR:
            raise ValueError('Destino já contém arquivos não gerenciados: '+str(folder))
    folder.mkdir(parents=True,exist_ok=True)
    metadata_path.write_text(json.dumps({'generatedBy':GENERATOR,'status':'building','name':name,'pack':pack.name}),encoding='utf-8')
    for format_name in ['FBX format','GLB format','OBJ format','Textures']:(folder/format_name).mkdir(exist_ok=True)
    outputs={};originals={};texture_map={}
    def copy(source,target):
        source=source.resolve();target=target.resolve()
        if not source.is_relative_to(pack.resolve()) or not target.is_relative_to(folder.resolve()):raise ValueError('Dependência fora do pacote: '+str(source))
        source_hash=digest(source);originals[source.relative_to(pack).as_posix()]=source_hash
        target.parent.mkdir(parents=True,exist_ok=True)
        if not target.exists() or digest(target)!=source_hash:shutil.copy2(source,target)
        outputs[target.relative_to(folder).as_posix()]=source_hash
        return target
    def write(target,text):
        target.parent.mkdir(parents=True,exist_ok=True);target.write_text(text,encoding='utf-8')
        outputs[target.relative_to(folder).as_posix()]=digest(target)
    def texture(source,kind):
        source=source.resolve();key=(source,kind)
        if key in texture_map:return texture_map[key]
        target=folder/'Textures'/kind/source.name
        if target.exists() and digest(target)!=digest(source):target=target.with_name(target.stem+'-'+digest(source)[:8]+target.suffix)
        texture_map[key]=copy(source,target)
        return texture_map[key]
    def mtl(source,target):
        text=source.read_text(encoding='utf-8-sig')
        originals[source.resolve().relative_to(pack.resolve()).as_posix()]=digest(source)
        lines=[]
        for line in text.splitlines():
            match=re.match(r'^(\s*(?:map_\S+|bump|disp|decal|norm)\s+)(.+)$',line,re.I)
            if match:
                body=match[2].strip().replace('\\','/')
                direct=(source.parent/body).resolve()
                options=''
                if not direct.is_file():
                    tokens=shlex.split(body);filename=tokens[-1] if tokens else ''
                    direct=(source.parent/filename).resolve();options=' '.join(tokens[:-1])
                if direct.is_file():
                    image=texture(direct,'OBJ');relative=os.path.relpath(image,target.parent).replace('\\','/')
                    line=match[1]+(options+' ' if options else '')+relative
            lines.append(line)
        write(target,'\n'.join(lines)+'\n')
    for file in files:
        suffix=file.suffix.lower();format_name=FORMAT_NAMES[suffix];kind=format_name.split()[0]
        target=folder/format_name/file.name
        # Keep texture variants separate when exporters reuse colormap.png.
        image_roots=[file.parent,pack/'Models/Textures']
        for root in image_roots:
            if root.is_dir():
                if root not in IMAGE_CACHE:IMAGE_CACHE[root]=[image for image in sorted(root.rglob('*')) if image.suffix.lower() in IMAGES and image.is_file()]
                for image in IMAGE_CACHE[root]:texture(image,kind)
        if suffix=='.obj':
            text=file.read_text(encoding='utf-8-sig');lines=[]
            originals[file.relative_to(pack).as_posix()]=digest(file)
            for line in text.splitlines():
                if line.lstrip().startswith('mtllib '):
                    raw=line.lstrip()[7:].strip().replace('\\','/')
                    candidate=file.parent/raw
                    materials=[candidate] if candidate.is_file() else [file.parent/p for p in shlex.split(raw)]
                    names=[]
                    for material in materials:
                        if not material.is_file():raise ValueError('Material ausente: '+str(material))
                        mtl(material,folder/format_name/material.name);names.append(material.name)
                    line='mtllib '+' '.join(names)
                lines.append(line)
            write(target,'\n'.join(lines)+'\n')
        elif suffix=='.gltf':
            data=json.loads(file.read_text(encoding='utf-8-sig'));originals[file.relative_to(pack).as_posix()]=digest(file)
            for buffer in data.get('buffers',[]):
                uri=buffer.get('uri','')
                if uri and not uri.startswith('data:'):
                    dependency=file.parent/uri;copy(dependency,target.parent/dependency.name);buffer['uri']=dependency.name
            for image in data.get('images',[]):
                uri=image.get('uri','')
                if uri and not uri.startswith('data:'):
                    image['uri']=os.path.relpath(texture(file.parent/uri,'GLB'),target.parent).replace('\\','/')
            write(target,json.dumps(data,ensure_ascii=False,indent=2)+'\n')
        else:copy(file,target)
    preview=pack/'Previews'/(name+'.png')
    if preview.is_file():copy(preview,folder/'Preview.png')
    record={'generatedBy':GENERATOR,'status':'ready','name':name,'pack':pack.name,
        'formats':sorted({p.suffix[1:].lower() for p in files}),
        'sourceFiles':originals,'files':outputs,'license':'../License.txt'}
    metadata_path.write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    return {'folder':folder.relative_to(destination).as_posix(),'name':name,'pack':pack.name,
            'formats':record['formats'],'files':len(outputs)}

def build(source,destination):
    tasks=plan(source);records=[];packs=sorted({pack for pack,_,_ in tasks})
    destination.mkdir(parents=True,exist_ok=True)
    for pack in packs:
        target=destination/pack.name;target.mkdir(exist_ok=True)
        for license in pack.glob('*[Ll]icense*.txt'):shutil.copy2(license,target/'License.txt')
    for i,(pack,name,files) in enumerate(tasks):
        records.append(organize_model(pack,name,files,destination))
        if (i+1)%100==0 or i+1==len(tasks):print('Organizados',i+1,'/',len(tasks),flush=True)
    manifest={'version':1,'generatedBy':GENERATOR,'models':len(records),'packs':len(packs),
        'originalsPreserved':True,'blenderProjectsRequired':False,'entries':records}
    (destination/'repository-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    return manifest

def verify(source,destination):
    manifest=json.loads((destination/'repository-manifest.json').read_text(encoding='utf-8'))
    discovered=discover(destination)
    by_root={m['_root']:m for m in discovered.values()}
    assert len(discovered)==manifest['models'],(len(discovered),manifest['models'])
    files=0
    for entry in manifest['entries']:
        folder=destination/entry['folder'];record=json.loads((folder/'model.json').read_text(encoding='utf-8'))
        for relative,expected in record['files'].items():
            assert digest(folder/relative)==expected,str(folder/relative);files+=1
        for relative,expected in record['sourceFiles'].items():
            assert digest(source/entry['pack']/relative)==expected,'Original alterado: '+relative
        assert sorted(entry['formats'])==sorted(by_root[folder.resolve()]['formats'])
        for material in (folder/'OBJ format').glob('*.mtl'):
            for line in material.read_text(encoding='utf-8').splitlines():
                if re.match(r'\s*(map_\S+|bump|disp|decal|norm)\s+',line,re.I):
                    target=line.split(maxsplit=1)[1]
                    if not target.startswith('-'):assert (material.parent/target).is_file(),str(material)+': '+target
    print('REPOSITORY_VERIFIED',manifest['models'],'modelos,',manifest['packs'],'pacotes,',files,'arquivos; originais intactos.',flush=True)
    return manifest

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--source',type=Path,default=TOOL.parents[1]/'assets/image')
    parser.add_argument('--destination',type=Path,default=TOOL/'Repository/Kenney')
    parser.add_argument('--apply',action='store_true');parser.add_argument('--verify',action='store_true');args=parser.parse_args()
    source=args.source.resolve();destination=args.destination.resolve()
    tasks=plan(source);print('Plano:',len(tasks),'modelos em',len({p for p,_,_ in tasks}),'pacotes. Destino:',destination,flush=True)
    if args.apply:build(source,destination)
    if args.verify:verify(source,destination)

if __name__=='__main__':main()
