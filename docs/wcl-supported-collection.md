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

- Raid: zone 53, partition 1 (12.1), Mythic difficulty 5, size 20. Eight reviewed raid
  bosses; Nymrissa Wavecaller, a world boss listed in the same API zone, is excluded.
- M+: zone 55, partition 1 (Season 2), difficulty 10, size 5, exactly key level +10.
  API bracket 9 selects +10 because bracket numbering begins at 1 for key level 2.
  Both metadata and every returned row's key level must match. Eight dungeons.
- DPS and tanks use `dps`; healers use `hps`, always with class/spec filters.
  DPS retains WCL's attribution; it is not relabeled raw damage or rDPS. Tank damage
  does not measure defensive strength, and healing throughput is not overall healer
  quality. These values never enter tier-letter consensus or the frozen forecast.
- Page 1 is explicit. `count` is page-local. `hasMorePages` discloses truncation.
  Empty or fewer-than-10 cuts are explicit omissions, retaining any older observation.
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
Five spec aliases share each request: at most 128 ranking requests, plus zone discovery
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
