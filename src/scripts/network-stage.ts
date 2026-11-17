/**
 * The hub's front: the network map as a stage (src/pages/index.astro).
 *   - The lines draw themselves in by stage: running, being built, approved, proposed.
 *   - The rail of slips drives the map: the slip at the front is the chosen line. The map flies down
 *     that line's route, tilted, and the other lines step back.
 *   - Wide screens (motion allowed): the stage pins and the page's scroll moves the rail, one line per step.
 *   - Each line has its mark on the map as a tap target.
 *   - Lights move on running stretches only (not live train positions). On the night edition the lines glow.
 *   - Station dots (from street level 11): hover shows the name as a platform sign; a click or tap opens the
 *     station's card in a sheet at the foot of the map (src/scripts/station-card.ts).
 *   - Quiet context under the lines, in one neutral colour (owner's choice D, /lab/context/, 2026-11-17): suburban and
 *     main-line rail as a hairline, railway stations as small rings (named from street level), the bullet train
 *     (being built) with its BKC, Thane and Virar stations, and the airports. It never takes a hover or a click.
 *     Monorail stops are kept out of the railway station rings (the tiles do not tell them apart).
 *   - Walkways between lines at interchanges (owner's choice C, /lab/connectors/, 2026-11-17): a thin ink thread
 *     between the stations a walkway joins (a ring where one end only is known), in the stage strokes (solid open,
 *     long dashes being built, short dashes tendered or approved, dots planned), labelled from street level. A click
 *     opens a small card with its facts and source. Data: src/data/connectors.json (INTERCHANGE-CONNECTORS.md).
 * The choice lives in the address (?line=). With reduced motion, nothing draws in, flies or moves.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as maplibregl from 'maplibre-gl';
import type { ExpressionSpecification, GeoJSONSource, StyleSpecification } from 'maplibre-gl';
import mapCssUrl from 'maplibre-gl/dist/maplibre-gl.css?url';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import geometryRaw from '../data/network-geometry.geojson?raw';
import hsrRaw from '../data/context-hsr.geojson?raw';
import connRaw from '../data/connectors.json?raw';
import { MAP_TILES, MAP_GLYPHS } from '../config';
import { signHtml, sheetHtml } from './station-card';
import type { StationCard } from '../lib/station-cards';

maplibregl.setWorkerUrl(workerUrl);
gsap.registerPlugin(ScrollTrigger);

interface LineInfo {
  id: string;
  n: string;
  colour: string | null;
}
interface Piece {
  line: string;
  stage: string;
  coords: number[][];
  /** Distance from the first point to each point, km. */
  cum: number[];
  len: number;
}

/** When each stage starts to draw, as a share of the whole drawing-in; each takes SPAN of it. */
const START: Record<string, number> = { operational: 0, under_construction: 0.2, planned: 0.4, proposed: 0.55 };
const SPAN = 0.45;
const DRAW_MS = 2200;
/** Stroke widths at zoom 9 and zoom 14, per stage layer. */
const WIDTHS: Record<string, [number, number]> = { running: [3, 7], 'building-line': [3, 7], approved: [2.4, 5.5], proposed: [2, 4] };
/** How fast a light moves, in map km per second. */
const LIGHT_SPEED = 0.9;

const isDark = () => {
  const t = document.documentElement.dataset.theme;
  return t === 'dark' || (t !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
};
const palette = () =>
  isDark()
    ? { bg: '#121d31', land: '#16223a', water: '#0b1424', road: '#24314c', rail: '#3a4766', label: '#978f82', ink: '#ece5d8', building: '#253554', light: '#fff6dd', ctx: '#8a93a8', ctxSoft: '#56617a', air: '#1b2942' }
    : { bg: '#e5ddcf', land: '#ded5c5', water: '#c3cfd0', road: '#d0c6b4', rail: '#a69e91', label: '#5f584f', ink: '#111a28', building: '#cbc1b0', light: '#111a28', ctx: '#6f675c', ctxSoft: '#9c9385', air: '#d6ccbb' };

/** Monorail stops, kept out of the railway station rings: the map tiles mark both as plain stations, and some share a name
 * (Chembur, Lower Parel, GTB Nagar) with a railway station 290 m to 680 m away. A square of about 65 m round each stop. */
const MONORAIL: number[][] = [
  [72.89759, 19.06121], [72.89428, 19.05264], [72.89346, 19.04388], [72.89555, 19.03528], [72.89144, 19.02772], [72.87757, 19.02897],
  [72.87403, 19.03882], [72.87079, 19.03669], [72.86695, 19.03018], [72.8638, 19.02365], [72.85932, 19.01748], [72.85223, 19.01625],
  [72.84787, 19.00954], [72.84423, 19.00159], [72.84331, 18.99451], [72.83147, 18.99312], [72.82859, 18.98309],
];
const MONO_AREA: GeoJSON.MultiPolygon = {
  type: 'MultiPolygon',
  coordinates: MONORAIL.map(([x, y]) => [[[x - 0.0006, y - 0.0006], [x + 0.0006, y - 0.0006], [x + 0.0006, y + 0.0006], [x - 0.0006, y + 0.0006], [x - 0.0006, y - 0.0006]]]),
};

// ----- Walkways between lines (src/data/connectors.json) -----
interface Conn {
  id: string;
  name: string;
  type: string;
  status: string;
  agency: string;
  source_date: string;
  grade: string;
  source_url: string;
  details: string;
  note: string | null;
  geometry: GeoJSON.LineString | GeoJSON.Point;
}
const CONNS: Conn[] = JSON.parse(connRaw).connectors;
const CONN_BY_ID = new Map(CONNS.map((c) => [c.id, c]));
/** A walkway's status in the map's stage strokes. */
const CONN_STAGE: Record<string, string> = {
  open: 'open', built: 'open', 'under construction': 'building', tendered: 'approved', approved: 'approved', planned: 'planned', proposed: 'planned', 'not given': 'planned',
};
const connMid = (g: Conn['geometry']): [number, number] => {
  if (g.type === 'Point') return g.coordinates as [number, number];
  const cs = g.coordinates;
  return [cs.reduce((t, c) => t + c[0], 0) / cs.length, cs.reduce((t, c) => t + c[1], 0) / cs.length];
};
const connLabel = (c: Conn) => `${c.type.startsWith('Two ') ? 'Subways' : c.type.replace(/ (to|between|over|with) .*/, '')} · ${c.status}`;
const CONN_LINES: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: CONNS.filter((c) => c.geometry.type === 'LineString').map((c) => ({ type: 'Feature', properties: { id: c.id, stage: CONN_STAGE[c.status] }, geometry: c.geometry })) };
const CONN_POINTS: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: CONNS.map((c) => ({ type: 'Feature', properties: { id: c.id, stage: CONN_STAGE[c.status], one: c.geometry.type === 'Point', label: connLabel(c) }, geometry: { type: 'Point', coordinates: connMid(c.geometry) } })) };
const CONN_LAYERS = ['conn-open', 'conn-building', 'conn-approved', 'conn-planned', 'conn-one'];
const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const connCard = (c: Conn) =>
  `<div class="cc"><div class="cc__kind">${esc(c.type)}</div><h3>${esc(c.name)}</h3>` +
  `<p class="cc__status">${esc(c.status[0].toUpperCase() + c.status.slice(1))} · ${esc(c.agency)}</p>` +
  `<p>${esc(c.details)}</p>${c.note ? `<p class="cc__note">${esc(c.note)}</p>` : ''}` +
  `<p class="cc__src"><span class="cc__grade">${esc(c.grade)}</span> <a href="${c.source_url}" target="_blank" rel="noopener">${esc(new URL(c.source_url).hostname.replace(/^www\./, ''))}, ${esc(c.source_date)} ↗</a></p>` +
  `<p class="cc__note">The line shows which stations it joins, not its route.</p></div>`;

const km = (a: number[], b: number[]) => Math.hypot((b[0] - a[0]) * Math.cos((a[1] * Math.PI) / 180), b[1] - a[1]) * 111.2;
/** Out curves only: a stroke or the camera starts at once and settles (the paper's one easing, DESIGN.md). */
const ease = (t: number) => 1 - Math.pow(1 - t, 3);
const glide = (t: number) => 1 - Math.pow(1 - t, 4);

/** The point at share f of a piece's length, and the index of the vertex after it. */
function at(p: Piece, f: number): { c: number[]; i: number } {
  const d = Math.min(1, Math.max(0, f)) * p.len;
  let i = 1;
  while (i < p.cum.length - 1 && p.cum[i] < d) i++;
  const span = p.cum[i] - p.cum[i - 1] || 1;
  const t = (d - p.cum[i - 1]) / span;
  const [a, b] = [p.coords[i - 1], p.coords[i]];
  return { c: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], i };
}

const stage = document.querySelector<HTMLElement>('[data-stage]');
if (stage) boot(stage);

function boot(el: HTMLElement) {
  el.classList.add('is-booting');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const live = el.querySelector<HTMLElement>('[data-live]')!;
  const rail = el.querySelector<HTMLElement>('[data-rail]')!;
  const cards = [...rail.querySelectorAll<HTMLElement>('[data-card]')];
  const dock = rail.parentElement!;
  const pinned = el.querySelector<HTMLElement>('.stage__frame')!;
  const count = el.querySelector<HTMLElement>('[data-slip-at]')!;
  const lines: LineInfo[] = JSON.parse(el.dataset.lines!);
  const all = JSON.parse(el.dataset.bounds!) as [[number, number], [number, number]];
  const asked = new URLSearchParams(location.search).get('line');

  // ----- The geometry, in pieces -----
  const raw = JSON.parse(geometryRaw) as GeoJSON.FeatureCollection;
  const pieces: Piece[] = [];
  const stations: GeoJSON.Feature[] = [];
  for (const f of raw.features) {
    const p = f.properties as { line: string; stage?: string };
    const g = f.geometry;
    if (g.type === 'Point') {
      stations.push(f);
      continue;
    }
    if (!p.stage || !(p.stage in START)) continue;
    const parts = g.type === 'LineString' ? [g.coordinates] : g.type === 'MultiLineString' ? g.coordinates : [];
    for (const coords of parts) {
      if (coords.length < 2) continue;
      const cum = [0];
      for (let i = 1; i < coords.length; i++) cum.push(cum[i - 1] + km(coords[i - 1], coords[i]));
      pieces.push({ line: p.line, stage: p.stage, coords, cum, len: cum[cum.length - 1] });
    }
  }
  const feature = (p: Piece, coords: number[][]): GeoJSON.Feature => ({ type: 'Feature', properties: { line: p.line, stage: p.stage }, geometry: { type: 'LineString', coordinates: coords } });
  const collection = (features: GeoJSON.Feature[]): GeoJSON.FeatureCollection => ({ type: 'FeatureCollection', features });
  const fullNet = collection(pieces.map((p) => feature(p, p.coords)));
  // Context: the bullet train and its stations (the map tiles leave out lines being built).
  const hsr = JSON.parse(hsrRaw) as GeoJSON.FeatureCollection;
  // ----- Station dots: the tracked lines' own stations (named, with a page); the hub file's points for the rest -----
  const stationList: StationCard[] = JSON.parse(el.querySelector('[data-stage-stations]')?.textContent || '[]');
  const trackedLines = new Set(stationList.map((s) => s.line));
  const cardOf = new Map(stationList.map((s) => [s.id, s]));
  const dots = collection([
    ...stationList.map((s, i) => ({ type: 'Feature' as const, id: i + 1, properties: { sid: s.id, line: s.line }, geometry: { type: 'Point' as const, coordinates: [s.lng, s.lat] } })),
    ...stations
      .filter((f) => !trackedLines.has((f.properties as { line: string }).line))
      .map((f, i) => ({ ...f, id: stationList.length + i + 1, properties: { sid: '', line: (f.properties as { line: string }).line } })),
  ]);
  /** The network at share t of its drawing-in. */
  const drawnTo = (t: number) =>
    collection(
      pieces.flatMap((p) => {
        const f = ease(Math.min(1, Math.max(0, (t - START[p.stage]) / SPAN)));
        if (f <= 0) return [];
        if (f >= 1) return [feature(p, p.coords)];
        const { c, i } = at(p, f);
        return [feature(p, [...p.coords.slice(0, i), c])];
      }),
    );

  const piecesOf = (id: string) => pieces.filter((p) => p.line === id);
  const boundsOf = (id: string) => {
    const b = new maplibregl.LngLatBounds();
    for (const p of piecesOf(id)) for (const c of p.coords) b.extend(c as [number, number]);
    return b.isEmpty() ? null : b;
  };
  /** The direction a line runs, from its first drawn point to its last, with north kept in the upper half. */
  const bearingOf = (id: string) => {
    const cs = piecesOf(id).flatMap((p) => p.coords);
    if (cs.length < 2) return 0;
    const [a, b] = [cs[0], cs[cs.length - 1]];
    const bearing = (Math.atan2((b[0] - a[0]) * Math.cos((a[1] * Math.PI) / 180), b[1] - a[1]) * 180) / Math.PI;
    return Math.abs(bearing) > 90 ? bearing - Math.sign(bearing) * 180 : bearing;
  };
  /** Where a line's mark stands: its drawn vertex nearest the centre of its drawn vertices. */
  const markAt = (id: string) => {
    const cs = piecesOf(id).flatMap((p) => p.coords);
    const cx = cs.reduce((t, c) => t + c[0], 0) / cs.length;
    const cy = cs.reduce((t, c) => t + c[1], 0) / cs.length;
    return cs.reduce((m, c) => (Math.hypot(c[0] - cx, c[1] - cy) < Math.hypot(m[0] - cx, m[1] - cy) ? c : m), cs[0]) as [number, number];
  };

  // ----- Lights on running stretches -----
  const lights = pieces
    .filter((p) => p.stage === 'operational' && p.len > 2)
    .flatMap((p, k) => {
      const n = Math.min(3, Math.max(1, Math.round(p.len / 10)));
      return Array.from({ length: n }, (_, i) => ({ p, offset: (i / n) * 2 + k * 0.37, period: p.len / LIGHT_SPEED }));
    });
  const lightsAt = (seconds: number) =>
    collection(
      lights.map(({ p, offset, period }) => {
        const u = (seconds / period + offset) % 2;
        return { type: 'Feature', properties: { line: p.line }, geometry: { type: 'Point', coordinates: at(p, u <= 1 ? u : 2 - u).c } } as GeoJSON.Feature;
      }),
    );

  // ----- The style -----
  const css = getComputedStyle(document.documentElement);
  const neutral = css.getPropertyValue('--concrete').trim() || '#a69e91';
  const pairs: string[] = [];
  for (const l of lines) if (l.colour) pairs.push(l.id, css.getPropertyValue(`--${l.colour}`).trim() || neutral);
  const colourOf = (pairs.length ? ['match', ['get', 'line'], ...pairs, neutral] : neutral) as unknown as ExpressionSpecification;

  let selected: string | null = null;
  let revealed = reduced || Boolean(asked);

  function style(): StyleSpecification {
    const { bg, land, water, road, label, ink, building, light, ctx, ctxSoft, air } = palette();
    const dark = isDark();
    const width = (a: number, b: number): ExpressionSpecification => ['interpolate', ['linear'], ['zoom'], 9, a, 14, b];
    const stageIs = (s: string): ExpressionSpecification => ['==', ['get', 'stage'], s];
    const notPoint: ExpressionSpecification = ['!=', ['geometry-type'], 'Point'];
    const hot: ExpressionSpecification = ['any', ['boolean', ['feature-state', 'hover'], false], ['boolean', ['feature-state', 'sel'], false]];
    // Context: rail without sidings and yards; railway stations, not metro ones (OpenMapTiles keeps both in poi/railway).
    const railLine: ExpressionSpecification = ['all', ['==', ['get', 'class'], 'rail'], ['!', ['has', 'service']]];
    const railStation: ExpressionSpecification = ['all', ['==', ['get', 'class'], 'railway'], ['in', ['get', 'subclass'], ['literal', ['station', 'halt']]], ['!', ['in', 'Metro', ['coalesce', ['get', 'name:latin'], ['get', 'name'], '']]], ['!', ['within', MONO_AREA]]] as ExpressionSpecification;
    const connWidth: ExpressionSpecification = ['interpolate', ['linear'], ['zoom'], 11, 1.5, 15, 3.5];
    const connThread = (st: string, dash: number[] | null) => ({ id: `conn-${st}`, type: 'line' as const, source: 'conn-lines', minzoom: 12, filter: stageIs(st), layout: { 'line-cap': (dash ? 'butt' : 'round') as 'butt' | 'round' }, paint: { 'line-color': ink, 'line-width': connWidth, ...(dash ? { 'line-dasharray': dash } : {}) } });
    const isKind = (k: string): ExpressionSpecification => ['==', ['get', 'kind'], k];
    return {
      version: 8,
      glyphs: MAP_GLYPHS,
      // Dimming and weight changes cross in a quarter second, as on the hub.
      transition: { duration: 250, delay: 0 },
      sources: {
        omt: { type: 'vector', url: MAP_TILES, attribution: '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> <a href="https://www.openmaptiles.org/" target="_blank">&copy; OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>' },
        net: { type: 'geojson', data: revealed ? fullNet : collection([]) },
        lights: { type: 'geojson', data: collection([]) },
        dots: { type: 'geojson', data: dots },
        hsr: { type: 'geojson', data: hsr },
        'conn-lines': { type: 'geojson', data: CONN_LINES },
        'conn-points': { type: 'geojson', data: CONN_POINTS },
      },
      layers: [
        { id: 'bg', type: 'background', paint: { 'background-color': bg } },
        { id: 'landuse', type: 'fill', source: 'omt', 'source-layer': 'landuse', paint: { 'fill-color': land } },
        { id: 'water', type: 'fill', source: 'omt', 'source-layer': 'water', paint: { 'fill-color': water } },
        { id: 'road', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary']]], paint: { 'line-color': road, 'line-width': width(0.6, 3) } },
        { id: 'ctx-air', type: 'fill', source: 'omt', 'source-layer': 'aeroway', filter: ['in', ['get', 'class'], ['literal', ['aerodrome', 'apron']]], paint: { 'fill-color': air, 'fill-outline-color': ctxSoft } },
        { id: 'ctx-runway', type: 'line', source: 'omt', 'source-layer': 'aeroway', filter: ['==', ['get', 'class'], 'runway'], paint: { 'line-color': ctxSoft, 'line-width': width(1.2, 6) } },
        { id: 'ctx-rail', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: railLine, layout: { 'line-join': 'round' }, paint: { 'line-color': ctxSoft, 'line-width': width(0.7, 1.6) } },
        { id: 'ctx-hsr', type: 'line', source: 'hsr', filter: isKind('hsr'), layout: { 'line-join': 'round' }, paint: { 'line-color': ctx, 'line-width': width(1.2, 2.4), 'line-dasharray': [3, 2] } },
        { id: 'building', type: 'fill-extrusion', source: 'omt', 'source-layer': 'building', minzoom: 13, paint: { 'fill-extrusion-color': building, 'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 8], 'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0], 'fill-extrusion-opacity': 0.9 } },
        { id: 'casing', type: 'line', source: 'net', filter: notPoint, layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': bg, 'line-width': width(5, 11) } },
        // Night edition only: each line throws its own light on the ground.
        ...(dark ? [{ id: 'glow', type: 'line' as const, source: 'net', filter: notPoint, layout: { 'line-cap': 'round' as const, 'line-join': 'round' as const }, paint: { 'line-color': colourOf, 'line-width': width(10, 26), 'line-blur': width(7, 16), 'line-opacity': 0.4 } }] : []),
        { id: 'running', type: 'line', source: 'net', filter: stageIs('operational'), layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': colourOf, 'line-width': width(...WIDTHS.running) } },
        { id: 'building-line', type: 'line', source: 'net', filter: stageIs('under_construction'), layout: { 'line-join': 'round' }, paint: { 'line-color': colourOf, 'line-width': width(...WIDTHS['building-line']), 'line-dasharray': [2.2, 1.1] } },
        { id: 'approved', type: 'line', source: 'net', filter: stageIs('planned'), layout: { 'line-join': 'round' }, paint: { 'line-color': colourOf, 'line-width': width(...WIDTHS.approved), 'line-dasharray': [0.9, 1.3] } },
        { id: 'proposed', type: 'line', source: 'net', filter: stageIs('proposed'), layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': colourOf, 'line-width': width(...WIDTHS.proposed), 'line-dasharray': [0.1, 2] } },
        // A dot under the pointer, or chosen, grows and takes its line's colour.
        { id: 'stations', type: 'circle', source: 'dots', minzoom: 11, paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 9, ['case', hot, 5, 1.5], 14, ['case', hot, 9, 4]], 'circle-color': ['case', hot, colourOf, ink], 'circle-stroke-color': ['case', hot, ink, bg], 'circle-stroke-width': ['case', hot, 2.5, 1.5] } },
        { id: 'ctx-rail-station', type: 'circle', source: 'omt', 'source-layer': 'poi', minzoom: 11.5, filter: railStation, paint: { 'circle-radius': width(1.5, 3.5), 'circle-color': bg, 'circle-stroke-color': ctx, 'circle-stroke-width': 1.2 } },
        { id: 'ctx-hsr-station', type: 'circle', source: 'hsr', filter: isKind('hsr-station'), paint: { 'circle-radius': width(2.5, 5), 'circle-color': bg, 'circle-stroke-color': ctx, 'circle-stroke-width': 1.6 } },
        // Walkways between lines: a casing, then the thread in its stage stroke; a ring where one end only is known.
        { id: 'conn-casing', type: 'line', source: 'conn-lines', minzoom: 12, layout: { 'line-cap': 'round' }, paint: { 'line-color': bg, 'line-width': ['interpolate', ['linear'], ['zoom'], 11, 4, 15, 8] } },
        connThread('open', null),
        connThread('building', [2.2, 1.1]),
        connThread('approved', [0.9, 1.3]),
        connThread('planned', [0.1, 2]),
        { id: 'conn-one', type: 'circle', source: 'conn-points', minzoom: 12, filter: ['==', ['get', 'one'], true], paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 11, 4, 15, 8], 'circle-color': 'rgba(0,0,0,0)', 'circle-stroke-color': ink, 'circle-stroke-width': ['case', stageIs('open'), 2.2, 1.4] } },
        ...(dark ? [{ id: 'light-glow', type: 'circle' as const, source: 'lights', paint: { 'circle-radius': width(7, 14), 'circle-color': colourOf, 'circle-blur': 1, 'circle-opacity': 0.75 } }] : []),
        { id: 'light', type: 'circle', source: 'lights', paint: { 'circle-radius': width(2.6, 5), 'circle-color': light, 'circle-stroke-color': dark ? colourOf : bg, 'circle-stroke-width': 1.5 } },
        { id: 'ctx-rail-name', type: 'symbol', source: 'omt', 'source-layer': 'poi', minzoom: 13, filter: railStation, layout: { 'text-field': ['coalesce', ['get', 'name:latin'], ['get', 'name']], 'text-font': ['Noto Sans Italic'], 'text-size': 10.5, 'text-offset': [0, 0.9], 'text-anchor': 'top', 'text-optional': true }, paint: { 'text-color': ctx, 'text-halo-color': bg, 'text-halo-width': 1.6 } },
        { id: 'conn-label', type: 'symbol', source: 'conn-points', minzoom: 14, layout: { 'text-field': ['get', 'label'], 'text-font': ['Noto Sans Bold'], 'text-size': 10.5, 'text-offset': [0, 1.2], 'text-anchor': 'top', 'text-optional': true }, paint: { 'text-color': ink, 'text-halo-color': bg, 'text-halo-width': 2 } },
        { id: 'ctx-hsr-name', type: 'symbol', source: 'hsr', minzoom: 10, filter: isKind('hsr-station'), layout: { 'text-field': ['concat', ['get', 'name'], ' · bullet train'], 'text-font': ['Noto Sans Italic'], 'text-size': 10.5, 'text-offset': [0.9, 0], 'text-anchor': 'left', 'text-allow-overlap': true }, paint: { 'text-color': ctx, 'text-halo-color': bg, 'text-halo-width': 1.8 } },
        { id: 'ctx-air-name', type: 'symbol', source: 'omt', 'source-layer': 'aerodrome_label', filter: ['has', 'iata'], layout: { 'text-field': ['concat', '✈ ', ['coalesce', ['get', 'iata'], ['get', 'name:latin']]], 'text-font': ['Noto Sans Bold'], 'text-size': 11, 'text-letter-spacing': 0.06 }, paint: { 'text-color': ctx, 'text-halo-color': bg, 'text-halo-width': 2 } },
        { id: 'place', type: 'symbol', source: 'omt', 'source-layer': 'place', filter: ['in', ['get', 'class'], ['literal', ['city', 'town', 'suburb']]], layout: { 'text-field': ['get', 'name:latin'], 'text-font': ['Noto Sans Regular'], 'text-size': ['match', ['get', 'class'], 'city', 14, 'town', 13, 11], 'text-transform': 'uppercase', 'text-letter-spacing': 0.08 }, paint: { 'text-color': label, 'text-halo-color': bg, 'text-halo-width': 2 } },
      ],
    };
  }

  // ----- The map -----
  const cssLink = document.createElement('link');
  cssLink.rel = 'stylesheet';
  cssLink.href = mapCssUrl;
  document.head.appendChild(cssLink);

  // The room the front slip takes (slips differ in height), with the buttons over the rail.
  const frontHeight = () => dock.offsetHeight - rail.offsetHeight + (el.querySelector<HTMLElement>('.slip.is-on')?.offsetHeight ?? rail.offsetHeight) + 28;
  const padding = (tilted = false) => ({ top: tilted ? 84 : 56, bottom: frontHeight() + 12, left: 28, right: 28 });
  const map = new maplibregl.Map({
    container: live,
    style: style(),
    bounds: all,
    maxPitch: 65,
    maxZoom: 16,
    fitBoundsOptions: { padding: padding() },
    attributionControl: false,
    cooperativeGestures: true,
  });
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'top-right');
  // Ctrl + scroll anywhere on the stage zooms the map, never the page: over the slips, the key or the
  // station sheet the browser would otherwise zoom the whole page. The map's own canvas handles it itself.
  pinned.addEventListener('wheel', (event) => {
    if (!event.ctrlKey || live.querySelector('canvas')?.contains(event.target as Node)) return;
    event.preventDefault();
    const box = live.getBoundingClientRect();
    const around = map.unproject([event.clientX - box.left, event.clientY - box.top]);
    // A wheel notch is about 100 px; a trackpad pinch sends small steps. Half a zoom level per notch.
    map.easeTo({ zoom: map.getZoom() - event.deltaY * 0.005, around, duration: reduced ? 0 : 120, easing: glide });
  }, { passive: false });
  // `astro dev` only: lets capture scripts drive the map.
  if (import.meta.env.DEV) (window as unknown as { __map: maplibregl.Map }).__map = map;

  const markers = new Map<string, HTMLElement>();
  const paintSelection = () => {
    const isSel: ExpressionSpecification = ['==', ['get', 'line'], selected ?? ''];
    const pickOr = (on: number, off: number): ExpressionSpecification | number => (selected ? ['case', isSel, on, off] : on);
    for (const [layer, [a, b]] of Object.entries(WIDTHS)) {
      if (!map.getLayer(layer)) continue;
      map.setPaintProperty(layer, 'line-opacity', pickOr(1, 0.14));
      map.setPaintProperty(layer, 'line-width', ['interpolate', ['linear'], ['zoom'], 9, pickOr(a * (selected ? 1.7 : 1), a), 14, pickOr(b * (selected ? 1.7 : 1), b)]);
    }
    if (map.getLayer('stations')) map.setPaintProperty('stations', 'circle-opacity', pickOr(1, 0.3));
    if (map.getLayer('stations')) map.setPaintProperty('stations', 'circle-stroke-opacity', pickOr(1, 0.3));
    if (map.getLayer('glow')) map.setPaintProperty('glow', 'line-opacity', selected ? ['case', isSel, 0.7, 0.03] : 0.4);
    // The lights come up once the lines are drawn.
    const lit = revealed ? 1 : 0;
    if (map.getLayer('light')) map.setPaintProperty('light', 'circle-opacity', pickOr(lit, 0.15 * lit));
    if (map.getLayer('light')) map.setPaintProperty('light', 'circle-stroke-opacity', pickOr(lit, 0.15 * lit));
    if (map.getLayer('light-glow')) map.setPaintProperty('light-glow', 'circle-opacity', pickOr(0.75 * lit, 0.05 * lit));
    for (const [id, m] of markers) {
      m.classList.toggle('is-dim', Boolean(selected) && id !== selected);
      m.classList.toggle('is-on', id === selected);
    }
  };

  const select = (id: string | null, instant = false) => {
    // A line with no published route has nothing to frame: the whole network stays in view.
    selected = id && piecesOf(id).length ? id : null;
    paintSelection();
    const b = id ? boundsOf(id) : null;
    const bearing = id && b ? bearingOf(id) : 0;
    const cam = map.cameraForBounds(b ?? all, { padding: padding(Boolean(b)), bearing, maxZoom: 14.5 });
    if (!cam) return;
    // The frame is measured flat; a tilted view has room to come closer.
    const zoom = Math.min(14.5, (cam.zoom ?? 10) + (b ? 0.45 : 0));
    map.easeTo({ ...cam, zoom, bearing, pitch: b ? 55 : 0, duration: reduced || instant ? 0 : 1200, easing: glide });
  };

  // ----- The rail drives the map -----
  const padLeft = () => parseFloat(getComputedStyle(rail).scrollPaddingLeft) || 0;
  const restOf = (card: HTMLElement) => card.offsetLeft - padLeft();
  const nearest = () => cards.reduce((m, c) => (Math.abs(restOf(c) - rail.scrollLeft) < Math.abs(restOf(m) - rail.scrollLeft) ? c : m), cards[0]);
  let active = cards[0];
  const setActive = (card: HTMLElement, instant = false) => {
    if (card === active) return;
    active = card;
    for (const c of cards) c.classList.toggle('is-on', c === card);
    const place = cards.indexOf(card);
    count.textContent = String(place + 1);
    const id = card.dataset.card || null;
    // Another line: a station card left open would belong to the last one.
    closeSheet();
    select(id, instant);
    history.replaceState(null, '', id ? `${location.pathname}?line=${encodeURIComponent(id)}` : location.pathname);
  };
  /** `jump`: the rail moves at once (keyboard); the camera still travels, so the reader keeps their place on the map. */
  const goTo = (id: string | null, instant = false, jump = false) => {
    const card = cards.find((c) => (c.dataset.card || null) === id);
    if (!card) return;
    rail.scrollTo({ left: restOf(card), behavior: reduced || instant || jump ? 'auto' : 'smooth' });
    setActive(card, instant);
  };
  let settle = 0;
  let steering = false; // true while goTo's own smooth scroll runs, so the slips it passes are not chosen
  const settled = () => {
    steering = false;
    setActive(nearest());
  };
  rail.addEventListener('scroll', () => {
    el.classList.add('has-moved');
    clearTimeout(settle);
    settle = window.setTimeout(settled, steering ? 220 : 110);
  }, { passive: true });
  rail.addEventListener('scrollend', () => {
    clearTimeout(settle);
    settled();
  });
  // ----- Wide screens: the stage pins, and the page's own scroll moves the rail one line per step -----
  /** Page scroll that one line takes, px. */
  const STEP_PX = 170;
  let pin: ScrollTrigger | null = null;
  const pageY = { y: 0 };
  /** Bring the page to the scroll position of slip i; the pin's own update then moves the rail and the map. */
  const scrollPageTo = (i: number, jump = false) => {
    if (!pin) return;
    const y = pin.start + (i / (cards.length - 1)) * (pin.end - pin.start) + 1;
    gsap.killTweensOf(pageY);
    if (jump) return window.scrollTo(0, y);
    pageY.y = window.scrollY;
    gsap.to(pageY, { y, duration: 0.5, ease: 'expo.out', onUpdate: () => window.scrollTo(0, pageY.y) });
  };
  gsap.matchMedia().add('(min-width: 64rem) and (prefers-reduced-motion: no-preference)', () => {
    el.classList.add('is-pinned');
    const last = cards.length - 1;
    const trigger = ScrollTrigger.create({
      trigger: pinned,
      start: 'center center',
      end: () => `+=${last * STEP_PX}`,
      pin: true,
      anticipatePin: 1,
      onUpdate: (self) => {
        const card = cards[Math.round(self.progress * last)];
        if (card === active) return;
        steering = true;
        goTo(card.dataset.card || null);
      },
    });
    pin = trigger;
    return () => {
      trigger.kill();
      pin = null;
      el.classList.remove('is-pinned');
    };
  });

  const steer = (id: string | null, jump = false) => {
    if (pin) return scrollPageTo(cards.findIndex((c) => (c.dataset.card || null) === id), jump);
    steering = !jump;
    goTo(id, false, jump);
  };
  rail.addEventListener('click', (event) => {
    const card = (event.target as Element).closest<HTMLElement>('[data-card]');
    if (!card || card === active) return;
    // A slip behind the front one comes to the front first; its link works once it is there.
    event.preventDefault();
    steer(card.dataset.card || null);
  });
  /** One slip back or forward. `jump` (keyboard): the rail moves at once. */
  const step = (by: number, jump = false) => {
    const to = cards[cards.indexOf(active) + by];
    if (to) steer(to.dataset.card || null, jump);
  };
  // A sideways swipe on the map itself also moves one line (one finger; two fingers still move the map).
  let from: { x: number; y: number; t: number } | null = null;
  live.addEventListener('touchstart', (event) => {
    const t = event.touches[0];
    from = event.touches.length === 1 ? { x: t.clientX, y: t.clientY, t: event.timeStamp } : null;
  }, { passive: true });
  live.addEventListener('touchend', (event) => {
    if (!from) return;
    const t = event.changedTouches[0];
    const [dx, dy] = [t.clientX - from.x, t.clientY - from.y];
    if (event.timeStamp - from.t < 700 && Math.abs(dx) > 48 && Math.abs(dx) > 1.5 * Math.abs(dy)) step(dx < 0 ? 1 : -1);
    from = null;
  }, { passive: true });
  // The arrow keys work from anywhere on the stage: the rail, a link, a mark on the map.
  el.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    step(event.key === 'ArrowRight' ? 1 : -1, true);
  });
  rail.addEventListener('focusin', (event) => {
    const card = (event.target as Element).closest<HTMLElement>('[data-card]');
    if (card && card !== active) steer(card.dataset.card || null, true);
  });

  // ----- Marks on the map -----
  const addMarkers = () => {
    for (const l of lines) {
      if (!piecesOf(l.id).length) continue;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `lmark mk${l.colour ? '' : ' lmark--none'}`;
      b.textContent = l.n;
      b.setAttribute('aria-label', `Line ${l.n}: show on the map`);
      if (l.colour) b.style.cssText = `--c:var(--${l.colour});--on-c:var(--on-${l.colour})`;
      b.addEventListener('click', (event) => {
        event.stopPropagation();
        steer(selected === l.id ? null : l.id);
      });
      const holder = document.createElement('div');
      holder.appendChild(b);
      new maplibregl.Marker({ element: holder }).setLngLat(markAt(l.id)).addTo(map);
      markers.set(l.id, b);
      // A mark arrives as its line starts to draw.
      const first = Math.min(...piecesOf(l.id).map((p) => START[p.stage]));
      window.setTimeout(() => b.classList.add('is-in'), revealed ? 0 : 400 + (first + SPAN * 0.35) * DRAW_MS);
    }
  };
  for (const layer of Object.keys(WIDTHS)) {
    map.on('click', layer, (e) => {
      // A click on a station or a walkway opens its card instead.
      if (dotAt(e.point, touchFirst ? 16 : 10) || connAt(e.point, touchFirst ? 12 : 7)) return;
      const id = (e.features?.[0]?.properties as { line?: string } | undefined)?.line;
      if (id) steer(id);
    });
  }

  // ----- Stations: the name on hover, the card on a click or tap -----
  const sheet = el.querySelector<HTMLElement>('[data-station-sheet]')!;
  const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const touchFirst = !canHover;
  /** The walkway under the pointer, within r px. */
  function connAt(point: maplibregl.Point, r: number): Conn | null {
    const layers = CONN_LAYERS.filter((l) => map.getLayer(l));
    if (!layers.length) return null;
    const f = map.queryRenderedFeatures([[point.x - r, point.y - r], [point.x + r, point.y + r]], { layers })[0];
    return f ? CONN_BY_ID.get((f.properties as { id: string }).id) ?? null : null;
  }
  const connPop = new maplibregl.Popup({ closeButton: true, maxWidth: '300px', className: 'conn-pop' });
  /** The dot nearest the pointer within r px: the dots are small. */
  function dotAt(point: maplibregl.Point, r: number) {
    if (!map.getLayer('stations')) return null;
    const found = map.queryRenderedFeatures([[point.x - r, point.y - r], [point.x + r, point.y + r]], { layers: ['stations'] });
    const dist = (f: maplibregl.MapGeoJSONFeature) => {
      const p = map.project((f.geometry as GeoJSON.Point).coordinates as [number, number]);
      return Math.hypot(p.x - point.x, p.y - point.y);
    };
    return found.sort((a, b) => dist(a) - dist(b))[0] ?? null;
  }
  let hoverId: number | null = null;
  let chosenId: number | null = null;
  const dotState = (id: number | null, key: 'hover' | 'sel', on: boolean) => {
    if (id !== null) map.setFeatureState({ source: 'dots', id }, { [key]: on });
  };
  const sign = new maplibregl.Popup({ className: 'ssign-pop', closeButton: false, closeOnClick: false, offset: 14, anchor: 'bottom', maxWidth: 'none' });
  // The first sign fades up; moving on to the next dot within a moment swaps it at once (no animation),
  // so running the pointer along a line reads names without lag.
  let signGoneAt = 0;
  const showSign = (s: StationCard) => {
    const instant = sign.isOpen() || performance.now() - signGoneAt < 300;
    sign.setLngLat([s.lng, s.lat]).setHTML(signHtml(s)).addTo(map);
    if (instant) sign.getElement()?.querySelector('.ssign')?.classList.add('is-instant');
  };
  const hideSign = () => {
    if (sign.isOpen()) signGoneAt = performance.now();
    sign.remove();
  };

  // The sheet: rises on the first station, swaps in place for the next, and sinks away (faster) on close.
  let leaving = 0;
  const closeSheet = (instant = false) => {
    if (chosenId === null) return;
    dotState(chosenId, 'sel', false);
    chosenId = null;
    el.classList.remove('has-station');
    const card = sheet.querySelector<HTMLElement>('.scard');
    const done = () => {
      sheet.hidden = true;
      sheet.replaceChildren();
    };
    if (instant || reduced || !card) return done();
    card.classList.remove('is-instant');
    card.classList.add('is-leaving');
    card.style.transform = '';
    window.clearTimeout(leaving);
    leaving = window.setTimeout(done, 160);
  };
  const openSheet = (fid: number, s: StationCard) => {
    hideSign();
    window.clearTimeout(leaving);
    const swap = chosenId !== null;
    dotState(chosenId, 'sel', false);
    chosenId = fid;
    dotState(fid, 'sel', true);
    sheet.innerHTML = sheetHtml(s);
    const card = sheet.querySelector<HTMLElement>('.scard')!;
    if (swap) card.classList.add('is-instant');
    sheet.hidden = false;
    el.classList.add('has-station');
    card.querySelector('[data-close]')!.addEventListener('click', () => closeSheet());
    dragToDismiss(card);
  };
  /** A downward flick or drag puts the sheet away: past 64 px, or fast (velocity over 0.11 px/ms) from any distance.
   *  Upward, it gives a little and comes back. */
  const dragToDismiss = (card: HTMLElement) => {
    let from: { y: number; t: number; id: number } | null = null;
    let dy = 0;
    card.addEventListener('pointerdown', (event) => {
      if (from || (event.target as Element).closest('a, button')) return; // one finger only; buttons stay buttons
      from = { y: event.clientY, t: event.timeStamp, id: event.pointerId };
      dy = 0;
      card.setPointerCapture(event.pointerId);
      card.classList.add('is-dragging');
    });
    card.addEventListener('pointermove', (event) => {
      if (!from || event.pointerId !== from.id) return;
      const d = event.clientY - from.y;
      dy = d > 0 ? d : d * 0.15; // friction upward, not a wall
      card.style.transform = `translateY(${dy}px)`;
    });
    const end = (event: PointerEvent) => {
      if (!from || event.pointerId !== from.id) return;
      const velocity = Math.abs(dy) / Math.max(1, event.timeStamp - from.t);
      from = null;
      card.classList.remove('is-dragging');
      if (dy > 64 || (dy > 8 && velocity > 0.11)) closeSheet();
      else card.style.transform = '';
    };
    card.addEventListener('pointerup', end);
    card.addEventListener('pointercancel', end);
  };
  map.on('mousemove', (e) => {
    if (!canHover) return;
    const f = dotAt(e.point, 10);
    const fid = f ? (f.id as number) : null;
    map.getCanvas().style.cursor = f || connAt(e.point, 6) ? 'pointer' : '';
    if (fid === hoverId) return;
    dotState(hoverId, 'hover', false);
    hoverId = fid;
    dotState(hoverId, 'hover', true);
    const s = f && cardOf.get((f.properties as { sid: string }).sid);
    if (!s || fid === chosenId) return hideSign();
    showSign(s);
  });
  map.on('mouseout', () => {
    dotState(hoverId, 'hover', false);
    hoverId = null;
    hideSign();
  });
  map.on('click', (e) => {
    const f = dotAt(e.point, touchFirst ? 16 : 10);
    const s = f && cardOf.get((f.properties as { sid: string }).sid);
    if (f && s) {
      connPop.remove();
      if (f.id !== chosenId) openSheet(f.id as number, s);
      return;
    }
    closeSheet();
    const c = connAt(e.point, touchFirst ? 12 : 7);
    if (c) connPop.setLngLat(connMid(c.geometry)).setHTML(connCard(c)).addTo(map);
  });
  // From the keyboard the sheet goes at once: no motion on keyboard actions.
  el.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeSheet(true);
  });

  // ----- Motion: the drawing-in, then the lights -----
  let inView = true;
  let frame = 0;
  let last = 0;
  const tick = (now: number) => {
    frame = requestAnimationFrame(tick);
    if (now - last < 40) return;
    last = now;
    (map.getSource('lights') as GeoJSONSource | undefined)?.setData(lightsAt(now / 1000));
  };
  const run = () => {
    cancelAnimationFrame(frame);
    if (revealed && inView && !document.hidden && !reduced) frame = requestAnimationFrame(tick);
  };
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    run();
  }).observe(el);
  document.addEventListener('visibilitychange', run);

  map.once('load', () => {
    el.classList.add('is-live');
    paintSelection();
    // The open attribution covers the key; it stays one tap away.
    live.querySelector('.maplibregl-ctrl-attrib')?.classList.remove('maplibregl-compact-show');
    addMarkers();
    if (revealed) {
      if (asked) {
        goTo(asked, true);
        // Pinned: the page takes the place of that slip, so the next scroll step starts from it.
        scrollPageTo(cards.indexOf(active), true);
      }
      run();
      return;
    }
    let t0 = 0;
    const draw = (now: number) => {
      t0 ||= now;
      const t = Math.min(1, (now - t0) / DRAW_MS);
      (map.getSource('net') as GeoJSONSource).setData(t < 1 ? drawnTo(t) : fullNet);
      if (t < 1) requestAnimationFrame(draw);
      else {
        revealed = true;
        paintSelection();
        run();
      }
    };
    window.setTimeout(() => requestAnimationFrame(draw), 400);
  });

  // The other edition: restyle, keep the choice.
  const restyle = () => {
    map.setStyle(style());
    map.once('styledata', () => {
      paintSelection();
      dotState(chosenId, 'sel', true);
    });
  };
  new MutationObserver(restyle).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', restyle);
}
