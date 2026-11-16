from pathlib import Path
root=Path(__file__).resolve().parents[1];path=root/'tools/3DSVG/index.html'
text=path.read_text(encoding='utf-8')
if 'poses.css' not in text:text=text.replace('</head>','<link rel="stylesheet" href="poses.css?v=1"><script defer src="poses.js?v=1"></script></head>')
text=text.replace('src="studio.js"','src="studio.js?v=poses-1"').replace('src="blockie-viewer.js"','src="blockie-viewer.js?v=poses-1"')
path.write_text(text,encoding='utf-8')
