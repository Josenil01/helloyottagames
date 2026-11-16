import * as THREE from 'three';
import {GLTFLoader} from './vendor/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from './vendor/examples/jsm/controls/OrbitControls.js';
import {eyes,mouths,presets,defaults,faceSVG,validate} from './faces.js';
const $=id=>document.getElementById(id), storageKey='helloyotta.square-avatar.v1';
let config=structuredClone(defaults),tab='expressions',model,texture,ticket=0,exporting=false;
try{const saved=JSON.parse(localStorage.getItem(storageKey));if(validate(saved))config=saved;}catch{}
const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
const ctx=canvas.getContext('2d');
const renderer=new THREE.WebGLRenderer({canvas:$('canvas'),alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.01,100),controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;controls.minDistance=2;controls.maxDistance=10;
scene.add(new THREE.HemisphereLight(0xffffff,0xaaa0b0,2));const light=new THREE.DirectionalLight(0xffffff,2.5);light.position.set(3,5,5);scene.add(light);
const center=new THREE.Vector3(0,1.15,0);
function view(id){const positions={front:[0,.12,4.7],reset:[2.3,1.2,4.5],back:[0,.12,-4.7]};camera.position.copy(center).add(new THREE.Vector3(...positions[id]));controls.target.copy(center);controls.update();}view('reset');
new ResizeObserver(()=>{const w=$('stage').clientWidth,h=$('stage').clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}).observe($('stage'));
renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera);});
const svgURL=c=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(faceSVG(c));
function thumbnail(c){const img=new Image();img.src=svgURL(c);img.alt='';return img;}
function renderOptions(){
 $('options').replaceChildren();document.querySelectorAll('[data-tab]').forEach(b=>{b.classList.toggle('active',b.dataset.tab===tab);b.setAttribute('aria-pressed',String(b.dataset.tab===tab));});
 $('section-title').textContent={expressions:'Escolha uma expressão',eyes:'Olhos que dizem tudo',mouth:'Um sorriso do seu jeito',colors:'Escolha suas cores'}[tab];
 $('section-description').textContent=tab==='expressions'?'Comece com uma combinação e ajuste os olhos e a boca como quiser.':tab==='colors'?'A mesma geometria, com a sua combinação de cores.':'Combine livremente. O nariz permanece igual em todas as opções.';
 if(tab==='colors'){
  for(const [id,label] of Object.entries({skin:'Pele',hair:'Cabelo',shirt:'Camiseta',pants:'Calça',shoes:'Sapatos e cinto'})){
   const wrap=document.createElement('label');wrap.className='color-field';wrap.textContent=label;const input=document.createElement('input');input.type='color';input.value=config.colors[id];input.setAttribute('aria-label',label);input.addEventListener('input',()=>{config.colors[id]=input.value;apply();});wrap.append(input);$('options').append(wrap);
  }return;
 }
 const list=tab==='expressions'?presets.map(([label,e,m])=>({label,e,m})):Object.entries(tab==='eyes'?eyes:mouths).map(([id,[label]])=>({label,e:tab==='eyes'?id:config.eyes,m:tab==='mouth'?id:config.mouth}));
 for(const row of list){const button=document.createElement('button');button.className='option';button.type='button';button.setAttribute('aria-pressed',String(config.eyes===row.e&&config.mouth===row.m));const label=document.createElement('span');label.textContent=row.label;button.append(thumbnail({...config,eyes:row.e,mouth:row.m}),label);button.addEventListener('click',()=>{config.eyes=row.e;config.mouth=row.m;renderOptions();apply();});$('options').append(button);}
}
async function atlas(c){
 const image=new Image();image.src=svgURL(c);await image.decode();
 const out=document.createElement('canvas');out.width=out.height=512;const x=out.getContext('2d');x.fillStyle=c.colors.skin;x.fillRect(0,0,512,512);
 const palette=[c.colors.skin,c.colors.hair,c.colors.shirt,c.colors.pants,c.colors.shoes,'#b89047','#30251f'];palette.forEach((color,i)=>{x.fillStyle=color;x.fillRect(320,512-(i+1)*64,192,64);});
 x.drawImage(image,0,256,256,256);return out;
}
async function apply(){
 const id=++ticket,snapshot=structuredClone(config);try{const image=await atlas(snapshot);if(id!==ticket)return;ctx.drawImage(image,0,0);if(texture)texture.needsUpdate=true;try{localStorage.setItem(storageKey,JSON.stringify(snapshot));}catch{}if(model&&!exporting)$('status').textContent='1 malha · 1 material · 180 triângulos · nariz fixo';}catch(e){$('status').textContent='Não foi possível atualizar a aparência: '+e.message;}
}
function save(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
$('config').onclick=()=>save(new Blob([JSON.stringify(config,null,2)],{type:'application/json'}),'avatar.json');
$('restore').onclick=()=>{config=structuredClone(defaults);renderOptions();apply();};
$('download').onclick=async()=>{
 exporting=true;$('download').disabled=true;$('status').textContent='Preparando os quatro formatos…';
 try{const snapshot=structuredClone(config),image=await atlas(snapshot);const response=await fetch('api/export',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({config:snapshot,atlas:image.toDataURL('image/png').split(',')[1]})});if(!response.ok){const message=await response.text();throw new Error(message);}save(await response.blob(),'avatar-helloyotta.zip');$('status').textContent='Pacote pronto. O download contém a aparência selecionada.';}catch(e){$('status').textContent='Não foi possível exportar: '+e.message;}finally{exporting=false;$('download').disabled=false;}
};
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;renderOptions();});document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>view(b.dataset.view));
renderOptions();
try{const gltf=await new GLTFLoader().loadAsync('library/base.glb');model=gltf.scene;texture=new THREE.CanvasTexture(canvas);texture.flipY=false;texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);model.traverse(o=>{if(o.isMesh){o.material.map?.dispose();o.material.map=texture;o.material.needsUpdate=true;}});scene.add(model);await apply();$('download').disabled=false;}catch(e){$('status').textContent='Não foi possível carregar o modelo: '+e.message;}
