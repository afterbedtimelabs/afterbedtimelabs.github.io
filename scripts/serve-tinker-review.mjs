/** Local-only review server. No production routes, dependencies, or directory listings. */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const allowed = ['docs/tinker-panda-v3.4', 'art/tinker-panda-v3.4', 'public/mascot/tinker-panda-v3.4'].map(p => path.resolve(root, p));
const mime = { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.json': 'application/json; charset=utf-8', '.md': 'text/plain; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
const port = Number(process.env.TINKER_REVIEW_PORT || 4322);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid TINKER_REVIEW_PORT.');
const within = (file, directory) => file === directory || file.startsWith(directory + path.sep);
const server = http.createServer(async (request, response) => {
  const fail = status => { response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }); response.end(status === 405 ? 'Method not allowed' : 'Not found'); };
  if (!['GET', 'HEAD'].includes(request.method)) return fail(405);
  try {
    const hostname = (request.headers.host || '').split(':')[0];
    if (!['127.0.0.1', 'localhost'].includes(hostname)) return fail(404);
    const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    if (pathname.includes('\0') || pathname.includes('\\')) return fail(404);
    const relative = pathname === '/' ? 'docs/tinker-panda-v3.4/review.html' : pathname.replace(/^\/+/, '');
    const file = path.resolve(root, relative);
    if (!allowed.some(dir => within(file, dir))) return fail(404);
    const ext = path.extname(file).toLowerCase();
    if (!mime[ext]) return fail(404);
    const real = await fs.realpath(file);
    if (!allowed.some(dir => within(real, dir))) return fail(404);
    if (!(await fs.stat(real)).isFile()) return fail(404);
    const content = await fs.readFile(real);
    response.writeHead(200, { 'Content-Type': mime[ext], 'Content-Length': content.length, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'Content-Security-Policy': "default-src 'self'; img-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'none'; frame-ancestors 'none'" });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch { fail(404); }
});
server.listen(port, '127.0.0.1', () => console.log(`Tinker Panda V3.4 local review: http://127.0.0.1:${port}/docs/tinker-panda-v3.4/review.html`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
