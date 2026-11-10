/** Local-only V3.4 review board. Every mascot pixel is copied from a verified PNG. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'docs/tinker-panda-v3.4');
const assets = 'public/mascot/tinker-panda-v3.4';
const art = 'art/tinker-panda-v3.4';
const manifest = JSON.parse(await fs.readFile(path.join(root, assets, 'manifest.json'), 'utf8'));
const read = p => fs.readFile(path.join(root, p));
const escape = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const themes = { light: { bg: '#FAF8F3', fg: '#272C2B', muted: '#646963', panel: '#F1EEE6', line: '#D9D8CE' }, dark: { bg: '#161C1A', fg: '#E9E9DE', muted: '#A0AAA1', panel: '#1E2522', line: '#354038' } };
const src = p => '../../' + p;
const states = Object.entries(manifest.sequences);
const samples = { idle: 1, blink: 2, happy: 2, tail: 1 };
await fs.mkdir(out, { recursive: true });

function svg(width, height, content) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><style>text{font-family:Segoe UI,Arial,sans-serif}</style>${content}</svg>`);
}
function text(x, y, label, size = 22, fill = '#272C2B', weight = 400) {
  return `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}">${escape(label)}</text>`;
}
function rect(x, y, w, h, fill, stroke = 'none') {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}"/>`;
}
const sprites = [];
async function sprite(file, left, top, scale = 1) {
  const buffer = await read(file);
  const meta = await sharp(buffer).metadata();
  sprites.push({ input: scale === 1 ? buffer : await sharp(buffer).resize(meta.width * scale, meta.height * scale, { kernel: 'nearest' }).png().toBuffer(), left, top });
}

let layout = rect(0, 0, 1600, 1260, '#E8E3D8') + text(40, 51, 'TINKER PANDA / V3.4', 32, '#272C2B', 700) + text(40, 82, 'Expressive Markings · approved front · exact 96 × 96 master', 21, '#646963');
for (const [i, [name, theme]] of Object.entries(themes).entries()) {
  const x = 32 + i * 784;
  layout += rect(x, 106, 752, 506, theme.bg) + text(x + 24, 144, `${name.toUpperCase()} / APPROVED`, 20, theme.fg, 700);
  layout += text(x + 24, 314, 'Native 96 × 96', 19, theme.muted) + text(x + 272, 572, '4× nearest-neighbor · 384 × 384', 19, theme.muted);
  await sprite(`${assets}/front.png`, x + 34, 184);
  await sprite(`${assets}/front.png`, x + 272, 166, 4);
}
layout += text(40, 659, 'DESIGN HISTORY / native pixels, original canvas sizes', 23, '#272C2B', 700);
const history = [
  { title: 'V2.1 Candidate B / prior canonical', file: `${art}/sources/v2.1-candidate-b-64.png`, size: 64, note: '64 × 64 · historical reference' },
  { title: 'V3.2 Hybrid 96', file: `${art}/sources/v3.2-hybrid-96.png`, size: 96, note: '96 × 96 · preserved structure' },
  { title: 'V3.4 Expressive Markings', file: `${assets}/front.png`, size: 96, note: '96 × 96 · selected canonical face' }
];
for (const [i, item] of history.entries()) {
  const x = 32 + i * 528;
  layout += rect(x, 682, 512, 232, '#FAF8F3') + text(x + 18, 712, item.title, 20, '#272C2B', 600);
  layout += rect(x + 16, 730, 232, 128, '#FAF8F3', '#D9D8CE') + rect(x + 264, 730, 232, 128, '#161C1A');
  await sprite(item.file, x + 16 + (232 - item.size) / 2, 746 + (96 - item.size));
  await sprite(item.file, x + 264 + (232 - item.size) / 2, 746 + (96 - item.size));
  layout += text(x + 18, 892, item.note, 18, '#646963');
}
layout += text(40, 959, 'ANIMATION KEY FRAMES / static samples at native 96 × 96', 23, '#272C2B', 700);
for (const [i, [state, sequence]] of states.entries()) {
  const x = 32 + i * 396;
  layout += rect(x, 980, 380, 230, '#FAF8F3') + text(x + 18, 1010, `${state.toUpperCase()} · frame ${samples[state] + 1}`, 20, '#272C2B', 600);
  layout += rect(x + 18, 1025, 160, 114, '#FAF8F3', '#D9D8CE') + rect(x + 202, 1025, 160, 114, '#161C1A');
  await sprite(`${art}/frames/${state}-${samples[state]}.png`, x + 50, 1034);
  await sprite(`${art}/frames/${state}-${samples[state]}.png`, x + 234, 1034);
  layout += text(x + 18, 1180, `${sequence.durations.length} frames · ${sequence.durations.reduce((a,b) => a+b,0)} ms`, 18, '#646963');
}
layout += text(40, 1240, 'Reference artwork, not website screenshots. Use review.html for complete frame contacts and finite playback.', 17, '#646963');
await sharp(svg(1600, 1260, layout)).composite(sprites).png().toFile(path.join(out, 'comparison-board.png'));

sprites.length = 0;
let contacts = rect(0, 0, 1600, 1500, '#E8E3D8') + text(40, 54, 'V3.4 / EVERY ANIMATION FRAME', 32, '#272C2B', 700) + text(40, 86, 'Native 96 × 96 · frames ordered left to right · exact manifest timing', 21, '#646963');
for (const [row, [state, sequence]] of states.entries()) {
  const y = 116 + row * 342;
  contacts += text(40, y + 8, `${state.toUpperCase()} / ${sequence.durations.reduce((a,b) => a+b,0)} ms`, 23, '#272C2B', 700);
  for (const [themeIndex, [name, theme]] of Object.entries(themes).entries()) {
    const top = y + 28 + themeIndex * 142;
    contacts += rect(32, top, 1536, 132, theme.bg) + text(50, top + 72, name, 19, theme.muted);
    for (const [index, duration] of sequence.durations.entries()) {
      const left = 270 + index * 248;
      await sprite(`${art}/frames/${state}-${index}.png`, left, top + 4);
      contacts += text(left + 4, top + 120, `${index + 1} · ${duration} ms`, 17, theme.muted);
    }
  }
}
await sharp(svg(1600, 1500, contacts)).composite(sprites).png().toFile(path.join(out, 'animation-frames.png'));

const image = (file, size, label, klass = '') => `<img class="pixel ${klass}" src="${src(file)}" width="${size}" height="${size}" alt="${escape(label)}" loading="eager" decoding="sync">`;
const approvedPanels = Object.entries(themes).map(([name]) => `<div class="theme-panel ${name}"><div class="panel-label">${name} background</div><div class="approved-pair"><figure>${image(`${assets}/front.png`, 96, 'Approved Expressive Markings front at native 96 pixels')}<figcaption>Native 96 × 96</figcaption></figure><figure class="enlarged">${image(`${assets}/front.png`, 384, 'Same approved front at exact four times nearest-neighbor scale')}<figcaption>4× nearest-neighbor / 384 × 384</figcaption></figure></div></div>`).join('');
const historyPanels = history.map(item => `<article class="history-card"><h3>${item.title}</h3><div class="history-pair">${Object.keys(themes).map(name => `<div class="theme-panel ${name}">${image(item.file, item.size, `${item.title} at native ${item.size} pixels on ${name}`)}</div>`).join('')}</div><p>${item.note}</p></article>`).join('');
const framePanels = states.map(([state, sequence]) => `<article class="frame-row" id="frames-${state}"><header><h3>${state[0].toUpperCase() + state.slice(1)}</h3><span>${sequence.durations.reduce((a,b) => a+b,0)} ms total</span></header><p>${escape(sequence.rule)}</p>${Object.keys(themes).map(name => `<div class="theme-panel ${name} contact-strip" aria-label="${state} frames on ${name}">${sequence.durations.map((duration, index) => `<figure>${image(`${art}/frames/${state}-${index}.png`, 96, `${state} frame ${index + 1} of ${sequence.durations.length}`)}<figcaption>${index + 1} / ${duration} ms</figcaption></figure>`).join('')}</div>`).join('')}</article>`).join('');
const websiteShots = [
  ['desktop-light.jpg', 'Desktop · light theme'],
  ['desktop-dark.jpg', 'Desktop · dark theme'],
  ['mobile-light.jpg', 'Mobile · light theme'],
  ['mobile-dark.jpg', 'Mobile · dark theme'],
  ['tablet-light.jpg', 'Tablet · light theme']
];
const screenshotPanels = (await Promise.all(websiteShots.map(async ([filename, label]) => {
  const file = `docs/tinker-panda-v3.4/screenshots/${filename}`;
  const { width, height } = await sharp(await read(file)).metadata();
  return `<figure class="site-capture"><a href="${src(file)}" aria-label="Open full ${escape(label.toLowerCase())} website screenshot"><img src="${src(file)}" width="${width}" height="${height}" alt="Genuine browser capture of the After Bedtime Labs website: ${escape(label.toLowerCase())}" loading="lazy"></a><figcaption>${escape(label)}<span>${width} × ${height} capture · open full image</span></figcaption></figure>`;
}))).join('');
const reviewRecords = (await Promise.all(['README.md', 'browser-validation.json', 'asset-validation.json', 'independent-review.json'].map(async filename => {
  try { await fs.access(path.join(out, filename)); return `<a href="${src(`docs/tinker-panda-v3.4/${filename}`)}">${escape(filename)}</a>`; }
  catch { return ''; }
}))).filter(Boolean).join(' · ');
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Tinker Panda V3.4 · owner review</title><style>
:root{font-family:"Segoe UI",Arial,sans-serif;color:#272c2b;background:#e8e3d8;font-synthesis:none}*{box-sizing:border-box}body{margin:0}main{max-width:1640px;margin:auto;padding:32px}h1,h2,h3,p{margin:0}h1{font-size:clamp(30px,4vw,48px);letter-spacing:-.04em;margin:8px 0 14px}h2{font-size:24px;margin-bottom:8px}h3{font-size:18px}p{line-height:1.55;color:#646963}.eyebrow{font:12px Consolas,monospace;letter-spacing:.13em;text-transform:uppercase}.intro{max-width:850px}.intro p{font-size:17px}.status{display:inline-block;background:#367a79;color:#fff9eb;border-radius:3px;padding:6px 10px;margin-bottom:8px;font-size:12px;font-weight:700}.links{display:flex;flex-wrap:wrap;gap:8px 20px;margin:18px 0 28px}a{color:#70460c;text-underline-offset:3px}section{margin:32px 0 44px}section>p{margin-bottom:18px}.approved-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.theme-panel{padding:20px;min-width:0}.light{background:#faf8f3;color:#272c2b;--muted:#646963;--line:#d9d8ce}.dark{background:#161c1a;color:#e9e9de;--muted:#a0aaa1;--line:#354038}.panel-label{font:12px Consolas,monospace;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-bottom:16px}.approved-pair{display:flex;gap:24px;align-items:center;justify-content:space-around;min-height:432px}.pixel{display:block;image-rendering:pixelated;image-rendering:crisp-edges;object-fit:contain;max-width:none;flex-shrink:0}figure{margin:0;flex-shrink:0}figcaption{font-size:12px;color:var(--muted);line-height:1.5;margin-top:10px;text-align:center}.enlarged{overflow:visible}.history-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.history-card{background:#faf8f3;padding:18px}.history-card h3{margin-bottom:16px}.history-card p{font-size:13px;margin-top:14px}.history-pair{display:grid;grid-template-columns:1fr 1fr}.history-pair .theme-panel{padding:16px;display:flex;align-items:flex-end;justify-content:center;height:132px}.playback{background:#faf8f3;padding:22px}.controls{display:flex;gap:10px 18px;align-items:end;flex-wrap:wrap;margin:18px 0}.controls label{display:grid;gap:6px;font-size:13px;font-weight:600}select,button{font:inherit;color:inherit;border:1px solid #aeb5ad;background:#fffdf8;border-radius:3px;padding:9px 12px;min-height:40px}button{cursor:pointer}button:hover{background:#e8e3d8}button:focus-visible,select:focus-visible,a:focus-visible{outline:3px solid #367a79;outline-offset:3px}button:disabled{opacity:.55;cursor:not-allowed}.playback-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.playback-pair{display:flex;align-items:center;justify-content:space-around;gap:24px;min-height:432px}.sprite{width:96px;height:96px;flex-shrink:0;background-repeat:no-repeat;image-rendering:pixelated;image-rendering:crisp-edges}.sprite.large{width:384px;height:384px}.readout{font:13px Consolas,monospace;line-height:1.5;min-height:40px;padding:12px 0;color:#646963}.note{font-size:13px}.frame-row{margin-top:24px;background:#faf8f3;padding:18px}.frame-row header{display:flex;gap:20px;align-items:baseline;justify-content:space-between}.frame-row header span{font:12px Consolas,monospace;color:#646963}.frame-row p{font-size:13px;margin:8px 0 14px}.contact-strip{display:flex;justify-content:space-around;gap:22px;padding:18px;overflow-x:auto}.contact-strip figure{min-width:96px}.contact-strip figcaption{margin-top:7px}footer{font-size:12px;color:#646963;border-top:1px solid #c3c3b7;padding:20px 0;line-height:1.6}code{overflow-wrap:anywhere}summary{cursor:pointer}details{margin:20px 0}details p{font-size:13px;margin-top:8px}.hash{font:11px Consolas,monospace;overflow-wrap:anywhere}
.screenshot-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:16px}.site-capture{min-width:0;background:#faf8f3;padding:14px}.site-capture a{display:block;background:#e8e3d8}.site-capture img{display:block;width:100%;height:280px;object-fit:contain;image-rendering:auto}.site-capture figcaption{text-align:left;font-size:14px;font-weight:600;color:#272c2b}.site-capture figcaption span{display:block;margin-top:4px;font-size:12px;font-weight:400;color:#646963}
@media(max-width:1250px){.approved-pair,.playback-pair{flex-direction:column;gap:24px}.history-grid{grid-template-columns:1fr}.history-pair .theme-panel{height:144px}}@media(max-width:860px){main{padding:20px}.approved-grid,.playback-grid{grid-template-columns:1fr}.approved-pair,.playback-pair{flex-direction:row}.theme-panel{overflow-x:auto}.enlarged{min-width:384px}}@media(max-width:620px){.approved-pair,.playback-pair{flex-direction:column;align-items:flex-start;min-width:384px}.approved-pair figure:first-child,.playback-pair figure:first-child{margin-left:0}.theme-panel{padding:16px}.playback{padding:16px}.history-pair .theme-panel{overflow:visible}.history-pair{min-width:0}.controls{align-items:stretch}.controls label{flex:1 1 130px}section{margin-bottom:32px}.frame-row{padding:14px}.contact-strip{justify-content:flex-start}.readout{min-height:60px}}
</style></head><body><main>
<header class="intro"><div class="eyebrow">After Bedtime Labs / final design &amp; animation review</div><h1>Tinker Panda V3.4</h1><span class="status">APPROVED FACE · EXPRESSIVE MARKINGS</span><p>The owner-selected V3.3 face, on the preserved V3.2 Hybrid 96 structure. These review panels use the actual implementation assets. Native panels are exactly 96 CSS pixels; enlarged panels use integer scaling without interpolation.</p></header>
<nav class="links" aria-label="Review sections"><a href="#approved">Approved master</a><a href="#history">Previous versions</a><a href="#website">Website captures</a><a href="#playback">Animation playback</a><a href="#frames">Every frame</a><a href="../../docs/tinker-panda-v3.4/comparison-board.png">PNG comparison</a><a href="../../docs/tinker-panda-v3.4/animation-frames.png">PNG frame board</a></nav>
<section id="approved"><h2>The final canonical front</h2><p>The PNG is byte-identical to the selected Expressive Markings source. The body, silhouette, ears, scarf, tail, proportions, palette, and transparency remain intact.</p><div class="approved-grid">${approvedPanels}</div></section>
<section id="history"><h2>Preserved design history</h2><p>Original native canvas sizes are shown without normalization: V2.1 is 64 × 64; V3.2 and V3.4 are 96 × 96.</p><div class="history-grid">${historyPanels}</div></section>
<section id="website"><h2>Genuine website captures</h2><p>Actual browser screenshots of the production build served locally at <code>http://127.0.0.1:4323</code>. These captures show the integrated website, including desktop and mobile light/dark themes and a tablet check. Select a thumbnail to inspect the original capture.</p><div class="screenshot-grid">${screenshotPanels}</div></section>
<section id="playback"><h2>Animation playback &amp; static inspection</h2><p>Finite playback uses the production atlases and their exact frame durations. It returns to the approved front after completion. Nothing animates until Play is selected.</p><div class="playback"><div class="controls"><label>State<select id="state">${states.map(([name]) => `<option value="${name}">${name[0].toUpperCase() + name.slice(1)}</option>`).join('')}</select></label><label>Static frame<select id="frame"></select></label><label>Repeat<select id="repeat"><option value="1">Once</option><option value="3">Three cycles</option></select></label><button type="button" id="play">Play sequence</button><button type="button" id="stop">Stop &amp; reset</button></div><div id="readout" class="readout" role="status" aria-live="polite"></div><p id="motion-note" class="note"></p><div class="playback-grid">${Object.keys(themes).map(name => `<div class="theme-panel ${name}"><div class="panel-label">${name} background</div><div class="playback-pair"><figure><div class="sprite" data-scale="1" role="img" aria-label="Tinker Panda selected animation frame"></div><figcaption>Native 96 × 96</figcaption></figure><figure><div class="sprite large" data-scale="4" role="img" aria-label="Tinker Panda selected animation frame enlarged four times"></div><figcaption>4× nearest-neighbor</figcaption></figure></div></div>`).join('')}</div></div></section>
<section id="frames"><h2>Complete frame contacts</h2><p>Every frame is shown at native 96 × 96 on both backgrounds. First and last frames return to the exact approved front. On narrow screens, scroll each strip horizontally; the sprites never shrink.</p>${framePanels}</section>
<details><summary>Source integrity &amp; review scope</summary><p>Canonical file: <code>public/mascot/tinker-panda-v3.4/front.png</code></p><p class="hash">SHA-256 ${manifest.frontSha256}</p><p>Native frame PNGs: <code>art/tinker-panda-v3.4/frames/</code>. Durations and constrained edit regions: <a href="${src(assets)}/manifest.json">production manifest</a>. The existing V2.1 / V3.2 / V3.3 art remains historical reference.</p><p>This is a local review artifact, not a deployed website page. PNG boards are artwork comparisons; genuine website screenshots are captured separately from the running website. Design selection is locked; subjective placement feedback can be recorded without generating another face concept.</p>${reviewRecords ? `<p>Review documentation: ${reviewRecords}</p>` : ''}</details>
<footer>V3.4 implementation review · Native pixels preserved · No production animation autoplay on this board · Review at browser zoom 100% for native CSS dimensions. Device pixel ratio can change screenshot pixel dimensions without changing the 96 CSS pixel layout.</footer>
</main><script>
const sequences=${JSON.stringify(manifest.sequences)};
const base=${JSON.stringify(src(assets))};
const state=document.querySelector('#state'),frame=document.querySelector('#frame'),repeat=document.querySelector('#repeat'),play=document.querySelector('#play'),stop=document.querySelector('#stop'),readout=document.querySelector('#readout'),sprites=[...document.querySelectorAll('.sprite')],motion=matchMedia('(prefers-reduced-motion: reduce)');
let timer=0,token=0,running=false;
function draw(name,index){const n=sequences[name].durations.length;for(const el of sprites){const scale=Number(el.dataset.scale);el.style.backgroundImage='url("'+base+'/atlases/'+name+'.png")';el.style.backgroundSize=(96*n*scale)+'px '+(96*scale)+'px';el.style.backgroundPosition=(-96*index*scale)+'px 0';el.setAttribute('aria-label','Tinker Panda '+name+', frame '+(index+1)+' of '+n)}frame.value=String(index);document.body.dataset.state=name;document.body.dataset.frame=String(index)}
function cancel(reset=false){clearTimeout(timer);token++;running=false;play.disabled=motion.matches;state.disabled=false;frame.disabled=false;repeat.disabled=false;if(reset){draw(state.value,0);readout.textContent='Stopped. Approved front / frame 1.'}}
function select(){cancel();const seq=sequences[state.value];frame.innerHTML=seq.durations.map((ms,i)=>'<option value="'+i+'">'+(i+1)+' / '+ms+' ms</option>').join('');draw(state.value,0);readout.textContent=state.value+' / frame 1 of '+seq.durations.length+' / '+seq.durations[0]+' ms';}
function updateMotion(){document.querySelector('#motion-note').textContent=motion.matches?'Reduced motion is enabled: playback is disabled. Inspect individual frames with the static selector.':'Reduced motion is honored. Playback is finite and pauses when this tab is hidden.';if(motion.matches)cancel(true);play.disabled=motion.matches;}
state.addEventListener('change',select);frame.addEventListener('change',()=>{cancel();const i=Number(frame.value);draw(state.value,i);readout.textContent=state.value+' / frame '+(i+1)+' of '+sequences[state.value].durations.length+' / '+sequences[state.value].durations[i]+' ms';});stop.addEventListener('click',()=>cancel(true));
play.addEventListener('click',()=>{if(motion.matches)return;cancel();running=true;const id=token,name=state.value,seq=sequences[name],cycles=Number(repeat.value);play.disabled=true;state.disabled=true;frame.disabled=true;repeat.disabled=true;let index=0,cycle=1;const advance=()=>{if(id!==token)return;draw(name,index);readout.textContent=name+' / frame '+(index+1)+' of '+seq.durations.length+' / cycle '+cycle+' of '+cycles;timer=setTimeout(()=>{index++;if(index===seq.durations.length){index=0;cycle++;if(cycle>cycles){cancel();draw(name,0);readout.textContent='Finished '+cycles+' '+name+' cycle'+(cycles>1?'s':'')+'. Returned to the approved front.';return}}advance()},seq.durations[index])};advance()});
motion.addEventListener('change',updateMotion);document.addEventListener('visibilitychange',()=>{if(document.hidden&&running)cancel(true)});select();updateMotion();
</script></body></html>`;
await fs.writeFile(path.join(out, 'review.html'), html);
const checks = { canonicalSha256: crypto.createHash('sha256').update(await read(`${assets}/front.png`)).digest('hex'), expectedSha256: manifest.frontSha256, nativePixels: 96, enlargement: { factor: 4, pixels: 384, method: 'nearest-neighbor' }, historicalCanvasSizes: history.map(({ title, size }) => ({ title, width: size, height: size })), frameCount: states.reduce((n, [, sequence]) => n + sequence.durations.length, 0), outputs: ['comparison-board.png', 'animation-frames.png', 'review.html'], notes: 'PNG board sprites are composited directly from source PNGs, with only integer nearest-neighbor enlargement. This record does not assert browser QA.' };
if (checks.canonicalSha256 !== checks.expectedSha256) throw new Error('Canonical master hash mismatch.');
await fs.writeFile(path.join(out, 'review-board-build.json'), JSON.stringify(checks, null, 2) + '\n');
console.log(`Built V3.4 review board and ${checks.frameCount} native animation frame contacts in ${path.relative(root, out)}.`);
