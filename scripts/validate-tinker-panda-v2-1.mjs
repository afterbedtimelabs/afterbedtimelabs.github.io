import assert from 'node:assert/strict';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = new URL('../public/mascot/tinker-panda-v2.1/', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('manifest.json', root), 'utf8'));
const sourcePalette = JSON.parse(await readFile(new URL('../art/tinker-panda/palette.json', import.meta.url), 'utf8'));
assert.deepEqual(manifest.palette, sourcePalette, 'Manifest/source palettes differ');
const allowed = new Set(Object.values(sourcePalette).map(hex => hex.toLowerCase()));
assert.equal(allowed.size, 19);
const hashes = {}, decoded = new Map(), used = new Set(), stats = {};
async function files(dir, prefix='') {
  const groups = await Promise.all((await readdir(dir,{withFileTypes:true})).map(entry => entry.isDirectory()
    ? files(new URL(`${entry.name}/`,dir),`${prefix}${entry.name}/`) : [`${prefix}${entry.name}`]));
  return groups.flat();
}
for (const file of (await files(root)).filter(p=>p.endsWith('.png'))) {
  const bytes = await readFile(new URL(file, root));
  const { data, info } = await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  hashes[file] = createHash('sha256').update(bytes).digest('hex');
  let width = 64;
  if(file.startsWith('atlases/')) {
    const name = file.split('/')[1].replace('.png','');
    width *= name === 'expressions' ? 5 : name === 'views' ? 4 : manifest.animations[name].frames;
  }
  assert.equal(info.width,width,`${file}: width`); assert.equal(info.height,64,`${file}: height`);
  let opaque=0, transparent=0;
  for(let i=0;i<data.length;i+=4) {
    assert.ok(data[i+3]===0 || data[i+3]===255,`${file}: partial alpha at ${i/4}`);
    if(!data[i+3]) { transparent++; continue; }
    const hex='#'+data.subarray(i,i+3).toString('hex');
    assert.ok(allowed.has(hex),`${file}: off-palette ${hex}`); used.add(hex); opaque++;
  }
  assert.ok(transparent>0 && opaque>0,`${file}: must have real transparency and artwork`);
  decoded.set(file,{data,info}); stats[file]={width:info.width,height:info.height,opaquePixels:opaque};
}
const pixel=(im,x,y)=>im.data.subarray((y*im.info.width+x)*4,(y*im.info.width+x+1)*4);
const same=(a,b,x,y)=>pixel(a,x,y).equals(pixel(b,x,y));
let consistencyChecks=0;
for(const [name,config] of Object.entries(manifest.animations)) {
  assert.equal(config.frames,config.durationsMs.length);
  assert.ok(config.frames>=2&&config.frames<=4);
  assert.ok(config.durationsMs.every(ms=>ms>=60&&ms%10===0));
  const atlas=decoded.get(`atlases/${name}.png`);
  const first=decoded.get(`frames/${name}-0.png`);
  for(let frame=0;frame<config.frames;frame++) {
    const current=decoded.get(`frames/${name}-${frame}.png`);
    for(let y=0;y<64;y++)for(let x=0;x<64;x++) {
      assert.ok(pixel(current,x,y).equals(pixel(atlas,x+frame*64,y)),`${name}: atlas mismatch`);
      if(name==='blink' && !(((x>=17&&x<=26)||(x>=37&&x<=46))&&y>=20&&y<=30)) assert.ok(same(first,current,x,y),'Blink changes outside eye area');
      if(name==='tail' && x>=17) assert.ok(same(first,current,x,y),'Tail sway moves body/face/attachment');
      if(name==='idle' && y>=47) assert.ok(same(first,current,x,y),'Idle shifts lower body/feet');
      if(name==='idle' && frame===1 && x>=8&&x<=54&&y>=4&&y<=29)
        assert.ok(pixel(current,x,y).equals(pixel(first,x,y+1)),'Idle head/ears drift instead of rigid one-pixel lift');
      if(name==='happy') {
        const sourceY=y-config.offsetsY[frame];
        if(sourceY>=0&&sourceY<64) assert.ok(pixel(current,x,y).equals(pixel(first,x,sourceY)),'Bounce deforms the sprite');
        else assert.equal(pixel(current,x,y)[3],0,'Bounce clips');
      }
      consistencyChecks++;
    }
    for(let x=0;x<64;x++){assert.equal(pixel(current,x,0)[3],0);assert.equal(pixel(current,x,63)[3],0);}
    for(let y=0;y<64;y++){assert.equal(pixel(current,0,y)[3],0);assert.equal(pixel(current,63,y)[3],0);}
  }
  for(const scale of [1,4,8]) {
  const file=`previews/${name}-${scale}x.gif`;
  const bytes=await readFile(new URL(file,root));
  const metadata=await sharp(bytes,{animated:true}).metadata();
  const size=64*scale;
  assert.equal(metadata.width,size); assert.equal(metadata.pageHeight,size);
  assert.equal(metadata.pages,config.frames); assert.deepEqual(metadata.delay,config.durationsMs);
  const {data,info}=await sharp(bytes,{animated:true}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  // Validate every decoded GIF pixel against nearest-neighbor PNG frames;
  // this detects palette remapping, disposal ghosts, omitted frames and blur.
  for(let f=0;f<config.frames;f++)for(let y=0;y<size;y++)for(let x=0;x<size;x++) {
    const offset=((f*size+y)*info.width+x)*4;
    const expected=pixel(decoded.get(`frames/${name}-${f}.png`),Math.floor(x/scale),Math.floor(y/scale));
    assert.equal(data[offset+3],expected[3],`${name}: GIF alpha/ghost`);
    if(expected[3]) assert.ok(data.subarray(offset,offset+4).equals(expected),`${name}: GIF pixel mismatch`);
  }
  hashes[file]=createHash('sha256').update(bytes).digest('hex');
  }
}
const neutral=decoded.get('expressions/neutral.png');
assert.ok(neutral.data.equals(decoded.get('front.png').data));
assert.equal(hashes['front.png'],'a07781439461bc715463a6d830598e8eb93ef47ec508d346307d71915f534ba3','Front must remain byte-for-byte approved B');
const baseline=await sharp(await readFile(new URL('../art/tinker-panda-v2.1/previous.png',import.meta.url))).ensureAlpha().raw().toBuffer({resolveWithObject:true});
for(let y=0;y<64;y++)for(let x=0;x<64;x++) {
  assert.equal(pixel(neutral,x,y)[3],pixel(baseline,x,y)[3],'Master silhouette changed');
  if(y>=37)assert.ok(same(neutral,baseline,x,y),'Approved body/tail/pouch changed');
}
for(let y=13;y<=20;y++)for(let x=10;x<=21;x++) {
  const color='#'+pixel(baseline,x,y).subarray(0,3).toString('hex');
  if([sourcePalette.teal.toLowerCase(),sourcePalette.tealShadow.toLowerCase()].includes(color))
    assert.ok(same(neutral,baseline,x,y),'Teal bow pixel changed');
}
for(const expression of manifest.expressions) {
  const frame=decoded.get(`expressions/${expression}.png`);
  for(let y=0;y<64;y++)for(let x=0;x<64;x++) {
    const eyes=((x>=17&&x<=26)||(x>=37&&x<=46))&&y>=20&&y<=30;
    const mouth=x>=29&&x<=34&&y>=32&&y<=35;
    if(!(eyes||mouth)) assert.ok(same(neutral,frame,x,y),`${expression}: drift outside eye/mouth areas`);
    assert.equal(pixel(neutral,x,y)[3],pixel(frame,x,y)[3],`${expression}: silhouette changed`);
  }
}
// Independently inspect every static atlas cell, including portrait and turnaround.
for(const [atlasName,names] of [['expressions',manifest.expressions.map(n=>`expressions/${n}.png`)],['views',['front.png','side.png','back.png','portrait.png']]]) {
  const atlas=decoded.get(`atlases/${atlasName}.png`);
  names.forEach((name,i)=>{const source=decoded.get(name);for(let y=0;y<64;y++)for(let x=0;x<64;x++)assert.ok(pixel(atlas,x+i*64,y).equals(pixel(source,x,y)),`${name}: static atlas differs`);});
}
// Side and portrait preserve their V2 external silhouettes; the back is unchanged.
for(const name of ['side','back','portrait']) {
  const old=await sharp(await readFile(new URL(`../art/tinker-panda-v2.1/validation-baselines/${name}.png`,import.meta.url))).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const current=decoded.get(`${name}.png`);
  for(let y=0;y<64;y++)for(let x=0;x<64;x++) {
    assert.equal(pixel(current,x,y)[3],pixel(old,x,y)[3],`${name}: outline silhouette changed`);
    if(name==='back'||(name==='side'&&y>=33)||(name==='portrait'&&y>=50))assert.ok(same(current,old,x,y),`${name}: clothes/accessories changed`);
  }
}
// Previews contain exact nearest-neighbor compositing on both backgrounds.
const previewNames=['front','side','back','portrait',...manifest.expressions.map(n=>`expression-${n}`)];
for(const name of previewNames) {
  const file=name.startsWith('expression-')?`expressions/${name.slice(11)}.png`:`${name}.png`;
  const sprite=decoded.get(file);
  const board=await sharp(await readFile(new URL(`../docs/mascot-v2.1/${name}-scales.png`,import.meta.url))).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  for(const [top,bg] of [[90,[245,239,227]],[690,[32,45,44]]])for(const [scale,startX] of [[1,24],[4,112],[8,392]]) {
    for(let y=0;y<64*scale;y++)for(let x=0;x<64*scale;x++) {
      const source=pixel(sprite,Math.floor(x/scale),Math.floor(y/scale));
      const actual=pixel(board,startX+x,top+62+y);
      assert.ok(actual.subarray(0,3).equals(source[3]?source.subarray(0,3):Buffer.from(bg)),`${name}: preview resampling or background mismatch`);
    }
  }
}
// Both ear interiors must connect to the face by edge-adjacent opaque pixels.
// Restrict traversal to the head so a path through the body cannot mask a gap.
const reached=new Set(['31,20']), queue=[[31,20]];
for(let i=0;i<queue.length;i++) {
  const [x,y]=queue[i];
  for(const [nx,ny] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]) {
    const key=`${nx},${ny}`;
    if(nx<8||nx>54||ny<4||ny>38||reached.has(key)||!pixel(neutral,nx,ny)[3])continue;
    reached.add(key);queue.push([nx,ny]);
  }
}
assert.ok(reached.has('16,11')&&reached.has('47,11'),'Ear disconnected from head');
const report={status:'PASS',nativeFrameSize:[64,64],paletteColorsDeclared:allowed.size,paletteColorsUsed:used.size,
  pngFiles:decoded.size,animationFrames:14,consistencyPixelChecks:consistencyChecks,
  animatedPreviews:12,previewScales:[1,4,8],
  checks:['Dimensions','Fixed palette','Binary alpha','All atlas/frame equality','Stable non-animated regions',
    'Rigid integer bounce and idle head lift','Transparent animation margins','Expression eye/mouth isolation','Connected ears',
    'GIF durations and every decoded GIF pixel at 1x/4x/8x','Approved B exact SHA-256','Preserved silhouettes, body and bow',
    'Exact nearest-neighbor light/dark static previews'],
  visualAcceptance:'Front B approved by owner; derived views, portrait, expressions and animations await review',files:stats,sha256:hashes};
const output=new URL('../docs/mascot-v2.1/validation.json',import.meta.url);
await mkdir(new URL('./',output),{recursive:true}); await writeFile(output,JSON.stringify(report,null,2)+'\n');
console.log(`PASS: ${decoded.size} PNGs, 14 animation frames, 12 GIFs; ${used.size}/${allowed.size} colors used; ${consistencyChecks} alignment pixel checks. B is byte-identical.`);
console.log(`Report: ${fileURLToPath(output)}`);
