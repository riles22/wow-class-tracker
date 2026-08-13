/* Harvest Wowhead's human-authored class gearing guides — the Wowhead lane of the Phase-B
   guide-consensus layer (docs/gearing-s2-scope.md, decisions G1 / G4 / G9-G12).

   WHAT THIS PRODUCES, and what it deliberately does not.
   Per spec: BiS picks (the Slot | Item | Source table), weaker endorsements (the separate
   "Best Gear from Raids" / "Best Gear from Mythic+" strips and "Best Gear to Catalyze"),
   the letter-graded trinket tier list, the SCOPED stat priorities (hero talent x fight
   profile), and the page's own date + author. It computes no ranking and merges no source:
   `consensusForItem` in lib-guides.mjs owns the counting, and Phase C owns the ordering.

   WHY IT PARSES THE MARKUP, NOT THE RENDERED HTML.
   Wowhead ships the guide body as a BBCode-ish payload inside
   `WH.markup.printHtml("...","guide-body")` and renders it in the browser. The server HTML
   therefore contains NO BiS table — only a preload of tooltip anchors. Two consequences that
   are strictly good for us: the table's cell structure is unambiguous instead of being
   recovered from divs, and the measured "icon alt= disagrees with the anchor text on ~6 rows"
   trap cannot bite, because the markup carries no alt text at all. Item identity here is the
   `[item=<id>]` token, which is the same id the anchor would carry.

   ACCESS. Wowhead 403s a plain request; `r.jina.ai` with `x-return-format: html` returns the
   raw server HTML including the printHtml payload (measured 2026-08-12). A WebFetch negative
   on Wowhead is not evidence of absence.

   HONESTY. Every parse below is a READ of what the page published. Where the page is
   ambiguous the field is left null and reported, never guessed:
     · slot label "Weapon" — Wowhead writes it on every spec's weapon row, and it means a bow
       for BM Hunter and a 1H mace for Holy Paladin. It is a category, not a slot, so it is
       recorded as `slot: null` + `rawSlot: "Weapon"` and resolved later from the item's own
       tooltip, which the gear data already carries. It is counted and printed, never dropped.
     · a source cell naming a boss we have not harvested is a HARD ERROR (lib-guides'
       resolveDropSource), because a dropped row is a vote that vanishes without trace.
     · Delves and Crafting trinket contexts are NOT forced onto raid/mplus; they carry
       `bracket: null` and keep the page's own label.

   CLI
     node src/harvest-guide-wowhead.mjs                        # all 40 specs
     node src/harvest-guide-wowhead.mjs --spec hunter/beast-mastery --spec paladin/holy
     node src/harvest-guide-wowhead.mjs --out data/guide-picks-wowhead.json
     node src/harvest-guide-wowhead.mjs --dry-run              # parse + report, write nothing
   Env
     WOW_ACCEPT_GUIDE_CHANGES=1   accept a changed pick set against the committed baseline

   NOTE (Phase B): this ships MACHINERY. The live harvest is a local-run duty AFTER the
   2026-08-18 season flip — every source is mid-transition until then and a harvest now would
   record PTR-era picks under a Season-2 label.

   PHASE E (G24 / G25). Two additions, both about the season boundary:
     · `dropStalePicks` removes picks naming content the season does not hold, and discloses
       the count. It runs AFTER `repairGuideSources` and the ordering is load-bearing — see
       the comment there, it is the difference between dropping a stale pick and deleting a
       real one over a typo.
     · The namespace segment in the rendered-anchor patterns accepts ANY namespace or none,
       independently of SEASON.wowheadNamespace, because a `/ptr/` link outlives the flip.
       `acceptsNamespace` pins that. Launch day is a config edit in src/season.mjs; the
       operational order is docs/gearing-launch-runbook.md. */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { guideMarkupFrom, markupBlocks, markupHeadings, plainMarkup } from "./lib-wowhead.mjs";
import { buildId, normalizeBracket, normalizeSlot, normalizeText, parseSoftCap,
  resolveDropSource, rosterFrom, slugify } from "./lib-guides.mjs";
import { SEASON, dataPredatesSeason, partitionStalePicks, staleDisclosure } from "./season.mjs";

export const SOURCE = "wowhead";
export const SOURCE_LABEL = "Wowhead class guides";

/* The season number Wowhead states in its own prose ("Midnight Season 2"), derived from the
   season config rather than hardcoded in the CLI — one field to edit at the next cycle. */
export const SEASON_NUMBER = Number(String(SEASON.id).replace(/^s/, "")) || null;

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_OUT = join(ROOT, "data", "guide-picks-wowhead.json");

/* ---------- urls ---------- */

export const bisUrl = (classSlug, specSlug) =>
  `https://www.wowhead.com/guide/classes/${classSlug}/${specSlug}/bis-gear`;

/* Measured 2026-08-13: the healer suffix is `-healer`, NOT `-healing`. It is only a fallback —
   `statPriorityUrlFrom` reads the real link out of the page's own nav strip first, so a suffix
   Wowhead renames does not silently 404 a whole role. */
export const ROLE_SUFFIX = { DPS: "dps", Healer: "healer", Tank: "tank" };
export const statUrl = (classSlug, specSlug, role) =>
  `https://www.wowhead.com/guide/classes/${classSlug}/${specSlug}/stat-priority-pve-${ROLE_SUFFIX[role] ?? "dps"}`;

export function statPriorityUrlFrom(markup) {
  const nav = /\[nav-item=(guide\/classes\/[a-z-]+\/[a-z-]+\/stat-priority[a-z-]*)/i.exec(markup);
  return nav ? `https://www.wowhead.com/${nav[1]}` : null;
}

/* ---------- fetch ----------
   lib-wowhead's getText() cannot be reused for guide pages: r.jina.ai only returns the raw
   server HTML (and therefore the printHtml payload) when asked for it by header, and getText
   takes no headers. Same retry/backoff shape, deliberately. */
const READER = (url) => `https://r.jina.ai/${url}`;
const UA = "Mozilla/5.0 (wow-s2-gearing guide harvester)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* Returns a DISCRIMINATED result, because "Wowhead has no such page" and "we failed to read
   Wowhead" are different facts and only the first is safe to record as an absence. Measured
   2026-08-13: a 13-spec sweep dropped one stat page purely to reader-side throttling, and with
   a boolean that spec would have shipped `builds: []` as though the guide published none. */
export async function fetchGuideHtml(url, { tries = 4 } = {}) {
  let reason = "unreachable";
  for (let i = 0; i < tries; i++) {
    try {
      const response = await fetch(READER(url), {
        headers: { "user-agent": UA, "x-return-format": "html" },
      });
      if (response.ok) {
        const html = await response.text();
        if (/WH\.markup\.printHtml/.test(html)) return { ok: true, html };
        // A 200 that carries no guide payload is Wowhead's own "Page Not Found" shell.
        if (/Page Not Found/i.test(html)) return { ok: false, reason: "not-found" };
      }
      if (response.status === 404) return { ok: false, reason: "not-found" };
    } catch { /* retry */ }
    await sleep(1200 * (i + 1));
  }
  return { ok: false, reason };
}

/* ---------- small markup helpers ---------- */

const attr = (attrs, name) => {
  const quoted = new RegExp(`${name}="([^"]*)"`).exec(attrs || "");
  if (quoted) return quoted[1];
  const bare = new RegExp(`(?:^|\\s)${name}=([^\\s\\]]+)`).exec(attrs || "");
  return bare ? bare[1] : null;
};

/* Wowhead writes "Best Gear from Raids" — plural, which defeats normalizeBracket's \braid\b
   anchor — while the same heading's toc= reads "Raid Drops", which does not. Singularise
   before delegating so BOTH spellings land on the same bracket, and never touch the shared
   contract to do it. */
const sectionBracket = (text) => normalizeBracket(String(text ?? "")
  .replace(/\braids\b/gi, "raid").replace(/\bdungeons\b/gi, "dungeon"));

const headingToc = (heading) => attr(heading.attrs, "toc");
const headingLabel = (heading) => {
  const toc = headingToc(heading);
  return toc && toc !== "false" ? `${toc} ${heading.text}` : heading.text;
};

/* A heading and everything up to the next heading of the same or higher level. */
function sectionAfter(markup, headings, index) {
  const heading = headings[index];
  const next = headings.slice(index + 1).find((h) => h.level <= heading.level);
  return markup.slice(heading.end, next ? next.start : markup.length);
}

export function itemRefsIn(text) {
  return [...String(text ?? "").matchAll(/\[item=(\d+)((?:\s[^\]]*)?)\]/g)].map((m) => ({
    itemId: m[1],
    // A catalysed row names BOTH ids. The original is the id that actually DROPS, so a later
    // join to a boss must use it; the displayed id is the tier piece you end up wearing.
    originalItemId: attr(m[2], "original-item"),
    bonusIds: (attr(m[2], "bonus") || "").split(":").filter(Boolean),
  }));
}

export const badgeIdsIn = (text) =>
  [...String(text ?? "").matchAll(/\[icon-badge=(\d+)/g)].map((m) => m[1]);

/* ---------- page self-description ---------- */

export function parseByline(html) {
  const block = /<div class="guide-content-byline">([\s\S]*?)<\/div>/.exec(html);
  const scope = block ? block[1] : html;
  const author = /<a href="\/author\/([^"]+)"/.exec(scope);
  const updated = /class="date-tip"[^>]*>\s*(\d{4})\/(\d{2})\/(\d{2})/.exec(scope);
  return {
    author: author ? decodeURIComponent(author[1]) : null,
    // Normalised to ISO so it sorts and compares like every other date in this repo.
    updated: updated ? `${updated[1]}-${updated[2]}-${updated[3]}` : null,
  };
}

/* The page's own season claim, kept as evidence rather than assumed. The tracker era-verifies
   every source before letting it feed a consensus; the same rule applies here, and G14 gates
   the Archon lane on exactly this kind of check. */
export function parseSeason(markup) {
  const match = /Midnight Season (\d+)/i.exec(markup);
  return match ? { text: match[0], season: Number(match[1]) } : { text: null, season: null };
}

/* Profession and NPC names come from the page's own rendered `/skill=<id>/` and `/npc=<id>/`
   anchors — the guide markup carries only the numeric id, and inventing a name from the number
   is exactly the kind of guess this project forbids. The namespace segment is the measured
   trap: a dungeon-guide link sits in the PTR namespace while a raid link does not, and the id
   is the same either way.

   PHASE E: the segment was written `(?:ptr/)?` and is now `(?:[a-z0-9-]+/)?` — ANY namespace,
   or none. Two reasons. The literal `ptr` was the one spelling this file knew, while Method's
   pages alone carry four (`ptr`, none, `beta`, `ptr-2`, measured 2026-08-13) and nothing stops
   a Wowhead anchor doing the same. And it must not depend on SEASON.wowheadNamespace: a
   `/ptr/` link outlives the flip, and losing a boss NAME to a URL spelling would silently
   unsource a pick. One optional segment is what has ever been observed; a deeper path is not
   accepted, because that would start matching link shapes nobody has seen. */
const NAMESPACE = "(?:[a-z0-9-]+/)?";
const linkNames = (html, kind) => {
  const names = new Map();
  for (const m of String(html).matchAll(
    new RegExp(`href="/${NAMESPACE}${kind}=(\\d+)/[^"]*"[^>]*>([^<]+)`, "g")))
    names.set(m[1], normalizeText(m[2]));
  return names;
};
export const parseSkillNames = (html) => linkNames(html, "skill");
export const parseNpcNames = (html) => linkNames(html, "npc");

/* Exercises the real pattern rather than restating it. `null` is the live namespace. */
export const acceptsNamespace = (namespace) =>
  parseNpcNames(`<a href="/${namespace ? `${namespace}/` : ""}npc=1/boss">Boss</a>`).get("1") === "Boss";

/* ---------- slots ---------- */

/* Labels that name a category rather than an inventory slot. Wowhead writes "Weapon" on every
   spec's weapon row; it resolves to Ranged for a Hunter and One-Hand for a Holy Paladin, so
   only the item can settle it. Deferring is honest; guessing would silently mis-slot a vote. */
export const AMBIGUOUS_SLOT_LABELS = new Set(["weapon", "weapons"]);

export function readSlotCell(raw, { where = "" } = {}) {
  const text = normalizeText(raw);
  // "Trinket (Raid only)" / "Trinket (Alternative)" / "Weapon (2h)" — the parenthetical is an
  // endorsement, a bracket or a weapon hand, published by the guide, and normalizeSlot rightly
  // refuses to parse the whole string.
  const paren = /^(.*?)\s*\(([^)]*)\)\s*$/.exec(text);
  const base = paren ? paren[1].trim() : text;
  const qualifier = paren ? paren[2].trim() || null : null;
  const ambiguous = AMBIGUOUS_SLOT_LABELS.has(base.toLowerCase());

  // An ambiguous base whose qualifier NAMES the hand is not ambiguous: "Weapon (2h)" and
  // "Weapons (1h)" are the page telling us, and reading that is not a guess.
  let slot = null;
  if (ambiguous && qualifier) {
    try { slot = normalizeSlot(qualifier, { where }); } catch { slot = null; }
  } else if (!ambiguous) {
    slot = normalizeSlot(base, { where: where || "wowhead bis table" });
  }
  return {
    slot,
    rawSlot: text,
    qualifier,
    ambiguous: ambiguous && slot === null,
    // The row labels itself an alternative; the whole point of G9 is that this is NOT a pick.
    endorsement: qualifier && /alternativ/i.test(qualifier) ? "alternative" : "bis",
  };
}

/* ---------- drop sources ---------- */

/* Wowhead publishes source labels that are categories rather than drops. lib-guides already
   types two of them (crafted, catalyst) — "Crafting Blacksmithing" and a bare [skill=<id>] both
   land on `crafted` unchanged. "Tier Set" (guide 34180, measured on Protection Warrior's Head /
   Shoulders / Chest / Gloves rows, 2026-08-13) is a THIRD such category and lib-guides does not
   know it, so it is typed here rather than being force-matched onto a boss.
   Deliberately narrow: only the label actually measured is recognised, and anything else still
   throws out of resolveDropSource, because that throw is the thing that tells us a page changed.
   FLAGGED FOR THE CONTRACT OWNER: if Icy Veins or Method also publish a tier-set source, this
   `kind` belongs in lib-guides so all three harvesters emit the same string. */
const NON_DROP_SOURCES = [[/^tier set$/i, "tier-set"]];

/* The contract kinds that NAME a particular drop. Everything else it can return — "vault",
   "boe", "pvp", "delve" — names a lane rather than a place, and on this source a lane must
   wait its turn behind the guide id (see readSourceCell's ordering note and
   repairGuideSources). Written as an allowlist of the named kinds rather than a blocklist of
   the categories on purpose: if lib-guides grows a category we have not heard of, the safe
   failure is that it defers and the run reports it, not that it silently outranks an id. */
const NAMED_DROP_KINDS = new Set(["raid", "raid-instance", "mplus", "crafted", "catalyst"]);

/* Pull every source label a cell states, in published order. Measured across the roster,
   a source cell can be any of:
     [url guide=34252]Ula'tek[/url]                                  a linked boss or dungeon
     [url guide=34251][/url]                                         a link with NO text at all
     [skill=165]                                                     a profession, id only
     [npc=252959]                                                    a boss by NPC id, id only
     [icon ...][url guide=34252]Ula'tek[/url] [i](Raid)[/i] & [icon ...][url guide=33219] Catalyst[/url]
                                                                     TWO sources joined by "&"
   The `[i](Raid)[/i]` note and the decorative [icon] are not sources and are skipped by only
   ever reading anchors — never the cell's flattened text, except where a caller opts in. */
/* `[url guide=34252]` and `[url="guide=34252"]` are the same anchor — the quoted form appears
   in Mistweaver's catalyse table (measured 2026-08-13). A regex that only knows the first
   silently loses every source on that page. */
const GUIDE_ANCHOR = /\[url[\s=]+"?guide=(\d+)"?\]([\s\S]*?)\[\/url\]/g;

function sourceLabelsIn(cell, { skills, npcs, allowPlainText }) {
  const labels = [];
  for (const m of cell.matchAll(GUIDE_ANCHOR))
    labels.push({ text: normalizeText(plainMarkup(m[2])), guideId: m[1] });
  for (const m of cell.matchAll(/\[skill=(\d+)\]/g))
    labels.push({ text: skills?.get(m[1]) ?? null, skillId: m[1] });
  for (const m of cell.matchAll(/\[npc=(\d+)\]/g))
    labels.push({ text: npcs?.get(m[1]) ?? null, npcId: m[1] });
  if (!labels.length && allowPlainText) {
    const text = normalizeText(plainMarkup(cell));
    if (text) labels.push({ text });
  }
  return labels;
}

/* Resolve a cell to at most one source.

   WHY THIS COLLECTS INSTEAD OF THROWING. resolveDropSource throws on an unmatchable name by
   design, and that instinct is right — a dropped row is a vote that vanishes. But measured
   across the roster, Wowhead's 40 author-written pages spell the same boss several ways
   ("The Coiled Alter", "Entomed Sentinels", "Sethraliss", "Nymrissa Wavebinder") and sometimes
   ship an empty anchor. Throwing on the first one loses the WHOLE spec and reports one typo per
   run. So the row is kept with `source: null`, the label is recorded, and the RUN refuses to
   write while printing every unresolved label at once (see repairGuideSources + main). Nothing
   is dropped and nothing is guessed; the failure just becomes enumerable instead of serial. */
function readSourceCell(raw, { roster, skills, npcs, where, allowPlainText = true }) {
  const cell = String(raw ?? "");
  const labels = sourceLabelsIn(cell, { skills, npcs, allowPlainText });
  if (!labels.length) return { texts: [], source: null, unresolved: [] };

  let drop = null, catalyst = null, typed = null;
  for (const label of labels) {
    if (label.skillId) {
      label.resolved = { kind: "crafted", canonical: label.text, skillId: label.skillId };
      typed ??= label.resolved;
      continue;
    }
    if (!label.text) { label.reason = "empty label"; continue; }
    const nonDrop = NON_DROP_SOURCES.find(([pattern]) => pattern.test(label.text));
    if (nonDrop) { label.resolved = { kind: nonDrop[1], canonical: label.text }; typed ??= label.resolved; continue; }
    const resolved = resolveDropSource(label.text, roster, { soft: true, where });
    if (!resolved) { label.reason = "no roster match"; continue; }
    /* ORDERING — WHY A CATEGORY IS HELD HERE INSTEAD OF BEING TAKEN.
       lib-guides types a category label the moment it reads one: "The Great Vault" -> vault,
       "BoE Trash Drop" -> boe. That is right for a source whose text is all it has. Wowhead
       has more: the SAME cell carries `guide=<id>`, and an id names a specific drop where the
       printed text names only a lane. Committing the category here would beat the id to it,
       and `[url guide=34251]Raid[/url]` -> The Coiled Altar is exactly the repair that must
       not be lost — flattening it to a lane would be the silent damage this file exists to
       prevent. So a category is HELD on the label, the pick stays sourceless, and
       repairGuideSources types it only after the id map has had its turn.
       Nothing is discarded and nothing is quiet: the held typing stays on the label, and the
       row is reported as unresolved until repair, which is the state that refuses the write.
       Note this tests the RESOLVED kind, not the text — a compound like "The Great Vault or
       Entombed Sentinels" comes back as the BOSS with `via: "vault"`, which is a named drop
       and is taken here as one. */
    if (!NAMED_DROP_KINDS.has(resolved.kind)) {
      label.category = resolved;
      label.reason = `category "${resolved.kind}" — deferred to the guide-id pass`;
      continue;
    }
    label.resolved = resolved;
    if (resolved.kind === "catalyst") catalyst ??= resolved;
    else if (resolved.kind === "crafted") typed ??= resolved;
    else drop ??= resolved;
  }

  const texts = labels.map((label) => label.text).filter(Boolean);
  // "Ula'tek & Catalyst" is one fact in two halves: the boss is where it drops, the catalyst is
  // what you then do to it. lib-guides already models exactly this shape.
  const source = catalyst
    ? { kind: "catalyst", canonical: catalyst.canonical, base: drop?.canonical ?? catalyst.base ?? null }
    : drop ?? typed ?? null;
  // Only a cell that produced NO source at all is a miss. A boss that resolved alongside an
  // unreadable decoration is not a hole.
  return { texts, labels, source, unresolved: source ? [] : labels.filter((label) => !label.resolved) };
}

/* ---------- BiS table (G9 "pick") ---------- */

const tableRows = (table) => markupBlocks(table, "tr")
  .map((row) => markupBlocks(row.raw, "td").map((cell) => cell.raw));

/* Column headers are NOT uniform across the 40 pages: most write "Slot | Item | Source",
   Arms Warrior writes "Item Slot | Name | Source" (measured 2026-08-13), and rows may carry a
   trailing empty cell. Match by meaning and by index rather than by a fixed triple, so a page
   that renames a column is read instead of silently producing zero picks — which is how Arms
   Warrior first surfaced. */
export function bisColumns(header) {
  const slot = header.findIndex((cell) => /\bslot\b/.test(cell));
  const source = header.findIndex((cell) => /\bsource\b/.test(cell));
  const item = header.findIndex((cell, i) => i !== slot && i !== source && /\b(item|name)\b/.test(cell));
  return slot >= 0 && item >= 0 && source >= 0 ? { slot, item, source } : null;
}

function bisTableColumns(table) {
  const first = tableRows(table)[0];
  if (!first) return null;
  return bisColumns(first.map((cell) => plainMarkup(cell).toLowerCase()));
}

export function parseBisPicks(markup, { roster, skills = new Map(), npcs = new Map() } = {}) {
  const picks = [];
  const notes = { ambiguousSlots: [], unresolvedSources: [] };
  // The BiS table lives inside [tabs name=bis_items]; a spec publishing several tabs (Raid BiS
  // / M+ BiS) is handled for free because the bracket comes from the tab's own name.
  const tabsBlock = markupBlocks(markup, "tabs")
    .find((block) => /name=bis_items/.test(block.raw.slice(0, 200)));
  const scope = tabsBlock ? tabsBlock.raw : markup;
  const tabs = markupBlocks(scope, "tab");
  const panels = tabs.length
    ? tabs.map((tab) => ({ name: attr(/^\[tab([^\]]*)\]/.exec(tab.raw)?.[1] ?? "", "name")
        ?? plainMarkup(/^\[tab([^\]]*)\]/.exec(tab.raw)?.[1] ?? ""), raw: tab.raw }))
    : [{ name: "", raw: scope }];

  for (const panel of panels) {
    const panelBracket = normalizeBracket(panel.name);
    for (const table of markupBlocks(panel.raw, "table")) {
      const col = bisTableColumns(table.raw);
      if (!col) continue;
      const rows = tableRows(table.raw);
      for (const row of rows.slice(1)) {
        if (row.length <= Math.max(col.slot, col.item, col.source)) continue;
        const where = `wowhead bis · ${panel.name || "table"}`;
        const slot = readSlotCell(plainMarkup(row[col.slot]), { where });
        const refs = itemRefsIn(row[col.item]);
        if (!refs.length) continue;
        const source = readSourceCell(row[col.source], { roster, skills, npcs, where });
        for (const miss of source.unresolved) notes.unresolvedSources.push({ ...miss, where });
        // A parenthetical that names a bracket is the guide scoping its own row ("Trinket
        // (Raid only)"); that is published fact, so it overrides the tab's bracket.
        const qualified = slot.qualifier ? normalizeBracket(slot.qualifier) : "overall";
        const bracket = qualified !== "overall" ? qualified : panelBracket;
        if (slot.ambiguous) notes.ambiguousSlots.push(`${slot.rawSlot} -> item ${refs[0].itemId}`);
        for (const ref of refs) {
          picks.push({
            ...ref, slot: slot.slot, rawSlot: slot.rawSlot, qualifier: slot.qualifier,
            bracket, sectionBracket: null, endorsement: slot.endorsement,
            sourceText: source.texts[0] ?? null, sourceTexts: source.texts,
            sourceLabels: source.labels, source: source.source,
            section: panel.name || "BiS",
          });
        }
      }
    }
  }
  return { picks, notes };
}

/* ---------- weaker endorsements (G9 "alternative") ---------- */

/* "Best Gear from Raids" / "Best Gear from Mythic+" are strips of [icon-badge] cells with NO
   slot column. The slot is left null on purpose — the item's own tooltip carries it, and this
   page does not state it.

   WHY `bracket` IS "overall" HERE AND NOT "raid"/"mplus".
   In lib-guides, `bracket` is which of a source's LISTS is casting the vote, and G10 lets a
   bracket-matching list outrank the outlet's Overall list. Wowhead publishes exactly ONE
   per-slot list (the "Overall BiS" tab); these strips are four-item highlights drawn from it,
   not a competing raid BiS list. Tagging them "raid" therefore does real damage in two
   directions, both measured against the fixtures:
     · an item in BOTH the BiS table and the raid strip would have its raid-ranked ALTERNATIVE
       outrank its overall-ranked PICK, and Wowhead's own BiS choice would be published as a
       mere alternative (this is what the consensus test caught);
     · a raid-drop item that Wowhead highlights under Mythic+ would score rank 0 against its own
       item bracket and stop voting altogether — an endorsement silently deleted.
   The strip's scope is still real information, so it is kept as `sectionBracket` alongside the
   section name. It describes where the strip says the gear comes from; it is not a list vote. */
/* Matched on `toc=`, not on the heading text. Measured across the 40 pages: every one carries
   toc="Raid Drops" and toc="Mythic+ Drops" (40/40), while the visible wording varies four ways
   — "Best Gear from Raids", "Best Gear from Midnight Season 2 Raids", "Best Raid Items", and the
   Mythic+ equivalents. A text matcher silently returned zero strips for Enhancement Shaman. */
const STRIP_TOC = /^(raid|mythic\s*\+?)\s*drops$/i;
const isStripHeading = (heading) => heading.level <= 2
  && (STRIP_TOC.test(headingToc(heading) ?? "")
    || /best gear from|best (raid|mythic\s*\+) items/i.test(heading.text));

export function parseSectionAlternatives(markup) {
  const headings = markupHeadings(markup);
  const out = [];
  headings.forEach((heading, index) => {
    if (!isStripHeading(heading)) return;
    const scope = sectionBracket(headingLabel(heading));
    const section = sectionAfter(markup, headings, index);
    const label = headingToc(heading) || heading.text;
    // [table] on 39 specs, [grid] of [span] on Enhancement Shaman. Bounded to those containers
    // rather than the whole section, because the [tooltip] blocks that follow the strip are
    // prose about the same items and must not be counted a second time.
    for (const table of [...markupBlocks(section, "table"), ...markupBlocks(section, "grid")]) {
      for (const itemId of badgeIdsIn(table.raw)) {
        out.push({
          itemId, originalItemId: null, bonusIds: [], slot: null, rawSlot: null,
          qualifier: null, bracket: "overall", sectionBracket: scope,
          endorsement: "alternative", sourceText: null, sourceTexts: [], sourceLabels: [],
          source: null, section: label,
        });
      }
    }
  });
  return out;
}

/* "Best Gear to Catalyze" names the five catalysable slots, the item you FEED the catalyst (so
   the badge is the pre-catalyst id, the one that actually drops, which is why it joins to a boss
   cleanly) and where that item comes from.

   THREE LAYOUTS, all measured across the 40 pages on 2026-08-13:
     A. 37 specs — [grid] of [p] cards: [large]Head[/large] + [icon-badge] + [url guide=..]
     B. Mistweaver — [table] of [td] cards holding the same three things, with the anchor written
        [url="guide=34252"] rather than [url guide=34252]
     C. Assassination Rogue and two more — a [table] whose HEADER row is "Head - <source>" per
        column and whose second row is the badges, joined by column INDEX
   One spec (Enhancement Shaman) publishes no catalyse section at all, which is an absence, not
   a failure. A layout-specific parser would have silently returned zero for four specs. */
export function parseCatalyzeAlternatives(markup, { roster, skills = new Map(), npcs = new Map() } = {}) {
  const headings = markupHeadings(markup);
  const out = [];
  const notes = { ambiguousSlots: [], unresolvedSources: [], unparsedCatalyze: [] };

  const record = (slotRaw, itemId, sourceScope, bracket) => {
    const slot = readSlotCell(slotRaw, { where: "wowhead catalyze" });
    // allowPlainText: false is load-bearing. Measured on Discipline Priest, whose catalyse cards
    // ship an EMPTY source link — a flattened-text fallback there reads the card's own slot
    // heading ("Shoulder") and hands it to the roster join as if it were a boss.
    const source = readSourceCell(sourceScope,
      { roster, skills, npcs, where: "wowhead catalyze", allowPlainText: false });
    if (slot.ambiguous) notes.ambiguousSlots.push(`${slot.rawSlot} -> item ${itemId}`);
    for (const miss of source.unresolved)
      notes.unresolvedSources.push({ ...miss, where: "wowhead catalyze" });
    out.push({
      itemId, originalItemId: null, bonusIds: [],
      slot: slot.slot, rawSlot: slot.rawSlot, qualifier: slot.qualifier,
      bracket, sectionBracket: null, endorsement: "alternative",
      sourceText: source.texts[0] ?? null, sourceTexts: source.texts,
      sourceLabels: source.labels, source: source.source, section: "Best Gear to Catalyze",
    });
  };

  // The catalyse heading never carries a toc, and the wording is not fixed either: 39 specs say
  // "Best Gear to Catalyze for X", Enhancement Shaman says "Best Gear to use in the Catalyst as
  // X". The stem is the only stable part.
  headings.forEach((heading, index) => {
    if (!/cataly[sz]/i.test(heading.text)) return;   // "Catalyze" and "Catalyst" share "cataly"
    // Same reasoning as the strips: these cards live inside the Overall BiS tab, so the vote is
    // an Overall one. The heading names no bracket anyway — this is only ever "overall".
    const bracket = sectionBracket(headingLabel(heading));
    const section = sectionAfter(markup, headings, index);
    const before = out.length;

    // A + B: any container holding BOTH a [large] label and a badge is a card. The FIRST
    // productive container tag wins and the loop stops — Blood DK nests its [p] cards inside
    // [td] cells, so scanning both tags recorded every card twice.
    for (const tag of ["p", "td"]) {
      const start = out.length;
      for (const card of markupBlocks(section, tag)) {
        const label = markupBlocks(card.raw, "large")[0];
        const ids = badgeIdsIn(card.raw);
        if (!label || !ids.length) continue;
        record(plainMarkup(label.raw), ids[0], card.raw, bracket);
      }
      if (out.length > start) break;
    }
    if (out.length > before) return;

    // C: the slot and its source share a header cell; the badges are the row beneath.
    for (const table of markupBlocks(section, "table")) {
      const rows = markupBlocks(table.raw, "tr")
        .map((row) => markupBlocks(row.raw, "td").map((cell) => cell.raw));
      if (rows.length < 2) continue;
      const [head, body] = rows;
      head.forEach((cell, column) => {
        const ids = badgeIdsIn(body[column] ?? "");
        if (!ids.length) return;
        // "Head - [url guide=34252]Ula'tek[/url]" and the dash-less variant: the slot is
        // whatever precedes the link, never the whole flattened cell.
        const cut = cell.search(/\[(url|icon)\b/);
        const slotRaw = plainMarkup(cut > 0 ? cell.slice(0, cut) : cell).replace(/[-–—:]\s*$/, "").trim();
        if (!slotRaw) return;
        record(slotRaw, ids[0], cell, bracket);
      });
    }
    if (out.length === before)
      notes.unparsedCatalyze.push(headingToc(heading) || heading.text);
  });
  return { alternatives: out, notes };
}

/* ---------- trinket letter tiers (G8) ----------
   Kept OUT of `picks` on purpose. G8 keeps letters per-source and trinkets outside the ranking,
   so folding a D-tier trinket into the consensus count would be exactly the merge that decision
   forbids. Delves and Crafting are real contexts on this list and are NOT brackets; they carry
   bracket: null and keep the page's own label. */
export function parseTrinketTiers(markup) {
  const contexts = new Map();
  for (const m of markup.matchAll(/\[display-option=([a-z0-9_-]+)([^\]]*)\]([\s\S]*?)\[\/display-option\]/gi)) {
    const label = plainMarkup(m[3]);
    const bracket = normalizeBracket(label);
    contexts.set(m[1], {
      key: m[1], label,
      // normalizeBracket's catch-all is "overall", and no Wowhead display-option is ever
      // literally "Overall" — so a fall-through here means a context that is not a bracket.
      bracket: bracket === "overall" ? null : bracket,
    });
  }
  // [tier-list=rows grid] uses `=` where markupBlocks expects whitespace or `]`, so slice it.
  const open = markup.indexOf("[tier-list");
  const close = markup.indexOf("[/tier-list]", open + 1);
  const entries = [];
  if (open >= 0 && close > open) {
    const list = markup.slice(open, close);
    for (const tier of markupBlocks(list, "tier")) {
      const label = /\[tier-label[^\]]*\]([\s\S]*?)\[\/tier-label\]/.exec(tier.raw);
      const content = markupBlocks(tier.raw, "tier-content")[0];
      if (!label || !content) continue;
      const letter = plainMarkup(label[1]);
      for (const badge of content.raw.matchAll(/\[icon-badge=(\d+)([^\]]*)\]/g)) {
        const key = attr(badge[2], "display-options");
        const context = key ? contexts.get(key) : null;
        entries.push({
          itemId: badge[1], tier: letter,
          context: key ?? null,
          contextLabel: context?.label ?? null,
          bracket: context?.bracket ?? null,
        });
      }
    }
  }
  return { contexts: [...contexts.values()], entries };
}

/* ---------- scoped stat priorities (G7 / G12) ----------
   Wowhead publishes one card per scope. Measured shapes, all three parsed by the same rule:
     · BM Hunter  [grid][div] ... [center][symbol=wow-hero-talent-pack-leader] Pack Leader
                  Stat Priority[/center] [b]All Situations:[/b] [ol]
     · Holy Pal   [table][td][box] ... [center][symbol=...-herald-of-the-sun] Herald of the Sun
                  Stat Priority[/center] [hr] [ol]        (no fight-profile sub-label)
     · Prot War   [box] ... [center][b][color=q9]Survivability[/color] Stat Priority[/b]
                  [/center] [hr] [ol]                     (NO hero-talent symbol at all)
   So the card header is the last [center] before the list, the hero talent is filled ONLY from
   a [symbol=wow-hero-talent-*] INSIDE that header (bounding the scan is what stops a card
   without a symbol from inheriting the previous card's), and the fight profile is filled ONLY
   from a [b]Label:[/b] between the header and the list. Prot Warrior's "Survivability" / "DPS"
   is neither of those things, so both fields stay null and the published label carries it. */

const STAT_TOKENS = [
  [/critical strike|\bcrit\b/i, "Crit"], [/\bhaste\b/i, "Haste"],
  [/\bmastery\b|\bmast\b/i, "Mast"], [/versatility|\bvers\b/i, "Vers"],
  [/\bintellect\b/i, "Int"], [/\bagility\b/i, "Agi"], [/\bstrength\b/i, "Str"],
];

export function statsIn(text) {
  const found = [];
  for (const [pattern, token] of STAT_TOKENS) {
    const match = pattern.exec(text);
    if (match) found.push({ token, at: match.index });
  }
  return found.sort((a, b) => a.at - b.at).map((entry) => entry.token);
}

export function parseStatPriorities(markup) {
  const headings = markupHeadings(markup);
  const index = headings.findIndex((heading) =>
    /best stats for/i.test(heading.text) || /stat recommendations/i.test(headingToc(heading) ?? ""));
  if (index < 0) return [];
  const section = sectionAfter(markup, headings, index);

  const builds = [];
  const seen = new Set();
  for (const list of markupBlocks(section, "ol")) {
    const before = section.slice(0, list.start);
    const headers = [...before.matchAll(/\[center\]([\s\S]*?)\[\/center\]/g)];
    const header = headers.length ? headers[headers.length - 1] : null;
    if (!header) continue;
    const cardLabel = plainMarkup(header[1]).replace(/\s*stat priority\s*$/i, "").trim();
    if (!cardLabel) continue;
    const symbol = /\[symbol=wow-hero-talent-([a-z0-9-]+)\]/i.exec(header[1]);

    const between = before.slice(header.index + header[0].length);
    const labels = [...between.matchAll(/\[b\]([^[]*?):\s*\[\/b\]/g)];
    const fightProfile = labels.length ? normalizeText(labels[labels.length - 1][1]) : null;

    const label = fightProfile ? `${cardLabel}, ${fightProfile}` : cardLabel;
    const id = buildId(SOURCE, label);
    if (seen.has(id)) continue;
    seen.add(id);

    const entries = markupBlocks(list.raw, "li").map((li, i) => {
      const text = plainMarkup(li.raw);
      const stats = statsIn(text);
      return {
        rank: i + 1, text, stats,
        // "Haste = Crit" is a published TIE. Naming it beats silently ranking one above the
        // other, which is what a single-stat field would have forced.
        tie: stats.length > 1,
        softCap: parseSoftCap(text),
      };
    }).filter((entry) => entry.text);
    if (!entries.length) continue;

    builds.push({
      id, source: SOURCE, label,
      heroTalent: symbol ? { slug: symbol[1], name: cardLabel } : null,
      fightProfile, entries,
    });
  }
  return builds;
}

/* ---------- whole pages ---------- */

export function parseBisPage(html, { roster, url = null } = {}) {
  const markup = guideMarkupFrom(html);
  const skills = parseSkillNames(html);
  const npcs = parseNpcNames(html);
  const bis = parseBisPicks(markup, { roster, skills, npcs });
  const catalyze = parseCatalyzeAlternatives(markup, { roster, skills, npcs });
  return {
    page: { url, ...parseByline(html), ...parseSeason(markup),
      statPriorityUrl: statPriorityUrlFrom(markup) },
    picks: [...bis.picks, ...parseSectionAlternatives(markup), ...catalyze.alternatives],
    trinketTiers: parseTrinketTiers(markup),
    ambiguousSlots: [...bis.notes.ambiguousSlots, ...catalyze.notes.ambiguousSlots],
    unresolvedSources: [...bis.notes.unresolvedSources, ...catalyze.notes.unresolvedSources],
    unparsedCatalyze: catalyze.notes.unparsedCatalyze,
  };
}

/* ---------- cross-page repair of a stated source name ----------

   MEASURED across the roster, 2026-08-13. Wowhead's 40 gearing pages are written by 40 authors
   and they do not spell the shared bosses the same way. In one sweep of 13 specs:
     "The Coiled Alter"    (Restoration Druid)      guide 34251, spelt "The Coiled Altar" elsewhere
     "Entomed Sentinels"   (Restoration Druid)      guide 34245, "Entombed Sentinels" elsewhere
     "Sethraliss"          (Augmentation Evoker)    guide 34262, "Temple of Sethraliss" elsewhere
     "Nymrissa Wavebinder" (Restoration Druid)      guide 34240, "Nymrissa Wavecaller" elsewhere
     ""                    (several)                the anchor carries the link and no text
   Every one of these carries the SAME `guide=<id>` as the correctly-spelt occurrences. The id is
   the page's own link target, so preferring it over the page's own link text is not a guess — it
   is the same reasoning as the recorded Wowhead trap where the icon alt disagrees with the
   anchor text and the id wins.

   Two guards keep it honest: an id is only usable if every RESOLVED occurrence of it across the
   run agrees on one canonical source (guide 33272 is used both for "Kings Rest" and for the
   generic "Mythic+ Dungeons" link, so an ambiguous id is refused); and every repair is stamped
   `via: "guide-id"` with the text the page actually printed, so no surface can show a name we
   silently corrected. Anything the map cannot repair still fails the run. */
export function guideSourceMap(specs) {
  const seen = new Map();
  for (const spec of specs)
    for (const pick of spec.picks ?? [])
      for (const label of pick.sourceLabels ?? []) {
        if (!label.guideId || !label.resolved) continue;
        if (!["raid", "mplus"].includes(label.resolved.kind)) continue;
        if (!seen.has(label.guideId)) seen.set(label.guideId, new Map());
        seen.get(label.guideId).set(label.resolved.canonical, label.resolved.kind);
      }
  const map = new Map();
  for (const [guideId, canonicals] of seen)
    if (canonicals.size === 1) {
      const [canonical, kind] = [...canonicals][0];
      map.set(guideId, { kind, canonical });
    }
  return map;
}

/* Source CATEGORIES the guides publish that name no particular boss. Measured across the 40
   pages: "Vault", "Raid", "Mythic+", "BoE Trash Drop". They are honest answers to "where does
   this come from" and typing them is reading, not guessing — but they are tried only AFTER the
   guide-id map, because an id is more specific: `[url guide=34251]Raid[/url]` really does mean
   The Coiled Altar, and categorising it first would throw that away.

   HOW THIS RELATES TO lib-guides' OWN CATEGORY TYPING. The contract types some of these the
   moment it reads the text (vault, boe, pvp, delve). readSourceCell HOLDS that rather than
   taking it, exactly so this pass keeps its turn first; the held typing rides along on the
   label as `category`. This list stays the authority on what a category MEANS here for two
   reasons. It is wider where it needs to be — "Raid" and "Mythic+" as bare words are lanes the
   contract deliberately does not type, because they are the very labels a guide id can name a
   real boss for — and it is narrower where it needs to be, per this file's rule that only a
   label actually MEASURED on these pages is recognised and anything else fails the run so a
   human looks at what changed. A lane the contract knows and this list does not (a first
   "Delve" or "World Drop" on a Wowhead page) therefore still lands in `stillMissing`, with the
   contract's reading printed alongside it so the reviewer can see what it would have been.
   FLAGGED FOR THE CONTRACT OWNER: `trash` here and `boe` in lib-guides are the same fact under
   two names. If a second harvester ever needs to compare them, the shared string belongs in
   lib-guides — same call as the `tier-set` note above, and not one to make source-side. */
const GENERIC_SOURCES = [
  [/^(the )?(great )?vault$/i, "vault"],
  [/^raids?$/i, "raid-unspecified"],
  [/^(mythic\s*\+|mythic plus|m\+|dungeons?)$/i, "mplus-unspecified"],
  [/trash drop|^boe$/i, "trash"],
];

export function repairGuideSources(specs) {
  const map = guideSourceMap(specs);
  const repaired = [], categorised = [], stillMissing = [];
  for (const spec of specs) {
    const where = `${spec.class} ${spec.spec}`;
    for (const pick of spec.picks ?? []) {
      if (pick.source || !(pick.sourceLabels ?? []).length) continue;
      const hit = pick.sourceLabels.map((label) => label.guideId && map.get(label.guideId))
        .find(Boolean);
      if (hit) {
        pick.source = { ...hit, via: "guide-id", statedText: pick.sourceText };
        repaired.push(`${where}: "${pick.sourceText ?? ""}" -> ${hit.canonical}`);
        continue;
      }
      const generic = pick.sourceTexts?.map((text) =>
        GENERIC_SOURCES.find(([pattern]) => pattern.test(text))?.[1]).find(Boolean);
      if (generic) {
        pick.source = { kind: generic, canonical: pick.sourceText, via: "category" };
        categorised.push(`${where}: "${pick.sourceText}" -> ${generic}`);
        continue;
      }
      // A category lib-guides recognised but this file has never measured on a Wowhead page
      // still fails the run — but it fails NAMING what the contract read, so the reviewer is
      // deciding whether to add a measured label rather than starting from a blank.
      const held = pick.sourceLabels.map((label) => label.category).find(Boolean);
      stillMissing.push(`${where}: "${pick.sourceText ?? ""}" (item ${pick.itemId}`
        + `${pick.sourceLabels[0]?.guideId ? `, guide ${pick.sourceLabels[0].guideId}` : ""}`
        + `${held ? `; lib-guides reads this as "${held.kind}"` : ""})`);
    }
  }
  return { repaired, categorised, stillMissing };
}

/* ---------- G24: out-of-season picks ----------

   ORDERING IS THE WHOLE POINT HERE, AND IT IS THE OPPOSITE OF OBVIOUS. This must run AFTER
   `repairGuideSources`, never before. Wowhead's 40 pages are written by 40 authors who
   misspell shared bosses — "The Coiled Alter", "Entomed Sentinels", "Nymrissa Wavebinder" —
   and every one of those is a CURRENT-season boss whose name simply does not resolve as
   typed. Run the season drop first and all of them read as out-of-season content and get
   deleted: a typo would silently cost a real vote, which is the exact damage this file spends
   two hundred lines preventing. After the repair, a pick that still has no source is one no
   guide id, no category and no roster entry can place, and THAT is what G24 is about.

   So the candidate set is `!pick.source`, and among those only the ones that state something.
   A strip alternative carries no source text at all and is never dropped (its slot and its
   endorsement are real regardless of where the item comes from); nor is a category like
   "The Great Vault", which resolves through the contract and names a lane, not stale content. */
export function dropStalePicks(specs, roster) {
  const bySource = {}, bySpec = {}, byEndorsement = { bis: 0, alternative: 0 };
  let dropped = 0, kept = 0;
  if (!roster?.length)
    return { source: SOURCE, dropped: 0, kept: 0, byDropSource: [], bySpec: [], byEndorsement };

  const resolve = (text) => resolveDropSource(text, roster, { soft: true });
  for (const spec of specs ?? []) {
    const specName = `${spec.class} ${spec.spec}`;
    const candidates = (spec.picks ?? []).filter((pick) => !pick.source);
    const split = partitionStalePicks(candidates, resolve);
    const gone = new Set(split.dropped);
    spec.picks = (spec.picks ?? []).filter((pick) => !gone.has(pick));
    kept += spec.picks.length;
    for (const pick of gone) {
      dropped++;
      bySource[pick.sourceText] = (bySource[pick.sourceText] ?? 0) + 1;
      bySpec[specName] = (bySpec[specName] ?? 0) + 1;
      byEndorsement[pick.endorsement] = (byEndorsement[pick.endorsement] ?? 0) + 1;
    }
    spec.staleDrops = {
      dropped: gone.size,
      removed: [...gone].map((pick) => ({ slot: pick.slot, itemId: pick.itemId,
        label: pick.sourceText, section: pick.section })),
    };
  }
  return {
    source: SOURCE, dropped, kept,
    byDropSource: staleDisclosure(bySource),
    bySpec: staleDisclosure(bySpec).map(({ source, dropped: n }) => ({ spec: source, dropped: n })),
    byEndorsement,
  };
}

export function parseStatPage(html, { url = null } = {}) {
  const markup = guideMarkupFrom(html);
  return {
    page: { url, ...parseByline(html), ...parseSeason(markup) },
    builds: parseStatPriorities(markup),
  };
}

/* ---------- harvest ---------- */

export function specTargets(specs) {
  return specs.map((spec) => ({
    class: spec.class, spec: spec.spec, role: spec.role,
    classSlug: slugify(spec.class), specSlug: slugify(spec.spec),
  }));
}

export async function harvestSpec(target, { roster, fetchHtml = fetchGuideHtml } = {}) {
  const url = bisUrl(target.classSlug, target.specSlug);
  const bisFetch = await fetchHtml(url);
  if (!bisFetch.ok) return { ...target, error: `bis page ${bisFetch.reason}: ${url}` };
  const bis = parseBisPage(bisFetch.html, { roster, url });

  const statHref = bis.page.statPriorityUrl ?? statUrl(target.classSlug, target.specSlug, target.role);
  const statFetch = await fetchHtml(statHref);
  const stats = statFetch.ok ? parseStatPage(statFetch.html, { url: statHref })
    : { page: { url: statHref, author: null, updated: null, text: null, season: null }, builds: [] };

  return {
    source: SOURCE,
    class: target.class, spec: target.spec, role: target.role,
    classSlug: target.classSlug, specSlug: target.specSlug,
    pages: { bis: bis.page, statPriority: stats.page },
    picks: bis.picks,
    trinketTiers: bis.trinketTiers,
    builds: stats.builds,
    ambiguousSlots: bis.ambiguousSlots,
    unresolvedSources: bis.unresolvedSources,
    unparsedCatalyze: bis.unparsedCatalyze,
    statPage: { reachable: statFetch.ok, reason: statFetch.ok ? null : statFetch.reason },
  };
}

/* Baseline guard, same instinct as harvest-dungeons: a changed pick set is either real news or
   a broken parser, and the two look identical in a diff. Refuse, print, make a human say yes. */
export function pickSetChanges(previous, next) {
  const changes = [];
  const before = new Map((previous?.specs ?? []).map((s) => [`${s.class}/${s.spec}`, s]));
  for (const spec of next) {
    const key = `${spec.class}/${spec.spec}`;
    const old = before.get(key);
    if (!old) continue;
    const oldIds = new Set((old.picks ?? []).map((p) => `${p.endorsement}:${p.itemId}`));
    const newIds = new Set((spec.picks ?? []).map((p) => `${p.endorsement}:${p.itemId}`));
    const removed = [...oldIds].filter((id) => !newIds.has(id));
    const added = [...newIds].filter((id) => !oldIds.has(id));
    if (removed.length || added.length)
      changes.push(`${key}: removed=[${removed.join(",")}] added=[${added.join(",")}]`);
  }
  for (const key of before.keys())
    if (!next.some((spec) => `${spec.class}/${spec.spec}` === key)) changes.push(`${key}: missing from this run`);
  return changes;
}

async function main(argv) {
  const args = { specs: [], out: DEFAULT_OUT, dryRun: false, season: SEASON_NUMBER };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--spec") args.specs.push(argv[++i]);
    else if (argv[i] === "--out") args.out = argv[++i];
    else if (argv[i] === "--season") args.season = Number(argv[++i]);
    else if (argv[i] === "--dry-run") args.dryRun = true;
    else throw new Error(`unknown argument: ${argv[i]}`);
  }

  const [specsFile, raid, dungeons] = await Promise.all([
    readFile(join(ROOT, "data", "specs.json"), "utf8").then(JSON.parse),
    readFile(join(ROOT, "data", "raid-items.json"), "utf8").then(JSON.parse),
    readFile(join(ROOT, "data", "dungeon-items.json"), "utf8").then(JSON.parse),
  ]);
  const roster = rosterFrom(raid, dungeons);

  let targets = specTargets(specsFile.specs);
  if (args.specs.length) {
    const wanted = new Set(args.specs.map((value) => value.toLowerCase()));
    targets = targets.filter((t) => wanted.has(`${t.classSlug}/${t.specSlug}`));
    if (targets.length !== wanted.size)
      throw new Error(`--spec matched ${targets.length} of ${wanted.size} requested specs`);
  }

  let previous = null;
  try { previous = JSON.parse(await readFile(args.out, "utf8")); }
  catch (error) {
    if (error?.code !== "ENOENT")
      throw new Error(`cannot trust existing guide baseline: ${error.message}`, { cause: error });
  }

  console.log(`Harvesting Wowhead gearing guides for ${targets.length} spec(s) ...`);
  const specs = [];
  const unresolved = [];
  for (const target of targets) {
    const name = `${target.class} ${target.spec}`;
    let result;
    try { result = await harvestSpec(target, { roster }); }
    catch (error) {
      unresolved.push(`${name}: ${error.message}`);
      console.log(`  --   ${name.padEnd(26)} ${error.message}`);
      continue;
    }
    if (result.error) {
      unresolved.push(`${name}: ${result.error}`);
      console.log(`  --   ${name.padEnd(26)} ${result.error}`);
      continue;
    }
    if (result.pages.bis.season != null && result.pages.bis.season !== args.season) {
      unresolved.push(`${name}: bis page describes Season ${result.pages.bis.season}, expected ${args.season}`);
      console.log(`  --   ${name.padEnd(26)} season mismatch (${result.pages.bis.text})`);
      continue;
    }
    const bisPicks = result.picks.filter((pick) => pick.endorsement === "bis").length;
    if (!bisPicks) {
      unresolved.push(`${name}: no BiS picks parsed`);
      console.log(`  --   ${name.padEnd(26)} no BiS picks parsed`);
      continue;
    }
    specs.push(result);
    // A stat page we could not READ is a hole in the run; one Wowhead genuinely does not
    // publish is a fact about the source. Only the first refuses the write.
    if (result.statPage.reason === "unreachable")
      unresolved.push(`${name}: stat-priority page unreachable (${result.pages.statPriority.url})`);
    const flags = [
      result.statPage.reachable ? null : `stat page ${result.statPage.reason}`,
      result.ambiguousSlots.length ? `${result.ambiguousSlots.length} deferred slot(s)` : null,
      result.unresolvedSources.length ? `${result.unresolvedSources.length} unnamed source(s)` : null,
    ].filter(Boolean).join(" · ");
    console.log(`  ok   ${name.padEnd(26)} ${String(bisPicks).padStart(3)} picks  `
      + `${String(result.picks.length - bisPicks).padStart(3)} alternatives  `
      + `${String(result.trinketTiers.entries.length).padStart(3)} trinkets  `
      + `${String(result.builds.length).padStart(2)} builds${flags ? `  (${flags})` : ""}`);
    await sleep(250);   // two page fetches per spec; stay polite to the reader and to Wowhead
  }

  // Repair misspelt / empty source labels from the pages' own guide ids, then refuse on the rest.
  const { repaired, categorised, stillMissing } = repairGuideSources(specs);
  if (repaired.length) {
    console.log(`\n  ${repaired.length} source name(s) taken from the page's own guide id `
      + `rather than its text (stamped via: "guide-id"):`);
    for (const line of repaired) console.log(`    ${line}`);
  }
  if (categorised.length) {
    console.log(`\n  ${categorised.length} source(s) name a category rather than a drop `
      + `(stamped via: "category"):`);
    for (const line of categorised) console.log(`    ${line}`);
  }
  if (stillMissing.length) {
    console.log(`\n  ${stillMissing.length} source(s) no page in this run names resolvably:`);
    for (const line of stillMissing) console.log(`    ${line}`);
    // Default is to refuse — an unmatchable name is usually an upstream typo worth seeing, and
    // it is how "The Coiled Alter" surfaced at all. The pick itself is intact (slot, item and
    // endorsement all survive); only its provenance is missing, so a local run that has read
    // the list and accepts it can proceed, and the acceptance is written into the output.
    if (process.env.WOW_ACCEPT_UNNAMED_SOURCES === "1")
      console.warn(`  accepted ${stillMissing.length} unnamed source(s) by request`);
    else
      unresolved.push(`${stillMissing.length} unresolved drop source(s) `
        + "(rerun with WOW_ACCEPT_UNNAMED_SOURCES=1 to accept them as unnamed)");
  }
  const unparsedCatalyze = specs.flatMap((spec) =>
    spec.unparsedCatalyze.map((label) => `${spec.class} ${spec.spec}: ${label}`));
  if (unparsedCatalyze.length) {
    // A catalyse section that exists but yielded nothing is a layout we have not met.
    for (const line of unparsedCatalyze) console.log(`  !!   catalyse section not parsed — ${line}`);
    unresolved.push(`${unparsedCatalyze.length} unparsed catalyse section(s)`);
  }

  if (unresolved.length)
    throw new Error(`refusing to write ${args.out}: ${unresolved.join("; ")}`);

  /* G24, AFTER the repair pass above and after the refusal — a misspelt in-season boss must
     have had its chance to be repaired from the page's own guide id before anything decides
     it is out of season. */
  const stale = dropStalePicks(specs, roster);
  if (stale.dropped) {
    console.log(`\n  G24: dropped ${stale.dropped} pick(s) naming content ${SEASON.label} does not `
      + `hold, kept ${stale.kept} (bis ${stale.byEndorsement.bis} · alternative ${stale.byEndorsement.alternative})`);
    for (const row of stale.byDropSource) console.log(`    ${row.source}: ${row.dropped}`);
    for (const row of stale.bySpec) console.log(`    ${row.spec}: ${row.dropped}`);
  }

  const changes = pickSetChanges(previous, specs);
  if (changes.length && process.env.WOW_ACCEPT_GUIDE_CHANGES !== "1")
    throw new Error(`refusing to overwrite ${args.out}: pick set changed; audit the guides and `
      + `rerun with WOW_ACCEPT_GUIDE_CHANGES=1 if intentional:\n  ${changes.join("\n  ")}`);
  if (changes.length) console.warn(`  accepted reviewed guide changes: ${changes.join("; ")}`);

  const harvestedAt = new Date().toISOString().slice(0, 10);
  const out = {
    source: SOURCE,
    sourceLabel: SOURCE_LABEL,
    harvestedAt,
    season: { id: SEASON.id, label: SEASON.label, patch: SEASON.patch, opensAt: SEASON.opensAt,
      number: SEASON_NUMBER, predatesSeason: dataPredatesSeason(harvestedAt) },
    staleDrops: stale,
    note: "Guide picks only. Consensus counting lives in src/lib-guides.mjs; this file states "
      + "what each page published, never a ranking.",
    counts: {
      specs: specs.length,
      picks: specs.reduce((sum, s) => sum + s.picks.filter((p) => p.endorsement === "bis").length, 0),
      alternatives: specs.reduce((sum, s) => sum + s.picks.filter((p) => p.endorsement === "alternative").length, 0),
      trinketTiers: specs.reduce((sum, s) => sum + s.trinketTiers.entries.length, 0),
      builds: specs.reduce((sum, s) => sum + s.builds.length, 0),
      deferredSlots: specs.reduce((sum, s) => sum + s.ambiguousSlots.length, 0),
      sourcesFromGuideId: repaired.length,
      sourcesByCategory: categorised.length,
      unnamedSources: stillMissing.length,
      staleDropped: stale.dropped,
    },
    unnamedSources: stillMissing,
    specs,
  };

  if (args.dryRun) {
    console.log(`\ndry run — nothing written\n  ${JSON.stringify(out.counts)}`);
    return;
  }
  await mkdir(dirname(args.out), { recursive: true });
  await writeFile(args.out, JSON.stringify(out, null, 2), "utf8");
  console.log(`\nwrote ${args.out}\n  ${JSON.stringify(out.counts)}`);
}

// Importable: the parsers are tested against recorded fixtures, so main() must not run on import.
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url)
  await main(process.argv.slice(2));
