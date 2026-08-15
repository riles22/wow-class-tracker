# Season 2 flip runbook — 2026-08-18

**Status:** WRITTEN 2026-08-11 (launch day), consolidating the verified audit findings and
the owner-approved sequencing. This is the operational checklist for the one-shot flip;
`docs/s2-transition-scope.md` holds the DESIGN decisions and stays authoritative where they
overlap. Everything here was measured against the tree as of commit `2cb40f5` — re-verify
numbers that matter on the day, they move with the data.

## Already done before the flip (do not redo)

- 2026-08-11: Gate 1 unblock (derived freeze test), freeze-season direction fix
  (ahead/split/behind three-way — laggards are never frozen), freeze-marker restore +
  snapshot carry-forward + frozen-date skip (`77bd0a3`, `6166feb`), Gate 0 covers
  `data/forecasts/` (`93bd308`), era-prose mechanism (`83cdf99`), report-card
  composition comparability + probe zone enumeration (`2cb40f5`).
- 2026-08-11 ~22:00 UTC (same day, separate event): the LAUNCH label flip —
  `PHASES.ptr.label` → `"12.1"` + gearing masthead chip. **The 08-18 flip assumes this
  landed.** If it somehow did not, do it first.

## The flip commit — one reviewed owner commit, in this order

0. **Freeze the Season-1 archive** — `node src/freeze-season-archive.mjs --season s1`,
   BEFORE anything touches PHASES (the script refuses any season that is not the tree's
   current liveSeason, so running it after step 1 errors instead of archiving a season
   that never happened). Writes `data/season-archive/s1.json` — append-only, Gate-0
   immutable; the next build emits `dist/s1.html` and the footer "Past seasons" link by
   itself (DECISION 6, s2-transition-scope.md). Commit it with the flip. If a late data
   refresh lands the same week before the flip, redo with `--force` — after the flip it
   is permanent.
1. **`src/normalize.mjs`**: `PHASES.liveSeason` → `"s2"`, `liveLabel` → `"12.1"`
   (the pin `liveLabel === seasonLabels[liveSeason]` holds), `ptr` → `null`, and
   **delete `ptrSunset`** — dead since DECISION 3's amendment (2026-08-12): the
   ptr-null pin IS the sunset now. (normalize.test.mjs:176 pins the field and the
   template boot reads it with a falsy-safe guard; both covered by the pre-staged
   flip-day test patch.)
2. **`src/render.mjs`**: `SNAPSHOT_PHASE` `"12.1-ptr"` → **`"12.1-live"`** (owner decision,
   Riley 2026-08-15 — nothing in the code picks the string, and every post-flip snapshot is
   permanently stamped with it, so it was settled ahead of the day rather than in review.
   Chosen over `"s2"` because the field has always carried the PATCH phase, not the season:
   it parallels the outgoing `"12.1-ptr"`, `report-card.mjs`'s `launchPair` defaults
   `prePhase` to `"12.1-ptr"` so this reads as its successor, and a season can span patches.
   The check-refresh phase gate silences itself on any non-`"12.1-ptr"` value, so the choice
   is mechanically free — but changing it later would split the post-flip snapshot series.)
   Bump **`CONSENSUS_VERSION` 4 → 5** — ⚠️ **not 3 → 4; that bump is SPENT.** Step 3's scale
   widening was applied early, on 2026-08-14, and took v4 with it (see the version log beside
   the constant). The flip is a SECOND, independent recomposition — outlets leave the frozen
   lane and re-enter the live consensus as s2 — so it needs its own boundary. The transition
   plan (s2-transition-scope.md:50) commits to a bump at this point; only the integer moved.
   `pickBaseline` refuses cross-version comparison, so the strip reads "Season 2 baseline
   established" instead of ~40 spurious arrows.
3. ✅ **DONE — LANDED 2026-08-15 in commit `521ceaf`. Do not re-do this step on flip day.**
   It was authored 2026-08-14, held unpushed through two nightlies, then rebased onto master
   and pushed on 08-15. The `CONSENSUS_VERSION` bump it carried is the v4 that step 2 above
   calls SPENT. What remains for flip day is only to confirm `data/scales.json` still shows
   the seven bands. Original instruction, kept for the record:
   **`data/scales.json`** (CODEOWNERS, owner-reviewed): widen `icyveins` to the seven-band
   S2 scale, mirroring the `icyveins-ptr` anchors — S+ 100 / S 92 / A+ 82 / A 66 / B+ 57 /
   B 48 / C 30. Known collateral, measured 08-11: re-spacing S 100→92 moves 3 consensus
   letters + 13 scores through the frozen archive (re-scored via the current scale), and
   silently re-spaces the RAID bracket too — all covered by the version bump; name it in
   the commit message anyway.
4. ✅ **DONE — LANDED 2026-08-15 in the same commit `521ceaf`, and VERIFIED.** This was
   "the riskiest step on the list" precisely because it changes published data with nothing
   testing it; landing it early converted a same-day unverified change into one measured and
   sitting in history. The mandated identity check was re-run after the merge and BROKE as
   intended: `ratings.mplus.icyveins` now differs from the frozen Season-1 record on **34 of
   40** specs (it was 40/40 identical — the never-merged signature), matching the 34 the
   nightly manifest had predicted for seven consecutive nights. The merged letters are
   identical to the captured `icyveins-ptr` list on all **39 placed specs**, with the one TBD
   spec written as an explicit `null`, and S+ / B+ are now in live use.
   On flip day: confirm the identity check still reads 34/40 rather than re-running the merge.
   Original instruction, kept for the record:
   **Re-merge Icy Veins' S2 M+ letters** — a fresh `refresh-tiers` fetch of the three live
   M+ pages on the day (they may have been retuned since).
   **Correction 2026-08-14: the S2 letters WERE preserved.** This step used to say they were
   never captured, which would have made a live fetch the only option. The 08-13 refresh log
   records the live M+ letters as byte-identical to the `icyveins-ptr` list on all 39 placed
   specs, so `ratings.mplus["icyveins-ptr"]` is a verifiable fallback if the fetch cannot land
   — strictly better than the "write all 40 as explicit null" fallback below, which drops M+
   consensus to Wowhead alone. Prefer a fresh fetch, then the preserved letters, then nulls.
   **Why this step is the riskiest one on the list:** it is the only flip step that changes
   PUBLISHED data with nothing verifying it, and the data is already wrong in a way the
   registry hides. Measured 2026-08-14: `spec.ratings.mplus.icyveins` is byte-identical to the
   frozen Season-1 record on **40 of 40** specs, while raid — which was merged — differs on 22
   and Wowhead differs on 19. That 40/40 identity is the never-merged signature. Pre-flip
   those S1 letters already leak into the FORECAST (`ptrTierRead` reads them as a next-patch
   opinion at weight .30; removing them moves 30 of 40 M+ projection scores and two published
   letters), and Subtlety Rogue M+ takes them undiluted because its `icyveins-ptr` value is
   null. Post-flip the same letters become roughly half of every S2 M+ consensus cell.
   **So verify the merge landed** — re-run the 40/40 identity check afterwards and expect it
   to break — rather than assuming a green `npm test` covered it. Nothing tests this.
   TBD specs are explicit `null`, never omitted (the `icyveins-ptr` convention). Fallback
   if the fetch cannot land: write all 40 as explicit `null` — post-flip M+ consensus is
   then Wowhead alone, disclosed by the count chip. NEVER: collapse S+ into S (refused as
   fabrication — grep refresh-tiers/log.md for "Collapsing S+ into S was refused"; this
   cited a line NUMBER until 2026-08-15, which the log prune would have silently broken),
   revert `seasonVerified` (a lie, and corrupts
   `aheadSeasonFor`), or hold the flip (the check-refresh gate reds past 08-20 and a missed
   report-card boundary is unrecoverable).
5. **Retire `icyveins-ptr` from the forecast** (B3): stop it feeding
   `nextPatchTierSources` — post-flip it would be the ONLY next-patch source on 39 M+
   cells while describing the season we are running, and Icy Veins has already promoted the
   PTR list onto its live URLs (19/27 identical). Note `nextPatchTierSources` keys on
   `era`, not `PHASES.ptr`, so the flip alone does NOT retire it — this step is still
   real work. The COLUMN needs no keeping: per DECISION 3 as amended (2026-08-12) it
   leaves the UI at the flip with the rest of the PTR receipts. Retire = era/registry
   change that removes it from the forecast term.
   **MECHANISM DECIDED (owner, Riley 2026-08-15): remove the `icyveins-ptr` entry from
   `data/sources.json` entirely.** Not a retype. The "retype to live" path stays ruled out
   (it would hand Icy Veins 2 of 3 consensus votes), and keeping it as a `reference` footer
   link was considered and declined. Removal costs nothing verifiable: as of 2026-08-15 its
   letters are identical to the now-merged live M+ list on all 39 placed specs, so the source
   carries no information the live registry does not already hold. This choice fixes the
   shape of the paired work below — the three red tests are handled as "retire with the
   source" (RED #2) and "synthesize an `era:"ptr"` fixture rather than name a live registry
   id" (RED #3), and the `icyveins-ptr` requirement block comes out of
   `data/required-sources.json` in the same commit.

   ### ⚠ THE PAIRED `specs.json` EDIT — mandatory, and it was missing until 2026-08-15
   **Also strip `ratings.mplus["icyveins-ptr"]` from all 40 specs in `data/specs.json`, in the
   same commit.** Removing the registry entry without this leaves 40 orphan ratings, and
   `validateData` rejects a rating whose source is not in the registry:
   ```
   specs.json: Death Knight / Blood mplus rating from unknown source "icyveins-ptr"   … ×40
   ```
   That is **40 errors, not 3** — `npm run validate`, `npm test` and `npm run build` all fail,
   i.e. the flip commit cannot be verified at all until the pairing is done. Measured on a
   byte-copy of the tree, 2026-08-15, executing this step exactly as it was written.
   The values are safe to delete: they are identical to the merged live M+ letters on all 39
   placed specs (the same fact this step's mechanism decision rests on), so nothing is lost —
   and the frozen forecast artifact keeps its own copy of what the forecast read at freeze
   time, independently of the registry.
   **Why the earlier dry run missed it:** the 2026-08-14 simulation stripped these ratings as
   part of the same script that removed the registry entry, and only the registry half was
   written back into this runbook. The simulation was green for a step the runbook could not
   actually execute — a reminder that a dry run only validates the procedure it wrote down.

   **⚠ FIVE TESTS RED AT THE FLIP STATE — three from this step, two from elsewhere — AND THE
   PRE-STAGED PATCH COVERS NONE OF THEM.** Re-measured 2026-08-15 **with Playwright resolved**;
   the 08-14 and earlier 08-15 runs said "three" because they ran in a copy with no
   `node_modules`, so all 25 UI invariants SKIPPED and two of the five were invisible. To
   simulate honestly you must junction the real `node_modules` into the copy —
   `New-Item -ItemType Junction` — and remove it afterwards with
   `[System.IO.Directory]::Delete(link, false)`, never `rm -rf`, which follows the junction
   and would take the real tree with it. The two extra reds are listed after the three below.
   Measured in a full local dry run, 2026-08-14 — the flip patch handles the PHASES/era
   changes but nothing in it touches the registry RETIREMENT, so `npm test` inside the flip
   commit lands 3 red even with the patch applied. All three are working as intended; they
   are tripwires, and the flip-day action is to update each in the same reviewed commit:
   - `test/fetch-published.test.mjs` → "the repo's real contract yields exactly the
     published-gated pages as evidence targets" pins the literal map
     `{ icyveins: 6, "icyveins-ptr": 3, wowhead: 6 }`. Drop the middle entry. This pin is
     deliberate ("so a published block appearing or vanishing is always a deliberate,
     reviewed change") — it is doing its job, not failing.
   - `test/validate.test.mjs` → "the PTR tier list is registered as era-gated and M+ only"
     asserts `icyveins-ptr` is in the registry. Retire the test with the source, or rewrite
     it to derive ("any era:ptr tier list must be M+ only") so it re-arms next cycle.
   - `test/validate.test.mjs` → "validateData gates the frozen final-season archive" uses
     `icyveins-ptr` as its era:"ptr" subject and then asserts the error mentions `era:"ptr"`;
     with the source gone the error becomes "is not a tier-list source" instead. Synthesize
     an era:"ptr" source in the copy rather than naming a live registry id — the same
     derive-don't-pin lesson `f02caec` applied to four other fixtures.
   Step 7's requirement removals also feed the first of these, so do both before re-running.

   **RED #4 — `test/ui-invariants.test.mjs` → "an era-gated PTR tier list shows its own 12.1
   letters and is unreachable in the 12.0.7 view".** Also caused by this step: with
   `icyveins-ptr` gone there is no era-gated list for it to drive. Retire it with the source,
   or rewrite it to derive its subject (skip when no `era:"ptr"` tier list exists) so it
   re-arms for the 12.2 cycle. Invisible to any simulation run without Playwright.

   **RED #5 — `test/ui-invariants.test.mjs` → "the What-changed strip agrees with the arrows
   the grid actually draws", and it is STEP 2's `CONSENSUS_VERSION` bump that causes it.**
   Isolated by differential measurement at the flip state: with `CONSENSUS_VERSION = 5` the
   test reds on `sanity: at least one lane must have movement to narrate`; revert that single
   integer to 4 and it passes with nothing else changed. The bump is correct and must still
   happen — `pickBaseline` refusing cross-version comparison is exactly the point — but it
   suppresses every consensus arrow, and post-flip there is no projection lane either, so the
   strip has nothing to narrate and its sanity assertion fails.
   **And the message the bump is supposed to produce does not exist.** Step 2 above,
   `src/render.mjs:1855` and `docs/s2-transition-scope.md:95` all promise the strip will read
   *"Season 2 baseline established"*. That string is nowhere in `src/template.html`:
   `renderChanges()` hides the strip outright when every lane is empty
   (`if(!moves.length && !dummyMoves.length && !fresh){ host.hidden = true; … }`). So on flip
   day the strip silently disappears rather than explaining itself, on the one day a reader
   most needs the explanation. Two options, owner's call — build the message (a few lines in
   `renderChanges`, and then the invariant needs to accept it) or correct the three documents
   that promise it and let the strip hide. Either way this test needs a flip-day edit.
6. **Era prose residue**: with `ptr: null` the Era toggle hides (template boot, ~:1240) and
   the era tokens derive from `liveLabel` automatically. The remaining hand strings that
   still say "12.0.7" in JS tooltips (template ~:1740/:1763/:1787/:1791/:3166) read
   `PHASE.liveLabel` where interpolated; the ones left literal are all
   still-true-as-provenance — sweep the built page for "12.0.7" and judge each hit: a
   PROVENANCE claim ("Archon Season-1 (12.0.7) data") stays until the underlying data
   moves; a LIVENESS claim must not survive.
7. **`src/check-refresh.mjs` / `data/required-sources.json`** (CODEOWNERS): the WCL
   contract swap — re-point `wcl-live-raid`/`wcl-live-mplus` to the S2 zone ids and REMOVE
   the six PTR-era WCL rows (per the transition scope: removed, not skipped).
   ### ✅ THE IDS ARE KNOWN — enumerated live 2026-08-14

   | | zone | name | partition | difficulty / size | encounters |
   |---|---|---|---|---|---|
   | **S2 raid → `wcl-live-raid`** | **53** | The Venomous Abyss | **1 = "12.1"** | Mythic **5** / size **20** | **9** |
   | **S2 M+ → `wcl-live-mplus`** | **55** | Mythic+ Season 2 | **1 = "Season 2"** | Dungeon **10** / size **5** | 8 |

   Both read `frozen` today — they hold no data until the content opens (raid 08-18 US /
   08-19 EU), so re-run the probe on the day to confirm they have populated before trusting
   a fetch. Four traps, all measured rather than assumed:

   - **Live and PTR zones share a NAME.** 53 and 54 are both "The Venomous Abyss"; 55 and 56
     are both "Mythic+ Season 2". Tell them apart by the PARTITION LABEL (`12.1` / `Season 2`
     vs `PTR`) and the encounter count — **53 has 9 encounters, the PTR zone 54 has 8**. Never
     by the id pattern.
   - **Both live zones use partition id `1`.** CLAUDE.md's live-raid model ("partition 3 =
     12.0.7") does not transfer — the ids restart per zone and only the LABEL is meaningful.
   - **Zone 46's default partition has already moved to `4 = "12.1"`** (partitions are
     `1=12.0 2=12.0.5 3=12.0.7 4=12.1*`). Any zone-46 fetch that OMITS the partition now
     returns 12.1 data under a 12.0.7 label. The stored recipes pin partition 3, so this is
     correct today — but it is one omitted parameter away from a silent honesty break, and it
     is why the probe now prints which partition is default.
   - **Zone 57 (The Tidebound Grotto) has 0 encounters**, confirming the standing 07-28
     finding that WCL never aggregated it. Nothing to ingest, still.

   **Zone 50 "Sporefall"** — the open question this step used to carry — is a real, live,
   single-boss Midnight raid (encounter "Rotmire", partitions `1=12.0.7 2=12.1*`). Leaving a
   one-boss raid untracked is a scope decision, not an oversight; no action.

   ⚠️ **The probe had TWO bugs, both fixed 2026-08-14, and both invisible until it was
   actually run** — this line previously claimed the enumeration was "validated against the
   live API", which it cannot have been. (a) It read `zq.data` where `gql()` resolves to
   `{ status, json, textHead }`, so `zones` was always `[]` and it printed "0 total … (none
   matched)" every run. (b) Even fixed, the flat `worldData.zones` query is INCOMPLETE — it
   returns 42 zones where `worldData.expansions { zones }` returns 66, and the 24 it omits
   include **zones 53 and 55, precisely the two ids this step exists to find**. Fixing only
   (a) would have made the probe look healthy on flip day while still missing the answer.

   **Also observed on 08-14, and it affects how you fetch:** the WCL HTML statistics-table
   endpoints now return **HTTP 403 with a Cloudflare challenge from a residential IP too** —
   not just from CI. The GraphQL API is healthy (OAuth fine, 3600 points/hour). The
   `rdps`/`ndps` family still returns a bare "Internal server error" on every encounter,
   live and PTR alike, while `dps`/`default` work; `default` remains byte-identical to `dps`
   and is still not an rdps substitute. As of 08-11 NO S2 zones exist upstream; zone 50
   "Sporefall" appeared in the Midnight list and is untracked — check what it is while
   there. Note the rdps family is still 500 upstream; re-pointing restores the CONTRACT,
   not necessarily data.
8. **Sim lane (C4)**: when Bloodmallet/SimC publish S2 sims, accept tier `MID2` and
   re-point the SimC report URL — **verify the `MID2_Raid.html` URL live, never assume it
   from the MID1 pattern**. Six places hardcode MID1 (refresh-metrics/SKILL.md:135,164;
   sources.json:388,402,486,497; required-sources.json:388; SOURCES.md:67-68). MID1 and
   MID2 sims are not comparable — whether `fightProfile` gets a `tier` field marking the
   basis change is an open owner call.
9. **Verify like a local run**: `node src/freeze-season.mjs` (expect: icyveins/wowhead
   **and now method** report LIVE again — method rebuilt for S2 on 2026-08-14, after this
   runbook was written, so only **archon** reports BEHIND and is NOT frozen; the s2 archive
   stays empty until an outlet leaves s2), `npm test && npm run build`,
   check-refresh `--manifest` informational, snapshot, rebuild, push.

   **Dry-run results, 2026-08-14** (full local simulation of steps 0-7 + the flip patch,
   against a throwaway clone — re-run it on the day, the numbers move with the data):
   - Step 0 froze 80 rated cells across 2 brackets; the next build emitted `dist/s1.html`
     and the footer "Past seasons" link with no further action. ✅
   - Steps 1-3 applied cleanly; `PHASES` came out
     `{liveSeason:"s2", liveLabel:"12.1", ptr:null}` with `ptrSunset` gone. ✅
   - Step 4 via the preserved `icyveins-ptr` letters moved **33 of 40** M+ letters
     (1 explicit null carried through). ✅
   - Step 5 as a full registry removal passes `validate` but reds
     `check-refresh --age` with two failures, because `required-sources.json` still carries
     an `icyveins-ptr` requirement. **The paired edit is mandatory and was not written down
     anywhere** — drop that requirement in the same commit. After the pairing, `--age` is
     back to its single known bloodmallet red.
   - Steps 5+7 red three tests the flip patch does not cover — see the ⚠ under step 5.
   - `freeze-season` behaved exactly as this step predicts, and the build was clean.
   With the three known reds updated, the flip state is green.

   **Re-run 2026-08-15, and it corrected the run above.** Executing step 5 *as this document
   worded it* — registry only — produced **40 validation errors**, not three reds: the orphan
   `ratings.mplus["icyveins-ptr"]` keys. The 08-14 run had silently done the paired
   `specs.json` edit inside its own script without writing it down, so it validated a
   procedure the runbook did not contain. Step 5 now carries that edit explicitly.
   With the pairing applied, the flip state reds exactly the three predicted tests and
   nothing else — re-measured 2026-08-15 after two further guards landed:
   `test/claude-md.test.mjs`'s take-coverage assertion and the `ui-invariants` era-gate
   invariant both read the take lane or the Era toggle, so both now return early when
   `PHASES.ptr` is null, the same idiom the pre-staged patch uses throughout. Before those
   guards the flip state red **six**, not three.
   Method: byte-copy the tree with `tar` into a SHORT temp path — never `git clone`, which
   truncates on Windows MAX_PATH in `gearing/data/simc-audit/**` and yields a tree that looks
   complete and fails tests for unrelated reasons.

   **A Windows gotcha, since this flip is a LOCAL run:** `git clone` of this repo fails
   with "Filename too long" on the `gearing/data/simc-audit/**` paths unless
   `git config --global core.longpaths true` is set. A partial clone looks like a working
   tree and silently fails tests, which cost one wrong measurement during the dry run. If
   you clone anything on the day, check `git status` is clean before trusting a result.

## Timing: land the flip commit clear of the nightly window

⚠️ **Added 2026-08-14 after hitting it.** Publish checks out current master and then overlays
the refresh artifact's `data/` on top. Push a change to a Gate-0 immutable file
(`scales.json` and `required-sources.json` are both in the flip commit) after the refresh job
captured its artifact but before publish runs, and publish restores the artifact's older copy
over yours, diffs it against HEAD, and **fails the night red** — the agent did nothing wrong
and neither did you. The gate cannot distinguish "the agent edited this" from "master moved
under the artifact", and failing closed is correct for that file set.

The nightly starts **10:37 UTC** and publish lands roughly **60–100 minutes** later, so avoid
~10:30–12:30 UTC. Run `gh run list --limit 3` first; if one is `in_progress`, hold the commit
locally — a local commit is free, only the push races. Nothing is corrupted if you get it
wrong: re-run the nightly and it recomputes against your commit. The cost is a wasted agent
run. (Same note now lives in the local-run skill, which is where a non-flip run will look.)

## How to run the flip night — NOT a scheduled run

Gate 3 measures ~31 moves against `maxTotalMoves` 25 on today's data (re-measure on the
day — it moves if method/archon flip their pages first), and a **scheduled** run can never
carry an anomaly ack. Worse, publish snapshots only after Gate 3, so the baseline never
advances and every subsequent night fails identically — a stuck pipeline.
**Chosen (Riley, 2026-08-12): LOCAL RUN** — the flip commit + step-9 verification happen
here and are pushed directly; no anomaly-ack plumbing. (The dispatch alternative —
`workflow_dispatch` with `anomaly_ack: "S2 transition: liveSeason flipped 2026-08-18"`,
shape pinned by test/check-refresh.test.mjs:499 — remains the documented fallback.) Expect the REFRESH job's completion gate to red on a
flip night regardless (the frozen lane that neutralizes movement is publish-side) — noise,
not a data problem; the refresh agents escalated correctly through the 08-11 flip.

## Still to BUILD before 08-18 (not flip-day work)

- ✅ **B6 — the frozen-forecast render path** — BUILT 2026-08-12, adversarially reviewed
  (13 findings, all folded in or recorded below). Loader in loadData, substitution in
  buildPayload (`frozenForecastActive`: inert while phases match, active in the grading
  window, stands down when a 12.2 PTR cycle opens), `projAvailable()` un-gates the
  projection surfaces under `META.frozenForecast`, every visible surface names the record
  (viewnote, drawer, qualifier, movers, data-health), validateData red-flags a wrong-shape
  artifact, digest.mjs diffs the same lane the page renders, snapshots stamp the
  artifact's projectionVersion while frozen. Covered by a doctored-payload Playwright
  invariant. The grade chip still waits for settlement (~09-01).

- ✅ **DECIDED 2026-08-12 — option (b), the sunset happens AT the flip** (Riley, choosing
  against the recommended (a); recorded as DECISION 3's amendment in
  s2-transition-scope.md). No template pass; `ptrSunset` is deleted in the flip commit
  (step 1); the receipts live on in the drawer's frozen basis strings and the immutable
  artifact. The original collision write-up is preserved in git history if the trade
  ever needs re-examining.

- ✅ **S1 ARCHIVE MACHINERY — BUILT 2026-08-12** (DECISION 6, s2-transition-scope.md):
  `src/freeze-season-archive.mjs` (one-shot freeze → `data/season-archive/s1.json`,
  refuses non-current seasons and overwrites), `src/render-season-archive.mjs` +
  `season-archive-template.html` (script-free static page, own `default-src 'none'`
  CSP), build.mjs emits `dist/<season>.html` + the footer "Past seasons" link only when
  a record exists, serve.mjs allowlists `s1.html`, the injection invariant's pinned
  href regex admits exactly `s1.html`, covered by test/season-archive.test.mjs
  (escape/CSP/allowlist, freeze-equals-published-consensus, append-only refusal, build
  wiring). Flip-day duty is step 0 above only.

- ✅ **Flip-day TEST PATCH — PRE-STAGED 2026-08-12** (`docs/s2-flip-test-patch.diff`;
  verification log `docs/s2-flip-test-patch-verify.md`). Simulated at the exact flip
  state (liveSeason "s2" · ptr null · `ptrSunset` deleted · SNAPSHOT_PHASE "12.1-live" ·
  CONSENSUS_VERSION 4) the suite reds 30 tests across the six expected files
  (render 19 · ui-invariants 7 — three more than predicted, same two root causes ·
  build/check-refresh/normalize/validate 1 each). With the patch: **382 pass / 0 fail /
  0 skipped** at the flip state, re-verified against HEAD after the season-archive lane
  landed. Applied to the CURRENT tree it reds exactly the 2 deliberate flip-only pins
  (normalize.test's PHASES vocabulary; check-refresh's age-gate) — every other change is
  both-state-safe (fixtures derive their era markers from PHASES, so the 12.2 cycle
  re-arms automatically), which is what keeps the pins making the flip deliberate.
  Flip-day usage: `git apply docs/s2-flip-test-patch.diff` inside the flip commit; step
  9's `npm test` then lands green.
- ✅ **nightly.yml prompt softening — PREPARED 2026-08-12** (chosen with the Dependabot
  bundle): BOTH agent prompts (the primary's COMPLETION CONTRACT and the recovery's
  "do not finish until" line) now carry the same one-exception rule — a mass-movement
  gate failure the agent did not cause is recorded in `anomalyAckProposal` and the agent
  finishes honestly; buying a green gate by editing observations (the `seasonVerified`
  revert) is named and forbidden. Same edit adds `data/season-archive/` to Gate 0's
  immutable set. Lands together with Dependabot #54 in ONE push so the auto-kicked
  nightly is spent once (merge #54 into the local branch carrying the prompt edit, push
  both as one).
- **Dependabot #54** (claude-code-action bump): safe to merge since `77bd0a3`; merge
  WITH the prompt-line edit above per the one-kick plan.

## 12.2-cycle note (review finding #7 — record it now, act at the next cycle)

A missed 12.2 `--frozen` would silently re-activate the stale 12.1 artifact as the
rendered forecast the moment the 12.2 flip lands. The lane's stand-down (`!PHASES.ptr`)
covers the window while a 12.2 PTR cycle is OPEN, not the gap after the 12.2 flip if no
new freeze was declared. A staleness guard is the durable fix, but the obvious predicate
("artifact must not predate the newest snapshot of its own phase") is WRONG — DECISION 5
freezes days before the flip while nightlies keep writing same-phase snapshots, so it
would refuse the legitimate 08-18 activation. A working variant needs the artifact's phase
to equal the phase of the newest snapshot whose phase differs from the current one — build
it with the 12.2 transition scope, not now.

## After settlement (~09-01, +14 days; second checkpoint +28)

- First real `npm run report-card` grade. Composition comparability landed (`2cb40f5`);
  remaining ergonomics: an artifact loader for the grade side (part of B6), a
  `--settle-days 28` flag (reachable today via `--settled <date>`), a markdown writer.
- ~~DECISION 3's +14 PTR-surface sunset~~ — no longer a +14 action: the sunset happened
  AT the flip (DECISION 3 amended 2026-08-12) and `ptrSunset` no longer exists.
- Gearing re-harvest (C5): a reviewed code+data task, NOT a date edit — harvests are
  PTR-pinned in code (harvest-*.mjs, lib-wowhead.mjs) and gearing's validator pins the PTR
  URLs + item-count fingerprints, so a live re-harvest fails until the pins are
  re-reviewed. Check the stat-priority guide pages' own season state at the source first.
  Soft window opens 08-18/19.
  **SCOPED 2026-08-12 — see `docs/gearing-s2-scope.md`.** The re-harvest is now Phase E of
  a four-decision overhaul, and Phase A (removing the SimC reference pipeline) is what
  UN-PINS the six gear data files whose SHA-256 hashes currently make any re-harvest fail
  the gearing build. Nothing gearing-side lands before the flip: gearing's tests run under
  the root `npm test`, so a broken gearing breaks the nightly publish gate.

## Deliberately left alone (checked 08-11, do not re-open without new evidence)

Bloodmallet `maxAgeDays` 5 (the red IS the signal — owner decision in `edc63942`);
`published` threshold retightening (deferred ~09-01; tierListHealth already flags at 14d);
a Method `published` block (needs a deliberate number first — it self-dates 133d);
ci.yml-on-nightly-commits gap (narrow: publish+deploy both run npm test; exposure is the
23 UI invariants for 2.6-4.4h); skill-log pruning and payload slimming (C7, competes with
launch week); the seven measured dead ends listed in CLAUDE.md.
