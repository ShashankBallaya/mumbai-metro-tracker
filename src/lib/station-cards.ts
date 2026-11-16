/**
 * The stations on the hub map, for their names and cards (src/scripts/station-card.ts):
 *   - every tracked line's own stations, from its stations.json, with a station page;
 *   - every running line without a tracker (Lines 1, 2A, 3, 7, Navi Mumbai Line 1), from OpenStreetMap
 *     (src/data/open-stations.json, scripts/build-open-stations.py), linking to the line's record on the hub.
 * Only public, sourced fields, kept short: the card links on for the rest.
 */
import { lines, getLine, isOpen, changesFor, stationHref, type LineId } from './data';
import { network } from './network';
import openStations from '../data/open-stations.json';

export interface StationCard {
  /** "<line id>/<station id>" */
  id: string;
  line: string;
  label: string;
  /** The line's mark, as on the map: 4, 2B, TR, N1. */
  mark: string;
  colour: string | null;
  name: string;
  mr: string | null;
  order: number;
  of: number;
  status: string;
  open: boolean;
  changes: string[];
  href: string | null;
  /** The main button's words: "Station page", or "About Line 1" for a line without a tracker. */
  hrefLabel: string;
  lat: number;
  lng: number;
  photo: { src: string; alt: string; credit: string } | null;
}

/**
 * A card has room for a few words: the status up to its first stop, without the bracket.
 * "Built. Trial runs on ..." becomes "Built, not open yet"; the station page keeps the whole sentence.
 */
export const shortStatus = (v: string) => {
  const head = v.replace(/\s*\(.*\)$/, '').split(/\.\s|;\s/)[0].replace(/\.$/, '');
  return head === 'Built' ? 'Built, not open yet' : head;
};

const markOf = (id: string) => network.find((l) => l.id === id || l.trackedId === id)?.number.replace(/^NM/, 'N') ?? id;

export function stationCards(): StationCard[] {
  const tracked = lines.flatMap((info) => {
    const line = getLine(info.id as LineId);
    return [...line.stations, ...line.spurStations]
      .filter((s) => s.location.lat !== null && s.location.lng !== null)
      .map((s) => {
        const photo = line.stationPhotos[s.id]?.[0];
        return {
          id: `${info.id}/${s.id}`,
          line: info.id,
          label: info.label,
          mark: markOf(info.id),
          colour: info.colour,
          name: s.name,
          mr: (s as { name_mr?: string }).name_mr ?? null,
          order: s.order,
          of: line.stations.length,
          status: shortStatus(s.construction_status.value),
          open: isOpen(line, s),
          changes: changesFor(s),
          href: stationHref(info.id as LineId, s.id),
          hrefLabel: 'Station page',
          lat: s.location.lat!,
          lng: s.location.lng!,
          photo: photo ? { src: photo.src, alt: photo.alt, credit: photo.credit } : null,
        };
      });
  });
  const running = Object.entries(openStations.lines).flatMap(([id, route]) => {
    const l = network.find((x) => x.id === id);
    if (!l) throw new Error(`open-stations.json: no line "${id}" in network.json`);
    const label = l.system ? l.name.split(', ')[0] : `Line ${l.number}`;
    return route.stations.map((s, i) => ({
      id: `${id}/${i + 1}`,
      line: id,
      label,
      mark: markOf(id),
      colour: l.colour ?? null,
      name: s.name,
      mr: s.name_mr,
      order: i + 1,
      of: route.stations.length,
      status: 'Open to riders',
      open: true,
      changes: [],
      href: `/#${id}`,
      hrefLabel: `About ${label.replace(/^Navi Mumbai Metro /, '')}`,
      lat: s.lat,
      lng: s.lng,
      photo: null,
    }));
  });
  return [...tracked, ...running];
}
