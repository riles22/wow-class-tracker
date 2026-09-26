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
| Launch code, tests, prose | branch `claude/1215-launch`, 8 commits on top of `c80a9f7` (the #81 head) | not mergeable alone, see below |
| Launch data edits | nowhere | hand-applied on launch morning (B4) |

**Where the launch branch lives (as of 2026-09-26).** `claude/1215-launch` is a local ref in
the main repo (`C:\Users\Riley\Documents\Projects\WoW Class Tracker\.git`). It is not
pushed. Its only worktree is a Claude staging directory under
`%TEMP%\claude\...\scratchpad\wt\launch`. The ref itself is stored in the main repo, so it
survives a Temp cleanup. Only the worktree registration goes stale, and the
`git worktree prune` line in "Before launch day" and in B2 clears it. Never delete the
branch ref.

The eight launch commits, oldest first. The hashes are from before any rebase. A rebase
keeps the subjects, and B2 checks the subjects.

1. `05bf480` official-note consumers take an injectable source list (tests can exercise a
   retired lane without re-adding it to the real config).
2. `cf3aa65` retire the `ptr-preview` official-notes source (config row, tests, digest).
3. `1255057` set `PHASES.livePatch` to 12.1.5 with a FIXTURE `since` of `2099-01-01`;
   gearing chip hand-edited to 12.1.5 and its artifact rebuilt.
4. `6038c2e` nightly PRIMARY and RECOVERY prompts: log live 12.1.5 notes and hotfixes with
   realm live; also corrects the `maxRunAgeHours` comment to 26.
5. `1e6f419` prose: CLAUDE.md "12.1.5 is live" note, ptr-watch and local-run skills,
   SOURCES.md section 5, regenerated `.agents` adapter.
6. `c5a88c7` placeholder guard: a normalize test fails while `PHASES.livePatch.since` is
   not a real `YYYY-MM-DD` date on or before today (UTC), or while `src/normalize.mjs`
   still carries the placeholder marker. The test builds the marker at run time, so B5's
   leftover check and its `git grep` find nothing in the test file.
7. `6d8aaef` the nightly RECOVERY prompt gains PRIMARY's three clauses (never write 12.1.5
   into spec `ptr` verdicts, never reopen forecasts, never relabel archived 12.1 PTR
   metrics). The ptr-watch skill now says `spec.ptr` belongs to an open PTR cycle only, so
   live notes and hotfixes never go into it.
8. `fddd2a6` comments only: `src/validate.mjs`, `test/build.test.mjs` and
   `test/validate.test.mjs` stop describing 12.1.5 as a notes-only preview.

**Expected results at each stage.** Only fail counts are given. Pass totals change whenever
master gains tests.

| State | `npm run test:quiet` | build and validate |
| --- | --- | --- |
| Launch branch alone | 27 fail | both fail: `official-notes.json: unknown source ptr-preview` |
| Plus the B4 data edits | 1 fail: the placeholder guard | green (gearing:build too) |
| Plus B4 and B5 | 0 fail; the only skip is freeze-season; UI invariants ran | green (gearing:build too) |

The reds on the branch alone are by design: the committed ledger and
`data/required-sources.json` still name the retired source until B4. 25 of the 27 reds are
that one data error seen through different tests. The 26th is the new contract pin
(`12.1.5 launch: the live compilation is the only configured source and the refresh
contract names exactly it`). The 27th is the placeholder guard (`PHASES.livePatch.since is
a real ISO date no later than today (UTC), with no placeholder marker left in
normalize.mjs`), and only B5 clears it.

`2099-01-01` is a placeholder, not a release date. It appears in `src/normalize.mjs`
(beside a FIXTURE comment), `test/normalize.test.mjs` and `CLAUDE.md` (lines 17 and 388 on
the branch). B5 replaces it. **If it ships unreplaced, CI's `npm test` and the nightly
publish's Gate 1 `npm test` go red. That is by design:** the placeholder guard fails, and it
keeps failing every night until the date is fixed. Nothing else would notice. The label-flip
gate is silent once the chip reads 12.1.5, while the Bloodmallet adoption hold and the
creator-take framing rule read `since` and would wait for 2099. The guard also rejects a
date later than today's UTC date, so B5 cannot land before the release day has started in
UTC.

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
- [ ] After #81 squash-merges, move the launch branch onto master once, early, so any
      conflict shows up before launch day. B2 runs the same lines again on the day; this
      is a rehearsal, not a substitute. `c80a9f7` is the cut point whatever #81's final
      head is, because the launch commits start after it.

      ```powershell
      cd "C:\Users\Riley\Documents\Projects\WoW Class Tracker"
      git fetch origin
      if ((gh pr view 81 --json state --jq .state) -ne 'MERGED') { throw '#81 is not merged yet: stop here' }
      git worktree prune
      git worktree list
      if (-not (Test-Path ..\wct-1215-launch)) { git worktree add ..\wct-1215-launch claude/1215-launch; if ($LASTEXITCODE -ne 0) { throw 'git worktree add failed: read git worktree list' } }
      cd ..\wct-1215-launch
      git merge-base --is-ancestor c80a9f7 HEAD; $rc = $LASTEXITCODE; if ($rc -eq 0) { git rebase --onto origin/master c80a9f7 } elseif ($rc -eq 1) { git rebase origin/master } else { throw 'git merge-base failed' }; if ($LASTEXITCODE -ne 0) { throw 'rebase stopped: resolve and git rebase --continue, or git rebase --abort' }
      if ((git rev-list --count HEAD..origin/master) -ne '0') { throw 'launch branch is behind origin/master' }
      $subjects = git log --format=%s origin/master..HEAD; if ($subjects.Count -ne 8 -or ($subjects | Where-Object { $_ -notlike '12.1.5 launch (pre-staged):*' })) { throw 'expected exactly the 8 pre-staged launch commits' }
      ```

      No line may throw. What the lines do:

      - The `gh` line stops if #81 is not merged. Rebasing before #81 merges drops #81 from
        under the launch commits; in the staging simulation that stopped on a conflict in
        `test/digest.test.mjs` at the second launch commit.
      - `git worktree prune` removes the registration of a worktree whose directory is gone,
        such as the staging worktree after a Temp cleanup. Without it, `git worktree add`
        fails with `'claude/1215-launch' is already used by worktree at '<deleted path>'`.
      - Read the `git worktree list` output. If `claude/1215-launch` is shown at
        `..\wct-1215-launch`, the `Test-Path` line reuses that worktree. If it is shown at
        any other path that still exists, such as the staging worktree under
        `AppData\Local\Temp\claude\`, run `git worktree remove "<that path>"` first and
        then rerun the `Test-Path` line. `git worktree remove` refuses a worktree with
        uncommitted changes; the staging worktree has none. The branch ref stays in the
        main repo either way.
      - The rebase line picks its form. While `c80a9f7` is still in the branch's history,
        `git rebase --onto origin/master c80a9f7` replays only the 8 launch commits onto
        master, which already holds #81's squash. After one rebase, `c80a9f7` is no longer
        in the history, and a plain `git rebase origin/master` moves the 8 commits onto the
        newest master.
      - The last two lines check that the branch is 0 commits behind `origin/master` and
        that it holds exactly the 8 launch commits.

      If #81 gained commits after `c80a9f7`, expect conflicts only where they touch the same
      prose or tests. Resolve toward #81's version, then re-apply the launch intent. Never
      rebase from the main checkout: `git rebase <upstream> <branch>` checks the branch out
      there first.
- [ ] Nightlies cannot conflict with the launch branch, because it touches no `data/` file
      and no skill log. They still leave it behind. Every nightly commits a `data/history`
      snapshot, and a branch based on an older master fails B7's payload-hash comparison
      with B1. In the staging simulation, one nightly-style snapshot was enough to make the
      hashes differ. So B2 always rebases onto the `origin/master` that B1 fetched, even if
      this step already ran.

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

Do not run `git fetch` again until B7 is done. B2 rebases onto this `origin/master`, and B7
compares against this hash.

**B2. Bring the launch branch to B1's `origin/master`, then install the UI-invariant
browser.** Always run the rebase, even if the pre-launch rebase ran. These are the same
lines as in "Before launch day" (read the notes there), without the fetch:

```powershell
cd "C:\Users\Riley\Documents\Projects\WoW Class Tracker"
if ((gh pr view 81 --json state --jq .state) -ne 'MERGED') { throw '#81 is not merged yet: stop here' }
git worktree prune
git worktree list
if (-not (Test-Path ..\wct-1215-launch)) { git worktree add ..\wct-1215-launch claude/1215-launch; if ($LASTEXITCODE -ne 0) { throw 'git worktree add failed: read git worktree list' } }
cd ..\wct-1215-launch
git merge-base --is-ancestor c80a9f7 HEAD; $rc = $LASTEXITCODE; if ($rc -eq 0) { git rebase --onto origin/master c80a9f7 } elseif ($rc -eq 1) { git rebase origin/master } else { throw 'git merge-base failed' }; if ($LASTEXITCODE -ne 0) { throw 'rebase stopped: resolve and git rebase --continue, or git rebase --abort' }
if ((git rev-list --count HEAD..origin/master) -ne '0') { throw 'launch branch is behind origin/master' }
$subjects = git log --format=%s origin/master..HEAD; if ($subjects.Count -ne 8 -or ($subjects | Where-Object { $_ -notlike '12.1.5 launch (pre-staged):*' })) { throw 'expected exactly the 8 pre-staged launch commits' }
npm i --no-save playwright@1.61.1
npx playwright install chromium
```

No line may throw. The branch is then 0 commits behind `origin/master` and holds exactly
the 8 launch commits, so B7's hash compares like with like. If `git worktree list` shows
`claude/1215-launch` at a path other than `..\wct-1215-launch`, handle it as described in
"Before launch day".

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

Pass means: the loop throws nothing; `test:quiet` reads `fail 0`, and its skip line names
only the freeze-season test (`a frozen record's commit really is the newest one still
describing the live season`) and says `(UI invariants ran)`; `fc.exe` reports no
differences; the `data/history` diff is empty; the first `Measure-Object`
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
  `"size":20` has `"entries"` above 0. Any Mythic ranking counts. This is the owner's
  decision of 2026-09-26, in Riley's words: "Kith'ix just has to exist".

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
- `data/wcl-coverage.json` must match the 9-boss inventory, or validate refuses the commit.
  Add the 40 unattempted Kith'ix cuts as `failed` (collection not completed, which is
  true); the first nightly after the switch rewrites the file from a real collection. Do
  not run a credentialed `node src/fetch-wcl.mjs` for this commit (see the gates below).
  Run from the repo root of the worktree holding the switch edits:

  ```powershell
  node --input-type=module -e 'import fs from ''fs''; import { coverageEncounters } from ''./src/wcl-coverage.mjs''; const p = ''data/wcl-coverage.json'', c = JSON.parse(fs.readFileSync(p, ''utf8'')), specs = JSON.parse(fs.readFileSync(''data/specs.json'', ''utf8'')); c.encounters = coverageEncounters(); const k = x => [x.class, x.spec, x.bracket, x.encounterId].join(''|''), have = new Set(c.cuts.map(k)), add = []; for (const [bracket, list] of Object.entries(c.encounters)) for (const e of list) for (const s of specs) if (!have.has(k({ class: s.class, spec: s.spec, bracket, encounterId: e.id }))) add.push({ class: s.class, spec: s.spec, bracket, encounterId: e.id, status: ''failed'', checkedAt: null, reason: ''Collection failed or was not completed; no new measurement verified'' }); c.cuts.push(...add); fs.writeFileSync(p, JSON.stringify(c, null, 2) + String.fromCharCode(10)); console.log(''unattempted cuts added:'', add.length)'
  ```

  It must print `unattempted cuts added: 40`.

Literal test pins (deliberate tripwires; change them in the same commit). Line numbers are
from master at `38dc0fe`, and the same lines hold on the launch branch (checked
2026-09-26):

| File | Line(s) | Change |
| --- | --- | --- |
| test/wcl-live.test.mjs | 54 | title `<=128` to `<=136` |
| test/wcl-live.test.mjs | 57, 83 | metrics `640` to `680` |
| test/wcl-live.test.mjs | 58 | `rankedBatches` 128 to 136, `budgetChecks` 8 to 9 |
| test/wcl-live.test.mjs | 62-63, 121 | per bracket: raid cuts/rows/verifiedCuts 360, M+ stays 320 (`cfg.bracket === "raid" ? 360 : 320`) |
| test/wcl-live.test.mjs | 108 | raid rows 280 to 320 (40 omissions unchanged) |
| test/wcl-live.test.mjs | 141, 166 | 141 (M+) stays 312; 166 raid rows 312 to 352 |
| test/wcl-live.test.mjs | 208 | receipt detail `320 median rows` per bracket (raid 360) |
| test/wcl-live.test.mjs | 217-227 | the "new partition" fixture (217, 222-223) becomes one ABOVE the new pin (for example `{ id: 3, name: "12.2" }`); raid rows (220) 360; the pinned-partition text in the message regex (223); the raid detail (224) now ends `owner review of the new partition` because `switchWaitsFor` is gone. **227 must be split per bracket.** Today one `every()` asserts `partition: 1,` on the ranked queries of BOTH brackets, which holds only while both sit on partition 1; changing its literal to the new pin reds it, because the M+ queries stay on partition 1. Filter `ranked` into raid queries (`difficulty: 5, size: 20`) and M+ queries (`difficulty: 10, size: 5`), assert the two filters together cover every ranked query, then assert the raid queries carry the new pin and not the fixture partition, and the M+ queries still carry `partition: 1,` |
| test/wcl-live.test.mjs | 255, 257-258, 262-263 | `reviewedPartitions` lists both; `switchWaitsFor` undefined; 3513 in `encounters`, not `excludedEncounters`; `leaderboardPartitions()` lists zone 53 twice; ceiling 680 |
| test/check-wcl-metrics.test.mjs | 99-101, 105, 109-110, 115 | ceiling 640 to 680; the "one more boss" fixture 680 to 720 |
| test/wcl-coverage.test.mjs | 21-22 | cuts 640 to 680, raid encounters 8 to 9 |
| test/validate.test.mjs | 1034, 1045 | **trap:** both cases sit in the provenance test that starts at 1032, and both use id 2 as the "unreviewed" partition. If WCL's new partition is 2: the `s.partition = 2` row case (1034) fails AT the switch, because 2 is then reviewed and the mutated row is valid; the `reviewedPartitions: [{ id: 2, ... }]` recipe case (1045) still passes at the switch but fails on the first nightly after it, once the stored rows carry partition 2. Move both to an id outside the reviewed set (for example 99) |
| test/wcl-probe.test.mjs | `zonesToday` (16); the tests at 58 (asserts 65-73) and 80 (asserts 91-102) | needs a rewrite for the new pin. In the 2026-09-26 re-simulation, these 2 tests were the only reds left once every other row of this table was applied |

Prose in the same commit (the 09-25 text describes a pending switch, and part of it the
superseded ">= 10 per Kith'ix spec cut" reading): CLAUDE.md's WCL recipe paragraph
(~1083-1087) and "Partition supersession" paragraph (~1110-1122, including "which specs
Kith'ix must cover awaits owner confirmation"), `.claude/skills/refresh-metrics/SKILL.md`
(~62, ~74-76), `SOURCES.md` (~248, ~252-253), `docs/wcl-supported-collection.md` ("The
switch trigger", ~88-97, and the switch list below it), the `src/wcl-probe.mjs` comment
above `shortOfTrigger` (~82-88), and the two raid-config comments in `src/wcl-live.mjs`
that describe the pending switch (above `switchWaitsFor` and above `excludedEncounters`).
The "S2 Mythic" series names and `LIVE_LEADERBOARDS.label` "12.1" stay.

**Gates for the switch commit, run locally in its worktree before committing** (the row-drop
and value-move guards compare the working tree against `HEAD`):

```powershell
foreach ($s in 'test:quiet','build','validate') { npm run -s $s; if ($LASTEXITCODE -ne 0) { throw "npm run $s failed" } }
node src/check-refresh.mjs --manifest
```

- The loop must throw nothing. `test:quiet` reads `fail 0`, and its only skip is
  freeze-season. `build` rewrites `dist/index.html` (2 lines in the simulation); commit the
  rebuilt file.
- `check-refresh --manifest` is informational here, as in step 5 of the local-run skill.
  It fails on exactly one line, `run-manifest: startedAt ... is Nh old — not a fresh write
  from this run`, because the committed manifest is the last nightly's. It fails the same
  way on unmodified master (measured on `38dc0fe` and on the simulated switch, 2026-09-26).
  Any other line is real, for example a row drop over `maxRowDropPct` 0.25 (which takes no
  ack) from deleting sparse partition-1 rows.
- **Not run locally: `node src/check-wcl-metrics.mjs`.** It needs a `wcl-fetch/evidence.json`
  under 24 hours old from a credentialed collection, bound to a digest of the committed WCL
  rows. Without one it stops with `ENOENT ... wcl-fetch\evidence.json`, on unmodified master
  as on the switch. Do not make one for this commit. The switch is a reviewed code edit to
  gatekeeper code (`src/wcl-live.mjs` is in CODEOWNERS), and the local-run skill forbids
  editing gatekeeper code as part of a data run. The collection belongs to the nightly.

The strict gates run in the first nightly after the switch, and that nightly is the real
test of the switch. Its collect job runs the new recipe, and its publish job runs
`check-wcl-metrics --manifest` ("Verify collected metrics and complete official note
intake") and `check-refresh --manifest` (Gate 3). After the push rule and the merge, read
that nightly:

```powershell
gh run list --workflow nightly.yml --limit 1
gh run view <id>
gh run view <id> --log | Select-String -Pattern 'WCL: (success|partial|network-failed|oauth-failed|no-credentials)'
git fetch origin
node -e 'const g=f=>JSON.parse(require(''child_process'').execSync(''git show origin/master:''+f,{maxBuffer:1e9}).toString());const c=g(''data/wcl-coverage.json''),m=g(''data/run-manifest.json''),s=g(''data/specs.json''),r=m.sources.find(x=>x.source===''wcl-leaderboard-raid''),p={};for(const x of s)for(const t of x.metrics||[])if(t.bracket===''raid''&&t.sample&&t.sample.kind===''leaderboard-entries'')p[t.sample.partition]=(p[t.sample.partition]||0)+1;console.log(''raid encounters:'',c.encounters.raid.length,''| raid cuts:'',c.cuts.filter(x=>x.bracket===''raid'').length,''| raid rows by partition:'',JSON.stringify(p),''| manifest:'',r.result);console.log(r.detail)'
```

Pass means: every job and step in `gh run view` is green; the `WCL:` line reads
`wcl-leaderboard-raid: success`; the `node` line prints `raid encounters: 9 | raid cuts:
360`, only the new partition id under rows by partition, and manifest `success`. Run the
`git fetch` only after the nightly has published. If the nightly is red on
`check-wcl-metrics` or Gate 3, read its agent transcripts before changing anything.

Expect to give `value_move_ack` on that nightly if a family median moves more than 35%.

**Cost of the ninth boss**, computed from `LIVE_LEADERBOARDS` in `src/wcl-live.mjs`
(40 specs, `batchSize` 5, so 8 ranked batches per encounter; a budget check before every
16th batch plus one at the start; one zone discovery per bracket):

| | Today (16 encounters) | After the switch (17) |
| --- | --- | --- |
| Ranked batches | 128 | 136 |
| Budget checks | 8 | 9 |
| Collector requests | 138 | 147 |
| Requests including `fetch-wcl.mjs`'s own rate check | 139 | 148 |
| Budget the collector requires at start (1 point per cut + 50 reserve) | 690 | 730 |

That is 9 more requests. Each request waits `pauseMs` 600 first, which adds 5.4 s. Measured
time for the whole two-bracket WCL step in the nightlies of 2026-09-13 to 2026-09-16 was
124-137 s for 139 requests, about 1 s per request. So the ninth boss adds about 9 s, for
about 2.2-2.4 minutes in total, well inside the 12-minute `maxRunMs`. The per-request time
is an inference from those step durations, not a per-request measurement.

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

The counts below are dated measurements of the 8-commit branch (head `fddd2a6`). Pass totals
will differ once master gains tests; the fail counts are the part that matters.

- Launch branch alone: `instructions:check` passes; `test:quiet` 701 tests, 673 pass,
  27 fail, 1 skip; build and validate fail on `unknown source ptr-preview` only.
- Launch branch plus the B4 edits only: `test:quiet` 1 fail, the placeholder guard; build,
  gearing:build and validate green.
- Launch branch plus B4 and B5 (simulation date 2026-09-25): `instructions:check`,
  `test:quiet` (0 fail; the only skip is freeze-season; UI invariants ran), build,
  gearing:build and validate all green.
- The B2 lines were run under `powershell.exe` 5.1 in scratch clones of a local bare repo
  standing in for GitHub (never GitHub itself). Its master was built as `38dc0fe`, then
  this runbook squash-merged, then #81 squash-merged, then one nightly-style commit adding
  a `data/history` snapshot. (1) Branch still on `c80a9f7`: the `--onto` form ran; the
  branch ended 0 behind with exactly the 8 launch subjects; before the rebase the B7 hash
  differed from the B1 hash, and after it they matched (`fc.exe`: no differences).
  (2) Branch first rebased onto the #81 squash ("Before launch day"), then the nightly
  commit landed: B2 took the plain `git rebase origin/master` form, with the same end
  state and matching hashes. (3) #81 not merged: the `--onto` rebase stopped on a conflict
  in `test/digest.test.mjs` and the throw fired. The behind-count and subject checks both
  throw on an un-rebased branch. The `gh` line throws today, because #81 is still OPEN.
- A worktree registration whose directory was deleted makes `git worktree add` fail with
  `already used by worktree`; after `git worktree prune`, the same `add` succeeds, and
  `git worktree remove` on a clean worktree keeps the branch ref.
- The C2 local gate lines were run under `powershell.exe` 5.1 on the launch branch with B4
  and B5 (loop green; `--manifest` failed only on the `startedAt` line). The post-nightly
  `node` read was run under 5.1 against a scratch clone's `origin/master`, where it printed
  today's shape (`raid encounters: 8 | raid cuts: 320`, all rows on partition 1, manifest
  `parse_error`). The `WCL:` log filter was run against the 2026-09-25 nightly's log, where
  it prints that night's single `WCL: partial` line.
- A live `fetch-official-notes` (live-hotfixes only, 118 class sections, none unresolved),
  adopted as the ledger, passes `check-official-notes` against `--base=origin/master` and
  `--base=HEAD`, both of which still hold the `ptr-preview` block (config-only iteration).
- The B1/B7 payload hash is identical on master `38dc0fe`, on #81's head `c80a9f7`, on the
  8-commit launch branch, on it with B4 applied, and on it with B4 and B5 applied.
  `buildPayload` differs from #81's head only in `officialNotes`; `meta` is identical.
  `data/history` is untouched.
- `check-refresh --age` lists the same 26 keys on `38dc0fe`, on the 8-commit branch alone
  and on it with B4 and B5.
- B4 and B5 were run under `powershell.exe` 5.1 exactly as written (B5 with a simulation
  date, then all gates green). B5 is ASCII-only on purpose: a literal em dash in a PS 5.1
  argument is mangled before node sees it.
- The C2 switch was re-simulated on 2026-09-26 on the 8-commit launch branch with B4 and
  B5 applied (0 fail before the switch), with a hypothetical partition `{ id: 2, name:
  "12.1.5" }`. Scenario A kept the earlier simulation's pins, with 227 changed as a single
  literal and `test/validate.test.mjs` untouched: 4 fail (the provenance test at 1032 on
  its 1034 case, `wcl-live.test.mjs` 227, and the 2 wcl-probe tests). Scenario B applied
  every row of the table (227 split per bracket, 1034 and 1045 moved to 99): 2 fail, the 2
  wcl-probe tests only; build and validate pass; build changes 2 lines of
  `dist/index.html`. After a simulated first nightly that moved every stored raid
  leaderboard row to partition 2, `npm run validate` passes, and the 1045 case fails if it
  is left at id 2 (with the message `raid.reviewedPartitions`); moving it to 99 fixes it.
  The coverage command printed `unattempted cuts added: 40`.
- `node src/check-wcl-metrics.mjs` stops with ENOENT on `wcl-fetch\evidence.json`, and
  `check-refresh --manifest` fails only on the stale `startedAt` line, both on unmodified
  master `38dc0fe` and on the simulated switch.
- Before launch: the patch-notes host allowlist refuses worldofwarcraft.blizzard.com.

Inferred, not observed:

- That WCL will add a 12.1.5 partition to zone 53 (it did for zone 46 at every patch), and
  its id and name. The real values come from the probe.
- Where WCL files Kith'ix (zone, difficulty, size) and when Mythic opens.
- The release date: not announced as of 2026-09-26.
- That the auto-started nightly after the merge is healthy; B10 checks it.
- That the first nightly after the C2 switch passes `check-wcl-metrics` and Gate 3 with the
  new recipe. Those gates cannot run locally for the switch commit; C2's post-nightly read
  checks them.
- The ninth boss's added run time (about 9 s), which is derived from step durations, not
  measured per request.
