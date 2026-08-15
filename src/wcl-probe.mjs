/* WCL v2 API diagnostic probe (2026-07-14) — deterministic, no AI, dispatch-only.

   Context: the nightly's sanctioned WCL path (v2 GraphQL) fails with a bare
   "Internal server error" on the rDPS-family metrics (rdps/ndps/cdps/bossrdps)
   while dps/hps/wdps/default work — bisected and confirmed by the 2026-07-14 run
   (.claude/skills/ptr-watch/log.md). This probe pins the remaining unknowns:

     1. Is the rdps-family 500 still present? (cheap retry — WCL may fix it)
     2. What does `metric: default` actually resolve to? The SITE's default damage
        ranking is rDPS in modern content, so `default` may reach rDPS data through
        a resolver path the broken enum doesn't. Test: join default-vs-dps rankings
        by CANONICAL character key — identical amounts ⇒ default==dps (no
        workaround); systematically different ⇒ default is the redistributed
        family (workaround).
     3. Does the encounter-wide leaderboard cover the FULL parse population on the
        small PTR zones (zone-52 Dummy Dome)? If count ≈ the statistics table's
        known parse totals, a true median is computable from rankings pages without
        inventing an aggregate.

   Join hygiene (2026-07-14 re-audit): rankings are joined by region+server+name,
   not name alone — different characters can share a name across realms/regions.
   Keys that still collide within one ranking are EXCLUDED from the equivalence
   comparison (counted, never guessed), and pages 1–2 are compared, not just page 1.

   Transport (headers, OAuth, GraphQL POST) is imported from src/fetch-wcl.mjs —
   the nightly's deterministic fetch stage — so the proven recipe lives in exactly
   one place. Run via .github/workflows/wcl-probe.yml (WCL_CLIENT_ID /
   WCL_CLIENT_SECRET env). Prints values and counts only — never the token or
   secrets. */

import { oauthToken, gql } from "./fetch-wcl.mjs";

/* ---- Site statistics-table transport probe (2026-07-21, owner-requested) ----
   The site's own median-table endpoint is a SEPARATE path from the broken GraphQL
   rdps family (the owner notes /zone/rankings/52 renders fine in a browser). This
   section answers, credential-free: does the statistics table serve rdps data to a
   datacenter runner with the documented XHR-header recipe, or does Cloudflare
   challenge it? Prints sizes and row signatures only. */
const TABLE_HEADERS = {
  "X-Requested-With": "XMLHttpRequest",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  "Accept": "text/html, */*; q=0.01",
  "Accept-Language": "en-US,en;q=0.9",
  "Referer": "https://www.warcraftlogs.com/zone/statistics/52",
};
async function probeStatTable(label, url) {
  try {
    const res = await fetch(url, { headers: TABLE_HEADERS });
    const body = await res.text();
    const sprites = [...body.matchAll(/actor-sprite-[A-Za-z]+-[A-Za-z]+/g)].length;
    const numCells = (body.match(/main-table-number/g) ?? []).length;
    const challenged = /cf-browser-verification|challenge-platform|Just a moment/i.test(body);
    console.log(`◇ ${label}: HTTP ${res.status}, ${body.length}B, spriteRows=${sprites}, numberCells=${numCells}${challenged ? ", CLOUDFLARE CHALLENGE" : ""}`);
    if (sprites > 0) console.log(`   first sprite: ${body.match(/actor-sprite-[A-Za-z-]+/)?.[0]}`);
    return { status: res.status, sprites, numCells, challenged };
  } catch (e) {
    console.log(`◇ ${label}: FETCH FAILED — ${e.message}`);
    return { err: String(e) };
  }
}
const STAT_TABLES = [
  ["z52 1T rdps (amount)", "https://www.warcraftlogs.com/zone/statistics/table/52/dps/3591/3/10/1/50/1/14/0/DPS/Any/All/0/amount/single/0/-1/?keystone=15&dpstype=rdps"],
  ["z52 1T dps control", "https://www.warcraftlogs.com/zone/statistics/table/52/dps/3591/3/10/1/50/1/14/0/DPS/Any/All/0/amount/single/0/-1/?keystone=15&dpstype=dps"],
  ["z54 raid rdps (normalized)", "https://www.warcraftlogs.com/zone/statistics/table/54/dps/0/4/10/1/1000/1/14/0/DPS/Any/All/0/normalized/single/0/-1/?keystone=15&dpstype=rdps"],
  ["z46 live raid rdps (amount)", "https://www.warcraftlogs.com/zone/statistics/table/46/dps/0/5/20/3/1000/1/14/0/DPS/Any/All/0/amount/single/0/-1/?dpstype=rdps"],
];
for (const [label, url] of STAT_TABLES) {
  await probeStatTable(label, url);
  await new Promise(r => setTimeout(r, 800)); // polite guest
}

const ID = process.env.WCL_CLIENT_ID, SECRET = process.env.WCL_CLIENT_SECRET;
// Missing credentials still fails RED (the nightly's WCL health depends on them) —
// the credential-free table probe above has already printed its results by now.
if (!ID || !SECRET) { console.error("✗ WCL_CLIENT_ID / WCL_CLIENT_SECRET not set (site-table probe above still ran)"); process.exit(1); }

const sleep = ms => new Promise(r => setTimeout(r, ms));

/* Canonical character key: region + server + name. characterRankings rows carry
   server info in varying shapes across zones — fall back progressively; whatever
   ambiguity survives is caught by the collision counter below and excluded rather
   than compared by guess. */
const charKey = r => [
  r.region?.slug ?? r.region?.name ?? r.regionName ?? (typeof r.region === "string" ? r.region : ""),
  r.server?.id ?? r.serverID ?? r.server?.slug ?? r.server?.name ?? r.serverName ?? (typeof r.server === "string" ? r.server : ""),
  r.name ?? ""
].join("|");

/* characterRankings returns a JSON scalar blob; shape observed: { page, hasMorePages,
   count, rankings: [{ name, class, spec, amount, server?, ... }] } — read defensively.
   Fetches up to `pages` pages (stops early when hasMorePages is false). */
async function probeRankings(t, encounterId, metric, pages = 1, extraArgs = "") {
  const all = [];
  let encName = null, keys = null, count = null, hasMore = null;
  for (let page = 1; page <= pages; page++) {
    if (page > 1) await sleep(600); // polite guest
    const q = `{ worldData { encounter(id: ${encounterId}) { name characterRankings(metric: ${metric}, page: ${page}${extraArgs}) } } }`;
    const { status, json, textHead } = await gql(t, q);
    if (!json) return { ok: false, err: `HTTP ${status}, non-JSON: ${textHead}` };
    if (json.errors?.length) return { ok: false, err: json.errors.map(e => e.message).join("; ") };
    const enc = json.data?.worldData?.encounter;
    const blob = enc?.characterRankings;
    if (!blob) return { ok: false, err: "no characterRankings in response" };
    encName = enc.name;
    keys = Object.keys(blob).join(",");
    count = blob.count ?? null;
    hasMore = blob.hasMorePages ?? null;
    all.push(...(blob.rankings ?? []));
    if (!blob.hasMorePages) break;
  }
  const byKey = new Map(), collided = new Set();
  for (const r of all) {
    const k = charKey(r);
    if (byKey.has(k) && byKey.get(k) !== r.amount) collided.add(k);
    else byKey.set(k, r.amount);
  }
  for (const k of collided) byKey.delete(k); // ambiguous identity — never compare by guess
  return {
    ok: true, encName, keys, count, hasMore,
    n: all.length, collided: collided.size,
    sample: all.slice(0, 3).map(r => `${r.name}(${r.class}/${r.spec})=${r.amount}`),
    byKey
  };
}

const ENCOUNTERS = [
  { id: 3176, label: "zone46 live raid (Imperator Averzian)" },
  { id: 3591, label: "zone52 Dummy Dome 1-target" }
];
const METRICS = ["dps", "rdps", "ndps", "default"];
const EQUIV_PAGES = 2; // compare beyond page 1 before drawing a semantic conclusion

const auth = await oauthToken(ID, SECRET);
if (!auth.ok) { console.error(`✗ token POST ${auth.status}`); process.exit(1); }
console.log(`✓ OAuth token issued (len ${auth.token.length})`);
const t = auth.token;

const rl = await gql(t, "{ rateLimitData { limitPerHour pointsSpentThisHour } }");
console.log("rateLimitData:", JSON.stringify(rl.json?.data?.rateLimitData ?? rl.textHead));

const results = {};
for (const enc of ENCOUNTERS) {
  for (const metric of METRICS) {
    await sleep(600); // polite guest
    const pages = metric === "dps" || metric === "default" ? EQUIV_PAGES : 1;
    const r = await probeRankings(t, enc.id, metric, pages);
    results[`${enc.id}:${metric}`] = r;
    console.log(r.ok
      ? `✓ enc ${enc.id} [${enc.label}] metric=${metric} → n=${r.n} count=${r.count} hasMore=${r.hasMore} collidedKeys=${r.collided} keys=[${r.keys}] sample: ${r.sample.join(" · ")}`
      : `✗ enc ${enc.id} [${enc.label}] metric=${metric} → ${r.err}`);
  }
}

// Equivalence: default vs dps, joined by canonical character key over pages 1–2.
for (const enc of ENCOUNTERS) {
  const d = results[`${enc.id}:default`], p = results[`${enc.id}:dps`];
  if (!d?.ok || !p?.ok) { console.log(`— equivalence enc ${enc.id}: skipped (missing side)`); continue; }
  let same = 0, diff = 0, maxRel = 0;
  for (const [key, amt] of d.byKey) {
    if (!p.byKey.has(key)) continue;
    const other = p.byKey.get(key);
    if (amt === other) same++;
    else { diff++; if (other) maxRel = Math.max(maxRel, Math.abs(amt - other) / other); }
  }
  const excluded = d.collided + p.collided;
  console.log(`≟ enc ${enc.id} default-vs-dps (canonical key, ${EQUIV_PAGES} pages): identical=${same} differing=${diff} maxRelDelta=${(maxRel * 100).toFixed(2)}% ambiguousExcluded=${excluded}`);
  console.log(diff === 0 && same > 0
    ? `  → metric "default" resolves to plain dps here — NOT an rdps workaround`
    : diff > 0
      ? `  → metric "default" returns DIFFERENT numbers than dps — likely the redistributed (rDPS-family) path; workaround viable, verify direction/magnitude`
      : `  → no overlapping canonical keys; inconclusive`);
}

// Population coverage on the small PTR encounter: does the unfiltered leaderboard
// count approximate the statistics table's known parse totals (~780 on 1T at 07-09)?
const dome = results["3591:dps"];
if (dome?.ok) {
  console.log(`◎ zone52 1T unfiltered leaderboard count=${dome.count} (statistics table showed ~782 total parses on 2026-07-09) — ${dome.count != null && dome.count > 400 ? "full-population median looks computable from rankings pages" : "leaderboard appears truncated vs the statistics population"}`);
}

/* ---- Zone enumeration (2026-08-11, for the S2 contract swap) ----
   docs/s2-transition-scope.md's WCL step said "dispatch wcl-probe.yml to get the S2 zone
   ids" — but nothing in src/ carried a zone-listing query, so the plan as written could
   not work: this probe tested hardcoded encounters and fetch-wcl.mjs takes zoneIds as
   INPUT (hardcoded 46/47/52/54/56). This section closes that gap. Once the Season 2
   content is live and logged (raid opens 2026-08-18 US), dispatch the probe and read the
   S2 raid + M+ zone ids off this list, then re-point required-sources.json and
   fetch-wcl.mjs in a reviewed owner edit — never guess ids from a pattern. */
/* TWO BUGS, both found by running this for the first time on 2026-08-14 — it had never
   produced output before, so neither was visible.
   1. It read `zq.data`, but `gql` resolves to { status, json, textHead }: the payload is
      under `.json`, exactly as the rateLimitData read above already does it. `zones` was
      therefore always [] and this printed "0 total ... (none matched)" every run.
   2. The flat `worldData.zones` query is INCOMPLETE. Measured the same day: it returns 42
      zones while `worldData.expansions { zones }` returns 66 — and the 24 it omits include
      zone 53 (The Venomous Abyss, the live S2 raid) and zone 55 (Mythic+ Season 2), i.e.
      precisely the two ids this section exists to find. Fixing only bug 1 would have made
      the probe look healthy on flip day while still missing the answer. Enumerate through
      expansions, and carry partitions/difficulties/encounters because the swap needs them:
      live and PTR zones share a NAME (53/54 are both "The Venomous Abyss") and are told
      apart by their partition label and encounter count, never by the id pattern. */
try {
  const zq = await gql(t, `{ worldData { expansions { id name zones {
    id name frozen
    partitions { id name default }
    difficulties { id name sizes }
    encounters { id name }
  } } } }`);
  const expansions = zq.json?.data?.worldData?.expansions ?? [];
  const all = expansions.flatMap(e => (e.zones ?? []).map(z => ({ ...z, exp: e.name })));
  const current = all.filter(z => z.exp?.includes("Midnight"));
  console.log(`▣ zone enumeration: ${all.length} zones across ${expansions.length} expansions; Midnight zones:`);
  for (const z of current.sort((a, b) => a.id - b.id)) {
    const parts = (z.partitions ?? []).map(p => `${p.id}=${p.name}${p.default ? "*" : ""}`).join(" ") || "none";
    const diffs = (z.difficulties ?? []).map(d => `${d.id}=${d.name}[${(d.sizes ?? []).join("/")}]`).join(" ") || "none";
    console.log(`   ${String(z.id).padStart(3)}  ${z.name}${z.frozen ? "  (frozen)" : ""}`);
    console.log(`        encounters=${z.encounters?.length ?? 0}  difficulties: ${diffs}`);
    console.log(`        partitions: ${parts}   (* = default; an OMITTED partition takes it)`);
  }
  if (!current.length) console.log("   (no Midnight zones — the expansion name changed; read the full list rather than guessing)");
} catch (e) {
  console.log(`▣ zone enumeration FAILED — ${String(e).slice(0, 200)}`);
}
console.log("probe complete");
