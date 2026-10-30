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
      name: info.route_short,
      ends: [line.stations[0].name, line.stations.at(-1)!.name],
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
