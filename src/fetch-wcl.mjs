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

   Supported WoW dps/hps leaderboards are collected by src/wcl-live.mjs and merged
   as distinct per-encounter top-100-entry medians. updates.json and evidence.json
   are uploaded before the agent; check-wcl-metrics verifies the actual data later.
   Historical population medians and closed PTR recipes are never overwritten.

   Exit code is 0 whenever evidence was written — including upstream failure, because
   the evidence IS the product; the workflow surfaces bad verdicts (::warning:: here,
   a deterministic red flag in the "Surface soft failures" step). Never echoes the
   token or secrets. */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { applyMetrics } from "./apply-metrics.mjs";
import { PHASES } from "./normalize.mjs";
import { createHash } from "node:crypto";
import { collectLeaderboards } from "./wcl-live.mjs";

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

/* WoW supports dps/hps. rdps is FFXIV-only (official schema, 2026-09-05),
   so its rejection never establishes a WoW service outage. */
export function verdictFor({ hasCreds, oauth, transportOk, brackets }) {
  if (!hasCreds) return { verdict: "no-credentials", detail: "WCL_CLIENT_ID / WCL_CLIENT_SECRET are not set" };
  if (!oauth?.ok) return { verdict: oauth?.status === 0 ? "network-failed" : "oauth-failed",
    detail: oauth?.status === 0 ? `OAuth transport failed: ${oauth.error ?? "network failure"}` : `OAuth failed (HTTP ${oauth?.status ?? "?"})` };
  if (!transportOk) return { verdict: "network-failed", detail: "Sanctioned GraphQL transport failed; retained data unchanged" };
  const entries = Object.entries(brackets ?? {});
  if (!entries.length) return { verdict: "network-failed", detail: "No supported leaderboard collection was recorded" };
  return { verdict: entries.every(([, b]) => b.status === "success") ? "success" : "partial",
    detail: entries.map(([key, b]) => `${key}: ${b.status}, ${b.rows ?? 0} rows`).join("; ") };
}

/* --- Frozen median recipe #1 (owner-approved 2026-07-17): zone-52 Dummy Dome
   RAW-DPS medians.

   HISTORICAL RECIPE, RETIRED. The original raw-DPS/player labels are preserved as
   archive identifiers, not re-endorsed: current WoW dps attribution and repeated
   character entries do not establish raw damage or unique-player semantics.
   At the time, zone 52's population was small
   enough to paginate to exhaustion, so a true median is computable without inventing
   an aggregate. Two honesty rules are load-bearing:
   - RAW DPS IS NEVER DRESSED UP AS rDPS. These land as their own metric series
     ("Median raw DPS (12.1 PTR Dummy Dome, NT)"); spec.ptrDummy (median rDPS) stays
     retained at its last historical cut; no current aggregate equivalence is claimed.
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
   retained unchanged as historical receipts. ALL discovered encounters must paginate to
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

export async function runWcl({ root = rootDir, outDir = "wcl-fetch", id = process.env.WCL_CLIENT_ID,
  secret = process.env.WCL_CLIENT_SECRET } = {}) {
  const roster = JSON.parse(await readFile(path.join(root, "data/specs.json"), "utf8"));
  const stored = roster.flatMap(s => (s.metrics ?? []).filter(m => m.source === "warcraftlogs")
    .map(m => ({ class: s.class, spec: s.spec, ...m, class: s.class, spec: s.spec })));
  const digest = value => createHash("sha256").update(JSON.stringify(value)).digest("hex");
  const attemptedAt = new Date().toISOString();
  const evidence = { schemaVersion: 2, attemptedAt, liveSeason: PHASES.liveSeason,
    baselineSha256: digest(stored), verdict: null, detail: null,
    transport: { oauth: false, graphql: false, rateLimit: null }, brackets: {}, landed: {},
    legacy: Object.fromEntries(["raid", "mplus"].map(b => [`wcl-live-${b}`, {
      status: "unreachable", detail: "Exact population medians have no verified sanctioned aggregate endpoint. Retained S1 observations unchanged. Supported WoW leaderboards are separate series; rdps is FFXIV-only, not a WoW outage test."
    }])) };
  const state = { hasCreds: Boolean(id && secret), oauth: null, transportOk: false, brackets: {} };
  let updates = { metrics: [] };
  if (state.hasCreds) {
    state.oauth = await oauthToken(id, secret);
    evidence.transport.oauth = state.oauth.ok;
    if (state.oauth.ok) {
      const r = await gql(state.oauth.token, "{ rateLimitData { limitPerHour pointsSpentThisHour } }");
      const quota = r.json?.data?.rateLimitData;
      state.transportOk = r.status === 200 && !r.json?.errors && Number.isFinite(quota?.limitPerHour) && Number.isFinite(quota?.pointsSpentThisHour);
      evidence.transport.graphql = state.transportOk;
      if (state.transportOk) {
        evidence.transport.rateLimit = quota;
        const result = await collectLeaderboards({ roster, query: q => gql(state.oauth.token, q) });
        evidence.brackets = state.brackets = result.brackets;
        updates = result.updates;
        evidence.querySummary = result.querySummary;
      }
    }
  }
  Object.assign(evidence, verdictFor(state));
  await mkdir(outDir, { recursive: true });
  const updatePath = path.join(outDir, "updates.json");
  await writeFile(updatePath, JSON.stringify(updates, null, 2) + "\n");
  evidence.updatesSha256 = digest(updates);
  if (updates.metrics.length) {
    try {
      await applyMetrics(updatePath, root);
      for (const [key, b] of Object.entries(evidence.brackets)) {
        if (b.rows > 0) evidence.landed[key] = { rows: b.rows };
      }
    } catch (error) {
      evidence.verdict = "merge-failed";
      evidence.detail = `Collected rows failed canonical validation: ${error.message}`;
    }
  }
  await writeFile(path.join(outDir, "evidence.json"), JSON.stringify(evidence, null, 2) + "\n");
  console.log(`WCL: ${evidence.verdict} — ${evidence.detail}`);
  if (!["success", "partial"].includes(evidence.verdict)) console.log(`::warning title=WCL collection degraded::${evidence.detail}`);
  return { evidence, updates };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const outDir = process.argv.find(a => a.startsWith("--out="))?.slice(6) ?? "wcl-fetch";
  await runWcl({ outDir });
}
