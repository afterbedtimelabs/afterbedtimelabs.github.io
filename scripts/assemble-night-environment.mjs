/** Deterministic environment-only composite. See environment/assembly.json. */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const directory = path.join(root, 'art/night-workshop-v1-1/environment');
await mkdir(directory, { recursive: true });
const width = 1659, height = 948, size = width * height;
const originalPath = path.join(root, 'art/ambient-v1/rainy-workshop-v1.png');
const generatedPath = path.join(directory, 'generated-night-clean.png');
const original = await sharp(originalPath).removeAlpha().raw().toBuffer();
const registered = await sharp(generatedPath).resize({ width, height: 1010, fit: 'fill', kernel: 'nearest' })
  .extract({ left: 0, top: 0, width, height }).removeAlpha().raw().toBuffer();

const panes = [
  [[819,102],[983,81],[983,239],[819,248]],
  [[1009,77],[1220,49],[1221,227],[1008,239]],
  [[1247,43],[1495,10],[1494,218],[1246,229]],
  [[820,266],[984,255],[985,551],[820,550]],
  [[1009,254],[1221,242],[1221,550],[1009,550]],
  [[1247,244],[1494,234],[1494,558],[1247,551]],
  [[1522,8],[1566,0],[1566,96],[1521,219]],
];
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="black"/><path d="M805 90 L1505 0 L1505 566 L805 565Z M1517 0 H1573 V220 H1517Z" fill="white"/></svg>`;
await writeFile(path.join(directory, 'glass-panes.svg'), svg);
const region = await sharp(Buffer.from(svg)).greyscale().raw().toBuffer();
const foreground = new Uint8Array(size), queue = new Int32Array(size);
let read = 0, write = 0;
const shade = [[1285,404],[1321,362],[1363,340],[1420,339],[1450,376],[1470,440],[1466,465],[1420,466],[1320,439],[1285,419]];
function insidePolygon(x, y, vertices) {
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const [xi, yi] = vertices[i], [xj, yj] = vertices[j];
    if (((yi > y) !== (yj > y)) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
const warm = index => {
  const x = index % width, y = Math.floor(index / width);
  const frame = x < 820 || x > 1493 || (x >= 982 && x <= 1009) || (x >= 1219 && x <= 1247) || y > 549 || (y > 225 && y < 268) || y < 100 - (x - 815) * .132;
  const head = x >= 827 && x <= 1147 && y >= 297;
  const plant = x >= 1470 && y <= 365;
  const lamp = insidePolygon(x,y,shade) || (x >= 1375 && x <= 1475 && y >= 287 && y <= 366) || (x >= 1458 && y >= 346 && y <= 475);
  const laptop = insidePolygon(x,y,[[1206,535],[1347,511],[1347,521],[1334,568],[1180,568]]);
  return (frame || head || plant || lamp || laptop) && original[index * 3] >= original[index * 3 + 2] - 2 && original[index * 3] >= original[index * 3 + 1] - 8;
};
const neighbours = index => [index - 1, index + 1, index - width, index + width];
// The source's warm wood/character/lamp silhouettes connect to each glass edge;
// isolated exterior windows remain inside the glass selection.
for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
  const p = y * width + x;
  if (region[p] < 250 || !warm(p)) continue;
  if (x === 0 || y === 0 || x === width - 1 || y === height - 1 || neighbours(p).some(n => region[n] < 250)) {
    foreground[p] = 1; queue[write++] = p;
  }
}
while (read < write) {
  const p = queue[read++];
  for (const n of neighbours(p)) if (n >= 0 && n < size && region[n] >= 250 && !foreground[n] && warm(n)) {
    foreground[n] = 1; queue[write++] = n;
  }
}
// Connected exterior fill closes small cool details within the warm silhouette.
const exterior = new Uint8Array(size);
read = 0; write = 0;
for (const [x,y] of [[830,120],[1020,100],[1270,100],[830,280],[1180,300],[1260,270],[1440,500],[1450,330],[1530,25]]) {
  const p = y * width + x; if (region[p] >= 250 && !foreground[p]) { exterior[p] = 255; queue[write++] = p; }
}
for (let y = 550; y < height; y++) for (let x = 0; x < 1145; x++) exterior[y * width + x] = 0;
while (read < write) {
  const p = queue[read++];
  for (const n of neighbours(p)) if (n >= 0 && n < size && region[n] >= 250 && !foreground[n] && !exterior[n]) {
    exterior[n] = 255; queue[write++] = n;
  }
}
// An inward distance field keeps generated registration drift away from fixed art.
const distance = new Uint16Array(size).fill(999);
for (let p = 0; p < size; p++) if (!exterior[p]) distance[p] = 0;
for (let y = 1; y < height; y++) for (let x = 1; x < width; x++) {
  const p = y * width + x; distance[p] = Math.min(distance[p], distance[p - 1] + 1, distance[p - width] + 1);
}
for (let y = height - 2; y >= 0; y--) for (let x = width - 2; x >= 0; x--) {
  const p = y * width + x; distance[p] = Math.min(distance[p], distance[p + 1] + 1, distance[p + width] + 1);
}
const composite = Buffer.from(original), generatedMask = new Uint8Array(size);
for (let p = 0; p < size; p++) {
  if (!exterior[p]) continue;
  const i = p * 3;
  const nearCharacter = (p % width < 1160 && Math.floor(p / width) > 290);
  const inset = nearCharacter ? 13 : 8;
  const alpha = Math.max(0, Math.min(1, (distance[p] - inset) / 5));
  generatedMask[p] = Math.round(alpha * 255);
  // Grade only original glass pixels in the transition band to blue-black.
  const graded = [original[i] * .22, original[i + 1] * .25, original[i + 2] * .29];
  for (let c = 0; c < 3; c++) composite[i + c] = Math.round(graded[c] * (1 - alpha) + registered[i + c] * alpha);
}
// The lower painted plume crosses the wooden sill, so the environment replacement
// alone cannot remove it. Reconstruct those scanlines from clean original wood
// immediately to either side. This keeps every horizontal sill edge registered.
const steamSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="black"/><path d="M1344 535 H1410 V574 L1390 587 L1378 600 L1384 616 L1354 616 L1340 599 L1340 581 L1358 567 L1344 555Z" fill="white"/></svg>`;
await writeFile(path.join(directory, 'steam-removal-mask.svg'), steamSvg);
const steamMask = await sharp(Buffer.from(steamSvg)).greyscale().blur(1).raw().toBuffer();
const cleanSteam = Buffer.from(composite);
for (let y = 533; y <= 616; y++) {
  const left = [0,0,0], right = [0,0,0];
  for (let offset = 0; offset < 5; offset++) for (let c = 0; c < 3; c++) {
    left[c] += composite[(y * width + 1338 + offset) * 3 + c] / 5;
    right[c] += composite[(y * width + 1409 + offset) * 3 + c] / 5;
  }
  for (let x = 1340; x < 1410; x++) {
    const p = y * width + x, i = p * 3, alpha = steamMask[p] / 255;
    const mix = (x - 1340) / 71;
    for (let c = 0; c < 3; c++) {
      cleanSteam[i + c] = y < 550 ? registered[i + c] : Math.round(left[c] * (1 - mix) + right[c] * mix);
      composite[i + c] = Math.round(composite[i + c] * (1 - alpha) + cleanSteam[i + c] * alpha);
    }
  }
}
await sharp(steamMask, { raw: { width, height, channels: 1 } }).png().toFile(path.join(directory, 'steam-removal-mask.png'));
await sharp(cleanSteam, { raw: { width, height, channels: 3 } }).extract({ left: 1330, top: 540, width: 110, height: 80 }).png().toFile(path.join(directory, 'clean-sill-patch.png'));
await sharp(Buffer.from(exterior), { raw: { width, height, channels: 1 } }).png().toFile(path.join(directory, 'exterior-mask.png'));
await sharp(Buffer.from(exterior), { raw: { width, height, channels: 1 } }).png().toFile(path.join(root, 'public/images/ambient/window-motion-mask-v1-1.png'));
await sharp(Buffer.from(generatedMask), { raw: { width, height, channels: 1 } }).png().toFile(path.join(directory, 'generated-interior-mask.png'));
await sharp(registered, { raw: { width, height, channels: 3 } }).png().toFile(path.join(directory, 'registered-night-clean.png'));
await sharp(composite, { raw: { width, height, channels: 3 } }).png().toFile(path.join(directory, 'night-environment.png'));
await sharp(composite, { raw: { width, height, channels: 3 } }).webp({ lossless: true, effort: 6 }).toFile(path.join(root, 'public/images/ambient/night-workshop-v1-1.webp'));
const regions = {
  face: [935,435,165,105], scarf: [835,570,165,40], torsoAndNearPaw: [921,600,130,110],
  farPaw: [1064,625,78,48], tail: [672,500,126,235], desk: [700,800,500,90],
  lampShadeInterior: [1340,382,85,40], keyboard: [973,690,175,45],
};
const fixedRegions = Object.fromEntries(Object.entries(regions).map(([name,[x,y,w,h]]) => {
  let changedPixels = 0;
  for (let yy = y; yy < y+h; yy++) for (let xx = x; xx < x+w; xx++) {
    const i = (yy * width + xx) * 3;
    if (original[i] !== composite[i] || original[i+1] !== composite[i+1] || original[i+2] !== composite[i+2]) changedPixels++;
  }
  return [name, { bounds: [x,y,w,h], changedPixels }];
}));
let changedOutsideMasks = 0;
for (let p = 0; p < size; p++) if (!exterior[p] && !steamMask[p]) {
  const i = p * 3;
  if (original[i] !== composite[i] || original[i+1] !== composite[i+1] || original[i+2] !== composite[i+2]) changedOutsideMasks++;
}
await writeFile(path.join(directory, 'preservation-checks.json'), JSON.stringify({ fixedRegions, changedOutsideMasks, allPass: changedOutsideMasks === 0 && Object.values(fixedRegions).every(region => region.changedPixels === 0) }, null, 2) + '\n');
if (changedOutsideMasks || Object.values(fixedRegions).some(region => region.changedPixels)) throw new Error('Environment composite changed a protected interior region.');
await writeFile(path.join(directory, 'assembly.json'), JSON.stringify({ source: 'art/ambient-v1/rainy-workshop-v1.png', generated: 'generated-night-clean.png', dimensions: [width,height], registration: { input: [1596,985], output: [1659,1010], crop: [0,0,1659,948], kernel: 'nearest' }, glassPanes: panes, foreground: 'Connected original warm silhouettes within bounded physical foreground regions; exterior flood fill; original pixels reused outside mask.', generatedInsetPixels: { normal: 8, character: 13 }, blendWidthPixels: 5, boundaryGradeRGB: [.22,.25,.29], steamCleanup: { mask: 'steam-removal-mask.svg', patch: 'clean-sill-patch.png', source: 'Registered exterior below row 550; clean original/composited scanlines to either side of plume for wood', rows: [533,616], leftSamplesX: [1338,1342], rightSamplesX: [1409,1413], featherPixels: 1 }, reproduction: 'node scripts/assemble-night-environment.mjs' }, null, 2) + '\n');
console.log('Assembled registered nighttime exterior; original interior pixels retained.');
