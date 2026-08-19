// Method enhancements-lane parser tests (enchants / gems / consumables — the shared
// lib-guides contract). Fixtures are the full Method stats pages saved 2026-08-18; the
// pair pins both markup shapes that make a naive parser silently wrong: Frost Mage's
// UNLABELED gems prose (a label-first parser finds nothing) and Holy Paladin's MANA
// potion under a plain "Potions" label (a label-first classifier calls it a combat
// potion). Absence is honest data: Holy Paladin publishes no augment rune, so the key
// must be omitted — never nulled, never invented.
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { validateEnhancements } from "../src/lib-guides.mjs";
import { parseMethodEnhancements } from "../src/harvest-guide-method.mjs";

const fixture = (name) => readFile(new URL(`./fixtures/guides/${name}`, import.meta.url), "utf8");
const frost = parseMethodEnhancements(await fixture("method-frost-mage-stats.html"));
const hpal = parseMethodEnhancements(await fixture("method-holy-paladin-stats.html"));

test("frost mage: seven enchant slots, canonicalized, one candidate each in page order", () => {
  assert.equal(frost.enchants.length, 7);
  assert.deepEqual(frost.enchants.map((e) => e.slot),
    ["Head", "Shoulder", "Chest", "Feet", "Legs", "Finger", "Main Hand"]);
  for (const e of frost.enchants) {
    assert.equal(e.candidates.length, 1);
    assert.match(e.candidates[0].id, /^\d+$/);
    assert.ok(e.candidates[0].name.length > 0);
  }
  // Rings -> Finger and Weapon -> Main Hand are the alias mappings that matter.
  const bySlot = Object.fromEntries(frost.enchants.map((e) => [e.slot, e.candidates[0]]));
  assert.deepEqual(bySlot["Finger"], { id: "243957", name: "Enchant Ring - Eyes Of The Eagle" });
  assert.deepEqual(bySlot["Main Hand"],
    { id: "244029", name: "Enchant Weapon - Acuity Of The Ren'dorei" });
  // Leg armor-kits lack the "Enchant" name prefix — still a normal candidate.
  assert.deepEqual(bySlot["Legs"], { id: "240133", name: "Sunfire Silk Spellthread" });
});

test("frost mage: gems parse from pure unlabeled prose — unique and filler both land", () => {
  assert.deepEqual(frost.gems.unique, [{ id: "240983", name: "Indecipherable Eversong Diamond" }]);
  assert.deepEqual(frost.gems.filler, [{ id: "240908", name: "Flawless Masterful Garnet" }]);
  assert.match(frost.gems.note, /meta gem/);
  assert.match(frost.gems.note, /remaining sockets/);
});

test("frost mage: all six published consumable categories, oils under weaponBuff", () => {
  assert.deepEqual(Object.keys(frost.consumables).sort(),
    ["augmentRune", "combatPotion", "flask", "food", "healthPotion", "weaponBuff"]);
  assert.deepEqual(frost.consumables.combatPotion, [{ id: "241288", name: "Potion Of Recklessness" }]);
  assert.deepEqual(frost.consumables.flask, [{ id: "241326", name: "Flask Of The Shattered Sun" }]);
  assert.deepEqual(frost.consumables.food, [{ id: "255846", name: "Harandar Celebration" }]);
  assert.deepEqual(frost.consumables.healthPotion,
    [{ id: "271884", name: "Concentrated Silvermoon Health Potion" }]);
  // The page's "Weapon Oil" and "Runes" labels normalize into the contract keys.
  assert.deepEqual(frost.consumables.weaponBuff, [{ id: "243734", name: "Thalassian Phoenix Oil" }]);
  assert.deepEqual(frost.consumables.augmentRune, [{ id: "259085", name: "Void-Touched Augment Rune" }]);
  assert.ok(!("manaPotion" in frost.consumables), "a DPS page publishes no mana potion");
  assert.ok(!("tea" in frost.consumables));
});

test("holy paladin: the Potions label holds a MANA potion — classified by item name", () => {
  assert.deepEqual(hpal.consumables.manaPotion, [{ id: "241300", name: "Lightfused Mana Potion" }]);
  assert.ok(!("combatPotion" in hpal.consumables),
    "the only Potions row is a mana potion, so combatPotion must be absent");
});

test("holy paladin: no augment rune published — the key is OMITTED, not invented", () => {
  assert.ok(!("augmentRune" in hpal.consumables));
  assert.deepEqual(Object.keys(hpal.consumables).sort(),
    ["flask", "food", "healthPotion", "manaPotion", "weaponBuff"]);
});

test("holy paladin: the Flasks row's ' or ' alternatives both land, page order kept", () => {
  assert.deepEqual(hpal.consumables.flask, [
    { id: "241324", name: "Flask Of The Blood Knights" },
    { id: "241322", name: "Flask Of The Magisters" },
  ]);
});

test("holy paladin: bold-labeled gem rows with the link nested inside the <b>", () => {
  assert.deepEqual(hpal.gems.unique, [{ id: "240969", name: "Telluric Eversong Diamond" }]);
  assert.deepEqual(hpal.gems.filler, [
    { id: "240892", name: "Flawless Masterful Peridot" },
    { id: "240900", name: "Flawless Quick Amethyst" },
  ]);
  assert.match(hpal.gems.note, /when you get enough sockets/);
});

test("holy paladin: seven enchants — singular 'Shoulder' label still canonicalizes", () => {
  assert.equal(hpal.enchants.length, 7);
  assert.deepEqual(hpal.enchants.map((e) => e.slot),
    ["Head", "Shoulder", "Chest", "Feet", "Legs", "Finger", "Main Hand"]);
});

test("both parsed blocks pass the shared contract validator", () => {
  validateEnhancements(frost, "Frost Mage (fixture)");
  validateEnhancements(hpal, "Holy Paladin (fixture)");
});

test("a page without the sections records no enhancements — absence, not failure", async () => {
  // The BiS/gearing page carries none of the three anchors (verified: every
  // enchant/consumable string on it is nav noise pointing at the stats page).
  assert.equal(parseMethodEnhancements(await fixture("method-hpal-gearing.html")), null);
  validateEnhancements(null, "absent (fixture)"); // null is a valid, silent no-op
});
