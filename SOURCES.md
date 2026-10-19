# Sources

Research for Phase 1. Last reviewed: 2026-09-29.

Every data point in `src/data/*.json` has a `source_url`, a `last_verified` date and a `status`.

## Status values

| Status | Meaning | How the UI shows it |
|---|---|---|
| `verified` | Confirmed by a primary source: the MMRDA website or the MMRDA-published DPR. | Normal. |
| `reported` | From a reputable secondary source (news or trade press). Not confirmed by a primary source. | Small "reported" tag with the outlet name. |
| `unverified` | Single weak source, or not confirmed. | Clear warning style. |
| `conflicting` | Sources disagree. The value is the latest credible figure. `alternatives` lists the others. | Warning style plus the alternatives. |

## Primary sources

1. **MMRDA, Metro Line 12 project page.** Length, stations, depot, interchanges, cost, 2031 ridership, monthly progress (as of 31 Aug 2026).
   https://mmrda.maharashtra.gov.in/en/projects/transport/metro-line-12/overview
2. **Detailed Project Report, Mumbai Metro Line 12, Kalyan to Taloja.** Prepared by DMRC for MMRDA. Final, April 2019. Design basis, station chainages, alignment coordinates, cost, rolling stock assumptions.
   https://mmrda.maharashtra.gov.in/sites/default/files/2021-10/Metro%20Line%2012.pdf

Note: the MMRDA server has an incomplete TLS certificate chain. Some tools refuse to fetch it. Browsers load it normally.
3. **MMRDA, Metro Line 12 approved alignment (KMZ), final 20 Mar 2025.** Published on the Metro Influence Zone for NOC page. Centre line (22.166 km from the start point at Kalyan to the end point past Amandoot), the 1.229 km Nilje depot connection, and a point for each of the 19 stations. Used for the route line and every station position.
   https://mmrda.maharashtra.gov.in/en/division/metro-piu/metro-influence-zone-noc (file: https://mmrda.maharashtra.gov.in/sites/default/files/2025-03/metro_line_12_4.kmz)
4. **MMRDA, Invitation of Expression of Interest for a Rs 14,100 Cr loan for Metro Lines 10 and 12, March 2026.** Page 7: MMRDA approval (146th Authority Meeting, 21 Nov 2018), State approval (GR dated 6 Sep 2019), civil contract awarded March 2024, estimated cost Rs 11,516 Cr plus IDC, loan requirement Rs 7,800 Cr, about 45 minutes saved, interchanges at Kalyan and Amandoot. It also repeats the 2019 DPR length and station count (20.756 km plus 0.5 km, 17 stations).
   https://mmrda.maharashtra.gov.in/sites/default/files/2026-03/tender_document.pdf

## Secondary sources (reputable news and trade press)

| Outlet | Date | Used for | URL |
|---|---|---|---|
| The Metro Rail Guy | 15 Feb 2022 | GC bids invited | https://themetrorailguy.com/2022/02/15/mumbai-metro-line-10-line-12s-general-consultant-bids-invited/ |
| The Metro Rail Guy | 29 Jul 2022 | GC preferred bidder | https://themetrorailguy.com/2022/07/29/systra-db-wins-mumbai-metro-line-10-12s-general-consultancy/ |
| The Metro Rail Guy | 26 Dec 2022 | GC award, Rs 265.10 cr, 54 months | https://themetrorailguy.com/2022/12/26/systra-db-awarded-mumbai-metro-line-10-12s-general-consultancy/ |
| The Metro Rail Guy | 31 May 2023 | First civil tender CA-185, CA-186, bidders | https://themetrorailguy.com/2023/05/31/11-bidders-for-mumbai-metro-line-12-kalyan-talojas-civil-work/ |
| The Metro Rail Guy | 9 Jun 2023 | Design consultant award | https://themetrorailguy.com/2023/06/09/lkt-enia-jv-wins-mumbai-metro-line-12s-design-consultant-work/ |
| The Metro Rail Guy | 9 Feb 2024 (updated) | CA-240 bids, scope, 19 stations, LoA 27 Mar 2024 for Rs 1,971.77 cr | https://themetrorailguy.com/2024/02/09/gawar-wins-mumbai-metro-line-12s-construction-contract-ca-240/ |
| Metro Rail Today | 9 Feb 2024 | CA-240 lowest bid Rs 2,037.20 cr | https://metrorailtoday.com/news/gawar-constructions-wins-2037-crore-civil-contract-for-mumbai-metro-line-12 |
| Swarajya | Mar 2024 | Foundation stone, 3 Mar 2024 | https://swarajyamag.com/infrastructure/mumbai-metro-foundation-stone-laid-to-progress-with-22-km-line-12-enhancing-transit-between-kalyan-and-navi-mumbai |
| Biltrax Media | Mar 2024 | Foundation stone, 3 Mar 2024 | https://media.biltrax.com/maharashtra-cm-lays-foundation-of-metro-line-12-in-mmr/ |
| Free Press Journal | 25 Dec 2024 | Dec 2027 target, depot details, contract periods (MMRDA statement) | https://www.freepressjournal.in/mumbai/navi-mumbai-orange-metro-line-12-to-connect-kalyan-taloja-set-for-completion-by-december-2027 |
| Construction World | 19 Aug 2025 | Operations claims (unverified) | https://www.constructionworld.in/transport-infrastructure/metro-rail-and-railways-infrastructure/mumbai-metro-line-12-to-connect-kalyan--taloja---nm-airport/77782 |
| Free Press Journal | Dec 2025 | 100th U-girder, May 2028 target | https://www.freepressjournal.in/mumbai/mumbai-metro-update-kalyantaloja-line-key-link-to-navi-mumbai-airport-crosses-100th-u-girder-milestone-target-completion-may-2028 |
| Rail Analysis India | 15 Dec 2025 | 100th U-girder, long spans, station heights | https://railanalysis.in/metro/mmrdas-mumbai-metro-line-12-marks-major-milestone-with-100th-u-girder-launch-near-dombivli/ |
| Re-Mumbai | 17 Feb 2026 | 200th U-girder near Golavali | https://remumbai.in/2026/02/17/metro-line-12-achieves-key-construction-milestone-in-kalyan-dombivli-taloja-corridor/ |
| Newsband | 20 Feb 2026 | Line 12A approval (related project) | https://www.newsband.in/article_detail/kalyantaloja-metro-12a-corridor-gets-state-approval |
| Metro Rail News | 1 Jun 2026 | Systems and rolling stock tender, about Rs 4,882 cr | https://metrorailnews.in/mmrda-invites-bids-for-rolling-stock-and-signalling-systems-for-mumbai-metro-line-12/ |
| Urban Acres | 1 Jun 2026 | Same tender, about Rs 4,900 cr | https://urbanacres.in/mumbai-metro-line-12-tender-advances-network/ |
| Loksatta (Marathi) | 27 Sep 2026 | 53.87% overall progress (unnamed MMRDA sources), May 2028 target, 19-station list with Kalyan, Nilje depot about 45 ha | https://www.loksatta.com/mumbai/kalyan-taloja-metro-12-construction-status-mmrda-mumbai-print-news-rnb-99-6159080/ |
| Wikipedia, Orange Line | read 28 Sep 2026 | Approval dates and claims marked unverified | https://en.wikipedia.org/wiki/Orange_Line_(Mumbai_Metro) |

## Derived data

Since 2026-09-29 the route line (`src/data/alignment-mmrda-2025.geojson`) and every station position come from MMRDA's approved alignment of 20 Mar 2025 (primary source 3), built by `scripts/build-alignment.py`. Station points are graded verified. Each station's distance along the line (`along_m`) is measured along the centre line from MMRDA's start point at Kalyan; every station point lies within 8 m of the line. The earlier positions below are kept in `stations.json` under `location.earlier`. Compared with them, most stations moved 5 to 35 m; Nilje Gaon moved 561 m (the 2025 line runs straight where the 2019 line curved east through the wetlands), Sonarpada 111 m, Pisarve 107 m, Hedutane and Manpada about 60 m, and Amandoot 963 m (see below).

### Before 2026-09-29: the 2019 DPR

`src/data/alignment-dpr-2019.geojson` (kept for history) and the earlier station coordinates came from DPR Table 4.3 (213 alignment points, chainage -403.688 m to 20,645.678 m).

- Method: parse the table, convert easting and northing to latitude and longitude, and interpolate each station at its DPR chainage.
- Assumption: WGS84, UTM zone 43N. The DPR does not state the datum. If it is Everest 1830, positions can be off by a few hundred metres.
- Check: consecutive points agree with their chainage spacing, and the start point falls at APMC Kalyan. Still, treat all positions as approximate.
- Check (Phase 3, 2026-09-28): drawn over OpenStreetMap roads, the DPR line runs along Kalyan-Shilphata Road and leaves it near Manpada, and the Dombivli MIDC point falls on the road in Esri imagery that shows the new viaduct. The UTM 43N / WGS84 assumption holds at map scale. Positions stay marked approximate.
- Limit: this is the 2019 alignment. It does not include Kalyan station (added later) or any later realignment.
- Kalyan station: 19°14'19.2"N 73°07'38.5"E (19.238667, 73.127361), supplied by the site owner on 2026-09-28. No published source gives this position; it is graded reported.
- Amandoot check (2026-09-29): the DPR alignment's last point (point 213, ch. 20,645.678 m, E 299156.552, N 2110184.877) converts to 19.074685, 73.091173, about 45 m from the Navi Mumbai Metro Line 1 station OpenStreetMap calls Panchanand, and the route line ends there exactly. The DPR station position (ch. 20,492.296 m) sits 153 m before it, as expected. But Line 12 is being built elsewhere: the site owner's photos of 26 Aug 2026 show station piers SP01 to SP05 beside the Line 1 station that Google Maps and [a post on X](https://x.com/Maha7Arindam/status/2092489255948025861) call Amandoot (OpenStreetMap: Sector 34), 959 m west. The owner's reading (19.07378, 73.081859) was 36 m from the point MMRDA's 2025 alignment gives for Amandoot, which the site now uses. The 2025 line ends about 350 m further west, past the station.

## Map and imagery sources

| Source | Used for | Licence / terms |
|---|---|---|
| [OpenFreeMap](https://openfreemap.org) vector tiles, [OpenMapTiles](https://openmaptiles.org) schema | Base map | Free, no key. Attribution shown on the map. |
| [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors | Map data | ODbL, attribution shown |
| [Esri World Imagery Wayback](https://livingatlas.arcgis.com/wayback/) | Before and after imagery (Maxar 10 May 2022, Vantor 12 Oct 2025) | Esri terms of use, attribution shown. Capture dates from Esri's imagery metadata service. |
| [Mapillary](https://www.mapillary.com) (optional) | Street-level photos with capture dates | CC BY-SA 4.0, needs `PUBLIC_MAPILLARY_TOKEN` |

## Items that need your review

1. **Target completion date (countdown).** Sources conflict: 31 Dec 2027 (MMRDA statement, Dec 2024) and May 2028 (reported Dec 2025). MMRDA's page gives no date. I set the countdown to 31 May 2028, labelled "reported target". Do you accept that, or do you want the countdown hidden until MMRDA publishes a date?
2. **Funding.** Resolved 2026-09-29: MMRDA's loan invitation (primary source 4) seeks Rs 7,800 Cr for Line 12. No lender named yet, and still no primary source ties the AIIB or OPEC Fund loans to Line 12.
3. **Approval dates.** Resolved 2026-09-29 by primary source 4: MMRDA approval 21 Nov 2018 (146th Authority Meeting) and State approval by GR dated 6 Sep 2019. Wikipedia's 23 Jul 2019 may be the Cabinet decision.
4. **Cost figures.** Two MMRDA figures now conflict: Rs 11,516 Cr plus IDC (loan invitation, March 2026, shown first) and Rs 5,865 Cr (project page, the 2019 DPR figure). Trade press also quotes Rs 4,132 Cr and Rs 5,494 Cr without sources; those are not used.
5. **Length.** MMRDA says 23.57 km. Older figures (20.756 km in the DPR, 22.17 km in CA-240) are kept as history.
6. **Station coordinates.** Resolved 2026-09-29: MMRDA's approved alignment (primary source 3) gives every station point.
7. **Systems tender number.** "CA-315" and the EMD come from a search snippet of a paywalled page. Marked unverified.
8. **General Consultant value.** Rs 265.10 crore covers Lines 10 and 12 together. There is no source for the Line 12 share.
9. **Line 12A.** Separate 18.4 km project approved in Feb 2026. It is listed under `related_projects` and kept out of Line 12 totals. Should the site cover it?
10. **Nearby landmarks.** Station context comes only from DPR text (roads, chowks, villages) and engineering reports. I did not add landmarks from maps, to avoid invented facts. Phase 3 can add them from OpenStreetMap with attribution.
11. **Social posts.** `social.json` has no posts yet. There is one candidate for you to review.

## Leads to verify (supplied by the owner, 2026-09-28, no source URL yet)

Origin: posts on X by @hadilal and @bodkeitis, which say they come from official tender details. That makes them useful leads but not primary sources: grade them `reported` at best once the specific posts are linked, and `verified` only when the tender document itself is found (mahatenders.gov.in or MMRDA).

Nothing below is on the site yet.

1. **Package "CA-316" line diagram.** It shows revised centre-line chainages: Kalyan -739.050 m, APMC Kalyan -100.650 m, Ganesh Nagar 788.251 m, Pisavali Gaon 2,265.152 m, Golavli 3,353.052 m, Dombivli MIDC 4,520.952 m, Sagaon 5,528.852 m, Sonarpada 6,539.752 m, Manpada 7,592.652 m. After Manpada it shows a new **Katai Naka** station (ch. 9,695.783 m) "to Amandoot" and a branch via **Kolegaon** to **Nilje depot**. The chainages differ from the 2019 DPR by 40 m to 90 m. If confirmed, they replace the DPR chainages in `stations.json`. Check (2026-09-29): MMRDA's approved alignment of 20 Mar 2025 (primary source 3) has the same 19 stations as CA-240 and no Katai Naka station on Line 12, so the Katai Naka leads most likely belong to Line 12A. Its station spacing (Kalyan to Manpada) agrees with this diagram within 25 m.
2. **Line 12A overlap.** The diagram fits the Line 12A corridor (Manpada, Katai Naka, Kalyan Phata, Dahisar Mori, joining Line 12 near Khutari). No source yet says whether 12A replaces the original Line 12 stations from Hedutane to Pisarve. Checked: [ThePrint/PTI, 20 Feb 2026](https://theprint.in/india/metro-rail-line-12-to-be-extended-along-kalyan-shilphata-road-at-cost-of-rs-8-4k-cr-sena-mp/2859716/) (does not say).
3. **Summary line "22.17 km, 12 stations, Rs 8,416 crore+".** Conflicts with MMRDA (23.57 km, 19 stations, Rs 5,865 crore). 22.17 km is the CA-240 scope; 12 stations and about Rs 8,415 crore match Line 12A; Rs 8,416 crore is Line 5's cost. Not used.
4. **Nilje depot layout drawing.** Shows stabling and inspection sheds, internal roads, a 2.22 ha TOD green area and 2.30 ha staff quarters land. Not used until sourced.
5. **Station elevation, section and render (Dombivli).** Useful as a description for the stylized 3D station in Phase 4 (cantilevered roof over the platform, patterned side cladding). The drawings themselves are not reproduced.
6. **Train render with "LINE 5" livery.** This is a Line 5 train, not Line 12. The Line 12 trains are not ordered yet. Not used.
7. **Station finishing tenders (posts on X, 8 Sep 2026).** @bodkeitis and @Maha7Arindam report two MMRDA tenders for architectural finishing, roofing, facade and plumbing at 11 stations from Kalyan to **Katai Naka** (Kalyan, APMC Kalyan, Ganesh Nagar, Pisavali Gaon, Golavali; Dombivli MIDC, Sagaon, Sonarpada, Manpada, Kolegaon, Katai Naka). This supports lead 1. The posts are shown in Updates as reported; the station list changes only when the tender document is found.

## Not found

- Per-station construction progress (MMRDA publishes corridor-wide figures only).
- Trial run or opening dates.
- Rolling stock supplier (tender open since June 2026).
- Official station architecture descriptions for the 3D models.

---

# Line 5 (Thane-Bhiwandi-Kalyan)

Research started 2026-10-09. Data in `src/data/lines/line-5/`. Figures follow MMRDA's press release of 28 May 2026 (primary source 4); phase names follow the post on X by @bodkeitis (31 Aug 2026). Both by the owner's decision of 2026-10-09. Not shown on the site yet (see MULTI-LINE-PLAN.md, step 7). The status values above apply.

## Primary sources

1. **MMRDA, Metro Line 5 project page.** Length 24.9 km, 15 stations (Balkum Naka to Kalyan APMC), cost Rs 8,416.51 Cr, 2031 ridership 3.025 lakh, car size and capacity, interchanges with Lines 4 and 12 and the Central Railway, and a progress table (as of 31 Aug 2026, every activity 100%). Page last updated 7 Oct 2026, but it still shows the 2017 plan.
   https://mmrda.maharashtra.gov.in/en/projects/transport/metro-line-5/overview
   The Marathi page gives the Marathi station names. Its progress table is headed "Metro Line 7A" and is not used.
   https://mmrda.maharashtra.gov.in/mr/projects/transport/metro-line-5/overview
2. **MMRDA, Line 5 alignment file (KML), uploaded March 2025.** Published on the Metro Influence Zone for NOC page. Unlike Line 12's file, it has no centre line: it has the corridor as one polygon about 50 m wide, and 17 station points from Kapurbawdi to APMC Kalyan.
   https://mmrda.maharashtra.gov.in/en/division/metro-piu/metro-influence-zone-noc (file: https://mmrda.maharashtra.gov.in/sites/default/files/2025-03/metro_line-5.kml)
3. **MMRDA, Phase 1 draft final Environmental Impact Assessment for AIIB, 11 Sep 2023.** Phase 1 is 11.88 km and 6 elevated stations from Kapurbawdi to Dhamankar Naka; Kapurbawdi station is built as part of Line 4. Station chainages, Kasheli depot (27.134 ha), design speeds, station length 145 m, platforms about 13.5 m above the road, and the cost breakdown from the March 2016 DPR.
   https://mmrda.maharashtra.gov.in/sites/default/files/2023-12/mmrda-aiib-mml5-final-draft-eia-11-sep-2023.pdf

4. **MMRDA press release PRC/PR/31/2026, "Extended Metro Line 5 to Strengthen Connectivity Across Thane, Bhiwandi, Kalyan and Ulhasnagar", 28 May 2026.** Corridor 34.21 km and Rs 18,130 Cr. Phase 1, Thane to Dhamankar Naka: 11.9 km, 6 stations, Rs 6,741 Cr. Phase 2, Dhamankar Naka to Durgadi: 10.48 km, 6 stations (Bhiwandi underground; Temghar, Rajnoli, Gove Gaon, Kon Gaon, Kongaon West elevated), Rs 7,326 Cr. Phase 5A, Durgadi - Khadakpada - Bhoirwadi - Kalyan with a spur to Ulhasnagar from Bhoirwadi: 11.83 km, 7 elevated stations, Rs 4,063 Cr. Interchanges with Line 4 at Balkhum (Kapurbawadi) and Line 12 at Kalyan Junction; Phase 1 preparing for the CMRS inspection. No map: its images are construction photos.
   https://mmrda.maharashtra.gov.in/sites/default/files/2026-05/extended_metro_line_5_to_strengthen_connectivity_across_thane_bhiwandi_kalyan_and_ulhasnagar.pdf

5. **Press Information Bureau, "Cabinet approves Thane integral Ring Metro Rail Project", 16 Aug 2024 (Release ID 2046082).** 29 km (26 elevated, 3 underground), 22 stations, Rs 12,200.10 Cr, Maha-Metro to build, due by 2029. Names no interchange stations.
   https://www.pib.gov.in/PressReleasePage.aspx?PRID=2046082

6. **Thane Integral Ring Metro Rail Project, official website, route map (read 9 Oct 2026).** Lists the 22 stations and embeds the project's Google My Maps map ("Thane Metro Route Map"), which also draws Line 5 ("METRO LINE -5(MMRDA)") with its stations. The ring line's Balkum Naka is at 19.2224, 72.9977; the map's Line 5 Balkum Naka is 18 m from MMRDA's point, and the two are 976 m apart. It does not call them an interchange. Site footer: "Thane Integral Ring Metro Rail Project", with RTI and disclaimer pages; Wikipedia lists it as the project's website (Maha-Metro). Found by the owner, 2026-10-09.
   https://thanemetrorail.com/route-map (map: https://www.google.com/maps/d/u/0/embed?mid=1YNvo8fqUuYUWJqEiwstEdGWJTZMJbEQ)

## Secondary sources

| Outlet | Date | Used for | URL |
|---|---|---|---|
| The Metro Rail Guy | 28 Jan 2020 | CA-28 civil contract to Afcons, 7 Jan 2020, 12.811 km | https://themetrorailguy.com/2020/01/28/afcons-awarded-mumbai-metro-line-5s-thane-bhiwandi-section/ |
| The Metro Rail Guy | 8 May 2020 | AIIB loan concept, USD 236 million, 21 Apr 2020 | https://themetrorailguy.com/2020/05/08/aiib-to-lend-236-million-for-mumbai-metro-line-5-thane-kalyan/ |
| The Metro Rail Guy | 12 Mar 2023, updated 14 Sep 2023 | CA-151 Kasheli depot to Rithwik, Rs 589.56 Cr | https://themetrorailguy.com/2023/03/12/rithwik-wins-mumbai-metro-line-5-kasheli-depots-civil-contract/ |
| The Metro Rail Guy | 30 Jun 2025 | CA-241: Titagarh lowest bidder (not yet awarded); MMRDA estimate Rs 2,640.72 Cr (Feb 2024); 22 six-car trains; 15 years of maintenance after a 2-year defect period | https://themetrorailguy.com/2025/06/30/titagarh-wins-mumbai-metro-line-5s-132-coach-signaling-contract-ca-241/ |
| Free Press Journal | 1 Nov 2025 | CA-241 award: Titagarh's letter of acceptance, Rs 2,481 Cr, 132 coaches, built at Uttarpara near Kolkata; 5 years of comprehensive maintenance | https://www.freepressjournal.in/business/titagarh-rail-systems-secures-2481-crore-contract-from-mmrda-to-manufacture-132-coaches-associated-systems-for-mumbai-metro-line-5 |
| Bajaj Broking | 3 Nov 2025 | CA-241: Titagarh's exchange filing of 31 Oct 2025, Phases 1 and 2 | https://www.bajajbroking.in/share-market-news/titagarh-rail-systems-wins-rs-2481-crore-mumbai-metro-order |
| Motilal Oswal | 1 Nov 2025 | CA-241: commissioning within 217 weeks, built in Kolkata | https://www.motilaloswal.com/news/stocks/108209 |
| Titagarh Rail Systems (the maker) | read 9 Oct 2026 | Its own project page: 132 coaches for Line 5, about Rs 2,481 Cr; execution from 62 weeks after signing, complete within the next 154 weeks. Its picture is all rights reserved and not shown as the Line 5 train, so the site links to it only | https://www.titagarh.in/project/mumbai-metro |
| machinist.in | 28 Jan 2026 | ABB India's traction and train control order from Titagarh: 22 six-car trains for Line 5, 25 kV AC, GoA2 upgradable to GoA4 | https://machinist.in/2026/01/abb-india-wins-traction-and-control-systems-order-for-metro-trainsets-from-titagarh-rail-systems/ |
| Construction World | 13 Mar 2026 | Route shape past Durgadi: from Kon Gaon through Durgadi, Khadakpada and Bhoirwadi, then two arms, to Kalyan (Line 12 interchange) and to Ulhasnagar; DPR ready, not published | https://www.constructionworld.in/transport-infrastructure/metro-rail-and-railways-infrastructure/mmrda-advances-metro-line-five-a-from-kalyan-to-ulhasnagar/88025 |
| The Metro Rail Guy | 17 Aug 2024 | Thane Integral Ring Metro approved; passenger interchanges with Lines 4 and 5 and Thane station (no station named) | https://themetrorailguy.com/2024/08/17/thane-metros-ring-line-approved-by-central-government/ |
| housing.com | 4 Nov 2025 | Thane Integral Ring Metro station list (cited to Maha-Metro's site): interchange with Line 5 at Balkum Naka, with Line 4 at Raila Devi and Dongripada | https://housing.com/news/thane-internal-ring-metro-project/ |
| India Infra Hub | 4 Aug 2023 | MMRDA: all 1,098 precast station elements of Phase 1 erected (spines, wings, U-girders, pier arms, L-structures); roof, facades and finishes next | https://indiainfrahub.com/featured/mumbai-metro-line-5-73-per-cent-station-work-completed-in-first-phase-of-thane-bhiwandi-kalyan-corridor/ |
| Free Press Journal | 9 Feb 2026 | Phase 1 civil work 95%, December 2026 target | https://www.freepressjournal.in/mumbai/mmrda-nears-completion-of-metro-line-5-phase-1-thanebhiwandi-services-set-for-december-2026-launch |
| Indian Infrastructure | 23 Apr 2026 | State approval of revised Lines 5 and 5A, 22 Apr 2026 | https://indianinfrastructure.com/2026/04/23/maharashtra-government-approves-mumbai-metro-line-5-5a/ |
| Metro Rail News | 27 Apr 2026 | Revised plan, underground sections, APMC Kalyan dropped | https://metrorailnews.in/mumbai-metro-line-5-gets-state-approval/ |
| Metro Rail News | 2 Sep 2026 | Union approval, 2030-31 target for the rest | https://metrorailnews.in/center-approved-mumbai-metro-line-5-and-5a/ |
| Indian Infrastructure | 3 Sep 2026 | Union approval, 29 Aug 2026; Line 5A Rs 4,063 Cr | https://indianinfrastructure.com/2026/09/03/union-government-approves-mumbai-metro-line-5-5a-project/ |
| Free Press Journal | 7 Sep 2026 | Overhead wires energised, 12.6 km; work beyond Bhiwandi not begun | https://www.freepressjournal.in/mumbai/mumbai-metro-line-5-trial-run-preparations-gain-momentum-as-mmrda-begins-25000-volt-overhead-wire-energisation |
| Construction World | 8 Sep 2026 | Station lists of the revised Lines 5 and 5A | https://www.constructionworld.in/transport-infrastructure/metro-rail-and-railways-infrastructure/centre-approves-mumbai-metro-line-five-and-five-a/97055 |
| Swarup Bodke (@bodkeitis) on X | 31 Aug 2026 | Union approval split into Phase 2 (Dhamankar Naka to Durgadi, 10.48 km), Phase 3 (Durgadi to Kalyan, 11.82 km) and Line 5A (Bhoirwadi to Ulhasnagar spur, 5.27 km); tenders to follow. Lead, graded reported. Its two map images are a Google Earth view of MMRDA's 2025 file and an unlabelled sketch, not used. | https://x.com/bodkeitis/status/2094307767142244544 |
| Arindam Mahapatra (@Maha7Arindam) on X | 5 Mar 2026, reply 31 Aug 2026 | Key plan from MMRDA's tender documents for the general consultant of "Metro Line 5A Durgadi to Kalyan with spur to Ulhasnagar", which he calls the tentative route: Phase 3 (6,557.185 m, stations Durgadi 550 m, Khadakpada 2,060 m, Bhoirwadi 3,330 m, Shivaji Path 5,290 m, Kalyan at the end) and the spur (5,272.630 m, Shanti Nagar 2,050 m, Shivaji Chowk 3,430 m, Ulhasnagar 4,680 m). His reply: the tender was cancelled by a notice dated 19 Aug 2026. Graded reported. The image is not kept in the repo. | https://x.com/Maha7Arindam/status/2029366179580772677 |
| Wikipedia, Orange Line | read 9 Oct 2026 | Line colour only (unverified) | https://en.wikipedia.org/wiki/Orange_Line_(Mumbai_Metro) |

## Derived data

`scripts/build-alignment-line5.py` derives the centre line from the corridor polygon in primary source 2: it takes the polygon's two tips (at Kapurbawdi, and 119 m past APMC Kalyan), and draws the line midway between the two long sides. The result is 24.14 km. Every one of the 17 station points lies within 11 m of it, and they fall in order, so the line is graded verified like the points. Each station's `along_m` is measured along it from Kapurbawdi.

The station chainages in primary source 3 are kept under `eia_chainage_m` as published and not used for drawing. They once seemed not to match the map (Kalher to Purna: 0.83 km in the report, about 2 km apart). On 2026-10-12 satellite imagery showed that the report was right and MMRDA's alignment file was wrong for Kalher and Purna (see below): with those two moved to the built stations, every Phase 1 chainage sits 420 to 460 m short of along_m, a constant offset from a different zero.

Since 2026-10-09 the GeoJSON has three parts. "Line 5 centre line" runs from Kapurbawdi to Durgadi Fort (21.9 km): Phase 1 (built) and Phase 2, which MMRDA's revised plan keeps on the same stations except Gopal Nagar (dropped) and Kongaon West (new, no published position). "Line 5 underground stretch" marks Dhamankar Naka to Temghar, drawn on the 2025 route above ground because the tunnel's route is not published. "Line 5 route past Durgadi, 2017 plan" keeps the dropped route to APMC Kalyan for history.

Check (2026-10-09): between Dhamankar Naka and Durgadi Fort, 10,150 of 10,251 m of the derived line lies within 20 m of a main road in OpenStreetMap: Agra Road (NH848) through Bhiwandi, the Bhiwandi bypass flyover (about 13.4 to 16.0 km from Kapurbawdi), Kalyan-Bhiwandi Road (NH61), and the Chhatrapati Shivaji Maharaj Bridge over the Ulhas into Durgadi. So Phase 2 runs on the road medians, as Phase 1 does. The flyover stretch is the clash that the underground section avoids (Metro Rail News, Sep 2026). The station-to-station distance from Dhamankar Naka to Durgadi Fort on this line is 10.23 km; MMRDA gives 10.48 km for Phase 2.

Kapurbawdi (2026-10-09): MMRDA's file puts its "Kapurbawdi" point on the curve east of Ghodbunder Road, where satellite imagery shows no station (the owner on Google Maps, and Esri imagery). The station is on the Line 4 viaduct over Ghodbunder Road, about 760 m north-west, where OpenStreetMap has Kapurbawdi Station (node 8342841400) and Line 5's two tracks running beside Line 4 (ways 1484919196 and 1484919198). MMRDA's corridor stops at the curve. So the line now starts on OpenStreetMap's tracks north of the station, joins MMRDA's line at the curve, and Kapurbawdi takes OpenStreetMap's point (graded reported; ODbL; `scripts/data/line5-kapurbawdi-osm.json`), with MMRDA's point kept under `location.earlier`. Check: Kapurbawdi to Balkum Naka is now 1.86 km along the line, against 1.767 km in MMRDA's Phase 1 environmental report (before the fix: 0.9 km).

Dhamankar Naka (2026-10-12): the owner reported the before-and-after view as wrong. MMRDA's file puts its "Dhamankar Naka (M) Station" point on Agra Road about 250 m north-east of the end of the built Phase 1 viaduct, where Esri imagery of 12 Oct 2025 shows only the road. The built station, a deck of about 145 m with platforms on both sides and stair blocks, is the last stretch of the viaduct; the station now takes its centre on that imagery (19.285912, 73.052414; reported), 256 m from MMRDA's point, which stays under location.earlier. Set in scripts/build-alignment-line5.py, so a rerun keeps it. The owner then reported that Kalher and Purna show no station either. A closer look, walking the viaduct on the same imagery, found both: MMRDA's Kalher point is about 430 m south-west of the built station and its Purna point about 740 m north-east, each beside a single-width viaduct. Both now take the centre of the built station (reported), and they fit the environmental report's chainages. Balkum Naka, Kasheli and Anjurphata sit on their station decks. All three fixes are in scripts/build-alignment-line5.py.

Since 2026-10-09 the route past the Ulhas river bridge, Phase 3 to Kalyan and the Line 5A spur, is traced from Arindam Mahapatra's key plan (see the table). Method (also in `scripts/data/line5-extension-keyplan.json`): the red and green lines and yellow station markers were separated by colour; the image was placed on the map by a similarity transform from two control points, the centre of Kala Talao and the east end of the Chhatrapati Shivaji Maharaj Bridge, then refined within 70 m, 1 degree and 3% scale so the route sits closest to OpenStreetMap's main roads. Checks: the two control points end 37 m and 26 m off; the scale, 6.37 m per pixel, agrees with the chainages (about 6.25 m per pixel between stations) and with the lake's area (5.9); 79% of Phase 3 and 78% of the spur lie within 20 m of a main road; Kalyan station falls 131 m from Line 12's Kalyan station. The traced lines measure 6.73 km and 4.88 km against the key plan's 6.56 km and 5.27 km; distances along the line use the chainages. Positions are good to about 50 m and graded reported. The key plan's Kongaon station falls 480 m from the Kon Gaon point in MMRDA's 2025 file; it is not used.

Line 5's Kalyan point (2025 file) is 14 m from Line 12's, and its APMC Kalyan point 30 m from Line 12's. In the 2025 files the two lines share both stations.

## Items that need your review

1. **Which plan to show.** Decided 2026-10-09 by the owner. Figures: MMRDA's press release of 28 May 2026 (34.21 km, 19 stations, Rs 18,130 Cr, the spur included). Names: Phase 1 Kapurbawdi to Dhamankar Naka, Phase 2 Dhamankar Naka to Durgadi, Phase 3 Durgadi to Kalyan, Line 5A the Bhoirwadi to Ulhasnagar spur. MMRDA calls Phase 3 and the spur together 'Phase 5A'. Phase 3 and the spur follow the tentative key plan of March 2026 (see Derived data); its tender was cancelled on 19 Aug 2026, so watch for a newer plan.
2. **Phase 1 opening date.** Decided 2026-10-09: show a countdown to 31 Dec 2026, labelled as a target. MMRDA's press release (28 May 2026) quotes the Chief Minister: open by the end of 2026; no exact date.
3. **Line 5A.** Decided 2026-10-09: the Bhoirwadi to Ulhasnagar spur is shown on the Line 5 page, not on its own page. It is inside MMRDA's Line 5 totals.
4. **Kongaon West.** New in the revised plan, with no published position. It is listed after Kon Gaon in MMRDA's order, without a map point.
5. **Kapurbawdi.** Decided 2026-10-09: Line 5's station 1 and its interchange with Line 4. It is built under Line 4, so MMRDA does not count it in Line 5's 19 stations.

## Leads to verify

1. **Approval dates 2016 to 2018.** Wikipedia gives MMRDA approval on 19 Oct 2016, State Cabinet approval on 24 Oct 2017 and the foundation stone on 18 Dec 2018, citing The Hindu, Livemint and the Indian Express. Those articles were not read yet.
2. **More packages.** Wikipedia lists CA-166 (track, Paras Railtech), CA-239 (power and E&M, IRCON), CA-242 (fare collection) and CA-246 (finishing, NACPL-MANSI-UCC JV) without sources.
3. **AIIB and OPEC Fund final loan amounts.** The OPEC Fund lists approval on 29 Apr 2024 and signing on 13 Oct 2025; GTAI lists an AIIB loan of USD 186.5 million. Neither page was read.
4. **The revised plan's Government Resolution (April 2026) and the Union notification of 28 August 2026.** Either may describe the route.
5. **Phase 3 and spur route.** Traced from the key plan posted by @Maha7Arindam (tender ID 2026_MMRDA_1283742_1, ref MMRDA/MMRP/L-5A/GC/CA293, cancelled 19 Aug 2026). A re-tender, or a new file on MMRDA's Metro Influence Zone page, would replace it.
6. **Train render with "LINE 5" livery** (owner's lead of 2026-09-28, see Line 12 lead 6). Now relevant for Line 5. Not used until sourced.

## Not found

- Marathi names for Kapurbawdi, Durgadi Fort and Sahajanand Chowk.
- A trial-run start date or CMRS inspection date.
- A published route for the underground stretch at Bhiwandi. Not in OpenStreetMap, Wikipedia (a schematic only) or the news (checked 2026-10-09).
- A position for Kongaon West.

# Line 4 and Line 4A (Wadala-Thane-Kasarvadavali-Gaimukh)

Research started 2026-10-19. Data in `src/data/lines/line-4/`. Figures follow MMRDA's Line 4 page (primary source 1). Line 4A is kept in the same files, as Line 5A is in Line 5's. Shown at /line-4/ since 2026-10-19 (see MULTI-LINE-PLAN.md, step 8). The status values above apply.

## Primary sources

1. **MMRDA, Metro Line 4 project page.** Wadala to Kasarvadavali, 32.32 km, fully elevated, 30 stations (listed), Green Line, base cost Rs 14,549 Cr including taxes, 2031 ridership 12.13 lakh (PHPDT 33,417), travel time cut by 50% to 75%, connections (Eastern Express Highway, Central Railway, Monorail, Lines 2B, 5 and 6), and a progress table as of 31 Aug 2026 (piers 95%, U-girders 94%, deck slab 92%, other items 93% to 98%). Page last updated 19 Oct 2026. No depot, trains, phases or dates. MMRDA has no Line 4A page (the URL returns 404).
   https://mmrda.maharashtra.gov.in/en/projects/transport/metro-line-4/overview
   The Marathi page gives the Marathi station names, in the same order; Mulund Fire Station is फायर स्टेशन there.
   https://mmrda.maharashtra.gov.in/mr/projects/transport/metro-line-4/overview
2. **MMRDA, Line 4 alignment file (KML), uploaded March 2025.** On the Metro Influence Zone for NOC page. One corridor polygon from Bhakti Park to Gaimukh, Line 4A included, and 34 station points: the 30 on MMRDA's list, Suman Nagar and Amar Mahal Junction (dropped), and Line 4A's "Gownipada" and Gaimukh.
   https://mmrda.maharashtra.gov.in/en/division/metro-piu/metro-influence-zone-noc (file: https://mmrda.maharashtra.gov.in/sites/default/files/2025-03/line_4.kml)
3. **Detailed project report (updated), Wadala-Ghatkopar-Mulund-Thane-Kasarvadavali, DMRC for MMRDA, May 2016.** 32.322 km, 32 elevated stations with chainages from Bhakti Park, 1435 mm gauge, 25 kV AC, design speed 90 km/h, operating 80 km/h, twin U-girders, side platforms, depot near Kasarvadavali with stabling near Ghatkopar (30 ha), Rs 11,115 Cr at March 2016 prices, Rs 14,502 Cr by completion.
   https://mmrda.maharashtra.gov.in/sites/default/files/2021-10/Metro%20Line%204.pdf
4. **Detailed project report, extension of Line 4 from Kasarvadavali to Gaimukh, DMRC for MMRDA, October 2017.** 2.668 km, 2 elevated stations (Gowniwada ch. 32,807 m, Gaimukh ch. 34,090 m), depot near Gaimukh (23.1 ha), Rs 786 Cr at June 2017 prices, Rs 940 Cr by completion; 13,43,979 daily trips in 2031 for Wadala to Gaimukh.
   https://mmrda.maharashtra.gov.in/sites/default/files/2021-10/Metro%20Line%204A.pdf
5. **MMRDA release, "KfW approves loan of EUR 545 Million for Metro Line 4 and 4 A", 6 Nov 2021.** A development loan of EUR 345 million (EUR 255 million for trains and integrated ticketing, EUR 90 million for multimodal integration) and a promotional loan of EUR 200 million.
   https://www.mmrda.maharashtra.gov.in/sites/default/files/2021-12/news%20(20).pdf
6. **MMRDA, "Reminiscence of MMRDA's Monumental Achievements in 2023" (Feb 2024).** Lines 4 and 4A are 35.2 km together, civil works 65% at the end of 2023; in October 2023 the State approved the transfer of 174.01 ha at Mogharpada for Lines 4, 4A, 10 and 11, of which 41.5 ha is for the depot.
   https://mmrda.maharashtra.gov.in/sites/default/files/2024-02/reminiscence_of_mmrda_s_monumental_achievements_in_2023.pdf
7. **MMRDA, environmental report for the Mogharpada depot approach, spur line and Kavesar casting yard (May 2019).** Car shed 27.50 ha at Mogharpada; casting yard 7.72 ha at Kavesar.
   https://mmrda.maharashtra.gov.in/sites/default/files/2023-05/4.pdf
8. **MMRDA, minutes of the public consultation on Line 4A, 5 Feb 2020.** Not used for a fact yet.
   https://mmrda.maharashtra.gov.in/sites/default/files/2023-05/4a.pdf

## Secondary sources

| Outlet | Date | Used for | URL |
|---|---|---|---|
| The Metro Rail Guy | 7 Jun 2016 | MMRDA approved the project report on 3 Jun 2016 (not State approval) | https://themetrorailguy.com/2016/06/07/mmrda-approves-mumbais-32-32-km-wadala-kasaradavali-line/ |
| Free Press Journal (PressReader) | 28 Sep 2016 | State Cabinet approval of Metro 4 and 2B, 27 Sep 2016 | https://www.pressreader.com/india/the-free-press-journal/20160928/281655369560710 |
| The Metro Rail Guy | 13 Feb 2018 | CA-08 to CA-12: stretches, stations, lowest bids and estimates; awarded 3 Mar 2018 | https://themetrorailguy.com/2018/02/13/tata-reliance-lowest-bidders-for-mumbai-metros-line-4/ |
| Indian Infrastructure | 13 May 2018 | Reliance-Astaldi's three packages, Rs 1,584 Cr; opening then expected 2022 | https://indianinfrastructure.com/2018/05/13/rinfra-astaldi-to-construct-mumbai-metro-line-4/ |
| The Metro Rail Guy | Green Line page, updated 14 Sep 2025 | Line 4A civil contract CA-54 (J Kumar, Rs 342 Cr, Sep 2019), Line 4A approval (Dec 2018), the package list, Lines 10 and 11 | https://themetrorailguy.com/mumbai-metro-green-line-information-route-map-fares-timings-tenders-status-updates/ |
| Construction World | 18 Dec 2023 | Suman Nagar and Amar Mahal Junction dropped; 30 stations; Siddharth Colony to connect with Line 2B | https://www.constructionworld.in/transport-infrastructure/metro-rail-and-railways-infrastructure/suman-nagar-amar-mahal-metro-stations-dropped-for-space-cost-reasons/48209 |
| The Metro Rail Guy | 15 Feb 2025 | CA-234: L&T with Alstom lowest, 14 Feb 2025; 39 six-car trains; estimate Rs 4,297.49 Cr | https://themetrorailguy.com/2025/02/15/lt-alstom-win-mumbai-metro-line-4s-rolling-stock-signaling-contract-ca-234/ |
| Metro Rail News | 17 Jun 2025 | Mogharpada depot layout | https://metrorailnews.in/174-hectares-of-land-acquired-for-mogarpada-depot/ |
| Free Press Journal | 22 Sep 2025 | First trial run, Gaimukh to Vijay Garden (4.4 km); three opening stretches and targets; Rs 949 Cr for Line 4A; trains start with six cars, platforms for eight | https://www.freepressjournal.in/mumbai/thane-enters-metro-era-trial-run-of-line-4-and-4a-marks-historic-milestone-in-mumbais-transit-future |
| Construction World (from Mid-day) | 26 Sep 2025 | Targets December 2025 and April 2026 (passed); trial trains borrowed from the Yellow Line | https://www.constructionworld.in/transport-infrastructure/metro-rail-and-railways-infrastructure/phase-1-of-thane--wadala-metro-line-4-to-open-by-december-2025/79274 |
| L&T | 24 Dec 2025 | CA-298 power and traction, Bhakti Park to Cadbury Junction | https://www.lntecc.com/news-room/press-releases/l-t-wins-significant-order-for-its-transportation-infrastructure-business-dec-2025/ |
| News On AIR | 15 Feb 2026 | Mulund parapet collapse, 14 Feb 2026: one dead, three hurt; penalties; suspension | https://www.newsonair.gov.in/metro-parapet-section-collapse-in-mulund-cm-eknath-shinde-orders-suspension-of-executive-engineer |
| Free Press Journal | 26 Mar 2026 | MMRDA's inquiry findings on the Mulund collapse; consultants ended 18 Feb 2026; work cut back to safety work | https://www.freepressjournal.in/mumbai/mumbai-news-mmrda-blames-contractor-negligence-for-fatal-metro-line-4-slab-collapse-incident |
| Free Press Journal | 22 Aug 2026 | CMRS inspected the Gaimukh pit line; 8 stations named for the first stretch; target around Diwali or end of 2026 | https://www.freepressjournal.in/mumbai/mumbai-infra-update-metro-4-pit-line-clears-cmrs-inspection-mmrda-awaits-safety-report-ahead-of-diwali-launch |
| Swarajya | 30 Aug 2026 | Gaimukh pit line layout; six rakes for the first stretch | https://swarajyamag.com/news-brief/thanes-metro-4-gaimukh-cadbury-metro-stretch-inches-towards-launch-with-rolling-stock-safety-clearance |
| Free Press Journal | 10 Sep 2026 | Trial runs resumed; RDSO certification 2 Jun 2026; no opening date | https://www.freepressjournal.in/mumbai/thane-metro-4-4a-trial-runs-resume-as-gaimukh-cadbury-stretch-moves-closer-to-launch |
| Metro Rail News | 14 Oct 2026 | First Alstom train unveiled at Sri City | https://metrorailnews.in/alstom-rolls-out-first-driverless-metropolis-trainset-for-mumbai-metro-lines-4-and-4a/ |
| Railway Gazette | 19 Oct 2026 | Same; L&T holds the integrated systems contract and the power and track packages | https://www.railwaygazette.com/india/2026/10/19/mumbai-metro-line-4-4a-train-rolled-out-in-record-time/ |
| PSU Watch (PTI interview) | 14 Oct 2026 | Champak Panda, Alstom India: first train ships by end of November, reaches Mumbai in the first or second week of December; RDSO and CMRS tests; signalling done; MMRDA to open with Line 2 and Line 7 trains; Alstom's passenger-service milestone August 2027 | https://psuwatch.com/newsupdates/alstom-to-deliver-first-metro-line-4-train-in-mumbai-by-december-official |
| Rajendra B. Aklekar (blog) | 16 Oct 2026 | GoA4 driverless, Urbalis Forward CBTC; trains kept at Mandale (20) and Kasheli (19), control centre at Mandale, backup at Mogharpada, "no dedicated depot yet" (conflicts with Mogharpada; graded conflicting). Its nine photos carry no credit or licence and are not used. Supplied by the owner, 2026-10-19 | https://rajendrabaklekar.in/2026/10/16/here-are-the-metro-trains-for-mumbais-lbs-road/ |
| Alstom India on X | Oct 2026 | Supplied by the owner, 2026-10-19; could not be read (X needs sign-in) | https://x.com/AlstomIndia/status/2110453455399825467 |

## Derived data

`scripts/build-alignment-line4.py` derives the centre line from the corridor polygon in primary source 2, as for Line 5: the two tips (south of Bhakti Park and past Gaimukh), then the line midway between the two long sides. It then starts the line at Bhakti Park station, cutting the 492 m of polygon south of it (the end of line), so along_m counts from the first station. The result is 34.89 km. All 34 station points lie within 19 m of it and fall in MMRDA's order, so the line is graded verified. It is split 450 m past Kasarvadavali, where the project reports end Line 4 and start Line 4A: Line 4 31.94 km from Bhakti Park (MMRDA: 32.32 km, which may count the end of line), Line 4A 2.95 km (2.88 reported; 2.668 in the 2017 report).

Check: along_m is within 100 m of the 2016 report's chainage at every Line 4 station (rebuilt 2026-10-19). Gaimukh is 357 m ahead, so Line 4A's route or its last station has moved since 2017.

Kapurbawdi: MMRDA's Line 4 point is 74 m from the OpenStreetMap point that Line 5 uses for the same station.

## Items that need your review

Decided by the owner on 2026-10-19 (all as proposed):

1. **Countdown.** To 31 Dec 2026 for the first stretch, labelled as a reported target. MMRDA has announced no date; news reports say MMRDA aims for "around Diwali or by the end of 2026".
2. **Line 4A on the Line 4 page**, as for Line 5A. MMRDA has no Line 4A page; its 2023 review treats the two together.
3. **Phases.** MMRDA names none. The data uses the three opening stretches reported in September 2025 (Gaimukh to Cadbury Junction, then to Gandhi Nagar, then to Wadala).
4. **First stretch: 8 or 10 stations.** Manpada and Gowniwada are on the stretch but left out of the August 2026 report. Both are shown as built, graded conflicting.
5. **The Mulund collapse (14 Feb 2026)** is shown under Progress, from project.json `incidents`, with its sources.

## Leads to verify

1. **Foundation stone, 24 Dec 2016**, by the Prime Minister with Line 2B (several news sites; none read).
2. **Packages not yet read:** CA-161 and CA-168 (track), CA-194, CA-222, CA-243 and CA-257 (station finishing), CA-236 (power, IRCON-Jakson, Feb 2025) and CA-237 (fare collection). Railway Gazette says L&T now does track and power, so some of these may have changed hands.
3. **CA-234 award date and value.** No MMRDA notice found.
4. **Which station meets which line.** Checked 2026-10-19. Found: the Monorail at Bhakti Park (2016 project report: opposite Bhakti Park Monorail station; 155 m apart in MMRDA's files, verified); Line 6 at Gandhi Nagar (MMRDA's Line 6 page; Line 6's side is Kanjur Marg (W); 161 m apart, verified); Line 2B at Siddharth Colony (Construction World, reported; 635 m from Line 2B's EEH station in MMRDA's files); Line 11 at Anik Nagar Bus Depot (The Metro Rail Guy, proposed); the Thane Integral Ring Metro's Dongripada, 186 m from Dongari Pada on the ring line's official map file (reported; neither project calls it an interchange); Line 10 at Gaimukh (approved). Still open: the Central Railway, which MMRDA names without a station, and MMRDA's Line 11 and Line 10 pages (both URLs return 404).
5. **Mogharpada depot progress and the CA-160 value** (Rs 905 Cr in one report).
6. **Line 4A cost, Rs 949 Cr**, from an MMRDA document.

## Not found

- An MMRDA page or press release for Line 4A.
- An opening date, CMRS approval, fares or timetable.
- Marathi names for Gowniwada and Gaimukh.
