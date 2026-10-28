/**
 * Each line's status page: the questions people search for, answered from the line's data files,
 * each answer with its grades. The same answers feed the page's FAQPage structured data.
 * A line without a set here has no status page (hasStatusPage).
 */
import { formatDate, inr, lineBase, openedOf, announcedOf, sectionName, sectionSubject, clock, type Line } from './data';

export interface Answer {
  id: string;
  q: string;
  a: string;
  grades: { status: string; source: string | null }[];
  more?: { href: string; label: string };
}

function line12(line: Line): Answer[] {
  const { project, stations, contractors } = line;
  const rollingstock = line.rollingstock!;
  const p = project;
  const t = p.target_completion;
  const prog = p.progress;
  const overall = prog.overall_reported;
  const civil = contractors.find((c) => c.id === 'gawar-constructions')!;
  const line12a = p.related_projects[0];
  const pct = (n: number) => n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  // "Pile works" -> "pile works" mid-sentence, but "U-girder works" keeps its capital.
  const lower = (t: string) => (/^[A-Z][a-z]/.test(t) ? t.charAt(0).toLowerCase() + t.slice(1) : t);
  const aliases = p.name.also_known_as.filter((n) => !n.startsWith('Orange Line'));
  const answers: Answer[] = [
    {
      id: 'opening',
      q: 'When will Mumbai Metro Line 12 open?',
      a: `No official opening date has been published. The latest reported target is ${formatDate(t.value)} (reported in December 2025). An earlier reported target was ${formatDate(t.alternatives[0].value)}, and the 2019 project report had assumed ${formatDate(t.alternatives[1].value)}. MMRDA's project page gives no date.`,
      grades: [{ status: t.status, source: t.source_url }],
    },
    {
      id: 'progress',
      q: 'How much of Line 12 is built?',
      a: `MMRDA's progress table for ${formatDate(prog.as_of)} puts ${prog.items.map((i) => `${lower(i.activity)} at ${pct(i.percent_complete)}%`).join(', ')}. Loksatta reported on ${formatDate(overall.as_of)}, quoting unnamed MMRDA sources, that ${pct(overall.percent_complete)}% of the whole line is complete; MMRDA itself publishes no overall figure.`,
      grades: [
        { status: prog.status, source: prog.source_url },
        { status: overall.status, source: overall.source_url },
      ],
    },
    {
      id: 'route',
      q: 'What is the route of Metro Line 12?',
      a: `${p.route.value}. The line is ${p.length_km.value} km long, fully elevated, with ${p.stations_count.value} stations. It runs above Kalyan-Shilphata Road from Kalyan to Sonarpada.`,
      grades: [{ status: p.route.status, source: p.route.source_url }],
      more: { href: `${lineBase(line.id)}#map`, label: 'See the route on the map' },
    },
    {
      id: 'stations',
      q: 'Which stations are on Line 12?',
      a: `${stations.length} stations, in order: ${stations.map((s) => s.name).join(', ')}.`,
      grades: [{ status: p.stations_count.status, source: p.stations_count.source_url }],
      more: { href: `${lineBase(line.id)}stations/`, label: 'A page for every station' },
    },
    {
      id: 'interchanges',
      q: 'Where does Line 12 connect with other lines?',
      a: `${p.interchanges.value.map((x) => `At ${x.station}, with ${x.connects_to}`).join('. ')}. Line 12 continues Metro Line 5 (Thane-Bhiwandi-Kalyan) south from Kalyan.`,
      grades: [{ status: p.interchanges.status, source: p.interchanges.source_url }],
    },
    {
      id: 'cost',
      q: 'How much does Metro Line 12 cost?',
      a: `MMRDA's loan invitation of March 2026 gives an estimated cost of Rs ${inr(p.completion_cost_crore_inr.value)} crore, plus interest during construction. MMRDA's project page still gives Rs ${inr(p.completion_cost_crore_inr.alternatives[0].value)} crore, the 2019 report's completion cost. To pay for it, MMRDA invited banks in March 2026 to lend Rs 7,800 crore; no lender has been named yet.`,
      grades: [
        { status: p.completion_cost_crore_inr.status, source: p.completion_cost_crore_inr.source_url },
        { status: p.funding.status, source: p.funding.source_url },
      ],
    },
    {
      id: 'builder',
      q: 'Who is building Line 12?',
      a: `MMRDA (Mumbai Metropolitan Region Development Authority) is building the line. ${civil.name} holds the civil contract for the viaduct and all ${p.stations_count.value} stations (package CA-240, awarded in March 2024).`,
      grades: [
        { status: p.implementing_agency.status, source: p.implementing_agency.source_url },
        { status: civil.status, source: civil.source_url },
      ],
    },
    {
      id: 'depot',
      q: 'Where is the Line 12 depot?',
      a: `At ${p.depot.value}, on about ${p.depot.area_ha} hectares.`,
      grades: [{ status: p.depot.status, source: p.depot.source_url }],
    },
    {
      id: 'trains',
      q: 'Which trains will run on Line 12?',
      a: `No train maker has been chosen yet. The trains are part of the systems tender MMRDA floated in June 2026. The 2019 project report plans ${rollingstock.dpr_design_assumptions.initial_formation_cars}-car air-conditioned trains, growing to ${rollingstock.dpr_design_assumptions.future_formation_cars} cars, with a top operating speed of ${rollingstock.dpr_design_assumptions.max_operating_speed_kmph} km/h.`,
      grades: [
        { status: rollingstock.procurement.status, source: rollingstock.procurement.source_url },
        { status: rollingstock.dpr_design_assumptions.status, source: rollingstock.dpr_design_assumptions.source_url },
      ],
    },
    {
      id: 'riders',
      q: 'How many people will use Line 12?',
      a: `About ${p.daily_ridership_2031.display} riders a day by 2031, as projected. MMRDA says the line saves about ${p.travel_time_benefit.minutes_saved} minutes between Kalyan and Taloja, cutting road travel time by 50% to 75% depending on traffic.`,
      grades: [
        { status: p.daily_ridership_2031.status, source: p.daily_ridership_2031.source_url },
        { status: p.travel_time_benefit.status, source: p.travel_time_benefit.source_url },
      ],
    },
    {
      id: 'line-12a',
      q: 'Is Line 12A the same as Line 12?',
      a: `No. ${line12a.name} is a separate project: ${line12a.summary} Its figures are not counted in Line 12's.`,
      grades: [{ status: line12a.status, source: line12a.source_url }],
      more: { href: lineBase('line-12a'), label: 'Line 12A' },
    },
    {
      id: 'names',
      q: 'What else is Metro Line 12 called?',
      a: `${p.name.value} is also called ${aliases.join(' or ')}. It is part of the ${p.line_color.value}, as the southern extension of Metro Line 5.`,
      grades: [{ status: p.name.status, source: p.name.source_url }],
    },
  ];
  return answers;
}

function line5(line: Line): Answer[] {
  const { project: p, stations, spurStations, droppedStations, contractors } = line;
  const rs = line.rollingstock as unknown as {
    procurement: { manufacturer: string; trains: number; coaches: number; package: string; date: string; built_at: string; status: string; source_url: string };
    specs: { status: string; source_url: string };
  };
  const base = lineBase(line.id);
  const t = p.target_completion as typeof p.target_completion & {
    rest_of_line: { value: string; status: string; source_url: string };
    scope: string;
  };
  const prog = p.progress;
  const cur = p.current_phase;
  const extra = p as unknown as { phases: unknown; underground_section: unknown };
  const phases = extra.phases as {
    value: string; length_km: number; stations?: number; cost_crore?: number; status: string; source_url: string;
  }[];
  const firm = (id: string) => contractors.find((c) => c.id === id)!;
  const phase1 = stations.filter((s) => s.phase === 1);
  const spur = (p.related_projects as { name: string; status: string; source_url: string }[])[0];
  const under = extra.underground_section as { status: string; source_url: string };
  const funding = p.funding as { status: string; source_url: string };
  const cost = p.completion_cost_crore_inr as unknown as { value: number; status: string; source_url: string; history: { value: number }[] };
  const travel = p.travel_time_benefit as { status: string; source_url: string };
  const colour = p.line_color as { status: string; source_url: string };
  const list = (names: string[]) => `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
  const planned = (p.interchanges as { planned?: { station: string; connects_to: string; status: string; source_url: string }[] }).planned ?? [];
  return [
    {
      id: 'opening',
      q: 'When will Mumbai Metro Line 5 open?',
      a: `Phase 1, Kapurbawdi to Dhamankar Naka, has a target of the end of 2026: MMRDA's press release of May 2026 quotes the Chief Minister saying it will open by then, with no exact date. Its overhead wires were energised from 7 Sep 2026, ahead of the safety inspection and trial runs; a report that month, quoting MMRDA, puts the trial runs at about six months, which does not fit the target. The rest of the line, Phases 2 and 3 and the Line 5A spur, has a reported target of ${t.rest_of_line.value}.`,
      grades: [
        { status: t.status, source: t.source_url },
        { status: cur.status, source: cur.source_url },
        { status: t.rest_of_line.status, source: t.rest_of_line.source_url },
      ],
    },
    {
      id: 'first-stations',
      q: 'Which stations open first?',
      a: `The ${phase1.length} stations of Phase 1: ${list(phase1.map((s) => s.name))}. Kapurbawdi is built as part of Metro Line 4 and is the interchange with it, so MMRDA counts the other ${phase1.length - 1} as Phase 1's stations.`,
      grades: [{ status: phases[0].status, source: phases[0].source_url }],
    },
    {
      id: 'progress',
      q: 'How much of Line 5 is built?',
      a: `Phase 1's civil work is done: MMRDA's progress table for ${formatDate(prog.as_of)} shows all ${prog.items.length} of its activities at 100%, from piling to the deck slab. The table does not name the stretch it covers, but its items match Phase 1. Work beyond Bhiwandi, towards Kalyan, has not begun, as reported in September 2026.`,
      grades: [
        { status: prog.status, source: prog.source_url },
        { status: cur.status, source: cur.source_url },
      ],
    },
    {
      id: 'route',
      q: 'What is the route of Metro Line 5?',
      a: `${p.route.value}. MMRDA gives ${p.length_km.value} km including the spur, and ${p.stations_count.value} stations. To the Ulhas river bridge at Durgadi it follows the road medians of Agra Road through Bhiwandi, the Bhiwandi bypass and Kalyan-Bhiwandi Road. Bhiwandi station is underground; every other station is elevated.`,
      grades: [
        { status: p.route.status, source: p.route.source_url },
        { status: under.status, source: under.source_url },
      ],
      more: { href: `${base}#map`, label: 'See the route on the map' },
    },
    {
      id: 'stations',
      q: 'Which stations are on Line 5?',
      a: `${stations.length} on the line, in order from Kapurbawdi: ${stations.map((s) => s.name).join(', ')}. The Line 5A spur adds ${list(spurStations.map((s) => s.name))}. Kongaon West has no published position yet.`,
      grades: [{ status: p.stations_count.status, source: p.stations_count.source_url }],
      more: { href: `${base}stations/`, label: 'A page for every station' },
    },
    {
      id: 'interchanges',
      q: 'Where does Line 5 meet other lines?',
      a: `${p.interchanges.value.map((x) => `At ${x.station}, with ${x.connects_to}`).join('. ')}. ${planned.map((x) => `At ${x.station}, a planned interchange with ${x.connects_to}, as reported; the ring line's official route map puts its Balkum Naka station about 1 km east of Line 5's, and does not call the two an interchange. `).join('')}The 2017 plan also had a stop at APMC Kalyan, near Line 12's APMC Kalyan station; the revised plan drops it.`,
      grades: [{ status: p.interchanges.status, source: p.interchanges.source_url }, ...planned.map((x) => ({ status: x.status, source: x.source_url }))],
    },
    {
      id: 'past-bhiwandi',
      q: 'What happens past Bhiwandi?',
      a: `Phase 2, ${phases[1].value}, ${phases[1].length_km} km with ${phases[1].stations} stations, was approved by the Union Government on 29 Aug 2026, as reported, and has not started. It goes underground at Bhiwandi station. Past the Ulhas river bridge, Phase 3 loops north through Durgadi and Khadakpada, east to Bhoirwadi, then back west through Shivaji Path to Kalyan, on a tentative key plan of March 2026. The 2017 plan's stops at ${list(droppedStations.map((s) => s.name))} are dropped.`,
      grades: [
        { status: phases[1].status, source: phases[1].source_url },
        { status: phases[2].status, source: phases[2].source_url },
      ],
    },
    {
      id: 'spur',
      q: 'Where does the Line 5A spur go?',
      a: `From just past Bhoirwadi to Ulhasnagar, about 5.27 km, with stations at ${list(spurStations.map((s) => s.name))}, on the tentative key plan of March 2026. MMRDA counts it with Durgadi to Kalyan as Phase 5A: 11.83 km, 7 stations and Rs 4,063 crore together.`,
      grades: [{ status: spur.status, source: spur.source_url }],
    },
    {
      id: 'cost',
      q: 'How much does Metro Line 5 cost?',
      a: `MMRDA's press release of May 2026 gives Rs ${inr(cost.value)} crore for the expanded corridor: Phase 1 Rs 6,741 crore, Phase 2 Rs 7,326 crore and Phase 5A Rs 4,063 crore. The 2017 plan's cost was Rs ${inr(cost.history[0].value)} crore. AIIB approved a loan concept for the trains, signalling and power in April 2020; the final loan amounts are not published.`,
      grades: [
        { status: cost.status, source: cost.source_url },
        { status: funding.status, source: funding.source_url },
      ],
    },
    {
      id: 'builder',
      q: 'Who is building Line 5?',
      a: `MMRDA (Mumbai Metropolitan Region Development Authority) is building the line. ${firm('afcons').name} built Phase 1's viaduct and stations (package CA-28, awarded in January 2020), ${firm('rithwik').name} the Kasheli depot, and ${firm('titagarh').name} is building the trains and signalling (package CA-241, announced on ${formatDate(rs.procurement.date)}).`,
      grades: [
        { status: p.implementing_agency.status, source: p.implementing_agency.source_url },
        { status: firm('afcons').status, source: firm('afcons').source_url },
        { status: firm('titagarh').status, source: firm('titagarh').source_url },
      ],
    },
    {
      id: 'depot',
      q: 'Where is the Line 5 depot?',
      a: `At ${p.depot.value}, on about ${p.depot.area_ha} hectares, on Phase 1.`,
      grades: [{ status: p.depot.status, source: p.depot.source_url }],
    },
    {
      id: 'trains',
      q: 'Which trains will run on Line 5?',
      a: `${rs.procurement.manufacturer} is building ${rs.procurement.trains} six-car trains (${rs.procurement.coaches} coaches) at ${rs.procurement.built_at}, under package ${rs.procurement.package}, with the signalling and platform screen doors. MMRDA's figures: cars 3.2 m wide, and 1,756 people in a six-car train.`,
      grades: [
        { status: rs.procurement.status, source: rs.procurement.source_url },
        { status: rs.specs.status, source: rs.specs.source_url },
      ],
    },
    {
      id: 'riders',
      q: 'How many people will use Line 5?',
      a: `About ${p.daily_ridership_2031.display} riders a day by 2031, as projected. MMRDA's figures of 2026 put travel time 40 to 50% below the road; its Line 5 page, from the 2017 plan, still says 50 to 75%.`,
      grades: [
        { status: p.daily_ridership_2031.status, source: p.daily_ridership_2031.source_url },
        { status: travel.status, source: travel.source_url },
      ],
    },
    {
      id: 'names',
      q: 'What else is Metro Line 5 called?',
      a: `${p.name.value} is also called ${p.name.also_known_as[0]}, the ${p.name.also_known_as[1]} or the ${p.name.also_known_as[2]}. Trade press treats Lines 5 and 12 as one Orange Line, a colour MMRDA announced in 2020; MMRDA's Line 5 page names no colour.`,
      grades: [
        { status: p.name.status, source: p.name.source_url },
        { status: colour.status, source: colour.source_url },
      ],
    },
  ];
}

function line4(line: Line): Answer[] {
  const { project: p, stations, timeline, tenders } = line;
  const base = lineBase(line.id);
  type Graded = { value: string; status: string; source_url: string };
  const x = p as unknown as {
    target_completion: Graded & { scope: string; rest_of_line: Graded };
    phases: (Graded & { length_km: number; stations: number; stations_note: string; alternatives: { value: string }[] })[];
    line_4a: { length_km: number; cost_crore: number; status: string; source_url: string; alternatives: { value: number }[]; cost_history: { value: number }[] };
    length_km: { value: number; with_4a_km: number; with_4a_source_url: string };
    completion_cost_crore_inr: { value: number; status: string; source_url: string; history: { value: number }[] };
    funding: Graded;
    depot: { value: string; area_ha: number; status: string; source_url: string; contract: Graded; interim: Graded };
    interchanges: { value: { station: string; connects_to: string }[]; lines: string[]; planned: { station: string; connects_to: string; status: string; source_url: string }[]; status: string; source_url: string };
    rolling_stock: { trains: number; cars_per_train: number; status: string; source_url: string; trial_trains: Graded };
    technical: { status: string; source_url: string };
    line_color: Graded;
    related_projects: { name: string; status: string; source_url: string }[];
  };
  const t = x.target_completion;
  const prog = p.progress;
  const cur = p.current_phase;
  const [ph1, ph2, ph3] = x.phases;
  const event = (id: string) => timeline.find((e) => e.id === id)!;
  const tender = (id: string) => tenders.find((e) => e.id === id)!;
  const list = (names: string[]) => `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
  const pcts = prog.items.map((i) => i.percent_complete);
  const main = stations.filter((s) => (s as { section?: string }).section === '4');
  const ext = stations.filter((s) => (s as { section?: string }).section === '4A');
  const dropped = event('stations-dropped');
  const rs = x.rolling_stock;
  return [
    {
      id: 'opening',
      q: 'When will Mumbai Metro Line 4 open?',
      a: `MMRDA has announced no opening date. News reports of August and September 2026 say MMRDA aims to open the first stretch, ${ph1.value}, around Diwali or by the end of 2026, once the safety approvals are in. The site counts down to 31 Dec 2026 as a reported target. Trial runs on this stretch began in September 2025, and the safety commissioner's report on the Gaimukh pit line is awaited. Earlier targets of December 2025 and April 2026 have passed. For the rest of the line, the reported targets are ${t.rest_of_line.value}; the first of these has passed.`,
      grades: [
        { status: t.status, source: t.source_url },
        { status: cur.status, source: cur.source_url },
        { status: t.rest_of_line.status, source: t.rest_of_line.source_url },
      ],
    },
    {
      id: 'first-stations',
      q: 'Which stretch of Line 4 opens first?',
      a: `${ph1.value}, about ${ph1.length_km} km at the Thane end, with Line 4A. It has ${ph1.stations} stations: ${ph1.stations_note.replace(/\.$/, '')}. A report of August 2026, quoting an MMRDA official, names only 8 of them, without Manpada and Gowniwada; no source says whether those two open with the rest. Next, as reported in September 2025: ${ph2.value}, with ${ph2.stations} stations, then ${ph3.value}, with ${ph3.stations}. MMRDA itself names no phases.`,
      grades: [
        { status: ph1.status, source: ph1.source_url },
        { status: ph2.status, source: ph2.source_url },
      ],
    },
    {
      id: 'progress',
      q: 'How much of Line 4 is built?',
      a: `MMRDA's progress table for ${formatDate(prog.as_of)} covers the whole line and puts each civil activity at ${Math.min(...pcts)}% to ${Math.max(...pcts)}%: ${prog.items.map((i) => `${/^[A-Z][a-z]/.test(i.activity) ? i.activity.charAt(0).toLowerCase() + i.activity.slice(1) : i.activity} ${i.percent_complete}%`).join(', ')}. MMRDA publishes no figure by station or by stretch. The first stretch, Gaimukh to Cadbury Junction, is built and in trial runs; RDSO certified it on ${formatDate(event('rdso-certificate').date)}, as reported.`,
      grades: [
        { status: prog.status, source: prog.source_url },
        { status: cur.status, source: cur.source_url },
      ],
    },
    {
      id: 'route',
      q: 'What is the route of Metro Line 4?',
      a: `${p.route.value}. Line 4 is ${x.length_km.value} km long, fully elevated, with ${p.stations_count.value} stations; with Line 4A, MMRDA gives ${x.length_km.with_4a_km} km. The 2016 project report runs it along the Eastern Express Highway from Wadala to Mulund, then through Thane on Lal Bahadur Shastri Marg and Ghodbunder Road.`,
      grades: [
        { status: p.route.status, source: p.route.source_url },
        { status: x.technical.status, source: x.technical.source_url },
      ],
      more: { href: `${base}#map`, label: 'See the route on the map' },
    },
    {
      id: 'stations',
      q: 'Which stations are on Line 4?',
      a: `${main.length} on Line 4, in order from Wadala: ${main.map((s) => s.name).join(', ')}. Line 4A adds ${list(ext.map((s) => s.name))}. The 2016 plan also had Suman Nagar and Amar Mahal Junction; both were dropped in ${formatDate(dropped.date)}, for cost and lack of space, as reported.`,
      grades: [
        { status: p.stations_count.status, source: p.stations_count.source_url },
        { status: dropped.status, source: dropped.source_url },
      ],
      more: { href: `${base}stations/`, label: 'A page for every station' },
    },
    {
      id: 'line-4a',
      q: 'What is Line 4A?',
      a: `The extension of Line 4 from Kasarvadavali to Gaimukh, with ${list(ext.map((s) => s.name))} stations. Sources differ on its length: ${x.line_4a.length_km} km from MMRDA's figures of 2023, ${x.line_4a.alternatives[0].value} km in the 2017 project report, ${x.line_4a.alternatives[1].value} km in trade press. Its cost is reported as Rs ${inr(x.line_4a.cost_crore)} crore (Rs ${inr(x.line_4a.cost_history[0].value)} crore in the 2017 report). J Kumar holds its civil contract (package CA-54, Rs ${inr(tender('ca-54').awarded_value_crore!)} crore, ${formatDate(tender('ca-54').award_date)}). It is part of the first stretch to open, as reported.`,
      grades: [
        { status: x.line_4a.status, source: x.line_4a.source_url },
        { status: tender('ca-54').status, source: tender('ca-54').source_url },
      ],
    },
    {
      id: 'interchanges',
      q: 'Where does Line 4 meet other lines?',
      a: `${x.interchanges.value.map((i) => `At ${i.station}, with ${i.connects_to}`).join('. ')}. Planned or reported: ${x.interchanges.planned.map((i) => `at ${i.station}, ${i.connects_to}`).join('; ')}. MMRDA also names a connection with the Central Railway, but no source names the Line 4 station for it.`,
      grades: [
        { status: x.interchanges.status, source: x.interchanges.source_url },
        ...x.interchanges.planned.map((i) => ({ status: i.status, source: i.source_url })),
      ],
    },
    {
      id: 'cost',
      q: 'How much does Metro Line 4 cost?',
      a: `MMRDA gives a base cost of Rs ${inr(x.completion_cost_crore_inr.value)} crore for Line 4, including taxes and duties. With Line 4A's reported Rs ${inr(x.line_4a.cost_crore)} crore, that makes Rs ${inr(x.completion_cost_crore_inr.value + x.line_4a.cost_crore)} crore. The 2016 project report had Rs ${inr(x.completion_cost_crore_inr.history[0].value)} crore at March 2016 prices. Germany's KfW lends EUR 545 million for the systems of Lines 4 and 4A, the trains and ticketing among them; MMRDA pays the rest.`,
      grades: [
        { status: x.completion_cost_crore_inr.status, source: x.completion_cost_crore_inr.source_url },
        { status: x.line_4a.status, source: x.line_4a.source_url },
        { status: x.funding.status, source: x.funding.source_url },
      ],
    },
    {
      id: 'builder',
      q: 'Who is building Line 4?',
      a: `MMRDA (Mumbai Metropolitan Region Development Authority) is building the line. On ${formatDate(event('civil-award').date)} it gave the viaduct and stations to two joint ventures: Reliance Infrastructure and Astaldi (packages CA-08, CA-10 and CA-12) and Tata Projects and CHEC (CA-09 and CA-11). L&T holds the systems contract, with Alstom for the trains (CA-234), and the power and traction contract from Wadala to Cadbury Junction (CA-298).`,
      grades: [
        { status: p.implementing_agency.status, source: p.implementing_agency.source_url },
        { status: event('civil-award').status, source: event('civil-award').source_url },
        { status: tender('ca-234').status, source: tender('ca-234').source_url },
        { status: tender('ca-298').status, source: tender('ca-298').source_url },
      ],
    },
    {
      id: 'depot',
      q: 'Where is the Line 4 depot?',
      a: `At ${x.depot.value}, on ${x.depot.area_ha} hectares, shared with Lines 4A, 10 and 11. SEW Infrastructure and Vishwa Samudra Engineering hold its contract (package CA-160). The depot was not ready for the first stretch, so a pit line at Gaimukh serves it for now: two island platforms and four tracks. The safety commissioner inspected the pit line in August 2026.`,
      grades: [
        { status: x.depot.status, source: x.depot.source_url },
        { status: x.depot.contract.status, source: x.depot.contract.source_url },
        { status: x.depot.interim.status, source: x.depot.interim.source_url },
      ],
    },
    {
      id: 'trains',
      q: 'Which trains will run on Line 4?',
      a: `Alstom is building ${rs.trains} driverless ${rs.cars_per_train}-car Metropolis trains for Lines 4 and 4A, through L&T's systems contract (package CA-234), which also covers the signalling and platform screen doors. The first was unveiled at Alstom's factory at Sri City on ${formatDate(event('first-alstom-train').date)}, built in 14 months; delivery to Mumbai is expected in December 2026. The first trial runs used two trains borrowed from Line 2A. An earlier order, for 234 cars from Bombardier, was cancelled in 2022.`,
      grades: [
        { status: rs.status, source: rs.source_url },
        { status: rs.trial_trains.status, source: rs.trial_trains.source_url },
        { status: event('train-order-cancelled').status, source: event('train-order-cancelled').source_url },
      ],
      more: { href: `${base}#trains`, label: 'The trains' },
    },
    {
      id: 'riders',
      q: 'How many people will use Line 4?',
      a: `About ${p.daily_ridership_2031.display} riders a day by 2031, as projected. MMRDA says the line cuts travel time by 50% to 75%, depending on road conditions.`,
      grades: [
        { status: p.daily_ridership_2031.status, source: p.daily_ridership_2031.source_url },
        { status: p.travel_time_benefit.status, source: p.travel_time_benefit.source_url },
      ],
    },
    {
      id: 'names',
      q: 'What else is Metro Line 4 called?',
      a: `${p.name.value} is also called ${p.name.also_known_as[0]}, the ${p.name.also_known_as[1]} or the ${p.name.also_known_as[2]}. MMRDA gives its colour as the ${x.line_color.value}.`,
      grades: [{ status: p.name.status, source: p.name.source_url }],
    },
  ];
}

/** Line 12A: approved, not started. MMRDA has published nothing, so every answer rests on news reports. */
function line12a(line: Line): Answer[] {
  const { project: p, stations, timeline } = line;
  const base = lineBase(line.id);
  type Graded = { value: string; status: string; source_url: string };
  const x = p as unknown as {
    completion_cost_crore_inr: { value: number; status: string; source_url: string; history: { value: number }[] };
    funding: Graded;
    depot: Graded;
    interchanges: { value: { station: string; connects_to: string }[]; planned: { station: string; connects_to: string; status: string; source_url: string }[]; status: string; source_url: string };
    route: Graded;
    target_completion: Graded & { countdown_date: string };
    related_projects: { name: string; summary: string; status: string; source_url: string }[];
  };
  const event = (id: string) => timeline.find((e) => e.id === id)!;
  const approved = event('cabinet-committee');
  const announced = event('announced');
  const placed = stations.filter((s) => s.location.lat !== null);
  const list = (names: string[]) => `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
  const cost = x.completion_cost_crore_inr;
  const flyovers = x.related_projects[0];
  return [
    {
      id: 'approved',
      q: 'Is Metro Line 12A approved?',
      a: `Yes. The state Cabinet Infrastructure Committee, chaired by the Chief Minister, cleared it on ${formatDate(approved.date)} at Rs ${inr(cost.value)} crore, as reported. The State had first announced it, with an administrative approval of Rs ${inr(cost.history[0].value)} crore, in ${formatDate(announced.date)}. MMRDA will build it. No tender has been issued yet.`,
      grades: [
        { status: approved.status, source: approved.source_url },
        { status: announced.status, source: announced.source_url },
      ],
    },
    {
      id: 'opening',
      q: 'When will Line 12A be ready?',
      a: `The State set a deadline of three and a half years, as reported. No source says from which day it counts. Counted from the approval of ${formatDate(approved.date)}, it falls in ${formatDate(x.target_completion.value)}; the site counts down to ${formatDate(x.target_completion.countdown_date)}. Construction has not started.`,
      grades: [{ status: x.target_completion.status, source: x.target_completion.source_url }],
    },
    {
      id: 'route',
      q: 'What is the route of Metro Line 12A?',
      a: `${x.route.value}. It is ${p.length_km.value} km long with the link to the car shed, fully elevated, as reported. It runs on Kalyan-Shilphata Road from Manpada to Kalyan Phata, then by Dahisar Mori towards Taloja. MMRDA has published no alignment, so the map on this site is indicative.`,
      grades: [
        { status: x.route.status, source: x.route.source_url },
        { status: p.length_km.status, source: p.length_km.source_url },
      ],
      more: { href: `${base}#map`, label: 'See the indicative route on the map' },
    },
    {
      id: 'stations',
      q: 'Which stations are on Line 12A?',
      a: `${stations.length}, all elevated, in order from Manpada: ${stations.map((s) => s.name).join(', ')}, as reported. MMRDA has published no station list or positions. On this site's map, ${list(placed.map((s) => s.name))} sit at their named places; the others are not yet mapped.`,
      grades: [{ status: p.stations_count.status, source: p.stations_count.source_url }],
      more: { href: `${base}stations/`, label: 'All Line 12A stations' },
    },
    {
      id: 'line-12',
      q: 'Is Line 12A the same as Line 12?',
      a: `No. Line 12 runs from Kalyan to Taloja and is being built. Line 12A is a separate, newer project: it starts at Manpada, a Line 12 station, runs along Kalyan-Shilphata Road to Kalyan Phata, and joins Line 12 again near Khutari village, before Amandoot (Taloja). The interchange with Line 12 is reported at Katai Naka. Its figures are not counted in Line 12's. Between Katai Naka and Kalyan Phata it is reported to share track and stations with the proposed Line 14.`,
      grades: [
        { status: x.route.status, source: x.route.source_url },
        { status: x.interchanges.status, source: x.interchanges.source_url },
      ],
      more: { href: lineBase('line-12'), label: 'Line 12' },
    },
    {
      id: 'cost',
      q: 'How much will Line 12A cost?',
      a: `Rs ${inr(cost.value)} crore, as cleared on ${formatDate(approved.date)}. The figure includes ${flyovers.summary.split(':')[0].toLowerCase()}. No source splits it between the metro and the roads. In February 2026 the administrative approval was Rs ${inr(cost.history[0].value)} crore. Funding: ${x.funding.value}, as reported.`,
      grades: [
        { status: cost.status, source: cost.source_url },
        { status: x.funding.status, source: x.funding.source_url },
      ],
    },
    {
      id: 'interchanges',
      q: 'Where does Line 12A connect to other lines?',
      a: `${x.interchanges.value.map((i) => `${i.station}: ${i.connects_to}`).join('. ')}. Navi Mumbai Metro Line 1 meets Line 12 at Amandoot, past the point where Line 12A joins it. A spur to the Thane bullet train station is possible, as reported. All as reported; MMRDA has published no interchange list for Line 12A.`,
      grades: [
        { status: x.interchanges.status, source: x.interchanges.source_url },
        ...x.interchanges.planned.map((i) => ({ status: i.status, source: i.source_url })),
      ],
    },
  ];
}

const sets: Record<string, (line: Line) => Answer[]> = { 'line-12': line12, 'line-12a': line12a, 'line-5': line5, 'line-4': line4 };

/**
 * Opening mode: once the line's first section has an announced or past opening date, that date answers
 * "when will it open", and the train times, frequency and fares known so far answer a question of their own.
 */
function withService(line: Line, answers: Answer[]): Answer[] {
  const sec = line.stages[0];
  const opened = openedOf(sec);
  const opening = opened ?? announcedOf(sec);
  if (!sec || !opening) return answers;
  const name = sectionName(line, sec);
  const label = line.info.label;
  const rest = (line.project.target_completion as { rest_of_line?: { value: string; status: string; source_url: string } }).rest_of_line;
  const when: Answer = {
    id: 'opening',
    q: opened ? `When did Mumbai Metro ${label} open?` : `When will Mumbai Metro ${label} open?`,
    a: `${sectionSubject(line, sec)} ${opened ? 'opened' : 'opens'} to riders on ${formatDate(opening.date)}.${rest ? ` The rest of the line has a reported target of ${rest.value}.` : ''}`,
    grades: [{ status: opening.status, source: opening.source_url }, ...(rest ? [{ status: rest.status, source: rest.source_url }] : [])],
  };
  const { hours, frequency, fares } = sec.service!;
  const facts = [
    hours && `Trains run from ${clock(hours.first)} to ${clock(hours.last)}.`,
    frequency && `A train comes every ${frequency.peak_min} minutes at peak${frequency.off_peak_min ? ` and every ${frequency.off_peak_min} minutes off-peak` : ''}.`,
    fares && (fares.min_inr === fares.max_inr ? `A single fare costs Rs ${inr(fares.min_inr)}.` : `A single fare costs Rs ${inr(fares.min_inr)} to Rs ${inr(fares.max_inr)}.`),
  ].filter(Boolean);
  const riding: Answer | undefined = facts.length
    ? {
        id: 'riding',
        q: `What are the train times and fares on ${label}?`,
        a: `On ${name}: ${facts.join(' ')}`,
        grades: [hours, frequency, fares].filter((f) => f !== null).map((f) => ({ status: f!.status, source: f!.source_url })),
      }
    : undefined;
  return answers.flatMap((x) => (x.id === 'opening' ? (riding ? [when, riding] : [when]) : [x]));
}

/** A line's status answers, or undefined when it has no status page. */
export function answersFor(line: Line): Answer[] | undefined {
  const set = sets[line.id]?.(line);
  return set && withService(line, set);
}

/** Whether the line has a status page. */
export const hasStatusPage = (line: Line) => line.id in sets;
