# Archived run logs — the `.agents/` runtime, 2026-06-30 → 2026-07-09

These are **verbatim run logs from a second agent runtime** that drove this tracker's
nightly for roughly ten days in early July 2026. They are archived here because they were
the **only surviving copy**, and they lived in a gitignored directory with no backup.

## Why they exist at all

The repo carries two parallel skill trees:

| tree | tracked? | role |
|---|---|---|
| `.claude/skills/` | yes | the canonical, current skills — the source of truth |
| `.agents/skills/` | **no** (gitignored) | a machine-local mirror for a second runtime |

`.gitignore` excludes `.agents/` wholesale, with `AGENTS.md`, because that tree contains
the gitignored WCL credentials file. The side effect is that anything else in there —
including run history — has never been backed up by anything.

## What was actually unique

Checked against **all 95 tracked revisions** of the corresponding `.claude/skills/*/log.md`
files. These dates appear in **no tracked revision, ever**:

| log | dates absent from the tracked history | entries |
|---|---|---|
| `ptr-watch-log.md` | 2026-07-01, 07-03, 07-04, 07-05, 07-06, 07-07 | 19 |
| `watch-creators-log.md` | 2026-07-01 through 07-09, complete gap | 18 |

So this is not a duplicate of the canonical logs — it is a genuine ten-day hole in the
project's recorded history, filled.

**Two other logs were checked and deliberately NOT archived.** `refresh-metrics` and
`refresh-tiers` also carry July entries in `.agents/`, but every one of their dates is
already present in the tracked `.claude/` logs, usually in greater detail (e.g. 2026-07-08
has 18 mentions in the tracked refresh-metrics log against 2 in the mirror). Copying them
here would have added ~14 KB of duplicated content and nothing else. `paste-discord`'s
mirror log is byte-identical to the tracked copy and was excluded for the same reason.

## What these files are and are not

- **Verbatim.** Copied without edits, merges, reordering or trimming. An archive that has
  been tidied is no longer evidence.
- **NOT canonical.** `.claude/skills/<skill>/log.md` remains the live, authoritative log
  for every skill. Nothing reads these files; no code path depends on them. Do not append
  to them and do not merge them into the live logs — the two histories were written by
  different runtimes about partly different runs, and interleaving them by date would
  invent a single timeline that never existed.
- **Historical in content.** They describe the pipeline as it stood in early July 2026 and
  are wrong about the project as it stands now — that era predates the 2026-07-14 security
  audit (which removed WCL credentials from the nightly agent entirely), the 2026-07-31
  WoWMeta retype from tier-list to metrics, and the 2026-08-08 local-run transcript-breadth
  rule. Read them as a record of what happened, never as instructions.

## Provenance

- Source: `.agents/skills/{ptr-watch,watch-creators}/log.md` on Riley's local machine.
- Archived 2026-08-13, during a reconciliation of the `.agents/` mirror against `.claude/`.
  That reconciliation overwrote the mirror's stale `SKILL.md` files but deliberately left
  every `log.md` untouched, which is how this history was found rather than destroyed.
- **Credential-scanned before commit**: both files were checked against the literal
  `wclClientId` / `wclClientSecret` values from the live local config, and against generic
  patterns for bearer tokens, API keys, passwords and UUIDs. Zero hits in either file.
