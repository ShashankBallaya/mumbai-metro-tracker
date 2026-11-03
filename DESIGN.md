---
name: Line 12 Tracker
description: An unofficial daily paper with one story, Mumbai Metro Line 12, printed on newsprint and navy with one orange bar.
colors:
  signal: "#f26b1d"
  signal-line: "#c24a08"
  signal-graphic: "#d5530a"
  on-signal: "#0c1422"
  paper: "#efe9de"
  paper-2: "#e5ddcf"
  paper-3: "#d9d0c0"
  ink: "#111a28"
  ink-2: "#4a453e"
  ink-3: "#5f584f"
  rule: "#bdb3a2"
  concrete: "#a69e91"
  halftone: "rgb(17 26 40 / 0.14)"
  night-paper: "#0c1422"
  night-paper-2: "#121d31"
  night-paper-3: "#1a2740"
  night-ink: "#ece5d8"
  night-ink-2: "#bfb7a9"
  night-ink-3: "#978f82"
  night-rule: "#2d3a55"
  night-signal-line: "#f5813c"
  night-signal-graphic: "#f26b1d"
  night-halftone: "rgb(236 229 216 / 0.09)"
  # Line colours (src/styles/tokens.css): each line's LineMark on every page, and on the hub (/) the bundle, the map strokes and the line marks.
  line-orange: "#f26b1d"
  on-line-orange: "#0c1422"
  line-4: "#1d7a3a"
  on-line-4: "#ffffff"
  line-6: "#c2306e"
  on-line-6: "#ffffff"
  line-2b: "#f2c11d"
  on-line-2b: "#0c1422"
  net-red: "#d42e2e"
  on-net-red: "#ffffff"
  net-aqua: "#36b7c9"
  on-net-aqua: "#0c1422"
  net-gold: "#d9a521"
  on-net-gold: "#0c1422"
  line-7a: "#c0272b"
  on-line-7a: "#ffffff"
  thane-ring: "#6a3fb0"
  on-thane-ring: "#ffffff"
  net-blue: "#2f6fd6"
  on-net-blue: "#ffffff"
typography:
  display:
    fontFamily: "'Anek Latin Variable', system-ui, sans-serif"
    fontSize: "clamp(2.8rem, 1.7rem + 4.4vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.88
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 75"
  headline:
    fontFamily: "'Anek Latin Variable', system-ui, sans-serif"
    fontSize: "clamp(2.1rem, 1.5rem + 2.4vw, 3.6rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 75"
  title:
    fontFamily: "'Anek Latin Variable', system-ui, sans-serif"
    fontSize: "clamp(1.6rem, 1.3rem + 1.2vw, 2.3rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 75"
  subhead:
    fontFamily: "'Anek Latin Variable', system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 1.12rem + 0.55vw, 1.55rem)"
    fontWeight: 700
    lineHeight: 1.05
    fontVariation: "'wdth' 87.5"
  standfirst:
    fontFamily: "'Mukta', system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 1.12rem + 0.55vw, 1.55rem)"
    fontWeight: 400
    lineHeight: 1.45
  body:
    fontFamily: "'Mukta', system-ui, sans-serif"
    fontSize: "clamp(1.02rem, 0.97rem + 0.22vw, 1.14rem)"
    fontWeight: 400
    lineHeight: 1.55
  small:
    fontFamily: "'Mukta', system-ui, sans-serif"
    fontSize: "clamp(0.84rem, 0.8rem + 0.15vw, 0.92rem)"
    fontWeight: 400
    lineHeight: 1.3
  label:
    fontFamily: "'Mukta', system-ui, sans-serif"
    fontSize: "clamp(0.84rem, 0.8rem + 0.15vw, 0.92rem)"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.06em"
  figure:
    fontFamily: "'Anek Latin Variable', system-ui, sans-serif"
    fontSize: "clamp(2.8rem, 1.7rem + 4.4vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.85
    letterSpacing: "-0.02em"
    fontFeature: "'tnum' 1, 'lnum' 1"
    fontVariation: "'wdth' 75"
  # Hub surface (/) only: the figures of a record printed in the fact box.
  hub-box-figure:
    fontFamily: "'Anek Latin Variable', system-ui, sans-serif"
    fontSize: "1.3rem"
    fontWeight: 800
    lineHeight: 1
    fontFeature: "'tnum' 1, 'lnum' 1"
    fontVariation: "'wdth' 75"
rounded:
  none: "0px"
  focus: "2px"
  car: "3px"
  control: "4px"
  capsule: "1rem"
  pill: "999px"
  dot: "50%"
  # Hub surface (/) only: the line mark.
  line-mark: "3px"
spacing:
  s-1: "0.25rem"
  s-2: "0.5rem"
  s-3: "0.75rem"
  s-4: "1rem"
  s-5: "1.5rem"
  s-6: "2rem"
  s-7: "3rem"
  s-8: "4.5rem"
  s-9: "7rem"
  gutter: "clamp(1rem, 0.6rem + 1.8vw, 2.5rem)"
  bar: "0.5rem"
  rule-w: "1px"
  rule-heavy: "4px"
  measure: "54ch"
  page-max: "88rem"
components:
  masthead-band:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.on-signal}"
    typography: "{typography.display}"
    padding: "1rem 0 0.75rem"
  button-signal:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.on-signal}"
    typography: "{typography.subhead}"
    rounded: "{rounded.control}"
    padding: "0.5rem 1.5rem"
    height: "48px"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0.5rem 1.5rem"
    height: "48px"
  button-ink-hover:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.on-signal}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 0.75rem"
    height: "44px"
  button-outline-hover:
    backgroundColor: "{colors.paper-2}"
  nav-link:
    textColor: "{colors.ink-2}"
    typography: "{typography.body}"
    height: "44px"
  nav-link-hover:
    textColor: "{colors.ink}"
  pill-awarded:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.1em 0.55em"
  pill-floated:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.on-signal}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.1em 0.55em"
  pill-default:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.1em 0.55em"
  progress-track:
    backgroundColor: "{colors.paper-2}"
    rounded: "{rounded.none}"
    height: "1rem"
  progress-fill:
    backgroundColor: "{colors.signal-graphic}"
    rounded: "{rounded.none}"
    height: "1rem"
  station-dot:
    backgroundColor: "{colors.ink}"
    rounded: "{rounded.dot}"
    size: "1.25rem"
  panel-quiet:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.none}"
    padding: "1.5rem"
  # Hub surface (/) only. A line's colour token stands in as line-orange here.
  hub-masthead-band:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
  hub-line-mark:
    backgroundColor: "{colors.line-orange}"
    textColor: "{colors.on-line-orange}"
    rounded: "{rounded.line-mark}"
    width: "2.5em"
    height: "1.65em"
  hub-index-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "0.5rem 0.5rem 0.5rem 0"
    height: "44px"
  hub-index-row-hover:
    backgroundColor: "{colors.paper-2}"
  hub-record-open:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "0 1rem"
    height: "44px"
  hub-record-open-hover:
    backgroundColor: "{colors.line-orange}"
    textColor: "{colors.on-line-orange}"
  hub-box-figure:
    textColor: "{colors.ink}"
    typography: "{typography.hub-box-figure}"
  hub-map-frame:
    backgroundColor: "{colors.paper-2}"
    rounded: "{rounded.none}"
  hub-legend-strip:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.ink-2}"
    padding: "0.5rem 0.75rem"
    height: "2.75rem"
  hub-stroke-sample:
    backgroundColor: "{colors.ink}"
    rounded: "{rounded.none}"
    width: "2.2rem"
    height: "4px"
  hub-stop-capsule:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    height: "18px"
---

# Design System: Line 12 Tracker

Scope: the eight sections below govern every page, the line pages and the hub at `/` (the newspaper world). The hub prints in this world since 2026-10-31; the Hub Surface section at the end records only where the hub differs or adds, and where it differs, that section wins on the hub only. The earlier hub world, "Mumbai Key Art", is retired.

## Overview

**Creative North Star: "The Late City Edition"**

The site is a newspaper with one story. It prints in two editions: the night edition (navy paper, cream ink) when the system asks for dark, and the morning edition (warm newsprint, navy ink) otherwise. A reader can switch editions from the masthead. Every page element is a part of a paper: a masthead band, an edition line, an "Inside" index, a front page with a headline, a standfirst and a lead picture, then inside pages that each open under a heavy rule, and a corrections column at the back.

The whole identity is one orange shape, the bar module (0.5rem tall). It is the masthead band, the marker on top of every section head, the separator squares in the edition line, the progress fills, the timeline rails, the hover underline in the index and the station directory, and the casing of the route line itself. Everything else is navy, newsprint and concrete. The route is drawn after Vignelli: thick parallel strokes, one 45-degree bend, dot stations, and x spaced by true chainage. The line is not built yet, so it prints hollow (an orange casing with a paper core). The lead picture follows the Tren Urbano and MASP references: a flat-shaded isometric viaduct and train on an orange halftone field, a giant "12" painted on the road, and concrete in greys with only the train band in orange.

Density is editorial, not dashboard. Sections are solid blocks with a deep gap before the next rule. Facts sit in ruled lists and tables, not cards. Status is always a mark or a stroke pattern plus a word, never hue alone.

**Key Characteristics:**
- One signal colour (Line 12 orange), used as bars, bands, lines and large figures, never as body text.
- Heavy condensed display grotesk (Anek Latin at 75% width, weight 800), set uppercase, against a plain humanist body (Mukta).
- Tabular lining numerals for every figure, date and table.
- Hairline column rules and 4px heavy rules carry the structure. No shadows, no cards.
- Status grammar: solid, dashed, gapped or hollow strokes; tick, ring, dashed square, crosshatch marks.
- Two editions from one token set. Only the paper, ink, rule and orange-on-paper values flip.
- Motion is the ride: the reader scrolls the train along the line, station by station. Without motion, the page is complete.

## Colors

Warm newsprint and night navy, cut by one orange.

### Primary
- **Line 12 Orange** (signal): the band colour. Masthead band, primary button fill, "Floated" tender pill, the train's livery band, the lead picture field, the skip link, text selection and the colophon's top bar. Text on it is always Navy Pressroom (on-signal), at 6:1.
- **Orange Ink** (signal-line, night: night-signal-line): orange where it has to read on paper as a stroke or a large figure. Link underlines, the strike through superseded figures, grade marks for unverified and conflicting facts, the painted distance figure in the route ride, the focus ring. It measures 4.06:1 on morning paper, so it is for large text and marks only.
- **Orange Rail** (signal-graphic, night: night-signal-graphic): orange for graphic shapes on paper, at 3:1 or more. Section-head bars, route casing, progress fills, the current station dot, construction and award rails on the timeline, the edition separators and hover underlines.

### Neutral
- **Newsprint** (paper, night: night-paper): the page ground. Also the hollow core of the route line and the ring around station dots, so the line reads as cut out of the paper.
- **Folded Newsprint** (paper-2, night: night-paper-2): the second sheet. Quiet panels ("not printed yet"), the colophon, the train drawing plate, progress tracks, hover fill on the edition toggle, the scrollbar track.
- **Old Newsprint** (paper-3, night: night-paper-3): the third tone, held in reserve for a deeper sheet.
- **Pressroom Navy** (ink, night: night-ink): headlines, figures, station dots, the "done" phase bar, the "awarded" pill, the ink button, and the heavy rules (rule-strong resolves to ink in both editions).
- **Faded Ink** (ink-2, night: night-ink-2): standfirsts, section intros, secondary copy, unit suffixes, source links.
- **Marginal Ink** (ink-3, night: night-ink-3): metadata, table headers, station order numbers, future or muted items, source lines. 5.8:1 on morning paper, 5.8:1 on night paper.
- **Column Rule** (rule, night: night-rule): hairline dividers between rows and entries, the outline of the edition toggle, dashed "next" and "future" strokes, the empty-state frame.
- **Concrete** (concrete): the scrollbar thumb, the "related" timeline rail, and the short dash before each street-context line in the route. It does not flip between editions.
- **Navy Pressroom** (on-signal): text and marks on orange. It is the same value as night paper.
- **Halftone** (halftone, night: night-halftone): the dot screen on printed-picture areas. Inside the lead picture it becomes navy at 16% on orange.

### Named Rules

**The One Signal Rule.** Orange is the only hue. It appears as the bar module, the route and big figures. Every other colour is paper, ink, rule or concrete.

**The Line Colour Rule.** Each page still has one signal hue: the hue of its line. Lines 12 and 5 print orange; Line 4's pages, its hub card and its share card print green (Line 4 Green, #1d7a3a on morning paper, #3fae66 on night paper, with paper-white or navy text on it), because MMRDA names Line 4 the Green Line. Line 2B's pages print yellow (Line 2B Yellow, #f2c11d), because MMRDA names it the Yellow Line: every accent line, bar, mark and underline is yellow on both papers. Yellow is 1.4:1 on morning paper, so there accent text (`--signal-text`, the ride's distance figures and the warning grade marks) and the focus ring turn navy, route lines (`--route-line`) carry a thin navy edge (`--route-edge`, `--route-filter`), and links take a 2px underline. Line 6's pages print pink (Line 6 Pink, #c2306e with white text on morning paper and #b02a63 for accent text, 5.2:1; #e0589a with navy text on night paper and #f07fb3 for accent text, 7.4:1); the pink is the site's own, from the reported name Pink Line. Line 7A's pages print red (Line 7A Red, #c0272b with white text on morning paper and #b82326 for accent text, 5.3:1; on night paper a saturated red, because a light red reads as coral: #d61f26 bands with white text, 5.1:1, #e5332f route lines and bars, #ff4a3d strokes, large figures and focus, 5.5:1), Line 7's colour, as MMRDA calls 7A Line 7's extension. The Thane Integral Ring Metro's pages print violet (#6a3fb0 with white text on morning paper, 7.1:1, and as accent text, 5.9:1; #9b6fe0 with navy text on night paper, 5.0:1, and #b394f0 for accent text, 7.3:1); MahaMetro names no colour, so the violet is the site's own, chosen because no other line uses it. `data-accent` on `<html>` (or on a hub card) swaps the signal tokens; nothing else changes. A line mark (LineMark) always shows its own line's colour, so Lines 5 and 12 stay orange on a Line 4 page.

**The Three Oranges Rule.** Pick the orange by job, not by taste: signal for fills that carry navy text, signal-graphic for shapes drawn on paper, signal-line for strokes and large figures on paper. Never set body-size text in any orange.

**The Two Editions Rule.** Every colour is written as a token that both editions define. Components never hard-code a hex; the lead picture's isometric palette is the one exception, because it always sits on the orange field.

## Typography

**Display Font:** Anek Latin Variable (then system-ui)
**Body Font:** Mukta (with system-ui)
**Masthead Marathi:** Anek Devanagari, weight 700, for the decorative "मेट्रो १२" mark only, cut to its glyphs by scripts/subset-fonts.py.

**Character:** A condensed, heavy headline grotesk shouts like a front page; a calm, open humanist body reads like the column underneath. The display face is always squeezed to 75% width (87.5% for subheads); the body is never condensed.

### Hierarchy
- **Display** (800, 75% width, step-4 clamp 2.8rem to 6rem, line-height 0.88, uppercase): the front-page headline, the masthead "LINE 12" (line-height 0.8), the pinned station name in the ride.
- **Figure** (800, 75% width, step-4, line-height 0.85 to 0.9, tabular lining): the countdown days, the big numbers, the progress percentages, the ride's painted distance. The number is the headline.
- **Headline** (800, 75% width, step-3 clamp 2.1rem to 3.6rem, line-height 0.95, uppercase): section heads, station names in the vertical route, the rolling-stock maker, word-valued facts.
- **Title** (800, 75% width, step-2 clamp 1.6rem to 2.3rem, line-height 1, uppercase): sub-heads inside a section, phase names, firm names, station directory entries, timeline dates.
- **Subhead** (700, 87.5% width, step-1, uppercase): fact names in the numbers list, the masthead tagline (600), the countdown title and the primary button (800, 75%).
- **Standfirst** (400, step-1, line-height 1.4 to 1.45, Faded Ink, max 52ch on the front, 54ch in sections): the paragraph under a headline.
- **Body** (400, step-0 clamp 1.02rem to 1.14rem, line-height 1.55, max 54ch, about 72 characters): running copy.
- **Small** (400, step--1, line-height 1.3 to 1.45): source lines, captions, target notes, history under a fact.
- **Label** (500, step--1, uppercase, 0.06em to 0.08em tracking): table column heads, grade words, phase states, the edition line, pills, mobile table field names. Labels name data; they do not introduce headings.

### Named Rules

**The Squeeze Rule.** Display type is Anek at 75% width and weight 800, uppercase, with line-height under 1. A display line at normal width or in sentence case is off-world. The one exception is the timeline event title, which drops to Mukta 700 so a long sentence stays readable.

**The Tabular Rule.** Every number, date and table uses tabular lining numerals. Figures line up down a column like a stock page.

**The Balanced Head Rule.** Headings balance their lines; paragraphs wrap pretty. No orphan word on a headline.

## Layout

One centred page frame (max 88rem) with a fluid gutter (1rem to 2.5rem). Space follows one rhythm, s-1 to s-9 (0.25rem to 7rem). A section is a solid block: a 4px ink rule on top, then s-8 (4.5rem) of air before content and s-7 (3rem) after. The section head is a grid: a 4.5rem by 0.5rem orange bar, the uppercase name, then a Faded Ink standfirst.

The front page is one column on phones. At 64rem it becomes a two-column front: the headline column (1.45fr) on the left, the lead picture over the countdown (min 20rem) on the right, and the full-width route strip across the fold under a heavy rule.

Inside pages are ruled lists, not grids of cards. The numbers list goes to two columns at 48rem. Updates go to 1.5fr and 1fr at 56rem. Sources go to three columns at 64rem. The station directory uses newspaper columns (16rem minimum). The rolling-stock spec goes to two text columns at 64rem. Tenders are a full table on wide screens; under 48rem each row becomes a labelled block, one field per line, with the label column at 6rem.

At 64rem and up, two sections pin. The route ride pins for 0.55 viewport heights per station, at most 10 viewport heights for the whole ride (a dense line such as Line 4 rides faster), and moves the train along the line. The timeline pins and slides its strip sideways. Under 64rem, and with reduced motion, both are plain vertical lists.

Every tap target is at least 44px tall; the two buttons are 48px.

### Named Rules

**The Edition Rule.** Structure is printed with rules, not boxes. A heavy 4px ink rule opens each section and each major block; 1px column rules separate rows. If you reach for a card, use a rule instead.

**The True Spacing Rule.** On the route, x is proportional to chainage. Stations keep their real relative spacing on the front strip and in the ride, from the same shared geometry.

## Elevation & Depth

The system is flat. There are no drop shadows anywhere. Depth comes from paper tone (paper, paper-2, paper-3), from the weight of rules (1px against 4px), and from the halftone screen on printed pictures. The only box-shadow in the build is an inset 1px rule that outlines the progress track, which is a hairline, not an elevation. The lead picture carries its own depth by flat isometric shading (top, front and side faces in three concrete tones).

### Named Rules

**The Printed Page Rule.** Nothing floats above the paper. A surface is either the page, a second sheet (paper-2), or an orange band. State never adds a shadow.

**The Halftone Rule.** The dot screen (1px dots on a 6px grid) goes only on printed-picture areas. It is never a page background.

## Shapes

The form language is the bar, the dot and the line. The bar module is a hard-edged rectangle (0 radius) in every use: section markers, rails, progress fills, edition separators. Station dots are circles (50%) with a paper ring, so they sit in the line like punched holes. The route and the legend's line sample are capsules (1rem radius) drawn as an orange casing with a paper core. The train marker is a navy block with a 3px radius and an orange lower band. The interchange mark is two stacked bars, navy above and orange below, where two lines meet.

Controls take a small 4px radius (the two buttons and the edition toggle). Tender status pills are full pills (999px) with a 1.5px border. The focus ring is a 3px Orange Ink outline, offset 3px, with a 2px radius.

Grade marks are 16px drawn glyphs: a filled square with a paper tick (verified), an open ring (reported), a dashed square (unverified), a crosshatched square (conflicting).

## Components

### Buttons
Tactile, square-shouldered, and loud only where the paper allows it.
- **Shape:** gently cut corners (4px), 48px minimum height, padding 0.5rem by 1.5rem.
- **Signal (primary):** Line 12 Orange fill, Navy Pressroom text, display face at 75% width and weight 800, uppercase, with a down arrow. It is the "Ride the line" action on the front page. Hover moves the arrow down 3px; active scales the button to 0.98.
- **Ink:** Pressroom Navy fill, Newsprint text, Mukta 700. It is the "file a correction" action. Hover turns it Line 12 Orange with navy text; active scales to 0.98.
- **Outline toggle:** transparent, 1px Column Rule border, label type inherited from the edition line, 44px tall, a half-filled circle icon. Hover sets the border to ink and the fill to Folded Newsprint.

### Chips (tender status pills)
- **Style:** full pill, 1.5px border in the current colour, label type at 0.8rem, uppercase, 0.06em tracking, bold.
- **State:** Awarded is a navy fill with paper text. Floated is an orange fill with navy text. Other states stay outlined. A cancelled tender strikes its name and scope through in Orange Ink.

### Cards / Containers
The system has no cards. Two container types exist.
- **Ruled block:** no background, a 4px ink rule on top, content under it. Used for the countdown, the works list, the tender table, the station directory, updates and sources.
- **Quiet panel:** Folded Newsprint fill, 0 radius, 1.5rem padding, with a 4px orange rule on top. Used for "what we have not printed yet". The colophon uses the same sheet with a 0.5rem orange bar on top.
- **The back page (colophon, every page; src/components/Colophon.astro, BackPageScene.astro, src/scripts/back-page.ts):** on the Folded Newsprint sheet under its 0.5rem orange bar. The head is three columns: the paper's name in display type with मुंबई मेट्रो and the page's disclaimer, "The lines" (every tracked line with its mark and route, 44px rows on 1px rules) and "The paper" (map, every line, updates, correction, source code), each under a 4px ink rule. Then the drawing, full bleed: an elevated line at dusk engraved in the page's ink (hatched city, hammerhead piers, U-girder deck, sagging catenary), with a six-car rake hand-coloured in the new lines' livery (rake-blue body, rake-white band, rake-yellow lining and cab sweep; paint is the same on both editions, the glass lights up at night) and the road below drawn as long-exposure trails in the bundle's colours (bundleColours), fanning wide in front and passing behind the far piers. No maker's or authority's marks. It ships in layers so scrolling stays cheap (src/lib/back-page-art.ts): the city, wires and piers behind, and the far piers and deck in front, are static SVG files per edition at /back-page/ (rasterised once, then only composited); the road's trails and the train are thin inline strips, so the streaming light repaints only the road and the train glides as one composited layer. The streaming light also pauses while the reader scrolls. The drawing keeps a 5:2 ratio, at least 62rem wide; narrower screens see its left part. Then the dateline under a 4px rule, which labels the drawing as an original illustration. Motion, once, when the drawing is 35% in view: the trail cores draw in 70ms apart, the train glides in from the left and brakes to the centre over 2.6s (cubic-bezier(0.16, 1, 0.3, 1)), the headlight beam fades on; then the streaks and sparks stream in opposite directions, linear, only while the drawing is on screen. Loaded already at the foot, or with reduced motion, the drawing is complete and still.
- **Empty state:** a 2px dashed Column Rule frame, 1.5rem padding, bold lead line. Dashed means "nothing here yet".

### Navigation
- **Masthead band:** full-width Line 12 Orange, "LINE 12" in display type with the Marathi mark beside it, the tagline in subhead type on the right.
- **Edition line:** label type in Faded Ink, uppercase, 0.06em tracking, with 0.5rem orange squares as separators, and the edition toggle on the right. A 1px rule under it. On every line page it opens with "All lines", the way back to the hub (`/`): Pressroom Navy, weight 600, a left arrow drawn like the "Ride the line" arrow, 44px tall; the arrow moves 3px left on hover (fine pointers) and the link presses to 0.97. Each item keeps its label and date together, and each square leads its item, so a wrapped line never ends in a square.
- **Inside index:** the word "Inside" in subhead display type, then a horizontal list of section links (Mukta 500, Faded Ink, 44px tall). Hover or focus sets the text to ink and draws a 3px orange underline from the left. On phones it scrolls sideways with no scrollbar.
- **Links:** inherit the text colour, with a 1px Orange Ink underline offset 0.2em. Hover thickens it to 3px.

### Grade Mark (signature)
Every figure carries one. A 0.95em drawn mark, then an uppercase label word, then a hairline divider and the source outlet as a link. Verified and reported marks are ink; unverified and conflicting marks turn Orange Ink. The word is always present (visibly or for screen readers), so the grade never relies on colour.

### Route Line (signature)
The schematic Line 12, shared by the front-page strip and the route ride. An orange casing (14px on the strip, 22px in the ride) with a paper core (5px and 9px), round joins, one 45-degree bend where the alignment leaves Kalyan-Shilphata Road. Station dots are ink with a paper ring on the strip. In the ride, dots are paper with a 3px ink ring; passed stations fill ink; the current station fills orange and scales to 1.5. The train rides the drawn line, the 45-degree bend included, never the straight chord between two stations. On phones the line runs down the left of a vertical station list as a hollow capsule, with an ink dot per station. Each line takes one 45-degree bend at a real turn: Line 12 where it leaves Kalyan-Shilphata Road, Line 4 at Teen Haath Naka, where it leaves LBS Marg for the Eastern Expressway into Thane. A dense line (more than 24 stations, Line 4) sets its station names in the ride at 45 degrees, rising above and falling below in turn, and the names on its bend rise away from the line, so close stations never collide. An extension built as its own project on the same line (Line 4A) is marked where it begins by a joint, a 4px ink bar across the line, and named by a shield, its label on the line colour in the line-mark style with a paper ring, beside the line in the ride (on the side away from the angled name of the station before it, so above the line for Line 4A) and on it in the front strip (joint only on phones). Its stations carry the same mark and an extension note. A ring (the Thane ring) is drawn opened out at its first station: the line runs past the last station to the full length round, where the first station is named again (both strip ends read Raila Devi). In the ride the train takes one more stretch, back to that end; the pinned panel then returns to the first station and its distance figure reads the full way round. A line whose station names are long (more than 260 characters in all) sets them at 45 degrees like a dense line.

### Progress Bars
- **Works bar:** a 1rem track in Folded Newsprint with an inset 1px rule, filled from the left in Orange Rail to the reported percentage. It grows from zero on first view.
- **Phase bar:** a 1rem bar whose stroke says the state. Done is solid ink. Now is solid orange. Started is gapped orange (12px on, 6px off). Next is a 2px dashed rule outline. The state word sits under it.

### Timeline Rail
Each milestone has a 0.5rem rail across its top. Construction and award events are orange. Related-project events are concrete. Other past events are ink. Future events are a gapped rule stroke (8px on, 6px off) with their date and title in Marginal Ink.

### Superseded Figure
An old figure stays on the page in Marginal Ink with a 2px Orange Ink strike. History is printed, not deleted.

### Lead Picture
A figure on a Line 12 Orange field with the halftone screen. An isometric, flat-shaded viaduct (concrete in three greys), a three-car stainless train with an orange band and navy windows, a navy road with paper lane marks, and a giant navy "12" painted on the ground. It is generated by `scripts/draw-lead-picture.py`; edit the script, not the component. Caption in small type, navy on orange.

### Motion
One easing, `cubic-bezier(0.16, 1, 0.3, 1)`, for every CSS transition (0.2s to 0.45s). GSAP uses expo.out for reveals: the headline rises line by line through a mask (0.9s, 0.07s stagger, so it reads in under a second), counters count up to the printed value (1.2s), bars grow from the left (1.2s). In the ride, the current station enters in 0.3s and the last one leaves in 0.15s, each through a 3px blur so the cross-fade reads as one change. The edition switch wipes the new edition in as a circle from the switch (0.5s), except from the keyboard, where it switches at once. Every pressable control presses to 0.97 over 0.16s. Lenis smooth scroll (lerp 0.12) drives ScrollTrigger. With `prefers-reduced-motion: reduce`, none of it runs and all transitions collapse to 0.01ms; the base state already holds the final values.

## Do's and Don'ts

### Do:
- **Do** build every new accent from the bar module: a 0.5rem hard-edged orange rectangle, or a multiple of it (1rem for progress bars).
- **Do** open every section with a 4px ink rule and a section head of bar, uppercase name and standfirst.
- **Do** pick the orange by job: signal under navy text, signal-graphic for shapes on paper, signal-line for strokes and large figures.
- **Do** draw status as a mark or stroke pattern plus a word: solid, gapped, dashed or hollow; tick, ring, dashed square, crosshatch.
- **Do** set every figure in tabular lining numerals, and give it a grade mark and a source link.
- **Do** keep superseded figures on the page, struck through in Orange Ink.
- **Do** write colours as tokens that both editions define, so the night and morning editions stay in step.
- **Do** keep every section fully readable with motion off.

### Don't:
- **Don't** add drop shadows, floating cards or glass panels. The paper is flat.
- **Don't** introduce a second accent hue. Status, category and emphasis use orange, ink, rule and concrete only.
- **Don't** set body-size text in any orange; Orange Ink is 4.06:1 on morning paper.
- **Don't** put the halftone screen on a page background; it belongs to printed pictures.
- **Don't** set display type at normal width, in a light weight, or in sentence case.
- **Don't** round the bar module or the rules. Radius belongs to dots, lines, controls and pills only.
- **Don't** use a small uppercase tracked label above a heading as a kicker. Labels name data and sit beside or under it.

## Hub Surface: The Front Page

This section governs the hub at `/` only (src/pages/index.astro, src/styles/hub.css, src/scripts/hub.ts, src/scripts/network-map.ts, `networkDrawing` in src/lib/network.ts, and Masthead.astro without a `line` prop). Since 2026-10-31 the hub prints in the line pages' newspaper world, "The Late City Edition": the same tokens, editions, type, rules and components. This section records only where the hub differs or adds. The 2026-10-29 "Mumbai Key Art" world (near-black ground, photo chapters, pills, rounded tiles) is retired (owner, 2026-10-31). Nothing from it carries over.

### Overview

**Creative North Star: "The Front Page"**

The network map is the front page, and every line has a printed record. The reader sees every metro line in the region on the real map, by stage, picks the line they care about, and reads its record in a ruled fact box beside the map: stage, opening target, authority, size, cost and funding, tenders, latest update, each with its grade and source. Below the fold the paper keeps its register of every line by work stage, the latest updates across the tracked lines, and where the lines meet.

The hub adds one device the line pages do not have: the bundle, a ribbon of the primary lines' colours that runs across the top of the page, bends down its left side and carries each section at a stop, like a line diagram.

**Key Characteristics:**
- Newsprint and navy editions, Anek Latin at 75% and 800 for heads, Mukta for copy, 4px ink rules and 1px column rules. No cards, no shadows.
- An ink masthead band (navy on morning paper, cream on night) with the site's name, its Marathi mark and an Inside index of four sections.
- The bundle: one 4px stroke for each primary line with a sourced colour, in line-number order, each colour once.
- The front: the map and its fact box, side by side, ending at the fold.
- Line colours appear only as line marks, map strokes and the bundle. Stage is a stroke pattern beside its word, never a colour.

### Colors

The line pages' paper, ink, rule and orange tokens, in both editions, plus the line colour tokens.

- **Line colours** (line-orange, line-2b, line-4, line-6, line-7a, net-blue, net-red, net-aqua, net-gold, each with its `on-` pair): the bundle's strokes, the map strokes, the line marks in the index and the register, and the "Open tracker" button's hover fill. A line takes a colour only when a source names it (src/lib/network.ts maps the named colour to the token). The hub sets no `data-accent`, so the line colours keep their morning values in both editions.
- **Concrete** (concrete): every map stroke of a line that no source names a colour for.
- **Ink** (ink): the masthead band, the 4px rules, the stop capsules' rings and connectors, the bundle's end joint, the stage stroke samples, the "Open tracker" button.
- **Second Paper** (paper-2): the map frame and the legend strip, the hovered index row, the halo of the drawing's line numbers.
- **The street map's palettes** (in network-map.ts, one per edition): morning ground #e5ddcf, land #ded5c5, water #c3cfd0, major roads #d0c6b4, rail #a69e91 (dashed), place names #5f584f, stations and numbers #111a28, buildings #cbc1b0; night ground #121d31, land #16223a, water #0b1424, roads #24314c, rail #3a4766, place names #978f82, stations and numbers #ece5d8, buildings #253554. They follow paper-2, concrete, ink-3 and ink of each edition.

#### Named Rules

**The Named Colour Rule.** A line shows a colour only when a source names it. Otherwise it gets no bundle stroke, a Concrete map stroke, and an outlined line mark (an inset 1.5px ring in ink-3). Colour never carries stage.

**The Bundle Order Rule.** The bundle has one stroke per primary line, in network.json order, which is line-number order. A branch (2A and 2B, 7A, 12A) shares its primary line's stroke. Each colour appears once: a line that repeats an earlier line's colour adds no stroke (Line 12 repeats Line 5's orange). Today that is 8 strokes, Lines 1 to 8: blue, yellow, aqua, green, orange, pink, red, gold. Never reorder by hue or pick a colour by taste.

### Typography

The line pages' faces and ramp. Hub uses:
- **Masthead name** (Anek 75%, 800, uppercase, clamp 2.4rem to 4.6rem): MUMBAI METRO TRACKER on the ink band, with मुंबई मेट्रो in Anek Devanagari Mark and the tagline in Anek at 87.5%, 600.
- **Box title** (step-2, uppercase): "Being built and upcoming" over the index.
- **Group title** (step-1, uppercase, with its stroke sample, a 1px rule-strong under it): each stage in the index and in the register.
- **Record name** (step-2, uppercase, line-height 1) with the Marathi mark at 0.62em, and the route under it in Anek at 87.5%, 700, uppercase, Faded Ink.
- **Fact names** (`dt`, 0.78rem, 500, uppercase, 0.08em tracking, ink-3) in a 6rem column beside each fact. They name the data beside them; they are never kickers.
- **Box figures** (hub-box-figure: Anek 75%, 800, 1.3rem, line-height 1, tabular): the figures of the record printed in the fact box. The same record in the register keeps its figures in Mukta bold, for density.
- **Line mark** (Anek 75%, 800, 1rem, tabular; step-1 in a record head): the line's number on its colour.
- **Update date** (Anek 75%, 800, step-1, tabular): the date of each latest update.
- **Map numbers**: in the drawing, Anek 75%, 800, 21px with a 5px paper-2 halo; on the street map, Noto Sans Bold 13px with a 2.5px ground halo (the tile server's fonts).

### Layout

From the top: masthead band, edition line, Inside index, then `main.hubmain`, which carries the bundle and four sections, then the colophon.

- **Masthead, hub mode.** An ink band (no orange band, no line label), the edition line ("Edition of" the day, "Facts checked" date, the edition switch), and the Inside index of four sections: Map, Every line, Updates, Where lines meet. Under 30rem the hub's Inside list (`masthead__inside--hub`) wraps beside its label instead of scrolling sideways; the label sits level with the first row of 44px links.
- **The bundle.** One 4px stroke per primary line colour on a 6px pitch. Its width (`--tw`, 46px for 8 strokes), the outer bend radius (`--bend`, the width plus 16px) and the gradient stops (`--stops`) are computed in index.astro from network.json, as desktop px multiplied by `--k`, so a new primary colour widens it. `main` opens with the bundle's width plus s-5 of space. It runs across the top, turns through an SVG quarter bend, and runs down the left side to an ink joint (5px, 6px wider than the bundle each side) at the foot. Sections indent past it by the bundle's width plus a gap (`--tg`), and their heavy 4px rule starts after it instead of cutting across. At 64rem and up `--k` is 1 and `--tg` 2.75rem; under 64rem the same bend, left run and stops print at `--k` 0.5 and `--tg` 1rem.
- **The front** (`#map`). Two columns: the map, `minmax(0, 1fr)`, and the fact box, `minmax(22rem, 30rem)`. Height `max(30rem, 100svh - 22rem)`, so the front ends at the fold at 1440 by 900. Both columns open under a 4px ink rule; the box also takes a 4px ink rule on its left. The box scrolls inside itself (overscroll contained).
- **The map column.** A paper-2 frame. The static drawing (`networkDrawing`: the real geometry in Web Mercator, every third vertex, one number per line at its drawn vertex nearest its centre) is painted at once, inset s-5 by s-6. MapLibre mounts above it after the first paint. The legend is its own strip at the map's foot, `--key-h` 2.75rem tall, under a 1px rule, on paper-2; the live map and its attribution stop above it.
- **Below the front.** The register ("Every line"): every line grouped by work stage (under construction, approved, proposed, running, studied), records in a grid of `minmax(min(100%, 25rem), 1fr)` with a 2rem column gap. A line with one stretch open and another being built is filed with the work still going on, marked "partly open". Then "Latest updates" (the ten newest timeline events of the tracked lines, max 62rem, rows of date, mark and body), "Where the lines meet" (columns of `minmax(min(100%, 20rem), 1fr)`), and the colophon with the hub's disclaimer.
- **Under 64rem.** One column. The map comes first at `min(62svh, 34rem)`; the legend leaves the map and sits under it as a line of keys, with no strip and no rule; the fact box follows, without its left rule, and no longer scrolls inside itself. Update rows put the date on its own line.

#### Named Rules

**The Fold Rule.** The front ends at the fold on a desktop screen. Its height comes from the screen less the masthead, never from its content.

**The Text Fallback Rule.** The map is never the only record. Every line, stage and figure on it is also in the fact box index and in the register, with its grade. Without JavaScript each index entry is a link to its record in the register.

### Elevation & Depth

Flat, as on the line pages. The only depth is on the street map: a picked line tilts the map 55 degrees down its route, and from zoom 13 the city's buildings stand up (fill-extrusion at 0.9 opacity, OpenMapTiles heights). The live map has a ground-coloured casing under every line. The only box-shadow is the inset 1.5px ring on an unnamed line's mark, a hairline. MapLibre's zoom controls sit on paper with a 1px rule outline and no shadow.

### Shapes

Square, as on the line pages. Radius on the hub belongs to:
- the line mark (3px),
- the "Open tracker" button and the map controls (4px, the line pages' control radius),
- the bundle's stop capsules (999px), the only rounded device the hub adds.

### Components

#### The Bundle (signature)
Parallel 4px strokes, one per primary line colour, on a 6px pitch (all scaled by `--k`), drawn as a CSS gradient for the straight runs and as SVG arcs for the bend, so every stroke keeps its lane round the corner. At each section a **stop** carries it: a paper capsule across the bundle (the bundle's width plus 12px, 18px tall, 3px ink ring, 999px radius; under 64rem the width plus 8px, 14px tall, 2px ring) with a 2px ink connector to the section head. The front's stop sits on the bundle's top run. Decorative: `aria-hidden`, no pointer events. Every screen size shows the whole bundle.

#### Masthead, hub mode
The shared Masthead without a `line`: an ink band that flips with the edition, the name as the page's `h1`, its Marathi mark and the tagline "Every metro line in the Mumbai region. The unofficial tracker." The edition line has no way back (this is home). The Inside index lists the four sections.

#### Map (signature)
Two layers in one frame. The drawing answers clicks at once. The street map (MapLibre on OpenFreeMap tiles) loads at idle (timeout 2.5s), or with Data Saver on, only when the reader touches the map; it fades in over 0.5s once its first frame is drawn, and the drawing fades out over 0.4s. Without WebGL or network the drawing stays.
- Stage is the stroke on both layers. Drawing: running solid 3.5px with round caps; under construction 9 on, 5 off; approved 3.5 on, 4 off; proposed round dots on a 5.5 pitch. Street map: running solid, under construction dashed 2.2 by 1.1, approved 0.9 by 1.3, proposed dots, widths growing with zoom.
- One number per line. Stations as ink dots from zoom 11. Place names last, uppercase, 0.08em tracking. Zoom buttons only, cooperative gestures, max zoom 16. The attribution prints on paper with ink-3 text and ink-2 links in both editions (selector `.maplibregl-ctrl.maplibregl-ctrl-attrib`, raised to beat MapLibre's own white rule).
- Picking a line dims the others (drawing 0.18; street map strokes 0.16, numbers 0.25), draws it heavier (6px in the drawing, 1.7 times on the street map), and frames it: fit to its bounds, max zoom 14.5, pitched 55 degrees with the bearing along its route (turned so the view never faces backward), over 1.1s. "All lines" returns to the whole region, flat and north up.

#### Legend
A stroke key only: one stroke sample and its stage word for each drawn stage. No counts; the register counts lines by stage. In its 2.75rem strip at the map's foot on wide screens; under the map on phones.

#### Stage Stroke Sample
A 2.2rem by 4px ink bar, square: solid for running; 10px on, 5px off for under construction; 4px on, 5px off for approved; ink dots on a 7px pitch for proposed; sparse ink-3 dots on an 11px pitch for studied (never drawn on the map). Always beside its stage word: in the legend, the index group titles and the register's stage titles and part lists.

#### Fact Box (signature)
Opens on the index: the box title, a lede counting the lines being built and upcoming, then a group per stage. Each index row is a link: the line mark, the line's name (Mukta 700, line-height 1.3) with its route (and ", partly open" where it applies), and its opening target or stage on the right; 44px minimum, a 1px rule under it, paper-2 on hover (fine pointers). A note links to the running lines in the register. Picking a row (or a line on the map) prints that line's record in the box: a copy of the register's record without its ids, so the page keeps one of each. The record has a 4px ink rule above its facts and its figures in the box figure type. It enters with a rise of 8px and a fade over 0.22s. "All lines" (uppercase, 600, 0.06em tracking, a left arrow that nudges 3px on hover) or Escape returns to the index and gives focus back to the row. The pick lives in the address (`?line=`), so a shared link opens on its line. On a phone, a line picked on the map scrolls the box into view.

#### Record
The register's unit, also printed in the box. A head of the line mark (step-1) beside the name, Marathi mark and route; a fact list (`dl`) of 6rem names and their values, 1px rules between rows, figures tabular in Mukta bold with their grade marks; the line's parts, each with its stroke sample; then links: "Open tracker" (ink, paper text, 4px radius, 44px; hover fills it in the line's colour with its on-colour text) and the line's sources, each outlet once. A record opens with a 4px ink rule; the first row under a stage title opens with a 1px rule.

#### Line Mark
The line's number (N for Navi Mumbai lines) on its colour with its on-colour text, 2.5em minimum width, 1.65em tall, 3px radius. A line with no named colour gets the outlined mark.

#### Update Row
The date (display figure, step-1), the line mark, then the event title (Mukta 700) and its meta line (step--1, ink-3). A 1px rule under each row, a 4px ink rule over the list.

#### Motion
The line pages' motion.ts runs on the hub (Lenis, lerp 0.12); in-page links glide through it, except the fact box's index rows, which hub.ts handles. Hub transitions use `--ease-out`: dimming 0.25s, stroke weight 0.2s, record print 0.22s, the map's fade 0.4s to 0.5s, row and button press scale 0.985 and 0.97 over 0.16s. The map's framing flies over 1.1s. With `prefers-reduced-motion: reduce` the framing jumps (duration 0), the phone's scroll to the box is instant, and every CSS transition collapses to 0.01ms; the page is complete without motion.

### Where the hub differs from the line pages

- **The masthead band is ink**, not orange, and names the site, not a line. The edition line has no back link.
- **The bar module** stays on the section heads (the orange bar); the masthead's line-colour stripe of the direction brief was built as the bundle instead.
- **Many line colours on one page.** The One Signal Rule still holds for orange; the line colours are additional, and only as marks, strokes and the bundle.
- **Sections** indent past the bundle, and their 4px rule starts after it.
- **No lead picture, no halftone, no photos.** The map is the front page's picture.
- **The hub's share card (`/og/hub/`, public/og.png)** is the one place the hub prints a photo: the owner's Shunya bridge pylon (Line 2B, 24 May 2026) full bleed, the paper's name across its sky in display type (142px, paper ink, a navy shade from the top for contrast), and a navy strip under a 0.5rem orange bar with the address, the tracked lines' marks and the photo credit. Owner's choice, 2026-11-03.

### Do's and Don'ts (hub)

#### Do:
- **Do** take every hub colour from the shared tokens; a line's colour comes from its token through `--c` and `--on-c`, and only when a source names it.
- **Do** compute the bundle from network.json (width, bend, stops, as desktop px times `--k`) so it grows with the data; keep one 4px stroke per primary line colour on a 6px pitch.
- **Do** draw stage as a stroke pattern beside its word, on the map, in the legend, the index and the register.
- **Do** keep the front ending at the fold on a desktop screen, and the static drawing painted before the street map.
- **Do** keep a grade mark after every figure in the box and the register.
- **Do** keep Marathi marks decorative: `lang="mr"`, `aria-hidden`, Anek Devanagari Mark.

#### Don't:
- **Don't** bring back the retired "Mumbai Key Art" devices: near-black ground, photo chapters, cover tiles, pills, scrims, rounded tiles.
- **Don't** add counts to the legend; the register counts.
- **Don't** draw a bundle stroke for a line with no sourced colour, give a branch its own stroke, or repeat a colour.
- **Don't** make the map the only record, or label a map line more than once.
- **Don't** add cards, drop shadows, glow or glass. The tilt and the buildings on the street map are the only depth.
- **Don't** use a line colour for body text.
