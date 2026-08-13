import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dungeonLootIdsFrom, parseItem, parsedItemIssues, raidBossLootIdsFrom } from "../src/lib-wowhead.mjs";
import { extractPriority } from "../src/lib-icy-veins.mjs";
import { validateData } from "../src/validate-data.mjs";

const fromRoot = (path) => new URL(`../${path}`, import.meta.url);
const json = async (path) => JSON.parse(await readFile(fromRoot(path), "utf8"));
const clone = (value) => JSON.parse(JSON.stringify(value));

async function allValidatedData() {
  const [raid, specs, dungeons, sheet, statOverrides, statBaseline, weaponProficiency, itemEligibility,
    tier, catalyst, catalystAllocations] = await Promise.all([
    json("data/raid-items.json"), json("data/specs.json"), json("data/dungeon-items.json"),
    json("data/sheet-rewards.json"), json("data/stat-priority-overrides.json"),
    json("data/stat-priority-baseline.json"), json("data/weapon-proficiency.json"),
    json("data/item-eligibility-overrides.json"),
    json("data/tier-items.json"), json("data/catalyst-rules.json"),
    json("data/catalyst-stat-allocations.json"),
  ]);
  return { raid, specs, dungeons, sheet, statOverrides, statBaseline, weaponProficiency,
    itemEligibility, tier, catalyst, catalystAllocations };
}

/* The client harness. Every client test boots the real app script out of
   src/app.template.html through `new Function`, exactly as the browser would, against the
   FakeElement DOM below — the cheap boot check that runs without Playwright. There is no
   `location` and no `history` in that scope, so URL touches in the app must stay
   typeof-guarded (see the deep-link comment in app.template.html). */
async function clientFixture() {
  const [template, raid, specs, dungeons, sheet, itemEligibility, tier, catalyst,
    catalystAllocations, icons] = await Promise.all([
    readFile(fromRoot("src/app.template.html"), "utf8"),
    json("data/raid-items.json"), json("data/specs.json"), json("data/dungeon-items.json"),
    json("data/sheet-rewards.json"), json("data/item-eligibility-overrides.json"),
    json("data/tier-items.json"), json("data/catalyst-rules.json"),
    json("data/catalyst-stat-allocations.json"), json("data/icons.json"),
  ]);
  const data = { raid, specs, dungeons, sheet, itemEligibility, tier, catalyst,
    catalystAllocations, icons: icons.icons };
  const scripts = [...template.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
  const appSource = `${scripts.at(-1)[1]}\nreturn { current: () => CUR, `
    + "scoreFor: id => scoreItem(CUR, BY_ID[id]), weights: () => activeWeights(CUR), "
    + "builds: () => buildsFor(CUR), build: () => activeBuild(), priority: () => activePriority() };";
  const startClient = (clientData = data) => {
    const document = fakeDocument(clientData);
    const app = new Function("document", "innerWidth", "innerHeight", appSource)(document, 1600, 900);
    return { document, app };
  };
  return { template, data, specs, startClient };
}

const GUIDE_MULTIPLIERS = [1, 0.75, 0.5, 0.25];
const guideWeightsOf = (build) =>
  Object.fromEntries(build.secondaries.map((stat, index) => [stat, GUIDE_MULTIPLIERS[index]]));

function guidePage(markup) {
  return `<script>WH.markup.printHtml(${JSON.stringify(markup)}, "guide-body", {});</script>`;
}

function handMatches(hand, item) {
  return !!hand && !hand.mustBeEmpty
    && hand.inventorySlots.includes(item.slot)
    && hand.itemTypes.some((type) => type === (item.type == null ? null : item.type));
}

function weaponMatches(spec, item, handName = null) {
  const short = spec.statPriority.primary.slice(0, 3);
  const primary = item.primary === "Any" || String(item.primary).split("/").includes(short);
  return primary && spec.weaponLoadouts.some((loadout) => {
    const hands = handName ? [handName] : ["mainHand", "offHand"];
    return hands.some((hand) => handMatches(loadout.hands[hand], item));
  });
}

class FakeElement {
  constructor(tagName = "div") {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.listeners = {};
    this.style = {};
    this.dataset = {};
    this.attributes = {};
    this.value = "";
    this.disabled = false;
    this.hidden = false;
    this.tabIndex = 0;
    this.textContent = "";
    this.classList = { add() {}, remove() {} };
    this._innerHTML = "";
  }
  get innerHTML() { return this._innerHTML; }
  set innerHTML(value) {
    this._innerHTML = String(value);
    if (value === "") {
      this.children = [];
      if (this.tagName === "SELECT") this.value = "";
    }
  }
  appendChild(child) {
    this.children.push(child);
    if (this.tagName === "SELECT" && !this.value) {
      const option = child.tagName === "OPTION" ? child
        : child.children.find((candidate) => candidate.tagName === "OPTION");
      if (option) this.value = option.value;
    }
    return child;
  }
  addEventListener(name, handler) { this.listeners[name] = handler; }
  setAttribute(name, value) {
    this.attributes[name] = String(value);
    if (name === "tabindex") this.tabIndex = Number(value);
  }
  getAttribute(name) { return this.attributes[name] ?? null; }
  removeAttribute(name) { delete this.attributes[name]; }
  focus() {}
  contains() { return false; }
  getBoundingClientRect() { return {right: 0, bottom: 0}; }
}

function fakeDocument(data) {
  const ids = new Map();
  for (const id of ["spec", "build", "scoring-mode", "spec-info", "scoring-summary", "weight-editor",
    "weight-crit", "weight-haste", "weight-mast", "weight-vers", "weight-reset", "bis-note", "bis",
    "tier-note", "tier", "src", "paths-note", "paths", "up", "simc", "curilvl", "up-hint",
    "p-items", "p-specs", "foot", "parse"])
    ids.set(id, new FakeElement(["spec", "build", "scoring-mode"].includes(id) ? "select"
      : id.startsWith("weight-") && id !== "weight-reset" ? "input" : "div"));
  ids.get("scoring-mode").value = "consensus";
  ids.get("weight-editor").hidden = true;
  ids.get("curilvl").value = "292";
  const dataElement = new FakeElement("script");
  dataElement.textContent = JSON.stringify(data);
  ids.set("data", dataElement);
  return {
    ids,
    body: new FakeElement("body"),
    createElement: (tag) => new FakeElement(tag),
    getElementById: (id) => ids.get(id) || null,
    querySelector: (selector) => selector.startsWith("#") ? ids.get(selector.slice(1)) || null : null,
    querySelectorAll: () => [],
    addEventListener() {},
  };
}

test("tooltip parsing preserves rating amounts and hybrid primary stats", () => {
  const item = parseItem({
    name: "Hybrid Shield", quality: 4, icon: "shield",
    tooltip: "Item Level 300<br>Binds when picked up<br>Unique-Equipped<br>Off Hand<br>Shield<br>+1,250 Strength<br>+1,250 Intellect<br>+700 Critical Strike<br>+350 Mastery<div>Classes: Priest</div><br>+125 Leech<br>+90 Avoidance<br>+80 Speed<br>Indestructible<br>Prismatic Socket",
  }, "1");
  assert.equal(item.primary, "Str/Int");
  assert.deepEqual(item.secondaries, ["Crit", "Mast"]);
  assert.deepEqual(item.secondaryRatings, { Crit: 700, Mast: 350 });
  assert.deepEqual(item.tertiaries, ["Leech", "Avoidance", "Speed", "Indestructible"]);
  assert.deepEqual(item.tertiaryRatings, { Leech: 125, Avoidance: 90, Speed: 80 });
  assert.deepEqual(item.sockets, ["Prismatic Socket"]);
  assert.deepEqual(item.classes, ["Priest"]);
  assert.equal(item.uniqueEquipped, true);
  assert.deepEqual(parsedItemIssues(item), []);
});

test("tooltip parsing preserves every Use and Equip effect", () => {
  const item = parseItem({
    name: "Two-effect Trinket", quality: 4, icon: "trinket",
    tooltip: "Item Level 300<br>Trinket<br>Use: Gain 500 Intellect for 20 sec.<br>Equip: Harmful spells grant 100 Haste.<br>Requires Level 90",
  }, "2");
  assert.deepEqual(item.effects, [
    { kind: "Use", text: "Gain 500 Intellect for 20 sec." },
    { kind: "Equip", text: "Harmful spells grant 100 Haste." },
  ]);
  assert.equal(item.effectKind, "Use");
  assert.equal(item.effect, "Gain 500 Intellect for 20 sec.");
  assert.deepEqual(parsedItemIssues(item), []);
});

test("guide parsers select semantic loot tables and ignore unrelated links", () => {
  const dungeon = guidePage([
    "[h2]Gear Drops[/h2]",
    "[table][tr][td]Armor[/td][/tr][tr][td]Item[/td][td]Boss Drop[/td][/tr]",
    "[tr][td][item=101 bonus=1][/td][td]Boss One[/td][/tr][/table]",
    "[h2]Class Bonus Rolls[/h2][table][tr][td]Item[/td][td]Slot[/td][/tr]",
    "[tr][td][item=999][/td][td]Weapon[/td][/tr][/table]",
  ].join(""));
  const raid = guidePage([
    "[h3]Gear[/h3][table][tr][td]Item[/td][td]Slot[/td][/tr]",
    "[tr][td][item=201][/td][td]Head[/td][/tr][/table]",
    "[h3]More Rewards[/h3][table][tr][td]Item[/td][td]Slot[/td][/tr]",
    "[tr][td][item=998][/td][td]Mount[/td][/tr][/table]",
  ].join(""));
  assert.deepEqual(dungeonLootIdsFrom(dungeon), ["101"]);
  assert.deepEqual(raidBossLootIdsFrom(raid), ["201"]);
  assert.throws(() => dungeonLootIdsFrom(guidePage("[h2>Overview[/h2]")), /loot table/);
});

test("Icy Veins parser uses the article patch and preserves the ordered stat run", () => {
  const preferred = [
    "<title>Navigation mentions Patch 12.0.5</title>",
    "<h1>Shadow Priest Stat Priority — 12.0.7</h1>",
    "<p>A good guideline for stats is:</p>",
    "<div>Intellect</div><div>Haste</div><div>Mastery</div><div>Critical Strike</div><div>Versatility</div>",
  ].join("");
  assert.deepEqual(extractPriority(preferred), {
    patch: "12.0.7",
    priority: { primary: "Intellect", secondaries: ["Haste", "Mast", "Crit", "Vers"] },
  });

  const fallback = "<h1>Example Guide - 12.0.7</h1><p>Haste</p><p>Mastery</p><p>Critical Strike</p><p>Versatility</p>";
  assert.deepEqual(extractPriority(fallback).priority, {
    primary: null, secondaries: ["Haste", "Mast", "Crit", "Vers"],
  });
  assert.equal(extractPriority("<h1>Broken - 12.0.7</h1><p>Haste</p>").priority, null);
});

test("generated datasets satisfy all build invariants", async () => {
  const data = await allValidatedData();
  const { raid, dungeons } = data;
  const retiredDelves = await json("data/delve-items.json");
  assert.deepEqual(validateData(data), {
    specs: 40, raidBosses: 8, dungeons: 8,
  });
  const kingsRest = dungeons.dungeons.find((dungeon) => dungeon.name === "Kings' Rest");
  const temple = dungeons.dungeons.find((dungeon) => dungeon.name === "Temple of Sethraliss");
  assert.ok(kingsRest.items.some((item) => item.id === "159645"));
  assert.equal(temple.items.some((item) => item.id === "159645"), false);
  assert.ok(raid.bosses.find((boss) => boss.boss === 1).items.some((item) => item.id === "268231"));
  assert.equal(raid.bosses.find((boss) => boss.boss === 7).items.some((item) => item.id === "268231"), false);
  assert.equal(raid.counts.tokens, 21);
  assert.ok(raid.bosses.find((boss) => boss.boss === 8).items.some((item) => item.id === "270909"));
  const hexIdol = raid.bosses.flatMap((boss) => boss.items).find((item) => item.id === "270169");
  assert.deepEqual(hexIdol.effects.map((effect) => effect.kind), ["Equip", "Use"]);
  assert.deepEqual({status: retiredDelves.status, consumedByBuild: retiredDelves.consumedByBuild,
    items: retiredDelves.items}, {status: "retired", consumedByBuild: false, items: []});
  const catalystBases = [...raid.bosses, ...dungeons.dungeons].flatMap((group) => group.items)
    .filter((item) => ["Head", "Shoulder", "Chest", "Hands", "Legs"].includes(item.slot));
  assert.equal(catalystBases.length, 94);
  assert.deepEqual(data.catalyst.mappedVenomcursedItemIds,
    ["271874", "271875", "271876", "271878"]);
  const directTier = data.tier.sets.flatMap((set) => set.items);
  assert.equal(data.tier.sets.length, 13);
  assert.equal(directTier.length, 65);
  assert.ok(directTier.every((item) => item.secondaries.length === 2));
  assert.deepEqual(data.catalystAllocations.counts,
    { catalystBases: 94, otherRanked: 159, directTier: 65, items: 318 });
  assert.equal(data.catalystAllocations.schemaVersion, 4);
  assert.deepEqual(data.catalyst.chargeSystem.catalystUnbound,
    { requirement: "first 4-piece class-set bonus", scope: "character", unlocksBonusDrops: true });
  assert.equal(data.catalyst.chargeSystem.serpentScion.bonusCharges, 1);
  assert.equal(Object.keys(data.catalystAllocations.items).length, 318);
  assert.ok(Object.values(data.catalystAllocations.items).every((item) =>
    Object.values(item.allocations).reduce((sum, value) => sum + value, 0) === 7000));
});

test("validation rejects incomplete or drifted data", async () => {
  const valid = await allValidatedData();
  const mutations = [
    ["missing sheet", /item-level sheet/, (data) => { data.sheet = null; }],
    ["missing armor", /invalid armor type/, (data) => { data.specs.specs[0].armor = null; }],
    ["wrong but valid armor", /invalid armor type/, (data) => {
      data.specs.specs.find((spec) => `${spec.spec} ${spec.class}` === "Blood Death Knight").armor = "Cloth";
    }],
    ["stat profile drift", /generated stat profile drifted/, (data) => {
      const shadow = data.specs.specs.find((spec) => `${spec.spec} ${spec.class}` === "Shadow Priest");
      shadow.statPriority.secondaries = ["Vers", "Crit", "Haste", "Mast"];
    }],
    ["weapon source drift", /generated weapon loadouts drifted/, (data) => {
      data.specs.specs.find((spec) => `${spec.spec} ${spec.class}` === "Arms Warrior").weaponLoadouts = [];
    }],
    ["deleted contextual profile source", /contextual-profile roster/, (data) => {
      delete data.statOverrides.overrides["Shadow Priest"];
    }],
    ["reviewed flat-priority drift", /reviewed baseline/, (data) => {
      data.statBaseline.priorities["Frost Mage"].secondaries = ["Vers", "Haste", "Crit", "Mast"];
    }],
    ["missing trinket eligibility", /lacks explicit eligibility/, (data) => {
      delete data.itemEligibility.items["193762"];
    }],
    ["missing primary-bearing trinket rule", /trinket-eligibility roster/, (data) => {
      delete data.itemEligibility.items["158368"];
    }],
    ["missing unique metadata", /lacks unique-equipped metadata/, (data) => {
      delete data.raid.bosses[0].items[0].uniqueEquipped;
    }],
    ["empty dungeon", /no dungeon items/, (data) => { data.dungeons.dungeons[0].items = []; }],
    ["key-level ladder drift", /key-level ladder changed/, (data) => {
      data.dungeons.keyLevels[0].end = 999;
    }],
    ["reduced sheet checks", /sheet validation is incomplete/, (data) => {
      data.sheet.validation.total = 1;
      data.sheet.validation.confirmed = 1;
    }],
    ["lost provisional marker", /provisional-source markers/, (data) => {
      data.sheet.sheetOnlyKeys = data.sheet.sheetOnlyKeys.filter((key) => key !== "raidVault");
    }],
    ["leftover rating keys", /unexpected rating keys/, (data) => {
      const item = data.raid.bosses.flatMap((boss) => boss.items).find((candidate) => candidate.secondaries.length);
      item.secondaries = [];
    }],
    ["missing armor item type", /lacks the armor type/, (data) => {
      const item = data.raid.bosses.flatMap((boss) => boss.items).find((candidate) => candidate.slot === "Head");
      item.type = null;
    }],
    ["invalid item primary", /invalid primary-stat label/, (data) => {
      data.raid.bosses[0].items.find((item) => item.slot).primary = "Spirit";
    }],
    ["unexplained slotless raid item", /unexplained slotless raid item/, (data) => {
      data.raid.bosses[0].items.find((item) => item.slot).slot = null;
    }],
    ["catalyst slot drift", /catalyst slot policy/, (data) => {
      data.catalyst.setBonusSlots = data.catalyst.setBonusSlots.filter((slot) => slot !== "Head");
    }],
    ["direct tier stat loss", /invalid direct-tier stats/, (data) => {
      data.tier.sets[0].items[0].secondaries.pop();
    }],
    ["direct tier valid-pair drift", /Catalyst fingerprint drifted/, (data) => {
      const item = data.tier.sets[0].items[0];
      item.secondaries = ["Haste", "Vers"];
      item.secondaryRatings = { Haste: 80, Vers: 121 };
    }],
    ["direct tier rating drift", /Catalyst fingerprint drifted/, (data) => {
      const item = data.tier.sets[0].items[0];
      item.secondaryRatings = { ...item.secondaryRatings, Crit: 1, Mast: 999 };
    }],
    ["catalyst base slot swap", /Catalyst fingerprint/, (data) => {
      const items = data.raid.bosses.flatMap((boss) => boss.items);
      items.find((item) => item.id === "268236").slot = "Waist";
      items.find((item) => item.id === "268257").slot = "Legs";
    }],
    ["catalyst effect drift", /Catalyst fingerprint drifted/, (data) => {
      const item = data.raid.bosses.flatMap((boss) => boss.items)
        .find((candidate) => candidate.id === "271874");
      item.effect = "Unrelated effect.";
    }],
    ["catalyst secondary effect drift", /Catalyst fingerprint drifted/, (data) => {
      const item = data.raid.bosses.flatMap((boss) => boss.items)
        .find((candidate) => candidate.id === "271874");
      item.effects.push({ kind: "Equip", text: "Unreviewed second effect." });
    }],
    ["catalyst source substitution", /direct sources/, (data) => {
      data.catalyst.sources.blizzardPatchNotes = "https://example.com/not-authoritative";
    }],
    ["catalyst preservation drift", /preservation policy/, (data) => {
      data.catalyst.preservation.sockets = "guaranteed";
    }],
    ["catalyst charge unlock drift", /charge policy/, (data) => {
      data.catalyst.chargeSystem.catalystUnbound.scope = "account";
    }],
    ["stable allocation drift", /invalid stable secondary allocation/, (data) => {
      const entry = data.catalystAllocations.items["271555"];
      entry.allocations.Crit = 1;
    }],
    ["balanced allocation drift", /allocation values drifted/, (data) => {
      const entry = data.catalystAllocations.items["271555"];
      entry.allocations.Crit += 100;
      entry.allocations.Mast -= 100;
    }],
  ];
  for (const [label, expected, mutate] of mutations) {
    const data = clone(valid);
    mutate(data);
    assert.throws(() => validateData(data), expected, label);
  }
});

test("stat profiles and explicit weapon edge cases remain correct", async () => {
  const [specDoc, raid, dungeons] = await Promise.all([
    json("data/specs.json"), json("data/raid-items.json"), json("data/dungeon-items.json"),
  ]);
  const findSpec = (key) => specDoc.specs.find((spec) => `${spec.spec} ${spec.class}` === key);
  const items = [...raid.bosses, ...dungeons.dungeons].flatMap((group) => group.items);
  const weapons = items.filter((item) => [
    "Main Hand", "One-Hand", "Two-Hand", "Off Hand", "Held In Off-hand", "Ranged",
  ].includes(item.slot));

  const shadow = findSpec("Shadow Priest");
  assert.deepEqual(shadow.statPriorityVariants.map((profile) => profile.secondaries), [
    ["Haste", "Mast", "Crit", "Vers"],
    ["Mast", "Crit", "Haste", "Vers"],
  ]);

  const frost = findSpec("Frost Death Knight");
  const spiritcudgel = items.find((item) => item.name === "Malevolent Spiritcudgel");
  assert.ok(spiritcudgel);
  assert.equal(weaponMatches(frost, spiritcudgel), false);

  for (const key of ["Havoc Demon Hunter", "Vengeance Demon Hunter"])
    assert.equal(findSpec(key).weaponLoadouts.some((loadout) =>
      Object.values(loadout.hands).some((hand) => (hand.itemTypes || []).includes("Dagger"))), false);

  const devourer = findSpec("Devourer Demon Hunter");
  assert.ok(weapons.some((item) => item.type === "Dagger" && weaponMatches(devourer, item)));

  const survival = findSpec("Survival Hunter");
  assert.equal(survival.weaponLoadouts.some((loadout) =>
    Object.values(loadout.hands).some((hand) => (hand.itemTypes || []).includes("Fist Weapon"))), false);

  const assassination = findSpec("Assassination Rogue").weaponLoadouts[0];
  assert.deepEqual(assassination.hands.mainHand.itemTypes, ["Dagger"]);
  assert.deepEqual(assassination.hands.offHand.itemTypes, ["Dagger"]);

  const outlaw = findSpec("Outlaw Rogue").weaponLoadouts[0];
  assert.equal(outlaw.hands.mainHand.itemTypes.includes("Dagger"), false);
  assert.equal(outlaw.hands.offHand.itemTypes.includes("Dagger"), true);

  const subtlety = findSpec("Subtlety Rogue").weaponLoadouts[0];
  assert.deepEqual(subtlety.hands.mainHand.itemTypes, ["Dagger"]);
  assert.ok(subtlety.hands.offHand.itemTypes.length > 1);

  const enhancement = findSpec("Enhancement Shaman");
  assert.equal(enhancement.weaponLoadouts[0].hands.mainHand.itemTypes.includes("Dagger"), false);

  const windwalkerTwoHand = findSpec("Windwalker Monk").weaponLoadouts
    .find((loadout) => loadout.id === "two-hand-staff-polearm");
  assert.deepEqual(windwalkerTwoHand.hands.mainHand.itemTypes, ["Staff", "Polearm"]);

  const mistweaver = findSpec("Mistweaver Monk");
  assert.ok(weapons.some((item) => item.slot === "Held In Off-hand"
    && weaponMatches(mistweaver, item, "offHand")));

  const fury = findSpec("Fury Warrior").weaponLoadouts[0];
  assert.deepEqual(fury.hands.mainHand.inventorySlots, ["Two-Hand"]);
  assert.deepEqual(fury.hands.offHand.inventorySlots, ["Two-Hand"]);
});

test("self-contained output embeds current data and valid browser JavaScript", async () => {
  const [html, template, raid, specs, dungeons, sheet, itemEligibility, tier, catalyst,
    catalystAllocations, icons] = await Promise.all([
    readFile(fromRoot("wow-s2-gearing.html"), "utf8"),
    readFile(fromRoot("src/app.template.html"), "utf8"),
    json("data/raid-items.json"), json("data/specs.json"), json("data/dungeon-items.json"),
    json("data/sheet-rewards.json"), json("data/item-eligibility-overrides.json"),
    json("data/tier-items.json"), json("data/catalyst-rules.json"),
    json("data/catalyst-stat-allocations.json"), json("data/icons.json"),
  ]);
  const embedded = html.match(/<script id="data" type="application\/json">([\s\S]*?)<\/script>/);
  assert.ok(embedded);
  // The inlined blob is exactly what build.mjs writes: nine keys, no SimC/healer ledgers.
  assert.deepEqual(JSON.parse(embedded[1]), {
    raid, specs, dungeons, sheet, itemEligibility, tier, catalyst, catalystAllocations,
    icons: icons.icons,
  });

  const scripts = [...template.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
  assert.doesNotThrow(() => new Function(scripts.at(-1)[1]));
  assert.match(template, /filter\(it => maxAttainable\(it\) > threshold\)/);
  // Both trinket surfaces lead with the same reason (see the note in the upgrade-checker
  // test); neither may promise a sim this project no longer runs.
  assert.match(template, /Trinkets are not ranked here/);
  assert.doesNotMatch(template, /waiting on trinket sims/i);
  assert.match(template, /role="tablist"/);
  assert.match(template, /<label for="spec">Specialization<\/label>/);
  assert.match(template, /class="skip-link" href="#main-content"/);
  assert.match(template, /Custom decimal weights/);
  assert.doesNotMatch(template, /Questionably Epic|questionablyepic\.com/);
  assert.match(template, /@media \(max-width:640px\)/);
  assert.doesNotMatch(template, /main_hand:'One-Hand'/);
});

/* G7: the setup card is Specialization · Build · Scoring method — three controls where there
   were four. The Encounter selector was fed by the SimC scenario manifest and has no source
   left to enumerate it, so its absence is the assertion, not just the Build rename. */
test("the setup card offers exactly three controls and no Encounter selector", async () => {
  const template = await readFile(fromRoot("src/app.template.html"), "utf8");
  const card = template.match(/<section class="setup-card"[\s\S]*?<\/section>/);
  assert.ok(card, "expected a setup card section");
  assert.deepEqual([...card[0].matchAll(/<select id="([a-z-]+)"/g)].map((match) => match[1]),
    ["spec", "build", "scoring-mode"]);
  assert.match(card[0], /<label for="build">Build<\/label>/);
  assert.doesNotMatch(template, /id="scenario"|<label for="scenario">/);
});

/* G3 + G6: the reference lane is gone, so the scoring method is a two-way choice between
   the guide stat order and the user's own numbers. A third option would mean a third ranking
   model nothing in the data can back. */
test("the scoring-mode options are exactly guide order and custom weights", async () => {
  const template = await readFile(fromRoot("src/app.template.html"), "utf8");
  const select = template.match(/<select id="scoring-mode">([\s\S]*?)<\/select>/);
  assert.ok(select);
  assert.deepEqual([...select[1].matchAll(/<option value="([a-z]+)">([^<]+)<\/option>/g)]
    .map((match) => [match[1], match[2]]),
  /* The VALUE is the mode id G7 records and the Phase-C end state; the LABEL must say what
     ships today. Phase A harvests ONE guide (all 40 statPrioritySource values are icy-veins.com),
     and SOURCES.md forbids calling anything consensus without 2+ independent sources — so the
     page may not say "consensus" until G1's multi-source harvest lands in Phase B/C. */
  [["consensus", "Guide order"], ["custom", "Custom decimal weights"]]);
  assert.doesNotMatch(template, /Guide consensus/);
  assert.doesNotMatch(template, /value="reference"|value="priority"/);
});

test("client app ranks by the guide stat order and honours custom weights as a full override", async () => {
  const { data, specs, startClient } = await clientFixture();
  const { document, app } = startClient();
  const specSelect = document.ids.get("spec");
  const buildSelect = document.ids.get("build");
  const scoringMode = document.ids.get("scoring-mode");
  const findSpec = (key) => specs.specs.find((spec) => `${spec.spec} ${spec.class}` === key);

  assert.equal(app.current().spec, "Frost");
  assert.equal(scoringMode.value, "consensus");
  assert.match(document.ids.get("bis").innerHTML, /Weapon setup:/);

  specSelect.value = "Priest|Shadow";
  specSelect.listeners.change();
  // The Build control lists the published guide profiles for the spec, in source order.
  assert.deepEqual(buildSelect.children.map((option) => option.value), [
    "Voidweaver (single- and multi-target)", "Archon (single- and multi-target)",
  ]);
  assert.equal(scoringMode.value, "consensus");
  // Guide order is converted to fixed spacing by GUIDE_MULTIPLIERS — a sorting device, not
  // stat weights. The selected build supplies the order.
  const voidweaver = findSpec("Shadow Priest").statPriorityVariants
    .find((build) => build.name === "Voidweaver (single- and multi-target)");
  assert.deepEqual(app.weights(), guideWeightsOf(voidweaver));

  // A spec with no published variants still gets one honest option rather than an empty select.
  specSelect.value = "Warlock|Destruction";
  specSelect.listeners.change();
  assert.deepEqual(buildSelect.children.map((option) => option.value), ["General"]);
  assert.equal(buildSelect.value, "General");
  assert.equal(buildSelect.disabled, true);

  specSelect.value = "Priest|Shadow";
  specSelect.listeners.change();
  buildSelect.value = "Archon (single- and multi-target)";
  buildSelect.listeners.change();
  assert.match(document.ids.get("bis-note").innerHTML, /Archon \(single- and multi-target\)/);
  const tierHtml = document.ids.get("tier").innerHTML;
  assert.match(tierHtml, /Season 2 Catalyst tier plan/);
  assert.match(tierHtml, /Charge planning \(PTR\)/);
  assert.match(tierHtml, /first 4-piece class-set bonus/);
  assert.equal((tierHtml.match(/data-catalyst-base="true"/g) || []).length, 22);
  assert.equal((tierHtml.match(/data-direct-tier="true"/g) || []).length, 5);
  assert.match(tierHtml, /Cosmic Penitent's Truesight/);
  assert.match(tierHtml, /Venomkeeper's Horrific Cowl/);
  assert.match(tierHtml, /Mapped Venomcursed item/);
  assert.match(tierHtml, /Crit 29%\/Haste 71%/);
  assert.match(tierHtml, /Slumbering Coil Curio/);
  assert.match(document.ids.get("bis").innerHTML, /Special-effect item shown outside the secondary-stat top five/);
  assert.match(document.ids.get("bis").innerHTML, /Consume the power of Hex Lord's Doom/);
  assert.doesNotMatch(document.ids.get("bis").innerHTML,
    /Blazebinder's Hoof|Preternatural Antivenom|Idol of the Howling Nexus/);
  assert.match(document.ids.get("src").innerHTML, /Hands tier token/);

  scoringMode.value = "custom";
  scoringMode.listeners.change();
  assert.match(document.ids.get("scoring-summary").innerHTML, /waiting for all four/);
  assert.equal(document.ids.get("weight-editor").hidden, false);
  assert.equal(buildSelect.disabled, false);
  const archon = findSpec("Shadow Priest").statPriorityVariants
    .find((build) => build.name === "Archon (single- and multi-target)");
  const guideWeights = guideWeightsOf(archon);
  // Until all four fields are filled, custom mode falls back to the selected build's order.
  assert.deepEqual(app.weights(), guideWeights);
  assert.equal(app.scoreFor("271874"), guideWeights.Mast);
  document.ids.get("weight-crit").value = "1.12";
  document.ids.get("weight-haste").value = "0.99";
  document.ids.get("weight-mast").value = "1.25";
  document.ids.get("weight-vers").value = "0.40";
  document.ids.get("weight-mast").listeners.input();
  assert.deepEqual(app.weights(), { Crit: 1.12, Haste: 0.99, Mast: 1.25, Vers: 0.4 });
  assert.match(document.ids.get("scoring-summary").innerHTML, /Custom weights supplied by you/);
  assert.match(document.ids.get("scoring-summary").innerHTML, /Mastery <strong>1\.250<\/strong>/);
  assert.equal(app.scoreFor("271874"), 1.25);
  assert.match(document.ids.get("tier-note").innerHTML, /your custom weights/);

  specSelect.value = "Demon Hunter|Devourer";
  specSelect.listeners.change();
  // Switching spec drops back to the guide stat order and clears the custom fields.
  assert.equal(scoringMode.value, "consensus");
  assert.equal(document.ids.get("weight-crit").value, "");
  assert.match(document.ids.get("bis").innerHTML, /Allowed types:/);
  assert.match(document.ids.get("bis").innerHTML, /official source 1/);

  const uniqueWeaponData = clone(data);
  for (const group of [...uniqueWeaponData.raid.bosses, ...uniqueWeaponData.dungeons.dungeons])
    for (const item of group.items)
      if (["Main Hand", "One-Hand"].includes(item.slot)) item.uniqueEquipped = true;
  const uniqueWeaponClient = startClient(uniqueWeaponData);
  uniqueWeaponClient.document.ids.get("spec").value = "Demon Hunter|Devourer";
  uniqueWeaponClient.document.ids.get("spec").listeners.change();
  assert.match(uniqueWeaponClient.document.ids.get("bis").innerHTML, /Alternative hand only:/);

  specSelect.value = "Monk|Brewmaster";
  specSelect.listeners.change();
  buildSelect.value = "Offensive / damage";
  buildSelect.listeners.change();
  const brewmasterHtml = document.ids.get("tier").innerHTML;
  assert.ok(brewmasterHtml.indexOf('data-id="239033"') < brewmasterHtml.indexOf('data-id="193751"'));
});

/* G6 requires the custom-weight disclosure be VISIBLE text on every ranked surface, never a
   title= — a tooltip does not exist on touch (the tracker's own touch-legibility rule). */
test("custom mode announces itself in visible text on the ranked surfaces", async () => {
  const { startClient } = await clientFixture();
  const { document } = startClient();
  document.ids.get("spec").value = "Priest|Shadow";
  document.ids.get("spec").listeners.change();
  document.ids.get("simc").value = "head=venomkeepers_horrific_cowl,id=271874,ilevel=300";
  document.ids.get("parse").listeners.click();
  assert.doesNotMatch(document.ids.get("up").innerHTML, /Ordered by your custom weights/);

  document.ids.get("scoring-mode").value = "custom";
  document.ids.get("scoring-mode").listeners.change();
  for (const [stat, value] of [["crit", "1.1"], ["haste", "0.9"], ["mast", "1.4"], ["vers", "0.3"]])
    document.ids.get(`weight-${stat}`).value = value;
  document.ids.get("weight-mast").listeners.input();

  const note = "<b>Ordered by your custom weights</b>, not by the guide stat order.";
  const upgrade = document.ids.get("up").innerHTML;
  assert.ok(upgrade.includes(note), "the upgrade checker must carry the visible override note");
  assert.doesNotMatch(upgrade, /title="[^"]*custom weights/i);
  assert.match(document.ids.get("bis-note").innerHTML,
    /Using your custom decimal weights instead of guide order/);
  assert.match(document.ids.get("tier-note").innerHTML, /your custom weights/);
});

test("the /simc addon paste maps equipped gear to Season 2 upgrade sources", async () => {
  const { startClient } = await clientFixture();
  const { document } = startClient();
  const specSelect = document.ids.get("spec");

  specSelect.value = "Warrior|Arms";
  specSelect.listeners.change();
  document.ids.get("simc").value = [
    "head=high_level_helm,id=999999,ilevel=318",
    "main_hand=caustic_keeper_crusher,id=268198,ilevel=292",
  ].join("\n");
  document.ids.get("parse").listeners.click();
  const upgradeHtml = document.ids.get("up").innerHTML;
  assert.doesNotMatch(upgradeHtml, /no Season 2 item maps to this slot/);
  assert.match(upgradeHtml, /Caustic Keeper-Crusher|Malignant Toothed Edge|Maze-roa/);
  assert.match(upgradeHtml, /firstup/);

  specSelect.value = "Death Knight|Blood";
  specSelect.listeners.change();
  document.ids.get("simc").value = "back=current_cloak,id=999998,ilevel=330";
  document.ids.get("parse").listeners.click();
  assert.match(document.ids.get("up").innerHTML, /Silken Voodoo Drape/);
  assert.doesNotMatch(document.ids.get("up").innerHTML,
    /Speakeasy Shroud|Bloodthorn Burnous|Cloak of the Restless Tribes|Fireproof Drape/);

  specSelect.value = "Priest|Shadow";
  specSelect.listeners.change();
  document.ids.get("simc").value = "head=venomkeepers_horrific_cowl,id=271874,ilevel=344";
  document.ids.get("parse").listeners.click();
  assert.match(document.ids.get("up").innerHTML, /Catalyst conversion option/);
  assert.match(document.ids.get("up").innerHTML, /Mast 100% secondary allocation/);

  document.ids.get("simc").value = "head=cosmic_penitents_truesight,id=271555,ilevel=334";
  document.ids.get("parse").listeners.click();
  assert.match(document.ids.get("up").innerHTML, /Already class-set tier/);

  document.ids.get("simc").value = "head=legacy_mplus_head,id=239047,ilevel=292";
  document.ids.get("parse").listeners.click();
  assert.match(document.ids.get("up").innerHTML, /data-catalyst-action="verify"/);
  assert.match(document.ids.get("up").innerHTML, /item ID alone does not prove/);

  document.ids.get("simc").value = "head=warrior_tier,id=271456,ilevel=334";
  document.ids.get("parse").listeners.click();
  assert.match(document.ids.get("up").innerHTML, /Selected-spec mismatch/);
  assert.doesNotMatch(document.ids.get("up").innerHTML, /Already class-set tier/);

  document.ids.get("simc").value = "head=plate_raid_base,id=268229,ilevel=334";
  document.ids.get("parse").listeners.click();
  assert.match(document.ids.get("up").innerHTML, /Selected-spec mismatch/);
  assert.doesNotMatch(document.ids.get("up").innerHTML, /Catalyst conversion option/);

  document.ids.get("simc").value = "head=unknown_current_head,id=999996,ilevel=330";
  document.ids.get("parse").listeners.click();
  assert.match(document.ids.get("up").innerHTML, /data-direct-tier-acquisition="true"/);
  assert.match(document.ids.get("up").innerHTML, /Cosmic Penitent's Truesight/);
  assert.match(document.ids.get("up").innerHTML, /Standard slot token/);
  assert.match(document.ids.get("up").innerHTML, /Omni-tier token/);
  assert.match(document.ids.get("up").innerHTML,
    /data-tier-route="omni" data-max-ilvl="344"[\s\S]*?Mythic <b>344<\/b>/);

  document.ids.get("simc").value = "trinket1=current_trinket,id=999997,ilevel=292";
  document.ids.get("parse").listeners.click();
  /* The 2026-08-05 owner direction made this note lead with "still waiting on trinket sims".
     G3 deleted the sim lane, so that lead became a promise this project can no longer keep —
     you cannot wait for a sim you have removed the machinery to run. Both trinket surfaces
     (here and trinketCard's Gear-recommendations note) now lead with the reason that is still
     true and needs no future sim: the value is in the effect, and this page does not score
     effects. Pinned on BOTH surfaces so they can never drift apart again; the G8 per-source
     letter tiers that will eventually rank trinkets are Phase C. */
  assert.match(document.ids.get("up").innerHTML, /Trinkets are not ranked here/);
  assert.match(document.ids.get("up").innerHTML, /this page does not score effects/i);
  assert.match(document.ids.get("up").innerHTML,
    /every eligible source that can exceed your current item level is listed, alphabetically/i);
  assert.doesNotMatch(document.ids.get("up").innerHTML, /waiting on trinket sims/i);
  // The Fit chip is a stat-priority score: effect-only trinkets would read "Fit 0" and
  // stat-sticks "Fit 100" — the inverse of real trinket value — directly under a note
  // calling such ranking meaningless. Unranked trinket rows must never carry it.
  assert.doesNotMatch(document.ids.get("up").innerHTML, /class="fit"/,
    "no stat-priority Fit chip on unranked trinket rows (audit 2026-08-05)");
  assert.doesNotMatch(document.ids.get("up").innerHTML,
    /Blazebinder's Hoof|Preternatural Antivenom|Idol of the Howling Nexus/);
});

