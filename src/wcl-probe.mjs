/* Read-only supported WoW API diagnostic. No HTML scraping, player output, or data
   writes. rdps is FFXIV-only; its failure is not a WoW availability signal.
   Besides zone identity and one smoke cut per bracket, it prints what a reviewed WCL
   partition switch needs (docs/wcl-supported-collection.md): each Midnight zone's
   partitions, with the collector's own supersession verdict for the reviewed zones;
   Kith'ix (3513) ranked-entry counts per partition, difficulty and size; and, per raid
   partition, the per-spec counts the owner's switch trigger reads (Kith'ix at the
   reviewed Mythic cut, plus the eight reviewed bosses on any partition not yet pinned). */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { oauthToken, gql } from "./fetch-wcl.mjs";
import { LIVE_LEADERBOARDS, partitionSupersession, rankingQuery } from "./wcl-live.mjs";

export const KITHIX = { id: 3513, name: "Kith'ix" };
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const entriesOf = cut => Array.isArray(cut?.rankings) ? cut.rankings.length : null;
// WCL reports a bad partition/size inside the JSON scalar with HTTP 200 ("Invalid partition specified").
const blobError = cut => typeof cut?.error === "string" ? { error: cut.error.replace(/[\r\n]+/g, " ").slice(0, 120) } : {};

export async function runProbe({ query, roster, log = console.log, pause = () => sleep(LIVE_LEADERBOARDS.pauseMs) }) {
  let failures = 0;
  const ask = async expression => { await pause(); return query(expression); };
  const transportOk = r => r?.status === 200 && !r.json?.errors;

  const result = await ask(`{ worldData { expansions { id name zones {
  id name frozen partitions { id name compactName default } difficulties { id name sizes }
  encounters { id name } brackets { min max bucket type }
} } } }`);
  if (!transportOk(result)) throw new Error("GraphQL zone discovery failed");
  const zones = (result.json?.data?.worldData?.expansions ?? []).filter(e => /Midnight/.test(e.name))
    .flatMap(e => e.zones ?? []);
  log(JSON.stringify({ zones }, null, 2));
  // One line per zone. `default` is printed as corroboration only: it has lagged the
  // newest partition before (zone 46), so the guard never keys on it.
  for (const zone of zones) {
    const cfg = LIVE_LEADERBOARDS.brackets.find(c => c.zoneId === zone.id);
    log(JSON.stringify({ zone: zone.id, name: zone.name, frozen: zone.frozen, partitions: zone.partitions ?? null,
      ...(cfg ? { recipe: cfg.key, pinnedPartition: cfg.partition, supersededBy: partitionSupersession(zone, cfg) } : {}) }));
  }

  for (const cfg of LIVE_LEADERBOARDS.brackets) {
    const encounter = cfg.encounters[0].id;
    for (const metric of ["dps", "hps"]) {
      const r = await ask(`{worldData{encounter(id:${encounter}){id zone{id}
      characterRankings(metric:${metric},page:1,partition:${cfg.partition},difficulty:${cfg.difficulty},size:${cfg.size}${cfg.keystoneLevel ? `,bracket:${cfg.rankingBracket}` : ""})}}}`);
      const e = r.json?.data?.worldData?.encounter, cut = e?.characterRankings;
      const ok = transportOk(r) && e?.id === encounter && e.zone?.id === cfg.zoneId && Array.isArray(cut?.rankings);
      log(JSON.stringify({ zone: cfg.zoneId, encounter, metric, ok,
        httpStatus: r.status, rows: cut?.rankings?.length ?? 0, hasMorePages: cut?.hasMorePages ?? null }));
      if (!ok) failures++;
    }
  }

  // Kith'ix: where WCL files it (zone, partition, difficulty, size) decides whether the
  // one-config raid recipe can hold it; a null size is the query with size omitted,
  // which is how a flex difficulty would show up.
  const raid = LIVE_LEADERBOARDS.brackets.find(c => c.bracket === "raid");
  const home = zones.find(z => z.id === raid.zoneId);
  if (!home) {
    log(JSON.stringify({ encounter: KITHIX.id, error: `zone ${raid.zoneId} is not listed` }));
    return { failures: failures + 1 };
  }
  const minimum = LIVE_LEADERBOARDS.minSamples;
  const storedRows = roster.flatMap(s => (s.metrics ?? []).filter(m => m.bracket === "raid" && m.sample?.kind === "leaderboard-entries")
    .map(m => ({ key: `${s.class}|${s.spec}`, encounterId: m.sample.encounterId })));
  const storedSpecs = new Set(storedRows.map(r => r.key)), storedCuts = new Set(storedRows.map(r => `${r.key}|${r.encounterId}`));
  for (const partition of Array.isArray(home.partitions) ? home.partitions : []) {
    for (const difficulty of Array.isArray(home.difficulties) ? home.difficulties : []) {
      for (const size of [...(Array.isArray(difficulty.sizes) ? difficulty.sizes : []), null]) {
        const r = await ask(`{worldData{encounter(id:${KITHIX.id}){id zone{id}
      characterRankings(metric:dps,page:1,partition:${partition.id},difficulty:${difficulty.id}${size != null ? `,size:${size}` : ""})}}}`);
        const e = r.json?.data?.worldData?.encounter, cut = e?.characterRankings;
        // A refused combination is an answer here, not a probe failure; only transport counts.
        if (r?.status !== 200) failures++;
        log(JSON.stringify({ encounter: KITHIX.id, zone: e?.zone?.id ?? null, partition: partition.id, partitionName: partition.name,
          difficulty: difficulty.id, difficultyName: difficulty.name, size, httpStatus: r?.status ?? null,
          graphqlErrors: Array.isArray(r?.json?.errors) ? r.json.errors.length : 0,
          entries: entriesOf(cut), hasMorePages: cut?.hasMorePages ?? null, ...blobError(cut) }));
      }
    }
    // The owner's switch trigger (docs/wcl-supported-collection.md): on the new partition,
    // at the reviewed Mythic cut, Kith'ix reaches minSamples entries, and the reviewed
    // bosses reach it for every (spec, boss) cut stored today. Which specs Kith'ix must
    // cover awaits owner confirmation: `shortOfTrigger` applies the strictest reading
    // (every spec holding any stored raid row), while `atMinimum` and `short` let a
    // reviewer apply another. Counts come from the collector's own query; the probe
    // prints them and leaves the call to the reviewer.
    const cfg = { ...raid, partition: partition.id };
    const kithix = await perSpec(cfg, KITHIX);
    log(JSON.stringify({ encounter: KITHIX.id, trigger: "mythic-entries", partition: partition.id, partitionName: partition.name,
      difficulty: raid.difficulty, size: raid.size, minimum, specs: kithix.length,
      withEntries: kithix.filter(c => c.entries > 0).length, atMinimum: kithix.filter(c => c.entries >= minimum).length,
      shortOfTrigger: kithix.filter(c => storedSpecs.has(c.key) && !(c.entries >= minimum)).length,
      short: kithix.filter(c => !(c.entries >= minimum)).map(({ key, ...c }) => ({ ...c, storedRaidRow: storedSpecs.has(key) })) }));
    if (partition.id === raid.partition) continue;   // parity with itself is today's state
    const parity = [];
    // Kith'ix is measured above; once the switch moves it into `encounters` it must not be
    // queried a second time here.
    for (const encounter of raid.encounters.filter(e => e.id !== KITHIX.id)) {
      const cuts = await perSpec(cfg, encounter), stored = cuts.filter(c => storedCuts.has(`${c.key}|${encounter.id}`));
      const missing = stored.filter(c => !(c.entries >= minimum));
      parity.push({ encounter: encounter.id, name: encounter.name, storedToday: stored.length,
        atMinimum: cuts.filter(c => c.entries >= minimum).length, missing: missing.length,
        ...(missing.length ? { missingSpecs: missing.map(c => c.spec) } : {}) });
    }
    log(JSON.stringify({ trigger: "parity", partition: partition.id, partitionName: partition.name,
      difficulty: raid.difficulty, size: raid.size, minimum, missing: parity.reduce((n, p) => n + p.missing, 0), encounters: parity }));
  }
  return { failures };

  async function perSpec(cfg, encounter) {
    const counts = [];
    for (let offset = 0; offset < roster.length; offset += LIVE_LEADERBOARDS.batchSize) {
      const specs = roster.slice(offset, offset + LIVE_LEADERBOARDS.batchSize);
      const r = await ask(rankingQuery(cfg, encounter, specs));
      if (r?.status !== 200) failures++;
      const e = r?.json?.data?.worldData?.encounter;
      specs.forEach((spec, i) => counts.push({ key: `${spec.class}|${spec.spec}`, spec: `${spec.class} ${spec.spec}`,
        entries: entriesOf(e?.[`s${i}`]), ...blobError(e?.[`s${i}`]) }));
    }
    return counts;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const id = process.env.WCL_CLIENT_ID, secret = process.env.WCL_CLIENT_SECRET;
  if (!id || !secret) throw new Error("WCL_CLIENT_ID / WCL_CLIENT_SECRET are not set");
  const auth = await oauthToken(id, secret);
  if (!auth.ok) throw new Error(`OAuth failed (HTTP ${auth.status})`);
  const roster = JSON.parse(await readFile(new URL("../data/specs.json", import.meta.url), "utf8"));
  const { failures } = await runProbe({ query: expression => gql(auth.token, expression), roster });
  process.exitCode = failures ? 1 : 0;
}
