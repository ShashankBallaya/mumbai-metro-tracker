// Draws a line's corridor map for its hub chapter and cover tile, for a line with no ground or drone
// photo yet (Lines 6 and 7A, owner's choice 2026-10-30). It is real cartography, not an illustration:
// OpenFreeMap vector tiles (OpenStreetMap data) in the hub network map's night palette, with the line's
// route from its own alignment file in the line colour, stations as paper-white dots, and an
// underground stretch dashed. The route sits right of centre and high, clear of the chapter copy
// (bottom-left) and inside a phone's crop at the given focus point. Runways and taxiways are drawn, so the
// airport reads on Line 7A's map.
// Usage: node scripts/draw-hub-map-art.mjs line-6 [line-7a ...]   Needs a local Chrome and the network.
// Writes public/hub/maps/<line>.jpg (1600 by 1000, wide screens) and <line>-tall.jpg (900 by 1600, phones:
// the route in the top third, above the chapter copy) via ffmpeg.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';

const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const MAPLIBRE = '5.6.0'; // the last major version with a single-file browser build (6.x is modules only)
const W = 1600;
const H = 1000;
// Room for the copy: the route fits in a box above y 640, on the side away from the chapter copy
// (index.astro `side`): right of x 560 for copy on the left, left of x 1040 for copy on the right.
const COPY_SIDE = { 'line-6': 'right', 'line-7a': 'left' };
const padding = (id) => (COPY_SIDE[id] === 'right' ? { top: 140, right: 560, bottom: 360, left: 140 } : { top: 140, right: 140, bottom: 360, left: 560 });
const PAL = { bg: '#0e1117', land: '#141820', water: '#0a1a26', road: '#262b35', rail: '#3a3f4a', label: '#8f949c', ink: '#f4f1ea' };

const tokens = readFileSync('src/styles/tokens.css', 'utf8');
const { lines } = JSON.parse(readFileSync('src/data/lines.json', 'utf8'));
const ids = process.argv.slice(2);
if (!ids.length) throw new Error('Name a line, e.g. line-6');
mkdirSync('public/hub/maps', { recursive: true });

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
for (const id of ids) {
  const info = lines.find((l) => l.id === id);
  if (!info) throw new Error(`No line ${id} in lines.json`);
  const colour = tokens.match(new RegExp(`--${info.colour}:\\s*(#[0-9a-fA-F]{6})`))[1];
  const alignment = JSON.parse(readFileSync(`src/data/lines/${id}/${info.alignment}`, 'utf8'));
  const stations = JSON.parse(readFileSync(`src/data/lines/${id}/stations.json`, 'utf8')).stations
    .filter((s) => s.location?.lat != null)
    .map((s) => ({ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [s.location.lng, s.location.lat] } }));
  const formats = [
    { w: W, h: H, pad: padding(id), suffix: '' },
    { w: 900, h: 1600, pad: { top: 220, right: 230, bottom: 980, left: 230 }, suffix: '-tall' },
  ];
  for (const { w, h, pad, suffix } of formats) {
    const html = `<!doctype html><html><head><meta charset="utf-8">
  <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@${MAPLIBRE}/dist/maplibre-gl.css">
  <script src="https://unpkg.com/maplibre-gl@${MAPLIBRE}/dist/maplibre-gl.js"></script>
  <style>html,body,#m{margin:0;width:${w}px;height:${h}px;background:${PAL.bg}}</style></head><body><div id="m"></div><script>
  const route = ${JSON.stringify(alignment)};
  const stations = { type: 'FeatureCollection', features: ${JSON.stringify(stations)} };
  const P = ${JSON.stringify(PAL)};
  const width = (a, b) => ['interpolate', ['linear'], ['zoom'], 11, a, 15, b];
  const part = (p) => ['==', ['get', 'part'], p];
  const map = new maplibregl.Map({ container: 'm', interactive: false, attributionControl: false, fadeDuration: 0, preserveDrawingBuffer: true,
    style: { version: 8, glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
      sources: { omt: { type: 'vector', url: 'https://tiles.openfreemap.org/planet' }, route: { type: 'geojson', data: route }, st: { type: 'geojson', data: stations } },
      layers: [
        { id: 'bg', type: 'background', paint: { 'background-color': P.bg } },
        { id: 'landuse', type: 'fill', source: 'omt', 'source-layer': 'landuse', paint: { 'fill-color': P.land } },
        { id: 'water', type: 'fill', source: 'omt', 'source-layer': 'water', paint: { 'fill-color': P.water } },
        { id: 'road', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary', 'secondary']]], paint: { 'line-color': P.road, 'line-width': width(1, 4) } },
        { id: 'runway', type: 'line', source: 'omt', 'source-layer': 'aeroway', filter: ['==', ['get', 'class'], 'runway'], paint: { 'line-color': P.road, 'line-width': width(6, 40) } },
        { id: 'taxiway', type: 'line', source: 'omt', 'source-layer': 'aeroway', filter: ['==', ['get', 'class'], 'taxiway'], paint: { 'line-color': P.road, 'line-width': width(1, 6) } },
        { id: 'rail', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['==', ['get', 'class'], 'rail'], paint: { 'line-color': P.rail, 'line-width': 1.5, 'line-dasharray': [3, 2] } },
        { id: 'casing', type: 'line', source: 'route', filter: ['!', part('underground')], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': P.bg, 'line-width': width(9, 18) } },
        { id: 'line', type: 'line', source: 'route', filter: ['!', ['in', ['get', 'part'], ['literal', ['underground', 'superseded']]]], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '${colour}', 'line-width': width(5, 10) } },
        { id: 'tunnel', type: 'line', source: 'route', filter: part('underground'), paint: { 'line-color': P.bg, 'line-width': width(5, 10), 'line-dasharray': [1.2, 1] } },
        { id: 'st', type: 'circle', source: 'st', paint: { 'circle-radius': width(4, 8), 'circle-color': P.ink, 'circle-stroke-color': P.bg, 'circle-stroke-width': 2.5 } },
        { id: 'airport', type: 'symbol', source: 'omt', 'source-layer': 'aerodrome_label', layout: { 'text-field': ['get', 'name:latin'], 'text-font': ['Noto Sans Regular'], 'text-size': 15, 'text-transform': 'uppercase', 'text-letter-spacing': 0.08, 'text-max-width': 14 }, paint: { 'text-color': P.label, 'text-halo-color': P.bg, 'text-halo-width': 2 } },
        { id: 'place', type: 'symbol', source: 'omt', 'source-layer': 'place', filter: ['in', ['get', 'class'], ['literal', ['city', 'town', 'suburb']]], layout: { 'text-field': ['get', 'name:latin'], 'text-font': ['Noto Sans Regular'], 'text-size': 15, 'text-transform': 'uppercase', 'text-letter-spacing': 0.08 }, paint: { 'text-color': P.label, 'text-halo-color': P.bg, 'text-halo-width': 2 } },
      ] } });
  const b = new maplibregl.LngLatBounds();
  for (const f of route.features) if (f.geometry.type === 'LineString' && f.properties.part !== 'superseded') for (const c of f.geometry.coordinates) b.extend(c);
  map.fitBounds(b, { padding: ${JSON.stringify(pad)}, duration: 0, maxZoom: 15 });
  map.once('idle', () => { window.__done = true; });
  </script></body></html>`;
    const file = join(tmpdir(), `hub-map-${id}${suffix}.html`);
    writeFileSync(file, html);
    const page = await browser.newPage();
    page.on('console', (m) => m.type() === 'error' && console.log('page:', m.text().slice(0, 200)));
    page.on('pageerror', (e) => console.log('page error:', String(e).slice(0, 200)));
    page.on('requestfailed', (r) => console.log('failed:', r.url().slice(0, 120)));
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
    await page.goto(`file:///${file.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0', timeout: 120000 });
    await page.waitForFunction('window.__done === true', { timeout: 30000 });
    const png = join(tmpdir(), `hub-map-${id}${suffix}.png`);
    await page.screenshot({ path: png, type: 'png' });
    await page.close();
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', png, '-q:v', '3', `public/hub/maps/${id}${suffix}.jpg`]);
    rmSync(file);
    rmSync(png);
    console.log(`Wrote public/hub/maps/${id}${suffix}.jpg (${colour})`);
  }
}
await browser.close();
