// llms.txt: a plain summary of the site for AI assistants and answer engines (llmstxt.org).
// Built from the same data as the pages, so it never drifts from them.
import type { APIRoute } from 'astro';
import { getLine, lineBase, formatDate, inr, lastReviewed as siteReviewed, SITE_NAME } from '../lib/data';
import { hasStatusPage } from '../lib/answers';

export const GET: APIRoute = ({ site }) => {
  const url = (path: string) => new URL(path, site).toString();
  const { project, stations } = getLine('line-12');
  const p = project;
  const t = p.target_completion;
  const prog = p.progress;
  const line5 = getLine('line-5');
  const p5 = line5.project as typeof line5.project & { phases: { phase: number | string; value: string; length_km: number }[] };
  const t5 = p5.target_completion as typeof p5.target_completion & { scope: string; rest_of_line?: { value: string } };
  const b12 = lineBase('line-12');
  const b5 = lineBase('line-5');
  const all5 = [...line5.stations, ...line5.spurStations];
  const line4 = getLine('line-4');
  const p4 = line4.project as typeof line4.project & { length_km: { with_4a_km: number }; target_completion: { scope: string } };
  const b4 = lineBase('line-4');
  const body = `# ${SITE_NAME}

> An unofficial, sourced tracker for the Mumbai Metro lines MMRDA is building around Kalyan and Thane: Line 12 (Kalyan to Taloja), Line 5 (Thane to Kalyan) and Line 4 with Line 4A (Wadala to Thane and Gaimukh). Every fact carries a grade (verified, reported, unverified, sources conflict) and a source link. Facts last checked ${formatDate(siteReviewed)}. Not affiliated with MMRDA.

- [${SITE_NAME}](${url('/')}): every line on one page.

## Line 12: key facts

- Name: ${p.name.value}, also called ${p.name.also_known_as.join(', ')}.
- Route: ${p.route.value}.
- Length: ${p.length_km.value} km, fully elevated, ${p.stations_count.value} stations (MMRDA, verified).
- Opening: no official date. Latest reported target ${formatDate(t.value)}; earlier reported target ${formatDate(t.alternatives[0].value)} (sources conflict).
- Progress (MMRDA, ${formatDate(prog.as_of)}): ${prog.items.map((i) => `${i.activity} ${i.percent_complete}%`).join('; ')}.
- Cost: Rs ${inr(p.completion_cost_crore_inr.value)} crore plus interest during construction (MMRDA loan invitation, March 2026); MMRDA's project page still gives Rs ${inr(p.completion_cost_crore_inr.alternatives[0].value)} crore (sources conflict).
- Funding: MMRDA invited banks in March 2026 to lend Rs 7,800 crore for Line 12; no lender named yet.
- Approvals: MMRDA Authority, 21 Nov 2018; Government of Maharashtra GR, 6 Sep 2019 (verified).
- Route and stations: MMRDA approved alignment of 20 Mar 2025, 22.17 km centre line from Kalyan to Amandoot, where it meets Navi Mumbai Metro Line 1.
- Interchanges: ${p.interchanges.value.map((x) => `${x.station} (${x.connects_to})`).join('; ')}.
- Depot: ${p.depot.value}, about ${p.depot.area_ha} ha.
- Builder: MMRDA; civil contract CA-240 with Gawar Constructions (reported).
- Line 12A is a separate project and is not part of Line 12's figures.

## Line 12: pages

- [Line 12](${url(b12)}): route, map, progress, tenders, trains, timeline and sources.
- [Line 12 status, answered](${url(`${b12}status/`)}): opening date, progress, route, cost, interchanges.
- [All Line 12 stations](${url(`${b12}stations/`)}): the ${stations.length} stations in order.
${stations.map((s) => `- [${s.name} metro station, Line 12](${url(`${b12}stations/${s.id}/`)}): station ${s.order} of ${stations.length}.`).join('\n')}

## Line 5: key facts

- Name: ${p5.name.value}, also called ${p5.name.also_known_as.join(', ')}.
- Route: ${p5.route.value}.
- Length: ${p5.length_km.value} km including the spur. ${p5.length_km.structure}. ${p5.stations_count.value} stations (MMRDA press release, May 2026, verified).
- Phases: ${p5.phases.map((x) => `Phase ${x.phase}, ${x.value}, ${x.length_km} km`).join('; ')}.
- Opening target: ${t5.scope}, ${formatDate(t5.value)} (MMRDA, verified).${t5.rest_of_line ? ` The rest of the line: ${t5.rest_of_line.value} (reported).` : ''}
- State: ${p5.current_phase.value}
- Cost: Rs ${inr(p5.completion_cost_crore_inr.value)} crore for the whole corridor (MMRDA, verified).
- Interchanges: ${p5.interchanges.value.map((x) => `${x.station} (${x.connects_to})`).join('; ')}.
- Depot: ${p5.depot.value}, about ${p5.depot.area_ha} ha.
- Trains: ${line5.rollingstock!.procurement.manufacturer}, package CA-241 (reported).

## Line 5: pages

- [Line 5](${url(b5)}): route, map, progress, tenders, trains, timeline and sources.
${hasStatusPage(line5) ? `- [Line 5 status, answered](${url(`${b5}status/`)}): opening date, phases, route, cost, interchanges.\n` : ''}- [All Line 5 stations](${url(`${b5}stations/`)}): the ${line5.stations.length} stations in order, and the ${line5.spurStations.length} on the spur.
${all5.map((s) => `- [${s.name} metro station, Line 5](${url(`${b5}stations/${s.id}/`)})`).join('\n')}

## Line 4: key facts

- Name: ${p4.name.value} (${p4.line_color.value}), also called ${p4.name.also_known_as.join(', ')}.
- Route: ${p4.route.value}.
- Length: ${p4.length_km.value} km, fully elevated, ${p4.stations_count.value} stations (MMRDA, verified). With Line 4A to Gaimukh: ${p4.length_km.with_4a_km} km and ${line4.stations.length} stations.
- Opening target: ${p4.target_completion.scope}, ${formatDate(p4.target_completion.value)} (reported; MMRDA has announced no date).
- State: ${p4.current_phase.value}
- Progress (MMRDA, ${formatDate(p4.progress.as_of)}): ${p4.progress.items.map((i) => `${i.activity} ${i.percent_complete}%`).join('; ')}.
- Cost: Rs ${inr(p4.completion_cost_crore_inr.value)} crore for Line 4, with taxes (MMRDA, verified).
- Depot: ${p4.depot.value}, ${p4.depot.area_ha} ha, shared with Lines 4A, 10 and 11.
- Trains: 39 six-car Alstom Metropolis trains through L&T's systems contract CA-234 (reported).

## Line 4: pages

- [Line 4](${url(b4)}): route, map, progress, tenders, trains, timeline and sources.
${hasStatusPage(line4) ? `- [Line 4 status, answered](${url(`${b4}status/`)}): opening target, first stretch, Line 4A, cost, depot, trains.\n` : ''}- [All Line 4 stations](${url(`${b4}stations/`)}): the ${line4.stations.length} stations in order, Line 4A included.
${line4.stations.map((s) => `- [${s.name} metro station, Line 4](${url(`${b4}stations/${s.id}/`)})`).join('\n')}

## Sources

- [MMRDA Metro Line 12 project page](https://mmrda.maharashtra.gov.in/en/projects/transport/metro-line-12/overview)
- [MMRDA Metro Line 5 project page](https://mmrda.maharashtra.gov.in/en/projects/transport/metro-line-5/overview)
- [MMRDA Metro Line 4 project page](https://mmrda.maharashtra.gov.in/en/projects/transport/metro-line-4/overview)
- [MMRDA press release on the extended Line 5, May 2026](https://mmrda.maharashtra.gov.in/sites/default/files/2026-05/extended_metro_line_5_to_strengthen_connectivity_across_thane_bhiwandi_kalyan_and_ulhasnagar.pdf)
- [Line 12 Detailed Project Report, April 2019](https://mmrda.maharashtra.gov.in/sites/default/files/2021-10/Metro%20Line%2012.pdf)
- [Full source list](https://github.com/ShashankBallaya/mumbai-metro-tracker/blob/main/SOURCES.md)
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
