"""Reuse one Blender session, calling the unmodified 3DSVG worker per model."""
import json,runpy,sys,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];TOOL=ROOT/'tools/3DSVG';cache=TOOL/'.cache/game-svg'
jobs=json.loads((cache/'jobs.json').read_text(encoding='utf-8'))
for i,(key,item) in enumerate(jobs.items()):
    source=ROOT/item['source'];target=cache/(key+'.json')
    digest=hashlib.sha256((TOOL/'convert_model.py').read_bytes())
    for file in sorted(source.parent.parent.rglob('*')):
        if file.is_file():digest.update(file.relative_to(source.parent.parent).as_posix().encode());digest.update(file.read_bytes())
    signature=digest.hexdigest()
    if not target.exists() or json.loads(target.read_text(encoding='utf-8')).get('buildSignature')!=signature:
        sys.argv=['blender','--',str(source),str(target),'--root',str(source.parent.parent)]
        runpy.run_path(str(TOOL/'convert_model.py'),run_name='__main__')
    packet=json.loads(target.read_text(encoding='utf-8'))
    assert packet['triangles'] and not any('não encontrada' in w for w in packet['warnings']),packet['warnings']
    packet['buildSignature']=signature
    target.write_text(json.dumps(packet,separators=(',',':')),encoding='utf-8')
    print('MESH',i+1,'/',len(jobs),key,packet['triangles'],flush=True)
