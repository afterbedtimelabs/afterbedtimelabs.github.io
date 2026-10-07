// Render repository-native vector branding with Astro's existing Sharp dependency.
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

await sharp('public/social-card.svg').png().toFile('public/social-card.png');
const favicon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#161c1a"/><g fill="none" stroke="#dfb674" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M23 52h26M36 52V42l11-17-13-12M29 9l10 9-17 12-9-9L29 9Z"/><path d="m20 31 4 5"/></g></svg>';
await writeFile('public/favicon.svg', `${favicon}\n`);
const png = await sharp(Buffer.from(favicon)).resize(64, 64).png().toBuffer();
// An ICO directory can contain a PNG payload (Windows Vista and newer).
const header = Buffer.alloc(22);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header[6] = 64;
header[7] = 64;
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(png.length, 14);
header.writeUInt32LE(22, 18);
await writeFile('public/favicon.ico', Buffer.concat([header, png]));
console.log('Generated social-card.png and lamp favicons.');
