/**
 * The stations of every tracked line, for the hub map's station names and cards (src/scripts/station-card.ts).
 * Only public, sourced fields, kept short: the card links to the station page for the rest.
 */
import { lines, getLine, isOpen, changesFor, stationHref, type LineId } from './data';

export interface StationCard {
  /** "<line id>/<station id>" */
  id: string;
  line: string;
  label: string;
  colour: string | null;
  name: string;
  mr: string | null;
  order: number;
  of: number;
  status: string;
  open: boolean;
  changes: string[];
  href: string | null;
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

export function stationCards(): StationCard[] {
  return lines.flatMap((info) => {
    const line = getLine(info.id as LineId);
    return [...line.stations, ...line.spurStations]
      .filter((s) => s.location.lat !== null && s.location.lng !== null)
      .map((s) => {
        const photo = line.stationPhotos[s.id]?.[0];
        return {
          id: `${info.id}/${s.id}`,
          line: info.id,
          label: info.label,
          colour: info.colour,
          name: s.name,
          mr: (s as { name_mr?: string }).name_mr ?? null,
          order: s.order,
          of: line.stations.length,
          status: shortStatus(s.construction_status.value),
          open: isOpen(line, s),
          changes: changesFor(s),
          href: stationHref(info.id as LineId, s.id),
          lat: s.location.lat!,
          lng: s.location.lng!,
          photo: photo ? { src: photo.src, alt: photo.alt, credit: photo.credit } : null,
        };
      });
  });
}
