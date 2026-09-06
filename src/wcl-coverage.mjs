/* Public collection status derived only from the credential-scoped WCL receipt.
   No provider errors, player identities, report IDs or numeric rankings are copied. */
import { isDeepStrictEqual } from "node:util";
import { LIVE_LEADERBOARDS } from "./wcl-live.mjs";

const iso = value => typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)
  && new Date(value).toISOString() === value;
const key = cut => `${cut.class}|${cut.spec}|${cut.bracket}|${cut.encounterId}`;
const reasons = {
  success: "Usable leaderboard sample",
  insufficient: "Fewer than 10 ranked entries",
  failed: "Collection failed or was not completed; no new measurement verified",
};
export const coverageEncounters = () => Object.fromEntries(LIVE_LEADERBOARDS.brackets
  .map(cfg => [cfg.bracket, cfg.encounters.map(({ id, name }) => ({ id, name }))]));

export function createWclCoverage(evidence, specs) {
  if (evidence?.schemaVersion !== 2 || evidence.liveSeason !== LIVE_LEADERBOARDS.season || !iso(evidence.attemptedAt))
    throw new Error("Cannot publish coverage without a current-season WCL receipt");
  const cuts = [];
  for (const cfg of LIVE_LEADERBOARDS.brackets) {
    const receipt = evidence.brackets?.[cfg.key];
    if (!receipt && !["no-credentials", "oauth-failed", "network-failed"].includes(evidence.verdict))
      throw new Error(`${cfg.key}: missing coverage receipt`);
    const byKey = new Map((receipt?.cuts ?? []).map(c => [`${c.class}|${c.spec}|${c.encounterId}`, c]));
    if (receipt && (byKey.size !== cfg.encounters.length * specs.length || byKey.size !== receipt.cuts.length))
      throw new Error(`${cfg.key}: incomplete or duplicate coverage receipt`);
    for (const encounter of cfg.encounters) for (const spec of specs) {
      const c = byKey.get(`${spec.class}|${spec.spec}|${encounter.id}`);
      if (receipt && !["success", "sparse", "invalid", "unreachable"].includes(c?.status))
        throw new Error(`${cfg.key}: unrecognized coverage cut`);
      // A merge failure cannot report collected samples as published successfully.
      const status = evidence.verdict === "merge-failed" ? "failed"
        : c?.status === "success" ? "success" : c?.status === "sparse" ? "insufficient" : "failed";
      cuts.push({ class: spec.class, spec: spec.spec, bracket: cfg.bracket, encounterId: encounter.id,
        status, ...(status !== "failed" ? { entries: c.samples } : {}),
        checkedAt: status === "failed" ? null : c.observedAt, reason: reasons[status] });
    }
  }
  const coverage = { schemaVersion: 1, season: LIVE_LEADERBOARDS.season, checkedAt: evidence.attemptedAt,
    encounters: coverageEncounters(), cuts };
  const errors = validateWclCoverage(coverage, { specs });
  if (errors.length) throw new Error(errors.join("; "));
  return coverage;
}

export function validateWclCoverage(coverage, { specs, now = Date.now() } = {}) {
  if (coverage == null) return []; // Historical fixtures/checkouts have no receipt.
  try {
    if (coverage.schemaVersion !== 1 || coverage.season !== LIVE_LEADERBOARDS.season
      || !isDeepStrictEqual(Object.keys(coverage).sort(), ["schemaVersion", "season", "checkedAt", "encounters", "cuts"].sort())
      || !iso(coverage.checkedAt) || Date.parse(coverage.checkedAt) > +now
      || !isDeepStrictEqual(coverage.encounters, coverageEncounters())) throw new Error("Invalid WCL coverage version, season, time or encounter inventory");
    const expected = new Set(specs.flatMap(s => LIVE_LEADERBOARDS.brackets.flatMap(cfg => cfg.encounters
      .map(e => key({ ...s, bracket: cfg.bracket, encounterId: e.id })))));
    if (!Array.isArray(coverage.cuts) || coverage.cuts.length !== expected.size) throw new Error("WCL coverage must account for every spec and encounter");
    const seen = new Set();
    for (const c of coverage.cuts) {
      if (!expected.has(key(c)) || seen.has(key(c)) || !Object.hasOwn(reasons, c.status)
        || c.reason !== reasons[c.status]
        || !isDeepStrictEqual(Object.keys(c).sort(), ["class", "spec", "bracket", "encounterId", "status", "checkedAt", "reason", ...(c.status !== "failed" ? ["entries"] : [])].sort()))
        throw new Error("WCL coverage has an invalid, duplicate or unrecognized cut");
      seen.add(key(c));
      if (c.status === "failed") {
        if (c.checkedAt !== null) throw new Error("Failed or unattempted WCL cuts cannot claim a verification time");
      } else if (!Number.isInteger(c.entries) || c.entries < (c.status === "success" ? 10 : 0)
        || c.entries > (c.status === "success" ? 100 : 9) || !iso(c.checkedAt)
        || c.checkedAt < coverage.checkedAt || Date.parse(c.checkedAt) > +now)
        throw new Error("WCL coverage sample count or verification time is invalid");
    }
    return [];
  } catch (error) { return [error.message]; }
}
