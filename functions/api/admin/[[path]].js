/**
 * The moderators' side of reader submissions (functions/api/submit.js). Used by the /admin/ page and by
 * scripts/submissions.mjs. Login: Cloudflare Access, or the owner's ADMIN_TOKEN (server/admin-auth.js).
 *
 *   GET  /api/admin/me                         who is logged in
 *   GET  /api/admin/list?state=queue           meta.json of every entry in queue/, approved/ or rejected/
 *   GET  /api/admin/file?key=queue/<id>/01.jpg one stored file
 *   POST /api/admin/move {"id", "from", "to"}  approve or reject an entry
 *   POST /api/admin/publish (multipart)        commit a cleaned photo to a station page or a watch point (server/github-publish.js)
 *   GET  /api/admin/watch?line=line-2b         the line's watch points as main has them now
 *   POST /api/admin/watch {"line", "id", ...}  edit a watch point's title, kind, status, note and sources
 *
 * Bindings: SUBMISSIONS (R2). Secrets: ADMIN_TOKEN, GITHUB_TOKEN. Vars: ACCESS_TEAM_DOMAIN, ACCESS_AUD.
 */
import { adminUser } from '../../../server/admin-auth.js';
import { cleanJpegInfo, publishPhoto, readWatchPoints, updateWatchPoint, WATCH_KINDS } from '../../../server/github-publish.js';

const STATES = ['queue', 'approved', 'rejected'];
const ENTRY_RE = /^\d{8}-\d{6}-[0-9a-f]{6}$/;
const ID_RE = /^[a-z0-9-]{1,40}$/;

const json = (body, status = 200) => Response.json(body, { status, headers: { 'cache-control': 'no-store' } });
const clean = (v, max) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');

async function listKeys(bucket, prefix) {
  const keys = [];
  let cursor;
  do {
    const page = await bucket.list({ prefix, cursor });
    keys.push(...page.objects.map((o) => o.key));
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  return keys;
}

async function readMeta(bucket, state, id) {
  const obj = await bucket.get(`${state}/${id}/meta.json`);
  return obj ? obj.json() : null;
}
const writeMeta = (bucket, state, meta) =>
  bucket.put(`${state}/${meta.id}/meta.json`, JSON.stringify(meta, null, 2), { httpMetadata: { contentType: 'application/json' } });

export async function onRequest({ request, env, params }) {
  const user = await adminUser(request, env);
  if (!user) return json({ ok: false, error: 'unauthorised' }, 401);
  const bucket = env.SUBMISSIONS;
  const action = (params.path ?? []).join('/');
  const url = new URL(request.url);

  if (request.method === 'GET' && action === 'me') return json({ ok: true, email: user.email, via: user.via });

  if (request.method === 'GET' && action === 'list') {
    const state = url.searchParams.get('state') ?? 'queue';
    if (!STATES.includes(state)) return json({ ok: false, error: 'bad-state' }, 400);
    const metas = (await listKeys(bucket, `${state}/`)).filter((k) => k.endsWith('/meta.json'));
    const entries = await Promise.all(metas.map(async (k) => (await bucket.get(k))?.json()));
    return json({ ok: true, state, entries: entries.filter(Boolean).sort((p, q) => p.id.localeCompare(q.id)) });
  }

  if (request.method === 'GET' && action === 'file') {
    const key = url.searchParams.get('key') ?? '';
    if (!STATES.some((s) => key.startsWith(`${s}/`)) || key.includes('..')) return json({ ok: false, error: 'bad-key' }, 400);
    const obj = await bucket.get(key);
    if (!obj) return json({ ok: false, error: 'not-found' }, 404);
    return new Response(obj.body, {
      headers: { 'content-type': obj.httpMetadata?.contentType ?? 'application/octet-stream', 'cache-control': 'private, no-store' },
    });
  }

  if (request.method === 'POST' && action === 'move') {
    const { id, from = 'queue', to } = await request.json().catch(() => ({}));
    if (!ENTRY_RE.test(id ?? '') || !STATES.includes(from) || !STATES.includes(to) || from === to) {
      return json({ ok: false, error: 'bad-move' }, 400);
    }
    const keys = await listKeys(bucket, `${from}/${id}/`);
    if (keys.length === 0) return json({ ok: false, error: 'not-found' }, 404);
    for (const key of keys) {
      const obj = await bucket.get(key);
      const newKey = `${to}/${key.slice(from.length + 1)}`;
      if (key.endsWith('/meta.json')) {
        // Keep the decision, who made it and when with the entry, and point the file list at the new place.
        const meta = await obj.json();
        meta.state = to;
        meta.moved_at = new Date().toISOString();
        meta.moved_by = user.email;
        meta.files = (meta.files ?? []).map((f) => ({ ...f, key: `${to}/${f.key.slice(from.length + 1)}` }));
        await bucket.put(newKey, JSON.stringify(meta, null, 2), { httpMetadata: { contentType: 'application/json' } });
      } else {
        await bucket.put(newKey, obj.body, { httpMetadata: obj.httpMetadata });
      }
    }
    await bucket.delete(keys);
    return json({ ok: true, id, state: to });
  }

  if (request.method === 'POST' && action === 'publish') {
    const form = await request.formData().catch(() => null);
    if (!form) return json({ ok: false, error: 'bad-form' }, 400);
    const id = clean(form.get('id'), 40);
    const fileKey = clean(form.get('file_key'), 120);
    const line = clean(form.get('line'), 40);
    const station = clean(form.get('station'), 40);
    const target = clean(form.get('target'), 10) || 'station';
    const watchId = clean(form.get('watch_id'), 40);
    const watchTitle = clean(form.get('watch_title'), 80);
    const watchKind = clean(form.get('watch_kind'), 20);
    const place = clean(form.get('watch_place'), 60).match(/^(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)$/);
    const date = clean(form.get('date'), 10);
    const alt = clean(form.get('alt'), 300);
    const caption = clean(form.get('caption'), 200);
    const credit = clean(form.get('credit'), 80);
    const handle = clean(form.get('handle'), 15).replace(/^@/, '');
    const sourceUrl = clean(form.get('source_url'), 300);
    const image = form.get('image');

    const today = new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
    const problems = [];
    if (!ENTRY_RE.test(id)) problems.push('entry');
    if (!ID_RE.test(line)) problems.push('line');
    if (target === 'station' && !ID_RE.test(station)) problems.push('station');
    if (target === 'watch' && watchId && !ID_RE.test(watchId)) problems.push('watch point');
    if (target === 'watch' && !watchId) {
      if (watchTitle.length < 4) problems.push('watch point title');
      if (!WATCH_KINDS.includes(watchKind)) problems.push('watch point kind');
      const [lat, lng] = place ? [+place[1], +place[2]] : [NaN, NaN];
      if (!(lat > 18.8 && lat < 19.5 && lng > 72.7 && lng < 73.3)) problems.push('place (latitude, longitude in Mumbai)');
    }
    if (!['station', 'watch'].includes(target)) problems.push('target');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > today || date < '2015-01-01') problems.push('date');
    if (alt.length < 10) problems.push('alt text (at least 10 characters)');
    if (!credit) problems.push('credit');
    if (handle && !/^[A-Za-z0-9_]{1,15}$/.test(handle)) problems.push('X handle');
    if (sourceUrl && !/^https:\/\/[^\s]+$/.test(sourceUrl)) problems.push('link (https only)');
    if (!image || typeof image !== 'object' || image.size === 0 || image.size > 3 * 1024 * 1024) problems.push('image');
    if (problems.length) return json({ ok: false, error: `Check: ${problems.join(', ')}` }, 400);

    // A moderator may approve an entry first and publish its photos later.
    let from = 'queue';
    let meta = await readMeta(bucket, from, id);
    if (!meta) meta = await readMeta(bucket, (from = 'approved'), id);
    if (!meta) return json({ ok: false, error: 'The entry is not in the queue or in Approved.' }, 404);

    const jpeg = new Uint8Array(await image.arrayBuffer());
    const info = cleanJpegInfo(jpeg);
    if (info.error) return json({ ok: false, error: `The image was refused (${info.error}). Export it again from the editor.` }, 400);

    try {
      const out = await publishPhoto(
        env,
        {
          line,
          ...(target === 'station'
            ? { station }
            : { watch: watchId ? { id: watchId } : { title: watchTitle, kind: watchKind, lat: +place[1], lng: +place[2] } }),
          date,
          alt,
          caption,
          credit,
          handle,
          source_url: sourceUrl,
          jpeg,
          width: info.width,
          height: info.height,
        },
        `Sent with the reader form (entry ${id}) and approved in the admin dashboard. Location data removed.`,
      );
      meta.published = [
        ...(meta.published ?? []),
        { file: fileKey, src: out.src, ...(out.watch ? { watch: out.watch } : {}), commit: out.commit, by: user.email, at: new Date().toISOString() },
      ];
      await writeMeta(bucket, from, meta);
      return json({ ok: true, ...out });
    } catch (err) {
      return json({ ok: false, error: err.message }, err.status && err.status < 500 ? err.status : 502);
    }
  }

  if (action === 'watch') {
    try {
      if (request.method === 'GET') {
        const line = url.searchParams.get('line') ?? '';
        if (!ID_RE.test(line)) return json({ ok: false, error: 'bad-line' }, 400);
        return json({ ok: true, line, watch_points: await readWatchPoints(env, line) });
      }
      if (request.method === 'POST') {
        const b = await request.json().catch(() => ({}));
        const line = clean(b.line, 40);
        const id = clean(b.id, 40);
        const fields = {
          title: clean(b.title, 80),
          kind: clean(b.kind, 20),
          status: clean(b.status, 10),
          cleared: clean(b.cleared, 10),
          note: clean(b.note, 600),
          sources: (Array.isArray(b.sources) ? b.sources : []).map((u) => clean(u, 300)).filter(Boolean).slice(0, 8),
        };
        const problems = [];
        if (!ID_RE.test(line) || !ID_RE.test(id)) problems.push('line or id');
        if (fields.title.length < 4) problems.push('title');
        if (!WATCH_KINDS.includes(fields.kind)) problems.push('kind');
        if (!['open', 'cleared'].includes(fields.status)) problems.push('status');
        if (fields.status === 'cleared' && !/^\d{4}-\d{2}-\d{2}$/.test(fields.cleared)) problems.push('date cleared');
        if (fields.sources.some((u) => !/^https:\/\/[^\s]+$/.test(u))) problems.push('source links (https only)');
        if (fields.sources.some((u) => /wikipedia\.org/i.test(u))) problems.push('source links (no Wikipedia)');
        if (problems.length) return json({ ok: false, error: `Check: ${problems.join(', ')}` }, 400);
        return json({ ok: true, ...(await updateWatchPoint(env, line, id, fields, user.email)) });
      }
    } catch (err) {
      return json({ ok: false, error: err.message }, err.status && err.status < 500 ? err.status : 502);
    }
  }

  return json({ ok: false, error: 'not-found' }, 404);
}
