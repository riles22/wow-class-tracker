# ADR: Curated same-gear SimC profiles

- Status: SUPERSEDED 2026-08-12 by `gearing-s2-scope.md` DECISION G3 — the curated-profile pipeline was removed from `gearing/` in Phase A. HISTORY: the body below is left byte-untouched on purpose (label externally, do not excise), because it holds the reproducibility record and the 2026-08-05 trinket-conditioning audit disclosure.
- Date: 2026-08-04
- Scope: `gearing/` conventional DPS reference weights

## Context

The official SimulationCraft MID2 generators do not yet provide current, runnable Season 2
outputs for every conventional DPS specialization. Some actors are commented out with
Season 1 gear, some talent imports no longer initialize on the 12.1 PTR database, and some
variant actors use different gear. Publishing those drafts directly would make their scale
factors incomparable and would miss the Season 2 Catalyst rule that converted tier keeps the
base item's secondary allocation.

The gearing explorer still needs useful general-reference coefficients before every upstream
profile is finished. Those coefficients must remain visibly distinct from untouched official
generator outputs and reproducible from retained inputs and reports.

## Decision

Admit conventional DPS profiles through either of two explicit provenance modes:

- `official-output` means the retained profile was materialized from a pinned official
  MID2 actor without changing its gear or talent import.
- `curated-same-gear` means the pinned official actor and SimulationCraft default APL are the
  simulation seed, while reviewed gear and, when required, the talent import are replaced.
  The app and evidence ledger must display this mode rather than calling it an official
  profile.

A curated profile is admissible only when all of these conditions hold:

- Gear uses real Midnight Season 2 item IDs from the repository's dated raid, dungeon, tier,
  and Catalyst snapshots. The deterministic gear policy equips four tier slots and evaluates
  each converted tier piece with `redirected_base_stats` from its actual eligible base item;
  it does not assume that the direct tier item's secondary allocation is retained.
- Every candidate for the same logical profile and scenario uses byte-equivalent non-talent
  setup: race, consumables, gear, item levels, enchants, and modeled tertiaries. Tertiaries
  are retained from the selected item or Catalyst allocation source and are declared present
  only when a positive Avoidance, Leech, or Speed rating exists.
- Each logical profile pins one enhancement-source candidate and its exact normalized-slot
  permanent `gem_id` and `enchant`/`enchant_id` map, including hand-specific weapon
  enhancements. The curator re-extracts that map from the SHA-pinned generator actor and
  transfers it unchanged to every candidate's deterministic gear shell; the source identity
  and map participate in the gear-plan hash.
- Every local MID2 generator sidecar is authenticated by a commit-specific SHA-256 before
  actor extraction. Curated runtime actor names are unique, while the original upstream actor
  name and generator hash remain separately pinned in the manifest and retained profile.
- A talent import comes from the exact pinned MID2 actor when it initializes. A replacement
  import must cite a dated 12.1 PTR build source, identify the replaced official actor, and
  pass the pinned PTR/local-database runtime before it can be selected.
- When more than one actor or talent candidate is available, each is retained and compared
  with the same 5,000-iteration, two-thread Patchwerk contract at one and five targets. The
  unique highest-DPS candidate supplies that scenario's profile input.
- Published coefficients still require two independent normalized scale-factor runs of at
  least 25,000 requested iterations, all four secondaries, and no more than five percent
  relative run drift. A noisy pair may be rerun at a higher, record-pinned iteration count;
  the repeatability threshold is not relaxed.

The catalog also pins every candidate's exact talent import and each logical profile's expected
gear-plan SHA-256. The manifest pins the provenance mode, curation policy, gear-data and
generator hashes, gear plan hash, talent source, retained actor, and upstream source actor.
Those fields participate in job fingerprints and are copied to the result ledger. Corrected
campaigns use a new policy ID plus new profile and selection artifact names so append-only
audit evidence cannot collide with an earlier review.

Production admission uses `midnight-s2-raid-catalyst-v2`. It supersedes the earlier
unenhanced v1 review with disjoint profile filenames and selection-report IDs; the withdrawn
v1 artifacts are not accepted production evidence. The v2 campaign contains 26 logical
profiles, 44 reviewed candidate actor/APL pins, and 72 retained selection reports.

Tanks, healers, and Augmentation are not admitted by this decision. Their objectives remain
separate from personal-DPS scale factors.

## Options considered

1. Wait for every official MID2 output. Rejected because it leaves most of the app on coarse
   guide-order fallbacks despite having a reproducible local simulation path.
2. Run the commented profiles unchanged. Rejected because Season 1 gear, invalid talents,
   and mismatched variant equipment would produce misleading Season 2 comparisons.
3. Curate same-gear Season 2 profiles with explicit provenance. Chosen because it models the
   Catalyst rule, permits fair variant selection, and preserves the boundary between upstream
   material and local review decisions.
4. Invent one universal stat distribution for every spec. Rejected because armor, weapon,
   tier, and local-stat interactions are specialization-specific.

## Trade-offs

- The results are stronger than ordinal guide priorities but remain reference-character
  derivatives, not personal character or full item-combination simulations.
- Dated guide talent imports add a second upstream source when SimC's import is stale. That
  improves runtime validity but requires prominent source and patch labels.
- Deterministic same-gear profiles make hero-tree comparisons fair, while their chosen
  baseline gear still influences the local scale factors.
- Retaining every candidate and report increases repository size and batch runtime.

## Consequences

- Curated records can be refreshed independently when gear snapshots, talent imports, or the
  pinned SimC build changes; any such change invalidates the prior job fingerprint.
- The offline UI can state whether a coefficient came from an official generator profile or
  a curated same-gear profile and can link the exact talent and generator provenance.
- Catalyst conversions are represented explicitly per tier slot, so converted bases can beat
  direct tier secondary allocations without losing the required set bonus.
- A spec remains pending when no current talent import or legal Season 2 equipment shell can
  pass the pinned runtime; the pipeline does not substitute an empty talent tree.

## Implementation status

Completed on 2026-08-04: provenance and schema support, deterministic curation, candidate
selection, v2 admission, Unholy official evidence, all repeated scale-factor runs, offline
artifact rebuild, and repository verification. The accepted matrix contains 30 profiles and
60 records covering all 26 conventional DPS specs: 4 official profiles with 8 records and
26 curated profiles with 52 records. 13 tank and healer specs remain deferred, and
Augmentation remains the 1 unsupported spec. Future work is refresh maintenance plus
separately designed tank and healer objectives.

## Trinket conditioning of the published scale factors (disclosed 2026-08-05, audit)

Curated actors do not sim in a trinket vacuum: the curation policy pins **two fixed,
effect-bearing trinkets per primary stat** on every curated actor
(`trinketIdsByPrimary`, gearing/data/simc-curation-catalog.json — Strength: 270163
Sszorak's Ferocity + 270175 Voracious Heart of Ula'tek; Agility: 270166 Vashnik's
Sanguine Rancor + 270173 Zul'jin's Guillotine Technique; Intellect: 270161 Fang of
Umbral Malignance + 270170 Vexhul's Everflowing Gland). All six carry damage procs or
on-use effects that the APLs actively use, so the published secondary scale factors are
**conditioned on those active trinket effects** — they measure how secondaries trade
around that fixed baseline, not in isolation from trinket behavior. This is deliberate
(a realistic actor needs realistic trinkets, and pinning them keeps the baseline
constant across specs sharing a primary) but it was previously discoverable only by
gunzipping the profile artifacts, which is not a disclosure. Two consequences worth
stating plainly:

- The scale factors remain valid as *within-actor secondary comparisons*; they say
  nothing about the pinned trinkets' own value, and nothing on the page ranks trinkets
  with them (the trinket surfaces are explicitly unranked).
- If the pinned trinkets change in a future curation round, the factors recompute under
  a different conditioning — treat the pin as part of the recipe, and record any change
  here alongside the catalog edit.
