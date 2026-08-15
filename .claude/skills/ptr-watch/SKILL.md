---
name: ptr-watch
description: Check for new 12.1 PTR developments and fold them into the tracker — new PTR build tuning notes (official forum thread), new Wowhead datamined tuning posts, new Warcraft Logs PTR raid-testing data (zone 54), and new real-player Dummy Dome target-count logs (zone 52). Use when the user says "check the PTR", "any new builds?", "ptr watch", or on a scheduled/loop run.
---

# PTR watch — the constant-updates loop

Idempotent check for new 12.1 PTR information since the last run. Designed to be run
weekly (PTR builds land ~weekly) by a schedule, /loop, or by hand. If nothing is new,
say so and change nothing.

## Procedure

1. **Last state**: read `data/ptr-builds.json` (newest build date) and this skill's
   `log.md` (last run).
2. **New builds?** Fetch the Wowhead news RSS (`wowhead.com/news/rss/all`) and filter
   titles for "12.1 PTR" + (Development Notes | Class Tuning | Datamined) with pubDate
   after the newest logged build.
   **RSS transport facts, verified 2026-08-01 — do not re-derive:**
   · Items are `<title>` THEN `<link>`. A regex keyed on `<link>...</link>` followed by
     `<title>` matches ZERO items and looks exactly like an empty feed. Parse per
     `<item>` block, never by tag adjacency. This cost two probe rewrites.
   · Each item carries `<content:encoded>` with the FULL article body (longest seen
     ~36 KB). ONE RSS fetch gives you all ~40 article texts — no per-article fetching,
     which also makes Cloudflare on the article pages irrelevant.
   · `wowhead.com/guide/*` IS Cloudflare-403 to plain urllib regardless of User-Agent.
   · Build-recap articles carry a navigation index listing every spec name in a row
     ("...Feral DruidGuardian DruidRestoration Druid..."), which matches any spec filter.
     Require a change verb near the match or strip nav blocks, or one article "mentions"
     all 40 specs.
   · **Icy Veins is fetchable but NOT discoverable**: `/wow/news` is JS-hydrated (200,
     ~42 KB, zero `/wow/news/` hrefs) and `/wow/rss/news.xml` 404s. Direct article URLs
     fetch fine. Discovery therefore comes off Wowhead RSS or a search engine; Icy Veins
     is where you READ once you already hold a URL.
   Then fetch the official thread's Discourse JSON
   (thread URL in `data/ptr-builds.json` + `.json`) and read `post_stream.posts` for
   new Linxy posts.
3. **For each new build**: add an entry to `data/ptr-builds.json` (newest first):
   `{date, label, forumPostNumber, forumUrl, wowheadUrl, icyveinsUrl, specsAffected[],
   highlights[]}` — highlights are verbatim tuning lines naming the spec, in practice
   as a "Spec Class — …" prefix (the older "(Class — Spec)" suffix is also accepted;
   the tier-set gate below matches either form).
   **Tier-set changes are NEVER optional highlights** (2026-07-21 audit: three builds of
   set redesigns silently missed the feed AND the spec cards): every line in the notes
   that changes a set bonus becomes a highlight, and for each affected spec you ALSO
   update `spec.tierSet` in `data/specs.json` — recompose `set2`/`set4` from the
   official wording (verbatim where the notes give the full bonus; a clean value swap
   into the stored text otherwise; a dated parenthetical amendment when neither is
   safe), set `asOf` to the build date and `source` to the forum post URL. A pure
   bug-fix still bumps `asOf` (re-verified). Then re-read the writeup's `ptr.set2/set4`
   commentary: if it reviews a now-replaced design, append a dated "(pre-<date> …)"
   note — attributed commentary about a dead design must say so. `npm test` enforces
   the pairing: a set-touching highlight whose spec's `tierSet.asOf` predates the
   build date fails validation (the tier-set upkeep gate in `src/validate.mjs`).
3a. **Three channels, not one** (2026-08-01). The feed tracks official forum BUILD
   posts. Wowhead also publishes datamined tuning articles and **PTR hotfix** round-ups —
   "Last night, a few hotfixes were pushed to the Patch 12.1 PTR" — which are neither
   build posts nor live-realm hotfixes. A PTR hotfix is real 12.1 tuning the forum thread
   never carries, so it can be absent from the feed while every gate stays green
   (confirmed case: Ride the Lightning +59%, Wowhead news=382321, 2026-07-31). Before
   logging one, check whether it sits under a bare CLASS heading with no spec qualifier —
   that one does, so attributing it to Elemental is inference. It belongs as a
   `Class (class-wide)` line or not at all.

3b. **The development-notes thread is not the only Blizzard channel** (2026-08-02).
   Blizzard also posts class tuning as **standalone blue posts** in other forum topics —
   confirmed case: Kaivax, "Healer Tuning - July 16", six healer specs of real 12.1
   tuning that reached no drawer for 17 days. Polling `2317811.json` can never surface
   these: they have their own topic id (the number ending the Wowhead blue-tracker slug,
   e.g. `…-2327376`), so they are a different topic, not a reply. Sweep the Wowhead
   **blue-tracker index** as well as the thread. Two traps in that one post:
   - The blue tracker stamps each topic with the patch that was LIVE at posting time —
     this one reads "(Patch 12.0.7)" while the body says "hotfixes to the PTR … in Curse
     of Ula'tek". **Trust the body, not the tag.** Getting this backwards either drops
     real 12.1 data or files live-realm tuning as PTR.
   - Log it `kind: "hotfix"`. It has a forum origin but no post number in the tracked
     thread, and `forumUrl` is validated as the dev-notes-thread citation — cite the
     blue-tracker mirror via `wowheadUrl` and say in the `label` that it was a
     standalone blue post.

3c. **PvP-only changes are OUT OF SCOPE** — this tracker rates PvE. A change that only
   alters PvP combat must never be written as a `Spec Class ...` highlight: it would let a
   PvP nerf vote in the PvE outlook tally. Precedent when logging one for the record is to
   prefix it `PvP only (out of scope for this tracker's PvE ratings) - `, which
   deliberately fails the `Spec Class ` prefix and so reaches no drawer. Lines that merely
   CARRY a PvP exclusion ("All damage increased by 6%. This does not apply to PvP
   combat.") are ordinary PvE lines — keep those. Worked example: the 2026-07-31 notes
   contain a Restoration Druid entry, but it is PvP-only (-10% healing in PvP), which is
   why build #18 correctly lists no Restoration Druid line and the coverage gate is right
   to stay quiet.

3b. **Every spec you list in `specsAffected` must get a line in `highlights`.**
   `npm test` enforces it (coverage gate in validate.mjs) — a spec named as affected with
   no line that `specBuildChanges` would surface fails the run. Class-wide lines count,
   scoped by build membership. This gate exists because the four earliest builds were
   seeded with a handful of marquee lines against a full specsAffected list: build #1
   named 39 specs and carried 6 lines, and 30 specs' 12.1 changes were invisible for six
   weeks. Distill EVERY spec the post touches, not just the headline changes.
   **Style for dense builds: one consolidated line per spec** (semicolon-separated, as in
   builds #16 and #18) rather than one line per bullet. Note the consequence — a
   consolidated line that mixes buffs and nerfs classifies as null and does not vote in
   the outlook tally, which is intended: it is genuinely not evidence of a direction.
   If a spec's changes ARE one-directional, keep them in one line so they do vote.

4. **Spec writeups**: while scanning the RSS, also flag per-spec 12.1 review/first-look
   articles ("12.1 <spec> changes/review/tier set...") as writeup material for untracked
   specs, and distill them into the spec's `ptr` object in `data/specs.json`.

   **Wowhead RSS is a discovery lane, NOT the only one** (2026-08-01). Nine specs sat at
   `ptr: null` for weeks with run after run logging "no article covering any of them
   appeared in the RSS window" — the RSS window is a few days wide and Wowhead's preview
   series does not cover every spec, so a spec Wowhead never wrote about could never
   arrive. The existing 31 writeups already came from five different places: 20 Wowhead,
   **7 class Discord**, 2 hackmd.io, 1 Blizzard forum, 1 named guide author. So when a
   spec is uncovered, work the lanes in this order before concluding it has nothing:

   a. **Wowhead directly** — search the site for the spec's 12.1 article rather than
      waiting for it to appear in the RSS window; older articles have scrolled out.
   b. **Icy Veins NEWS** (`icy-veins.com/wow/news/...`) — their PTR lane is news posts.
      **The GUIDES are now a live lane too, as of 12.1 launch (2026-08-11).** This entry used
      to say the guides self-identify as 12.0.7 and "will not carry 12.1 analysis until
      launch, so do not burn a run diffing them" — true before launch, and actively wrong
      after it: the 08-11 nightly closed **8 of 9** remaining writeup gaps from exactly those
      pages once they rebuilt as Season-2 content. A "do not look here" pointing at a lane
      that now works is worse than no note. Check the guides' own era before diffing (title
      or body self-identification), and treat a stale title over a Season-2 body as Season 2 —
      the blue-tracker precedent, body over title.
   c. **Class Discords** via `paste-discord` — already the source of 7 writeups. Dreamgrove
      (Druid), Council of the Black Harvest (Warlock), Earthshrine (Shaman), Warcraft
      Priests, Death's Advance (DK). Not fetchable; Riley pastes.
   d. **Community sites / HackMD guides** in `community.json` `sites[]` — the BM and MM
      Hunter writeups came from hackmd.io.
   e. **The spec's registered expert** in `community.json`. Every uncovered spec has one,
      and most are `transcribable: false` 📖 precisely because they publish as guide
      bylines and Discord posts rather than video. That flag marks WHERE to read them,
      not that they are unreadable.

   **Read the notes with their heading structure INTACT.** Flattening to prose destroys
   the nesting that establishes which spec owns a line, and the same spell appears under
   several specs with different values: in the 2026-06-18 notes "Wild Growth healing
   increased by 25%" belongs to Balance, to Feral, AND to Heart of the Wild, while
   Restoration's own line says **20%**. A 2026-08-01 research pass had one reader get it
   right and a second "correct" it to 25% off the flattened text. Spec+class key shapes do
   NOT prevent this — only section attribution does.

   List the uncovered specs every run rather than remembering them:
   `node -e "const s=require('./data/specs.json');console.log(s.filter(x=>!x.ptr).map(x=>x.class+' '+x.spec).join('\n'))"`

   **A spec with no published analysis stays `ptr: null` — that is the correct outcome,
   not a failure.** The verdict must be the source's read (see (c) below), so "nobody has
   written about Feral yet" is an honest answer the UI already renders as pending. Never
   manufacture a writeup from tuning lines to close the gap.
   **Auto-confirm policy (2026-07-06)**: writeups land confirmed — no draft flag, no
   review gate. The honesty requirements instead: (a) EVERY writeup carries `source`
   (URL) or `sourceLabel` (validation enforces it); (b) **every NEW writeup also carries
   `ptr.asOf`** — the date the SOURCE published or said it, which for an article is its
   own publication date, NOT the date you fetched it (added 2026-07-26; validation fails
   the run without it). The only writeups allowed to omit it are the 29 grandfathered in
   `UNDATED_WRITEUPS` (`src/validate.mjs`), and **that list may only shrink** — if you
   rewrite one of those from a fresh, dated source, add the date and delete its name from
   the list in the same edit. Never add a name to it; (c) distill FAITHFULLY — the
   verdict must be the source's own read, never your editorial call; if the source
   gives no clear verdict, don't write a writeup from it. Don't rewrite an existing
   writeup wholesale on tuning-only changes — append to `changes[]` / adjust `watch`.
   **WCL runner status (2026-07-14, applies to steps 5-7):** the HTML statistics URLs
   below work from residential IPs (local runs); on the nightly runner the agent holds
   NO WCL credentials (re-audit) — a deterministic pre-agent step (`src/fetch-wcl.mjs`)
   performs the standing WCL check and writes `wcl-fetch/evidence.json`; read that file
   for the WCL manifest rows and do not fetch warcraftlogs.com yourself there. The
   rDPS-family metrics currently 500 server-side, so these cuts are expected
   `unreachable` from CI until WCL fixes it. The proven transport recipe, the full bug
   status, the retry protocol, and the probe workflow are documented ONCE in the
   refresh-metrics SKILL.md ("WCL v2 API status") — read that before spending any run
   time re-deriving WCL behavior.
5. **WCL PTR raid testing (zone 54)**: verified working URL (2026-07-01, Heroic —
   where testing currently happens; Mythic is empty until those windows open):
   `warcraftlogs.com/zone/statistics/table/54/dps/0/4/10/1/1000/1/14/0/DPS/Any/All/0/normalized/single/0/-1/?keystone=15&dpstype=rdps`
   **All three roles every run (2026-07-09 — feeds projection confidence for healers/tanks):**
   healers = same URL with `hps` metric + `Healers` role token; tanks = `dps` + `Tanks`.
   All three cuts merge under the SAME metric name "12.1 PTR raid testing score
   (normalized)" — ranks are computed within-role at build, so one name serves all roles.
   Fragment gotcha: rows have NO anchor tags — spec comes from the sprite class
   (`actor-sprite-Druid-Restoration`), class from the row's `td nowrap class="…"`
   (CamelCase → spaced); values are Score / Max / Parses in `main-table-number` cells.
   (XHR header recipe as in refresh-metrics; zone 54 has NO partitions — that segment
   is always 1; difficulty 4=Heroic size 10, 5=Mythic size 20; `aggregate=normalized`
   → Score is 0–100 points, not raw DPS). Ingest EVERY run (policy 2026-07-08: no
   change-detector gate — re-ingest the current values regardless of whether the parse
   count moved; still log the parse count in log.md for the record). Merge as metrics
   named "12.1 PTR raid testing score (normalized)" with `n` = parses — the tiny-n caveat
   (n ranges ~3–100; world-first testers, templated gear, tuning in flux) lives in the
   name, the `n`, and NEVER in the live baselines. Empty = nothing to ingest (skip that,
   it's not an error); otherwise always ingest the live values.
6. **WCL Dummy Dome real-player logs (zone 52)**: the real-player counterpart to the sim
   fight profiles — median rDPS by fixed target count (feeds `spec.ptrDummy`). Zone 52 has
   NO partitions, one difficulty (3 = Normal) and one size (10); the partition segment is
   always 1, and `aggregate=amount` → the Score column is median **rDPS** (raw, not the
   normalized 0–100 that zone 54 uses). Fetch each of the four DPS dummies fresh every run
   (no at-most-daily cap — policy 2026-07-08; XHR header recipe as in refresh-metrics):
   `warcraftlogs.com/zone/statistics/table/52/dps/{bossId}/3/10/1/50/1/14/0/DPS/Any/All/0/amount/single/0/-1/?keystone=15&dpstype=rdps`
   Boss id → target count: **3591** Sinister Single = 1T · **3590** Diabolical Duo = 2T ·
   **3592** Terrible Trio = 3T · **3593** Fearsome Five = 5T. (3594 Hazardous Healer is a
   healer dummy — skip it for the DPS ptrDummy.) **The raw fragment SOMETIMES doubles each
   spec row (54 rows → 27 specs) and sometimes does not — never blind-halve.** Count unique
   spec sprites and dedupe on first occurrence, every run. Verified 2026-08-05 with zone 46
   as a control: one `summary-table`, 28 `<tr>`, **27 unique sprites, max duplicate count 1**
   — halving there would have written every value and every count wrong. The doubling has
   not recurred in four consecutive clean runs; the dedupe stays because the two cases are
   indistinguishable without counting. **Two different EMPTY shapes also come back, and both
   mean "ingest nothing, bump no snapshot":** a ~9,140-byte header-only fragment (the
   `<th>Class Spec Score Max Parses</th>` row present, zero `actor-sprite-` rows) is
   valid-but-empty — zone 54's shape between testing windows — while the literal 114-byte
   "No statistics have been collected for this zone, difficulty, size and region yet." is
   never-aggregated, zone 57's shape. Neither is a parse failure. Ingest EVERY run (policy
   2026-07-08: no change-detector gate — always re-merge the current medians regardless
   of whether the parse count moved up, down, or held; still log the count). Merge by writing
   `{"ptrdummy":[{"class","spec","source":"warcraftlogs","asOf":<today>,"targets":{"1":dps,"3":dps,…}}]}`
   to a scratch file → `node src/apply-metrics.mjs <file>` — include only the counts a spec
   actually logged (missing counts are fine; the build's coverage floor decides which specs
   earn a ranked composite). The composite score/rank + per-target percentiles are computed
   at build time (`dummyDomeScores` in render.mjs) — never hand-write them. Empty = nothing
   to ingest (not an error); otherwise always ingest the live values, even if unchanged.
7. **WCL PTR M+ testing (zone 56 = "Mythic+ Season 2 (PTR)")**: the M+ counterpart to the
   zone-54 raid series — real-player Season 2 keys on the PTR. Same table recipe as the
   LIVE M+ zone 47 (**difficulty 10 / size 5 / partition 1**; role tokens are plural —
   `DPS` / `Tanks` / `Healers`; `aggregate=amount` → median rDPS/HPS, NOT the normalized
   0–100 that zone 54 raid uses). Fetch three cuts fresh every run (policy 2026-07-08 — no
   cap; XHR header recipe as in refresh-metrics):
   `warcraftlogs.com/zone/statistics/table/56/dps/0/10/5/1/1000/1/14/0/DPS/Any/All/0/amount/single/0/-1/?keystone=15&dpstype=rdps`
   (swap `/DPS/`→`/Tanks/` for the tank cut; for healers use `.../56/hps/0/10/5/1/1000/1/14/0/Healers/...`).
   Value = the Score column (median), `n` = the Parses column. Merge as **metrics** (era
   `ptr`, bracket `mplus`) named exactly: DPS → "Median rDPS (12.1 PTR M+ testing)"
   (27 specs), tank → "Median rDPS (12.1 PTR M+ testing, tank)" (6), healer → "Median HPS
   (12.1 PTR M+ testing)" (7). Write `{"metrics":[…]}` to a scratch file →
   `node src/apply-metrics.mjs <file>`. The "12.1 PTR" in the name auto-tags era ptr
   (validation enforces name↔era); rank/of are build-computed; keep it OUT of the live
   baselines and label it PTR. Ingest EVERY run regardless of parse-count movement (no
   change-detector gate); empty table = nothing to ingest (not an error). Note the zone-56
   total parse count in log.md for the record. (Zone **55** = "Mythic+ Season 2" non-PTR,
   for when S2 goes live.)
7b. **WCL Tidebound Grotto (zone 57)**: the S2 single-boss flex raid — boss id **3379**
   "Nymrissa Wavecaller" (boss segment 0 works too; one encounter). Zone structure
   verified 2026-07-28: difficulties LFR **1**/Normal **3**/Heroic **4**/Mythic **5**;
   sizes so far Normal/Heroic/LFR = 10, Mythic = **25** (NOT the size-20 Mythic of
   zones 46/54); NO partitions (segment stays 1). Check the three cuts each run at the
   difficulty where testing is happening (probe Normal 10 first, then Heroic 10,
   then Mythic 25 — same fallthrough logic as zone-54's Heroic→Mythic move):
   `warcraftlogs.com/zone/statistics/table/57/dps/0/{diff}/{size}/1/1000/1/14/0/DPS/Any/All/0/amount/single/0/-1/?keystone=15&dpstype=rdps`
   (healers = `hps` + `Healers`; tanks = `dps` + `Tanks`; `aggregate=amount` → median
   rDPS/HPS, matching zone-56 style — a single boss makes raw medians more honest than
   the normalized 0–100 used for zone-54's multi-boss pool). Merge as metrics (era
   `ptr`, bracket `raid`) named exactly: DPS → "Median rDPS (12.1 PTR Tidebound Grotto)",
   tank → "Median rDPS (12.1 PTR Tidebound Grotto, tank)", healer → "Median HPS
   (12.1 PTR Tidebound Grotto)". These names are NOT consumed by the projection
   (`projectionFor` reads its inputs by exact name) — display-only by construction.
   **As of 2026-07-28 every table is empty** — 34 combos probed (all difficulties ×
   sizes 0/10/15/20/25 × partitions 1–2 × boss 0/3379) all return WCL's honest
   "No statistics have been collected" message even though testing occurred (~07-14+;
   the raid is noted to open Aug 18) — WCL simply hasn't aggregated statistics for the
   zone yet. Empty = nothing to ingest (not an error); ingest the moment rows appear
   and log the first-ingest parse counts.
8. `npm run test:quiet && npm run build`. If any `data/` file changed this run, also run
   `node src/snapshot.mjs` (movement baseline; loadData skips baselines identical to the
   current state, so ordering vs the build is safe). Append to `log.md`: date · builds
   found · zone-54 (PTR raid) state · zone-52 (Dummy Dome) state · zone-56 (PTR M+)
   state · zone-57 (Tidebound Grotto) state.

## Gotchas

- **A new patch cycle = a NEW forum thread** (12.0.7 used a different topic id). If the
  thread 404s or goes quiet while Wowhead posts keep coming, re-discover the thread via
  the Wowhead posts or the PTR forum category listing, then update the `thread` key.
- WebFetch truncates the Discourse `.json` to post 1 — use Bash curl for the full
  `post_stream`, or fetch individual posts at `/t/<topic>/<post_number>`.
- Wowhead article pages show only relative dates ("Posted N days ago") — take exact
  dates from the RSS pubDate.
- Separate **live hotfix** notes from **PTR build** notes — only PTR builds go in the
  feed. PTR testing windows are scheduled by Blizzard; zone 54 having zero new parses
  for weeks is expected, not an error.
- Do not rewrite existing spec `ptr` writeups wholesale on tuning-only changes — append
  to `changes[]` / adjust `watch`, and only flip `verdict` when the picture genuinely
  changed (state why in the diff).

### Transport traps promoted from `log.md` (2026-08-15 context audit)

Learned by runs that got them wrong. Every failure below returned HTTP 200 and looked
like "the source has nothing new", which is why they are rules and not anecdotes.

- **Prove the transport before believing an empty WCL table** (2026-07-31). Before recording a
  PTR zone as empty upstream, control-fetch a known-populated zone (live zone 46 returned 54
  rows). Without it, "empty upstream" and "our fetch is broken" are the same observation — and
  one of them makes the manifest row a dishonest success.
- **Confirm an ingest with `Math.round`, a sprite-name normalization, and a rising parse count**
  (2026-08-03, 2026-08-04). Live values carry two decimals against rounded storage, so a float
  tolerance reported **54 phantom "diffs"** on a byte-correct cut; rounded, 26 of 27 matched
  exactly and the 27th was a sprite-name artifact (`Hunter-BeastMastery` vs roster "Beast
  Mastery") — normalize the CamelCase sprite SPEC token the same way step 5 normalizes the
  class, before calling a row missing. Parse counts growing while medians hold (z52 1T
  1,254 → 1,419; z56 DPS 5,348 → 5,669) is how you tell a stable median from a frozen feed.
- **The zone-54 normalized series and the zone-54 raw-DPS pooled series ride different
  transports** (2026-08-03) — one being empty says nothing about the other. (The rule against
  substituting one for the other is in refresh-metrics SKILL.md; don't restate it here.)
- **Wowhead's blue tracker and news index are JS-hydrated; the payload is a JSON script block**
  (2026-08-03, 2026-08-05). Parse `<script type="application/json" id="data.blueTracker.default">`
  → `{entries:[{title,author,posted,url}]}`, and `id="data.news.newsData"` →
  `{newsPosts[], totalPages}`, paged with `?page=N` (read `newsPosts[]`'s `id`, `postUrl`,
  `postedFull`, `preview` — not hrefs). Dedupe the tracker by topic: 50 entries is routinely
  ~30 unique topics. **Anchor on the id attribute and brace-balance from there** (string-aware,
  or `raw_decode`): more JSON follows on the same line, so a `</div>`-terminated slice and a
  naive `}` search both fail, and a regex keyed on `blueTracker\s*[:=]` matches the *id
  attribute* and then finds no assignment. Every wrong form fails in the shape of a **missing
  payload**, so the mandated step-3b sweep reports "no blue posts" while the channel is healthy.
- **Never judge "the page looks empty" by curl's `size_download`** (2026-08-03) — with
  `--compressed` it reports the COMPRESSED size (12,527 against a real 68,883-byte body). These
  index pages need the same full browser header set every wowhead fetch uses (see refresh-tiers);
  a UA-only curl is 403.
- **Wowhead's news SEARCH is reachable as an XHR JSON endpoint** (verified 2026-08-02, not
  re-exercised since): `GET https://www.wowhead.com/search/news?q=<urlencoded>` with a browser UA
  **plus** `X-Requested-With: XMLHttpRequest`, `Accept: */*`, `sec-fetch-*: empty/cors/same-origin`
  and `Referer: https://www.wowhead.com/search?q=<same>` returns a plain JSON array of
  `{id, topic, subject, date}`, where `topic` is the `news=` id. Without the XHR header it is 403.
  (Endpoint name from `WH.SearchPage.fetchNewsResults` in `zamimg.com/js/search.js`.) This is the
  discovery lane the RSS window cannot be — use it before concluding a spec has nothing. The
  rendered `/search?q=` HTML page is NOT a lane.
- **The news INDEX leads the RSS feed, so RSS alone is not sufficient within a run**
  (2026-08-04): `data.news.newsData` page 1 carried news=382350 about three minutes before the
  check while an RSS fetch taken minutes earlier topped out at 382345. Poll the index as well,
  or a post landing mid-run is invisible.
- **Fetching an article that has scrolled OUT of the RSS window** (2026-07-31; in-window bodies
  come free in `<content:encoded>`, so this is the narrow case): the bare `wowhead.com/news=<id>`
  form is CloudFront-403 from CI and from a residential IP even with the full header set. Use the
  RSS `<link>` slug form with `curl -L` (it 301s to the `…-<id>` canonical URL). r.jina.ai worked
  on `/news=` as of 07-31 but is dead on `/guide/*` since 08-03 — re-verify before relying on it.
- **Dead discovery lanes — stop re-deriving them** (2026-08-03, 2026-08-06, both from CI):
  `icy-veins.com/feed.atom` is NOT their WoW news lane (it 301s to a forum RSS carrying Heroes of
  the Storm topics); Wowhead's site-search HTML is JS-hydrated (200, 32 KB, zero result hrefs);
  `wowhead.com/guides/rss` is 403 even with the full header set.
- **Never build a `RegExp` from a string inside `node -e` on this Windows/Git-Bash setup**
  (2026-08-04, cost three parse attempts). Backslashes in JS *string* literals collapse:
  `new RegExp("<title>([\s\S]*?)<\/title>")` arrives as `/<title>([sS]*?)<\/title>/` and matches
  nothing. Regex **literals** survive, which is the trap — the `<item>` block literal still found
  all 40 RSS items while every constructed field regex returned null, so a healthy feed read as
  40 undated, untitled entries, indistinguishable from an upstream format change. Write parsers
  to a `.mjs` file and run the file.
- **Match on class + spec, never a bare spec token** (2026-08-01). "Frost", "Restoration" and
  "Holy" are shared across classes, so a bare-token filter produces FALSE POSITIVES from Frost
  Mage / Restoration Shaman / Holy Paladin — and the failure presents as coverage, not as a bug.
  (Same class of error as the step-2 nav-index trap, from the opposite direction.)
- **A forum post with zero class content still gets a feed entry** — `specsAffected: []` plus
  `Non-class:` highlights, the precedent set by posts #7, #12 and #13 (2026-08-01). Two entries
  may share a date (#18/#19 on 07-31, as #11/#12 did on 07-08); order them newest-first by
  PUBLICATION time within the day.