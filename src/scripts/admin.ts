/**
 * The moderators' page (src/pages/admin/index.astro): lists reader entries, opens a photo in a canvas editor
 * (blur boxes, crop, rotate), and publishes the cleaned JPEG through /api/admin/publish, to a station page or to a
 * watch point (src/lib/watch.ts). The Watch points tab edits a watch point's words and status.
 *
 * Privacy: the original keeps its EXIF only in the private bucket. The editor reads its date and GPS point to help
 * check the station, and the export comes from a canvas, which writes no EXIF. The server checks that again.
 */
import { WATCH_KINDS, kindLabel, type WatchPoint } from '../lib/watch';

type StationRef = { id: string; name: string; lat: number | null; lng: number | null };
type LineRef = { id: string; label: string; stations: StationRef[] };
type FileMeta = { key: string; type: string; bytes: number; original_name: string };
type Entry = {
  id: string;
  /** A correction from /correct/; absent on photo and update entries from /send/. */
  kind?: 'correction';
  page?: string;
  wrong?: string;
  right?: string | null;
  source?: string | null;
  received_at: string;
  line: string | null;
  station: string | null;
  note: string;
  name: string | null;
  handle: string | null;
  taken: string | null;
  files: FileMeta[];
  published?: { file: string; src: string; watch?: string; commit: string; by: string }[];
  moved_by?: string;
  moved_at?: string;
};

const LINES: LineRef[] = JSON.parse(document.getElementById('admin-data')!.textContent!);
const lineById = new Map(LINES.map((l) => [l.id, l]));
const stationName = (line: string | null, id: string | null) => (id ? ((line && lineById.get(line)?.stations.find((s) => s.id === id)?.name) ?? id) : null);

const $ = <T extends Element>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel)!;
const list = $<HTMLOListElement>('[data-list]');
const msg = $<HTMLParagraphElement>('[data-msg]');
const who = $<HTMLParagraphElement>('[data-who]');
const login = $<HTMLFormElement>('[data-login]');

// ---------- API ----------

const TOKEN_KEY = 'mmt-admin-token';
let token = '';
try {
  token = sessionStorage.getItem(TOKEN_KEY) ?? '';
} catch {}

async function api(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (token) headers.set('authorization', `Bearer ${token}`);
  return fetch(`/api/admin/${path}`, { ...init, headers, credentials: 'same-origin' });
}

function say(text: string) {
  msg.hidden = !text;
  msg.textContent = text;
}

// ---------- Entry list ----------

let state = 'queue';
const objectUrls: string[] = [];

async function thumb(key: string, img: HTMLImageElement) {
  const res = await api(`file?key=${encodeURIComponent(key)}`);
  if (!res.ok) return;
  const url = URL.createObjectURL(await res.blob());
  objectUrls.push(url);
  img.src = url;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> & { class?: string } = {}, ...kids: (Node | string)[]) {
  const node = document.createElement(tag);
  const { class: cls, ...rest } = props;
  if (cls) node.className = cls;
  Object.assign(node, rest);
  node.append(...kids);
  return node;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
}

/** A correction: which page, what is wrong, what is right and the reader's source. Text only. */
function correctionCard(e: Entry) {
  const where = [e.line ? (lineById.get(e.line)?.label ?? e.line) : 'Site', stationName(e.line, e.station)].filter(Boolean).join(' · ');
  const by = e.name ? (e.handle ? `${e.name} (@${e.handle})` : e.name) : e.handle ? `@${e.handle}` : 'no name given';
  const li = el('li', { class: 'adm-entry adm-entry--fix' });
  const page = el('a', { href: e.page ?? '/', target: '_blank', rel: 'noopener', textContent: e.page ?? '/' });
  li.append(
    el('p', { class: 'adm-entry__where' }, el('span', { class: 'adm-entry__tag' }, 'Correction'), ` ${where} `, page),
    el('p', { class: 'adm-entry__meta' }, `Sent ${fmtTime(e.received_at)} by ${by}${e.moved_by ? `. ${state === 'approved' ? 'Fixed' : 'Not a mistake'}, marked by ${e.moved_by}` : ''}`),
    el('p', { class: 'adm-entry__note' }, el('strong', {}, 'Wrong: '), e.wrong ?? e.note),
  );
  if (e.right) li.append(el('p', { class: 'adm-entry__note' }, el('strong', {}, 'Right: '), e.right));
  if (e.source) {
    // A reader's link: shown as text plus a link, never followed by the page itself.
    const safe = /^https?:\/\//.test(e.source);
    li.append(el('p', { class: 'adm-entry__note' }, el('strong', {}, 'Source: '), safe ? el('a', { href: e.source, target: '_blank', rel: 'noopener noreferrer', textContent: e.source }) : e.source));
  }
  if (state === 'queue') {
    const fixed = el('button', { type: 'button', class: 'adm__btn', textContent: 'Fixed' });
    const not = el('button', { type: 'button', class: 'adm__btn adm__btn--quiet', textContent: 'Not a mistake' });
    fixed.addEventListener('click', () => move(e, 'approved', fixed));
    not.addEventListener('click', () => move(e, 'rejected', not));
    li.append(el('div', { class: 'adm-entry__actions' }, fixed, not));
  }
  return li;
}

function card(e: Entry) {
  if (e.kind === 'correction') return correctionCard(e);
  const where = [lineById.get(e.line ?? '')?.label ?? e.line, stationName(e.line, e.station)].filter(Boolean).join(' · ');
  const by = e.handle ? `${e.name} (@${e.handle})` : e.name;
  const li = el('li', { class: 'adm-entry' });
  li.append(
    el('p', { class: 'adm-entry__where' }, where),
    el('p', { class: 'adm-entry__meta' }, `Sent ${fmtTime(e.received_at)} by ${by}${e.taken ? `. Taken ${e.taken}` : ''}${e.moved_by ? `. ${state === 'approved' ? 'Approved' : 'Rejected'} by ${e.moved_by}` : ''}`),
  );
  if (e.note) li.append(el('p', { class: 'adm-entry__note' }, e.note));

  if (e.files.length) {
    const photos = el('ul', { class: 'adm-entry__photos' });
    for (const f of e.files) {
      const img = el('img', { alt: `Photo ${f.original_name}`, loading: 'lazy' });
      void thumb(f.key, img);
      const item = el('li', {}, img);
      const done = e.published?.find((p) => p.file === f.key);
      if (done) item.append(el('span', { class: 'adm-entry__done' }, `Published as ${done.src.split('/').pop()}${done.watch ? ' (watch point)' : ''}`));
      // An approved entry can still have a photo published later.
      if (state === 'queue' || state === 'approved') {
        const btn = el('button', { type: 'button', class: 'adm__btn adm__btn--quiet', textContent: done ? 'Publish again' : 'Clean and publish' });
        btn.addEventListener('click', () => openEditor(e, f));
        item.append(btn);
      }
      photos.append(item);
    }
    li.append(photos);
  }

  if (state === 'queue') {
    const approve = el('button', { type: 'button', class: 'adm__btn', textContent: 'Done: approve' });
    const reject = el('button', { type: 'button', class: 'adm__btn adm__btn--quiet', textContent: 'Reject' });
    approve.addEventListener('click', () => move(e, 'approved', approve));
    reject.addEventListener('click', () => move(e, 'rejected', reject));
    li.append(el('div', { class: 'adm-entry__actions' }, approve, reject));
  }
  return li;
}

async function move(e: Entry, to: 'approved' | 'rejected', btn: HTMLButtonElement) {
  const ask = e.kind === 'correction' ? 'Mark as not a mistake? It moves to Rejected.' : 'Reject this entry? It moves to Rejected, and nothing is published.';
  if (to === 'rejected' && !confirm(ask)) return;
  btn.disabled = true;
  const res = await api('move', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: e.id, from: 'queue', to }) });
  if (res.ok) void load();
  else {
    btn.disabled = false;
    say(`Could not move the entry (${res.status}).`);
  }
}

async function load() {
  objectUrls.splice(0).forEach((u) => URL.revokeObjectURL(u));
  list.replaceChildren();
  list.hidden = state === 'watch';
  watchView.hidden = state !== 'watch';
  if (state === 'watch') {
    say('');
    return loadWatch();
  }
  const res = await api(`list?state=${state}`);
  if (res.status === 401) return showLogin();
  if (!res.ok) return say(`Could not load entries (${res.status}).`);
  const { entries } = (await res.json()) as { entries: Entry[] };
  // Newest first.
  entries.reverse();
  say(entries.length ? '' : state === 'queue' ? 'The queue is empty.' : `Nothing in ${state}.`);
  list.append(...entries.map(card));
}

function showLogin() {
  who.textContent = 'Not logged in.';
  login.hidden = false;
}

login.addEventListener('submit', (ev) => {
  ev.preventDefault();
  token = $<HTMLInputElement>('#adm-token').value.trim();
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
  } catch {}
  login.hidden = true;
  void start();
});

for (const tab of document.querySelectorAll<HTMLButtonElement>('[data-state]')) {
  tab.addEventListener('click', () => {
    state = tab.dataset.state!;
    document.querySelectorAll('[data-state]').forEach((t) => t.setAttribute('aria-pressed', String(t === tab)));
    void load();
  });
}

async function start() {
  const res = await api('me');
  if (!res.ok) return showLogin();
  const me = await res.json();
  who.textContent = `Logged in as ${me.email}.`;
  await load();
}

// ---------- EXIF: date and GPS of the original (JPEG only) ----------

function readExif(buf: ArrayBuffer): { date?: string; lat?: number; lng?: number } {
  const v = new DataView(buf);
  if (v.byteLength < 4 || v.getUint16(0) !== 0xffd8) return {};
  let off = 2;
  while (off + 4 < v.byteLength) {
    const marker = v.getUint16(off);
    const len = v.getUint16(off + 2);
    if (marker === 0xffe1 && v.getUint32(off + 4) === 0x45786966) return readTiff(v, off + 10);
    if (marker === 0xffda) break;
    off += 2 + len;
  }
  return {};
}

function readTiff(v: DataView, t: number) {
  const le = v.getUint16(t) === 0x4949;
  const u16 = (o: number) => v.getUint16(t + o, le);
  const u32 = (o: number) => v.getUint32(t + o, le);
  const tags = (ifd: number) => {
    const out = new Map<number, { type: number; count: number; at: number }>();
    const n = u16(ifd);
    for (let i = 0; i < n; i++) {
      const e = ifd + 2 + i * 12;
      out.set(u16(e), { type: u16(e + 2), count: u32(e + 4), at: e + 8 });
    }
    return out;
  };
  const ascii = (tag?: { count: number; at: number }) => {
    if (!tag) return undefined;
    const at = tag.count > 4 ? u32(tag.at) : tag.at;
    let s = '';
    for (let i = 0; i < tag.count - 1; i++) s += String.fromCharCode(v.getUint8(t + at + i));
    return s;
  };
  const rationals = (tag?: { count: number; at: number }) => {
    if (!tag) return undefined;
    const at = u32(tag.at);
    return Array.from({ length: tag.count }, (_, i) => u32(at + i * 8) / (u32(at + i * 8 + 4) || 1));
  };
  try {
    const ifd0 = tags(u32(4));
    const out: { date?: string; lat?: number; lng?: number } = {};
    const exifPtr = ifd0.get(0x8769);
    if (exifPtr) {
      const d = ascii(tags(u32(exifPtr.at)).get(0x9003)) ?? ascii(ifd0.get(0x0132));
      if (d && /^\d{4}:\d{2}:\d{2}/.test(d)) out.date = d.slice(0, 10).replace(/:/g, '-');
    }
    const gpsPtr = ifd0.get(0x8825);
    if (gpsPtr) {
      const g = tags(u32(gpsPtr.at));
      const lat = rationals(g.get(2));
      const lng = rationals(g.get(4));
      const latRef = ascii(g.get(1));
      const lngRef = ascii(g.get(3));
      const deg = (r: number[]) => r[0] + r[1] / 60 + r[2] / 3600;
      if (lat && lng && lat.length === 3 && lng.length === 3) {
        out.lat = deg(lat) * (latRef === 'S' ? -1 : 1);
        out.lng = deg(lng) * (lngRef === 'W' ? -1 : 1);
      }
    }
    return out;
  } catch {
    return {};
  }
}

function metres(aLat: number, aLng: number, bLat: number, bLng: number) {
  const r = Math.PI / 180;
  const x = (bLng - aLng) * r * Math.cos(((aLat + bLat) / 2) * r);
  const y = (bLat - aLat) * r;
  return Math.round(Math.hypot(x, y) * 6371000);
}

// ---------- Editor ----------

type Rect = { x: number; y: number; w: number; h: number };
const dialog = $<HTMLDialogElement>('[data-editor]');
const canvas = $<HTMLCanvasElement>('[data-ed-canvas]');
const ctx = canvas.getContext('2d')!;
const f = {
  line: $<HTMLSelectElement>('[data-ed-line]'),
  station: $<HTMLSelectElement>('[data-ed-station]'),
  date: $<HTMLInputElement>('[data-ed-date]'),
  alt: $<HTMLTextAreaElement>('[data-ed-alt]'),
  caption: $<HTMLInputElement>('[data-ed-caption]'),
  credit: $<HTMLInputElement>('[data-ed-credit]'),
  handle: $<HTMLInputElement>('[data-ed-handle]'),
  source: $<HTMLInputElement>('[data-ed-source]'),
  status: $<HTMLParagraphElement>('[data-ed-status]'),
  exif: $<HTMLParagraphElement>('[data-ed-exif]'),
  publish: $<HTMLButtonElement>('[data-ed-publish]'),
  watch: $<HTMLSelectElement>('[data-ed-watch]'),
  wtitle: $<HTMLInputElement>('[data-ed-wtitle]'),
  wkind: $<HTMLSelectElement>('[data-ed-wkind]'),
  wplace: $<HTMLInputElement>('[data-ed-wplace]'),
};
const targetRadios = [...document.querySelectorAll<HTMLInputElement>('[data-ed-target]')];
const target = () => targetRadios.find((r) => r.checked)?.value ?? 'station';
f.wkind.append(...Object.entries(WATCH_KINDS).map(([k, label]) => new Option(label, k)));

/** Watch points per line, read from main through the API, so a point made a minute ago is there. */
const watchCache = new Map<string, WatchPoint[]>();
async function watchPoints(line: string, fresh = false) {
  if (!fresh && watchCache.has(line)) return watchCache.get(line)!;
  const res = await api(`watch?line=${encodeURIComponent(line)}`);
  const out = res.ok ? ((await res.json()).watch_points as WatchPoint[]) : [];
  watchCache.set(line, out);
  return out;
}

async function fillWatch() {
  const line = f.line.value;
  f.watch.replaceChildren(new Option('Loading…', ''));
  const points = await watchPoints(line, true);
  if (f.line.value !== line) return;
  f.watch.replaceChildren(
    new Option('New watch point', 'new'),
    ...points.map((w) => new Option(`${w.title} (${kindLabel(w.kind)}${w.status === 'cleared' ? ', cleared' : ''})`, w.id)),
  );
  // Suggest the nearest existing point when the photo has GPS.
  const gps = current?.gps;
  if (gps) {
    const near = points.map((w) => ({ w, d: metres(gps.lat, gps.lng, w.lat, w.lng) })).sort((a, b) => a.d - b.d)[0];
    if (near && near.d < 300) f.watch.value = near.w.id;
  }
  showTarget();
}

function showTarget() {
  const t = target();
  const isNew = t === 'watch' && f.watch.value === 'new';
  document.querySelectorAll<HTMLElement>('[data-ed-for]').forEach((n) => {
    const want = n.dataset.edFor;
    n.hidden = !(want === t || (want === 'new' && isNew));
  });
  f.station.required = t === 'station';
  f.wtitle.required = isNew;
  f.wplace.required = isNew;
  f.publish.textContent = t === 'station' ? 'Publish to the station page' : isNew ? 'Publish as a new watch point' : 'Publish to the watch point';
}
targetRadios.forEach((r) =>
  r.addEventListener('change', () => {
    if (target() === 'watch') void fillWatch();
    showTarget();
  }),
);
f.watch.addEventListener('change', showTarget);

let original: ImageBitmap | null = null;
let rotation = 0;
let base: HTMLCanvasElement | null = null; // the original, rotated
let blurs: Rect[] = [];
let crop: Rect | null = null;
let tool: 'blur' | 'crop' = 'blur';
let drag: { x0: number; y0: number; rect: Rect } | null = null;
let current: { entry: Entry; file: FileMeta; gps?: { lat: number; lng: number } } | null = null;

f.line.append(...LINES.map((l) => new Option(l.label, l.id)));
function fillStations(lineId: string, pick?: string | null) {
  const line = lineById.get(lineId);
  f.station.replaceChildren(new Option('Pick a station', ''), ...(line?.stations ?? []).map((s) => new Option(s.name, s.id)));
  f.station.value = pick && line?.stations.some((s) => s.id === pick) ? pick : '';
  checkGps();
}
f.line.addEventListener('change', () => {
  fillStations(f.line.value);
  if (target() === 'watch') void fillWatch();
});
f.station.addEventListener('change', checkGps);

function checkGps() {
  delete f.exif.dataset.warn;
  const gps = current?.gps;
  if (!gps) return;
  const all = LINES.flatMap((l) => l.stations.filter((s) => s.lat != null).map((s) => ({ l, s, d: metres(gps.lat, gps.lng, s.lat!, s.lng!) })));
  all.sort((a, b) => a.d - b.d);
  const near = all[0];
  const picked = all.find((a) => a.l.id === f.line.value && a.s.id === f.station.value);
  let text = `GPS in the original: ${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)}. Nearest station: ${near.s.name} (${near.l.label}), ${near.d.toLocaleString('en-IN')} m.`;
  if (picked && picked.d > 1500) {
    text += ` The station you picked is ${picked.d.toLocaleString('en-IN')} m away. Check it.`;
    f.exif.dataset.warn = '';
  }
  f.exif.textContent = text;
}

function rebuildBase() {
  if (!original) return;
  const turn = rotation % 180 !== 0;
  base = document.createElement('canvas');
  base.width = turn ? original.height : original.width;
  base.height = turn ? original.width : original.height;
  const b = base.getContext('2d')!;
  b.translate(base.width / 2, base.height / 2);
  b.rotate((rotation * Math.PI) / 180);
  b.drawImage(original, -original.width / 2, -original.height / 2);
  blurs = [];
  crop = null;
}

/** The photo with every blur box applied, at full size. Pixelation, so the plate cannot be read back. */
function worked() {
  const out = document.createElement('canvas');
  out.width = base!.width;
  out.height = base!.height;
  const o = out.getContext('2d')!;
  o.drawImage(base!, 0, 0);
  for (const r of blurs) {
    const block = Math.max(10, Math.round(Math.max(r.w, r.h) / 7));
    const sw = Math.max(1, Math.ceil(r.w / block));
    const sh = Math.max(1, Math.ceil(r.h / block));
    const small = document.createElement('canvas');
    small.width = sw;
    small.height = sh;
    small.getContext('2d')!.drawImage(out, r.x, r.y, r.w, r.h, 0, 0, sw, sh);
    o.imageSmoothingEnabled = false;
    o.drawImage(small, 0, 0, sw, sh, r.x, r.y, r.w, r.h);
    o.imageSmoothingEnabled = true;
  }
  return out;
}

function draw() {
  if (!base) return;
  const img = worked();
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
  const line = Math.max(2, Math.round(img.width / 300));
  const show = drag?.rect;
  const c = crop ?? (tool === 'crop' && show ? show : null);
  if (c) {
    ctx.fillStyle = 'rgb(0 0 0 / 0.55)';
    ctx.beginPath();
    ctx.rect(0, 0, img.width, img.height);
    ctx.rect(c.x, c.y, c.w, c.h);
    ctx.fill('evenodd');
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = line;
    ctx.strokeRect(c.x, c.y, c.w, c.h);
  }
  if (show && tool === 'blur') {
    ctx.strokeStyle = '#ff7a1a';
    ctx.lineWidth = line;
    ctx.setLineDash([line * 3, line * 2]);
    ctx.strokeRect(show.x, show.y, show.w, show.h);
    ctx.setLineDash([]);
  }
}

function point(ev: PointerEvent) {
  const r = canvas.getBoundingClientRect();
  // object-fit: contain can letterbox the canvas inside its box.
  const scale = Math.min(r.width / canvas.width, r.height / canvas.height);
  const ox = (r.width - canvas.width * scale) / 2;
  const oy = (r.height - canvas.height * scale) / 2;
  const x = Math.min(canvas.width, Math.max(0, (ev.clientX - r.left - ox) / scale));
  const y = Math.min(canvas.height, Math.max(0, (ev.clientY - r.top - oy) / scale));
  return { x, y };
}
const norm = (x0: number, y0: number, x1: number, y1: number): Rect => ({ x: Math.min(x0, x1), y: Math.min(y0, y1), w: Math.abs(x1 - x0), h: Math.abs(y1 - y0) });

canvas.addEventListener('pointerdown', (ev) => {
  if (!base) return;
  canvas.setPointerCapture(ev.pointerId);
  const p = point(ev);
  drag = { x0: p.x, y0: p.y, rect: { x: p.x, y: p.y, w: 0, h: 0 } };
  if (tool === 'crop') crop = null;
});
canvas.addEventListener('pointermove', (ev) => {
  if (!drag) return;
  const p = point(ev);
  drag.rect = norm(drag.x0, drag.y0, p.x, p.y);
  draw();
});
canvas.addEventListener('pointerup', () => {
  if (!drag) return;
  const r = drag.rect;
  drag = null;
  const min = Math.max(8, canvas.width / 100);
  if (r.w >= min && r.h >= min) {
    if (tool === 'blur') blurs.push(r);
    else crop = r;
  }
  draw();
});

document.querySelectorAll<HTMLButtonElement>('[data-tool]').forEach((b) =>
  b.addEventListener('click', () => {
    tool = b.dataset.tool as 'blur' | 'crop';
    document.querySelectorAll('[data-tool]').forEach((t) => t.setAttribute('aria-pressed', String(t === b)));
  }),
);
$('[data-ed-rotate]').addEventListener('click', () => {
  rotation = (rotation + 90) % 360;
  rebuildBase();
  draw();
});
$('[data-ed-undo]').addEventListener('click', () => {
  if (crop) crop = null;
  else blurs.pop();
  draw();
});
$('[data-ed-reset]').addEventListener('click', () => {
  rebuildBase();
  draw();
});
$('[data-ed-close]').addEventListener('click', () => dialog.close());

async function openEditor(entry: Entry, file: FileMeta) {
  current = { entry, file };
  f.status.textContent = 'Loading the photo…';
  f.exif.textContent = '';
  f.publish.disabled = true;
  rotation = 0;
  original = null;
  base = null;
  canvas.width = 1;
  canvas.height = 1;

  f.line.value = entry.line ?? '';
  fillStations(entry.line ?? '', entry.station);
  // An entry sent for no station is most likely a place between stations.
  targetRadios.forEach((r) => (r.checked = r.value === (entry.station ? 'station' : 'watch')));
  f.wtitle.value = '';
  f.wkind.value = 'crossing';
  f.wplace.value = '';
  showTarget();
  f.date.max = new Date().toISOString().slice(0, 10);
  f.date.value = '';
  f.alt.value = '';
  f.caption.value = '';
  f.credit.value = entry.name ?? '';
  f.handle.value = entry.handle && /^[A-Za-z0-9_]{1,15}$/.test(entry.handle) ? entry.handle : '';
  f.source.value = '';
  dialog.showModal();

  const res = await api(`file?key=${encodeURIComponent(file.key)}`);
  if (!res.ok) {
    f.status.textContent = `Could not load the photo (${res.status}).`;
    return;
  }
  const blob = await res.blob();
  const exif = readExif(await blob.arrayBuffer());
  if (exif.date) f.date.value = exif.date;
  if (exif.lat != null && exif.lng != null) {
    current.gps = { lat: exif.lat, lng: exif.lng };
    f.wplace.value = `${exif.lat.toFixed(5)}, ${exif.lng.toFixed(5)}`;
  }
  if (target() === 'watch') void fillWatch();
  else f.exif.textContent = `No GPS in the original.${entry.taken ? ` The sender says it was taken ${entry.taken}.` : ''}`;
  checkGps();

  try {
    original = await createImageBitmap(blob, { imageOrientation: 'from-image' });
  } catch {
    f.status.textContent =
      file.type === 'image/heic'
        ? 'This is a HEIC photo, and this browser cannot open it. Open the page in Safari, or download the photo, save it as JPEG and add it by hand.'
        : 'This browser cannot open the photo.';
    return;
  }
  rebuildBase();
  draw();
  f.status.textContent = '';
  f.publish.disabled = false;
}

/** The cleaned JPEG: cropped, blurred, at most 1600 px on the long side. */
async function exportJpeg(): Promise<Blob> {
  const img = worked();
  const c = crop ?? { x: 0, y: 0, w: img.width, h: img.height };
  const scale = Math.min(1, 1600 / Math.max(c.w, c.h));
  const out = document.createElement('canvas');
  out.width = Math.round(c.w * scale);
  out.height = Math.round(c.h * scale);
  const o = out.getContext('2d')!;
  o.imageSmoothingQuality = 'high';
  o.drawImage(img, c.x, c.y, c.w, c.h, 0, 0, out.width, out.height);
  return new Promise((resolve, reject) => out.toBlob((b) => (b ? resolve(b) : reject(new Error('export failed'))), 'image/jpeg', 0.85));
}

$<HTMLFormElement>('[data-ed-form]').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const form = ev.currentTarget as HTMLFormElement;
  if (!current || !base || !form.reportValidity()) return;
  if (blurs.length === 0 && !confirm('No blur boxes. Does the photo show no readable number plates and no faces?')) return;

  f.publish.disabled = true;
  f.status.textContent = 'Publishing…';
  try {
    const body = new FormData();
    body.set('id', current.entry.id);
    body.set('file_key', current.file.key);
    body.set('line', f.line.value);
    body.set('target', target());
    if (target() === 'station') body.set('station', f.station.value);
    else if (f.watch.value !== 'new') body.set('watch_id', f.watch.value);
    else {
      body.set('watch_title', f.wtitle.value);
      body.set('watch_kind', f.wkind.value);
      body.set('watch_place', f.wplace.value);
    }
    body.set('date', f.date.value);
    body.set('alt', f.alt.value);
    body.set('caption', f.caption.value);
    body.set('credit', f.credit.value);
    body.set('handle', f.handle.value);
    body.set('source_url', f.source.value);
    body.set('image', await exportJpeg(), 'photo.jpg');
    const res = await api('publish', { method: 'POST', body });
    const out = await res.json().catch(() => ({ ok: false, error: `Error ${res.status}` }));
    if (!out.ok) {
      f.status.textContent = out.error;
      f.publish.disabled = false;
      return;
    }
    // A new watch point now exists: show it in the list for the next photo of the same entry.
    if (out.watch && target() === 'watch') void fillWatch().then(() => (f.watch.value = out.watch));
    f.status.replaceChildren(
      `Published as ${out.src.split('/').pop()}${out.watch ? ` to the watch point "${out.watch}"` : ''}. The site redeploys in a few minutes. `,
      el('a', { href: out.url, target: '_blank', rel: 'noopener', textContent: 'See the commit' }),
    );
    void load();
  } catch (err) {
    f.status.textContent = `Could not publish: ${(err as Error).message}`;
    f.publish.disabled = false;
  }
});

// ---------- Watch points tab ----------

const watchView = $<HTMLElement>('[data-watch-view]');
const watchLine = $<HTMLSelectElement>('[data-watch-line]');
const watchList = $<HTMLOListElement>('[data-watch-list]');
watchLine.append(...LINES.map((l) => new Option(l.label, l.id)));
watchLine.addEventListener('change', () => void loadWatch());

async function loadWatch() {
  watchList.replaceChildren(el('li', {}, 'Loading…'));
  const line = watchLine.value;
  const points = await watchPoints(line, true);
  if (watchLine.value !== line) return;
  watchList.replaceChildren(
    ...(points.length ? points.map((w) => watchForm(line, w)) : [el('li', {}, 'No watch points on this line yet. Publish a reader photo to "A watch point" to start one.')]),
  );
}

function watchForm(line: string, w: WatchPoint) {
  const stations = lineById.get(line)?.stations ?? [];
  const name = (id: string) => stations.find((s) => s.id === id)?.name ?? id;
  const title = el('input', { type: 'text', value: w.title, maxLength: 80, minLength: 4, required: true });
  const kind = el('select');
  kind.append(...Object.entries(WATCH_KINDS).map(([k, label]) => new Option(label, k, false, k === w.kind)));
  const status = el('select');
  status.append(new Option('Open: still holds up the work', 'open', false, w.status === 'open'), new Option('Cleared', 'cleared', false, w.status === 'cleared'));
  const cleared = el('input', { type: 'date', value: w.cleared ?? '' });
  const note = el('textarea', { rows: 3, maxLength: 600, value: w.note ?? '' });
  const sources = el('textarea', { rows: 3, value: (w.sources ?? []).join('\n'), placeholder: 'https://… one link on each line. No Wikipedia.' });
  const msg = el('p', { class: 'wpa-item__status' });
  const save = el('button', { type: 'submit', class: 'adm__btn', textContent: 'Save' });
  const label = (text: string, input: HTMLElement) => el('label', {}, text, input);

  const form = el(
    'form',
    { class: 'wpa-item' },
    el('p', { class: 'adm-entry__where' }, w.title),
    el(
      'p',
      { class: 'adm-entry__meta' },
      `Between ${name(w.between[0])} and ${name(w.between[1])}. ${w.photos.length} photo${w.photos.length === 1 ? '' : 's'}. Started ${w.added}. `,
      el('a', { href: `https://www.openstreetmap.org/?mlat=${w.lat}&mlon=${w.lng}#map=17/${w.lat}/${w.lng}`, target: '_blank', rel: 'noopener', textContent: 'See the place on a map' }),
    ),
    el('div', { class: 'wpa-item__grid' }, label('Title', title), label('Kind', kind), label('Status', status), label('Date cleared', cleared)),
    label('What holds up the work here (one or two sentences, facts only)', note),
    label('Sources for the note', sources),
    el('div', { class: 'adm-entry__actions' }, save),
    msg,
  );
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (status.value === 'cleared' && !cleared.value) {
      msg.textContent = 'Give the date the place was cleared.';
      return;
    }
    save.disabled = true;
    msg.textContent = 'Saving…';
    const res = await api('watch', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        line,
        id: w.id,
        title: title.value,
        kind: kind.value,
        status: status.value,
        cleared: cleared.value,
        note: note.value,
        sources: sources.value.split(/\s+/).filter(Boolean),
      }),
    });
    const out = await res.json().catch(() => ({ ok: false, error: `Error ${res.status}` }));
    save.disabled = false;
    if (!out.ok) {
      msg.textContent = out.error;
      return;
    }
    msg.replaceChildren('Saved. The site redeploys in a few minutes. ', el('a', { href: out.url, target: '_blank', rel: 'noopener', textContent: 'See the commit' }));
  });
  return el('li', { class: 'adm-entry' }, form);
}

void start();
