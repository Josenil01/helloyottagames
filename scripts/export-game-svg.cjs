/* Batch entry point for the same vector exporter used by the 3DSVG studio. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),tool=path.join(root,'tools/3DSVG');
const {make}=require(path.join(tool,'blockie-svg.js'));
const cache=path.join(tool,'.cache/game-svg'),out=path.join(root,'assets/image/SVG');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const manifest=read(path.join(root,'assets/visuals/manifest.json')),jobs=read(path.join(cache,'jobs.json'));
const frontViews=read(path.join(root,'scripts/svg-front-views.json')).views;
for(const d of ['objects','games','pirate','licenses'])fs.mkdirSync(path.join(out,d),{recursive:true});
function options(m,camera){
 const yaw=Math.atan2(camera[0],camera[2]),pitch=Math.atan2(camera[1],Math.hypot(camera[0],camera[2]));
 const x=[Math.cos(yaw),0,-Math.sin(yaw)],y=[-Math.sin(pitch)*Math.sin(yaw),Math.cos(pitch),-Math.sin(pitch)*Math.cos(yaw)],z=[Math.cos(pitch)*Math.sin(yaw),Math.sin(pitch),Math.cos(pitch)*Math.cos(yaw)];
 const eye=m.center.map((v,i)=>v+z[i]*m.radius*3.5),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
 const view=[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1],f=1/Math.tan(Math.PI/8),a=.01,b=100;
 const p=[f,0,0,0,0,f,0,0,0,0,(b+a)/(a-b),-1,0,0,2*b*a/(a-b),0],matrix=Array(16).fill(0);
 for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)matrix[c*4+r]+=p[k*4+r]*view[c*4+k];
 return {matrix,eye,width:1024,height:1024};
}
const xmlEscape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
function save(file,svg){assert(!/NaN|Infinity|<image\b|base64|<script\b|<foreignObject/.test(svg),file);assert(svg.includes('<path')||svg.includes('<svg'),file);fs.writeFileSync(file,svg);}
const objects={};
for(const [key,item] of Object.entries(jobs)){
 const view=frontViews[key];assert(view&&view.pack===item.pack&&view.model===item.model,'Front must be visually reviewed: '+key);
 item.camera=view.camera;
 const packet=read(path.join(cache,key+'.json')),svg=make(packet,options(packet,item.camera));
 const file=key.startsWith('pirate-')&&!manifest.assets[key]?'pirate/'+key.slice(7)+'.svg':'objects/'+key+'.svg';
 save(path.join(out,file),svg);objects[key]=svg;
 const lic=path.join(tool,'Repository/Kenney',item.pack,'License.txt');
 if(fs.existsSync(lic))fs.copyFileSync(lic,path.join(out,'licenses',item.pack+'.txt'));
 console.log('SVG',key,svg.length);
}
if(!objects.sphinx){objects.sphinx=fs.readFileSync(path.join(root,'assets/visuals/source/sphinx.svg'),'utf8');save(path.join(out,'objects/sphinx.svg'),objects.sphinx);}
function nested(svg,x,y,w,h=w){return svg.replace(/<\?xml[^>]*>/g,'').replace(/<svg\b[^>]*>/,tag=>{const vb=tag.match(/viewBox="([^"]+)"/);assert(vb);return `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${vb[1]}" preserveAspectRatio="xMidYMid meet">`;}).replace(/<title\b[^>]*>[\s\S]*?<\/title>/g,'');}
function badgeShape(b,c){
 const stroke=`fill="none" stroke="${c}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"`;
 if(b==='chart')return [65,115,155].map((h,i)=>`<rect x="${460+i*65}" y="${205-h}" width="42" height="${h}" rx="9" fill="${c}"/>`).join('');
 if(b==='clock')return `<circle cx="570" cy="133" r="88" fill="white" stroke="${c}" stroke-width="12"/><path d="M570 80V133L612 156" ${stroke}/>`;
 if(b==='venn')return `<circle cx="526" cy="134" r="68" fill="none" stroke="#508ec5" stroke-width="13"/><circle cx="620" cy="134" r="68" fill="none" stroke="#c27bce" stroke-width="13"/>`;
 if(b==='sudoku')return `<path d="M480 45H660V225H480ZM540 45V225M600 45V225M480 105H660M480 165H660" ${stroke}/><text x="508" y="94" fill="${c}" font-size="44">1</text><text x="628" y="215" fill="${c}" font-size="44">3</text>`;
 if(b==='route')return `<path d="M460 180H540V80H660" ${stroke}/>`;
 if(b==='scale')return `<path d="M570 65V205M480 100H660M525 205H615M490 103L458 170H522ZM650 103L618 170H682Z" ${stroke}/>`;
 if(b==='snake')return [[470,165],[515,165],[560,165],[560,110],[615,110],[660,110]].map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="24" fill="${['#67b98b','#ffd168','#d482ac'][i%3]}"/>`).join('');
 return `<text x="568" y="142" text-anchor="middle" dominant-baseline="middle" font-family="Arial,sans-serif" font-weight="bold" font-size="${b.length<3?100:78}" fill="#30325a">${xmlEscape(b)}</text>`;
}
// Read only the literal recipe badge strings; game logic is never evaluated.
const recipeText=fs.readFileSync(path.join(root,'scripts/build-visual-library.py'),'utf8');
const badges=new Map(Array.from(recipeText.matchAll(/^ \('([^']+)', \[[^\n]+?\], '([^']*)', '#/gm),m=>[m[1],m[2]]));
for(const [folder,game] of Object.entries(manifest.games)){
 const positions=game.objects.length===1?[[40,40,688]]:game.objects.length===2?[[0,40,600],[360,350,360]]:[[0,60,560],[370,270,340],[220,450,300]];
 let body=game.objects.map((k,i)=>nested(objects[k],...positions[i])).join('\n');
 const badge=badges.get(folder);assert(badge!==undefined,folder);
 // Cards display only the model artwork; no symbol boxes overlay the objects.
 save(path.join(out,'games',game.key+'.svg'),`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 768" role="img"><title>${xmlEscape(game.title)}</title>${body}</svg>`);
 game.hero='games/'+game.key+'.svg';
}
for(const [key,item] of Object.entries(manifest.assets)){
 item.file='objects/'+key+'.svg';if(jobs[key]){item.source=jobs[key].source;item.camera=jobs[key].camera;item.front=frontViews[key].front;item.pack=jobs[key].pack;item.model=jobs[key].model;}
}
manifest.version=2;manifest.format='svg';manifest.generator='3DSVG convert_model.py + blockie-svg.js';manifest.base='../assets/image/SVG/';
manifest.cameraPolicy='Individually reviewed front views: scripts/svg-front-views.json';
manifest.license='Kenney CC0 models (licenses retained); original Hello Yotta Blockie Sphinx authored in Blender';
manifest.resolution='vector';delete manifest.supersampling;
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
fs.writeFileSync(path.join(root,'utils/visual-manifest.js'),'// Generated by scripts/export-game-svg.cjs using the 3DSVG exporter. Kenney CC0.\nwindow.HYArtwork = '+JSON.stringify(manifest)+';\n');
console.log('EXPORTED',Object.keys(objects).length,'objects/states;',Object.keys(manifest.games).length,'game cards.');
