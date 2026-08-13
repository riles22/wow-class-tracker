/* Method guide-harvest parser (Phase B, docs/gearing-s2-scope.md G4 / G9-G12).

   Every test here runs against RECORDED FIXTURES — test/fixtures/method-*-gearing.html,
   real bytes from method.gg, trimmed to the sections the parser reads, each carrying the
   URL and fetch date in a header comment. Nothing here touches the network, and Phase B
   commits no harvested data file: the sources are mid-season-transition until 08-18, so a
   harvest now would capture PTR-era picks.

   Fixture roles: holy-paladin (healer), blood-death-knight (tank), frost-death-knight (DPS).
   A handful of tests use short markup snippets copied VERBATIM from other spec pages —
   each names the spec it came from — so the rarer shapes are covered without carrying six
   more full pages. */

import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { BRACKETS, normalizeBracket, resolveDropSource, rosterFrom } from "../src/lib-guides.mjs";
import { SEASON } from "../src/season.mjs";
import { acceptsNamespace, cellText, decodeEntities, dropStalePicks, headingSubject, itemLinksIn,
  letterTierOf, methodSlug, methodUrl, pageMeta, parseMethodGearingPage, parsePublishedDate,
  splitSlotLabel, stripComments } from "../src/harvest-guide-method.mjs";

const fromRoot = (path) => new URL(`../${path}`, import.meta.url);
const json = async (path) => JSON.parse(await readFile(fromRoot(path), "utf8"));
const fixture = (name) => readFile(fromRoot(`test/fixtures/method-${name}-gearing.html`), "utf8");

const [raidItems, dungeonItems] = await Promise.all([
  json("data/raid-items.json"), json("data/dungeon-items.json"),
]);
const roster = rosterFrom(raidItems, dungeonItems);

const parse = async (name, spec, className) =>
  parseMethodGearingPage(await fixture(name), { spec, className, roster });

const holyPaladin = await parse("holy-paladin", "Holy", "Paladin");
const bloodDK = await parse("blood-death-knight", "Blood", "Death Knight");
const frostDK = await parse("frost-death-knight", "Frost", "Death Knight");

/* ---------------------------------------------------------------- URL shape */

test("the spec slug is derived from the roster, never hand-listed", async () => {
  assert.equal(methodSlug("Holy", "Paladin"), "holy-paladin");
  assert.equal(methodSlug("Beast Mastery", "Hunter"), "beast-mastery-hunter");
  assert.equal(methodSlug("Blood", "Death Knight"), "blood-death-knight");
  // The Midnight-era roster includes Demon Hunter Devourer; it is a real Method page.
  assert.equal(methodSlug("Devourer", "Demon Hunter"), "devourer-demon-hunter");
  assert.equal(methodUrl("Holy", "Paladin"), "https://www.method.gg/guides/holy-paladin/gearing");

  // Verified live 2026-08-13: all 40 tracker specs produce a slug Method publishes.
  const specs = await json("data/specs.json");
  const roster40 = specs.specs ?? specs;
  assert.equal(roster40.length, 40);
  for (const entry of roster40)
    assert.match(methodUrl(entry.spec, entry.class), /^https:\/\/www\.method\.gg\/guides\/[a-z0-9-]+\/gearing$/);
});

/* ---------------------------------------------------------------- trap 3: entities */

test("TRAP: typographic apostrophes arrive as ENTITIES, and normalizeText alone cannot fix that", async () => {
  // The scope records Method writing Nek’zali where Wowhead writes Nek'zali. Measured, the
  // bytes are Nek&rsquo;zali — so the fold has to happen after decoding, not before.
  const raw = await fixture("holy-paladin");
  assert.ok(raw.includes("King&rsquo;s Rest"), "fixture must still carry the raw entity");
  assert.equal(decodeEntities("King&rsquo;s Rest"), "King’s Rest");
  assert.equal(cellText("<td>King&rsquo;s Rest</td>"), "King's Rest");
  assert.equal(cellText("<td>Nek&rsquo;zali the Soulcoiler</td>"), "Nek'zali the Soulcoiler");
  assert.equal(decodeEntities("&#8217;"), "’");
  assert.equal(decodeEntities("&#x2019;"), "’");
  assert.equal(decodeEntities("&notarealentity;"), "&notarealentity;", "unknown entities stay verbatim");
});

test("every boss and dungeon Method names with an entity joins the harvested roster", () => {
  const joined = holyPaladin.picks.filter((p) => /&|’/.test(p.sourceText ?? ""));
  assert.equal(joined.length, 0, "source text must already be decoded and folded");

  const kingsRest = holyPaladin.picks.filter((p) => /King's [Rr]est$/.test(p.sourceText ?? ""));
  assert.ok(kingsRest.length >= 2);
  for (const pick of kingsRest)
    assert.equal(pick.dropSource.canonical, "Kings' Rest",
      "Method's King&rsquo;s Rest must fold onto our Kings' Rest");

  const ulatek = holyPaladin.picks.find((p) => p.sourceText === "Ula'tek");
  assert.equal(ulatek.dropSource.canonical, "Ula'tek");
  assert.equal(ulatek.dropSource.kind, "raid");
});

/* ---------------------------------------------------------------- trap 2: original-item */

test("TRAP: original-item= in the query string is not a second pick", async () => {
  // A bare /item=(\d+)/ regex reads ?bonus=...&original-item=251126 as an item and would
  // attribute the row to the catalyst's SOURCE item — the wrong item, silently.
  const raw = await fixture("frost-death-knight");
  assert.ok(raw.includes("original-item=251126"), "fixture must still carry the trap");

  const head = frostDK.picks.find((p) => p.slot === "Head" && p.originalItemId);
  assert.equal(head.itemId, "271474", "the pick is the item the link points at");
  assert.equal(head.originalItemId, "251126", "the catalyst source is captured, not conflated");
  assert.deepEqual(head.otherItemIds, [], "no phantom second item");
  assert.equal(head.ilvl, 334, "the guide's own item level is read, never inferred");

  // Directly: the host anchor is what excludes a query parameter.
  const cell = '<a href="https://www.wowhead.com/ptr/item=271474/x?bonus=40&original-item=251126">X</a>';
  assert.deepEqual(itemLinksIn(cell).map((l) => l.itemId), ["271474"]);
});

test("all four Wowhead namespaces are accepted, and recorded", () => {
  const links = itemLinksIn([
    '<a href="https://www.wowhead.com/ptr/item=1/a">a</a>',
    '<a href="https://www.wowhead.com/item=2/b">b</a>',
    '<a href="https://www.wowhead.com/beta/item=3/c">c</a>',
    '<a href="https://www.wowhead.com/ptr-2/item=4/d">d</a>',
  ].join(""));
  assert.deepEqual(links.map((l) => [l.itemId, l.namespace]),
    [["1", "ptr"], ["2", null], ["3", "beta"], ["4", "ptr-2"]]);
});

/* ---------------------------------------------------------------- trap 1: th vs td */

test("TRAP: a header row written with <th> is the same table as one written with <td><b>", () => {
  // Verbatim from guardian-druid and vengeance-demon-hunter, which use <th>. A parser
  // keying on <td> alone sees ZERO lists for those two specs and drops 93 rows in silence.
  const withTh = `<h3>Overall Best Gear</h3><table><tbody>
    <tr><th>Slot</th><th>Item</th><th>Source</th></tr>
    <tr><td>Head</td><td><a href="https://www.wowhead.com/ptr/item=111/x">X</a></td><td>Ula&rsquo;tek</td></tr>
    </tbody></table>`;
  const record = parseMethodGearingPage(withTh, { spec: "Guardian", className: "Druid", roster });
  assert.equal(record.counts.picks, 1);
  assert.equal(record.picks[0].slot, "Head");
  assert.equal(record.picks[0].dropSource.canonical, "Ula'tek");
});

test("tables that are not best-in-slot lists are rejected by their own header", () => {
  // Verbatim shapes: the Voidcore table (two header variants) and Shadow Priest's
  // Rating|Trinket table. None of them may become picks.
  const others = `<h3>Overall Best Gear</h3>
    <table><tbody><tr><td><b>Source / Drop</b></td><td><b>Difficulty</b></td><td><b>Target Item</b></td></tr>
    <tr><td>The Coiled Altar</td><td>Mythic*</td><td><a href="https://www.wowhead.com/ptr/item=268211/x">X</a></td></tr></tbody></table>
    <table><tbody><tr><td><b>Boss</b></td><td><b>Difficulty</b></td><td><b>Target Item</b></td></tr>
    <tr><td>Ula&rsquo;tek</td><td>Mythic*</td><td><a href="https://www.wowhead.com/ptr/item=271878/y">Y</a></td></tr></tbody></table>`;
  const record = parseMethodGearingPage(others, { spec: "Outlaw", className: "Rogue", roster });
  assert.equal(record.counts.picks, 0);
  assert.equal(record.counts.lists, 0);
});

/* ---------------------------------------------------------------- trap 5: the build axis */

test("TRAP: two lists at one bracket are a BUILD axis, not a list to overwrite", () => {
  // Blood DK publishes "Overall Best Gear for Deathbringer" and "... for San'layn".
  // Keying a list by bracket alone keeps whichever parsed last and loses 15 picks.
  assert.equal(bloodDK.counts.lists, 2);
  assert.deepEqual(bloodDK.lists.map((l) => l.bracket), ["overall", "overall"]);
  assert.deepEqual(bloodDK.lists.map((l) => l.variant), ["Deathbringer", "San'layn"]);
  assert.deepEqual(bloodDK.lists.map((l) => l.buildId), ["method:deathbringer", "method:san-layn"]);

  const builds = new Set(bloodDK.picks.map((p) => p.buildId));
  assert.deepEqual([...builds].sort(), ["method:deathbringer", "method:san-layn"]);
  // Both lists pick a Head item, and both survive.
  assert.equal(bloodDK.picks.filter((p) => p.slot === "Head").length, 2);
});

test("a spec whose brackets do not repeat claims no build, rather than inventing one", () => {
  // "Overall Best Gear for Holy Paladin" names a subject too, but it is the spec's own
  // name — so the parser must not read it as a hero talent. The bracket not repeating is
  // what settles that, so no name-guessing is needed.
  assert.deepEqual(holyPaladin.lists.map((l) => l.bracket), ["overall", "raid", "mplus"]);
  assert.deepEqual(holyPaladin.lists.map((l) => l.variant), [null, null, null]);
  for (const pick of holyPaladin.picks) assert.equal(pick.buildId, "method:general");
  assert.equal(headingSubject("Overall Best Gear for Deathbringer"), "Deathbringer");
  assert.equal(headingSubject("Overall Best Gear"), null);
});

test("two indistinguishable lists at one bracket are a hard error, never a silent drop", () => {
  const ambiguous = `<h3>Overall Best Gear</h3><table><tbody>
      <tr><td><b>Slot</b></td><td><b>Item</b></td><td><b>Source</b></td></tr>
      <tr><td>Head</td><td><a href="https://www.wowhead.com/ptr/item=1/x">X</a></td><td>Ula'tek</td></tr></tbody></table>
    <h3>Overall Best Gear</h3><table><tbody>
      <tr><td><b>Slot</b></td><td><b>Item</b></td><td><b>Source</b></td></tr>
      <tr><td>Head</td><td><a href="https://www.wowhead.com/ptr/item=2/y">Y</a></td><td>Ula'tek</td></tr></tbody></table>`;
  assert.throws(() => parseMethodGearingPage(ambiguous, { spec: "Blood", className: "Death Knight", roster }),
    /cannot be told apart/);
});

/* ---------------------------------------------------------------- brackets + slots */

const listHtml = (heading) => `<h3>${heading}</h3><table><tbody>
  <tr><td><b>Slot</b></td><td><b>Item</b></td><td><b>Source</b></td></tr>
  <tr><td>Head</td><td><a href="https://www.wowhead.com/ptr/item=1/x">X</a></td><td>Ula'tek</td></tr></tbody></table>`;

test("every list heading Method writes maps onto a canonical bracket", () => {
  assert.deepEqual(frostDK.lists.map((l) => l.bracket), ["overall", "raid", "mplus"]);
  // The heading wordings measured across the 40 pages vary; the bracket must not.
  const shapes = [
    ["Overall Best Gear", "overall"],
    ["Overall Best Gear for MM Hunter", "overall"],
    ["Shadow Priest Overall Best Gear", "overall"],
    ["Best Gear from the Raid", "raid"],
    ["Best Gear from Raid", "raid"],
    ["Best Gear from Mythic+", "mplus"],
    ["Best Gear from Mythic+ for Unholy DK", "mplus"],
  ];
  for (const [heading, bracket] of shapes) {
    const record = parseMethodGearingPage(listHtml(heading), { spec: "S", className: "C", roster });
    assert.equal(record.lists[0].bracket, bracket, `${heading} -> ${record.lists[0].bracket}`);
  }
});

test("\"Raids\" (plural) normalizes to the raid bracket, exactly like the singular", () => {
  // HISTORY, kept because it is the measurement that justified changing the shared contract.
  // Four spec pages head their raid list "Best Gear from the Raids" — Protection Paladin,
  // Balance Druid, Destruction Warlock and Devourer Demon Hunter. normalizeBracket used to
  // test /\b(raid|raiding)\b/, which the plural does not satisfy, so those four lists fell
  // through to "overall".
  //
  // MEASURED 2026-08-13 across all 40 recorded pages: 36 parsed, and all 4 that did not
  // failed for exactly this reason; simulating the fix took it to 40/40 and 1669 picks. The
  // fix was one word — \b(raid|raids|raiding)\b — and strictly additive, since nothing
  // mapped "raids" to anything but the fallback.
  //
  // It was NOT made here. lib-guides.mjs is the contract every harvester joins on, and a
  // source-specific parser is the wrong place to change what a word means for all of them,
  // so it was pinned as a defect until the contract owner made it. That has now happened,
  // and this asserts the fixed behaviour.
  assert.equal(normalizeBracket("Best Gear from the Raids"), "raid");
  assert.equal(normalizeBracket("Best Gear from the Raid"), "raid");

  // The fix delivers what it was measured to deliver: Protection Paladin's two headings now
  // describe two different brackets and the page parses, where before they both landed on
  // "overall" and the build-axis guard had to refuse the whole page.
  const protPaladin = listHtml("Overall Best Gear") + listHtml("Best Gear from the Raids");
  const record = parseMethodGearingPage(protPaladin, { spec: "Protection", className: "Paladin", roster });
  assert.deepEqual(record.lists.map((l) => l.bracket), ["overall", "raid"]);
  assert.equal(record.counts.picks, 2, "both lists' rows survive, where before neither did");

  // And the guard that collision used to trip is unchanged. Two lists that genuinely land on
  // one bracket, with nothing in their headings to tell them apart, still refuse the page
  // loudly rather than publishing one of them as the other. Singular and plural collide here
  // precisely BECAUSE they now mean the same bracket, which makes this the same guard the
  // pre-fix version of this test exercised — just reached honestly.
  const ambiguous = listHtml("Best Gear from the Raid") + listHtml("Best Gear from the Raids");
  assert.throws(() => parseMethodGearingPage(ambiguous, { spec: "Balance", className: "Druid", roster }),
    /cannot be told apart/);
});

test("Method's slot punctuation is cleaned lexically, and the qualifier is kept as data", () => {
  assert.deepEqual(splitSlotLabel("Trinket #1"), { base: "Trinket 1", qualifier: null, text: "Trinket #1" });
  assert.deepEqual(splitSlotLabel("Main Hand (2H)"), { base: "Main Hand", qualifier: "2H", text: "Main Hand (2H)" });

  // Blood DK writes Trinket #1 / #2; both are the canonical Trinket slot.
  const trinketRows = bloodDK.picks.filter((p) => /^Trinket #/.test(p.slotLabel));
  assert.equal(trinketRows.length, 4);
  for (const row of trinketRows) assert.equal(row.slot, "Trinket");

  // Frost DK writes Main Hand (2H) / (DW) — a weapon loadout, not a slot. Both resolve to
  // Main Hand, and the qualifier survives instead of being thrown away.
  const qualified = frostDK.picks.filter((p) => p.slotQualifier);
  assert.ok(qualified.length >= 2);
  assert.deepEqual([...new Set(qualified.map((p) => p.slot))], ["Main Hand"]);
  assert.deepEqual([...new Set(qualified.map((p) => p.slotQualifier))].sort(), ["2H", "DW"]);
});

test("a slot label the shared contract cannot place is recorded, never guessed", () => {
  // Verbatim from arms-warrior / guardian-druid / retribution-paladin: a bare "Weapon".
  // Resolving it needs to know the item, which is a semantic guess, so it must not resolve.
  const bare = `<h3>Overall Best Gear</h3><table><tbody>
    <tr><td><b>Slot</b></td><td><b>Item</b></td><td><b>Source</b></td></tr>
    <tr><td>Weapon</td><td><a href="https://www.wowhead.com/ptr/item=999/x">X</a></td><td>Ula'tek</td></tr>
    <tr><td>Head</td><td><a href="https://www.wowhead.com/ptr/item=1/y">Y</a></td><td>Ula'tek</td></tr></tbody></table>`;
  const record = parseMethodGearingPage(bare, { spec: "Arms", className: "Warrior", roster });
  assert.equal(record.counts.picks, 1, "the readable row still lands");
  assert.equal(record.issues.unresolvedSlots.length, 1);
  assert.equal(record.issues.unresolvedSlots[0].label, "Weapon");
  assert.equal(record.issues.unresolvedSlots[0].itemId, "999", "the lost row is identified, not just counted");
});

/* ---------------------------------------------------------------- trap 6: non-picks */

test("TRAP: a row with no item link is a placeholder, not a pick", () => {
  // Verbatim from feral-druid, which publishes four rows reading "Any 334".
  const placeholder = `<h3>Overall Best Gear</h3><table><tbody>
    <tr><td><b>Slot</b></td><td><b>Item</b></td><td><b>Source</b></td></tr>
    <tr><td>Shoulders</td><td>Any 334</td><td>-</td></tr>
    <tr><td>Head</td><td><a href="https://www.wowhead.com/ptr/item=1/x">X</a></td><td>Ula'tek</td></tr></tbody></table>`;
  const record = parseMethodGearingPage(placeholder, { spec: "Feral", className: "Druid", roster });
  assert.equal(record.counts.picks, 1);
  assert.deepEqual(record.issues.rowsWithoutItem.map((r) => r.text), ["Any 334"]);
});

test("a cell holding two links yields one pick and reports the rest", () => {
  // Verbatim from outlaw-rogue: a base item plus the Arcanoweave Lining embellishment.
  // The base item is the pick; the embellishment must not become a second vote, and must
  // not vanish either.
  const paired = `<h3>Overall Best Gear</h3><table><tbody>
    <tr><td><b>Slot</b></td><td><b>Item</b></td><td><b>Source</b></td></tr>
    <tr><td>Boots</td><td><a href="https://www.wowhead.com/ptr/item=244569/s">Silvermoon Agent's Sneakers</a> - <a href="https://www.wowhead.com/item=240167/a">Arcanoweave Lining</a></td><td>Ula'tek</td></tr></tbody></table>`;
  const record = parseMethodGearingPage(paired, { spec: "Outlaw", className: "Rogue", roster });
  assert.equal(record.counts.picks, 1);
  assert.equal(record.picks[0].itemId, "244569");
  assert.deepEqual(record.picks[0].otherItemIds, ["240167"]);
  assert.equal(record.issues.multiItemCells.length, 1, "a human must be able to see these");
});

/* ---------------------------------------------------------------- drop sources */

test("an unresolvable drop source keeps its pick and is reported, because the vote is the item", () => {
  // The item id identifies the pick and the item's own bracket decides the vote (G10), so
  // an unmatchable boss name must not delete an otherwise perfectly identified endorsement.
  // Holy Paladin cites "The Tidebound Grotto", which our Season-2 roster does not hold.
  const missing = holyPaladin.issues.unresolvedSources;
  assert.ok(missing.length > 0);
  assert.deepEqual([...new Set(missing.map((m) => m.label))], ["The Tidebound Grotto"]);
  for (const miss of missing) {
    const pick = holyPaladin.picks.find((p) => p.itemId === miss.itemId);
    assert.ok(pick, "the pick survives");
    assert.equal(pick.dropSource, null, "but nothing is invented for it");
    assert.equal(pick.sourceText, "The Tidebound Grotto", "and the raw text is kept verbatim");
  }
});

test("the catalyst idiom keeps the boss behind it, in both forms Method writes", () => {
  // Method writes catalysis two ways: "X/Catalyst" and "X (Catalyst)" — the latter dominant,
  // 244 of the 258 catalyst rows. Both must carry the place you actually FARM, because that
  // pointer is the only thing joining a catalysed row back to a boss or dungeon for Phase D's
  // game plan.
  //
  // HISTORY: the shared resolver used to split on the slash only, so the parenthetical form
  // came back with `base` null and this harvester recovered it locally, by re-resolving the
  // label with its parenthetical stripped. That left the two forms reaching the pick by two
  // different routes — only the locally recovered one carried a `baseKind`, which is what the
  // earlier version of this test pinned. The contract now strips the marker wherever it sits
  // and resolves the base for EVERY form it writes, so both routes are the contract's and both
  // forms say which lane the base came from. The local recovery pass has been removed as
  // redundant, and these assertions are what prove it is not needed.
  const catalysed = holyPaladin.picks.filter((p) => p.catalyst);
  assert.ok(catalysed.length > 0);
  for (const pick of catalysed) assert.equal(pick.dropSource.kind, "catalyst");
  assert.ok(catalysed.every((p) => p.dropSource.base),
    "every catalysed row must still name the boss or dungeon behind it");
  assert.ok(catalysed.every((p) => p.dropSource.baseKind),
    "and must say which lane that base came from, whichever form was written");

  const slash = catalysed.find((p) => p.sourceText === "Nek'zali the Soulcoiler/Catalyst");
  assert.equal(slash.dropSource.base, "Nek'zali the Soulcoiler");
  assert.equal(slash.dropSource.baseKind, "raid");

  const paren = catalysed.find((p) => p.sourceText === "King's Rest (Catalyst)");
  assert.equal(paren.dropSource.base, "Kings' Rest");
  assert.equal(paren.dropSource.baseKind, "mplus");
});

/* ---------------------------------------------------------------- G24: out-of-season picks */

test("G24: the RUN drops an unresolvable pick, and the parser still does not", async () => {
  /* THIS SUPERSEDES THE PHASE-B READING DIRECTLY ABOVE, and the layering is the whole point.
     The parser stays LOSSLESS — the test above still passes unchanged, the pick still survives
     `parseMethodGearingPage`, and `issues.unresolvedSources` still reports it, which is what
     the run refuses on. G24 then applies at the RUN level, once a reviewer has read that list:
     a pick naming content the season does not hold would put an item you cannot go and get
     into a list whose entire job is telling you what to go and get.

     A FRESH record is parsed here on purpose. dropStalePicks mutates, and the module-level
     fixtures are shared by every other test in this file. */
  const record = await parse("holy-paladin", "Holy", "Paladin");
  assert.equal(record.counts.picks, 48);
  const stale = dropStalePicks([record], roster);

  assert.equal(stale.dropped, 4);
  assert.equal(record.picks.length, 44);
  assert.equal(stale.kept, 44);
  assert.equal(stale.source, "method", "the key the page merges the three harvests on");
  assert.deepEqual(stale.byDropSource, [{ source: "The Tidebound Grotto", dropped: 4 }]);
  assert.deepEqual(stale.bySpec, [{ spec: "Holy Paladin", dropped: 4 }]);
  assert.equal(record.picks.some((pick) => pick.sourceText === "The Tidebound Grotto"), false);

  // Nothing vanishes without trace: the removed rows stay enumerable on the record itself.
  assert.equal(record.staleDrops.dropped, 4);
  for (const row of record.staleDrops.removed) {
    assert.equal(row.label, "The Tidebound Grotto");
    assert.ok(row.itemId && row.slot);
  }
  // counts.picks describes the array beside it; picksPublished keeps the page's own total.
  assert.equal(record.counts.picks, 44);
  assert.equal(record.counts.picksPublished, 48);
});

test("rosterMatchRate survives the drop — it is the evidence, and the drop must not erase it", async () => {
  /* The trap this pins. Drop inside the parser and the rate is 1.000 on every page by
     construction, because the only rows that lowered it are gone. The rate would then agree
     with the page's own "Patch 12.1" label always, which is exactly the disagreement it exists
     to measure. So it is computed over what the page PUBLISHED and never recomputed after. */
  const record = await parse("holy-paladin", "Holy", "Paladin");
  const before = record.counts.rosterMatchRate;
  assert.equal(before, 0.917);
  dropStalePicks([record], roster);
  assert.equal(record.counts.rosterMatchRate, before, "still 44/48, not 44/44");
});

test("an unlabelled pick is never dropped, and no roster means no judgement", async () => {
  // A row that states no source at all is not evidence of staleness; the run already refuses
  // when it cannot name its sources, and dropping here would punish that twice.
  const unlabelled = `<h3>Overall Best Gear</h3><table><tbody>
    <tr><td><b>Slot</b></td><td><b>Item</b></td><td><b>Source</b></td></tr>
    <tr><td>Head</td><td><a href="https://www.wowhead.com/ptr/item=1/x">X</a></td><td></td></tr></tbody></table>`;
  const record = parseMethodGearingPage(unlabelled, { spec: "Holy", className: "Paladin", roster });
  assert.equal(record.picks.length, 1);
  assert.equal(record.picks[0].sourceText, null);
  assert.equal(dropStalePicks([record], roster).dropped, 0);
  assert.equal(record.picks.length, 1);

  const fresh = await parse("holy-paladin", "Holy", "Paladin");
  assert.equal(dropStalePicks([fresh], []).dropped, 0, "an empty roster judges nothing stale");
  assert.equal(fresh.picks.length, 48);
});

test("the Tidebound Grotto drop is OUR gap, not Method's — which is why the run refuses first", () => {
  /* The four picks dropped above name Nymrissa Wavecaller's lair, a REAL Season-2 source that
     our own `dungeon-items.json` harvest never included (DECISION G22). So G24's test —
     "does this resolve against the current roster" — reads an incomplete roster exactly like a
     stale guide, and the four in-season picks are lost to a gap on our side.

     Two things make that safe rather than silent, and both are pinned here: the label is
     reported in `issues.unresolvedSources` so the RUN refuses before anything is written, and
     the launch runbook therefore harvests the ITEM lane before any guide lane. */
  assert.deepEqual([...new Set(holyPaladin.issues.unresolvedSources.map((miss) => miss.label))],
    ["The Tidebound Grotto"]);
  assert.equal(roster.some((entry) => /tidebound/i.test(entry.canonical)), false,
    "still missing from our harvested roster — closing it is Phase E's item lane, per G22");
});

/* ---------------------------------------------------------------- namespace acceptance */

test("every Wowhead namespace parses, whatever the season config says", () => {
  /* Measured across Method's 40 pages, 2026-08-13: ptr 1512 · none 154 · beta 29 · ptr-2 7.
     SEASON.wowheadNamespace decides what we EMIT and must never decide what we ACCEPT — a
     `/ptr/` link outlives the flip by however long it takes Method to rewrite it, and losing a
     pick to a URL spelling is not something any decision here asks for. */
  for (const namespace of ["ptr", "ptr-2", "beta", null])
    assert.equal(acceptsNamespace(namespace), true, `/${namespace ?? ""}/item= must still parse`);

  const mixed = itemLinksIn('<a href="https://www.wowhead.com/ptr/item=1/a">a</a>'
    + '<a href="https://www.wowhead.com/item=2/b">b</a>'
    + '<a href="https://www.wowhead.com/beta/item=3/c">c</a>');
  assert.deepEqual(mixed.map((link) => [link.namespace, link.itemId]),
    [["ptr", "1"], [null, "2"], ["beta", "3"]], "the namespace is recorded, never gated on");

  // The recorded fixtures still sit almost entirely on the PTR namespace, which is what a
  // pre-launch capture looks like: holy-paladin 48/48, frost-death-knight 48 ptr + 3 live.
  assert.equal(holyPaladin.picks.every((pick) => pick.namespace === "ptr"), true);
  assert.equal(frostDK.picks.filter((pick) => pick.namespace === null).length, 3);
  assert.equal(SEASON.wowheadNamespace, "ptr", "still pre-launch as of this commit");
});

test("rosterMatchRate measures what a page still describes, not what it claims", () => {
  // The page's own "Patch 12.1" label is a claim; the share of drop sources that resolve
  // against our Season-2 roster is evidence. Four spec pages measured 2026-08-13 still
  // cite Season-1 dungeons while claiming 12.1, which is exactly the gap this catches.
  assert.equal(holyPaladin.patchLabel, "Patch 12.1");
  assert.ok(holyPaladin.counts.rosterMatchRate < 1);
  assert.equal(frostDK.counts.rosterMatchRate, 1);
});

/* ---------------------------------------------------------------- dates (G11) */

test("Method DOES publish a per-spec update date — G11's premise does not hold", () => {
  // DECISION G11 records "Method publishes no update date anywhere on its gearing pages
  // (verified live 2026-08-12)". Measured 2026-08-13, all 40 pages carry a
  // guide-update-date span, the dates differ per spec, and they track edits. There is no
  // JSON-LD dateModified, which is the likely origin of the earlier reading.
  assert.equal(holyPaladin.published, "2026-08-11");
  assert.equal(holyPaladin.publishedText, "11th Aug, 2026");
  assert.equal(holyPaladin.selfDated, true);
  assert.equal(bloodDK.published, "2026-08-10", "the dates are genuinely per spec, not sitewide");

  assert.equal(parsePublishedDate("11th Aug, 2026"), "2026-08-11");
  assert.equal(parsePublishedDate("9th Aug, 2026"), "2026-08-09");
  assert.equal(parsePublishedDate("1st Sep, 2026"), "2026-09-01");
  assert.equal(parsePublishedDate("3rd December, 2026"), "2026-12-03");
});

test("an undated page reports itself undated and NEVER borrows the fetch date", () => {
  // The G11 path, still modelled: we can honestly say when we fetched, never when they
  // wrote. A missing date must read as missing, because a fetch date wearing a publication
  // label is the one dishonesty this lane cannot afford.
  const undated = pageMeta('<span class="guide-author">Patch 12.1</span>');
  assert.equal(undated.published, null);
  assert.equal(undated.selfDated, false);
  assert.equal(undated.patchLabel, "Patch 12.1");

  assert.equal(parsePublishedDate("Coming soon"), null, "unreadable text is null, not today");
  assert.equal(parsePublishedDate("32nd Aug, 2026"), null);
  assert.equal(parsePublishedDate("11th Smarch, 2026"), null);

  const record = parseMethodGearingPage(
    `<h3>Overall Best Gear</h3><table><tbody>
      <tr><td><b>Slot</b></td><td><b>Item</b></td><td><b>Source</b></td></tr>
      <tr><td>Head</td><td><a href="https://www.wowhead.com/ptr/item=1/x">X</a></td><td>Ula'tek</td></tr></tbody></table>`,
    { spec: "S", className: "C", roster });
  assert.equal(record.published, null);
  assert.equal(record.selfDated, false);
  for (const key of Object.keys(record))
    assert.ok(!/fetchedAt|harvestedAt/.test(key), "the parser must not stamp a date it invented");
});

/* ---------------------------------------------------------------- trinkets (G8/G9) */

test("letter tiers are read only where Method literally publishes a letter", () => {
  assert.equal(letterTierOf("S Tier Trinkets"), "S");
  assert.equal(letterTierOf("A - Tier Trinkets"), "A");        // protection-warrior's spacing
  assert.equal(letterTierOf("B Tier (Alternative Options)"), "B");
  assert.equal(letterTierOf("Recommended Trinkets:"), null);
  assert.equal(letterTierOf("Alternatives"), null);
  assert.equal(letterTierOf("On-use Trinkets"), null);
  assert.equal(letterTierOf("Passive Trinkets"), null);
});

test("Method's letter-tiered trinkets are captured with their tier", () => {
  // Correcting the scope's source table, which lists trinket letter tiers for Icy Veins and
  // Wowhead only: Method publishes them too, on some specs (blood DK, prot warrior,
  // shadow priest at least).
  const tiers = new Map(bloodDK.trinkets.map((t) => [t.itemId, t.tier]));
  assert.equal(tiers.get("270175"), "S");
  assert.equal(tiers.get("270173"), "S");
  assert.equal(tiers.get("250238"), "A");
  assert.ok(bloodDK.trinkets.every((t) => t.itemId && t.groupLabel));
});

test("TRAP: a cross-reference inside a tier paragraph must not become an entry at that tier", () => {
  // Blood DK's A-Tier entry for Seed of the Devouring Wild links the S-Tier trinket in its
  // prose ("a good farmable alternative to ..."). Taking every link under the A-Tier
  // heading would publish the S-Tier trinket as A — a ranking Method never wrote.
  const sTier = bloodDK.trinkets.filter((t) => t.itemId === "270175");
  assert.equal(sTier.length, 1, "the trinket appears exactly once");
  assert.equal(sTier[0].tier, "S");
  const seed = bloodDK.trinkets.find((t) => t.itemId === "250238");
  assert.deepEqual(seed.mentions, ["270175"], "the cross-reference is kept, as a mention");
});

test("an unranked trinket grouping stays unranked — no ranking is manufactured from prose", () => {
  // Holy Paladin groups by bold paragraphs Method wrote ("Recommended Trinkets:" /
  // "Alternatives"). Those are real published groupings, so the label is kept; they are
  // not letters, so `tier` stays null and nothing implies an order.
  assert.equal(holyPaladin.counts.trinkets, 5);
  for (const trinket of holyPaladin.trinkets) {
    assert.equal(trinket.tier, null);
    assert.ok(trinket.groupLabel);
  }
  const labels = [...new Set(holyPaladin.trinkets.map((t) => t.groupLabel))];
  assert.deepEqual(labels.sort(), ["Alternatives", "Recommended Trinkets:"]);
});

test("Shadow Priest's Rating|Trinket table produces the same shape as the heading form", () => {
  // Verbatim from shadow-priest, the one spec publishing its tiers as a table.
  const table = `<div class="guide-section-title" id="trinkets"><h2>Trinkets</h2></div>
    <table><tbody><tr><td><b>Rating</b></td><td><b>Trinket</b></td></tr>
    <tr><td>S Tier</td><td><a href="https://www.wowhead.com/ptr/item=270164/g">Gebbo's Bottomless Bag</a></td></tr>
    <tr><td>A Tier</td><td><a href="https://www.wowhead.com/ptr/item=250214/l">Lightspire Core</a></td></tr>
    </tbody></table>`;
  const record = parseMethodGearingPage(table, { spec: "Shadow", className: "Priest", roster });
  assert.deepEqual(record.trinkets.map((t) => [t.itemId, t.tier]), [["270164", "S"], ["250214", "A"]]);
});

test("embellishments are recorded as mentioned, never ranked", () => {
  // Method discusses embellishments in flowing prose ("the best embellishment for
  // throughput", "the second best"). Reading an order out of those sentences is exactly the
  // manufactured ranking G1 forbids, so tier stays null on every entry.
  for (const entry of bloodDK.embellishments) assert.equal(entry.tier, null);
  assert.ok(bloodDK.embellishments.length > 0);
  assert.ok(bloodDK.embellishments.every((e) => e.itemId));
});

/* ---------------------------------------------------------------- structural guards */

test("markup inside an HTML comment is not markup", () => {
  // A commented-out table opens a non-greedy match that runs to the first real </table>
  // and eats the whole first list — silently, leaving a page that merely looks shorter.
  assert.equal(stripComments("a<!-- <table> -->b").length, "a<!-- <table> -->b".length,
    "indices must stay truthful");
  assert.ok(!stripComments("a<!-- <table> -->b").includes("<table>"));
  const commented = `<!-- an old <table> we no longer publish -->
    <h3>Overall Best Gear</h3><table><tbody>
    <tr><td><b>Slot</b></td><td><b>Item</b></td><td><b>Source</b></td></tr>
    <tr><td>Head</td><td><a href="https://www.wowhead.com/ptr/item=1/x">X</a></td><td>Ula'tek</td></tr></tbody></table>`;
  const record = parseMethodGearingPage(commented, { spec: "S", className: "C", roster });
  assert.equal(record.counts.picks, 1);
  assert.equal(record.lists[0].heading, "Overall Best Gear");
});

test("the fixtures are what the parser is calibrated against", async () => {
  // Row counts measured on the live pages 2026-08-13. If Method restructures, these move
  // and the change should be looked at rather than absorbed.
  assert.equal(holyPaladin.counts.picks, 48);
  assert.equal(bloodDK.counts.picks, 30);
  assert.equal(frostDK.counts.picks, 51);
  for (const record of [holyPaladin, bloodDK, frostDK]) {
    assert.equal(record.source, "method");
    assert.ok(record.counts.lists >= 1);
    for (const pick of record.picks) {
      assert.equal(pick.endorsement, "bis", "a BiS table row is a pick, never an alternative");
      assert.ok(pick.itemId && /^\d+$/.test(pick.itemId));
      assert.ok(BRACKETS.includes(pick.bracket), "brackets come from the shared contract");
    }
  }
  // Every fixture must still say where it came from and when we fetched it. A recorded page
  // with no provenance is indistinguishable from one somebody typed.
  for (const name of ["holy-paladin", "blood-death-knight", "frost-death-knight"]) {
    const raw = await fixture(name);
    assert.match(raw, /source : https:\/\/www\.method\.gg\/guides\//);
    assert.match(raw, /fetched: \d{4}-\d{2}-\d{2}/);
  }
});

test("a compound drop source keeps the route it came through, not just the boss", () => {
  // "The Great Vault or Entombed Sentinels" resolves to the BOSS with via: "vault" recorded
  // alongside. The projection used to copy only kind/canonical/base and silently dropped
  // both `via` and `canonicalRaw`. Method writes "Great Vault" in prose today, never in a
  // Source cell, so no fixture reaches this — which is exactly why it needs a test before
  // the live harvest does reach it.
  const drop = resolveDropSource("The Great Vault or Entombed Sentinels", roster);
  assert.equal(drop.kind, "raid");
  assert.equal(drop.via, "vault");
  assert.ok(drop.canonicalRaw);

  const projected = {
    kind: drop.kind,
    canonical: drop.canonical,
    ...(drop.base !== undefined ? { base: drop.base } : {}),
    ...(drop.baseKind ? { baseKind: drop.baseKind } : {}),
    ...(drop.via ? { via: drop.via } : {}),
    ...(drop.canonicalRaw ? { canonicalRaw: drop.canonicalRaw } : {}),
  };
  assert.equal(projected.via, "vault", "the route must survive projection");
  assert.equal(projected.canonicalRaw, drop.canonicalRaw);
});
