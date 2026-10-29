---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: []
---

# Surface brief: the hub (src/pages/index.astro)

Scope: the hub at `/`, the cover of Mumbai Metro Tracker. Line pages keep the newspaper world (DESIGN.md); this surface has its own world. Mode: Read (the visitor understands the network), told the way the Rockstar GTA VI site tells a game (owner's inspiration, 2026-10-29).
Audience: corridor residents first (which line, where, when), transit enthusiasts second (every line in the region, stage, source).
Content: src/data/network.json (21 lines, graded), src/data/network-geometry.geojson, each tracked line's project.json. Every figure carries its grade and source.
Constraints: PRODUCT.md (sourced facts only, no em dashes, English only, reduced-motion path, Lighthouse 90+ and accessibility 100, phone on mobile data). Owner: cover collage, a chapter per tracked line, a real-geography map of every MMR line by stage; closer to GTA VI, more Mumbai, modern not retro; the line pages' fonts (Anek Latin 75%) with decorative Marathi marks; pictures are real ground and drone photos (owner's own, or used with permission), each credited (owner, 2026-10-29, after Blender proofs read as low-poly).
Memorable moment: a key-art tile on the cover grows through a mask into its line's full-screen chapter.
Unresolved: owner review of network.json grades and stage definitions (HUB-PLAN.md); higher-resolution frames of the drone stills; full Marathi copy (asked, not answered).

## Direction contract

THESIS: Each line is a place at a real hour of Mumbai light, shown as full-screen key art you scroll into; the facts arrive inside the picture and the network map closes the story. It refuses the transit-site default (a dark map hero, a line list with colour chips, status pills, cards).

OWN-WORLD: Near-black ground (#0b0d12) and warm paper white, with each line's own colour as the only accent. Full-bleed real photos, one per line, each with a dated, linked credit chip. The line pages' display type (Anek Latin squeezed to 75%, weight 800, uppercase) with decorative Marathi marks in paper white; plain Mukta body. Huge line-colour number plates. Pill buttons and rounded tiles (14px). No cards, no glow, no glass; depth from the photo's slow scale inside the mask.

STORY: The reader sees the four lines around Kalyan and Thane as places, learns for each what it is, how far along, when it opens and how sure that is, then sees all 21 MMR lines on the real map by stage, and opens a line's tracker.

FIRST VIEWPORT: Full screen. A collage of four photo tiles (12 APMC Kalyan at night, 5 Kasheli station, 4 Kapurbawdi station, 12A Manpada) around a central MUMBAI METRO TRACKER mark with मुंबई मेट्रो; on phones the four tiles come first, above the mark. Under the mark, the next opening target with its grades. A small top bar with the wordmark, the four lines and an All lines pill. Scrolling grows each line's own tile, from its place on the cover, through a mask into its chapter: the photo settles, the line number and name land huge, the facts slide in with grades, the route draws itself across the picture, a pill opens the line's tracker. Each chapter's scroll length follows the line's real length (raise from the dance score). After the chapters, the MapLibre map of every line, stage as stroke pattern, with a full text list by stage.

FORM: User-pinned direction "Mumbai Key Art" (round 3, after two re-rolls), position 1 of the presented hand; seed key de0ef7ad (re-roll 2).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
