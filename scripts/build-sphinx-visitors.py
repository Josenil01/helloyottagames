"""Blender batch conversion of existing Kenney characters for the Sphinx game."""
import sys,runpy
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];TOOL=ROOT/'tools/3DSVG';out=TOOL/'.cache/sphinx-visitors';out.mkdir(exist_ok=True)
for gender in ['female','male']:
 for letter in 'abcdef':
  name='character-'+gender+'-'+letter;folder=TOOL/'Repository/Kenney/kenney_mini-characters'/name
  sys.argv=['blender','--',str(folder/'OBJ format'/(name+'.obj')),str(out/(name+'.json')),'--root',str(folder)]
  runpy.run_path(str(TOOL/'convert_model.py'),run_name='__main__')
