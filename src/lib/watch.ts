/**
 * Watch points: places on a line, not stations, that can hold up the work. Readers make them by sending photos
 * (the form at /send/); moderators publish them from /admin/. Stored in each line's photos.json, `watch_points`.
 * The server list of kinds is in server/github-publish.js (WATCH_KINDS); keep the two the same.
 */

export const WATCH_KINDS = {
  crossing: 'Big crossing',
  demolition: 'Structure in the way',
  'power-lines': 'Power lines',
  land: 'Land',
  utilities: 'Utilities to shift',
  court: 'Court case',
  other: 'Other',
} as const;

export type WatchKind = keyof typeof WATCH_KINDS;

export interface WatchPhoto {
  src: string;
  alt: string;
  caption?: string;
  date: string;
  credit: string;
  handle?: string;
  source_url?: string;
  width: number;
  height: number;
}

export interface WatchPoint {
  id: string;
  title: string;
  kind: WatchKind;
  status: 'open' | 'cleared';
  /** Date of the first photo. */
  added: string;
  cleared?: string;
  lat: number;
  lng: number;
  /** The station ids on each side, in line order. */
  between: [string, string];
  /** What holds up the work here, in a sentence or two. */
  note: string;
  /** Links that back the note (MMRDA, news, a court order). Never Wikipedia. */
  sources: string[];
  /** Newest first. */
  photos: WatchPhoto[];
}

export const kindLabel = (k: string) => WATCH_KINDS[k as WatchKind] ?? 'Other';
