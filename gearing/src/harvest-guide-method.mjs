/* Harvest Method's per-spec gearing guides into the Phase-B guide layer.
   docs/gearing-s2-scope.md, decisions G4 / G9-G12.

     node src/harvest-guide-method.mjs                 # all 40 specs -> data/guide-method.json
     node src/harvest-guide-method.mjs holy-paladin    # one or more slugs, for triage

   PHASE B SHIPS MACHINERY, NOT A HARVEST. The CLI below works, but its output is
   deliberately NOT committed: every source is mid-season-transition until 08-18 and a
   harvest now captures PTR-era picks. The parser is exercised against recorded fixtures
   in test/fixtures/method-*-gearing.html instead.

   WHAT METHOD PUBLISHES (measured live 2026-08-13 across all 40 spec pages; the numbers
   below are from that sweep and are what the guards are calibrated against):

     · Plain https GET works — no r.jina.ai needed, unlike Wowhead. UTF-8 throughout.
     · Every spec page is https://www.method.gg/guides/<spec>-<class>/gearing, where the
       slug is the tracker's own spec/class names lowercased and hyphenated. All 40
       resolve; the slug is DERIVED from the roster, never hand-listed.
     · Best-in-slot lives in `Slot | Item | Source` tables: 33 specs publish three
       (Overall / Raid / Mythic+), 6 publish one, and 1 (Mistweaver) publishes only a raid
       list. 1684 rows in total.

   SIX MEASURED TRAPS, each with the guard that answers it. None of these may be relaxed
   to make a test pass — every one of them silently loses or corrupts votes.

   1. HEADER ROWS ARE `<td><b>` ON MOST SPECS AND `<th>` ON SOME. Guardian Druid and
      Vengeance DH use `<th>`. A parser keying on `<td>` alone sees ZERO best-in-slot
      tables for those two and drops 93 rows without a word — the "vote that vanishes"
      failure the shared contract exists to prevent. Header cells are read as `<td>|<th>`.

   2. `original-item=` IN THE QUERY STRING IS NOT A SECOND ITEM. A bare /item=(\d+)/ regex
      matches the `?bonus=...&original-item=251126` tail on 18 catalyst rows and invents a
      phantom pick — pointing at the catalyst's SOURCE item, i.e. the wrong item entirely.
      ITEM_LINK is anchored on `wowhead.com/` so a query parameter cannot satisfy it.
      `original-item` is real information, so it is captured deliberately instead.

   3. TYPOGRAPHIC APOSTROPHES ARRIVE AS HTML ENTITIES, NOT AS CHARACTERS. The scope
      records that Method writes `Nek’zali` where Wowhead writes `Nek'zali`; measured, the
      bytes are `Nek&rsquo;zali`. So the trap is two-layered, and normalizeText alone does
      NOT fix it — it never sees an apostrophe to fold. Undecoded, matchKey reduces
      "King&rsquo;s Rest" to "kingrsquos rest" and every Method boss join fails. Entities
      are decoded FIRST, then normalizeText folds the apostrophe.

   4. FOUR WOWHEAD NAMESPACES, NOT ONE. Links appear under `ptr/` (1512), no namespace
      (154), `beta/` (29) and `ptr-2/` (7). The namespace segment is optional and
      unconstrained in ITEM_LINK, and recorded so a reader can see which realm a pick came
      from.

   5. THE SAME SPEC CAN PUBLISH TWO LISTS AT ONE BRACKET. Blood DK ships "Overall Best
      Gear for Deathbringer" and "Overall Best Gear for San'layn" — a hero-talent axis,
      which is exactly G12's Build. Keying a list by bracket alone silently keeps whichever
      table parsed last. Lists are keyed by (bracket, variant), where the variant is the
      heading's own trailing subject and is only claimed when the bracket actually repeats;
      an indistinguishable repeat is a hard error rather than a guess.

   6. NOT EVERY ROW IS A PICK. Feral Druid publishes four rows reading `Any 334` with no
      link at all. Those are placeholders, not endorsements, and are recorded as skipped
      rather than counted or invented into an item.

   ON DATES — THIS CONTRADICTS DECISION G11, AND THE PAGE IS THE AUTHORITY.
   G11 records that "Method publishes no update date anywhere on its gearing pages
   (verified live 2026-08-12)" and requires the record carry `selfDated: false`. Measured
   2026-08-13, that is not true of the pages as they stand: all 40 carry
   `<span class="guide-update-date"><strong>Last Updated: </strong>11th Aug, 2026</span>`
   next to a `<span class="guide-author">Patch 12.1</span>`, the dates differ per spec
   (9th-13th Aug 2026), and they track edits. There is no JSON-LD `dateModified`, which is
   the likely origin of the earlier reading.
   So this harvester reads the real date and sets `selfDated: true`. It still models the
   G11 path honestly rather than assuming: a page with no date yields `published: null`
   and `selfDated: false`, and the FETCH DATE IS NEVER SUBSTITUTED FOR IT. Recording when
   we fetched is honest; recording that as when they published is not.

   ON DROP SOURCES — WHY THEY RESOLVE SOFT WHILE SLOTS RESOLVE HARD.
   The vote is keyed by ITEM ID, and an item's bracket comes from our own harvested data
   (bracketOfItem), never from Method's prose. So the Source column is corroboration and
   provenance, not the join key: an unresolvable boss name must not delete a pick that is
   otherwise perfectly well identified. It is resolved with { soft: true }, the raw text is
   always kept, and every miss is collected and REFUSES THE WRITE unless a reviewer passes
   METHOD_ACCEPT_PARTIAL=1 — the same "refuse to overwrite on unexplained change" contract
   harvest-dungeons.mjs uses for loot drift. The slot column has no such fallback (nothing
   else in the row tells you where the item goes), so normalizeSlot is allowed to throw.
   Measured, this matters: 47 distinct source labels do not resolve, including Method's own
   typos ("The Colled Altar", "Den of Narolakk", "Szorak", "Ula tek") and, on four specs,
   whole Season-1 dungeons (Skyreach, Pit of Saron, Magisters' Terrace). That last group is
   why `rosterMatchRate` is reported per spec: the page's self-declared "Patch 12.1" label
   says what Method believes it updated, while the share of drop sources that resolve
   against OUR Season-2 roster says what the page actually still describes. They disagree,
   and only the second one is evidence. */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildId, normalizeBracket, normalizeSlot, normalizeText,
  resolveDropSource, rosterFrom } from "./lib-guides.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_PATH = join(ROOT, "data", "guide-method.json");
export const SOURCE_ID = "method";
export const SOURCE_LABEL = "Method";

/* Trap 4: the namespace segment is optional and open. Anchoring on the host is also what
   keeps `original-item=` out (trap 2) — a query parameter has no `wowhead.com/` before it. */
const ITEM_LINK = /wowhead\.com\/(?:([a-z0-9-]+)\/)?item=(\d+)/gi;
const UA = { "user-agent": "Mozilla/5.0 (wow-s2-gearing harvester)" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- text ---------- */

const NAMED = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“",
  ndash: "–", mdash: "—", hellip: "…", times: "×", deg: "°",
};

/* Trap 3. Runs BEFORE normalizeText, which is what actually folds the apostrophe. */
export function decodeEntities(value) {
  return String(value ?? "").replace(/&(#x?[0-9a-f]+|[a-z][a-z0-9]*);/gi, (whole, body) => {
    if (body[0] === "#") {
      const code = body[1] === "x" || body[1] === "X"
        ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return Number.isFinite(code) && code > 0 ? String.fromCodePoint(code) : whole;
    }
    const named = NAMED[body.toLowerCase()];
    return named === undefined ? whole : named;
  });
}

const stripTags = (html) => String(html ?? "").replace(/<[^>]*>/g, " ");
export const cellText = (html) => normalizeText(decodeEntities(stripTags(html)));

/* Comments are removed before anything is located, because markup inside one is not markup.
   A commented-out `<table` opens a non-greedy table match that runs to the first real
   `</table>` and eats the whole first best-in-slot list — silently, with the remaining
   tables still parsing fine, so the damage looks like a page that simply has one list
   fewer. Whitespace of equal length replaces the comment so every index stays truthful. */
export const stripComments = (html) =>
  String(html ?? "").replace(/<!--[\s\S]*?-->/g, (m) => " ".repeat(m.length));

/* ---------- dates ---------- */

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/* "11th Aug, 2026" -> "2026-08-11". Returns null for text we cannot read rather than a
   guess, and the caller records that as an undated page (never as the fetch date). */
export function parsePublishedDate(text) {
  const value = normalizeText(decodeEntities(text)).replace(/^Last Updated:\s*/i, "");
  const match = value.match(/(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)\.?,?\s+(\d{4})/);
  if (!match) return null;
  const month = MONTHS.indexOf(match[2].slice(0, 3).toLowerCase());
  const day = Number(match[1]);
  const year = Number(match[3]);
  if (month < 0 || !(day >= 1 && day <= 31) || !(year >= 2000 && year <= 2100)) return null;
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/* The masthead carries both the date and the patch label the page claims for itself. */
export function pageMeta(html) {
  const dateNode = /class="guide-update-date"[^>]*>([\s\S]*?)<\/span>/i.exec(html);
  const patchNode = /class="guide-author"[^>]*>([\s\S]*?)<\/span>/i.exec(html);
  const publishedText = dateNode
    ? normalizeText(decodeEntities(stripTags(dateNode[1])).replace(/Last Updated:/i, "")) : null;
  const published = publishedText ? parsePublishedDate(publishedText) : null;
  return {
    published,
    publishedText: publishedText || null,
    selfDated: Boolean(published),
    patchLabel: patchNode ? cellText(patchNode[1]) : null,
  };
}

/* ---------- tables ---------- */

const rowCells = (rowHtml) => [...rowHtml.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((m) => m[1]);

/* Trap 1: `<td><b>Slot</b></td>` and `<th>Slot</th>` are the same header. */
const isBisHeader = (cells) =>
  cells.length >= 3 && cells.slice(0, 3).map((c) => cellText(c).toLowerCase()).join("|") === "slot|item|source";

function headingsOf(html) {
  return [...html.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi)]
    .map((m) => ({ at: m.index, level: Number(m[1]), text: cellText(m[2]) }));
}

const headingBefore = (headings, at) =>
  [...headings].reverse().find((h) => h.at < at) ?? null;

/* Trap 5. The distinguishing tail of a list heading: "Overall Best Gear for Deathbringer"
   -> "Deathbringer". Returns null when the heading names no subject. Whether that subject
   is a BUILD is decided later, by whether the bracket actually repeats — we never guess
   that "BM Hunter" is a spec name and "San'layn" is a hero talent. */
export function headingSubject(heading) {
  const text = normalizeText(heading);
  const match = /\bfor\s+(.+)$/i.exec(text);
  return match ? match[1].trim() : null;
}

/* ---------- item cells ---------- */

export function itemLinksIn(html) {
  ITEM_LINK.lastIndex = 0;
  const out = [];
  for (let m; (m = ITEM_LINK.exec(String(html ?? "")));) {
    out.push({ namespace: m[1] ? m[1].toLowerCase() : null, itemId: m[2], at: m.index });
  }
  return out;
}

const anchorTexts = (html) =>
  [...String(html ?? "").matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)].map((m) => cellText(m[1]));

const queryValue = (html, key) => {
  const m = new RegExp(`[?&]${key}=([^"'&\\s>]+)`, "i").exec(String(html ?? ""));
  return m ? m[1] : null;
};

/* Method annotates the item cell — "(Tier Set)", "(TIER)", "(Venomcursed)", "(Haste/Mastery)" —
   and the source cell — "(Catalyst)", "(Tier Token)". Both are RECORDED verbatim; neither is
   interpreted beyond two flags whose vocabulary is unambiguous. */
const parentheticals = (text) => [...String(text ?? "").matchAll(/\(([^)]*)\)/g)]
  .map((m) => normalizeText(m[1])).filter(Boolean);

/* Method's own slot-label punctuation, cleaned lexically before the shared normalizer sees
   it. This is fetch-side hygiene, NOT a second slot vocabulary: "Trinket #1" is the
   contract's "trinket 1", and "Main Hand (2H)" is Main Hand plus a qualifier worth keeping.
   A bare "Weapon" is deliberately left alone — resolving it needs to know the item, which
   is a semantic guess, so normalizeSlot is allowed to throw on it. */
export function splitSlotLabel(raw) {
  const text = normalizeText(decodeEntities(raw));
  const qualifier = /\(([^)]*)\)\s*$/.exec(text);
  const base = text.replace(/\([^)]*\)\s*$/, "").replace(/#\s*(\d)/g, "$1").trim();
  return { base, qualifier: qualifier ? normalizeText(qualifier[1]) : null, text };
}

/* ---------- trinkets / embellishments ---------- */

const SECTION = /<div[^>]*class="guide-section-title"[^>]*id="([^"]+)"[^>]*>/gi;

function sectionSlice(html, id) {
  SECTION.lastIndex = 0;
  const marks = [];
  for (let m; (m = SECTION.exec(html));) marks.push({ id: m[1], at: m.index });
  const index = marks.findIndex((mark) => mark.id === id);
  if (index < 0) return null;
  const end = marks[index + 1]?.at ?? html.length;
  return html.slice(marks[index].at, end);
}

/* Only a heading that literally states a letter tier yields one. "S Tier Trinkets",
   "A - Tier Trinkets" and "B Tier (Alternative Options)" are published rankings;
   "Recommended Trinkets", "Alternatives", "On-use Trinkets" and "Passive Trinkets" are
   groupings Method published without ranking them, and they stay unranked. Inventing an
   order from prose is exactly what G1 forbids. */
export function letterTierOf(label) {
  const match = /^\s*([SABCDF])\s*-?\s*tier\b/i.exec(normalizeText(label));
  return match ? match[1].toUpperCase() : null;
}

/* An entry is a paragraph that STARTS with an item link. Later links in the same paragraph
   are cross-references ("A good farmable alternative to <Voracious Heart>") and must not
   become entries — measured on Blood DK, where taking every link under the A-Tier heading
   would rank the S-Tier trinket as A. They are kept as `mentions` instead. */
function entriesFrom(slice, { groupsFrom }) {
  const groups = [];
  for (const m of slice.matchAll(/<(h[2-6])[^>]*>([\s\S]*?)<\/\1>/gi))
    groups.push({ at: m.index, label: cellText(m[2]) });
  if (groupsFrom !== false) {
    // Holy Paladin groups with a bold paragraph ("<p><b>Alternatives</b></p>") instead of a heading.
    for (const m of slice.matchAll(/<p>\s*<b>([\s\S]*?)<\/b>\s*<\/p>/gi))
      groups.push({ at: m.index, label: cellText(m[1]) });
  }
  groups.sort((a, b) => a.at - b.at);

  const out = [];
  for (const m of slice.matchAll(/<p>([\s\S]*?)<\/p>/gi)) {
    const links = itemLinksIn(m[1]);
    if (!links.length) continue;
    const leading = /^\s*(?:<b>\s*)?<a\b/i.test(m[1]);
    if (!leading) continue;
    const group = [...groups].reverse().find((g) => g.at < m.index) ?? null;
    const label = group?.label ?? null;
    out.push({
      itemId: links[0].itemId,
      itemName: anchorTexts(m[1])[0] ?? null,
      namespace: links[0].namespace,
      groupLabel: label,
      tier: label ? letterTierOf(label) : null,
      note: cellText(m[1]) || null,
      mentions: links.slice(1).map((l) => l.itemId).filter((id) => id !== links[0].itemId),
    });
  }
  return out;
}

/* Shadow Priest publishes the same thing as a `Rating | Trinket` table. Same fact, so it
   produces the same shape rather than a second concept. */
function ratingTableTrinkets(html) {
  const out = [];
  for (const table of html.matchAll(/<table[\s\S]*?<\/table>/gi)) {
    const rows = [...table[0].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((r) => rowCells(r[1]));
    if (!rows.length) continue;
    const header = rows[0].map((c) => cellText(c).toLowerCase());
    if (header.slice(0, 2).join("|") !== "rating|trinket") continue;
    for (const cells of rows.slice(1)) {
      if (cells.length < 2) continue;
      const label = cellText(cells[0]);
      const links = itemLinksIn(cells[1]);
      out.push({
        itemId: links[0]?.itemId ?? null,
        itemName: anchorTexts(cells[1])[0] ?? (cellText(cells[1]) || null),
        namespace: links[0]?.namespace ?? null,
        groupLabel: label,
        tier: letterTierOf(label),
        note: null,
        mentions: [],
      });
    }
  }
  return out;
}

/* ON THE CATALYST IDIOM — RESOLVED ENTIRELY BY THE SHARED CONTRACT, DELIBERATELY.
   Method writes it two ways: "Nek'zali the Soulcoiler/Catalyst" and "Murder Row (Catalyst)",
   the second dominant at 244 of the 258 catalyst rows. This harvester used to carry a local
   recovery pass for the second form, because resolveDropSource split on the slash only — the
   parenthetical form split into a single part that still contained the word, so `base` came
   back null and the dungeon you actually farm was lost. The contract now strips the marker
   wherever it sits and resolves a `base` (and a `baseKind`) for all four forms the three
   guides write, which makes that pass redundant; keeping it would leave two mechanisms doing
   one job and let them disagree. Both forms are covered by guide-method.test.mjs. */

/* ---------- the page ---------- */

/* Pure: no network, no clock. `roster` comes from rosterFrom(raid, dungeons). */
export function parseMethodGearingPage(source, { spec, className, role = null, url = null, roster = [] } = {}) {
  if (typeof source !== "string" || !source.trim())
    throw new Error("parseMethodGearingPage: empty document");
  const html = stripComments(source);
  const where = `method ${spec} ${className}`;
  const headings = headingsOf(html);
  const meta = pageMeta(html);

  const lists = [];
  const picks = [];
  const unresolvedSources = [];
  const unresolvedSlots = [];
  const rowsWithoutItem = [];
  const multiItemCells = [];

  for (const table of html.matchAll(/<table[\s\S]*?<\/table>/gi)) {
    const rows = [...table[0].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((r) => rowCells(r[1]));
    if (!rows.length || !isBisHeader(rows[0])) continue;   // rejects the Voidcore + Rating tables

    const heading = headingBefore(headings, table.index);
    const headingText = heading?.text ?? "";
    const list = {
      bracket: normalizeBracket(headingText),
      heading: headingText || null,
      subject: headingSubject(headingText),
      variant: null,
      buildId: buildId(SOURCE_ID, ""),
      rows: 0,
      index: lists.length,
    };
    lists.push(list);

    for (const cells of rows.slice(1)) {
      if (cells.length < 3) continue;
      const slotRaw = cellText(cells[0]);
      const itemHtml = cells[1];
      const sourceRaw = cellText(cells[2]);
      const links = itemLinksIn(itemHtml);

      // Trap 6: a row with no item link is a placeholder, not a pick.
      if (!links.length) {
        rowsWithoutItem.push({ list: list.index, slot: slotRaw, text: cellText(itemHtml), source: sourceRaw });
        continue;
      }
      if (links.length > 1)
        multiItemCells.push({ list: list.index, slot: slotRaw, text: cellText(itemHtml),
          itemIds: links.map((l) => l.itemId) });

      const { base, qualifier } = splitSlotLabel(slotRaw);
      let slot;
      try {
        slot = normalizeSlot(base, { where: `${where} slot="${slotRaw}"` });
      } catch (error) {
        unresolvedSlots.push({ list: list.index, label: slotRaw, itemId: links[0].itemId, detail: error.message });
        continue;
      }
      if (slot === null) continue;                       // shirt / tabard, deliberately dropped

      const drop = resolveDropSource(sourceRaw, roster, { soft: true, where });
      if (sourceRaw && !drop) unresolvedSources.push({ list: list.index, label: sourceRaw, itemId: links[0].itemId });

      const itemText = cellText(itemHtml);
      const itemAnnotations = parentheticals(itemText);
      const sourceAnnotations = parentheticals(sourceRaw);
      const flags = [...itemAnnotations, ...sourceAnnotations].map((a) => a.toLowerCase());

      list.rows++;
      picks.push({
        source: SOURCE_ID,
        bracket: list.bracket,
        list: list.index,
        buildId: list.buildId,
        endorsement: "bis",
        slot,
        slotLabel: slotRaw,
        slotQualifier: qualifier,
        itemId: links[0].itemId,
        itemName: anchorTexts(itemHtml)[0] ?? null,
        namespace: links[0].namespace,
        // Trap 2: recorded on purpose, and never mistaken for the pick itself.
        originalItemId: queryValue(itemHtml, "original-item"),
        ilvl: Number(queryValue(itemHtml, "ilvl")) || null,
        itemText,
        itemAnnotations,
        sourceText: sourceRaw || null,
        sourceAnnotations,
        // `base` is the boss behind a catalyst idiom ("Nek'zali the Soulcoiler/Catalyst"),
        // which is the part Phase D's game plan actually needs. Dropping it would throw
        // away the only pointer from a catalysed row back to where you farm it.
        /* `via` and `canonicalRaw` carry the COMPOUND case: "The Great Vault or Entombed
           Sentinels" resolves to the boss with the route recorded alongside it. Projecting
           only kind/canonical/base silently discarded both. Unexercised by the three
           recorded fixtures — Method writes "Great Vault" in prose, never yet in a Source
           cell — so this is a live-harvest defect fixed before it could bite, not one
           observed. Copy every field the contract sets rather than an allowlist that goes
           stale each time it learns a new one. */
        dropSource: drop
          ? {
            kind: drop.kind,
            canonical: drop.canonical,
            ...(drop.base !== undefined ? { base: drop.base } : {}),
            ...(drop.baseKind ? { baseKind: drop.baseKind } : {}),
            ...(drop.via ? { via: drop.via } : {}),
            ...(drop.canonicalRaw ? { canonicalRaw: drop.canonicalRaw } : {}),
          }
          : null,
        tierSet: flags.some((a) => /^tier(\s|$)|tier set|tier token|^token$/.test(a)),
        // Both of Method's catalyst forms must set this. The parenthetical "(Catalyst)" is
        // an annotation, but "Nek'zali the Soulcoiler/Catalyst" has no parentheses at all —
        // reading only the annotations marks that row uncatalysed while its own dropSource
        // says otherwise, so the resolved kind is the authority and the annotation is a
        // second chance for the item-cell spelling.
        catalyst: drop?.kind === "catalyst" || flags.some((a) => /cataly/.test(a)),
        otherItemIds: links.slice(1).map((l) => l.itemId),
      });
    }
  }

  // Trap 5: claim a build only where the page actually publishes two lists at one bracket.
  const byBracket = new Map();
  for (const list of lists) {
    if (!byBracket.has(list.bracket)) byBracket.set(list.bracket, []);
    byBracket.get(list.bracket).push(list);
  }
  for (const [bracket, group] of byBracket) {
    if (group.length < 2) continue;
    const subjects = group.map((l) => l.subject);
    if (subjects.some((s) => !s) || new Set(subjects).size !== subjects.length)
      throw new Error(`${where}: ${group.length} "${bracket}" lists that cannot be told apart `
        + `(${subjects.map((s) => JSON.stringify(s)).join(", ")}) — the page publishes a build axis `
        + "this parser cannot name, and guessing which list wins would silently drop the other");
    for (const list of group) {
      list.variant = list.subject;
      list.buildId = buildId(SOURCE_ID, list.subject);
    }
  }
  for (const pick of picks) pick.buildId = lists[pick.list].buildId;

  const trinketSlice = sectionSlice(html, "trinkets");
  const embellishSlice = sectionSlice(html, "embellishments");
  const trinkets = trinketSlice
    ? [...entriesFrom(trinketSlice, { groupsFrom: true }), ...ratingTableTrinkets(trinketSlice)]
    : [];
  // Embellishments are published as flowing prose with no grouping on any spec measured, so
  // they are recorded as MENTIONED, never ranked. "best embellishment for throughput" is a
  // sentence, and reading an order out of it would be manufacturing a ranking.
  const embellishments = embellishSlice
    ? entriesFrom(embellishSlice, { groupsFrom: false }).map((e) => ({ ...e, tier: null }))
    : [];

  const resolved = picks.filter((p) => p.dropSource).length;
  return {
    source: SOURCE_ID,
    sourceLabel: SOURCE_LABEL,
    spec,
    class: className,
    role,
    url,
    ...meta,
    lists: lists.map(({ index, ...rest }) => rest),
    picks,
    trinkets,
    embellishments,
    counts: {
      lists: lists.length,
      picks: picks.length,
      trinkets: trinkets.length,
      embellishments: embellishments.length,
      // The page's "Patch 12.1" label says what Method believes it updated; this says what
      // the page still describes. Only the second is evidence of season currency.
      rosterMatchRate: picks.length ? Number((resolved / picks.length).toFixed(3)) : null,
    },
    issues: { unresolvedSources, unresolvedSlots, rowsWithoutItem, multiItemCells },
  };
}

/* ---------- CLI ---------- */

const slugPart = (value) => normalizeText(value).toLowerCase()
  .replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export const methodSlug = (spec, className) => `${slugPart(spec)}-${slugPart(className)}`;
export const methodUrl = (spec, className) =>
  `https://www.method.gg/guides/${methodSlug(spec, className)}/gearing`;

async function getText(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: UA });
      if (r.ok) return await r.text();
      if (r.status === 404) return null;
    } catch { /* retry */ }
    await sleep(500 * (i + 1));
  }
  return null;
}

async function main(argv) {
  const only = new Set(argv.filter((a) => !a.startsWith("-")));
  const accept = process.env.METHOD_ACCEPT_PARTIAL === "1";
  const [raid, dungeons, specs] = await Promise.all([
    readFile(join(ROOT, "data", "raid-items.json"), "utf8").then(JSON.parse),
    readFile(join(ROOT, "data", "dungeon-items.json"), "utf8").then(JSON.parse),
    readFile(join(ROOT, "data", "specs.json"), "utf8").then(JSON.parse),
  ]);
  const roster = rosterFrom(raid, dungeons);
  const roster40 = specs.specs ?? specs;

  console.log(`Harvesting Method gearing guides (${roster40.length} specs) ...`);
  const records = [];
  const failed = [];
  for (const entry of roster40) {
    const slug = methodSlug(entry.spec, entry.class);
    if (only.size && !only.has(slug)) continue;
    const url = methodUrl(entry.spec, entry.class);
    const html = await getText(url);
    if (!html) {
      failed.push(`${slug}: fetch failed`);
      console.log(`  --   ${slug.padEnd(24)} fetch failed`);
      continue;
    }
    let record;
    try {
      record = parseMethodGearingPage(html, {
        spec: entry.spec, className: entry.class, role: entry.role ?? null, url, roster,
      });
    } catch (error) {
      failed.push(`${slug}: ${error.message}`);
      console.log(`  --   ${slug.padEnd(24)} ${error.message}`);
      continue;
    }
    const { unresolvedSlots, unresolvedSources } = record.issues;
    if (unresolvedSlots.length)
      failed.push(`${slug}: unresolvable slot labels ${[...new Set(unresolvedSlots.map((u) => u.label))].join(", ")}`);
    if (unresolvedSources.length)
      failed.push(`${slug}: ${unresolvedSources.length} unresolvable drop sources `
        + `(${[...new Set(unresolvedSources.map((u) => u.label))].slice(0, 6).join(", ")})`);
    if (!record.selfDated) failed.push(`${slug}: page carries no readable update date`);
    records.push(record);
    console.log(`  ok   ${slug.padEnd(24)} ${String(record.counts.picks).padStart(3)} picks `
      + `${String(record.counts.lists)} lists  trinkets ${String(record.counts.trinkets).padStart(2)}  `
      + `roster ${record.counts.rosterMatchRate ?? "-"}  ${record.published ?? "UNDATED"}`);
    await sleep(400);
  }

  if (failed.length && !accept) {
    throw new Error(`refusing to overwrite data/guide-method.json:\n  ${failed.join("\n  ")}\n`
      + "  Fix the roster join or add the slot alias. Rerun with METHOD_ACCEPT_PARTIAL=1 only "
      + "after reviewing every line above — each one is a vote that would otherwise vanish.");
  }
  if (failed.length) console.warn(`  accepted reviewed gaps:\n    ${failed.join("\n    ")}`);

  const doc = {
    source: `${SOURCE_LABEL} per-spec gearing guides`,
    sourceId: SOURCE_ID,
    harvestedAt: new Date().toISOString().slice(0, 10),
    selfDated: true,
    caveat: "Pre-launch data. Method's Season-2 pages are ragged in currency: some still cite "
      + "Season-1 dungeons. Read counts.rosterMatchRate per spec, not the page's patch label.",
    counts: {
      specs: records.length,
      picks: records.reduce((a, r) => a + r.counts.picks, 0),
      undated: records.filter((r) => !r.selfDated).length,
    },
    issues: failed,
    specs: records,
  };
  await mkdir(join(ROOT, "data"), { recursive: true });
  await writeFile(DATA_PATH, JSON.stringify(doc, null, 2), "utf8");
  console.log(`\nwrote data/guide-method.json`);
  console.log(`  ${doc.counts.specs} specs · ${doc.counts.picks} picks · ${doc.counts.undated} undated`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  await main(process.argv.slice(2));
}
