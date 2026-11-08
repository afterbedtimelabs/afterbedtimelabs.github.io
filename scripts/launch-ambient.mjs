import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync, spawn } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
let astro;
try { astro = join(dirname(require.resolve('astro/package.json')), require('astro/package.json').bin.astro); }
catch { console.error('Astro is missing. Run npm ci in this worktree, then launch again.'); process.exit(1); }
function run(args) {
  const result = spawnSync(process.execPath, [astro, ...args], { cwd: root, encoding: 'utf8', windowsHide: true });
  const output = (result.stdout || '') + (result.stderr || '');
  if (result.error) throw result.error;
  return { ...result, output };
}
let result = run(['dev', 'status']);
if (!/Dev server running at/.test(result.output)) result = run(['dev', '--background', '--host', '127.0.0.1', '--port', '4351']);
if (result.status !== 0) { console.error(result.output); process.exit(result.status || 1); }
const url = result.output.match(/http:\/\/127\.0\.0\.1:\d+/)?.[0];
if (!url) { console.error('Could not determine the preview URL. Run npm run dev -- status.\n' + result.output); process.exit(1); }
console.log(`Ambient Homepage V1\n${url}/\n\nSound starts only when you press Play music or Rain off.\nStop: npm run dev -- stop\nStatus: npm run dev -- status\nLogs: npm run dev -- logs`);
if (process.argv.includes('--open')) {
  // The launcher is an intentional owner action. Opening the page never plays sound.
  if (process.platform === 'win32') spawn('cmd.exe', ['/d', '/c', 'start', '', `${url}/`], { windowsHide: true, stdio: 'ignore' }).unref();
  else console.log('Open the URL above in your browser.');
}
