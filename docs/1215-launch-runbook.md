# 12.1.5 launch runbook

**Status:** written 2026-09-26 (UTC), before Blizzard announced the 12.1.5 US release date.
This is a working checklist. Tick items off in your own copy; do not edit history into it.
It covers three changes inside Season 2: the displayed patch label, the official-notes lane
and the WCL raid partition. Nothing here moves `liveSeason`, `liveLabel` "12.1",
`seasonLabels`, `liveSince`, `SNAPSHOT_PHASE`, `LIVE_LEADERBOARDS.label`, the frozen 12.1
forecast or the report card. 12.1.5 is a mid-season patch, not a forecast cycle:
`PHASES.ptr` stays null.

Every command is Windows PowerShell 5.1. It has no `&&`, so run one line at a time and stop
at the first red. Run everything from a worktree, never from a checkout with unpushed work.

## Owner decisions this runbook applies (2026-09-26, do not re-ask)

- The chip reads 12.1.5 through `PHASES.livePatch = { label: "12.1.5", since: "<US release date>" }`.
  Nothing else in `PHASES` moves.
- `LABEL_FLIP_DUE` (src/normalize.mjs) is a separate owner edit, made when Blizzard
  announces the date. It is not in the launch branch.
- The WCL raid switch waits for Mythic Kith'ix ("Kith'ix just has to exist"). The trigger
  is in Phase C2. Kith'ix cuts under 10 entries stay absent.
- Bloodmallet is adopted wholesale only when every stored chart timestamp is on or after
  `PHASES.livePatch.since`.
- The Venomstone estimate label comes off only once verified live numbers exist (Phase C3).
- #80 is merged. #81 (claude/1215-feed-realm) merges after a nightly, before launch.

## What is staged, and where

| Thing | Where | State |
| --- | --- | --- |
| This runbook | branch `claude/1215-runbook` | docs only plus a CLAUDE.md pointer; merge it any time, before the launch branch |
| Launch code, tests, prose | branch `claude/1215-launch`, 5 commits on top of `c80a9f7` (the #81 head) | not mergeable alone, see below |
| Launch data edits | nowhere | hand-applied on launch morning (B4) |

The five launch commits, oldest first:

1. `05bf480` official-note consumers take an injectable source list (tests can exercise a
   retired lane without re-adding it to the real config).
2. `cf3aa65` retire the `ptr-preview` official-notes source (config row, tests, digest).
3. `1255057` set `PHASES.livePatch` to 12.1.5 with a FIXTURE `since` of `2099-01-01`;
   gearing chip hand-edited to 12.1.5 and its artifact rebuilt.
4. `6038c2e` nightly PRIMARY and RECOVERY prompts: log live 12.1.5 notes and hotfixes with
   realm live; also corrects the `maxRunAgeHours` comment to 26.
5. `1e6f419` prose: CLAUDE.md "12.1.5 is live" note, ptr-watch and local-run skills,
   SOURCES.md section 5, regenerated `.agents` adapter.

**On the branch alone, 26 tests fail and `npm run build` and `npm run validate` fail with
`official-notes.json: unknown source ptr-preview`.** That is by design: the committed
ledger and `data/required-sources.json` still name the retired source until B4. 25 of the
26 reds are that one data error seen through different tests; the 26th is the new contract
pin (`12.1.5 launch: the live compilation is the only configured source and the refresh
contract names exactly it`). With the B4 edits applied: 699 pass, 0 fail, 1 skip (the
standing freeze-season skip), and build, gearing:build and validate are green.

`2099-01-01` is a placeholder, not a release date. It appears in `src/normalize.mjs`,
`test/normalize.test.mjs` and `CLAUDE.md` (lines 17 and 388 on the branch). Nothing fails
if it ships: the label-flip gate is silent once the chip reads 12.1.5. But the Bloodmallet
hold and the creator-take framing read `since`, and would wait for 2099. B5 replaces it.

## Push rule (every merge or push to master, including this runbook)

1. Both lists must be empty:

   ```powershell
   gh run list --workflow nightly.yml --status in_progress
   gh run list --workflow nightly.yml --status queued
   ```

2. The previous master commit's runs must be finished, in this order: nightly publish, the
   deploy it dispatches (about 2 min), then the Tests run it dispatches (about 8 min).

   ```powershell
   gh run list --limit 8 --json databaseId,workflowName,status,headSha
   ```

3. Merge with the tested head only:
   `gh pr merge <N> --squash --match-head-commit <sha>`.

Why: a push during publish makes the nightly's own push rejected, and the night goes red
(publish does not rebase, by design). The refresh-base guard also rejects a nightly whose
base is older than a newer `data/` edit. A master push cancels the nightly commit's queued
deploy and its in-progress Tests run, and that Tests run is the only UI-invariant check a
nightly gets.

**The launch merge auto-starts a nightly.** It touches `.github/workflows/nightly.yml`, and
`dispatch-nightly.yml` dispatches a nightly on any master push that touches that file. That
run is the first post-launch nightly. Push nothing else to master until its publish,
deploy and Tests have finished.

## Before launch day

- [ ] When Blizzard announces the US release date (read it from Blizzard directly, never a
      third-party guess): a separate owner commit sets `LABEL_FLIP_DUE` in
      `src/normalize.mjs` to that date. Push rule applies. Keep it out of the launch branch.
- [ ] After #81 squash-merges, move the launch branch onto master. `c80a9f7` is the cut
      point whatever #81's final head is, because the launch commits start after it. Run it
      in a worktree that has the branch checked out (`git worktree list` shows where;
      the staging worktree under the Claude scratchpad is disposable), or make one:

      ```powershell
      cd "C:\Users\Riley\Documents\Projects\WoW Class Tracker"
      git fetch origin
      git worktree add ..\wct-1215-launch claude/1215-launch
      cd ..\wct-1215-launch
      git rebase --onto origin/master c80a9f7
      git log --oneline origin/master..HEAD
      ```

      The log must list exactly the five launch commits. If #81 gained commits after
      `c80a9f7`, expect conflicts only where they touch the same prose or tests; resolve
      toward #81's version, then re-apply the launch intent. Never rebase from the main
      checkout: `git rebase <upstream> <branch>` checks the branch out there first.
- [ ] Rebasing after an ordinary nightly is optional. The launch branch touches no `data/`
      file and no skill log, so nightlies cannot conflict with it.

## Phase B: launch morning (one owner session)

**B0. Confirm 12.1.5 is live on US realms** from Blizzard's own announcement or the live
patch notes, fetched that day. Write the date down as `YYYY-MM-DD`; it is `since`.

**B1. Preflight.** Run the push-rule checks. Then record two baselines from master in a
throwaway worktree:

```powershell
cd "C:\Users\Riley\Documents\Projects\WoW Class Tracker"
git fetch origin
git worktree add --detach ..\wct-1215-base origin/master
cd ..\wct-1215-base
node src/check-refresh.mjs --age > $env:TEMP\1215-age-baseline.txt
node -e 'Promise.all([import(''./src/render.mjs''),import(''./src/validate.mjs'')]).then(async([r,v])=>{const d=await v.loadData(''.''),p=r.buildPayload(d),pick=f=>p.specs.map(s=>[s.class,s.spec,s[f]??null]);console.log(require(''crypto'').createHash(''sha256'').update(JSON.stringify([pick(''consensus''),pick(''projection''),d.frozenForecast??null,p.history])).digest(''hex''))})' > $env:TEMP\1215-payload-before.txt
cd "C:\Users\Riley\Documents\Projects\WoW Class Tracker"
git worktree remove ..\wct-1215-base
```

`check-refresh --age` exits 1 today because of standing reds; that is fine, the file is
the baseline. The `node` line hashes every spec's consensus and projection, the frozen
forecast and the history series. The launch must not change it.

**B2. Open the launch worktree** (reuse `..\wct-1215-launch` if the pre-launch rebase made
it) and install the UI-invariant browser:

```powershell
git worktree add ..\wct-1215-launch claude/1215-launch
cd ..\wct-1215-launch
git log --oneline origin/master..HEAD
npm i --no-save playwright@1.61.1
npx playwright install chromium
```

The log must list the five launch commits and nothing else. If it lists #81's commits,
run `git rebase --onto origin/master c80a9f7` here first. If `git worktree add` says the
branch is checked out elsewhere, work in that worktree instead (`git worktree list`).

**B3. Nothing to fetch yet.** Do not run `node src/fetch-official-notes.mjs` before B4. The
collector copies the previous ledger into `official-notes/pending.json`
(`pendingLedger` starts from `structuredClone(previous)`), so fetching first carries the
retired `ptr-preview` block into the file you are about to adopt. If that happens, redo B4
and fetch again.

**B4. Data edits** (hand-applied; see "Why the data edits are hand-applied"). Both files
are LF-pinned; these commands keep them LF and throw if the block is not there:

```powershell
node -e 'const fs=require(''fs''),p=''data/official-notes.json'',j=JSON.parse(fs.readFileSync(p,''utf8''));if(!j.sources[''ptr-preview''])throw new Error(''ptr-preview block absent'');delete j.sources[''ptr-preview''];fs.writeFileSync(p,JSON.stringify(j,null,2)+String.fromCharCode(10))'
node -e 'const fs=require(''fs''),p=''data/required-sources.json'',s=fs.readFileSync(p,''utf8''),r=/,\r?\n *\x22ptr-preview\x22/g,m=s.match(r)||[];if(m.length!==1)throw new Error(''expected 1 ptr-preview entry, found ''+m.length);fs.writeFileSync(p,s.replace(r,''''))'
git diff --stat -- data/
```

Expect `data/official-notes.json` about 250 lines removed and `data/required-sources.json`
`3 +-`. The first file round-trips through `JSON.stringify` byte-identically apart from the
removed block (checked); the second does not, which is why it is a text edit.

Optional, same Gate-0 file: reword the `blizzard-ptr` row's label
`"Official PTR build feed (forum thread + Wowhead RSS)"` in `data/required-sources.json`.
Leave it if unsure; nothing reads it as a rule.

**B5. Replace the fixture date.** Put the B0 date in `$releaseDate`. The command edits all
three files or none, deletes both FIXTURE comments, and refuses if any placeholder is left:

```powershell
$releaseDate = 'YYYY-MM-DD'
node -e 'const fs=require(''fs''),d=process.argv[1],q=String.fromCharCode(34);if(!/^\d{4}-\d{2}-\d{2}$/.test(d||''''))throw new Error(''pass the US release date as YYYY-MM-DD'');const out=[];const ed=(p,rs)=>{let s=fs.readFileSync(p,''utf8'');for(const [r,t] of rs){const n=(s.match(r)||[]).length;if(n!==1)throw new Error(p+'': expected 1 match for ''+r+'', found ''+n);s=s.replace(r,t)}if(/2099-01-01|FIXTURE/.test(s))throw new Error(p+'': fixture text remains'');out.push([p,s])};const cm=/  \/\* FIXTURE DATE[\s\S]*?\*\/\r?\n/g,pin=/since: \x222099-01-01\x22/g;ed(''src/normalize.mjs'',[[cm,''''],[pin,''since: ''+q+d+q]]);ed(''test/normalize.test.mjs'',[[cm,''''],[pin,''since: ''+q+d+q]]);ed(''CLAUDE.md'',[[/\(since 2099-01-01 \S+ FIXTURE date staged[^)]*\)/g,''(since ''+d+'')''],[/; on the pre-staged launch branch[^)]*\)/g,'')'']]);for(const [p,s] of out)fs.writeFileSync(p,s);console.log(''fixture date replaced with ''+d)' $releaseDate
git grep -n -E "2099-01-01|FIXTURE" -- src/normalize.mjs test/normalize.test.mjs CLAUDE.md
```

The `git grep` must print nothing. Leave the other `2099-01-01` literals in the repo alone:
`test/build.test.mjs`, `test/forecast-report.test.mjs`, `test/report-card.test.mjs` and
`test/validate.test.mjs` use it as an unrelated far-future fixture.

`patchName` stays "Curse of Ula'tek" unless the live notes name a new subtitle.

**B6. Official notes, fresh.**

```powershell
node src/fetch-official-notes.mjs
Copy-Item official-notes\pending.json data\official-notes.json
node src/check-official-notes.mjs --base=HEAD
```

The fetch must report `live-hotfixes: success` and nothing about `ptr-preview`. If the
check lists unresolved sections, they are hotfixes posted since the last nightly: resolve
each per the ptr-watch skill (an applied build-feed reference or an explicit irrelevant
reason), then run the check again. The base ledger at `HEAD` still carries the retired
block; the gate compares configured sources only, so that is expected to pass.

**B7. Gates.**

```powershell
foreach ($s in 'instructions:check','test:quiet','build','gearing:build','validate') { npm run -s $s; if ($LASTEXITCODE -ne 0) { throw "npm run $s failed" } }
node -e 'Promise.all([import(''./src/render.mjs''),import(''./src/validate.mjs'')]).then(async([r,v])=>{const d=await v.loadData(''.''),p=r.buildPayload(d),pick=f=>p.specs.map(s=>[s.class,s.spec,s[f]??null]);console.log(require(''crypto'').createHash(''sha256'').update(JSON.stringify([pick(''consensus''),pick(''projection''),d.frozenForecast??null,p.history])).digest(''hex''))})' > $env:TEMP\1215-payload-after.txt
fc.exe $env:TEMP\1215-payload-before.txt $env:TEMP\1215-payload-after.txt
git diff --stat -- data/history
Select-String -Path dist\index.html -Pattern 'pc-short">12\.1\.5<','"previews":\[\]' | Measure-Object
Select-String -Path dist\gearing.html -Pattern 'pc-short">12\.1\.5<' | Measure-Object
git status --short
```

Pass means: the loop throws nothing; `test:quiet` reads `fail 0` and `(UI invariants ran)`;
`fc.exe` reports no differences; the `data/history` diff is empty; the first `Measure-Object`
counts 2 and the second 1. `git status` lists exactly: `CLAUDE.md`,
`data/official-notes.json`, `data/required-sources.json`, `dist/gearing.html`,
`dist/index.html`, `src/normalize.mjs`, `test/normalize.test.mjs` (plus `data/ptr-builds.json`
and whatever B6's resolutions touched, if any). Do not run `node src/snapshot.mjs`: nothing
the snapshots record changed.

**B8. Optional: log the shipped 12.1.5 notes now** (otherwise the auto-started nightly does it
under the updated ptr-watch). One `data/ptr-builds.json` entry, newest first: `kind:
"patch-notes"`, `patch: "12.1.5"`, `realm: "live"`, cited by a us/eu.forums.blizzard.com
`forumUrl` or a wowhead.com `wowheadUrl`. Never cite worldofwarcraft.blizzard.com; the
host allowlist refuses it, and widening it is a reviewed code edit. `specsAffected` and
`highlights` must agree, with Midnight roster names (Devourer included). If a set bonus
changes, bump that spec's `tierSet` (asOf, source) and sync the gearing mirror in the same
change:

```powershell
node gearing/src/harvest-specs.mjs
node gearing/src/harvest-specs.mjs --check
npm run gearing:build
```

Then repeat B7. Validation refuses a `12.1.5` patch value until `livePatch` is 12.1.5, so
this entry cannot land before B5.

Also read gearing's two remaining "12.1" sentences against the live notes (template lines
~1136 and ~1139: "In 12.1, a converted ..." and the "12.1 announcement" link). They were
kept deliberately; reword only if the live notes changed the Catalyst rules. Rebuild with
`npm run gearing:build` if you edit them.

**B9. Commit, PR, merge.** Stage explicit paths only:

```powershell
git add CLAUDE.md data/official-notes.json data/required-sources.json dist/gearing.html dist/index.html src/normalize.mjs test/normalize.test.mjs
git status --short
git commit -m "12.1.5 launch: release date, retire the ptr-preview ledger block and contract entry"
git push -u origin claude/1215-launch
gh pr create --base master --head claude/1215-launch --title "12.1.5 launch: chip 12.1.5, retire the ptr-preview notes source, live-notes posture" --body "Owner launch commit. Checklist: docs/1215-launch-runbook.md (Phase B)."
gh pr checks --watch
```

Add `data/ptr-builds.json` (and the gearing mirror files) to the `git add` line if B6 or B8
touched them. When the PR is green, run the push rule again, then:

```powershell
gh pr merge <N> --squash --match-head-commit (git rev-parse HEAD)
```

**B10. After the merge.** The nightly starts by itself (push rule). Then verify directly:

- [ ] `gh run list --workflow nightly.yml --limit 2` shows the auto-dispatched run; wait for
      its publish, deploy and Tests.
- [ ] ci.yml's three-browser UI invariants are green, and deploy.yml's post-deploy hash
      verification is green.
- [ ] Read the live pages, not the upload result:

      ```powershell
      $idx = (curl.exe -s https://riles22.github.io/wow-class-tracker/) -join "`n"
      $idx -match 'pc-short">12\.1\.5<'
      $idx -match '"previews":\[\]'
      $gear = (curl.exe -s https://riles22.github.io/wow-class-tracker/gearing.html) -join "`n"
      $gear -match 'pc-short">12\.1\.5<'
      ```

      All three print `True`. "Shipped in 12.1.5" appears only once the notes are logged.
- [ ] `node src/check-refresh.mjs --age` shows no key that is not in
      `$env:TEMP\1215-age-baseline.txt` and not explained in Phase C5.
- [ ] Dispatch the read-only WCL probe and save its log as the Phase C2 evidence:

      ```powershell
      gh workflow run wcl-probe.yml
      gh run list --workflow wcl-probe.yml --limit 1
      gh run view <id> --log > $env:TEMP\1215-wcl-probe-launch.txt
      ```

      Repeat after the first weekly reset.
- [ ] Remove the worktree when done, from the main checkout:
      `git worktree remove ..\wct-1215-launch`.

## Phase C: after launch

**C1. First-week triage.** Read every post-launch nightly's check-refresh output and agent
transcripts. If the only failures are the anomaly limits (maxTotalMoves 25, maxTwoBandMoves
6) or the value-move limits (0.6 per row, 0.35 per family) and the moves trace to 12.1.5,
re-dispatch with the human `anomaly_ack` or `value_move_ack` input citing the patch. Never
give an ack blind or in advance. Watch the forums for a NEW "Midnight Hotfixes" topic: the
old topic 2336376 still passes the title check, so a new thread would be missed silently.
Adding it is a new `OFFICIAL_NOTE_SOURCES` row plus its `data/required-sources.json`
entry, one owner edit.

**C2. The WCL raid switch: one reviewed owner commit.**

Trigger, all three, read from a `wcl-probe.yml` log:

- (a) The zone-53 line has `supersededBy` non-null: the collector's guard sees the new
  partition. Note its `id` and exact `name`.
- (b) The `"trigger":"parity"` line for that partition has `"missing":0`: every
  (spec, boss) cut stored today has 10 or more entries there.
- (c) The Kith'ix matrix line for `"encounter":3513` at that partition, `"difficulty":5`,
  `"size":20` has `"entries"` above 0. Any Mythic ranking counts.

Ignore `shortOfTrigger` and `atMinimum` on the `"trigger":"mythic-entries"` line. They apply
the superseded 2026-09-25 reading (10 or more per Kith'ix spec cut). Under the 2026-09-26
decision, a Kith'ix cut with fewer than 10 entries simply stays absent.

If the probe shows Kith'ix outside zone 53 / difficulty 5 / size 20 (Blizzard's Mythic
Kith'ix is flex 15-25), stop: the one-config-per-bracket recipe cannot hold it. The owner
decision is a per-boss zone/size override, which is a separate reviewed code change.
Switching before WCL creates the partition fails the whole bracket ("Invalid partition
specified", HTTP 200).

The commit, all in one:

- `src/wcl-live.mjs` raid config: `partition` and `partitionName` set to WCL's exact new
  values; append the new partition to `reviewedPartitions` (keep id 1); move
  `{ id: 3513, name: "Kith'ix" }` from `excludedEncounters` to the end of `encounters`;
  delete `switchWaitsFor`.
- Pools must not mix partitions (validate refuses it): delete the stored partition-1 row of
  any cut the probe lists as sparse on the new partition, or hold that whole family.
- `data/wcl-coverage.json` must match the 9-boss inventory. Preferred: a credentialed local
  `node src/fetch-wcl.mjs` (credentials as the local-run skill names them; never echo
  them). Fallback, tested in the staging simulation: add the 40 unattempted Kith'ix cuts
  as `failed` (collection not completed, which is true), and let the next nightly rewrite
  the file:

  ```powershell
  node --input-type=module -e 'import fs from ''fs''; import { coverageEncounters } from ''./src/wcl-coverage.mjs''; const p = ''data/wcl-coverage.json'', c = JSON.parse(fs.readFileSync(p, ''utf8'')), specs = JSON.parse(fs.readFileSync(''data/specs.json'', ''utf8'')); c.encounters = coverageEncounters(); const k = x => [x.class, x.spec, x.bracket, x.encounterId].join(''|''), have = new Set(c.cuts.map(k)), add = []; for (const [bracket, list] of Object.entries(c.encounters)) for (const e of list) for (const s of specs) if (!have.has(k({ class: s.class, spec: s.spec, bracket, encounterId: e.id }))) add.push({ class: s.class, spec: s.spec, bracket, encounterId: e.id, status: ''failed'', checkedAt: null, reason: ''Collection failed or was not completed; no new measurement verified'' }); c.cuts.push(...add); fs.writeFileSync(p, JSON.stringify(c, null, 2) + String.fromCharCode(10)); console.log(''unattempted cuts added:'', add.length)'
  ```

  It must print `unattempted cuts added: 40`.

Literal test pins (deliberate tripwires; change them in the same commit). Line numbers are
from master at `38dc0fe`:

| File | Line(s) | Change |
| --- | --- | --- |
| test/wcl-live.test.mjs | 54 | title `<=128` to `<=136` |
| test/wcl-live.test.mjs | 57, 83 | metrics `640` to `680` |
| test/wcl-live.test.mjs | 58 | `rankedBatches` 128 to 136, `budgetChecks` 8 to 9 |
| test/wcl-live.test.mjs | 62-63, 121 | per bracket: raid cuts/rows/verifiedCuts 360, M+ stays 320 (`cfg.bracket === "raid" ? 360 : 320`) |
| test/wcl-live.test.mjs | 108 | raid rows 280 to 320 (40 omissions unchanged) |
| test/wcl-live.test.mjs | 141, 166 | 141 (M+) stays 312; 166 raid rows 312 to 352 |
| test/wcl-live.test.mjs | 208 | receipt detail `320 median rows` per bracket (raid 360) |
| test/wcl-live.test.mjs | 217-227 | the "new partition" fixture becomes one ABOVE the new pin (for example `{ id: 3, name: "12.2" }`); raid rows 360; the pinned-partition text in the message regex; the raid detail now ends `owner review of the new partition` because `switchWaitsFor` is gone; the partition in the collected-query check |
| test/wcl-live.test.mjs | 255, 257-258, 262-263 | `reviewedPartitions` lists both; `switchWaitsFor` undefined; 3513 in `encounters`, not `excludedEncounters`; `leaderboardPartitions()` lists zone 53 twice; ceiling 680 |
| test/check-wcl-metrics.test.mjs | 99-101, 105, 109-110, 115 | ceiling 640 to 680; the "one more boss" fixture 680 to 720 |
| test/wcl-coverage.test.mjs | 21-22 | cuts 640 to 680, raid encounters 8 to 9 |
| test/validate.test.mjs | 1034, 1043 | **latent trap:** the unreviewed-partition cases use id 2. If WCL's new partition is 2, these still pass at the switch but red on the first nightly after it, once stored rows carry partition 2. Move both to an id outside the reviewed set (for example 99) |
| test/wcl-probe.test.mjs | `zonesToday`, 65, 99 | needs a rewrite for the new pin: the staging simulation left exactly these 2 tests red |

Prose in the same commit (the 09-25 text describes a pending switch, and part of it the
superseded ">= 10 per Kith'ix spec cut" reading): CLAUDE.md's WCL recipe paragraph
(~1083-1087) and "Partition supersession" paragraph (~1110-1122, including "which specs
Kith'ix must cover awaits owner confirmation"), `.claude/skills/refresh-metrics/SKILL.md`
(~62, ~74-76), `SOURCES.md` (~248, ~252-253), `docs/wcl-supported-collection.md` ("The
switch trigger", ~88-97, and the switch list below it) and the `src/wcl-probe.mjs` comment
above `shortOfTrigger` (~82-88). The "S2 Mythic" series names and
`LIVE_LEADERBOARDS.label` "12.1" stay.

Gates: `npm run test:quiet`, `node src/check-wcl-metrics.mjs`, `node src/check-refresh.mjs
--manifest`, then the push rule. The row drop must stay within `maxRowDropPct` 0.25, which
takes no ack. Expect to give `value_move_ack` on the next nightly if a family median moves
more than 35%. A ninth boss adds about 147 queries, about 2.5 minutes (inferred from
measured rates).

**C3. Routine, through the nightly** (no contract change):

- Tier pages retitled 12.1.5 stay `seasonVerified` s2; movement arrows record real re-ratings.
- SimC re-sims atomically; its header will read 12.1.5.
- Bloodmallet: hold, and write the row partial, until every chart timestamp is on or after
  `livePatch.since`; then adopt wholesale. That will likely need the owner's
  `value_move_ack`.
- Creators: new live reads supersede the six "12.1.5 PTR preview - NOT LIVE" Devourer takes.
  Old takes are never edited.
- Venomstone: when verified live item levels exist, re-harvest `sheet-rewards.json`,
  remove the pre-launch `authorCaveats` line and `'venomstone'` from `ESTIMATE_KEYS`
  (gearing/src/app.template.html) together; `gearing/test/project.test.mjs` pins the pair.

**C4. Gearing: Kith'ix loot and Venomstones** once live tooltips resolve (all 12 Kith'ix item
ids returned 404 before launch). A reviewed code change: `harvest-raid.mjs` and
`validate-data.mjs` hard-code eight bosses and their counts. Re-harvest with
`WOW_ACCEPT_LOOT_CHANGES=1`. If launch is a Tuesday, the weekly gearing-refresh (08:37 UTC)
may run red; failed providers keep their files by design.

**C5. Freshness expectations.** Compare `check-refresh --age` at launch +3 days against the
baseline. Expected because of 12.1.5: `wcl-leaderboard-raid` partial from the day WCL adds
a partition until C2; Bloodmallet partial or stale until wholesale adoption; M+ partial only
if WCL unexpectedly adds a partition to zone 55. Pre-existing, not 12.1.5: the Archon wall,
wowmeta, murlok, the Method page self-date, `wcl-live-raid`/`wcl-live-mplus`, and the gearing
verification and loot-age rows. The floor stays 5 until 2026-11-01.

## Why the data edits are hand-applied

- Every nightly rewrites `data/official-notes.json` (a fresh `checkedAt` and whatever
  sections landed). A pre-staged edit would conflict with each night and go stale.
- `check-official-notes` accepts only evidence under 36 hours old, requires the ledger's
  `checkedAt` to equal the evidence's, and requires the evidence to list exactly the
  configured sources. Only a fetch run after the config change, on the day, satisfies all
  three.
- `data/required-sources.json` is a Gate-0 and CODEOWNERS file: a nightly agent may never
  write it, so the contract change can only be an owner edit.
- The fetch must follow the ledger edit (B3), or the retired block comes back.

## Verified versus inferred

Verified during staging (2026-09-26 UTC, in scratch worktrees, never on master):

- Launch branch alone: `instructions:check` passes; `test:quiet` 700 tests, 673 pass,
  26 fail, 1 skip; build and validate fail on `unknown source ptr-preview` only.
- Launch branch plus the B4 edits: `instructions:check`, `test:quiet` (699 pass, 0 fail,
  1 skip, UI invariants ran), build, gearing:build and validate all green.
- A live `fetch-official-notes` (live-hotfixes only, 118 class sections, none unresolved),
  adopted as the ledger, passes `check-official-notes` against `--base=origin/master` and
  `--base=HEAD`, both of which still hold the `ptr-preview` block (config-only iteration).
- The B1/B7 payload hash is identical on master `38dc0fe`, on #81's head `c80a9f7`, on the
  launch branch, and on the launch branch with B4 applied. `buildPayload` differs from #81's
  head only in `officialNotes`; `meta` is identical. `data/history` is untouched.
- `check-refresh --age` lists the same 26 keys with and without the launch edits.
- B4 and B5 were run under `powershell.exe` 5.1 exactly as written (B5 with a simulation
  date, then all gates green). B5 is ASCII-only on purpose: a literal em dash in a PS 5.1
  argument is mangled before node sees it.
- The C2 switch was simulated at `38dc0fe` with a hypothetical partition `{ id: 2, name:
  "12.1.5" }`: with the pins above, 675 pass and only the 2 wcl-probe tests red; validate
  passes after a simulated post-switch nightly.
- Before launch: the patch-notes host allowlist refuses worldofwarcraft.blizzard.com.

Inferred, not observed:

- That WCL will add a 12.1.5 partition to zone 53 (it did for zone 46 at every patch), and
  its id and name. The real values come from the probe.
- Where WCL files Kith'ix (zone, difficulty, size) and when Mythic opens.
- The release date: not announced as of 2026-09-26.
- That the auto-started nightly after the merge is healthy; B10 checks it.
