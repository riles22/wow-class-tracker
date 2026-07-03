import { test } from "node:test";
import assert from "node:assert/strict";
import { fightLabels, metricRanks, outlookFor, movementFor } from "../src/render.mjs";

test("outlookFor: verdict wins; tuning-line balance covers writeup-less specs", () => {
  const builds = { builds: [{
    date: "2026-06-30",
    specsAffected: ["Feral Druid", "Mage (class-wide)", "Frost Death Knight"],
    highlights: [
      "Feral Druid — Blood Spattered increases Ferocious Bite damage by 8% (was 2%).",
      "Frost Death Knight — Obliterate damage reduced by 25%."
    ]
  }] };
  const positive = outlookFor({ class: "X", spec: "Y", ptr: { verdict: "Positive" } }, builds);
  assert.equal(positive.direction, "up");
  const feral = outlookFor({ class: "Druid", spec: "Feral", ptr: null }, builds);
  assert.equal(feral.direction, "up"); // buff line, no writeup
  assert.equal(feral.builds, 1);
  const frostDk = outlookFor({ class: "Death Knight", spec: "Frost", ptr: null }, builds);
  assert.equal(frostDk.direction, "down"); // nerf line
  assert.equal(outlookFor({ class: "Rogue", spec: "Outlaw", ptr: null }, builds), null); // untouched
});

test("outlookFor: no cross-class substring collisions (class-wide or prose mentions)", () => {
  // "Demon Hunter (class-wide)" must NOT count toward a Hunter spec, and a class-wide
  // Warrior line that names Arms in prose must NOT be tallied as an Arms nerf.
  const builds = { builds: [{
    date: "2026-06-30",
    specsAffected: ["Demon Hunter (class-wide)", "Warrior (class-wide)", "Arms Warrior"],
    highlights: [
      "Demon Hunter (class-wide) — Demon Hunters can now equip daggers.",
      "Warrior (class-wide) — Rend is now exclusive to Arms; its Rage cost is reduced to 10.",
      "Arms Warrior — Ignore Pain absorb increased by 25%."
    ]
  }] };
  // Beast Mastery Hunter is untouched — "Demon Hunter (class-wide)" must not match "Hunter".
  assert.equal(outlookFor({ class: "Hunter", spec: "Beast Mastery", ptr: null }, builds), null);
  // Arms: only the genuine "Arms Warrior — … increased" line counts (buff); the class-wide
  // "… reduced …" prose mention of Arms must be ignored → direction up, not flat.
  const arms = outlookFor({ class: "Warrior", spec: "Arms", ptr: null }, builds);
  assert.equal(arms.direction, "up");
  assert.deepEqual([arms.buffs, arms.nerfs], [1, 0]);
});

test("movementFor computes tier steps and rank deltas vs a snapshot", () => {
  const scales = { consensus: { bands: [{ tier: "S", min: 88 }, { tier: "A", min: 58 }, { tier: "B", min: 0 }] } };
  const specs = [{
    class: "C", spec: "S", role: "DPS",
    consensus: { raid: { tier: "A" }, mplus: { tier: "B" } },
    metrics: [{ source: "warcraftlogs", bracket: "raid", name: "Median rDPS", value: 1, rank: 2 }]
  }];
  const snap = { date: "2026-06-24", specs: { "C|S": {
    consensus: { raid: "B", mplus: "B" }, ranks: { "warcraftlogs|raid|Median rDPS": 5 }
  } } };
  movementFor(specs, scales, snap);
  assert.deepEqual(specs[0].movement, { raid: { delta: 1, was: "B", since: "2026-06-24" } });
  assert.equal(specs[0].metrics[0].rankDelta, 3); // climbed 5 → 2
  // no snapshot → untouched
  const bare = [{ class: "C", spec: "S", consensus: {}, metrics: [] }];
  movementFor(bare, scales, null);
  assert.equal(bare[0].movement, undefined);
});

test("movementFor keys rank deltas by source, so same-name metrics don't collide", () => {
  const scales = { consensus: { bands: [{ tier: "S", min: 0 }] } };
  const specs = [{
    class: "C", spec: "S", role: "DPS", consensus: {},
    metrics: [
      { source: "warcraftlogs", bracket: "raid", name: "Median rDPS", value: 1, rank: 3 },
      { source: "simulationcraft", bracket: "raid", name: "Median rDPS", value: 2, rank: 1 }
    ]
  }];
  const snap = { date: "2026-06-24", specs: { "C|S": { consensus: {}, ranks: {
    "warcraftlogs|raid|Median rDPS": 5, "simulationcraft|raid|Median rDPS": 1
  } } } };
  movementFor(specs, scales, snap);
  assert.equal(specs[0].metrics[0].rankDelta, 2);        // WCL 5 → 3 climbed 2
  assert.equal(specs[0].metrics[1].rankDelta, undefined); // SimC 1 → 1 unchanged, no false delta
});

test("metricRanks ranks within (role, bracket, metric name), #1 = highest", () => {
  const m = (name, value, bracket = "raid") => ({ source: "x", bracket, name, value });
  const specs = [
    { class: "A", spec: "S1", role: "DPS", metrics: [m("Median rDPS", 100), m("Popularity", 5)] },
    { class: "B", spec: "S2", role: "DPS", metrics: [m("Median rDPS", 120), m("Popularity", 2)] },
    { class: "C", spec: "S3", role: "Healer", metrics: [m("Median rDPS", 90)] }, // different role: own group
  ];
  metricRanks(specs);
  assert.deepEqual([specs[1].metrics[0].rank, specs[1].metrics[0].of], [1, 2]);
  assert.deepEqual([specs[0].metrics[0].rank, specs[0].metrics[0].of], [2, 2]);
  assert.deepEqual([specs[0].metrics[1].rank], [1]); // popularity ranked separately
  assert.deepEqual([specs[2].metrics[0].rank, specs[2].metrics[0].of], [1, 1]);
});

const mk = (spec, targets) => ({
  class: "X", spec, role: "DPS",
  fightProfile: { source: "bloodmallet", asOf: "2026-07-01", targets }
});

test("fightLabels ranks ST/cleave/AoE within the DPS population and tags leanings", () => {
  const specs = [
    mk("StKing",   { "1": 130000, "3": 150000, "8": 180000 }), // best ST, worst AoE
    mk("AoeKing",  { "1": 100000, "3": 190000, "8": 520000 }), // worst ST, best AoE
    mk("Middle",   { "1": 115000, "3": 160000, "8": 300000 }),
    mk("Middle2",  { "1": 118000, "3": 165000, "8": 320000 }),
  ];
  fightLabels(specs);
  const by = n => specs.find(s => s.spec === n).fightProfile;
  assert.equal(by("StKing").labels.st, "strong");
  assert.equal(by("StKing").labels.aoe, "weak");
  assert.equal(by("StKing").tag, "ST-lean");
  assert.equal(by("AoeKing").labels.aoe, "strong");
  assert.equal(by("AoeKing").labels.st, "weak");
  assert.equal(by("AoeKing").tag, "AoE-lean");
  assert.ok(["Flexible", "All-round"].includes(by("Middle").tag));
});

test("fightLabels skips non-DPS and profile-less specs untouched", () => {
  const specs = [
    { class: "X", spec: "Healy", role: "Healer", fightProfile: { source: "bloodmallet", targets: { "1": 1 } } },
    { class: "X", spec: "NoData", role: "DPS" },
    mk("A", { "1": 100, "3": 150, "8": 200 }),
    mk("B", { "1": 110, "3": 160, "8": 210 }),
  ];
  fightLabels(specs);
  assert.equal(specs[0].fightProfile.labels, undefined, "healer must not be labeled");
  assert.equal(specs[1].fightProfile, undefined);
  assert.ok(specs[2].fightProfile.labels);
});

test("fightLabels uses canonical counts (1/3/8) — no cross-count mixing", () => {
  // A spec missing the canonical AoE count (8) gets a null AoE label rather than being
  // ranked on a lower-count sim against the field's 8-target values.
  const specs = [
    mk("Full1", { "1": 100000, "3": 150000, "8": 300000 }),
    mk("Full2", { "1": 120000, "3": 160000, "8": 520000 }),
    mk("No8",   { "1": 110000, "3": 155000, "5": 230000 }), // has 5T, not 8T
  ];
  fightLabels(specs);
  assert.equal(specs[2].fightProfile.metricsUsed.aoe, undefined, "no canonical 8T → no AoE metric");
  assert.equal(specs[2].fightProfile.labels.aoe, null, "no AoE label rather than a distorted one");
  assert.equal(specs[2].fightProfile.labels.st, "mid", "ST still labeled from its 1T value");
  // The two full specs are ranked only against each other's real 8T values.
  assert.equal(specs[1].fightProfile.labels.aoe, "strong");
  assert.equal(specs[0].fightProfile.labels.aoe, "weak");
});
