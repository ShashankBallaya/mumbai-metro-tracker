/**
 * Typed access to the hand-maintained data files in src/data.
 * Components import from here, never from the JSON files directly,
 * so a schema change only needs fixing in one place.
 *
 * Each line's files live in src/data/lines/<id>/ and are listed in src/data/lines.json.
 * Line 12's files are the schema every line follows. Data is read at build time only:
 * no browser script imports this module.
 */
import linesJson from '../data/lines.json';
import feedJson from '../data/feed.json';

type ProjectFile = typeof import('../data/lines/line-12/project.json');
type StationsFile = typeof import('../data/lines/line-12/stations.json');
type TimelineFile = typeof import('../data/lines/line-12/timeline.json');
type TendersFile = typeof import('../data/lines/line-12/tenders.json');
type ContractorsFile = typeof import('../data/lines/line-12/contractors.json');
type RollingstockFile = typeof import('../data/lines/line-12/rollingstock.json');
type SocialFile = typeof import('../data/lines/line-12/social.json');
type PhotosFile = typeof import('../data/lines/line-12/photos.json');
type BeforeAfterFile = typeof import('../data/lines/line-12/beforeafter.json');
type StationModelFile = typeof import('../data/lines/line-12/station-model.json');

// Above getLine: lines load while this module loads, and their stage notes format dates.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const jsonFiles = import.meta.glob('../data/lines/*/*.json', { eager: true, import: 'default' });
const rawFiles = import.meta.glob('../data/lines/*/*.geojson', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;

export type LineInfo = (typeof linesJson.lines)[number];
export type LineId = LineInfo['id'];

/** Every line on the site, in hub order. */
export const lines: LineInfo[] = linesJson.lines;

/** How sure we are about a fact. See SOURCES.md. */
export type Grade = 'verified' | 'reported' | 'unverified' | 'conflicting';

export interface Sourced {
  status: Grade;
  source_url: string | null;
  last_verified: string;
}

/** A station. `phase` is set on lines built in phases (Line 5: 1, 2, 3, or '5A' for the spur). */
export type Station = StationsFile['stations'][number] & { phase?: number | string };
export type TimelineEvent = TimelineFile['events'][number];
export type Tender = TendersFile['tenders'][number];

export interface SocialPost {
  url: string;
  author: string;
  handle: string;
  date: string;
  text: string;
  status: Grade;
  source_url: string;
  last_verified: string;
}

/** Dated ground photos for one station page, by the owner or by people who gave permission. Never stock or official images. */
export interface StationPhoto {
  src: string;
  alt: string;
  date: string;
  credit: string;
  /** The photographer's X handle without the @, when the photo is not the owner's. */
  handle?: string;
  /** The photographer's own post, when the photo is not the owner's. For a drone still, the video at that moment. */
  source_url?: string;
  width: number;
  height: number;
  caption?: string;
  /** A still from a drone video (the line's aerial.json). `date` is then the day the video was published. */
  kind?: 'drone';
  /** The creator's YouTube channel, for a drone still. */
  channel_url?: string;
  /** The second in the video the still is from. */
  video_t?: number;
}

/** A drone flight along the line (aerial.json), by a creator who gave permission. */
export interface Aerial {
  video: {
    id: string;
    title: string;
    creator: string;
    channel_url: string;
    published: string;
    duration_s: number;
    /** A still of our own (public/photos) shown before the reader starts the video, so nothing loads from YouTube until then. */
    poster: string;
    covers: string;
  };
  /** Stations in the order the flight reaches them; `t` is the second the station comes into view. */
  stops: { station: string; t: number }[];
}

/** "4:05" from 245 seconds. */
export const videoTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** Where a section of the line stands on the way from planning to opening. Drawn as a pattern and written in words, never colour alone. */
export type StageState = 'done' | 'now' | 'started' | 'next';
export interface Stage {
  name: string;
  state: StageState;
  /** Dates in it are filled in from the data (see `stages.notes` in project.json). */
  note: string;
}
/** One part of a line built on its own (Line 5: Phase 1, Phase 2, Phase 3 with the spur). `label` is null when the line is built as one. */
export interface StageSection {
  label: string | null;
  /** The station phases (stations.json `phase`) this section covers, on a line built in parts. */
  phases?: (number | string)[];
  stages: Stage[];
  /** How the section runs once it opens. Each fact is null until a source gives it. */
  service?: Service;
}

/** A sourced fact about a running line. */
export interface ServiceFact extends Sourced {
  notes?: string;
}
/**
 * Opening mode (project.json `stages.sections[].service`). A section is open from its opening date
 * (in India time) at build; before that date the date is an announced opening, and the countdown runs to it.
 */
export interface Service {
  opening: (ServiceFact & { date: string }) | null;
  /** First and last train, 24-hour "HH:MM". */
  hours: (ServiceFact & { first: string; last: string }) | null;
  /** Minutes between trains. */
  frequency: (ServiceFact & { peak_min: number; off_peak_min: number | null }) | null;
  /** The lowest and highest single fare, in rupees. */
  fares: (ServiceFact & { min_inr: number; max_inr: number }) | null;
}

/** An earlier plan's station list (stations.json `plan_2017`, Line 5), each entry tied to what it became. */
export interface EarlierPlan extends Sourced {
  description: string;
  /** "All elevated", as the plan's source puts it. */
  structure?: string;
  stations: {
    name: string;
    /** The station it became in the current plan. */
    now?: string;
    /** Its entry in dropped_stations. */
    dropped?: string;
    /** Neither: what is known about it. */
    note?: string;
  }[];
}

/**
 * Everything the data holds about one line. Only project and stations are required:
 * lists are empty and other parts undefined when the line has no file for them,
 * and the section that needs them does not show.
 */
export interface Line {
  id: LineId;
  info: LineInfo;
  project: ProjectFile;
  stations: Station[];
  /** A branch off the line (Line 5A for Line 5), in order from where it leaves; along_m is measured on the branch. */
  spurStations: Station[];
  /** Stations of an earlier plan that the current plan drops. */
  droppedStations: Station[];
  /** The station the spur leaves from (alignment property `branch_from_station`), when the line has a spur. */
  spurFrom?: Station;
  /** The 2017 plan's stations, when the line's plan has changed since (Line 5). */
  plan2017?: EarlierPlan;
  stationsMeta: StationsFile['_meta'];
  timeline: TimelineEvent[];
  tenders: Tender[];
  contractors: ContractorsFile['contractors'];
  excludedClaims: ContractorsFile['excluded_claims'];
  rollingstock?: RollingstockFile;
  socialPosts: SocialPost[];
  stationPhotos: Record<string, StationPhoto[]>;
  photoPairs: PhotosFile['pairs'];
  /** From project.json `stages`, with dates filled in; empty when the line has none. */
  stages: StageSection[];
  beforeAfter?: BeforeAfterFile;
  stationModel?: StationModelFile;
  /** A drone flight along the line, when there is one. */
  aerial?: Aerial;
  /** The GeoJSON named by `alignment` in lines.json, as text. */
  alignmentRaw?: string;
  /** The latest review date across this line's fact files. */
  lastReviewed: string;
}

const byId = new Map<string, Line>();

export function getLine(id: LineId): Line {
  const cached = byId.get(id);
  if (cached) return cached;
  const info = lines.find((l) => l.id === id);
  if (!info) throw new Error(`No line "${id}" in src/data/lines.json`);
  const dir = `../data/lines/${id}/`;
  const file = <T>(name: string) => jsonFiles[dir + name] as T | undefined;
  const project = file<ProjectFile>('project.json');
  const stations = file<StationsFile>('stations.json');
  if (!project || !stations) throw new Error(`Line "${id}" needs project.json and stations.json`);
  const timeline = file<TimelineFile>('timeline.json');
  const tenders = file<TendersFile>('tenders.json');
  const contractors = file<ContractorsFile>('contractors.json');
  const rollingstock = file<RollingstockFile>('rollingstock.json');
  const social = file<SocialFile>('social.json');
  const photos = file<PhotosFile>('photos.json');
  const line: Line = {
    id,
    info,
    project,
    stations: stations.stations,
    spurStations: (stations as { spur_stations?: Station[] }).spur_stations ?? [],
    droppedStations: (stations as { dropped_stations?: Station[] }).dropped_stations ?? [],
    plan2017: (stations as { plan_2017?: EarlierPlan }).plan_2017,
    stationsMeta: stations._meta,
    timeline: timeline?.events ?? [],
    tenders: tenders?.tenders ?? [],
    contractors: contractors?.contractors ?? [],
    excludedClaims: contractors?.excluded_claims ?? [],
    rollingstock,
    socialPosts: (social?.posts ?? []) as SocialPost[],
    stationPhotos: (photos?.stations ?? {}) as Record<string, StationPhoto[]>,
    photoPairs: photos?.pairs ?? [],
    stages: fillStages(id, (project as { stages?: { sections: StageSection[] } }).stages?.sections ?? [], project.progress.as_of, timeline?.events ?? []),
    beforeAfter: file('beforeafter.json'),
    stationModel: file('station-model.json'),
    aerial: file<Aerial>('aerial.json'),
    alignmentRaw: info.alignment ? rawFiles[dir + info.alignment] : undefined,
    lastReviewed: [project, stations, timeline, tenders, contractors, rollingstock, social]
      .map((f) => f?._meta.last_reviewed)
      .filter((d): d is string => !!d)
      .sort()
      .at(-1)!,
  };
  const branchFrom = line.alignmentRaw ? JSON.parse(line.alignmentRaw).properties?.branch_from_station : undefined;
  if (branchFrom) {
    line.spurFrom = line.stations.find((s) => s.id === branchFrom);
    if (!line.spurFrom) throw new Error(`${id}: branch_from_station "${branchFrom}" is not a station`);
  }
  byId.set(id, line);
  return line;
}

/** The day of this build in India time, "YYYY-MM-DD". Opening mode compares opening dates with it. */
export const buildDay: string = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

/** The section of the line a station belongs to: the one naming its phase, or the only one on a line built as one. */
export function sectionOf(line: Line, s: Station): StageSection | undefined {
  return line.stages.find((sec) => sec.phases?.includes(s.phase!)) ?? (line.stages.length === 1 && !line.stages[0].phases ? line.stages[0] : undefined);
}

/** The opening fact of a section that has opened by this build, else undefined. */
export const openedOf = (sec: StageSection | undefined) => {
  const o = sec?.service?.opening;
  return o && o.date <= buildDay ? o : undefined;
};

/** The opening fact of a section whose opening date is announced but still ahead, else undefined. */
export const announcedOf = (sec: StageSection | undefined) => {
  const o = sec?.service?.opening;
  return o && o.date > buildDay ? o : undefined;
};

/** Whether a station's section is open. */
export const isOpen = (line: Line, s: Station) => Boolean(openedOf(sectionOf(line, s)));

/** Whether any service fact is known for a section: an opening date, hours, frequency or fares. */
export const hasService = (sec: StageSection) => Boolean(sec.service && Object.values(sec.service).some(Boolean));

/** The name of a section in a sentence: its label, or the line's when it is built as one. */
export const sectionName = (line: Line, sec: StageSection) => sec.label ?? line.info.label;

/** The section's name as the subject of a sentence: "Phase 1, Kapurbawdi to Dhamankar Naka, opened". */
export const sectionSubject = (line: Line, sec: StageSection) => {
  const name = sectionName(line, sec);
  return name.includes(',') ? `${name},` : name;
};

/** "06:00" -> "6:00 am", "22:30" -> "10:30 pm". */
export function clock(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
}

/** The latest review date across every line, for site-wide pages such as the sitemap. */
export const lastReviewed: string = lines.map((l) => getLine(l.id).lastReviewed).sort().at(-1)!;

/** The site's name (owner, 2026-10-14). The site root is the hub of all lines. */
export const SITE_NAME = 'Mumbai Metro Tracker';

/** Where a line's pages live: /line-12/, /line-5/ (src/pages/[line]/). */
export function lineBase(id: LineId): string {
  return `/${id}/`;
}

/**
 * The Mumbai Metro line a text names ("Metro Line 5 (Thane-Bhiwandi-Kalyan)"): its number, and its entry in
 * lines.json when the site covers it. Navi Mumbai's lines are a separate network, so they get no mark.
 */
export function lineMark(text: string): { number: string; line?: LineInfo; colour?: string } | null {
  const m = /^Metro Line (\d+[A-Z]?)\b/.exec(text);
  if (!m) return null;
  const line = lines.find((l) => l.number === m[1]);
  return { number: m[1], line, colour: line?.colour ?? otherLines.find((o) => o.number === m[1])?.colour };
}

/** Lines the site does not cover but whose colour it shows on their mark (lines.json `other_lines`, Line 4). */
export const otherLines: { number: string; name: string; colour: string }[] = (linesJson as { other_lines?: { number: string; name: string; colour: string }[] }).other_lines ?? [];

/** A Google Street View link: a chosen view when the station has one (`street_view`), else the nearest panorama. */
export function streetViewUrl(s: Station): string | null {
  const v = (s as { street_view?: { pano: string; heading: number; pitch: number; fov: number } }).street_view;
  if (v) return `https://www.google.com/maps/@?api=1&map_action=pano&pano=${v.pano}&heading=${v.heading}&pitch=${v.pitch}&fov=${v.fov}`;
  const { lat, lng } = s.location;
  return lat === null ? null : `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
}

/** Interchanges planned on other networks (Line 5's Balkum Naka: the Thane Integral Ring Metro), kept apart from MMRDA's list. */
export type PlannedInterchanges = { value: string[]; status: string; source_url: string; notes?: string };
export const plannedInterchanges = (s: Station) => (s as { interchanges_planned?: PlannedInterchanges }).interchanges_planned;

/** A station's page. Typed to allow null, so callers keep a plain-text fallback for a line without pages. */
export function stationHref(id: LineId, station: string): string | null {
  return `${lineBase(id)}stations/${station}/`;
}

/** Where a station's coordinates come from, in a few words: matched on the source of its position. */
export function positionBasis(line: Line, s: Station): string {
  const { default: fallback, by_source } = line.info.position_basis as { default: string; by_source: Record<string, string> };
  const url = s.location.source_url ?? '';
  return Object.entries(by_source).find(([part]) => url.includes(part))?.[1] ?? fallback;
}

/** The line's own wording for a shared page (lines.json `copy`), with {total}, {km} and {name} filled in. */
export function lineCopy(line: Line, key: 'stations_section' | 'stations_page' | 'stations_page_description' | 'route_section' | 'route_legend'): string {
  return line.info.copy[key]
    .replace('{total}', String(line.stations.length))
    .replace('{km}', String(line.project.length_km.value))
    .replace('{name}', line.info.about.name);
}

/** The project report a station's dpr_name and dpr_chainage_m come from, e.g. "the 2019 project report". */
export const dprLabel = (line: Line): string => (line.info.copy as { dpr_label?: string }).dpr_label ?? 'the 2019 project report';

/** The schema.org @id of a line's node, e.g. "https://example.org/#line12". Station pages point at it. */
export const lineNodeId = (siteUrl: string, line: Line) => `${siteUrl}#${line.id.replace('-', '')}`;

/** Automatic feed (scripts/fetch-feed.mjs). Found by a script, not checked by a person. */
export const feed = feedJson as {
  _meta: { updated_at: string; updated_at_by_line?: Record<string, string> };
  news: { title: string; outlet: string; date: string; url: string; lines?: string[] }[];
  videos: { id: string; title: string; channel: string; date: string; url: string; lines?: string[] }[];
};

/** Whether a feed item is about the line. Items written before the feed knew of lines are Line 12's. */
export const aboutLine = (item: { lines?: string[] }, line: Line) => (item.lines ?? ['line-12']).includes(line.id);

/**
 * People who shared their photos with permission on one station page: those with an X handle,
 * and drone video creators, linked to their YouTube channel.
 */
export const photoContributorsFor = (line: Line, stationId: string) => {
  const byCredit = new Map<string, { credit: string; href: string; label: string; site: string; drone: boolean }>();
  for (const ph of line.stationPhotos[stationId] ?? []) {
    if (byCredit.has(ph.credit)) continue;
    if (ph.handle) byCredit.set(ph.credit, { credit: ph.credit, href: `https://x.com/${ph.handle}`, label: `@${ph.handle}`, site: 'X', drone: false });
    else if (ph.channel_url) byCredit.set(ph.credit, { credit: ph.credit, href: ph.channel_url, label: 'YouTube channel', site: '', drone: ph.kind === 'drone' });
  }
  return [...byCredit.values()];
};

/** Plain-language labels for each grade, used in text next to every mark. */
export const gradeLabel: Record<Grade, string> = {
  verified: 'Verified',
  reported: 'Reported',
  unverified: 'Unverified',
  conflicting: 'Sources conflict',
};

export const gradeHelp: Record<Grade, string> = {
  verified: 'Confirmed by MMRDA or its published project report.',
  reported: 'From a news or trade source, not confirmed by MMRDA.',
  unverified: 'Could not be confirmed. Treat with care.',
  conflicting: 'Sources disagree. Alternatives are shown.',
};

/** Short outlet name from a URL, e.g. "mmrda.maharashtra.gov.in" -> "MMRDA". */
export function outletName(url: string | null | undefined): string {
  if (!url) return 'No source';
  const host = new URL(url).hostname.replace(/^www\./, '');
  const known: Record<string, string> = {
    'mmrda.maharashtra.gov.in': 'MMRDA',
    'themetrorailguy.com': 'The Metro Rail Guy',
    'metrorailtoday.com': 'Metro Rail Today',
    'metrorailnews.in': 'Metro Rail News',
    'freepressjournal.in': 'Free Press Journal',
    'railanalysis.in': 'Rail Analysis India',
    'remumbai.in': 'Re-Mumbai',
    'newsband.in': 'Newsband',
    'swarajyamag.com': 'Swarajya',
    'media.biltrax.com': 'Biltrax',
    'urbanacres.in': 'Urban Acres',
    'constructionworld.in': 'Construction World',
    'en.wikipedia.org': 'Wikipedia',
    'x.com': 'X',
    'livingatlas.arcgis.com': 'Esri Wayback',
    'thanemetrorail.com': 'Thane Ring Metro (official)',
    'newsonair.gov.in': 'News On AIR',
    'railwaygazette.com': 'Railway Gazette',
    'lntecc.com': 'L&T',
    'pressreader.com': 'PressReader',
    'indianinfrastructure.com': 'Indian Infrastructure',
  };
  if (url.includes('Metro%20Line%2012.pdf')) return 'MMRDA DPR (2019)';
  if (url.includes('Metro%20Line%204.pdf')) return 'MMRDA DPR (2016)';
  if (url.includes('Metro%20Line%204A.pdf')) return 'MMRDA DPR, Line 4A (2017)';
  // A map anyone can make: say so, so it is never read as Google's own.
  if (host === 'google.com' && url.includes('/maps/d/')) return 'User map on Google My Maps';
  // A post on X is named by its account, so the reader sees who posted it.
  if (host === 'x.com') {
    const handle = new URL(url).pathname.split('/')[1];
    if (handle) return `@${handle} on X`;
  }
  return known[host] ?? host;
}

/** Fills {progress_as_of} and {event:<timeline id>} in stage notes. An unknown event id stops the build. */
function fillStages(id: string, sections: StageSection[], progressAsOf: string, events: TimelineEvent[]): StageSection[] {
  const fill = (note: string) =>
    note
      .replace('{progress_as_of}', formatDate(progressAsOf))
      .replace(/\{event:([^}]+)\}/g, (_, ev: string) => {
        const e = events.find((x) => x.id === ev);
        if (!e) throw new Error(`${id}: a stage note names timeline event "${ev}", which timeline.json does not have`);
        return formatDate(e.date);
      });
  return sections.map((sec) => ({ ...sec, stages: sec.stages.map((st) => ({ ...st, note: fill(st.note) })) }));
}

/** Formats "2024-03-27" / "2024-03" / "2019" by its precision. Never invents a day. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return 'Date not announced';
  const [y, m, d] = value.split('-');
  if (d) return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`;
  if (m) return `${MONTHS[Number(m) - 1]} ${y}`;
  return y;
}

/** Indian-grouped number, e.g. 5865 -> "5,865", 262000 -> "2,62,000". */
export function inr(n: number, digits = 2): string {
  return n.toLocaleString('en-IN', { maximumFractionDigits: digits });
}

export const REPO_URL = 'https://github.com/ShashankBallaya/mumbai-metro-tracker';
export const CORRECTION_URL = `${REPO_URL}/issues/new?labels=correction&title=Correction%3A%20`;
/** The correction link for a line's pages: other lines than Line 12 name themselves in the issue title. */
export const correctionUrl = (line: Line) => (line.id === 'line-12' ? CORRECTION_URL : `${CORRECTION_URL}${encodeURIComponent(`${line.info.label}, `)}`);
