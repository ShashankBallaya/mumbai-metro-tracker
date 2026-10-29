/**
 * The hub's network map: every MMR metro line with a published route, on a dark basemap
 * (OpenFreeMap vector tiles). Stage is the stroke pattern, never colour alone: solid running,
 * long dashes being built, short dashes approved, dots proposed. A line's colour shows only
 * where a source names it (src/lib/network.ts); others are drawn in neutral grey.
 * Loaded by hub.ts when the section nears the viewport.
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
  href: string | null;
}

const STAGE_LABEL: Record<string, string> = {
  operational: 'Running',
  under_construction: 'Under construction',
  planned: 'Approved, not started',
  proposed: 'Proposed',
};
const NEUTRAL = '#8d939c';

/** The basemap in the reader's edition: night (the hub's near-black) or morning (the line pages' newsprint). */
const isDark = () => {
  const t = document.documentElement.dataset.theme;
  return t === 'dark' || (t !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
};
function palette() {
  return isDark()
    ? { bg: '#0e1117', land: '#141820', water: '#0a1a26', road: '#262b35', rail: '#3a3f4a', label: '#8f949c', ink: '#f4f1ea' }
    : { bg: '#e8e1d4', land: '#e1d9ca', water: '#c4d0d1', road: '#cfc5b3', rail: '#a69e91', label: '#5f584f', ink: '#111a28' };
}
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function loadCss(): Promise<void> {
  return new Promise((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = mapCssUrl;
    link.onload = link.onerror = () => resolve();
    document.head.appendChild(link);
  });
}

function style(geometry: GeoJSON.FeatureCollection, colourOf: ExpressionSpecification, labels: GeoJSON.FeatureCollection): StyleSpecification {
  const { bg, land, water, road, rail, label, ink } = palette();
  const font = ['Noto Sans Regular'];
  const width = (a: number, b: number): ExpressionSpecification => ['interpolate', ['linear'], ['zoom'], 9, a, 14, b];
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
      // A dark casing under every line keeps crossings readable.
      { id: 'casing', type: 'line', source: 'net', filter: ['!=', ['geometry-type'], 'Point'], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': bg, 'line-width': width(5, 11) } },
      { id: 'running', type: 'line', source: 'net', filter: stageIs('operational'), layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': colourOf, 'line-width': width(3, 7) } },
      { id: 'building', type: 'line', source: 'net', filter: stageIs('under_construction'), layout: { 'line-join': 'round' }, paint: { 'line-color': colourOf, 'line-width': width(3, 7), 'line-dasharray': [2.2, 1.1] } },
      { id: 'approved', type: 'line', source: 'net', filter: stageIs('planned'), layout: { 'line-join': 'round' }, paint: { 'line-color': colourOf, 'line-width': width(2.4, 5.5), 'line-dasharray': [0.9, 1.3] } },
      { id: 'proposed', type: 'line', source: 'net', filter: stageIs('proposed'), layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': colourOf, 'line-width': width(2, 4), 'line-dasharray': [0.1, 2] } },
      { id: 'stations', type: 'circle', source: 'net', filter: ['==', ['geometry-type'], 'Point'], minzoom: 11, paint: { 'circle-radius': width(1.5, 4), 'circle-color': ink, 'circle-stroke-color': bg, 'circle-stroke-width': 1.5 } },
      // One number per line, at the middle of its longest drawn stretch, always shown.
      { id: 'line-number', type: 'symbol', source: 'labels', layout: { 'text-field': ['get', 'n'], 'text-font': ['Noto Sans Bold'], 'text-size': 12, 'text-allow-overlap': true, 'text-ignore-placement': true }, paint: { 'text-color': ink, 'text-halo-color': bg, 'text-halo-width': 2.5 } },
      // Place names last, above the lines, so Kalyan, Thane and Mumbai are never cut.
      { id: 'place', type: 'symbol', source: 'omt', 'source-layer': 'place', filter: ['in', ['get', 'class'], ['literal', ['city', 'town', 'suburb']]], layout: { 'text-field': ['get', 'name:latin'], 'text-font': font, 'text-size': ['match', ['get', 'class'], 'city', 14, 'town', 13, 11], 'text-transform': 'uppercase', 'text-letter-spacing': 0.08 }, paint: { 'text-color': label, 'text-halo-color': bg, 'text-halo-width': 2 } },
    ],
  };
}

/** One label point per line: its drawn vertex nearest the centre of all its drawn vertices, so a line in
 *  many short pieces (OSM ways) still gets one label in its middle. */
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
    features.push({ type: 'Feature', properties: { n: number.get(id) ?? '' }, geometry: { type: 'Point', coordinates: at } });
  }
  return { type: 'FeatureCollection', features };
}

export async function mount(el: HTMLElement) {
  await loadCss();
  const lines: LineInfo[] = JSON.parse(el.dataset.lines!);
  const geometry = JSON.parse(geometryRaw) as GeoJSON.FeatureCollection;
  const css = getComputedStyle(document.documentElement);
  const pairs: string[] = [];
  for (const l of lines) if (l.colour) pairs.push(l.id, css.getPropertyValue(`--${l.colour}`).trim() || NEUTRAL);
  const colourOf = (pairs.length ? ['match', ['get', 'line'], ...pairs, NEUTRAL] : NEUTRAL) as unknown as ExpressionSpecification;

  const bounds = new maplibregl.LngLatBounds();
  for (const f of geometry.features) {
    const g = f.geometry;
    const cs = g.type === 'LineString' ? [g.coordinates] : g.type === 'MultiLineString' ? g.coordinates : [];
    for (const line of cs) for (const c of line) bounds.extend(c as [number, number]);
  }
  const holder = document.createElement('div');
  holder.style.cssText = 'position:absolute;inset:0';
  el.appendChild(holder);
  const map = new maplibregl.Map({
    container: holder,
    style: style(geometry, colourOf, labelPoints(geometry, lines)),
    bounds,
    fitBoundsOptions: { padding: 24 },
    attributionControl: { compact: true },
    cooperativeGestures: true,
    maxZoom: 16,
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
  const restyle = () => map.setStyle(style(geometry, colourOf, labelPoints(geometry, lines)), { diff: true });
  new MutationObserver(restyle).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', restyle);
  el.classList.add('is-live');

  const byId = new Map(lines.map((l) => [l.id, l]));
  const popup = new maplibregl.Popup({ closeButton: false, offset: 10 });
  for (const layer of ['running', 'building', 'approved', 'proposed']) {
    map.on('mouseenter', layer, () => (map.getCanvas().style.cursor = 'pointer'));
    map.on('mouseleave', layer, () => (map.getCanvas().style.cursor = ''));
    map.on('click', layer, (e) => {
      const p = e.features?.[0]?.properties as { line: string; stage: string } | undefined;
      const l = p && byId.get(p.line);
      if (!l) return;
      const title = l.number.length <= 3 && /^\d/.test(l.number) ? `Line ${esc(l.number)}, ${esc(l.name)}` : esc(l.name);
      const link = l.href ? `<br><a href="${esc(l.href)}">Open the tracker</a>` : '';
      popup.setLngLat(e.lngLat).setHTML(`<strong>${title}</strong><br>${STAGE_LABEL[p!.stage] ?? p!.stage} here${link}`).addTo(map);
    });
  }
}
