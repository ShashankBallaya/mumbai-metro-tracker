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
  # Line colours (src/styles/tokens.css): each line's LineMark on every page, and on the hub (/) the chapter accents and the network map.
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
  # Hub surface (/) only, "Mumbai Key Art": scoped to .hubw in src/styles/hub.css. Line pages never use these.
  hub-bg: "#0b0d12"
  hub-bg-2: "#13161d"
  hub-ink: "#f4f1ea"
  hub-ink-2: "rgb(244 241 234 / 0.76)"
  hub-ink-3: "rgb(244 241 234 / 0.6)"
  hub-rule: "rgb(244 241 234 / 0.16)"
  hub-focus: "#f5813c"
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
  # Hub surface (/) only. Same display face as the line pages, at the hub's own sizes.
  hub-cover-title:
    fontFamily: "'Anek Latin Variable', system-ui, sans-serif"
    fontSize: "clamp(3.4rem, 1.8rem + 7vw, 7.5rem)"
    fontWeight: 800
    lineHeight: 0.84
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 75"
  hub-plate:
    fontFamily: "'Anek Latin Variable', system-ui, sans-serif"
    fontSize: "clamp(5rem, 2.6rem + 11vw, 12rem)"
    fontWeight: 800
    lineHeight: 0.84
    letterSpacing: "-0.02em"
    fontFeature: "'tnum' 1, 'lnum' 1"
    fontVariation: "'wdth' 75"
  hub-network-title:
    fontFamily: "'Anek Latin Variable', system-ui, sans-serif"
    fontSize: "clamp(3rem, 1.7rem + 5.6vw, 6.6rem)"
    fontWeight: 800
    lineHeight: 0.86
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 75"
  hub-chapter-name:
    fontFamily: "'Anek Latin Variable', system-ui, sans-serif"
    fontSize: "clamp(2.4rem, 1.5rem + 3.8vw, 5.2rem)"
    fontWeight: 800
    lineHeight: 0.88
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 75"
  hub-next:
    fontFamily: "'Anek Latin Variable', system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 1.8rem + 3.2vw, 4.6rem)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.02em"
    fontFeature: "'tnum' 1, 'lnum' 1"
    fontVariation: "'wdth' 75"
  hub-fact:
    fontFamily: "'Anek Latin Variable', system-ui, sans-serif"
    fontSize: "clamp(1.9rem, 1.4rem + 2vw, 3.1rem)"
    fontWeight: 800
    lineHeight: 1
    fontFeature: "'tnum' 1, 'lnum' 1"
    fontVariation: "'wdth' 75"
  hub-stage-title:
    fontFamily: "'Anek Latin Variable', system-ui, sans-serif"
    fontSize: "clamp(1.3rem, 1.1rem + 0.9vw, 1.9rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 75"
  hub-pill:
    fontFamily: "'Anek Latin Variable', system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.01em"
    fontVariation: "'wdth' 75"
  hub-lede:
    fontFamily: "'Mukta', system-ui, sans-serif"
    fontSize: "clamp(1.08rem, 1rem + 0.35vw, 1.3rem)"
    fontWeight: 400
    lineHeight: 1.45
  hub-fact-name:
    fontFamily: "'Mukta', system-ui, sans-serif"
    fontSize: "0.82rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.06em"
  hub-credit:
    fontFamily: "'Mukta', system-ui, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 400
    lineHeight: 1.35
  hub-mark-mr:
    fontFamily: "'Anek Devanagari Mark', 'Anek Latin Variable', system-ui, sans-serif"
    fontSize: "clamp(1.4rem, 1rem + 1.6vw, 2.4rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0"
rounded:
  none: "0px"
  focus: "2px"
  car: "3px"
  control: "4px"
  capsule: "1rem"
  pill: "999px"
  dot: "50%"
  # Hub surface (/) only.
  hub-stroke: "3px"
  hub-mark: "6px"
  hub-chip: "8px"
  hub-plate: "10px"
  hub-tile: "14px"
  hub-map: "16px"
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
  # Hub surface (/) only. A chapter's accent is its line's colour token; line-orange stands in for it here.
  hub-pill-ink:
    backgroundColor: "{colors.hub-ink}"
    textColor: "{colors.hub-bg}"
    typography: "{typography.hub-pill}"
    rounded: "{rounded.pill}"
    padding: "0 1.4rem"
    height: "48px"
  hub-pill-line:
    backgroundColor: "{colors.line-orange}"
    textColor: "{colors.on-line-orange}"
    typography: "{typography.hub-pill}"
    rounded: "{rounded.pill}"
    padding: "0 1.4rem"
    height: "48px"
  hub-pill-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.hub-ink}"
    typography: "{typography.hub-pill}"
    rounded: "{rounded.pill}"
    padding: "0 1.4rem"
    height: "48px"
  hub-pill-ghost-hover:
    backgroundColor: "{colors.hub-ink}"
    textColor: "{colors.hub-bg}"
  hub-nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.hub-ink-2}"
    rounded: "{rounded.pill}"
    padding: "0 0.85rem"
    height: "44px"
  hub-nav-link-hover:
    backgroundColor: "rgb(244 241 234 / 0.1)"
    textColor: "{colors.hub-ink}"
  hub-cover-tile:
    backgroundColor: "{colors.hub-bg}"
    rounded: "{rounded.hub-tile}"
  hub-number-plate:
    backgroundColor: "{colors.line-orange}"
    textColor: "{colors.on-line-orange}"
    typography: "{typography.hub-plate}"
    rounded: "{rounded.hub-plate}"
    padding: "0.08em 0.28em 0"
  hub-tile-plate:
    backgroundColor: "{colors.line-orange}"
    textColor: "{colors.on-line-orange}"
    rounded: "{rounded.hub-mark}"
    padding: "0.12em 0.4em 0.02em"
  hub-credit-chip:
    backgroundColor: "rgb(11 13 18 / 0.62)"
    textColor: "{colors.hub-ink-2}"
    typography: "{typography.hub-credit}"
    rounded: "{rounded.hub-chip}"
    padding: "0.4rem 0.7rem"
  hub-line-mark:
    backgroundColor: "{colors.line-orange}"
    textColor: "{colors.on-line-orange}"
    typography: "{typography.hub-stage-title}"
    rounded: "{rounded.hub-mark}"
    width: "3.4rem"
    height: "2.4rem"
  hub-map-frame:
    backgroundColor: "{colors.hub-bg-2}"
    rounded: "{rounded.hub-map}"
    height: "min(78svh, 46rem)"
  hub-stroke-sample:
    backgroundColor: "{colors.hub-ink}"
    rounded: "{rounded.hub-stroke}"
    width: "2.4rem"
    height: "5px"
---

# Design System: Line 12 Tracker

Scope: the eight sections below govern every line page (the newspaper world). The hub at `/` has its own world, "Mumbai Key Art", recorded in the Hub Surface section at the end; where it differs, that section wins on the hub only.

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

**The Line Colour Rule.** Each page still has one signal hue: the hue of its line. Lines 12 and 5 print orange; Line 4's pages, its hub card and its share card print green (Line 4 Green, #1d7a3a on morning paper, #3fae66 on night paper, with paper-white or navy text on it), because MMRDA names Line 4 the Green Line. Line 2B's pages print yellow (Line 2B Yellow, #f2c11d), because MMRDA names it the Yellow Line: every accent line, bar, mark and underline is yellow on both papers. Yellow is 1.4:1 on morning paper, so there accent text (`--signal-text`, the ride's distance figures and the warning grade marks) and the focus ring turn navy, route lines (`--route-line`) carry a thin navy edge (`--route-edge`, `--route-filter`), and links take a 2px underline. Line 6's pages print pink (Line 6 Pink, #c2306e with white text on morning paper and #b02a63 for accent text, 5.2:1; #e0589a with navy text on night paper and #f07fb3 for accent text, 7.4:1); the pink is the site's own, from the reported name Pink Line. `data-accent` on `<html>` (or on a hub card) swaps the signal tokens; nothing else changes. A line mark (LineMark) always shows its own line's colour, so Lines 5 and 12 stay orange on a Line 4 page.

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

At 64rem and up, two sections pin. The route ride pins for 0.55 viewport heights per station and moves the train along the line. The timeline pins and slides its strip sideways. Under 64rem, and with reduced motion, both are plain vertical lists.

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
- **Empty state:** a 2px dashed Column Rule frame, 1.5rem padding, bold lead line. Dashed means "nothing here yet".

### Navigation
- **Masthead band:** full-width Line 12 Orange, "LINE 12" in display type with the Marathi mark beside it, the tagline in subhead type on the right.
- **Edition line:** label type in Faded Ink, uppercase, 0.06em tracking, with 0.5rem orange squares as separators, and the edition toggle on the right. A 1px rule under it.
- **Inside index:** the word "Inside" in subhead display type, then a horizontal list of section links (Mukta 500, Faded Ink, 44px tall). Hover or focus sets the text to ink and draws a 3px orange underline from the left. On phones it scrolls sideways with no scrollbar.
- **Links:** inherit the text colour, with a 1px Orange Ink underline offset 0.2em. Hover thickens it to 3px.

### Grade Mark (signature)
Every figure carries one. A 0.95em drawn mark, then an uppercase label word, then a hairline divider and the source outlet as a link. Verified and reported marks are ink; unverified and conflicting marks turn Orange Ink. The word is always present (visibly or for screen readers), so the grade never relies on colour.

### Route Line (signature)
The schematic Line 12, shared by the front-page strip and the route ride. An orange casing (14px on the strip, 22px in the ride) with a paper core (5px and 9px), round joins, one 45-degree bend where the alignment leaves Kalyan-Shilphata Road. Station dots are ink with a paper ring on the strip. In the ride, dots are paper with a 3px ink ring; passed stations fill ink; the current station fills orange and scales to 1.5. On phones the line runs down the left of a vertical station list as a hollow capsule, with an ink dot per station. Each line takes one 45-degree bend at a real turn: Line 12 where it leaves Kalyan-Shilphata Road, Line 4 at Teen Haath Naka, where it leaves LBS Marg for the Eastern Expressway into Thane. A dense line (more than 24 stations, Line 4) sets its station names in the ride at 45 degrees, rising above and falling below in turn, and the names on its bend rise away from the line, so close stations never collide. An extension built as its own project on the same line (Line 4A) is marked where it begins by a joint, a 4px ink bar across the line, and named by a shield, its label on the line colour in the line-mark style with a paper ring, under the line in the ride and on it in the front strip (joint only on phones). Its stations carry the same mark and an extension note.

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
One easing, `cubic-bezier(0.16, 1, 0.3, 1)`, for every CSS transition (0.2s to 0.45s). GSAP uses expo.out for reveals: the headline rises line by line through a mask (1.1s, 0.12s stagger), counters count up to the printed value (1.4s), bars grow from the left (1.2s). Lenis smooth scroll (lerp 0.12) drives ScrollTrigger. With `prefers-reduced-motion: reduce`, none of it runs and all transitions collapse to 0.01ms; the base state already holds the final values.

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

## Hub Surface: Mumbai Key Art

This section governs the hub at `/` only (src/pages/index.astro, src/styles/hub.css, src/scripts/hub.ts, src/scripts/network-map.ts). Line pages keep "The Late City Edition" above. Hub tokens carry the `hub-` prefix in the front matter; the line colours (`line-*`, `net-*`) are shared tokens that the hub uses as its accents.

### Overview

**Creative North Star: "Mumbai Key Art"**

The hub is the cover of the whole tracker, told like a game's key art instead of a newspaper. Each tracked line is a place at a real hour of Mumbai light: a full-bleed, credited ground or drone photo that the reader scrolls into. The facts arrive inside the picture, each with its grade, and the network map of every line in the region closes the story.

The ground is near-black, the ink is warm paper white in three strengths, and the only hue on a chapter is that line's own colour: Lines 12, 12A and 5 in Line Orange, Line 4 in Line 4 Green, Line 2B in Line 2B Yellow. The first screen is a collage of five photo tiles (14px corners) around the MUMBAI METRO TRACKER mark with its Marathi mark. Scrolling grows a line's own tile, from its place on the cover, through a mask into its full-screen chapter. Depth comes from the photo's slow scale inside the mask and from dark scrims, never from shadow, glow or glass.

The type is the line pages' type: Anek Latin squeezed to 75%, weight 800, uppercase, for every display line, and plain Mukta for copy. Huge number plates in the line colour name each line. Controls are full pills. The hub prints in two editions like the line pages: night (near-black) and morning (the line pages' newsprint and navy), following the system setting, with the same edition toggle in the top bar. The chapters always print on the night tokens, because their copy sits on footage or a photo.

**Key Characteristics:**
- Near-black ground (hub-bg) and paper-white ink (hub-ink) in three strengths, set on `.hubw`, which redefines paper, ink and rule for the shared components.
- One accent per chapter: the line's own colour token, as the number plate, route stroke, primary pill, tile tint and nav dot.
- Full-bleed real photos, one per line, each with a dated, linked credit chip.
- Anek Latin at 75%, weight 800, uppercase, with decorative Marathi marks in paper white.
- Pills (999px) and rounded tiles (14px); no cards, no shadows, no glass.
- Motion is the mask: a cover tile grows into its chapter as the reader scrolls. With motion off, every chapter is a complete still frame.
- A dark MapLibre map where stage is a stroke pattern and each line carries one number label.

### Colors

Near-black and paper white, cut by each line's own colour.

#### Primary (per chapter)
- **Line Orange** (line-orange, on-line-orange): the accent of the Line 12, 12A and 5 chapters and their cover tiles. Navy text on it.
- **Line 2B Yellow** (line-2b, on-line-2b): the accent of the Line 2B chapter and tile. Navy text on it.
- **Line 4 Green** (line-4, on-line-4): the accent of the Line 4 chapter and tile. White text on it. On the hub it stays the morning value; the hub has no night swap for line colours.
- A chapter, tile, nav link or list row sets `--c` and `--on-c` from its line's token. Every accent use reads `--c`: the number plate, the route stroke, the "Open the tracker" pill, the nav dot, the list mark, the list link underline, and the tile and chapter plate tints (`color-mix` of `--c` into hub-bg at 18% to 45%).

#### Network colours
- **Line 6 Pink, Line 2B Yellow** (line-6, line-2b) and **Line 7 Red, Line 3 Aqua, Line 8 Gold** (net-red, net-aqua, net-gold): used on the map and in the list mark only where a source names the line's colour (src/lib/network.ts maps the named colour to the token). No source gives a value for red, aqua or gold, so those three are the site's own.
- **Unnamed Line Grey** (#8d939c, in network-map.ts): every line whose colour no source names. In the list, such a line's mark is outlined (an inset 1.5px ring in hub-ink-3) instead of filled.

#### Neutral
- **Night Ground** (hub-bg): the page, the html background and scrollbar track, the map casing under every line, the text on the ink pill.
- **Second Ground** (hub-bg-2): the map frame, map popups and controls, the colophon sheet.
- **Paper White** (hub-ink): titles, figures, the ink pill, the ghost pill's hover fill, map station dots and line numbers, text selection.
- **Soft White** (hub-ink-2, 76%): ledes, phase lines, nav links at rest, credits, route end names, Marathi marks on the cover.
- **Quiet White** (hub-ink-3, 60%): fact names, the "Tracker" half of the mark, agency and notes in the list, the map note, the foot note.
- **Hairline** (hub-rule, 16%): row dividers in the list, the stage-title underline, the "All lines" pill outline, the colophon top rule.
- **Hub Focus Orange** (hub-focus): the focus ring, and the unverified and conflicting grade marks (the hub sets `--signal-line` and `--focus` to it). It is the night edition's Orange Ink.

#### Named Rules

**The Hub Line Colour Rule.** A chapter's accent is one hue: its line's colour, read through `--c`. Everything else is hub-bg, hub-ink and its strengths, plus Hub Focus Orange on focus rings and on unverified or conflicting grade marks (shipped as is; on the Line 4 chapter that is a second hue, an open question for the owner, not a pattern to copy). Never pick a hue by taste; take it from the line's token.

**The Named Colour Rule.** A network line shows a colour only when a source names it. Otherwise it is drawn in Unnamed Line Grey and its mark is outlined. Colour never carries stage.

**The Scrim Rule.** Text never sits on bare photo. Every chapter photo carries two near-black scrims (bottom: 94% to 60% at 38% to clear at 70%; left: 82% to 66% at 32% to 30% at 56% to clear at 78%); every cover tile carries one (85% at the foot to clear at 45%); the credit chip sits on hub-bg at 62%.

### Typography

**Display Font:** Anek Latin Variable at 75% width, weight 800, uppercase (then system-ui)
**Body Font:** Mukta (with system-ui)
**Marathi Marks:** Anek Devanagari Mark, weight 700, 100% width, no case change, no tracking

**Character:** The same squeezed, heavy grotesk as the line pages, set larger and on black so it reads as key art; Mukta stays calm underneath.

#### Hierarchy
- **Number Plate** (hub-plate, clamp 5rem to 12rem, line-height 0.84, tabular): the line number on its colour plate in each chapter.
- **Cover Title** (hub-cover-title, clamp 3.4rem to 7.5rem, line-height 0.84, balanced): MUMBAI METRO TRACKER, with "Tracker" in Quiet White.
- **Network Title** (hub-network-title, clamp 3rem to 6.6rem, line-height 0.86): THE WHOLE NETWORK.
- **Chapter Name** (hub-chapter-name, clamp 2.4rem to 5.2rem, line-height 0.88, balanced): the line's short route.
- **Next Target** (hub-next, clamp 2.6rem to 4.6rem, line-height 0.9, tabular): the next opening target date on the cover.
- **Fact** (hub-fact, clamp 1.9rem to 3.1rem, line-height 1, tabular): length, stations and target in a chapter, each followed by a compact grade mark at 0.9rem.
- **Stage Title** (hub-stage-title, clamp 1.3rem to 1.9rem): each stage group head in the list, with its stroke sample, and the list marks (1.15rem).
- **Pill and Wordmark** (hub-pill, 0.95rem; wordmark 1.35rem): every pill label and the top-bar wordmark.
- **Lede** (hub-lede, max 40ch on the cover, 54ch for the chapter phase line, 62ch for the network lede): Mukta in Soft White, wrapped pretty.
- **Fact Name** (hub-fact-name, uppercase, 0.06em tracking, Quiet White): the `dt` above each chapter figure. It names the figure under it; it is not a kicker over a heading.
- **Credit** (hub-credit, 0.8rem, line-height 1.35): the photo credit chip.
- **Marathi Mark** (hub-mark-mr): beside the chapter number in hub-ink (clamp 1.4rem to 2.4rem), in the cover tile label in Soft White (clamp 0.95rem to 1.2rem), and under the cover title at 0.34em in Soft White. Always `lang="mr"` and `aria-hidden`.

#### Named Rules

**The Shared Squeeze Rule.** Every display line on the hub is Anek Latin at 75%, weight 800, uppercase, line-height under 1, exactly as on the line pages. The hub changes the sizes, not the face.

**The Decorative Marathi Rule.** Marathi marks are ornament beside the English, never the copy itself. They are hidden from screen readers and set in Anek Devanagari Mark (cut to its glyphs by scripts/subset-fonts.py; rerun it when a mark changes).

### Layout

The hub is three movements: the cover, a chapter per tracked line (12, 5, 4, 12A), and the network.

- **Top bar:** absolute over the cover, the wordmark left and the line links right, padding 0.9rem by the gutter. Under 48rem only the "All lines" pill shows.
- **Cover:** tiles and chapters run in line order, ascending (owner, 2026-10-30): 2B, 4, 5, 12, 12A. On phones, a two by two grid of 5:4 tiles with the fifth across both columns (0.75rem gap), then the mark, lede, next target and the "Scroll the lines" pill below. At 64rem it fills the screen: three columns (1fr, 1.3fr, 1fr) on six equal rows, the Line 2B, 4 and 5 tiles stacked left, the Line 12 and 12A tiles stacked right, the mark in the middle at full height; height 100svh less 5.75rem, at least 36rem.
- **Chapter:** a tall section (100svh + 90svh + the line's length over the longest line's length times 110svh) with a sticky full-screen stage, so a longer line takes longer to scroll. The copy sits bottom-left, max 52rem wide; the credit chip sits top-right under the bar (full-width at the top on phones).
- **Network:** a head (max 60rem) with the title, lede and per-stage counts; the map (min(78svh, 46rem) tall); then the full text list by stage. Each row is a 3.4rem mark column and the body; each part line is a 2.4rem stroke column and its text. The list goes to two columns at 64rem. "Where the tracked lines meet" and the review note close it.
- **Breakpoints:** 48rem (top bar links, credit chip, route end names) and 64rem (cover collage, two-column list).
- Every tap target is at least 44px tall (nav links); pills are 48px.

#### Named Rules

**The Length Is Scroll Rule.** A chapter's scroll length follows its line's real length. Do not set it by hand.

**The Text Fallback Rule.** The map is never the only record. Every line, stage and figure on the map is also in the text list under it, with its grade.

### Elevation & Depth

The hub is flat like the line pages: no drop shadows, no glow, no glass. Depth comes from the photo itself (its slow scale inside the mask), from the near-black scrims (see The Scrim Rule), and from the Second Ground under the map. The only box-shadow is the inset 1.5px ring on an unnamed line's list mark, a hairline. On the map, a hub-bg casing under every line and text halos (2px to 2.5px in the map ground) keep crossings and labels readable.

#### Named Rules

**The Depth by Picture Rule.** On the hub, depth belongs to the photo. A surface is the ground, the second ground or a picture; state never adds a shadow.

### Shapes

The hub is rounded where the line pages are square. Its radius ladder, from small to large:
- hub-stroke (3px): the stage stroke samples.
- hub-mark (6px): the cover tile's number plate and the list's line marks.
- hub-chip (8px): the photo credit chip.
- hub-plate (10px): the chapter's huge number plate and the map popups.
- hub-tile (14px): the cover tiles, and the mask a chapter opens from.
- hub-map (16px): the map frame.
- pill (999px): every pill and nav link. dot (50%): the nav dots.

The chapter route is a solid 6px stroke in the line colour with round caps and joins, drawn from the line's shared schematic (one 45-degree bend at its real turn, no stations). The focus ring is a 3px Hub Focus Orange outline, offset 3px, with a 4px radius.

### Components

#### Pills
Round, heavy and quiet until touched.
- **Shape:** full pill (999px), 48px tall, 0 by 1.4rem, hub-pill type.
- **Ink:** Paper White fill, Night Ground text. "Scroll the lines" on the cover. Hover lifts it 1px.
- **Line:** the line colour fill with its on-colour text. "Open the Line N tracker" in each chapter. Hover lifts it 1px.
- **Ghost:** transparent with a 1px Paper White border at 40%. "All N stations" and "Status, answered". Hover fills it Paper White with Night Ground text.
- **Active:** every pill scales to 0.97.

#### Navigation (top bar)
- The wordmark "Mumbai Metro Tracker" in display type at 1.35rem, "Tracker" in Quiet White.
- Line links: pill-shaped, 44px tall, Mukta 500 at 0.95rem in Soft White, each with a 0.6rem dot in its line colour. Hover (fine pointers only) sets a 10% Paper White fill and Paper White text. "All lines" adds a Hairline outline and jumps to the network.

#### Cover Tile (signature)
A link to its chapter: the line's photo, cover-cropped at its own focus point, in a 14px-cornered frame tinted with the line colour (22% into hub-bg) while it loads. A foot scrim carries the label: the number on a 6px line-colour plate, the short route in Mukta 500, then the Marathi mark. Hover (fine pointers) scales the photo to 1.04 over 0.9s. Tile images have empty alt; the chapter photo carries the description.

#### Chapter (signature)
A sticky full-screen stage. The photo fills it (object-fit cover at its focus point) under two scrims. The copy, bottom-left: the number plate with the Marathi mark beside it, the chapter name, the phase line with a compact grade, the three facts (length, stations, target) each with a compact grade, the route stroke between its first and last station names, and the pills. The credit chip, top-right: what the picture shows where a reader could misread it, then "Photo:" the credit (linked when it is someone else's, opening in a new tab) and the date.

#### Network Map (signature)
MapLibre on OpenFreeMap tiles, loaded when the section is within 600px of the viewport. The basemap is dark: ground #0e1117, land #141820, water #0a1a26, major roads #262b35, rail as a dashed #3a3f4a line, and city, town and suburb names last, uppercase with 0.08em tracking in #8f949c, so place names are never cut. Lines sit on a hub-bg casing. Stage is the stroke: running is solid, being built is long dashes, approved is short dashes, proposed is dots. Station dots (Paper White, from zoom 11) and one bold 12px Paper White number per line, at the drawn point nearest the centre of that line. Zoom buttons only (no compass), cooperative gestures, compact attribution. Clicking a line opens a popup on hub-bg-2 (10px corners): the line name, its stage "here", and a link to its tracker when there is one. Before it loads, the frame says that the list below has every line.

#### Stroke Sample
A 2.4rem by 5px bar (3px corners) that repeats the map's stroke in the list and the counts: solid Paper White for running; 10px on, 5px off for under construction; 4px on, 5px off for approved; a 3px Soft White dotted bar for proposed; a 2px Quiet White sparse dot for "studied as an idea" (list only, never drawn on the map). It always sits beside the stage word.

#### Network List Row
A line mark (3.4rem by 2.4rem, 6px corners, the line colour or an outlined ring), then the line name (Mukta 700, linked to its tracker with a 2px underline in the line colour), the length and station count in tabular numerals with compact grades, the agency in Quiet White, and one line per part: stroke sample, part name, stage word, opening date and note, and its grade. A Hairline divides the rows.

#### Colophon on the hub
The shared Colophon, printed on the hub's ground: Second Ground sheet, a 1px Hairline on top (no orange bar), Paper White text, links underlined in Paper White at 50%. It takes the hub's own `disclaimer`, which names the photos and their permissions.

#### Motion
Two curves: `--ease-out` `cubic-bezier(0.23, 1, 0.32, 1)` for presses and anything that enters, `--ease-in-out` `cubic-bezier(0.77, 0, 0.175, 1)` for on-screen moves; colour changes use plain `ease` (200ms). Every pressable (pills, cover tiles, top-bar links, the edition switch) answers a press with scale 0.97 (tiles 0.985) over 160ms. The tile photo zoom enters in 700ms and leaves in 350ms. The hub has one Lenis (lerp 0.11, in hub.ts; the line pages' motion.ts stands aside on the hub, so two engines never fight), and only with a mouse or trackpad: touch screens keep the browser's own scroll, and their chapters scrub with a 0.2s catch-up instead of 0.6s, so a chapter moves with the thumb. The address bar showing or hiding does not re-measure the chapters. An in-page link glides for 1.2s (quartic ease-out) and lands where its chapter is fully open (0.58 of its scroll, after the route has drawn), not on its closed frame; from the keyboard it jumps at once and moves focus to the target. On load the cover intro is CSS, so it starts with the first paint: each tile fades in (600ms) while its photo settles from scale 1.12 (1100ms), 60ms apart, and the mark's parts rise 16px (700ms, 60ms apart, from 100ms). The tile boxes never move, because the chapter masks measure them. The map fades in (500ms) once its first frame is drawn. In each chapter one scrubbed timeline (scrub 0.6) runs: the clip-path on the whole stage (picture and copy together, so nothing shows outside the frame) opens from the box of the reader's own cover tile, rounded 14px, to the full screen at 0 radius (power2.inOut), applied from the first render; the picture settles from scale 1.18 to rest (over 2.0 of the timeline; on touch screens over 1.0, with the mask, because every step of that scale repaints the stage); the title block (number plate, Marathi mark and name) rises 48px at 0.55; the phase, facts, route and pills rise 26px each in turn from 0.8, one explicit tween each (a staggered fromTo sets only its first target up front); the route draws itself at 0.95; then the frame holds. As the stage stops sticking and scrolls away, it shrinks to scale 0.9 (scrubbed) and its corners round to 14px once, by a class with a 300ms transition, not on every frame; the reverse of its opening, with no fade. The mask stays a clip-path: a mask built from scale transforms was measured and repainted more. Footage pauses in a hidden tab and only the clip on screen resumes. With `prefers-reduced-motion: reduce` neither GSAP nor Lenis starts and all transitions collapse to 0.01ms; every chapter is a complete still frame with its photo, facts, route and pills in place.

### What carries over, and what does not

**Still applies on the hub (from the newspaper world):**
- The grade mark on every figure, with its source (Grade, compact on the hub), and the mark drawn by shape plus a word (The Grade Mark).
- Tabular lining numerals for every figure and date (The Tabular Rule).
- Status never by colour alone: on the hub, stage is a stroke pattern plus a word, on the map and in the list.
- The Squeeze Rule for display type, Mukta for copy, balanced headings and pretty paragraphs.
- Never body-size text in a line colour; colour is for plates, strokes, dots and fills under their on-colour text.
- No em dashes in any copy.
- Reduced motion is complete: nothing needed to understand the page depends on motion.
- Tap targets of 44px or more; a 3px focus ring offset 3px.
- No kickers: a small uppercase label names the data under it and never introduces a heading.
- No drop shadows, floating cards or glass.

**Does not apply on the hub:**
- The Two Editions Rule's token flip for the chapters: a chapter always prints on the night tokens over its picture; the cover, network, map and colophon flip with the edition.
- The One Signal Rule, The Line Colour Rule's single page hue and The Three Oranges Rule: each chapter takes its own line's colour, and the network shows every named line colour.
- The bar module, the masthead band, the edition line, the Inside index and the section head (bar, name, standfirst): the hub has none of them.
- The Edition Rule's heavy 4px ink rules: the hub divides with 1px Hairlines and space.
- Square controls (4px): hub controls are full pills, and tiles, chips, plates and the map frame are rounded (6px to 16px).
- The Halftone Rule and the drawn lead picture: the hub uses real, credited photos instead.
- The hollow route casing with a paper core and station dots: the hub's route is a solid line-colour stroke without stations.
- The colophon's orange top bar: on the hub it is a Hairline.

### Do's and Don'ts (hub)

#### Do:
- **Do** set every hub colour from the `hub-` tokens and the line's own colour token through `--c` and `--on-c`.
- **Do** give every chapter one real ground or drone picture, credited with its note, photographer (linked when it is someone else's) and date. A chapter may play a short drone loop (scripts/encode-hub-footage.sh: H.264, 1600 and 960 wide, forward then backward): it loads only near its chapter, plays only on screen, and keeps its poster with reduced motion or Data Saver. Never use a section that shows the creator's picture-in-picture inset.
- **Do** set each chapter's figures as one display line (number, unit, grade mark), never as a label over a big number, and make each grade mark the link to its source (Grade `markLink`); list a network line's sources once, under the line.
- **Do** alternate chapters between left and right copy on wide screens, so neighbours never share a composition.
- **Do** put text on a photo only over the scrims.
- **Do** open each chapter from its own cover tile's box, rounded 14px, to the full screen.
- **Do** draw stage on the map and in the list as a stroke pattern beside its word, and show a line's colour only when a source names it.
- **Do** keep a compact grade mark after every figure and phase line.
- **Do** keep Marathi marks decorative: `lang="mr"`, `aria-hidden`, Anek Devanagari Mark.
- **Do** keep every chapter a complete still frame with motion off.

#### Don't:
- **Don't** bring the newspaper's bar module, heavy ink rules, masthead band or halftone onto the hub.
- **Don't** add a second hue to a chapter, or use a line colour for body text.
- **Don't** use renders, illustrations or uncredited images as chapter pictures.
- **Don't** add cards, drop shadows, glow or glass; depth belongs to the photo.
- **Don't** make the map the only record; every line stays in the text list.
- **Don't** label a map line more than once; one number per line.
