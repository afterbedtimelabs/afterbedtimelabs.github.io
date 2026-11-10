// Deterministic native-pixel animation derivatives. Never regenerates the approved face.
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const source = 'art/tinker-panda-v3.4/sources';
const output = 'public/mascot/tinker-panda-v3.4';
const bytes = await fs.readFile(`${source}/approved-front-96.png`);
const sha = b => createHash('sha256').update(b).digest('hex');
if (sha(bytes) !== 'b7a25d71ae8b74a0f692462090809843fab594eb58ef38f8c4e6d3bc68f3963e') throw Error('Approved source changed');
const front = await sharp(bytes).ensureAlpha().raw().toBuffer();
const offset = (x,y) => (y * 96 + x) * 4;
const copyPixel = (out,x,y,src,sx,sy) => src.copy(out,offset(x,y),offset(sx,sy),offset(sx,sy)+4);
const color = (out,x,y,hex) => Buffer.from(hex+'ff','hex').copy(out,offset(x,y));
const translated = dy => {
  const out = Buffer.alloc(front.length);
  for(let y=0;y<96;y++) for(let x=0;x<96;x++) if(y+dy>=0 && y+dy<96) copyPixel(out,x,y+dy,front,x,y);
  return out;
};

// Only the pocket/hem inside the hoodie moves during the very small idle breath.
// The face, paws, scarf, outer silhouette and tail remain byte-for-byte fixed.
const idle = Buffer.from(front);
for(let y=78;y<=85;y++) for(let x=30;x<=46;x++) copyPixel(idle,x,y,front,x,y+1);

// Symmetric eyelid closure, shown briefly rather than used as an expression.
// The eyebrow patches (y30..34), outer dark accents, cheeks and mouth stay fixed.
const eyeRows = [
  [36,22,27,44,48],[37,21,28,43,49],[38,20,28,42,50],
  [39,20,29,41,50],[40,19,29,40,50],[41,19,29,40,50],
  [42,19,29,40,50],[43,19,29,40,50],[44,19,29,40,50],
  [45,19,29,40,50],[46,20,29,41,50],[47,20,28,42,49],[48,22,27,43,48],
];
function blink(closed) {
  const out=Buffer.from(front);
  for(const [y,l,r,l2,r2] of eyeRows) for(const [a,b] of [[l,r],[l2,r2]]) for(let x=a;x<=b;x++) {
    // Fill only the upper aperture with cream. Keep the approved lower eye line.
    if(closed || y < 41) color(out,x,y,'fff0cb');
  }
  if(closed) {
    for(let x=22;x<=27;x++) color(out,x,45,'392b2a');
    for(let x=43;x<=48;x++) color(out,x,45,'392b2a');
    for(const x of [21,28,42,49]) color(out,x,44,'392b2a');
  }
  return out;
}

// The final opaque run on each row is the tail. The earlier run includes the
// right ear: a rectangular x>=64 mask would incorrectly move seven ear pixels.
const tailRows = [
  [25,73,78],[26,73,78],[27,70,80],[28,67,83],[29,67,83],
  [30,66,84],[31,65,84],[32,65,86],[33,65,86],[34,64,87],
  [35,64,87],[36,64,88],[37,64,88],[38,64,88],[39,65,89],
  [40,65,89],[41,66,89],[42,67,89],[43,67,89],[44,68,89],
  [45,69,90],[46,69,90],[47,69,90],[48,69,90],[49,70,90],
  [50,70,90],[51,70,90],
];
// Move only the free upper tail, one native pixel. Its base stays anchored.
function tail(dx) {
  const out=Buffer.from(front);
  for(const [y,l,r] of tailRows) for(let x=l;x<=r;x++) out.fill(0,offset(x,y),offset(x,y)+4);
  for(const [y,l,r] of tailRows) for(let x=l;x<=r;x++) copyPixel(out,x+dx,y,front,x,y);
  return out;
}
const half=blink(false), closed=blink(true);
const definitions={
  idle:{durations:[1200,1200,1200],frames:[front,idle,front],rule:'Hoodie interior x30..46, y78..85 only; face and silhouette exact.'},
  blink:{durations:[120,70,90,70,120],frames:[front,half,closed,half,front],rule:'Eye apertures only; approved eyebrow/cheek/muzzle markings and alpha unchanged.'},
  happy:{durations:[200,120,180,120,200],frames:[front,translated(-1),translated(-2),translated(-1),front],rule:'Exact whole-character translation by 0,-1,-2,-1,0 pixels; no expression substitution.'},
  tail:{durations:[400,220,400,220,400],frames:[front,tail(1),front,tail(-1),front],rule:'Explicit free upper tail row mask only, shifts +1 then -1; base anchored; ear/body exact.'},
};
await fs.mkdir(`${output}/atlases`,{recursive:true});
await fs.mkdir('art/tinker-panda-v3.4/frames',{recursive:true});
await fs.copyFile(`${source}/approved-front-96.png`,`${output}/front.png`);
const manifest={version:'3.4',design:'V3.3 Expressive Markings',nativeSize:96,frontSha256:sha(bytes),approval:'Owner-approved default front; V3.4 adds implementation and restrained animation, no new face concept.',sources:source,eyeRows,tailRows,sequences:{}};
for(const [name,def] of Object.entries(definitions)) {
  const atlas=Buffer.alloc(96*def.frames.length*96*4);
  for(let i=0;i<def.frames.length;i++) {
    const frame=def.frames[i];
    for(let y=0;y<96;y++) frame.copy(atlas,(y*96*def.frames.length+i*96)*4,y*96*4,(y+1)*96*4);
    await sharp(frame,{raw:{width:96,height:96,channels:4}}).png().toFile(`art/tinker-panda-v3.4/frames/${name}-${i}.png`);
  }
  const encoded=await sharp(atlas,{raw:{width:96*def.frames.length,height:96,channels:4}}).png().toBuffer();
  await fs.writeFile(`${output}/atlases/${name}.png`,encoded);
  manifest.sequences[name]={durations:def.durations,rule:def.rule,atlasSha256:sha(encoded),bytes:encoded.length,frameRgbaSha256:def.frames.map(sha)};
}
await fs.writeFile(`${output}/manifest.json`,JSON.stringify(manifest,null,2)+'\n');
console.log(`Approved 96×96 front copied exactly; 18 native animation frames, four atlases (${Object.values(manifest.sequences).reduce((s,x)=>s+x.bytes,bytes.length)} PNG bytes total).`);
