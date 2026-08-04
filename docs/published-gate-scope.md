# Published-date gate — scope

*2026-08-04. Both owner decisions locked in-session (Riley): deterministic evidence step +
staleness threshold; severity split by violation class. Implementation is a
CODEOWNERS-boundary change (gate contract + gatekeeper code + workflow), so it lands as
an owner-merged interactive PR, not nightly-agent work.*

**STATUS: BUILT, same day, same PR** (owner direction: "put implementation in the same
one"). Everything in §Design shipped as specced — `src/fetch-published.mjs` +
`checkPublished()` / the freshness sweep in `check-refresh.mjs`, the contract block,
nightly.yml wiring, skill + SOURCES.md notes, 10 new tests. Two verifications beyond the
suite: the real manifest/age gates ran green against the committed data, and the fetcher
ran against the live pages from the dev sandbox (whose egress proxy 403s icyveins —
which exercised the degradation path end to end: unresolved evidence → degraded notice,
never red). One deliberate delta from §3: evidence `problems[]` recorded by the fetch
step (a published block with no pages probe / a page with no URL) also fail `--manifest`
red — the fetch step sees config bugs the gate's own self-check can't, and both are the
same "gate pointed at nothing" class.

## The incident this closes

Found 2026-08-04 during the local run (full account: `.claude/skills/refresh-tiers/log.md`,
2026-08-04 entry). Icy Veins rebuilt its 12.1 PTR tier lists on **08-02** ("Update #4",
22 tier moves, both TBDs resolved). For the next four runs the nightly's manifest recorded
`result: success` for `icyveins-ptr` while asserting the page's published date "is STILL
2026-07-26" — and stored ratings sat frozen at their 07-31 state. The page carried exactly
one date string (JSON-LD `dateModified: 2026-08-02`, body line "Last UPDATED - 2nd of
August"), so this was not a misread of an ambiguous page: the agent repeated its stored
belief instead of re-reading, and nothing could contradict it.

Why nothing caught it:

- `snapshot` (when WE fetched) is cross-checked by `check-refresh --manifest` — it was
  honestly fresh every night. **`published` (what the PAGE says about itself) is gated by
  nothing.** The contract row's own comment documents the hole: "content staleness
  UPSTREAM is not gated here."
- Zero rating movement is legitimate by design ("zero movement means nothing moved —
  that's honest, not broken"), so frozen ratings alone can never alarm.
- `validate.mjs` pins `published` format and `published ≤ snapshot` — both held. A stale
  value satisfies every current invariant.

Cost of the gap: a 22-move rebuild of a projection input (`ptrTierRead`, w=0.25 on every
M+ forecast) went missing for two days, caught only because Riley happened to look.

## Decisions (locked 2026-08-04)

**D1 — Verification: deterministic evidence step + staleness threshold.** The fetch-wcl
pattern, applied to page self-dating: a small deterministic CI step reads each
published-bearing page before the agent runs and records what the page actually says;
the gate cross-checks the agent's stored value against it. The threshold is the backstop
for nights the page is unreachable. Rejected alternatives: threshold-only (detection waits
until a full upstream cycle is missed — ~2–3 days late, exactly what happened); evidence
step owning the field outright (strongest, but moves page parsing into deterministic code
that a layout change breaks, and changes the refresh-tiers flow — revisit if the
cross-check red-flags an agent more than rarely).

**D2 — Severity: split by violation class**, matching the repo's existing mapping:

| Violation | Class | Lands |
|---|---|---|
| Stored `published` ≠ what the page says (evidence mismatch) | Dishonesty — same class as WCL row cross-checks | `check-refresh --manifest` → **publish gate RED**, night does not ship |
| Stored `published` regressed vs last committed | Dishonesty (no evidence needed) | `--manifest` → **RED** |
| Stored `published` older than the source's threshold | Lag — same class as every other max-age | `check-refresh --age` → **heartbeat alert** (auto-closing issue + red heartbeat run); nightly still publishes |
| Evidence step unreachable / parse failure | Infrastructure, not agent fault | Recorded in evidence; `--manifest` prints a notice and **degrades to threshold-only** — never red for our own fetch failing |

## Design

### 1. Contract (`data/required-sources.json` — CODEOWNERS)

New **optional** per-requirement block, config-only generalization (a 12.2-cycle source
joins by adding the block, no code):

```json
"published": { "maxAgeDays": 9 }
```

- Attaches to a requirement whose `date.sourceId` pages carry `published`
  (today: only `icyveins-ptr`).
- **9 days for icyveins-ptr**: the page rebuilds weekly (Sundays 14:00 CEST), so its
  published age runs 0–7 days when healthy; 9 = one full cycle + 2 days slack. In the
  incident (stored 07-26), the alarm fires 08-04 — the day Riley caught it by hand.
- Contract self-check: a `published` block on a requirement whose registry pages carry no
  `published` field fails `--manifest` red (a gate pointed at nothing is a config bug).
- Update the icyveins-ptr row's comment: "content staleness UPSTREAM is not gated here"
  becomes a pointer to this gate.

### 2. Evidence stage (`src/fetch-published.mjs` + test — new, deterministic)

- Runs in nightly.yml **before the agent**, beside `fetch-wcl.mjs`. No credentials, no
  new secrets; fetches only registry URLs of published-bearing pages (from
  `sources.json` × the contract's `published` blocks).
- Extracts, per page, **two independent readings**: JSON-LD `dateModified` and the body's
  "Last UPDATED - Nth of Month" line (both parsers already proven in the refresh-tiers
  recipe; the deterministic forms get fixture-HTML unit tests).
- Writes `published-evidence/evidence.json`: per page `{ sourceId, url, fetchedAt,
  httpStatus, dateModified, lastUpdatedLine, resolved, note }`.
  - `resolved` = the canonical date: `dateModified` when present; else the parsed body
    line; disagreement between the two records both and uses `dateModified` (the
    refresh-tiers recipe's own precedence), with `note` flagging the disagreement.
  - Unreachable or neither parser matches → `resolved: null` with `httpStatus`/`note` —
    a recorded degradation, never a fabricated date.
- Uploaded as its own artifact before the agent starts (the wcl-fetch pattern), so the
  publish gate consumes pre-agent truth the agent cannot have touched.

### 3. Gate wiring (`src/check-refresh.mjs` — CODEOWNERS)

**`--manifest` (publish gate):**
- Evidence present with `resolved` ≠ stored `published` → **RED**, printing both values
  and the page URL. Any mismatch is red, both directions: stored-older is the incident;
  stored-newer is either an overclaim (must not ship) or the one rare race (page updated
  in the minutes between the evidence step and the agent's fetch — self-heals next night
  when both re-read; upstream rebuilds Sundays ~12:00 UTC, the nightly runs 10:37 UTC,
  so the window is practically empty).
- New stored `published` < last committed `published` → **RED** (ratchet; needs no
  evidence — same committed-vs-new comparison the row-drop limit already does).
- Evidence `resolved: null` or file absent (local runs, probe dispatches) → printed
  notice, gate degrades to the ratchet + threshold. Missing evidence is never red — the
  same rule the WCL evidence check follows.

**`--age` (heartbeat):**
- `today − published > maxAgeDays` joins the existing per-source staleness sweep: same
  violating-set alert issue, same auto-close on recovery, same "comment only when the
  violating set changes" discipline.

### 4. Workflow (`.github/workflows/nightly.yml` — CODEOWNERS)

One step inserted before the agent stage + one artifact upload. No secrets, no new
permissions. `freshness.yml` needs no edit — it runs `--age`, which picks the new check
up from the contract. Note: editing nightly.yml auto-kicks a nightly via
dispatch-nightly.yml's path filter — expected, and a live end-to-end test of the gate.

### 5. Agent guidance (`.claude/skills/refresh-tiers/SKILL.md` — agent-editable)

Add to the era-verify step: `published` must be re-read from the page **every** run and
never carried forward — a stale value now goes red at the publish gate the same night.

## Failure modes considered

| Mode | Behavior |
|---|---|
| Page unreachable from CI | Evidence records it; gate degrades to ratchet + threshold; threshold catches a real miss within 9 days |
| Icy Veins layout change breaks both parsers | `resolved: null` → visible notice, not red (our parser, not the agent, failed); if the page then genuinely updates unseen, the threshold still fires — self-healing backstop |
| Page updates between evidence step and agent fetch | One red night, self-corrects the next; window practically empty (see §3) |
| Upstream legitimately quiet > 9 days | Heartbeat alert prompts a human look; publish unaffected — exactly the severity split's intent |
| Agent writes a plausible future date | `validate.mjs` already pins `published ≤ snapshot`; within that bound, evidence mismatch goes red |

## Tests

- `test/fetch-published.test.mjs`: both extractors against fixture HTML (JSON-LD present /
  body-line only / both disagreeing / neither), unreachable handling.
- `test/check-refresh.test.mjs` additions: mismatch red (both directions), ratchet red,
  missing-evidence degradation notice, threshold fires at 9d and not at 7d, config
  self-check red (published block with no published-bearing pages).
- No UI, no payload change: PROJECTION_VERSION / RANK_VERSION untouched.

## Out of scope

- Gating `snapshot` further (already cross-checked) or any metric `asOf` (coverage-dated
  by the existing manifest gate).
- Auto-ingesting on mismatch — the gate proves staleness; the refresh itself stays the
  agent's job with its full verification discipline.
- Extending evidence to other fields (era self-identification, row counts) — revisit only
  if this gate's pattern proves itself and a concrete incident motivates it.
