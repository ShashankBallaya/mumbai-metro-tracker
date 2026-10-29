# Plan: the hub redesign

Status: started 2026-10-29. Owner's request: "Let's work on the Mumbai Metro Tracker home page", with the Rockstar GTA VI site (rockstargames.com/VI) as inspiration.

## Owner decisions (2026-10-29)

- Scope: the hub (`/`, `src/pages/index.astro`) only. Line pages keep the newspaper look (DESIGN.md, "The Late City Edition"). The hub is the cover; one click takes the reader into the paper.
- Take from the inspiration: the cover collage (a tile per scene around one central mark) and a full-screen scroll chapter for each tracked line. Not chosen: the dusk palette and the giant release date.
- New: a map of every metro line in the Mumbai Metropolitan Region (MMR), by stage: constructed (operational), under construction, planned, proposed, future prospect.
- Network: all MMR metro. MMRDA and MMRCL lines (1 to 14, 2A, 2B, 4A, 7A, 12A), CIDCO's Navi Mumbai Metro, and the Thane ring metro.
- Map: real geography (MapLibre), not a schematic.
- Chapters: the four tracked lines (12, 12A, 5, 4). Every other line is on the map with its stage, length and source, and can get a chapter later.
- Pictures: original illustrations drawn by script (like `scripts/draw-lead-picture.py`), one per chapter, labelled as illustrations.

## Stages (working definitions, owner to confirm)

| Stage | Means | Map stroke |
|---|---|---|
| Operational | Carries passengers on all or part of the line | Solid |
| Under construction | Civil work awarded and started | Gapped |
| Planned | Approved by the state cabinet or the Centre; DPR done; not yet under construction | Dashed |
| Proposed | In an MMRDA, MMRCL, CIDCO or state plan, not approved | Dotted |
| Future prospect | Announced or reported as an idea, no DPR | Dotted, faint, no route if none is published |

A line can be in two stages (a phase open, the rest under construction). The map then draws each part in its own stroke.

## Data

- `src/data/network.json`: one entry for each line. Number, name, colour name (only where a primary or reputable source names one), agency, terminals, length, station count, stage for each part, opening or target date. Every fact carries `status`, `source_url`, `last_verified`, as in `project.json`.
- Sources: MMRDA, MMRCL, CIDCO, MahaMetro, the state government, then reputable news. Never Wikipedia.
- `src/data/network-geometry.geojson`: line geometry. OpenStreetMap (ODbL, credited) for built and under-construction lines; the existing `alignment-*.geojson` for tracked lines; terminal-to-terminal indicative lines, dashed and labelled, only where a published plan gives the stations. No route drawn where none is published.

## Steps

1. Research every line into `network.json`, with a SOURCES.md section. Owner reviews the grades.
2. Trace geometry (script in `scripts/`, output committed).
3. Direction round for the hub look (Impeccable): the newspaper world stays on line pages; the hub cover is decided here.
4. Build the hub: cover collage, network map, four chapters, the "where the lines meet" facts.
5. Draw the four chapter illustrations by script.
6. Check desktop and phone, finish review, document the hub in DESIGN.md.

## Risks

- Planned and proposed lines change often and sources conflict. Show conflicts; do not pick silently.
- MapLibre plus many lines on a phone on mobile data: keep the map lazy and the cover static first.
- The cinematic cover must not break Lighthouse 90+ or the reduced-motion path.
