---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: ["src/styles/hub.css","src/scripts/hub.ts","src/scripts/network-map.ts"]
---

# Surface brief: the hub (src/pages/index.astro)

Scope: the hub at `/`, the front page of Mumbai Metro Tracker. Since 2026-10-31 it prints in the line pages' newspaper world (DESIGN.md, "The Late City Edition"); the 2026-10-29 "Mumbai Key Art" world is retired (owner: too dark and murky, too long to scroll, photos too weak, not ours). Mode: Read (the visitor understands the network and finds a line).
Audience: residents asking which line, where and when; enthusiasts asking who builds it, what it costs, which tenders, what changed lately.
Purpose (owner, 2026-10-31): details of under-construction and upcoming lines: where they run, tenders, authority, funding and the latest updates.
Content: src/data/network.json and network-geometry.geojson (every MMR line, graded); each tracked line's project.json, tenders.json, timeline.json. Every figure keeps its grade and source.
Keep (owner): the network map, line colours, Marathi marks. Photos leave the hub.
Constraints: PRODUCT.md (sourced facts, no em dashes, English only, reduced motion, Lighthouse 90+ and accessibility 100, phone on mobile data).

## Direction contract

THESIS: The network map is the front page, and every line has a printed record. Choose a line on the map or in the index and a ruled fact box beside the map prints it: stage, opening target, authority, size, cost and funding, tenders, latest update. It refuses the key-art cover and the photo chapters, and the dark map-and-chips transit hero.

OWN-WORLD: The line pages' newspaper: newsprint and navy editions, Anek Latin squeezed to 75% at 800 for heads, Mukta for copy, 4px ink rules and 1px column rules, no cards, no shadows. The masthead band is ink (navy on morning paper, cream on night). Under it runs the bundle: one stroke per primary line colour in line-number order (owner, 2026-11-01), across the top and down the left side at every width, with each section hanging off it at a stop. Line colours appear only as line marks, map strokes and the bundle.

STORY: The reader sees every metro line in the region on the real map, by stage; picks the line they care about; reads its record with sources; opens its tracker. Below, the full register of every line (being built and upcoming first), the latest updates across the tracked lines, and where the lines meet.

FIRST VIEWPORT: Masthead (wordmark MUMBAI METRO TRACKER, मुंबई मेट्रो, tagline), edition line, Inside index, the bundle. Then a two-column front: the map on the left (about two thirds, full height of the screen below the masthead), a static drawing of the real geometry painted at once and MapLibre fading in over it; the fact box on the right (about 30rem) under a 4px ink rule, opening on the index of lines being built and upcoming. On phones the map comes first at about 60% of the screen and the box follows. Signature interaction: choosing a line dims the others on the map, frames it, and prints its record in the box; "All lines" returns to the index.

FORM: "The map and its fact box", position 6 of 7 on the ordered list, dealt lead. seed:a4f98c2ac9e2a1c6

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
