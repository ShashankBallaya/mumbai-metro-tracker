/**
 * The plain-text files for AI assistants and answer engines (llmstxt.org):
 * - llms.txt, a short index: what the site is, each line's key answers, and links to every page;
 * - llms-full.txt, the whole fact set: every status answer with its grade and source, and every station.
 * Both loop over lines.json and take their words from the status answers (src/lib/answers.ts),
 * so a new line or a changed fact shows here with no edit to this file.
 */
import { getLine, lines, lineBase, formatDate, inr, changesFor, lastReviewed as siteReviewed, SITE_NAME, type Line, type Station } from './data';
import { answersFor, type Answer } from './answers';

type Url = (path: string) => string;

/** The answers that give the short picture of a line, in this order, when the line has them. */
const KEY_ANSWERS = ['opening', 'riding', 'open-stations', 'first-stations', 'progress', 'cost'];

const allStations = (line: Line) => [...line.stations, ...line.spurStations];

/** "verified, mmrda.maharashtra.gov.in/...": each grade with its source, for one answer. */
const gradesOf = (a: Answer) =>
  a.grades
    .filter((g, i, all) => all.findIndex((h) => h.status === g.status && h.source === g.source) === i)
    .map((g) => (g.source ? `${g.status}, ${g.source}` : g.status))
    .join('; ');

const summary = () =>
  `An unofficial, sourced tracker for the Mumbai Metro lines that MMRDA and MahaMetro are building, running or planning: ${lines
    .map((l) => `${l.label} (${l.route_short})`)
    .join(', ')
    .replace(/, (?=[^,]*$)/, ' and ')}. Every fact carries a grade (verified, reported, unverified or conflicting) and a link to its source: MMRDA, MahaMetro, government orders, tender papers or named news reports. Facts last checked ${formatDate(siteReviewed)}. Not affiliated with MMRDA or MahaMetro.`;

const howToCite = (url: Url) => `## How to use these facts

- Each line has a status page that answers the common questions (opening date, progress, route, stations, cost, builders) in full sentences, with the grade and source of each answer. Quote those answers with the page link.
- "Verified" means an official source (MMRDA, MahaMetro, a government order or a tender paper) says it. "Reported" means a news report or trade press says it and no official source does yet. "Conflicting" means the sources give different figures; the answer names both.
- Opening dates are targets unless an answer says the line opened. MMRDA often publishes no date; the answers say so.
- The site does not use Wikipedia as a source.
- To report a mistake: ${url('/correct/')}`;

function lineFacts(line: Line) {
  const p = line.project;
  return `${p.length_km.value} km, ${p.stations_count.value} stations, Rs ${inr(p.completion_cost_crore_inr.value)} crore. Facts last checked ${formatDate(line.lastReviewed)}.`;
}

function linePages(line: Line, url: Url) {
  const base = lineBase(line.id);
  const label = line.info.label;
  return [
    `- [${line.info.about.name}](${url(base)}): route, map, progress, tenders, timeline and sources.`,
    answersFor(line) && `- [${label} status, answered](${url(`${base}status/`)}): ${answersFor(line)!.length} questions answered, each with its source.`,
    `- [All ${label} stations](${url(`${base}stations/`)}): the ${allStations(line).length} stations in order.`,
  ]
    .filter(Boolean)
    .join('\n');
}

/** llms.txt: the short index. */
export function llmsIndex(url: Url): string {
  const parts = lines.map(({ id }) => {
    const line = getLine(id);
    const key = (answersFor(line) ?? []).filter((a) => KEY_ANSWERS.includes(a.id)).sort((a, b) => KEY_ANSWERS.indexOf(a.id) - KEY_ANSWERS.indexOf(b.id));
    return `## ${line.info.about.name}

${line.info.about.description} ${lineFacts(line)}

${key.map((a) => `- ${a.q} ${a.a} (${gradesOf(a)})`).join('\n')}

${linePages(line, url)}`;
  });
  const stationLinks = lines.map(({ id }) => {
    const line = getLine(id);
    const base = lineBase(id);
    return allStations(line)
      .map((s) => `- [${s.name} metro station, ${line.info.label}](${url(`${base}stations/${s.id}/`)})`)
      .join('\n');
  });

  return `# ${SITE_NAME}

> ${summary()}

- [${SITE_NAME}](${url('/')}): every line on one map, with its state and next step.
- [Full text for AI assistants](${url('/llms-full.txt')}): every status answer with its grade and source, and every station.

${howToCite(url)}

${parts.join('\n\n')}

## Optional

${stationLinks.join('\n')}
- [Full source list](https://github.com/ShashankBallaya/mumbai-metro-tracker/blob/main/SOURCES.md)
`;
}

function stationLine(line: Line, s: Station, url: Url) {
  const base = lineBase(line.id);
  const changes = changesFor(s);
  const bits = [
    s.name_mr && `Marathi: ${s.name_mr}`,
    s.type,
    s.construction_status?.value,
    changes.length ? `change to ${changes.join(', ')}` : null,
  ].filter(Boolean);
  return `- [${s.name}](${url(`${base}stations/${s.id}/`)}), station ${s.order}: ${bits.join('. ')}.`;
}

/** llms-full.txt: every answer, grade and source, and every station. */
export function llmsFull(url: Url): string {
  const parts = lines.map(({ id }) => {
    const line = getLine(id);
    const base = lineBase(id);
    const answers = answersFor(line) ?? [];
    const spur = line.spurStations.length
      ? `\n\nOn the spur, in order from where it leaves the main line:\n\n${line.spurStations.map((s) => stationLine(line, s, url)).join('\n')}`
      : '';
    const dropped = line.droppedStations.length ? `\n\nDropped from earlier plans: ${line.droppedStations.map((s) => s.name).join(', ')}.` : '';
    return `## ${line.info.about.name}

${line.info.about.description} ${lineFacts(line)}
Also called: ${line.info.about.alternate_names.join(', ')}.
Page: ${url(base)}

### ${line.info.label}: questions and answers

Source page: ${url(`${base}status/`)}

${answers.map((a) => `Q: ${a.q}\nA: ${a.a}\nGrade and source: ${gradesOf(a)}`).join('\n\n')}

### ${line.info.label}: stations

In order. Page: ${url(`${base}stations/`)}

${line.stations.map((s) => stationLine(line, s, url)).join('\n')}${spur}${dropped}`;
  });

  return `# ${SITE_NAME}: full text

> ${summary()}

This file holds every fact on the site's status pages and station lists, so an assistant can answer from one file. The short index is ${url('/llms.txt')}.

${howToCite(url)}

${parts.join('\n\n')}
`;
}
