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

import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

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
