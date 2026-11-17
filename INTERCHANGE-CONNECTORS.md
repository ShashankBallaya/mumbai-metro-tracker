# Interchange connectors in the MMR

Research note for the Mumbai Metro Tracker. Date: 2026-11-17. Not yet used on the site.

## 1. What this is

This file lists the pedestrian connectors at the interchanges of the Mumbai Metropolitan Region (MMR). A connector is a foot overbridge (FOB), a skywalk, an elevated walkway or deck, a travelator, a subway, a common concourse, or a paid-area transfer between two stations. Lifts and escalators are listed only when they are part of a link.

### Method

1. We built the list of interchanges from the repository: `src/data/lines/*/stations.json` (`interchanges`, `interchanges_table`), `src/data/network.json`, `src/data/planned-stations.json` and the interchange section of `SOURCES.md` (Rohan Shanbhag's table). We added the open lines that the site does not track in full (Lines 1, 2A, 3, 7, Monorail, Navi Mumbai Metro Line 1), from MMRDA's line pages.
2. We searched MMRDA, MMRCL, CIDCO, Maha Metro, MRVC, NHSRCL and BMC, then the news, for each interchange.
3. We read each source page before we used it. Where we could not read a page, we say so.
4. We did not use Wikipedia or its mirrors. Many search results were Wikipedia mirrors. We ignored them.
5. We do not name contractors.

### Grades

- **verified**: the agency says it (its own page, document or post).
- **reported**: a news source says it (Free Press Journal, Mid-day, Construction World, Swarajya, Business Today, The Metro Rail Guy and similar).
- **unverified**: one weak source only, or the source does not say it clearly.

### Status words

- **open**: people use it now.
- **built**: the structure is complete. No source we read confirms that it is open.
- **under construction**: work is in progress.
- **tendered**: the agency has invited bids for the works.
- **approved**: an authority approved it. No tender found.
- **planned**: in an agency plan or a design tender only.
- **proposed**: an idea or a study. Not approved.

### Limits of this research

- MMRDA's tender list (`/en/tenders/tender-notices`) loads its rows by JavaScript. Our tools could not read the rows. We read MMRDA's line pages (the repository's CA file fixes the certificate check).
- MMRCL's site (`corporate.mmrcl.com`, `corporate-old.mmrcl.com`) returned HTTP 403 to our tools. We could not read MMRCL's multimodal press release PDF or its tender list. We used a news report of that release instead.
- Mahatenders and CPPP need a CAPTCHA. We did not use them.

## 2. Summary

- **Interchanges checked: 55.** (Section 3 has 26; section 4 lists 29 entries. Two entries in section 4 group several stations.)
- **Interchanges with a connector found: 26** (any status from proposed to open).
  - Open: 6 (Ghatkopar, Dahisar (E), Marol Naka, Santacruz, CSMIA T2, and Gundavali-WEH, which is built; its opening date is not in a source we read).
  - Under construction: 5 (Mahalaxmi travelator skywalk at about 90%, Chembur Metro-Monorail FOB, Kapurbawdi common station, Line 7A CSIA subways, CSMT pathway to the BMC subway).
  - Tendered: 5 (Kanjurmarg 740 m FOB, Jogeshwari 700 m FOB, SEEPZ-Aarey 250 m FOB, Vikhroli and Bhandup FOBs).
  - Planned or proposed: 9 (six items from the 2020 MMRDA design tender, JVLR, Jogeshwari Terminus skywalk, BKC bullet train tunnel).
  - Status not given: 1 (CSMIA T1 canopies).
- **Interchanges with no connector found: 29 entries** (section 4).

**Biggest gaps**

1. **Line 3 and the suburban railway.** Only CSMT (a 365 m subway, approved 2023) and Santacruz (an existing skywalk) have a named link. We found no connector plan for Churchgate, Grant Road, Mumbai Central or Dadar.
2. **Line 2B and the railway.** We found no connector plan at Kurla or Bandra. Mankhurd has only a 2020 design-tender entry.
3. **Andheri (Line 1 and Western Railway).** We found no readable non-Wikipedia source for the link between the Metro One station and the railway bridges.
4. **The 2020 MMRDA list of 13 interchange facilities.** We know the list from a news report. We found no later public status for 8 of the 13 items.
5. **Thane, Kalyan, Navi Mumbai and the bullet train stations (Thane, Virar).** We found no pedestrian connector plan. The only plans are new metro links (Line 12A "bullet train connector", and the RITES study for a Thane Junction link). These are not walkways.

## 3. Connectors found

Tables are by corridor and agency. Each row has a source we read.

### 3.1 Line 1 (Mumbai Metro One) and Line 7 / 2A / 9 / 7A (MMRDA, MMMOCL)

| Interchange (stations and lines) | Connector type | Length / details | Status | Agency | Date of source | Grade | Source URL |
|---|---|---|---|---|---|---|---|
| Western Express Highway (Line 1) and Gundavali (Line 7) | FOB | 58 m long, 4 m to 8 m wide. Built in about 15 days. | built (Nov 2022); opening date not in the source | MMRDA | 29 Nov 2022 | reported | https://www.freepressjournal.in/mumbai/mumbai-mmrda-completes-58m-long-fob-linking-2-metro-lines-in-15-days |
| Ghatkopar (Line 1) and Ghatkopar (Central Railway) | Elevated deck plus a new south-end FOB, joined to the existing "Metro FOB" | Deck 55 m long. New south-end FOB 12 m wide. A 6.1 m stair gives direct access to the Metro station. The deck also reaches the eastern skywalk. Later phases: more stairs, 6 escalators, 4 lifts. | open (deck and FOB phase 1 commissioned) | MRVC | 24 Jul 2026 | reported | https://www.freepressjournal.in/mumbai/mrvc-opens-new-elevated-deck-and-first-phase-of-south-end-fob-at-ghatkopar-to-ease-congestion-for-commuters |
| Ghatkopar (Line 1) and Ghatkopar (Central Railway) | Entry of railway passengers into the Metro premises, to cut crowds on the FOBs | Talks with Indian Railways "ongoing". Target March 2026. No confirmation that it happened. | proposed | MMOPL and Indian Railways | 6 Mar 2026 | unverified | https://indianinfrastructure.com/2026/03/06/digital-ticketing-building-a-future-ready-afc-system-for-mumbai-metro-line-1/ |
| Dahisar (E) (Lines 2A, 7 and 9) | Transfer inside the station (concourse, escalators and stairs) | No new ticket and no new security check. The report does not say "paid area". | open (Line 9 from 7-8 Apr 2026) | MMRDA, MMMOCL | 7 Apr 2026 | reported | https://www.freepressjournal.in/mumbai/mumbai-metro-expansion-dahisar-east-station-emerges-as-key-interchange-for-lines-7-9-2a-step-by-step-guide-for-commuters |
| D N Nagar (Line 1) and Andheri (W) (Line 2A) | FOB (2020 list, "Type II") | Design only in the source. A later status was not found. | planned (2020 design tender) | MMRDA | 30 Jun 2020 | reported | https://themetrorailguy.com/2020/06/30/mmrda-invites-ddc-bids-for-13-mumbai-metro-interchange-facilities/ |
| CSIA (Line 7A, underground) | Two subways at the station | MMRDA's progress table (as of 31 Aug 2026): Subway-1 base slab and wall 100%; Subway-2 wall 77%. The page does not say where the subways lead (the Line 3 station or Terminal 2). | under construction | MMRDA | page read 2026-11-17 (progress as of 31 Aug 2026) | verified (works); unverified (where they lead) | https://mmrda.maharashtra.gov.in/en/projects/transport/metro-line-9/overview |

### 3.2 Line 6 (MMRDA)

| Interchange (stations and lines) | Connector type | Length / details | Status | Agency | Date of source | Grade | Source URL |
|---|---|---|---|---|---|---|---|
| JVLR (Line 6) and JVLR (Line 7) | FOB between the two paid concourses | About 300 m. It slopes down from Line 6 (33.8 m high) to Line 7 (23.34 m). Also item 4 in the 2020 list. | planned | MMRDA | 22 Nov 2022 | reported | https://themetrorailguy.com/2022/11/22/mumbai-metro-line-6s-56m-girders-placed-over-weh-and-line-7/ |
| SEEPZ Village (Line 6) and Aarey JVLR (Line 3) | FOB over JVLR | 250 m. Rs 43.41 crore. Five entry and exit points, escalators or lifts, CCTV. Bids due 28 Apr 2025. 15 months to build. | tendered | MMRDA | 2 Apr 2025 | reported | https://www.freepressjournal.in/mumbai/mmrda-to-build-4341-crore-fob-linking-mumbai-metro-lines-6-3-for-seamless-connectivity |
| Jogeshwari (W) (Line 6) and Jogeshwari (Western Railway) | FOB (tender Part B) | 700 m. Tender of 16 Oct 2026, with Part A (Kanjurmarg). Both parts about Rs 184.7 crore. 24 months. | tendered | MMRDA | 24 Oct 2026 | reported | https://swarajyamag.com/news-brief/mumbai-metro-6-commuters-to-get-direct-footbridge-links-to-kanjurmarg-and-jogeshwari-railway-stations |
| Jogeshwari Terminus and Ram Mandir (Western Railway), with a link to Goregaon Metro station | Skywalk | Proposal "in its final stages". Phase 1 by 2027. A direct Goregaon Metro to Ram Mandir link is "under consideration". WR is also building two 6 m FOBs near the terminus. | proposed | Western Railway and MMRDA | 13 Jun 2026 | reported | https://www.freepressjournal.in/fpj-shorts/jogeshwari-terminus-to-get-direct-metro-access-via-skywalk-integrating-rail-with-metro-lines-6-and-7a-2 |
| Kanjur Marg (W) (Line 6) / Line 4 and Kanjurmarg (Central Railway) | FOB with a moving walkway, lifts, escalator and CCTV | 740 m. About Rs 93 crore. 18 months after award. Sources disagree on the metro end: Line 4's Vikhroli station (FPJ, Nov 2025), the Line 4 depot at Kanjurmarg (FPJ, Dec 2025), or a "Vikhroli metro station" in the Line 6 tender of 16 Oct 2026 (Swarajya, Part A). | tendered | MMRDA | 28 Nov 2025; 11 Dec 2025; 24 Oct 2026 | reported (end point conflicting) | https://www.freepressjournal.in/mumbai/mumbai-news-mmrda-to-link-vikhroli-metro-kanjurmarg-railway-station-with-pedestrian-bridge ; https://www.freepressjournal.in/mumbai/mumbai-metro-4-update-mmrda-plans-new-bridge-linking-to-kanjurmarg-station-for-seamless-travel ; https://swarajyamag.com/news-brief/mumbai-metro-6-commuters-to-get-direct-footbridge-links-to-kanjurmarg-and-jogeshwari-railway-stations |
| Adarsh Nagar (Line 6) and Shastri Nagar (Line 2A) | FOB (2020 list, "Type II") | Design only. MMRDA's Line 2A page names Shastri Nagar as the Line 6 interchange; its Line 6 page says "Metro Line 2A at Infinity Mall". | planned (2020 design tender) | MMRDA | 30 Jun 2020 | reported | https://themetrorailguy.com/2020/06/30/mmrda-invites-ddc-bids-for-13-mumbai-metro-interchange-facilities/ |
| Kanjur Marg (W) (Line 6) and Gandhi Nagar (Line 4) | Common concourse (2020 list, "Type I") | Design only. | planned (2020 design tender) | MMRDA | 30 Jun 2020 | reported | https://themetrorailguy.com/2020/06/30/mmrda-invites-ddc-bids-for-13-mumbai-metro-interchange-facilities/ |

### 3.3 Lines 4, 5 and 2B (MMRDA)

| Interchange (stations and lines) | Connector type | Length / details | Status | Agency | Date of source | Grade | Source URL |
|---|---|---|---|---|---|---|---|
| Kapurbawdi (Lines 4 and 5) | Common station | One station for both lines. A building in the path blocked the girder that joins Line 5 to Line 4; MMRDA began to demolish it. | under construction | MMRDA | 12 Feb 2026 | reported | https://www.freepressjournal.in/mumbai/girder-link-between-metro-4-metro-5-to-be-completed-as-kapurbawadi-obstruction-removed-in-thane |
| Vikhroli Metro (Line 4) and Vikhroli (Central Railway) | FOB to the existing railway skywalk | Part of a tender for four FOBs (Pant Nagar, Vikhroli, Bhandup, Vijay Garden). Rs 129 crore for all four plus Rs 8 crore for utilities. The article does not say which FOB meets which skywalk. Also item 6 in the 2020 list. | tendered | MMRDA | 14 Apr 2025 | reported | https://www.constructionworld.in/transport-infrastructure/highways-and-roads-infrastructure/mmrda-enhances-metro-access-with-four-railway-linked-foot-overbridges/71931 |
| Bhandup Metro (Line 4) and Bhandup (Central Railway) | FOB to the existing railway skywalk | Same tender as the row above. Also item 8 in the 2020 list. | tendered | MMRDA | 14 Apr 2025 | reported | https://www.constructionworld.in/transport-infrastructure/highways-and-roads-infrastructure/mmrda-enhances-metro-access-with-four-railway-linked-foot-overbridges/71931 |
| EEH (Line 2B) and Siddharth Colony (Line 4) | Common concourse (2020 list, "Type I") | Design only. | planned (2020 design tender) | MMRDA | 30 Jun 2020 | reported | https://themetrorailguy.com/2020/06/30/mmrda-invites-ddc-bids-for-13-mumbai-metro-interchange-facilities/ |
| Chembur (Line 2B) and V N Purav Marg (Monorail) | FOB | Swarajya (25 Apr 2026): MMRDA is building the FOB; work in progress. FPJ (9 Jun 2026): MMRDA's video calls it a "direct pedestrian link interchange"; the Commissioner walked it. Business Today (13 Aug 2026): the Metro station is open; Monorail about 100 m away; no FOB named. Also item 12 in the 2020 list. | under construction (Apr 2026); completion not confirmed | MMRDA | 25 Apr 2026; 9 Jun 2026; 13 Aug 2026 | reported | https://swarajyamag.com/amp/story/news-brief/mumbais-chembur-metro-station-to-open-early-as-line-2b-footfall-stays-low ; https://www.freepressjournal.in/mumbai/mumbai-mmrda-chief-sanjay-mukherjee-inspects-chembur-metro-station-on-line-2b-revamped-monorail-via-short-walk-ahead-of-launch-watch ; https://www.businesstoday.in/india/story/mumbai-metro-2b-chembur-station-opens-how-it-connects-metro-rail-monorail-549058-2026-08-13 |
| Mankhurd (Line 2B) and Mankhurd (Harbour line) | FOB (2020 list, "Type III") | Design only. Line 2B Phase 1 (Diamond Garden to Mandale) is open; no link found. | planned (2020 design tender) | MMRDA | 30 Jun 2020 | reported | https://themetrorailguy.com/2020/06/30/mmrda-invites-ddc-bids-for-13-mumbai-metro-interchange-facilities/ |
| ILFS (Line 2B) and BKC (bullet train) | Interchange facility (2020 list, Phase III, "Type I") | Design only. No later source found. | planned (2020 design tender) | MMRDA | 30 Jun 2020 | reported | https://themetrorailguy.com/2020/06/30/mmrda-invites-ddc-bids-for-13-mumbai-metro-interchange-facilities/ |

### 3.4 Line 3, Aqua Line (MMRCL)

| Interchange (stations and lines) | Connector type | Length / details | Status | Agency | Date of source | Grade | Source URL |
|---|---|---|---|---|---|---|---|
| Mahalaxmi (Line 3), Sant Gadge Maharaj Chowk (Monorail) and Mahalaxmi (Western Railway) | Elevated skywalk with travelators and lifts | 283 m long, 11 m wide. Six travelators (176 m in all). Two lifts. About 4,500 people an hour. "Nearly 90%" done; no opening date. | under construction (about 90%) | MMRDA | 3 Aug 2026 | reported | https://www.constructionworld.in/transport-infrastructure/metro-rail-and-railways-infrastructure/mumbai-to-get-indias-first-travelator-skywalk-linking-transit/95406 |
| CSMT (Line 3) and CSMT (Central and Harbour) | Underground subway | 365 m, from CSMT railway station towards the Himalaya FOB. Access-controlled. State approval; cost shared by the State and Indian Railways. | approved (Jul 2023) | MMRCL | 24 Jul 2023 | reported | https://swarajyamag.com/infrastructure/mumbai-underground-pedestrian-subway-approved-to-provide-direct-link-between-csmt-and-metro-line-3-stations |
| CSMT (Line 3) and the BMC subway at CSMT | Underground pathway | Joins the Metro station to the existing BMC subway. Length not given. The pathway "has become visible". | under construction (Jul 2025); later status not found | not named | 7 Jul 2025 | reported | https://www.constructionworld.in/transport-infrastructure/metro-rail-and-railways-infrastructure/pathway-linking-bmc-subway-to-aqua-line-3-metro-at-csmt-unveiled/75867 |
| Santacruz (Line 3) and Santacruz (Western Railway) | Existing skywalk | About 800 m, per the report of MMRC's multimodal release. Also an underground crossing under the WEH. | open | MMRCL (release); skywalk owner not named | 14 Oct 2024 | reported | https://swarajyamag.com/infrastructure/mumbai-metro-3-mmrc-unveils-multi-modal-integration-to-provide-seamless-connectivity-for-aqua-line-passengers |
| Marol Naka (Line 1 and Line 3) | Staircase from the nearest Line 1 exit to the Line 3 concourse | New staircase. | open (installed by Oct 2024) | MMRCL | 14 Oct 2024 | reported | https://swarajyamag.com/infrastructure/mumbai-metro-3-mmrc-unveils-multi-modal-integration-to-provide-seamless-connectivity-for-aqua-line-passengers |
| CSMIA T2 (Line 3) and Terminal 2 | FOB to Lift Entry/Exit A1 | About 100 m. Walk cut from about 450 m to 118 m. MMRDA announced it on X. | open (Aug 2025) | MMRDA | 21 Aug 2025 | reported | https://www.constructionworld.in/amp/transport-infrastructure/aviation-and-airport-infra/new-footbridge-links-mumbai-metro-to-csmia-terminal-2/77867 |
| CSMIA T1 (Line 3) and Terminal 1 | Covered pedestrian canopies | No length given. | status not given | MMRCL | 14 Oct 2024 | reported | https://swarajyamag.com/infrastructure/mumbai-metro-3-mmrc-unveils-multi-modal-integration-to-provide-seamless-connectivity-for-aqua-line-passengers |
| BKC (Line 3) and BKC (bullet train) | Underground pedestrian tunnel | 1.3 km (July 2025) or about 1.4 km (2026). About 12 m deep, push-box method, under the Vakola nallah. A 7 m by 7 m knockout wall at the bullet train station. Travelators "uncertain". MMRCL invited bids for a design and project management consultant for its tunnel network. | proposed | MMRCL (with NHSRCL) | 8 Jul 2025; 2026 (date not shown on the page we read) | reported | https://www.constructionworld.in/transport-infrastructure/metro-rail-and-railways-infrastructure/bkc-may-get-tunnel-linking-metro-line-3-and-bullet-train-terminal/75962 ; https://www.constructionworld.in/transport-infrastructure/metro-rail-and-railways-infrastructure/mumbai-metro-three-plans-underground-pedestrian-tunnel-network/89462 |

**Other Line 3 pedestrian links (not interchanges, for context)**

| Link | Details | Status | Date | Grade | Source URL |
|---|---|---|---|---|---|
| Science Centre (Line 3) to Worli promenade | About 1 km, 7.5 m wide, under Lala Lajpatrai Road. Rs 7.02 bn. BMC funds; MMRC builds. | approved (BMC) | 27 Aug 2026 | reported | https://www.constructionworld.in/amp/transport-infrastructure/metro-rail-and-railways-infrastructure/underground-pedestrian-link-approved-to-connect-metro-3-and-worli-promenade/96402 |
| Acharya Atre Chowk (Line 3) to Mahalaxmi Racecourse and Haji Ali parking | About 1 km plus a 160 m arm. BMC and MMRCL. It ends at the racecourse, not at Mahalaxmi railway station. | proposed (alignment work) | 29 Jul 2025 | reported | https://www.freepressjournal.in/mumbai/mumbai-eyes-pedestrian-subway-network-to-boost-metro-line-3-connectivity-1-km-link-planned-connecting-acharya-atre-chowk-station-to-mahalaxmi-racecourse |
| Science Centre (Line 3) to Nehru Planetarium | About 500 m. | proposed | 2026 (date not shown) | reported | https://www.constructionworld.in/transport-infrastructure/metro-rail-and-railways-infrastructure/mumbai-metro-three-plans-underground-pedestrian-tunnel-network/89462 |

### 3.5 The 2020 MMRDA list of 13 interchange facilities

MMRDA invited bids on 30 Jun 2020 (tender Metro-PIU/Metro Interchange Stations/2020) for a design consultant for 13 interchange facilities. Estimate Rs 3.43 crore, 36 months. We read this in The Metro Rail Guy (reported). We could not read MMRDA's own notice.

| No. | Interchange | Type in the tender | Later status we found |
|---|---|---|---|
| 1 | D N Nagar (Lines 1 and 2A) | Type II, FOB | none |
| 2 | Shastri Nagar (2A) and Adarsh Nagar (6) | Type II, FOB | none |
| 3 | Andheri (E) (7) and WEH (1) | Type II, FOB | built Nov 2022 (row in 3.1) |
| 4 | JVLR (Lines 7 and 6) | Type II, FOB | about 300 m, planned (TMRG 2022) |
| 5 | Mankhurd (2B) and Harbour line | Type III, FOB to railway | none |
| 6 | Vikhroli (4) and Central Railway | Type III, FOB to railway | FOB tendered (Apr 2025) |
| 7 | Gandhi Nagar (4) and Kanjurmarg (CR) | Type III, FOB to railway | 740 m FOB tendered (end point conflicting) |
| 8 | Bhandup (4) and Central Railway | Type III, FOB to railway | FOB tendered (Apr 2025) |
| 9 | EEH (2B) and Siddharth Colony (4) | Type I, common concourse | none |
| 10 | Gandhi Nagar (4) and Kanjur Marg (6) | Type I, common concourse | none |
| 11 | Kapurbawdi (4 and 5) | Type I, common concourse | common station under construction |
| 12 | Chembur (2B) and V N Purav Marg Monorail | Type II, FOB to Monorail | FOB under construction (Apr 2026) |
| 13 | IL&FS (2B) and the bullet train | Type I, Phase III | none |

## 4. Interchanges with no connector found

We checked these. We found no pedestrian connector plan in a source we could read.

**Metro and suburban railway**

1. Andheri (Line 1) and Andheri (Western Railway). MMRDA's Line 1 page names the interchange only. The only connector detail we found was on Wikipedia mirrors. We did not use it.
2. Dahisar (E) (Lines 2A and 7) and Dahisar (Western Railway). MMRDA's Line 2A page names the interchange only.
3. Kurla (E) (Line 2B) and Kurla (Central Railway). A new railway FOB opened in Nov 2023; no source ties it to the metro.
4. Bandra Metro (Line 2B) and Bandra (Western and Harbour).
5. Churchgate (Line 3) and Churchgate (Western Railway).
6. Grant Road (Line 3) and Grant Road (Western Railway).
7. Jagannath Shankar Sheth / Mumbai Central (Line 3) and Mumbai Central (Western Railway).
8. Dadar (Line 3) and Dadar (Western and Central). Only a "possible" link in reports of the tunnel network; no plan.
9. Kalyan (Lines 5 and 12) and Kalyan Junction (Central Railway).
10. Thane Junction (Thane Ring, underground) and Thane (Central and Trans-Harbour). The Thane SATIS east deck is a separate railway-area project; no metro link found.
11. Belapur (Navi Mumbai Metro Line 1) and CBD Belapur (Harbour). Only Wikipedia mirrors and aggregators.
12. Naigaon, Nalasopara and Virar (Line 13) and the Western Railway. MMRDA names them as interchanges; no connector plan.

**Metro and Monorail**

13. Bhakti Park (Line 4) and Bhakti Park (Monorail). MMRDA's 2016 report puts them opposite each other (repository data). No connector plan found.

**Metro and metro**

14. Income Tax Office (Line 2B) and BKC (Line 3).
15. Katai Naka (Lines 12 and 12A).
16. Amandoot (Lines 12 and 12A, and Navi Mumbai Metro Line 1).
17. Hedutane (Lines 12 and 14).
18. Gandhi Nagar (Line 4) and Kanjur Marg (W) (Line 14, reported only).
19. Balkum Naka (Thane Ring) and Balkum Naka (Line 5), 976 m apart.
20. Dongripada (Thane Ring) and Dongari Pada (Line 4), 186 m apart.
21. Raila Devi (Thane Ring) and Line 4.
22. Gaimukh (Lines 4 and 10).
23. Subhash Chandra Bose Stadium (Lines 9 and 13).
24. Line 8 meeting points: Garodia Nagar (Line 4), SG Barve Marg and Mankhurd (Line 2B), CSIA (Lines 7A and 3). Line 8 has no published station plan.

**Metro and bullet train, airports, bus**

25. Thane bullet train station. Only new metro links are planned (section 5, items 4 and 5). No walkway.
26. Virar bullet train station and Line 13 Virar.
27. Navi Mumbai International Airport (Line 8). No source on the station-to-terminal link.
28. Anik Nagar Bus Depot (Line 4), Lokmanya Nagar Bus Depot and Neelkanth Terminal (Thane Ring). Names only.
29. Line 8 ISBT. Named in the news only.

## 5. Open questions and leads

1. **Gundavali-WEH FOB opening.** Built Nov 2022. Find MMRDA's or MMMOCL's post on the opening. Lead: Construction World, "Mumbai Metro opens FOBs on Metro Line 7" (not read): https://www.constructionworld.in/transport-infrastructure/metro-rail-and-railways-infrastructure/mumbai-metro-opens-fobs-on-metro-line-7/40796
2. **Kanjurmarg 740 m FOB: which metro station?** Three reports give three end points. Read MMRDA's tender (Mahatenders, issued 16 Oct 2026, Part A) or MMRDA's tender page in a browser.
3. **Chembur Metro-Monorail FOB.** Under construction in April 2026. The Monorail was shut from 20 Sep 2025. Check whether the FOB opened with the Chembur station (13 Aug 2026).
4. **Line 12A "bullet train connector" at Katai Naka.** MMRDA's post on X (31 Oct 2026, repository data) names it. It seems to be a metro spur, not a walkway. Ask MMRDA or wait for the DPR.
5. **Thane Junction to the Thane bullet train station.** RITES tender of 9 Oct 2026 for soil tests for a project report (repository data, from images posted on X; graded reported). This is a metro link (9.75 km, 7 stations on Maha Metro's tentative map), not a walkway. Check thanemetrorail.com/Tenders and RITES's tender page.
6. **Line 7A CSIA subways.** MMRDA lists Subway-1 and Subway-2. Find where they lead (Terminal 2, the Line 3 T2 station, or the road). Lead: Line 7A station drawings, or MMRDA's Line 7A photo gallery.
7. **CSMT 365 m subway.** Approved 2023; a pathway to the BMC subway was visible in July 2025. Check if it opened with Line 3's last phase (8 Oct 2025).
8. **MMRCL's multimodal release (Oct 2024).** The PDF returned 403. Read it in a browser: https://corporate.mmrcl.com/sites/default/files/MMRC%27s%20Aqua%20Line%20Set%20to%20Revolutionize%20Travel%20Experience%20with%20Multi-Modal%20Integration.pdf
9. **MMRCL subway DPR tender (7 Jan 2022).** "Technical Consultant for preparing DPR for Direct subway connection to Metro Stations". Not read (MMRCL site 403). It may list Churchgate, Mumbai Central and Dadar: https://corporate.mmrcl.com/sites/default/files/MMRC_RFP_Technical%20Consultant%20for%20preparing%20DPR%20for%20Direct%20subway%20connection%20to%20Metro%20Stations%2007.01.2022_0.pdf
10. **MMRCL multimodal integration contract.** A search result named a contract for Dharavi, Shitala Devi Mandir, Dadar, Siddhivinayak, Worli and Acharya Atre Chowk. Not read. Look on MMRCL's tender list.
11. **Mahalaxmi skywalk opening.** About 90% in Aug 2026. Check MMRDA's X account for the opening.
12. **Ghatkopar ticket rule on the Metro FOB.** Only an undated listing site says Central Railway asks Metro users for a platform ticket. We did not use it. Look for a Central Railway circular or a Mid-day report.
13. **Santacruz 800 m skywalk.** Only the news report of MMRC's release. Confirm the owner (MMRDA's 2008 skywalk programme?) and that it reaches the Metro exit.
14. **MMRDA tender list.** The rows load by JavaScript. Open https://mmrda.maharashtra.gov.in/en/tenders/tender-notices in a browser and search "FOB", "interchange", "skywalk".
15. **CIDCO and Navi Mumbai Metro.** We found no CIDCO page on links at Belapur, Pendhar or Amandoot. Look at CIDCO's tender list.
16. **Line 8 at the airports.** No station plan. Wait for CIDCO's or MMRDA's DPR.

## 6. Sources read

| Title | Publisher | Date | URL |
|---|---|---|---|
| Metro Line 1 overview (interchange facilities) | MMRDA | read 2026-11-17 | https://mmrda.maharashtra.gov.in/en/projects/transport/metro-line-1/overview |
| Metro Line 2A overview | MMRDA | read 2026-11-17 | https://mmrda.maharashtra.gov.in/en/projects/transport/metro-line-2a/overview |
| Metro Line 7 overview | MMRDA | read 2026-11-17 | https://mmrda.maharashtra.gov.in/en/projects/transport/metro-line-7/overview |
| Metro Line 6 overview | MMRDA | read 2026-11-17 | https://mmrda.maharashtra.gov.in/en/projects/transport/metro-line-6/overview |
| Metro Line 9 and 7A overview (progress as of 31 Aug 2026) | MMRDA | read 2026-11-17 | https://mmrda.maharashtra.gov.in/en/projects/transport/metro-line-9/overview |
| Metro Line 2B, 4, 5, 12 and Monorail overviews (no connector words found) | MMRDA | read 2026-11-17 | https://mmrda.maharashtra.gov.in/en/projects/transport/metro-line-2b/overview |
| Tender and Notices (rows not readable, JavaScript) | MMRDA | read 2026-11-17 | https://mmrda.maharashtra.gov.in/en/tenders/tender-notices |
| MMRDA invites DDC bids for 13 Mumbai Metro interchange facilities | The Metro Rail Guy | 30 Jun 2020 | https://themetrorailguy.com/2020/06/30/mmrda-invites-ddc-bids-for-13-mumbai-metro-interchange-facilities/ |
| Mumbai Metro Line-6's 56m girders placed over WEH and Line-7 | The Metro Rail Guy | 22 Nov 2022 | https://themetrorailguy.com/2022/11/22/mumbai-metro-line-6s-56m-girders-placed-over-weh-and-line-7/ |
| MMRDA completes 58m-long FOB linking 2 metro lines in 15 days | Free Press Journal | 29 Nov 2022 | https://www.freepressjournal.in/mumbai/mumbai-mmrda-completes-58m-long-fob-linking-2-metro-lines-in-15-days |
| Mumbai Metro line 7: MMRDA proposes linkway FOBs | Free Press Journal | 2 Apr 2021 | https://www.freepressjournal.in/mumbai/mumbai-metro-line-7-mmrda-proposes-linkway-fobs-for-better-connectivity |
| MRVC opens new elevated deck and first phase of south-end FOB at Ghatkopar | Free Press Journal | 24 Jul 2026 | https://www.freepressjournal.in/mumbai/mrvc-opens-new-elevated-deck-and-first-phase-of-south-end-fob-at-ghatkopar-to-ease-congestion-for-commuters |
| Digital ticketing: an AFC system for Mumbai Metro Line 1 | Indian Infrastructure | 6 Mar 2026 | https://indianinfrastructure.com/2026/03/06/digital-ticketing-building-a-future-ready-afc-system-for-mumbai-metro-line-1/ |
| Dahisar East station emerges as key interchange for Lines 7, 9, 2A | Free Press Journal | 7 Apr 2026 | https://www.freepressjournal.in/mumbai/mumbai-metro-expansion-dahisar-east-station-emerges-as-key-interchange-for-lines-7-9-2a-step-by-step-guide-for-commuters |
| MMRDA to build Rs 43.41 crore FOB linking Metro Lines 6 and 3 | Free Press Journal | 2 Apr 2025 | https://www.freepressjournal.in/mumbai/mmrda-to-build-4341-crore-fob-linking-mumbai-metro-lines-6-3-for-seamless-connectivity |
| Metro 6 commuters to get direct footbridge links to Kanjurmarg and Jogeshwari railway stations | Swarajya | 24 Oct 2026 | https://swarajyamag.com/news-brief/mumbai-metro-6-commuters-to-get-direct-footbridge-links-to-kanjurmarg-and-jogeshwari-railway-stations |
| Jogeshwari Terminus to get direct metro access via skywalk | Free Press Journal | 13 Jun 2026 | https://www.freepressjournal.in/fpj-shorts/jogeshwari-terminus-to-get-direct-metro-access-via-skywalk-integrating-rail-with-metro-lines-6-and-7a-2 |
| Jogeshwari Junction to launch outstation services from January 2027 (no metro link details) | Free Press Journal | 16 Jul 2026 | https://www.freepressjournal.in/mumbai/mumbai-jogeshwari-junction-to-launch-outstation-train-services-from-january-2027-multi-modal-transit-hub-planned |
| MMRDA to link Vikhroli Metro and Kanjurmarg railway station with pedestrian bridge | Free Press Journal | 28 Nov 2025 | https://www.freepressjournal.in/mumbai/mumbai-news-mmrda-to-link-vikhroli-metro-kanjurmarg-railway-station-with-pedestrian-bridge |
| Metro-4 update: MMRDA plans new bridge linking to Kanjurmarg station | Free Press Journal | 11 Dec 2025 | https://www.freepressjournal.in/mumbai/mumbai-metro-4-update-mmrda-plans-new-bridge-linking-to-kanjurmarg-station-for-seamless-travel |
| MMRDA to link Vikhroli Metro and Kanjurmarg station (no date on page) | Mumbai Live | undated | https://www.mumbailive.com/en/civic/mmrda-to-link-vikhroli-metro-and-kanjurmarg-railway-station-with-pedestrian-bridge-91000 |
| MMRDA enhances metro access with four railway-linked foot overbridges | Construction World | 14 Apr 2025 | https://www.constructionworld.in/transport-infrastructure/highways-and-roads-infrastructure/mmrda-enhances-metro-access-with-four-railway-linked-foot-overbridges/71931 |
| Girder link between Metro 4 and Metro 5 at Kapurbawadi | Free Press Journal | 12 Feb 2026 | https://www.freepressjournal.in/mumbai/girder-link-between-metro-4-metro-5-to-be-completed-as-kapurbawadi-obstruction-removed-in-thane |
| Chembur Metro station to open early (FOB in progress) | Swarajya | 25 Apr 2026 | https://swarajyamag.com/amp/story/news-brief/mumbais-chembur-metro-station-to-open-early-as-line-2b-footfall-stays-low |
| MMRDA seeks safety clearance for Line 2B Chembur extension (no FOB detail) | Swarajya | 26 Apr 2026 | https://swarajyamag.com/amp/story/news-brief/mmrda-seeks-safety-clearance-for-metro-line-2b-chembur-extension-to-restore-monorail-link |
| Chembur to emerge as major transit hub (no FOB detail) | Free Press Journal | 28 May 2026 | https://www.freepressjournal.in/mumbai/mumbais-chembur-to-emerge-as-major-transit-hub-with-metro-2b-monorail-integration |
| MMRDA chief inspects Chembur Metro station and Monorail via short walk | Free Press Journal | 9 Jun 2026 | https://www.freepressjournal.in/mumbai/mumbai-mmrda-chief-sanjay-mukherjee-inspects-chembur-metro-station-on-line-2b-revamped-monorail-via-short-walk-ahead-of-launch-watch |
| Metro 2B Chembur station opens: how it connects metro, rail, monorail | Business Today | 13 Aug 2026 | https://www.businesstoday.in/india/story/mumbai-metro-2b-chembur-station-opens-how-it-connects-metro-rail-monorail-549058-2026-08-13 |
| Mumbai to get India's first travelator skywalk linking transit | Construction World | 3 Aug 2026 | https://www.constructionworld.in/transport-infrastructure/metro-rail-and-railways-infrastructure/mumbai-to-get-indias-first-travelator-skywalk-linking-transit/95406 |
| Underground pedestrian subway approved between CSMT and Metro Line 3 | Swarajya | 24 Jul 2023 | https://swarajyamag.com/infrastructure/mumbai-underground-pedestrian-subway-approved-to-provide-direct-link-between-csmt-and-metro-line-3-stations |
| Pathway linking BMC subway to Aqua Line 3 Metro at CSMT unveiled | Construction World | 7 Jul 2025 | https://www.constructionworld.in/transport-infrastructure/metro-rail-and-railways-infrastructure/pathway-linking-bmc-subway-to-aqua-line-3-metro-at-csmt-unveiled/75867 |
| MMRC unveils multi-modal integration for Aqua Line passengers | Swarajya | 14 Oct 2024 | https://swarajyamag.com/infrastructure/mumbai-metro-3-mmrc-unveils-multi-modal-integration-to-provide-seamless-connectivity-for-aqua-line-passengers |
| New footbridge links Mumbai Metro to CSMIA Terminal 2 | Construction World | 21 Aug 2025 | https://www.constructionworld.in/amp/transport-infrastructure/aviation-and-airport-infra/new-footbridge-links-mumbai-metro-to-csmia-terminal-2/77867 |
| BKC may get tunnel linking Metro Line 3 and bullet train terminal | Construction World | 8 Jul 2025 | https://www.constructionworld.in/transport-infrastructure/metro-rail-and-railways-infrastructure/bkc-may-get-tunnel-linking-metro-line-3-and-bullet-train-terminal/75962 |
| Mumbai Metro Three plans underground pedestrian tunnel network | Construction World | 2026 (date not shown on the text we read) | https://www.constructionworld.in/transport-infrastructure/metro-rail-and-railways-infrastructure/mumbai-metro-three-plans-underground-pedestrian-tunnel-network/89462 |
| Underground pedestrian link approved to connect Metro 3 and Worli promenade | Construction World | 27 Aug 2026 | https://www.constructionworld.in/amp/transport-infrastructure/metro-rail-and-railways-infrastructure/underground-pedestrian-link-approved-to-connect-metro-3-and-worli-promenade/96402 |
| Pedestrian subway network for Metro Line 3: Acharya Atre Chowk to Mahalaxmi Racecourse | Free Press Journal | 29 Jul 2025 | https://www.freepressjournal.in/mumbai/mumbai-eyes-pedestrian-subway-network-to-boost-metro-line-3-connectivity-1-km-link-planned-connecting-acharya-atre-chowk-station-to-mahalaxmi-racecourse |
| MMOPL to build Andheri Metro bridge (the viaduct over the railway, not a walkway; not used in the tables) | Construction World | 1 Apr 2011 | https://www.constructionworld.in/transport-infrastructure/highways-and-roads-infrastructure/MMOPL-to-build-Andheri-Metro-bridge/3362 |

**Pages we tried but could not read**

| Title | Reason | URL |
|---|---|---|
| MMRC's Aqua Line multimodal integration release (PDF) | HTTP 403 | https://corporate.mmrcl.com/sites/default/files/MMRC%27s%20Aqua%20Line%20Set%20to%20Revolutionize%20Travel%20Experience%20with%20Multi-Modal%20Integration.pdf |
| MMRCL tender list | HTTP 403 | https://corporate-old.mmrcl.com/en/latest-tenders/all |
| Lokmat Times, BKC bullet train terminal to connect with Metro 2B and 3 | HTTP 403 | https://www.lokmattimes.com/mumbai/mumbai-bullet-train-terminal-to-connect-with-metro-lines-2b-and-3-a525 |
| MMRDA tender rows | loaded by JavaScript | https://mmrda.maharashtra.gov.in/en/tenders/tender-notices |

**Repository data used for the interchange list** (not new sources): `src/data/lines/*/stations.json`, `src/data/network.json`, `src/data/planned-stations.json`, `SOURCES.md` (interchange table by Rohan Shanbhag; Line 12A and Thane Ring notes), commit 7638975 (RITES tender, from images on X).
