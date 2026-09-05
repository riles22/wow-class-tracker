/* Read-only supported WoW API diagnostic. No HTML scraping, player output, or data
   writes. rdps is FFXIV-only; its failure is not a WoW availability signal. */
import { oauthToken, gql } from "./fetch-wcl.mjs";

const id = process.env.WCL_CLIENT_ID, secret = process.env.WCL_CLIENT_SECRET;
if (!id || !secret) throw new Error("WCL_CLIENT_ID / WCL_CLIENT_SECRET are not set");
const auth = await oauthToken(id, secret);
if (!auth.ok) throw new Error(`OAuth failed (HTTP ${auth.status})`);
const result = await gql(auth.token, `{ worldData { expansions { id name zones {
  id name frozen partitions { id name } difficulties { id name sizes }
  encounters { id name } brackets { min max bucket type }
} } } }`);
if (result.status !== 200 || result.json?.errors) throw new Error("GraphQL zone discovery failed");
const zones = (result.json?.data?.worldData?.expansions ?? []).filter(e => /Midnight/.test(e.name))
  .flatMap(e => e.zones ?? []);
console.log(JSON.stringify({ zones }, null, 2));
let failures = 0;
for (const cfg of [{ zone: 53, encounter: 3470, difficulty: 5, size: 20 },
  { zone: 55, encounter: 12993, difficulty: 10, size: 5 }]) {
  for (const metric of ["dps", "hps"]) {
    const r = await gql(auth.token, `{worldData{encounter(id:${cfg.encounter}){id zone{id}
      characterRankings(metric:${metric},page:1,partition:1,difficulty:${cfg.difficulty},size:${cfg.size}${cfg.zone === 55 ? ",bracket:9" : ""})}}}`);
    const e = r.json?.data?.worldData?.encounter, cut = e?.characterRankings;
    const ok = r.status === 200 && !r.json?.errors && e?.id === cfg.encounter && e.zone?.id === cfg.zone && Array.isArray(cut?.rankings);
    console.log(JSON.stringify({ zone: cfg.zone, encounter: cfg.encounter, metric, ok,
      httpStatus: r.status, rows: cut?.rankings?.length ?? 0, hasMorePages: cut?.hasMorePages ?? null }));
    if (!ok) failures++;
  }
}
process.exitCode = failures ? 1 : 0;
