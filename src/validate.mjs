/* Data validation: every rule the build depends on. Returns a list of
   human-readable errors; the build aborts if any are present. */

import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROLES = new Set(["DPS", "Healer", "Tank"]);
const BRACKETS = new Set(["raid", "mplus"]);
const VERDICTS = new Set(["Positive", "Mixed", "Negative"]);
const KINDS = new Set(["tier-list", "metrics", "notes-feed", "reference", "community"]);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
// Creator-take URLs come from an autonomous nightly pipeline over untrusted transcripts —
// beyond https-only they must point at a host the pipeline actually cites.
const TAKE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "hackmd.io", "wowhead.com", "www.wowhead.com"]);
const httpsUrl = v => { try { return new URL(v).protocol === "https:"; } catch { return false; } };
// Shape-valid ≠ real: "2026-99-99" matches the regex but is not a date. Round-trip
// through Date.UTC so month/day overflow is rejected instead of silently normalized.
const isRealDate = v => {
  const [y, m, d] = v.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
};

/* opts.fullRoster: enforce the real 40-spec Midnight roster — used by the CLI, the build,
   and the apply-* merge scripts (which operate on the repo's real data), but not by unit
   fixtures, which validate small synthetic datasets. */
export function validateData({ specs, sources, scales, community, ptrBuilds, creatorTakes, encounterTiers, historySnapshots }, opts = {}) {
  const errors = [];
  // Every date in the data is a claim about when something was fetched or published —
  // none may sit in the future. +1 day of skew allowed: a nightly UTC run can honestly
  // stamp "tomorrow" relative to a validator still on the previous local day.
  const today = opts.now ?? new Date().toISOString().slice(0, 10);
  const maxDate = new Date(new Date(today + "T00:00:00Z").getTime() + 86400000).toISOString().slice(0, 10);
  const isoOk = (v, what) => {
    if (v == null) return;
    if (!ISO_DATE.test(v)) { errors.push(`${what} must be YYYY-MM-DD, got "${v}"`); return; }
    if (!isRealDate(v)) { errors.push(`${what} is not a real calendar date, got "${v}"`); return; }
    if (v > maxDate) errors.push(`${what} is future-dated ("${v}", allowed through ${maxDate}) — data can't be newer than now`);
  };
  const urlOk = (v, what) => { if (v != null && !httpsUrl(v)) errors.push(`${what} must be a valid https:// URL, got "${v}"`); };

  if (opts.fullRoster) {
    if (specs.length !== 40) errors.push(`specs.json: Midnight roster must be exactly 40 specs (got ${specs.length})`);
    if (!specs.some(s => s.class === "Demon Hunter" && s.spec === "Devourer")) {
      errors.push("specs.json: Midnight roster must include Demon Hunter / Devourer");
    }
  }

  // --- scales ---
  const bands = scales?.consensus?.bands;
  if (!Array.isArray(bands) || bands.length === 0) {
    errors.push("scales.json: consensus.bands must be a non-empty array");
  } else {
    for (let i = 1; i < bands.length; i++) {
      if (bands[i].min >= bands[i - 1].min) {
        errors.push(`scales.json: consensus.bands must be sorted by descending min (band ${i})`);
      }
    }
    if (bands.at(-1).min !== 0) errors.push("scales.json: last consensus band must have min 0");
  }
  if (typeof scales?.consensus?.spreadThreshold !== "number") {
    errors.push("scales.json: consensus.spreadThreshold must be a number");
  }
  for (const [scaleId, scale] of Object.entries(scales?.scales ?? {})) {
    if (!Array.isArray(scale.tiers) || scale.tiers.length === 0) {
      errors.push(`scales.json: scale "${scaleId}" must define a non-empty tiers array`);
      continue;
    }
    for (const tier of scale.tiers) {
      if (typeof scale.values?.[tier] !== "number") {
        errors.push(`scales.json: scale "${scaleId}" tier "${tier}" has no numeric value`);
      }
    }
  }

  // --- sources ---
  const tierSources = new Map();
  const allSources = new Set();
  for (const source of sources) {
    if (!source.id || !source.name) errors.push(`sources.json: source missing id or name (${JSON.stringify(source.id)})`);
    if (allSources.has(source.id)) errors.push(`sources.json: duplicate source id "${source.id}"`);
    allSources.add(source.id);
    if (!KINDS.has(source.kind)) errors.push(`sources.json: source "${source.id}" has unknown kind "${source.kind}"`);
    urlOk(source.url, `sources.json: source "${source.id}" url`);
    for (const page of source.pages ?? []) {
      urlOk(page.url, `sources.json: source "${source.id}" page url`);
      isoOk(page.snapshot, `sources.json: source "${source.id}" page snapshot`);
    }
    if (source.kind === "tier-list") {
      if (!scales.scales?.[source.scale]) {
        errors.push(`sources.json: source "${source.id}" references unknown scale "${source.scale}"`);
      }
      tierSources.set(source.id, source);
    }
  }
  if (tierSources.size === 0) errors.push("sources.json: no tier-list sources defined");

  // --- specs ---
  const seen = new Set();
  for (const spec of specs) {
    const key = `${spec.class} / ${spec.spec}`;
    if (seen.has(key)) errors.push(`specs.json: duplicate spec ${key}`);
    seen.add(key);
    if (!ROLES.has(spec.role)) errors.push(`specs.json: ${key} has invalid role "${spec.role}"`);

    for (const [bracket, ratings] of Object.entries(spec.ratings ?? {})) {
      if (!BRACKETS.has(bracket)) {
        errors.push(`specs.json: ${key} has unknown bracket "${bracket}"`);
        continue;
      }
      for (const [sourceId, tier] of Object.entries(ratings)) {
        const source = tierSources.get(sourceId);
        if (!source) {
          errors.push(`specs.json: ${key} ${bracket} rating from unknown source "${sourceId}"`);
          continue;
        }
        if (tier !== null && scales.scales[source.scale]?.values?.[tier] === undefined) {
          errors.push(`specs.json: ${key} ${bracket}.${sourceId} tier "${tier}" not in scale "${source.scale}"`);
        }
      }
    }

    const metricKeys = new Set();
    for (const metric of spec.metrics ?? []) {
      if (!allSources.has(metric.source)) errors.push(`specs.json: ${key} metric from unknown source "${metric.source}"`);
      if (!BRACKETS.has(metric.bracket)) errors.push(`specs.json: ${key} metric has invalid bracket "${metric.bracket}"`);
      if (typeof metric.name !== "string" || !metric.name) errors.push(`specs.json: ${key} metric missing name`);
      // All current series are non-negative magnitudes; NaN/Infinity must never reach the page.
      if (!Number.isFinite(metric.value) || metric.value < 0) errors.push(`specs.json: ${key} metric "${metric.name}" value must be a finite non-negative number`);
      if (metric.era != null && !["live", "ptr"].includes(metric.era)) errors.push(`specs.json: ${key} metric "${metric.name}" era must be "live" or "ptr"`);
      // Era gating (hard rule 3) must agree with the display-name convention both ways:
      // a "12.1 PTR"-named series may not claim live, and an era:"ptr" series must say PTR in its name.
      if (metric.name?.includes("12.1 PTR") && metric.era === "live") errors.push(`specs.json: ${key} metric "${metric.name}" is named 12.1 PTR but tagged era "live"`);
      if (metric.era === "ptr" && !/PTR/.test(metric.name ?? "")) errors.push(`specs.json: ${key} metric "${metric.name}" is era "ptr" but its name carries no PTR label`);
      isoOk(metric.asOf, `specs.json: ${key} metric "${metric.name}" asOf`);
      const mkey = `${metric.source}|${metric.bracket}|${metric.name}`;
      if (metricKeys.has(mkey)) errors.push(`specs.json: ${key} duplicate metric (${mkey}) — the upsert key must be unique per spec`);
      metricKeys.add(mkey);
    }

    if (spec.fightProfile != null) {
      const fp = spec.fightProfile;
      if (!allSources.has(fp.source)) errors.push(`specs.json: ${key} fightProfile from unknown source "${fp.source}"`);
      isoOk(fp.asOf, `specs.json: ${key} fightProfile.asOf`);
      const targets = Object.entries(fp.targets ?? {});
      if (targets.length === 0) errors.push(`specs.json: ${key} fightProfile.targets must be a non-empty object`);
      for (const [count, dps] of targets) {
        if (!/^\d+$/.test(count) || !Number.isFinite(dps) || dps < 0) {
          errors.push(`specs.json: ${key} fightProfile target "${count}" must map a numeric target count to finite non-negative DPS`);
        }
      }
    }

    if (spec.playstyle != null) {
      const ps = spec.playstyle;
      if (!["Melee", "Ranged"].includes(ps.range)) errors.push(`specs.json: ${key} playstyle.range must be "Melee" or "Ranged"`);
      for (const attr of ["mobility", "utility"]) {
        if (!Number.isInteger(ps[attr]) || ps[attr] < 1 || ps[attr] > 5) errors.push(`specs.json: ${key} playstyle.${attr} must be an integer 1–5`);
      }
      if (ps.complexity != null && (!Number.isInteger(ps.complexity) || ps.complexity < 1 || ps.complexity > 5)) {
        errors.push(`specs.json: ${key} playstyle.complexity must be an integer 1–5`);
      }
      if (ps.meleeCapable != null && typeof ps.meleeCapable !== "boolean") {
        errors.push(`specs.json: ${key} playstyle.meleeCapable must be a boolean`);
      }
    }

    if (spec.ptrDummy != null) {
      isoOk(spec.ptrDummy.asOf, `specs.json: ${key} ptrDummy.asOf`);
      const targets = Object.entries(spec.ptrDummy.targets ?? {});
      if (targets.length === 0) errors.push(`specs.json: ${key} ptrDummy.targets must be a non-empty object`);
      for (const [count, dps] of targets) {
        if (!/^\d+$/.test(count) || !Number.isFinite(dps) || dps < 0) errors.push(`specs.json: ${key} ptrDummy target "${count}" must map a numeric target count to finite non-negative DPS`);
      }
    }

    if (spec.tierSet != null) {
      for (const pc of ["set2", "set4"]) {
        if (spec.tierSet[pc] != null && typeof spec.tierSet[pc] !== "string") errors.push(`specs.json: ${key} tierSet.${pc} must be a string`);
      }
      urlOk(spec.tierSet.source, `specs.json: ${key} tierSet.source`);
      isoOk(spec.tierSet.asOf, `specs.json: ${key} tierSet.asOf`);
    }

    if (spec.survivability != null) {
      if (typeof spec.survivability.tier !== "string" || !spec.survivability.tier) errors.push(`specs.json: ${key} survivability needs a tier string`);
      if (spec.survivability.source && !allSources.has(spec.survivability.source)) errors.push(`specs.json: ${key} survivability from unknown source "${spec.survivability.source}"`);
    }

    if (spec.ptr != null) { // omitted ptr == null ptr: every consumer treats both as "not tracked"
      if (!VERDICTS.has(spec.ptr?.verdict)) errors.push(`specs.json: ${key} ptr.verdict "${spec.ptr?.verdict}" invalid`);
      if (typeof spec.ptr?.summary !== "string" || !spec.ptr.summary) errors.push(`specs.json: ${key} ptr.summary missing`);
      if (!Array.isArray(spec.ptr?.changes) || spec.ptr.changes.length === 0) errors.push(`specs.json: ${key} ptr.changes must be a non-empty array`);
      urlOk(spec.ptr.source, `specs.json: ${key} ptr.source`);
      // Provenance rule: every writeup is an attributed distillation — since verdicts
      // auto-confirm (no review gate), the attribution IS the honesty and is mandatory.
      if (!spec.ptr.source && !spec.ptr.sourceLabel) errors.push(`specs.json: ${key} writeup needs a source URL or sourceLabel`);
    }
  }

  // --- community registry ---
  const specsByClass = new Map();
  for (const s of specs) {
    if (!specsByClass.has(s.class)) specsByClass.set(s.class, new Set());
    specsByClass.get(s.class).add(s.spec);
  }
  const seenClasses = new Set();
  for (const entry of community?.classes ?? []) {
    if (!entry.class) errors.push("community.json: class entry missing class name");
    if (seenClasses.has(entry.class)) errors.push(`community.json: duplicate class entry "${entry.class}"`);
    seenClasses.add(entry.class);
    if (!entry.discord?.name || !entry.discord?.url) errors.push(`community.json: ${entry.class} discord needs name + url`);
    urlOk(entry.discord?.url, `community.json: ${entry.class} discord url`);
    for (const alt of entry.altDiscords ?? []) {
      if (!alt.name || !alt.url) errors.push(`community.json: ${entry.class} altDiscord needs name + url`);
      urlOk(alt.url, `community.json: ${entry.class} altDiscord "${alt.name}" url`);
    }
    for (const site of entry.sites ?? []) urlOk(site.url, `community.json: ${entry.class} site "${site.name}" url`);
    const seenCreators = new Set();
    for (const creator of entry.creators ?? []) {
      if (!creator.name || !creator.url) errors.push(`community.json: ${entry.class} creator needs name + url`);
      // Duplicate creators in one class would double-attribute takes (creatorScope below
      // keys on class|name) and double-render in the drawer.
      if (seenCreators.has(creator.name)) errors.push(`community.json: ${entry.class} has duplicate creator "${creator.name}"`);
      seenCreators.add(creator.name);
      urlOk(creator.url, `community.json: ${entry.class} creator "${creator.name}" url`);
      isoOk(creator.verifiedDate, `community.json: ${entry.class} creator "${creator.name}" verifiedDate`);
      // Optional spec scoping: a creator credible on only some of a class's specs.
      // Absent = whole class. Each listed spec must be a real spec of that class.
      if (creator.specs != null) {
        if (!Array.isArray(creator.specs) || creator.specs.length === 0) {
          errors.push(`community.json: ${entry.class} creator "${creator.name}" specs must be a non-empty array when present`);
        } else {
          for (const sp of creator.specs) {
            if (!specsByClass.get(entry.class)?.has(sp)) {
              errors.push(`community.json: ${entry.class} creator "${creator.name}" scoped to "${sp}" which is not a ${entry.class} spec`);
            }
          }
        }
      }
    }
    for (const site of entry.sites ?? []) {
      if (!site.name || !site.url) errors.push(`community.json: ${entry.class} site needs name + url`);
    }
  }
  // General-coverage creators (cross-class PTR news lane — e.g. izen). Deliberately a
  // SEPARATE list from classes[].creators: they are never per-spec take authorities
  // (the take-scope check below only reads classes[].creators, so a general creator
  // can't lend authority to a spec take by construction).
  const seenGeneral = new Set();
  for (const gc of community?.generalCreators ?? []) {
    if (!gc.name || !gc.url) errors.push(`community.json: generalCreators entry needs name + url`);
    if (seenGeneral.has(gc.name)) errors.push(`community.json: duplicate general creator "${gc.name}"`);
    seenGeneral.add(gc.name);
    urlOk(gc.url, `community.json: general creator "${gc.name}" url`);
    isoOk(gc.verifiedDate, `community.json: general creator "${gc.name}" verifiedDate`);
  }

  // --- creator takes (qualitative layer) ---
  const specKeys = new Set(specs.map(s => `${s.class}|${s.spec}`));
  // Authority model: a take may only be attributed to a creator registered for that class
  // in community.json, and within their specs scope when one is declared.
  const creatorScope = new Map(); // "class|creator" -> specs[]|null (null = whole class)
  for (const entry of community?.classes ?? [])
    for (const creator of entry.creators ?? [])
      creatorScope.set(`${entry.class}|${creator.name}`, creator.specs ?? null);
  for (const take of creatorTakes?.takes ?? []) {
    if (!specKeys.has(`${take.class}|${take.spec}`)) errors.push(`creator-takes.json: take references unknown spec ${take.class} / ${take.spec}`);
    if (!take.creator || !take.claim || !take.url) errors.push(`creator-takes.json: take for ${take.spec} needs creator + claim + url`);
    if (take.creator && take.class) {
      const scopeKey = `${take.class}|${take.creator}`;
      if (!creatorScope.has(scopeKey)) errors.push(`creator-takes.json: "${take.creator}" has a ${take.class} take but no ${take.class} entry in community.json`);
      else { const scope = creatorScope.get(scopeKey); if (scope && !scope.includes(take.spec)) errors.push(`creator-takes.json: "${take.creator}" take for ${take.class}/${take.spec} is outside their declared specs scope [${scope.join(", ")}]`); }
    }
    isoOk(take.date, `creator-takes.json: take for ${take.spec} date`);
    if (take.url != null) {
      // Take URLs flow from untrusted transcripts through the nightly LLM into clickable
      // hrefs — https only AND a known citation host, so a smuggled URL fails CI.
      if (!httpsUrl(take.url)) errors.push(`creator-takes.json: take for ${take.spec} url must be https:// (got "${take.url}")`);
      else if (!TAKE_HOSTS.has(new URL(take.url).host)) errors.push(`creator-takes.json: take for ${take.spec} url host "${new URL(take.url).host}" not in the citation allowlist`);
    }
  }

  // --- meta-outlook notes (general-creator qualitative layer) ---
  // INVERSE of the take authority model above: metaNotes may ONLY be authored by a
  // generalCreators entry (the cross-class PTR-news lane — e.g. izen). This keeps the
  // news-lane generalists firewalled out of the specialist take/consensus layers while
  // still surfacing their per-spec season/meta OUTLOOK opinion in a separate, clearly
  // labeled lane. A specialist take belongs in takes[] (class-scoped creator); a broad
  // "this spec looks good/bad for the season" read belongs here.
  const generalCreatorNames = new Set((community?.generalCreators ?? []).map(g => g.name));
  const META_SENTIMENTS = new Set(["positive", "negative", "neutral", "mixed"]);
  for (const note of creatorTakes?.metaNotes ?? []) {
    if (!specKeys.has(`${note.class}|${note.spec}`)) errors.push(`creator-takes.json: metaNote references unknown spec ${note.class} / ${note.spec}`);
    if (!note.creator || !note.note || !note.url) errors.push(`creator-takes.json: metaNote for ${note.spec} needs creator + note + url`);
    if (note.creator && !generalCreatorNames.has(note.creator)) errors.push(`creator-takes.json: metaNote creator "${note.creator}" must be a generalCreators entry — specialist per-spec takes belong in takes[], not metaNotes[]`);
    if (!META_SENTIMENTS.has(note.sentiment)) errors.push(`creator-takes.json: metaNote for ${note.spec} sentiment "${note.sentiment}" invalid (positive|negative|neutral|mixed)`);
    isoOk(note.date, `creator-takes.json: metaNote for ${note.spec} date`);
    if (note.url != null) {
      if (!httpsUrl(note.url)) errors.push(`creator-takes.json: metaNote for ${note.spec} url must be https:// (got "${note.url}")`);
      else if (!TAKE_HOSTS.has(new URL(note.url).host)) errors.push(`creator-takes.json: metaNote for ${note.spec} url host "${new URL(note.url).host}" not in the citation allowlist`);
    }
  }

  // --- PTR build feed ---
  const rosterNames = new Set(specs.map(s => `${s.spec} ${s.class}`));
  const classNames = new Set(specs.map(s => s.class));
  for (const build of ptrBuilds?.builds ?? []) {
    if (build.date == null) errors.push("ptr-builds.json: build missing date");
    else isoOk(build.date, `ptr-builds.json: build date`);
    if (!build.forumUrl) errors.push(`ptr-builds.json: build ${build.date} missing forumUrl`);
    for (const u of ["forumUrl", "wowheadUrl", "icyveinsUrl"]) urlOk(build[u], `ptr-builds.json: build ${build.date} ${u}`);
    // Each entry must resolve against the roster ("Spec Class") or a class-wide prefix
    // ("Class (…)"), otherwise outlookFor silently never counts it.
    for (const e of build.specsAffected ?? []) {
      const classWide = [...classNames].some(c => e.startsWith(`${c} (`));
      if (!rosterNames.has(e) && !classWide) errors.push(`ptr-builds.json: build ${build.date} specsAffected "${e}" matches no roster spec or "Class (" prefix`);
    }
  }

  // --- history snapshots (movement baselines + the freshness heartbeat's proof of life) ---
  // The nightly agent's whole data/ tree travels to the publish job, so a snapshot it
  // wrote is committed like any data file. A future-dated snapshot would permanently
  // silence the staleness heartbeat (checkFreshness trusts historySnapshots[0].date)
  // and corrupt every movement baseline — reject it like any other future-dated claim.
  for (const snap of historySnapshots ?? []) {
    isoOk(snap?.date, "data/history: snapshot date");
    if (snap?.date == null) errors.push("data/history: snapshot missing its date field");
    if (snap?.specs == null || typeof snap.specs !== "object") errors.push(`data/history: snapshot ${snap?.date ?? "?"} has no specs state`);
  }

  // --- encounter tiers (per-boss / per-dungeon Archon tiers; a whole displayed file) ---
  if (encounterTiers != null) {
    isoOk(encounterTiers.asOf, "encounter-tiers.json: asOf");
    const archon = scales.scales?.archon;
    for (const bracket of ["raid", "mplus"]) {
      for (const [slug, enc] of Object.entries(encounterTiers[bracket] ?? {})) {
        if (typeof enc.name !== "string" || !enc.name) errors.push(`encounter-tiers.json: ${bracket}/${slug} needs a name`);
        for (const [k, tier] of Object.entries(enc.tiers ?? {})) {
          const [cls, sp] = k.split("|");
          if (!specKeys.has(`${cls}|${sp}`)) errors.push(`encounter-tiers.json: ${bracket}/${slug} references unknown spec "${k}"`);
          if (archon && archon.values?.[tier] === undefined) errors.push(`encounter-tiers.json: ${bracket}/${slug} "${k}" tier "${tier}" not in the archon scale`);
        }
      }
    }
  }

  return errors;
}

export async function loadData(root) {
  const read = async name => JSON.parse(await readFile(path.join(root, "data", name), "utf8"));
  const [specs, sources, scales, community, ptrBuilds, creatorTakes, encounterTiers] = await Promise.all([
    read("specs.json"), read("sources.json"), read("scales.json"),
    read("community.json"), read("ptr-builds.json"), read("creator-takes.json"),
    read("encounter-tiers.json")
  ]);
  // Movement baselines from data/history/, newest first (capped — baselines past the first
  // that differs are never consulted). A missing directory means "no history yet"; any
  // OTHER failure (unreadable/corrupt JSON) throws — a corrupt history file must error,
  // not silently zero the movement feature.
  let historySnapshots = [];
  try {
    const dir = path.join(root, "data", "history");
    const files = (await readdir(dir)).filter(f => f.endsWith(".json")).sort().reverse().slice(0, 30);
    historySnapshots = await Promise.all(files.map(async f => JSON.parse(await readFile(path.join(dir, f), "utf8"))));
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  return { specs, sources, scales, community, ptrBuilds, creatorTakes, encounterTiers,
           historySnapshot: historySnapshots[0] ?? null, historySnapshots };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const data = await loadData(root);
  const errors = validateData(data, { fullRoster: true });
  if (errors.length) {
    console.error(`✗ ${errors.length} validation error(s):`);
    for (const error of errors) console.error("  - " + error);
    process.exit(1);
  }
  console.log(`✓ data valid — ${data.specs.length} specs, ${data.specs.filter(s => s.ptr).length} PTR-tracked`);
}
