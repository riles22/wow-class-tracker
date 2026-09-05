# Five approved follow-ups — September 5, 2026

The tracker now uses one set of operating procedures, deterministic collection for
two frequently refreshed numeric sources, a separate 12.1.5 notes preview, an
official-note revision ledger, and verification in three browser engines and after
public deployment. The live S2 model and frozen 12.1 forecast remain unchanged.

## Instructions

`CLAUDE.md` and `.claude/skills/*/SKILL.md` are canonical. Tracked `AGENTS.md` and six
small `.agents` skill adapters link to them. Both test commands first run a drift
check; `npm run instructions:sync` regenerates discovery metadata. Local credentials
and scratch remain ignored. The ignored local WCL credential fallback is now
documented in the canonical procedure. Local catch-up instructions preserve a dirty
working tree and recognize the weekly guide workflow.

## Numeric collection

`fetch-stable-metrics.mjs` produces isolated receipts and apply-metrics input.
Murlok requires 40 specs across all three roles, correct current-season identity,
ordered numeric values, and its source-owned update timestamp. Mythicstats reads
the representation chart from `/period/latest`, with period/season, role-share and
roster checks. Omitted nonzero observations block replacement; an existing omitted
zero remains unchanged. Undated unchanged observations retain their previous dates.

Live verification at 18:03 UTC reproduced 40 Murlok observations and 39 Mythicstats
observations (period 1079, printed shares totaling 99.9% after rounding). All values
and dates already matched published data, so no numeric data was rewritten. Murlok's
actual source date remains September 2 despite its relative update label.

The nightly saves receipts before the agent and downloads the separate trusted
artifact after agent output in the publisher. `check-stable-metrics.mjs` verifies
the baseline, digest, exact values/dates and failed-source preservation. The reviewed
Mythicstats registry correction changes its documented transport and public source
link; it is an owner-reviewed registry edit, not permission for collectors to alter
registry structure.

## Official notes and preview

`fetch-official-notes.mjs` reads the official hotfix compilation (topic 2336376) and
12.1.5 development notes (topic 2344395) through ordinary public Discourse JSON.
Post revisions and structured class-section hashes catch edits to older posts.
The ledger requires applied references, explicit irrelevant reasons or unresolved
review items. Removed sections retain a review obligation. A separate trusted
artifact lets the publisher verify the complete current inventory and references;
unresolved sections fail publication. The heartbeat detects intake verification
older than 48 hours, including when other sources keep refreshing successfully.

The initial ledger accounts for 102 sections: two September 4 live class sections
already applied to the build feed, three 12.1.5 preview sections, and 97 explicitly
identified historical-baseline sections. The latter are not a claim of exhaustive
historical backfill. Any subsequent revision to their content needs a new review.

The Devourer, Marksmanship and Protection Warrior previews are 125 words of
source-backed summaries, displayed with official links, source dates and revision
numbers. They never enter `ptr` writeups, the old build feed, empirical metrics,
consensus or forecasts. `PHASES.ptr` remains null.

## Browser and public release checks

CI runs existing tracker and gearing interaction invariants in Chromium, Firefox
and WebKit. The Pages build produces a separate manifest containing the immutable
workflow SHA and normalized hashes/sizes for `index.html`, `gearing.html` and
`forecast-report.html`. After deployment, a plain-Node job verifies HTTP 200, HTML
content type and exact matching bytes, with bounded timeout/size/propagation retries.
The Pages workflow's existing concurrency lock includes verification. Browsers
remain outside the publishing path, and no dependency was added to the project.

## Remaining upstream limits

Validation before publication: 489 tests, 488 passed and one expected seasonal
skip; the UI invariants ran. All three browser engines also passed their initial
32-check suites. The new phone-preview and hostile-content checks pass, including
preview prose escaping. Workflow YAML parses, the production build and instruction
drift check pass, and independent reviews verified both collection boundaries.
The official-note gate passes with zero unresolved sections.

The same 11 source-age alerts remain visible: nine Archon feeds behind its human
verification wall and two WCL median feeds without a working equivalent S2 recipe.
Retained values keep their original dates and source labels. No threshold, source
typing or forecast weight was changed to hide those outages.
