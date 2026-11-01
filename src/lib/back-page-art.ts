/**
 * The back page's drawing (src/components/BackPageScene.astro): an elevated metro line at dusk,
 * engraved in the paper's ink. Original illustration of a generic line, no official design.
 *
 * It ships in layers so that scrolling stays cheap on a phone:
 * - two static layers (the city, wires and near piers behind; the far piers and deck in front) are
 *   built here as SVG files, one per edition, served from /back-page/ (src/pages/back-page/). An image
 *   is rasterised once and then only composited, where an inline SVG is repainted whole whenever
 *   anything inside it moves;
 * - the road's light trails and the train stay inline (BackPageScene.astro), each its own layer, so
 *   the streaming light repaints only itself and the train moves as one composited transform.
 */
import tokensCss from '../styles/tokens.css?raw';

export const W = 1600;
export const H = 640;
export const GROUND = 560;
export const DECK_TOP = 300; // parapet top
export const DECK_BOT = 340;
export const WIRE = 204; // contact wire
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

// Seeded so every build draws the same city.
let seed = 1853;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

// ---------- The city behind: towers and older blocks, lighter as they recede ----------
type Block = { x: number; w: number; top: number; kind: 'tower' | 'block' | 'slab'; far: boolean; windows: string };
const blocks: Block[] = [];
for (const far of [true, false]) {
  let x = -20;
  while (x < W + 20) {
    const kind: Block['kind'] = rnd() < 0.34 ? 'tower' : rnd() < 0.5 ? 'slab' : 'block';
    const w = kind === 'tower' ? 44 + rnd() * 40 : kind === 'slab' ? 90 + rnd() * 80 : 60 + rnd() * 50;
    const h = far
      ? kind === 'tower' ? 250 + rnd() * 120 : 130 + rnd() * 90
      : kind === 'tower' ? 160 + rnd() * 90 : 80 + rnd() * 60;
    blocks.push({ x, w, top: GROUND - h, kind, far, windows: '' });
    x += w + (far ? 6 + rnd() * 18 : 14 + rnd() * 40);
  }
}
for (const b of blocks) {
  const rows: string[] = [];
  const step = b.kind === 'tower' ? 12 : 14;
  for (let y = b.top + 12; y < GROUND - 14; y += step) {
    for (let x = b.x + 7; x < b.x + b.w - 9; x += 10) if (rnd() < (b.far ? 0.45 : 0.7)) rows.push(`M${f(x)} ${f(y)}h4`);
  }
  b.windows = rows.join('');
}

// ---------- The viaduct: a U-girder deck on single piers with hammerhead caps ----------
const PIERS = [140, 460, 780, 1100, 1420];
const segJoints = Array.from({ length: Math.ceil(W / 80) + 1 }, (_, i) => i * 80);

// Catenary: the messenger wire sags between masts and droppers hold the contact wire level.
const SPAN = 160;
const MASTS = Array.from({ length: Math.ceil(W / SPAN) + 2 }, (_, i) => -40 + i * SPAN);
const MSG = WIRE - 18; // messenger height at a mast
const SAG = 9;
const MESSENGER = MASTS.slice(0, -1).map((x) => `M${x} ${MSG}Q${x + SPAN / 2} ${MSG + 2 * SAG} ${x + SPAN} ${MSG}`).join('');
const DROPPERS = MASTS.slice(0, -1)
  .flatMap((x) => [0.2, 0.4, 0.6, 0.8].map((t) => `M${f(x + SPAN * t)} ${f(MSG + 4 * SAG * t * (1 - t))}V${WIRE}`))
  .join('');

// ---------- Rendering the static layers ----------
const hatches = (p: Palette) => `<defs>
<pattern id="h-far" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(60)"><path d="M0 0V5" stroke="${p.ink3}" stroke-width="0.5"/></pattern>
<pattern id="h-near" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V4" stroke="${p.ink2}" stroke-width="0.7"/></pattern>
<pattern id="h-shade" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><path d="M0 0V3" stroke="${p.ink}" stroke-width="0.8"/></pattern>
<pattern id="h-cross" width="3.2" height="3.2" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><path d="M0 0V3.2M0 0H3.2" stroke="${p.ink}" stroke-width="0.8"/></pattern>
</defs>`;

const line = (p: Palette, w = 1.6) => `fill="none" stroke="${p.ink}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

const pier = (p: Palette, x: number) => {
  const cap = `M${x - 66} ${DECK_BOT}h132l-36 26h-60Z`;
  const colY = DECK_BOT + 26;
  const colH = GROUND - colY;
  return `<path d="${cap}" fill="${p.paper2}"/><path d="M${x + 8} ${DECK_BOT}h58l-36 26h-22Z" fill="url(#h-shade)"/><path d="${cap}" ${line(p)}/>`
    + `<rect x="${x - 25}" y="${colY}" width="50" height="${colH}" fill="${p.paper2}"/><rect x="${x + 4}" y="${colY}" width="21" height="${colH}" fill="url(#h-cross)"/>`
    + `<rect x="${x - 25}" y="${colY}" width="50" height="${colH}" ${line(p)}/>`
    + `<path d="M${x - 25} ${DECK_BOT + 34}h50M${x - 44} ${DECK_BOT - 6}h18v6M${x + 26} ${DECK_BOT - 6}h18v6" ${line(p, 0.9)}/>`;
};

const svg = (body: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice">${body}</svg>`;

/** Behind: the city, the overhead line and the piers the road passes in front of. */
export function backLayer(edition: Edition): string {
  const p = EDITIONS[edition];
  const city = blocks
    .map((b) => {
      const ink = b.far ? p.ink3 : p.ink2;
      const o = b.far ? 0.55 : 0.8;
      const ln = `fill="none" stroke="${ink}" stroke-width="0.9"`;
      return `<g opacity="${o}"><rect x="${f(b.x)}" y="${f(b.top)}" width="${f(b.w)}" height="${f(GROUND - b.top)}" fill="${p.paper2}"/>`
        + `<rect x="${f(b.x + b.w * 0.62)}" y="${f(b.top)}" width="${f(b.w * 0.38)}" height="${f(GROUND - b.top)}" fill="url(#${b.far ? 'h-far' : 'h-near'})"/>`
        + `<rect x="${f(b.x)}" y="${f(b.top)}" width="${f(b.w)}" height="${f(GROUND - b.top)}" ${ln}/>`
        + (b.kind === 'tower' ? `<path d="M${f(b.x + b.w * 0.3)} ${f(b.top)}v-10h${f(b.w * 0.3)}v10" ${ln}/>` : '')
        + `<path d="${b.windows}" fill="none" stroke="${ink}" stroke-width="1.4" opacity="0.5"/></g>`;
    })
    .join('');
  const ohe = MASTS.map((x) => `<path d="M${x} ${DECK_TOP}V${WIRE - 30}M${x - 4} ${MSG}h44M${x} ${WIRE - 6}l40 -6" ${line(p, 1.3)}/>`).join('')
    + `<path d="${MESSENGER}" ${line(p, 0.8)}/><path d="M-10 ${WIRE}H${W + 10}" ${line(p, 0.8)}/><path d="${DROPPERS}" ${line(p, 0.5)} opacity="0.7"/>`;
  return svg(hatches(p) + city + ohe + PIERS.filter((x) => x < 900).map((x) => pier(p, x)).join(''));
}

/** In front: the piers the road passes behind, and the deck the train runs on. */
export function frontLayer(edition: Edition): string {
  const p = EDITIONS[edition];
  const deck = `<path d="M-10 ${DECK_TOP}H${W + 10}V${DECK_BOT}H-10Z" fill="${p.paper2}"/><path d="M-10 ${DECK_TOP + 26}H${W + 10}V${DECK_BOT}H-10Z" fill="url(#h-shade)"/>`
    + `<path d="M-10 ${DECK_TOP}H${W + 10}M-10 ${DECK_TOP + 6}H${W + 10}M-10 ${DECK_BOT}H${W + 10}" ${line(p)}/>`
    + `<path d="${segJoints.map((x) => `M${x} ${DECK_TOP + 6}V${DECK_BOT}`).join('')}" ${line(p, 0.9)}/>`;
  return svg(hatches(p) + PIERS.filter((x) => x >= 900).map((x) => pier(p, x)).join('') + deck);
}

export const LAYER_FILES = ['day-back', 'night-back', 'day-front', 'night-front'] as const;
export function layerFile(name: (typeof LAYER_FILES)[number]): string {
  const [edition, layer] = name.split('-') as [Edition, 'back' | 'front'];
  return layer === 'back' ? backLayer(edition) : frontLayer(edition);
}
