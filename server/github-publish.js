/**
 * Publishes one reader photo: a single commit to main that adds the image to public/photos/ and its entry to the
 * line's photos.json. The push starts the deploy workflow, so the photo is live a few minutes later.
 *
 * Env: GITHUB_TOKEN (a fine-grained token for this repository only, "Contents: Read and write"),
 *      GITHUB_REPO (optional, default ShashankBallaya/mumbai-metro-tracker).
 *      GITHUB_API (optional, for a local test double; default https://api.github.com).
 */

const DEFAULT_REPO = 'ShashankBallaya/mumbai-metro-tracker';
const BRANCH = 'main';

const PHOTOS_META = {
  description:
    'Dated ground photos, by the owner or by people who gave permission to use them. \'stations\' holds photos for each station page, keyed by the station id in stations.json. Put the image files in public/photos/ (location data removed) and add entries below. See UPDATING.md.',
};

/**
 * Reads a JPEG's size and refuses one that still carries EXIF or XMP (APP1), so no GPS can slip through.
 * The admin page re-encodes every photo on a canvas, which writes none.
 */
export function cleanJpegInfo(bytes) {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return { error: 'not-jpeg' };
  let i = 2;
  let width = 0;
  let height = 0;
  while (i + 4 <= bytes.length) {
    if (bytes[i] !== 0xff) return { error: 'bad-jpeg' };
    const marker = bytes[i + 1];
    if (marker === 0xd9 || marker === 0xda) break; // end of image, or start of scan: no more headers
    const len = (bytes[i + 2] << 8) | bytes[i + 3];
    if (marker === 0xe1) return { error: 'has-exif' };
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      height = (bytes[i + 5] << 8) | bytes[i + 6];
      width = (bytes[i + 7] << 8) | bytes[i + 8];
    }
    i += 2 + len;
  }
  if (!width || !height) return { error: 'bad-jpeg' };
  return { width, height };
}

function toBase64(bytes) {
  let out = '';
  for (let i = 0; i < bytes.length; i += 0x8000) out += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(out);
}
const fromBase64Utf8 = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, '')), (c) => c.charCodeAt(0)));

function client(env) {
  const repo = env.GITHUB_REPO || DEFAULT_REPO;
  return async (path, init = {}) => {
    const res = await fetch(`${env.GITHUB_API || 'https://api.github.com'}/repos/${repo}/${path}`, {
      ...init,
      headers: {
        authorization: `Bearer ${env.GITHUB_TOKEN}`,
        accept: 'application/vnd.github+json',
        'x-github-api-version': '2022-11-28',
        'user-agent': 'mumbai-metro-tracker-admin',
        ...(init.body ? { 'content-type': 'application/json' } : {}),
      },
    });
    return res;
  };
}

async function ok(res, what) {
  if (res.ok) return res.json();
  const text = await res.text();
  const err = new Error(`GitHub ${what}: ${res.status} ${text.slice(0, 200)}`);
  err.status = res.status;
  throw err;
}

/** Kinds of watch point: places on a line, not stations, that can hold up the work. */
export const WATCH_KINDS = ['crossing', 'demolition', 'power-lines', 'land', 'utilities', 'court', 'other'];

const fail = (status, message) => Object.assign(new Error(message), { status });

/** Metres from point p to the segment a-b (flat earth; fine at city scale). */
function toSegment(p, a, b) {
  const r = Math.PI / 180;
  const kx = Math.cos(p.lat * r) * 6371000 * r;
  const ky = 6371000 * r;
  const ax = (a.lng - p.lng) * kx;
  const ay = (a.lat - p.lat) * ky;
  const dx = (b.lng - p.lng) * kx - ax;
  const dy = (b.lat - p.lat) * ky - ay;
  const t = dx || dy ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / (dx * dx + dy * dy))) : 0;
  return Math.hypot(ax + t * dx, ay + t * dy);
}

/** The two stations on each side of a place, in line order, and how far the place is from the line. */
export function betweenStations(stations, p) {
  const placed = stations.filter((s) => s.location?.lat != null).sort((x, y) => (x.order ?? 0) - (y.order ?? 0));
  let best = null;
  for (let i = 0; i + 1 < placed.length; i++) {
    const d = toSegment(p, placed[i].location, placed[i + 1].location);
    if (!best || d < best.d) best = { d, between: [placed[i].id, placed[i + 1].id] };
  }
  return best ? { between: best.between, off_m: Math.round(best.d) } : null;
}

const slug = (text) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/, '') || 'spot';

/**
 * Reads main, lets `change` edit files, and commits the result in one commit. Starts again once if main moved.
 * change gets { read(path) -> text | null, exists(path) -> bool } and returns { files: {path: text | Uint8Array}, message, result }.
 */
async function commitToMain(env, change) {
  if (!env.GITHUB_TOKEN) throw fail(500, 'GITHUB_TOKEN is not set');
  const gh = client(env);
  for (let attempt = 0; attempt < 2; attempt++) {
    const head = await ok(await gh(`git/ref/heads/${BRANCH}`), 'ref');
    const base = await ok(await gh(`git/commits/${head.object.sha}`), 'commit');
    const at = head.object.sha;
    const read = async (path) => {
      const res = await gh(`contents/${path}?ref=${at}`);
      if (res.status === 404) return null;
      return fromBase64Utf8((await ok(res, path)).content);
    };
    const exists = async (path) => (await gh(`contents/${path}?ref=${at}`, { method: 'HEAD' })).status !== 404;
    const { files, message, result } = await change({ read, exists });

    const tree = [];
    for (const [path, content] of Object.entries(files)) {
      const body = content instanceof Uint8Array ? { content: toBase64(content), encoding: 'base64' } : { content, encoding: 'utf-8' };
      const blob = await ok(await gh('git/blobs', { method: 'POST', body: JSON.stringify(body) }), `blob ${path}`);
      tree.push({ path, mode: '100644', type: 'blob', sha: blob.sha });
    }
    const newTree = await ok(await gh('git/trees', { method: 'POST', body: JSON.stringify({ base_tree: base.tree.sha, tree }) }), 'tree');
    const commit = await ok(await gh('git/commits', { method: 'POST', body: JSON.stringify({ message, tree: newTree.sha, parents: [at] }) }), 'new commit');
    const moved = await gh(`git/refs/heads/${BRANCH}`, { method: 'PATCH', body: JSON.stringify({ sha: commit.sha, force: false }) });
    // Someone pushed in the meantime: start again from the new head.
    if (moved.status === 422 && attempt === 0) continue;
    await ok(moved, 'update main');
    return { ...result, commit: commit.sha, url: commit.html_url };
  }
  throw fail(409, 'main kept moving; try again');
}

async function readLine(read, line) {
  const stationsText = await read(`src/data/lines/${line}/stations.json`);
  if (stationsText == null) throw fail(400, `No line ${line}`);
  const stationsFile = JSON.parse(stationsText);
  const jsonPath = `src/data/lines/${line}/photos.json`;
  const text = await read(jsonPath);
  const data = text == null ? { _meta: { ...PHOTOS_META }, pairs: [], stations: {} } : JSON.parse(text);
  return { stations: stationsFile.stations ?? [], spur: stationsFile.spur_stations ?? [], jsonPath, data };
}
const jsonText = (data) => `${JSON.stringify(data, null, 2)}\n`;

/** Watch points of one line as main has them now (for the admin page). */
export async function readWatchPoints(env, line) {
  if (!env.GITHUB_TOKEN) throw fail(500, 'GITHUB_TOKEN is not set');
  const res = await client(env)(`contents/src/data/lines/${line}/photos.json?ref=${BRANCH}`);
  if (res.status === 404) return [];
  const data = JSON.parse(fromBase64Utf8((await ok(res, 'photos.json')).content));
  return data.watch_points ?? [];
}

/**
 * photo: { line, date, alt, caption?, credit, handle?, source_url?, jpeg: Uint8Array, width, height } and one target:
 *        station: '<id>'                              a station page, or
 *        watch: { id } | { title, kind, lat, lng }    an existing watch point, or a new one.
 * note:  extra lines for the commit message.
 * Returns { src, watch?, commit, url }.
 */
export async function publishPhoto(env, photo, note) {
  return commitToMain(env, async ({ read, exists }) => {
    const { stations, spur, jsonPath, data } = await readLine(read, photo.line);

    let list;
    let stem;
    let where;
    let watchId;
    if (photo.station) {
      if (![...stations, ...spur].some((s) => s.id === photo.station)) throw fail(400, `No station ${photo.station} on ${photo.line}`);
      data.stations ??= {};
      list = data.stations[photo.station] ??= [];
      stem = photo.station;
      where = photo.station;
    } else if (photo.watch) {
      data.watch_points ??= [];
      let wp;
      if (photo.watch.id) {
        wp = data.watch_points.find((w) => w.id === photo.watch.id);
        if (!wp) throw fail(400, `No watch point ${photo.watch.id} on ${photo.line}`);
      } else {
        const { title, kind, lat, lng } = photo.watch;
        const place = betweenStations(stations, { lat, lng });
        if (!place) throw fail(400, 'This line has no station places to measure from.');
        if (place.off_m > 1500) throw fail(400, `The place is ${place.off_m.toLocaleString('en-IN')} m from the line. Check the point.`);
        const base = slug(title);
        let id = base;
        for (let n = 2; data.watch_points.some((w) => w.id === id) || stations.some((s) => s.id === id); n++) id = `${base.slice(0, 36)}-${n}`;
        wp = { id, title, kind, status: 'open', added: photo.date, lat: +lat.toFixed(5), lng: +lng.toFixed(5), between: place.between, note: '', sources: [], photos: [] };
        data.watch_points.push(wp);
      }
      wp.photos ??= [];
      list = wp.photos;
      stem = wp.id;
      where = `watch point ${wp.id}`;
      watchId = wp.id;
    } else throw fail(400, 'Pick a station or a watch point');

    // <stem>-<date>-a.jpg, then -b, -c... the first name not in use anywhere in public/photos.
    let name;
    for (const letter of 'abcdefghijklmnopqrstuvwxyz') {
      const candidate = `${stem}-${photo.date}-${letter}.jpg`;
      if (list.some((p) => p.src === `/photos/${candidate}`)) continue;
      if (!(await exists(`public/photos/${candidate}`))) {
        name = candidate;
        break;
      }
    }
    if (!name) throw fail(409, 'No free file name for this place and date');

    const entry = {
      src: `/photos/${name}`,
      alt: photo.alt,
      ...(photo.caption ? { caption: photo.caption } : {}),
      date: photo.date,
      credit: photo.credit,
      ...(photo.handle ? { handle: photo.handle } : {}),
      ...(photo.source_url ? { source_url: photo.source_url } : {}),
      width: photo.width,
      height: photo.height,
    };
    if (photo.station) {
      // Ground photos go before drone stills, so a ground photo leads the station page.
      const firstDrone = list.findIndex((p) => p.kind === 'drone');
      list.splice(firstDrone === -1 ? list.length : firstDrone, 0, entry);
    } else {
      // Watch point photos: newest first, so the latest state of the place leads.
      const at = list.findIndex((p) => p.date < entry.date);
      list.splice(at === -1 ? list.length : at, 0, entry);
    }

    return {
      files: { [`public/photos/${name}`]: photo.jpeg, [jsonPath]: jsonText(data) },
      message: `Reader photo: ${where} (${photo.line}), by ${photo.credit}\n\n${note}`,
      result: { src: entry.src, ...(watchId ? { watch: watchId } : {}) },
    };
  });
}

/**
 * Edits a watch point's words and status. fields: { title, kind, status, cleared, note, sources: [url] }.
 * A cleared watch point keeps its photos and stays on the page, marked as cleared.
 */
export async function updateWatchPoint(env, line, id, fields, by) {
  return commitToMain(env, async ({ read }) => {
    const { jsonPath, data } = await readLine(read, line);
    const wp = (data.watch_points ?? []).find((w) => w.id === id);
    if (!wp) throw fail(404, `No watch point ${id} on ${line}`);
    wp.title = fields.title;
    wp.kind = fields.kind;
    wp.status = fields.status;
    if (fields.status === 'cleared') wp.cleared = fields.cleared;
    else delete wp.cleared;
    wp.note = fields.note;
    wp.sources = fields.sources;
    return {
      files: { [jsonPath]: jsonText(data) },
      message: `Watch point: ${id} (${line}), ${fields.status}\n\nEdited in the admin dashboard by ${by}.`,
      result: { watch: wp },
    };
  });
}
