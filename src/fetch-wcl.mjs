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

   What it does today: the standing per-run protocol from the refresh-metrics skill
   ("WCL v2 API status") — one cheap characterRankings(metric: rdps) check on a
   known-good encounter. The whole rDPS metric family 500s server-side (bisected
   2026-07-14), so no cut can honestly land; `landed` stays {} until WCL fixes it AND
   the owner freezes a real median recipe into this script (zone 52 first — see the
   skill). A manifest row for an evidence-gated requirement may claim "success" only
   when landed[key] carries rows from this run.

   Exit code is 0 whenever evidence was written — including upstream failure, because
   the evidence IS the product; the workflow surfaces bad verdicts (::warning:: here,
   a deterministic red flag in the "Surface soft failures" step). Never echoes the
   token or secrets. */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { applyMetrics } from "./apply-metrics.mjs";

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

/* Both transport helpers are TOTAL — a rejected fetch() (DNS, reset, TLS, proxy)
   becomes a status-0 result, never a throw. This script runs unattended before the
   nightly agent; a crash here would kill the whole refresh job, when the honest
   outcome of a network failure is simply evidence saying so (verdict network-failed). */
export async function oauthToken(id, secret) {
  try {
    const res = await fetch("https://www.warcraftlogs.com/oauth/token", {
      method: "POST",
      headers: {
        "authorization": "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"),
        "content-type": "application/x-www-form-urlencoded",
        "user-agent": UA
      },
      body: "grant_type=client_credentials"
    });
    const body = await res.text();
    if (!res.ok) return { ok: false, status: res.status, bodyBytes: body.length };
    try { return { ok: true, token: JSON.parse(body).access_token }; }
    catch { return { ok: false, status: res.status, bodyBytes: body.length }; }
  } catch (err) {
    return { ok: false, status: 0, error: err?.cause?.code ?? err?.message ?? String(err) };
  }
}

export async function gql(token, query) {
  try {
    const res = await fetch("https://www.warcraftlogs.com/api/v2/client", {
      method: "POST", headers: gqlHeaders(token), body: JSON.stringify({ query })
    });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch { /* Cloudflare HTML or the like */ }
    return { status: res.status, json, textHead: text.slice(0, 120) };
  } catch (err) {
    return { status: 0, json: null, textHead: `fetch failed: ${err?.cause?.code ?? err?.message ?? err}` };
  }
}

/* Pure verdict mapping — unit-tested. `probe` is the rdps characterRankings attempt:
   { httpStatus, errors: [..gql error messages..], rankings: n } or null when it never
   ran (transport failed first). */
export function verdictFor({ hasCreds, oauth, transportOk, probe }) {
  if (!hasCreds) return {
    verdict: "no-credentials",
    detail: "WCL_CLIENT_ID / WCL_CLIENT_SECRET are not set — the fetch step ran without credentials (secret rot or workflow misconfiguration)"
  };
  if (!oauth?.ok) return oauth?.status === 0
    ? { verdict: "network-failed",
        detail: `OAuth POST never reached WCL (${oauth.error ?? "network failure"}) — transport problem, not a credential conclusion` }
    : { verdict: "oauth-failed",
        detail: `OAuth client-credentials POST failed (HTTP ${oauth?.status ?? "?"}) — check the WCL client secrets` };
  if (!transportOk || !probe) return {
    verdict: "network-failed",
    detail: "GraphQL transport to /api/v2/client failed after retry (Cloudflare or network) — no metric conclusion possible this run"
  };
  if (probe.errors?.length) return {
    verdict: "rdps-broken",
    detail: `characterRankings(metric: rdps) on encounter ${probe.encounterId}: ${probe.errors.join("; ")} — the rDPS metric family is still broken upstream, no WCL cut can honestly land (refresh-metrics SKILL.md, "WCL v2 API status")`
  };
  if ((probe.rankings ?? 0) > 0) return {
    verdict: "rdps-restored",
    detail: `characterRankings(metric: rdps) on encounter ${probe.encounterId} returned ${probe.rankings} rankings — WCL fixed the rDPS family; owner decision needed: freeze a deterministic median recipe into src/fetch-wcl.mjs (zone 52 first) before any cut can land`
  };
  return {
    verdict: "network-failed",
    detail: "rdps probe returned neither errors nor rankings — inconclusive shape, treated as transport failure"
  };
}

// Known-good encounter for the standing rdps check (zone 46 live raid, Imperator
// Averzian) — the rdps-family bug reproduces on every encounter, so one suffices.
const RDPS_PROBE_ENCOUNTER = 3176;

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

async function fetchDummyRawMedians(token) {
  const byEncounter = [], perEncounter = {};
  for (const enc of DUMMY_ENCOUNTERS) {
    const rankings = [];
    let ok = true, reason = null;
    for (let page = 1; page <= MAX_DUMMY_PAGES; page++) {
      await sleep(600); // polite guest
      const q = `{ worldData { encounter(id: ${enc.id}) { characterRankings(metric: dps, page: ${page}) } } }`;
      const r = await gql(token, q);
      const blob = r.json?.data?.worldData?.encounter?.characterRankings;
      if (!blob || r.json?.errors?.length) {
        ok = false;
        reason = r.json?.errors?.map(e => e.message).join("; ") ?? `HTTP ${r.status}, no characterRankings`;
        break;
      }
      rankings.push(...(blob.rankings ?? []));
      if (!blob.hasMorePages) break;
      if (page === MAX_DUMMY_PAGES) { ok = false; reason = `population exceeds the ${MAX_DUMMY_PAGES}-page budget — owner decision needed before trusting a median`; }
    }
    perEncounter[`${enc.targets}T`] = ok ? { ok: true, players: rankings.length } : { ok: false, reason };
    if (ok) byEncounter.push({ targets: enc.targets, rankings });
    // Complete pagination or nothing: a failed encounter contributes no rows.
  }
  return { byEncounter, perEncounter };
}

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function main() {
  const outDir = process.argv.find(a => a.startsWith("--out="))?.slice(6) ?? "wcl-fetch";
  const ID = process.env.WCL_CLIENT_ID, SECRET = process.env.WCL_CLIENT_SECRET;

  const state = { hasCreds: Boolean(ID && SECRET), oauth: null, transportOk: false, probe: null };
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
      // Transport check with one mechanical retry (CLAUDE.md: keep retry/backoff).
      for (let attempt = 1; attempt <= 2 && !state.transportOk; attempt++) {
        if (attempt > 1) await sleep(2000);
        const rl = await gql(state.oauth.token, "{ rateLimitData { limitPerHour pointsSpentThisHour } }");
        if (rl.json?.data?.rateLimitData) {
          state.transportOk = true;
          evidence.transport.graphql = true;
          evidence.transport.rateLimit = rl.json.data.rateLimitData;
          console.log("✓ GraphQL transport up:", JSON.stringify(rl.json.data.rateLimitData));
        } else {
          console.log(`✗ GraphQL transport attempt ${attempt}: HTTP ${rl.status}, ${rl.textHead.slice(0, 60)}`);
        }
      }

      if (state.transportOk) {
        await sleep(600); // polite guest
        const q = `{ worldData { encounter(id: ${RDPS_PROBE_ENCOUNTER}) { name characterRankings(metric: rdps, page: 1) } } }`;
        const r = await gql(state.oauth.token, q);
        const errors = r.json?.errors?.map(e => e.message) ?? (r.json ? [] : [`HTTP ${r.status}, non-JSON response`]);
        const rankings = r.json?.data?.worldData?.encounter?.characterRankings?.rankings?.length ?? 0;
        state.probe = { encounterId: RDPS_PROBE_ENCOUNTER, httpStatus: r.status, errors, rankings };
        evidence.probes.push({ name: `rdps@${RDPS_PROBE_ENCOUNTER}`, ok: errors.length === 0 && rankings > 0, httpStatus: r.status, errors, rankings });
        console.log(errors.length ? `✗ rdps probe: ${errors.join("; ")}` : `✓ rdps probe: ${rankings} rankings on page 1`);

        // Zone-52 raw-DPS medians (frozen recipe #1) — metric: dps, so this runs and
        // can LAND regardless of the rdps family's state.
        try {
          const specs = JSON.parse(await readFile(path.join(rootDir, "data", "specs.json"), "utf8"));
          const roster = new Set(specs.filter(s => s.role === "DPS").map(s => `${s.class}|${s.spec}`));
          const { byEncounter, perEncounter } = await fetchDummyRawMedians(state.oauth.token);
          const today = new Date().toISOString().slice(0, 10);
          const rows = buildDummyRawRows(byEncounter, roster, today);
          evidence.dummyRaw = { perEncounter, rowsBuilt: rows.length };
          if (rows.length) {
            const scratch = path.join(outDir, "dummy-raw-metrics.json");
            await mkdir(outDir, { recursive: true });
            await writeFile(scratch, JSON.stringify({ metrics: rows }, null, 2) + "\n");
            // applyMetrics refuses atomically on unmatched rows or validation failure —
            // a refusal is recorded as evidence, never a crash and never a partial write.
            const applied = await applyMetrics(scratch, rootDir);
            evidence.dummyRaw.applied = applied.metricsApplied;
            evidence.landed["wcl-dummy-raw"] = { rows: applied.metricsApplied, perEncounter };
            console.log(`✓ dummy-raw: ${applied.metricsApplied} median raw-DPS rows merged (${Object.entries(perEncounter).map(([t, e]) => `${t}:${e.ok ? e.players + "p" : "failed"}`).join(" ")})`);
          } else {
            console.log(`✗ dummy-raw: no complete encounter populations (${JSON.stringify(perEncounter)})`);
          }
        } catch (err) {
          evidence.dummyRaw = { ...(evidence.dummyRaw ?? {}), error: err?.message ?? String(err) };
          console.log(`::warning title=Dummy Dome raw-median recipe failed::${err?.message ?? err}`);
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
