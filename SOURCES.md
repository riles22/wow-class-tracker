# Source inventory

Every source feeding the tracker, by layer. Machine-readable registry: `data/sources.json`
(+ `data/community.json` for the community layer). The golden rule for all of them:
**fetched live, never from model memory** — Midnight postdates every model's training cutoff.

## 1 · Tier lists → the letter columns + Consensus

Only these tier-list sources feed the consensus (**four** today — the table below is the list; the count is derived on the page, never written down). Scales are normalized via `data/scales.json`. A tier list carrying `era: "ptr"` is a source in every other respect but is **excluded from the consensus** — see the era-gated table below.

| Source | Scale | Lens | Cadence | Notes |
|---|---|---|---|---|
| **Icy Veins** | S/A+/A/B/C | Broad meta, general population | editorial (weeks) | per role × raid/M+ pages |
| **Method** | S/A/B/C | Race-to-world-first output (raid w/ Method raiders; M+ by Tactyks) | editorial | may omit specs (e.g. Vengeance DH) — omitted, never invented |
| **Wowhead** | S/A+/A/B/C/D/F | Class-writer rankings | editorial | per role pages; also the PTR datamining mirror |
| **Archon** | S/A/B/C | Statistical (Warcraft Logs parses / Blizzard leaderboards, 14-day window) | **daily** | raid tiers = *throughput* list, M+ = *score* list; mirrored at u.gg |
| ~~**WoWMeta**~~ | — | **Retyped to a metrics source 2026-07-31** — see layer 2. Its letters were Ckmeans clusters of an undocumented toggle defaulting to PLAYER COUNT (representation, not performance), and its HTML transport served a stale 2026-03-23 prerender. Consensus is now four tier-list sources. | | |

### Era-gated tier lists → their own column, never the consensus

A tier list whose letters describe **12.1**, not the patch we are running. Stored in
`spec.ratings` like any other source, shown as its own column and in the drawer's source
box, and consumed by the 12.1 projection — but never averaged into the 12.0.7 consensus,
and hidden entirely in the 12.0.7-only era view.

| Source | Scale | Lens | Cadence | Notes |
|---|---|---|---|---|
| **Icy Veins (12.1 PTR)** | S+/S/A+/A/B+/B/C (S+ added upstream 2026-08-02) | Forward PTR read — throughput + group-added value (utility, survivability, mobility, sustain) | rebuilt weekly on stream (Sun 14:00 CEST), then published | **M+ only** — no PTR raid list exists, so the raid column is an honest dash. Full 40-spec coverage; specs the authors have not placed are **TBD upstream → stored as explicit `null`**, never guessed. |

Three things about it are load-bearing:

- **Its own scale.** Icy Veins' PTR lists publish a sixth band (**B+**) their live lists do
  not, so `icyveins-ptr` is a separate entry in `scales.json`. Reusing the 5-band
  `icyveins` scale would have silently squashed B+ into a neighbour. Shared tiers keep the
  live anchors exactly, so the same author's live and PTR reads are comparable on the axis.
- **It disagrees with its own live list — hard.** At adoption (2026-07-31) 33 of 40 specs
  sat in a different band than Icy Veins' live 12.0.7 M+ list, including multi-band swings
  in both directions (Marksmanship C→A+, Blood DK C→A+, Guardian S→B+). That divergence is
  the argument for carrying it *and* the argument for never letting it near the consensus.
- **It is the only EXTERNAL 12.1 letter opinion the tracker holds.** Every other PTR signal
  is either raw measurement (zone 54/56, Dummy Dome) or our own computation, so this is the
  one input that can flag a spec the empiricals cannot see yet — a rework whose logs have
  not landed. It enters the projection at the lightest weight for the same reason it is
  valuable: it is one outlet's subjective forward read.

**Gap CLOSED (2026-08-04, docs/published-gate-scope.md):** the refresh contract's
`pages` date probe reads the agent-written `snapshot`, not the page's own `published`
date — and the predicted failure happened in reverse: the nightly kept *claiming* a
stale `published` for four runs while the page had rebuilt (02 Aug "Update #4", missed
for two days). The gate now has two halves: a deterministic pre-agent step
(`src/fetch-published.mjs`) records what each published-bearing page says about itself
and the publish gate fails red the same night a stored `published` contradicts it or
regresses; and the heartbeat alarms once `published` exceeds the contract's
`published.maxAgeDays` (9 for this list — one weekly cycle + slack), which covers the
original "upstream goes quiet while fetches stay green" shape too.

### Not a source: the "Ours: 12.1" projection
The tracker also renders its OWN computed 12.1 forecast (projection lane). It is deliberately absent from this inventory: it fetches nothing, feeds nothing — it derives from the sources above (live consensus + WCL PTR testing + Dummy Dome + the era-gated PTR tier list + outlook + cited meta reads) and is labeled, styled, and era-gated as a projection everywhere it appears. See CLAUDE.md → "Computed at build time."

## 2 · Quantitative metrics → numbers in drawers (never letters)

| Source | What we take | Honest label |
|---|---|---|
| **Warcraft Logs** | Median rDPS/HPS + parse counts (zone 46 raid, 47 M+) | population medians; parses ≈ participation |
| **Archon (numeric layer)** | 95th-pct DPS/HPS, M+ score, popularity % | top-end throughput + representation |
| **Murlok.io** | Avg M+ rating of each spec's top-50 players | "top-50 ceiling" — NOT popularity, NOT a tier |
| **Bloodmallet (SimC, tier MID1)** | Best-build DPS at 1/2/3/5/8/15 targets | powers ST/Cleave/AoE fight profiles (DPS only; Augmentation unsimmable) |
| **SimulationCraft nightly** | Best hero-variant Patchwerk DPS per DPS spec from the engine-official MID1_Raid report (daily) | pure ST, fixed profile — a sim baseline next to Bloodmallet, never a tier |
| **Robydoby PTR raid sheets** (Google Sheets, public CSV) | Per-spec 99th-pct raw DPS + HPS from curated WCL zone-54 testing parses, newest Venomous Abyss week (separate DPS & Healer sheets) | community-curated top-end percentile; DPS + healer specs; **best-effort — deliberately NOT in the refresh contract** (`required-sources.json`), so a volunteer sheet going quiet never reddens a night; **credit Robydoby with a visible link wherever used** (the sheets ask for it) |
| **WoWMeta** | `lowerBound` — the 95% CI lower bound of a spec's MEAN official Blizzard M+ rating across ALL logged players | population-wide MEAN, sample-size-penalised — **not a ceiling** (Murlok is the ceiling) and not popularity. Fetch the JSON API (`data.wowmeta.com`), never the HTML: the page is a stale prerender and its letters cluster on player count. |
| **Mythicstats** | Representation % in the top 2000 keys per weekly period | true meta-share (the axis Murlok's fixed-50 sample can't measure); JS-heavy → r.jina.ai |

Every metric gets a computed within-role **rank** (#n/of) at build time.

## 3 · Per-fight tiers → the Fight selector

**Archon per-encounter pages** — 9 raid bosses (throughput) + 8 dungeons (M+ score),
single-source by design (nobody else publishes per-fight tiers); always labeled Archon
in the UI, no consensus applies. Stored in `data/encounter-tiers.json`.

## 4 · Survivability

**Archon raid survivability tier list** (S/A/B/C per spec) — the roster-cut axis;
shown in each drawer's Source ratings box.

## 5 · 12.1 PTR layer → build feed, outlook, PTR metrics

| Source | Role |
|---|---|
| **Blizzard PTR dev-notes forum thread** (Linxy) | canonical per-build tuning notes; Discourse `.json` machine-readable; ~weekly; **new patch = new thread** |
| **Wowhead news RSS + datamined posts** | discovery (exact pubDates) + mirrors; Wowhead's per-spec 12.1 articles are also the source of the tracker's `ptr` writeups |
| **Icy Veins news** | secondary mirror (dates in slug) |
| **Warcraft Logs zone 54** (The Venomous Abyss) | 12.1 PTR raid-testing scores — tiny n (~3–100), templated gear, tuning in flux; always "(12.1 PTR …)"-labeled, never mixed into live baselines |

## 6 · Community / qualitative → drawers only, never ratings

- **13 class Discords** (index: wowhead.com/discord-servers, verified 2026-07-01):
  Acherus (DK) · The Fel Hammer (DH) · Dreamgrove (Druid) · Wyrmrest Temple (Evoker) ·
  Trueshot Lodge (Hunter) · Altered Time (Mage) · Peak of Serenity (Monk) ·
  Hammer of Wrath (Paladin) · Warcraft Priests (Priest) · Ravenholdt (Rogue) ·
  Earthshrine (Shaman) · Council of the Black Harvest (Warlock) · Skyhold (Warrior).
  **Links only** — Discord content is not fetchable (auth + TOS).
- **Verified creators** (1–2 per class, `data/community.json`) — guide authors and
  theorycrafters with dated Midnight content (Kalamazi, AutomaticJak, Azortharion,
  Tettles/Gamz, Bicepspump, Obli, …). The watch-creators skill pulls their video
  transcripts (yt-dlp) and distills **creator takes** into `data/creator-takes.json`:
  paraphrased, sentiment-tagged, timestamp-linked. Opinion ≠ tier data; 2+ independent
  creators required before calling anything "consensus".
- **General PTR-news creators** (`generalCreators` in `data/community.json` — e.g. izen):
  a cross-class news lane, deliberately NOT specialist take authorities. They feed two
  things: build/tuning **leads** (verified against the official forum before logging) and
  a separate **`metaNotes[]`** lane — per-spec season/meta OUTLOOK reads (which specs look
  strong/weak), cited + dated, rendered as a distinct "Meta outlook" drawer section.
  Validation firewalls it: a `metaNotes` author must be a `generalCreators` entry, so a
  generalist can never lend authority to the specialist `takes[]` / consensus layers.
- **Per-spec authority coverage**: every one of the 40 specs now has at least one named
  creator/authority, live-verified and spec-scoped. ~half are **transcribable** (real
  video/doc channels the pipeline pulls takes from — Reholy, VooDooSaurus, Publik,
  Clandon, Whispyr, LBNinja7, Obli, Kalamazi, …); the rest are **reference** (📖 —
  guide-byline / SimC-dev / Discord-only authorities like Archimtiros, Motoko, Saeldur,
  shown as "who to read" links, not transcribed).
- **Secondary spec-Discords** (`altDiscords`): Death's Advance (Blood DK), Warcraft
  Hunter's Union (Hunter), Focused Will (Priest), Ancestral Guidance (Resto Shaman).
- **Class community sites** (`sites` in community.json, all era-verified 2026-07-01):
  Peak of Serenity (Monk) · Dreamgrove.gg (Druid) · Warcraft Priests sim charts
  (Priest — underlying sim JSON fetchable) · Wings Is Up (Paladin) · Spiritbloom.pro
  (Evoker, also hosts HPal/RSham guides) · Fuu's Simulation Sheet (Rogue).

## 7 · Reference links (no data extracted)

- **Liquid Armory** — SimulationCraft guild-simmed trinket/BiS data. A gearing axis,
  not a spec-strength axis — deliberately not a tier column.
- **Raidbots** — run-your-own-sims tool; no public per-spec aggregates (re-verified).
  Linked as a Tools row in every spec drawer.
- **QE Live** — Voulk's client-side healer gear evaluator. Its public source and
  undocumented shared-report endpoints are inspectable, but the repository has no detected
  reuse license or supported integration contract; no automated ingestion or bundled engine
  is active, and none is planned: the gearing app's separate healer-reference ledger that
  would have consumed it was retired 2026-08-12 with the rest of the gearing sim lane
  (`docs/gearing-s2-scope.md` G5), so this is a reference link only. Its blog also
  publishes dated Midnight healer articles. Voulk himself is a creator entry
  (Wowhead Healing Expert — Prevoker/Resto Druid).
- **u.gg/wow** — mirror of Archon.

## Audited and skipped (re-check later)

- **Mage Hub (mage-hub.com)** — high-quality Mage guides + fetchable sim JSON, but
  frozen at TWW 11.2.0 as of 2026-07-01 (TWW trinkets/dungeons, no Midnight content).
  Re-audit if Toegrinder updates it; the /sims JSON would then be a Mage metrics source.

## Access & etiquette

Policy 2026-07-08: **pull every source fresh on every run** — no staleness gate and no
at-most-daily cap. The retry-with-backoff and inter-request sleeps below are kept purely
as reliability mechanics (so fetches succeed / avoid bot-blocks), not as pull limits.

- **Warcraft Logs**: v2 GraphQL API is **configured and verified** (client credentials
  in the gitignored `.claude/skills/refresh-metrics/config.json`; token grant + zone
  query tested 2026-07-01). HTML statistics tables remain the fallback: XHR headers,
  fetched fresh every run (residential IP; datacenter IPs are Cloudflare-blocked on
  the HTML endpoint). On the nightly runner, API access happens ONLY in the
  deterministic pre-agent fetch step (`src/fetch-wcl.mjs`, 2026-07-14 re-audit) — the
  AI agent holds no WCL credentials and consumes its evidence file instead.
  **"Median raw DPS (12.1 PTR Dummy Dome, NT)"** plus the pooled
  **"…(12.1 PTR Venomous Abyss, pooled)"** (zone 54, Heroic — where testing happens)
  and **"…(12.1 PTR M+ keys, pooled)"** (zone 56) series (added 2026-07-17): per-spec
  medians of each ranked player's best parse in RAW `dps`, computed by the fetch step
  from complete leaderboard pagination (pooled series require EVERY discovered
  boss/dungeon to enumerate fully, else that night contributes nothing — a missing
  encounter would bias the pool). Honesty notes: raw DPS ≠ rDPS (no external-buff
  redistribution — support specs like Augmentation read low by construction, which is
  why these series never substitute for the frozen rDPS/normalized cuts and never feed
  the projection), best-parse-per-player medians ≠ the statistics table's per-parse
  medians, and pooled = one number across all bosses/dungeons. `n` = ranked
  player-encounter entries.
- **Archon / Murlok / Bloodmallet / Blizzard forums / YouTube RSS**: plain fetches every
  run, retry-with-backoff on transient 404s (reliability, not a cap).
- **YouTube transcripts**: two transports, same captions. On the nightly runner the
  deterministic `src/fetch-transcripts.mjs` step (the only holder of the optional
  `TRANSCRIPT_API_KEY`) pulls YouTube's own auto-captions through the Supadata API
  (`mode=native`, 25/run inside the free tier) for videos queued in
  `data/pending-transcripts.json` — datacenter IPs can't reach YouTube directly
  (bot-wall; the android-client workaround failed 2026-07-17). Local/residential runs
  still use yt-dlp with a short sleep between requests. Either way: low volume, store
  summaries + short excerpts with links — never redistribute full transcripts.
