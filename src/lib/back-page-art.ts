/**
 * The back page's drawing (src/components/BackPageScene.astro): an elevated metro line at dusk,
 * engraved in the paper's ink. Original illustration of a generic line, no official design.
 *
 * It ships in layers so that scrolling stays cheap on a phone:
 * - the static layers (the sky, city and wires behind; the road's ribbons of light; the piers and deck
 *   in front) are built here as SVG files, one per edition, served from /back-page/
 *   (src/pages/back-page/). An image is rasterised once and then only composited, where an inline SVG
 *   is repainted whole whenever anything inside it moves;
 * - only what moves stays inline (BackPageScene.astro): the eight cores that draw in once, the two
 *   veils that make the light stream (masks from this file, moved with a transform) and the train.
 *   After the arrival, nothing on the page repaints for this drawing.
 *
 * The engraving is ruled stroke by stroke (no pattern fills), each stroke a little off, as a hand
 * rules a plate. The scale is about 10 units to the metre: a car is 216 long, a span is 280.
 */
import tokensCss from '../styles/tokens.css?raw';
import { bundleColours } from './network';

export const W = 1600;
export const H = 640;
export const HORIZON = 520; // where the city meets the ground
export const GROUND = 560; // the piers' feet, on the median under the viaduct
export const DECK_TOP = 318; // parapet top
export const DECK_BOT = 346; // soffit
export const WIRE = 248; // contact wire
export const f = (n: number) => +n.toFixed(1);

// ---------- The paper's two editions, read from tokens.css so the files never drift from the page ----------
type Palette = { paper2: string; ink: string; ink2: string; ink3: string };
const tokenIn = (block: string, name: string) => block.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,8})`))?.[1];
const dayBlock = tokensCss.slice(tokensCss.indexOf(':root'));
const nightBlock = tokensCss.slice(tokensCss.indexOf('prefers-color-scheme: dark'));
const palette = (block: string): Palette => ({
  paper2: tokenIn(block, 'paper-2') ?? '#e5ddcf',
  ink: tokenIn(block, 'ink') ?? '#111a28',
  ink2: tokenIn(block, 'ink-2') ?? '#4a453e',
  ink3: tokenIn(block, 'ink-3') ?? '#5f584f',
});
export const EDITIONS = { day: palette(dayBlock), night: palette(nightBlock) } as const;
export type Edition = keyof typeof EDITIONS;
/** A lit window on night paper: the same warm light as the train's saloon. */
export const LIT = '#f0b860';

// Seeded so every build draws the same city.
let seed = 1853;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const between = (a: number, b: number) => a + rnd() * (b - a);

// ---------- The engraver's strokes ----------
const box = (x: number, y: number, w: number, h: number) => `M${f(x)} ${f(y)}h${f(w)}v${f(h)}h${f(-w)}Z`;

/** Rule a rectangle with parallel strokes at `deg`, about `gap` apart. Each stroke starts and stops a
 *  little off the edge, and the gaps vary, so the tone reads as ruled by hand. */
function rule(x: number, y: number, w: number, h: number, deg: number, gap: number): string {
  const a = (deg * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const nx = -dy;
  const ny = dx;
  const ds = [x * nx + y * ny, (x + w) * nx + y * ny, x * nx + (y + h) * ny, (x + w) * nx + (y + h) * ny];
  const hi = Math.max(...ds);
  let out = '';
  for (let d = Math.min(...ds) + gap * rnd(); d < hi; d += gap * between(0.82, 1.18)) {
    const px = nx * d;
    const py = ny * d;
    let t0 = -1e6;
    let t1 = 1e6;
    if (Math.abs(dx) > 1e-6) {
      const p = (x - px) / dx;
      const q = (x + w - px) / dx;
      t0 = Math.max(t0, Math.min(p, q));
      t1 = Math.min(t1, Math.max(p, q));
    } else if (px < x || px > x + w) continue;
    if (Math.abs(dy) > 1e-6) {
      const p = (y - py) / dy;
      const q = (y + h - py) / dy;
      t0 = Math.max(t0, Math.min(p, q));
      t1 = Math.min(t1, Math.max(p, q));
    } else if (py < y || py > y + h) continue;
    t0 += rnd() * 1.4;
    t1 -= rnd() * 1.4;
    if (t1 - t0 < 2) continue;
    out += `M${f(px + dx * t0)} ${f(py + dy * t0)}l${f(dx * (t1 - t0))} ${f(dy * (t1 - t0))}`;
  }
  return out;
}

/** A horizontal stroke with a few lifts of the tool. */
function broken(x0: number, x1: number, y: number, run: [number, number], lift: [number, number]): string {
  let out = '';
  for (let x = x0; x < x1; ) {
    const len = Math.min(between(...run), x1 - x);
    if (len > 2) out += `M${f(x)} ${f(y)}h${f(len)}`;
    x += len + between(...lift);
  }
  return out;
}

// ---------- The sky: ruled lines, close at the horizon and open above, with bands of cloud left bare ----------
const DISC = { x: 1238, y: 148, r: 31 }; // a low sun on morning paper, the moon on night paper
const CLOUDS = [
  { x: 330, y: 116, rx: 250, ry: 15 },
  { x: 610, y: 172, rx: 190, ry: 10 },
  { x: 1010, y: 92, rx: 230, ry: 13 },
  { x: 1420, y: 206, rx: 220, ry: 12 },
  { x: 90, y: 236, rx: 170, ry: 9 },
  { x: 1180, y: 262, rx: 150, ry: 7 },
];
let SKY = '';
for (let y = HORIZON - 6, gap = 3; y > 22; y -= gap, gap *= 1.034) {
  // Bare spans on this line: the clouds and the disc.
  const bare = [...CLOUDS, { ...DISC, rx: DISC.r + 5, ry: DISC.r + 5 }]
    .filter((c) => Math.abs(y - c.y) < c.ry)
    .map((c) => {
      const half = c.rx * Math.sqrt(1 - ((y - c.y) / c.ry) ** 2) * between(0.9, 1.05);
      return [c.x - half, c.x + half];
    });
  const fade = Math.min(1, (y - 22) / 150); // the ruling thins out towards the top of the plate
  for (let x = -10; x < W + 10; ) {
    const len = between(120, 520) * (0.3 + 0.7 * fade);
    const x1 = Math.min(x + len, W + 10);
    const hit = bare.find(([a, b]) => x1 > a && x < b);
    if (!hit) {
      if (rnd() < 0.25 + 0.75 * fade) SKY += `M${f(x)} ${f(y)}h${f(x1 - x)}`;
      x = x1 + between(3, 14) / (0.25 + 0.75 * fade);
    } else {
      if (hit[0] - x > 8) SKY += `M${f(x)} ${f(y)}h${f(hit[0] - x)}`;
      x = hit[1] + rnd() * 8;
    }
  }
}
let STARS = '';
for (let i = 0; i < 70; i++) {
  const x = between(0, W);
  const y = 14 + rnd() ** 1.6 * 230;
  if (Math.hypot(x - DISC.x, y - DISC.y) > DISC.r + 14) STARS += `M${f(x)} ${f(y)}h.1`;
}

// ---------- The city: three planes of towers and older blocks, lighter as they recede ----------
type Plane = {
  fill: string; // paper under each building, so it hides what stands behind
  edge: string; // outlines
  fine: string; // corner edges, floors, mullions
  tone: string; // ruled shade
  glass: string; // windows
  lit: string; // the windows that are lit on night paper
};
const newPlane = (): Plane => ({ fill: '', edge: '', fine: '', tone: '', glass: '', lit: '' });
const FAR = newPlane();
const MID = newPlane();
const NEAR = newPlane();
let TREES = '';

/** A tower crane on a building site. */
function crane(P: Plane, x: number, foot: number, top: number, reach: number) {
  let mast = `M${f(x - 2.5)} ${f(foot)}V${f(top)}M${f(x + 2.5)} ${f(foot)}V${f(top)}`;
  for (let y = foot; y > top + 8; y -= 8) mast += `M${f(x - 2.5)} ${f(y)}l5 -4l-5 -4`;
  const jib = top + 4;
  const tip = x + reach;
  const back = x - Math.sign(reach) * 34;
  let truss = `M${f(back)} ${f(jib)}H${f(tip)}M${f(x)} ${f(jib - 4)}H${f(tip)}`;
  for (let k = 8; k < Math.abs(reach) - 4; k += 8) truss += `M${f(x + Math.sign(reach) * k)} ${f(jib)}l${f(Math.sign(reach) * 4)} -4l${f(Math.sign(reach) * 4)} 4`;
  const trolley = x + reach * 0.62;
  P.edge += mast + truss
    + `M${f(x)} ${f(top - 16)}L${f(tip - Math.sign(reach) * 10)} ${f(jib - 4)}M${f(x)} ${f(top - 16)}L${f(back)} ${f(jib)}M${f(x)} ${f(top)}V${f(top - 16)}`
    + `M${f(trolley)} ${f(jib)}v${f(between(26, 52))}`;
  P.edge += box(Math.min(back, back + Math.sign(reach) * 9), jib, 9, 7) + box(x - 4, top, 8, 7);
}

function building(P: Plane, x: number, w: number, h: number, kind: 'glass' | 'block' | 'slab' | 'old' | 'site', deg: number, gap: number, litShare: number) {
  const top = HORIZON - h;
  const R = x + w;
  P.fill += box(x, top, w, h);
  const window = (wx: number, wy: number, len: number, tall = false) => {
    const d = tall ? `M${f(wx)} ${f(wy)}v${f(len)}` : `M${f(wx)} ${f(wy)}h${f(len)}`;
    if (rnd() < litShare) P.lit += d;
    else P.glass += d;
  };

  if (kind === 'site') {
    // A frame still going up: slabs and columns, open to the sky, with its crane.
    P.edge += `M${f(x)} ${HORIZON}V${f(top)}M${f(R)} ${HORIZON}V${f(top + 18)}`;
    for (let y = top; y < HORIZON - 6; y += 11) P.fine += `M${f(x)} ${f(y)}H${f(y < top + 18 ? R - w * 0.35 : R)}`;
    for (let cx = x + 12; cx < R - 4; cx += 13) P.fine += `M${f(cx)} ${f(top + (cx > R - w * 0.35 ? 18 : 0))}V${HORIZON}`;
    P.tone += rule(x, top + h * 0.45, w, h * 0.55, deg, gap * 1.5);
    crane(P, x + w * 0.3, top + 30, top - between(58, 80), between(78, 104));
    return;
  }

  // The crown.
  if (kind === 'glass' || (kind === 'block' && rnd() < 0.4)) {
    if (rnd() < 0.6) {
      const sw = w * between(0.45, 0.72);
      const sx = x + (w - sw) * rnd();
      const sh = between(10, 30);
      P.fill += box(sx, top - sh, sw, sh);
      P.edge += `M${f(sx)} ${f(top)}v${f(-sh)}h${f(sw)}v${f(sh)}`;
      P.tone += rule(sx + sw * 0.6, top - sh, sw * 0.4, sh, deg, gap);
      if (rnd() < 0.7) P.fine += `M${f(sx + sw * between(0.3, 0.7))} ${f(top - sh)}v${f(-between(12, 34))}`;
    } else {
      const tx = x + w * between(0.15, 0.55);
      P.edge += `M${f(tx)} ${f(top)}v-4m9 4v-4M${f(tx - 2)} ${f(top - 4)}v-7h13v7Z`;
    }
  }
  if (kind === 'old') {
    if (rnd() < 0.55) {
      // A pitched tile roof, ruled along its courses.
      const rh = between(9, 16);
      const ridge = w * between(0.18, 0.3);
      P.fill += `M${f(x - 3)} ${f(top)}L${f(x + ridge)} ${f(top - rh)}H${f(R - ridge)}L${f(R + 3)} ${f(top)}Z`;
      P.edge += `M${f(x - 3)} ${f(top)}L${f(x + ridge)} ${f(top - rh)}H${f(R - ridge)}L${f(R + 3)} ${f(top)}Z`;
      for (let k = 2.5; k < rh; k += 2.6) {
        const inset = (ridge + 3) * (k / rh) - 3;
        P.tone += broken(x + inset + 1, R - inset - 1, top - k, [14, 40], [1.5, 5]);
      }
    } else {
      // A flat roof with a water tank on legs.
      const tx = x + w * between(0.2, 0.6);
      P.edge += `M${f(tx)} ${f(top)}v-5m10 5v-5M${f(tx - 2)} ${f(top - 5)}v-8h14v8Z`;
      P.fine += `M${f(x)} ${f(top + 3)}H${f(R)}`;
    }
  }

  P.edge += `M${f(x)} ${HORIZON}V${f(top)}H${f(R)}V${HORIZON}`;
  // The shade side, and the corner where the two faces meet.
  const shade = w * between(0.28, 0.42);
  const face = R - shade;
  P.tone += rule(face, top, shade, h, deg, gap);
  P.fine += `M${f(face)} ${f(top)}V${HORIZON}`;

  if (kind === 'glass') {
    // A curtain wall: mullions the full height, a tick at every floor.
    for (let mx = x + between(5, 8); mx < face - 3; mx += between(6.5, 9)) P.fine += `M${f(mx)} ${f(top + 3)}V${HORIZON}`;
    for (let y = top + 9; y < HORIZON - 4; y += 9) if (rnd() < 0.85) P.glass += `M${f(x + 2)} ${f(y)}H${f(face - 2)}`;
    for (let y = top + 9; y < HORIZON - 4; y += 9) if (rnd() < litShare * 1.5) P.lit += `M${f(between(x + 3, face - 12))} ${f(y - 4)}h${f(between(5, 9))}`;
  } else if (kind === 'slab') {
    // Flats: a balcony line at every floor, windows under it.
    for (let y = top + 8; y < HORIZON - 5; y += 10.5) {
      P.fine += broken(x + 2, face - 2, y, [18, 46], [1, 3]);
      for (let wx = x + 5; wx < face - 6; wx += 8.5) if (rnd() < 0.6) window(wx, y + 4.2, 4);
    }
  } else if (kind === 'old') {
    // Tall shuttered windows over a sill line.
    for (let y = top + 7; y < HORIZON - 9; y += 15) {
      P.fine += `M${f(x + 2)} ${f(y + 8.5)}H${f(face - 2)}`;
      for (let wx = x + 5; wx < face - 3; wx += 7.5) if (rnd() < 0.8) window(wx, y, 6.5, true);
    }
  } else {
    for (let y = top + 9; y < HORIZON - 6; y += 11.5) for (let wx = x + 5; wx < face - 5; wx += 8) if (rnd() < 0.62) window(wx, y, 3.6);
  }
}

/** A coconut palm: a leaning trunk and a crown of drooping fronds. */
function palm(x: number, foot: number, h: number) {
  const lean = between(-9, 9);
  const cx = x + lean;
  const cy = foot - h;
  TREES += `M${f(x)} ${f(foot)}Q${f(x + lean * 0.2)} ${f(foot - h * 0.55)} ${f(cx)} ${f(cy)}`;
  for (let k = 0; k < 8; k++) {
    const a = -Math.PI * (0.04 + (k / 7) * 0.92) + between(-0.08, 0.08);
    const len = between(13, 19);
    const ex = cx + Math.cos(a) * len;
    const ey = cy + Math.sin(a) * len * 0.7 + len * 0.42;
    TREES += `M${f(cx)} ${f(cy)}Q${f(cx + Math.cos(a) * len * 0.7)} ${f(cy + Math.sin(a) * len * 0.95)} ${f(ex)} ${f(ey)}`;
  }
}

// The far plane: tall and close-set, ruled upright and open.
for (let x = -24; x < W + 20; ) {
  const tall = rnd() < 0.56;
  const w = tall ? between(34, 64) : between(54, 104);
  const h = tall ? between(262, 432) : between(150, 262);
  building(FAR, x, w, h, tall ? 'glass' : rnd() < 0.5 ? 'slab' : 'block', 90, 3.6, 0.05);
  x += w + between(2, 16);
}
// The middle plane: a few towers, two of them still building sites, and long blocks of flats.
const SITES = [between(360, 430), between(1040, 1110)];
for (let x = -10; x < W + 20; ) {
  const site = SITES.find((s) => s >= x && s < x + 70);
  const tall = !site && rnd() < 0.34;
  const w = site ? 58 : tall ? between(40, 60) : between(70, 132);
  const h = site ? between(300, 326) : tall ? between(190, 318) : between(84, 150);
  building(MID, x, w, h, site ? 'site' : tall ? (rnd() < 0.5 ? 'glass' : 'block') : rnd() < 0.55 ? 'slab' : 'block', 58, 3.1, 0.09);
  x += w + between(12, 58);
}
// The near plane: the older city, low, with trees in its gaps.
for (let x = -30; x < W + 20; ) {
  const kind = rnd() < 0.5 ? 'old' : rnd() < 0.5 ? 'block' : 'slab';
  const w = kind === 'old' ? between(46, 84) : between(52, 96);
  const h = kind === 'old' ? between(30, 62) : between(52, 112);
  building(NEAR, x, w, h, kind, 42, 2.5, 0.14);
  const lot = rnd() < 0.42 ? between(34, 70) : between(2, 12);
  if (lot > 30) {
    palm(x + w + lot * 0.3, HORIZON, between(48, 76));
    if (rnd() < 0.7) palm(x + w + lot * 0.62, HORIZON, between(38, 60));
    if (rnd() < 0.3) palm(x + w + lot * 0.85, HORIZON, between(30, 46));
  }
  x += w + lot;
}

// ---------- The ground: the horizon, a few strokes of road surface, and the median under the viaduct ----------
const JUNCTION = [430, 1210]; // the road crosses the median here
let GROUND_STROKES = '';
for (let y = HORIZON + 7, gap = 5; y < H; y += gap, gap *= 1.32) GROUND_STROKES += broken(-10 - rnd() * 200, W + 10, y, [90, 320], [120, 420]);
const median = (x0: number, x1: number) => `M${x0} ${GROUND}H${x1}` + broken(x0, x1, GROUND + 3.5, [70, 240], [3, 10]);
const MEDIAN_NEAR = median(-10, JUNCTION[0]);
const MEDIAN_FAR = median(JUNCTION[1], W + 10);

// ---------- The viaduct: a U-girder deck on single piers with hammerhead caps ----------
const SPAN = 280;
const PIERS = [100, 380, 660, 940, 1220, 1500];

// Catenary: masts on the far parapet, a messenger wire that sags between their arms, droppers down to
// a level contact wire.
const BAY = 200;
const ARM = 26;
const MASTS = Array.from({ length: Math.ceil(W / BAY) + 2 }, (_, i) => -140 + i * BAY);
const MSG = WIRE - 15; // messenger height at an arm
const SAG = 8;
const MESSENGER = MASTS.slice(0, -1).map((x) => `M${x + ARM} ${MSG}q${BAY / 2} ${2 * SAG} ${BAY} 0`).join('');
const DROPPERS = MASTS.slice(0, -1)
  .flatMap((x) => [0.14, 0.32, 0.5, 0.68, 0.86].map((t) => `M${f(x + ARM + BAY * t)} ${f(MSG + 4 * SAG * t * (1 - t))}V${WIRE}`))
  .join('');
const MAST = MASTS.map((x) =>
  // The post, its top tube and stay, the insulators, and the arm that holds the contact wire.
  `M${x - 1.6} ${DECK_TOP}V${MSG - 12}h3.2V${DECK_TOP}`
  + `M${x + 1.6} ${MSG}H${x + ARM + 3}M${x + 1.6} ${WIRE + 16}L${x + ARM} ${MSG}M${x + 1.6} ${WIRE + 5}L${x + ARM - 5} ${WIRE - 1.5}`
  + `M${x + 7} ${MSG - 2.5}v5M${x + 9.5} ${MSG - 2.5}v5M${x + ARM - 5} ${WIRE - 1.5}V${WIRE}`,
).join('');

const stroke = (c: string, w: number, o = 1) => `fill="none" stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"${o < 1 ? ` opacity="${o}"` : ''}`;

// Each pier is ruled once, when the module loads, so both editions print the same strokes.
type Pier = { x: number; solid: string; tone: string; fine: string; edge: string; thin: string };
const PIER_ART: Pier[] = PIERS.map((x) => {
  const y0 = DECK_BOT + 5; // cap top, under the bearings
  const neck = y0 + 36; // where the cap meets the column
  const foot = GROUND - 9;
  const cap = `M${x - 46} ${y0}H${x + 46}v9Q${x + 19} ${y0 + 14} ${x + 13} ${neck}H${x - 13}Q${x - 19} ${y0 + 14} ${x - 46} ${y0 + 9}Z`;
  const column = `M${x - 13} ${neck}V${foot}H${x + 13}V${neck}`;
  const plinth = `M${x - 20} ${GROUND}v-6l4 -3h32l4 3v6Z`;
  const bearings = box(x - 37, DECK_BOT, 12, 5) + box(x + 25, DECK_BOT, 12, 5);
  // Tone. The column is round: upright strokes close up towards the shade side. The deck's shadow
  // lies across its top, and the cap is ruled under its lip.
  let tone = '';
  for (const o of [10.5, 14.5, 17.5, 19.8, 21.6, 23, 24.2]) tone += `M${f(x - 13 + o)} ${f(neck + rnd() * 5)}V${f(foot - rnd() * 4)}`;
  let fine = `M${f(x - 10.4)} ${f(neck + 22)}V${f(foot - 12)}`;
  for (let y = neck + 2, gap = 2.2; y < neck + 34; y += gap, gap *= 1.3) tone += `M${f(x - 12 + rnd() * 2)} ${f(y)}H${f(x + 12)}`;
  for (const [dy, reach] of [[3, 44], [6, 43], [10.5, 30], [14, 21.5], [18, 18], [22.5, 16], [27, 14.6], [31.5, 13.6]]) tone += `M${f(x + 3 + rnd() * 3)} ${y0 + dy}H${f(x + reach)}`;
  for (let y = neck + 58; y < foot - 20; y += 46) fine += `M${x - 13} ${f(y)}h26`; // formwork lifts
  fine += [0, 3, 6.5].map((dy, k) => `M${f(x + 16 - k * 3)} ${GROUND + 2.5 + dy}h${f(34 + k * 9 + rnd() * 8)}`).join(''); // cast shadow
  return { x, solid: `${cap}${column}Z${plinth}${bearings}`, tone, fine, edge: `${cap}${column}${plinth}`, thin: `${bearings}M${x - 16} ${GROUND - 9}h32` };
});
const MOON_TONE = rule(DISC.x - 4, DISC.y - 22, 30, 50, 62, 3.4);

const pier = (p: Palette, a: Pier) =>
  `<path d="${a.solid}" fill="${p.paper2}"/><path d="${a.tone}" ${stroke(p.ink, 0.7, 0.85)}/><path d="${a.fine}" ${stroke(p.ink, 0.5, 0.7)}/>`
  + `<path d="${a.edge}" ${stroke(p.ink, 1.35)}/><path d="${a.thin}" ${stroke(p.ink, 0.8)}/>`;

const svg = (body: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice">${body}</svg>`;

/** Behind: the sky, the city, and the overhead line. */
export function backLayer(edition: Edition): string {
  const p = EDITIONS[edition];
  const night = edition === 'night';
  const plane = (P: Plane, ink: string, o: number, edge: number, tone: number, glass: number) =>
    `<g opacity="${o}"><path d="${P.fill}" fill="${p.paper2}"/><path d="${P.tone}" ${stroke(ink, tone)}/><path d="${P.fine}" ${stroke(ink, edge * 0.55, 0.8)}/>`
    + `<path d="${P.glass}" fill="none" stroke="${ink}" stroke-width="${glass}" opacity="0.62"/>`
    + `<path d="${P.lit}" fill="none" stroke="${night ? LIT : ink}" stroke-width="${glass}" opacity="${night ? 0.95 : 0.62}"/>`
    + `<path d="${P.edge}" ${stroke(ink, edge)}/></g>`;
  const sky = `<path d="${SKY}" ${stroke(p.ink3, 0.5, night ? 0.42 : 0.5)}/>`
    + (night
      ? `<path d="${STARS}" ${stroke(p.ink, 1.5, 0.6)}/><circle cx="${DISC.x}" cy="${DISC.y}" r="${DISC.r}" fill="${p.ink}" opacity="0.9"/>`
        + `<path d="${MOON_TONE}" ${stroke(p.paper2, 0.6, 0.35)}/>`
      : `<circle cx="${DISC.x}" cy="${DISC.y}" r="${DISC.r}" ${stroke(p.ink3, 0.8, 0.8)}/>`);
  const city = plane(FAR, p.ink3, 0.5, 0.8, 0.45, 1.5) + plane(MID, p.ink2, 0.72, 0.95, 0.55, 1.7) + plane(NEAR, p.ink, 0.82, 1.05, 0.6, 1.5)
    + `<path d="${TREES}" ${stroke(p.ink, 0.8, 0.82)}/>`;
  const ground = `<path d="M-10 ${HORIZON}H${W + 10}" ${stroke(p.ink, 1)}/><path d="${GROUND_STROKES}" ${stroke(p.ink3, 0.6, 0.6)}/>`
    + `<path d="${MEDIAN_NEAR}${MEDIAN_FAR}" ${stroke(p.ink, 0.8, 0.85)}/>`;
  const ohe = `<path d="${MAST}" ${stroke(p.ink, 0.9)}/><path d="${MESSENGER}M-10 ${WIRE}H${W + 10}" ${stroke(p.ink, 0.75)}/><path d="${DROPPERS}" ${stroke(p.ink, 0.45, 0.8)}/>`;
  return svg(sky + city + ground + ohe);
}

// The deck's web, ruled closer towards the soffit, and its joints.
let WEB = '';
for (let y = DECK_TOP + 11, gap = 4.2; y < DECK_BOT - 6.5; y += gap, gap *= 0.8) WEB += broken(-10, W + 10, y, [60, 260], [2, 9]);
let JOINTS = '';
for (let x = PIERS[0] - SPAN; x < W + SPAN; x += SPAN) {
  JOINTS += `M${x - 1.5} ${DECK_TOP}V${DECK_BOT}M${x + 1.5} ${DECK_TOP}V${DECK_BOT}`;
  for (let k = 1; k < 8; k++) JOINTS += `M${x + (SPAN / 8) * k} ${DECK_TOP + 5.5}V${DECK_BOT - 5}`;
}

/** In front: the piers, which the road passes behind or below, and the deck the train runs on. */
export function frontLayer(edition: Edition): string {
  const p = EDITIONS[edition];
  const deck = `<path d="${box(-10, DECK_TOP, W + 20, DECK_BOT - DECK_TOP)}" fill="${p.paper2}"/>`
    + `<path d="${WEB}" ${stroke(p.ink, 0.6, 0.8)}/><path d="${JOINTS}" ${stroke(p.ink, 0.5, 0.75)}/>`
    + `<path d="M-10 ${DECK_TOP + 5.5}H${W + 10}M-10 ${DECK_BOT - 5}H${W + 10}" ${stroke(p.ink, 0.7)}/>`
    + `<path d="M-10 ${DECK_TOP}H${W + 10}M-10 ${DECK_BOT}H${W + 10}" ${stroke(p.ink, 1.5)}/>`;
  return svg(PIER_ART.map((a) => pier(p, a)).join('') + deck);
}

// ---------- The road: a long exposure of the traffic, one ribbon of light for each line colour ----------
// The road comes out of the distance on the right as a hairline, passes under the viaduct and opens
// towards the reader, until its near lanes leave the foot of the plate. Every stroke is a filled
// ribbon between two lines of the road, so it swells with the perspective as a real trail of light does.
export const ROAD_Y = 514;
export const ROAD_H = H - ROAD_Y;
const N = bundleColours.length;
// Two cubic curves: the x of each control point, the road's middle there, and one band's width there.
const RX = [-80, 240, 560, 880, 1200, 1450, 1700];
const RC = [719.2, 614.7, 609.9, 571.6, 533.3, 536.5, 525.6];
const RS = [37.8, 9.3, 13.2, 7.1, 1.0, 1.7, 0.9];
const at = (i: number, o: number) => `${RX[i]} ${f(RC[i] + o * RS[i])}`;
/** A line along the road, `o` bands from its middle. */
export const roadLine = (o: number) => `M${at(0, o)}C${at(1, o)} ${at(2, o)} ${at(3, o)}C${at(4, o)} ${at(5, o)} ${at(6, o)}`;
/** The middle of band `k`. */
export const bandMiddle = (k: number) => k - (N - 1) / 2;
const ribbon = (a: number, b: number) => `${roadLine(a)}L${at(6, b)}C${at(5, b)} ${at(4, b)} ${at(3, b)}C${at(2, b)} ${at(1, b)} ${at(0, b)}Z`;

type Strand = { d: string; o: number };
const BANDS = bundleColours.map((token, k) => {
  const m = bandMiddle(k) + between(-0.03, 0.03);
  // A band is a sheaf of filaments, as a long exposure draws one for every lamp that passed: a strong
  // one near the middle, and finer and fainter ones out to the band's edges, with paper between them.
  const half = between(0.05, 0.075);
  const main = ribbon(m - half, m + half);
  const near: Strand[] = [];
  const far: Strand[] = [];
  for (const side of [-1, 1]) {
    for (let o = half + between(0.022, 0.04), n = 0; o < 0.46; n++) {
      const w = between(0.008, 0.05) * (1 - o * 0.8);
      const strand = { d: ribbon(m + side * o, m + side * (o + w)), o: between(0.5, 1) * (1 - o * 0.6) };
      (n % 2 ? near : far).push(strand);
      o += w + between(0.018, 0.05);
    }
  }
  const sparks = [-1, 1].map((side) => roadLine(m + side * between(0.2, 0.44)));
  return { colour: tokenIn(dayBlock, token) ?? '#888888', m, main, near, far, sparks };
});
const SPARK_DASH = ['2 9 26 6 3 14', '1 6 9 4 32 8', '14 5 2 12 40 9', '3 7 18 4 1 11'];

const roadSvg = (body: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${ROAD_Y} ${W} ${ROAD_H}" preserveAspectRatio="none">${body}</svg>`;

/** The road's light: for each colour a wash, the sheaf of filaments, sparks, and a white-hot line in the strongest one. */
export function roadLayer(edition: Edition): string {
  const night = edition === 'night';
  return roadSvg(
    BANDS.map((b, k) =>
      `<g fill="${b.colour}"><path d="${ribbon(b.m - 0.5, b.m + 0.5)}" opacity="${night ? 0.2 : 0.13}"/>`
      + (night ? `<path d="${ribbon(b.m - 0.3, b.m + 0.3)}" opacity="0.22"/>` : '')
      + [...b.near, ...b.far].map((s) => `<path d="${s.d}" opacity="${Math.min(1, s.o * (night ? 1 : 1.7)).toFixed(2)}"/>`).join('')
      + (night ? '' : `<path d="${ribbon(b.m - 0.13, b.m + 0.13)}" opacity="0.8"/>`)
      + `<path d="${b.main}"/></g>`
      + b.sparks.map((d, j) => `<path d="${d}" fill="none" stroke="${b.colour}" stroke-width="0.9" stroke-linecap="round" stroke-dasharray="${SPARK_DASH[(k + j * 2) % 4]}" opacity="0.7"/>`).join('')
      + `<path d="${roadLine(b.m - 0.012)}" fill="none" stroke="#fff" stroke-width="0.7" opacity="${night ? 0.7 : 0.34}"/>`,
    ).join(''),
  );
}

/** The masks of the two veils. Each band's filaments are dealt into two hands: the light of one hand
 *  (with the strongest filament) streams towards the reader, the other away. A veil shows only inside
 *  its mask. */
export const flowMask = (which: 'near' | 'far') =>
  roadSvg(`<path d="${BANDS.map((b) => (which === 'near' ? b.main : '') + b[which].map((s) => s.d).join('')).join('')}"/>`);

export const LAYER_FILES = ['day-back', 'night-back', 'day-road', 'night-road', 'flow-near', 'flow-far', 'day-front', 'night-front'] as const;
export function layerFile(name: (typeof LAYER_FILES)[number]): string {
  const [edition, layer] = name.split('-') as [string, string];
  if (edition === 'flow') return flowMask(layer as 'near' | 'far');
  return layer === 'back' ? backLayer(edition as Edition) : layer === 'road' ? roadLayer(edition as Edition) : frontLayer(edition as Edition);
}
