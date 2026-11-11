# Updating the data

Every fact on the site comes from the JSON files in `src/data/`. Each line has its own folder, `src/data/lines/<id>/` (for example `src/data/lines/line-12/`), listed in `src/data/lines.json`. The news feed files stay in `src/data/`. You edit them by hand, commit, and push. Cloudflare Pages rebuilds the site in about a minute.

## The rules

1. **No source, no fact.** Every entry has a `source_url`.
2. **Date your check.** Set `last_verified` to the day you checked the source, as `YYYY-MM-DD`.
3. **Grade it honestly.** Use one `status`:
   - `verified`: MMRDA's website or an MMRDA document says it.
   - `reported`: a news or trade outlet says it, but MMRDA does not (yet).
   - `unverified`: one weak source, or you could not confirm it.
   - `conflicting`: sources disagree. Put the other values in `alternatives`.
4. **Keep history.** When a number changes, move the old value into `history` (with its source) instead of deleting it. The site shows old values struck through.
5. **No em dashes.** Use commas, full stops or brackets.

Run `npm run validate` before you commit. It fails if an entry is missing a source, a date or a valid status.

## Common updates

### New monthly progress from MMRDA

MMRDA updates the progress table on its [Line 12 page](https://mmrda.maharashtra.gov.in/en/projects/transport/metro-line-12/overview) about once a month.

In `src/data/lines/line-12/project.json`, edit `progress`:

```json
"progress": {
  "as_of": "2026-09-30",
  "items": [
    { "activity": "Pile works", "percent_complete": 39.50 },
    ...
  ],
  "status": "verified",
  "source_url": "https://mmrda.maharashtra.gov.in/en/projects/transport/metro-line-12/overview",
  "last_verified": "2026-10-05"
}
```

Also add a timeline event if something notable happened (next section).

### A new milestone

Add an object to `events` in `src/data/lines/line-12/timeline.json`, in date order:

```json
{
  "id": "girder-300",
  "date": "2026-11",
  "date_precision": "month",
  "kind": "construction",
  "title": "300th U-girder launched",
  "summary": "Near Sonarpada station.",
  "status": "reported",
  "source_url": "https://example.com/article",
  "last_verified": "2026-11-20"
}
```

- `date` can be `YYYY`, `YYYY-MM` or `YYYY-MM-DD`. Only use a day if the source gives one.
- `kind` is one of `planning`, `approval`, `tender`, `award`, `construction`, `related`, `future`.

### A tender is awarded

In `src/data/lines/line-12/tenders.json`, find the tender and set `awarded_value_crore`, `awarded_to`, `award_date` and `tender_status: "awarded"`. If the firm is new, add it to `src/data/lines/line-12/contractors.json` and use its `id` in `awarded_to`.

### The target date changes

In `src/data/lines/line-12/project.json`, edit `target_completion`:

- Put the new target in `value` (`YYYY-MM` or `YYYY-MM-DD`) and the day the countdown should count to in `countdown_date`.
- Move the old target into `alternatives` with its source.
- If MMRDA itself publishes the date, set `status` to `verified`.

### Curated X posts

Posts are never scraped. You choose them.

1. Open the post on X and copy its URL.
2. Add it to `posts` in `src/data/lines/line-12/social.json`, newest first:

```json
{
  "url": "https://x.com/SomeAccount/status/1234567890",
  "author": "Display Name",
  "handle": "SomeAccount",
  "date": "2026-10-01",
  "text": "The post's text, as written.",
  "status": "reported",
  "source_url": "https://x.com/SomeAccount/status/1234567890",
  "last_verified": "2026-10-01"
}
```

The site prints the post as a row (date, author, text). A reader can open X's full embed, with photos, from that row. `status` grades the post's claims: posts by people who follow the project are `reported` at best.

### News and videos (automatic)

A GitHub Actions job (`.github/workflows/feed.yml`) runs every 6 hours. It reads the outlets' own RSS feeds and, if a key is set, YouTube. It keeps only items about Line 12, writes `src/data/feed.json`, and commits and deploys only when it finds something new. Do not edit `feed.json` by hand.

What you can change, in `src/data/feed-sources.json`:

- **Hide an item:** add its URL to `exclude_urls`. The next run removes it.
- **Add an outlet:** add an RSS feed to `news_feeds`. For a WordPress site, `https://site/?s=taloja&feed=rss2` gives its Line 12 articles. Do not add Google News: its feed is for personal readers only.
- **Change what counts as Line 12:** edit the patterns in `match`.

To run it by hand: GitHub > Actions > Update news feed > Run workflow. Or locally: `node scripts/fetch-feed.mjs`.

**Videos need a YouTube key.** Without one, the job fetches news only and the Videos list stays hidden.

1. In Google Cloud Console, create a project and enable **YouTube Data API v3**.
2. Create an API key and restrict it to that API.
3. In GitHub: Settings > Secrets and variables > Actions > New repository secret. Name it `YOUTUBE_API_KEY`.

The job uses about 200 of the 10,000 free daily quota units for each run, so it stays free.

## Route line and station positions

They come from MMRDA's approved alignment KMZ, published on its [Metro Influence Zone for NOC](https://mmrda.maharashtra.gov.in/en/division/metro-piu/metro-influence-zone-noc) page. When MMRDA publishes a newer file:

```bash
python scripts/build-alignment.py
```

It downloads the file, rewrites `src/data/lines/line-12/alignment-mmrda-2025.geojson`, moves every station in `stations.json` to MMRDA's point, and keeps each earlier position under `location.earlier`. Then run `node scripts/build-wayback.mjs`, because the satellite spots sit on station positions. Check the printed list: any station that moved more than 50 m will say so on its page.

For Line 5, MMRDA's file is a KML with the corridor as a polygon, not a centre line:

```bash
python scripts/build-alignment-line5.py
```

It derives the centre line between the polygon's two sides, rewrites `src/data/lines/line-5/alignment-mmrda-2025.geojson`, and moves every station in `src/data/lines/line-5/stations.json` to MMRDA's point. It stops if a station point is more than 25 m from the derived line, or if MMRDA renamed a station in the file.

For Line 12A, MMRDA has published no alignment file yet. The route and station points are indicative, from OpenStreetMap:

```bash
python scripts/build-alignment-line12a.py
```

It rewrites `src/data/lines/line-12a/alignment-indicative.geojson` and the positions of the stations it can place. To place another station, add its OpenStreetMap node to `PLACES` in the script. When MMRDA publishes a Line 12A file, replace this script with one that reads it, as for Lines 4 and 5.

## Station pages, status page and search files

These are built from the data files. You never edit them by hand:

- `/stations/` and one page per station come from `src/data/lines/line-12/stations.json`. A new station there gets its own page and a sitemap entry.
- `/status/` answers common questions from `project.json`, `contractors.json` and `rollingstock.json`. When a fact changes there, the answer changes too.
- `sitemap.xml`, `llms.txt` (a short index for AI assistants) and `llms-full.txt` (every status answer with its grade and source, and every station) are rebuilt on every deploy. The two text files come from `src/lib/llms.ts`, which loops over `lines.json` and takes its words from the status answers (`src/lib/answers.ts`), so a new line needs no edit there.

### Nearby places

The "Nearby" row on each station page comes from `src/data/lines/<line>/nearby.json`, built from OpenStreetMap by `scripts/fetch-nearby.mjs`. Do not edit those files by hand. To refresh them (for example once a month, or after you add stations or a line):

```
node scripts/fetch-nearby.mjs
```

The kinds of place, their radius and how many to keep are at the top of the script. A fake or wrong OpenStreetMap entry goes in its `SKIP` list, with the reason. Better still, fix it on OpenStreetMap itself, and it is gone at the next refresh.

## Newer satellite imagery

Esri adds new imagery releases every few weeks. To refresh the before/after dates:

```bash
node scripts/build-wayback.mjs
```

It rewrites `src/data/lines/line-12/beforeafter.json` with the latest release and its real capture date. Commit and push. A GitHub Actions job (`.github/workflows/imagery.yml`) also runs it on the 3rd of every month and deploys, so the site picks up new imagery, and shows when it last checked, without you.

## Your own ground photos

1. Put two photos of the same spot in `public/photos/` (for example `manpada-2024-06.jpg` and `manpada-2026-09.jpg`). Keep each under 400 KB.
2. Add a pair to `pairs` in `src/data/lines/line-12/photos.json`:

```json
{
  "place": "Manpada Circle, looking south",
  "credit": "Shashank Ballaya",
  "before": { "src": "/photos/manpada-2024-06.jpg", "alt": "Manpada Circle before piers were built", "date": "2024-06-15" },
  "after": { "src": "/photos/manpada-2026-09.jpg", "alt": "Manpada Circle with the viaduct overhead", "date": "2026-09-20" }
}
```

The pair appears under the satellite comparison.

### Photos on a station page

Every station page has a photo slot beside its headline. Until you add a photo, it shows a dashed frame that says "No ground photo yet".

1. Remove the location data from the photo first. Phone photos carry the exact GPS point where you took them. The site shows only the station and the date.
2. Put the file in `public/photos/`, for example `sagaon-2026-10.jpg`. Keep it under 400 KB and at least 1200 px wide.
3. Add it under `stations` in `src/data/lines/line-12/photos.json`, keyed by the station id (the last part of the page address, for example `sagaon`):

```json
"stations": {
  "sagaon": [
    {
      "src": "/photos/sagaon-2026-10.jpg",
      "alt": "Piers for Sagaon station rising from the median of Kalyan-Shilphata Road",
      "caption": "Looking towards Dombivli from the footpath",
      "date": "2026-10-04",
      "credit": "Shashank Ballaya",
      "width": 1600,
      "height": 1200
    }
  ]
}
```

The first photo fills the slot. Any more appear under "More from the ground" further down the page. `width` and `height` are the file's real pixel size, so the page does not jump while the photo loads.

A photo by someone else needs their permission first. Put their name in `credit`, their X handle (without the @) in `handle`, and a link to their own post in `source_url`. The caption then links the name to that post and shows the handle. A large credit with their name and handle also shows at the top of the footer of that station page.

## Drone video stills

A creator's drone flight along a line can fill the station photo slots and a "From the air" section on the line page. Get the creator's permission first.

1. Add `src/data/lines/<line>/aerial.json` (see Line 5's): the video's YouTube id, title, creator, channel link, publish date, length in seconds, and a poster still of our own. Under `stops`, list the stations in the order the flight reaches them, with `t` the second where each one comes into view. Check each against the creator's on-screen station label, or the station's position on imagery.
2. Take stills at 1600 x 900 from frames with no picture-in-picture inset. Keep each under 400 KB and name them `<station>-aerial-<publish date>-a.jpg`.
3. Add each still under the station in `photos.json`, with `"kind": "drone"`, `credit` (the channel name), `channel_url`, `video_t` (the second of the frame) and `source_url` (the video link with `&t=<seconds>s`). `date` is the publish date, because the flight date is not known.

The page loads nothing from YouTube until a reader presses play. Then it uses youtube-nocookie.com.

### Ground video stills

A creator's ground ride along a line (not a drone flight) can also fill the station photo slots, with permission. There is no aerial.json for these. Find each station by the creator's on-screen label or spoken station name, take the still at 1600 x 900, blur readable number plates and phone numbers, and name it `<station>-video-<publish date>-a.jpg`. Add it under the station in `photos.json` with `"kind": "video"` and the same `credit`, `channel_url`, `video_t` and `source_url` fields as a drone still. The credit line reads "Still from <creator>'s video".

## Reader photos and updates

Readers send photos and updates with the form at `/send/`. Station pages and line pages link to it with the line and station filled in. `functions/api/submit.js` puts each entry in a private R2 bucket (`metro-submissions`) under `queue/<id>/`. Nothing goes live until you publish it by hand.

Corrections use the form at `/correct/` (the "Send a correction" links on every page fill in the page). They go to the same queue, text only, with `"kind": "correction"` in `meta.json`: the page, what is wrong, what is right and the reader's source. In `/admin/` a correction shows as a "Correction" card: fix the page in the repository, then press **Fixed** (it moves to Approved) or **Not a mistake** (Rejected). `npm run submissions` lists them too. They no longer go to GitHub issues.

### One-time setup (Cloudflare and GitHub)

Do these before the first push that includes `wrangler.toml`. The deploy fails if the bucket does not exist.

1. Create the R2 bucket `metro-submissions` (Cloudflare dashboard > R2 > Create bucket). Do not turn on public access.
2. Create a Turnstile widget (Cloudflare dashboard > Turnstile > Add widget) for `www.mumbaimetrotracker.com` and `mumbaimetrotracker.com`, mode "Managed". It gives a site key and a secret key.
3. In the Pages project `line12-tracker` (Settings > Variables and Secrets, Production), add two secrets:
   - `TURNSTILE_SECRET`: the Turnstile secret key.
   - `ADMIN_TOKEN`: a long random string (for example the output of `node -e "console.log(crypto.randomUUID()+crypto.randomUUID())"`).
4. In GitHub (Settings > Secrets and variables > Actions > Variables), add `PUBLIC_TURNSTILE_SITE_KEY` with the Turnstile site key. Without it, `/send/` says the form opens soon.
5. On your computer, add `SUBMISSIONS_TOKEN=<the ADMIN_TOKEN value>` to `.env` (gitignored).

### Moderators and the dashboard (one-time setup)

Moderators review entries at `/admin/`. Cloudflare Access logs them in with a one-time code sent to their email.

1. GitHub token, so the dashboard can publish: GitHub > Settings > Developer settings > Fine-grained tokens > Generate new token. Repository access: only `mumbai-metro-tracker`. Permissions: Contents, Read and write. Set it as the Pages secret `GITHUB_TOKEN`: `npx wrangler pages secret put GITHUB_TOKEN --project-name=line12-tracker`.
2. Cloudflare Access: dashboard > Zero Trust (choose the Free plan and a team name the first time). Access > Applications > Add an application > Self-hosted.
   - Name: `Metro Tracker moderators`. Session duration: 1 week.
   - Public hostname: `www.mumbaimetrotracker.com` with path `admin`. Do not add `api/admin`: the API checks the Access login itself, and the terminal script needs to reach it.
   - Policy: action Allow, include "Emails": your email and each moderator's email. Login method: One-time PIN.
3. In the application's overview, copy the "Application Audience (AUD) Tag". Put it in `wrangler.toml` as `ACCESS_AUD`, and put your team domain (`<team>.cloudflareaccess.com`) as `ACCESS_TEAM_DOMAIN`. Push.
4. To add or remove a moderator later, edit the emails in the Access policy. Nothing in the code changes.

### Reviewing the queue

In the browser, at `/admin/`:

1. Each entry shows where, who, when, the note and the photos.
2. "Clean and publish" opens a photo in the editor. It shows the GPS point of the original and the nearest station, and warns when the station picked is more than 1.5 km away.
3. Drag a blur box over every number plate and face. Crop if needed. Fill in the alt text and check the date and credit.
4. "Publish to the station page" makes one commit (the photo in `public/photos/`, the entry in the line's `photos.json`). The deploy runs by itself. The published copy has no EXIF; the server refuses one that does.
5. "Done: approve" or "Reject" moves the entry out of the queue. Each decision keeps the moderator's email in the entry's `meta.json`. An approved entry still has "Clean and publish" for each photo.

### Watch points

A watch point is a place between stations that can hold up a line: a long span over a junction, a structure in the way, power lines, land, utilities to shift, a court case. They come only from reader photos. Each one is in the line's `photos.json` under `watch_points` (types in `src/lib/watch.ts`) and shows in the "Watch points" section of the line page.

1. In the editor, under "Where it goes", choose "A watch point". An entry sent with no station starts there.
2. Pick an existing watch point, or "New watch point" with a title, a kind and the place (latitude, longitude). The photo's GPS fills in the place. The server finds the two stations on each side and refuses a place more than 1.5 km from the line.
3. Later photos of the same place go to the same watch point. The newest photo leads.
4. The "Watch points" tab edits a watch point: title, kind, status (Open or Cleared, with the date), a short note of facts, and source links (no Wikipedia). Each save is one commit.

In the terminal: `npm run submissions` lists the queue, `-- pull` downloads it to `ground/submissions/<id>/` (gitignored), and `-- approve <id>` or `-- reject <id>` moves an entry.

To test locally: `npm run dev:functions` builds the site and serves it with the functions on http://localhost:8788. Put `TURNSTILE_SECRET=1x0000000000000000000000000000000AA` (Cloudflare's always-pass test secret) and an `ADMIN_TOKEN` in `.dev.vars`, and build with `PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA`.
