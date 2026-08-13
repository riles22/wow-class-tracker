// Harvest Archon's log-derived gear USAGE for all 40 specs (Phase B, decisions G13 + G14).
//
//   node src/harvest-archon-gear.mjs              # probe the season gate, then harvest
//   node src/harvest-archon-gear.mjs --probe      # probe only; rewrite the pending record
//   node src/harvest-archon-gear.mjs --spec "Frost Mage"
//
// WHAT THIS IS, AND WHAT IT IS NOT (⚑ G13).
// Archon publishes what the top logged players actually WEAR — a usage share derived from
// Warcraft Logs parses. That is a different quantity from what a guide RECOMMENDS. It is not
// an endorsement, it does not vote, and it must never reorder anything, not even as a
// tiebreak: popularity is contaminated by drop rates, catch-up gear and week-one
// availability, and the tracker already retyped WoWMeta out of its letter consensus
// (2026-07-31) for exactly the sin of ranking representation as though it were performance.
// Its value is precisely that it can visibly DISAGREE with the guides.
//
// So this writes its OWN file with its OWN shape — data/archon-usage.json — and that shape is
// deliberately unable to impersonate a guide pick: no `endorsement` field, no `picks` array,
// no slot-winner. `archonUsageIssues()` below enforces that structurally, and a test pins it.
// Nothing here imports or extends the consensus math in lib-guides.mjs beyond slot naming.
//
// THREE THINGS ON THE PAGE ARE DELIBERATELY NOT HARVESTED.
//  1. The DPS / HPS columns. Archon hides them behind an "Advanced Settings" toggle and says
//     so itself: they are the observed throughput of players who happened to make that choice,
//     "not the same as the throughput increase you could expect from changing that build
//     aspect in isolation". Capturing a number nobody scoped invites a future surface to sort
//     by it. Usage is the only quantity G13 admits.
//  2. The "BiS" badge Archon renders on some rows. That badge is WOWHEAD's pick, republished.
//     Reading it here would double-count Wowhead — once from its own harvester and again
//     through Archon — and would do so second-hand. It is stripped, never recorded.
//  3. The Gear Overview section's single best set. It is one composed set, not a per-item
//     usage distribution; the Gear Tables carry the same items with more of them.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getText } from "./lib-wowhead.mjs";
import { normalizeSlot, normalizeText, resolveDropSource, rosterFrom } from "./lib-guides.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const DATA_PATH = join(ROOT, "data", "archon-usage.json");

export const ARCHON_ORIGIN = "https://www.archon.gg";

/* The two LIVE lanes. `beta-mythic-plus` (and any future `beta-*`) is Archon's PTR analytics
   lane and is refused by name — see seasonVerdict's `lane` check for why that matters. */
export const LIVE_ZONE_TYPES = { raid: "raid", mplus: "mythic-plus" };

/* A meaningful Mythic sample is days-to-weeks after a season opens (G14). Below this the page
   is technically "Season 2" and statistically nothing: Archon's PTR lane served the whole
   Season-2 dungeon roster off SIXTEEN parses. */
export const MIN_PARSES = 500;

/* ---------- Archon's pseudo-JSX ----------
   Every cell is a string of Archon's own component markup, not HTML. Item names sit as the
   text content of <ItemIcon id={NNN} ...>Name</ItemIcon>. */
const ENTITIES = { "&nbsp;": " ", "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" };
const decodeEntities = (value) => String(value ?? "")
  .replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/g, (m) => ENTITIES[m]);

export const stripMarkup = (value) =>
  normalizeText(decodeEntities(String(value ?? "").replace(/<[^>]*>/g, " ")));

/* The BiS badge lives inside an <a> that links Wowhead's guide. Removing the anchor removes
   the badge and its tooltip in one move, and leaves the item's own <span> name intact. */
const withoutBisBadge = (cell) => String(cell ?? "").replace(/<a\b[\s\S]*?<\/a>/gi, " ");

/* Ordered distinct item ids in a cell, each with the first non-blank name seen for it.
   Embellishment rows are COMBINATIONS — the same cell carries two ids, once as bare icons
   and again as named links — so this returns a list, and the caller decides whether more
   than one id is expected. */
export function itemCellEntries(cell) {
  const clean = withoutBisBadge(cell);
  const out = [];
  const seen = new Map();
  for (const match of clean.matchAll(/<ItemIcon\b[^>]*\bid=\{(\d+)\}[^>]*>([\s\S]*?)<\/ItemIcon>/gi)) {
    const id = match[1];
    const name = stripMarkup(match[2]) || null;
    if (!seen.has(id)) {
      const entry = { itemId: id, name };
      seen.set(id, entry);
      out.push(entry);
    } else if (name && !seen.get(id).name) {
      seen.get(id).name = name;
    }
  }
  return out;
}

/* "<Styled type='legendary'>29.6%</Styled>" -> 29.6. Returns null rather than 0 when the cell
   is not a percentage: a missing usage share and a 0% share are different facts, and the
   caller refuses the row rather than recording a zero nobody measured. */
export function parseUsagePct(cell) {
  const match = /(-?\d+(?:\.\d+)?)\s*%/.exec(stripMarkup(cell));
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

export function nextDataFrom(html) {
  const match = /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/.exec(String(html ?? ""));
  if (!match) throw new Error("archon: __NEXT_DATA__ script tag not found — the page is "
    + "server-rendered JSON; a markdown-converting fetcher silently drops it");
  return JSON.parse(match[1]);
}

export const pageFrom = (html) => {
  const page = nextDataFrom(html)?.props?.pageProps?.page;
  if (!page) throw new Error("archon: __NEXT_DATA__ carries no props.pageProps.page");
  return page;
};

/* The 40 spec URLs come from the page's OWN spec picker rather than a slug table we maintain.
   Measured 2026-08-13: 40 of 40 labels match gearing/data/specs.json exactly, Devourer
   included, so a roster change upstream surfaces as a join failure instead of a 404. */
export function specCatalogFrom(page) {
  const out = [];
  for (const group of page?.specOptions ?? []) {
    const className = stripMarkup(group.className);
    for (const option of group.options ?? []) {
      out.push({ class: className, spec: stripMarkup(option.label), path: option.url ?? null });
    }
  }
  return out;
}

/* Swap the zone-type segment of a spec's raid URL for another lane. Archon's own picker
   publishes both, so this only has to survive the shape /wow/builds/<spec>/<class>/<lane>/... */
export function laneUrl(path, zoneType) {
  const parts = String(path ?? "").split("/").filter(Boolean);
  const at = parts.indexOf("builds");
  if (at === -1 || parts.length < at + 4) throw new Error(`archon: unrecognised build path "${path}"`);
  const spec = parts[at + 1], klass = parts[at + 2];
  const tail = zoneType === LIVE_ZONE_TYPES.raid
    ? "gear-and-tier-set/mythic/all-bosses"
    : "gear-and-tier-set/10/all-dungeons/this-week";
  return `${ARCHON_ORIGIN}/wow/builds/${spec}/${klass}/${zoneType}/${tail}`;
}

/* ---------- parse ----------
   Pure: it reports what the page SAYS and never decides whether the page may be ingested.
   The season judgment is seasonVerdict's job, so a refused page still produces a full,
   inspectable parse for the pending record's evidence. */
const TABLE_SECTIONS = {
  BuildsGearTablesSection: "slots",
  BuildsCraftedGearSection: "crafted",
  BuildsCraftedGearStatsSection: "missives",
  BuildsEmbellishmentsSection: "embellishments",
};

function tableRows(table, { where }) {
  const rows = [];
  for (const row of table?.data ?? []) {
    const entries = itemCellEntries(row.item);
    const usagePct = parseUsagePct(row.popularity ?? row.popularityAndReportLink);
    if (!entries.length) throw new Error(`archon: table row carries no item id (${where})`);
    if (usagePct == null) throw new Error(`archon: table row carries no usage share (${where})`);
    rows.push({ entries, usagePct });
  }
  return rows;
}

export function parseGearPage(html, { where = "" } = {}) {
  const page = pageFrom(html);
  const sections = page.sections ?? [];
  const parsed = {
    title: stripMarkup(page.title),
    description: stripMarkup(page.description),
    zoneType: page.selectedZoneType ?? null,
    difficulty: page.selectedDifficulty ?? null,
    encounter: page.selectedEncounter ?? null,
    // The honesty furniture (G13): when Archon last recomputed, off how many parses, and the
    // population those parses were cut from. All three ship on every surface that shows usage.
    lastUpdated: page.lastUpdated ?? null,
    totalParses: Number.isFinite(page.totalParses) ? page.totalParses : null,
    sampleDescription: stripMarkup(page.metadataSummaryDescription) || null,
    // Archon flags its beta/PTR analytics here, in its own words. Never discarded.
    warning: page.warning ? stripMarkup(page.warning) : null,
    encounters: (page.encounterOptions ?? []).map((option) => stripMarkup(option.label))
      .filter((label) => label && !/^all\s/i.test(label)),
    specCatalog: specCatalogFrom(page),
    slots: [], crafted: [], missives: [], embellishments: [],
  };

  for (const section of sections) {
    const lane = TABLE_SECTIONS[section.component];
    if (!lane) continue;
    const tables = section.props?.tables ?? (section.props?.table ? [section.props.table] : []);
    for (const table of tables) {
      const header = stripMarkup(table.columns?.item?.header);
      const rows = tableRows(table, { where: `${where || parsed.title} · ${lane} · ${header}` });
      if (lane === "slots") {
        // Archon collapses the two equipped rings into one "Rings" table and the two trinkets
        // into "Trinket". normalizeSlot folds both onto the canonical Finger / Trinket, and
        // `sourceLabel` keeps Archon's own wording so the collapse stays visible.
        const slot = normalizeSlot(header, { where: `archon ${where}` });
        if (!slot) continue;
        parsed.slots.push({
          slot, sourceLabel: header,
          items: rows.map(({ entries, usagePct }) => ({
            itemId: entries[0].itemId, name: entries[0].name, usagePct,
          })),
        });
      } else if (lane === "embellishments") {
        // A row is a COMBINATION of embellishments, not one item. Recorded as such.
        parsed.embellishments.push(...rows.map(({ entries, usagePct }) => ({
          itemIds: entries.map((entry) => entry.itemId),
          names: entries.map((entry) => entry.name), usagePct,
        })));
      } else {
        parsed[lane].push(...rows.map(({ entries, usagePct }) => ({
          itemId: entries[0].itemId, name: entries[0].name, usagePct,
        })));
      }
    }
  }
  return parsed;
}

/* ---------- the season gate (⚑ G14) ----------
   Archon's gear pages describe Season 1 today, so this lane ships pending and backfills
   itself on the first run where the page verifies as the live season. Showing Season-1 usage
   beside Season-2 guide picks is the cross-season mixing every other rule in this project
   forbids, so the gate refuses rather than degrades.

   It is a CONJUNCTION of five independent checks, and the reason it is not just "does the
   page say 12.1?" is measured: on 2026-08-13 Archon's `beta-mythic-plus` lane already served
   the complete Season-2 dungeon roster — off 16 parses, under Archon's own warning that
   "treating testing data like live data is both incorrect and inaccurate". A roster-only
   check passes that page. A prose-only check passes a live page whose content list has not
   turned over. Both together, plus the lane and sample floor, do not. */

/* The season a page claims about ITSELF, from its own prose. `seasonLabels` is the tracker's
   PHASES.seasonLabels vocabulary ({ s1: "12.0.7", s2: "12.1" }) — passed in, never guessed,
   so the 08-18 flip is a config edit in one place.

   Patch tokens are compared as DOTTED PREFIXES, not as substrings or word-boundary regexes.
   Both naive forms are wrong in a way that bites at the flip: a sentence-ending period
   ("... in Midnight 12.0.7.") defeats a `[^\d.]` trailing guard, and a plain substring test
   reads "12.1" out of "12.10". A build published as "12.1.0" must still resolve to the 12.1
   season, so `12.1.0` matches the label `12.1` while `12.10` does not. */
export function pageSeasonOf(text, seasonLabels) {
  const value = normalizeText(text);
  if (/\bPTR\b|\bbeta\b/i.test(value)) return { season: null, ptr: true, evidence: value };
  const numbered = /\bSeason\s+(\d+)\b/i.exec(value);
  if (numbered) return { season: `s${numbered[1]}`, ptr: false, evidence: numbered[0] };

  const tokens = [...value.matchAll(/\d+(?:\.\d+)+/g)].map((match) => match[0]);
  let best = null;
  for (const token of tokens) {
    for (const [season, label] of Object.entries(seasonLabels ?? {})) {
      const candidate = String(label);
      if (token !== candidate && !token.startsWith(`${candidate}.`)) continue;
      if (!best || candidate.length > best.label.length) best = { season, label: candidate, token };
    }
  }
  return best
    ? { season: best.season, ptr: false, evidence: best.token }
    : { season: null, ptr: false, evidence: null };
}

/* Does a nav label name something in OUR harvested roster? Three widening steps, deliberately
   in this order:
     1. resolveDropSource — the shared join (apostrophes, leading "The", short forms).
     2. word containment — Archon's picker abbreviates ("Sethraliss" for "Temple of
        Sethraliss"), which step 1 cannot see because neither string prefixes the other.
   Step 2 is scoped to nav labels here rather than loosened inside lib-guides: that function
   attributes an item to a boss, where a fuzzy match would mis-assign loot. This one only
   answers "is this page describing our season", where a miss is the expensive error. */
const STOP_WORDS = new Set(["the", "of", "and", "a"]);
const words = (value) => normalizeText(value).toLowerCase().replace(/[^a-z0-9 ]/g, "")
  .split(" ").filter((word) => word && !STOP_WORDS.has(word));

export function rosterAgreement(encounters, roster) {
  const matched = [], unmatched = [];
  for (const label of encounters ?? []) {
    let hit = resolveDropSource(label, roster, { soft: true })?.canonical ?? null;
    if (!hit) {
      const need = words(label);
      if (need.length && normalizeText(label).length >= 4) {
        outer: for (const entry of roster ?? []) {
          for (const name of entry.names ?? []) {
            const have = new Set(words(name));
            if (need.every((word) => have.has(word))) { hit = entry.canonical; break outer; }
          }
        }
      }
    }
    (hit ? matched : unmatched).push(hit ? `${label} -> ${hit}` : label);
  }
  return { matched, unmatched, total: (encounters ?? []).length };
}

export function seasonVerdict(parsed, { liveSeason, seasonLabels, roster, minParses = MIN_PARSES } = {}) {
  const checks = [];
  const add = (name, ok, detail) => checks.push({ name, ok: !!ok, detail });

  const live = Object.values(LIVE_ZONE_TYPES);
  add("lane", live.includes(parsed.zoneType),
    `selectedZoneType=${parsed.zoneType ?? "null"} (live lanes: ${live.join(", ")})`);

  add("noBetaWarning", !parsed.warning,
    parsed.warning ? `page carries a warning: ${parsed.warning.slice(0, 140)}` : "page carries no warning");

  const claimed = pageSeasonOf(`${parsed.description} ${parsed.title}`, seasonLabels);
  add("season", !claimed.ptr && claimed.season === liveSeason,
    `page reads ${claimed.ptr ? "PTR/beta" : claimed.season ?? "no season"}`
    + `${claimed.evidence ? ` ("${claimed.evidence}")` : ""}, live season is ${liveSeason}`);

  const agreement = rosterAgreement(parsed.encounters, roster);
  add("roster", agreement.total > 0 && agreement.unmatched.length === 0,
    agreement.total === 0 ? "page names no encounters"
      : `${agreement.matched.length}/${agreement.total} encounters join our harvested roster`
        + `${agreement.unmatched.length ? `; unmatched: ${agreement.unmatched.join(", ")}` : ""}`);

  add("sample", (parsed.totalParses ?? 0) >= minParses,
    `totalParses=${parsed.totalParses ?? "null"} (floor ${minParses})`);

  const failed = checks.filter((check) => !check.ok);
  return {
    ok: failed.length === 0,
    season: claimed.ptr ? "ptr" : claimed.season,
    checks,
    failed: failed.map((check) => check.name),
    reason: failed.length
      ? failed.map((check) => `${check.name}: ${check.detail}`).join(" · ")
      : null,
  };
}

/* ---------- the file ----------
   `status` is the whole contract with the client (G14): "pending" means the column renders as
   awaiting data with the recorded reason visible; "harvested" means it renders usage. There
   is no third state and no partial — a half-season file is the mixing this gate exists to
   stop. */
export const LANE_NOTE = "Log-derived usage popularity — the share of logged players wearing "
  + "the item. This is NOT a guide recommendation and never orders, ranks or breaks ties "
  + "between candidates (docs/gearing-s2-scope.md, DECISION G13).";

export const PENDING_GATE = "Fills itself on the first run where Archon's gear pages pass all "
  + "five season checks (live lane · no beta warning · the live season in the page's own prose "
  + "· its encounter list joins our harvested roster · a sample above the floor). Archon's gear "
  + "data is log-derived, so a meaningful Mythic sample is days-to-weeks after a season opens; "
  + "until then this column shows the reason below rather than last season's usage.";

export function pendingFile({ reason, checkedAt, evidence = [], previous = null }) {
  return {
    source: "Archon (archon.gg) — Warcraft Logs-derived gear usage",
    lane: "usage",
    quantity: "share of logged players wearing the item",
    note: LANE_NOTE,
    status: "pending",
    season: null,
    harvestedAt: null,
    pending: {
      since: previous?.pending?.since ?? checkedAt,
      checkedAt, reason, gate: PENDING_GATE, evidence,
    },
    specs: [],
  };
}

export function harvestedFile({ season, harvestedAt, specs, sampleFloor = MIN_PARSES }) {
  return {
    source: "Archon (archon.gg) — Warcraft Logs-derived gear usage",
    lane: "usage",
    quantity: "share of logged players wearing the item",
    note: LANE_NOTE,
    status: "harvested",
    season,
    harvestedAt,
    sampleFloor,
    pending: null,
    specs,
  };
}

/* Structural guard for the G13 separation. The point is not schema tidiness: it is that no
   future edit can quietly grow this file a vote. A key named `picks` or `endorsement`
   ANYWHERE in the document is a finding, however well-meant. */
const FORBIDDEN_KEYS = ["picks", "picksBy", "alternatives", "alternativesBy", "endorsement",
  "consensus", "rank", "bis", "recommended"];

export function archonUsageIssues(doc) {
  const issues = [];
  if (!doc || typeof doc !== "object") return ["not an object"];
  if (!["pending", "harvested"].includes(doc.status)) issues.push(`bad status "${doc.status}"`);
  if (doc.lane !== "usage") issues.push("lane must be \"usage\"");
  if (!doc.note?.includes("NOT a guide recommendation")) issues.push("lane note must disclaim endorsement");

  const walk = (node, path) => {
    if (Array.isArray(node)) return node.forEach((child, i) => walk(child, `${path}[${i}]`));
    if (!node || typeof node !== "object") return;
    for (const [key, value] of Object.entries(node)) {
      if (FORBIDDEN_KEYS.includes(key))
        issues.push(`${path}.${key}: a usage file may not carry a guide-pick field (G13)`);
      walk(value, `${path}.${key}`);
    }
  };
  walk(doc.specs, "specs");

  if (doc.status === "pending") {
    if (doc.specs?.length) issues.push("a pending file must carry no spec data");
    if (doc.season !== null || doc.harvestedAt !== null) issues.push("a pending file must be undated and seasonless");
    if (!doc.pending?.reason) issues.push("a pending file must record why");
    if (!doc.pending?.gate) issues.push("a pending file must record what would end the pending state");
    if (!doc.pending?.checkedAt) issues.push("a pending file must record when it was last checked");
    if (!doc.pending?.evidence?.length) issues.push("a pending file must record the evidence it refused");
  } else {
    if (!doc.season) issues.push("a harvested file must name its season");
    if (!doc.harvestedAt) issues.push("a harvested file must carry a harvest date");
    if (doc.pending !== null) issues.push("a harvested file must clear the pending record");
    if (!doc.specs?.length) issues.push("a harvested file must carry spec data");
    for (const spec of doc.specs ?? []) {
      for (const [bracket, cut] of Object.entries(spec.brackets ?? {})) {
        const at = `${spec.spec} ${spec.class} ${bracket}`;
        if (!cut) continue;
        if (!cut.lastUpdated || !cut.totalParses || !cut.sampleDescription)
          issues.push(`${at}: usage without Archon's own date, parse count and sample description`);
        for (const slot of cut.slots ?? [])
          for (const item of slot.items ?? [])
            if (!(item.usagePct > 0)) issues.push(`${at}: ${item.itemId} has no usage share`);
      }
    }
  }
  return issues;
}

/* ---------- CLI ---------- */
const today = () => new Date().toISOString().slice(0, 10);

async function readJson(path) {
  try { return JSON.parse(await readFile(path, "utf8")); }
  catch (error) {
    if (error?.code === "ENOENT") return null;
    throw new Error(`cannot trust existing ${path}: ${error.message}`, { cause: error });
  }
}

async function main(argv) {
  const probeOnly = argv.includes("--probe");
  const specFilter = argv.includes("--spec") ? argv[argv.indexOf("--spec") + 1] : null;

  /* The season vocabulary is the TRACKER's, imported lazily so this module (and its tests)
     stay free of the coupling. CLAUDE.md names PHASES "the single era vocabulary"; keeping a
     private copy here would mean the 08-18 flip has to be remembered twice, and a harvester
     that remembers the wrong season either refuses forever or ingests a season early. */
  const { PHASES } = await import("../../src/normalize.mjs");
  const [raid, dungeons, previous] = await Promise.all([
    readJson(join(ROOT, "data", "raid-items.json")),
    readJson(join(ROOT, "data", "dungeon-items.json")),
    readJson(DATA_PATH),
  ]);
  if (!raid || !dungeons) throw new Error("harvest the raid and dungeon item data first — "
    + "the season gate joins Archon's encounter list against our own roster");
  const roster = rosterFrom(raid, dungeons);
  const config = { liveSeason: PHASES.liveSeason, seasonLabels: PHASES.seasonLabels, roster };

  /* Measured on the day this was written (2026-08-13, liveSeason still "s1"): the raid page's
     PROSE check PASSES — it says "Midnight 12.0.7", which is the live season — while its
     ROSTER check fails 0/9, because gearing/data already describes the Season-2 raid Archon
     has no parses for. The two checks disagreeing is the gate working, not a bug, and it is
     the concrete reason the season test alone is not enough in either direction. */

  console.log(`Probing Archon's gear pages (live season ${PHASES.liveSeason} = `
    + `${PHASES.seasonLabels[PHASES.liveSeason]}) ...`);

  const probeUrl = `${ARCHON_ORIGIN}/wow/builds/frost/mage/raid/gear-and-tier-set/mythic/all-bosses`;
  const probeHtml = await getText(probeUrl);
  if (!probeHtml) throw new Error(`archon: ${probeUrl} unreachable — recording nothing rather `
    + "than guessing (hard rule 1)");
  const probe = parseGearPage(probeHtml, { where: "probe" });
  const verdict = seasonVerdict(probe, config);
  for (const check of verdict.checks)
    console.log(`  ${check.ok ? "ok  " : "FAIL"}  ${check.name.padEnd(14)} ${check.detail}`);

  if (!verdict.ok) {
    if (previous?.status === "harvested" && process.env.WOW_ACCEPT_ARCHON_REGRESSION !== "1")
      throw new Error("refusing to overwrite a harvested data/archon-usage.json with a pending "
        + `record: ${verdict.reason}\n  rerun with WOW_ACCEPT_ARCHON_REGRESSION=1 if Archon really `
        + "has rolled back");
    const doc = pendingFile({
      reason: verdict.reason, checkedAt: today(), previous,
      evidence: [{ url: probeUrl, season: verdict.season, lastUpdated: probe.lastUpdated,
        totalParses: probe.totalParses, failed: verdict.failed,
        encounters: probe.encounters, checks: verdict.checks }],
    });
    const issues = archonUsageIssues(doc);
    if (issues.length) throw new Error(`pending record is malformed: ${issues.join("; ")}`);
    await mkdir(dirname(DATA_PATH), { recursive: true });
    await writeFile(DATA_PATH, `${JSON.stringify(doc, null, 2)}\n`, "utf8");
    console.log(`\nwrote data/archon-usage.json (status: pending)`);
    console.log(`  ${verdict.reason}`);
    return;
  }
  if (probeOnly) { console.log("\nprobe passed; rerun without --probe to harvest"); return; }

  const catalog = probe.specCatalog.filter((entry) => entry.path
    && (!specFilter || `${entry.spec} ${entry.class}`.toLowerCase() === specFilter.toLowerCase()));
  if (!catalog.length) throw new Error(`archon: no spec matched ${specFilter ?? "(all)"}`);

  const specs = [], unresolved = [];
  for (const entry of catalog) {
    const brackets = {};
    for (const [bracket, zoneType] of Object.entries(LIVE_ZONE_TYPES)) {
      const url = laneUrl(entry.path, zoneType);
      const html = await getText(url);
      if (!html) { unresolved.push(`${entry.spec} ${entry.class} ${bracket} (unreachable)`); continue; }
      const cut = parseGearPage(html, { where: `${entry.spec} ${entry.class} ${bracket}` });
      const cutVerdict = seasonVerdict(cut, config);
      if (!cutVerdict.ok) { unresolved.push(`${entry.spec} ${entry.class} ${bracket}: ${cutVerdict.reason}`); continue; }
      brackets[bracket] = {
        url, lastUpdated: cut.lastUpdated, totalParses: cut.totalParses,
        sampleDescription: cut.sampleDescription, difficulty: cut.difficulty, encounter: cut.encounter,
        slots: cut.slots, crafted: cut.crafted, missives: cut.missives, embellishments: cut.embellishments,
      };
    }
    const items = Object.values(brackets)
      .reduce((sum, cut) => sum + cut.slots.reduce((n, slot) => n + slot.items.length, 0), 0);
    specs.push({ class: entry.class, spec: entry.spec, brackets });
    console.log(`  ok   ${`${entry.spec} ${entry.class}`.padEnd(26)} `
      + `${Object.keys(brackets).join("+").padEnd(11)} ${String(items).padStart(4)} item rows`);
  }

  if (unresolved.length)
    throw new Error(`refusing to overwrite data/archon-usage.json: ${unresolved.join("; ")}`);

  const doc = harvestedFile({ season: PHASES.liveSeason, harvestedAt: today(), specs });
  const issues = archonUsageIssues(doc);
  if (issues.length) throw new Error(`refusing to overwrite data/archon-usage.json: ${issues.join("; ")}`);
  await mkdir(dirname(DATA_PATH), { recursive: true });
  await writeFile(DATA_PATH, `${JSON.stringify(doc, null, 2)}\n`, "utf8");
  console.log(`\nwrote data/archon-usage.json (status: harvested, season ${doc.season})`);
  console.log(`  ${specs.length} specs`);
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) await main(process.argv.slice(2));
