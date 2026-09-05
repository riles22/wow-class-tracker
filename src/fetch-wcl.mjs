/* Deterministic WCL fetch stage (2026-07-14 re-audit) — the ONLY process that holds
   the WCL API credentials in the nightly.

   The re-audit's top wow-class-tracker finding: the AI agent consumed untrusted web
   content while sharing an env with the WCL client secret. This script removes that
   coexistence — it runs as its own workflow step BEFORE the agent, with the secrets
   scoped to this step only, and writes wcl-fetch/evidence.json. That file is:
     (a) the agent's ONLY WCL input — the agent has no WCL credentials and is told
         never to fetch warcraftlogs.com itself on the runner; and
     (b) uploaded as its own artifact BEFORE the agent runs, so the publish gate
         (check-refresh --manifest) cross-checks the agent's WCL manifest rows
         against evidence the agent had no window to tamper with.

   Current diagnostics verify the live season's raid and M+ zones, then probe one
   discovered encounter per bracket. A working raw-DPS control distinguishes rDPS
   failures from a general outage. These are diagnostics, never population medians:
   `landed` stays {} until an equivalent, reviewed live median recipe exists. A
   manifest row may claim "success" only when landed[key] carries merged rows.

   Exit code is 0 whenever evidence was written — including upstream failure, because
   the evidence IS the product; the workflow surfaces bad verdicts (::warning:: here,
   a deterministic red flag in the "Surface soft failures" step). Never echoes the
   token or secrets. */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { applyMetrics } from "./apply-metrics.mjs";
import { PHASES } from "./normalize.mjs";

// Header recipe proven by the 2026-07-14 run (see refresh-metrics SKILL.md, "WCL v2
// API status"): browser UA on the token POST; Origin + Referer + sec-ch-ua clear
// Cloudflare on the GraphQL POST. wcl-probe.mjs imports these so the transport
// recipe lives in exactly one place.
export const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
export const gqlHeaders = token => ({
  "authorization": `Bearer ${token}`,
  "content-type": "application/json",
  "user-agent": UA,
  "origin": "https://www.warcraftlogs.com",
  "referer": "https://www.warcraftlogs.com/",
  "sec-ch-ua": '"Chromium";v="126", "Not.A/Brand";v="24"'
});

const sleep = ms => new Promise(r => setTimeout(r, ms));

// One retry for transient HTTP/network failures, with a deadline on BOTH the
// response and its body. API-level GraphQL errors are conclusions, not retried.
async function requestText(url, options, { fetchImpl = fetch, pause = sleep, timeoutMs = 20_000 } = {}) {
  let result;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetchImpl(url, { ...options, signal: AbortSignal.timeout(timeoutMs) });
      result = { status: res.status, ok: res.ok, body: await res.text(), attempts: attempt };
    } catch (err) {
      result = { status: 0, ok: false, body: "", attempts: attempt,
        error: err?.cause?.code ?? err?.message ?? String(err) };
    }
    if (![0, 408, 429, 500, 502, 503, 504].includes(result.status) || attempt === 2) return result;
    await pause(2000);
  }
}

/* Both transport helpers are TOTAL — a rejected fetch() (DNS, reset, TLS, proxy)
   becomes a status-0 result, never a throw. This script runs unattended before the
   nightly agent; a crash here would kill the whole refresh job, when the honest
   outcome of a network failure is simply evidence saying so (verdict network-failed). */
export async function oauthToken(id, secret, options) {
  try {
    const res = await requestText("https://www.warcraftlogs.com/oauth/token", {
      method: "POST",
      headers: {
        "authorization": "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"),
        "content-type": "application/x-www-form-urlencoded",
        "user-agent": UA
      },
      body: "grant_type=client_credentials"
    }, options);
    const body = res.body;
    if (!res.ok) return { ok: false, status: res.status, bodyBytes: body.length, error: res.error };
    try {
      const token = JSON.parse(body).access_token;
      return typeof token === "string" && token.length
        ? { ok: true, token } : { ok: false, status: res.status, bodyBytes: body.length };
    }
    catch { return { ok: false, status: res.status, bodyBytes: body.length }; }
  } catch (err) {
    return { ok: false, status: 0, error: err?.cause?.code ?? err?.message ?? String(err) };
  }
}

export async function gql(token, query, options) {
  try {
    const res = await requestText("https://www.warcraftlogs.com/api/v2/client", {
      method: "POST", headers: gqlHeaders(token), body: JSON.stringify({ query })
    }, options);
    const text = res.body;
    let json = null;
    try { json = JSON.parse(text); } catch { /* Cloudflare HTML or the like */ }
    return { status: res.status, json, attempts: res.attempts,
      textHead: res.status === 0 ? `fetch failed: ${res.error}` : text.slice(0, 120) };
  } catch (err) {
    return { status: 0, json: null, textHead: `fetch failed: ${err?.cause?.code ?? err?.message ?? err}` };
  }
}

/* Pure verdict mapping — unit-tested. `probe` is the rdps characterRankings attempt:
   { httpStatus, errors: [..gql error messages..], rankings: n } or null when it never
   ran (transport failed first). */
export function verdictFor({ hasCreds, oauth, transportOk, probe, brackets }) {
  if (!hasCreds) return {
    verdict: "no-credentials",
    detail: "WCL_CLIENT_ID / WCL_CLIENT_SECRET are not set — the fetch step ran without credentials (secret rot or workflow misconfiguration)"
  };
  if (!oauth?.ok) return oauth?.status === 0
    ? { verdict: "network-failed",
        detail: `OAuth POST never reached WCL (${oauth.error ?? "network failure"}) — transport problem, not a credential conclusion` }
    : { verdict: "oauth-failed",
        detail: `OAuth client-credentials POST failed (HTTP ${oauth?.status ?? "?"}) — check the WCL client secrets` };
  if (!transportOk) return {
    verdict: "network-failed",
    detail: "GraphQL transport to /api/v2/client failed after retry (Cloudflare or network) — no metric conclusion possible this run"
  };
  if (brackets && Object.keys(brackets).length) {
    const entries = Object.values(brackets);
    const summary = entries.map(b => `${b.bracket} zone ${b.zoneId}: ${b.status} (${b.detail})`).join("; ");
    // Any recovered bracket deserves the existing owner-action notice, including
    // partial recovery. Per-bracket status and detail never imply both recovered.
    if (entries.some(b => b.status === "recipe-needed")) return {
      verdict: "rdps-restored",
      detail: `${summary}. owner decision needed: validate and freeze an equivalent live population-median recipe before any WCL cut can land; diagnostic rankings are not fresh median data`
    };
    return {
      verdict: entries.every(b => b.status === "rdps-broken") ? "rdps-broken" : "network-failed",
      detail: `${summary}. No WCL median rows landed`
    };
  }
  if (!probe) return { verdict: "network-failed", detail: "No conclusive WCL probe was recorded" };
  if (probe.errors?.length) return {
    verdict: "rdps-broken",
    detail: `characterRankings(metric: rdps) on encounter ${probe.encounterId}: ${probe.errors.join("; ")} — the rDPS metric family is still broken upstream, no WCL cut can honestly land (refresh-metrics SKILL.md, "WCL v2 API status")`
  };
  if ((probe.rankings ?? 0) > 0) return {
    verdict: "rdps-restored",
    detail: `characterRankings(metric: rdps) on encounter ${probe.encounterId} returned ${probe.rankings} rankings — WCL fixed the rDPS family; owner decision needed: freeze a deterministic median recipe into src/fetch-wcl.mjs targeting the LIVE S2 zones (53 raid / 55 M+ — partition 1 on both) before any cut can land`
  };
  return {
    verdict: "network-failed",
    detail: "rdps probe returned neither errors nor rankings — inconclusive shape, treated as transport failure"
  };
}

// Owner-reviewed live identity from official API discovery, 2026-09-05. A future
// PHASES flip must update this config rather than probing old-season content.
export const LIVE_DIAGNOSTICS = {
  season: "s2", label: "12.1",
  brackets: [
    { key: "wcl-live-raid", bracket: "raid", zoneId: 53, zoneName: "The Venomous Abyss", partition: 1, partitionName: "12.1", difficulty: 5, size: 20 },
    { key: "wcl-live-mplus", bracket: "mplus", zoneId: 55, zoneName: "Mythic+ Season 2", partition: 1, partitionName: "Season 2", difficulty: 10, size: 5 }
  ]
};

const responseErrors = r => r.json?.errors == null ? [] : Array.isArray(r.json.errors)
  ? r.json.errors.map(e => typeof e?.message === "string" ? e.message : "malformed GraphQL error")
  : ["malformed GraphQL errors"];
const transportOk = r => r.status === 200 && r.json != null;

/* Read-only diagnostics: one discovered encounter and at most two metrics per
   bracket. Injected query/pause keep the full decision path testable offline.
   No ranking values, player identities, or tokens enter the evidence. */
export async function probeLiveBrackets(token, { query = gql, pause = sleep, phases = PHASES } = {}) {
  const result = { brackets: {}, probes: [], landed: {} };
  for (const cfg of LIVE_DIAGNOSTICS.brackets) {
    const ev = result.brackets[cfg.key] = { bracket: cfg.bracket, zoneId: cfg.zoneId,
      partition: cfg.partition, difficulty: cfg.difficulty, size: cfg.size, status: null, detail: null };
    if (phases.liveSeason !== LIVE_DIAGNOSTICS.season || phases.liveLabel !== LIVE_DIAGNOSTICS.label) {
      ev.status = "configuration-mismatch";
      ev.detail = "live phase changed; review WCL zone configuration before probing";
      continue;
    }
    await pause(600);
    const found = await query(token, `{ worldData { zone(id: ${cfg.zoneId}) { id name frozen partitions { id name } difficulties { id sizes } encounters { id name } } } }`);
    const zone = found.json?.data?.worldData?.zone;
    if (!transportOk(found) || responseErrors(found).length) {
      ev.status = "network-failed";
      ev.detail = `zone discovery failed: ${responseErrors(found).join("; ") || `HTTP ${found.status}`}`;
      continue;
    }
    const encounter = zone?.encounters?.[0];
    if (zone?.id !== cfg.zoneId || zone.name !== cfg.zoneName || zone.frozen !== false ||
        !Array.isArray(zone.partitions) || !zone.partitions.some(p => p?.id === cfg.partition && p.name === cfg.partitionName) ||
        !Array.isArray(zone.difficulties) || !zone.difficulties.some(d => d?.id === cfg.difficulty && Array.isArray(d.sizes) && d.sizes.includes(cfg.size)) ||
        !Number.isInteger(encounter?.id) || encounter.id <= 0) {
      ev.status = "configuration-mismatch";
      ev.detail = "discovered zone, season partition, difficulty, size, or encounter does not match the reviewed live configuration";
      continue;
    }
    ev.encounterId = encounter.id;
    ev.encounterName = encounter.name;
    const probe = async metric => {
      await pause(600);
      const r = await query(token, `{ worldData { encounter(id: ${encounter.id}) { id zone { id } characterRankings(metric: ${metric}, page: 1, partition: ${cfg.partition}, difficulty: ${cfg.difficulty}, size: ${cfg.size}) } } }`);
      const actual = r.json?.data?.worldData?.encounter;
      const identityOk = actual?.id === encounter.id && actual?.zone?.id === cfg.zoneId;
      const rankings = actual?.characterRankings?.rankings;
      const errors = responseErrors(r);
      const p = { name: `${metric}@${encounter.id}`, bracket: cfg.bracket, zoneId: cfg.zoneId, metric,
        httpStatus: r.status, transportOk: transportOk(r), identityOk, errors,
        rankings: Array.isArray(rankings) ? rankings.length : 0 };
      p.ok = p.transportOk && p.identityOk && !errors.length && p.rankings > 0;
      result.probes.push(p);
      return p;
    };
    const rdps = ev.rdps = await probe("rdps");
    if (rdps.ok) {
      ev.status = "recipe-needed";
      ev.detail = "rDPS page 1 returned rankings; no equivalent aggregate median recipe exists";
      continue;
    }
    // A dps control diagnoses availability only. It never supplies or replaces a
    // live rDPS/HPS metric, and its leaderboard is never labeled a median.
    const control = ev.control = await probe("dps");
    if (!rdps.transportOk || !control.transportOk) ev.status = "network-failed";
    else if (!rdps.identityOk || !control.identityOk) ev.status = "configuration-mismatch";
    else if (rdps.errors.length && control.ok) ev.status = "rdps-broken";
    else ev.status = "inconclusive";
    ev.detail = `rDPS: ${rdps.errors.join("; ") || `${rdps.rankings} rankings (HTTP ${rdps.httpStatus})`}; dps control: ${control.ok ? "working" : control.errors.join("; ") || `${control.rankings} rankings (HTTP ${control.httpStatus})`}`;
  }
  return result;
}

/* --- Frozen median recipe #1 (owner-approved 2026-07-17): zone-52 Dummy Dome
   RAW-DPS medians.

   metric: dps sits outside the broken rDPS family, and zone 52's population is small
   enough to paginate to exhaustion, so a true median is computable without inventing
   an aggregate. Two honesty rules are load-bearing:
   - RAW DPS IS NEVER DRESSED UP AS rDPS. These land as their own metric series
     ("Median raw DPS (12.1 PTR Dummy Dome, NT)"); spec.ptrDummy (median rDPS) stays
     frozen at its last honest cut until WCL fixes the API.
   - COMPLETE PAGINATION OR NOTHING. Rankings are best-parse-per-player sorted
     best-first, so a partially-paginated median is biased high — an encounter that
     fails mid-pagination (or exceeds the page budget) contributes zero rows.
   The statistic is therefore "median best-parse raw DPS per ranked player", with n =
   ranked players — a different (and honestly labeled) statistic than the statistics
   table's per-parse medians. */
export const DUMMY_ENCOUNTERS = [
  { id: 3591, targets: "1" }, // Sinister Single
  { id: 3590, targets: "2" }, // Diabolical Duo
  { id: 3592, targets: "3" }, // Terrible Trio
  { id: 3593, targets: "5" }  // Fearsome Five
];
const MAX_DUMMY_PAGES = 25; // ~2500 players/encounter — far above zone 52's observed ~800

// API class/spec strings come camel-cased ("DemonHunter", "BeastMastery") — split to
// roster names only when the raw string doesn't already match the roster.
export const spacedName = s => String(s ?? "").replace(/([a-z])([A-Z])/g, "$1 $2");

export const medianOf = values => {
  if (!values.length) return null;
  const v = [...values].sort((a, b) => a - b);
  const mid = v.length >> 1;
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
};

/* Pure row builder — unit-tested. byEncounter: [{ targets, rankings: [{class, spec,
   amount}] }] (complete populations only); roster: Set of "Class|Spec" for DPS specs. */
export function buildDummyRawRows(byEncounter, roster, asOf) {
  const rows = [];
  for (const enc of byEncounter) {
    const groups = new Map();
    for (const r of enc.rankings) {
      let cls = String(r.class ?? ""), sp = String(r.spec ?? "");
      if (!roster.has(`${cls}|${sp}`)) { cls = spacedName(cls); sp = spacedName(sp); }
      if (!roster.has(`${cls}|${sp}`)) continue; // non-DPS role or unknown spec — not this series' population
      const key = `${cls}|${sp}`;
      const amount = Number(r.amount);
      if (!Number.isFinite(amount) || amount < 0) continue;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(amount);
    }
    for (const [key, amounts] of groups) {
      const [cls, sp] = key.split("|");
      rows.push({
        class: cls, spec: sp, bracket: "raid", source: "warcraftlogs",
        name: `Median raw DPS (12.1 PTR Dummy Dome, ${enc.targets}T)`,
        value: Math.round(medianOf(amounts)), unit: "DPS", n: amounts.length,
        asOf, era: "ptr"
      });
    }
  }
  return rows;
}

/* Pooled variant (recipes #2/#3, owner-approved 2026-07-17): one row per spec whose
   population is every ranked (player, encounter) best-parse across the zone, pooled.
   Used for the small PTR zones 54/56 where the stored rDPS/normalized series are
   frozen by the upstream rdps-family 500. ALL discovered encounters must paginate to
   completion or the recipe contributes nothing that night — a missing boss/dungeon
   would bias per-spec pooled medians, not just shrink n. */
export function buildPooledRawRows(encounterRankings, roster, asOf, name, bracket) {
  const groups = new Map();
  for (const enc of encounterRankings) {
    for (const r of enc.rankings) {
      let cls = String(r.class ?? ""), sp = String(r.spec ?? "");
      if (!roster.has(`${cls}|${sp}`)) { cls = spacedName(cls); sp = spacedName(sp); }
      if (!roster.has(`${cls}|${sp}`)) continue;
      const amount = Number(r.amount);
      if (!Number.isFinite(amount) || amount < 0) continue;
      const key = `${cls}|${sp}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(amount);
    }
  }
  const rows = [];
  for (const [key, amounts] of groups) {
    const [cls, sp] = key.split("|");
    rows.push({ class: cls, spec: sp, bracket, source: "warcraftlogs", name,
      value: Math.round(medianOf(amounts)), unit: "DPS", n: amounts.length, asOf, era: "ptr" });
  }
  return rows;
}

async function discoverEncounters(token, zoneId) {
  const r = await gql(token, `{ worldData { zone(id: ${zoneId}) { encounters { id name } } } }`);
  const encounters = r.json?.data?.worldData?.zone?.encounters;
  if (!Array.isArray(encounters) || !encounters.length) {
    return { error: r.json?.errors?.map(e => e.message).join("; ") ?? `HTTP ${r.status}, no encounters for zone ${zoneId}` };
  }
  return { encounters };
}

async function paginateEncounter(token, encounterId, { difficulty } = {}) {
  const rankings = [];
  const args = difficulty != null ? `, difficulty: ${difficulty}` : "";
  for (let page = 1; page <= MAX_DUMMY_PAGES; page++) {
    await sleep(600); // polite guest
    const q = `{ worldData { encounter(id: ${encounterId}) { characterRankings(metric: dps, page: ${page}${args}) } } }`;
    const r = await gql(token, q);
    const blob = r.json?.data?.worldData?.encounter?.characterRankings;
    if (!blob || r.json?.errors?.length) {
      return { ok: false, reason: r.json?.errors?.map(e => e.message).join("; ") ?? `HTTP ${r.status}, no characterRankings` };
    }
    rankings.push(...(blob.rankings ?? []));
    if (!blob.hasMorePages) return { ok: true, rankings };
  }
  return { ok: false, reason: `population exceeds the ${MAX_DUMMY_PAGES}-page budget — owner decision needed before trusting a median` };
}

/* The three frozen raw-DPS recipes. Names are chosen to NEVER match the frozen
   rDPS/normalized requirements' namePatterns (wcl-ptr-raid: "12.1 PTR raid testing";
   wcl-ptr-mplus: "12.1 PTR M+ testing") — fresh raw rows must not let a manifest row
   vouch for the stale series (a regression test pins this). */
/* RETIRED 2026-08-18 (post-launch routines pass, owner-approved): the 12.1 PTR cycle
   closed at launch, so the three PTR recipes (zone-52 Dummy Dome targets, zone-54 raid
   pooled, zone-56 M+ pooled) no longer fetch. Their last-landed rows (asOf 2026-08-18)
   stay in data/specs.json as the cycle's final receipts — they are era:"ptr" history
   feeding the frozen forecast's audit trail, not live series. The recipe FUNCTIONS
   (buildDummyRawRows / buildPooledRawRows) are kept frozen for the 12.2 cycle, which
   re-arms this list as an owner-reviewed edit with the new zone ids.
   Pre-retirement entries, for that day:
     { key: "wcl-dummy-raw", mode: "targets", encounters: DUMMY_ENCOUNTERS, bracket: "raid" },
     { key: "wcl-ptr-raid-raw", mode: "pooled", zoneId: 54, difficulty: 4, bracket: "raid",
       name: "Median raw DPS (12.1 PTR Venomous Abyss, pooled)" }, // Heroic — where testing happened
     { key: "wcl-ptr-mplus-raw", mode: "pooled", zoneId: 56, bracket: "mplus",
       name: "Median raw DPS (12.1 PTR M+ keys, pooled)" } */
export const RAW_RECIPES = [];

async function fetchRawRecipe(token, recipe) {
  const perEncounter = {};
  let encounters;
  if (recipe.mode === "targets") {
    encounters = recipe.encounters.map(e => ({ id: e.id, label: `${e.targets}T`, targets: e.targets }));
  } else {
    const found = await discoverEncounters(token, recipe.zoneId);
    if (found.error) return { rows: [], perEncounter, discoverError: found.error };
    encounters = found.encounters.map(e => ({ id: e.id, label: e.name }));
  }
  const complete = [];
  for (const enc of encounters) {
    const r = await paginateEncounter(token, enc.id, { difficulty: recipe.difficulty });
    perEncounter[enc.label] = r.ok ? { ok: true, players: r.rankings.length } : { ok: false, reason: r.reason };
    if (r.ok) complete.push({ ...enc, rankings: r.rankings });
  }
  return { encounters, complete, perEncounter };
}

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function main() {
  const outDir = process.argv.find(a => a.startsWith("--out="))?.slice(6) ?? "wcl-fetch";
  const ID = process.env.WCL_CLIENT_ID, SECRET = process.env.WCL_CLIENT_SECRET;

  const state = { hasCreds: Boolean(ID && SECRET), oauth: null, transportOk: false, brackets: null };
  const evidence = {
    attemptedAt: new Date().toISOString(),
    verdict: null,
    detail: null,
    transport: { oauth: false, graphql: false, rateLimit: null },
    probes: [],
    // Per-requirement-key rows actually fetched AND merged by this script. Empty until
    // a real recipe exists — the publish gate refuses "success" on evidence-gated
    // manifest rows unless landed[key].rows > 0.
    landed: {}
  };

  if (state.hasCreds) {
    state.oauth = await oauthToken(ID, SECRET);
    evidence.transport.oauth = state.oauth.ok === true;
    console.log(state.oauth.ok ? "✓ OAuth token issued" : `✗ OAuth POST failed (HTTP ${state.oauth.status})`);

    if (state.oauth.ok) {
      // gql itself has one bounded transient retry and a per-request deadline.
      const rl = await gql(state.oauth.token, "{ rateLimitData { limitPerHour pointsSpentThisHour } }");
      if (transportOk(rl) && !responseErrors(rl).length && rl.json.data?.rateLimitData) {
        state.transportOk = true;
        evidence.transport.graphql = true;
        evidence.transport.rateLimit = rl.json.data.rateLimitData;
        console.log("✓ GraphQL transport up:", JSON.stringify(rl.json.data.rateLimitData));
      } else {
        console.log(`✗ GraphQL transport: HTTP ${rl.status}, ${rl.textHead.slice(0, 60)}`);
      }

      if (state.transportOk) {
        const diagnostics = await probeLiveBrackets(state.oauth.token);
        state.brackets = evidence.brackets = diagnostics.brackets;
        evidence.probes = diagnostics.probes;
        for (const ev of Object.values(evidence.brackets)) {
          console.log(`${ev.status === "recipe-needed" ? "✓" : "✗"} ${ev.bracket} zone ${ev.zoneId}: ${ev.status} — ${ev.detail}`);
        }

        // Raw-DPS median recipes (#1 zone 52 per-target, #2 zone 54 pooled, #3 zone 56
        // pooled) — metric: dps, so these run and can LAND regardless of the rdps
        // family's state. Each recipe merges INDEPENDENTLY: a shape surprise in one
        // zone becomes that recipe's evidence entry, never a blocker for the others.
        evidence.rawRecipes = {};
        let roster = null;
        try {
          const specs = JSON.parse(await readFile(path.join(rootDir, "data", "specs.json"), "utf8"));
          roster = new Set(specs.filter(s => s.role === "DPS").map(s => `${s.class}|${s.spec}`));
        } catch (err) {
          console.log(`::warning title=Raw-median recipes skipped::cannot load roster: ${err?.message ?? err}`);
        }
        for (const recipe of roster ? RAW_RECIPES : []) {
          const ev = { perEncounter: {}, rowsBuilt: 0 };
          evidence.rawRecipes[recipe.key] = ev;
          try {
            const fetched = await fetchRawRecipe(state.oauth.token, recipe);
            ev.perEncounter = fetched.perEncounter;
            if (fetched.discoverError) {
              ev.error = `encounter discovery failed: ${fetched.discoverError}`;
              console.log(`✗ ${recipe.key}: ${ev.error}`);
              continue;
            }
            const today = new Date().toISOString().slice(0, 10);
            let rows = [];
            if (recipe.mode === "targets") {
              rows = buildDummyRawRows(fetched.complete, roster, today);
            } else if (fetched.complete.length === fetched.encounters.length) {
              // Pooled medians need EVERY encounter: a missing boss/dungeon biases the
              // pool, it doesn't just shrink it.
              rows = buildPooledRawRows(fetched.complete, roster, today, recipe.name, recipe.bracket);
            } else {
              ev.error = "incomplete zone coverage — pooled median withheld";
            }
            ev.rowsBuilt = rows.length;
            if (rows.length) {
              const scratch = path.join(outDir, `${recipe.key}-metrics.json`);
              await mkdir(outDir, { recursive: true });
              await writeFile(scratch, JSON.stringify({ metrics: rows }, null, 2) + "\n");
              // applyMetrics refuses atomically on unmatched rows or validation
              // failure — a refusal is evidence, never a crash or a partial write.
              const applied = await applyMetrics(scratch, rootDir);
              ev.applied = applied.metricsApplied;
              evidence.landed[recipe.key] = { rows: applied.metricsApplied, perEncounter: ev.perEncounter };
              console.log(`✓ ${recipe.key}: ${applied.metricsApplied} median raw-DPS rows merged (${Object.entries(ev.perEncounter).map(([t, e]) => `${t}:${e.ok ? e.players + "p" : "failed"}`).join(" ")})`);
            } else {
              console.log(`✗ ${recipe.key}: nothing to merge (${ev.error ?? "no complete encounter populations"})`);
            }
          } catch (err) {
            ev.error = err?.message ?? String(err);
            console.log(`::warning title=Raw-median recipe ${recipe.key} failed::${ev.error}`);
          }
        }
      }
    }
  } else {
    console.log("✗ WCL_CLIENT_ID / WCL_CLIENT_SECRET not set");
  }

  const { verdict, detail } = verdictFor(state);
  evidence.verdict = verdict;
  evidence.detail = detail;

  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, "evidence.json");
  await writeFile(outPath, JSON.stringify(evidence, null, 2) + "\n");
  console.log(`evidence → ${outPath} (verdict: ${verdict})`);

  // Configuration failures deserve immediate owner attention (annotation, and the
  // workflow's soft-failure step turns them into a red refresh job); upstream
  // breakage (rdps-broken) is the documented standing state — no warning spam.
  if (["no-credentials", "oauth-failed", "network-failed"].includes(verdict)) {
    console.log(`::warning title=WCL fetch step degraded::${verdict}: ${detail}`);
  }
  if (verdict === "rdps-restored") {
    console.log(`::notice title=WCL rDPS restored upstream::${detail}`);
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) await main();
