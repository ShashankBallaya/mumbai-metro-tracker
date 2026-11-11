#!/usr/bin/env node
/**
 * Review reader submissions (the form at /send/, stored by functions/api/submit.js in a private R2 bucket).
 *
 *   npm run submissions                 list the queue
 *   npm run submissions -- list approved
 *   npm run submissions -- pull         download every queued entry to ground/submissions/<id>/
 *   npm run submissions -- approve <id> mark it approved (it does not publish anything)
 *   npm run submissions -- reject <id>  mark it rejected
 *
 * Needs SUBMISSIONS_TOKEN (the ADMIN_TOKEN secret of the Pages project), in the environment or in .env.
 * SUBMISSIONS_URL defaults to the live site; set it to http://localhost:8788 for `wrangler pages dev`.
 *
 * Publishing an approved photo stays a hand step: originals stay in ground/ (gitignored, they carry GPS),
 * and only a resized copy with EXIF stripped and plates blurred goes to public/photos/ and photos.json.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

// Read .env without a dependency: KEY=value lines, # comments.
const envFile = join(root, '.env');
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}

const BASE = (process.env.SUBMISSIONS_URL ?? 'https://www.mumbaimetrotracker.com').replace(/\/$/, '');
const TOKEN = process.env.SUBMISSIONS_TOKEN;
if (!TOKEN) {
  console.error('Set SUBMISSIONS_TOKEN (the ADMIN_TOKEN secret) in .env or the environment.');
  process.exit(1);
}

async function api(path, init = {}) {
  const res = await fetch(`${BASE}/api/admin/${path}`, {
    ...init,
    headers: { authorization: `Bearer ${TOKEN}`, ...(init.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} on ${path}: ${body.slice(0, 200)}`);
  }
  return res;
}

const list = async (state = 'queue') => (await (await api(`list?state=${state}`)).json()).entries;

function describe(e) {
  if (e.kind === 'correction') {
    const who = e.name ? (e.handle ? `${e.name} (@${e.handle})` : e.name) : e.handle ? `@${e.handle}` : 'no name';
    const cut = (t) => t.replace(/\s+/g, ' ').slice(0, 160) + (t.length > 160 ? '…' : '');
    return `  ${e.id}  CORRECTION ${e.page}  by ${who}
    wrong: "${cut(e.wrong)}"${e.right ? `
    right: "${cut(e.right)}"` : ''}${e.source ? `
    source: ${e.source}` : ''}`;
  }
  const where = e.station ? `${e.line} / ${e.station}` : e.line;
  const who = e.handle ? `${e.name} (@${e.handle})` : e.name;
  const files = e.files.length ? `${e.files.length} photo${e.files.length > 1 ? 's' : ''}` : 'no photos';
  const note = e.note ? `\n    "${e.note.replace(/\s+/g, ' ').slice(0, 160)}${e.note.length > 160 ? '…' : ''}"` : '';
  return `  ${e.id}  ${where}  ${files}  by ${who}${e.taken ? `, taken ${e.taken}` : ''}${note}`;
}

const [cmd = 'list', arg] = process.argv.slice(2);

if (cmd === 'list') {
  const state = arg ?? 'queue';
  const entries = await list(state);
  console.log(`${entries.length} in ${state}`);
  for (const e of entries) console.log(describe(e));
} else if (cmd === 'pull') {
  const entries = await list('queue');
  for (const e of entries) {
    const dir = join(root, 'ground', 'submissions', e.id);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'meta.json'), JSON.stringify(e, null, 2));
    for (const f of e.files) {
      const out = join(dir, f.key.split('/').pop());
      if (existsSync(out)) continue;
      const res = await api(`file?key=${encodeURIComponent(f.key)}`);
      writeFileSync(out, Buffer.from(await res.arrayBuffer()));
    }
    console.log(`${describe(e)}\n    -> ${dir}`);
  }
  if (entries.length === 0) console.log('The queue is empty.');
} else if (cmd === 'approve' || cmd === 'reject') {
  if (!arg) {
    console.error(`Usage: npm run submissions -- ${cmd} <id>`);
    process.exit(1);
  }
  const to = cmd === 'approve' ? 'approved' : 'rejected';
  await api('move', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: arg, from: 'queue', to }) });
  console.log(`${arg}: ${to}`);
} else {
  console.error('Commands: list [queue|approved|rejected], pull, approve <id>, reject <id>');
  process.exit(1);
}
