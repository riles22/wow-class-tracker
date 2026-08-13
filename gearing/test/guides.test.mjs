import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { BRACKETS, buildId, bracketOfItem, consensusForItem, consensusRank, normalizeBracket,
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
