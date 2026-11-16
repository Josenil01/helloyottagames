/* 3DSVG local library and import workflow. File data never leaves localhost. */
(async function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const builtin=window.BLOCKIE_MODELS.slice();
  let catalog=[],backend=false,limit=80,sequence=0,noticeTimer,currentItem=null;
  const pretty=pack=>pack.replace(/^kenney_/,'').replace(/[_-]/g,' ');
  function notice(text){$('notice').textContent=text;$('notice').hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('notice').hidden=true,10000);}
  async function request(url,options){const r=await fetch(url,options),data=await r.json();if(!r.ok)throw new Error(data.error||'Não foi possível concluir a operação.');return data;}
  function packs(){
    const selected=$('pack').value;$('pack').replaceChildren(new Option('Todos os pacotes',''));
    Array.from(new Set(catalog.map(m=>m.pack))).sort().forEach(pack=>$('pack').add(new Option(pretty(pack),pack)));
    $('pack').value=Array.from($('pack').options).some(o=>o.value===selected)?selected:'';
  }
  function filtered(){const q=$('search').value.trim().toLocaleLowerCase('pt-BR'),pack=$('pack').value;return catalog.filter(m=>(!pack||m.pack===pack)&&(!q||(m.name+' '+m.pack+' '+(m.relativeFolder||'')).toLocaleLowerCase('pt-BR').includes(q)));}
  function list(){
    const items=filtered(),count=new Set(items.map(m=>m.pack)).size;$('library-count').textContent=items.length.toLocaleString('pt-BR')+(items.length===1?' modelo':' modelos')+' · '+count+(count===1?' pacote':' pacotes');
    const fragment=document.createDocumentFragment();
    items.slice(0,limit).forEach(item=>{
      const button=document.createElement('button');button.className='asset-item';button.type='button';button.setAttribute('role','listitem');button.dataset.id=item.id;
      button.setAttribute('aria-pressed',String($('blockie-canvas').dataset.model===item.id));
      button.title=item.relativeFolder||item.name;
      if(item.preview){const img=document.createElement('img');img.src=item.preview;img.alt='';img.loading='lazy';button.appendChild(img);}
      else{const icon=document.createElement('span');icon.className='asset-placeholder';icon.textContent='◇';button.appendChild(icon);}
      const text=document.createElement('span'),name=document.createElement('strong'),pack=document.createElement('small');
      name.textContent=item.name;pack.textContent=pretty(item.pack)+' · '+item.formats.join(' / ').toUpperCase();text.append(name,pack);button.appendChild(text);
      button.addEventListener('click',()=>open(item));fragment.appendChild(button);
    });
    if(!items.length){const p=document.createElement('p');p.className='muted';p.textContent='Nenhum modelo encontrado para esta busca.';fragment.appendChild(p);}
    $('asset-list').replaceChildren(fragment);$('more').hidden=items.length<=limit;
  }
  async function open(item,variant='',pose=null,preserveView=false){
    const token=++sequence;
    $('busy').hidden=false;$('busy-text').textContent='Abrindo '+item.name+'…';$('export-status').textContent='';
    try{
      const query=new URLSearchParams();if($('simplify').checked)query.set('simplify','1');if(variant)query.set('variant',variant);
      if(pose!==null)query.set('pose',JSON.stringify(pose));
      const packet=item.builtin?builtin.find(m=>m.id===item.id):await request('/api/model/'+item.id+'?'+query.toString());
      if(token!==sequence)return;
      window.ThreeDSVGViewer.load(packet,preserveView);$('model-title').textContent=item.name;
      currentItem=item;
      const formats=$('source-variant');formats.replaceChildren();
      (item.variants||[]).forEach(v=>formats.add(new Option(v.format.toUpperCase()+' · '+v.name,v.id)));
      formats.value=packet.sourceVariant||'';$('variant-row').hidden=!item.variants||item.variants.length<2;
      $('model-note').textContent=(packet.simplified?'Preview simplificado de '+packet.sourceTriangles.toLocaleString('pt-BR')+' para '+packet.triangles.toLocaleString('pt-BR')+' triângulos. Original preservado. ':'')+(packet.warnings||[]).join(' ')+' Cores e texturas aproximadas por face para gerar um SVG totalmente vetorial.';
      list();
      document.dispatchEvent(new CustomEvent('3dsvg-source-loaded',{detail:{packet,item,posed:pose!==null}}));
      return packet;
    }catch(error){if(token===sequence)notice(error.message);}
    finally{if(token===sequence)$('busy').hidden=true;}
  }
  async function refresh(force=true){
    try{
      const status=await request('/api/status');backend=true;
      catalog=await request(force?'/api/catalog?refresh=1':'/api/catalog');
      $('connection').textContent=status.blender?'Biblioteca local conectada · Blender disponível':'Blender não encontrado';
      packs();list();
    }catch(error){backend=false;catalog=builtin.map(m=>({id:m.id,name:m.label,pack:'3DSVG · Demonstração',formats:['glb'],preview:'Previews/'+m.id+'-blockie.png',builtin:true}));packs();list();$('connection').textContent='Modo demonstração · Abra Iniciar-3DSVG.cmd para acessar o acervo';}
  }
  async function upload(files){
    if(!files.length)return;
    if(!backend){notice('Abra Iniciar-3DSVG.cmd para importar modelos usando o Blender local.');return;}
    const allowed=/\.(glb|gltf|obj|mtl|fbx|blend|bin|png|jpe?g|webp|tga|bmp|hdr|exr|txt|json)$/i;
    const selected=Array.from(files).filter(file=>allowed.test(file.name)&&!(file.webkitRelativePath||file.name).split('/').some(p=>p.startsWith('.')||p==='node_modules'||p==='__pycache__'));
    if(!selected.some(file=>/\.(glb|gltf|obj|fbx|blend)$/i.test(file.name))){notice('Nenhum modelo 3D foi encontrado na seleção.');return;}
    if(selected.some(file=>file.size>190*1024*1024)){notice('Um arquivo excede o limite de 190 MB por arquivo. Escolha uma versão mais leve.');return;}
    const rootName=selected[0].webkitRelativePath?selected[0].webkitRelativePath.split('/')[0]:'Arquivos avulsos';
    let existingRoot=null;
    if(selected[0].webkitRelativePath){
      let roots=[];
      try{roots=(await request('/api/roots')).filter(root=>root.name===rootName);}catch(error){notice(error.message);return;}
      if(roots.length){
        const dialog=$('repository-dialog'),select=$('root-target');select.replaceChildren(new Option('Adicionar como nova pasta',''));
        roots.forEach(root=>select.add(new Option('Atualizar '+root.name+' · '+new Date(root.updated*1000).toLocaleString('pt-BR'),root.id)));
        $('root-name').textContent=rootName;
        const decision=new Promise(resolve=>dialog.addEventListener('close',()=>resolve(dialog.returnValue==='continue'?select.value:null),{once:true}));
        dialog.returnValue='cancel';dialog.showModal();existingRoot=await decision;if(existingRoot===null)return;
      }
    }
    $('busy').hidden=false;$('busy-text').textContent='Preparando importação da pasta…';
    try{
      const session=await request('/api/import/start',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:rootName,existingRoot})});
      let sent=0,batch=[],bytes=0;
      async function flush(){
        if(!batch.length)return;
        const data=new FormData();batch.forEach(file=>data.append('files',file,file.webkitRelativePath||file.name));
        await request('/api/import/files?session='+session.session,{method:'POST',body:data});
        sent+=batch.length;$('busy-text').textContent='Copiando arquivos: '+sent.toLocaleString('pt-BR')+' de '+selected.length.toLocaleString('pt-BR')+'…';batch=[];bytes=0;
      }
      for(const file of selected){if(batch.length>=80||bytes+file.size>16*1024*1024)await flush();batch.push(file);bytes+=file.size;}
      await flush();$('busy-text').textContent='Organizando modelos, formatos e texturas…';
      const items=await request('/api/import/finish?session='+session.session,{method:'POST'});
      catalog.push(...items);packs();$('pack').value=items[0].pack;$('search').value='';list();notice(items.length+' modelos adicionados ao repositório local.');await open(items[0]);
    }
    catch(error){notice(error.message);}finally{$('busy').hidden=true;}
  }
  $('search').addEventListener('input',()=>{limit=80;list();});$('pack').addEventListener('change',()=>{limit=80;list();});
  $('source-variant').addEventListener('change',()=>{if(currentItem)open(currentItem,$('source-variant').value);});
  $('more').addEventListener('click',()=>{limit+=80;list();});$('refresh').addEventListener('click',refresh);
  $('open-files').addEventListener('click',()=>$('file-input').click());$('open-folder').addEventListener('click',()=>$('folder-input').click());
  ['file-input','folder-input'].forEach(id=>$(id).addEventListener('change',event=>{upload(event.target.files);event.target.value='';}));
  const stage=$('drop-zone');stage.addEventListener('dragover',event=>{event.preventDefault();stage.classList.add('drag-over');});
  stage.addEventListener('dragleave',()=>stage.classList.remove('drag-over'));
  stage.addEventListener('drop',event=>{event.preventDefault();stage.classList.remove('drag-over');upload(event.dataTransfer.files);});
  document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{const [a,e]=button.dataset.view.split(',').map(Number);window.ThreeDSVGViewer.view(a,e);}));
  document.addEventListener('3dsvg-model',event=>{$('model-title').textContent=event.detail.label;});
  window.ThreeDSVGStudio={applyPose(pose){return currentItem?open(currentItem,$('source-variant').value,pose,true):Promise.resolve(null);}};
  await refresh(false);
})();
