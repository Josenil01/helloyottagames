/* Pose controls use the selected model's real bones and embedded animations. */
(()=>{
 'use strict';
 const presets=[['original','Original','','Sem ajustes'],['idle','Em pé','idle','Postura de descanso'],['walk','Caminhando','walk','Passo de caminhada'],['sprint','Correndo','sprint','Passo de corrida'],['jump','Saltando','jump','Salto'],['crouch','Agachado','crouch','Postura baixa'],['sit','Sentado','sit','Postura sentada'],['interact-left','Interagindo','interact-left','Braço em interação'],['emote-yes','Celebrando','emote-yes','Gesto afirmativo'],['die','Caído','die','Pose de queda']];
 const panel=document.createElement('section');panel.className='pose-panel';panel.setAttribute('aria-labelledby','poses-title');
 panel.innerHTML='<span class="eyebrow">DÊ VIDA AO MODELO</span><h3 id="poses-title">Poses do personagem</h3><p id="pose-help" class="hint">Abra um GLB ou projeto com esqueleto para escolher poses.</p><div id="pose-content" hidden><p class="hint">Exemplos com character-female-d. Cada pose é aplicada ao modelo aberto, usando suas próprias animações.</p><div id="pose-gallery" class="pose-gallery"></div><fieldset id="pose-controls"><legend>Ajuste a pose</legend><div class="pose-fields"><label>Animação do arquivo<select id="pose-action"><option value="">Pose original</option></select></label><label>Instante da animação <output id="pose-time-value">50%</output><input id="pose-time" type="range" min="0" max="100" value="50"></label></div><details><summary>Ajustar ossos individualmente</summary><label for="pose-bone">Parte do personagem</label><select id="pose-bone"></select><div class="bone-sliders"></div><button id="pose-clear-bone" type="button">Zerar esta parte</button></details><div class="pose-actions"><button id="pose-apply" class="primary" type="button">Aplicar pose</button><button id="pose-reset" type="button">Restaurar pose original</button></div></fieldset></div><p id="pose-status" class="hint" role="status"></p>';
 document.querySelector('.export-panel').before(panel);
 const $=id=>document.getElementById(id);let rig=null,bones={},revision=0,applying=false,applied='original';
 const axisNames=['X','Y','Z'];
 axisNames.forEach((name,i)=>{
  const label=document.createElement('label');label.textContent='Rotação '+name+' ';const output=document.createElement('output');output.id='pose-angle-value-'+i;output.textContent='0°';
  const input=document.createElement('input');input.type='range';input.min='-180';input.max='180';input.step='5';input.value='0';input.id='pose-angle-'+i;input.setAttribute('aria-label','Rotação '+name);
  input.addEventListener('input',()=>{output.textContent=input.value+'°';if($('pose-bone').value){const angles=bones[$('pose-bone').value]||[0,0,0];angles[i]=Number(input.value);bones[$('pose-bone').value]=angles;}});
  label.append(output,input);panel.querySelector('.bone-sliders').append(label);
 });
 function showAngles(){axisNames.forEach((_,i)=>{$('pose-angle-'+i).value=(bones[$('pose-bone').value]||[0,0,0])[i];$('pose-angle-value-'+i).textContent=$('pose-angle-'+i).value+'°';});}
 function gallery(){
  $('pose-gallery').replaceChildren();
  for(const [id,label,action,description] of presets){
   const available=!action||rig.actions.some(a=>a.name===action),article=document.createElement('article');article.className='pose-card';
   const img=document.createElement('img');img.src='pose-previews/'+id+'.svg';img.alt='Exemplo da pose '+label;img.loading='lazy';
   const title=document.createElement('h4');title.textContent=label;const text=document.createElement('p');text.textContent=available?description:'Animação ausente neste modelo';
   const button=document.createElement('button');button.type='button';button.textContent='Usar '+label;button.disabled=!available||applying;button.dataset.pose=id;button.setAttribute('aria-pressed',String(applied===id));
   button.addEventListener('click',async()=>{$('pose-action').value=action;$('pose-time').value=id==='die'?'100':['walk','sprint','emote-yes'].includes(id)?'25':'50';$('pose-time-value').textContent=$('pose-time').value+'%';bones={};showAngles();await apply(id);});
   article.append(img,title,text,button);$('pose-gallery').append(article);
  }
 }
 async function apply(preset='custom'){
  if(!rig||applying)return;
  const token=revision;applying=true;$('pose-controls').disabled=true;gallery();$('pose-status').textContent='Preparando a pose…';$('viewer-svg').disabled=true;
  const clean=Object.fromEntries(Object.entries(bones).filter(([,angles])=>angles.some(a=>a!==0)));
  try{
   const packet=await window.ThreeDSVGStudio.applyPose({action:$('pose-action').value,time:Number($('pose-time').value)/100,bones:clean});
   if(token!==revision)return;
   if(packet){applied=preset;$('pose-status').textContent='Pose aplicada. Gire o modelo e baixe o SVG no ângulo desejado.';}
   else $('pose-status').textContent='Não foi possível aplicar. O preview anterior foi mantido.';
  }catch(error){if(token===revision)$('pose-status').textContent=error.message;}
  finally{if(token===revision){applying=false;$('pose-controls').disabled=false;$('viewer-svg').disabled=false;gallery();}}
 }
 $('pose-action').addEventListener('change',()=>{$('pose-status').textContent='Clique em Aplicar pose para atualizar o preview.';});
 $('pose-time').addEventListener('input',()=>{$('pose-time-value').textContent=$('pose-time').value+'%';});
 $('pose-bone').addEventListener('change',showAngles);
 $('pose-clear-bone').addEventListener('click',()=>{delete bones[$('pose-bone').value];showAngles();});
 $('pose-apply').addEventListener('click',()=>apply());
 $('pose-reset').addEventListener('click',async()=>{bones={};$('pose-action').value='';$('pose-time').value='50';$('pose-time-value').textContent='50%';showAngles();await apply('original');});
 document.addEventListener('3dsvg-source-loaded',event=>{
  const {packet,posed}=event.detail;if(posed)return;
  revision++;applying=false;$('viewer-svg').disabled=false;rig=packet.rig;bones={};applied='original';$('pose-controls').disabled=false;
  $('pose-content').hidden=!rig||!rig.rigs.length;$('pose-status').textContent='';
  $('pose-help').textContent=rig&&rig.rigs.length?'Escolha uma pose pronta ou ajuste os controles. O arquivo original é preservado.':'Este formato não tem esqueleto. Abra a versão GLB, FBX ou Blender com rig; OBJ é estático.';
  if(!rig||!rig.rigs.length)return;
  $('pose-action').replaceChildren(new Option('Pose original',''));rig.actions.forEach(a=>$('pose-action').add(new Option(a.name,a.name)));
  const partNames={'root':'Corpo inteiro','torso':'Tronco','head':'Cabeça','arm-left':'Braço esquerdo','arm-right':'Braço direito','leg-left':'Perna esquerda','leg-right':'Perna direita'};
  $('pose-bone').replaceChildren();rig.rigs.forEach(r=>r.bones.forEach(b=>{const label=partNames[b.name]||b.name;$('pose-bone').add(new Option(rig.rigs.length>1?r.name+' · '+label:label,b.id));}));
  $('pose-time').value='50';$('pose-time-value').textContent='50%';showAngles();gallery();
 });
})();
