// The sitemap, built from the data so every station page is listed. lastmod is the day the facts
// were last checked, not the build date, so search engines only see a change when facts change.
import type { APIRoute } from 'astro';
import { getLine, lines, lineBase, lastReviewed as siteReviewed } from '../lib/data';
import { hasStatusPage } from '../lib/answers';

export const GET: APIRoute = ({ site }) => {
  const url = (path: string) => new URL(path, site).toString();
  const pages: { loc: string; lastmod: string; priority: string }[] = [
    { loc: url('/'), lastmod: siteReviewed, priority: '1.0' },
    ...lines.flatMap(({ id }) => {
      const line = getLine(id);
      const base = lineBase(id);
      return [
        { loc: url(base), lastmod: line.lastReviewed, priority: '1.0' },
        ...(hasStatusPage(line) ? [{ loc: url(`${base}status/`), lastmod: line.lastReviewed, priority: '0.9' }] : []),
        { loc: url(`${base}stations/`), lastmod: line.lastReviewed, priority: '0.8' },
        ...[...line.stations, ...line.spurStations].map((s) => ({ loc: url(`${base}stations/${s.id}/`), lastmod: s.last_verified, priority: '0.7' })),
      ];
    }),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${p.loc}</loc><lastmod>${p.lastmod}</lastmod><priority>${p.priority}</priority></url>`).join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
