/* Verify real-model export at multiple angles and save visual QA fixtures. */
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const dir=path.join(root,'tools/3DSVG');
const {make}=require(path.join(dir,'blockie-svg.js'));
const context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(dir,'blockie-model-data.js'),'utf8'),context);
const out=process.argv[2];if(out)fs.mkdirSync(out,{recursive:true});
function options(model,yaw,pitch){
  const x=[Math.cos(yaw),0,-Math.sin(yaw)],y=[-Math.sin(pitch)*Math.sin(yaw),Math.cos(pitch),-Math.sin(pitch)*Math.cos(yaw)],z=[Math.cos(pitch)*Math.sin(yaw),Math.sin(pitch),Math.cos(pitch)*Math.cos(yaw)];
  const eye=model.center.map((v,i)=>v+z[i]*model.radius*3.5);
  const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
  const view=[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1];
  const f=1/Math.tan(Math.PI/8),a=.01,b=100;
  const p=[f,0,0,0,0,f,0,0,0,0,(b+a)/(a-b),-1,0,0,2*b*a/(a-b),0];
  const matrix=Array(16).fill(0);
  for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)matrix[c*4+r]+=p[k*4+r]*view[c*4+k];
  return {matrix,eye,width:1024,height:1024};
}
let count=0;
for(const model of context.window.BLOCKIE_MODELS){
  for(const [i,angles] of [[.52,.34],[0,0],[Math.PI,0],[1.8,1.25],[-1,-1.1],[3.4,.6]].entries()){
    for(const wire of [false,true]){
      const svg=make(model,{...options(model,...angles),wire});
      assert(svg.includes('<path'));
      assert(!/NaN|Infinity|<image|base64|<script|<foreignObject/.test(svg));
      assert(!/fill="(?:white|#fff|#ffffff)"/.test(svg));
      assert(svg.length<2000000);
      if(out&&!wire&&(i===0||i===4))fs.writeFileSync(path.join(out,model.id+'-'+i+'.svg'),svg);
      count++;
    }
  }
}
// A rear red triangle must be painted before a blue triangle in front.
const overlap={label:'Depth test',positions:[-.5,-.5,-1,.5,-.5,-1,0,.5,-1,-.5,-.5,0,.5,-.5,0,0,.5,0],normals:Array(6).fill([0,0,1]).flat(),colours:[1,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,1],indices:[3,4,5,0,1,2]};
const identity=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
const svg=make(overlap,{matrix:identity,eye:[0,0,3],width:100,height:100});
const fills=Array.from(svg.matchAll(/fill="(#[a-f0-9]{6})"/g),m=>m[1]);
assert.equal(fills.length,2);
assert.match(fills[0],/^#[a-f0-9]{2}0000$/);
assert.match(fills[1],/^#0000[a-f0-9]{2}$/);
console.log('OK:',count,'model/angle/style exports; vector paths only; depth ordering fixture.');
