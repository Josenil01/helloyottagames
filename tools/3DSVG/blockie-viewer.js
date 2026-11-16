/* Offline WebGL viewer: actual packaged GLB geometry, no external services. */
(function () {
  'use strict';
  const canvas = document.getElementById('blockie-canvas');
  const status = document.getElementById('viewer-status');
  const models = window.BLOCKIE_MODELS;
  const builtinCount=models.length;
  const gl = canvas.getContext('webgl', {antialias:true, alpha:true});
  if (!gl || !models) {
    status.textContent = 'O preview 3D não está disponível neste navegador. As imagens e os modelos continuam disponíveis abaixo.';
    return;
  }
  const vertex = 'attribute vec3 aPosition; attribute vec3 aNormal; attribute vec3 aColour; uniform mat4 uMatrix; varying vec3 vNormal; varying vec3 vColour; void main(){vNormal=aNormal;vColour=aColour;gl_Position=uMatrix*vec4(aPosition,1.0);}';
  const fragment = 'precision mediump float; varying vec3 vNormal; varying vec3 vColour; uniform bool uWire; void main(){vec3 n=normalize(vNormal);float key=max(dot(n,normalize(vec3(-3.0,5.0,4.0))),0.0);float fill=max(dot(n,normalize(vec3(4.0,2.0,-1.0))),0.0);vec3 linear=pow(vColour,vec3(2.2));vec3 lit=pow(linear*(0.64+0.48*key+0.16*fill),vec3(1.0/2.2));gl_FragColor=vec4(uWire?vec3(0.17,0.24,0.36):lit,1.0);}';
  function shader(type, source) {
    const s=gl.createShader(type); gl.shaderSource(s,source); gl.compileShader(s);
    if (!gl.getShaderParameter(s,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  let program;
  try {
    program=gl.createProgram();
    gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex)); gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment)); gl.linkProgram(program);
    if (!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  } catch (error) { status.textContent='Não foi possível iniciar o preview 3D. Utilize os previews abaixo.'; return; }
  gl.useProgram(program); gl.enable(gl.DEPTH_TEST);
  const matrixLocation=gl.getUniformLocation(program,'uMatrix');
  const wireLocation=gl.getUniformLocation(program,'uWire');
  const buffers={}; let triangleBuffer, lineBuffer, model, wire=false, auto=false,indexType=gl.UNSIGNED_SHORT;
  let yaw=.52, pitch=.34, zoom=1, last=0, dirty=true, dragging=null;
  const pointers=new Map(); let pinch=null;
  function multiply(a,b) {
    const c=new Float32Array(16);
    for(let col=0;col<4;col++) for(let row=0;row<4;row++) for(let k=0;k<4;k++) c[col*4+row]+=a[k*4+row]*b[col*4+k];
    return c;
  }
  function cameraMatrix(aspect) {
    const cp=Math.cos(pitch), sp=Math.sin(pitch), sy=Math.sin(yaw), cy=Math.cos(yaw);
    const z=[cp*sy,sp,cp*cy], x=[cy,0,-sy], y=[-sp*sy,cp,-sp*cy];
    const distance=model.radius*3.5*zoom;
    const eye=model.center.map((v,i)=>v+z[i]*distance);
    const dot=(a,b)=>a.reduce((v,n,i)=>v+n*b[i],0);
    const view=new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);
    const f=1/Math.tan(Math.PI/8), near=.01, far=100;
    const projection=new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0]);
    return multiply(projection,view);
  }
  function attribute(name,values) {
    const buffer=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(values),gl.STATIC_DRAW);
    const location=gl.getAttribLocation(program,name); gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location,3,gl.FLOAT,false,0,0);
    buffers[name]=buffer;
  }
  function select(id) {
    model=models.find(m=>m.id===id)||models[0];
    Object.values(buffers).forEach(b=>gl.deleteBuffer(b));
    if(triangleBuffer) gl.deleteBuffer(triangleBuffer);
    if(lineBuffer) gl.deleteBuffer(lineBuffer);
    attribute('aPosition',model.positions); attribute('aNormal',model.normals); attribute('aColour',model.colours);
    const big=model.positions.length/3>65535;
    if(big&&!gl.getExtension('OES_element_index_uint'))throw new Error('Modelo grande demais para este navegador. Use a simplificação.');
    const IndexArray=big?Uint32Array:Uint16Array;indexType=big?gl.UNSIGNED_INT:gl.UNSIGNED_SHORT;
    triangleBuffer=gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,triangleBuffer); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new IndexArray(model.indices),gl.STATIC_DRAW);
    const lines=[];
    for(let i=0;i<model.indices.length;i+=3){const [a,b,c]=model.indices.slice(i,i+3);lines.push(a,b,b,c,c,a);}
    lineBuffer=gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,lineBuffer); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new IndexArray(lines),gl.STATIC_DRAW);
    document.querySelectorAll('[data-model]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.model===model.id)));
    canvas.setAttribute('aria-label','Modelo 3D: '+model.label+'. Arraste para girar; use as setas para rotação e mais ou menos para zoom.');
    status.textContent=model.label+' · '+model.triangles+' triângulos';
    canvas.dataset.model=model.id;
    reset();
    document.dispatchEvent(new CustomEvent('3dsvg-model',{detail:{label:model.label,triangles:model.triangles}}));
  }
  function reset(){yaw=.52;pitch=.34;zoom=1;dirty=true;}
  function changeZoom(factor){zoom=Math.max(.55,Math.min(2.5,zoom*factor));dirty=true;}
  document.getElementById('viewer-svg').addEventListener('click',event=>{
    const button=event.currentTarget,notice=document.getElementById('export-status');
    button.disabled=true;
    auto=false;document.getElementById('viewer-rotate').setAttribute('aria-pressed','false');
    try{
      const distance=model.radius*3.5*zoom;
      const eye=model.center.map((v,i)=>v+[Math.cos(pitch)*Math.sin(yaw),Math.sin(pitch),Math.cos(pitch)*Math.cos(yaw)][i]*distance);
      if(model.triangles>10000)throw new Error('Para exportar este modelo, ative “Simplificar para SVG” e abra-o novamente.');
      const svg=window.BlockieSVG.make(model,{matrix:cameraMatrix(canvas.clientWidth/canvas.clientHeight),eye,width:canvas.clientWidth,height:canvas.clientHeight,wire});
      const angle=Math.round(yaw*180/Math.PI),elevation=Math.round(pitch*180/Math.PI);
      const stamp=new Date().toISOString().replace(/[:.]/g,'-');
      const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));
      const link=document.createElement('a');
      const poseTag=model.pose&&(model.pose.action||Object.keys(model.pose.bones||{}).length)?'-'+(model.pose.action||'pose-manual').replace(/[^a-zA-Z0-9_-]/g,'-')+'-p'+Math.round(model.pose.time*100):'';
      link.href=url;link.download=(model.label||model.id).replace(/[^a-zA-Z0-9_-]/g,'-')+poseTag+'-a'+angle+'-e'+elevation+'-'+stamp+'.svg';
      document.body.appendChild(link);link.click();link.remove();
      setTimeout(()=>URL.revokeObjectURL(url),60000);
      notice.textContent='SVG preparado: '+model.label+', no ângulo atual, com fundo transparente.';
    }catch(error){notice.textContent='Não foi possível exportar: '+error.message;}
    finally{button.disabled=false;}
  });
  document.querySelectorAll('[data-model]').forEach(b=>b.addEventListener('click',()=>select(b.dataset.model)));
  document.getElementById('viewer-reset').addEventListener('click',reset);
  document.getElementById('viewer-in').addEventListener('click',()=>changeZoom(.85));
  document.getElementById('viewer-out').addEventListener('click',()=>changeZoom(1.18));
  document.getElementById('viewer-wire').addEventListener('click',event=>{wire=!wire;event.currentTarget.setAttribute('aria-pressed',String(wire));dirty=true;});
  document.getElementById('viewer-rotate').addEventListener('click',event=>{auto=!auto;event.currentTarget.setAttribute('aria-pressed',String(auto));});
  canvas.addEventListener('wheel',event=>{event.preventDefault();changeZoom(Math.exp(event.deltaY*.001));},{passive:false});
  canvas.addEventListener('pointerdown',event=>{canvas.focus();canvas.setPointerCapture(event.pointerId);pointers.set(event.pointerId,[event.clientX,event.clientY]);dragging=[event.clientX,event.clientY];pinch=null;});
  canvas.addEventListener('pointermove',event=>{
    if(!pointers.has(event.pointerId))return;
    pointers.set(event.pointerId,[event.clientX,event.clientY]);
    if(pointers.size===2){const p=Array.from(pointers.values());const d=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]);if(pinch)changeZoom(pinch/Math.max(d,1));pinch=d;dragging=null;}
    else if(dragging){yaw-=(event.clientX-dragging[0])*.008;pitch=Math.max(-Math.PI/2+.001,Math.min(Math.PI/2-.001,pitch+(event.clientY-dragging[1])*.008));dragging=[event.clientX,event.clientY];dirty=true;}
  });
  function end(event){pointers.delete(event.pointerId);dragging=null;pinch=null;}
  canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);canvas.addEventListener('lostpointercapture',end);
  canvas.addEventListener('keydown',event=>{
    const keys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home'];if(!keys.includes(event.key))return;event.preventDefault();
    if(event.key==='ArrowLeft')yaw-=.12;if(event.key==='ArrowRight')yaw+=.12;
    if(event.key==='ArrowUp')pitch=Math.min(Math.PI/2-.001,pitch+.12);if(event.key==='ArrowDown')pitch=Math.max(-Math.PI/2+.001,pitch-.12);
    if(event.key==='+'||event.key==='=')changeZoom(.85);if(event.key==='-')changeZoom(1.18);if(event.key==='Home')reset();dirty=true;
  });
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();status.textContent='O preview 3D foi interrompido. Recarregue a página para retomá-lo.';});
  new ResizeObserver(()=>{dirty=true;}).observe(canvas);
  window.ThreeDSVGViewer={
    load(packet,preserveView=false){
      if(!packet||!Array.isArray(packet.positions)||!packet.positions.length||packet.positions.some(v=>!Number.isFinite(v))||!Array.isArray(packet.indices)||packet.normals.length!==packet.positions.length||packet.colours.length!==packet.positions.length||packet.indices.some(i=>!Number.isInteger(i)||i<0||i>=packet.positions.length/3))throw new Error('O modelo convertido contém dados inválidos.');
      const previous=models.findIndex(m=>m.id===packet.id);
      if(previous>=0)models[previous]=packet;else models.splice(builtinCount,models.length-builtinCount,packet);
      const previousView={yaw,pitch,zoom};
      select(packet.id);
      if(preserveView){yaw=previousView.yaw;pitch=previousView.pitch;zoom=previousView.zoom;dirty=true;}
    },
    view(azimuth,elevation){yaw=azimuth*Math.PI/180;pitch=Math.max(-Math.PI/2+.001,Math.min(Math.PI/2-.001,elevation*Math.PI/180));dirty=true;},
    select
  };
  select(models[0].id);
  function frame(time){
    if(auto&&!dragging&&document.visibilityState==='visible'){yaw+=Math.min((time-last)/1000,.05)*.45;dirty=true;}
    last=time;
    if(dirty&&!gl.isContextLost()){
      const scale=Math.min(devicePixelRatio||1,2), width=Math.round(canvas.clientWidth*scale), height=Math.round(canvas.clientHeight*scale);
      if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
      gl.viewport(0,0,width,height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      gl.uniformMatrix4fv(matrixLocation,false,cameraMatrix(width/Math.max(height,1)));gl.uniform1i(wireLocation,wire?1:0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,wire?lineBuffer:triangleBuffer);
      gl.drawElements(wire?gl.LINES:gl.TRIANGLES,model.indices.length*(wire?2:1),indexType,0);
      dirty=false;canvas.dataset.ready='true';
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
