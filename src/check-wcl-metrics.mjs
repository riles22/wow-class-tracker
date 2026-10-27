/* Compare canonical WCL data with the independent PRE-agent collection artifact.
   The receipt/updates are trusted only because CI downloads them after agent output. */
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { LIVE_LEADERBOARDS, expectedMetricName, leaderboardCeiling } from "./wcl-live.mjs";
import { PHASES } from "./normalize.mjs";
import { createWclCoverage } from "./wcl-coverage.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const wclDigest = value => createHash("sha256").update(JSON.stringify(value)).digest("hex");
export const storedWclRows = specs => specs.flatMap(s => (s.metrics ?? []).filter(m => m.source === "warcraftlogs")
  .map(m => {
    if (Object.hasOwn(m, "class") || Object.hasOwn(m, "spec")) throw new Error("Canonical WCL metrics must take their class/spec identity from the enclosing spec");
    // Preserve the hash's original key order while binding identity to its owner.
    return { class: s.class, spec: s.spec, ...m, class: s.class, spec: s.spec };
  }));
const tuple = row => `${row.class}|${row.spec}|${row.source}|${row.bracket}|${row.name}`;
const sorted = rows => rows.toSorted((a, b) => tuple(a).localeCompare(tuple(b)));
const iso = v => typeof v === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(v) && Number.isFinite(Date.parse(v));

export function checkWclMetrics({ baseline, current, evidence, updates, manifest, coverage, now = new Date() }) {
  const errors = [];
  try {
    const before = storedWclRows(baseline), after = storedWclRows(current);
    const dummyRows = specs => specs.filter(s => s.ptrDummy != null)
      .map(s => ({ class: s.class, spec: s.spec, ptrDummy: s.ptrDummy }));
    if (!isDeepStrictEqual(sorted(dummyRows(baseline)), sorted(dummyRows(current))))
      throw new Error("Historical WCL ptrDummy observations must be retained exactly; leaderboard collection cannot replace them");
    if (evidence?.schemaVersion !== 2 || evidence.liveSeason !== PHASES.liveSeason || !iso(evidence.attemptedAt)
      || Date.parse(evidence.attemptedAt) > +now || +now - Date.parse(evidence.attemptedAt) > 24 * 3600_000
      || evidence.baselineSha256 !== wclDigest(before)) throw new Error("WCL receipt is missing, stale, future, wrong-season, or bound to a different baseline");
    // `retire` (fetch-wcl.mjs partitionRetirements) is present only when it lists something.
    const keys = Object.keys(updates ?? {}).join(), retire = updates?.retire ?? [];
    if (!updates || !["metrics", "metrics,retire"].includes(keys) || !Array.isArray(updates.metrics) || updates.metrics.length > leaderboardCeiling(baseline.length)
      || !Array.isArray(retire) || (keys === "metrics,retire" && !retire.length)
      || evidence.updatesSha256 !== wclDigest(updates)) throw new Error("WCL updates differ from the trusted receipt");
    if (manifest !== undefined && !Array.isArray(manifest?.sources)) throw new Error("WCL manifest source rows are missing");
    /* A refused merge (fetch-wcl.mjs: merge-failed) landed and retired nothing. Publication
       goes ahead with every WCL row held exactly as the baseline (owner decision
       2026-10-27); the refresh job's final gate still goes red as the alert. The updates
       and receipts are checked as usual, so the receipt stays bound to what was refused. */
    const held = evidence.verdict === "merge-failed";
    const bySpec = new Map(baseline.map(s => [`${s.class}|${s.spec}`, s]));
    const seen = new Set();
    for (const row of updates.metrics) {
      const cfg = LIVE_LEADERBOARDS.brackets.find(c => c.bracket === row.bracket);
      const sample = row.sample, spec = bySpec.get(`${row.class}|${row.spec}`);
      const encounter = cfg?.encounters.find(e => e.id === sample?.encounterId);
      const metric = spec?.role === "Healer" ? "hps" : "dps";
      // Skipped zero-amount entries (wcl-live.mjs readCut) still sat on the returned page.
      const zeroes = sample?.zeroAmountEntries, returned = row.n + (zeroes ?? 0);
      if (!spec || !encounter || row.source !== "warcraftlogs" || row.name !== expectedMetricName(cfg, encounter, metric)
        || row.era !== "live" || row.unit !== metric.toUpperCase() || !Number.isInteger(row.value) || row.value <= 0
        || !Number.isInteger(row.n) || row.n < 10 || row.n > 100 || seen.has(tuple(row))
        || !iso(sample.observedAt) || !iso(sample.oldestRun) || !iso(sample.newestRun)
        || Date.parse(sample.oldestRun) < Date.parse(LIVE_LEADERBOARDS.liveSince)
        || sample.oldestRun > sample.newestRun || sample.newestRun > sample.observedAt
        || Date.parse(sample.observedAt) < Date.parse(evidence.attemptedAt) || Date.parse(sample.observedAt) > +now
        || row.asOf !== sample.newestRun.slice(0, 10) || typeof sample.hasMorePages !== "boolean"
        || (zeroes !== undefined && (!Number.isInteger(zeroes) || zeroes < 1))
        || returned > 100 || (sample.hasMorePages && returned !== 100)
        || !isDeepStrictEqual(sample, { kind: "leaderboard-entries", cap: 100, metric, zoneId: cfg.zoneId,
          encounterId: encounter.id, partition: cfg.partition, difficulty: cfg.difficulty, size: cfg.size,
          ...(cfg.keystoneLevel ? { keystoneLevel: cfg.keystoneLevel } : {}), observedAt: sample.observedAt,
          oldestRun: sample.oldestRun, newestRun: sample.newestRun, hasMorePages: sample.hasMorePages,
          ...(zeroes !== undefined ? { zeroAmountEntries: zeroes } : {}) })) throw new Error("Invalid WCL leaderboard tuple, value, sample, or provenance");
      seen.add(tuple(row));
    }
    for (const cfg of LIVE_LEADERBOARDS.brackets) {
      const receipt = evidence.brackets?.[cfg.key], rows = updates.metrics.filter(m => m.bracket === cfg.bracket);
      const landed = evidence.landed?.[cfg.key]?.rows ?? 0;
      // Authentication/network failure may precede all bracket discovery. It cannot
      // authorize changes or a successful manifest row.
      if (!receipt) {
        if (rows.length || landed || !["no-credentials", "oauth-failed", "network-failed"].includes(evidence.verdict)) throw new Error(`${cfg.key}: missing collection receipt`);
      } else {
        if (!["success", "partial", "invalid", "unreachable"].includes(receipt.status)
          || receipt.rows !== rows.length || landed !== (held ? 0 : rows.length) || receipt.cuts?.length !== cfg.encounters.length * baseline.length)
          throw new Error(`${cfg.key}: coverage/landed receipt does not match collected rows`);
        const cuts = new Map();
        for (const cut of receipt.cuts) {
          const key = `${cut.class}|${cut.spec}|${cut.encounterId}`;
          if (cuts.has(key) || !bySpec.has(`${cut.class}|${cut.spec}`) || !cfg.encounters.some(e => e.id === cut.encounterId)
            || !["success", "sparse", "invalid", "unreachable"].includes(cut.status)) throw new Error(`${cfg.key}: invalid or duplicated cut receipt`);
          cuts.set(key, cut);
        }
        if (receipt.cuts.filter(c => c.status === "success").length !== rows.length
          || (receipt.status === "success" && (rows.length < cfg.minRows || receipt.cuts.some(c => !["success", "sparse"].includes(c.status)))))
          throw new Error(`${cfg.key}: successful coverage was overstated`);
        for (const row of rows) {
          const c = cuts.get(`${row.class}|${row.spec}|${row.sample.encounterId}`);
          if (c?.status !== "success" || c.value !== row.value || c.samples !== row.n || c.asOf !== row.asOf
            || c.observedAt !== row.sample.observedAt || c.oldestRun !== row.sample.oldestRun || c.newestRun !== row.sample.newestRun
            || c.metric !== row.sample.metric || c.hasMorePages !== row.sample.hasMorePages
            || c.zeroAmountEntries !== row.sample.zeroAmountEntries) throw new Error(`${cfg.key}: metric differs from its cut receipt`);
        }
      }
      if (manifest !== undefined) {
        const entries = manifest.sources.filter(s => s.source === cfg.key);
        if (entries.length !== 1 || (entries[0].result === "success" && receipt?.status !== "success"))
          throw new Error(`${cfg.key}: manifest success needs complete trusted collection`);
        if (held && entries[0].result === "success")
          throw new Error(`${cfg.key}: the WCL merge was refused, so nothing landed and the manifest cannot claim success`);
      }
    }
    for (const key of ["wcl-live-raid", "wcl-live-mplus"]) {
      if (evidence.landed?.[key] || (manifest?.sources ?? []).some(s => s.source === key && s.result === "success"))
        throw new Error(`${key}: leaderboards cannot vouch for historical population medians`);
    }
    /* Partition-switch retirements (fetch-wcl.mjs partitionRetirements). Each must name a
       stored leaderboard row on a reviewed partition other than its pin, in a pool this run
       refreshed, whose cut WCL answered on the pin as sparse or invalid. Validation still
       refuses any pool the merge would leave mixed. */
    const retired = new Set(), roleOf = row => bySpec.get(`${row.class}|${row.spec}`)?.role;
    for (const entry of retire) {
      const cfg = LIVE_LEADERBOARDS.brackets.find(c => c.bracket === entry?.bracket);
      const old = before.find(row => tuple(row) === tuple(entry ?? {}));
      const cut = old && evidence.brackets?.[cfg?.key]?.cuts?.find(c => c.class === old.class && c.spec === old.spec && c.encounterId === old.sample?.encounterId);
      if (!isDeepStrictEqual(Object.keys(entry ?? {}), ["class", "spec", "source", "bracket", "name"]) || entry.source !== "warcraftlogs"
        || !cfg || !old || old.sample?.kind !== "leaderboard-entries" || old.sample.partition === cfg.partition
        || !cfg.reviewedPartitions.some(p => p.id === old.sample.partition) || seen.has(tuple(entry)) || retired.has(tuple(entry))
        || !updates.metrics.some(row => row.bracket === entry.bracket && row.name === entry.name && roleOf(row) === roleOf(entry))
        || !["sparse", "invalid"].includes(cut?.status))
        throw new Error("Invalid WCL partition retirement: it must name a stored row on an older reviewed partition, in a refreshed pool, whose cut WCL answered as sparse or invalid");
      retired.add(tuple(entry));
    }
    for (const cfg of LIVE_LEADERBOARDS.brackets) {
      if ((evidence.retired?.[cfg.key]?.rows ?? 0) !== (held ? 0 : retire.filter(r => r.bracket === cfg.bracket).length))
        throw new Error(`${cfg.key}: retired receipt does not match the sealed retirements`);
    }
    if (Object.keys(evidence.retired ?? {}).some(key => !LIVE_LEADERBOARDS.brackets.some(c => c.key === key)))
      throw new Error("WCL retired receipt names an unknown bracket");
    const expected = new Map(before.map(row => [tuple(row), row]));
    if (!held) {
      for (const key of retired) expected.delete(key);
      for (const row of updates.metrics) expected.set(tuple(row), row);
    }
    if (!isDeepStrictEqual(sorted([...expected.values()]), sorted(after))) throw new Error(held
      ? "The WCL merge was refused, so every canonical WCL row must equal the baseline exactly"
      : "Canonical WCL rows differ from trusted updates; failed/sparse cuts and historical data must be retained exactly");
    if (coverage !== undefined && !isDeepStrictEqual(coverage, createWclCoverage(evidence, baseline)))
      throw new Error("Public WCL coverage differs from the trusted collection receipt");
  } catch (error) { errors.push(error.message); }
  return errors;
}

export async function runWclCheck({ root = ROOT, evidenceDir = path.join(root, "wcl-fetch"), base = "HEAD", manifestPath } = {}) {
  if (base !== "HEAD" && !/^[a-f0-9]{40}$/.test(base)) throw new Error("--base must be HEAD or an exact commit SHA");
  const baseline = JSON.parse(execFileSync("git", ["show", `${base}:data/specs.json`], { cwd: root, encoding: "utf8", windowsHide: true, maxBuffer: 20 * 1024 * 1024 }));
  const json = async p => JSON.parse(await readFile(p, "utf8"));
  return checkWclMetrics({ baseline, current: await json(path.join(root, "data/specs.json")),
    evidence: await json(path.join(evidenceDir, "evidence.json")), updates: await json(path.join(evidenceDir, "updates.json")),
    coverage: await json(path.join(root, "data/wcl-coverage.json")),
    ...(manifestPath ? { manifest: await json(path.resolve(root, manifestPath)) } : {}) });
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2), options = {}, names = { "--base": "base", "--evidence-dir": "evidenceDir", "--manifest": "manifestPath" };
    for (let i = 0; i < args.length; i += 2) {
      if (!names[args[i]] || !args[i + 1]) throw new Error("Usage: check-wcl-metrics.mjs [--base HEAD|sha] [--evidence-dir path] [--manifest path]");
      options[names[args[i]]] = args[i + 1];
    }
    const errors = await runWclCheck(options);
    if (errors.length) throw new Error(errors.join("\n"));
    const evidencePath = path.join(options.evidenceDir ?? path.join(ROOT, "wcl-fetch"), "evidence.json");
    if (JSON.parse(await readFile(evidencePath, "utf8")).verdict === "merge-failed") {
      console.log("::warning title=WCL held::The WCL merge was refused (merge-failed). Every WCL row is held exactly as last published; nothing new landed.");
    } else console.log("WCL leaderboard metrics match trusted collection; every WCL row it did not refresh or retire is retained exactly.");
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
