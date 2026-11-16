from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json,struct,zipfile,hashlib
ROOT=Path(__file__).resolve().parent
names=['sorridente','apaixonado','surpreso']
sheet=Image.new('RGB',(1500,690),'#eee8dc');draw=ImageDraw.Draw(sheet)
font=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',24)
title=ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf',30)
draw.text((40,20),'HelloYotta | Estudo de explorador',font=title,fill='#513d32')
summaries=[];geometry_hashes=[]
for i,name in enumerate(names):
    out=ROOT/name
    image=Image.open(out/'Previews/tres-quartos.png').convert('RGBA');image.thumbnail((480,540))
    sheet.paste(image,(i*500+(500-image.width)//2,90),image)
    draw.text((i*500+180,640),name.capitalize(),font=font,fill='#513d32')
    raw=(out/'GLB format'/f'{name}.glb').read_bytes();length=struct.unpack_from('<I',raw,12)[0];doc=json.loads(raw[20:20+length]);binary=raw[28+length:]
    assert len(doc['meshes'])==len(doc['materials'])==1
    assert len(doc['meshes'][0]['primitives'])==1
    assert not doc.get('skins') and not doc.get('animations')
    primitive=doc['meshes'][0]['primitives'][0]
    geo=bytearray()
    for accessor_id in list(primitive['attributes'].values())+[primitive['indices']]:
        accessor=doc['accessors'][accessor_id];view=doc['bufferViews'][accessor['bufferView']];start=view.get('byteOffset',0);geo.extend(binary[start:start+view['byteLength']])
    geometry_hashes.append(hashlib.sha256(geo).hexdigest())
    assert '../Textures/atlas.png' in (out/'OBJ format'/f'{name}.mtl').read_text()
    stats=json.loads((out/'validation.json').read_text());summaries.append({'name':name,**stats})
    with zipfile.ZipFile(ROOT/f'{name}.zip','w',zipfile.ZIP_DEFLATED) as archive:
        for file in out.rglob('*'):
            if file.is_file():archive.write(file,f'{name}/{file.relative_to(out).as_posix()}')
assert len(set(geometry_hashes))==1,'Geometry must be identical across all expressions'
sheet.save(ROOT/'Overview.png')
(ROOT/'validation.json').write_text(json.dumps({'identical_geometry':True,'variants':summaries},indent=2),encoding='utf-8')
cards=''.join(f'<article><img src="{n}/Previews/tres-quartos.png" alt="Explorador {n}"><h2>{n.capitalize()}</h2><p><a href="{n}.zip" download>Baixar pacote completo</a> · <a href="{n}/GLB%20format/{n}.glb" download>GLB</a></p><details><summary>Vista frontal</summary><img src="{n}/Previews/frente.png" alt="Frente do explorador {n}"></details></article>' for n in names)
(ROOT/'Overview.html').write_text('<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Estudo de explorador · HelloYotta</title><style>body{margin:32px;background:#eee8dc;color:#513d32;font:16px system-ui}main{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}article{background:#faf7f1;padding:18px;border-radius:20px;text-align:center}img{width:100%;max-height:580px;object-fit:contain}a{color:#602d80}h1{margin-bottom:8px}p{line-height:1.6}@media(max-width:700px){main{grid-template-columns:1fr}}</style><h1>Explorador HelloYotta</h1><p>Estudo independente · Três expressões · Uma mesma geometria</p><main>'+cards+'</main><p>Arquivos: GLB, FBX, OBJ/MTL, Blender, textura, configuração e previews. Modelos estáticos sem esqueleto. Abra o GLB no 3DSVG para girar e capturar outros ângulos.</p></html>',encoding='utf-8')
(ROOT/'README.md').write_text(f'''# Estudo independente: explorador HelloYotta

Criado em 4 de novembro de 2026 a partir da referência visual fornecida pelo usuário. Não modifica o AvatarStudio, sua biblioteca ou suas diretrizes aprovadas.

Três exemplares: sorridente, apaixonado e surpreso. A geometria é idêntica; apenas os olhos e a boca na textura variam. Nariz tridimensional fixo e cabelo com volume real na frente, lateral e atrás. Gola em relevo; botões e distintivo desenhados no atlas. Materiais e desenhos são próprios.

Cada personagem: **1 malha, 1 material, {summaries[0]['triangles']} triângulos**, atlas PNG 512 × 512. A contagem é maior que os 180 triângulos da base do AvatarStudio devido aos chanfros, mãos e detalhes volumétricos. É um estudo visual para aprovação, não uma substituição automática da base.

Cada pasta segue o padrão GLB format / FBX format / OBJ format / Blender / Textures / Previews. Os ZIPs incluem configuração textual e relatório de contagem. Modelos estáticos, sem rig ou clipes de animação. Rig compartilhado permanece uma etapa futura. Frente -Y no Blender e +Z no GLB.

Abra Overview.html para comparar os previews e baixar os pacotes. Abra os GLBs no 3DSVG para inspeção 3D. Overview.png é uma prancha de comparação.

Reprodução: execute build_textures.py com Python/Pillow, build_models.py com Blender em background e package_study.py com Python/Pillow. Não é necessário instalar recursos no editor atual.
''',encoding='utf-8')
print(json.dumps(summaries,indent=2))
