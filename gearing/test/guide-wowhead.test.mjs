/* Wowhead guide-harvest parsers, run against RECORDED page fixtures (Phase B ships machinery,
   not a harvest — every source is mid-season-transition until 2026-08-18).

   Each fixture is a trimmed capture of a live page; its header comment names the URL, the fetch
   date and exactly what was trimmed. Three specs across all three roles, both page types:
     hunter/beast-mastery (DPS)  · paladin/holy (Healer) · warrior/protection (Tank)

   The assertions below pin MEASURED shapes and MEASURED traps. Where a number looks arbitrary
   (14 picks, item 271490) it is what the page published on 2026-08-13, and a change to it means
   either Wowhead redesigned or the parser broke — which is the whole point of a fixture. */

import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { consensusForItem, rosterFrom, SLOTS } from "../src/lib-guides.mjs";
import { AMBIGUOUS_SLOT_LABELS, badgeIdsIn, bisColumns, guideSourceMap, harvestSpec, itemRefsIn,
  parseBisPage, parseByline, parseNpcNames, parseSeason, parseSkillNames, parseStatPage,
  parseStatPriorities, pickSetChanges, readSlotCell, repairGuideSources, ROLE_SUFFIX,
  statPriorityUrlFrom, statsIn, statUrl } from "../src/harvest-guide-wowhead.mjs";

const fromRoot = (path) => new URL(`../${path}`, import.meta.url);
const read = (path) => readFile(fromRoot(path), "utf8");
const json = async (path) => JSON.parse(await read(path));
const fixture = (name) => read(`test/fixtures/wowhead-${name}.html`);

const roster = rosterFrom(await json("data/raid-items.json"), await json("data/dungeon-items.json"));

const BIS = {};
for (const name of ["hunter-beast-mastery", "paladin-holy", "warrior-protection"])
  BIS[name] = parseBisPage(await fixture(`${name}-bis-gear`), { roster });

const STATS = {};
for (const name of ["hunter-beast-mastery", "paladin-holy", "warrior-protection"])
  STATS[name] = parseStatPage(await fixture(`${name}-stat-priority`));

const picksOf = (page) => page.picks.filter((p) => p.endorsement === "bis");
const altsOf = (page) => page.picks.filter((p) => p.endorsement === "alternative");
const bySlot = (page, slot) => picksOf(page).filter((p) => p.slot === slot);

/* ---------- the page describes itself ---------- */

test("every page carries its named author, its own update date and its season claim", () => {
  assert.deepEqual(BIS["hunter-beast-mastery"].page.author, "Tarlo");
  assert.equal(BIS["paladin-holy"].page.author, "HolyClarius");
  assert.equal(BIS["warrior-protection"].page.author, "Pumps");
  for (const page of [...Object.values(BIS), ...Object.values(STATS)]) {
    // Normalised out of Wowhead's YYYY/MM/DD so it compares like every other date here.
    assert.match(page.page.updated, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(page.page.season, 2, "the page must state which season it describes");
    assert.equal(page.page.text, "Midnight Season 2");
  }
});

test("an undated or seasonless page yields nulls rather than a guessed date", () => {
  assert.deepEqual(parseByline("<html><body>no byline here</body></html>"),
    { author: null, updated: null });
  assert.deepEqual(parseSeason("nothing about a season"), { text: null, season: null });
});

test("the stat-priority URL is read from the page's own nav, not guessed from the role", () => {
  // MEASURED 2026-08-13: the healer suffix is `-healer`. Guessing `-healing` 404s the whole
  // role, and a role-wide 404 is the kind of silent hole this reads its way around.
  assert.equal(statPriorityUrlFrom("[nav-item=guide/classes/paladin/holy/stat-priority-pve-healer]Stats[/nav-item]"),
    "https://www.wowhead.com/guide/classes/paladin/holy/stat-priority-pve-healer");
  assert.equal(BIS["paladin-holy"].page.statPriorityUrl,
    "https://www.wowhead.com/guide/classes/paladin/holy/stat-priority-pve-healer");
  assert.equal(BIS["warrior-protection"].page.statPriorityUrl,
    "https://www.wowhead.com/guide/classes/warrior/protection/stat-priority-pve-tank");
  assert.equal(statPriorityUrlFrom("no nav strip in this markup"), null);
  // The fallback still has to agree with what the nav actually serves.
  assert.equal(statUrl("paladin", "holy", "Healer"), BIS["paladin-holy"].page.statPriorityUrl);
  assert.deepEqual(ROLE_SUFFIX, { DPS: "dps", Healer: "healer", Tank: "tank" });
});

/* ---------- the BiS table ---------- */

test("the Slot | Item | Source table parses, and only that table", () => {
  // Row counts as published. The pages also carry crafted-gear, bonus-roll and upgrade tables;
  // a parser that swept every [table] would silently inflate these.
  assert.equal(picksOf(BIS["hunter-beast-mastery"]).length, 14);
  assert.equal(picksOf(BIS["paladin-holy"]).length, 16);
  assert.equal(picksOf(BIS["warrior-protection"]).length, 16);
  for (const page of Object.values(BIS)) {
    for (const pick of picksOf(page)) {
      assert.match(pick.itemId, /^\d+$/);
      assert.ok(pick.slot === null || SLOTS.includes(pick.slot), `${pick.rawSlot} -> ${pick.slot}`);
      assert.equal(pick.section, "Overall BiS");
    }
    // Every spec publishes exactly two rings and at least one trinket.
    assert.equal(bySlot(page, "Finger").length, 2);
    assert.ok(bySlot(page, "Trinket").length >= 1);
  }
});

test("Wowhead's slot vocabulary collapses onto the canonical set", () => {
  const hunter = picksOf(BIS["hunter-beast-mastery"]);
  const map = Object.fromEntries(hunter.map((p) => [p.rawSlot, p.slot]));
  assert.equal(map["Cloak"], "Back");
  assert.equal(map["Gloves"], "Hands");
  assert.equal(map["Belt"], "Waist");
  assert.equal(map["Boots"], "Feet");
  assert.equal(map["Shoulders"], "Shoulder");
  assert.equal(map["Ring"], "Finger");
  // Prot Warrior numbers its duplicate slots; Holy Paladin's off-hand is a Shield.
  const warrior = Object.fromEntries(picksOf(BIS["warrior-protection"]).map((p) => [p.rawSlot, p.slot]));
  assert.equal(warrior["Ring 2"], "Finger");
  assert.equal(warrior["Trinket 2"], "Trinket");
  assert.equal(warrior["Shield"], "Off Hand");
});

test('"Weapon" is deferred to the item, never guessed and never dropped', () => {
  // MEASURED: every spec's weapon row is labelled "Weapon", and it means a bow for BM Hunter
  // and a one-hand mace for Holy Paladin. It is a category, not a slot, so only the item can
  // settle it. The row still votes — a dropped row is a vote that vanishes.
  for (const [name, page] of Object.entries(BIS)) {
    const weapon = picksOf(page).filter((p) => p.rawSlot === "Weapon");
    assert.equal(weapon.length, 1, `${name} publishes exactly one "Weapon" row`);
    assert.equal(weapon[0].slot, null, "an ambiguous label must not be guessed into a slot");
    assert.match(weapon[0].itemId, /^\d+$/, "the pick survives with its item id intact");
    assert.equal(page.ambiguousSlots.length, 1, "and it is reported, not silently absorbed");
    assert.match(page.ambiguousSlots[0], /^Weapon -> item \d+$/);
  }
  const deferred = readSlotCell("Weapon");
  assert.equal(deferred.slot, null);
  assert.equal(deferred.ambiguous, true);
  assert.ok(AMBIGUOUS_SLOT_LABELS.has("weapon"));
  // Anything NOT on the measured deferral list still fails loudly through the shared contract.
  assert.throws(() => readSlotCell("Sparkle Pouch"), /unrecognised slot/);
});

test("a catalysed row keeps BOTH ids, and the original is the one that drops", () => {
  const shoulder = bySlot(BIS["hunter-beast-mastery"], "Shoulder")[0];
  assert.equal(shoulder.itemId, "271490", "the tier piece you end up wearing");
  assert.equal(shoulder.originalItemId, "268231", "the item that actually drops");
  // The catalyse section names the DROP, which is why the two join.
  const catalyse = altsOf(BIS["hunter-beast-mastery"]).find((a) => a.section === "Best Gear to Catalyze"
    && a.slot === "Shoulder");
  assert.equal(catalyse.itemId, shoulder.originalItemId);
  assert.equal(catalyse.source.canonical, shoulder.source.canonical);

  assert.deepEqual(itemRefsIn("[item=271490 original-item=268231]"),
    [{ itemId: "271490", originalItemId: "268231", bonusIds: [] }]);
  assert.deepEqual(itemRefsIn("[item=268207 bonus=13848:13708]"),
    [{ itemId: "268207", originalItemId: null, bonusIds: ["13848", "13708"] }]);
  assert.deepEqual(itemRefsIn("[item=271492 ]")[0].itemId, "271492");
  assert.deepEqual(itemRefsIn("no items here"), []);
});

test("a row that labels itself an alternative is NOT counted as a pick (G9)", () => {
  // MEASURED: BM Hunter's BiS table itself carries "Trinket (Raid only)" and two
  // "Trinket (Alternative)" rows. Treating the whole table as picks would hand three trinkets
  // a full BiS endorsement the guide never gave.
  const hunter = BIS["hunter-beast-mastery"];
  const trinkets = hunter.picks.filter((p) => p.rawSlot?.startsWith("Trinket"));
  assert.equal(trinkets.length, 3);
  const picked = trinkets.filter((p) => p.endorsement === "bis");
  assert.equal(picked.length, 1);
  assert.equal(picked[0].rawSlot, "Trinket (Raid only)");
  assert.equal(picked[0].itemId, "270173");
  // A parenthetical that names a bracket is the guide scoping its own row — published fact.
  assert.equal(picked[0].bracket, "raid");
  for (const alt of trinkets.filter((p) => p.endorsement === "alternative")) {
    assert.equal(alt.slot, "Trinket");
    assert.equal(alt.qualifier, "Alternative");
    assert.equal(alt.bracket, "overall", "an 'Alternative' qualifier is not a bracket");
  }
});

/* ---------- drop sources ---------- */

test("every source cell resolves to a canonical roster name or a typed non-drop", () => {
  const KINDS = new Set(["raid", "mplus", "crafted", "catalyst", "tier-set"]);
  for (const page of Object.values(BIS))
    for (const pick of page.picks.filter((p) => p.source))
      assert.ok(KINDS.has(pick.source.kind), `${pick.sourceText} -> ${pick.source.kind}`);

  const hunter = Object.fromEntries(picksOf(BIS["hunter-beast-mastery"]).map((p) => [p.slot, p]));
  // Wowhead writes King's Rest; our harvested roster writes Kings' Rest. Same dungeon.
  assert.equal(hunter["Hands"].sourceText, "King's Rest");
  assert.equal(hunter["Hands"].source.canonical, "Kings' Rest");
  assert.equal(hunter["Hands"].source.kind, "mplus");

  // A boss short-name that only joins through our harvested dropAliases.
  const shield = picksOf(BIS["paladin-holy"]).find((p) => p.rawSlot === "Shield");
  assert.equal(shield.sourceText, "Nymrissa Wavecaller");
  assert.equal(shield.source.canonical, "Nek'zali the Soulcoiler");
});

test("profession and NPC names come from the page's own anchors, never from the numeric id", () => {
  // The guide markup writes only [skill=165] / [npc=252959]; the NAME exists solely in the
  // rendered anchor, and reconstructing it from the number would be a guess.
  const wrist = bySlot(BIS["hunter-beast-mastery"], "Wrist")[0];
  assert.equal(wrist.source.kind, "crafted");
  assert.equal(wrist.source.canonical, "Leatherworking");
  assert.equal(wrist.source.skillId, "165");

  const skills = parseSkillNames('<a href="/skill=165/leatherworking">Leatherworking</a>');
  assert.equal(skills.get("165"), "Leatherworking");
  assert.equal(parseSkillNames("<p>no anchors</p>").size, 0);
  // The PTR namespace is the measured trap: dungeon links carry it, raid links do not, and the
  // id is identical either way.
  const npcs = parseNpcNames('<a href="/ptr/npc=253563/nekzali-the-soulcoiler">Nek\'zali the Soulcoiler</a>');
  assert.equal(npcs.get("253563"), "Nek'zali the Soulcoiler");
});

test("an unresolvable source keeps its row and is reported, never dropped or guessed", async () => {
  // Wowhead's 40 pages are written by 40 authors and misspell shared bosses ("The Coiled
  // Alter", "Entomed Sentinels") or ship an empty anchor. The row must survive with source:null
  // so the RUN can refuse with the full list, rather than one typo killing a whole spec.
  const html = await fixture("hunter-beast-mastery-bis-gear");
  const broken = html.replace(/Ula'tek/g, "Ula'tekk");
  const parsed = parseBisPage(broken, { roster });
  const orphans = picksOf(parsed).filter((p) => !p.source);
  assert.ok(orphans.length, "the misspelt rows are still present");
  for (const orphan of orphans) assert.match(orphan.sourceText, /Ula'tekk/);
  assert.ok(parsed.unresolvedSources.length, "and every one of them is reported");
  assert.equal(parsed.unresolvedSources[0].reason, "no roster match");
});

test("a stated name is repaired from the page's OWN guide id, and the repair is stamped", () => {
  const good = { class: "A", spec: "A", picks: [{ itemId: "1", sourceText: "The Coiled Altar",
    source: { kind: "raid", canonical: "The Coiled Altar" },
    sourceLabels: [{ text: "The Coiled Altar", guideId: "34251",
      resolved: { kind: "raid", canonical: "The Coiled Altar" } }] }] };
  const typo = { class: "B", spec: "B", picks: [{ itemId: "2", sourceText: "The Coiled Alter",
    source: null,
    sourceLabels: [{ text: "The Coiled Alter", guideId: "34251", reason: "no roster match" }] }] };

  const { repaired, stillMissing } = repairGuideSources([good, typo]);
  assert.equal(stillMissing.length, 0);
  assert.equal(repaired.length, 1);
  assert.deepEqual(typo.picks[0].source,
    { kind: "raid", canonical: "The Coiled Altar", via: "guide-id", statedText: "The Coiled Alter" });
  assert.equal(good.picks[0].source.via, undefined, "an already-resolved row is untouched");
});

test("an ambiguous guide id repairs nothing — the run fails instead", () => {
  // MEASURED: guide 33272 is used both for "Kings Rest" and for the generic "Mythic+ Dungeons"
  // link, so an id whose resolved occurrences disagree cannot stand in for a name.
  const specs = [
    { class: "A", spec: "A", picks: [{ itemId: "1", sourceText: "Kings Rest",
      source: { kind: "mplus", canonical: "Kings' Rest" },
      sourceLabels: [{ text: "Kings Rest", guideId: "33272",
        resolved: { kind: "mplus", canonical: "Kings' Rest" } }] }] },
    { class: "B", spec: "B", picks: [{ itemId: "2", sourceText: "Temple of Sethraliss",
      source: { kind: "mplus", canonical: "Temple of Sethraliss" },
      sourceLabels: [{ text: "Temple of Sethraliss", guideId: "33272",
        resolved: { kind: "mplus", canonical: "Temple of Sethraliss" } }] }] },
    { class: "C", spec: "C", picks: [{ itemId: "3", sourceText: "", source: null,
      sourceLabels: [{ text: null, guideId: "33272", reason: "empty label" }] }] },
  ];
  assert.equal(guideSourceMap(specs).has("33272"), false, "two canonicals, so the id is refused");
  const { repaired, stillMissing } = repairGuideSources(specs);
  assert.equal(repaired.length, 0);
  assert.equal(stillMissing.length, 1);
  assert.match(stillMissing[0], /guide 33272/);
  assert.equal(specs[2].picks[0].source, null, "and nothing is invented in its place");
});

test("an unreadable page and a page that does not exist are different facts", async () => {
  // A stat page we failed to READ must not ship as `builds: []`, which would read as "this
  // guide publishes no stat priority". Measured: one 13-spec sweep lost a page to throttling.
  const bisHtml = await fixture("hunter-beast-mastery-bis-gear");
  const statHtml = await fixture("hunter-beast-mastery-stat-priority");
  const target = { class: "Hunter", spec: "Beast Mastery", role: "DPS",
    classSlug: "hunter", specSlug: "beast-mastery" };

  const fetchHtml = (url, reason) => async (target) =>
    /bis-gear/.test(target) ? { ok: true, html: bisHtml }
      : reason ? { ok: false, reason } : { ok: true, html: statHtml };

  const good = await harvestSpec(target, { roster, fetchHtml: fetchHtml(null, null) });
  assert.equal(good.statPage.reachable, true);
  assert.equal(good.builds.length, 3);

  const throttled = await harvestSpec(target, { roster, fetchHtml: fetchHtml(null, "unreachable") });
  assert.equal(throttled.statPage.reason, "unreachable");
  const absent = await harvestSpec(target, { roster, fetchHtml: fetchHtml(null, "not-found") });
  assert.equal(absent.statPage.reason, "not-found");
  for (const result of [throttled, absent]) assert.deepEqual(result.builds, []);

  // A BiS page we cannot read yields no spec record at all, not an empty one.
  const dead = await harvestSpec(target,
    { roster, fetchHtml: async () => ({ ok: false, reason: "unreachable" }) });
  assert.match(dead.error, /bis page unreachable/);
  assert.equal(dead.picks, undefined);
});

test('"Tier Set" is typed, not force-matched onto a boss', () => {
  // MEASURED on Protection Warrior (guide 34180, four rows). lib-guides types `crafted` and
  // `catalyst`; this is a THIRD non-drop category and resolveDropSource would rightly throw.
  const tierRows = picksOf(BIS["warrior-protection"]).filter((p) => p.sourceText === "Tier Set");
  assert.equal(tierRows.length, 4);
  for (const row of tierRows) assert.equal(row.source.kind, "tier-set");
  assert.deepEqual(tierRows.map((r) => r.slot).sort(), ["Chest", "Hands", "Head", "Shoulder"]);

  // The same page's crafted rows still land on the shared contract's own `crafted` type.
  const crafted = picksOf(BIS["warrior-protection"]).filter((p) => p.source?.kind === "crafted");
  assert.equal(crafted.length, 2);
  assert.equal(crafted[0].sourceText, "Crafting Blacksmithing");
});

/* ---------- alternatives (G9's second count) ---------- */

test("the Raid / Mythic+ strips are alternatives that vote on Wowhead's ONE list", () => {
  for (const [name, page] of Object.entries(BIS)) {
    const raid = altsOf(page).filter((a) => a.section === "Raid Drops");
    const mplus = altsOf(page).filter((a) => a.section === "Mythic+ Drops");
    assert.equal(raid.length, 4, `${name} raid strip`);
    assert.equal(mplus.length, 4, `${name} mythic+ strip`);
    // `bracket` is WHICH LIST casts the vote, and Wowhead publishes exactly one per-slot list
    // ("Overall BiS"); these strips are highlights drawn from it, not a rival raid BiS list.
    // The strip's own scope survives as descriptive `sectionBracket`.
    for (const alt of raid) {
      assert.equal(alt.bracket, "overall");
      assert.equal(alt.sectionBracket, "raid");
    }
    for (const alt of mplus) {
      assert.equal(alt.bracket, "overall");
      assert.equal(alt.sectionBracket, "mplus");
    }
    // These strips publish no slot column. Null is the honest answer; the item's own tooltip
    // carries the slot and this page simply does not state it.
    for (const alt of [...raid, ...mplus]) assert.equal(alt.slot, null);
  }
});

test("the plural in \"Best Gear from Raids\" does not silently lose the strip's scope", () => {
  // TRAP: normalizeBracket anchors on \braid\b, which does NOT match "Raids", so the heading
  // text alone falls through to "overall" and the strip's scope disappears. The harvester
  // singularises first and also reads the heading's toc= ("Raid Drops").
  const raid = altsOf(BIS["hunter-beast-mastery"]).filter((a) => a.section === "Raid Drops");
  assert.ok(raid.length);
  for (const alt of raid) assert.equal(alt.sectionBracket, "raid");
});

test("Best Gear to Catalyze carries a slot and a drop source", () => {
  for (const page of Object.values(BIS)) {
    const cards = altsOf(page).filter((a) => a.section === "Best Gear to Catalyze");
    assert.equal(cards.length, 5, "the five catalysable slots");
    for (const card of cards) {
      assert.ok(SLOTS.includes(card.slot));
      assert.ok(card.source, `${card.sourceText} must resolve`);
      assert.equal(card.endorsement, "alternative");
    }
  }
});

test("picks and alternatives are separate counts that never merge", () => {
  assert.equal(altsOf(BIS["hunter-beast-mastery"]).length, 15);   // 2 in-table + 4 + 4 + 5
  assert.equal(altsOf(BIS["paladin-holy"]).length, 13);           // 0 in-table + 4 + 4 + 5
  assert.equal(altsOf(BIS["warrior-protection"]).length, 13);
  for (const page of Object.values(BIS))
    for (const entry of page.picks)
      assert.ok(["bis", "alternative"].includes(entry.endorsement));
});

/* ---------- trinket letter tiers (G8) ---------- */

test("trinket tiers keep their letters and their per-item context", () => {
  const tiers = BIS["hunter-beast-mastery"].trinketTiers;
  assert.deepEqual(tiers.contexts.map((c) => c.key), ["raid", "dungeon", "delves", "crafting"]);
  assert.deepEqual(tiers.contexts.map((c) => c.label), ["Raid", "Mythic Plus", "Delves", "Crafting"]);
  assert.deepEqual([...new Set(tiers.entries.map((e) => e.tier))], ["S", "A", "B", "C", "D"]);
  const s = tiers.entries.filter((e) => e.tier === "S");
  assert.deepEqual(s.map((e) => e.itemId), ["270173", "270164", "270175"]);
  for (const entry of s) assert.equal(entry.bracket, "raid");
  for (const page of Object.values(BIS)) assert.ok(page.trinketTiers.entries.length >= 10);
});

test("Delves and Crafting are contexts, not brackets", () => {
  // G8 / the brief: forcing them onto raid or mplus would assert a bracket the page never did.
  for (const page of Object.values(BIS)) {
    for (const entry of page.trinketTiers.entries) {
      if (entry.context === "delves" || entry.context === "crafting") {
        assert.equal(entry.bracket, null);
        assert.ok(entry.contextLabel, "but the page's own label is kept");
      } else {
        assert.ok(["raid", "mplus"].includes(entry.bracket));
      }
    }
  }
});

test("trinket letters stay OUT of the pick lists (G8 keeps them per-source and unranked)", () => {
  for (const page of Object.values(BIS)) {
    const rated = new Set(page.trinketTiers.entries.map((e) => e.itemId));
    const lowTier = page.trinketTiers.entries.filter((e) => e.tier === "D").map((e) => e.itemId);
    assert.ok(lowTier.length, "the fixture has D-tier trinkets to be wrong about");
    for (const id of lowTier)
      assert.ok(!page.picks.some((p) => p.itemId === id && p.endorsement === "bis"),
        `${id} is D-tier and must not arrive as a BiS pick through the tier list`);
    assert.ok(rated.size > page.picks.filter((p) => p.slot === "Trinket").length);
  }
});

/* ---------- scoped stat priorities (G7 / G12) ---------- */

test("hero-talent x fight-profile priorities parse as one build per published combination", () => {
  const builds = STATS["hunter-beast-mastery"].builds;
  assert.deepEqual(builds.map((b) => b.label),
    ["Pack Leader, All Situations", "Dark Ranger, Single-Target", "Dark Ranger, AoE"]);
  assert.deepEqual(builds.map((b) => b.id), [
    "wowhead:pack-leader-all-situations",
    "wowhead:dark-ranger-single-target",
    "wowhead:dark-ranger-aoe",
  ]);
  assert.deepEqual(builds[1].heroTalent, { slug: "dark-ranger", name: "Dark Ranger" });
  assert.equal(builds[1].fightProfile, "Single-Target");
  assert.deepEqual(builds[1].entries.map((e) => e.text),
    ["Weapon Damage", "Agility", "Critical Strike", "Mastery", "Haste", "Versatility"]);
  assert.deepEqual(builds[1].entries.map((e) => e.rank), [1, 2, 3, 4, 5, 6]);
  // The two Dark Ranger lists genuinely differ; collapsing them would lose the whole point.
  assert.notDeepEqual(builds[1].entries.map((e) => e.text), builds[2].entries.map((e) => e.text));
});

test("a hero talent is filled only when the page's own symbol says so", () => {
  // MEASURED: Protection Warrior scopes by "Survivability" / "DPS" and publishes NO
  // [symbol=wow-hero-talent-*] at all. Those are neither hero talents nor fight profiles, so
  // both fields stay null and the published label carries the distinction (G12).
  const warrior = STATS["warrior-protection"].builds;
  assert.deepEqual(warrior.map((b) => b.label), ["Survivability", "DPS"]);
  for (const build of warrior) {
    assert.equal(build.heroTalent, null);
    assert.equal(build.fightProfile, null);
  }
  assert.deepEqual(warrior.map((b) => b.id), ["wowhead:survivability", "wowhead:dps"]);

  // ...and a card WITHOUT a symbol must not inherit the previous card's, which is why the
  // symbol scan is bounded to the card's own header block.
  const mixed = "[h2 toc=\"Stat Recommendations\"]Best Stats for X[/h2]"
    + "[center][symbol=wow-hero-talent-pack-leader] [b]Pack Leader Stat Priority[/b][/center]"
    + "[ol][li]Haste[/li][li]Mastery[/li][/ol]"
    + "[center][b]Survivability Stat Priority[/b][/center]"
    + "[ol][li]Mastery[/li][li]Haste[/li][/ol][h2]Stats Explained[/h2]";
  const parsed = parseStatPriorities(mixed);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].heroTalent.slug, "pack-leader");
  assert.equal(parsed[1].heroTalent, null, "the second card has no symbol of its own");
});

test("healer cards parse with no fight profile, and a published TIE stays a tie", () => {
  const builds = STATS["paladin-holy"].builds;
  assert.deepEqual(builds.map((b) => b.label), ["Herald of the Sun", "Lightsmith"]);
  assert.deepEqual(builds[0].heroTalent, { slug: "herald-of-the-sun", name: "Herald of the Sun" });
  assert.equal(builds[0].fightProfile, null);
  // "Haste = Crit" is one published rank holding two stats. Ranking one above the other would
  // invent an ordering the guide explicitly declined to give.
  const tie = builds[0].entries.find((e) => e.tie);
  assert.equal(tie.text, "Haste = Crit");
  assert.deepEqual(tie.stats, ["Haste", "Crit"]);
  for (const entry of builds[0].entries.filter((e) => e !== tie))
    assert.ok(entry.stats.length <= 1);
});

test("the priority parse ignores the prose lists elsewhere on the page", () => {
  // "Stats Explained" and "Diminishing Returns" are [ul] lists of the same stat names, and
  // "Sim Your Character" follows them. Only the Stat Recommendations section may produce builds.
  for (const [name, page] of Object.entries(STATS)) {
    assert.ok(page.builds.length >= 2 && page.builds.length <= 3, `${name}: ${page.builds.length}`);
    for (const build of page.builds) {
      assert.ok(build.entries.length >= 4 && build.entries.length <= 6);
      assert.equal(build.source, "wowhead");
      assert.match(build.id, /^wowhead:/);
    }
  }
  assert.deepEqual(parseStatPriorities("[h2]Something Else[/h2][ol][li]Haste[/li][/ol]"), []);
});

test("stat tokens are read in published order and non-stat entries stay empty", () => {
  assert.deepEqual(statsIn("Critical Strike"), ["Crit"]);
  assert.deepEqual(statsIn("Haste = Crit"), ["Haste", "Crit"]);
  assert.deepEqual(statsIn("Weapon Damage"), []);
  assert.deepEqual(statsIn("Item Level"), []);
});

/* ---------- feeding the shared contract ---------- */

test("parsed picks drive consensusForItem exactly as G9/G10 specify", () => {
  const hunter = BIS["hunter-beast-mastery"].picks.map((p) => ({ ...p, source: "wowhead" }));
  // 268207 is BOTH the Weapon BiS pick and a "Best Gear from Raids" highlight. One source, one
  // vote, taken at its STRONGEST — this is the case that proved the strips must not be tagged
  // as a raid list: a raid-ranked alternative would have outranked the overall-ranked pick and
  // published Wowhead's own BiS choice as a mere alternative.
  const both = hunter.filter((p) => p.itemId === "268207");
  assert.equal(both.length, 2);
  assert.deepEqual(both.map((p) => p.endorsement).sort(), ["alternative", "bis"]);
  const consensus = consensusForItem(hunter, { id: "268207", kind: "raid" });
  assert.equal(consensus.picks, 1);
  assert.equal(consensus.alternatives, 0, "the same source must not appear in both counts");

  // A Mythic+ highlight that happens to be a raid drop still votes — it is Wowhead's Overall
  // list talking, so it is never ranked out by the item's own bracket.
  const mplusStrip = hunter.filter((p) => p.section === "Mythic+ Drops");
  assert.ok(mplusStrip.length);
  for (const kind of ["raid", "mplus"])
    assert.equal(consensusForItem(hunter, { id: mplusStrip[0].itemId, kind }).alternatives, 1,
      `a highlight must not be silently deleted for a ${kind} item`);

  // But a row the guide itself scoped ("Trinket (Raid only)") does stop at that bracket.
  const raidOnly = hunter.find((p) => p.qualifier === "Raid only");
  assert.equal(consensusForItem([raidOnly], { id: raidOnly.itemId, kind: "raid" }).picks, 1);
  assert.equal(consensusForItem([raidOnly], { id: raidOnly.itemId, kind: "mplus" }).picks, 0);
});

/* ---------- the write guard ---------- */

test("a changed pick set is refused rather than written over the baseline", () => {
  const before = { specs: [{ class: "Hunter", spec: "Beast Mastery",
    picks: [{ endorsement: "bis", itemId: "1" }, { endorsement: "bis", itemId: "2" }] }] };
  assert.deepEqual(pickSetChanges(before, [{ class: "Hunter", spec: "Beast Mastery",
    picks: [{ endorsement: "bis", itemId: "1" }, { endorsement: "bis", itemId: "2" }] }]), []);
  const changed = pickSetChanges(before, [{ class: "Hunter", spec: "Beast Mastery",
    picks: [{ endorsement: "bis", itemId: "1" }, { endorsement: "bis", itemId: "3" }] }]);
  assert.equal(changed.length, 1);
  assert.match(changed[0], /removed=\[bis:2\] added=\[bis:3\]/);
  // A spec that vanishes from a run is a change too — silence is the failure mode that hides.
  assert.match(pickSetChanges(before, [])[0], /missing from this run/);
});

test("badge ids are read only where a section publishes them", () => {
  assert.deepEqual(badgeIdsIn("[icon-badge=270173 quality=4][icon-badge=270164  quality=4]"),
    ["270173", "270164"]);
  // Enhancement Shaman's strip writes the bonus list onto the badge: [icon-badge=268209;13848].
  assert.deepEqual(badgeIdsIn("[icon-badge=268209;13848 quality=4]"), ["268209"]);
  assert.deepEqual(badgeIdsIn("[item=270173]"), []);
});

/* ---------- roster-wide shape variance ----------

   The three fixtures above are one spec per role. A sweep of all 40 pages on 2026-08-13 found
   five more layouts that none of them exercises, each of which had silently produced ZERO of
   something before it was handled. The excerpts below pin each one; their header comments name
   the page and the trap. */

const SHAPES = {};
for (const name of ["arms-warrior", "blood-dk", "restoration-druid", "mistweaver-catalyse",
  "assassination-catalyse", "enhancement-strips"])
  SHAPES[name] = parseBisPage(await fixture(`shape-${name}`), { roster });

test("column headers are matched by meaning, not by a fixed Slot|Item|Source triple", () => {
  // Arms Warrior writes "Item Slot | Name | Source" and appends an empty fourth cell to every
  // row. A fixed triple parsed it as zero picks while every other spec looked fine.
  assert.equal(picksOf(SHAPES["arms-warrior"]).length, 15);
  assert.deepEqual(bisColumns(["slot", "item", "source"]), { slot: 0, item: 1, source: 2 });
  assert.deepEqual(bisColumns(["item slot", "name", "source"]), { slot: 0, item: 1, source: 2 });
  assert.deepEqual(bisColumns(["slot", "", "item", "source"]), { slot: 0, item: 2, source: 3 });
  assert.equal(bisColumns(["head - ula'tek", "shoulder - murder row"]), null);
});

test("a spec publishing two hero-talent BiS tabs contributes both, tagged by tab", () => {
  // Blood DK ships "Deathbringer BiS" and "San'layn BiS". Both are Overall lists — the tab is a
  // hero talent, not a bracket — so they must not be read as raid vs M+.
  const blood = SHAPES["blood-dk"];
  const sections = new Set(picksOf(blood).map((p) => p.section));
  assert.deepEqual([...sections].sort(), ["Deathbringer BiS", "San'layn BiS"]);
  for (const pick of picksOf(blood)) assert.equal(pick.bracket, "overall");
  // The two lists genuinely differ, which is what gives consensus reach below rank 1 (G1).
  const rings = (section) => picksOf(blood)
    .filter((p) => p.section === section && p.slot === "Finger").map((p) => p.itemId).sort();
  assert.notDeepEqual(rings("Deathbringer BiS"), rings("San'layn BiS"));
});

test('a "Mythic+ Only" tab IS a bracket, and it scopes that list\'s votes', () => {
  // Restoration Druid publishes an Overall list and a Mythic+-only list. G10 then keeps the M+
  // list from voting on raid drops without any new control.
  const druid = SHAPES["restoration-druid"];
  const mplus = picksOf(druid).filter((p) => p.section === "Mythic+ Only");
  assert.ok(mplus.length);
  for (const pick of mplus) assert.equal(pick.bracket, "mplus");
  const item = mplus.find((p) => p.slot === "Neck");
  const votes = [{ ...item, source: "wowhead" }];
  assert.equal(consensusForItem(votes, { id: item.itemId, kind: "mplus" }).picks, 1);
  assert.equal(consensusForItem(votes, { id: item.itemId, kind: "raid" }).picks, 0);
});

test("a source cell naming a boss AND the Catalyst keeps both halves", () => {
  // Restoration Druid writes "[url]Ula'tek[/url] (Raid) & [url]Catalyst[/url]" in one cell. The
  // boss is where it drops; the catalyst is what you then do to it. lib-guides models exactly
  // this, and the "(Raid)" note is not a source at all.
  const catalysed = picksOf(SHAPES["restoration-druid"]).filter((p) => p.source?.kind === "catalyst");
  assert.ok(catalysed.length >= 3);
  const head = catalysed.find((p) => p.slot === "Head" && p.section === "Overall BiS");
  assert.deepEqual(head.sourceTexts, ["Ula'tek", "Catalyst"]);
  assert.equal(head.source.base, "Ula'tek");
  for (const pick of picksOf(SHAPES["restoration-druid"]))
    assert.ok(!pick.sourceTexts.includes("(Raid)"), "the difficulty note is not a source");
});

test("catalyse cards parse in all three published layouts", () => {
  const cards = (name) => SHAPES[name].picks.filter((p) => p.section === "Best Gear to Catalyze");
  // A: [grid] of [p] — 37 specs.   B: [table] of [td], with [url="guide=.."] quoted.
  // C: header row "Head - <source>" joined to a badge row by column index.
  for (const name of ["mistweaver-catalyse", "assassination-catalyse"]) {
    const parsed = cards(name);
    assert.equal(parsed.length, 5, `${name} publishes five catalysable slots`);
    assert.deepEqual(parsed.map((p) => p.slot), ["Head", "Shoulder", "Chest", "Hands", "Legs"]);
    for (const card of parsed) {
      assert.ok(card.source, `${name}: ${card.rawSlot} must resolve its source`);
      assert.equal(card.endorsement, "alternative");
    }
    assert.equal(SHAPES[name].unparsedCatalyze.length, 0);
  }
  // Layout C splits the slot and its source across "Head - Ula'tek"; the slot must be only the
  // part before the link, never the flattened cell.
  assert.equal(cards("assassination-catalyse")[0].rawSlot, "Head");
  assert.equal(cards("assassination-catalyse")[0].source.canonical, "Ula'tek");
  // Blood DK repeats the whole section once per hero-talent tab. Ten cards is what it published.
  assert.equal(cards("blood-dk").length, 10);
});

test("the Raid / Mythic+ strips are found by toc=, not by their wording", () => {
  // Enhancement Shaman is the only spec that writes "Best Raid Items" / "Best Mythic+ Items"
  // and lays them out as a [grid] of [span] rather than a [table] — and the only one whose
  // catalyse heading says "Best Gear to use in the Catalyst". All 40 carry the same toc=.
  const enh = SHAPES["enhancement-strips"];
  const raid = enh.picks.filter((p) => p.section === "Raid Drops");
  const mplus = enh.picks.filter((p) => p.section === "Mythic+ Drops");
  assert.equal(raid.length, 5);
  assert.equal(mplus.length, 4);
  for (const alt of raid) assert.equal(alt.sectionBracket, "raid");
  for (const alt of mplus) assert.equal(alt.sectionBracket, "mplus");
  assert.equal(enh.picks.filter((p) => p.section === "Best Gear to Catalyze").length, 5);
  assert.equal(enh.unparsedCatalyze.length, 0);
});

test("a category source is typed only when no guide id can name the drop", () => {
  // Arms Warrior's Shoulders row says "BoE Trash Drop" (guide 34224, the raid instance, which
  // is not in our roster). It stays unresolved at parse time and is typed in the repair pass —
  // AFTER the guide-id map, so a cell like [url guide=34251]Raid[/url] still becomes The Coiled
  // Altar rather than being flattened to "raid-unspecified".
  //
  // THIS ORDERING IS NOW ACTIVELY DEFENDED, not merely a consequence of the contract returning
  // null. lib-guides types "BoE Trash Drop" as kind "boe" on sight, which is right for a source
  // whose text is all it has and wrong for this one, because the same cell carries a guide id
  // and an id is more specific than a lane. readSourceCell therefore HOLDS a contract category
  // on the label instead of taking it as the row's source. Nothing is lost by holding: the
  // typing stays visible on the label and the row keeps reporting itself unresolved, which is
  // the state that refuses the write.
  const arms = SHAPES["arms-warrior"];
  const boe = arms.picks.filter((p) => p.sourceTexts.includes("BoE Trash Drop"));
  assert.equal(boe.length, 2);
  for (const pick of boe) assert.equal(pick.source, null, "not typed while a guide id might name it");
  assert.equal(arms.unresolvedSources.length, 2);
  for (const pick of boe) {
    const label = pick.sourceLabels.find((l) => l.text === "BoE Trash Drop");
    assert.equal(label.category.kind, "boe", "the contract's reading is held, not discarded");
    assert.match(label.reason, /deferred to the guide-id pass/);
  }

  const specs = [{ class: "Warrior", spec: "Arms", picks: arms.picks }];
  const { repaired, categorised, stillMissing } = repairGuideSources(specs);
  assert.equal(repaired.length, 0);
  assert.equal(categorised.length, 2);
  assert.equal(stillMissing.length, 0);
  for (const pick of boe) {
    assert.equal(pick.source.kind, "trash");
    assert.equal(pick.source.via, "category");
  }

  // The ordering guard: an id the map CAN name wins over the category.
  const withId = [{ class: "X", spec: "X", picks: [
    { itemId: "1", sourceText: "The Coiled Altar", source: { kind: "raid", canonical: "The Coiled Altar" },
      sourceLabels: [{ text: "The Coiled Altar", guideId: "34251",
        resolved: { kind: "raid", canonical: "The Coiled Altar" } }] },
    { itemId: "2", sourceText: "Raid", source: null, sourceTexts: ["Raid"],
      sourceLabels: [{ text: "Raid", guideId: "34251", reason: "no roster match" }] },
    // And the same guard for a label the CONTRACT typed rather than one it merely failed on:
    // a held "boe" must not beat an id that names the real drop either. This is the case the
    // contract's category typing made newly possible, and the one the ordering exists for.
    { itemId: "3", sourceText: "BoE Trash Drop", source: null, sourceTexts: ["BoE Trash Drop"],
      sourceLabels: [{ text: "BoE Trash Drop", guideId: "34251",
        category: { kind: "boe", canonical: "BoE Trash Drop" },
        reason: 'category "boe" — deferred to the guide-id pass' }] },
  ] }];
  const second = repairGuideSources(withId);
  assert.equal(second.categorised.length, 0, "no row settled for a lane while an id could name it");
  assert.equal(withId[0].picks[1].source.canonical, "The Coiled Altar");
  assert.equal(withId[0].picks[2].source.canonical, "The Coiled Altar");
  assert.equal(withId[0].picks[2].source.via, "guide-id");
});

test("a lane lib-guides knows and this page has never published fails the run, naming it", () => {
  /* The narrowness rule this file states for NON_DROP_SOURCES, applied to the contract's own
     category typing: only a label MEASURED on these pages is recognised here, so a first
     "World Drop" on a Wowhead page must stop the run rather than be absorbed silently by a
     vocabulary that was never checked against this source. What the held typing buys is that
     the failure NAMES what lib-guides read, so the reviewer starts from a reading instead of a
     blank. GENERIC_SOURCES has no world-drop pattern; the contract types it "boe". */
  const specs = [{ class: "X", spec: "X", picks: [
    { itemId: "9", sourceText: "World Drop", source: null, sourceTexts: ["World Drop"],
      sourceLabels: [{ text: "World Drop", category: { kind: "boe", canonical: "World Drop" },
        reason: 'category "boe" — deferred to the guide-id pass' }] },
  ] }];
  const { categorised, stillMissing } = repairGuideSources(specs);
  assert.equal(categorised.length, 0, "an unmeasured lane is not quietly typed");
  assert.equal(stillMissing.length, 1);
  assert.match(stillMissing[0], /World Drop/);
  assert.match(stillMissing[0], /lib-guides reads this as "boe"/);
  assert.equal(specs[0].picks[0].source, null, "and nothing is invented for it");
});
