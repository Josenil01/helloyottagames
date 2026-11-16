"""3DSVG local workbench. Python standard library; Blender does the conversion."""
import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
import threading
import time
import uuid
from email.parser import BytesParser
from email.policy import default
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse, parse_qs, unquote
sys.path.insert(0,str(Path(__file__).resolve().parent))
from repository import discover, public
from pose_support import validate_pose

TOOL=Path(__file__).resolve().parent
PROJECT=TOOL.parents[1]
ASSETS=PROJECT/'assets/image'
RUNTIME=TOOL/'.cache'
REPOSITORY=TOOL/'Repository'
IMPORTS=REPOSITORY/'Imports'
SUPPORTED={'.glb','.gltf','.obj','.fbx','.blend'}
lock=threading.Lock()
catalog={}
BLENDER=None

def imported_entries(folder):
    info=folder/'import-info.json';label='Meus arquivos'
    if info.exists():
        data=json.loads(info.read_text(encoding='utf-8'))
        if data.get('status')!='ready':return {}
        label=data.get('name') or label
    # Browser directory uploads retain the selected root as the first component.
    children=[p for p in folder.iterdir() if p.is_dir() and not p.name.startswith('.')]
    has_loose=any(p.is_file() and p.suffix.lower() in SUPPORTED for p in folder.iterdir())
    formats={'fbx format','glb format','obj format','gltf format','blender','textures'}
    discovery_root=children[0] if len(children)==1 and not has_loose and children[0].name.casefold() not in formats else folder
    result=discover(discovery_root,pack_hint=label+' · '+folder.name[:6])
    bind_previews(result)
    return result

def bind_previews(entries):
    for item in entries.values():
        file=item.get('previewFile')
        item['preview']=('/tool-asset/'+file.relative_to(TOOL).as_posix()) if file and file.is_relative_to(TOOL) else (('/asset/'+file.relative_to(ASSETS).as_posix()) if file and file.is_relative_to(ASSETS) else None)

def find_blender(explicit=None):
    if explicit and Path(explicit).is_file():return str(Path(explicit))
    found=shutil.which('blender')
    if found:return found
    folder=Path(os.environ.get('ProgramFiles','C:/Program Files'))/'Blender Foundation'
    candidates=sorted(folder.glob('Blender */blender.exe'),reverse=True)
    return str(candidates[0]) if candidates else None

def scan():
    result={}
    if (TOOL/'Models').is_dir():result.update(discover(TOOL/'Models',pack_hint='3DSVG'))
    if REPOSITORY.exists():
        for root in sorted(REPOSITORY.iterdir()):
            if not root.is_dir() or root.name.startswith('.'):continue
            if root.name=='Imports':
                for folder in root.iterdir():
                    if folder.is_dir():result.update(imported_entries(folder))
            else:result.update(discover(root,pack_hint=root.name))
    # Preserve imports created by the previous version, without moving user data.
    legacy=RUNTIME/'imports'
    if legacy.exists():
        for folder in legacy.iterdir():
            if folder.is_dir():result.update(imported_entries(folder))
    existing={(m['pack'],m['name']) for m in result.values()}
    for folder in sorted(ASSETS.iterdir()):
        if not folder.is_dir() or folder.name.startswith('.'):continue
        models=folder/'Models'
        if not models.is_dir():continue
        for key,item in discover(models,pack_hint=folder.name).items():
            if (item['pack'],item['name']) not in existing:result[key]=item
    bind_previews(result)
    catalog.clear();catalog.update(result)
    return result

def convert(file,simplify=False,model_root=None,pose=None):
    if not BLENDER:raise ValueError('Blender não encontrado. Inicie com --blender e o caminho do executável.')
    # Cache also tracks sidecar textures/materials, not just the mesh itself.
    pack=Path(model_root) if model_root else file
    while not model_root and pack.parent!=ASSETS and pack.parent!=RUNTIME/'imports' and pack.parent!=pack:
        pack=pack.parent
    if pack==pack.parent:pack=file.parent
    pose=validate_pose(pose)
    stamps=[str(file.resolve()),str(simplify),json.dumps(pose,sort_keys=True),hashlib.sha256((TOOL/'convert_model.py').read_bytes()+(TOOL/'import_ascii_fbx.py').read_bytes()+(TOOL/'pose_support.py').read_bytes()).hexdigest()]
    for p in sorted(pack.rglob('*')) if pack.is_dir() else [file]:
        if p.is_file() and '.cache' not in p.relative_to(pack).parts:
            st=p.stat();stamps.append(str(p)+':'+str(st.st_size)+':'+str(st.st_mtime_ns))
    # Imported folders live inside .cache; use their direct tree as well.
    if str(file).startswith(str(RUNTIME)):
        st=file.stat();stamps.extend([str(st.st_size),str(st.st_mtime_ns)])
    key=hashlib.sha256('|'.join(stamps).encode()).hexdigest()
    output=RUNTIME/'models'/(key+'.json')
    output.parent.mkdir(parents=True,exist_ok=True)
    with lock:
        if not output.exists():
            command=[BLENDER,'--background','--factory-startup','--disable-autoexec',
                '--python',str(TOOL/'convert_model.py'),'--',str(file),str(output),'--root',str(pack)]
            if simplify:command.append('--simplify')
            if pose is not None:command.extend(['--pose',json.dumps(pose,separators=(',',':'))])
            process=subprocess.run(command,capture_output=True,text=True,encoding='utf-8',errors='replace',timeout=180)
            if process.returncode or not output.exists():
                diagnostic=(process.stdout+'\n'+process.stderr)[-5000:]
                print(diagnostic,flush=True)
                raise ValueError('Não foi possível converter este modelo. Confira os materiais e arquivos dependentes. '+diagnostic[-700:])
        return json.loads(output.read_text(encoding='utf-8'))

class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(TOOL),**kwargs)
    def log_message(self,fmt,*args):pass
    def json(self,data,status=200):
        content=json.dumps(data,ensure_ascii=False).encode()
        self.send_response(status);self.send_header('Content-Type','application/json; charset=utf-8')
        self.send_header('Cache-Control','no-store');self.send_header('Content-Length',str(len(content)))
        self.end_headers();self.wfile.write(content)
    def safe_request(self):
        # Do not expose this localhost service to cross-site requests.
        host=self.headers.get('Host','')
        if host not in [f'127.0.0.1:{self.server.server_port}',f'localhost:{self.server.server_port}']:return False
        origin=self.headers.get('Origin')
        return not origin or origin in ['http://'+host]
    def do_GET(self):
        if not self.safe_request():return self.json({'error':'Origem não permitida.'},403)
        url=urlparse(self.path)
        try:
            if url.path=='/api/status':return self.json({'name':'3DSVG','blender':bool(BLENDER),'count':len(catalog)})
            if url.path=='/api/roots':
                roots=[]
                if IMPORTS.exists():
                    for folder in IMPORTS.iterdir():
                        info=folder/'import-info.json'
                        if not info.is_file():continue
                        data=json.loads(info.read_text(encoding='utf-8'))
                        if data.get('status')=='ready':roots.append({'id':folder.name,'name':data.get('name','Meus modelos'),'created':data.get('created',0),'updated':data.get('updated',data.get('created',0))})
                return self.json(roots)
            if url.path=='/api/catalog':
                if parse_qs(url.query).get('refresh'):scan()
                return self.json([public(item) for item in catalog.values()])
            if url.path.startswith('/api/model/'):
                key=url.path.rsplit('/',1)[-1]
                if key not in catalog:return self.json({'error':'Modelo não encontrado. Atualize a biblioteca.'},404)
                entry=catalog[key];file=entry['file'];query=parse_qs(url.query)
                variant=query.get('variant',[''])[0]
                if variant:
                    selected=next((p for p in entry['_files'] if hashlib.sha256(p.relative_to(entry['_root']).as_posix().encode()).hexdigest()[:12]==variant),None)
                    if not selected:return self.json({'error':'Formato não encontrado para este modelo.'},404)
                    file=selected
                raw_pose=query.get('pose',[''])[0]
                if len(raw_pose)>8192:return self.json({'error':'Pose muito extensa.'},400)
                pose=validate_pose(json.loads(raw_pose)) if raw_pose else None
                packet=convert(file,query.get('simplify')==['1'],entry.get('_root'),pose=pose)
                packet.update(id=key,label=entry['name'],pack=entry['pack'],sourceFormat=file.suffix[1:].lower(),
                    sourceVariant=hashlib.sha256(file.relative_to(entry['_root']).as_posix().encode()).hexdigest()[:12])
                return self.json(packet)
            if url.path.startswith('/tool-asset/'):
                target=(TOOL/unquote(url.path[len('/tool-asset/'):])).resolve()
                if not target.is_relative_to(TOOL.resolve()) or any(p.startswith('.') for p in target.relative_to(TOOL.resolve()).parts) or not target.is_file():return self.send_error(404)
                self.path='/'+target.relative_to(TOOL).as_posix();return super().do_GET()
            if url.path.startswith('/asset/'):
                target=(ASSETS/unquote(url.path[len('/asset/'):])).resolve()
                if not target.is_relative_to(ASSETS.resolve()) or '.cache' in target.parts or not target.is_file():return self.send_error(404)
                content=target.read_bytes();self.send_response(200);self.send_header('Content-Type',self.guess_type(str(target)))
                self.send_header('Content-Length',str(len(content)));self.end_headers();self.wfile.write(content);return
            if '/.cache' in unquote(url.path):return self.send_error(404)
            if url.path in ['/Overview-Blockie.html','/'] and self.path=='/':self.path='/index.html'
            return super().do_GET()
        except subprocess.TimeoutExpired:return self.json({'error':'A conversão demorou demais. Tente um modelo menor ou simplificado.'},422)
        except Exception as error:return self.json({'error':str(error)},422)
    def do_POST(self):
        if not self.safe_request():return self.json({'error':'Origem não permitida.'},403)
        url=urlparse(self.path)
        if url.path=='/api/import/start':
            try:
                length=int(self.headers.get('Content-Length','0'))
                if length<1 or length>16384:raise ValueError('Metadados de importação inválidos.')
                info=json.loads(self.rfile.read(length));name=str(info.get('name') or 'Meus modelos')[:120]
                folder=IMPORTS/uuid.uuid4().hex;folder.mkdir(parents=True)
                target=info.get('existingRoot')
                if target:
                    try:valid=uuid.UUID(target).hex==target
                    except (ValueError,TypeError):valid=False
                    if not valid or not (IMPORTS/target/'import-info.json').is_file():raise ValueError('Pasta de destino inválida.')
                (folder/'import-info.json').write_text(json.dumps({'name':name,'status':'uploading','created':time.time(),'updateTarget':target}),encoding='utf-8')
                return self.json({'session':folder.name})
            except Exception as error:return self.json({'error':str(error)},422)
        if url.path=='/api/import/finish':
            try:
                folder=self.import_session(url)
                if not any(p.is_file() and p.suffix.lower() in SUPPORTED for p in folder.rglob('*')):raise ValueError('Nenhum modelo foi encontrado na pasta.')
                info_path=folder/'import-info.json';info=json.loads(info_path.read_text(encoding='utf-8'))
                target_id=info.get('updateTarget')
                if target_id:
                    target=IMPORTS/target_id
                    for source in folder.rglob('*'):
                        if not source.is_file() or source==info_path:continue
                        relative=source.relative_to(folder);destination=target/relative
                        if destination.exists() and hashlib.sha256(destination.read_bytes()).digest()!=hashlib.sha256(source.read_bytes()).digest():
                            backup=target/'.history'/folder.name/relative;backup.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(destination,backup)
                        destination.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,destination)
                    previous=target/'import-info.json';data=json.loads(previous.read_text(encoding='utf-8'));data['updated']=time.time();data['status']='ready';previous.write_text(json.dumps(data),encoding='utf-8')
                    info['status']='merged';info_path.write_text(json.dumps(info),encoding='utf-8')
                    for key in [k for k,v in catalog.items() if v['file'].is_relative_to(target)]:catalog.pop(key,None)
                    entries=imported_entries(target)
                else:
                    info['status']='ready';info_path.write_text(json.dumps(info),encoding='utf-8');entries=imported_entries(folder)
                catalog.update(entries)
                return self.json([public(item) for item in entries.values()])
            except Exception as error:return self.json({'error':str(error)},422)
        if url.path not in ['/api/import','/api/import/files']:return self.json({'error':'Rota inexistente.'},404)
        try:
            length=int(self.headers.get('Content-Length','0'))
            if length<=0 or length>200*1024*1024:return self.json({'error':'Escolha arquivos que somem até 200 MB.'},413)
            mime=('Content-Type: '+self.headers.get('Content-Type','')+'\r\nMIME-Version: 1.0\r\n\r\n').encode()
            message=BytesParser(policy=default).parsebytes(mime+self.rfile.read(length))
            if not message.is_multipart():raise ValueError('Envio de arquivos inválido.')
            folder=self.import_session(url) if url.path.endswith('/files') else IMPORTS/uuid.uuid4().hex
            folder.mkdir(parents=True,exist_ok=True)
            allowed=SUPPORTED|{'.mtl','.bin','.png','.jpg','.jpeg','.webp','.tga','.bmp','.exr','.hdr','.txt','.json'}
            models=[]
            saved=0
            for part in message.iter_parts():
                name=part.get_filename()
                if not name:continue
                relative=Path(name.replace('\\','/'))
                target=(folder/relative).resolve()
                if not target.is_relative_to(folder.resolve()) or relative.is_absolute():raise ValueError('Nome de arquivo inválido.')
                if target==folder/'import-info.json':continue
                if target.suffix.lower() not in allowed:continue
                target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(part.get_payload(decode=True))
                saved+=1
                if target.suffix.lower() in SUPPORTED:models.append(target)
            if url.path.endswith('/files'):return self.json({'saved':saved})
            if not models:raise ValueError('Nenhum modelo GLB, GLTF, OBJ, FBX ou Blender foi selecionado.')
            imported=[]
            for key,item in imported_entries(folder).items():
                catalog[key]=item;imported.append(public(item))
            return self.json(imported)
        except Exception as error:return self.json({'error':str(error)},422)

    def import_session(self,url):
        session=parse_qs(url.query).get('session',[''])[0]
        try:valid=uuid.UUID(session).hex==session
        except ValueError:valid=False
        folder=IMPORTS/session
        if not valid or not (folder/'import-info.json').is_file():raise ValueError('Sessão de importação inválida.')
        return folder

def main():
    global BLENDER
    parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=8768)
    parser.add_argument('--blender');parser.add_argument('--open',action='store_true');args=parser.parse_args()
    import urllib.request
    url=f'http://127.0.0.1:{args.port}'
    try:
        existing=json.loads(urllib.request.urlopen(url+'/api/status',timeout=1).read())
        if existing.get('name')=='3DSVG':
            print('3DSVG já está aberto: '+url,flush=True)
            if args.open:
                import webbrowser
                webbrowser.open(url)
            return
    except (OSError,ValueError):pass
    BLENDER=find_blender(args.blender);RUNTIME.mkdir(exist_ok=True);scan()
    server=ThreadingHTTPServer(('127.0.0.1',args.port),Handler)
    print(f'3DSVG: http://127.0.0.1:{args.port} | {len(catalog)} modelos | Blender: {bool(BLENDER)}',flush=True)
    if args.open:
        import webbrowser
        threading.Timer(.6,lambda:webbrowser.open(f'http://127.0.0.1:{args.port}')).start()
    try:server.serve_forever()
    except KeyboardInterrupt:pass
    finally:server.server_close()

if __name__=='__main__':main()
