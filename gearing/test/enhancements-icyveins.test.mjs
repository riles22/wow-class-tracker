// Icy Veins ENHANCEMENTS parser tests (the gems / enchants / consumables page).
// Fixtures are byte excerpts of the live pages saved 2026-08-18. The two fixtures pin
// the two markup variants found live: Frost Mage (bare table cells, a FAQ dropdown
// carrying polluting data-wowhead refs, augment-rune section present) and Holy Paladin
// (<ul><li>-wrapped cells, a two-enchant Rings cell with a parenthetical scope, a
// hero-talent SPELL oil exception, a mana potion, and NO augment-rune section).
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { canonicalSlot, validateEnhancements } from "../src/lib-guides.mjs";
import { parseIcyVeinsEnhancements } from "../src/harvest-guide-icyveins.mjs";

const fixture = (name) => readFile(new URL(`./fixtures/guides/${name}`, import.meta.url), "utf8");
/** Every candidate anywhere in the block — for "X must not appear as a candidate" checks. */
const allCands = (enh) => [
  ...(enh.enchants ?? []).flatMap((e) => e.candidates),
  ...(enh.gems?.unique ?? []), ...(enh.gems?.filler ?? []),
  ...Object.entries(enh.consumables ?? {}).filter(([k]) => k !== "note").flatMap(([, v]) => v),
];

test("Frost Mage: table enchants, oil -> weaponBuff, gem lanes, potion split, FAQ stripped", async () => {
  const enh = parseIcyVeinsEnhancements(await fixture("iv-frost-mage-enh.html"));
  validateEnhancements(enh, "Frost Mage"); // the shared contract passes
  // enchants table: 7 slot rows in page order, every slot canonical
  assert.deepEqual(enh.enchants.map((e) => e.slot),
    ["Finger", "Main Hand", "Chest", "Head", "Shoulder", "Feet", "Legs"]);
  assert.ok(enh.enchants.every((e) => canonicalSlot(e.slot) === e.slot));
  const finger = enh.enchants.find((e) => e.slot === "Finger");
  assert.deepEqual(finger.candidates, [{ id: "243956", name: "Eyes of the Eagle" }]);
  assert.match(finger.note, /whatever your sim tells you/);
  assert.deepEqual(enh.enchants.find((e) => e.slot === "Legs").candidates,
    [{ id: "240133", name: "Sunfire Silk Spellthread" }]);
  // the weapon oil is NOT in the table — it normalizes into consumables.weaponBuff
  assert.deepEqual(enh.consumables.weaponBuff, [{ id: "243733", name: "Thalassian Phoenix Oil" }]);
  // augment-rune h3 present on this page
  assert.deepEqual(enh.consumables.augmentRune, [{ id: "259085", name: "Void-Touched Augment Rune" }]);
  // the meta-style Diamond is the unique gem; the rest are socket filler
  assert.deepEqual(enh.gems.unique, [{ id: "240983", name: "Indecipherable Eversong Diamond" }]);
  assert.deepEqual(enh.gems.filler, [{ id: "240908", name: "Flawless Masterful Garnet" }]);
  assert.ok(enh.gems.note, "gems keep their prose as the note");
  // potions classify by name; the Warlock Healthstone (5512) is note-only
  assert.deepEqual(enh.consumables.combatPotion, [{ id: "241288", name: "Potion of Recklessness" }]);
  assert.deepEqual(enh.consumables.healthPotion,
    [{ id: "271883", name: "Concentrated Silvermoon Health Potion" }]);
  assert.ok(!allCands(enh).some((c) => c.id === "5512" || /healthstone/i.test(c.name)),
    "Healthstone must never be a candidate");
  assert.match(enh.consumables.note, /Healthstone/);
  assert.deepEqual(enh.consumables.flask, [{ id: "241326", name: "Flask of the Shattered Sun" }]);
  assert.deepEqual(enh.consumables.food.map((c) => c.id), ["255846", "255845", "242275", "255847"]);
  // the FAQ dropdown's refs must not leak: its spells appear nowhere, and its mention
  // of the combat potion does not duplicate the real potions-section candidate
  assert.ok(!allCands(enh).some((c) => c.spellId === "1247025" || c.spellId === "1246811"));
  assert.equal(allCands(enh).filter((c) => c.id === "241288").length, 1);
});

test("Holy Paladin: li-wrapped cells, two-candidate Rings, spell oil exception, no augment rune", async () => {
  const enh = parseIcyVeinsEnhancements(await fixture("iv-holy-paladin-enh.html"));
  validateEnhancements(enh, "Holy Paladin"); // the shared contract passes
  assert.deepEqual(enh.enchants.map((e) => e.slot),
    ["Main Hand", "Head", "Shoulder", "Chest", "Legs", "Feet", "Finger"]);
  // the Rings cell holds TWO enchants, page order kept; the "(Damage)" scope is the
  // note. The first prints as a stat string ("+29 Mastery"), so its name comes from
  // the img alt with the trailing " Icon" stripped.
  const finger = enh.enchants.find((e) => e.slot === "Finger");
  assert.deepEqual(finger.candidates, [
    { id: "243959", name: "Enchant Ring - Zul'jin's Mastery" },
    { id: "244014", name: "Silvermoon's Alacrity" },
  ]);
  assert.match(finger.note, /\(Damage\)/);
  // oil paragraph: the primary oil leads, and the Lightsmith hero-talent exception is
  // a SPELL candidate with the conditionality prose riding in the note
  assert.equal(enh.consumables.weaponBuff[0].id, "243733");
  assert.ok(enh.consumables.weaponBuff.some(
    (c) => c.spellId === "433568" && c.name === "Rite of Sanctification"));
  assert.match(enh.consumables.note, /Lightsmith/);
  // healers get a mana potion lane alongside the combat potion
  assert.deepEqual(enh.consumables.manaPotion, [{ id: "241301", name: "Lightfused Mana Potion" }]);
  assert.deepEqual(enh.consumables.combatPotion, [{ id: "241288", name: "Potion of Recklessness" }]);
  assert.deepEqual(enh.consumables.healthPotion.map((c) => c.id), ["271883"]);
  // the augment-rune h3 is genuinely absent -> the key is OMITTED, not empty
  assert.ok(!("augmentRune" in enh.consumables));
  // both Diamonds land in the unique lane; the four colored fillers keep prose order
  assert.deepEqual(enh.gems.unique.map((c) => c.id), ["240968", "240983"]);
  assert.deepEqual(enh.gems.filler.map((c) => c.id), ["240900", "240908", "240892", "240917"]);
  assert.match(enh.gems.note, /Telluric/);
  // flask alternatives keep published order (primary first)
  assert.deepEqual(enh.consumables.flask.map((c) => c.id), ["241322", "241325", "241326"]);
  // the feast is a SPELL ref on this page — spell candidates are first-class
  assert.deepEqual(enh.consumables.food, [
    { spellId: "1278895", name: "Hearty Silvermoon Parade" },
    { id: "242747", name: "Hearty Royal Roast" },
  ]);
});
