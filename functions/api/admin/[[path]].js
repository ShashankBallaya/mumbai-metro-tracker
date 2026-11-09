/**
 * The owner's side of reader submissions (functions/api/submit.js). Used by scripts/submissions.mjs.
 * Every call needs "Authorization: Bearer <ADMIN_TOKEN>".
 *
 *   GET  /api/admin/list?state=queue        meta.json of every entry in queue/, approved/ or rejected/
 *   GET  /api/admin/file?key=queue/<id>/01.jpg   one stored file
 *   POST /api/admin/move  {"id", "from", "to"}   move an entry between states (approve or reject it)
 *
 * Bindings: SUBMISSIONS (R2 bucket), ADMIN_TOKEN (secret).
 */

const STATES = ['queue', 'approved', 'rejected'];
const ID_RE = /^\d{8}-\d{6}-[0-9a-f]{6}$/;

const json = (body, status = 200) => Response.json(body, { status, headers: { 'cache-control': 'no-store' } });

/** Compares hashes, so the time taken says nothing about how much of the token was right. */
async function authorised(request, token) {
  if (!token || token.length < 24) return false;
  const given = (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([given, token].map((s) => crypto.subtle.digest('SHA-256', enc.encode(s))));
  const x = new Uint8Array(a);
  const y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

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

export async function onRequest({ request, env, params }) {
  if (!(await authorised(request, env.ADMIN_TOKEN))) return json({ ok: false, error: 'unauthorised' }, 401);
  const bucket = env.SUBMISSIONS;
  const action = (params.path ?? []).join('/');
  const url = new URL(request.url);

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
      headers: { 'content-type': obj.httpMetadata?.contentType ?? 'application/octet-stream', 'cache-control': 'no-store' },
    });
  }

  if (request.method === 'POST' && action === 'move') {
    const { id, from = 'queue', to } = await request.json().catch(() => ({}));
    if (!ID_RE.test(id ?? '') || !STATES.includes(from) || !STATES.includes(to) || from === to) {
      return json({ ok: false, error: 'bad-move' }, 400);
    }
    const keys = await listKeys(bucket, `${from}/${id}/`);
    if (keys.length === 0) return json({ ok: false, error: 'not-found' }, 404);
    for (const key of keys) {
      const obj = await bucket.get(key);
      const newKey = `${to}/${key.slice(from.length + 1)}`;
      if (key.endsWith('/meta.json')) {
        // Keep the decision and its date with the entry, and point the file list at the new place.
        const meta = await obj.json();
        meta.state = to;
        meta.moved_at = new Date().toISOString();
        meta.files = (meta.files ?? []).map((f) => ({ ...f, key: `${to}/${f.key.slice(from.length + 1)}` }));
        await bucket.put(newKey, JSON.stringify(meta, null, 2), { httpMetadata: { contentType: 'application/json' } });
      } else {
        await bucket.put(newKey, obj.body, { httpMetadata: obj.httpMetadata });
      }
    }
    await bucket.delete(keys);
    return json({ ok: true, id, state: to });
  }

  return json({ ok: false, error: 'not-found' }, 404);
}
