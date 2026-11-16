/* Local contact sheets to identify each mesh's actual front, independent of axes. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const sharp=require(require.resolve('sharp',{paths:[process.argv[2]]}));
const root=path.resolve(__dirname,'..'),tool=path.join(root,'tools/3DSVG'),cache=path.join(tool,'.cache/game-svg');
const {make}=require(path.join(tool,'blockie-svg.js'));
const code=fs.readFileSync(path.join(root,'scripts/export-game-svg.cjs'),'utf8');
const options=vm.runInNewContext('('+code.slice(code.indexOf('function options('),code.indexOf('const xmlEscape'))+')');
const jobs=JSON.parse(fs.readFileSync(path.join(cache,'jobs.json'),'utf8'));
const out=path.join(cache,'front-review');fs.mkdirSync(out,{recursive:true});
(async()=>{
 let entries=Object.entries(jobs);for(let page=0;page<Math.ceil(entries.length/18);page++){
  const composites=[];let row=0;
  for(const [key] of entries.slice(page*18,(page+1)*18)){
   const model=JSON.parse(fs.readFileSync(path.join(cache,key+'.json'),'utf8'));
   const label=Buffer.from(`<svg width="180" height="140"><text x="4" y="65" font-family="Arial" font-size="13">${key}</text></svg>`);
   composites.push({input:await sharp(label).png().toBuffer(),left:0,top:row*145});
   for(const [i,camera] of [[0,2,8],[8,2,0],[0,2,-8],[-8,2,0]].entries()){
    const svg=make(model,options(model,camera));
    composites.push({input:await sharp(Buffer.from(svg)).resize(180,140,{fit:'contain'}).png().toBuffer(),left:180+i*185,top:row*145});
   }row++;
  }
  await sharp({create:{width:920,height:row*145,channels:4,background:'#f0f3f7'}}).composite(composites).png().toFile(path.join(out,'page-'+page+'.png'));
  console.log('FRONT_REVIEW',page,'columns +Z +X -Z -X');
 }
})();
