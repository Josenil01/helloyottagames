"""Run inside Blender: reimport each authored expression in all four formats."""
import json,sys,runpy
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];TOOL=ROOT/'tools/3DSVG';cache=TOOL/'.cache/sphinx-validation';cache.mkdir(exist_ok=True)
checks=[]
for folder in sorted((TOOL/'Repository/HelloYotta').glob('esfinge-blockie*')):
    metadata=json.loads((folder/'model.json').read_text(encoding='utf-8'))
    for directory,ext in [('GLB format','glb'),('FBX format','fbx'),('OBJ format','obj'),('Blender','blend')]:
        source=folder/directory/(folder.name+'.'+ext);output=cache/(folder.name+'-'+ext+'.json')
        sys.argv=['blender','--',str(source),str(output),'--root',str(folder)]
        runpy.run_path(str(TOOL/'convert_model.py'),run_name='__main__')
        packet=json.loads(output.read_text(encoding='utf-8'))
        assert packet['triangles']==metadata['statistics']['triangles'],(source,packet['triangles'])
        assert not packet['warnings'],(source,packet['warnings'])
        assert len({tuple(packet['colours'][i:i+3]) for i in range(0,len(packet['colours']),3)})>=5,source
        checks.append({'model':folder.name,'format':ext,'triangles':packet['triangles'],'materialsAndTextures':True})
report={'models':3,'loads':len(checks),'checks':checks}
(TOOL/'Repository/HelloYotta/validation.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print('SPHINX_REIMPORT_OK',len(checks),flush=True)
