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
   after the newest logged build. Then fetch the official thread's Discourse JSON
   (thread URL in `data/ptr-builds.json` + `.json`) and read `post_stream.posts` for
   new Linxy posts.
3. **For each new build**: add an entry to `data/ptr-builds.json` (newest first):
   `{date, label, forumPostNumber, forumUrl, wowheadUrl, icyveinsUrl, specsAffected[],
   highlights[]}` — highlights are verbatim tuning lines with "(Class — Spec)" suffix.
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
4. **Spec writeups**: while scanning the RSS, also flag per-spec 12.1 review/first-look
   articles ("12.1 <spec> changes/review/tier set...") as writeup material for untracked
   specs, and distill them into the spec's `ptr` object in `data/specs.json`.
   **Auto-confirm policy (2026-07-06)**: writeups land confirmed — no draft flag, no
   review gate. The honesty requirements instead: (a) EVERY writeup carries `source`
   (URL) or `sourceLabel` (validation enforces it); (b) distill FAITHFULLY — the
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
   healer dummy — skip it for the DPS ptrDummy.) Each spec row appears **twice** in the raw
   fragment (54 rows → 27 specs; halve the parse count too). Ingest EVERY run (policy
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
   for when S2 goes live; zone **57** = "The Tidebound Grotto" raid — not tracked yet.)
8. `npm test && npm run build`. If any `data/` file changed this run, also run
   `node src/snapshot.mjs` (movement baseline; loadData skips baselines identical to the
   current state, so ordering vs the build is safe). Append to `log.md`: date · builds
   found · zone-54 (PTR raid) state · zone-52 (Dummy Dome) state · zone-56 (PTR M+) state.

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
