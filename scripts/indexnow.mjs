// Tells Bing (and the other IndexNow search engines: Yandex, Seznam, Naver) which pages changed,
// so they crawl them in hours, not weeks. Bing's index also feeds ChatGPT search and Copilot.
// It compares the new build's sitemap (dist/sitemap.xml) with the sitemap that was live before the
// deploy: a page is sent when it is new or its lastmod changed. The key file is public/<KEY>.txt.
// Run after the deploy:
//   node scripts/indexnow.mjs --before old-sitemap.xml   (changed pages only; the deploy workflow)
//   node scripts/indexnow.mjs --all                      (every page in dist/sitemap.xml)
//   add --dry-run to print the list and send nothing.
// Node's own modules only. A failure prints a warning and exits 0: it must never fail a deploy.
import { readFileSync, existsSync } from 'node:fs';

const HOST = 'www.mumbaimetrotracker.com';
const KEY = '4265de98287eeb656d65602999365f7e';
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const MAX = 10000; // IndexNow's limit for one request

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const all = args.includes('--all');
const beforeAt = args.indexOf('--before');
const beforeFile = beforeAt >= 0 ? args[beforeAt + 1] : null;

/** loc -> lastmod from a sitemap's text. */
function readSitemap(xml) {
  const pages = new Map();
  for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = m[1].match(/<loc>([^<]+)<\/loc>/)?.[1]?.trim();
    const lastmod = m[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]?.trim() ?? '';
    if (loc) pages.set(loc, lastmod);
  }
  return pages;
}

const now = readSitemap(readFileSync(new URL('../dist/sitemap.xml', import.meta.url), 'utf8'));
let urls;
if (all) {
  urls = [...now.keys()];
} else {
  if (!beforeFile || !existsSync(beforeFile)) {
    console.log('IndexNow: no earlier sitemap to compare with, nothing sent (use --all for every page).');
    process.exit(0);
  }
  const before = readSitemap(readFileSync(beforeFile, 'utf8'));
  if (before.size === 0) {
    console.log('IndexNow: the earlier sitemap is empty or unreadable, nothing sent.');
    process.exit(0);
  }
  urls = [...now].filter(([loc, lastmod]) => before.get(loc) !== lastmod).map(([loc]) => loc);
}
urls = urls.filter((u) => new URL(u).host === HOST).slice(0, MAX);

if (urls.length === 0) {
  console.log('IndexNow: no new or changed pages.');
  process.exit(0);
}
console.log(`IndexNow: ${urls.length} page(s)${dryRun ? ' (dry run, not sent)' : ''}:`);
for (const u of urls) console.log(`  ${u}`);
if (dryRun) process.exit(0);

try {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }),
  });
  // 200 and 202 mean received. 403: key file not found or wrong. 422: a URL is not on the host.
  console.log(`IndexNow: answer ${res.status} ${res.statusText}`);
  if (!res.ok) console.log(`::warning::IndexNow answered ${res.status}: ${(await res.text()).slice(0, 300)}`);
} catch (err) {
  console.log(`::warning::IndexNow request failed: ${err.message}`);
}
