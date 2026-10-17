import { readdir, readFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';

// Inspect the deployable output, so broken links and leaked drafts fail locally
// and in the Pages workflow. No browser or extra dependency is required.
const root = resolve('dist');
const origin = new URL(process.env.SITE_URL || 'https://afterbedtimelabs.github.io').origin;
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };
const decode = (value) => value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (_, entity) => {
  const named = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' };
  if (entity.startsWith('#')) return String.fromCodePoint(parseInt(entity.slice(entity[1].toLowerCase() === 'x' ? 2 : 1), entity[1].toLowerCase() === 'x' ? 16 : 10));
  return named[entity.toLowerCase()];
});

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const groups = await Promise.all(entries.map((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? filesIn(path) : [path];
  }));
  return groups.flat();
}

function attributes(raw) {
  const attrs = {};
  for (const match of raw.matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
    attrs[match[1].toLowerCase()] = decode(match[2] ?? match[3] ?? match[4] ?? '');
  }
  return attrs;
}

const paths = await filesIn(root).catch(() => {
  console.error('No dist directory. Run npm run build before npm run verify.');
  process.exit(1);
});
const files = new Set(paths.map((path) => relative(root, path).replaceAll('\\', '/')));
const documents = new Map();
for (const file of files) {
  if (!file.endsWith('.html')) continue;
  const source = await readFile(resolve(root, file), 'utf8');
  const markup = source.replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style)\b([^>]*)>[\s\S]*?<\/\1>/gi, '<$1$2></$1>');
  const tags = [...markup.matchAll(/<([a-z][\w:-]*)\b([^>]*?)>/gi)]
    .map((match) => ({ name: match[1].toLowerCase(), attrs: attributes(match[2]) }));
  const path = file === 'index.html' ? '/' : file.endsWith('/index.html') ? `/${file.slice(0, -10)}` : `/${file}`;
  documents.set(file, { source, markup, tags, path, ids: new Set(tags.map((tag) => tag.attrs.id).filter(Boolean)) });
}

function checkLocalURL(raw, from, label, checkFragment = true) {
  assert(Boolean(raw.trim()), `${label}: empty URL`);
  if (!raw.trim()) return;
  assert(!/^javascript:/i.test(raw), `${label}: javascript URL`);
  if (/^(?:mailto:|tel:|data:)/i.test(raw)) return;
  let url;
  try { url = new URL(raw, new URL(from, origin)); } catch { errors.push(`${label}: invalid URL ${raw}`); return; }
  if (url.origin !== origin) return;
  let pathname;
  try { pathname = decodeURIComponent(url.pathname).replace(/^\/+/, ''); } catch { errors.push(`${label}: invalid URL encoding ${raw}`); return; }
  const target = [pathname || 'index.html', `${pathname}${pathname.endsWith('/') || !pathname ? '' : '/'}index.html`].find((file) => files.has(file));
  assert(Boolean(target), `${label}: missing internal target ${raw}`);
  if (checkFragment && url.hash && target && documents.has(target)) {
    let id;
    try { id = decodeURIComponent(url.hash.slice(1)); } catch { errors.push(`${label}: invalid fragment ${raw}`); return; }
    assert(documents.get(target).ids.has(id), `${label}: missing fragment ${raw}`);
  }
}

for (const required of ['index.html', 'writing/index.html', 'projects/index.html', 'about/index.html', 'navi/index.html', 'navi/privacy/index.html', '404.html']) {
  assert(files.has(required), `Missing required page: ${required}`);
}

const titles = new Set();
for (const file of ['index.html', 'navi/index.html']) {
  const links = documents.get(file)?.tags.filter((tag) => tag.name === 'a').map((tag) => tag.attrs.href) || [];
  assert(links.includes('/navi/privacy/'), `${file}: missing discoverable Navi privacy policy link`);
}
for (const file of ['navi/index.html', 'navi/privacy/index.html']) {
  const doc = documents.get(file);
  assert(doc?.source.includes('https://www.googleapis.com/auth/gmail.readonly'), `${file}: missing exact Gmail permission disclosure`);
  assert(!doc?.tags.some((tag) => tag.name === 'meta' && tag.attrs.name === 'robots' && /noindex/.test(tag.attrs.content)), `${file}: OAuth information page must be indexable`);
}
for (const [file, doc] of documents) {
  const meta = (name) => doc.tags.find((tag) => tag.name === 'meta' && (tag.attrs.name === name || tag.attrs.property === name))?.attrs.content;
  const title = decode(doc.source.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').trim();
  assert(Boolean(title), `${file}: missing page title`);
  assert(!titles.has(title), `${file}: duplicate page title "${title}"`);
  titles.add(title);
  for (const name of ['description', 'viewport', 'og:title', 'og:description', 'og:type', 'og:url', 'twitter:card', 'twitter:title', 'twitter:description']) {
    assert(Boolean(meta(name)?.trim()), `${file}: missing ${name} metadata`);
  }
  assert(Boolean(doc.tags.find((tag) => tag.name === 'html')?.attrs.lang), `${file}: missing document language`);
  assert(doc.tags.filter((tag) => tag.name === 'h1').length === 1, `${file}: expected one h1`);
  assert(doc.tags.filter((tag) => tag.name === 'main').length === 1, `${file}: expected one main landmark`);
  const canonical = doc.tags.find((tag) => tag.name === 'link' && tag.attrs.rel === 'canonical')?.attrs.href;
  let canonicalURL;
  try { canonicalURL = new URL(canonical); } catch { errors.push(`${file}: missing or invalid absolute canonical`); }
  if (canonicalURL) {
    assert(['http:', 'https:'].includes(canonicalURL.protocol), `${file}: invalid canonical protocol`);
    // Query strings can identify the original URL of a syndicated article.
    assert(!canonicalURL.hash, `${file}: canonical contains a fragment`);
    if (file !== '404.html' && canonicalURL.origin === origin) assert(canonicalURL.pathname === doc.path, `${file}: canonical does not match page path ${doc.path}`);
    if (canonicalURL.origin !== origin) assert(doc.path.startsWith('/writing/'), `${file}: unexpected canonical host`);
    assert(meta('og:url') === canonicalURL.href, `${file}: OpenGraph URL differs from canonical`);
  }
  if (file === '404.html') assert(/\bnoindex\b/.test(meta('robots') || ''), '404.html: missing noindex');
  if (meta('twitter:card') === 'summary_large_image') assert(Boolean(meta('og:image') && meta('twitter:image')), `${file}: large social card needs an image`);
  for (const name of ['og:image', 'twitter:image']) {
    if (meta(name)) {
      checkLocalURL(meta(name), doc.path, `${file} ${name}`, false);
      assert(Boolean(meta(`${name}:alt`)), `${file}: missing ${name}:alt`);
    }
  }
  for (const tag of doc.tags) {
    if (tag.name === 'img') assert('alt' in tag.attrs, `${file}: image lacks alt text`);
    if ('href' in tag.attrs) {
      assert(!(tag.name === 'a' && tag.attrs.href === '#'), `${file}: placeholder link`);
      // An explicit external article canonical is allowed.
      if (tag.attrs.rel !== 'canonical') checkLocalURL(tag.attrs.href, doc.path, `${file} ${tag.name} href`);
    }
    if ('src' in tag.attrs) checkLocalURL(tag.attrs.src, doc.path, `${file} ${tag.name} src`, false);
    if (tag.attrs.srcset && !tag.attrs.srcset.startsWith('data:')) {
      for (const candidate of tag.attrs.srcset.split(',')) checkLocalURL(candidate.trim().split(/\s+/)[0], doc.path, `${file} srcset`, false);
    }
  }
}

for (const file of files) {
  if (!file.endsWith('.css')) continue;
  const css = await readFile(resolve(root, file), 'utf8');
  for (const match of css.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/g)) checkLocalURL(match[2], `/${file}`, `${file} CSS asset`, false);
}

const sitemapFiles = [...files].filter((file) => /^sitemap.*\.xml$/.test(file));
assert(files.has('sitemap-index.xml'), 'Missing sitemap-index.xml');
const sitemapURLs = new Set();
for (const file of sitemapFiles) {
  const xml = await readFile(resolve(root, file), 'utf8');
  for (const match of xml.matchAll(/<loc>(.*?)<\/loc>/g)) {
    const value = decode(match[1]);
    let url;
    try { url = new URL(value); } catch { errors.push(`${file}: invalid sitemap URL ${value}`); continue; }
    assert(url.origin === origin, `${file}: unexpected sitemap origin`);
    assert(!/\/404(?:\.html)?\/?$/.test(url.pathname), `${file}: includes 404 page`);
    checkLocalURL(value, '/', `${file} location`, false);
    if (!url.pathname.endsWith('.xml')) sitemapURLs.add(url.href);
  }
}
for (const [file, doc] of documents) {
  if (file !== '404.html') assert(sitemapURLs.has(new URL(doc.path, origin).href), `${file}: page is absent from sitemap`);
}

assert(files.has('rss.xml'), 'Missing RSS feed');
const rss = files.has('rss.xml') ? await readFile(resolve(root, 'rss.xml'), 'utf8') : '';
assert(/<channel>/.test(rss), 'RSS feed lacks a channel');
for (const match of rss.matchAll(/<link>(.*?)<\/link>/g)) {
  const url = decode(match[1]);
  assert(url.startsWith(`${origin}/`), 'RSS link has an incorrect public origin');
  checkLocalURL(url, '/', 'RSS link', false);
}
assert(files.has('robots.txt'), 'Missing robots.txt');
if (files.has('robots.txt')) {
  const robots = await readFile(resolve(root, 'robots.txt'), 'utf8');
  assert(robots.includes(`Sitemap: ${origin}/sitemap-index.xml`), 'robots.txt has an incorrect sitemap URL');
}

const sourceFiles = await filesIn(resolve('src/content/writing'));
let drafts = 0;
for (const file of sourceFiles.filter((file) => /\.mdx?$/.test(file))) {
  const source = await readFile(file, 'utf8');
  const frontmatter = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  if (!/^draft:\s*true\s*(?:#.*)?$/m.test(frontmatter?.[1] || '')) continue;
  drafts += 1;
  const slug = relative(resolve('src/content/writing'), file).replaceAll('\\', '/').replace(/\.mdx?$/, '');
  const path = `/writing/${slug}/`;
  assert(!files.has(`writing/${slug}/index.html`), `Draft article leaked into build: ${slug}`);
  assert(!sitemapURLs.has(new URL(path, origin).href), `Draft article leaked into sitemap: ${slug}`);
  assert(!rss.includes(new URL(path, origin).href), `Draft article leaked into RSS: ${slug}`);
}

if (errors.length) {
  console.error(`Build verification failed (${errors.length} issue${errors.length === 1 ? '' : 's'}):\n${errors.map((message) => `- ${message}`).join('\n')}`);
  process.exit(1);
}
console.log(`Verified ${documents.size} HTML pages: metadata, local links, fragments, assets, sitemap, RSS, robots, and ${drafts} excluded draft${drafts === 1 ? '' : 's'}.`);
