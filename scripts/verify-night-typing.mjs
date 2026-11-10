/** Pixel registration/occlusion checks, full-frame exports, and offline source review.
 * These checks establish technical invariants, never artistic approval.
 * node scripts/verify-night-typing.mjs [--gif]
 */
import sharp from 'sharp';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const art = path.join(root, 'art/night-workshop-v1-1');
const output = path.join(root, 'docs/night-workshop-v1-1');
const timing = JSON.parse(await readFile(path.join(art, 'timing.json'), 'utf8'));
const { x, y, width, height, sceneWidth, sceneHeight } = timing.canvas;
await mkdir(path.join(art, 'frames-full'), { recursive: true });
await mkdir(output, { recursive: true });
const raw = file => sharp(file).ensureAlpha().raw().toBuffer();
const base = await raw(path.join(art, 'environment/night-environment.png'));
const atlas = await raw(path.join(art, 'typing-atlas.png'));
const runtime = await raw(path.join(root, 'public/images/ambient/typing-v1-1.webp'));
const runtimeMeta = await sharp(path.join(root, 'public/images/ambient/typing-v1-1.webp')).metadata();
const foreground = await raw(path.join(art, 'layers/keyboard-laptop-foreground.png'));
const masks = await Promise.all(['near', 'far'].map(name => sharp(path.join(art, `layers/${name}-mask.png`)).greyscale().raw().toBuffer()));
const union = Buffer.alloc(width * height), allowed = Buffer.alloc(width * height);
for (let p = 0; p < union.length; p++) union[p] = masks.some(mask => mask[p] > 0) ? 255 : 0;
// Exact six-pixel Chebyshev expansion, explicitly allowing the moving silhouette.
for (let yy = 0; yy < height; yy++) for (let xx = 0; xx < width; xx++) {
  if (!union[yy * width + xx]) continue;
  for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++) {
    const nx = xx + dx, ny = yy + dy;
    if (nx >= 0 && nx < width && ny >= 0 && ny < height) allowed[ny * width + nx] = 255;
  }
}
await sharp(allowed, { raw: { width, height, channels: 1 } }).png().toFile(path.join(art, 'layers/allowed-motion-mask-6px.png'));
const protectedRegions = {
  face: [827,297,320,275], eyes: [935,435,165,105], scarf: [826,554,231,50],
  tail: [620,450,195,315], chair: [600,550,75,250], laptop: [1155,510,190,237],
  keyboardOutsideContact: [968,650,194,97],
};
const report = {
  purpose: 'Technical pixel invariants only; no claim of artistic quality or owner approval.',
  canvas: timing.canvas,
  allowedMotion: { sourceMasks: ['layers/near-mask.png','layers/far-mask.png'], expansionPixels: 6, metric: 'Chebyshev', export: 'layers/allowed-motion-mask-6px.png' },
  occlusion: 'The original keyboard/laptop foreground layer is composited last by assemble-night-typing.mjs; every opaque foreground pixel is compared directly below.',
  timing: { restMs: timing.restMs, burstMs: timing.burst.reduce((sum, entry) => sum + entry.ms, 0), poses: timing.poses.length },
  atlas: { dimensions: [runtimeMeta.width, runtimeMeta.height], expectedDimensions: [width * timing.poses.length, height], identicalPngAndRuntimeRgba: atlas.equals(runtime) },
  frames: [], failures: [],
};
const filenames = timing.poses.map((pose, index) => `${String(index).padStart(2,'0')}-${pose.name}.png`);
const crops = await Promise.all(filenames.map(file => raw(path.join(art, 'frames', file))));
const resting = crops[0];
const fullRest = Buffer.from(base);
function place(destination, crop) {
  for (let yy = 0; yy < height; yy++) crop.copy(destination, ((yy + y) * sceneWidth + x) * 4, yy * width * 4, (yy + 1) * width * 4);
  return destination;
}
place(fullRest, resting);
report.restingFrameMatchesEnvironment = fullRest.equals(base);
const changed = (a,b,p) => a[p] !== b[p] || a[p+1] !== b[p+1] || a[p+2] !== b[p+2] || a[p+3] !== b[p+3];
for (let index = 0; index < crops.length; index++) {
  const crop = crops[index], full = place(Buffer.from(base), crop);
  await sharp(full, { raw: { width: sceneWidth, height: sceneHeight, channels: 4 } }).png().toFile(path.join(art, 'frames-full', filenames[index]));
  let changedPixels = 0, changedOutsideAllowed = 0, foregroundMismatches = 0, atlasMismatches = 0;
  let minX = sceneWidth, minY = sceneHeight, maxX = -1, maxY = -1;
  for (let yy = 0; yy < height; yy++) for (let xx = 0; xx < width; xx++) {
    const p = yy * width + xx, i = p * 4;
    if (changed(crop, resting, i)) {
      changedPixels++;
      if (!allowed[p]) changedOutsideAllowed++;
      minX = Math.min(minX, xx+x); minY = Math.min(minY, yy+y);
      maxX = Math.max(maxX, xx+x); maxY = Math.max(maxY, yy+y);
    }
    if (foreground[i+3] === 255 && changed(crop,foreground,i)) foregroundMismatches++;
    const ai = (yy * width * crops.length + index * width + xx) * 4;
    if (crop[i] !== runtime[ai] || crop[i+1] !== runtime[ai+1] || crop[i+2] !== runtime[ai+2] || crop[i+3] !== runtime[ai+3]) atlasMismatches++;
  }
  const fixed = {};
  for (const [name,[rx,ry,rw,rh]] of Object.entries(protectedRegions)) {
    let changes = 0, excludedContactPixels = 0;
    for (let yy = ry; yy < ry+rh; yy++) for (let xx = rx; xx < rx+rw; xx++) {
      const cx = xx-x, cy = yy-y;
      if (name === 'keyboardOutsideContact' && cx >= 0 && cx < width && cy >= 0 && cy < height && allowed[cy * width + cx]) { excludedContactPixels++; continue; }
      if (changed(full,fullRest,(yy * sceneWidth + xx)*4)) changes++;
    }
    fixed[name] = { bounds: [rx,ry,rw,rh], changedPixels: changes, ...(excludedContactPixels ? { excludedContactPixels } : {}) };
  }
  let changedOutsideCrop = 0;
  for (let yy = 0; yy < sceneHeight; yy++) for (let xx = 0; xx < sceneWidth; xx++) {
    if (xx >= x && xx < x+width && yy >= y && yy < y+height) continue;
    if (changed(full,fullRest,(yy*sceneWidth+xx)*4)) changedOutsideCrop++;
  }
  const result = { index, name: timing.poses[index].name, crop: `frames/${filenames[index]}`, fullFrame: `frames-full/${filenames[index]}`, changedPixels, changeBounds: changedPixels ? [minX,minY,maxX-minX+1,maxY-minY+1] : null, changedOutsideAllowed, changedOutsideCrop, foregroundMismatches, atlasMismatches, fixedRegions: fixed };
  report.frames.push(result);
  if (changedOutsideAllowed || changedOutsideCrop || foregroundMismatches || atlasMismatches || Object.values(fixed).some(value => value.changedPixels)) report.failures.push(result.name);
}
if (!report.atlas.identicalPngAndRuntimeRgba || runtimeMeta.width !== width*crops.length || runtimeMeta.height !== height) report.failures.push('lossless atlas');
if (!report.restingFrameMatchesEnvironment) report.failures.push('resting crop changes environment');
report.allPass = report.failures.length === 0;
await writeFile(path.join(output, 'animation-pixel-checks.json'), JSON.stringify(report,null,2)+'\n');

const review = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Tinker typing · source motion study</title>
<style>body{margin:0;background:#17191e;color:#e9dfd0;font:15px system-ui;line-height:1.5}main{max-width:1200px;margin:auto;padding:24px}h1{font-size:23px;font-weight:500}.note{color:#b8afa4;max-width:800px}.controls{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin:20px 0}button,select{background:#2e3038;color:inherit;border:1px solid #64616b;padding:9px 13px;border-radius:5px;font:inherit;cursor:pointer}input{accent-color:#d8ad78}#scene{display:block;width:100%;height:auto;border-radius:8px}#detail{display:block;width:600px;max-width:100%;height:auto;image-rendering:pixelated;border:1px solid #64616b;margin-top:16px}output{font-family:monospace}a{color:#d8ad78}</style>
<main><h1>Tinker Panda · typing source motion study</h1><p class="note">Unapproved source study for checking paw shapes, registration, contact and timing. This offline preview uses the exported artwork; it is not the actual browser recording. Visual rain, steam and blinking belong to the website and are omitted here.</p>
<div class="controls"><button id="play" type="button">Play sequence</button><button id="previous" type="button">Previous pose</button><button id="next" type="button">Next pose</button><label>Pose <input id="scrub" type="range" min="0" max="${crops.length-1}" value="0"></label><output id="label"></output></div>
<img id="scene" src="frames-full/${filenames[0]}" width="${sceneWidth}" height="${sceneHeight}" alt="Tinker Panda, the lab’s mascot, at his keyboard in the nighttime workshop"><img id="detail" src="frames/${filenames[0]}" width="${width}" height="${height}" alt="Magnified paw and keyboard frame"><p class="note">Playback uses the authored ${report.timing.burstMs} ms burst and a fixed 8-second resting hold. The website varies holds between ${timing.restMs.minimum/1000} and ${timing.restMs.maximum/1000} seconds. Manual controls scrub every exported pose.</p><p><a href="timing.json">Timing and pose parameters</a> · <a href="environment/README.md">Environment assembly notes</a></p></main>
<script>const files=${JSON.stringify(filenames)},poses=${JSON.stringify(timing.poses)},burst=${JSON.stringify(timing.burst)};let pose=0,timer=null,running=false;const scene=document.querySelector('#scene'),detail=document.querySelector('#detail'),scrub=document.querySelector('#scrub'),label=document.querySelector('#label'),play=document.querySelector('#play');function show(n){pose=n;scene.src='frames-full/'+files[n];detail.src='frames/'+files[n];scrub.value=n;label.value=n+' · '+poses[n].name}function stop(){running=false;clearTimeout(timer);play.textContent='Play sequence'}function nextStep(step){if(!running)return;if(step>=burst.length){show(0);timer=setTimeout(()=>nextStep(0),8000);return}show(burst[step].pose);timer=setTimeout(()=>nextStep(step+1),burst[step].ms)}play.onclick=()=>{if(running){stop();show(0);return}running=true;play.textContent='Pause sequence';show(0);timer=setTimeout(()=>nextStep(0),8000)};scrub.oninput=()=>{stop();show(Number(scrub.value))};document.querySelector('#previous').onclick=()=>{stop();show((pose+files.length-1)%files.length)};document.querySelector('#next').onclick=()=>{stop();show((pose+1)%files.length)};document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});show(0);</script></html>`;
await writeFile(path.join(art,'review.html'),review);

if (process.argv.includes('--gif')) {
  const scratch = path.join(root,'.astro/night-typing-gif');
  await mkdir(scratch,{recursive:true});
  const sequence = [{pose:0,ms:6800},...timing.burst];
  const lines = ['ffconcat version 1.0'];
  for (const entry of sequence) {
    const file = path.join(art,'frames',filenames[entry.pose]).replaceAll('\\','/').replaceAll("'","'\\''");
    lines.push(`file '${file}'`,'option framerate 100',`duration ${(entry.ms/1000).toFixed(3)}`);
  }
  lines.push(`file '${path.join(art,'frames',filenames[0]).replaceAll('\\','/')}'`,'option framerate 100');
  const list = path.join(scratch,'frames.ffconcat');
  await writeFile(list,lines.join('\n')+'\n');
  const result = spawnSync('ffmpeg',['-y','-hide_banner','-loglevel','error','-safe','0','-f','concat','-i',list,'-filter_complex','split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=none','-fps_mode','vfr','-loop','0','-final_delay','1',path.join(art,'typing-motion-study.gif')],{windowsHide:true,encoding:'utf8'});
  if (result.error || result.status) throw new Error('Source GIF export failed: '+(result.error?.message || result.stderr));
  await writeFile(path.join(art,'typing-motion-study.txt'),'Unapproved source motion study, crop only. Not the actual browser recording.\nGenerated from exported PNG poses with timing.json: 6.8-second rest, then one authored typing burst.\nReproduce with: node scripts/verify-night-typing.mjs --gif\n');
}
console.log(JSON.stringify({allPass:report.allPass,failures:report.failures,frames:report.frames.map(({name,changedPixels,changeBounds})=>({name,changedPixels,changeBounds})),fullFrameExports:crops.length,offlineReview:'art/night-workshop-v1-1/review.html'}));
if (!report.allPass) process.exitCode=1;
