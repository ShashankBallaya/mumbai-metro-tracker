/**
 * The hub's front: the network map as a stage (src/pages/index.astro).
 *   - The lines draw themselves in by stage: running, being built, approved, proposed.
 *   - The rail of slips drives the map: the slip at the front is the chosen line. The map flies down
 *     that line's route, tilted, and the other lines step back.
 *   - Wide screens (motion allowed): the stage pins and the page's scroll moves the rail, one line per step.
 *   - Each line has its mark on the map as a tap target.
 *   - Lights move on running stretches only (not live train positions). On the night edition the lines glow.
 * The choice lives in the address (?line=). With reduced motion, nothing draws in, flies or moves.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as maplibregl from 'maplibre-gl';
import type { ExpressionSpecification, GeoJSONSource, StyleSpecification } from 'maplibre-gl';
import mapCssUrl from 'maplibre-gl/dist/maplibre-gl.css?url';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import geometryRaw from '../data/network-geometry.geojson?raw';
import { MAP_TILES, MAP_GLYPHS } from '../config';

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
    ? { bg: '#121d31', land: '#16223a', water: '#0b1424', road: '#24314c', rail: '#3a4766', label: '#978f82', ink: '#ece5d8', building: '#253554', light: '#fff6dd' }
    : { bg: '#e5ddcf', land: '#ded5c5', water: '#c3cfd0', road: '#d0c6b4', rail: '#a69e91', label: '#5f584f', ink: '#111a28', building: '#cbc1b0', light: '#111a28' };

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
  const fullNet = collection([...pieces.map((p) => feature(p, p.coords)), ...stations]);
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
    const { bg, land, water, road, rail: railway, label, ink, building, light } = palette();
    const dark = isDark();
    const width = (a: number, b: number): ExpressionSpecification => ['interpolate', ['linear'], ['zoom'], 9, a, 14, b];
    const stageIs = (s: string): ExpressionSpecification => ['==', ['get', 'stage'], s];
    const notPoint: ExpressionSpecification = ['!=', ['geometry-type'], 'Point'];
    return {
      version: 8,
      glyphs: MAP_GLYPHS,
      // Dimming and weight changes cross in a quarter second, as on the hub.
      transition: { duration: 250, delay: 0 },
      sources: {
        omt: { type: 'vector', url: MAP_TILES, attribution: '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> <a href="https://www.openmaptiles.org/" target="_blank">&copy; OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>' },
        net: { type: 'geojson', data: revealed ? fullNet : collection([]) },
        lights: { type: 'geojson', data: collection([]) },
      },
      layers: [
        { id: 'bg', type: 'background', paint: { 'background-color': bg } },
        { id: 'landuse', type: 'fill', source: 'omt', 'source-layer': 'landuse', paint: { 'fill-color': land } },
        { id: 'water', type: 'fill', source: 'omt', 'source-layer': 'water', paint: { 'fill-color': water } },
        { id: 'road', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary']]], paint: { 'line-color': road, 'line-width': width(0.6, 3) } },
        { id: 'rail', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['==', ['get', 'class'], 'rail'], paint: { 'line-color': railway, 'line-width': 1, 'line-dasharray': [3, 2] } },
        { id: 'building', type: 'fill-extrusion', source: 'omt', 'source-layer': 'building', minzoom: 13, paint: { 'fill-extrusion-color': building, 'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 8], 'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0], 'fill-extrusion-opacity': 0.9 } },
        { id: 'casing', type: 'line', source: 'net', filter: notPoint, layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': bg, 'line-width': width(5, 11) } },
        // Night edition only: each line throws its own light on the ground.
        ...(dark ? [{ id: 'glow', type: 'line' as const, source: 'net', filter: notPoint, layout: { 'line-cap': 'round' as const, 'line-join': 'round' as const }, paint: { 'line-color': colourOf, 'line-width': width(10, 26), 'line-blur': width(7, 16), 'line-opacity': 0.4 } }] : []),
        { id: 'running', type: 'line', source: 'net', filter: stageIs('operational'), layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': colourOf, 'line-width': width(...WIDTHS.running) } },
        { id: 'building-line', type: 'line', source: 'net', filter: stageIs('under_construction'), layout: { 'line-join': 'round' }, paint: { 'line-color': colourOf, 'line-width': width(...WIDTHS['building-line']), 'line-dasharray': [2.2, 1.1] } },
        { id: 'approved', type: 'line', source: 'net', filter: stageIs('planned'), layout: { 'line-join': 'round' }, paint: { 'line-color': colourOf, 'line-width': width(...WIDTHS.approved), 'line-dasharray': [0.9, 1.3] } },
        { id: 'proposed', type: 'line', source: 'net', filter: stageIs('proposed'), layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': colourOf, 'line-width': width(...WIDTHS.proposed), 'line-dasharray': [0.1, 2] } },
        { id: 'stations', type: 'circle', source: 'net', filter: ['==', ['geometry-type'], 'Point'], minzoom: 11, paint: { 'circle-radius': width(1.5, 4), 'circle-color': ink, 'circle-stroke-color': bg, 'circle-stroke-width': 1.5 } },
        ...(dark ? [{ id: 'light-glow', type: 'circle' as const, source: 'lights', paint: { 'circle-radius': width(7, 14), 'circle-color': colourOf, 'circle-blur': 1, 'circle-opacity': 0.75 } }] : []),
        { id: 'light', type: 'circle', source: 'lights', paint: { 'circle-radius': width(2.6, 5), 'circle-color': light, 'circle-stroke-color': dark ? colourOf : bg, 'circle-stroke-width': 1.5 } },
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

  const markers = new Map<string, HTMLElement>();
  const paintSelection = () => {
    const isSel: ExpressionSpecification = ['==', ['get', 'line'], selected ?? ''];
    const pickOr = (on: number, off: number): ExpressionSpecification | number => (selected ? ['case', isSel, on, off] : on);
    for (const [layer, [a, b]] of Object.entries(WIDTHS)) {
      if (!map.getLayer(layer)) continue;
      map.setPaintProperty(layer, 'line-opacity', pickOr(1, 0.14));
      map.setPaintProperty(layer, 'line-width', ['interpolate', ['linear'], ['zoom'], 9, pickOr(a * (selected ? 1.7 : 1), a), 14, pickOr(b * (selected ? 1.7 : 1), b)]);
    }
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
      const id = (e.features?.[0]?.properties as { line?: string } | undefined)?.line;
      if (id) steer(id);
    });
  }

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
    map.once('styledata', paintSelection);
  };
  new MutationObserver(restyle).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', restyle);
}
