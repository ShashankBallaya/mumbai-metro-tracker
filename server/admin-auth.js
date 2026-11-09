/**
 * Who is calling the admin API (functions/api/admin/[[path]].js). Two ways in:
 *
 * 1. Cloudflare Access, for moderators in a browser. Access guards the /admin page on
 *    www.mumbaimetrotracker.com and logs people in with a one-time email code. Its signed JWT then comes with
 *    each API call (header or CF_Authorization cookie). We check the signature, the audience and the expiry
 *    ourselves, so a request without a valid login (for example on line12-tracker.pages.dev) gets nothing.
 *    /api/admin stays outside Access, so the terminal script can still use the token below.
 *    Env: ACCESS_TEAM_DOMAIN (e.g. "metro.cloudflareaccess.com"), ACCESS_AUD (the application's AUD tag).
 *
 * 2. "Authorization: Bearer <ADMIN_TOKEN>", for the owner's terminal script (scripts/submissions.mjs).
 *
 * Returns { email, via } or null.
 */

const b64urlToBytes = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));
const b64urlToJson = (s) => JSON.parse(new TextDecoder().decode(b64urlToBytes(s)));

// Access signing keys, kept for an hour per isolate.
let certs = { at: 0, keys: [] };
async function signingKeys(team) {
  if (Date.now() - certs.at < 3600_000 && certs.keys.length) return certs.keys;
  const res = await fetch(`https://${team}/cdn-cgi/access/certs`);
  if (!res.ok) return [];
  certs = { at: Date.now(), keys: (await res.json()).keys ?? [] };
  return certs.keys;
}

/** Access adds the header on paths it guards. On /api/admin, which it does not guard, the login cookie carries the same token. */
function accessToken(request) {
  const header = request.headers.get('cf-access-jwt-assertion');
  if (header) return header;
  const cookie = request.headers.get('cookie') ?? '';
  return cookie.match(/(?:^|;\s*)CF_Authorization=([^;]+)/)?.[1] ?? null;
}

async function accessUser(request, env) {
  const jwt = accessToken(request);
  const team = env.ACCESS_TEAM_DOMAIN;
  if (!jwt || !team || !env.ACCESS_AUD) return null;
  const [h, p, s] = jwt.split('.');
  if (!h || !p || !s) return null;
  let header, payload;
  try {
    header = b64urlToJson(h);
    payload = b64urlToJson(p);
  } catch {
    return null;
  }
  if (header.alg !== 'RS256') return null;
  const jwk = (await signingKeys(team)).find((k) => k.kid === header.kid);
  if (!jwk) return null;
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64urlToBytes(s), new TextEncoder().encode(`${h}.${p}`));
  if (!ok) return null;
  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  const now = Date.now() / 1000;
  if (!aud.includes(env.ACCESS_AUD) || payload.iss !== `https://${team}` || !(payload.exp > now)) return null;
  return payload.email ? { email: String(payload.email).toLowerCase(), via: 'access' } : null;
}

/** Compares hashes, so the time taken says nothing about how much of the token was right. */
async function tokenUser(request, env) {
  const token = env.ADMIN_TOKEN;
  const given = (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!token || token.length < 24 || !given) return null;
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([given, token].map((v) => crypto.subtle.digest('SHA-256', enc.encode(v))));
  const x = new Uint8Array(a);
  const y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0 ? { email: 'owner', via: 'token' } : null;
}

export async function adminUser(request, env) {
  return (await accessUser(request, env)) ?? (await tokenUser(request, env));
}
