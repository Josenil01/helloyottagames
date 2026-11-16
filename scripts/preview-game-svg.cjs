const fs=require('node:fs'),path=require('node:path');
const sharp=require(require.resolve('sharp',{paths:[process.argv[2]]}));
const root=path.resolve(__dirname,'..'),out=path.join(root,'assets/image/SVG');
const manifest=JSON.parse(fs.readFileSync(path.join(out,'manifest.json'),'utf8'));
(async()=>{
 const tiles=[];let i=0;
 for(const game of Object.values(manifest.games)){
   const png=await sharp(path.join(out,game.hero)).resize(220,220,{fit:'contain'}).png().toBuffer();
   tiles.push({input:png,left:(i%8)*230+5,top:Math.floor(i/8)*250+5});
   const label=Buffer.from(`<svg width="230" height="26"><text x="115" y="18" text-anchor="middle" font-family="Arial" font-size="11">${game.title.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</text></svg>`);
   tiles.push({input:await sharp(label).png().toBuffer(),left:(i%8)*230,top:Math.floor(i/8)*250+222});i++;
 }
 await sharp({create:{width:1840,height:1250,channels:4,background:'#f4f7fb'}}).composite(tiles).png().toFile(path.join(out,'preview-cards.png'));
 console.log('40 vector cards rasterized for visual QA only. Games use the SVG files.');
})();
