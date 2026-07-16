import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]

provenance = '''import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { promisify } from "node:util";
import { loadData } from "./validate.mjs";
import { probeDate } from "./check-refresh.mjs";

const execFileAsync = promisify(execFile);
const ISO_INSTANT = /^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d{3})?Z$/;
const MAX_RUN_AGE_MS = 3 * 60 * 60 * 1000;
const FUTURE_SKEW_MS = 5 * 60 * 1000;
const own = (obj, key) => Object.prototype.hasOwnProperty.call(obj ?? {}, key);
const shown = value => value == null ? "null" : JSON.stringify(value);

export function validateStartedAt(manifest, nowInstant = new Date()) {
  const errors = [];
  const raw = manifest?.startedAt;
  if (typeof raw !== "string" || !ISO_INSTANT.test(raw)) {
    return ["run-manifest: startedAt must be a full UTC ISO 8601 instant (YYYY-MM-DDTHH:mm:ss[.sss]Z)"];
  }
  const started = new Date(raw);
  if (Number.isNaN(started.getTime())) {
    return [`run-manifest: startedAt is not a real instant (${JSON.stringify(raw)})`];
  }
  if (manifest?.run !== raw.slice(0, 10)) {
    errors.push(`run-manifest: startedAt date ${raw.slice(0, 10)} does not match run ${shown(manifest?.run)}`);
  }
  const age = nowInstant.getTime() - started.getTime();
  if (age < -FUTURE_SKEW_MS) {
    errors.push(`run-manifest: startedAt ${raw} is in the future`);
  } else if (age > MAX_RUN_AGE_MS) {
    errors.push(`run-manifest: startedAt ${raw} is outside the 3-hour workflow window`);
  }
  return errors;
}

export function validateManifestProvenance(config, manifest, currentData, baselineData, nowInstant = new Date()) {
  const errors = [...validateStartedAt(manifest, nowInstant)];
  if (own(manifest, "anomalyAck")) {
    errors.push("run-manifest: anomalyAck is agent-controlled and is not permitted; movement anomalies require human review");
  }

  const rows = new Map((manifest?.sources ?? []).map(row => [row.source, row]));
  for (const req of config.requirements ?? []) {
    const row = rows.get(req.key);
    if (!row) continue;

    if (!own(row, "previousAsOf")) errors.push(`run-manifest: "${req.key}" must include previousAsOf`);
    if (!own(row, "newAsOf")) errors.push(`run-manifest: "${req.key}" must include newAsOf`);

    const expectedPrevious = req.date ? probeDate(req, baselineData) : null;
    const expectedNew = req.date ? probeDate(req, currentData) : null;
    if (row.previousAsOf !== expectedPrevious) {
      errors.push(`run-manifest: "${req.key}" previousAsOf ${shown(row.previousAsOf)} does not match committed baseline ${shown(expectedPrevious)}`);
    }
    if (row.newAsOf !== expectedNew) {
      errors.push(`run-manifest: "${req.key}" newAsOf ${shown(row.newAsOf)} does not match final stored data ${shown(expectedNew)}`);
    }
    if (expectedPrevious && expectedNew && expectedNew < expectedPrevious) {
      errors.push(`run-manifest: "${req.key}" data date regressed from ${expectedPrevious} to ${expectedNew}`);
    }
  }
  return errors;
}

async function gitJson(root, ref, file) {
  const { stdout } = await execFileAsync("git", ["-C", root, "show", `${ref}:data/${file}`], {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024
  });
  return JSON.parse(stdout);
}

export async function loadBaselineData(root, ref) {
  const [specs, sources, encounterTiers] = await Promise.all([
    gitJson(root, ref, "specs.json"),
    gitJson(root, ref, "sources.json"),
    gitJson(root, ref, "encounter-tiers.json")
  ]);
  return { specs, sources, encounterTiers };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const args = process.argv.slice(2);
  const baselineRef = args.find(arg => arg.startsWith("--baseline-ref="))?.slice(15) ?? "HEAD";
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const readJson = async file => JSON.parse(await readFile(path.join(root, file), "utf8"));
  const [config, manifest, currentData, baselineData] = await Promise.all([
    readJson("data/required-sources.json"),
    readJson("data/run-manifest.json"),
    loadData(root),
    loadBaselineData(root, baselineRef)
  ]);
  const errors = validateManifestProvenance(config, manifest, currentData, baselineData);
  if (errors.length) {
    console.error(`✗ manifest provenance: ${errors.length} failure(s):`);
    for (const error of errors) console.error("  - " + error);
    process.exit(1);
  }
  console.log(`✓ manifest provenance passed against ${baselineRef}`);
}
'''
(root / 'src/check-manifest-provenance.mjs').write_text(provenance, encoding='utf-8')

tests = '''import { test } from "node:test";
import assert from "node:assert/strict";
import { validateStartedAt, validateManifestProvenance } from "../src/check-manifest-provenance.mjs";

const config = {
  requirements: [
    { key: "alpha", date: { type: "pages", sourceId: "alpha" } },
    { key: "feed", date: null }
  ]
};

const data = date => ({
  sources: [{ id: "alpha", pages: [{ snapshot: date }] }],
  specs: [],
  encounterTiers: null
});

const manifest = () => ({
  run: "2026-07-16",
  startedAt: "2026-07-16T10:15:00Z",
  summary: "test",
  sources: [
    { source: "alpha", result: "success", previousAsOf: "2026-07-15", newAsOf: "2026-07-16" },
    { source: "feed", result: "success", previousAsOf: null, newAsOf: null }
  ]
});

const now = new Date("2026-07-16T11:00:00Z");

test("fresh manifest provenance matches the committed baseline and final data", () => {
  assert.deepEqual(validateManifestProvenance(config, manifest(), data("2026-07-16"), data("2026-07-15"), now), []);
});

test("startedAt must be current, UTC, and match the run date", () => {
  assert.deepEqual(validateStartedAt({ run: "2026-07-16", startedAt: "2026-07-16T10:15:00Z" }, now), []);
  assert.ok(validateStartedAt({ run: "2026-07-16", startedAt: "2026-07-15T10:15:00Z" }, now).some(e => e.includes("does not match run")));
  assert.ok(validateStartedAt({ run: "2026-07-16", startedAt: "2026-07-16 10:15:00" }, now).some(e => e.includes("full UTC")));
  assert.ok(validateStartedAt({ run: "2026-07-16", startedAt: "2026-07-16T07:00:00Z" }, now).some(e => e.includes("3-hour")));
});

test("manifest dates cannot disagree with either side of the git comparison", () => {
  const badPrevious = manifest();
  badPrevious.sources[0].previousAsOf = "2026-07-14";
  assert.ok(validateManifestProvenance(config, badPrevious, data("2026-07-16"), data("2026-07-15"), now).some(e => e.includes("committed baseline")));

  const badNew = manifest();
  badNew.sources[0].newAsOf = "2026-07-15";
  assert.ok(validateManifestProvenance(config, badNew, data("2026-07-16"), data("2026-07-15"), now).some(e => e.includes("final stored data")));
});

test("agent-authored anomaly acknowledgements are rejected", () => {
  const m = manifest();
  m.anomalyAck = "trust me";
  assert.ok(validateManifestProvenance(config, m, data("2026-07-16"), data("2026-07-15"), now).some(e => e.includes("not permitted")));
});

test("date regressions and non-null undated feed claims fail", () => {
  assert.ok(validateManifestProvenance(config, manifest(), data("2026-07-14"), data("2026-07-15"), now).some(e => e.includes("regressed")));
  const m = manifest();
  m.sources[1].newAsOf = "2026-07-16";
  assert.ok(validateManifestProvenance(config, m, data("2026-07-16"), data("2026-07-15"), now).some(e => e.includes('"feed" newAsOf')));
});
'''
(root / 'test/manifest-provenance.test.mjs').write_text(tests, encoding='utf-8')

nightly_path = root / '.github/workflows/nightly.yml'
nightly = nightly_path.read_text(encoding='utf-8')
old_gate = '          node src/check-refresh.mjs --manifest\n'
new_gate = '          node src/check-manifest-provenance.mjs --baseline-ref=HEAD\n          node src/check-refresh.mjs --manifest\n'
if old_gate not in nightly:
    raise SystemExit('nightly gate command not found')
nightly = nightly.replace(old_gate, new_gate, 1)

old_honesty = '''               Honesty rules: "success" ONLY when the source's stored dates actually
               advanced this run — the gate cross-checks the repo state and fails
               dishonest claims. Anything less than a full landing is partial/
               unreachable/blocked/parse_error WITH the reason; "skipped" without a
               detail fails the whole publish. If a mass tier shift is a REAL Blizzard
               retune (not a parse artifact), set "anomalyAck": "<reason + citation>" —
               never set it for any other purpose.
'''
new_honesty = '''               Honesty rules: previousAsOf and newAsOf must exactly match the committed
               pre-run state and the final working-tree state — a deterministic provenance
               gate verifies both. "success" means the source was fetched and fully landed.
               Anything less is partial/unreachable/blocked/parse_error WITH the reason;
               "skipped" without a detail fails the whole publish. Never write anomalyAck:
               the agent may not approve its own mass-movement anomaly. An anomaly must fail
               publication for human review.
'''
if old_honesty not in nightly:
    raise SystemExit('nightly honesty block not found')
nightly = nightly.replace(old_honesty, new_honesty, 1)
nightly_path.write_text(nightly, encoding='utf-8')

community_path = root / 'data/community.json'
community = json.loads(community_path.read_text(encoding='utf-8'))
scopes = {
    'Druid': ['Restoration'],
    'Evoker': ['Preservation'],
    'Monk': ['Mistweaver'],
    'Paladin': ['Holy'],
    'Priest': ['Discipline', 'Holy'],
    'Shaman': ['Restoration'],
}
base_creator = {
    'name': 'MadSkillzzTV',
    'credential': 'Long-running World of Warcraft healer specialist; guides, tips, UI, raid and Mythic+ coverage across all healer classes/specs',
    'url': 'https://www.youtube.com/@madskillzztv',
    'channelId': 'UCh9tBg-00bU299M4wc9YUDQ',
    'latest': 'Midnight healer Mythic+ and raid coverage across Restoration Druid/Shaman and Preservation Evoker',
    'verifiedDate': '2026-07-16',
}
found = set()
for entry in community['classes']:
    cls = entry.get('class')
    if cls not in scopes:
        continue
    creators = entry.setdefault('creators', [])
    creators[:] = [creator for creator in creators if creator.get('name') != 'MadSkillzzTV']
    creator = dict(base_creator)
    creator['specs'] = scopes[cls]
    creators.append(creator)
    found.add(cls)
missing = set(scopes) - found
if missing:
    raise SystemExit(f'missing healer class records: {sorted(missing)}')
community['verified'] = '2026-07-16'
community_path.write_text(json.dumps(community, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
