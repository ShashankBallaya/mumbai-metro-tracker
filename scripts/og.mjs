// Captures the Open Graph cards (src/pages/og) into public/: og.png for the hub, og-<line>.png per line.
// Needs `npm run build && npm run preview` on :4321 and a local Chrome.
import { readFileSync } from 'node:fs';
import puppeteer from 'puppeteer-core';
const { lines } = JSON.parse(readFileSync('src/data/lines.json', 'utf8'));
const cards = [['hub', 'public/og.png'], ...lines.map((l) => [l.id, `public/og-${l.id}.png`])];
const b = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const p = await b.newPage();
await p.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
for (const [card, path] of cards) {
  await p.goto(`http://localhost:4321/og/${card}/`, { waitUntil: 'networkidle0' });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path, type: 'png' });
  console.log(`Wrote ${path}`);
}
await b.close();
