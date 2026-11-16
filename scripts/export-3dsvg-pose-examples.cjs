const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),tool=path.join(root,'tools/3DSVG');
const {make}=require(path.join(tool,'blockie-svg.js'));
const code=fs.readFileSync(path.join(root,'scripts/export-game-svg.cjs'),'utf8');
const options=vm.runInNewContext('('+code.slice(code.indexOf('function options('),code.indexOf('const xmlEscape'))+')');
const source=path.join(tool,'.cache/pose-examples'),out=path.join(tool,'pose-previews');fs.mkdirSync(out,{recursive:true});
for(const name of ['original','idle','walk','sprint','jump','crouch','sit','interact-left','emote-yes','die']){
 const model=JSON.parse(fs.readFileSync(path.join(source,name+'.json'),'utf8'));const svg=make(model,options(model,[3,2,8]));
 if(/NaN|Infinity|<image/.test(svg))throw Error(name);fs.writeFileSync(path.join(out,name+'.svg'),svg);
}
fs.copyFileSync(path.join(tool,'Repository/Kenney/kenney_mini-characters/License.txt'),path.join(out,'License-Kenney.txt'));
console.log('10 real pose thumbnails exported through 3DSVG.');
if(process.argv[2]){
 const sharp=require(require.resolve('sharp',{paths:[process.argv[2]]}));
 (async()=>{const images=[];let i=0;for(const name of ['original','idle','walk','sprint','jump','crouch','sit','interact-left','emote-yes','die']){
  images.push({input:await sharp(path.join(out,name+'.svg')).resize(190,210,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer(),left:i%5*200+5,top:Math.floor(i/5)*250});
  images.push({input:await sharp(Buffer.from('<svg width="200" height="30"><text x="100" y="20" text-anchor="middle" font-family="Arial" font-size="14">'+name+'</text></svg>')).png().toBuffer(),left:i%5*200,top:Math.floor(i/5)*250+215});i++;
 }await sharp({create:{width:1000,height:500,channels:4,background:'#edf2f7'}}).composite(images).png().toFile(path.join(source,'contact.png'));})();
}
