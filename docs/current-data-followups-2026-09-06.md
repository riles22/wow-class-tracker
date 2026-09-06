# Current-data follow-ups — September 6, 2026

Compare, Compare all and Ladder now prioritize current per-encounter WCL leaderboard
samples. Boss/dungeon controls retain the complete reviewed inventory, including
encounters with insufficient logs. Historical population aggregates remain available
as an explicitly labeled archive. Collection verification and latest included log dates
are separate; ranks remain within role, and measurements never become letter grades.

`data/wcl-coverage.json` contains 640 sanitized spec/encounter outcomes derived from
the deterministic collector. The initial receipt comes from successful nightly run
34037148773: 527 usable samples and 113 insufficient cuts. No new WCL request or
manifest rewrite was needed to publish that existing evidence. Every subsequent
nightly writes coverage and independently checks its exact match to the pre-agent
receipt. Missing credentials or failed collection cannot claim verified empty data.

The Thursday 08:37 UTC gearing workflow verifies 80 bonuses, Catalyst sources, loot,
65 tier items and 316 allocation records. Its report binds source evidence to the
scoped published facts; the daily heartbeat flags failed, changed or missing checks,
or checks older than nine days. Reward-level tables and original harvest dates retain
their separate review requirements. This implementation found and corrected 22 item
records and nine allocation fingerprints; see
[the source reconciliation](gearing-source-reconciliation-2026-09-06.md).

Transcript collection now has bounded requests, persistent usage and retry state,
encrypted cache reuse, and explicit handling of uncertain requests. The initial
production dispatch must use `transcript_state_initialize=true`; later runs restore
existing state. No subscription or new monthly allowance was assumed. See
[transcript operations](transcript-operations.md).

The prepared Archon access request was sent September 6 at 19:04 UTC after approval
of these five follow-ups. Gmail confirmed Sent. No paid service was authorized.
Dependency PR #57 was updated against current master, passed the full browser matrix,
and merged as `5fec496f0be5bd2857947b08812d0856bc5a21b4`.

Cross-review also fixed malformed-source HTML serialization in gearing and removed
raw provider errors from public transcript state. Local validation passed 545 tests:
544 passed and one expected frozen-season skip; UI invariants ran. Focused current-WCL
tests additionally passed in Chromium, Firefox and WebKit at desktop and phone sizes.
The existing eleven blocked-source freshness alerts remain visible.
