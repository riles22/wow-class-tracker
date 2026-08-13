/* Icy Veins guide harvester — the human-authored pick layer for one of the three sources
   in docs/gearing-s2-scope.md (G4), feeding the consensus counts of G9/G10 and the Build
   union of G12.

     node src/harvest-guide-icyveins.mjs [--out <path>] [--specs "Fire Mage,Holy Paladin"]
                                         [--patch 12.1] [--dry-run] [--force]

   WHAT IT READS, per spec, from two formulaic URLs:
     .../<spec>-<class>-pve-<dps|healing|tank>-gear-best-in-slot
        · three BiS lists (Overall / Mythic+ / Raid), one item per slot   -> endorsement "bis"
        · the per-panel "Which Tier Set Pieces Do I Want?" bullets        -> endorsement "alternative"
        · the trinket letter-tier table (S/A/B/C/D...), stored PER SOURCE (G8)
     .../<spec>-<class>-pve-<...>-stat-priority
        · one build per stat-priority widget, scoped by whatever the widget's heading states

   WHAT IT REFUSES TO DO. Nothing here is inferred. A slot label it cannot place, a drop
   name it cannot join to our own harvested roster, a trinket row that is not tier-shaped,
   or a separator relation it has not seen before all THROW — because a silently dropped
   row is a vote that vanishes without trace, and a silently flattened relation is a
   preference we invented on the guide's behalf.

   MEASURED TRAPS (2026-08-13, live pages; do not rediscover):

   1. THE LIST LABELS. Each list is an `image_block_content` panel with id `bis_<n>_<i>`,
      carrying its own `heading_container > h3` AND a matching tab button `bis_<n>_<i>_button`.
      A naive "heading, then the next grid" walk mislabels, because the panels interleave
      with prose and FAQ blocks. This parser slices the PANEL (balanced), reads the h3 id
      inside it, and then cross-checks THREE independent signals — the h3 id, the tab-button
      label, and the grid's own resolved drop sources — refusing the page when they disagree.
      Getting this wrong silently swaps raid and M+ picks, which G10 then votes with.

   2. TWO GRIDS PER LIST. `bis_items_grid` holds the 16 armour/accessory cells and is
      immediately followed by `bis_items_grid bis_items_grid--weapons`. Reading only the
      first drops every weapon pick.

   3. EXTRA ITEM LINKS INSIDE A CELL. A `bis_item` carries the pick, then `bis_item_extras`
      (gems) and `bis_item_enchant` (enchants), each with their own `data-wowhead="item=..."`.
      The pick is the FIRST item link, the one before `span.bis_item_slot`. Taking "all item
      links in the cell" harvests gems as gear.

   4. EMPTY CELLS ARE REAL. `bis_item bis_item--empty` is a placeholder (a two-hander's off
      hand); Shirt and Tabard are permanent empties. Neither is a pick and neither is an error.

   5. THE DECOY BULLET LIST. Each panel carries a second FAQ ("Which Dungeons Should I
      Farm?" / "Which Raid-Items Do I Want Most?") whose bullets ALSO begin `<strong>Weapon</strong>:`
      / `<strong>Trinkets</strong>:` and ALSO contain item links. Parsing "every <li> that
      starts with <strong>" invents alternative votes out of prose. Alternatives are read
      only from the FAQ whose question names the tier set / catalyst.

   6. ORIGINAL-ITEM. Roughly half the picks carry `domain=ptr`, and catalysed tier pieces
      carry `original-item=<baseId>` — the pre-catalyst base. BOTH ids are preserved: the
      same physical pick appears as a tier appearance on one source and a base item on
      another, and Phase C needs to join them.

   7. LETTER TIERS ARE NOT S/A/B/C/D. Holy Paladin publishes an "F- Tier". The letter is
      read from the row, never from a fixed list.

   8. SOFT CAPS COME IN TWO IDIOMS. Outlaw Rogue writes "Critical Strike to 40%"; Discipline
      Priest writes "Haste (until 1800 rating)" — a RATING cap, a different quantity, which
      lib-guides parses separately and stamps `unit: "rating"` so the two can never be
      compared. Both are the contract's to read: a cap idiom means the same thing to all three
      harvesters, so parsing one source-side would be the drift lib-guides exists to prevent.
      The verbatim label is always stored, and any label that LOOKS capped but did not parse is
      reported in the run summary as `unparsedCaps` rather than quietly losing the cap. Both
      recorded idioms parse today, so that list is empty across the fixtures — the mechanism
      stays because it is what a THIRD wording would land in, and is covered by a synthetic
      label in guides-icyveins.test.mjs.

   PHASE B SHIPS MACHINERY, NOT A HARVEST. Every source is mid-season-transition until
   2026-08-18 and a harvest before then captures PTR-era picks (the `ptrDomainShare` in the
   summary measures exactly that). Run this locally AFTER the flip. */

import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { articlePatch } from "./lib-icy-veins.mjs";
import { getText } from "./lib-wowhead.mjs";
import { buildId, normalizeBracket, normalizeSlot, normalizeText, parseSoftCap,
  resolveDropSource, rosterFrom, slugify } from "./lib-guides.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export const SOURCE = "icyveins";
export const SOURCE_LABEL = "Icy Veins";
export const SCHEMA_VERSION = 1;
/* The patch the pages must self-identify as, read from the article heading ("… — 12.1").
   Icy Veins dates every page; this is the era gate, and it is deliberately a constant an
   operator has to change rather than something inferred from whatever the page says. */
export const EXPECTED_PATCH = "12.1";

/* The three list anchors, keyed by the h3 id Icy Veins ships. An unknown id inside a BiS
   panel is a page redesign, not a row to skip. */
const LIST_ANCHORS = new Map(Object.entries({
  "overall-best-in-slot": "overall",
  "best-mythic-gear": "mplus",
  "best-raid-gear": "raid",
}));

/* Separator relations, measured. `false` is Icy Veins' own "no modifier" class name. */
const RELATIONS = new Map(Object.entries({
  "greater-equal": ">=",
  "false|ri-arrow-drop-right-line": ">",
  "false|ri-equal-line": "=",
}));

const ROLE_SLUG = (role) => (/tank/i.test(role) ? "tank" : /heal/i.test(role) ? "healing" : "dps");
const specSlug = (spec) => slugify(spec);

export const bisUrl = ({ class: className, spec, role }) =>
  `https://www.icy-veins.com/wow/${specSlug(spec)}-${specSlug(className)}-pve-${ROLE_SLUG(role)}-gear-best-in-slot`;
export const statPriorityUrl = ({ class: className, spec, role }) =>
  `https://www.icy-veins.com/wow/${specSlug(spec)}-${specSlug(className)}-pve-${ROLE_SLUG(role)}-stat-priority`;

/* ---------------------------------------------------------------- html plumbing
   Small, deliberate, and shared by both page parsers. Icy Veins ships well-formed but
   deeply nested markup, so element extraction is a balanced-tag walk rather than a
   non-greedy regex: `<div class="stat-container">…</div>` closes on the FIRST `</div>`
   for a regex and on the RIGHT one here. */

const stripComments = (html) => html.replace(/<!--[\s\S]*?-->/g, "");

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  mdash: "—", ndash: "–", hellip: "…", rsquo: "’", lsquo: "‘" };

export const decodeEntities = (text) => String(text ?? "")
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
  .replace(/&([a-z]+);/gi, (whole, name) => ENTITIES[name.toLowerCase()] ?? whole);

/* Tag text, through the shared normalizer so Icy Veins' punctuation lands in the same
   vocabulary as Wowhead's and Method's (lib-guides.normalizeText). */
export const plainText = (html) => normalizeText(decodeEntities(String(html ?? "").replace(/<[^>]+>/g, " ")));

/* Balanced element slice starting at `at`, which must be the "<" of an opening `tag`.
   Attribute values are honoured so a ">" inside one cannot end a tag early. */
function sliceElement(html, at, tag) {
  const token = new RegExp(`<${tag}\\b(?:"[^"]*"|'[^']*'|[^>'"])*>|</${tag}\\s*>`, "gi");
  token.lastIndex = at;
  let depth = 0;
  for (let match; (match = token.exec(html));) {
    if (match[0][1] !== "/") depth++;
    else if (--depth === 0) return html.slice(at, token.lastIndex);
  }
  throw new Error(`sliceElement: unbalanced <${tag}> starting at ${at}`);
}

/* Every element whose opening tag matches `open`, sliced balanced. */
function elements(html, open, tag) {
  const out = [];
  for (const match of html.matchAll(open)) out.push({ index: match.index, attrs: match[0], html: sliceElement(html, match.index, tag) });
  return out;
}

const innerOf = (element, tag) => {
  const match = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*)</${tag}\\s*>$`, "i").exec(element);
  return match ? match[1] : "";
};

/* ---------------------------------------------------------------- page self-dating
   JSON-LD carries several graphs; only the Article one is about this page. datePublished
   is the 2012-era creation date and is useless as freshness, so it is never read. */
export function articleMeta(html) {
  for (const match of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    let node;
    try { node = JSON.parse(match[1]); } catch { continue; }
    for (const entry of Array.isArray(node) ? node : [node]) {
      if (entry?.["@type"] !== "Article") continue;
      return {
        dateModified: typeof entry.dateModified === "string" ? entry.dateModified.slice(0, 10) : null,
        author: entry.author?.name ?? null,
        headline: entry.headline ?? null,
      };
    }
  }
  return { dateModified: null, author: null, headline: null };
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/* The dated top entry of the visible changelog — the page's OWN account of when it last
   moved, which is a different claim from the JSON-LD timestamp and is worth carrying
   alongside it rather than instead of it. */
export function changelogTop(html) {
  const list = /<ul class="changelog">([\s\S]*?)<\/ul>/i.exec(html);
  if (!list) return null;
  const item = /<li>([\s\S]*?)<\/li>/i.exec(list[1]);
  if (!item) return null;
  const text = plainText(item[1]);
  const match = /^(\d{1,2})\s+([A-Za-z]{3})[a-z]*\.?\s+(\d{4}):\s*(.*)$/.exec(text);
  if (!match) return { date: null, text };
  const month = MONTHS.indexOf(match[2].toLowerCase());
  if (month < 0) return { date: null, text };
  const date = `${match[3]}-${String(month + 1).padStart(2, "0")}-${match[1].padStart(2, "0")}`;
  return { date, text: match[4].trim() };
}

/* ---------------------------------------------------------------- BiS page */

const ITEM_LINK = /data-wowhead="([^"]*item=\d+[^"]*)"/i;

function itemLinkFields(attrValue) {
  const params = new URLSearchParams(decodeEntities(attrValue));
  const id = params.get("item");
  if (!id) return null;
  return {
    itemId: id,
    originalItemId: params.get("original-item"),
    bonus: params.get("bonus"),
    ptrDomain: params.get("domain") === "ptr",
  };
}

/* One `div.bis_item` -> a pick, or null for a cell that holds no pick (an empty placeholder,
   or the permanently blank Shirt / Tabard cells that normalizeSlot drops by design). */
function parseBisItem(cell, { where }) {
  const slotMatch = /<span class="bis_item_slot">([\s\S]*?)<\/span>/i.exec(cell.html);
  if (!slotMatch) throw new Error(`icyveins BiS: a bis_item cell has no bis_item_slot (${where})`);
  const slot = normalizeSlot(slotMatch[1].replace(/<[^>]+>/g, " "), { where });
  if (slot === null) return null;                                   // Shirt / Tabard
  if (/\bbis_item--empty\b/.test(cell.attrs)) return { slot, empty: true };

  // TRAP 3: the pick is the item link BEFORE the slot span; gems and enchants follow it.
  const head = cell.html.slice(0, slotMatch.index);
  const link = ITEM_LINK.exec(head);
  if (!link) throw new Error(`icyveins BiS: no item link before the ${slot} slot label (${where})`);
  const fields = itemLinkFields(link[1]);
  if (!fields) throw new Error(`icyveins BiS: unparseable item link for ${slot} (${where})`);

  const nameMatch = /<span data-wowhead="[^"]*item=\d+[^"]*"[^>]*class="q(\d)"[^>]*>([\s\S]*?)<\/span>/i.exec(head);
  const qualityAttr = /\bbis_q(\d)\b/.exec(cell.attrs);
  const dropMatch = /<span class="bis_item_drop">([\s\S]*?)<\/span>/i.exec(cell.html);

  return {
    slot,
    ...fields,
    name: nameMatch ? plainText(nameMatch[2]) : null,
    quality: Number(nameMatch?.[1] ?? qualityAttr?.[1]) || null,
    dropRaw: dropMatch ? plainText(dropMatch[1]) || null : null,
  };
}

/* The alternatives FAQ (G9's weaker endorsement). TRAP 5: anchored on the question, never
   on "any bullet list in this panel". A bullet naming a slot but no item — Icy Veins writes
   "Shoulders - Tier Token from Lost Explorers", and on some specs "No good choices. Do not
   Catalyze." — records NOTHING rather than inventing a pick, and is counted instead. */
const ALTERNATIVE_FAQ = /tier set|catalyz/i;

/* The bullets are hand-written per guide and their shape differs by author — measured on
   three specs, three shapes:
     Retribution Paladin  <strong>Helm</strong> - <item> from Nek'zali
     Holy Paladin         <strong>Helm:</strong> <item> from Nek'zali the Soulcoiler
     Fire Mage            Head &mdash; <item>
   So the split is on the first separator sitting OUTSIDE a tag (which is why Holy Paladin's
   colon, living inside <strong>…</strong>, still counts) rather than on any one markup
   shape. A bullet with no such separator is not a slot bullet and is counted, not guessed at. */
function splitSlotBullet(body) {
  let inTag = false;
  for (let i = 0; i < body.length; i++) {
    const char = body[i];
    if (char === "<") { inTag = true; continue; }
    if (char === ">") { inTag = false; continue; }
    if (inTag) continue;
    for (const entity of ["&mdash;", "&ndash;"]) {
      if (body.startsWith(entity, i)) return [body.slice(0, i), body.slice(i + entity.length)];
    }
    if ("-–—:".includes(char)) return [body.slice(0, i), body.slice(i + 1)];
  }
  return null;
}

function parseAlternatives(panelHtml, { where }) {
  const out = [];
  let bulletsWithoutItem = 0;
  let nonSlotBullets = 0;
  let faqFound = false;

  for (const details of elements(panelHtml, /<details\b[^>]*>/gi, "details")) {
    const question = /<span class="faq-block__question">([\s\S]*?)<\/span>/i.exec(details.html);
    if (!question || !ALTERNATIVE_FAQ.test(plainText(question[1]))) continue;
    faqFound = true;
    for (const list of elements(details.html, /<ul\b[^>]*>/gi, "ul")) {
      for (const item of elements(list.html, /<li\b[^>]*>/gi, "li")) {
        const body = innerOf(item.html, "li");
        const bullet = splitSlotBullet(body);
        const label = bullet ? plainText(bullet[0]) : "";
        if (!bullet || !label || label.length > 24) { nonSlotBullets++; continue; }
        const slot = normalizeSlot(label, { where: `${where} alternatives` });
        if (slot === null) continue;
        const link = ITEM_LINK.exec(bullet[1]);
        if (!link) { bulletsWithoutItem++; continue; }
        const fields = itemLinkFields(link[1]);
        if (!fields) { bulletsWithoutItem++; continue; }
        const nameMatch = /<span data-wowhead="[^"]*item=\d+[^"]*"[^>]*class="q(\d)"[^>]*>([\s\S]*?)<\/span>/i.exec(bullet[1]);
        const from = /\bfrom\s+([^<]+?)\s*$/i.exec(plainText(bullet[1]));
        out.push({
          slot,
          ...fields,
          name: nameMatch ? plainText(nameMatch[2]) : null,
          quality: Number(nameMatch?.[1]) || null,
          dropRaw: from ? normalizeText(from[1]) : null,
        });
      }
    }
  }
  return { alternatives: out, bulletsWithoutItem, nonSlotBullets, faqFound };
}

/* The per-source letter tiers (G8). Stored as letters, never mapped onto a shared axis —
   a trinket shows "Icy Veins: S · Wowhead: A" and the reader judges. */
const TIER_ROW = /^((?:S|[A-F])[+-]?)\s*Tier$/i;

export function parseTrinketTiers(html, { where }) {
  const rows = [];
  for (const table of elements(html, /<table\b[^>]*>/gi, "table")) {
    let headers = null;
    const trs = elements(table.html, /<tr\b[^>]*>/gi, "tr");
    const headerRow = trs.find((tr) => /<th\b/i.test(tr.html));
    if (headerRow) {
      headers = elements(headerRow.html, /<th\b[^>]*>/gi, "th").map((th) => plainText(innerOf(th.html, "th")));
      // Only the ranking table is ours. Anything else on the page is left alone.
      if (!/ranking/i.test(headers[0] ?? "") || !headers.slice(1).some((h) => /trinket/i.test(h))) continue;
    } else continue;

    for (const tr of trs) {
      const cells = elements(tr.html, /<td\b[^>]*>/gi, "td");
      if (!cells.length) continue;
      const label = plainText(innerOf(cells[0].html, "td"));
      if (!label) throw new Error(`icyveins trinkets: a ranking row has no label (${where})`);
      /* Not every row is a letter. Protection Paladin's table ends with a "Defensive
         Trinkets" row — a published GROUPING alongside the letters, not a rank within them.
         It is recorded as a group with a null tier rather than being given a letter it does
         not have, and rather than being dropped: G8 keeps letters per-source and unmerged,
         and inventing a letter here would be the same violation from the other direction. */
      const tier = TIER_ROW.exec(label);
      for (let column = 1; column < cells.length; column++) {
        const columnLabel = headers?.[column] && !/^trinkets?$/i.test(headers[column]) ? headers[column] : null;
        for (const item of elements(cells[column].html, /<li\b[^>]*>/gi, "li")) {
          const body = innerOf(item.html, "li");
          // The first link is the ranked trinket; an expandable <details> may name others.
          const link = ITEM_LINK.exec(body);
          if (!link) continue;
          const fields = itemLinkFields(link[1]);
          if (!fields) continue;
          const nameMatch = /<span data-wowhead="[^"]*item=\d+[^"]*"[^>]*class="q(\d)"[^>]*>([\s\S]*?)<\/span>/i.exec(body);
          rows.push({
            tier: tier ? tier[1].toUpperCase() : null,
            group: tier ? null : label,
            column: columnLabel,
            order: rows.length,
            ...fields,
            name: nameMatch ? plainText(nameMatch[2]) : null,
          });
        }
      }
    }
  }
  return rows;
}

/* TRAP 1's third signal. A total raid/M+ swap shows up as a list whose resolved drops are
   mostly from the other bracket; a raid list legitimately holding a few dungeon items does
   not. Only rows that resolved to a boss or a dungeon are counted — crafted and catalyst
   rows say nothing about the bracket. */
function bracketEvidence(picks) {
  let raid = 0, mplus = 0;
  for (const pick of picks) {
    if (pick.drop?.kind === "raid") raid++;
    else if (pick.drop?.kind === "mplus") mplus++;
  }
  return { raid, mplus };
}

export function parseBisPage(html, { where = "", roster = null } = {}) {
  const source = stripComments(html);
  const meta = articleMeta(source);
  const patch = articlePatch(source);
  const changelog = changelogTop(source);

  const tabs = new Map();
  for (const tab of source.matchAll(/<span id="(bis_\d+_\d+)_button">([\s\S]*?)<\/span>/gi)) {
    tabs.set(tab[1], plainText(tab[2]));
  }

  const lists = [];
  const picks = [];
  const alternatives = [];
  const diagnostics = { emptyCells: 0, picksWithoutDrop: 0, alternativeBulletsWithoutItem: 0,
    alternativeNonSlotBullets: 0, alternativesWithUnresolvedDrop: 0, panelsWithoutAlternativeFaq: 0 };

  const panels = elements(source, /<div class="image_block_content"[^>]*id="bis_\d+_\d+"[^>]*>/gi, "div");
  if (!panels.length) throw new Error(`icyveins BiS: no bis_* list panels found (${where})`);

  for (const panel of panels) {
    const panelId = /id="(bis_\d+_\d+)"/i.exec(panel.attrs)[1];
    const anchors = [...panel.html.matchAll(/<h3[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h3>/gi)]
      .filter((match) => LIST_ANCHORS.has(match[1]));
    if (anchors.length !== 1) {
      throw new Error(`icyveins BiS: panel ${panelId} carries ${anchors.length} known list headings, expected 1 `
        + `(${where}) — anchor on the h3 id, the page shape has changed`);
    }
    const [, anchorId, anchorText] = anchors[0];
    const bracket = LIST_ANCHORS.get(anchorId);

    // Two independent cross-checks on the label before any pick is attributed to a bracket.
    const headingBracket = normalizeBracket(plainText(anchorText));
    if (headingBracket !== bracket) {
      throw new Error(`icyveins BiS: heading "${plainText(anchorText)}" reads as ${headingBracket} `
        + `but its id ${anchorId} means ${bracket} (${where})`);
    }
    const tabLabel = tabs.get(panelId);
    if (tabLabel && normalizeBracket(tabLabel) !== bracket) {
      throw new Error(`icyveins BiS: tab "${tabLabel}" and heading ${anchorId} disagree on panel ${panelId}'s `
        + `bracket (${where}) — the lists are mislabelled and G10 would vote with the wrong one`);
    }

    const listPicks = [];
    // TRAP 2: armour grid AND weapons grid.
    for (const grid of elements(panel.html, /<div class="bis_items_grid[^"]*"[^>]*>/gi, "div")) {
      for (const cell of elements(grid.html, /<div class="bis_item(?:[ "][^>]*)?>/gi, "div")) {
        const parsed = parseBisItem(cell, { where: `${where} ${anchorId}` });
        if (!parsed) continue;
        if (parsed.empty) { diagnostics.emptyCells++; continue; }
        if (!parsed.dropRaw) diagnostics.picksWithoutDrop++;
        const drop = parsed.dropRaw && roster
          ? resolveDropSource(parsed.dropRaw, roster, { where: `${where} ${anchorId} ${parsed.slot}` })
          : null;
        listPicks.push({ list: anchorId, bracket, endorsement: "bis", ...parsed, drop });
      }
    }
    if (!listPicks.length) throw new Error(`icyveins BiS: list ${anchorId} yielded no picks (${where})`);

    const faq = parseAlternatives(panel.html, { where: `${where} ${anchorId}` });
    diagnostics.alternativeBulletsWithoutItem += faq.bulletsWithoutItem;
    diagnostics.alternativeNonSlotBullets += faq.nonSlotBullets;
    if (!faq.faqFound) diagnostics.panelsWithoutAlternativeFaq++;
    for (const alternative of faq.alternatives) {
      /* Soft, unlike a pick's drop: this one is scraped out of free prose ("… from Nek'zali"),
         so a phrase that is not a boss name is a prose quirk rather than a broken join. It is
         counted so the run can still see it. The ITEM is the vote; the drop is context. */
      const drop = alternative.dropRaw && roster
        ? resolveDropSource(alternative.dropRaw, roster, { soft: true })
        : null;
      if (alternative.dropRaw && roster && !drop) diagnostics.alternativesWithUnresolvedDrop++;
      alternatives.push({ list: anchorId, bracket, endorsement: "alternative", ...alternative, drop });
    }

    picks.push(...listPicks);
    lists.push({ id: anchorId, panel: panelId, bracket, label: plainText(anchorText),
      tab: tabLabel ?? null, picks: listPicks.length,
      alternatives: faq.alternatives.length, evidence: bracketEvidence(listPicks) });
  }

  const seen = new Set();
  for (const list of lists) {
    if (seen.has(list.bracket)) throw new Error(`icyveins BiS: two panels both claim the ${list.bracket} list (${where})`);
    seen.add(list.bracket);
    // TRAP 1, third signal: a swap shows up as a list dominated by the other bracket's drops.
    const { raid, mplus } = list.evidence;
    const wrong = list.bracket === "raid" ? mplus : list.bracket === "mplus" ? raid : 0;
    const right = list.bracket === "raid" ? raid : list.bracket === "mplus" ? mplus : 0;
    if (raid + mplus >= 4 && wrong > right) {
      throw new Error(`icyveins BiS: the ${list.bracket} list resolves ${wrong} drops to the other bracket `
        + `against ${right} of its own (${where}) — the lists are off by one, do not publish this`);
    }
  }

  return {
    patch,
    published: meta.dateModified,
    author: meta.author,
    headline: meta.headline,
    changelog,
    lists,
    picks,
    alternatives,
    trinketTiers: parseTrinketTiers(source, { where }),
    diagnostics,
  };
}

/* ---------------------------------------------------------------- stat-priority page
   G12: every published variant is its own build, labelled by who published it and by what
   the page ACTUALLY states. A heading naming a hero talent gets a heroTalent and a null
   bracket; a heading naming a bracket gets the reverse. Neither is ever inferred from the
   other, because Icy Veins scopes some specs by hero talent and some by bracket and the
   two are not interchangeable. */

const STAT_KEYS = new Set(["ilevel", "strength", "agility", "intellect", "stamina",
  "crit", "haste", "mastery", "versatility", "leech", "speed", "avoidance"]);
/* Icy Veins marks a hero-talent heading with its own id shape: wow<slug>ht-stat-priority. */
const HERO_TALENT_ID = /^wow.*ht-stat-priority$/i;
const STATES_BRACKET = /\braid|mythic\s*\+|\bm\+|dungeon|overall\b/i;
const STATES_PROFILE = /single[- ]target|\bst\b|\baoe\b|cleave|multi[- ]?target|priority target/i;

function relationOf(separatorHtml, { where }) {
  const modifier = /<div class="separator-icon ([^"]*)">/i.exec(separatorHtml)?.[1]?.trim() ?? "";
  const icons = [...separatorHtml.matchAll(/<i class="([^"]+)"/gi)].map((match) => match[1].trim());
  const key = RELATIONS.has(modifier) ? modifier : `${modifier}|${icons[0] ?? ""}`;
  const relation = RELATIONS.get(key);
  if (!relation) {
    throw new Error(`icyveins stat priority: unknown separator "${key}" (${where}) — a new relation is `
      + "information the guide published; add it rather than flattening it to \">\"");
  }
  return relation;
}

export function parseStatPriorityPage(html, { specName = "", where = "" } = {}) {
  const source = stripComments(html);
  const meta = articleMeta(source);
  const patch = articlePatch(source);
  const changelog = changelogTop(source);

  const headings = [...source.matchAll(/<h([234])[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/gi)]
    .map((match) => ({ index: match.index, id: match[2], text: plainText(match[3]) }));

  const builds = [];
  const unparsedCaps = [];
  const widgets = elements(source, /<div class="stat-priority-widget">/gi, "div");
  for (const [ordinal, widget] of widgets.entries()) {
    const heading = [...headings].reverse().find((candidate) => candidate.index < widget.index);
    if (!heading) throw new Error(`icyveins stat priority: a widget has no heading above it (${where})`);

    /* The paragraph immediately above the widget, VERBATIM. Two tank specs (Protection
       Paladin, Brewmaster Monk) publish two priorities under one heading and distinguish
       them only in prose — "…gearing defensively…" against "…trying to push damage…".
       That prose is recorded as a note, never parsed into a scope: heroTalent / bracket /
       fightProfile stay null because the page never states one, and reading "defensive"
       out of a sentence would be inventing a fourth scoping axis on Icy Veins' behalf.
       Dropping the second widget instead would lose a published variant, which G12 forbids. */
    const gapStart = ordinal > 0 ? widgets[ordinal - 1].index + widgets[ordinal - 1].html.length : heading.index;
    const paragraphs = [...source.slice(gapStart, widget.index).matchAll(/<p>([\s\S]*?)<\/p>/gi)];
    const noteText = paragraphs.length ? plainText(paragraphs[paragraphs.length - 1][1]) : "";
    const note = noteText && noteText.length <= 400 ? noteText : null;

    const events = [];
    for (const match of widget.html.matchAll(/<div class="stat-container ([^"]*)">/gi)) events.push({ i: match.index, kind: "stat", value: match[1].trim() });
    for (const match of widget.html.matchAll(/<div class="stat-name">([\s\S]*?)<\/div>/gi)) events.push({ i: match.index, kind: "name", value: plainText(match[1]) });
    for (const match of widget.html.matchAll(/<div class="stat-separator">/gi)) {
      events.push({ i: match.index, kind: "separator", value: sliceElement(widget.html, match.index, "div") });
    }
    events.sort((a, b) => a.i - b.i);

    const stats = [];
    for (const event of events) {
      if (event.kind === "stat") {
        if (!STAT_KEYS.has(event.value)) {
          throw new Error(`icyveins stat priority: unknown stat key "${event.value}" (${where}) — `
            + "the widget vocabulary changed; add the key rather than dropping the stat");
        }
        stats.push({ key: event.value, label: null, softCap: null, relationToNext: null });
      } else if (event.kind === "name") {
        const current = stats[stats.length - 1];
        if (!current) throw new Error(`icyveins stat priority: a stat name precedes its container (${where})`);
        current.label = event.value;
        current.softCap = parseSoftCap(event.value);
        // TRAP 8: a label that reads capped but did not parse is reported, never dropped.
        if (!current.softCap && /\b(to|until|cap|capped)\b/i.test(event.value)) unparsedCaps.push(event.value);
      } else {
        const current = stats[stats.length - 1];
        if (!current) throw new Error(`icyveins stat priority: a separator precedes the first stat (${where})`);
        current.relationToNext = relationOf(event.value, { where });
      }
    }
    if (stats.length < 2) throw new Error(`icyveins stat priority: widget under "${heading.text}" yielded ${stats.length} stats (${where})`);
    if (stats.some((stat) => !stat.label)) throw new Error(`icyveins stat priority: a stat container has no name (${where})`);
    stats[stats.length - 1].relationToNext = null;

    /* The unscoped case: the only heading above the widget is the page's own "<Spec> Stat
       Priority" h2. Recognised by comparing against the spec name the caller passed, which
       is the roster's, not something read back off the page. */
    const scope = normalizeText(heading.text.replace(/\bstat priority\b/i, "")).replace(/\s+/g, " ").trim();
    const unscoped = !specName || normalizeText(scope).toLowerCase() === normalizeText(specName).toLowerCase();
    const heroTalent = !unscoped && HERO_TALENT_ID.test(heading.id) ? scope : null;
    const bracket = !unscoped && STATES_BRACKET.test(scope) ? normalizeBracket(scope) : null;
    const fightProfile = !unscoped && STATES_PROFILE.test(scope) ? scope : null;
    const label = unscoped ? null : scope;

    /* Two widgets under one heading collide on the heading-derived id, so the id carries a
       positional suffix. `scopeSource` says which it was, because "the page labelled this"
       and "we numbered these in document order" are different claims and Phase C's Build
       selector should not present them identically. */
    const base = buildId(SOURCE, label ?? "");
    const collisions = builds.filter((build) => build.base === base).length;
    builds.push({
      id: collisions ? `${base}-${collisions + 1}` : base,
      base,
      label, heading: heading.id, note,
      scopeSource: label ? "heading" : "position",
      heroTalent, bracket, fightProfile, stats,
    });
  }

  if (!builds.length) throw new Error(`icyveins stat priority: no stat-priority widget found (${where})`);
  for (const build of builds) delete build.base;
  const ids = new Set(builds.map((build) => build.id));
  if (ids.size !== builds.length) throw new Error(`icyveins stat priority: duplicate build ids (${where})`);
  const unlabelled = builds.filter((build) => build.scopeSource === "position").length;

  return { patch, published: meta.dateModified, author: meta.author, changelog, builds,
    unparsedCaps, unlabelledBuilds: builds.length > 1 ? unlabelled : 0 };
}

/* ---------------------------------------------------------------- harvest (CLI) */

async function loadRoster() {
  const [raid, dungeons] = await Promise.all([
    readFile(join(ROOT, "data", "raid-items.json"), "utf8").then(JSON.parse),
    readFile(join(ROOT, "data", "dungeon-items.json"), "utf8").then(JSON.parse),
  ]);
  return rosterFrom(raid, dungeons);
}

function parseArgs(argv) {
  const args = { out: join(ROOT, "data", "guide-picks-icyveins.json"), specs: null,
    patch: EXPECTED_PATCH, dryRun: false, force: false };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (flag === "--out") args.out = resolve(argv[++i]);
    else if (flag === "--specs") args.specs = argv[++i].split(",").map((name) => name.trim()).filter(Boolean);
    else if (flag === "--patch") args.patch = argv[++i];
    else if (flag === "--dry-run") args.dryRun = true;
    else if (flag === "--force") args.force = true;
    else throw new Error(`unknown argument ${flag}`);
  }
  return args;
}

async function main(argv) {
  const args = parseArgs(argv);
  const roster = await loadRoster();
  const specsDoc = JSON.parse(await readFile(join(ROOT, "data", "specs.json"), "utf8"));
  const roster40 = specsDoc.specs.filter((spec) =>
    !args.specs || args.specs.includes(`${spec.spec} ${spec.class}`) || args.specs.includes(spec.spec));
  if (!roster40.length) throw new Error("no specs selected");

  const out = [];
  const failed = [];
  const warnings = [];
  let ptrLinks = 0, allLinks = 0;

  for (const spec of roster40) {
    const key = `${spec.spec} ${spec.class}`;
    const urls = { bis: bisUrl(spec), statPriority: statPriorityUrl(spec) };
    const [bisHtml, statHtml] = await Promise.all([getText(urls.bis), getText(urls.statPriority)]);

    let bis = null, statPriority = null;
    try {
      if (!bisHtml) throw new Error("fetch failed");
      bis = parseBisPage(bisHtml, { where: `${key} BiS`, roster });
      if (bis.patch !== args.patch) throw new Error(`page self-identifies as patch ${bis.patch ?? "none"}, expected ${args.patch}`);
    } catch (error) { failed.push(`${key} BiS: ${error.message}`); }

    try {
      if (!statHtml) throw new Error("fetch failed");
      statPriority = parseStatPriorityPage(statHtml, { specName: `${spec.spec} ${spec.class}`, where: `${key} stats` });
      if (statPriority.patch !== args.patch) throw new Error(`page self-identifies as patch ${statPriority.patch ?? "none"}, expected ${args.patch}`);
      if (statPriority.unparsedCaps.length) warnings.push(`${key}: soft cap not parsed — ${statPriority.unparsedCaps.join(" · ")}`);
      if (statPriority.unlabelledBuilds) {
        warnings.push(`${key}: ${statPriority.unlabelledBuilds} of ${statPriority.builds.length} builds carry no `
          + "stated scope (the page distinguishes them in prose only) — their notes are recorded verbatim");
      }
    } catch (error) { failed.push(`${key} stat priority: ${error.message}`); }

    for (const pick of bis?.picks ?? []) { allLinks++; if (pick.ptrDomain) ptrLinks++; }
    out.push({ class: spec.class, spec: spec.spec, role: spec.role, urls, bis, statPriority });
    process.stdout.write(bis && statPriority ? "." : "x");
  }
  console.log("");

  const doc = {
    source: SOURCE,
    sourceLabel: SOURCE_LABEL,
    schemaVersion: SCHEMA_VERSION,
    harvestedAt: new Date().toISOString().slice(0, 10),
    expectedPatch: args.patch,
    // Pre-launch signal: while Season 2 is on the PTR roughly half of Icy Veins' picks link
    // the ptr domain. A post-flip harvest should see this fall towards zero.
    ptrDomainShare: allLinks ? Number((ptrLinks / allLinks).toFixed(3)) : null,
    counts: {
      specs: out.length,
      withBis: out.filter((entry) => entry.bis).length,
      withStatPriority: out.filter((entry) => entry.statPriority).length,
      picks: out.reduce((sum, entry) => sum + (entry.bis?.picks.length ?? 0), 0),
      alternatives: out.reduce((sum, entry) => sum + (entry.bis?.alternatives.length ?? 0), 0),
      trinketTiers: out.reduce((sum, entry) => sum + (entry.bis?.trinketTiers.length ?? 0), 0),
      builds: out.reduce((sum, entry) => sum + (entry.statPriority?.builds.length ?? 0), 0),
    },
    specs: out,
  };

  console.log(`\n${SOURCE_LABEL}: ${doc.counts.withBis}/${doc.counts.specs} BiS pages · `
    + `${doc.counts.withStatPriority}/${doc.counts.specs} stat priorities`);
  console.log(`  ${doc.counts.picks} picks · ${doc.counts.alternatives} alternatives · `
    + `${doc.counts.trinketTiers} trinket tier rows · ${doc.counts.builds} builds`);
  console.log(`  ptr-domain links: ${(doc.ptrDomainShare ?? 0) * 100}% (a pre-launch harvest reads high)`);
  for (const warning of warnings) console.log(`  ! ${warning}`);

  if (failed.length && !args.force) {
    throw new Error(`refusing to write ${args.out}:\n  ${failed.join("\n  ")}`);
  }
  for (const failure of failed) console.log(`  x ${failure}`);

  // Refuse to overwrite a healthy harvest with a much thinner one unless told to.
  let previous = null;
  try { previous = JSON.parse(await readFile(args.out, "utf8")); } catch { /* first run */ }
  if (previous && !args.force) {
    const before = previous.counts?.picks ?? 0;
    if (before && doc.counts.picks < before * 0.9) {
      throw new Error(`refusing to overwrite ${args.out}: picks fell ${before} -> ${doc.counts.picks} `
        + "(>10%). Audit the source, then re-run with --force if the drop is real.");
    }
  }

  if (args.dryRun) { console.log("  (dry run — nothing written)"); return; }
  await writeFile(args.out, `${JSON.stringify(doc, null, 2)}\n`, "utf8");
  console.log(`  wrote ${args.out}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main(process.argv.slice(2));
}
