// Wowhead enhancements-lane parser tests (enchants / gems / consumables sibling page,
// lib-guides.mjs "Enhancements lane" contract). Fixtures are the live pages saved
// 2026-08-18, and they carry the real traps the recipe was written against: doubled
// [/td][/td] closes, slot vocabulary drift ("Helmet", "Ring " with a trailing space),
// the metagem row named by the gem itself rather than a slot, multi-candidate Best
// cells across all three separators (/, +, raw newline), and the Holy Paladin Weapon
// Buff cell holding an item AND a [spell=] imbue split by hero talent.
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { ENHANCEMENT_CONSUMABLE_KEYS, canonicalSlot, validateEnhancements }
  from "../src/lib-guides.mjs";
import { gathererNames, gathererSpellNames, guideBody, parseWowheadEnhancements }
  from "../src/harvest-guide-wowhead.mjs";

const fixture = (name) => readFile(new URL(`./fixtures/guides/${name}`, import.meta.url), "utf8");
const parse = (html) =>
  parseWowheadEnhancements(guideBody(html) || "", gathererNames(html), gathererSpellNames(html));

const consumableKeys = (c) => Object.keys(c).filter((k) => k !== "note");

test("Wowhead enhancements: Frost Mage — canonical slots, gem split, full consumable set", async () => {
  const html = await fixture("wowhead-frost-mage-enh.html");
  const enh = parse(html);
  assert.ok(enh, "era-verified page must parse");
  validateEnhancements(enh, "wowhead/Frost Mage"); // the shared contract passes

  // Enchant slots in the page's published order, all canonical; "Weapon" → Main Hand.
  assert.deepEqual(enh.enchants.map((e) => e.slot),
    ["Main Hand", "Head", "Shoulder", "Chest", "Legs", "Feet", "Finger"]);
  assert.ok(enh.enchants.every((e) => canonicalSlot(e.slot) === e.slot));
  assert.deepEqual(enh.enchants[0].candidates,
    [{ id: "244029", name: "Enchant Weapon - Acuity of the Ren'dorei" }]);
  // The two rows with live doubled [/td][/td] closes still parsed (lenient td matcher).
  assert.equal(enh.enchants.find((e) => e.slot === "Legs").candidates[0].id, "240133");
  assert.equal(enh.enchants.find((e) => e.slot === "Finger").candidates[0].id, "256739");

  // Metagem row (slot cell is the gem's own name, /Diamond$/) → gems.unique;
  // "Other Gems" → gems.filler, all four /-separated candidates in published order.
  assert.deepEqual(enh.gems.unique, [{ id: "240967", name: "Powerful Eversong Diamond" }]);
  assert.deepEqual(enh.gems.filler.map((g) => g.id), ["240898", "240908", "240892", "240918"]);

  // Full consumable coverage for the DPS sample — and no invented manaPotion.
  assert.deepEqual(consumableKeys(enh.consumables).sort(),
    ["augmentRune", "combatPotion", "flask", "food", "healthPotion", "tea", "weaponBuff"]);
  assert.ok(consumableKeys(enh.consumables).every((k) => ENHANCEMENT_CONSUMABLE_KEYS.includes(k)));
  // Multi-candidate cells keep the published order across all three separators:
  assert.deepEqual(enh.consumables.combatPotion.map((c) => c.id), ["241308", "241288"]); // "/"
  assert.deepEqual(enh.consumables.food.map((c) => c.id), ["255846", "242274"]); // raw newline
  assert.deepEqual(enh.consumables.tea.map((c) => c.id), ["242298", "242299", "242301"]);
  assert.deepEqual(enh.consumables.weaponBuff, [{ id: "243734", name: "Thalassian Phoenix Oil" }]);
  // The [h3] prose that ADDS ids (cheaper runes, the potion caveat) reached the note.
  assert.match(enh.consumables.note, /Ethereal Augment Rune/);
});

test("Wowhead enhancements: Holy Paladin — healer lanes, imbue conditional, tea omitted", async () => {
  const html = await fixture("wowhead-holy-paladin-enh.html");
  const enh = parse(html);
  assert.ok(enh);
  validateEnhancements(enh, "wowhead/Holy Paladin");

  // Slot drift absorbed: "Helmet" → Head, "Ring " (trailing space) → Finger.
  assert.equal(enh.enchants.find((e) => e.slot === "Head").candidates[0].id, "243951");
  assert.equal(enh.enchants.find((e) => e.slot === "Finger").candidates[0].id, "243959");

  assert.deepEqual(enh.gems.unique, [{ id: "240969", name: "Telluric Eversong Diamond" }]);

  // Healer lanes: "Stats Potion" → combatPotion, plus a real manaPotion row.
  assert.deepEqual(enh.consumables.combatPotion.map((c) => c.id), ["241288"]);
  assert.deepEqual(enh.consumables.manaPotion,
    [{ id: "241300", name: "Lightfused Mana Potion" }]);
  // Weapon Buff carries BOTH the oil item and the [spell=] imbue as ordered candidates —
  // a first-item-only parse would silently drop the Lightsmith recommendation — and the
  // hero-talent conditional lands in the note.
  assert.deepEqual(enh.consumables.weaponBuff, [
    { id: "243734", name: "Thalassian Phoenix Oil" },
    { spellId: "433568", name: "Rite of Sanctification" },
  ]);
  assert.match(enh.consumables.note,
    /Thalassian Phoenix Oil as Herald \/ Rite of Sanctification as Lightsmith/);
  // The page publishes no Tea row: the key is OMITTED, never invented or nulled.
  assert.ok(!("tea" in enh.consumables));
});

test("gathererSpellNames reads the type-6 payload the imbue candidates resolve from", async () => {
  const spells = gathererSpellNames(await fixture("wowhead-holy-paladin-enh.html"));
  assert.equal(spells.get("433568"), "Rite of Sanctification");
});

test("era gate: a body not self-identifying Midnight Season 2 records absence (null)", async () => {
  const html = await fixture("wowhead-frost-mage-enh.html");
  const body = guideBody(html);
  const names = gathererNames(html);
  const spells = gathererSpellNames(html);
  assert.ok(parseWowheadEnhancements(body, names, spells), "control: the real body parses");
  const drifted = body.replaceAll("[b]Midnight Season 2[/b]", "[b]Midnight Season 3[/b]");
  assert.equal(parseWowheadEnhancements(drifted, names, spells), null);
  assert.equal(parseWowheadEnhancements("", names, spells), null);
});
