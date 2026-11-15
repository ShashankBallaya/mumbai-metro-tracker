// Puts a credit label on every credited photo the site serves, so a photo saved or copied from the site
// keeps its credit. Runs after `astro build` (package.json "build") and changes only the copies in dist/;
// the files in public/photos/ stay as they are.
//
// The label sits in the bottom-right corner: "Photo: KP @NathanDrakeSir · mumbaimetrotracker.com".
// Stills from a creator's video say "Video: <credit>". The owner's own photos carry the site name only.
// A photo entry with "stamp": false is left as it is. A file used in more than one place is stamped once,
// with the credit of the first entry found.
//
// Credits come from every JSON file in src/data: any object with a "src" under /photos/ and a "credit".
// The label is drawn with the system sans-serif font (DejaVu Sans on the deploy runner). If no font draws,
// the script stops the build rather than ship blank labels.
//
// Run from the repo root: node scripts/stamp-photos.mjs [dist folder]

import { readdirSync, readFileSync, existsSync, statSync, renameSync } from 'node:fs';
import { join, resolve } from 'node:path';
import sharp from 'sharp';

const ROOT = resolve(import.meta.dirname, '..');
const DIST = resolve(process.argv[2] ?? join(ROOT, 'dist'));
const OWNER = 'Shashank Ballaya';
const SITE = 'mumbaimetrotracker.com';
const FONT = 'DejaVu Sans, Arial, Helvetica, sans-serif';

const jsonFiles = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? jsonFiles(p) : name.endsWith('.json') ? [p] : [];
  });

// Every credited photo, by its path, in the order the data lists them.
const photos = new Map();
const walk = (v) => {
  if (Array.isArray(v)) return v.forEach(walk);
  if (!v || typeof v !== 'object') return;
  if (typeof v.src === 'string' && v.src.startsWith('/photos/') && typeof v.credit === 'string' && !photos.has(v.src)) photos.set(v.src, v);
  Object.values(v).forEach(walk);
};
for (const f of jsonFiles(join(ROOT, 'src', 'data'))) walk(JSON.parse(readFileSync(f, 'utf8')));

const labelText = (p) => {
  if (p.credit === OWNER) return SITE;
  const who = p.handle ? `${p.credit} @${p.handle}` : p.credit;
  return `${p.kind === 'video' || p.kind === 'drone' ? 'Video' : 'Photo'}: ${who}  ·  ${SITE}`;
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** The label as a PNG the size of its box, so its width comes from the text as drawn. */
async function label(text, fs) {
  const pad = Math.round(fs * 0.8);
  const h = Math.round(fs * 2.1);
  // Draw the text first, trimmed, to learn its width.
  const textSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${fs * text.length}" height="${h}">
    <text x="0" y="${Math.round(h / 2 + fs * 0.36)}" font-family="${FONT}" font-size="${fs}" fill="#efe9de">${esc(text)}</text></svg>`;
  let t;
  try {
    t = await sharp(Buffer.from(textSvg)).trim().png().toBuffer({ resolveWithObject: true });
  } catch {
    throw new Error('stamp-photos: the label text did not draw. Is a sans-serif font installed?');
  }
  const w = t.info.width + pad * 2;
  return sharp({ create: { width: w, height: h, channels: 4, background: { r: 12, g: 20, b: 34, alpha: 0.72 } } })
    .composite([{ input: t.data, top: Math.round((h - t.info.height) / 2), left: pad }])
    .png()
    .toBuffer({ resolveWithObject: true });
}

// A font must draw, or every label would be an empty box.
{
  const probe = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="40"><text x="4" y="30" font-family="${FONT}" font-size="24" fill="#fff">Photo</text></svg>`;
  const { channels } = await sharp(Buffer.from(probe)).stats();
  if (!channels[3] || channels[3].max === 0) {
    console.error('stamp-photos: no font drew the label text. Install a sans-serif font (fonts-dejavu-core on Ubuntu).');
    process.exit(1);
  }
}

if (!existsSync(join(DIST, 'photos'))) {
  console.error(`stamp-photos: no ${join(DIST, 'photos')}. Run astro build first.`);
  process.exit(1);
}

let done = 0;
let skipped = 0;
const missing = [];
for (const [src, p] of photos) {
  if (p.stamp === false) {
    skipped++;
    continue;
  }
  const file = join(DIST, src);
  if (!existsSync(file)) {
    missing.push(src);
    continue;
  }
  const input = readFileSync(file);
  const img = sharp(input);
  const { width: W, height: H, format } = await img.metadata();
  // 2% of the longer side: readable when the photo fills a phone screen, small on the photo.
  const fs = Math.max(14, Math.round(Math.max(W, H) * 0.02));
  const { data, info } = await label(labelText(p), fs);
  const margin = Math.round(fs * 0.8);
  // A label wider than the photo (a narrow crop) is scaled down to fit.
  let lab = data;
  let lw = info.width;
  let lh = info.height;
  if (lw > W - margin * 2) {
    const r = (W - margin * 2) / lw;
    lw = Math.floor(lw * r);
    lh = Math.floor(lh * r);
    lab = await sharp(data).resize(lw, lh).png().toBuffer();
  }
  let out = img.composite([{ input: lab, left: W - lw - margin, top: H - lh - margin }]);
  out = format === 'png' ? out.png() : format === 'webp' ? out.webp({ quality: 85 }) : out.jpeg({ quality: 85, mozjpeg: true });
  await out.toFile(file + '.tmp');
  renameSync(file + '.tmp', file);
  done++;
}

if (missing.length) console.warn(`stamp-photos: ${missing.length} credited photo(s) not in dist: ${missing.join(', ')}`);
console.log(`stamp-photos: labelled ${done} photo(s), left ${skipped} as they are (stamp: false).`);
