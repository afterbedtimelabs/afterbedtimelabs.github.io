import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

// Original viewport readbacks: no cropping, color adjustment or retouching.
const buildCommit = '6657236b3b44683e441c8f9bb67af2bf1065fd86';
const root = 'public/images/projects/showcase';
const scenic = path.resolve('.recovery/nightstock-scenic');
const packaged = 'D:/Night Stock/nightstock-v131/artifacts/v131-package-captures/final-02/screenshots';
const selections = [
  ['road', `${scenic}/bridge-cab.png`, 'Staged bridge viewpoint; mission overlay hidden; production cab and headlights.'],
  ['forest', `${scenic}/forest-cab.png`, 'Staged cedar forest viewpoint; mission overlay hidden.'],
  ['tunnel', `${scenic}/tunnel-cab.png`, 'Staged tunnel viewpoint; mission overlay hidden.'],
  ['store', `${scenic}/yorumichi-exterior.png`, 'Staged exterior camera at YORUMICHI; mission overlay hidden.'],
  ['delivery', `${packaged}/09-physical-delivery.png`, 'Existing packaged capture harness; staged arrival, real physical handover.'],
  ['phone', `${packaged}/02-dispatch.png`, 'Existing packaged capture harness; actual dispatch phone at depot.'],
];
const provenance = JSON.parse(await fs.readFile(`${root}/provenance.json`, 'utf8')).filter(x => !x.name.startsWith('nightstock-v131-'));
const hash = b => createHash('sha256').update(b).digest('hex');
await fs.mkdir('docs/nightstock-tinker-review/gameplay-originals', {recursive:true});
for (const [id, originalCapturePath, context] of selections) {
  const name = `nightstock-v131-${id}`;
  const original = `docs/nightstock-tinker-review/gameplay-originals/${name}.png`;
  // A clean checkout can reproduce exports from the preserved lossless originals.
  const input = await fs.readFile(originalCapturePath).catch(() => fs.readFile(original));
  const meta = await sharp(input).metadata();
  await fs.writeFile(original, input);
  const outputs = [];
  for (const width of [640, 1280, 1920]) {
    const file = `${name}${width === 1920 ? '' : `-${width}`}.webp`;
    const bytes = await sharp(input).resize({width}).webp({quality:84, effort:6}).toBuffer();
    await fs.writeFile(`${root}/${file}`, bytes);
    outputs.push({file, bytes:bytes.length, width, height:width*9/16, sha256:hash(bytes)});
  }
  provenance.push({name, sourceBuild:'NightStock V1.3.1 Windows', buildCommit,
    executableSHA256:'ab1824f85bfd8e0e4128182c000c4003a3e042245b2967848d089b2a04b22424',
    packSHA256:'047072e08dd0affedd0bb6e85806c908c8c54479bf4802e0ad7f53967c12c579',
    originalCapturePath, preservedOriginal:original, sourceSHA256:hash(input), originalBytes:input.length,
    width:meta.width, height:meta.height, context, processing:'Resize and WebP compression only.', outputs});
}
await fs.writeFile(`${root}/provenance.json`, JSON.stringify(provenance,null,2)+'\n');
console.log('Exported six genuine V1.3.1 captures at 640, 1280 and 1920 pixels.');
