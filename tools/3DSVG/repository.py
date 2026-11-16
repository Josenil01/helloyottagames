"""Directory-based model discovery shared by library imports and the Kenney adapter."""
import hashlib
import json
from pathlib import Path

SUPPORTED={'.glb','.gltf','.obj','.fbx','.blend'}
PREFERENCE={'.glb':0,'.gltf':1,'.obj':2,'.fbx':3,'.blend':4}
FORMAT_DIRS={'fbx format','glb format','gltf format','obj format','blender','blend format'}

def discover(root,pack_hint=None):
    root=Path(root).resolve()
    owners={};loose={};result={}
    if not root.is_dir():return result
    for file in sorted(root.rglob('*')):
        if file.suffix.lower() not in SUPPORTED or not file.is_file():continue
        relative=file.relative_to(root)
        if any(part.startswith('.') for part in relative.parts):continue
        format_parent=next((p for p in file.parents if p.is_relative_to(root) and p.parent.is_relative_to(root) and p.name.casefold() in FORMAT_DIRS),None)
        if format_parent:owners.setdefault(format_parent.parent,[]).append(file)
        else:loose.setdefault(file.parent,[]).append(file)
    groups=[]
    for owner,files in owners.items():
        counts={suffix:sum(f.suffix.lower()==suffix for f in files) for suffix in SUPPORTED}
        # One file per format is explicitly one model folder, even if the file
        # names differ (scene.glb, export.fbx, mesh.obj).
        if owner.name.casefold()!='models' and (owner!=root or max(counts.values())<=1 or (owner/'model.json').is_file()):
            groups.append((owner,'',owner.name,files))
        else:
            by_name={}
            for file in files:by_name.setdefault(file.stem,[]).append(file)
            groups.extend((owner,stem,stem,variants) for stem,variants in by_name.items())
    for owner,files in loose.items():
        by_name={}
        for file in files:by_name.setdefault(file.stem,[]).append(file)
        groups.extend((owner,stem,stem,variants) for stem,variants in by_name.items())
    for owner,subkey,name,files in groups:
        file=min(files,key=lambda p:PREFERENCE[p.suffix.lower()])
        key=hashlib.sha256((str(owner)+'|'+subkey).encode()).hexdigest()[:20]
        metadata={}
        manifest=owner/'model.json'
        if manifest.is_file() and not subkey:
            try:
                metadata=json.loads(manifest.read_text(encoding='utf-8'))
                if not isinstance(metadata,dict):metadata={}
            except (ValueError,OSError):pass
        if metadata.get('status','ready')!='ready':continue
        relative=owner.relative_to(root).as_posix()
        candidates=[owner/'Preview.png',owner/'Previews'/(file.stem+'.png'),root/'Previews'/(file.stem+'.png')]
        if owner.name.casefold()=='models':candidates.insert(0,owner.parent/'Previews'/(file.stem+'.png'))
        preview=next((p for p in candidates if p.is_file()),None)
        result[key]={'id':key,'name':str(metadata.get('name') or name),
                     'pack':str(metadata.get('pack') or pack_hint or root.name),
                     'file':file,'_root':owner,'_files':files,'relativeFolder':relative,
                     'formats':sorted({p.suffix[1:].lower() for p in files}),
                     'variants':[{'id':hashlib.sha256(p.relative_to(owner).as_posix().encode()).hexdigest()[:12],
                                  'format':p.suffix[1:].lower(),'name':p.name} for p in files],
                     'previewFile':preview}
    return result

def public(item):
    return {k:v for k,v in item.items() if k not in {'file','previewFile'} and not k.startswith('_')}
