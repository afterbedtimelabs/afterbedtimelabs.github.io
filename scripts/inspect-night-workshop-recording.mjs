/** Extract a readable motion strip from the actual browser movie, at display scale. */
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'docs/night-workshop-v1-1');
const report = JSON.parse(await readFile(path.join(output, 'browser-recording.json'), 'utf8'));
const scratch = path.join(root, report.scratch, 'inspection');
await mkdir(scratch, { recursive: true });
const firstMove = report.poses.findIndex(state => state.second > 3 && state.pose !== 'rest');
const restAfter = report.poses.findIndex((state, index) => index > firstMove && state.pose === 'rest');
if (firstMove < 0 || restAfter < 0) throw new Error('Recording has no complete observed typing burst.');
const selected = [report.poses[firstMove - 1], ...report.poses.slice(firstMove, restAfter + 1)];
const samples = selected.filter((state, index) => index === 0 || state.pose !== selected[index - 1].pose);
const crop = { left: 755, top: 525, width: 350, height: 200 };
const cell = { width: 350, height: 226 }, columns = 4;
const images = [];
for (let i = 0; i < samples.length; i++) {
  const sample = samples[i], timestamp = Math.max(3.6, sample.second);
  const frame = path.join(scratch, `movie-frame-${i}.png`);
  const result = spawnSync(process.env.FFMPEG_BINARY || 'ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-ss', timestamp.toFixed(3), '-i', path.join(root, report.file), '-frames:v', '1', frame], { windowsHide: true, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || 'Frame extraction failed.');
  const x = (i % columns) * cell.width, y = Math.floor(i / columns) * cell.height;
  images.push({ input: await sharp(frame).extract(crop).png().toBuffer(), left: x, top: y + 26 });
  const label = `<svg width="350" height="26"><rect width="350" height="26" fill="#171d21"/><text x="8" y="18" fill="#f0dfc6" font-size="12" font-family="monospace">${timestamp.toFixed(3)}s · observed ${sample.pose}</text></svg>`;
  images.push({ input: Buffer.from(label), left: x, top: y });
}
const strip = path.join(output, 'screenshots/recorded-typing-burst-contact-sheet.png');
await sharp({ create: { width: columns * cell.width, height: Math.ceil(samples.length / columns) * cell.height, channels: 3, background: '#171d21' } }).composite(images).png().toFile(strip);
await writeFile(path.join(output, 'recording-motion-inspection.json'), JSON.stringify({ source: report.file, method: 'Frames extracted from the real browser MP4 at observed pose timestamps; original displayed pixel scale; no pose or image modifications beyond cropping and labels.', crop, samples, contactSheet: path.relative(root, strip).replaceAll('\\', '/') }, null, 2) + '\n');
console.log(strip);
