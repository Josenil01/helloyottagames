"""Blender reimport verification of the authored zombie derivative."""
import json,runpy,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];TOOL=ROOT/'tools/3DSVG';folder=TOOL/'Repository/HelloYotta/zombie-female-d-blockie';name=folder.name
record=json.loads((folder/'model.json').read_text(encoding='utf-8'));checks=[]
for directory,ext in [('Blender','blend'),('FBX format','fbx'),('GLB format','glb'),('OBJ format','obj')]:
 output=TOOL/'.cache'/('zombie-verify-'+ext+'.json')
 sys.argv=['blender','--',str(folder/directory/(name+'.'+ext)),str(output),'--root',str(folder)]
 runpy.run_path(str(TOOL/'convert_model.py'),run_name='__main__')
 packet=json.loads(output.read_text(encoding='utf-8'))
 assert packet['triangles']==record['statistics']['triangles'],(ext,packet['triangles'])
 assert not packet['warnings'],(ext,packet['warnings'])
 assert len(set(tuple(packet['colours'][i:i+3]) for i in range(0,len(packet['colours']),3)))>=5,ext
 checks.append({'format':ext,'triangles':packet['triangles'],'texturesLoaded':True})
(folder/'validation.json').write_text(json.dumps({'source':'character-female-d','checks':checks},indent=2),encoding='utf-8')
print('ZOMBIE_VALIDATED',len(checks),flush=True)
