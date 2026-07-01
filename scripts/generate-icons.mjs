import { Resvg } from '@resvg/resvg-js';
import { deflateSync } from 'zlib';
import { writeFileSync, mkdirSync } from 'fs';

// ---------------------------------------------------------------------------
// Hany Clinic — icon/logo generator. One-off dev tool (needs @resvg/resvg-js).
// Renders the tooth mark to every iOS AppIcon + Android mipmap size.
// ---------------------------------------------------------------------------

const TEAL = '#0E7490';

const DEFS = `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1024" y2="1024" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#0E7490"/>
      <stop offset="1" stop-color="#0C4A6E"/>
    </linearGradient>
    <linearGradient id="tooth" x1="512" y1="290" x2="512" y2="740" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#FFFFFF"/>
      <stop offset="1" stop-color="#E0F7FB"/>
    </linearGradient>
  </defs>`;

const MARK = `
  <g transform="translate(512 512) scale(1.16) translate(-512 -512)">
    <path fill="url(#tooth)" d="
      M512,300 C470,296 430,298 400,326 C372,352 372,392 374,430
      C377,486 396,520 410,566 C422,606 428,668 446,706
      C456,728 478,728 488,704 C496,684 500,652 512,640
      C524,652 528,684 536,704 C546,728 568,728 578,706
      C596,668 602,606 614,566 C628,520 647,486 650,430
      C652,392 652,352 624,326 C594,298 554,296 512,300 Z"/>
    <g fill="${TEAL}">
      <rect x="492" y="380" width="40" height="120" rx="12"/>
      <rect x="452" y="420" width="120" height="40" rx="12"/>
    </g>
  </g>`;

const svgSquare = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">${DEFS}<rect width="1024" height="1024" fill="url(#bg)"/>${MARK}</svg>`;
const svgRounded = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">${DEFS}<rect width="1024" height="1024" rx="180" fill="url(#bg)"/>${MARK}</svg>`;
const svgCircle = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">${DEFS}<circle cx="512" cy="512" r="512" fill="url(#bg)"/>${MARK}</svg>`;
const svgForeground = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">${DEFS}${MARK}</svg>`;

// --- minimal true-color (no-alpha) PNG encoder for iOS (App Store safe) ------
function crc32(buf) {
  let table = crc32._t;
  if (!table) {
    table = crc32._t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}
function encodePngRGB(rgba, w, h) {
  const rowLen = w * 3;
  const raw = Buffer.alloc((rowLen + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (rowLen + 1)] = 0; // filter: none
    for (let x = 0; x < w; x++) {
      const si = (y * w + x) * 4;
      const di = y * (rowLen + 1) + 1 + x * 3;
      raw[di] = rgba[si];
      raw[di + 1] = rgba[si + 1];
      raw[di + 2] = rgba[si + 2];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: truecolor (no alpha)
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

function render(svg, size) {
  const img = new Resvg(svg, { fitTo: { mode: 'width', value: size }, font: { loadSystemFonts: false } }).render();
  return { rgba: img.pixels, png: img.asPng(), w: img.width, h: img.height };
}
function writeOpaque(svg, size, out) {
  const { rgba, w, h } = render(svg, size);
  writeFileSync(out, encodePngRGB(rgba, w, h));
  console.log('iOS  ', out);
}
function writeAlpha(svg, size, out) {
  writeFileSync(out, render(svg, size).png);
  console.log('AND  ', out);
}

// --- iOS AppIcon -------------------------------------------------------------
const IOS = 'ios/ClinicApp/Images.xcassets/AppIcon.appiconset';
mkdirSync(IOS, { recursive: true });
const iosTargets = [
  { size: 40, file: 'AppIcon-20@2x.png', base: '20x20', scale: '2x', idiom: 'iphone' },
  { size: 60, file: 'AppIcon-20@3x.png', base: '20x20', scale: '3x', idiom: 'iphone' },
  { size: 58, file: 'AppIcon-29@2x.png', base: '29x29', scale: '2x', idiom: 'iphone' },
  { size: 87, file: 'AppIcon-29@3x.png', base: '29x29', scale: '3x', idiom: 'iphone' },
  { size: 80, file: 'AppIcon-40@2x.png', base: '40x40', scale: '2x', idiom: 'iphone' },
  { size: 120, file: 'AppIcon-40@3x.png', base: '40x40', scale: '3x', idiom: 'iphone' },
  { size: 120, file: 'AppIcon-60@2x.png', base: '60x60', scale: '2x', idiom: 'iphone' },
  { size: 180, file: 'AppIcon-60@3x.png', base: '60x60', scale: '3x', idiom: 'iphone' },
  { size: 1024, file: 'AppIcon-1024.png', base: '1024x1024', scale: '1x', idiom: 'ios-marketing' },
];
for (const t of iosTargets) writeOpaque(svgSquare, t.size, `${IOS}/${t.file}`);
writeFileSync(
  `${IOS}/Contents.json`,
  JSON.stringify(
    {
      images: iosTargets.map(t => ({ filename: t.file, idiom: t.idiom, scale: t.scale, size: t.base })),
      info: { author: 'xcode', version: 1 },
    },
    null,
    2,
  ) + '\n',
);

// --- Android legacy + adaptive ----------------------------------------------
const legacy = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
const foreground = { mdpi: 108, hdpi: 162, xhdpi: 216, xxhdpi: 324, xxxhdpi: 432 };
for (const [d, size] of Object.entries(legacy)) {
  const dir = `android/app/src/main/res/mipmap-${d}`;
  mkdirSync(dir, { recursive: true });
  writeAlpha(svgRounded, size, `${dir}/ic_launcher.png`);
  writeAlpha(svgCircle, size, `${dir}/ic_launcher_round.png`);
  writeAlpha(svgForeground, foreground[d], `${dir}/ic_launcher_foreground.png`);
}
// adaptive-icon XML (API 26+)
const anydpi = 'android/app/src/main/res/mipmap-anydpi-v26';
mkdirSync(anydpi, { recursive: true });
const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`;
writeFileSync(`${anydpi}/ic_launcher.xml`, adaptiveXml);
writeFileSync(`${anydpi}/ic_launcher_round.xml`, adaptiveXml);
mkdirSync('android/app/src/main/res/values', { recursive: true });
writeFileSync(
  'android/app/src/main/res/values/ic_launcher_background.xml',
  `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">${TEAL}</color>
</resources>
`,
);

console.log('\nDone.');
