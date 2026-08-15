# Context / token audit — 2026-08-15

Prompted by Riley asking whether the tips in Anthropic's "maximizing the value of your
Claude Code sessions" post could be folded into this project's automation.

Short answer: two of them map cleanly, two must **not** be adopted, and the audit turned up
a defect that was never about tokens at all.

---

## 1. The finding that is not about tokens

The `Read` tool has a **hard gate at 262,144 bytes**. Above it a bare `Read` returns *zero
content* — an error string, not a partial view. Measured, not inferred:

```
File content (259.1KB) exceeds maximum allowed size (256KB). Use offset and limit
parameters to read specific portions of the file…
```

There is a second, softer cap at **25,000 tokens** for files that clear the size gate: they
return a proportional first page with a `PARTIAL view` notice. The documented "reads up to
2000 lines" line cap is **not** enforced — a 4,000-line file came back whole.

At audit time, four files we touch every night were past the hard gate:

| file | bytes | over |
|---|---:|---:|
| `data/creator-takes.json` | 544,632 | +282,488 |
| `data/specs.json` | 317,035 | +54,891 |
| `.claude/skills/watch-creators/log.md` | 269,618 | +7,474 |
| (`dist/*.html` — generated, never Read wholesale) | | |

`watch-creators/log.md` was **1.2% over**. Its own SKILL.md tells the agent to consult it;
the agent was getting nothing, and the failure presents as a tool error rather than as
missing data. The other three logs cleared the size gate but blew the token cap, so each
returned a first page only — worst for `refresh-tiers/log.md`, which was chronologically
**scrambled** (newest-first block, then heading entries, then an oldest-first run to
08-05). Its first page was July, while the skill says to read "the last run".

**Still open:** `data/specs.json` and `data/creator-takes.json` remain over the gate. Every
current workflow reaches them through `apply-metrics.mjs` / `apply-ratings.mjs` / `node -e`
rather than a whole-file `Read`, so nothing is broken today — but any agent that tries to
inspect them directly gets nothing back, and the tracker's data only grows.

---

## 2. Where the post's advice actually lands

| Tip | Verdict here |
|---|---|
| Quiet flags on noisy commands | **Adopted** — but not for the stated reason, see §3 |
| @-mention files instead of naming them | **Does not work.** `@path` in `claude-code-action`'s `prompt:` is passed through as literal text — verified against the action source (`prepare-prompt.ts` writes the prompt verbatim; no expansion step exists anywhere in the chain). The working equivalent is a leading `/skill-name`, which *is* injected pre-first-turn |
| Trim what loads at startup | **Adopted in part.** CLAUDE.md (72,857 B) auto-loads every session, and both agent prompts then said "Read CLAUDE.md" — a second copy, twice on a recovery night. Removed |
| Subagents for large-output jobs | **Must not adopt.** `--disallowedTools "Agent,Task"` is deliberate: it is the fix for the 07-15→17 lost nights, where agents backgrounded work and ended their turn |
| `/clear`, `/compact`, `/rewind` | Interactive-only; no headless analogue |
| Shorter sessions beat one long one | Real, but splitting the nightly per-skill would give the single-shot failure mode four chances instead of one. Not taken |
| Set model/effort once at start | Already done via `claude_args` |

Already sound and left alone: no MCP servers in CI (no tool-definition bloat), and the
skills already write large fetches to scratch files rather than stdout.

---

## 3. Two corrections to the audit's own first numbers

Recorded because both were wrong in the direction that would have justified the work.

**(a) Verbose `npm test` is not a ~21k-token sink.** The first pass measured TAP output at
84,423 bytes and assumed it all entered context. It does not: the Bash harness truncates
anything over 30,000 bytes to a 2 KB preview plus a persisted file. So the real cost was
~500 tokens of TAP preamble — plus a mandatory *second* tool call to discover what failed,
and the counts never visible at all. The reporter change is a **legibility** win, not an
economy one, and the commit says so.

**(b) The logs were not costing ~196k tokens.** The biggest one was costing *zero*, because
it was unreadable (§1). The others were capped at ~21k each. The prune's real justification
is restoring readability, not reclaiming tokens.

---

## 4. The pruning premise was refuted, and that mattered

The obvious move — prune the logs to their own stated ~20 entries — rests on the claim that
older entries are narrative. An adversarial pass **falsified it**. The prune range held ~95
flagged hazard items, including parser traps that exist nowhere else in the repo and are
anti-fabrication guards:

- Wowhead writes tiers hyphenated `(S-Tier)`, so a `[SABCDF][+-]?` pattern invents `S-`/`A-`/`B-`
  bands — **13 phantom one-notch moves** that would have entered the consensus and the ▲▼ engine
- the raid-healer page carries **two** `printHtml` calls and the first is a 1.2 KB decoy — 0 rows
  for that page, a silent 33-of-40 raid shortfall under a fresh snapshot date
- a strict tier-label regex missed a trailing space and mapped **16 B-tier M+ specs up to A**
- splitting `"Vengeance Demon Hunter"` on the last space yields class `Hunter`

Every one returned HTTP 200. So the prune was gated behind promoting them: 114 candidates
extracted, adversarially re-checked against the SKILL.md files / CLAUDE.md / docs (which
dropped a large fraction as already-documented, still-inside-the-newest-20, or stale), and
~31 KB landed in the four skills.

Two **active wrong instructions** surfaced during that pass and were fixed:

- `ptr-watch` step 6 said the Dummy Dome fragment doubles each row and to "halve the parse
  count too". Measured 2026-08-05 against zone 46: 27 unique sprites, max duplicate count 1.
  Halving would have written every value and count wrong.
- `watch-creators` step 1 sent budget cuts to `seen[]`, permanently retiring videos nobody
  examined.

---

## 5. Nothing checked CLAUDE.md against reality

`grep -rn "CLAUDE.md" test/` returned **zero hits**, for the file loaded into every session
and believed first by every agent. Three claims had already drifted:

- the Icy Veins **PTR** scale described as "6-band" after `521ceaf` widened it to seven
- `refresh-tiers/SKILL.md` still calling the **live** Icy Veins scale five-band "and includes
  neither S+ nor B+", and drawing a validation backstop from a gap that no longer exists
- the UI-invariant count (24-of-385; actually 25-of-401)

`test/claude-md.test.mjs` now pins the stable numeric claims. The test/skip counts are
deliberately **not** pinned — they move with every added test (this audit moved the total
395 → 401), and CLAUDE.md already says to treat them as stale on sight.

---

## 6. What shipped

| commit | |
|---|---|
| `f5da18b` | `src/quiet-reporter.mjs` + `test:quiet` — 84,423 B → 63 B, counts kept, full `file:line` on red |
| `ea3d170` | agent lane → `test:quiet` (10 sites); both nightly prompts stop re-reading CLAUDE.md |
| `be06e65` | `test/claude-md.test.mjs` + the three drift fixes |
| `5547e6b` | parser traps promoted into the four skills (+31,411 B) |
| `0b76c43` | logs pruned 789,049 → 275,518 B, sorted newest-first, headers corrected |

Stock `--test-reporter=dot` was rejected on purpose: 412 bytes but **no counts**, and a skip
renders identically to a pass. The skill logs record exact figures and CLAUDE.md warns
specifically about misreading the skip count. Hiding those numbers in a project whose
central failure mode is unverified numbers being written down invites fabricating them.

All five deterministic gates keep verbose `npm test`; `test` is not redefined, so pointing
an agent at the quiet lane cannot move a gate.

---

## 7. Still open

- **`data/specs.json` and `data/creator-takes.json` are over the 262,144-byte Read gate** (§1).
- **A `/skill-name` prompt could replace the four `Read` calls** the nightly makes. Verified at
  CLI level (Claude Code 2.1.233, both stdin transports) that a leading slash command injects
  the SKILL.md body pre-first-turn; **not** verified through the action's SDK path. One
  `workflow_dispatch` run would settle it.
- **The duplicate-CLAUDE.md read is inferred, not measured.** Auto-loading makes it
  near-certain and the instruction is removed either way, but one look at an
  `agent-transcripts` artifact would confirm it.
- **CLAUDE.md split** (~24 KB across five moves, each leaving a named pointer) was scoped and
  verified but deliberately **deferred past the 08-18 flip** — it churns the file the flip
  agent reads.
- The nightly's <50% log-retention check will warn once on watch-creators (42%). It is a
  `::warning::`, not a gate.

---

## 8. Process note

This audit was applied to the working tree and then **destroyed mid-flight** by a concurrent
session in the same checkout, which reset the tree and landed its own commits. Roughly 90
minutes of uncommitted work was lost; git could not recover it because nothing had been
committed. It was recoverable only because the expensive intermediate output had been staged
into the scratchpad, outside the repo.

Two lessons, both now in the agent's memory: **commit incrementally** rather than batching an
hour of edits into the working tree, and stage anything expensive to regenerate outside the
repo as you go. Riley runs more than one session against this directory.

One casualty is visible in the history: an unrelated `refresh-metrics/SKILL.md` fix from this
audit (the stale "fetch via r.jina.ai" Mythicstats instruction) was swept into commit
`69b6747`, whose message is about fight-profile sim tiers. Correct content, wrong commit.
