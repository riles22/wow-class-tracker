# Audit release and refresh recovery — September 5, 2026

Riley approved all recommendations in the [audit handoff](audit-fixes-2026-09-05.md), including publication. All thirteen audit findings are now addressed in code or by the approved source policy. This release preserves the September 5 nightly data and adds fresh gearing guides, recurring maintenance, and publication safeguards.

## What is fresh, and what still fails

All **120 guide records** were fetched successfully on September 5: 40 each from Icy Veins, Wowhead, and Method. Their published content dates remain separate from their verification dates. Icy Veins contains 55 stat-priority groups and 1,884 BiS entries; Wowhead 83 and 628; Method 46 and 1,670. Excluding publication-date-only changes, content changed for 17, 9, and 8 specs respectively. All three providers passed the complete-roster, source-identity, receipt, and unexpected-loss publication checks.

All gearing freshness checks now pass. The obsolete structural harvester has been replaced with a deterministic check of the tracker roster, tier-set fields, and reviewed armor/weapon provenance. Its receipt records when those local inputs were checked and their hashes. Every per-spec capability value is unchanged. Historical evidence dates and the 12.0.7 stat fallback remain dated; checking local consistency does not claim a new external fact. The historical fallback is no longer treated as a live feed, while the three current Season-2 guide feeds retain their freshness checks.

**Eleven source freshness checks remain red: nine Archon feeds and two WCL feeds.** Their active expiry thresholds were not relaxed. Current probes reproduce the upstream failures:

| Provider | September 5 verification | Consequence |
| --- | --- | --- |
| Archon | The normal Heroic raid URL returns HTTP 403 with a Cloudflare challenge; the M+ URL returns HTTP 200 with a human-verification wall. Neither contains the expected data payload. | The last verified Season-2 letters remain dated August 25 and contribute under the approved retention policy. Numeric feeds remain dated August 24/25. The older encounter archive is Season 1 and stays quarantined. No challenge was bypassed. |
| Warcraft Logs | Official OAuth and GraphQL work. Current raid zone 53 and M+ zone 55 return internal errors for rDPS while DPS controls return 100 rankings each. One ordinary public GET to each current zone's HTML statistics URL also returns HTTP 403 with a Cloudflare challenge. | No new median rows can honestly land. Player leaderboards and raw DPS do not substitute for the existing per-parse rDPS/HPS median series. Diagnostics detect partial recovery and report transport failures separately. |

Sanitized, timestamped probe results and guide comparisons are saved in [refresh-verification.json](audit-evidence/2026-09-05/refresh-verification.json). No tokens, raw response bodies, or player ranking lists are included. Archon's [API documentation](https://www.archon.gg/wow/articles/help/API-documentation) points to the WCL interface, rather than a separate tier-list API; a provider-approved export or restored public access is still needed for those feeds.

## Regular refresh and accepted decisions

- **Nightly tracker:** keeps its existing schedule, adds a bounded public Archon availability probe, and uses current-season WCL diagnostic queries. Recovery evidence informs the agent without counting as fresh game data. A deterministic gearing structural check/build runs before the publication gates.
- **Weekly gearing:** `.github/workflows/gearing-refresh.yml` refreshes all three guide providers every Tuesday at 08:37 UTC and supports manual dispatch. It shares the nightly publisher lock. Incomplete providers retain their published bytes; verified successful providers can publish after validation. Three consecutive transport failures stop that provider early. Any incomplete provider leaves the workflow red with diagnostic evidence.
- **Archon retention:** the contract, refresh instructions, and visible tracker explanation now agree: retain original dated observations during the outage and keep freshness alarms active. The explanation derives the contributing sources and dates from the data rather than asserting a fixed source count.
- **Secret protection:** repository secret-scanning alerts and push protection are enabled. The open-alert query returned zero alerts at verification.
- **Branch history:** active ruleset `Protect master history` (ID `22340421`) blocks deletion and force pushes on `master`, with no bypass actors. Ordinary validated publication remains possible. Required-PR rules are deferred until a compatible nightly publishing route is designed, as recommended in the original audit.
- **Architecture:** keep the existing lightweight, offline-capable application. The audit did not justify a framework migration or broad rewrite.

## Publication safeguards

In addition to the original filename-execution fix, the nightly now checks the trusted workflow event commit against current master before overlaying a refresh artifact. Intervening edits to data or permitted skill logs stop publication, protecting newer owner changes. Code-only advances can proceed through the normal validation gates. A rejected push fails visibly; it no longer rebases and republishes data without repeating the full validation path.

The guide publication gate requires complete, internally consistent verification receipts and rejects unexpected losses exceeding 25% of specs, priority groups, or BiS entries. Staging uses explicit paths. Source/policy changes and the refreshed data are committed separately to make the owner-approved contract change reviewable.

## Verification and limits

- `npm run test:quiet`: **441 tests; 440 passed, zero failed, one expected skip**. Browser invariants ran locally, including the new retained-source explanation and the existing CSP, hostile-input, keyboard, mobile, and report checks.
- Both production builds and `git diff --check` passed. Guide admission and gearing structural checks passed. The refresh manifest gate passed; the independent age gate correctly reported the eleven upstream failures above.
- Fresh independent review of both publication workflows and the refresh-base/guide-admission helpers found no actionable security or data-loss defect. Isolated Git regressions exercised base divergence and publication conflicts; local tests do not emulate the GitHub artifact service.
- This is a **partial refresh**, so the prior full nightly's `data/run-manifest.json` remains intact. Its historical prose incorrectly calls Archon a three-source consensus exclusion and describes the retained encounter archive as Season 2. The contract and future-run instructions now correct both assertions; the old run record has not been rewritten.
- Root spec values, model weights, consensus membership, and frozen forecast contents are unchanged from the merged September 5 nightly. The snapshot command produced no additional movement record because root game values did not change.
- An upstream outage cannot be turned green by a successful build or by changing an observation's date.

## Released verification

[PR #58](https://github.com/riles22/wow-class-tracker/pull/58) merged as `dd300cd4c7e420e561411b5549a93bde9b95f657`. [Tests including browser invariants](https://github.com/riles22/wow-class-tracker/actions/runs/33977466608) and [Pages](https://github.com/riles22/wow-class-tracker/actions/runs/33977466611) passed for that exact commit. The public tracker, gearing page, and forecast report each returned HTTP 200, matched the released HTML after line-ending normalization, and had no browser errors or page-level overflow at 390px.

The [first weekly gearing run](https://github.com/riles22/wow-class-tracker/actions/runs/33977469337) also succeeded. Each provider verified all 40 specs from GitHub Actions, with no absences. It captured a newer Wowhead potion recommendation, passed every publication gate, and published `31b37cd26243833feb149fb735330e3120978380`. [Browser CI](https://github.com/riles22/wow-class-tracker/actions/runs/33977989889) and [Pages](https://github.com/riles22/wow-class-tracker/actions/runs/33977988914) passed for that exact commit. Older documentation claiming Wowhead was unreachable from CI is no longer an accurate description of the tested guide route.

The live check also prompted a small footer clarification: guide verification has its own always-visible date, separate from the older loot/rule datasets. Missing guide verification is disclosed rather than omitted from the date calculation.

The [GitHub freshness heartbeat](https://github.com/riles22/wow-class-tracker/actions/runs/33978158360) ran against the published weekly update and correctly failed only for the eleven Archon/WCL feeds. [Alert #53](https://github.com/riles22/wow-class-tracker/issues/53) now reflects that reduced set; no gearing check remains in its fingerprint.
