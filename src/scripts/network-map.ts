/**
 * The hub's street map: every MMR metro line with a published route, on OpenFreeMap vector tiles in
 * the paper's two editions. Stage is the stroke pattern, never colour alone: solid running, long
 * dashes being built, short dashes approved, dots proposed. A line's colour shows only where a source
 * names it (src/lib/network.ts); the others are drawn in concrete grey.
 * Choosing a line (here or in the fact box) dims the others, draws it heavier and tilts the map down its
 * route, with the city's buildings standing up from zoom 13 (OpenMapTiles heights). Loaded by hub.ts after the
 * first paint; until then, and without WebGL, the page shows a drawing of the same geometry.
 */
import * as maplibregl from 'maplibre-gl';
import type { ExpressionSpecification, StyleSpecification } from 'maplibre-gl';
import mapCssUrl from 'maplibre-gl/dist/maplibre-gl.css?url';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import geometryRaw from '../data/network-geometry.geojson?raw';
import { MAP_TILES, MAP_GLYPHS } from '../config';

maplibregl.setWorkerUrl(workerUrl);

interface LineInfo {
  id: string;
  number: string;
  name: string;
  stage: string;
  colour: string | null;
}
export interface NetworkMap {
  select(id: string | null): void;
}

const STROKES = ['running', 'building-line', 'approved', 'proposed'] as const;
const DRAWN = ['operational', 'under_construction', 'planned', 'proposed'];

/** The basemap in the reader's edition: morning newsprint or night navy, from the paper's tokens. */
const isDark = () => {
  const t = document.documentElement.dataset.theme;
  return t === 'dark' || (t !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
};
function palette() {
  return isDark()
    ? { bg: '#121d31', land: '#16223a', water: '#0b1424', road: '#24314c', rail: '#3a4766', label: '#978f82', ink: '#ece5d8', building: '#253554' }
    : { bg: '#e5ddcf', land: '#ded5c5', water: '#c3cfd0', road: '#d0c6b4', rail: '#a69e91', label: '#5f584f', ink: '#111a28', building: '#cbc1b0' };
}

function loadCss(): Promise<void> {
  return new Promise((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = mapCssUrl;
    link.onload = link.onerror = () => resolve();
    document.head.appendChild(link);
  });
}

function style(geometry: GeoJSON.FeatureCollection, colourOf: ExpressionSpecification, labels: GeoJSON.FeatureCollection, selected: string | null = null): StyleSpecification {
  const { bg, land, water, road, rail, label, ink, building } = palette();
  const width = (a: number, b: number): ExpressionSpecification => ['interpolate', ['linear'], ['zoom'], 9, a, 14, b];
  // The chosen line draws 1.7 times heavier; the rest keep their weight (and dim, see paintSelection).
  const heavy = (v: number): ExpressionSpecification | number => (selected ? ['case', ['==', ['get', 'line'], selected], v * 1.7, v] : v);
  const lineWidth = (a: number, b: number) => ['interpolate', ['linear'], ['zoom'], 9, heavy(a), 14, heavy(b)] as ExpressionSpecification;
  const stageIs = (s: string): ExpressionSpecification => ['==', ['get', 'stage'], s];
  return {
    version: 8,
    glyphs: MAP_GLYPHS,
    sources: {
      omt: { type: 'vector', url: MAP_TILES, attribution: '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> <a href="https://www.openmaptiles.org/" target="_blank">&copy; OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>' },
      net: { type: 'geojson', data: geometry },
      labels: { type: 'geojson', data: labels },
    },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': bg } },
      { id: 'landuse', type: 'fill', source: 'omt', 'source-layer': 'landuse', paint: { 'fill-color': land } },
      { id: 'water', type: 'fill', source: 'omt', 'source-layer': 'water', paint: { 'fill-color': water } },
      { id: 'road', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary']]], paint: { 'line-color': road, 'line-width': width(0.6, 3) } },
      { id: 'rail', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['==', ['get', 'class'], 'rail'], paint: { 'line-color': rail, 'line-width': 1, 'line-dasharray': [3, 2] } },
      // The city stands up when the map tilts close in: flat-shaded blocks in the paper's greys, no shadow.
      { id: 'building', type: 'fill-extrusion', source: 'omt', 'source-layer': 'building', minzoom: 13, paint: { 'fill-extrusion-color': building, 'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 8], 'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0], 'fill-extrusion-opacity': 0.9 } },
      // A casing in the map's ground under every line keeps crossings readable.
      { id: 'casing', type: 'line', source: 'net', filter: ['!=', ['geometry-type'], 'Point'], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': bg, 'line-width': width(5, 11) } },
      { id: 'running', type: 'line', source: 'net', filter: stageIs('operational'), layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': colourOf, 'line-width': lineWidth(3, 7) } },
      { id: 'building-line', type: 'line', source: 'net', filter: stageIs('under_construction'), layout: { 'line-join': 'round' }, paint: { 'line-color': colourOf, 'line-width': lineWidth(3, 7), 'line-dasharray': [2.2, 1.1] } },
      { id: 'approved', type: 'line', source: 'net', filter: stageIs('planned'), layout: { 'line-join': 'round' }, paint: { 'line-color': colourOf, 'line-width': lineWidth(2.4, 5.5), 'line-dasharray': [0.9, 1.3] } },
      { id: 'proposed', type: 'line', source: 'net', filter: stageIs('proposed'), layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': colourOf, 'line-width': lineWidth(2, 4), 'line-dasharray': [0.1, 2] } },
      { id: 'stations', type: 'circle', source: 'net', filter: ['==', ['geometry-type'], 'Point'], minzoom: 11, paint: { 'circle-radius': width(1.5, 4), 'circle-color': ink, 'circle-stroke-color': bg, 'circle-stroke-width': 1.5 } },
      // One number per line, at the middle of its drawn stretches, always shown.
      { id: 'line-number', type: 'symbol', source: 'labels', layout: { 'text-field': ['get', 'n'], 'text-font': ['Noto Sans Bold'], 'text-size': 13, 'text-allow-overlap': true, 'text-ignore-placement': true }, paint: { 'text-color': ink, 'text-halo-color': bg, 'text-halo-width': 2.5 } },
      // Place names last, above the lines, so Kalyan, Thane and Mumbai are never cut.
      { id: 'place', type: 'symbol', source: 'omt', 'source-layer': 'place', filter: ['in', ['get', 'class'], ['literal', ['city', 'town', 'suburb']]], layout: { 'text-field': ['get', 'name:latin'], 'text-font': ['Noto Sans Regular'], 'text-size': ['match', ['get', 'class'], 'city', 14, 'town', 13, 11], 'text-transform': 'uppercase', 'text-letter-spacing': 0.08 }, paint: { 'text-color': label, 'text-halo-color': bg, 'text-halo-width': 2 } },
    ],
  };
}

/** One label point per line: its drawn vertex nearest the centre of its drawn vertices. */
function labelPoints(geometry: GeoJSON.FeatureCollection, lines: LineInfo[]): GeoJSON.FeatureCollection {
  const pts = new Map<string, number[][]>();
  for (const f of geometry.features) {
    const g = f.geometry;
    const pieces = g.type === 'LineString' ? [g.coordinates] : g.type === 'MultiLineString' ? g.coordinates : [];
    const id = (f.properties as { line: string }).line;
    if (!pts.has(id)) pts.set(id, []);
    for (const cs of pieces) pts.get(id)!.push(...cs);
  }
  const number = new Map(lines.map((l) => [l.id, l.number.replace(/^NM/, 'N')]));
  const features: GeoJSON.Feature[] = [];
  for (const [id, cs] of pts) {
    if (!cs.length) continue;
    const cx = cs.reduce((t, c) => t + c[0], 0) / cs.length;
    const cy = cs.reduce((t, c) => t + c[1], 0) / cs.length;
    const at = cs.reduce((m, c) => (Math.hypot(c[0] - cx, c[1] - cy) < Math.hypot(m[0] - cx, m[1] - cy) ? c : m), cs[0]);
    features.push({ type: 'Feature', properties: { n: number.get(id) ?? '', line: id }, geometry: { type: 'Point', coordinates: at } });
  }
  return { type: 'FeatureCollection', features };
}

export async function mount(el: HTMLElement, onPick: (id: string) => void): Promise<NetworkMap> {
  await loadCss();
  const lines: LineInfo[] = JSON.parse(el.dataset.lines!);
  const all = JSON.parse(el.dataset.bounds!) as [[number, number], [number, number]];
  const raw = JSON.parse(geometryRaw) as GeoJSON.FeatureCollection;
  // Only drawn stages: a line only studied as an idea is listed, never drawn.
  const geometry: GeoJSON.FeatureCollection = { ...raw, features: raw.features.filter((f) => f.geometry.type === 'Point' || DRAWN.includes((f.properties as { stage?: string }).stage ?? '')) };
  const css = getComputedStyle(document.documentElement);
  const neutral = css.getPropertyValue('--concrete').trim() || '#a69e91';
  const pairs: string[] = [];
  for (const l of lines) if (l.colour) pairs.push(l.id, css.getPropertyValue(`--${l.colour}`).trim() || neutral);
  const colourOf = (pairs.length ? ['match', ['get', 'line'], ...pairs, neutral] : neutral) as unknown as ExpressionSpecification;
  const labels = labelPoints(geometry, lines);

  const holder = document.createElement('div');
  holder.className = 'front__live';
  el.appendChild(holder);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const padding = () => (el.clientWidth < 520 ? { top: 20, bottom: 70, left: 20, right: 20 } : { top: 30, bottom: 60, left: 40, right: 40 });
  const map = new maplibregl.Map({
    container: holder,
    style: style(geometry, colourOf, labels),
    bounds: all,
    maxPitch: 65,
    fitBoundsOptions: { padding: padding() },
    attributionControl: { compact: true },
    cooperativeGestures: true,
    maxZoom: 16,
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

  let selected: string | null = null;
  const boundsOf = (id: string) => {
    const b = new maplibregl.LngLatBounds();
    for (const f of geometry.features) {
      if ((f.properties as { line: string }).line !== id) continue;
      const g = f.geometry;
      const cs = g.type === 'LineString' ? [g.coordinates] : g.type === 'MultiLineString' ? g.coordinates : g.type === 'Point' ? [[g.coordinates]] : [];
      for (const line of cs) for (const c of line) b.extend(c as [number, number]);
    }
    return b.isEmpty() ? null : b;
  };
  const paintSelection = () => {
    const dim = (on: number, off: number): ExpressionSpecification | number => (selected ? ['case', ['==', ['get', 'line'], selected], on, off] : on);
    for (const layer of STROKES) if (map.getLayer(layer)) map.setPaintProperty(layer, 'line-opacity', dim(1, 0.16));
    if (map.getLayer('line-number')) map.setPaintProperty('line-number', 'text-opacity', dim(1, 0.25));
  };
  /** The direction a line runs, as a map bearing from its first drawn point to its last, so the tilted
   *  map looks down the route from one end of it. */
  const bearingOf = (id: string) => {
    const cs = geometry.features
      .filter((f) => (f.properties as { line: string }).line === id && f.geometry.type !== 'Point')
      .flatMap((f) => (f.geometry.type === 'LineString' ? f.geometry.coordinates : f.geometry.type === 'MultiLineString' ? f.geometry.coordinates.flat() : []));
    if (cs.length < 2) return 0;
    const [a, b] = [cs[0], cs[cs.length - 1]];
    const dx = (b[0] - a[0]) * Math.cos((a[1] * Math.PI) / 180);
    const dy = b[1] - a[1];
    const bearing = (Math.atan2(dx, dy) * 180) / Math.PI;
    // Look from whichever end keeps north in the upper half, so the map is never turned upside down.
    return Math.abs(bearing) > 90 ? bearing - Math.sign(bearing) * 180 : bearing;
  };
  const select = (id: string | null) => {
    selected = id;
    map.setStyle(style(geometry, colourOf, labels, selected), { diff: true });
    paintSelection();
    const b = id ? boundsOf(id) : null;
    map.fitBounds(b ?? all, { padding: padding(), maxZoom: 14.5, pitch: id ? 55 : 0, bearing: id ? bearingOf(id) : 0, duration: reduced ? 0 : 1100 });
  };

  const restyle = () => {
    map.setStyle(style(geometry, colourOf, labels, selected), { diff: true });
    map.once('styledata', paintSelection);
  };
  new MutationObserver(restyle).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', restyle);
  // Show the street map once its first frame is drawn, not as an empty box.
  map.once('load', () => {
    el.classList.add('is-live');
    // On a phone-width map the open attribution covers the south of the network; it stays one tap away.
    if (el.clientWidth < 520) holder.querySelector('.maplibregl-ctrl-attrib')?.classList.remove('maplibregl-compact-show');
  });

  for (const layer of STROKES) {
    map.on('mouseenter', layer, () => (map.getCanvas().style.cursor = 'pointer'));
    map.on('mouseleave', layer, () => (map.getCanvas().style.cursor = ''));
    map.on('click', layer, (e) => {
      const id = (e.features?.[0]?.properties as { line?: string } | undefined)?.line;
      if (id) onPick(id);
    });
  }
  return { select };
}
