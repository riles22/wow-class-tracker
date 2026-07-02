import { test } from "node:test";
import assert from "node:assert/strict";
import { fightLabels, metricRanks, outlookFor, movementFor } from "../src/render.mjs";

test("outlookFor: verdict wins; tuning-line balance covers writeup-less specs", () => {
  const builds = { builds: [{
    date: "2026-06-30",
    specsAffected: ["Feral Druid", "Mage (class-wide)"],
    highlights: [
      "Feral Druid — Blood Spattered increases Ferocious Bite damage by 8% (was 2%).",
      "Frost damage reduced by 10%. (Death Knight — Frost)"
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

test("movementFor computes tier steps and rank deltas vs a snapshot", () => {
  const scales = { consensus: { bands: [{ tier: "S", min: 88 }, { tier: "A", min: 58 }, { tier: "B", min: 0 }] } };
  const specs = [{
    class: "C", spec: "S", role: "DPS",
    consensus: { raid: { tier: "A" }, mplus: { tier: "B" } },
    metrics: [{ bracket: "raid", name: "Median rDPS", value: 1, rank: 2 }]
  }];
  const snap = { date: "2026-06-24", specs: { "C|S": {
    consensus: { raid: "B", mplus: "B" }, ranks: { "raid|Median rDPS": 5 }
  } } };
  movementFor(specs, scales, snap);
  assert.deepEqual(specs[0].movement, { raid: { delta: 1, was: "B", since: "2026-06-24" } });
  assert.equal(specs[0].metrics[0].rankDelta, 3); // climbed 5 → 2
  // no snapshot → untouched
  const bare = [{ class: "C", spec: "S", consensus: {}, metrics: [] }];
  movementFor(bare, scales, null);
  assert.equal(bare[0].movement, undefined);
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

test("fightLabels uses target-count fallbacks (5T when 8T missing)", () => {
  const specs = [
    mk("A", { "1": 100000, "3": 150000, "5": 200000 }),
    mk("B", { "1": 120000, "3": 160000, "5": 260000 }),
    mk("C", { "1": 110000, "3": 155000, "5": 230000 }),
  ];
  fightLabels(specs);
  assert.equal(specs[1].fightProfile.metricsUsed.aoe, 260000);
  assert.equal(specs[1].fightProfile.labels.aoe, "strong");
});
