/**
 * Every metro line in the Mumbai Metropolitan Region (src/data/network.json), for the hub's map and list.
 * A line the site tracks in full takes its name, figures and target from its own project.json.
 */
import networkJson from '../data/network.json';
import { getLine, lineBase, lines as trackedLines, type Grade, type LineId } from './data';

export type Stage = 'operational' | 'under_construction' | 'planned' | 'proposed' | 'future';

/** Most advanced first: a line is listed under the furthest stage any of its parts has reached. */
export const STAGES: { id: Stage; label: string; short: string }[] = [
  { id: 'operational', label: 'Running', short: 'Running' },
  { id: 'under_construction', label: 'Under construction', short: 'Building' },
  { id: 'planned', label: 'Approved, not started', short: 'Approved' },
  { id: 'proposed', label: 'Proposed', short: 'Proposed' },
  { id: 'future', label: 'Studied as an idea', short: 'Idea' },
];

export interface Fact<T> {
  value: T;
  status: Grade;
  source: string | null;
  note?: string;
}

export interface NetworkPart {
  name: string;
  stage: Stage;
  opened?: string;
  note?: string;
  status: Grade;
  source: string | null;
}

export interface NetworkLine {
  id: string;
  number: string;
  name: string;
  system?: string;
  agency?: Fact<string>;
  ends: string[];
  length: Fact<number | null>;
  stations: Fact<number | null>;
  parts: NetworkPart[];
  stage: Stage;
  colourName?: Fact<string>;
  /** CSS colour token for the map and the mark, only where a source names the line's colour. */
  colour?: string;
  /** The tracker page, for the lines the site follows in full. */
  href?: string;
  trackedId?: LineId;
}

type Raw = (typeof networkJson.lines)[number] & Record<string, unknown>;
type RawFact = { value: unknown; status: string; source_url?: string; note?: string } | undefined;
const fact = <T>(f: RawFact): Fact<T> => ({ value: (f?.value ?? null) as T, status: (f?.status ?? 'unverified') as Grade, source: f?.source_url ?? null, note: f?.note });

/** Colour tokens in src/styles/tokens.css, by the colour name a source gives. */
const TOKEN_BY_COLOUR: Record<string, string> = {
  Yellow: 'line-2b',
  Green: 'line-4',
  Pink: 'line-6',
  Red: 'net-red',
  Blue: 'net-blue',
  Aqua: 'net-aqua',
  Gold: 'net-gold',
  Orange: 'line-orange',
};

function build(raw: Raw): NetworkLine {
  const rank = (s: string) => STAGES.findIndex((x) => x.id === s);
  const tracked = raw.tracked as LineId | undefined;
  const parts = (raw.parts as Record<string, string>[]).map((p) => {
    let status = p.status as Grade;
    let source = p.source_url ?? null;
    if (tracked && p.from_tracked) {
      const f = (getLine(tracked).project as unknown as Record<string, { status: Grade; source_url: string }>)[p.from_tracked];
      status = f.status;
      source = f.source_url;
    }
    return { name: p.name, stage: p.stage as Stage, opened: p.opened, note: p.note, status, source };
  });
  const stage = parts.map((p) => p.stage).sort((a, b) => rank(a) - rank(b))[0];
  if (tracked) {
    const line = getLine(tracked);
    const info = trackedLines.find((l) => l.id === tracked)!;
    const pj = line.project as unknown as Record<string, RawFact>;
    return {
      id: raw.id,
      number: raw.number,
      // A line of another system (the Thane ring, MahaMetro) keeps its own name, so the hub does not call it "Line TR".
      name: raw.system ? (raw.name as string) : info.route_short,
      system: raw.system as string | undefined,
      ends: raw.ring ? (raw.ends as string[]) : [line.stations[0].name, line.stations.at(-1)!.name],
      length: fact(pj.length_km),
      stations: fact(pj.stations_count),
      agency: fact(pj.implementing_agency),
      parts,
      stage,
      colour: info.colour,
      href: lineBase(tracked),
      trackedId: tracked,
    };
  }
  const colourName = raw.colour_name ? fact<string>(raw.colour_name as RawFact) : undefined;
  return {
    id: raw.id,
    number: raw.number,
    name: raw.name as string,
    system: raw.system as string | undefined,
    agency: fact(raw.agency as RawFact),
    ends: raw.ends as string[],
    length: fact(raw.length_km as RawFact),
    stations: fact(raw.stations as RawFact),
    parts,
    stage,
    colourName,
    colour: colourName ? TOKEN_BY_COLOUR[colourName.value] : undefined,
  };
}

export const network: NetworkLine[] = (networkJson.lines as Raw[]).map(build);
export const networkReviewed: string = networkJson._meta.last_reviewed;

export const byStage = STAGES.map((s) => ({ ...s, lines: network.filter((l) => l.stage === s.id) }));

/** Stages the map draws. "Studied as an idea" is listed, never drawn, and never sets the map's frame. */
export const DRAWN_STAGES: Stage[] = ['operational', 'under_construction', 'planned', 'proposed'];

/** The drawn network as plain SVG geometry, for the front page's first paint before the street map loads
 *  (and its whole picture without JavaScript). Web Mercator, like the street map, over the same bounds. */
export function networkDrawing(geometry: GeoJSON.FeatureCollection, width = 1000) {
  const pieces: { line: string; stage: Stage; coords: number[][] }[] = [];
  for (const f of geometry.features) {
    const p = f.properties as { line: string; stage?: Stage };
    if (!p.stage || !DRAWN_STAGES.includes(p.stage)) continue;
    const g = f.geometry;
    const lines = g.type === 'LineString' ? [g.coordinates] : g.type === 'MultiLineString' ? g.coordinates : [];
    for (const coords of lines) pieces.push({ line: p.line, stage: p.stage, coords: coords as number[][] });
  }
  const merc = ([lng, lat]: number[]) => [lng, Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) * (180 / Math.PI)];
  const all = pieces.flatMap((p) => p.coords.map(merc));
  const x0 = Math.min(...all.map((c) => c[0]));
  const x1 = Math.max(...all.map((c) => c[0]));
  const y0 = Math.min(...all.map((c) => c[1]));
  const y1 = Math.max(...all.map((c) => c[1]));
  const k = width / (x1 - x0);
  const height = Math.round((y1 - y0) * k);
  const xy = (c: number[]) => {
    const [x, y] = merc(c);
    return [(x - x0) * k, (y1 - y) * k];
  };
  // Every third vertex is plenty at this scale; the last one keeps each end exact.
  const paths = pieces.map((p) => ({
    line: p.line,
    stage: p.stage,
    d: [...p.coords.filter((_, i) => i % 3 === 0), p.coords.at(-1)!].map((c, i) => `${i ? 'L' : 'M'}${xy(c).map((v) => v.toFixed(1)).join(' ')}`).join(''),
  }));
  // One label per line: its drawn vertex nearest the centre of its drawn vertices (as on the street map).
  const labels = [...new Set(pieces.map((p) => p.line))].map((line) => {
    const cs = pieces.filter((p) => p.line === line).flatMap((p) => p.coords.map(xy));
    const cx = cs.reduce((t, c) => t + c[0], 0) / cs.length;
    const cy = cs.reduce((t, c) => t + c[1], 0) / cs.length;
    const at = cs.reduce((m, c) => (Math.hypot(c[0] - cx, c[1] - cy) < Math.hypot(m[0] - cx, m[1] - cy) ? c : m), cs[0]);
    return { line, x: at[0], y: at[1] };
  });
  const bounds: [[number, number], [number, number]] = [
    [Math.min(...pieces.flatMap((p) => p.coords.map((c) => c[0]))), Math.min(...pieces.flatMap((p) => p.coords.map((c) => c[1])))],
    [Math.max(...pieces.flatMap((p) => p.coords.map((c) => c[0]))), Math.max(...pieces.flatMap((p) => p.coords.map((c) => c[1])))],
  ];
  return { width, height, paths, labels, bounds };
}

/**
 * The bundle's colours: one per primary line with a sourced colour, in line-number order, each colour
 * once. A branch (2A, 7A, 12A) shares its primary line's colour, and a line that repeats an earlier
 * line's colour (12 is Line 5's orange) adds none. The hub's bundle and the colophon's light trails use it.
 */
export const bundleColours: string[] = (() => {
  const primary = new Map<string, string>();
  for (const l of network) {
    // Numbered lines only: the Thane ring ("TR") is another system and adds no stroke.
    if (!/^\d/.test(l.number)) continue;
    const base = l.number.replace(/[A-Z]+$/, '');
    if (l.colour && !primary.has(base)) primary.set(base, l.colour);
  }
  return [...new Set(primary.values())];
})();
