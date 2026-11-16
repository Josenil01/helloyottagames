"""Exercise the live pose API, cache, reset, static formats and invalid input."""
import json,urllib.request,urllib.parse,urllib.error
BASE='http://127.0.0.1:8768'
def get(path):
 with urllib.request.urlopen(BASE+path,timeout=180) as response:return json.load(response)
catalog=get('/api/catalog')
entry=next(m for m in catalog if m['pack']=='kenney_mini-characters' and m['name']=='character-female-d')
url='/api/model/'+entry['id']
rest=get(url);assert len(rest['rig']['rigs'][0]['bones'])==7;assert len(rest['rig']['actions'])==32
def posed(p):return get(url+'?'+urllib.parse.urlencode({'pose':json.dumps(p)}))
sit={'action':'sit','time':.5,'bones':{}}
packet=posed(sit);assert packet['pose']==sit and packet['positions']!=rest['positions'];assert posed(sit)['positions']==packet['positions']
manual=posed({'action':'walk','time':.25,'bones':{'0:head':[0,35,0]}});assert manual['positions']!=packet['positions']
assert posed({'action':'','time':.5,'bones':{}})['positions']==rest['positions']
for invalid in [{'action':'does-not-exist'},{'time':2},{'bones':{'0:no-such-bone':[0,1,0]}}]:
 try:posed(invalid)
 except urllib.error.HTTPError as error:assert error.code in [400,422]
 else:raise AssertionError(invalid)
obj=next(v for v in entry['variants'] if v['format']=='obj')
assert get(url+'?variant='+obj['id'])['rig'] is None
print('POSE_HTTP_OK: rig metadata, clip, manual offsets, cache, reset, invalid inputs and static OBJ.')
