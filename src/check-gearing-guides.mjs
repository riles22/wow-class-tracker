// Publish admission for scheduled guide refreshes. A fresh date never excuses a
// missing roster or a large content loss. HEAD supplies the trusted comparison.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const GEARING_GUIDE_SOURCES = Object.freeze({
  icyveins: "Icy Veins", wowhead: "Wowhead", method: "Method",
});
const MAX_DROP = 0.25;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const object = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
const validDate = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
  && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;

function requireDate(date, context, today) {
  if (!validDate(date) || date > today) throw new Error(`${context}: missing, malformed or future verification date`);
  return date;
}

function inspectGuide(doc, id, roster, { today, allowLegacy }) {
  const fail = (message) => { throw new Error(`${id}: ${message}`); };
  if (!object(doc) || doc.schemaVersion !== 1 || doc.sourceId !== id
    || doc.source !== GEARING_GUIDE_SOURCES[id] || doc.dated !== true)
    fail("source identity or schema changed");
  if (!object(doc.specs) || !object(doc.coverage)
    || !Array.isArray(doc.coverage.specsAbsent)
    || (doc.coverage.specsPending != null && !Array.isArray(doc.coverage.specsPending)))
    fail("malformed guide roster or coverage");
  const sourceDate = requireDate(doc.harvestedAt, `${id}/source`, today);
  const records = Object.entries(doc.specs);
  if (!Number.isInteger(doc.coverage.specsHarvested) || doc.coverage.specsHarvested !== records.length)
    fail("specsHarvested differs from the actual record count");
  if ((doc.coverage.specsPending || []).length)
    fail("pending or failed retrievals are not verified coverage");
  const dates = new Map();
  let priorities = 0, bis = 0;
  const addReceipt = (key, date) => {
    if (!roster.includes(key)) fail(`unknown roster spec ${JSON.stringify(key)}`);
    if (dates.has(key)) fail(`duplicate/conflicting roster outcome for ${JSON.stringify(key)}`);
    dates.set(key, requireDate(date, `${id}/${key}`, today));
  };
  for (const [key, record] of records) {
    if (!object(record) || !Array.isArray(record.priorities) || !Array.isArray(record.bis)
      || (!record.priorities.length && !record.bis.length)) fail(`${key}: malformed or empty guide record`);
    const verifiedAt = has(record, "verifiedAt") ? record.verifiedAt : allowLegacy ? sourceDate : null;
    addReceipt(key, verifiedAt);
    if (record.published != null && (!validDate(record.published) || record.published > verifiedAt))
      fail(`${key}: publication date is invalid or later than verification`);
    if (typeof record.guideUrl !== "string" || !/^https:\/\//.test(record.guideUrl))
      fail(`${key}: missing direct guide URL`);
    for (const priority of record.priorities) {
      if (!object(priority) || !Array.isArray(priority.secondaries) || priority.secondaries.length < 2
        || priority.secondaries.some((stat) => !["Crit", "Haste", "Mast", "Vers"].includes(stat)))
        fail(`${key}: malformed priority row`);
    }
    for (const row of record.bis) {
      if (!object(row) || !/^\d+$/.test(String(row.itemId))
        || typeof row.slot !== "string" || !row.slot || typeof row.list !== "string" || !row.list)
        fail(`${key}: malformed BiS row`);
    }
    priorities += record.priorities.length;
    bis += record.bis.length;
  }
  for (const absence of doc.coverage.specsAbsent) {
    if (!object(absence) || typeof absence.spec !== "string"
      || typeof absence.reason !== "string" || !absence.reason.trim())
      fail("verified absence needs a named spec and a reason");
    // A failed request is not an absence. The trusted runner emits its verified-fetch
    // reason only for an actual null result; transport failures remain in staging.
    if (/\b(?:403|429|5\d\d|error|failed|failure|timeout|blocked|unreachable|captcha)\b/i.test(absence.reason))
      fail(`${absence.spec}: retrieval failure was recorded as verified absence`);
    addReceipt(absence.spec, absence.verifiedAt);
  }
  if (dates.size !== roster.length) fail("guide outcomes do not account for the complete trusted roster");
  const oldest = [...dates.values()].sort()[0];
  if (sourceDate !== oldest) fail(`harvestedAt must equal oldest verification (${oldest})`);
  return { counts: { specs: records.length, priorities, bis }, dates };
}

export function checkGearingGuides(previous, current, { roster,
  nowDate = new Date().toISOString().slice(0, 10) } = {}) {
  if (!validDate(nowDate)) throw new Error("guide check needs a valid current date");
  if (!Array.isArray(roster) || !roster.length || new Set(roster).size !== roster.length
    || roster.some((key) => typeof key !== "string" || !key.trim()))
    throw new Error("guide check needs a complete, unique trusted roster");
  const ids = Object.keys(GEARING_GUIDE_SOURCES);
  for (const [label, docs] of [["previous", previous], ["current", current]]) {
    if (!object(docs) || Object.keys(docs).length !== ids.length
      || ids.some((id) => !has(docs, id))) throw new Error(`${label}: fixed guide source set changed`);
  }
  const sources = ids.map((id) => {
    const changed = !same(previous[id], current[id]);
    // Trusted legacy files predate per-record receipts. They may remain untouched,
    // but every rewritten source must migrate to complete explicit verification.
    const before = inspectGuide(previous[id], id, roster, { today: nowDate, allowLegacy: true });
    const after = inspectGuide(current[id], id, roster, { today: nowDate, allowLegacy: !changed });
    for (const key of roster)
      if (after.dates.get(key) < before.dates.get(key))
        throw new Error(`${id}/${key}: verification date regressed`);
    for (const [metric, count] of Object.entries(before.counts)) {
      if (count > 0 && after.counts[metric] < count * (1 - MAX_DROP))
        throw new Error(`${id}: ${metric} dropped by more than 25% (${count} -> ${after.counts[metric]}); review source or parser changes before publishing`);
    }
    return { sourceId: id, changed, before: before.counts, after: after.counts,
      verifiedThrough: current[id].harvestedAt };
  });
  return { changedSources: sources.filter((source) => source.changed).map((source) => source.sourceId), sources };
}

export function checkGearingGuideFiles(root = ROOT) {
  // Every Git object path is fixed here. No shell or mutable filename interpolation.
  const readHead = (path) => JSON.parse(execFileSync("git", ["show", `HEAD:${path}`], {
    cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 20 * 1024 * 1024,
  }));
  const tracker = readHead("data/specs.json");
  if (!Array.isArray(tracker)) throw new Error("trusted tracker roster is malformed");
  const roster = tracker.map((spec) => `${spec.spec} ${spec.class}`);
  const previous = {}, current = {};
  for (const id of Object.keys(GEARING_GUIDE_SOURCES)) {
    const path = `gearing/data/guides/${id}.json`;
    previous[id] = readHead(path);
    current[id] = JSON.parse(readFileSync(join(root, path), "utf8"));
  }
  return checkGearingGuides(previous, current, { roster });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 2) throw new Error("usage: node src/check-gearing-guides.mjs");
  const result = checkGearingGuideFiles();
  for (const source of result.sources)
    console.log(`${source.sourceId}: ${source.changed ? "accepted refresh" : "unchanged"}; ${source.after.specs} specs, ${source.after.priorities} priorities, ${source.after.bis} BiS rows; verified through ${source.verifiedThrough}`);
}
