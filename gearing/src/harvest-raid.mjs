// Harvest every Venomous Abyss drop from Wowhead's 12.1.0 PTR data — and the ONE lair boss
// whose loot kept landing in this file by mistake.
//
// Four hops:
//   0. each lair guide page  -> the boss-drop source that is NOT in this raid (Phase E, G22)
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
// WHY HOP 0 EXISTS (Phase E, docs/gearing-s2-scope.md G22).
// A lair boss is a boss-drop source like any other — one kill, one fixed table, its own
// difficulty ladder — but it sits on its own instance and its own lockout, so it is NOT a
// Venomous Abyss encounter. Nymrissa Wavecaller (Tidebound Grotto) spent this whole cycle
// declared as a `dropAlias` of raid boss 1, which is mechanically indistinguishable from a
// legitimate sub-NPC, and Phase D's game plan reads exactly this data: left alone it would
// send a reader to Nek'zali for loot that drops in another instance. She is now harvested
// FIRST, and her ids are removed from every raid boss's scoped set before anything else runs,
// so a re-harvest cannot quietly refile them.
//
//   node src/harvest-raid.mjs
// Env
//   WOW_ACCEPT_LOOT_CHANGES=1       accept a changed scoped loot set
//   WOW_ACCEPT_SOURCE_CONFLICTS=1   accept reviewed tooltip-vs-guide attribution conflicts
//
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { getText, guideMarkupFrom, markupBlocks, markupHeadings, plainMarkup,
  raidBossLootIdsFrom, fetchItems, parsedItemIssues } from "./lib-wowhead.mjs";
import { normalizeText } from "./lib-guides.mjs";
import { SEASON } from "./season.mjs";
import { wowheadCandidates, wowheadUrl } from "./lib-wowhead-url.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_PATH = join(ROOT, "data", "raid-items.json");

/* Namespace-free paths; `SEASON.wowheadNamespace` decides the spelling that is EMITTED and
   `wowheadCandidates` decides the spellings that are ACCEPTED (Phase E). The boss guides are
   PTR-namespaced today and the rewards/overview guides are already live — measured, not
   assumed — which is exactly why the fetch tries every spelling instead of trusting one. */
export const GUIDE_PATH = (slug) =>
  `guide/midnight/raids/venomous-abyss-${slug}-boss-strategy-abilities`;
export const GUIDE = (slug) => wowheadUrl(GUIDE_PATH(slug));
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

/* MEASURED 2026-08-13, and RESOLVED 2026-08-13 by G22 — recorded together so the next reader
   sees both the trap and the fix.
   Boss 1 used to declare a second alias, "Nymrissa Wavecaller". She is not a sub-NPC of
   Nek'zali: she is the Tidebound Grotto LAIR BOSS, a separate instance with its own Wowhead
   page and its own 13-item drop table. Wowhead's rewards guide nevertheless lists three of her
   drops (268262 / 268263 / 268266) inside the Nek'zali panel and a fourth (268225) inside The
   Coiled Altar's, and those four tooltips say Nymrissa — which is how the alias came to be
   declared and why boss 1 carried 17 items where every other boss carries 12-13.
   The alias is GONE and she is her own source (see LAIRS). Three mechanisms keep her from
   coming back: her ids are subtracted from every boss's scoped set at harvest time,
   `assertLairSeparation` refuses a boss that declares a lair identity, and validate-data.mjs
   refuses the same arrangement in the committed data. */
export const BOSSES = [
  { n: 1, slug: "nekzali-the-soulcoiler", name: "Nek'zali the Soulcoiler", token: null, dropAliases: ["Nek'zali the Soulcoiler"] },
  { n: 2, slug: "entombed-sentinels", name: "Entombed Sentinels", token: "Hands", dropAliases: ["Blood of Ula'tek", "Breath of Ula'tek"] },
  { n: 3, slug: "lost-explorers", name: "The Lost Explorers", token: "Shoulders", orderDisputed: true, dropAliases: ["Mor'zahi"] },
  { n: 4, slug: "vashnik-the-malignant", name: "Vashnik the Malignant", token: "Chest", orderDisputed: true, dropAliases: ["Vashnik", "Vashnik the Malignant"] },
  { n: 5, slug: "sszorak", name: "Sszorak", token: "Legs", dropAliases: ["Sszorak"] },
  { n: 6, slug: "twin-fangs", name: "The Twin Fangs", token: "Head", dropAliases: ["Vexhul", "Ithraz"] },
  { n: 7, slug: "coiled-altar", name: "The Coiled Altar", token: null, dropAliases: ["Zul'jan", "Hex Lord Malacrass", "The Coiled Altar"] },
  { n: 8, slug: "ulatek", name: "Ula'tek", token: "omni", dropAliases: ["Ula'tek"] },
];

/* ---------- the lair lane (G22) ----------
   A LAIR is a boss-drop source that is not part of any raid or dungeon: one encounter, one
   drop table, its own difficulty ladder, its own instance and its own lockout. It is declared
   here rather than in dungeon-items.json because it is a KILL, not a run — the M+ file's whole
   vocabulary (key levels, an eight-dungeon pool, per-dungeon encounter rosters) says something
   false about it — and it lands in raid-items.json rather than a file of its own so the page
   already receives it: the build inlines this document whole.
   `lockout: "separate"` is the load-bearing field. It is what stops a grouping that reads
   "boss-drop sources" from folding this row into the raid's weekly plan. */
export const LAIRS = [
  {
    key: "tidebound-grotto",
    name: "Nymrissa Wavecaller",
    instance: "Tidebound Grotto",
    /* Live-namespaced, like the rewards guide: measured 2026-08-13, and the fetch still walks
       every spelling rather than trusting this one. */
    guide: "https://www.wowhead.com/guide/midnight/nymrissa-wavecaller-tidebound-grotto-lair-boss-strategy-rewards",
    guidePath: "guide/midnight/nymrissa-wavecaller-tidebound-grotto-lair-boss-strategy-rewards",
    lockout: "separate",
    dropAliases: ["Nymrissa Wavecaller"],
  },
];

/* Every name that identifies a lair — the boss, the instance and any tooltip alias. The
   comparison is `normalizeText`-folded because Wowhead, Method and Icy Veins do not agree
   about apostrophes. */
export function lairIdentityKeys(lairs = LAIRS) {
  const keys = new Map();
  for (const lair of lairs) {
    for (const name of [lair.name, lair.instance, ...(lair.dropAliases ?? [])].filter(Boolean))
      keys.set(normalizeText(name).toLowerCase(), lair);
  }
  return keys;
}

/* The declaration-level half of the refusal. validate-data.mjs runs the data-level half; both
   exist because either one alone leaves a way back: a harvester could re-add the alias, and a
   hand edit could refile the items without touching this file. */
export function assertLairSeparation(bosses = BOSSES, lairs = LAIRS) {
  const identities = lairIdentityKeys(lairs);
  for (const boss of bosses) {
    for (const name of [boss.name, ...(boss.dropAliases ?? [])].filter(Boolean)) {
      const lair = identities.get(normalizeText(name).toLowerCase());
      if (lair)
        throw new Error(`${boss.name} declares "${name}", which identifies the lair boss `
          + `${lair.name} (${lair.instance}) — a lair is a separate instance on a separate `
          + "lockout and must be its own source (docs/gearing-s2-scope.md G22)");
    }
  }
  return true;
}

/* The lair guide is a SINGLE-boss page: no tab strip, no Boss Drop column, and therefore no
   attribution question to answer — every row on it drops from the one boss the page is about.
   What it does carry is two tables under one "Gear Drops" heading, and reading the wrong one
   would silently produce a drop table made of difficulty rows. So both are selected by their
   HEADERS, never by position, exactly as the raid and dungeon parsers do.

   IDENTITY IS VERIFIED, NOT ASSUMED. The page must name this boss AND this instance in its own
   Gear Drops heading, or the run refuses: a re-slugged URL that quietly serves a different lair
   would otherwise be harvested as this one. The patch is checked the same way the tier refresh
   checks an era — a page that names a DIFFERENT patch is refused, a page that names none is
   recorded as `patchNamed: null` and allowed, because absence is not evidence. */
export function parseLairRewards(html, lair, season = SEASON) {
  const markup = guideMarkupFrom(html);
  const headings = markupHeadings(markup);
  const sectionAt = (position) =>
    [...headings].reverse().find((heading) => heading.start < position)?.text ?? "";
  const gearHeadings = headings.filter((heading) => /gear drops/i.test(heading.text));
  if (!gearHeadings.length) throw new Error(`${lair.name}: the lair guide has no Gear Drops section`);

  const names = [lair.name, lair.instance].map((value) => normalizeText(value).toLowerCase());
  const named = gearHeadings.some((heading) => {
    const text = normalizeText(heading.text).toLowerCase();
    return names.every((name) => text.includes(name));
  });
  if (!named)
    throw new Error(`${lair.name}: no Gear Drops heading names both "${lair.name}" and `
      + `"${lair.instance}" — this page is not the one this lair declares`);

  const patches = [...new Set([...markup.matchAll(/\bPatch\s+(\d+\.\d+(?:\.\d+)?)/gi)]
    .map((match) => match[1]))];
  if (patches.length && !patches.includes(season.patch))
    throw new Error(`${lair.name}: the lair guide describes Patch ${patches.join("/")}, `
      + `not ${season.patch}`);

  let dropLevels = null;
  const rows = [];
  for (const table of markupBlocks(markup, "table")) {
    if (!/gear drops/i.test(sectionAt(table.start))) continue;
    const cells = markupBlocks(table.raw, "tr")
      .map((row) => markupBlocks(row.raw, "td").map((cell) => cell.raw));
    const header = (cells[0] ?? []).map((cell) => plainMarkup(cell));
    const difficulty = header.findIndex((cell) => /^difficulty$/i.test(cell));
    const level = header.findIndex((cell) => /item level/i.test(cell));
    const item = header.findIndex((cell) => /^item$/i.test(cell));
    const slot = header.findIndex((cell) => /slot/i.test(cell));
    if (difficulty === 0 && level > 0) {
      /* "279 Veteran 1/6" is an item level AND an upgrade track. Both are published, so both
         are kept; splitting them here beats re-parsing a joined string downstream. */
      dropLevels = cells.slice(1).map((row) => {
        const need = plainMarkup(row[difficulty] ?? "");
        const raw = plainMarkup(row[level] ?? "");
        const parsed = /^(\d+)\s*(.*)$/.exec(raw);
        if (!need || !parsed)
          throw new Error(`${lair.name}: unreadable difficulty ladder row "${need} / ${raw}"`);
        return { need, ilvl: Number(parsed[1]), track: parsed[2].trim() || null };
      });
      continue;
    }
    if (item !== 0 || slot < 0) continue;
    for (const row of cells.slice(1)) {
      const id = /\[item=(\d+)(?=[\s\]])/.exec(row[item] ?? "");
      if (!id) continue;
      rows.push({ itemId: id[1], rawSlot: plainMarkup(row[slot] ?? "") || null });
    }
  }
  if (!rows.length) throw new Error(`${lair.name}: the lair guide's Gear Drops section has no drop table`);
  if (!dropLevels?.length) throw new Error(`${lair.name}: the lair guide has no difficulty ladder`);
  const ids = [...new Set(rows.map((row) => row.itemId))];
  if (ids.length !== rows.length)
    throw new Error(`${lair.name}: the lair drop table lists an item twice`);
  return { lair: lair.key, name: lair.name, instance: lair.instance,
    patchNamed: patches.length ? patches.join("/") : null, dropLevels, rows, itemIds: ids };
}

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
   the caller decides whether conflicts are acceptable.

   `lairs` (G22) are boss-drop sources from other instances. They are attributed from their own
   single-boss page, never from the raid rewards panels — the rewards page files four Grotto
   drops under two raid encounters, and letting it fill them would write the exact misattribution
   this decision exists to remove. Those listings are reported as `lairListedUnderRaid` instead,
   because a Wowhead surface disagreeing with itself is news, not noise. */
export function attributeRaidItems(bosses, attribution, lairs = []) {
  const audit = { filled: [], exact: 0, aliasAgreements: [], conflicts: [], notListed: [],
    guideOnly: [], lairListedUnderRaid: [] };
  const aliasSeen = new Map();

  const lairOf = new Map();
  for (const lair of lairs)
    for (const item of lair.items ?? []) lairOf.set(String(item.id), lair);
  for (const lair of lairs) {
    const identityKeys = new Set([lair.name, ...(lair.dropAliases ?? [])]
      .filter(Boolean).map((name) => normalizeText(name)));
    for (const item of lair.items ?? []) {
      item.droppedBySource = item.droppedBy ? "tooltip" : null;
      const listedIn = attribution.byItem.get(String(item.id)) ?? [];
      for (const panel of listedIn)
        audit.lairListedUnderRaid.push({ lair: lair.name, instance: lair.instance,
          id: item.id, name: item.name, raidPanel: panel });
      if (!item.droppedBy) {
        /* The page is about one boss, so its table needs no attribution column: every row on
           it drops from this boss. That is a guide's word, and it says so. */
        item.droppedBy = lair.name;
        item.droppedBySource = "guide";
        audit.filled.push({ lair: lair.name, id: item.id, name: item.name, droppedBy: lair.name });
        continue;
      }
      if (identityKeys.has(normalizeText(item.droppedBy))) { audit.exact++; continue; }
      audit.conflicts.push({ lair: lair.name, id: item.id, name: item.name,
        tooltip: item.droppedBy, guide: lair.name,
        why: "the tooltip names an encounter this lair does not declare" });
    }
  }
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
     Wowhead surfaces have diverged between PTR builds, which is news rather than an error.
     An item we hold under a LAIR is not drift — we have it, filed where it belongs — so it is
     reported once, as `lairListedUnderRaid`, and not a second time as a missing row. */
  const held = new Set(bosses.flatMap((boss) => (boss.items ?? []).map((item) => String(item.id))));
  for (const [id, panels] of attribution.byItem)
    if (!held.has(id) && !lairOf.has(id)) audit.guideOnly.push({ id, guide: panels.join(" / ") });
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

/* Fetch one page, trying every namespace spelling, and report WHICH one answered. A stale
   `/ptr/` link outlives the flip and a live page can appear before the config moves, so the
   run must survive both without either being silently written into the data. */
async function fetchPage(path) {
  for (const url of wowheadCandidates(path)) {
    const html = await getText(url);
    if (html) return { html, url };
  }
  return { html: null, url: null };
}

async function main() {
  const acceptLootChanges = process.env.WOW_ACCEPT_LOOT_CHANGES === "1";
  const acceptConflicts = process.env.WOW_ACCEPT_SOURCE_CONFLICTS === "1";
  assertLairSeparation();
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
    /* A baseline that has lost its lair sources is a baseline the alias arrangement could
       return through, so it is refused here rather than rebuilt from nothing. */
    const priorLairs = previous?.lairs;
    if (!Array.isArray(priorLairs) || priorLairs.length !== LAIRS.length
      || LAIRS.some((lair) => !priorLairs.some((prior) => prior.key === lair.key)))
      throw new Error(`cannot trust existing raid loot baseline: expected the declared lair `
        + `sources (${LAIRS.map((lair) => lair.key).join(", ")})`);
  }

  console.log(`Harvesting ${SEASON.instance} from Wowhead (${SEASON.patch}, `
    + `${SEASON.wowheadNamespace ? `${SEASON.wowheadNamespace} namespace` : "live"}) ...`);
  const bosses = [];
  const failed = [];

  /* ---- hop 0: the lair bosses, FIRST, because the raid sets are defined by subtraction ----
     Their ids are removed from every boss's scoped table below. Doing it in this order is what
     makes the fix survive a re-harvest: Wowhead still lists four Grotto drops inside two raid
     panels, so a run that harvested the raid first would refile them and then have to be told
     to stop. */
  const lairs = [];
  for (const l of LAIRS) {
    const { html, url } = await fetchPage(l.guidePath);
    if (!html) {
      failed.push(`${l.name}: lair guide fetch failed (${l.guide})`);
      continue;
    }
    let parsed;
    try { parsed = parseLairRewards(html, l); }
    catch (error) {
      failed.push(`${l.name}: ${error.message}`);
      continue;
    }
    const items = await fetchItems(parsed.itemIds);
    if (items.length !== parsed.itemIds.length) {
      failed.push(`${l.name}: ${parsed.itemIds.length - items.length} item tooltips failed`);
      continue;
    }
    const gear = items.filter((item) => item.slot || (item.ilvl && item.ilvl > 100));
    const schemaProblems = gear.flatMap((item) => parsedItemIssues(item)
      .map((issue) => `${item.id}=${issue}`));
    if (schemaProblems.length) {
      failed.push(`${l.name}: parser schema ${schemaProblems.join(", ")}`);
      continue;
    }
    const unexpectedSources = gear.filter((item) => item.droppedBy
      && !l.dropAliases.includes(item.droppedBy));
    if (unexpectedSources.length) {
      failed.push(`${l.name}: unexpected tooltip sources ${unexpectedSources
        .map((item) => `${item.id}=${item.droppedBy}`).join(", ")}`);
      continue;
    }
    console.log(`  lair   ${l.name.padEnd(24)} ${String(gear.length).padStart(3)} drops  `
      + `(${l.instance}, separate lockout)  ${url}`);
    lairs.push({
      kind: "lair", key: l.key, name: l.name, instance: l.instance, lockout: l.lockout,
      guide: url, dropAliases: l.dropAliases, dropLevels: parsed.dropLevels,
      listedItemIds: parsed.itemIds, patchNamed: parsed.patchNamed,
      harvest: { status: "harvested", harvestedAt: new Date().toISOString().slice(0, 10),
        listed: parsed.itemIds.length, held: gear.length },
      items: gear,
    });
  }
  const lairOwnedIds = new Map();
  for (const lair of lairs)
    for (const id of lair.listedItemIds) lairOwnedIds.set(String(id), lair);
  const lairTakenFromBosses = [];

  for (const b of BOSSES) {
    const { html } = await fetchPage(GUIDE_PATH(b.slug));
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
    /* The subtraction. Wowhead's boss table lists loot that drops elsewhere; a row claimed by
       a lair belongs to the lair, and the removal is printed so it never becomes invisible
       bookkeeping. */
    const taken = ids.filter((id) => lairOwnedIds.has(String(id)));
    for (const id of taken)
      lairTakenFromBosses.push({ boss: b.name, id, lair: lairOwnedIds.get(String(id)).name });
    ids = ids.filter((id) => !lairOwnedIds.has(String(id)));
    if (!ids.length) {
      failed.push(`${b.name}: every scoped item is claimed by a lair boss`);
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

  /* The loot-set diff covers lairs too — otherwise the ONE source whose composition this phase
     changed would be the one source that could change again unannounced. Note the first
     post-G22 run necessarily reports the four relocations on their old bosses; that is the
     reviewed change, and WOW_ACCEPT_LOOT_CHANGES=1 is how a human says so. */
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
  for (const oldLair of previous?.lairs || []) {
    const current = lairs.find((lair) => lair.key === oldLair.key);
    const before = new Set((oldLair.items || []).map((item) => String(item.id)));
    const after = new Set((current?.items || []).map((item) => String(item.id)));
    const removed = [...before].filter((id) => !after.has(id));
    const added = [...after].filter((id) => !before.has(id));
    if (!current || removed.length || added.length)
      lootChanges.push(`${oldLair.name}: removed=[${removed.join(",")}] added=[${added.join(",")}]`);
  }
  if (lootChanges.length && !acceptLootChanges) {
    throw new Error("refusing to overwrite data/raid-items.json: scoped loot set changed; audit the boss guides "
      + `and rerun with WOW_ACCEPT_LOOT_CHANGES=1 if intentional:\n  ${lootChanges.join("\n  ")}`);
  }
  if (lootChanges.length) console.warn(`  accepted reviewed raid loot changes: ${lootChanges.join("; ")}`);

  /* One owner per item across EVERY boss-drop source in this file, lairs included: the whole
     point of G22 is that a drop belongs to exactly one kill. */
  const raidOwners = new Map();
  for (const group of [...bosses, ...lairs]) {
    for (const item of group.items) {
      if (!raidOwners.has(item.id)) raidOwners.set(item.id, []);
      raidOwners.get(item.id).push(group.name);
    }
  }
  const duplicateItems = [...raidOwners.entries()].filter(([, owners]) => owners.length > 1);
  if (duplicateItems.length) {
    throw new Error(`refusing to overwrite data/raid-items.json: duplicate assignments: ${duplicateItems
      .map(([id, owners]) => `${id} (${owners.join(", ")})`).join("; ")}`);
  }

  // ---- hop 3: encounter attribution ----
  const { html: rewardsHtml, url: rewardsUrl } = await fetchPage(
    REWARDS_GUIDE.replace(/^https:\/\/www\.wowhead\.com\//, ""));
  if (!rewardsHtml)
    throw new Error(`refusing to overwrite data/raid-items.json: rewards guide unreachable (${REWARDS_GUIDE})`);
  const panels = parseRewardPanels(rewardsHtml);
  const attribution = attributionFrom(panels);
  const audit = attributeRaidItems(bosses, attribution, lairs);
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
  for (const row of lairTakenFromBosses)
    console.log(`    lair-owned  ${row.id} removed from ${row.boss}: it drops from ${row.lair}`);
  for (const row of audit.lairListedUnderRaid)
    console.log(`    lair row filed under a raid panel  ${row.id} ${row.name}: `
      + `${row.lair} (${row.instance}) listed in the "${row.raidPanel}" panel`);
  for (const row of audit.conflicts)
    console.log(`    CONFLICT  ${row.id} ${row.name} (${row.boss}): tooltip="${row.tooltip}" guide="${row.guide}"`);
  if (audit.conflicts.length && !acceptConflicts) {
    throw new Error("refusing to overwrite data/raid-items.json: the rewards guide contradicts "
      + "item tooltips; audit each pair and rerun with WOW_ACCEPT_SOURCE_CONFLICTS=1 if the "
      + `tooltip should stand:\n  ${audit.conflicts
        .map((row) => `${row.id} ${row.name}: tooltip="${row.tooltip}" guide="${row.guide}"`).join("\n  ")}`);
  }

  const all = bosses.flatMap((b) => b.items);
  const prelaunch = !!SEASON.wowheadNamespace;
  const out = {
    /* Both strings are DERIVED from the season config (Phase E): the patch, the ceiling date
       and the "is this still PTR" question each used to be typed in by hand here, which is one
       more thing the flip had to remember. */
    source: `Wowhead ${SEASON.patch}${prelaunch ? " PTR" : ""} boss-guide Gear tables `
      + "+ per-item tooltips",
    itemLevelSource: ITEM_LEVEL_SOURCE,
    harvestedAt: new Date().toISOString().slice(0, 10),
    caveat: prelaunch
      ? `Pre-launch PTR data. Stats and drop assignments may change before ${SEASON.label} `
        + `opens ${SEASON.opensAt}.`
      : `${SEASON.label} (${SEASON.patch}) live data.`,
    assignmentOverrides: ITEM_OWNER_OVERRIDES,
    instance: SEASON.instance,
    attribution: {
      source: rewardsUrl ?? REWARDS_GUIDE,
      note: "droppedBy comes from the item's own tooltip where the tooltip names a source, and "
        + "from the rewards guide's encounter panel where it does not. Every item records which, "
        + "in droppedBySource. Conflicts are listed, never resolved.",
      ...counts,
      exactAgreements: audit.exact,
      aliasAgreements: audit.aliasAgreements,
      conflicts: audit.conflicts,
      notListed: audit.notListed,
      guideOnlyRows: audit.guideOnly,
      lairListedUnderRaid: audit.lairListedUnderRaid,
      lairItemsRemovedFromBosses: lairTakenFromBosses,
      nonEncounterPanels: Object.fromEntries(
        [...attribution.nonEncounter].map(([name, ids]) => [name, ids.length])),
    },
    /* Counts describe THE RAID. A lair is a different instance on a different lockout, so
       folding its drops in here would restate the misfiling this file just removed; each lair
       carries its own counts instead. */
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
    /* Boss-drop sources that are NOT part of this raid (G22). Same item shape as a boss, its
       own `instance`/`lockout`/`dropLevels`, and `kind: "lair"` so anything grouping sources
       can tell the two apart without matching on names. */
    lairs: lairs.map((lair) => ({
      ...lair,
      counts: {
        items: lair.items.length,
        listed: lair.listedItemIds.length,
        withEffect: lair.items.filter((item) => item.effect).length,
        attributed: lair.items.filter((item) => item.droppedBy).length,
      },
    })),
  };

  await mkdir(join(ROOT, "data"), { recursive: true });
  await writeFile(DATA_PATH, JSON.stringify(out, null, 2), "utf8");
  console.log(`\nwrote data/raid-items.json`);
  console.log(`  ${out.counts.drops} drops · ${out.counts.gear} gear · ${out.counts.withEffect} with effects · ${out.counts.tokens} tier tokens · ${out.counts.typed} with an armour/weapon type · ${out.counts.attributed} attributed to an encounter`);
  for (const lair of out.lairs)
    console.log(`  lair: ${lair.name} (${lair.instance}, ${lair.lockout} lockout) · `
      + `${lair.counts.items}/${lair.counts.listed} drops held · `
      + `${lair.dropLevels.map((step) => `${step.need} ${step.ilvl}`).join(" · ")}`);
}

// Importable: the parsers are tested against recorded fixtures, so main() must not run on import.
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url)
  await main();
