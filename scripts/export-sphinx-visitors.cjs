const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),tool=path.join(root,'tools/3DSVG');
const {make}=require(path.join(tool,'blockie-svg.js'));
const code=fs.readFileSync(path.join(root,'scripts/export-game-svg.cjs'),'utf8');
const options=vm.runInNewContext('('+code.slice(code.indexOf('function options('),code.indexOf('const xmlEscape'))+')');
const out=path.join(root,'assets/image/SVG/sphinx-visitors');fs.mkdirSync(out,{recursive:true});
for(const file of fs.readdirSync(path.join(tool,'.cache/sphinx-visitors')).filter(n=>n.endsWith('.json'))){
 const model=JSON.parse(fs.readFileSync(path.join(tool,'.cache/sphinx-visitors',file),'utf8'));
 if(model.warnings.length)throw Error(file+': '+model.warnings.join('; '));
 const svg=make(model,options(model,[0,1.6,8]));if(/<image|NaN|Infinity/.test(svg))throw Error(file);
 fs.writeFileSync(path.join(out,file.replace('.json','.svg')),svg);
}
fs.copyFileSync(path.join(tool,'Repository/Kenney/kenney_mini-characters/License.txt'),path.join(out,'License.txt'));
console.log('12 Sphinx visitors exported through 3DSVG.');
