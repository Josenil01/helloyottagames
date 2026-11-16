"""Exercise the real root-folder upload, update and persistent repository APIs."""
import json
import sys
import time
import urllib.request
import uuid
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
TOOL=ROOT/'tools/3DSVG'
BASE='http://127.0.0.1:8768'
fixture=TOOL/'.cache/test-fixtures/root-folder'
def request(route,data=None,content_type='application/json'):
    if data is not None and not isinstance(data,bytes):data=json.dumps(data).encode()
    headers={'Content-Type':content_type} if data is not None else {}
    with urllib.request.urlopen(urllib.request.Request(BASE+route,data=data,headers=headers),timeout=180) as r:return json.load(r)
def upload(session,files):
    boundary=uuid.uuid4().hex;parts=[]
    for name,content in files:
        parts.extend([('--'+boundary+'\r\nContent-Disposition: form-data; name="files"; filename="'+name+'"\r\nContent-Type: application/octet-stream\r\n\r\n').encode(),content,b'\r\n'])
    parts.append(('--'+boundary+'--\r\n').encode())
    return request('/api/import/files?session='+session,b''.join(parts),'multipart/form-data; boundary='+boundary)

session=request('/api/import/start',{'name':'3DSVG repository validation'})['session']
files=[('root-folder/'+p.relative_to(fixture).as_posix(),p.read_bytes()) for p in fixture.rglob('*') if p.is_file()]
images=[entry for entry in files if entry[0].endswith('.png')];models=[entry for entry in files if not entry[0].endswith('.png')]
assert upload(session,images)['saved']==len(images)
assert upload(session,models)['saved']==len(models)
entries=request('/api/import/finish?session='+session,b'')
assert len(entries)==2
assert {m['name'] for m in entries}=={'Modelo A','Modelo B'}
assert all(m['formats']==['fbx','glb','obj'] for m in entries)
first_ids={m['id'] for m in entries}
for entry in entries:
    packet=request('/api/model/'+entry['id']);assert packet['triangles'] in [156,484]
    for variant in entry['variants']:
        selected=request('/api/model/'+entry['id']+'?variant='+variant['id'])
        assert selected['triangles'] in [156,484]
        assert selected['sourceFormat']==variant['format']
print('ROOT_API_OK: two folders with identical filenames, two usable models.',flush=True)

update=request('/api/import/start',{'name':'3DSVG repository validation','existingRoot':session})['session']
material='root-folder/Modelo A/OBJ format/mesh.mtl'
original=dict(files)[material]
new=[(material,original+b'\n# Integration-test revision\n')]
new += [(name.replace('/Modelo B/','/Modelo C/'),content) for name,content in files if '/Modelo B/' in name]
upload(update,new)
updated=request('/api/import/finish?session='+update,b'')
assert len(updated)==3 and first_ids.issubset({m['id'] for m in updated})
assert {m['name'] for m in updated}=={'Modelo A','Modelo B','Modelo C'}
backup=TOOL/'Repository/Imports'/session/'.history'/update/material
assert backup.read_bytes()==original
refreshed=request('/api/catalog?refresh=1')
assert {m['id'] for m in updated}.issubset({m['id'] for m in refreshed})
sys.path.insert(0,str(TOOL));import server
assert len(server.imported_entries(TOOL/'Repository/Imports'/session))==3
assert server.imported_entries(TOOL/'Repository/Imports'/update)=={}
report_path=TOOL/'.cache/test-fixtures/repository-http-test.json'
previous=json.loads(report_path.read_text(encoding='utf-8')).get('sessions',[]) if report_path.exists() else []
report={'sessions':list(dict.fromkeys(previous+[session,update])),'models':3,'rootImport':True,'grouping':True,'update':True,'history':True,'restartRecovery':True}
report_path.write_text(json.dumps(report,indent=2),encoding='utf-8')
print('UPDATE_API_OK: third model added, stable IDs, old files backed up, restart recovery verified.',flush=True)
print('VALIDATION_PACK','3DSVG repository validation · '+session[:6],flush=True)
