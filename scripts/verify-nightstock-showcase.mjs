import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import sharp from 'sharp';

const hash = b => createHash('sha256').update(b).digest('hex');
const root = 'public/images/projects/showcase';
const captures = JSON.parse(await fs.readFile(`${root}/provenance.json`,'utf8')).filter(x=>x.name.startsWith('nightstock-v131-'));
assert.equal(captures.length,6);
for (const capture of captures) {
  assert.equal(capture.buildCommit,'6657236b3b44683e441c8f9bb67af2bf1065fd86');
  assert.equal(hash(await fs.readFile(capture.preservedOriginal)),capture.sourceSHA256);
  assert.deepEqual(capture.outputs.map(x=>x.width),[640,1280,1920]);
  for (const output of capture.outputs) {
    const bytes=await fs.readFile(`${root}/${output.file}`);
    assert.equal(hash(bytes),output.sha256);
    const meta=await sharp(bytes).metadata();
    assert.equal(meta.width,output.width);
    assert.equal(meta.height,output.height);
    assert.deepEqual(await fs.readFile(`dist/images/projects/showcase/${output.file}`),bytes);
  }
}
const article=await fs.readFile('dist/writing/meet-nightstock/index.html','utf8');
assert.equal((article.match(/loading="eager"/g)||[]).length,1);
assert.equal((article.match(/loading="lazy"/g)||[]).length,5);
assert.match(article,/mission overlay is hidden/);
assert.doesNotMatch(article,/eight loose|early physics playground/);
console.log('PASS: six pinned build captures, original SHA-256s, 18 responsive WebP hashes/dimensions and exact production copies; one eager/five lazy gallery images.');
