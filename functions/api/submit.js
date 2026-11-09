/**
 * POST /api/submit: a reader sends photos or an update about a line or a station (the form at /send/).
 *
 * Nothing here goes public. Each entry lands in the private R2 bucket under queue/<id>/, as meta.json plus the
 * photos as sent (with their EXIF, which the owner needs to match a photo to a station). The owner reviews the
 * queue with `npm run submissions` and publishes approved photos by hand: EXIF stripped, plates blurred, credited.
 *
 * Bindings (wrangler.toml and the Pages dashboard):
 *   SUBMISSIONS        R2 bucket
 *   TURNSTILE_SECRET   secret key of the Turnstile widget on /send/
 */

const MAX_FILES = 5;
const MAX_FILE_BYTES = 12 * 1024 * 1024;
const MAX_NOTE = 2000;
const ID_RE = /^[a-z0-9-]{1,40}$/;

/** The image types the form takes, told apart by their first bytes (the browser's type can lie). */
function sniff(bytes) {
  const b = bytes;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { type: 'image/jpeg', ext: 'jpg' };
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return { type: 'image/png', ext: 'png' };
  const ascii = (from, to) => String.fromCharCode(...b.slice(from, to));
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return { type: 'image/webp', ext: 'webp' };
  if (ascii(4, 8) === 'ftyp' && ['heic', 'heix', 'hevc', 'heif', 'mif1', 'msf1'].includes(ascii(8, 12))) return { type: 'image/heic', ext: 'heic' };
  return null;
}

const clean = (v, max) => (typeof v === 'string' ? v.replace(/\r\n/g, '\n').trim().slice(0, max) : '');

/** India time, so the id sorts and reads like the dates on the site. */
function newId() {
  const ist = new Date(Date.now() + 5.5 * 3600 * 1000).toISOString();
  const stamp = ist.slice(0, 19).replace(/[-:]/g, '').replace('T', '-');
  const rand = crypto.getRandomValues(new Uint8Array(3));
  return `${stamp}-${[...rand].map((n) => n.toString(16).padStart(2, '0')).join('')}`;
}

async function turnstileOk(token, secret, ip) {
  if (!token || !secret) return false;
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  const out = await res.json().catch(() => ({}));
  return out.success === true;
}

/** A form post goes back to the form; a script asking for JSON gets JSON. */
function reply(request, status, payload, back) {
  if ((request.headers.get('accept') ?? '').includes('application/json')) {
    return Response.json(payload, { status, headers: { 'cache-control': 'no-store' } });
  }
  const to = new URL('/send/', request.url);
  for (const [k, v] of Object.entries(back)) if (v) to.searchParams.set(k, v);
  if (payload.ok) to.searchParams.set('sent', '1');
  else to.searchParams.set('error', payload.error);
  return Response.redirect(to.toString(), 303);
}

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: { allow: 'POST' } });
  let form;
  try {
    form = await request.formData();
  } catch {
    return reply(request, 400, { ok: false, error: 'bad-form' }, {});
  }

  const line = clean(form.get('line'), 40);
  const station = clean(form.get('station'), 40);
  const back = { line: ID_RE.test(line) ? line : '', station: ID_RE.test(station) ? station : '' };
  const fail = (status, error) => reply(request, status, { ok: false, error }, back);

  // A hidden field people do not see. Bots fill it in.
  if (clean(form.get('website'), 200)) return fail(400, 'bad-form');

  if (!ID_RE.test(line)) return fail(400, 'no-line');
  if (station && !ID_RE.test(station)) return fail(400, 'bad-form');

  const ip = request.headers.get('cf-connecting-ip');
  if (!(await turnstileOk(clean(form.get('cf-turnstile-response'), 2048), env.TURNSTILE_SECRET, ip))) {
    return fail(403, 'check-failed');
  }

  const note = clean(form.get('note'), MAX_NOTE);
  const name = clean(form.get('name'), 80);
  const handle = clean(form.get('handle'), 60).replace(/^@/, '');
  const taken = clean(form.get('taken'), 10);
  const consent = form.get('consent') === 'yes';

  const files = form.getAll('photos').filter((f) => typeof f === 'object' && f && f.size > 0);
  if (files.length > MAX_FILES) return fail(400, 'too-many');
  if (files.some((f) => f.size > MAX_FILE_BYTES)) return fail(400, 'too-big');
  if (files.length === 0 && note.length < 10) return fail(400, 'empty');
  if (files.length > 0 && !consent) return fail(400, 'no-consent');
  if (!name) return fail(400, 'no-name');

  // Check every file before storing any, so a bad file leaves nothing behind.
  const kinds = [];
  for (const f of files) {
    const kind = sniff(new Uint8Array(await f.slice(0, 16).arrayBuffer()));
    if (!kind) return fail(400, 'not-image');
    kinds.push(kind);
  }

  const id = newId();
  const stored = [];
  for (const [i, f] of files.entries()) {
    const key = `queue/${id}/${String(i + 1).padStart(2, '0')}.${kinds[i].ext}`;
    await env.SUBMISSIONS.put(key, f, { httpMetadata: { contentType: kinds[i].type } });
    stored.push({ key, type: kinds[i].type, bytes: f.size, original_name: clean(f.name, 120) });
  }

  const meta = {
    id,
    received_at: new Date().toISOString(),
    line,
    station: station || null,
    note,
    name,
    handle: handle || null,
    taken: /^\d{4}-\d{2}(-\d{2})?$/.test(taken) ? taken : null,
    consent,
    files: stored,
    // Coarse only, to spot spam waves. No IP address is kept.
    country: request.cf?.country ?? null,
  };
  await env.SUBMISSIONS.put(`queue/${id}/meta.json`, JSON.stringify(meta, null, 2), {
    httpMetadata: { contentType: 'application/json' },
  });

  return reply(request, 200, { ok: true, id }, back);
}
