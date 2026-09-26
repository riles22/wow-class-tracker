/* Merge fetched quantitative data into data/specs.json.
   Usage: node src/apply-metrics.mjs <data.json>

   The input file may contain either or both of:
     "metrics":  [{ "class", "spec", "bracket": "raid"|"mplus", "source",
                    "name", "value", "unit"?, "n"?, "asOf"? }]
     "profiles": [{ "class", "spec", "source", "asOf"?, "tier"?,
                    "targets": { "<targetCount>": <dps>, ... } }]
                  `tier` is the chart's own simc_settings.tier ("MID1"/"MID2") — REQUIRED for
                  bloodmallet (validate.mjs's SIM_TIER_REQUIRED). It was implemented here but
                  missing from this list, which is how a whole harvest came to omit it and left
                  the sim-tier guard passing vacuously until 2026-08-20.
     "retire":   [{ "class", "spec", "source": "mythicstats", "bracket": "mplus", "name" }]
                  MYTHICSTATS ONLY — the stable-metric collector's lane for a spec that
                  dropped off a Mythicstats period with a stored share at or below
                  MYTHICSTATS_RETIRE_MAX_SHARE (owner decision 2026-09-25): that one stored
                  row is removed so the spec reads blank, never a made-up 0. Any other
                  source, series or bracket, a stored share above the bound, or a tuple also
                  present in "metrics" refuses the whole merge; this is not a general delete
                  path. A tuple with no stored row is a no-op.
   Metrics upsert by (source, bracket, name); profiles replace fightProfile.
   Exact class+spec matching; refuses to write on any unmatched row or
   validation failure. */

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { validateData, loadData } from "./validate.mjs";
import { MYTHICSTATS_RETIRE_MAX_SHARE } from "./fetch-stable-metrics.mjs";
import { STABLE_SERIES } from "./stable-metric-parsers.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function applyMetrics(dataPath, root = ROOT) {
  const input = JSON.parse(await readFile(dataPath, "utf8"));
  const data = await loadData(root);
  const byKey = new Map(data.specs.map(spec => [`${spec.class}|${spec.spec}`, spec]));
  const unmatched = [];
  let metricsApplied = 0, profilesApplied = 0;

  for (const row of input.metrics ?? []) {
    const spec = byKey.get(`${row.class}|${row.spec}`);
    if (!spec) { unmatched.push(`metric: ${row.class} / ${row.spec} (${row.source})`); continue; }
    spec.metrics ??= [];
    const existing = spec.metrics.findIndex(m => m.source === row.source && m.bracket === row.bracket && m.name === row.name);
    const entry = { source: row.source, bracket: row.bracket, name: row.name, value: row.value };
    if (row.unit != null) entry.unit = row.unit;
    if (row.n != null) entry.n = row.n;
    if (row.asOf != null) entry.asOf = row.asOf;
    if (row.era != null) entry.era = row.era; // era gating must survive the merge, not ride on name inference
    if (row.sample != null) entry.sample = structuredClone(row.sample); // reviewed WCL leaderboard provenance
    if (existing >= 0) spec.metrics[existing] = entry; else spec.metrics.push(entry);
    metricsApplied++;
  }

  // Mythicstats retirement only (see the header). Every refusal throws before anything is written.
  let metricsRetired = 0;
  const upserted = new Set((input.metrics ?? []).map(row => `${row.class}|${row.spec}|${row.source}|${row.bracket}|${row.name}`));
  for (const row of input.retire ?? []) {
    const label = `retire: ${row?.class} / ${row?.spec} (${row?.source})`;
    if (row?.source !== "mythicstats" || row.bracket !== "mplus" || row.name !== STABLE_SERIES.mythicstats.name) {
      throw new Error(`${label} — only the Mythicstats "${STABLE_SERIES.mythicstats.name}" M+ series can be retired; nothing written`);
    }
    const spec = byKey.get(`${row.class}|${row.spec}`);
    if (!spec) { unmatched.push(label); continue; }
    if (upserted.has(`${row.class}|${row.spec}|${row.source}|${row.bracket}|${row.name}`)) {
      throw new Error(`${label} is also upserted — nothing written`);
    }
    const i = (spec.metrics ?? []).findIndex(m => m.source === row.source && m.bracket === row.bracket && m.name === row.name);
    if (i < 0) continue;
    if (!(spec.metrics[i].value <= MYTHICSTATS_RETIRE_MAX_SHARE)) {
      throw new Error(`${label} stores ${spec.metrics[i].value}%, above the ${MYTHICSTATS_RETIRE_MAX_SHARE}% retirement bound — nothing written`);
    }
    spec.metrics.splice(i, 1);
    metricsRetired++;
  }

  for (const row of input.profiles ?? []) {
    const spec = byKey.get(`${row.class}|${row.spec}`);
    if (!spec) { unmatched.push(`profile: ${row.class} / ${row.spec}`); continue; }
    /* `tier` is the chart's OWN simc_settings.tier (e.g. "MID1" / "MID2"), carried through
       so the sim-tier uniformity invariant in validate.mjs can see it. Optional — a source
       that does not publish a tier simply omits it — but a harvest that HAS the field must
       not drop it, or a mixed-tier pool becomes invisible to that check. */
    spec.fightProfile = { source: row.source, asOf: row.asOf ?? null, targets: row.targets };
    if (row.tier != null) spec.fightProfile.tier = row.tier;
    profilesApplied++;
  }

  let survivabilityApplied = 0;
  for (const row of input.survivability ?? []) {
    const spec = byKey.get(`${row.class}|${row.spec}`);
    if (!spec) { unmatched.push(`survivability: ${row.class} / ${row.spec}`); continue; }
    spec.survivability = { tier: row.tier, source: row.source ?? "archon", asOf: row.asOf ?? null };
    survivabilityApplied++;
  }

  let playstyleApplied = 0;
  for (const row of input.playstyle ?? []) {
    const spec = byKey.get(`${row.class}|${row.spec}`);
    if (!spec) { unmatched.push(`playstyle: ${row.class} / ${row.spec}`); continue; }
    // SPREAD, don't replace: a bare assignment wiped complexity, complexityNotes and any
    // other field merged by the separate complexity fetch — silently, since validation
    // cannot see a missing optional field. Those fields feed the Spec Finder
    // (audit 2026-07-24, C4).
    spec.playstyle = {
      ...(spec.playstyle ?? {}),
      range: row.range, mobility: row.mobility, utility: row.utility,
      notes: row.utilityNotes ?? row.notes ?? null
    };
    playstyleApplied++;
  }

  // Complexity merges into the existing playstyle object (separate fetch).
  for (const row of input.complexity ?? []) {
    const spec = byKey.get(`${row.class}|${row.spec}`);
    if (!spec) { unmatched.push(`complexity: ${row.class} / ${row.spec}`); continue; }
    spec.playstyle = spec.playstyle ?? {};
    spec.playstyle.complexity = row.complexity;
    if (row.complexityNotes) spec.playstyle.complexityNotes = row.complexityNotes;
    playstyleApplied++;
  }

  // 12.1 PTR Dummy Dome — real-player median DPS by fixed target count (WCL zone 52).
  let ptrDummyApplied = 0;
  for (const row of input.ptrdummy ?? []) {
    const spec = byKey.get(`${row.class}|${row.spec}`);
    if (!spec) { unmatched.push(`ptrdummy: ${row.class} / ${row.spec}`); continue; }
    spec.ptrDummy = { source: row.source ?? "warcraftlogs", asOf: row.asOf ?? null, targets: row.targets };
    ptrDummyApplied++;
  }

  // Season 2 tier set bonuses (actual 2pc/4pc text).
  let tierSetsApplied = 0;
  for (const row of input.tiersets ?? []) {
    const spec = byKey.get(`${row.class}|${row.spec}`);
    if (!spec) { unmatched.push(`tierset: ${row.class} / ${row.spec}`); continue; }
    spec.tierSet = { set2: row.set2 || null, set4: row.set4 || null, source: row.source ?? null, asOf: row.asOf ?? null };
    tierSetsApplied++;
  }

  // Melee-capability verification (updates range + sets meleeCapable for hybrids).
  for (const row of input.melee ?? []) {
    const spec = byKey.get(`${row.class}|${row.spec}`);
    if (!spec) { unmatched.push(`melee: ${row.class} / ${row.spec}`); continue; }
    spec.playstyle = spec.playstyle ?? {};
    if (row.primaryRange) spec.playstyle.range = row.primaryRange;
    spec.playstyle.meleeCapable = !!row.meleeCapable;
    playstyleApplied++;
  }

  if (unmatched.length) {
    throw new Error(
      `${unmatched.length} row(s) did not match any spec — nothing written:\n` +
      unmatched.map(u => "  - " + u).join("\n")
    );
  }

  const errors = validateData(data, { fullRoster: true });
  if (errors.length) {
    throw new Error("Merged data failed validation — nothing written:\n" + errors.map(e => "  - " + e).join("\n"));
  }

  await writeFile(path.join(root, "data", "specs.json"), JSON.stringify(data.specs, null, 2) + "\n");
  return { metricsApplied, metricsRetired, profilesApplied, survivabilityApplied, playstyleApplied, ptrDummyApplied, tierSetsApplied };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const dataPath = process.argv[2];
  if (!dataPath) {
    console.error("Usage: node src/apply-metrics.mjs <data.json>");
    process.exit(1);
  }
  try {
    const result = await applyMetrics(path.resolve(dataPath));
    const parts = [
      `${result.metricsApplied} metric(s)`, `${result.profilesApplied} fight profile(s)`,
      `${result.survivabilityApplied} survivability tier(s)`, `${result.playstyleApplied} playstyle(s)`,
    ];
    if (result.metricsRetired) parts.push(`${result.metricsRetired} Mythicstats row(s) retired`);
    if (result.ptrDummyApplied) parts.push(`${result.ptrDummyApplied} Dummy Dome`);
    if (result.tierSetsApplied) parts.push(`${result.tierSetsApplied} tier set(s)`);
    console.log(`✓ applied ${parts.join(", ")} → data/specs.json`);
  } catch (error) {
    console.error("✗ " + error.message);
    process.exit(1);
  }
}
