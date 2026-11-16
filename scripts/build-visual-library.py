"""Build the curated, CC0 visual library used by the 40 games and catalog.

Requires NumPy and Pillow. Renders original OBJ meshes (including their MTL
materials) with a shared orthographic camera, lighting and 2x antialiasing.
No preview thumbnail pixels are used. No game logic is rewritten.
"""
from pathlib import Path
import hashlib
import json
import re
import sys
from urllib.parse import unquote

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PACKS = ROOT / 'assets/image'
OUT = ROOT / 'assets/visuals'
ASSETS = {}
PACK_INDEX = {}
FORCE = set(sys.argv[1:])


def add(key, pack, name):
    folder = PACKS / ('kenney_' + pack)
    if pack not in PACK_INDEX:
        index = {}
        for file in folder.rglob('*.obj'): index.setdefault(file.stem, []).append(file)
        PACK_INDEX[pack] = index
    candidates = PACK_INDEX[pack].get(name, [])
    assert len(candidates) == 1, (key, candidates)
    license_file = next(folder.glob('*icense*'))
    assert 'CC0' in license_file.read_text(encoding='utf-8-sig'), license_file
    ASSETS[key] = {'pack': folder.name, 'model': name, 'source': candidates[0]}
    return key


for animal in ['beaver', 'bee', 'bunny', 'cat', 'caterpillar', 'chick', 'cow', 'crab', 'deer', 'dog', 'elephant', 'fish', 'fox', 'giraffe', 'hog', 'koala', 'lion', 'monkey', 'panda', 'parrot', 'penguin', 'pig', 'polar', 'tiger']:
    add(animal, 'cube-pets_1.0', 'animal-' + animal)
for food in ['apple', 'banana', 'bread', 'broccoli', 'burger', 'cake', 'carrot', 'cherries', 'cheese', 'cookie', 'corn', 'croissant', 'cup-coffee', 'cupcake', 'donut', 'egg', 'eggplant', 'fish', 'fries', 'grapes', 'hot-dog', 'ice-cream', 'lemon', 'lollypop', 'mushroom', 'orange', 'pear', 'pineapple', 'pizza', 'pumpkin', 'strawberry', 'tomato', 'watermelon', 'chocolate', 'pot', 'bottle-oil', 'soda', 'ice-cream-cne']:
    add('food-' + food, 'food-kit', food)
for key, model in [('books', 'books'), ('keyboard', 'computerKeyboard'), ('mouse', 'computerMouse'), ('laptop', 'laptop'), ('mirror', 'bathroomMirror'), ('chair', 'chair'), ('bed', 'bedSingle'), ('plant', 'pottedPlant'), ('lamp', 'lampSquareTable'), ('bear', 'bear')]:
    add(key, 'furniture-kit', model)
for key, model in [('castle', 'tower-square-top-roof-high'), ('castle-tower', 'tower-hexagon-roof'), ('catapult', 'siege-catapult'), ('flag', 'flag'), ('bridge', 'bridge-draw')]:
    add(key, 'castle-kit', model)
for key, model in [('factory', 'machine'), ('gear', 'cog-a'), ('robot-arm', 'robot-arm-a'), ('conveyor', 'conveyor'), ('crate', 'box-small')]:
    add(key, 'factory-kit_3.0', model)
for key, model in [('potion', 'potion'), ('orc', 'character-orc'), ('dungeon-column', 'column'), ('coin', 'coin'), ('key', 'key'), ('sword', 'weapon-sword'), ('shield', 'shield-round')]:
    add(key, 'mini-dungeon', model)
for key, model in [('spaceship', 'craft_speederA'), ('astronaut', 'astronautA'), ('alien', 'alien'), ('meteor', 'meteor'), ('crystal', 'rock_crystals'), ('rover', 'rover'), ('satellite', 'satelliteDish')]:
    add(key, 'space-kit', model)
for key, model in [('ship', 'ship-pirate-large'), ('treasure', 'chest'), ('barrel', 'barrel'), ('palm', 'palm-bend'), ('island', 'patch-sand-foliage'), ('cannon', 'cannon'), ('pirate-flag', 'flag-pirate')]:
    add(key, 'pirate-kit', model)
for key, model in [('cart', 'shopping-cart'), ('basket', 'shopping-basket'), ('cash-register', 'cash-register'), ('market', 'display-fruit')]:
    add(key, 'mini-market', model)
for key, model in [('train', 'train-locomotive-a'), ('carriage', 'train-carriage-box')]:
    add(key, 'train-kit', model)
for key, model in [('car', 'sedan'), ('taxi', 'taxi'), ('ambulance', 'ambulance'), ('firetruck', 'firetruck'), ('police', 'police'), ('truck', 'truck')]:
    # Exact source names are validated before any file is generated.
    add(key, 'car-kit', model)
add('tree', 'mini-forest_1.0', 'tree')
add('tent', 'mini-forest_1.0', 'tent')
add('house', 'city-kit-suburban_20', 'building-type-a')
add('road', 'city-kit-roads', 'road-bend')
add('trophy', 'mini-arena', 'trophy')
add('horse', 'prototype-kit', 'animal-horse')
add('cube', 'prototype-kit', 'shape-cube')
add('cylinder', 'prototype-kit', 'shape-cylinder')
for key in ['books', 'keyboard', 'mouse', 'laptop', 'mirror', 'chair', 'bed', 'plant', 'lamp', 'bear']:
    ASSETS[key]['camera'] = [6., 5., -8.]
ASSETS['castle']['assembly'] = ['tower-square-base', 'tower-square-mid', 'tower-square-top-roof-high']
ASSETS['sphinx'] = {'pack': 'Arte original Hello Yotta', 'model': 'Sphinx SVG', 'source': ROOT/'Canhões de ouro/sphinx.js', 'derived': True}

# Folder, hero objects, conceptual badge, accent, cover symbol, gameplay guards.
RECIPES = [
 ('Canhões de ouro', ['sphinx', 'dungeon-column'], '?', '#bd863e', '', ['.sphinx-scene']),
 ('Caçadores de Coletivos', ['lion', 'giraffe', 'tree'], 'ABC', '#558a3a', '🔦', []),
 ('vowel', ['books', 'keyboard'], 'AEI', '#d57ab4', '🎹', []),
 ('Defesa do Castelo Matematico', ['castle', 'catapult'], '+', '#537fba', '', []),
 ('Detetives da Ortografia', ['books', 'lamp'], '?', '#c18b3a', '🔍', []),
 ('Digite o resultado', ['keyboard', 'food-apple'], '2+3', '#ed7585', '', []),
 ('Digitado', ['keyboard', 'laptop'], 'ABC', '#19a998', '⌨️', []),
 ('Duelo dos Monstros', ['orc', 'alien'], '><', '#aa71b7', '', []),
 ('Escola de Magia VSA', ['potion', 'books'], 'VSA', '#bb64d6', '🧙‍♂️', []),
 ('Fabrica de Acentos', ['factory', 'books'], 'ÁÊÃ', '#9b77d2', '🎩', []),
 ('Fábrica de Rimas', ['conveyor', 'gear', 'books'], 'ão', '#d78b46', '🏭', []),
 ('Galáxia da Matemática', ['spaceship', 'crystal'], '△', '#6c83db', '', ['#geo-options', '#geo-objects', '#geo-target']),
 ('Galaxia dos Opostos', ['astronaut', 'spaceship'], '↔', '#8670cf', '🌌', []),
 ('Laboratorio das Pocoes', ['potion', 'food-pot'], '', '#ad75ce', '✨', ['#active-shelf']),
 ('Maisculo vs Minusculo', ['books', 'keyboard'], 'Aa', '#c276c5', '🔤', []),
 ('Matematica Pirata', ['ship', 'treasure'], '+', '#359eae', '', []),
 ('Mercado Alien', ['alien', 'spaceship', 'cart'], '><', '#53bca2', '🛸', []),
 ('Mercado Maior ou Menor', ['cart', 'food-apple'], '><', '#e29f58', '', ['#items-area']),
 ('monster_typer I', ['orc', 'keyboard'], 'A', '#41ab9d', '', []),
 ('monster_typer II', ['alien', 'keyboard'], 'ABC', '#4baea6', '', []),
 ('Organiza Tudo', ['crate', 'food-apple', 'car'], '', '#5ebac6', '📦', ['#root']),
 ('Piratas do Troco', ['treasure', 'coin'], '−', '#c59644', '', []),
 ('syllables', ['books', 'keyboard'], 'SÍ', '#a17bce', '📚', []),
 ('Sinonimos', ['parrot', 'tree', 'books'], '=', '#61a36c', '🧭', []),
 ('Trem da Soma e Subtracao', ['train', 'carriage'], '+ −', '#e39357', '', []),
 ('Mapa da Ilha do Tesouro', ['island', 'treasure', 'palm'], 'A1', '#45a6ae', '🗺️', []),
 ('Espelho Magico', ['mirror'], '↔', '#ad83d8', '🪞', []),
 ('Grafico em Acao', ['food-apple', 'food-banana'], 'chart', '#539cce', '📊', ['#scene-area', '#panel-type', '#panel-color']),
 ('Qual e o proximo', ['cube', 'cylinder'], '↻', '#ad89ce', '🔮', []),
 ('Fabrica das Formas', ['conveyor', 'robot-arm'], '△□', '#dca150', '🏭', []),
 ('Que horas sao', ['house'], 'clock', '#6eaccc', '🕐', ['#clock-svg']),
 ('Complete a Cobra', ['caterpillar', 'tree'], 'snake', '#68af7c', '🐍', []),
 ('Sudoku Magico', ['cube'], 'sudoku', '#9f87ce', '🧩', []),
 ('Combinando Sorvete', ['food-ice-cream', 'food-ice-cream-cne'], '', '#e7a1ba', '🍦', ['#cones-row', '#flavor-box']),
 ('Mercado Matematico', ['cart', 'cash-register', 'food-apple'], '$', '#57ac8a', '🛒', []),
 ('O Caminho Mais Rapido', ['house', 'road', 'car'], 'route', '#69a1bd', '🗺️', []),
 ('Balanca da Descoberta', ['food-apple', 'crate'], 'scale', '#cd995a', '⚖️', []),
 ('Complete a Sequencia', ['cube'], '123', '#6aafbd', '🔢', []),
 ('Contando as Patas', ['horse', 'cow'], '×', '#a7af5e', '🐾', ['#screen-game']),
 ('Qual e o Grupo', ['food-apple', 'food-carrot', 'food-broccoli'], 'venn', '#7ba8a4', '🎯', ['#screen-game']),
]

EMOJI = {
 '🐝':'bee','🐰':'bunny','🐱':'cat','🐈':'cat','🐄':'cow','🦀':'crab','🦌':'deer','🐶':'dog','🐘':'elephant','🐠':'fish','🦊':'fox','🦒':'giraffe','🐨':'koala','🦁':'lion','🐒':'monkey','🐵':'monkey','🐼':'panda','🦜':'parrot','🐧':'penguin','🐷':'pig','🐻':'bear','🐴':'horse',
 '🍎':'food-apple','🍌':'food-banana','🍞':'food-bread','🥦':'food-broccoli','🍔':'food-burger','🍰':'food-cake','🥕':'food-carrot','🍒':'food-cherries','🧀':'food-cheese','🍪':'food-cookie','🌽':'food-corn','🥐':'food-croissant','☕':'food-cup-coffee','🧁':'food-cupcake','🍩':'food-donut','🥚':'food-egg','🍆':'food-eggplant','🍟':'food-fries','🍇':'food-grapes','🌭':'food-hot-dog','🍦':'food-ice-cream','🍋':'food-lemon','🍭':'food-lollypop','🍄':'food-mushroom','🍊':'food-orange','🍐':'food-pear','🍍':'food-pineapple','🍕':'food-pizza','🎃':'food-pumpkin','🍓':'food-strawberry','🍅':'food-tomato','🍉':'food-watermelon','🍫':'food-chocolate',
 '📚':'books','📖':'books','⌨️':'keyboard','🖱️':'mouse','💻':'laptop','🪞':'mirror','🛏️':'bed','🪴':'plant','🏰':'castle','⚙️':'gear','🏭':'factory','📦':'crate','🧪':'potion','🗝️':'key','🪙':'coin','💎':'crystal','🛡️':'shield','🗡️':'sword','🚀':'spaceship','👨‍🚀':'astronaut','👽':'alien','🪨':'meteor','🏴‍☠️':'pirate-flag','🛢️':'barrel','🧰':'treasure','🌴':'palm','🛒':'cart','🧺':'basket','🚂':'train','🚗':'car','🚕':'taxi','🚑':'ambulance','🚒':'firetruck','🚓':'police','🚚':'truck','🌲':'tree','⛺':'tent','🏠':'house','🏆':'trophy',
}


def parse_model(path):
    vertices, texcoords, normals, faces = [], [], [], []
    materials = {'default': {'kd': [0.7, 0.7, 0.7]}}
    material = 'default'
    lines = path.read_text(encoding='utf-8-sig').splitlines()
    for line in lines:
        p = line.split()
        if not p: continue
        if p[0] == 'mtllib':
            mtl = path.parent / line.split(None, 1)[1]
            current = 'default'
            for entry in mtl.read_text(encoding='utf-8-sig').splitlines():
                q = entry.split()
                if not q: continue
                if q[0] == 'newmtl':
                    current = q[1]; materials[current] = {'kd': [1., 1., 1.]}
                elif q[0] == 'Kd': materials[current]['kd'] = list(map(float, q[1:4]))
                elif q[0] == 'map_Kd':
                    texture_path = mtl.parent / entry.split(None, 1)[1].replace('\\', '/')
                    materials[current]['texture'] = np.array(Image.open(texture_path).convert('RGB'))
        elif p[0] == 'v': vertices.append(list(map(float, p[1:4])))
        elif p[0] == 'vt': texcoords.append(list(map(float, p[1:3])))
        elif p[0] == 'vn': normals.append(list(map(float, p[1:4])))
        elif p[0] == 'usemtl': material = p[1]
        elif p[0] == 'f':
            polygon = []
            for corner in p[1:]:
                ids = corner.split('/')
                indices = []
                for i, count in enumerate([len(vertices), len(texcoords), len(normals)]):
                    value = int(ids[i]) if i < len(ids) and ids[i] else 0
                    indices.append(value - 1 if value > 0 else count + value if value < 0 else -1)
                polygon.append(indices)
            for i in range(1, len(polygon)-1): faces.append((polygon[0:1]+polygon[i:i+2], material))
    return np.array(vertices), np.array(texcoords), np.array(normals), faces, materials


def unit(vector):
    length = np.linalg.norm(vector)
    return vector / length if length > 1e-10 else np.array([0., 1., 0.])


def render(key, size=512):
    spec = ASSETS[key]
    target = OUT / 'objects' / (key + '.png')
    if spec.get('derived'):
        assert target.is_file(), 'Run scripts/export-sphinx-art.cjs before building the library'
        return
    if target.exists() and key not in FORCE: return
    vertices, uv, normals, faces, materials = parse_model(spec['source'])
    if key == 'keyboard':
        # The pack's keyboard is deliberately minimal. Add actual keycap boxes
        # in 3D so its meaning remains readable at small icon sizes.
        lo3, hi3 = vertices.min(axis=0), vertices.max(axis=0)
        extra_v, extra_n, extra_f = [], [], []
        for row in range(4):
            for col in range(12):
                x = lo3[0]+.015+col*(hi3[0]-lo3[0]-.03)/12
                z = lo3[2]+.012+row*(hi3[2]-lo3[2]-.035)/4
                w=(hi3[0]-lo3[0]-.045)/12; h=.004; deep=(hi3[2]-lo3[2]-.045)/4
                y=hi3[1]+.001
                offset=len(vertices)+len(extra_v); normal_offset=len(normals)+len(extra_n)
                extra_v.extend([(x,y,z),(x+w,y,z),(x+w,y,z+deep),(x,y,z+deep),(x,y+h,z),(x+w,y+h,z),(x+w,y+h,z+deep),(x,y+h,z+deep)])
                for j,(corners,normal) in enumerate([([4,5,6,7],[0,1,0]),([0,3,2,1],[0,-1,0]),([0,1,5,4],[0,0,-1]),([3,7,6,2],[0,0,1]),([0,4,7,3],[-1,0,0]),([1,2,6,5],[1,0,0])]):
                    extra_n.append(normal)
                    for triangle in [(corners[0],corners[1],corners[2]),(corners[0],corners[2],corners[3])]:
                        extra_f.append(([[offset+k,-1,normal_offset+j] for k in triangle],'hy-keycap'))
        vertices=np.concatenate([vertices,np.array(extra_v)]);normals=np.concatenate([normals,np.array(extra_n)]);faces.extend(extra_f)
        materials['hy-keycap']={'kd':[.80,.86,.88]}
    if spec.get('assembly'):
        all_v, all_uv, all_n, all_f = [], [], [], []
        height = 0.; vc = tc = nc = 0
        for name in spec['assembly']:
            v,t,n,f,m = parse_model(spec['source'].parent / (name + '.obj'))
            v[:,1] += height - v[:,1].min(); height = v[:,1].max()
            all_v.append(v); all_uv.append(t); all_n.append(n)
            all_f.extend([([[c[0]+vc,c[1]+tc if c[1]>=0 else -1,c[2]+nc if c[2]>=0 else -1] for c in face],mat) for face,mat in f])
            vc+=len(v);tc+=len(t);nc+=len(n);materials.update(m)
        vertices=np.concatenate(all_v);uv=np.concatenate(all_uv);normals=np.concatenate(all_n);faces=all_f
    view = unit(np.array(spec.get('camera', [6., 4., 8.])))
    right = unit(np.cross([0., 1., 0.], view)); up = np.cross(view, right)
    projected = vertices @ np.stack([right, up, view], axis=1)
    lo, hi = projected[:, :2].min(axis=0), projected[:, :2].max(axis=0)
    resolution = size * 2
    fit = resolution * .82 / max(hi-lo)
    projected[:, 0] = (projected[:, 0]-(lo[0]+hi[0])/2)*fit+resolution/2
    projected[:, 1] = -(projected[:, 1]-(lo[1]+hi[1])/2)*fit+resolution/2
    rgba = np.zeros((resolution,resolution,4),dtype=np.uint8)
    depth = np.full((resolution,resolution),-np.inf,dtype=np.float32)
    light = unit(np.array([-3.,7.,5.])); fill = unit(np.array([5.,2.,-4.]))
    for face, material in faces:
        pts = projected[[c[0] for c in face]]
        x0,y0 = np.maximum(np.floor(pts[:,:2].min(axis=0)).astype(int),0)
        x1,y1 = np.minimum(np.ceil(pts[:,:2].max(axis=0)).astype(int),resolution-1)
        if x0>x1 or y0>y1: continue
        a,b,c=pts
        den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1])
        if abs(den)<1e-10: continue
        yy,xx=np.mgrid[y0:y1+1,x0:x1+1].astype(np.float32);xx+=.5;yy+=.5
        w0=((b[1]-c[1])*(xx-c[0])+(c[0]-b[0])*(yy-c[1]))/den
        w1=((c[1]-a[1])*(xx-c[0])+(a[0]-c[0])*(yy-c[1]))/den
        w2=1-w0-w1;z=w0*a[2]+w1*b[2]+w2*c[2]
        dep=depth[y0:y1+1,x0:x1+1]
        mask=(w0>=-1e-6)&(w1>=-1e-6)&(w2>=-1e-6)&(z>dep)
        if not mask.any():continue
        mat=materials.get(material,materials['default'])
        colors=np.array(mat['kd'])*255
        if 'texture' in mat and all(c[1]>=0 for c in face):
            coords=np.stack([w0[mask],w1[mask],w2[mask]],axis=1) @ uv[[c[1] for c in face]]
            tex=mat['texture']
            tx=np.clip((coords[:,0]*tex.shape[1]).astype(int),0,tex.shape[1]-1)
            ty=np.clip(((1-coords[:,1])*tex.shape[0]).astype(int),0,tex.shape[0]-1)
            colors=tex[ty,tx].astype(float)*np.array(mat['kd'])
        norm=unit(normals[[c[2] for c in face]].mean(axis=0)) if all(c[2]>=0 for c in face) else unit(np.cross(vertices[face[1][0]]-vertices[face[0][0]],vertices[face[2][0]]-vertices[face[0][0]]))
        shade=min(1.04,.64+.30*max(0,norm@light)+.10*max(0,norm@fill))
        region=rgba[y0:y1+1,x0:x1+1];region[mask,:3]=np.clip(colors*shade,0,255).astype(np.uint8);region[mask,3]=255;dep[mask]=z[mask]
    image=Image.fromarray(rgba).resize((size,size),Image.Resampling.LANCZOS)
    assert image.getchannel('A').getbbox(),key
    image.save(target,optimize=True)


def font(size):
    return ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf',size)


def make_hero(key, parts, badge, accent):
    im=Image.new('RGBA',(768,768))
    if len(parts)==1: positions=[(40,40,688)]
    elif len(parts)==2: positions=[(0,40,600),(360,350,360)]
    else: positions=[(0,60,560),(370,270,340),(220,450,300)]
    for part,(x,y,w) in zip(parts,positions):
        obj=Image.open(OUT/'objects'/(part+'.png')).convert('RGBA').resize((w,w),Image.Resampling.LANCZOS)
        im.alpha_composite(obj,(x,y))
    d=ImageDraw.Draw(im)
    if badge:
        box=(400,20,736,250)
        d.rounded_rectangle(box,radius=48,fill='#fff8e9',outline=accent,width=10)
        if badge=='chart':
            for i,h in enumerate([65,115,155]): d.rounded_rectangle((460+i*65,205-h,502+i*65,205),radius=9,fill=accent)
        elif badge=='clock':
            d.ellipse((482,45,658,221),fill='white',outline=accent,width=12)
            d.line((570,80,570,133,612,156),fill='#30325a',width=12)
        elif badge=='venn':
            d.ellipse((458,66,595,203),outline='#508ec5',width=13);d.ellipse((552,66,689,203),outline='#c27bce',width=13)
        elif badge=='sudoku':
            for i in range(4):
                d.line((480+i*60,45,480+i*60,225),fill=accent,width=7);d.line((480,45+i*60,660,45+i*60),fill=accent,width=7)
            d.text((493,46),'1',font=font(43),fill=accent);d.text((616,170),'3',font=font(43),fill=accent)
        elif badge=='route':
            points=[(460,180),(540,180),(540,80),(660,80)];d.line(points,fill=accent,width=14)
            for x,y in points:d.ellipse((x-13,y-13,x+13,y+13),fill='#30325a')
        elif badge=='scale':
            d.line((570,65,570,205),fill=accent,width=12);d.line((480,100,660,100),fill=accent,width=12)
            for x in [490,650]: d.line((x,103,x-32,170,x+32,170,x,103),fill=accent,width=7)
            d.line((525,205,615,205),fill=accent,width=12)
        elif badge=='snake':
            points=[(470,165),(515,165),(560,165),(560,110),(615,110),(660,110)]
            for i,(x,y) in enumerate(points):d.ellipse((x-24,y-24,x+24,y+24),fill=['#67b98b','#ffd168','#d482ac'][i%3])
            d.ellipse((650,95,657,102),fill='#30325a')
        elif badge=='△':
            d.polygon([(570,64),(650,208),(490,208)],fill=accent,outline='#30325a',width=7)
        elif badge=='△□':
            d.polygon([(510,75),(552,180),(468,180)],fill=accent)
            d.rounded_rectangle((582,90,675,183),radius=8,fill='#8a7bcd')
        elif badge=='↻':
            d.arc((500,65,640,205),30,310,fill=accent,width=18)
            d.polygon([(630,65),(645,115),(593,97)],fill=accent)
        else:
            size=100 if len(badge)<3 else 78
            d.text((568,135),badge,font=font(size),fill='#30325a',anchor='mm')
    im.save(OUT/'games'/(key+'.png'),optimize=True)


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    for folder in ['objects','games']: (OUT/folder).mkdir(parents=True,exist_ok=True)
    baseline=OUT/'baseline.json'
    if not baseline.exists():
        files=[p for p in ROOT.glob('**/*.js') if 'assets' not in p.parts and 'graphify-out' not in p.parts]
        files += list((ROOT/'api').glob('*.json'))
        baseline.write_text(json.dumps({str(p.relative_to(ROOT)).replace('\\','/'):hashlib.sha256(p.read_bytes()).hexdigest() for p in files},indent=2),encoding='utf-8')
    for i,key in enumerate(ASSETS):
        render(key)
        print(f'Objeto {i+1}/{len(ASSETS)}: {key}',flush=True)
    catalog=json.loads((ROOT/'api/games.json').read_text(encoding='utf-8-sig'))
    by_folder={Path(unquote(g['href']).lstrip('/')).parent.name:g for g in catalog['games']}
    games={}
    for folder,parts,badge,accent,cover_symbol,guards in RECIPES:
        game=by_folder[folder];key=game['slug']
        make_hero(key,parts,badge,accent)
        games[folder]={'key':key,'title':game['title'],'hero':'games/'+key+'.webp','objects':parts,'accent':accent,'coverSymbol':cover_symbol,'guards':guards}
    for png in list((OUT/'objects').glob('*.png'))+list((OUT/'games').glob('*.png')):
        webp = png.with_suffix('.webp')
        if not webp.exists() or webp.stat().st_mtime < png.stat().st_mtime:
            with Image.open(png) as image: image.save(webp,quality=92,method=6)
    manifest={'version':1,'license':'Kenney CC0 models (source licenses retained); original Sphinx SVG from the existing game','resolution':512,'supersampling':2,'assets':{key:{'file':'objects/'+key+'.webp','pack':s['pack'],'model':s['model'],'source':str(s['source'].relative_to(ROOT)).replace('\\','/'),'assembly':s.get('assembly'),'camera':s.get('camera',[6,4,8])} for key,s in ASSETS.items()},'emoji':EMOJI,'games':games}
    (OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    (ROOT/'utils/visual-manifest.js').write_text('// Generated by scripts/build-visual-library.py. Original models: Kenney CC0.\nwindow.HYArtwork = '+json.dumps(manifest,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
    print(f'Concluído: {len(ASSETS)} objetos, {len(games)} capas/ícones.',flush=True)


if __name__=='__main__':main()
