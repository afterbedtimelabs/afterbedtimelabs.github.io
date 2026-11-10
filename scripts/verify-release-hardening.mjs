// Verify bounded maintenance against the accepted release and its production manifest.
import assert from 'node:assert/strict';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const baseline = '43d308f4409af854f2f6a58d701c0820011e7780';
const git = (...args) => execFileSync('git', args, { encoding: 'utf8', windowsHide: true }).trim();
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const out = 'docs/ambient-v12-hardening';
const base = process.argv[2] || 'http://127.0.0.1:4357';
const before = JSON.parse(git('show', baseline + ':package-lock.json'));
const after = JSON.parse(await readFile('package-lock.json', 'utf8'));
const patches = { 'fast-uri': '3.1.9', undici: '8.12.2', zod: '4.6.6' };
const normalized = structuredClone(after);
const dependencyChanges = [];
for (const [name, version] of Object.entries(patches)) {
  const key = 'node_modules/' + name;
  assert.equal(after.packages[key].version, version);
  assert.equal(JSON.parse(await readFile(key + '/package.json', 'utf8')).version, version);
  for (const field of ['version', 'resolved', 'integrity']) normalized.packages[key][field] = before.packages[key][field];
  dependencyChanges.push({ name, before: before.packages[key].version, after: version, parents: Object.entries(before.packages).filter(([, p]) => p.dependencies?.[name]).map(([path, p]) => ({ path, constraint: p.dependencies[name] })) });
}
assert.deepEqual(normalized, before, 'Only three versions, tarball URLs and integrity values may change');
const preserved = ['src', 'art', '.github', 'astro.config.mjs', 'package.json', 'docs/ambient-v1', 'docs/ambient-v1-2', 'docs/night-workshop-v1-1', 'docs/ambient-v12-release'];
assert.equal(git('diff', '--name-only', baseline, '--', ...preserved), '', 'Application, content, workflows and historical evidence unchanged');
assert.equal(git('diff', '--name-only', baseline, '--', 'public', ':!public/THIRD-PARTY-NOTICES.txt'), '', 'All existing public assets unchanged');
const previous = JSON.parse(await readFile('docs/ambient-v12-release/artifact-audit.json', 'utf8'));
const manifest = [];
async function walk(dir, prefix = '') {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const name = prefix + entry.name;
    if (entry.isDirectory()) await walk(dir + '/' + entry.name, name + '/');
    else { const bytes = await readFile(dir + '/' + entry.name); manifest.push({ path: name, bytes: bytes.length, sha256: hash(bytes) }); }
  }
}
await walk('dist');
for (const item of previous.manifest) assert.deepEqual(manifest.find(f => f.path === item.path), item, 'Accepted production file changed: ' + item.path);
assert.deepEqual(manifest.filter(f => !previous.manifest.some(p => p.path === f.path)).map(f => f.path), ['THIRD-PARTY-NOTICES.txt']);
assert.deepEqual(await readFile('dist/THIRD-PARTY-NOTICES.txt'), await readFile('public/THIRD-PARTY-NOTICES.txt'));
const http = [];
for (const item of manifest) {
  const route = item.path === 'index.html' ? '/' : item.path.endsWith('/index.html') ? '/' + item.path.slice(0, -10) : '/' + item.path;
  const response = await fetch(base + route);
  const exact = hash(Buffer.from(await response.arrayBuffer())) === item.sha256;
  http.push({ route, status: response.status, exact });
  assert.ok(exact && (response.status === 200 || route === '/404.html' && response.status === 404), route);
}
const audit = JSON.parse(await readFile(out + '/audit-after.json', 'utf8'));
assert.equal(audit.metadata.vulnerabilities.total, 0);
await writeFile(out + '/hardening-verification.json', JSON.stringify({ passed: true, baseline, dependencyChanges, onlyNineLockValuesChanged: true, sourceArtworkMusicWorkflowsHistoricalEvidenceUnchanged: true, priorProductionFilesExact: previous.manifest.length, addedProductionFiles: ['THIRD-PARTY-NOTICES.txt'], audit: audit.metadata.vulnerabilities, manifest, http }, null, 2) + '\n');
console.log(`PASS: only three compatible dependency patches; ${previous.manifest.length} accepted production files byte-identical; notice is the sole addition; ${http.length} HTTP assets verified; audit zero.`);
