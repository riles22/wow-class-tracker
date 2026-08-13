import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { BAND, BRACKETS, bandOf, buildId, bracketOfItem, consensusForItem, consensusRank,
  defaultBuildFor, normalizeBracket, planForSources, planSortedBy, rankCandidates, scopeKey,
  sortPlans,
  normalizeSlot, normalizeText, parseSoftCap, resolveDropSource, rosterFrom, slugify,
  SLOTS } from "../src/lib-guides.mjs";

const fromRoot = (path) => new URL(`../${path}`, import.meta.url);
const json = async (path) => JSON.parse(await readFile(fromRoot(path), "utf8"));

test("slot normalization collapses all three guide vocabularies onto the canonical set", () => {
  // Icy Veins' own labels (its BiS grid ships exactly these, in this order).
  const icyVeins = ["Helm", "Hands", "Neck", "Waist", "Shoulders", "Legs", "Cloak", "Feet",
    "Chest", "Ring", "Trinket", "Bracers", "Main Hand", "Off Hand"];
  for (const label of icyVeins) {
    const slot = normalizeSlot(label, { where: "icyveins" });
    assert.ok(SLOTS.includes(slot), `${label} -> ${slot} is not canonical`);
  }
  assert.equal(normalizeSlot("Cloak"), "Back");
  assert.equal(normalizeSlot("Bracers"), "Wrist");
  assert.equal(normalizeSlot("Ring"), "Finger");

  // Wowhead qualifies armour class and weapon subtype onto the slot label.
  assert.equal(normalizeSlot("Cloth Legs"), "Legs");
  assert.equal(normalizeSlot("Mail Helm"), "Head");
  assert.equal(normalizeSlot("Plate Feet"), "Feet");
  assert.equal(normalizeSlot("1H Axe"), "One-Hand");
  assert.equal(normalizeSlot("2H Mace"), "Two-Hand");
  assert.equal(normalizeSlot("Ranged Bow"), "Ranged");
  assert.equal(normalizeSlot("Off-Hand Weapon"), "Off Hand");
  assert.equal(normalizeSlot("Shield"), "Off Hand");

  // Ula'tek's panel qualifies with a set name; the slot still resolves.
  assert.equal(normalizeSlot("Venomcursed Cloth Helm"), "Head");
});

test("shirt and tabard are dropped, and an unknown slot is a hard error", () => {
  assert.equal(normalizeSlot("Shirt"), null);
  assert.equal(normalizeSlot("Tabard"), null);
  // A page redesign must fail loudly: a silently dropped row is a vote that vanishes.
  assert.throws(() => normalizeSlot("Sparkle Pouch"), /unrecognised slot/);
  assert.throws(() => normalizeSlot("  "), /empty slot label/);
});

test("Method's typographic apostrophes join against Wowhead's straight ones", async () => {
  // Measured 2026-08-12: Method writes Nek’zali / Kings’ Rest, Wowhead writes Nek'zali.
  // Left unnormalized every Method boss name fails to join and G10 quietly loses a source.
  assert.equal(normalizeText("Nek’zali the Soulcoiler"), "Nek'zali the Soulcoiler");
  assert.equal(normalizeText("Kings’ Rest"), "Kings' Rest");
  assert.equal(normalizeText("a b   c"), "a b c");

  const [raid, dungeons] = await Promise.all([json("data/raid-items.json"), json("data/dungeon-items.json")]);
  const roster = rosterFrom(raid, dungeons);
  const straight = resolveDropSource("Nek'zali the Soulcoiler", roster);
  const curly = resolveDropSource("Nek’zali the Soulcoiler", roster);
  assert.deepEqual(curly, straight);
  assert.equal(straight.kind, "raid");
});

test("drop-source resolution folds Icy Veins' colliding free text onto one canonical name", async () => {
  const [raid, dungeons] = await Promise.all([json("data/raid-items.json"), json("data/dungeon-items.json")]);
  const roster = rosterFrom(raid, dungeons);

  // The collisions the recon measured across 140 bis_item_drop nodes.
  const short = resolveDropSource("Nek'zali", roster);
  const long = resolveDropSource("Nek'zali the Soulcoiler", roster);
  assert.equal(short.canonical, long.canonical);

  const withThe = resolveDropSource("The Coiled Altar", roster);
  const without = resolveDropSource("Coiled Altar", roster);
  assert.equal(withThe.canonical, without.canonical);

  // Crafted and Catalyst are typed, not forced onto a boss.
  assert.equal(resolveDropSource("Crafted by Leatherworking", roster).kind, "crafted");
  assert.equal(resolveDropSource("Leatherworking", roster).kind, "crafted");
  const a = resolveDropSource("Catalyst + Coiled Altar", roster);
  const b = resolveDropSource("Coiled Altar + Catalyst", roster);
  assert.equal(a.kind, "catalyst");
  assert.equal(a.base, b.base, "both orderings of the Catalyst idiom are the same fact");

  // An unmatchable name is a hard error (scope: never a dropped row).
  assert.throws(() => resolveDropSource("Some Boss We Never Harvested", roster), /matches no harvested/);
  assert.equal(resolveDropSource("Some Boss We Never Harvested", roster, { soft: true }), null);
});

test("bracket normalization maps every list heading the three sources publish", () => {
  assert.equal(normalizeBracket("Best Raid Gear"), "raid");
  assert.equal(normalizeBracket("Raiding"), "raid");
  assert.equal(normalizeBracket("Best Mythic+ Gear"), "mplus");
  assert.equal(normalizeBracket("Mythic Plus"), "mplus");
  assert.equal(normalizeBracket("Dungeon Healing"), "mplus");
  assert.equal(normalizeBracket("Overall Best in Slot"), "overall");
  assert.equal(normalizeBracket(""), "overall");
  for (const bracket of [normalizeBracket("Raiding"), normalizeBracket("M+"), normalizeBracket("")])
    assert.ok(BRACKETS.includes(bracket));

  assert.equal(bracketOfItem({ kind: "mplus" }), "mplus");
  assert.equal(bracketOfItem({ kind: "raid" }), "raid");
});

test("build ids are synthetic per source, so two outlets can publish the same variant name", () => {
  // G12's implementation note: the client matches builds by name, and a union across
  // sources collides without this.
  const iv = buildId("icyveins", "Herald of the Sun (raid healing)");
  const wh = buildId("wowhead", "Herald of the Sun (raid healing)");
  assert.notEqual(iv, wh);
  assert.match(iv, /^icyveins:/);
  assert.equal(slugify("Pack Leader, Single-Target"), "pack-leader-single-target");
  assert.equal(buildId("method", ""), "method:general");
});

test("soft caps embedded in priority labels are captured as data", () => {
  assert.deepEqual(parseSoftCap("Haste to 18%"), { stat: "Haste", value: 18, unit: "%", text: "Haste to 18%" });
  assert.deepEqual(parseSoftCap("Critical Strike to 40%"),
    { stat: "Critical Strike", value: 40, unit: "%", text: "Critical Strike to 40%" });
  assert.equal(parseSoftCap("Mastery"), null);
  assert.equal(parseSoftCap("Item Level"), null);
});

/* ---------- the counting rules themselves (G9 + G10) ---------- */

const pick = (source, bracket, endorsement, itemId = "1") => ({ source, bracket, endorsement, itemId, slot: "Head" });

test("G10: one source cannot vote twice, however many of its lists name the item", () => {
  // Icy Veins names the item in Overall, Raid AND M+ — the exact shape that would let one
  // outlet outvote the other two if each list counted.
  const picks = [
    pick("icyveins", "overall", "bis"), pick("icyveins", "raid", "bis"), pick("icyveins", "mplus", "bis"),
    pick("wowhead", "raid", "bis"),
  ];
  const consensus = consensusForItem(picks, { id: "1", kind: "raid" });
  assert.equal(consensus.picks, 2, "icyveins must contribute exactly one vote");
  assert.deepEqual(consensus.picksBy, ["icyveins", "wowhead"]);
});

test("G10: the item's own bracket selects which list votes, with overall as fallback", () => {
  const picks = [
    pick("icyveins", "mplus", "bis"),      // only names it for M+
    pick("wowhead", "overall", "bis"),     // no bracket list, only Overall
    pick("method", "raid", "bis"),
  ];
  // A RAID drop: icyveins' M+-only pick must not vote; overall still counts as fallback.
  const raid = consensusForItem(picks, { id: "1", kind: "raid" });
  assert.deepEqual(raid.picksBy, ["method", "wowhead"]);

  // The same picks against an M+ drop flip which sources apply.
  const mplus = consensusForItem(picks, { id: "1", kind: "mplus" });
  assert.deepEqual(mplus.picksBy, ["icyveins", "wowhead"]);
});

test("G9: picks and alternatives are counted separately and never summed", () => {
  const picks = [
    pick("icyveins", "raid", "bis"),
    pick("wowhead", "raid", "alternative"),
    pick("method", "raid", "alternative"),
  ];
  const consensus = consensusForItem(picks, { id: "1", kind: "raid" });
  assert.equal(consensus.picks, 1);
  assert.equal(consensus.alternatives, 2);
  assert.deepEqual(consensus.picksBy, ["icyveins"]);
  assert.deepEqual(consensus.alternativesBy, ["method", "wowhead"]);
  // A 1-pick item must outrank a 0-pick item however many alternatives the latter carries.
  const manyAlternatives = { picks: 0, alternatives: 3 };
  assert.ok(consensusRank(consensus) > consensusRank(manyAlternatives),
    "one BiS pick must outrank any number of weaker endorsements");
});

test("G9: a source that both picks and lists an item counts once, at its strongest", () => {
  const picks = [pick("icyveins", "raid", "alternative"), pick("icyveins", "raid", "bis")];
  const consensus = consensusForItem(picks, { id: "1", kind: "raid" });
  assert.equal(consensus.picks, 1);
  assert.equal(consensus.alternatives, 0, "the same source must not appear in both counts");
});

test("consensus ignores picks for other items and honours a source filter", () => {
  const picks = [pick("icyveins", "raid", "bis", "1"), pick("wowhead", "raid", "bis", "2")];
  assert.equal(consensusForItem(picks, { id: "1", kind: "raid" }).picks, 1);
  // G11's abstention path is not taken, but the filter is what would implement it.
  assert.equal(consensusForItem(picks, { id: "1", kind: "raid" }, { sources: ["wowhead"] }).picks, 0);
  assert.deepEqual(consensusForItem([], { id: "1", kind: "raid" }),
    { picks: 0, alternatives: 0, picksBy: [], alternativesBy: [] });
});

test("every canonical slot the guides can emit exists in the shipped item data", async () => {
  // Guards the join from the other end: a slot this lib can produce but no item carries
  // would mean a consensus that can never attach to anything.
  const [raid, dungeons] = await Promise.all([json("data/raid-items.json"), json("data/dungeon-items.json")]);
  const inData = new Set();
  for (const boss of raid.bosses) for (const item of boss.items) if (item.slot) inData.add(item.slot);
  for (const dungeon of dungeons.dungeons) for (const item of dungeon.items) if (item.slot) inData.add(item.slot);
  for (const slot of inData) assert.ok(SLOTS.includes(slot), `${slot} is in the data but not in SLOTS`);
});

/* ---------- defects the four Phase-B harvesters found in this contract (2026-08-13) ----------
   Each of these cost a real harvest: a full-roster dry run either lost a spec outright or
   silently mis-bracketed its picks. Pinned here so the fix cannot regress. */

test("normalizeBracket matches the PLURAL raid heading four Method specs publish", () => {
  // "Best Gear from the Raids" — measured 36/40 -> 40/40 pages parsing with this.
  assert.equal(normalizeBracket("Best Gear from the Raids"), "raid");
  assert.equal(normalizeBracket("Raids"), "raid");
});

test("HTML entities are decoded before the apostrophe fold, or every Method join fails", () => {
  // Method ships the BYTES &rsquo;, so folding the character alone never fires.
  assert.equal(normalizeText("Nek&rsquo;zali the Soulcoiler"), "Nek'zali the Soulcoiler");
  assert.equal(normalizeText("King&rsquo;s Rest"), "King's Rest");
  assert.equal(normalizeText("A &amp; B"), "A & B");
  assert.equal(normalizeText("&#8217;"), "'");
});

test("the raid instance itself resolves, not only its bosses", async () => {
  const [raid, dungeons] = await Promise.all([json("data/raid-items.json"), json("data/dungeon-items.json")]);
  const roster = rosterFrom(raid, dungeons);
  // Icy Veins writes "Venomous Abyss" for a pick it does not attribute to one boss; emitting
  // only bosses failed Outlaw Rogue's entire BiS page.
  const resolved = resolveDropSource("Venomous Abyss", roster);
  assert.equal(resolved.kind, "raid-instance");
  // A boss name must still beat the instance name.
  assert.equal(resolveDropSource("Nek'zali the Soulcoiler", roster).kind, "raid");
});

test("non-drop routes are typed, and a boss named alongside one still resolves", async () => {
  const [raid, dungeons] = await Promise.all([json("data/raid-items.json"), json("data/dungeon-items.json")]);
  const roster = rosterFrom(raid, dungeons);
  // "The Great Vault or Entombed Sentinels" — keep the boss, record the route.
  const both = resolveDropSource("The Great Vault or Entombed Sentinels", roster);
  assert.equal(both.kind, "raid");
  assert.equal(both.via, "vault");
  // A route with no boss beside it types cleanly instead of throwing.
  assert.equal(resolveDropSource("The Great Vault", roster).kind, "vault");
  assert.equal(resolveDropSource("BoE Trash Drop", roster).kind, "boe");
});

test("a profession with a parenthetical aside is still a profession", async () => {
  const [raid, dungeons] = await Promise.all([json("data/raid-items.json"), json("data/dungeon-items.json")]);
  const roster = rosterFrom(raid, dungeons);
  assert.equal(resolveDropSource("Jewelcrafting ( see note )", roster).kind, "crafted");
});

test("soft caps parse the RATING idiom as well as the percentage one", () => {
  // A rating cap and a percentage cap are different quantities and must not compare.
  assert.deepEqual(parseSoftCap("Haste (until 1800 rating)"),
    { stat: "Haste", value: 1800, unit: "rating", text: "Haste (until 1800 rating)" });
  assert.deepEqual(parseSoftCap("Haste (to 1100)"),
    { stat: "Haste", value: 1100, unit: "rating", text: "Haste (to 1100)" });
  assert.equal(parseSoftCap("Haste to 18%").unit, "%");
});

/* ---------- Phase C: the ordering rules (G15) and the default build (G17) ---------- */

const entry = (name, fit, consensus = {}) =>
  ({ item: { name }, fit, consensus: { picks: 0, alternatives: 0, ...consensus } });

test("G15: a BiS pick outranks every unnamed item, whatever their stat fit", () => {
  const ranked = rankCandidates([
    entry("unnamed-great", 0.99),
    entry("picked-poor", 0.10, { picks: 1 }),
  ]);
  assert.deepEqual(ranked.map((e) => e.item.name), ["picked-poor", "unnamed-great"]);
});

test("G15: an ALTERNATIVE does NOT outrank a better-statted unnamed item", () => {
  // The rejected 'strict' rule would put alt-poor first. The measured reason this matters:
  // a slot holds 1-3 named candidates against 5-15 unnamed ones, so strict gating would let
  // one passing mention decide most of the visible list.
  const ranked = rankCandidates([
    entry("alt-poor", 0.10, { alternatives: 2 }),
    entry("unnamed-great", 0.99),
  ]);
  assert.deepEqual(ranked.map((e) => e.item.name), ["unnamed-great", "alt-poor"]);
});

test("G15: an alternative BREAKS TIES against an unnamed item at equal fit", () => {
  const ranked = rankCandidates([
    entry("unnamed", 0.5),
    entry("alt", 0.5, { alternatives: 1 }),
  ]);
  assert.deepEqual(ranked.map((e) => e.item.name), ["alt", "unnamed"]);
});

test("G15: within the pick band, more picks wins, then more alternatives, then fit", () => {
  const ranked = rankCandidates([
    entry("one-pick-high-fit", 0.90, { picks: 1 }),
    entry("three-picks", 0.10, { picks: 3 }),
    entry("two-picks-no-alts", 0.80, { picks: 2 }),
    entry("two-picks-one-alt", 0.20, { picks: 2, alternatives: 1 }),
  ]);
  assert.deepEqual(ranked.map((e) => e.item.name),
    ["three-picks", "two-picks-one-alt", "two-picks-no-alts", "one-pick-high-fit"]);
});

test("G16: item level is absent from the ordering entirely", () => {
  // Passing an ilvl must change nothing — it is a column, never a term.
  const withIlvl = rankCandidates([
    { item: { name: "low-ilvl", ilvl: 200 }, fit: 0.9, consensus: { picks: 0, alternatives: 0 } },
    { item: { name: "high-ilvl", ilvl: 344 }, fit: 0.1, consensus: { picks: 0, alternatives: 0 } },
  ]);
  assert.deepEqual(withIlvl.map((e) => e.item.name), ["low-ilvl", "high-ilvl"]);
});

test("ranking is stable and does not mutate its input", () => {
  const input = [entry("b", 0.5), entry("a", 0.5)];
  const copy = JSON.parse(JSON.stringify(input));
  const ranked = rankCandidates(input);
  assert.deepEqual(JSON.parse(JSON.stringify(input)), copy, "input array must not be reordered");
  assert.deepEqual(ranked.map((e) => e.item.name), ["a", "b"], "equal entries fall back to name");
  assert.equal(bandOf({ picks: 1 }), BAND.PICK);
  assert.equal(bandOf({ picks: 0, alternatives: 5 }), BAND.PLAIN);
  assert.equal(bandOf(null), BAND.PLAIN);
});

test("G17: the default build is the scoping more than one source publishes", () => {
  const builds = [
    { source: "icyveins", label: "Herald of the Sun (raid healing)", heroTalent: "Herald of the Sun", bracket: "raid" },
    { source: "icyveins", label: "Mythic+ healing", heroTalent: null, bracket: "mplus" },
    { source: "wowhead", label: "Herald of the Sun, Raid", heroTalent: "Herald of the Sun", bracket: "raid" },
  ];
  // Two sources publish Herald-of-the-Sun/raid; nobody corroborates the M+ variant.
  assert.equal(defaultBuildFor(builds).heroTalent, "Herald of the Sun");
  assert.equal(scopeKey(builds[0]), scopeKey(builds[2]), "scoping is keyed on the axes, not the label text");
  assert.notEqual(builds[0].label, builds[2].label, "…and the outlets word it differently");
});

test("G17: with nothing corroborated, the first published variant wins", () => {
  const builds = [
    { source: "icyveins", label: "Deathbringer", heroTalent: "Deathbringer", bracket: null },
    { source: "wowhead", label: "San'layn", heroTalent: "San'layn", bracket: null },
  ];
  assert.equal(defaultBuildFor(builds).heroTalent, "Deathbringer");
  assert.equal(defaultBuildFor([]), null);
  assert.equal(defaultBuildFor(null), null);
});

test("G17: wholly unscoped variants never corroborate each other", () => {
  // Three sources each publishing one unscoped "General" priority is not agreement about
  // scoping — it is three outlets declining to scope. The first still wins, by fallback.
  const builds = [
    { source: "icyveins", label: "General", heroTalent: null, bracket: null },
    { source: "wowhead", label: "General", heroTalent: null, bracket: null },
    { source: "method", label: "Raid", heroTalent: null, bracket: "raid" },
  ];
  assert.equal(defaultBuildFor(builds).source, "icyveins");
});

/* ---------- Phase D: the game plan (G2, G18-G21) ---------- */

const ranked = (pairs) => new Map(Object.entries(pairs));
const src = (name, items) => ({ source: { name, kind: "raid" }, items });

test("G19: coverage counts SLOTS, and the extra options at one slot become depth", () => {
  // Three Back items is ONE slot covered and two depth — you can only wear one Back.
  const plans = planForSources(
    [src("Cloak Boss", [
      { id: "a", slot: "Back" }, { id: "b", slot: "Back" }, { id: "c", slot: "Back" }])],
    { rankedBySlot: ranked({ Back: ["a", "b", "c"] }) });
  assert.equal(plans[0].coverage, 1);
  assert.equal(plans[0].depth, 2);
  assert.deepEqual(plans[0].coveredSlots, ["Back"]);
});

test("G19: a boss improving two slots outranks one dropping three items for a single slot", () => {
  // The exact inversion the decision exists to prevent.
  const plans = sortPlans(planForSources([
    src("Three Cloaks", [{ id: "a", slot: "Back" }, { id: "b", slot: "Back" }, { id: "c", slot: "Back" }]),
    src("Weapon And Ring", [{ id: "w", slot: "Main Hand" }, { id: "r", slot: "Finger" }]),
  ], { rankedBySlot: ranked({ Back: ["a", "b", "c"], "Main Hand": ["w"], Finger: ["r"] }) }));
  assert.deepEqual(plans.map((p) => p.source.name), ["Weapon And Ring", "Three Cloaks"]);
  assert.equal(plans[0].coverage, 2);
  assert.equal(plans[1].coverage, 1);
});

test("items the spec has not ranked contribute nothing at all", () => {
  const plans = planForSources(
    [src("Boss", [{ id: "unranked", slot: "Head" }, { id: "ranked", slot: "Legs" }])],
    { rankedBySlot: ranked({ Legs: ["ranked"] }) });
  assert.equal(plans[0].coverage, 1);
  assert.deepEqual(plans[0].coveredSlots, ["Legs"]);
});

test("G2/G21: with no worn gear the delta is null, never zero", () => {
  // Zero would sort as though it had been measured; null is the state the page must announce.
  const plans = planForSources([src("Boss", [{ id: "a", slot: "Back", attainableIlvl: 318 }])],
    { rankedBySlot: ranked({ Back: ["a"] }) });
  assert.equal(plans[0].delta, null);
  assert.equal(plans[0].deltaBySlot, null);
  assert.equal(plans[0].coverage, 1, "coverage is still computable without a paste");
});

test("G21: the delta is measured at the highest attainable and carries its basis label", () => {
  const plans = planForSources(
    [src("Boss", [
      { id: "lfr", slot: "Back", attainableIlvl: 279, basisLabel: "at LFR" },
      { id: "myth", slot: "Back", attainableIlvl: 318, basisLabel: "at Mythic" }])],
    { rankedBySlot: ranked({ Back: ["myth", "lfr"] }), worn: { Back: 300 } });
  assert.equal(plans[0].delta, 18, "318 - 300, taking the highest attainable for the slot");
  assert.deepEqual(plans[0].deltaBySlot, { Back: 18 });
  assert.equal(plans[0].basis, "at Mythic", "the basis must travel with the number");
});

test("G21: a slot you already out-gear contributes no delta and never a negative one", () => {
  const plans = planForSources(
    [src("Boss", [{ id: "a", slot: "Back", attainableIlvl: 292, basisLabel: "at Normal" },
      { id: "b", slot: "Legs", attainableIlvl: 318, basisLabel: "at Mythic" }])],
    { rankedBySlot: ranked({ Back: ["a"], Legs: ["b"] }), worn: { Back: 318, Legs: 300 } });
  assert.equal(plans[0].delta, 18, "only the Legs gain counts");
  assert.deepEqual(Object.keys(plans[0].deltaBySlot), ["Legs"]);
  assert.equal(plans[0].coverage, 2, "…but both slots are still covered");
});

test("G18: the sort key is the caller's, and a delta sort without gear falls back to coverage", () => {
  const plans = planForSources([
    src("Wide", [{ id: "a", slot: "Back" }, { id: "b", slot: "Legs" }]),
    src("Deep", [{ id: "c", slot: "Head", attainableIlvl: 318 }]),
  ], { rankedBySlot: ranked({ Back: ["a"], Legs: ["b"], Head: ["c"] }) });

  assert.equal(planSortedBy("delta", plans), "coverage",
    "asking for a delta sort with no measured delta must report the key it actually used");
  assert.deepEqual(sortPlans(plans, "delta").map((p) => p.source.name), ["Wide", "Deep"]);
  assert.deepEqual(sortPlans(plans, "coverage").map((p) => p.source.name), ["Wide", "Deep"]);
});

test("G18: with gear pasted the two sort keys genuinely disagree", () => {
  // The case that proves the switch is worth having: broad coverage vs one huge upgrade.
  const plans = planForSources([
    src("Broad", [{ id: "a", slot: "Back", attainableIlvl: 302 },
      { id: "b", slot: "Legs", attainableIlvl: 302 }]),
    src("Single Big", [{ id: "c", slot: "Main Hand", attainableIlvl: 318 }]),
  ], { rankedBySlot: ranked({ Back: ["a"], Legs: ["b"], "Main Hand": ["c"] }),
    worn: { Back: 300, Legs: 300, "Main Hand": 260 } });

  assert.equal(planSortedBy("delta", plans), "delta");
  assert.deepEqual(sortPlans(plans, "coverage").map((p) => p.source.name), ["Broad", "Single Big"]);
  assert.deepEqual(sortPlans(plans, "delta").map((p) => p.source.name), ["Single Big", "Broad"]);
});

test("the two components are returned side by side and never summed", () => {
  const plans = planForSources([src("Boss", [{ id: "a", slot: "Back", attainableIlvl: 318 }])],
    { rankedBySlot: ranked({ Back: ["a"] }), worn: { Back: 300 } });
  const plan = plans[0];
  assert.equal(plan.coverage, 1);
  assert.equal(plan.delta, 18);
  // Nothing in the record combines them — no total, score or rank field.
  for (const forbidden of ["score", "total", "value", "rank", "combined"]) {
    assert.ok(!(forbidden in plan), `plan must not carry a merged "${forbidden}" field`);
  }
});

test("sorting does not mutate, and an empty plan set is honest rather than throwing", () => {
  const plans = planForSources([src("A", [{ id: "x", slot: "Back" }])],
    { rankedBySlot: ranked({ Back: ["x"] }) });
  const copy = JSON.parse(JSON.stringify(plans));
  sortPlans(plans, "delta");
  assert.deepEqual(JSON.parse(JSON.stringify(plans)), copy);
  assert.deepEqual(planForSources([], {}), []);
  assert.deepEqual(sortPlans([], "coverage"), []);
  assert.deepEqual(planForSources(null, {}), []);
});

test("a worn slot the caller never stated is unmeasurable, not item level zero", () => {
  // Found in Phase D: reading an unmentioned slot as 0 reported the candidate's ENTIRE
  // item level as gain, so a slot the paste happened not to mention dominated the plan.
  const plans = planForSources(
    [{ source: { name: "Boss" }, items: [
      { id: "a", slot: "Back", attainableIlvl: 318, basisLabel: "at Mythic" },
      { id: "b", slot: "Legs", attainableIlvl: 318, basisLabel: "at Mythic" }] }],
    { rankedBySlot: new Map([["Back", ["a"]], ["Legs", ["b"]]]), worn: { Back: 300 } });
  assert.equal(plans[0].delta, 18, "only the slot the caller stated is measured");
  assert.deepEqual(Object.keys(plans[0].deltaBySlot), ["Back"]);
  assert.equal(plans[0].coverage, 2, "…but both slots are still covered");
});
