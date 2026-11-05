// Downloads OpenStreetMap's main roads around Line 5 past Dhamankar Naka (ODbL),
// for snapping the shared road-and-metro stretches to the road centre line.
// Run from the repo root: node scripts/line5-tenders/fetch_osm_roads.mjs
import { writeFileSync } from 'node:fs';
const bbox = '19.20,73.04,19.31,73.19';
const q = `[out:json][timeout:120];way[highway~"^(motorway|trunk|primary|secondary|tertiary)(_link)?$"](${bbox});out geom tags;`;
for (const host of ['https://overpass-api.de/api/interpreter', 'https://maps.mail.ru/osm/tools/overpass/api/interpreter', 'https://overpass.private.coffee/api/interpreter']) {
  try {
    const r = await fetch(host, { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'User-Agent': 'mumbai-metro-tracker data script' }, signal: AbortSignal.timeout(170000) });
    const t = await r.text();
    if (!t.startsWith('{')) { console.log(host, 'gave', t.slice(0, 80)); continue; }
    const j = JSON.parse(t);
    const ways = j.elements.map((w) => ({ id: w.id, highway: w.tags.highway, name: w.tags.name ?? w.tags.ref ?? null, oneway: w.tags.oneway ?? null, coords: w.geometry.map((g) => [+g.lon.toFixed(6), +g.lat.toFixed(6)]) }));
    writeFileSync('scripts/data/line5-osm-roads.json', JSON.stringify({ _meta: { source: 'OpenStreetMap contributors, ODbL, via ' + host, bbox, fetched: new Date().toISOString().slice(0, 10) }, ways }));
    console.log('ways', ways.length, 'from', host);
    process.exit(0);
  } catch (e) { console.log(host, e.message); }
}
process.exit(1);
