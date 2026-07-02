import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreFor, consensusTier, consensusFor } from "../src/normalize.mjs";

const scales = {
  scales: {
    icyveins: { tiers: ["S", "A+", "A", "B", "C"], values: { S: 100, "A+": 82, A: 66, B: 48, C: 30 } },
    method: { tiers: ["S", "A", "B", "C"], values: { S: 100, A: 72, B: 48, C: 24 } }
  },
  consensus: {
    bands: [
      { tier: "S", min: 88 }, { tier: "A+", min: 74 }, { tier: "A", min: 58 },
      { tier: "B", min: 40 }, { tier: "C", min: 0 }
    ],
    spreadThreshold: 22
  }
};
const sources = [
  { id: "icyveins", name: "Icy Veins", kind: "tier-list", scale: "icyveins" },
  { id: "method", name: "Method", kind: "tier-list", scale: "method" },
  { id: "liquid", name: "Liquid Armory", kind: "reference" }
];

test("scoreFor maps tiers through the scale config", () => {
  assert.equal(scoreFor(scales, "icyveins", "S"), 100);
  assert.equal(scoreFor(scales, "icyveins", "A+"), 82);
  assert.equal(scoreFor(scales, "method", "A"), 72);
});

test("scoreFor returns null for missing ratings", () => {
  assert.equal(scoreFor(scales, "icyveins", null), null);
  assert.equal(scoreFor(scales, "icyveins", undefined), null);
  assert.equal(scoreFor(scales, "icyveins", "—"), null);
});

test("scoreFor throws on unknown scale or tier", () => {
  assert.throws(() => scoreFor(scales, "nope", "S"), /Unknown scale/);
  assert.throws(() => scoreFor(scales, "method", "A+"), /not defined in scale/);
});

test("every tier of every scale round-trips through consensus bands to itself or an adjacent band", () => {
  // Single-source consensus should never wildly misplace a rating.
  for (const [, scale] of Object.entries(scales.scales)) {
    for (const tier of scale.tiers) {
      const band = consensusTier(scale.values[tier], scales);
      // A scale without A+ maps its A to A, S to S, etc.
      if (tier in scales.consensus.bands.map(b => b.tier)) {
        assert.equal(band, tier);
      }
    }
  }
  // Explicit round-trips for the icyveins scale (shares all consensus tier names):
  for (const tier of ["S", "A+", "A", "B", "C"]) {
    assert.equal(consensusTier(scales.scales.icyveins.values[tier], scales), tier);
  }
});

test("consensusFor averages sources and flags divergence", () => {
  const c = consensusFor({ icyveins: "A", method: "S" }, sources, scales);
  assert.equal(c.score, 83); // (66 + 100) / 2
  assert.equal(c.tier, "A+");
  assert.equal(c.spread, 34);
  assert.equal(c.diverges, true);
  assert.equal(c.perSource.length, 2);
});

test("consensusFor does not flag close agreement", () => {
  const c = consensusFor({ icyveins: "A+", method: "S" }, sources, scales);
  assert.equal(c.spread, 18);
  assert.equal(c.diverges, false);
});

test("single-source consensus never diverges", () => {
  const c = consensusFor({ icyveins: "B" }, sources, scales);
  assert.equal(c.tier, "B");
  assert.equal(c.diverges, false);
  assert.equal(c.spread, 0);
});

test("consensusFor returns null when nothing is rated", () => {
  assert.equal(consensusFor({}, sources, scales), null);
  assert.equal(consensusFor({ icyveins: null }, sources, scales), null);
  assert.equal(consensusFor(undefined, sources, scales), null);
});

test("reference-kind sources are excluded from consensus", () => {
  const c = consensusFor({ icyveins: "A", liquid: "S" }, sources, scales);
  assert.equal(c.perSource.length, 1);
  assert.equal(c.perSource[0].source, "icyveins");
});
