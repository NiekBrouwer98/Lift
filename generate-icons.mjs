// Run once with: node generate-icons.mjs
// Requires no extra deps – uses the Canvas API via the 'canvas' package if available,
// otherwise writes a minimal PNG via raw bytes.
// Simplest approach: write SVG files that browsers accept as icons.

import fs from 'fs';
import path from 'path';

const svg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="#007AFF"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
        font-size="${size * 0.52}" font-family="-apple-system,sans-serif">🏋️</text>
</svg>`;

const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svg(512));
fs.writeFileSync(path.join(publicDir, 'icon-192.png.svg'), svg(192));
fs.writeFileSync(path.join(publicDir, 'icon-512.png.svg'), svg(512));

console.log('SVG icons written to public/. For real PNGs, convert with a tool like Inkscape or use an online converter.');
