import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const dir='public/mascot/tinker-panda-v3.4';
const source='art/tinker-panda-v3.4/sources';
const hash=b=>createHash('sha256').update(b).digest('hex');
const raw=async p=>sharp(p).ensureAlpha().raw().toBuffer();
const front=await raw(`${dir}/front.png`);
const frontBytes=await fs.readFile(`${dir}/front.png`);
const expected='b7a25d71ae8b74a0f692462090809843fab594eb58ef38f8c4e6d3bc68f3963e';
assert.equal(hash(frontBytes),expected,'Canonical must be approved Expressive Markings');
assert.deepEqual(frontBytes,await fs.readFile(`${source}/approved-front-96.png`));
const metadata=await sharp(frontBytes).metadata();
assert.equal(metadata.width,96); assert.equal(metadata.height,96);
const base=await raw(`${source}/v3.2-hybrid-96.png`);
assert.equal(hash(await fs.readFile(`${source}/v3.2-hybrid-96.png`)),'37df93785c3bf4eb8616cbfe84249168446c780e36c8a7bbe08ee7a61517500f');
const mask=JSON.parse(await fs.readFile(`${source}/face-mask.json`,'utf8')).rows;
const inFace=(x,y)=>mask.some(([a,b,c,d])=>y>=a&&y<=b&&x>=c&&x<=d);
const pixel=(b,x,y)=>b.subarray((y*96+x)*4,(y*96+x)*4+4);
let changes=0;
const palette=new Set();
for(let y=0;y<96;y++) for(let x=0;x<96;x++) {
  const a=pixel(front,x,y),b=pixel(base,x,y);
  assert.equal(a[3],b[3],`Baseline alpha ${x},${y}`);
  assert.ok(a[3]===0||a[3]===255);
  if(a[3]) palette.add(a.toString('hex'));
  if(!a.equals(b)){changes++;assert.ok(inFace(x,y),`Changed non-face pixel ${x},${y}`);}
}
assert.equal(changes,191);assert.equal(palette.size,19);
const manifest=JSON.parse(await fs.readFile(`${dir}/manifest.json`,'utf8'));
assert.equal(manifest.frontSha256,expected);
const component=await fs.readFile('src/components/TinkerPanda.astro','utf8');
const sequenceSource=component.match(/const sequences = \{([\s\S]*?)\} as const/)[1];
const timing={idle:[1200,1200,1200],blink:[120,70,90,70,120],happy:[200,120,180,120,200],tail:[400,220,400,220,400]};
const eyeRows=[
  [36,22,27,44,48],[37,21,28,43,49],[38,20,28,42,50],
  [39,20,29,41,50],[40,19,29,40,50],[41,19,29,40,50],
  [42,19,29,40,50],[43,19,29,40,50],[44,19,29,40,50],
  [45,19,29,40,50],[46,20,29,41,50],[47,20,28,42,49],[48,22,27,43,48],
];
assert.deepEqual(manifest.eyeRows,eyeRows,'Blink mask contract');
const frameReport=[];
const tailRows = [
  [25,73,78],[26,73,78],[27,70,80],[28,67,83],[29,67,83],
  [30,66,84],[31,65,84],[32,65,86],[33,65,86],[34,64,87],
  [35,64,87],[36,64,88],[37,64,88],[38,64,88],[39,65,89],
  [40,65,89],[41,66,89],[42,67,89],[43,67,89],[44,68,89],
  [45,69,90],[46,69,90],[47,69,90],[48,69,90],[49,70,90],
  [50,70,90],[51,70,90],
];
assert.deepEqual(manifest.tailRows,tailRows,'Only isolated tail is movable');
let pngBytes=frontBytes.length;
for(const [name,seq] of Object.entries(manifest.sequences)) {
  assert.deepEqual(seq.durations,timing[name]);
  assert.deepEqual(JSON.parse(sequenceSource.match(new RegExp(`${name}: (\\[[^\\]]+\\])`))[1]),timing[name]);
  const bytes=await fs.readFile(`${dir}/atlases/${name}.png`);
  pngBytes+=bytes.length;
  assert.equal(hash(bytes),seq.atlasSha256);assert.equal(bytes.length,seq.bytes);
  const meta=await sharp(bytes).metadata();
  assert.equal(meta.width,96*seq.durations.length);assert.equal(meta.height,96);
  for(let i=0;i<seq.durations.length;i++) {
    const f=await sharp(bytes).extract({left:i*96,top:0,width:96,height:96}).ensureAlpha().raw().toBuffer();
    assert.equal(hash(f),seq.frameRgbaSha256[i]);
    assert.deepEqual(f,await raw(`art/tinker-panda-v3.4/frames/${name}-${i}.png`));
    if(i===0||i===seq.durations.length-1) assert.deepEqual(f,front,`${name} endpoint must be exact front`);
    let changed=0,opaque=0;
    const dy=name==='happy'?[0,-1,-2,-1,0][i]:0;
    for(let y=0;y<96;y++) for(let x=0;x<96;x++) {
      const p=pixel(f,x,y),original=pixel(front,x,y);
      if(!p.equals(original)) changed++;
      if(p[3]) opaque++;
      assert.ok(p[3]===0||p[3]===255,`${name}:${i} partial alpha`);
      if(p[3]) assert.ok(palette.has(p.toString('hex')),`${name}:${i} new color`);
      if(name==='happy') {
        const sy=y-dy;
        assert.deepEqual(p,sy>=0&&sy<96?pixel(front,x,sy):Buffer.alloc(4),`happy:${i} must be exact translation`);
      } else if(!p.equals(original)) {
        if(name==='idle') assert.ok(x>=30&&x<=46&&y>=78&&y<=85,`Idle changed outside hoodie`);
        if(name==='blink') {
          assert.ok(eyeRows.some(([ey,l,r,l2,r2])=>ey===y&&((x>=l&&x<=r)||(x>=l2&&x<=r2))),`Blink changed outside eye aperture ${x},${y}`);
          assert.equal(p[3],original[3]);
        }
        if(name==='tail') assert.ok(tailRows.some(([ty,l,r])=>y===ty&&x>=l-1&&x<=r+1),`Tail changed ear/body/face at ${x},${y}`);
      }
      if(name==='idle') assert.equal(p[3],original[3]);
    }
    assert.equal(opaque,5215,`${name}:${i} clipped or duplicated pixels`);
    frameReport.push({state:`${name}:${i}`,durationMs:seq.durations[i],changedPixels:changed,opaquePixels:opaque,faceExact:name==='blink'?'Except eye aperture':name==='happy'?'Exact after inverse translation':true});
  }
}
assert.equal(frameReport.length,18);assert.ok(pngBytes<20000,'PNG loading budget');
const home=await fs.readFile('src/pages/index.astro','utf8');
// The ambient homepage uses new scene art; the approved canonical sprite remains
// its missing-media fallback and every existing canonical pixel is checked above.
assert.match(home,/<AmbientWorkshop \/>/);assert.doesNotMatch(home,/<Workbench \/>/);
const workshop=await fs.readFile('src/components/AmbientWorkshop.astro','utf8');
assert.match(workshop,/\/mascot\/tinker-panda-v3\.4\/front\.png/);
assert.match(workshop,/rainy-workshop-v1\.webp/);
assert.doesNotMatch(component,/tinker-panda-v2\.1|128px|Combined Personality|Playful Expression/);
assert.match(component,/--sprite-size: 192px/);assert.match(component,/--sprite-size: 96px/);
assert.match(component,/prefers-reduced-motion: reduce/);
let preservationChecked=0,preservationAbsent=0,preservationRawMatches=0,preservationNormalizedMatches=0;
const before=JSON.parse(await fs.readFile(`${source}/preservation-before.json`,'utf8'));
// Website showcase refreshes intentionally update these content/provenance files.
// All mascot sources, frames, atlases and hashes above remain exact.
const intentional=new Set(['src/pages/index.astro','astro.config.mjs','package.json','src/data/projects.ts','src/content/writing/meet-nightstock.md','public/images/projects/showcase/provenance.json','scripts/verify-build.mjs']);
const knownText=path=>/\.(?:astro|css|html|json|md|mjs|cjs|js|ts|svg|txt|xml|yml|yaml)$/i.test(path)||path==='.gitignore';
function normalizedLfHash(bytes) {
  const text=bytes.toString('utf8');
  assert.ok(Buffer.from(text,'utf8').equals(bytes)&&!text.includes('\0'),'Preservation text must be valid UTF-8 without binary NUL bytes');
  return hash(Buffer.from(text.replaceAll('\r\n','\n'),'utf8'));
}
for(const file of before.files) {
  if(intentional.has(file.path)) continue;
  let bytes;
  try {bytes=await fs.readFile(file.path);} catch(e) {
    // Historical exploration remains in its original local checkout; a fresh clone
    // needs only the frozen V3.4 source subset, not all untracked large artwork.
    if(e.code==='ENOENT'&&file.path.startsWith('art/')){preservationAbsent++;continue;} throw e;
  }
  if(hash(bytes)===file.sha256) preservationRawMatches++;
  else {
    // Git may convert Windows CRLF to LF on a clean Linux checkout. Only known
    // text files have a separately recorded normalized hash; binary art is exact.
    assert.ok(knownText(file.path)&&file.normalizedLfSha256,`Preserved file changed: ${file.path}`);
    assert.equal(normalizedLfHash(bytes),file.normalizedLfSha256,`Preserved text changed beyond line endings: ${file.path}`);
    preservationNormalizedMatches++;
  }
  preservationChecked++;
}
const built=await fs.readFile('dist/index.html','utf8');
assert.match(built,/\/mascot\/tinker-panda-v3\.4\/front\.png/);
assert.doesNotMatch(built,/tinker-panda-v2\.1|01-expressive|combined-personality|playful-expression/);
assert.deepEqual(await fs.readFile('dist/mascot/tinker-panda-v3.4/front.png'),frontBytes);
for(const name of Object.keys(timing)) assert.deepEqual(await fs.readFile(`dist/mascot/tinker-panda-v3.4/atlases/${name}.png`),await fs.readFile(`${dir}/atlases/${name}.png`));
const report={passed:true,canonicalSha256:expected,changedFacePixels:changes,unchangedNonFacePixels:96*96-1094,alphaIdenticalToV32:true,opaquePaletteColors:palette.size,animationFrameCount:frameReport.length,pngBytes,preservationChecked,preservationRawMatches,preservationNormalizedMatches,preservationAbsent,frames:frameReport};
// Preserve historical V3.4 review evidence; record this candidate separately.
await fs.mkdir('docs/ambient-v1',{recursive:true});
await fs.writeFile('docs/ambient-v1/canonical-asset-validation.json',JSON.stringify(report,null,2)+'\n');
console.log(`PASS: exact approved front; 191 face-only pixels; 18 native frames; ${pngBytes} PNG bytes; ${preservationChecked} existing files preserved (${preservationRawMatches} raw matches, ${preservationNormalizedMatches} text line-ending-only matches; ${preservationAbsent} historical files absent in this checkout).`);
