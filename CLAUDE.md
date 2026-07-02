# Midnight 12.1 PTR Spec Tracker

Multi-source class/spec performance tracker for WoW Midnight (Patch 12.1 PTR, "Curse of Ula'tek").
Data lives in `data/*.json`; a build step compiles it with `src/template.html` into **one
self-contained artifact — `dist/index.html`** — a personal project; Riley just opens
the file directly in a browser (no hosting, no deployment).

## Commands

- `npm test` — schema validation + unit tests + build smoke test
- `npm run build` — data + template → `dist/index.html`
- `npm run validate` — data checks only
- `npm run serve` — preview `dist/index.html` at http://localhost:8317

Always run `npm test && npm run build` after any data edit. Never edit `dist/index.html`
by hand — it is generated.

## Hard rules

1. **All game data is fetched live, never filled from model memory.** Midnight / 12.1
   postdates every model's training cutoff. Unfetchable → leave absent/null ("pending
   fetch" in the UI) rather than guessing.
2. **The 40-spec roster is Midnight-era and includes Demon Hunter · Devourer.** Do not
   "correct" it to a 39-spec pre-Midnight shape.
3. **Honest source typing.** Only `kind: "tier-list"` sources feed the letter-tier
   consensus. `kind: "metrics"` data (log medians, sim DPS, ratings ceilings) is displayed
   as numbers and NEVER converted to letter grades. Murlok's number is a *top-50 ceiling*
   (avg rating of each spec's best 50 players), not popularity, and must stay labeled so.
   Archon raid tiers come from its **throughput** tier list (not the default popularity
   grouping); Archon M+ tiers from its **score** tier list.
4. `src/template.html` is presentation only — zero data in it.
5. Data-changing workflows run **plan-first**: propose the diff, then apply.
6. Discord content is never fetched (auth + TOS) — `data/community.json` holds curated
   links only, manually verified. Creator videos are opinion/analysis, not tier data.

**`SOURCES.md` is the canonical human-readable source inventory** — every source by
layer, with honesty rules and access etiquette. Keep it in sync when adding sources.

## Data model

### `data/specs.json` — array of 40 specs
```json
{
  "class": "Rogue", "spec": "Outlaw", "role": "DPS",
  "ratings": { "raid": { "icyveins": "A", "archon": "B" }, "mplus": { "...": "..." } },
  "metrics": [
    { "source": "warcraftlogs", "bracket": "raid", "name": "Median rDPS (Mythic, all bosses)",
      "value": 118000, "unit": "rDPS", "n": 25000, "asOf": "2026-07-01" }
  ],
  "fightProfile": { "source": "bloodmallet", "asOf": "2026-07-01",
                    "targets": { "1": 104255, "3": 197715, "8": 320000, "15": 543931 } },
  "ptr": null
}
```
- `ratings` keys are tier-list source ids; tiers must exist in that source's scale (null = unrated → "—").
- `metrics` rows upsert by (source, bracket, name) — see `src/apply-metrics.mjs`. Each
  may carry `era: "live" | "ptr"` (default live; names containing "12.1 PTR" are
  inferred ptr). At build time every metric gets `rank`/`of` — its position within
  (role, bracket, name), #1 = highest value; all current metrics are higher-is-better
  (extend `metricRanks` in render.mjs with a direction flag before adding one that isn't).
  The UI has an Era toggle (Both / 12.0.7 / 12.1 PTR) filtering verdicts, writeups,
  era-tagged metrics, and creator takes.
- `fightProfile.targets` maps target count → sim DPS (best build per count). The build
  derives ST/cleave/AoE labels (1T / 3T / 8T-with-fallbacks) as **within-role percentiles
  across DPS specs** (≥70th = strong, ≤30th = weak) plus a row tag (AoE-lean / ST-lean /
  All-round / Flexible / Low-sims). DPS specs only — healers/tanks have no sim basis.
- `ptr` is the per-spec 12.1 writeup: `{ verdict: "Positive|Mixed|Negative", theme,
  summary, changes[], set2, set4, watch }`.

### Computed at build time (never hand-written)
- **Movement (▲▼)**: `build` compares consensus tiers + metric ranks against the latest
  `data/history/*.json` snapshot. **Every refresh workflow ends with
  `node src/snapshot.mjs`** (after build + verify) so the next run has a baseline.
  A "pending"-looking zero-movement build right after a snapshot is correct behavior.
- **12.1 outlook (↗→↘)**: from the spec's `ptr.verdict` when present, else the balance
  of buff/nerf lines mentioning the spec in `data/ptr-builds.json` highlights; shown in
  the verdict column with the basis in the tooltip. Extend `outlookFor` (render.mjs) to
  fold in zone-54 PTR metrics once those start landing.
- **Fight view**: `data/encounter-tiers.json` holds Archon per-boss (throughput) and
  per-dungeon (score) tiers — single-source by design, labeled as Archon in the UI; the
  Fight selector swaps the matching tier column. Refresh alongside the tier lists.
- `spec.survivability` = Archon's raid survivability tier (merge via apply-metrics.mjs
  `survivability` key) — shown in the drawer's Source ratings box.

### `data/sources.json` — source registry
Kinds: `tier-list` (toggle button + consensus; needs `scale`), `metrics` (numbers in
drawers), `notes-feed` (PTR build feed), `reference` (footer link only). Each has
`pages[]` with `bracket`, `role`, optional `label`, `url`, `snapshot` (ISO date).

### `data/scales.json` — tier scales + normalization
Each scale maps tiers onto one 0–100 axis; consensus = mean of available tier-list scores
mapped through `consensus.bands`, divergence dot when spread ≥ `spreadThreshold`.
Adding a tier-list source = config edit here + registry entry + backfill. No code changes.

### `data/ptr-builds.json` — 12.1 PTR build feed (newest first)
Per build: `{ date, label, forumPostNumber, forumUrl, wowheadUrl, icyveinsUrl,
specsAffected[], highlights[] }`. Canonical source: the official forum thread
(`thread` key) — each PTR build is a new reply post, machine-readable via Discourse
`.json`. **A new patch cycle means a NEW thread** — re-discover via Wowhead news RSS.

### `data/community.json` — curated community links
Per class: verified Discord (name + invite from wowhead.com/discord-servers, render via
r.jina.ai) and creators `{ name, credential, url, latest, verifiedDate }`. Add only
verified entries; prefer Wowhead/Icy-Veins/Method guide authors.

## Refresh workflows

### Tier lists (Icy Veins / Method / Wowhead / Archon)
1. Fetch each page in `sources.json` live; era-verify (Midnight S1, Devourer in DPS lists).
   Archon: parse the `__NEXT_DATA__` JSON script tag from raw HTML (WebFetch markdown
   drops it); raid = throughput tierList, M+ = score tierList.
2. Write rows `[{class, spec, bracket, source, tier}]` (exact roster names) to a scratch
   file → `node src/apply-ratings.mjs <file>` (refuses on unmatched rows).
3. Update `snapshot` dates in `sources.json`; `npm test && npm run build`.

### Metrics (Warcraft Logs / Murlok / Archon numbers)
1. WCL: zone 46 = live S1 raid (Mythic = difficulty **5**, size 20, partition 3 = 12.0.7);
   zone 47 = M+ S1; zone **54 is the 12.1 PTR raid** — PTR data only. Statistics-table
   endpoint needs `X-Requested-With: XMLHttpRequest` + browser UA + Referer; response is
   an HTML fragment with unclosed `<td>` — parse leniently. **Be a polite guest**: fetch
   each cut once, at most daily; the sanctioned long-term path is their free v2 GraphQL
   API (OAuth client).
2. Murlok meta pages: plain GET (r.jina.ai does NOT work on it).
3. Write `{ "metrics": [...], "profiles": [...] }` to a scratch file →
   `node src/apply-metrics.mjs <file>`; `npm test && npm run build`.

### Fight profiles (Bloodmallet)
`GET https://bloodmallet.com/chart/get/talent_target_scaling/castingpatchwerk/{snake_case_class}/{spec}`
per DPS spec; take best-build DPS at target counts 1/2/3/5/8/15; confirm
`simc_settings.tier == "MID1"`. Merge via `apply-metrics.mjs` (`profiles` key).

### Log a new PTR build
1. Watch Wowhead news RSS (`/news/rss/all`) for "12.1 PTR" + Development Notes/Class
   Tuning/Datamined; fetch the forum thread `.json` for the new post.
2. Add the build entry to `data/ptr-builds.json` (newest first), update affected specs'
   `ptr` writeups if their pass landed, rebuild.

### Community link health (occasional)
Re-render the Wowhead Discord index via r.jina.ai; check creator links via YouTube oEmbed
(`youtube.com/oembed?url=...&format=json`). Flag dead invites for manual review — never
auto-replace.

## Layout

```
data/     specs.json · sources.json · scales.json · ptr-builds.json · community.json ·
          creator-takes.json  (qualitative layer — cited creator takes, never tiers)
src/      build.mjs · template.html · render.mjs · normalize.mjs · validate.mjs ·
          apply-ratings.mjs · apply-metrics.mjs · serve.mjs
test/     normalize · validate · render (fight labels) · build
dist/     index.html  (generated — open directly in a browser)
legacy/   original single-file tracker (pre-conversion reference)
.claude/skills/   refresh-tiers · refresh-metrics · ptr-watch · watch-creators
                  (each has the procedure + hard-won gotchas + a log.md memory)
```

A scheduled routine ("wow-ptr-watch", Wednesdays ~9am, managed in the app's Scheduled
section) runs ptr-watch + watch-creators weekly.
