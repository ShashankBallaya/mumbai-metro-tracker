// Renders the 10 carousel slides (slides.html) to share/insta/carousel/out/slide-01.png ... slide-10.png, 1080 x 1350.
// Run capture.mjs first for the phone shots. Run from the repo root: node share/insta/carousel/render.mjs
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { mkdirSync } from 'node:fs';
import puppeteer from 'puppeteer-core';

const OUT = 'share/insta/carousel/out/';
mkdirSync(OUT, { recursive: true });
const b = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const p = await b.newPage();
await p.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 1 });
await p.goto(pathToFileURL(resolve('share/insta/carousel/slides.html')).href, { waitUntil: 'networkidle0' });
await p.evaluate(() => document.fonts.ready);
const slides = await p.$$('.slide');
for (const [i, s] of slides.entries()) {
  const f = `${OUT}slide-${String(i + 1).padStart(2, '0')}.png`;
  await s.screenshot({ path: f });
  console.log(`Wrote ${f}`);
}
await b.close();
