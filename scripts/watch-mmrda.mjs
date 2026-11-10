// Watches MMRDA's own website for changes: new press releases, tenders and circulars, new documents,
// and new progress figures on the Metro line pages ("Present Status").
// Keeps what it last saw in scripts/data/mmrda-watch.json. When a page changes, it writes a short
// report to the file named by WATCH_REPORT (the workflow turns it into a GitHub issue, which emails the owner).
// The first time it sees a page it only records it, so the first run does not report everything.
// Run: node scripts/watch-mmrda.mjs   (Node's own modules only)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SITE = 'https://mmrda.maharashtra.gov.in';
const STATE = fileURLToPath(new URL('./data/mmrda-watch.json', import.meta.url));
// mode "text": report added and removed lines of the page's content block, and new document links.
// mode "links": report new document links only (for pages with text that changes on its own).
const PAGES = [
  { name: 'Press releases and news', path: '/en/other-services/news-and-announcements', mode: 'text' },
  { name: 'Tenders and notices', path: '/en/tenders/tender-notices', mode: 'text' },
  { name: 'Metro PIU tenders (archive)', path: '/en/tenders/tender-notices/archive?field_division_target_id=423', mode: 'links' },
  { name: 'Circulars and notifications', path: '/en/other-services/circulars-notifications', mode: 'text' },
  { name: 'Home page', path: '/en', mode: 'links' },
  { name: 'Metro Line 2B', path: '/en/projects/transport/metro-line-2b/overview', mode: 'text' },
  { name: 'Metro Line 4', path: '/en/projects/transport/metro-line-4/overview', mode: 'text' },
  { name: 'Metro Line 4A', path: '/en/projects/transport/metro-line-4-A/metro-line-4', mode: 'text' },
  { name: 'Metro Line 5', path: '/en/projects/transport/metro-line-5/overview', mode: 'text' },
  { name: 'Metro Line 6', path: '/en/projects/transport/metro-line-6/overview', mode: 'text' },
  { name: 'Metro Line 7', path: '/en/projects/transport/metro-line-7/overview', mode: 'text' },
  { name: 'Metro Lines 9 and 7A', path: '/en/projects/transport/metro-line-9/overview', mode: 'text' },
  { name: 'Metro Line 12', path: '/en/projects/transport/metro-line-12/overview', mode: 'text' },
];

const decode = (s) =>
  s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&mdash;|—/g, '-'); // house style: no em dashes, even in copied text

/** The page's own content block: the right-hand column, up to the footer links. */
function contentBlock(html, path) {
  if (path === '/en') {
    // The home page has no content column; take everything between the menu and the footer.
    const i = html.indexOf('id="skipCont"');
    return html.slice(i > 0 ? i : 0, html.lastIndexOf('aaplesarkar.maharashtra.gov.in'));
  }
  const i = html.indexOf('inner-page-content');
  if (i < 0) return null;
  const j = html.indexOf('aaplesarkar.maharashtra.gov.in', i);
  return html.slice(i, j > i ? j : undefined);
}

const flat = (html) => decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

function linesOf(block) {
  const text = block
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    // One table row is one line, its cells joined by " | ", so a figure keeps its activity name.
    .replace(/<tr[\s\S]*?<\/tr>/gi, (row) => '\n' + [...row.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) => flat(c[1])).filter(Boolean).join(' | ') + '\n')
    .replace(/<\/(p|div|li|h[1-6]|table|ul|ol|section)>|<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');
  const out = [];
  for (const raw of decode(text).split('\n')) {
    const line = raw.replace(/\s+/g, ' ').replace(/(\s*\|\s*)+$/, '').replace(/^(\s*\|\s*)+/, '').trim();
    if (line.length > 2 && !out.includes(line)) out.push(line);
  }
  return out;
}

/** Links to documents and to item pages (news, circulars, galleries), with their link text. */
function linksOf(block) {
  const out = new Map();
  for (const m of block.matchAll(/<a\s[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const [, href, inner] = m;
    let url;
    try {
      url = new URL(decode(href), SITE + '/en/x/');
    } catch {
      continue;
    }
    if (url.hostname !== new URL(SITE).hostname) continue;
    const p = url.pathname;
    const doc = p.startsWith('/sites/default/files/') && !p.includes('/inline-images/') && !/favicon|\.(png|svg|ico)$/i.test(p);
    const item = /\/(news-and-announcements|circulars-notifications|photo-gallery|videogallery|tender-notices)\/(?!archive)[^/]+$/.test(p);
    if (!doc && !item) continue;
    let label = flat(inner);
    // "Download (2 MB)" says nothing: use the text of the table row the link sits in.
    if (!label || /^(download|view|click|read more|details)/i.test(label)) {
      const row = block.lastIndexOf('<tr', m.index);
      if (row >= 0 && m.index - row < 4000) label = flat(block.slice(row, m.index)).slice(-200) || label;
    }
    const key = url.origin + url.pathname;
    if (!out.has(key) || (label && !out.get(key))) out.set(key, label);
  }
  return Object.fromEntries(out);
}

async function get(path) {
  const res = await fetch(SITE + path, {
    headers: { 'User-Agent': 'mumbaimetrotracker.com update check (+https://www.mumbaimetrotracker.com/)' },
    signal: AbortSignal.timeout(45_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

const state = existsSync(STATE) ? JSON.parse(readFileSync(STATE, 'utf8')) : { pages: {} };
const sections = [];
let ok = 0;
for (const page of PAGES) {
  let html;
  try {
    html = await get(page.path);
  } catch (e) {
    console.warn(`${page.name}: skipped (${e.cause?.code ?? e.message})`);
    continue;
  }
  const block = contentBlock(html, page.path);
  if (!block) {
    console.warn(`${page.name}: no content block found (the page layout may have changed)`);
    continue;
  }
  ok++;
  const now = { lines: page.mode === 'text' ? linesOf(block) : [], links: linksOf(block) };
  const before = state.pages[page.path];
  state.pages[page.path] = now;
  if (!before) {
    console.log(`${page.name}: first look, recorded ${now.lines.length} lines and ${Object.keys(now.links).length} links`);
    continue;
  }
  const newLinks = Object.entries(now.links).filter(([u]) => !(u in before.links));
  const added = now.lines.filter((l) => !before.lines.includes(l));
  const removed = before.lines.filter((l) => !now.lines.includes(l));
  console.log(`${page.name}: ${newLinks.length} new links, ${added.length} lines added, ${removed.length} removed`);
  if (!newLinks.length && !added.length && !removed.length) continue;
  const cut = (s) => (s.length > 300 ? s.slice(0, 297) + '...' : s);
  const parts = [`### ${page.name}`, `${SITE}${page.path}`, ''];
  if (newLinks.length) parts.push('New documents and items:', ...newLinks.slice(0, 20).map(([u, t]) => `- [${t || u.split('/').pop()}](${u})`), '');
  if (added.length) parts.push('New text:', ...added.slice(0, 25).map((l) => `- ${cut(l)}`), '');
  if (removed.length) parts.push('Text taken off:', ...removed.slice(0, 15).map((l) => `- ~~${cut(l)}~~`), '');
  sections.push(parts.join('\n'));
}

if (ok === 0) {
  console.error('Could not read any MMRDA page.');
  process.exit(1);
}
// No check date in the file: it changes only when MMRDA's pages change, so the job commits only then.
writeFileSync(STATE, JSON.stringify(state, null, 2) + '\n');
if (sections.length && process.env.WATCH_REPORT) {
  writeFileSync(process.env.WATCH_REPORT, sections.join('\n\n') + '\n');
}
console.log(sections.length ? `${sections.length} page(s) changed.` : 'No changes.');
