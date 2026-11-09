/**
 * The moderators' side of reader submissions (functions/api/submit.js). Used by the /admin/ page and by
 * scripts/submissions.mjs. Login: Cloudflare Access, or the owner's ADMIN_TOKEN (server/admin-auth.js).
 *
 *   GET  /api/admin/me                         who is logged in
 *   GET  /api/admin/list?state=queue           meta.json of every entry in queue/, approved/ or rejected/
 *   GET  /api/admin/file?key=queue/<id>/01.jpg one stored file
 *   POST /api/admin/move {"id", "from", "to"}  approve or reject an entry
 *   POST /api/admin/publish (multipart)        commit a cleaned photo to the station page (server/github-publish.js)
 *
 * Bindings: SUBMISSIONS (R2). Secrets: ADMIN_TOKEN, GITHUB_TOKEN. Vars: ACCESS_TEAM_DOMAIN, ACCESS_AUD.
 */
import { adminUser } from '../../../server/admin-auth.js';
import { cleanJpegInfo, publishPhoto } from '../../../server/github-publish.js';

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
    if (!ID_RE.test(line) || !ID_RE.test(station)) problems.push('line or station');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > today || date < '2015-01-01') problems.push('date');
    if (alt.length < 10) problems.push('alt text (at least 10 characters)');
    if (!credit) problems.push('credit');
    if (handle && !/^[A-Za-z0-9_]{1,15}$/.test(handle)) problems.push('X handle');
    if (sourceUrl && !/^https:\/\/[^\s]+$/.test(sourceUrl)) problems.push('link (https only)');
    if (!image || typeof image !== 'object' || image.size === 0 || image.size > 3 * 1024 * 1024) problems.push('image');
    if (problems.length) return json({ ok: false, error: `Check: ${problems.join(', ')}` }, 400);

    const meta = await readMeta(bucket, 'queue', id);
    if (!meta) return json({ ok: false, error: 'The entry is no longer in the queue.' }, 404);

    const jpeg = new Uint8Array(await image.arrayBuffer());
    const info = cleanJpegInfo(jpeg);
    if (info.error) return json({ ok: false, error: `The image was refused (${info.error}). Export it again from the editor.` }, 400);

    try {
      const out = await publishPhoto(
        env,
        { line, station, date, alt, caption, credit, handle, source_url: sourceUrl, jpeg, width: info.width, height: info.height },
        `Sent with the reader form (entry ${id}) and approved in the admin dashboard. Location data removed.`,
      );
      meta.published = [...(meta.published ?? []), { file: fileKey, src: out.src, commit: out.commit, by: user.email, at: new Date().toISOString() }];
      await writeMeta(bucket, 'queue', meta);
      return json({ ok: true, ...out });
    } catch (err) {
      return json({ ok: false, error: err.message }, err.status && err.status < 500 ? err.status : 502);
    }
  }

  return json({ ok: false, error: 'not-found' }, 404);
}
