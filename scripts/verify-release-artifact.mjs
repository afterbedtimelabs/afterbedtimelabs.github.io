// Release-only audit of the actual static build. Never changes assets or Git refs.
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = resolve('.');
const out = resolve('docs/ambient-v12-release');
const base = process.argv[2] || 'http://127.0.0.1:4355';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', windowsHide: true }).trim();
const checks = [];
function check(name, pass, detail) { checks.push({ name, pass: Boolean(pass), detail }); }
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(e => e.isDirectory() ? walk(resolve(dir,e.name)) : [resolve(dir,e.name)]))).flat();
}
const distFiles = await walk(resolve('dist'));
const manifest = [];
const findings = [];
const secrets = [
  ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],
  ['github-token', /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{70,})\b/],
  ['aws-access-key', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ['slack-token', /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/],
];
const textFile = /\.(?:html|css|js|mjs|cjs|ts|astro|json|md|txt|xml|svg|yml|yaml)$/i;
function scan(file, bytes, deployed) {
  if(!textFile.test(file)) return;
  const body = bytes.toString('utf8');
  for(const [kind, pattern] of secrets) if(pattern.test(body)) findings.push({file,kind,deployed});
  if(deployed && /(?:[A-Z]:\\(?:Users|AI|workspace)\\|\/Users\/|\/home\/[a-z][^/]*\/)/.test(body)) findings.push({file,kind:'absolute-private-path',deployed});
}
for(const file of distFiles) {
  const name = relative(resolve('dist'), file).replaceAll('\\','/');
  const bytes = await readFile(file);
  manifest.push({path:name,bytes:bytes.length,sha256:sha(bytes)});
  scan('dist/'+name,bytes,true);
}
const tracked = git('ls-files','-z').split('\0').filter(Boolean);
for(const name of tracked) scan(name,await readFile(name),false);
check('No high-confidence secret patterns or private filesystem paths in deployed text',findings.length===0,findings);
const forbidden = manifest.filter(f=>/(?:^|\/)(?:\.env(?:\.|$)|\.git(?:\/|$)|node_modules\/|docs\/|art\/)|\.(?:map|log|mp4|pem|key)$/i.test(f.path));
check('No source artwork, review recordings, environment files, source maps or dependency directories deployed',forbidden.length===0,forbidden.map(f=>f.path));
const acceptedFiles = git('ls-tree','-r','--name-only','d972b1d','--','src','public','art','docs/ambient-v1','docs/ambient-v1-2','docs/night-workshop-v1-1','astro.config.mjs','package.json','package-lock.json','.github').split('\n').filter(Boolean);
const changed = git('diff','--name-only','d972b1d','--',...acceptedFiles);
check('Accepted application, artwork, music, dependencies, workflows and historical evidence unchanged',!changed,{files:acceptedFiles.length,changed});
check('Latest fetched main is an ancestor of accepted closeout',git('merge-base','release-audit/main','d972b1d')===git('rev-parse','release-audit/main'));
const deleted = git('diff','--diff-filter=D','--name-only','release-audit/main','d972b1d','--','src','public');
check('No main source or public asset paths deleted',!deleted,deleted);
let publicExact=0;
for(const file of await walk(resolve('public'))) {
  const rel=relative(resolve('public'),file);
  if(sha(await readFile(file))===sha(await readFile(resolve('dist',rel)))) publicExact++;
  else findings.push({file:rel,kind:'public-byte-mismatch'});
}
check('Every public asset copied byte-for-byte',publicExact===(await walk(resolve('public'))).length,{count:publicExact});
const live=JSON.parse(await readFile(resolve(out,'live-origin.json'),'utf8'));
const liveURLs=live.find(r=>r.value?.requested.endsWith('/sitemap-0.xml'))?.value?.locations||[];
const sitemap=await readFile('dist/sitemap-0.xml','utf8');
check('All current public sitemap URLs retained',liveURLs.length>0&&liveURLs.every(url=>sitemap.includes(url)),{count:liveURLs.length});
const http=[];
for(const item of manifest) {
  const route=item.path==='index.html'?'/':item.path.endsWith('/index.html')?'/'+item.path.slice(0,-10):'/'+item.path;
  const response=await fetch(base+route);
  const bytes=Buffer.from(await response.arrayBuffer());
  http.push({path:route,status:response.status,type:response.headers.get('content-type'),bytes:bytes.length,exact:sha(bytes)===item.sha256});
}
check('All production files served without missing assets or content mismatch',http.every(r=>(r.status===200||r.path==='/404.html'&&r.status===404)&&r.exact),{files:http.length,failures:http.filter(r=>!r.exact||r.status!==200&&r.path!=='/404.html')});
const lock=JSON.parse(await readFile('package-lock.json','utf8'));
const licenses={};
for(const [name,pkg] of Object.entries(lock.packages||{})) if(name) {const license=pkg.license||'UNSPECIFIED';licenses[license]=(licenses[license]||0)+1;}
const report={checkedAt:new Date().toISOString(),source:git('rev-parse','HEAD'),main:git('rev-parse','release-audit/main'),accepted:git('rev-parse','ba475f7'),checks,licenseInventory:licenses,secretScan:{trackedFiles:tracked.length,deployedFiles:manifest.length,findings,limitation:'Pattern review is not exhaustive; does not certify image privacy or legal ownership. Historical local paths in source documentation are retained.'},publicBytes:manifest.reduce((sum,f)=>sum+f.bytes,0),manifest,http};
await mkdir(out,{recursive:true});
await writeFile(resolve(out,'artifact-audit.json'),JSON.stringify(report,null,2)+'\n');
for(const c of checks) console.log(`${c.pass?'PASS':'FAIL'} ${c.name}`);
console.log(JSON.stringify({files:manifest.length,bytes:report.publicBytes,licenses}));
if(checks.some(c=>!c.pass)) process.exitCode=1;
