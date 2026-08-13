// Harvest every Venomous Abyss drop from Wowhead's 12.1.0 PTR data.
//
// Three hops:
//   1. each boss guide page  -> the item IDs that boss drops
//   2. nether.wowhead.com    -> that item's own tooltip (slot, type, stats, effect)
//   3. the raid rewards page -> which ENCOUNTER each item is listed under (Phase D)
//
// All parsing lives in lib-wowhead.mjs so every harvester agrees on the rules.
// Nothing is inferred: fields absent from the tooltip stay null, because guessed
// loot data is worse than missing loot data.
//
// WHY HOP 3 EXISTS (Phase D, docs/gearing-s2-scope.md G20/G21).
// `droppedBy` comes from the item's own tooltip and the tooltip is often silent: measured
// 2026-08-13, 65 of 104 raid items carried a source and 39 carried none, with three whole
// bosses (Nek'zali, Vashnik, The Coiled Altar) blank end to end. The game plan names the
// encounter that drops each item, so a blank is a visible hole. Wowhead's rewards guide
// serves all nine gear-drop panels in ONE fetch and attributes every one of the 105 items,
// which closes the gap without a second source of truth: the tooltip still wins wherever it
// speaks, the guide only fills silence, and every filled value is stamped
// `droppedBySource: "guide"` so a reader can tell game data from a guide's attribution.
//
// A DISAGREEMENT IS NEVER RESOLVED HERE. Where both speak and they name different
// encounters, the tooltip is kept and the pair is recorded in `attribution.conflicts`; the
// run then REFUSES to write unless WOW_ACCEPT_SOURCE_CONFLICTS=1, because a wrong
// attribution is worse than a missing one once the client starts printing it.
//
//   node src/harvest-raid.mjs
// Env
//   WOW_ACCEPT_LOOT_CHANGES=1       accept a changed scoped loot set
//   WOW_ACCEPT_SOURCE_CONFLICTS=1   accept reviewed tooltip-vs-guide attribution conflicts
//
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { getText, guideMarkupFrom, markupBlocks, plainMarkup, raidBossLootIdsFrom, fetchItems,
  parsedItemIssues } from "./lib-wowhead.mjs";
import { normalizeText } from "./lib-guides.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_PATH = join(ROOT, "data", "raid-items.json");

export const GUIDE = (slug) =>
  `https://www.wowhead.com/ptr/guide/midnight/raids/venomous-abyss-${slug}-boss-strategy-abilities`;
export const ITEM_LEVEL_SOURCE = "https://www.wowhead.com/guide/midnight/raids/the-venomous-abyss-overview-location-rewards-bosses";

/* The rewards guide. NOTE the `/raids/` path segment: the Phase-B recon recorded this URL
   without it and that spelling is a 404 (measured 2026-08-13). Wowhead renders the panel
   strip client-side from the guide-body markup payload, so the `role="tab"` DOM the recon
   describes exists only in a browser — the server HTML carries `[tabs][tab name="..."]`
   markup instead, which is what this file parses. A plain request reached it fine from a
   residential IP on 2026-08-13; where Wowhead 403s one, `https://r.jina.ai/<url>` with
   `x-return-format: html` returns the same payload (that is how the fixtures were recorded). */
export const REWARDS_GUIDE = "https://www.wowhead.com/guide/midnight/raids/the-venomous-abyss-rewards-gear-loot";

/* Panels in the geardrops strip that are NOT an encounter. "BoEs" is world/trash loot for
   the whole instance, so attributing its nine items to a boss would be a fabricated kill. */
export const NON_ENCOUNTER_TABS = new Set(["boes", "boe", "bind on equip", "world drops"]);

const DROP_LEVELS = [
  { bosses: [1], values: [279, 292, 305, 318] },
  { bosses: [2, 3], values: [282, 295, 308, 321] },
  { bosses: [4, 5, 6], values: [285, 298, 311, 324] },
  { bosses: [7, 8], values: [289, 302, 315, 344] },
];
const dropLevelsFor = (boss) => {
  const row = DROP_LEVELS.find((group) => group.bosses.includes(boss));
  return ["LFR", "Normal", "Heroic", "Mythic"]
    .map((need, index) => ({ need, ilvl: row.values[index] }));
};

/* MEASURED 2026-08-13, recorded so the next reader does not have to rediscover it.
   Boss 1's second alias, "Nymrissa Wavecaller", is NOT a sub-NPC of Nek'zali: she is the
   Tidebound Grotto LAIR BOSS, a separate instance with its own Wowhead page and its own
   13-item drop table. Wowhead's rewards guide nevertheless lists three of her drops
   (268262 / 268263 / 268266) inside the Nek'zali panel, and their tooltips say Nymrissa —
   which is why the alias was declared and why boss 1 carries 17 items where every other
   boss carries 12-13. A fourth Grotto drop (268225) sits under The Coiled Altar.
   Consequences, none of them fixed here: the pool has no lair-boss source, nine of her
   thirteen drops are absent from our data entirely, and Phase D would tell a reader to kill
   Nek'zali for loot that drops in another instance on another lockout. The alias is left in
   place so this harvest still runs; `attributeRaidItems` prints every alias agreement so the
   pairing stays visible rather than silently absorbed. Resolving it is a pool change
   (docs/gearing-s2-scope.md, Phase E). */
export const BOSSES = [
  { n: 1, slug: "nekzali-the-soulcoiler", name: "Nek'zali the Soulcoiler", token: null, dropAliases: ["Nek'zali the Soulcoiler", "Nymrissa Wavecaller"] },
  { n: 2, slug: "entombed-sentinels", name: "Entombed Sentinels", token: "Hands", dropAliases: ["Blood of Ula'tek", "Breath of Ula'tek"] },
  { n: 3, slug: "lost-explorers", name: "The Lost Explorers", token: "Shoulders", orderDisputed: true, dropAliases: ["Mor'zahi"] },
  { n: 4, slug: "vashnik-the-malignant", name: "Vashnik the Malignant", token: "Chest", orderDisputed: true, dropAliases: ["Vashnik", "Vashnik the Malignant"] },
  { n: 5, slug: "sszorak", name: "Sszorak", token: "Legs", dropAliases: ["Sszorak"] },
  { n: 6, slug: "twin-fangs", name: "The Twin Fangs", token: "Head", dropAliases: ["Vexhul", "Ithraz"] },
  { n: 7, slug: "coiled-altar", name: "The Coiled Altar", token: null, dropAliases: ["Zul'jan", "Hex Lord Malacrass", "The Coiled Altar"] },
  { n: 8, slug: "ulatek", name: "Ula'tek", token: "omni", dropAliases: ["Ula'tek"] },
];

// PTR guide correction: this item is listed in both boss-guide Gear tables, while
// Nek'zali's own reward table and the encounter loot record assign it to Nek'zali.
// Keeping the resolution explicit means any future duplicate still fails closed.
// The rewards page reproduces the same duplicate (268231 sits in the Nek'zali AND the
// Coiled Altar panel, measured 2026-08-13), which is independent confirmation that the
// duplicate is Wowhead's and not a parser artefact.
export const ITEM_OWNER_OVERRIDES = {
  "268231": {
    boss: 1,
    item: "Soulslither Spaulders",
    source: GUIDE("nekzali-the-soulcoiler"),
    note: "Removed from The Coiled Altar's duplicate PTR guide table.",
  },
};

/* ---------- hop 3: the rewards page ----------
   `[tabs name="geardrops"]` holds one `[tab name="<encounter>"]` per panel, and each panel
   carries a difficulty ladder AND an `Item | Slot` table. Only the second is a drop table,
   so the header row decides — never the table's position in the panel. */

export function parseRewardPanels(html) {
  const markup = guideMarkupFrom(html);
  const strip = markupBlocks(markup, "tabs")
    .find((block) => /^\[tabs\s+[^\]]*name="?geardrops/i.test(block.raw));
  if (!strip) throw new Error("rewards guide: no geardrops tab strip");
  const panels = [];
  for (const tab of markupBlocks(strip.raw, "tab")) {
    const named = /^\[tab\s+[^\]]*name="([^"]*)"/i.exec(tab.raw) || /^\[tab\s+[^\]]*name=([^\s\]]+)/i.exec(tab.raw);
    if (!named) throw new Error("rewards guide: unnamed panel in the geardrops strip");
    const name = normalizeText(named[1]);
    const rows = [];
    for (const table of markupBlocks(tab.raw, "table")) {
      const cells = markupBlocks(table.raw, "tr")
        .map((row) => markupBlocks(row.raw, "td").map((cell) => cell.raw));
      const header = (cells[0] ?? []).map((cell) => plainMarkup(cell));
      // The drop table is the one whose first two columns are Item and a slot column.
      if (!/^item$/i.test(header[0] ?? "") || !/slot/i.test(header[1] ?? "")) continue;
      for (const row of cells.slice(1)) {
        const id = /\[item=(\d+)(?=[\s\]])/.exec(row[0] ?? "");
        if (!id) continue;
        rows.push({ itemId: id[1], rawSlot: plainMarkup(row[1] ?? "") || null });
      }
    }
    panels.push({ name, isEncounter: !NON_ENCOUNTER_TABS.has(name.toLowerCase()), rows });
  }
  if (!panels.length) throw new Error("rewards guide: geardrops strip has no panels");
  if (!panels.some((panel) => panel.isEncounter && panel.rows.length))
    throw new Error("rewards guide: no encounter panel carried a drop table");
  return panels;
}

/* itemId -> the encounter panels that list it. An id can legitimately appear twice (268231),
   so this is a LIST: collapsing it to one owner here would hide the duplicate the override
   exists to resolve. */
export function attributionFrom(panels) {
  const byItem = new Map();
  const nonEncounter = new Map();
  for (const panel of panels) {
    if (!panel.isEncounter) {
      nonEncounter.set(panel.name, panel.rows.map((row) => row.itemId));
      continue;
    }
    for (const row of panel.rows) {
      if (!byItem.has(row.itemId)) byItem.set(row.itemId, []);
      if (!byItem.get(row.itemId).includes(panel.name)) byItem.get(row.itemId).push(panel.name);
    }
  }
  return { byItem, nonEncounter };
}

/* Fill blanks, verify what is already there, and report every mismatch.
   `bosses` are the harvested groups; each item is updated IN PLACE, because `droppedBy` is
   an item field and Phase D reads it off the item. Returns the audit, never a verdict:
   the caller decides whether conflicts are acceptable. */
export function attributeRaidItems(bosses, attribution) {
  const audit = { filled: [], exact: 0, aliasAgreements: [], conflicts: [], notListed: [],
    guideOnly: [] };
  const aliasSeen = new Map();
  for (const boss of bosses) {
    const identities = [boss.name, ...(boss.dropAliases ?? [])].filter(Boolean);
    const identityKeys = new Set(identities.map((name) => normalizeText(name)));
    for (const item of boss.items ?? []) {
      // The key exists on every item, so "no source" is a stated null rather than an absence.
      item.droppedBySource = item.droppedBy ? "tooltip" : null;
      const listedIn = attribution.byItem.get(String(item.id)) ?? [];
      const here = listedIn.find((name) => identityKeys.has(normalizeText(name)));
      if (!listedIn.length) {
        audit.notListed.push({ boss: boss.name, id: item.id, name: item.name });
        continue;
      }
      if (!here) {
        audit.conflicts.push({ boss: boss.name, id: item.id, name: item.name,
          tooltip: item.droppedBy ?? null, guide: listedIn.join(" / "),
          why: "the rewards guide lists this item under a different encounter" });
        continue;
      }
      if (!item.droppedBy) {
        item.droppedBy = here;
        item.droppedBySource = "guide";
        audit.filled.push({ boss: boss.name, id: item.id, name: item.name, droppedBy: here });
        continue;
      }
      if (normalizeText(item.droppedBy) === normalizeText(here)) { audit.exact++; continue; }
      if (identityKeys.has(normalizeText(item.droppedBy))) {
        /* Both names identify this encounter, so nothing is wrong — but the pair is printed
           rather than swallowed. That is how "Nek'zali the Soulcoiler <- Nymrissa Wavecaller"
           stays visible: a lair boss declared as a raid boss's alias looks exactly like a
           legitimate sub-NPC ("Entombed Sentinels <- Breath of Ula'tek") to any machine. */
        const key = `${boss.name} <- ${item.droppedBy}`;
        if (!aliasSeen.has(key)) {
          aliasSeen.set(key, { encounter: boss.name, tooltip: item.droppedBy, guide: here, count: 0 });
          audit.aliasAgreements.push(aliasSeen.get(key));
        }
        aliasSeen.get(key).count++;
        continue;
      }
      audit.conflicts.push({ boss: boss.name, id: item.id, name: item.name,
        tooltip: item.droppedBy, guide: here,
        why: "the tooltip names an encounter identity this boss does not declare" });
    }
  }
  /* Drift is reported from both sides: `notListed` is ours-but-not-theirs, this is
     theirs-but-not-ours. A rewards panel naming an item no boss guide lists means the two
     Wowhead surfaces have diverged between PTR builds, which is news rather than an error. */
  const held = new Set(bosses.flatMap((boss) => (boss.items ?? []).map((item) => String(item.id))));
  for (const [id, panels] of attribution.byItem)
    if (!held.has(id)) audit.guideOnly.push({ id, guide: panels.join(" / ") });
  return audit;
}

export const attributionCounts = (bosses) => {
  const items = bosses.flatMap((boss) => boss.items ?? []);
  return {
    fromTooltip: items.filter((item) => item.droppedBySource === "tooltip").length,
    fromGuide: items.filter((item) => item.droppedBySource === "guide").length,
    missing: items.filter((item) => !item.droppedBy).length,
  };
};

async function main() {
  const acceptLootChanges = process.env.WOW_ACCEPT_LOOT_CHANGES === "1";
  const acceptConflicts = process.env.WOW_ACCEPT_SOURCE_CONFLICTS === "1";
  let previous = null;
  let hasPrevious = false;
  try {
    previous = JSON.parse(await readFile(DATA_PATH, "utf8"));
    hasPrevious = true;
  }
  catch (error) {
    if (error?.code !== "ENOENT")
      throw new Error(`cannot trust existing raid loot baseline: ${error.message}`, { cause: error });
  }

  if (hasPrevious) {
    const priorGroups = previous?.bosses;
    const priorNumbers = new Set((priorGroups || []).map((boss) => boss.boss));
    if (!Array.isArray(priorGroups) || priorGroups.length !== BOSSES.length
      || BOSSES.some((boss) => !priorNumbers.has(boss.n))
      || priorGroups.some((boss) => !(boss.items || []).length))
      throw new Error("cannot trust existing raid loot baseline: expected eight numbered, nonempty bosses");
  }

  console.log("Harvesting The Venomous Abyss from Wowhead 12.1.0 PTR ...");
  const bosses = [];
  const failed = [];

  for (const b of BOSSES) {
    const html = await getText(GUIDE(b.slug));
    if (!html) {
      console.error(`  !! no guide page for ${b.name}`);
      failed.push(`${b.name}: guide fetch failed`);
      continue;
    }
    let ids;
    try { ids = raidBossLootIdsFrom(html); }
    catch (error) {
      console.error(`  !! no scoped loot table for ${b.name}`);
      failed.push(`${b.name}: ${error.message}`);
      continue;
    }
    const items = await fetchItems(ids);
    if (items.length !== ids.length) {
      failed.push(`${b.name}: ${ids.length - items.length} item tooltips failed`);
      continue;
    }
    const gear = items.filter((x) => x.ilvl && x.ilvl > 100);
    const schemaProblems = gear.flatMap((item) => parsedItemIssues(item)
      .map((issue) => `${item.id}=${issue}`));
    for (const item of gear.filter((candidate) => !candidate.slot)) {
      const classToken = Array.isArray(item.classes) && item.classes.length > 0;
      const omniToken = b.n === 8 && b.token === "omni" && item.id === "270909";
      if (!classToken && !omniToken) schemaProblems.push(`${item.id}=unexplained slotless raid item`);
    }
    if (schemaProblems.length) {
      failed.push(`${b.name}: parser schema ${schemaProblems.join(", ")}`);
      continue;
    }
    const unexpectedSources = gear.filter((item) => item.droppedBy && !b.dropAliases.includes(item.droppedBy));
    if (unexpectedSources.length) {
      failed.push(`${b.name}: unexpected tooltip sources ${unexpectedSources
        .map((item) => `${item.id}=${item.droppedBy}`).join(", ")}`);
      continue;
    }
    console.log(`  boss ${b.n}  ${b.name.padEnd(26)} ${String(items.length).padStart(3)} drops  ${String(gear.length).padStart(3)} gear`);
    bosses.push({
      boss: b.n, name: b.name, tokenSlot: b.token, orderDisputed: !!b.orderDisputed,
      dropAliases: b.dropAliases, dropLevels: dropLevelsFor(b.n), items: gear,
    });
  }

  if (failed.length) {
    throw new Error(`refusing to overwrite data/raid-items.json:\n  ${failed.join("\n  ")}`);
  }

  for (const [id, override] of Object.entries(ITEM_OWNER_OVERRIDES)) {
    const intendedBoss = bosses.find((boss) => boss.boss === override.boss);
    if (!intendedBoss?.items.some((item) => item.id === id)) {
      throw new Error(`refusing to overwrite data/raid-items.json: ownership override ${id} `
        + `is missing from intended boss ${override.boss}`);
    }
  }

  for (const boss of bosses) {
    boss.items = boss.items.filter((item) => {
      const override = ITEM_OWNER_OVERRIDES[item.id];
      return !override || override.boss === boss.boss;
    });
  }

  const lootChanges = [];
  for (const oldBoss of previous?.bosses || []) {
    const current = bosses.find((boss) => boss.boss === oldBoss.boss);
    const before = new Set((oldBoss.items || []).map((item) => String(item.id)));
    const after = new Set((current?.items || []).map((item) => String(item.id)));
    const removed = [...before].filter((id) => !after.has(id));
    const added = [...after].filter((id) => !before.has(id));
    if (!current || removed.length || added.length)
      lootChanges.push(`${oldBoss.name}: removed=[${removed.join(",")}] added=[${added.join(",")}]`);
  }
  if (lootChanges.length && !acceptLootChanges) {
    throw new Error("refusing to overwrite data/raid-items.json: scoped loot set changed; audit the boss guides "
      + `and rerun with WOW_ACCEPT_LOOT_CHANGES=1 if intentional:\n  ${lootChanges.join("\n  ")}`);
  }
  if (lootChanges.length) console.warn(`  accepted reviewed raid loot changes: ${lootChanges.join("; ")}`);

  const raidOwners = new Map();
  for (const boss of bosses) {
    for (const item of boss.items) {
      if (!raidOwners.has(item.id)) raidOwners.set(item.id, []);
      raidOwners.get(item.id).push(boss.name);
    }
  }
  const duplicateItems = [...raidOwners.entries()].filter(([, owners]) => owners.length > 1);
  if (duplicateItems.length) {
    throw new Error(`refusing to overwrite data/raid-items.json: duplicate assignments: ${duplicateItems
      .map(([id, owners]) => `${id} (${owners.join(", ")})`).join("; ")}`);
  }

  // ---- hop 3: encounter attribution ----
  const rewardsHtml = await getText(REWARDS_GUIDE);
  if (!rewardsHtml)
    throw new Error(`refusing to overwrite data/raid-items.json: rewards guide unreachable (${REWARDS_GUIDE})`);
  const panels = parseRewardPanels(rewardsHtml);
  const attribution = attributionFrom(panels);
  const audit = attributeRaidItems(bosses, attribution);
  const counts = attributionCounts(bosses);
  console.log(`\n  attribution: ${counts.fromTooltip} from tooltips · ${counts.fromGuide} filled from the rewards guide `
    + `· ${counts.missing} still unattributed`);
  console.log(`  agreement: ${audit.exact} exact · ${audit.aliasAgreements.reduce((sum, row) => sum + row.count, 0)} via a declared alias `
    + `· ${audit.conflicts.length} conflicting · ${audit.notListed.length} not listed by the guide`);
  for (const row of audit.aliasAgreements)
    console.log(`    alias  ${row.encounter} <- tooltip "${row.tooltip}" x${row.count}`);
  for (const [name, ids] of attribution.nonEncounter)
    console.log(`    panel "${name}" is not an encounter: ${ids.length} items left unattributed`);
  for (const row of audit.notListed)
    console.log(`    not listed  ${row.boss}: ${row.id} ${row.name}`);
  for (const row of audit.guideOnly)
    console.log(`    guide-only row  ${row.id} (${row.guide}) is in no boss guide's Gear table`);
  for (const row of audit.conflicts)
    console.log(`    CONFLICT  ${row.id} ${row.name} (${row.boss}): tooltip="${row.tooltip}" guide="${row.guide}"`);
  if (audit.conflicts.length && !acceptConflicts) {
    throw new Error("refusing to overwrite data/raid-items.json: the rewards guide contradicts "
      + "item tooltips; audit each pair and rerun with WOW_ACCEPT_SOURCE_CONFLICTS=1 if the "
      + `tooltip should stand:\n  ${audit.conflicts
        .map((row) => `${row.id} ${row.name}: tooltip="${row.tooltip}" guide="${row.guide}"`).join("\n  ")}`);
  }

  const all = bosses.flatMap((b) => b.items);
  const out = {
    source: "Wowhead 12.1.0 PTR boss-guide Gear tables + per-item tooltips",
    itemLevelSource: ITEM_LEVEL_SOURCE,
    harvestedAt: new Date().toISOString().slice(0, 10),
    caveat: "Pre-launch PTR data. Stats and drop assignments may change before Aug 18 2026.",
    assignmentOverrides: ITEM_OWNER_OVERRIDES,
    instance: "The Venomous Abyss",
    attribution: {
      source: REWARDS_GUIDE,
      note: "droppedBy comes from the item's own tooltip where the tooltip names a source, and "
        + "from the rewards guide's encounter panel where it does not. Every item records which, "
        + "in droppedBySource. Conflicts are listed, never resolved.",
      ...counts,
      exactAgreements: audit.exact,
      aliasAgreements: audit.aliasAgreements,
      conflicts: audit.conflicts,
      notListed: audit.notListed,
      guideOnlyRows: audit.guideOnly,
      nonEncounterPanels: Object.fromEntries(
        [...attribution.nonEncounter].map(([name, ids]) => [name, ids.length])),
    },
    counts: {
      drops: all.length,
      gear: all.filter((x) => x.ilvl > 100).length,
      withEffect: all.filter((x) => x.effect).length,
      tokens: bosses.reduce((sum, boss) => sum + boss.items.filter((item) =>
        (item.classes && item.classes.length) || (boss.tokenSlot === "omni" && !item.slot)).length, 0),
      typed: all.filter((x) => x.type).length,
      attributed: all.filter((x) => x.droppedBy).length,
    },
    bosses,
  };

  await mkdir(join(ROOT, "data"), { recursive: true });
  await writeFile(DATA_PATH, JSON.stringify(out, null, 2), "utf8");
  console.log(`\nwrote data/raid-items.json`);
  console.log(`  ${out.counts.drops} drops · ${out.counts.gear} gear · ${out.counts.withEffect} with effects · ${out.counts.tokens} tier tokens · ${out.counts.typed} with an armour/weapon type · ${out.counts.attributed} attributed to an encounter`);
}

// Importable: the parsers are tested against recorded fixtures, so main() must not run on import.
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url)
  await main();
