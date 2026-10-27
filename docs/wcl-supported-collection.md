# Supported Warcraft Logs collection

Reviewed September 5, 2026. The existing client-credentials API works for WoW `dps`
and `hps`. The [official enum documentation](https://rpglogs.github.io/RPGLogsApiSdk/enums/CharacterRankingMetricType.html)
defines `rdps` as FFXIV-only. Earlier diagnoses of a WoW rDPS outage were incorrect.

## Published statistic

Each row is the integer-rounded median of the first **up to 100 leaderboard entries
for one spec on one encounter**, with at least 10 entries required. Rankings may
repeat characters; the collector preserves those entries and does not claim a
unique-player population. This is a capped leaderboard sample, not the population
median, a 95th percentile, or a random sample. Each boss/dungeon remains separate.

- Raid: zone 53, partition 2 (12.1.5) since the reviewed switch of October 26, Mythic
  difficulty 5, size 20. Nine reviewed raid bosses: the eight 12.1 bosses and Kith'ix
  3513, which joined in that switch. Nymrissa Wavecaller, a world boss listed in the same
  API zone, is excluded.
- M+: zone 55, partition 1 (Season 2), difficulty 10, size 5, exactly key level +10.
  API bracket 9 selects +10 because bracket numbering begins at 1 for key level 2.
  Both metadata and every returned row's key level must match. Eight dungeons.
- DPS and tanks use `dps`; healers use `hps`, always with class/spec filters.
  DPS retains WCL's attribution; it is not relabeled raw damage or rDPS. Tank damage
  does not measure defensive strength, and healing throughput is not overall healer
  quality. These values never enter tier-letter consensus or the frozen forecast.
- Page 1 is explicit. `count` is page-local. `hasMorePages` discloses truncation.
  Empty or fewer-than-10 cuts are explicit omissions, retaining any older observation.
- Entries that recorded no damage or healing (amount 0) are skipped and counted (owner
  decision, October 27). The median and `n` cover only the positive entries; the receipt
  and the row's sample record `zeroAmountEntries`, and the drawer says how many sat on the
  page. Before that, one such entry voided its whole cut. A negative amount, or a zero
  ranked above a positive entry, still voids the cut. The probe counts entries the same way.
- The window is the named partition's ranked entries, with mixed run dates and M+
  affixes. No rolling-week claim. `asOf` is the newest included log date; the UI also
  shows the oldest included log and the separate collection time.

Metric names and sample metadata distinguish these rows from all retained historical
WCL series. Old population-median requirements remain unresolved because no equivalent
sanctioned aggregate endpoint has been verified. The new receipts cannot clear them.

## Regular collection and verification

`src/fetch-wcl.mjs` holds credentials only in its deterministic pre-agent workflow step.
`src/wcl-live.mjs` validates live phase, zone, partition, encounter, size, difficulty,
spec identity, key bracket, sorted finite values, pagination shape, and log timestamps.
Five spec aliases share each request: at most 136 ranking requests, plus zone discovery
and repeated hourly-budget checks. Requests pause 600 ms; transport retries once with
a 20-second deadline. Three consecutive failures or the 12-minute total budget stop
remaining queries. A partial response cannot authorize invented or relabeled values.

The collector merges valid cuts, preserves failed/sparse cuts, and emits aggregate-only
`wcl-fetch/updates.json` plus `evidence.json`. No player names, report IDs, or credentials
are saved. These files upload independently before the agent runs. Publication downloads
that copy after the agent's output and runs `src/check-wcl-metrics.mjs`, verifying the
baseline hash, exact updates, cut coverage, manifest claims, and retention of every
historical or unrefreshed WCL row. Canonical schema validation also requires sample
provenance and the correct role/metric relationship.

The new requirements are `wcl-leaderboard-raid` and `wcl-leaderboard-mplus`. The original
`wcl-live-raid/mplus` requirements still describe exact population medians and retain
their unresolved status. Source access and data freshness remain separate facts.

For a local run, load existing credentials without printing them and run the same
collector, then `node src/check-wcl-metrics.mjs --base HEAD`, normal tests/build, and
the local-run snapshot/publication procedure. Keep receipts paired with their original
pre-collection baseline; a later commit is not the same baseline.

Archon's exact tiers, percentiles, survivability, and encounter aggregates are a separate
access question. The [prepared support request](archon-access-request-2026-09-05.md)
asks for a sanctioned feed/export and terms; Riley chose to send it personally. A paid
subscription, indexed page, or schema type alone does not establish aggregate access.

## Partition supersession and the switch

Added September 25, 2026, ahead of 12.1.5. WCL has added a partition per patch to its raid
zones and kept the older ones listed. The September 25 zone probe recorded zone 46 listing
12.0, 12.0.5, 12.0.7 and 12.1; zone 50 listing 12.0.7 and 12.1; and PTR zone 54 listing
12.1 PTR and 12.1.5 PTR. M+ zones do not reliably follow that pattern: zone 43 (The War
Within M+ Season 2) lists a single partition, "Season 2", and other M+ zones add only
seasonal ones such as "Post-Season". Zones 53 and 55 each listed one partition (12.1 and
Season 2). The `default` flag is not a usable signal: zone 46 still marks 12.0.7 as
default, and zone 50 likewise, although PTR zones 52 and 54 mark their newest partition.
The October 26 probe confirmed the raid pattern: zone 53 listed 12.1 (id 1) and 12.1.5
(id 2, marked default), while zone 55 still listed only Season 2.

**The guard (dormant today).** `reviewedPartitions` in `src/wcl-live.mjs` lists every
partition each zone listed at the last review. When zone discovery lists a partition with
an id above the pinned one, or any partition outside that set, the bracket's receipt is
`partial`, carries `supersededBy`, and its detail names the new partition, the pinned one
and what the switch waits for. Rows are still collected from the pinned partition and still
merge; `check-wcl-metrics.mjs` refuses a manifest `success` for that bracket. With today's
zone shape the receipt is unchanged. The drawer shows a reviewed partition's name and falls
back to the bare id for any other.

**The 12.1.5 trigger (owner decisions, September 25 and 26).** The raid bracket was held on
partition 1 until the reviewed switch, which waited for Kith'ix Mythic to open, not for a
set number of resets. The September 25 decision asked for Mythic Kith'ix ranked entries
plus parity on the other 8 bosses, both on the new partition. Parity means every (spec,
boss) cut stored today reaches 10 entries on the new partition. On September 26 the owner
settled the Kith'ix half: any Mythic Kith'ix ranking at the reviewed cut counts ("Kith'ix
just has to exist"), and a Kith'ix cut with fewer than 10 entries simply stays absent. The
probe's `shortOfTrigger` and `atMinimum` counts apply the superseded September 25 reading
(10 or more per Kith'ix spec cut) and are informational. The October 26 probe met the
trigger: zone 53 listed 12.1.5 as partition 2, every stored (spec, boss) cut had 10 or
more entries there, and Mythic Kith'ix at size 20 returned a full first page. M+ has no
recorded trigger; a new zone 55 partition, like the next raid partition, waits for owner
review.
`wcl-probe.yml` (dispatch-only, read-only) makes a trigger observable. It prints each
Midnight zone's partitions with the guard's verdict, then Kith'ix entry counts for every
zone 53 partition, difficulty and size, including size omitted. For each raid partition it
adds per-spec Kith'ix counts at Mythic size 20. For a partition the guard reports it also
prints the reviewed bosses' parity counts, never querying Kith'ix a second time.

**A switch is one reviewed recipe commit, never an agent edit.** The 12.1.5 switch
(October 26; the full checklist is step C2 of `docs/1215-launch-runbook.md`) made these
changes:
- Raid config: point `partition`/`partitionName` at the new partition, append it to
  `reviewedPartitions` (keeping 1), and move 3513 from `excludedEncounters` to `encounters`.
- `validate.mjs` requires each rank pool to sit on one partition. Merge each family
  wholesale from the new partition. A cut that is sparse or fails there would keep its
  partition-1 row and mix the pool, so drop that row or hold the whole family. The October
  26 parity counts found no sparse cut. The switch dropped the 12.1 rows of the four cuts
  that had failed every nightly since October 6 to 12 (the refresh log blames a zero-amount
  entry for the earliest, Feral on The Twin Fangs), so a repeat failure leaves a gap, not a
  mixed pool. Sparse is not the only risk: the first nightly on partition 2 found 19 invalid
  cuts (a zero-amount entry on a board under 100 entries), 9 of them still held a 12.1 row,
  and the all-or-nothing merge refused every WCL row that night. The follow-up commit dropped
  those 9 rows and 15 more whose new board was under one full page. The nightly now does
  this itself (owner decision 2026-10-27). Once a pool has a row refreshed on the pin,
  `partitionRetirements` in `fetch-wcl.mjs` lists the older-partition row of each cut in it
  that WCL answered as sparse or invalid there. The list rides in `updates.json` as
  `retire`, sealed by `updatesSha256`. `apply-metrics.mjs` drops those rows in the same
  merge, `evidence.retired` counts them per bracket, and `check-wcl-metrics.mjs` checks each
  one against the baseline and its cut receipt. An unreachable cut retires nothing, so that
  night's merge still refuses. Zero-amount entries no longer void a cut (same date), so a
  switch commit no longer drops rows by hand.
- The update ceiling and the sample-provenance checks follow the config (40 specs x 17
  encounters = 680 rows). Literal count pins are deliberate tripwires and changed in the
  same commit: `test/wcl-live.test.mjs` (row, cut and batch counts),
  `test/check-wcl-metrics.test.mjs` (the ceiling and its one-more-boss fixture),
  `test/wcl-coverage.test.mjs` (cuts and raid encounters), `test/validate.test.mjs` (its
  unreviewed-partition cases, moved to id 99) and `test/wcl-probe.test.mjs` (the zone
  shape). The committed `data/wcl-coverage.json` must match the new encounter inventory in
  that commit, because `validateWclCoverage` checks it against the recipe, so the switch
  added the 40 Kith'ix cuts as `failed` (not yet collected) for the first nightly to replace.

**Kith'ix outside zone 53 (owner decision, September 25).** The recipe holds one zone,
difficulty and size per bracket, and raid membership follows the Encounter Journal. Had the
probe shown WCL filing Kith'ix outside zone 53 / difficulty 5 / size 20, the switch commit
would have added a per-boss zone/size override inside the raid bracket config. The October
26 probe found it in zone 53 at Mythic size 20, so no override was built.
