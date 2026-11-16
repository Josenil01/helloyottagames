"""Blender: actual pose examples and integration validation for the studio."""
import json,sys,runpy,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];TOOL=ROOT/'tools/3DSVG';OUT=TOOL/'.cache/pose-examples';OUT.mkdir(exist_ok=True)
source=TOOL/'Repository/Kenney/kenney_mini-characters/character-female-d/GLB format/character-female-d.glb'
before=hashlib.sha256(source.read_bytes()).hexdigest();checks=[]
presets=[('original',''),('idle','idle'),('walk','walk'),('sprint','sprint'),('jump','jump'),('crouch','crouch'),('sit','sit'),('interact-left','interact-left'),('emote-yes','emote-yes'),('die','die')]
for name,action in presets:
    output=OUT/(name+'.json');pose={'action':action,'time':1 if name=='die' else .25 if name in ['walk','sprint','emote-yes'] else .5,'bones':{}}
    sys.argv=['blender','--',str(source),str(output),'--root',str(source.parent.parent),'--pose',json.dumps(pose)]
    runpy.run_path(str(TOOL/'convert_model.py'),run_name='__main__')
    packet=json.loads(output.read_text(encoding='utf-8'));assert packet['rig'] and len(packet['rig']['rigs'][0]['bones'])==7
    assert not packet['warnings'],packet['warnings']
    checks.append({'pose':name,'triangles':packet['triangles'],'action':packet['pose']['action']})
rest=json.loads((OUT/'original.json').read_text(encoding='utf-8'))
for name,_ in presets[1:]:
    posed=json.loads((OUT/(name+'.json')).read_text(encoding='utf-8'))
    assert posed['positions']!=rest['positions'],name
# Manual offsets must also deform a posed character without discarding the clip.
pose={'action':'walk','time':.25,'bones':{'0:head':[0,35,0]}}
sys.argv=['blender','--',str(source),str(OUT/'manual.json'),'--root',str(source.parent.parent),'--pose',json.dumps(pose)]
runpy.run_path(str(TOOL/'convert_model.py'),run_name='__main__')
packet=json.loads((OUT/'manual.json').read_text(encoding='utf-8'));assert packet['positions']!=rest['positions'];assert packet['pose']==pose
assert hashlib.sha256(source.read_bytes()).hexdigest()==before
(OUT/'validation.json').write_text(json.dumps({'presets':checks,'manualOffset':True,'originalUnchanged':True},indent=2),encoding='utf-8')
print('POSE_EXAMPLES_VERIFIED',len(checks),flush=True)
