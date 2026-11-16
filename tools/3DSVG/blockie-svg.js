/* True vector projection of the authored mesh. BSP ordering resolves overlapping
 * surfaces; SVG contains only paths, never an embedded screenshot or bitmap. */
(function(root){
  'use strict';
  const EPS=0.000001;
  const sub=(a,b)=>a.map((v,i)=>v-b[i]);
  const dot=(a,b)=>a.reduce((v,n,i)=>v+n*b[i],0);
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const unit=a=>{const length=Math.hypot(...a);return a.map(v=>v/(length||1));};
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
  function plane(poly){const n=unit(cross(sub(poly.points[1],poly.points[0]),sub(poly.points[2],poly.points[0])));return {n,d:dot(n,poly.points[0])};}
  function split(poly,cut){
    const distances=poly.points.map(p=>dot(cut.n,p)-cut.d);
    const positive=distances.some(d=>d>EPS),negative=distances.some(d=>d<-EPS);
    if(!positive&&!negative)return {same:poly};
    if(!negative)return {front:poly};
    if(!positive)return {back:poly};
    const front=[],back=[];
    poly.points.forEach((p,i)=>{
      const j=(i+1)%poly.points.length,q=poly.points[j],a=distances[i],b=distances[j];
      if(a>=-EPS)front.push(p);if(a<=EPS)back.push(p);
      if((a>EPS&&b<-EPS)||(a<-EPS&&b>EPS)){
        const t=a/(a-b),intersection=p.map((v,k)=>v+(q[k]-v)*t);
        front.push(intersection);back.push(intersection);
      }
    });
    return {front:{...poly,points:front},back:{...poly,points:back}};
  }
  function tree(polygons){
    if(!polygons.length)return null;
    const cut=plane(polygons[0]),same=[],front=[],back=[];
    polygons.forEach(p=>{const s=split(p,cut);if(s.same)same.push(s.same);if(s.front)front.push(s.front);if(s.back)back.push(s.back);});
    return {cut,same,front:tree(front),back:tree(back)};
  }
  function ordered(node,eye,out){
    if(!node)return;
    const side=dot(node.cut.n,eye)-node.cut.d;
    ordered(side>=0?node.back:node.front,eye,out);
    out.push(...node.same);
    ordered(side>=0?node.front:node.back,eye,out);
  }
  function colour(rgb,normal){
    const n=unit(normal),key=Math.max(dot(n,unit([-3,5,4])),0),fill=Math.max(dot(n,unit([4,2,-1])),0);
    return '#'+rgb.map(c=>Math.round(Math.min(1,Math.pow(Math.pow(c,2.2)*(.64+.48*key+.16*fill),1/2.2))*255).toString(16).padStart(2,'0')).join('');
  }
  function make(model,options){
    const {matrix,eye,width,height,wire=false}=options,polygons=[];
    for(let i=0;i<model.indices.length;i+=3){
      const ids=model.indices.slice(i,i+3),points=ids.map(id=>model.positions.slice(id*3,id*3+3));
      const normal=cross(sub(points[1],points[0]),sub(points[2],points[0]));
      if(Math.hypot(...normal)<EPS)continue;
      if(!wire&&dot(normal,sub(eye,points[0]))<=EPS)continue;
      const id=ids[0],fill=colour(model.colours.slice(id*3,id*3+3),model.normals.slice(id*3,id*3+3));
      polygons.push({points,fill});
    }
    if(!polygons.length)throw new Error('Nenhuma face visível para exportar.');
    const sorted=[];
    if(wire)sorted.push(...polygons);else ordered(tree(polygons),eye,sorted);
    function project(p){
      const v=[...p,1],clip=[0,0,0,0];
      for(let r=0;r<4;r++)for(let c=0;c<4;c++)clip[r]+=matrix[c*4+r]*v[c];
      if(clip[3]<=0)throw new Error('Afaste a câmera para exportar este ângulo.');
      return [(clip[0]/clip[3]+1)*width/2,(1-clip[1]/clip[3])*height/2];
    }
    const projected=sorted.map(p=>({...p,points:p.points.map(project)}));
    let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
    projected.forEach(poly=>poly.points.forEach(([x,y])=>{minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}));
    const pad=Math.max(maxX-minX,maxY-minY)*.035;
    const w=maxX-minX+2*pad,h=maxY-minY+2*pad;
    const round=v=>Number(v.toFixed(4));
    const paths=projected.map(poly=>{
      const d=poly.points.map(([x,y],i)=>(i?'L':'M')+round(x-minX+pad)+' '+round(y-minY+pad)).join(' ')+'Z';
      return wire?'<path d="'+d+'" fill="none" stroke="#2b3d5c" stroke-width="0.6"/>':'<path d="'+d+'" fill="'+poly.fill+'" stroke="'+poly.fill+'" stroke-width="0.75" stroke-linejoin="round"/>';
    }).join('\n');
    const title=escape(model.label+' — vista 2D vetorial');
    return '<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="'+round(w)+'" height="'+round(h)+'" viewBox="0 0 '+round(w)+' '+round(h)+'" role="img" aria-labelledby="title" shape-rendering="geometricPrecision">\n<title id="title">'+title+'</title>\n<desc>Projeção vetorial da geometria 3D. Fundo transparente. Sem imagens rasterizadas.</desc>\n'+paths+'\n</svg>\n';
  }
  const api={make};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.BlockieSVG=api;
})(typeof window==='undefined'?{}:window);
