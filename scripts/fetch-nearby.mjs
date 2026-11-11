// Fetches the places near each station from OpenStreetMap into src/data/lines/<line>/nearby.json.
//   - One Overpass query for each kind of place, over the box that holds every mapped station.
//   - For each station: the nearest few of each kind within that kind's radius,
//     measured in a straight line from the station's point to the place (to the centre of an area).
//   - Bus stops: one entry for each name (the two sides of a road are one stop to a reader).
//   - Names: the English name when OpenStreetMap has one; places with no name in Latin script are left out.
// OpenStreetMap data is ODbL: the page credits "OpenStreetMap contributors" and links each place.
// Run: node scripts/fetch-nearby.mjs            (fetches again)
//      node scripts/fetch-nearby.mjs --cached   (uses the last raw answers in NEARBY_CACHE, for tuning the filters)
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const LINES = fileURLToPath(new URL('../src/data/lines/', import.meta.url));
const CACHE = process.env.NEARBY_CACHE ?? join(tmpdir(), 'metro-nearby-osm');
const CACHED = process.argv.includes('--cached');
const ENDPOINT = 'https://overpass-api.de/api/interpreter';
const UA = 'MumbaiMetroTracker/1.0 (+https://github.com/ShashankBallaya/mumbai-metro-tracker)';
const TODAY = new Date().toISOString().slice(0, 10);

/**
 * The kinds of place, in the order the page shows them.
 * radius_m: how far to look. max: how many to keep for one station.
 * query: Overpass statements for the box {{bbox}}. keep: a last check on the tags.
 */
const KINDS = [
  {
    id: 'rail',
    label: 'Railway stations',
    radius_m: 1500,
    max: 2,
    // Suburban and main-line stations. Metro and monorail stations are tagged station=subway, light_rail or monorail.
    query: 'nwr["railway"="station"]({{bbox}});',
    keep: (t) => !/^(subway|light_rail|monorail)$/.test(t.station ?? '') && t.subway !== 'yes' && t.monorail !== 'yes' && t.light_rail !== 'yes' && !/metro/i.test(t.name ?? ''),
  },
  {
    id: 'bus',
    label: 'Bus stops',
    radius_m: 500,
    max: 3,
    query: 'node["highway"="bus_stop"]["name"]({{bbox}});',
    keep: (t) => !/^(bus|bus ?stop|stop)$/i.test((t['name:en'] ?? t.name ?? '').trim()),
  },
  {
    id: 'chowk',
    label: 'Chowks and nakas',
    radius_m: 1000,
    max: 3,
    query: 'nwr["name"~"(chowk|naka|circle|phata|junction)$",i]({{bbox}});',
    // Road places only: a named junction, crossing or square, not a shop or bus stop that borrows the name.
    // Bus routes are relations named "Bus 54: Thane Station (W) => Kasarvadavali Naka"; they are left out.
    keep: (t) =>
      !t.amenity && !t.shop && !t.office && !t.building && !t.route && !t.type && t.highway !== 'bus_stop' && !t.public_transport && !t.railway && !/=>|→|^bus\b/i.test(t.name ?? ''),
  },
  {
    id: 'college',
    label: 'Colleges',
    radius_m: 1000,
    max: 4,
    query: 'nwr["amenity"~"^(college|university)$"]["name"]({{bbox}});',
    keep: () => true,
  },
  {
    id: 'mall',
    label: 'Malls',
    radius_m: 1500,
    max: 3,
    query: 'nwr["shop"="mall"]["name"]({{bbox}});',
    keep: () => true,
  },
  {
    id: 'office',
    label: 'Offices and IT parks',
    radius_m: 1000,
    max: 4,
    query: [
      'nwr["office"="it"]["name"]({{bbox}});',
      'nwr["landuse"="commercial"]["name"~"(IT park|tech|business|corporate|SEZ|infotech|knowledge)",i]({{bbox}});',
      'nwr["building"~"^(office|commercial)$"]["name"~"(IT park|tech|business park|business centre|business center|corporate|SEZ|infotech|knowledge park)",i]({{bbox}});',
    ].join(''),
    // Shops and ward offices share some of these words; they are not workplaces a reader means.
    keep: (t) => !t.shop && !t.tourism && !t.diplomatic && !/shopping|ward office|association/i.test(t.name ?? ''),
  },
  {
    id: 'hospital',
    label: 'Hospitals',
    radius_m: 1000,
    max: 3,
    query: 'nwr["amenity"="hospital"]["name"]({{bbox}});',
    keep: () => true,
  },
];

// Every line folder with a stations file; the line's own stations and its spur.
const lines = readdirSync(LINES)
  .filter((d) => existsSync(join(LINES, d, 'stations.json')))
  .map((id) => {
    const f = JSON.parse(readFileSync(join(LINES, id, 'stations.json'), 'utf8'));
    return { id, stations: [...f.stations, ...(f.spur_stations ?? [])].filter((s) => s.location?.lat != null) };
  });

const all = lines.flatMap((l) => l.stations);
const pad = 0.02; // about 2 km, more than the widest radius
const bbox = [
  Math.min(...all.map((s) => s.location.lat)) - pad,
  Math.min(...all.map((s) => s.location.lng)) - pad,
  Math.max(...all.map((s) => s.location.lat)) + pad,
  Math.max(...all.map((s) => s.location.lng)) + pad,
].map((v) => v.toFixed(4)).join(',');

/** OpenStreetMap entries left out by hand, with the reason. */
const SKIP = new Map([
  ['node/8527126910', 'Fake entry: "Alice in boderland", office=it on Ghodbunder Road, phone 1111111111 (checked 2026-11-11)'],
]);

/** Two entries of one kind closer than this are one place under two spellings ("Harinivas Circle", "Hariniwas Circle"). */
const SAME_PLACE_M = 60;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function overpass(kind) {
  mkdirSync(CACHE, { recursive: true });
  const file = join(CACHE, `${kind.id}.json`);
  if (CACHED && existsSync(file)) return JSON.parse(readFileSync(file, 'utf8'));
  const q = `[out:json][timeout:180];(${kind.query.replaceAll('{{bbox}}', bbox)});out tags center;`;
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ data: q }),
    });
    if (res.ok) {
      const json = await res.json();
      writeFileSync(file, JSON.stringify(json));
      return json;
    }
    console.warn(`${kind.id}: Overpass answered ${res.status}, try ${attempt} of 4`);
    await sleep(20000 * attempt);
  }
  throw new Error(`${kind.id}: Overpass did not answer`);
}

/** Metres between two points (haversine). */
function metres(a, b) {
  const R = 6371008.8;
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const latin = (s) => typeof s === 'string' && /[A-Za-z]/.test(s) && !/[ऀ-ॿ]/.test(s);
const tidy = (s) => s.replace(/\s+/g, ' ').trim();

/** One place from an Overpass element, or null when it has no usable name or position. */
function place(el) {
  const t = el.tags ?? {};
  const name = [t['name:en'], t.name, t.official_name].find(latin);
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (!name || lat == null) return null;
  return { name: tidy(name), lat, lng, osm: `${el.type}/${el.id}`, tags: t };
}

const pools = {};
for (const kind of KINDS) {
  const json = await overpass(kind);
  const seen = new Set();
  pools[kind.id] = json.elements
    .filter((el) => kind.keep(el.tags ?? {}))
    .map(place)
    .filter((p) => p && !SKIP.has(p.osm) && !seen.has(p.osm) && seen.add(p.osm));
  console.log(`${kind.id}: ${pools[kind.id].length} places`);
  if (!CACHED) await sleep(5000);
}

/** The nearest places of one kind to one station: within the radius, one for each name, nearest first. */
function nearest(kind, at) {
  const byName = new Map();
  for (const p of pools[kind.id]) {
    const d = metres(at, p);
    if (d > kind.radius_m) continue;
    const key = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const prev = byName.get(key);
    if (!prev || d < prev.d) byName.set(key, { p, d });
  }
  const kept = [];
  for (const c of [...byName.values()].sort((a, b) => a.d - b.d)) {
    if (kept.length === kind.max) break;
    if (kept.some((k) => metres(k.p, c.p) < SAME_PLACE_M)) continue;
    kept.push(c);
  }
  return kept
    .map(({ p, d }) => ({ name: p.name, distance_m: Math.round(d / 10) * 10, osm: p.osm }));
}

for (const line of lines) {
  const stations = {};
  for (const s of line.stations) {
    const at = { lat: s.location.lat, lng: s.location.lng };
    const groups = {};
    for (const kind of KINDS) {
      const found = nearest(kind, at);
      if (found.length) groups[kind.id] = found;
    }
    stations[s.id] = groups;
  }
  const out = {
    _meta: {
      description: 'Places near each station, from OpenStreetMap: the nearest few of each kind within its radius, measured in a straight line from the station point to the place (to the centre of an area such as a campus). Bus stops: one entry for each name. Built by scripts/fetch-nearby.mjs; do not edit by hand. OpenStreetMap data is ODbL; credit "OpenStreetMap contributors".',
      kinds: KINDS.map(({ id, label, radius_m, max }) => ({ id, label, radius_m, max })),
      status: 'reported',
      source_url: 'https://www.openstreetmap.org/copyright',
      last_verified: TODAY,
    },
    stations,
  };
  writeFileSync(join(LINES, line.id, 'nearby.json'), JSON.stringify(out, null, 2) + '\n');
  const counts = Object.values(stations).map((g) => Object.values(g).flat().length);
  console.log(`${line.id}: ${line.stations.length} stations, ${counts.reduce((a, b) => a + b, 0)} places`);
}
