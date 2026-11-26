// Phone screenshots of the live site for the "What is Mumbai Metro Tracker" Instagram carousel.
// Real site only, night edition, reduced motion, 390 x 844 at 3x (an ordinary phone).
// Run from the repo root: node share/insta/carousel/capture.mjs  ->  share/insta/carousel/shots/*.png
import puppeteer from 'puppeteer-core';

const SITE = process.env.SITE ?? 'https://www.mumbaimetrotracker.com';
const OUT = 'share/insta/carousel/shots/';
const b = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
});
const p = await b.newPage();
await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
await p.evaluateOnNewDocument(() => {
  localStorage.setItem('l12-theme', 'dark');
  sessionStorage.setItem('l12-seen', '1');
});
await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// name, path, optional selector to bring to the top of the screen, optional extra offset, wait
const SHOTS = [
  ['hub', '/', null, 0, 6000],
  ['hub-map', '/', '.stage__live', 0, 6000],
  ['line5-top', '/line-5/', null, 0, 2500],
  ['line5-countdown', '/line-5/', '#countdown-title', 0, 2500],
  ['line5-route', '/line-5/', '#route', 0, 2500],
  ['station', '/line-5/stations/kasheli/', null, 0, 2500],
  ['station-nearby', '/line-5/stations/kasheli/', 'h2, h3', 'NEARBY', 2500],
  ['send', '/send/', null, 0, 2000],
];

for (const [name, path, sel, extra, ms] of SHOTS) {
  await p.goto(SITE + path, { waitUntil: 'networkidle2', timeout: 90000 });
  await p.evaluate(() => document.fonts.ready);
  await wait(ms);
  if (sel) {
    await p.evaluate(
      (sel, extra) => {
        let el;
        if (typeof extra === 'string') {
          el = [...document.querySelectorAll('main *')].find((e) => e.children.length === 0 && e.textContent.trim().toUpperCase() === extra);
        } else el = document.querySelector(sel);
        if (!el) throw new Error('no target ' + sel + ' ' + extra);
        const y = el.getBoundingClientRect().top + window.scrollY - 70;
        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollTo(0, y);
      },
      sel,
      extra,
    );
    await wait(2000);
  }
  await p.addStyleTag({ content: '.maplibregl-ctrl-top-right, .maplibregl-ctrl-top-left, .maplibregl-ctrl-bottom-right { display: none !important; }' });
  await p.screenshot({ path: `${OUT}${name}.png` });
  console.log(`Wrote ${OUT}${name}.png`);
}
await b.close();
