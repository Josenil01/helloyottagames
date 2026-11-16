"""Original face drawings, reused on a shared low-poly explorer geometry."""
from pathlib import Path
from PIL import Image, ImageDraw
import json
ROOT=Path(__file__).resolve().parent
PALETTE=['#d6b68b','#50362c','#ddd1ad','#73503b','#292b29','#f0e5cd','#a88a58','#382a25']
for name,eyes,mouth in [('sorridente','happy','laugh'),('apaixonado','hearts','smile'),('surpreso','surprised','open')]:
    out=ROOT/name
    (out/'Textures').mkdir(parents=True,exist_ok=True)
    im=Image.new('RGB',(1024,1024),PALETTE[0]);d=ImageDraw.Draw(im)
    # Face tile in top-left; rasterized at 2x for antialiasing.
    def line(points,fill='#382a25',width=8):d.line(points,fill=fill,width=width,joint='curve')
    if eyes=='happy':
        for x in (155,357):
            d.arc((x-40,158,x+40,242),190,350,fill='#382a25',width=14)
            line([(x-43,136),(x+38,124)],width=12)
    elif eyes=='hearts':
        for x in (155,357):
            d.ellipse((x-48,163,x+4,213),fill='#d83d62');d.ellipse((x-4,163,x+48,213),fill='#d83d62')
            d.polygon([(x-48,195),(x+48,195),(x,250)],fill='#d83d62')
            line([(x-38,131),(x+38,131)],width=11)
    else:
        for x in (155,357):
            d.ellipse((x-36,164,x+36,246),fill='#f8f5e9')
            d.ellipse((x-18,183,x+18,231),fill='#382a25')
            d.ellipse((x-9,188,x+2,199),fill='white')
            d.arc((x-43,102,x+43,151),195,345,fill='#382a25',width=12)
    if mouth=='laugh':
        d.pieslice((177,310,335,432),0,180,fill='#382a25')
        d.rectangle((187,368,325,380),fill='#fff7df')
        d.ellipse((223,399,289,426),fill='#dc7d79')
    elif mouth=='smile':d.arc((180,315,332,403),0,180,fill='#382a25',width=10)
    else:d.ellipse((228,345,284,418),fill='#382a25')
    # Shirt front tile, drawn rather than separate button/badge meshes.
    d.rectangle((512,0,767,511),fill=PALETTE[2])
    d.rectangle((625,0,646,511),fill='#b49c74')
    for y in (150,212,274,336,398,460):d.ellipse((628,y,641,y+13),fill='#765c3f')
    d.polygon([(708,185),(729,203),(723,245),(708,258),(693,245),(687,203)],fill='#b39765')
    d.line([(708,193),(708,246)],fill='#dfcba5',width=5)
    for i,c in enumerate(PALETTE):d.rectangle((i*128,800,(i+1)*128-1,1023),fill=c)
    im.resize((512,512),Image.Resampling.LANCZOS).save(out/'Textures/atlas.png')
    (out/'avatar.json').write_text(json.dumps({'version':1,'base':'explorer-study-01','eyes':eyes,'mouth':mouth,'nose':'fixed-01','colors':dict(zip(['skin','hair','shirt','sleeves-pants','shoes','collar','badge','face'],PALETTE))},indent=2),encoding='utf-8')
print('Three original atlases created.')
