const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),tool=path.join(root,'tools/3DSVG');
const {make}=require(path.join(tool,'blockie-svg.js'));
const code=fs.readFileSync(path.join(root,'scripts/export-game-svg.cjs'),'utf8');
const options=vm.runInNewContext('('+code.slice(code.indexOf('function options('),code.indexOf('const xmlEscape'))+')');
const model=JSON.parse(fs.readFileSync(path.join(tool,'.cache/zombie-model.json'),'utf8'));
const svg=make(model,options(model,[.5,1.4,8]));if(/<image|NaN|Infinity/.test(svg))throw Error('Invalid SVG');
const folder=path.join(tool,'Repository/HelloYotta/zombie-female-d-blockie/SVG');fs.mkdirSync(folder,{recursive:true});fs.writeFileSync(path.join(folder,'zombie-female-d-blockie.svg'),svg);
console.log('ZOMBIE_SVG_OK');
