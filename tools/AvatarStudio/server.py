"""Loopback-only static server; serves just this module and never opens the source tree."""
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote,urlsplit
import argparse
import base64, io, json, os, re, shutil, subprocess, tempfile, threading, zipfile
from PIL import Image
ROOT=Path(__file__).resolve().parent
EXPORT_LOCK=threading.Lock()
BLENDER=os.environ.get('AVATAR_BLENDER') or shutil.which('blender') or r'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe'
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
    def do_GET(self):
        host=self.headers.get('Host','').split(':')[0]
        if host not in ('localhost','127.0.0.1'):self.send_error(403);return
        path=unquote(urlsplit(self.path).path)
        target=(ROOT/path.lstrip('/')).resolve()
        if not target.is_relative_to(ROOT) or any(part.startswith('.') for part in Path(path).parts if part not in ('/','')):
            self.send_error(403);return
        super().do_GET()
    def end_headers(self):
        self.send_header('X-Content-Type-Options','nosniff')
        self.send_header('Cache-Control','no-cache')
        super().end_headers()
    def do_POST(self):
        # No cross-origin export requests; the UI supplies only its generated atlas,
        # not arbitrary models or file paths. Limit work and memory on this local server.
        host=self.headers.get('Host','')
        if host.split(':')[0] not in ('localhost','127.0.0.1') or self.headers.get('Origin') not in (None,'http://'+host):
            self.send_error(403);return
        if self.path!='/api/export':self.send_error(404);return
        if not EXPORT_LOCK.acquire(blocking=False):self.send_error(429,'Outra exportacao esta em andamento.');return
        try:
            size=int(self.headers.get('Content-Length','0'))
            if not 0<size<=250000:raise ValueError('Tamanho invalido.')
            data=json.loads(self.rfile.read(size));c=data['config']
            if c.get('version')!=1 or c.get('base')!='square-01':raise ValueError('Configuracao invalida.')
            if c.get('eyes') not in ('neutral','happy','wink','hearts','stars','surprised','sleepy','angry','sad'):raise ValueError('Olhos invalidos.')
            if c.get('mouth') not in ('smile','neutral','laugh','open','sad','tongue','kiss','teeth'):raise ValueError('Boca invalida.')
            colors=c['colors']
            if set(colors)!=set(('skin','hair','shirt','pants','shoes')) or not all(isinstance(v,str) and re.fullmatch(r'#[0-9a-fA-F]{6}',v) for v in colors.values()):raise ValueError('Cores invalidas.')
            raw=base64.b64decode(data['atlas'],validate=True)
            with Image.open(io.BytesIO(raw)) as img:
                if img.format!='PNG' or img.size!=(512,512):raise ValueError('Textura invalida.')
                img.load()
            if not Path(BLENDER).is_file():self.send_error(503,'Blender nao encontrado. Configure AVATAR_BLENDER.');return
            with tempfile.TemporaryDirectory(prefix='helloyotta-avatar-') as directory:
                out=Path(directory);(out/'Textures').mkdir()
                (out/'Textures/atlas.png').write_bytes(raw)
                (out/'avatar.json').write_text(json.dumps(c,ensure_ascii=False,indent=2),encoding='utf-8')
                result=subprocess.run([BLENDER,'--background','--python-exit-code','1','--python',str(ROOT/'scripts/export_avatar.py'),'--',str(out)],capture_output=True,timeout=120,creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
                if result.returncode:raise RuntimeError('Falha na conversao pelo Blender.')
                (out/'README.txt').write_text('Avatar HelloYotta: 1 malha, 1 material, 180 triangulos. Modelo estatico sem rig.\nTextura e configuracao correspondem ao momento do download.\nAbra o GLB no 3DSVG para capturar imagens e SVGs.\n',encoding='utf-8')
                buffer=io.BytesIO()
                with zipfile.ZipFile(buffer,'w',zipfile.ZIP_DEFLATED) as archive:
                    for file in out.rglob('*'):
                        if file.is_file():archive.write(file,file.relative_to(out).as_posix())
                payload=buffer.getvalue()
            self.send_response(200);self.send_header('Content-Type','application/zip');self.send_header('Content-Disposition','attachment; filename="avatar-helloyotta.zip"');self.send_header('Content-Length',str(len(payload)));self.end_headers();self.wfile.write(payload)
        except (ValueError,KeyError,TypeError):self.send_error(400,'Configuracao ou textura invalida.')
        except (RuntimeError,subprocess.TimeoutExpired):self.send_error(500,'Nao foi possivel converter o avatar. Verifique o Blender.')
        finally:EXPORT_LOCK.release()
    def list_directory(self,path):self.send_error(403);return None
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=8771);args=parser.parse_args()
    print(f'Avatar Studio: http://127.0.0.1:{args.port}',flush=True)
    ThreadingHTTPServer(('127.0.0.1',args.port),Handler).serve_forever()
