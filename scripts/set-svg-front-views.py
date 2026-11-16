"""Record the individually inspected front directions for the current game assets.

The four-axis contact sheets were reviewed before choosing these directions.
Only run to recreate this reviewed mapping; new assets require visual inspection.
"""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
jobs=json.loads((ROOT/'tools/3DSVG/.cache/game-svg/jobs.json').read_text(encoding='utf-8'))
positive_x={'food-banana','food-bread','food-cherries','food-croissant','food-cup-coffee','food-fish','food-lollypop','food-chocolate','food-bottle-oil','factory','flag','bridge'}
negative_z={'spaceship','astronaut','alien','rover','satellite','cash-register','house'}
negative_x={'horse'}
top_readable={'keyboard','mouse','food-donut','food-pizza','food-cookie','food-cheese','food-pot','gear','road','island','pirate-patch-sand-foliage','pirate-patch-sand','pirate-patch-grass'}
views={}
for key,item in jobs.items():
    if key in positive_x:camera=[8,2,0];front='+X'
    elif key in negative_z:camera=[0,2,-8];front='-Z'
    elif key in negative_x:camera=[-8,2,0];front='-X'
    else:camera=[0,2,8];front='+Z'
    if key in top_readable:camera[1]=5
    # Keep depth readable for solids without a unique front and the horse muzzle.
    if key in {'cube','cylinder'}:camera=[3,3,8]
    if key=='horse':camera=[-8,2,3]
    if key.startswith('sphinx'):camera=[1.2,2,8]
    views[key]={'camera':camera,'front':front,'pack':item['pack'],'model':item['model']}
report={'version':1,'description':'Front directions visually checked in four-axis contact sheets; camera faces the object front, never the rear. Symmetric objects use a consistent main face.','views':views}
(ROOT/'scripts/svg-front-views.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('FRONT_VIEWS_RECORDED',len(views))
