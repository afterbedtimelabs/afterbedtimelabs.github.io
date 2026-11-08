/** Editable, registered raster articulation. Run from the worktree root. */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
const out = 'art/night-workshop-v1-1';
const W=300,H=170,X=890,Y=575;
await mkdir(`${out}/layers`,{recursive:true});
await mkdir(`${out}/frames`,{recursive:true});
await mkdir('public/images/ambient',{recursive:true});
const original=await sharp('art/ambient-v1/rainy-workshop-v1.png').extract({left:X,top:Y,width:W,height:H}).ensureAlpha().raw().toBuffer();
const generated=await sharp(`${out}/source/clean-paws-generated.png`).resize(W,H,{fit:'fill',kernel:'nearest'}).ensureAlpha().raw().toBuffer();
const polygons={
  near:[[916,663],[920,639],[932,622],[943,615],[957,616],[974,630],[987,640],[1000,645],[1013,647],[1026,651],[1039,656],[1051,663],[1059,674],[1063,683],[1060,697],[1047,701],[1031,704],[1012,704],[993,700],[977,699],[961,697],[945,692],[928,688],[917,683]],
  far:[[1054,627],[1061,611],[1073,615],[1085,624],[1099,625],[1115,628],[1129,634],[1141,644],[1148,657],[1147,670],[1140,671],[1132,672],[1129,675],[1115,675],[1112,677],[1098,677],[1090,675],[1080,676],[1068,673],[1061,660]]
};
function inside(x,y,p){let hit=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[i],b=p[j];if(((a[1]>y)!==(b[1]>y))&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;}
const masks={};
for(const [name,p]of Object.entries(polygons)){
  const mask=Buffer.alloc(W*H);const layer=Buffer.from(original);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;mask[i]=inside(x+X,y+Y,p)?255:0;layer[i*4+3]=mask[i];}
  masks[name]=mask;
  await sharp(mask,{raw:{width:W,height:H,channels:1}}).png().toFile(`${out}/layers/${name}-mask.png`);
  await sharp(layer,{raw:{width:W,height:H,channels:4}}).png().toFile(`${out}/layers/${name}-paw-original.png`);
}
// The generated cleanup is used only where a moved silhouette reveals its old footprint.
const clean=Buffer.from(original);
for(let i=0;i<W*H;i++)if(masks.near[i]||masks.far[i])generated.copy(clean,i*4,i*4,i*4+4);
// Remove the generated plate's stray diagonal clothing highlight beneath the wrist.
// This is a tiny revealed shadow strip; original clothing texture supplies its palette.
for(let y=686;y<705;y++)for(let x=934;x<1006;x++){
  const i=(y-Y)*W+x-X;
  if(masks.near[i]){
    // Dark cast-shadow palette sampled from the original under-glove outline.
    clean[i*4]=36+(x%3); clean[i*4+1]=27+(y%3); clean[i*4+2]=34+(x%2);
  }
}
await sharp(clean,{raw:{width:W,height:H,channels:4}}).png().toFile(`${out}/layers/clean-background.png`);
// Keyboard and laptop foreground outside the paw silhouettes is the original drawing.
const foreground=Buffer.from(original);
for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;foreground[i*4+3]=(x+X>1157||y+Y>706)&&!masks.near[i]&&!masks.far[i]?255:0;}
await sharp(foreground,{raw:{width:W,height:H,channels:4}}).png().toFile(`${out}/layers/keyboard-laptop-foreground.png`);
const poses=[
  {name:'rest',near:0,far:0},
  {name:'near-lift',near:-4,far:0},
  {name:'near-contact',near:3,far:-1},
  {name:'near-release',near:-1,far:-2},
  {name:'far-lift',near:0,far:-4},
  {name:'far-contact',near:-1,far:3},
  {name:'settle',near:1,far:0}
];
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
function displacement(name,x,y,press){
  // Pin the elbow. Wrist follows a small arc; individual digits curl onto keys.
  const wrist=clamp((x-(name==='near'?926:1061))/(name==='near'?115:72),0,1);
  const distal=clamp((y-(name==='near'?666:645))/28,0,1);
  const digit=name==='near'?Math.exp(-(((x-1019)/15)**2)):Math.exp(-(((x-1122)/12)**2));
  return press*(wrist*.1+distal*(.25+digit*.8));
}
const frames=[];
for(const [index,pose]of poses.entries()){
  const frame=index===0?Buffer.from(original):Buffer.from(clean);
  if(index!==0)for(const name of ['far','near']){
    // Inverse nearest-neighbour raster mapping avoids interpolated texture shimmer.
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      const dy=displacement(name,x+X,y+Y,pose[name]);
      const sy=Math.round(y-dy);
      if(sy<0||sy>=H)continue;
      const si=sy*W+x,di=y*W+x;
      if(masks[name][si])original.copy(frame,di*4,si*4,si*4+4);
    }
  }
  for(let i=0;i<W*H;i++)if(foreground[i*4+3])foreground.copy(frame,i*4,i*4,i*4+4);
  const filename=`${String(index).padStart(2,'0')}-${pose.name}.png`;
  await sharp(frame,{raw:{width:W,height:H,channels:4}}).png().toFile(`${out}/frames/${filename}`);
  frames.push({input:frame,raw:{width:W,height:H,channels:4},left:index*W,top:0});
}
await sharp({create:{width:W*poses.length,height:H,channels:4,background:'#00000000'}}).composite(frames).png().toFile(`${out}/typing-atlas.png`);
await sharp(`${out}/typing-atlas.png`).webp({lossless:true,effort:6}).toFile('public/images/ambient/typing-v1-1.webp');
const timing={version:1,canvas:{x:X,y:Y,width:W,height:H,sceneWidth:1659,sceneHeight:948},poses,restMs:{minimum:6800,maximum:9200},burst:[{pose:1,ms:140},{pose:2,ms:110},{pose:3,ms:120},{pose:4,ms:150},{pose:5,ms:110},{pose:6,ms:130},{pose:1,ms:120},{pose:2,ms:110},{pose:3,ms:110},{pose:5,ms:110},{pose:6,ms:150}],polygons};
await writeFile(`${out}/timing.json`,JSON.stringify(timing,null,2)+'\n');
await writeFile('src/scripts/typing-timing.json',JSON.stringify(timing,null,2)+'\n');
// A magnified contact sheet is inspection evidence, never a runtime source.
await sharp(`${out}/typing-atlas.png`).resize(W*poses.length*2,H*2,{kernel:'nearest'}).png().toFile(`${out}/typing-contact-sheet-2x.png`);
console.log('Assembled seven registered crop frames and lossless atlas.');
