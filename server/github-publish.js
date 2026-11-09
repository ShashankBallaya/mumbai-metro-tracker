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

/**
 * photo: { line, station, date, alt, caption?, credit, handle?, source_url?, jpeg: Uint8Array, width, height }
 * note:  extra lines for the commit message.
 * Returns { src, commit, url }.
 */
export async function publishPhoto(env, photo, note) {
  if (!env.GITHUB_TOKEN) throw Object.assign(new Error('GITHUB_TOKEN is not set'), { status: 500 });
  const gh = client(env);

  for (let attempt = 0; attempt < 2; attempt++) {
    const head = await ok(await gh(`git/ref/heads/${BRANCH}`), 'ref');
    const base = await ok(await gh(`git/commits/${head.object.sha}`), 'commit');

    // The station must be on the line as main has it now.
    const stationsRes = await gh(`contents/src/data/lines/${photo.line}/stations.json?ref=${head.object.sha}`);
    if (stationsRes.status === 404) throw Object.assign(new Error(`No line ${photo.line}`), { status: 400 });
    const stationsFile = JSON.parse(fromBase64Utf8((await ok(stationsRes, 'stations.json')).content));
    const known = [...(stationsFile.stations ?? []), ...(stationsFile.spur_stations ?? [])].some((s) => s.id === photo.station);
    if (!known) throw Object.assign(new Error(`No station ${photo.station} on ${photo.line}`), { status: 400 });

    const jsonPath = `src/data/lines/${photo.line}/photos.json`;
    const jsonRes = await gh(`contents/${jsonPath}?ref=${head.object.sha}`);
    let data;
    if (jsonRes.status === 404) data = { _meta: { ...PHOTOS_META, last_reviewed: photo.date }, pairs: [], stations: {} };
    else data = JSON.parse(fromBase64Utf8((await ok(jsonRes, 'photos.json')).content));
    data.stations ??= {};
    const list = (data.stations[photo.station] ??= []);

    // <station>-<date>-a.jpg, then -b, -c... the first name not in use anywhere in public/photos.
    let name;
    for (const letter of 'abcdefghijklmnopqrstuvwxyz') {
      const candidate = `${photo.station}-${photo.date}-${letter}.jpg`;
      if (list.some((p) => p.src === `/photos/${candidate}`)) continue;
      const exists = await gh(`contents/public/photos/${candidate}?ref=${head.object.sha}`, { method: 'HEAD' });
      if (exists.status === 404) {
        name = candidate;
        break;
      }
    }
    if (!name) throw Object.assign(new Error('No free file name for this station and date'), { status: 409 });

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
    // Ground photos go before drone stills, so a ground photo leads the station page.
    const firstDrone = list.findIndex((p) => p.kind === 'drone');
    list.splice(firstDrone === -1 ? list.length : firstDrone, 0, entry);

    const imgBlob = await ok(await gh('git/blobs', { method: 'POST', body: JSON.stringify({ content: toBase64(photo.jpeg), encoding: 'base64' }) }), 'image blob');
    const jsonBlob = await ok(
      await gh('git/blobs', { method: 'POST', body: JSON.stringify({ content: `${JSON.stringify(data, null, 2)}\n`, encoding: 'utf-8' }) }),
      'json blob',
    );
    const tree = await ok(
      await gh('git/trees', {
        method: 'POST',
        body: JSON.stringify({
          base_tree: base.tree.sha,
          tree: [
            { path: `public/photos/${name}`, mode: '100644', type: 'blob', sha: imgBlob.sha },
            { path: jsonPath, mode: '100644', type: 'blob', sha: jsonBlob.sha },
          ],
        }),
      }),
      'tree',
    );
    const message = `Reader photo: ${photo.station} (${photo.line}), by ${photo.credit}\n\n${note}`;
    const commit = await ok(await gh('git/commits', { method: 'POST', body: JSON.stringify({ message, tree: tree.sha, parents: [head.object.sha] }) }), 'new commit');
    const moved = await gh(`git/refs/heads/${BRANCH}`, { method: 'PATCH', body: JSON.stringify({ sha: commit.sha, force: false }) });
    // Someone pushed in the meantime: start again from the new head.
    if (moved.status === 422 && attempt === 0) continue;
    await ok(moved, 'update main');
    return { src: entry.src, commit: commit.sha, url: commit.html_url };
  }
  throw Object.assign(new Error('main kept moving; try again'), { status: 409 });
}
