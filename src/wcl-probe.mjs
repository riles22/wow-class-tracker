/* WCL v2 API diagnostic probe (2026-07-14) — deterministic, no AI, dispatch-only.

   Context: the nightly's sanctioned WCL path (v2 GraphQL) fails with a bare
   "Internal server error" on the rDPS-family metrics (rdps/ndps/cdps/bossrdps)
   while dps/hps/wdps/default work — bisected and confirmed by the 2026-07-14 run
   (.claude/skills/ptr-watch/log.md). This probe pins the remaining unknowns:

     1. Is the rdps-family 500 still present? (cheap retry — WCL may fix it)
     2. What does `metric: default` actually resolve to? The SITE's default damage
        ranking is rDPS in modern content, so `default` may reach rDPS data through
        a resolver path the broken enum doesn't. Test: join default-vs-dps rankings
        by character name — identical amounts ⇒ default==dps (no workaround);
        systematically different ⇒ default is the redistributed family (workaround).
     3. Does the encounter-wide leaderboard cover the FULL parse population on the
        small PTR zones (zone-52 Dummy Dome)? If count ≈ the statistics table's
        known parse totals, a true median is computable from rankings pages without
        inventing an aggregate.

   Run via .github/workflows/wcl-probe.yml (WCL_CLIENT_ID/WCL_CLIENT_SECRET env).
   Prints values and counts only — never the token or secrets. */

const ID = process.env.WCL_CLIENT_ID, SECRET = process.env.WCL_CLIENT_SECRET;
if (!ID || !SECRET) { console.error("✗ WCL_CLIENT_ID / WCL_CLIENT_SECRET not set"); process.exit(1); }

// Header recipe proven by the 2026-07-14 run: browser UA for the token POST;
// Origin + Referer + sec-ch-ua to clear Cloudflare on the GraphQL POST.
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const GQL_HEADERS = token => ({
  "authorization": `Bearer ${token}`,
  "content-type": "application/json",
  "user-agent": UA,
  "origin": "https://www.warcraftlogs.com",
  "referer": "https://www.warcraftlogs.com/",
  "sec-ch-ua": '"Chromium";v="126", "Not.A/Brand";v="24"'
});

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function token() {
  const res = await fetch("https://www.warcraftlogs.com/oauth/token", {
    method: "POST",
    headers: {
      "authorization": "Basic " + Buffer.from(`${ID}:${SECRET}`).toString("base64"),
      "content-type": "application/x-www-form-urlencoded",
      "user-agent": UA
    },
    body: "grant_type=client_credentials"
  });
  const body = await res.text();
  if (!res.ok) { console.error(`✗ token POST ${res.status} (body ${body.length} bytes)`); process.exit(1); }
  const t = JSON.parse(body).access_token;
  console.log(`✓ OAuth token issued (len ${t.length})`);
  return t;
}

async function gql(t, query) {
  const res = await fetch("https://www.warcraftlogs.com/api/v2/client", {
    method: "POST", headers: GQL_HEADERS(t), body: JSON.stringify({ query })
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* Cloudflare HTML or the like */ }
  return { status: res.status, json, textHead: text.slice(0, 120) };
}

/* characterRankings returns a JSON scalar blob; shape observed: { page, hasMorePages,
   count, rankings: [{ name, class, spec, amount, ... }] } — read defensively. */
async function probeRankings(t, encounterId, metric, extraArgs = "") {
  const q = `{ worldData { encounter(id: ${encounterId}) { name characterRankings(metric: ${metric}, page: 1${extraArgs}) } } }`;
  const { status, json, textHead } = await gql(t, q);
  if (!json) return { ok: false, err: `HTTP ${status}, non-JSON: ${textHead}` };
  if (json.errors?.length) return { ok: false, err: json.errors.map(e => e.message).join("; ") };
  const enc = json.data?.worldData?.encounter;
  const blob = enc?.characterRankings;
  if (!blob) return { ok: false, err: "no characterRankings in response" };
  const rankings = blob.rankings ?? [];
  return {
    ok: true, encName: enc.name, keys: Object.keys(blob).join(","),
    count: blob.count ?? null, hasMore: blob.hasMorePages ?? null,
    n: rankings.length,
    sample: rankings.slice(0, 3).map(r => `${r.name}(${r.class}/${r.spec})=${r.amount}`),
    byName: new Map(rankings.map(r => [r.name, r.amount]))
  };
}

const ENCOUNTERS = [
  { id: 3176, label: "zone46 live raid (Imperator Averzian)" },
  { id: 3591, label: "zone52 Dummy Dome 1-target" }
];
const METRICS = ["dps", "rdps", "ndps", "default"];

const t = await token();

const rl = await gql(t, "{ rateLimitData { limitPerHour pointsSpentThisHour } }");
console.log("rateLimitData:", JSON.stringify(rl.json?.data?.rateLimitData ?? rl.textHead));

const results = {};
for (const enc of ENCOUNTERS) {
  for (const metric of METRICS) {
    await sleep(600); // polite guest
    const r = await probeRankings(t, enc.id, metric);
    results[`${enc.id}:${metric}`] = r;
    console.log(r.ok
      ? `✓ enc ${enc.id} [${enc.label}] metric=${metric} → n=${r.n} count=${r.count} hasMore=${r.hasMore} keys=[${r.keys}] sample: ${r.sample.join(" · ")}`
      : `✗ enc ${enc.id} [${enc.label}] metric=${metric} → ${r.err}`);
  }
}

// Equivalence: default vs dps, joined by character name on page 1.
for (const enc of ENCOUNTERS) {
  const d = results[`${enc.id}:default`], p = results[`${enc.id}:dps`];
  if (!d?.ok || !p?.ok) { console.log(`— equivalence enc ${enc.id}: skipped (missing side)`); continue; }
  let same = 0, diff = 0, maxRel = 0;
  for (const [name, amt] of d.byName) {
    if (!p.byName.has(name)) continue;
    const other = p.byName.get(name);
    if (amt === other) same++;
    else { diff++; if (other) maxRel = Math.max(maxRel, Math.abs(amt - other) / other); }
  }
  console.log(`≟ enc ${enc.id} default-vs-dps (joined by name): identical=${same} differing=${diff} maxRelDelta=${(maxRel * 100).toFixed(2)}%`);
  console.log(diff === 0 && same > 0
    ? `  → metric "default" resolves to plain dps here — NOT an rdps workaround`
    : diff > 0
      ? `  → metric "default" returns DIFFERENT numbers than dps — likely the redistributed (rDPS-family) path; workaround viable, verify direction/magnitude`
      : `  → no overlapping names; inconclusive`);
}

// Population coverage on the small PTR encounter: does the unfiltered leaderboard
// count approximate the statistics table's known parse totals (~780 on 1T at 07-09)?
const dome = results["3591:dps"];
if (dome?.ok) {
  console.log(`◎ zone52 1T unfiltered leaderboard count=${dome.count} (statistics table showed ~782 total parses on 2026-07-09) — ${dome.count != null && dome.count > 400 ? "full-population median looks computable from rankings pages" : "leaderboard appears truncated vs the statistics population"}`);
}
console.log("probe complete");
