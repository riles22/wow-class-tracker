// Harvest Season 2 Mythic+ dungeon loot from Wowhead's PTR dungeon guides.
//
// IMPORTANT — why there is no item level here.
// Mythic+ gear is the base dungeon item scaled at drop time by key level, so Wowhead
// shows these items at their template level (Ruby Life Pools reads "53", not a Season 2
// level). The item's slot, armour/weapon type, primary stat and secondaries ARE real and
// fixed; only the item level is dynamic. So we keep every item that has a slot and take
// the item level from the key-level table instead of the tooltip.
//
// ENCOUNTER ATTRIBUTION (Phase D, docs/gearing-s2-scope.md G20).
// The same scoped table the item IDs come from carries a third column — `Boss Drop` — and
// we never read it. `droppedBy` therefore came only from the item's own tooltip, which is
// silent on 25 of 204 items (measured 2026-08-13: Temple of Sethraliss 16, Ruby Life Pools
// 9). The game plan names the encounter you run for each item, so a blank is a visible hole.
// Reading the column we already fetch closes it with no extra request.
//
// THE COLUMN IS NOT AUTHORITATIVE, AND THAT IS THE WHOLE DESIGN.
// Measured against the tooltips on the same day, Wowhead's Boss Drop column names a boss
// from a DIFFERENT dungeon (Atroxus, of Voidscar Arena, on a Murder Row row), names an
// encounter our roster does not hold at all (Lightblossom Trinity, 7 rows of The Blinding
// Vale, where every tooltip says Meittik), and omits Kings' Rest's Aka'ali the Conqueror
// entirely, folding his 8 items into The Council of Tribes. So:
//   · the tooltip wins wherever it speaks; the guide only fills silence,
//   · a guide name that is not a declared encounter of THIS dungeon never fills anything,
//   · every value records where it came from in `droppedBySource`,
//   · and a disagreement is recorded, never resolved — the run refuses to write unless
//     WOW_ACCEPT_SOURCE_CONFLICTS=1, because a wrong attribution is worse than a missing
//     one once the client starts printing it.
//
//   node src/harvest-dungeons.mjs
// Env
//   WOW_ACCEPT_LOOT_CHANGES=1       accept a changed scoped loot set
//   WOW_ACCEPT_SOURCE_CONFLICTS=1   accept reviewed tooltip-vs-guide attribution conflicts
//
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { getText, dungeonLootIdsFrom, guideMarkupFrom, markupBlocks, markupHeadings,
  plainMarkup, fetchItems, parsedItemIssues } from "./lib-wowhead.mjs";
import { normalizeText } from "./lib-guides.mjs";
import { SEASON } from "./season.mjs";
import { wowheadCandidates } from "./lib-wowhead-url.mjs";
import { LAIRS, lairIdentityKeys } from "./harvest-raid.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_PATH = join(ROOT, "data", "dungeon-items.json");
/* Namespace-free paths (Phase E). `SEASON.wowheadNamespace` decides what a fresh run EMITS;
   `wowheadCandidates` decides what it ACCEPTS, which is every spelling — the committed guide
   URLs here are all `/ptr/` and a stale link outlives the flip. */
const M = (s) => `guide/midnight/${s}-dungeon-overview-location-rewards`;
const MP = (s) => `guide/midnight/${s}-dungeon-overview-mythic-plus`;
const G = (s) => `guide/${s}-dungeon-strategy-guide`;
const D = (s) => `guide/dungeons/${s}-strategy`;

// End-of-dungeon and Great Vault item levels by key level (see sheet 1 / Season 2 tables).
export const KEY_ILVL = [
  { key: "Mythic 0", end: 292, vault: 302 }, { key: "+2", end: 295, vault: 305 },
  { key: "+3", end: 295, vault: 305 }, { key: "+4", end: 298, vault: 308 },
  { key: "+5", end: 302, vault: 308 }, { key: "+6", end: 305, vault: 311 },
  { key: "+7", end: 305, vault: 315 }, { key: "+8", end: 308, vault: 315 },
  { key: "+9", end: 308, vault: 315 }, { key: "+10 and above", end: 311, vault: 318 },
];

/* `encounters` is a flat list of every NAME a source may use for a boss of this dungeon, so
   it mixes distinct bosses with alternate spellings of one boss. That was enough while the
   list only had to answer "is this name plausible here", but attribution has to answer a
   harder question: do two DIFFERENT names mean the same kill? `encounterAliases` declares
   exactly which ones do — every group is one encounter under several published names, and a
   name in no group is its own encounter.
   Declared from measurement, 2026-08-13, and deliberately small: without it the 11 Kings'
   Rest rows where the tooltip says "King Dazar" and the guide says "Dazar, The First King"
   read as contradictions, and the 8 rows that are a REAL contradiction (tooltip "Aka'ali the
   Conqueror" against guide "The Council of Tribes", two different bosses) get lost among
   them. Nothing is added here to make a mismatch go away: "Lightblossom Trinity" and the
   stray "Atroxus" are absent on purpose, and they are the conflicts the harvest refuses on. */
export const POOL = [
  { name: "Altar of Fangs", expansion: "Midnight", isNew: true, encounters: ["Rav'i", "The Writhing Coil", "Zul'jan"], encounterAliases: [], urls: [M("altar-of-fangs")] },
  { name: "Murder Row", expansion: "Midnight", encounters: ["Lithiel Cinderfury", "Xathuux the Annihilator", "Zaen Bladesorrow", "Kystia Manaheart"], encounterAliases: [], urls: [M("murder-row")] },
  { name: "Den of Nalorakk", expansion: "Midnight", encounters: ["Nalorakk", "The Hoardmonger", "Sentinel of Winter"], encounterAliases: [], urls: [M("den-of-nalorakk")] },
  { name: "The Blinding Vale", expansion: "Midnight", encounters: ["Lightwarden Ruia", "Ikuzz the Light Hunter", "Ziekket", "Meittik"], encounterAliases: [], urls: [M("the-blinding-vale")] },
  { name: "Voidscar Arena", expansion: "Midnight", encounters: ["Charonus", "Atroxus", "Taz'Rah"], encounterAliases: [], urls: [M("voidscar-arena")] },
  { name: "Kings' Rest", expansion: "Battle for Azeroth", encounters: ["The Golden Serpent", "Mchimba the Embalmer", "The Council of Tribes", "Aka'ali the Conqueror", "King Dazar", "Dazar, The First King"], encounterAliases: [["King Dazar", "Dazar, The First King"]], urls: [MP("kings-rest"), G("kings-rest"), M("kings-rest")] },
  { name: "Temple of Sethraliss", expansion: "Battle for Azeroth", encounters: ["Adderis", "Aspix", "Adderis and Aspix", "Merektha", "Galvazzt", "Avatar of Sethraliss"], encounterAliases: [["Adderis", "Aspix", "Adderis and Aspix"]], urls: [MP("temple-of-sethraliss"), G("temple-of-sethraliss")] },
  { name: "Ruby Life Pools", expansion: "Dragonflight", encounters: ["Melidrussa Chillworn", "Kokia Blazehoof", "Kyrakka", "Erkhart Stormvein", "Kyrakka and Erkhart Stormvein"], encounterAliases: [["Kyrakka", "Erkhart Stormvein", "Kyrakka and Erkhart Stormvein"]], urls: [MP("ruby-life-pools"), D("ruby-life-pools")] },
];

/* An alias group that names something the dungeon does not list, or a name claimed by two
   groups, would silently redefine what counts as agreement — so it fails loudly instead. */
export function assertAliasGroups(pool = POOL) {
  for (const dungeon of pool) {
    const known = new Set((dungeon.encounters ?? []).map((name) => normalizeText(name)));
    const claimed = new Set();
    for (const group of dungeon.encounterAliases ?? []) {
      if (!Array.isArray(group) || group.length < 2)
        throw new Error(`${dungeon.name}: an alias group needs at least two names`);
      for (const name of group) {
        const key = normalizeText(name);
        if (!known.has(key))
          throw new Error(`${dungeon.name}: alias "${name}" is not one of the dungeon's encounters`);
        if (claimed.has(key))
          throw new Error(`${dungeon.name}: "${name}" appears in more than one alias group`);
        claimed.add(key);
      }
    }
  }
  return true;
}

/* The other half of G22's refusal. A lair boss is not a dungeon boss — separate instance,
   separate lockout, no key level — so a pool that named one as an encounter would relocate the
   misfiling rather than fix it, and it would do so in the file where nobody is looking for it.
   Tidebound Grotto is the concrete case: it is the one S2 source our data lacked entirely. */
export function assertNoLairEncounters(pool = POOL, lairs = LAIRS) {
  const identities = lairIdentityKeys(lairs);
  for (const dungeon of pool) {
    for (const name of [dungeon.name, ...(dungeon.encounters ?? [])].filter(Boolean)) {
      const lair = identities.get(normalizeText(name).toLowerCase());
      if (lair)
        throw new Error(`${dungeon.name} names "${name}", which identifies the lair boss `
          + `${lair.name} (${lair.instance}) — a lair is its own source, not a dungeon `
          + "encounter (docs/gearing-s2-scope.md G22)");
    }
  }
  return true;
}

/* One encounter identity per name: the group it belongs to, or itself. */
export function encounterKeyFor(dungeon, name) {
  const key = normalizeText(name ?? "");
  if (!key) return null;
  for (const group of dungeon.encounterAliases ?? []) {
    if (group.some((alias) => normalizeText(alias) === key)) return normalizeText(group[0]);
  }
  return key;
}

/* The scoped `Item | Slot | Boss Drop` rows, selected exactly the way dungeonLootIdsFrom
   selects the table they live in — same heading test, same header test — so the rows and the
   IDs can never come from two different tables. The boss column is located by its HEADER,
   never by index: Wowhead writes "Boss Drop", "Dropped By" and "Source" across the pool. */
export function dungeonDropRowsFrom(html) {
  const markup = guideMarkupFrom(html);
  const headings = markupHeadings(markup);
  const rows = [];
  for (const table of markupBlocks(markup, "table")) {
    const section = [...headings].reverse().find((heading) => heading.start < table.start)?.text ?? "";
    if (!/loot table|gear drops/i.test(section)) continue;
    const cells = markupBlocks(table.raw, "tr")
      .map((row) => markupBlocks(row.raw, "td").map((cell) => cell.raw));
    const header = (cells[0] ?? []).map((cell) => plainMarkup(cell));
    const bossColumn = header.findIndex((cell) => /^(boss(\s*drop)?|dropped by|source)$/i.test(cell));
    if (!header.some((cell) => /^item$/i.test(cell)) || bossColumn < 0) continue;
    const itemColumn = header.findIndex((cell) => /^item$/i.test(cell));
    for (const row of cells.slice(1)) {
      const id = /\[item=(\d+)(?=[\s\]])/.exec(row[itemColumn] ?? "");
      if (!id) continue;
      rows.push({
        itemId: id[1],
        rawSlot: plainMarkup(row[header.findIndex((cell) => /^slot$/i.test(cell))] ?? "") || null,
        encounter: normalizeText(plainMarkup(row[bossColumn] ?? "")) || null,
      });
    }
  }
  if (!rows.length) throw new Error("dungeon drop table carries no attributed rows");
  return rows;
}

/* Fill blanks, verify what is already there, report every mismatch. Items are updated IN
   PLACE because `droppedBy` is an item field and Phase D reads it off the item. */
export function attributeDungeonItems(dungeon, items, rows) {
  const known = new Map();
  for (const name of dungeon.encounters ?? []) known.set(normalizeText(name), name);
  const byItem = new Map();
  const audit = { filled: [], exact: 0, aliasAgreements: [], conflicts: [], notListed: [],
    guideOnly: [] };
  for (const row of rows) {
    const held = byItem.get(row.itemId);
    if (held && encounterKeyFor(dungeon, held) !== encounterKeyFor(dungeon, row.encounter)) {
      audit.conflicts.push({ dungeon: dungeon.name, id: row.itemId, name: null, tooltip: null,
        guide: `${held} / ${row.encounter}`,
        why: "the guide's own table attributes this item to two encounters" });
    }
    if (!held) byItem.set(row.itemId, row.encounter);
  }
  const ours = new Set(items.map((item) => String(item.id)));
  for (const [id, encounter] of byItem)
    if (!ours.has(id)) audit.guideOnly.push({ dungeon: dungeon.name, id, guide: encounter });

  const aliasSeen = new Map();
  for (const item of items) {
    // The key exists on every item, so "no source" is a stated null rather than an absence.
    item.droppedBySource = item.droppedBy ? "tooltip" : null;
    const guide = byItem.get(String(item.id)) ?? null;
    if (!guide) {
      audit.notListed.push({ dungeon: dungeon.name, id: item.id, name: item.name });
      continue;
    }
    if (!known.has(normalizeText(guide))) {
      audit.conflicts.push({ dungeon: dungeon.name, id: item.id, name: item.name,
        tooltip: item.droppedBy ?? null, guide,
        why: "the guide names an encounter this dungeon does not have" });
      continue;   // never fills: an off-roster name is the one thing we must not write
    }
    if (!item.droppedBy) {
      item.droppedBy = known.get(normalizeText(guide));
      item.droppedBySource = "guide";
      audit.filled.push({ dungeon: dungeon.name, id: item.id, name: item.name, droppedBy: item.droppedBy });
      continue;
    }
    if (normalizeText(item.droppedBy) === normalizeText(guide)) { audit.exact++; continue; }
    if (encounterKeyFor(dungeon, item.droppedBy) === encounterKeyFor(dungeon, guide)) {
      const key = `${item.droppedBy} <- ${guide}`;
      if (!aliasSeen.has(key)) {
        aliasSeen.set(key, { dungeon: dungeon.name, tooltip: item.droppedBy, guide, count: 0 });
        audit.aliasAgreements.push(aliasSeen.get(key));
      }
      aliasSeen.get(key).count++;
      continue;
    }
    audit.conflicts.push({ dungeon: dungeon.name, id: item.id, name: item.name,
      tooltip: item.droppedBy, guide, why: "the tooltip and the guide name different encounters" });
  }
  return audit;
}

export const attributionCounts = (dungeons) => {
  const items = dungeons.flatMap((dungeon) => dungeon.items ?? []);
  return {
    fromTooltip: items.filter((item) => item.droppedBySource === "tooltip").length,
    fromGuide: items.filter((item) => item.droppedBySource === "guide").length,
    missing: items.filter((item) => !item.droppedBy).length,
  };
};

async function main() {
  const acceptLootChanges = process.env.WOW_ACCEPT_LOOT_CHANGES === "1";
  const acceptConflicts = process.env.WOW_ACCEPT_SOURCE_CONFLICTS === "1";
  assertAliasGroups();
  assertNoLairEncounters();
  let previous = null;
  let hasPrevious = false;
  try {
    previous = JSON.parse(await readFile(DATA_PATH, "utf8"));
    hasPrevious = true;
  }
  catch (error) {
    if (error?.code !== "ENOENT")
      throw new Error(`cannot trust existing dungeon loot baseline: ${error.message}`, { cause: error });
  }

  if (hasPrevious) {
    const priorGroups = previous?.dungeons;
    const priorNames = new Set((priorGroups || []).map((dungeon) => dungeon.name));
    if (!Array.isArray(priorGroups) || priorGroups.length !== POOL.length
      || POOL.some((dungeon) => !priorNames.has(dungeon.name))
      || priorGroups.some((dungeon) => !(dungeon.items || []).length))
      throw new Error("cannot trust existing dungeon loot baseline: expected eight named, nonempty dungeons");
  }

  console.log(`Harvesting ${SEASON.label} Mythic+ dungeon loot `
    + `(${SEASON.patch}, ${SEASON.wowheadNamespace ? `${SEASON.wowheadNamespace} namespace` : "live"}) ...`);
  const dungeons = [];
  const unresolved = [];
  const audits = [];

  for (const d of POOL) {
    let ids = null, used = null, page = null;
    /* Each known path is tried in every namespace spelling, configured first. The URL that
       ANSWERED is what gets recorded — not the one we expected — so `dungeon.guide` stays a
       fact about the fetch rather than a restatement of the config. */
    const candidates = d.urls.flatMap((path) => wowheadCandidates(path));
    for (const u of [...new Set(candidates)]) {
      const html = await getText(u);
      if (!html) continue;
      try {
        ids = dungeonLootIdsFrom(html);
        used = u;
        page = html;
        break;
      } catch { /* try the next known guide URL */ }
    }
    if (!ids) {
      unresolved.push(d.name);
      console.log(`  --   ${d.name.padEnd(22)} no loot table resolved`);
      continue;
    }
    const items = await fetchItems(ids);
    if (items.length !== ids.length) {
      unresolved.push(`${d.name} (${ids.length - items.length} tooltips failed)`);
      console.log(`  --   ${d.name.padEnd(22)} incomplete item tooltips`);
      continue;
    }
    // keep anything equippable; item level is supplied by KEY_ILVL, not the tooltip
    const gear = items.filter((it) => it.slot);
    if (!gear.length || gear.length !== ids.length) {
      unresolved.push(`${d.name} (${gear.length}/${ids.length} scoped items equippable)`);
      console.log(`  --   ${d.name.padEnd(22)} scoped loot table contains non-equippable items`);
      continue;
    }
    const schemaProblems = gear.flatMap((item) => parsedItemIssues(item)
      .map((issue) => `${item.id}=${issue}`));
    if (schemaProblems.length) {
      unresolved.push(`${d.name} (parser schema: ${schemaProblems.join(", ")})`);
      console.log(`  --   ${d.name.padEnd(22)} parsed item schema failed`);
      continue;
    }
    const unexpectedSources = gear.filter((item) => item.droppedBy && !d.encounters.includes(item.droppedBy));
    if (unexpectedSources.length) {
      unresolved.push(`${d.name} (unexpected sources: ${unexpectedSources
        .map((item) => `${item.id}=${item.droppedBy}`).join(", ")})`);
      console.log(`  --   ${d.name.padEnd(22)} unexpected tooltip source`);
      continue;
    }
    /* Attribution reads the page the IDs came from — no second fetch, and no chance of
       pairing one dungeon's rows with another's items. A row set that does not cover the
       same IDs means the two selectors disagreed, which is a parser fault, not data. */
    let rows;
    try { rows = dungeonDropRowsFrom(page); }
    catch (error) {
      unresolved.push(`${d.name} (drop rows: ${error.message})`);
      console.log(`  --   ${d.name.padEnd(22)} scoped table carried no attributed rows`);
      continue;
    }
    const rowIds = new Set(rows.map((row) => row.itemId));
    const uncovered = ids.filter((id) => !rowIds.has(id));
    if (uncovered.length) {
      unresolved.push(`${d.name} (attribution rows missed ${uncovered.length} scoped ids: ${uncovered.join(", ")})`);
      console.log(`  --   ${d.name.padEnd(22)} attribution rows do not cover the scoped ids`);
      continue;
    }
    const audit = attributeDungeonItems(d, gear, rows);
    audits.push(audit);
    dungeons.push({
      name: d.name, expansion: d.expansion, isNew: !!d.isNew,
      guide: used, encounters: d.encounters, encounterAliases: d.encounterAliases ?? [],
      linked: ids.length, items: gear,
    });
    const filled = audit.filled.length;
    console.log(`  ok   ${d.name.padEnd(22)} ${String(ids.length).padStart(3)} linked  ${String(gear.length).padStart(3)} equippable`
      + `  ${String(filled).padStart(3)} attributed from the guide`
      + (audit.conflicts.length ? `  ${audit.conflicts.length} CONFLICTING` : ""));
  }

  if (unresolved.length) {
    throw new Error(`refusing to overwrite data/dungeon-items.json: ${unresolved.join(", ")}`);
  }

  const lootChanges = [];
  for (const oldDungeon of previous?.dungeons || []) {
    const current = dungeons.find((dungeon) => dungeon.name === oldDungeon.name);
    const before = new Set((oldDungeon.items || []).map((item) => String(item.id)));
    const after = new Set((current?.items || []).map((item) => String(item.id)));
    const removed = [...before].filter((id) => !after.has(id));
    const added = [...after].filter((id) => !before.has(id));
    if (!current || removed.length || added.length)
      lootChanges.push(`${oldDungeon.name}: removed=[${removed.join(",")}] added=[${added.join(",")}]`);
  }
  if (lootChanges.length && !acceptLootChanges) {
    throw new Error("refusing to overwrite data/dungeon-items.json: scoped loot set changed; audit the guide "
      + `and rerun with WOW_ACCEPT_LOOT_CHANGES=1 if intentional:\n  ${lootChanges.join("\n  ")}`);
  }
  if (lootChanges.length) console.warn(`  accepted reviewed dungeon loot changes: ${lootChanges.join("; ")}`);

  const dungeonOwners = new Map();
  for (const dungeon of dungeons) {
    for (const item of dungeon.items) {
      if (!dungeonOwners.has(item.id)) dungeonOwners.set(item.id, []);
      dungeonOwners.get(item.id).push(dungeon.name);
    }
  }
  const duplicateItems = [...dungeonOwners.entries()].filter(([, owners]) => owners.length > 1);
  if (duplicateItems.length) {
    throw new Error(`refusing to overwrite data/dungeon-items.json: duplicate assignments: ${duplicateItems
      .map(([id, owners]) => `${id} (${owners.join(", ")})`).join("; ")}`);
  }

  const merge = (key) => audits.flatMap((audit) => audit[key]);
  const conflicts = merge("conflicts");
  const counts = attributionCounts(dungeons);
  console.log(`\n  attribution: ${counts.fromTooltip} from tooltips · ${counts.fromGuide} filled from the guide tables `
    + `· ${counts.missing} still unattributed`);
  console.log(`  agreement: ${audits.reduce((sum, audit) => sum + audit.exact, 0)} exact `
    + `· ${merge("aliasAgreements").reduce((sum, row) => sum + row.count, 0)} via a declared alias `
    + `· ${conflicts.length} conflicting · ${merge("notListed").length} not listed by the guide`);
  for (const row of merge("aliasAgreements"))
    console.log(`    alias  ${row.dungeon}: tooltip "${row.tooltip}" = guide "${row.guide}" x${row.count}`);
  for (const row of merge("guideOnly"))
    console.log(`    guide-only row  ${row.dungeon}: ${row.id} (${row.guide}) is not in our scoped set`);
  for (const row of merge("notListed"))
    console.log(`    not listed  ${row.dungeon}: ${row.id} ${row.name}`);
  for (const row of conflicts)
    console.log(`    CONFLICT  ${row.dungeon} ${row.id} ${row.name ?? ""}: tooltip="${row.tooltip}" guide="${row.guide}" — ${row.why}`);
  if (conflicts.length && !acceptConflicts) {
    throw new Error("refusing to overwrite data/dungeon-items.json: the guide drop tables contradict "
      + "item tooltips; audit each pair and rerun with WOW_ACCEPT_SOURCE_CONFLICTS=1 if the "
      + `tooltip should stand:\n  ${conflicts
        .map((row) => `${row.dungeon} ${row.id}: tooltip="${row.tooltip}" guide="${row.guide}"`).join("\n  ")}`);
  }

  const prelaunch = !!SEASON.wowheadNamespace;
  const out = {
    // Derived from the season config (Phase E): the patch and the pre-launch state were typed
    // in by hand here, so the flip had to remember to come and edit them.
    source: `Wowhead ${SEASON.patch}${prelaunch ? " PTR" : ""} — Midnight dungeon guides `
      + "+ per-item tooltips",
    harvestedAt: new Date().toISOString().slice(0, 10),
    caveat: `${prelaunch ? "Pre-launch PTR data. " : ""}Mythic+ gear is scaled at drop time by `
      + "key level, so item levels come from the key-level table, not from the item.",
    ilvlNote: "Wowhead shows these items at their template item level; the real level is set by key level on drop.",
    keyLevels: KEY_ILVL,
    unresolved,
    attribution: {
      note: "droppedBy comes from the item's own tooltip where the tooltip names a source, and "
        + "from the guide's Boss Drop column where it does not. Every item records which, in "
        + "droppedBySource. Conflicts are listed, never resolved.",
      ...counts,
      exactAgreements: audits.reduce((sum, audit) => sum + audit.exact, 0),
      aliasAgreements: merge("aliasAgreements"),
      conflicts,
      notListed: merge("notListed"),
      guideOnlyRows: merge("guideOnly"),
    },
    counts: {
      dungeonsInPool: POOL.length,
      dungeonsHarvested: dungeons.length,
      gear: dungeons.reduce((a, d) => a + d.items.length, 0),
      attributed: dungeons.reduce((a, d) => a + d.items.filter((item) => item.droppedBy).length, 0),
    },
    dungeons,
  };

  await mkdir(join(ROOT, "data"), { recursive: true });
  await writeFile(DATA_PATH, JSON.stringify(out, null, 2), "utf8");

  console.log(`\nwrote data/dungeon-items.json`);
  console.log(`  ${dungeons.length}/${POOL.length} dungeons · ${out.counts.gear} equippable items · ${out.counts.attributed} attributed to an encounter`);
}

// Importable: the parsers are tested against recorded fixtures, so main() must not run on import.
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url)
  await main();
