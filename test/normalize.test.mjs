import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreFor, consensusTier, consensusFor, isLiveEra, ptrTierSources, PHASES, sourceSeasonOk } from "../src/normalize.mjs";

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

/* ---- era gating: a PTR tier list is a real source that is NOT part of the live mean ---- */

const eraSources = [
  ...sources,
  { id: "icyveins-ptr", name: "Icy Veins (12.1 PTR)", kind: "tier-list", era: "ptr", scale: "icyveins" }
];

test("era:\"ptr\" tier lists are excluded from the live consensus", () => {
  const withPtr = consensusFor({ icyveins: "A", method: "S", "icyveins-ptr": "C" }, eraSources, scales);
  const without = consensusFor({ icyveins: "A", method: "S" }, eraSources, scales);
  // The PTR letter is stored and readable, but it moves neither the mean nor the spread.
  assert.equal(withPtr.score, without.score);
  assert.equal(withPtr.spread, without.spread);
  assert.equal(withPtr.diverges, without.diverges);
  assert.deepEqual(withPtr.perSource.map(p => p.source), ["icyveins", "method"]);
});

test("a spec rated ONLY by a PTR list has no live consensus at all", () => {
  // Not "C", not 0 — null. A 12.1 opinion is not evidence about the patch we are running.
  assert.equal(consensusFor({ "icyveins-ptr": "S" }, eraSources, scales), null);
});

test("era defaults to live when absent, so existing sources are untouched", () => {
  assert.equal(isLiveEra({ id: "icyveins", kind: "tier-list" }), true);
  assert.equal(isLiveEra({ id: "x", kind: "tier-list", era: "live" }), true);
  assert.equal(isLiveEra({ id: "x", kind: "tier-list", era: "ptr" }), false);
});

test("ptrTierSources returns era-gated tier lists only, in registry order", () => {
  assert.deepEqual(ptrTierSources(eraSources).map(s => s.id), ["icyveins-ptr"]);
  assert.deepEqual(ptrTierSources(sources), []);
  assert.deepEqual(ptrTierSources(undefined), []);
  // a metrics-kind source is not a tier list even if it were era-tagged
  assert.deepEqual(ptrTierSources([{ id: "m", kind: "metrics", era: "ptr" }]), []);
});

/* ---------- S2 transition Phase 1: the season-verified consensus rule ---------- */

test("a page that describes the wrong season drops its source from that bracket's consensus", () => {
  const scales = { consensus: { bands: [ { tier: "S", min: 88 }, { tier: "A", min: 58 }, { tier: "B", min: 0 } ], spreadThreshold: 40 },
    scales: { x: { tiers: ["S","A","B"], values: { S: 100, A: 70, B: 40 } } } };
  const sources = [
    { id: "one", name: "One", kind: "tier-list", scale: "x", pages: [{ bracket: "mplus", seasonVerified: "s1" }] },
    { id: "two", name: "Two", kind: "tier-list", scale: "x", pages: [{ bracket: "mplus", seasonVerified: "s2" }] },
  ];
  // Live season s2 (post-launch): the un-flipped S1 list is excluded — the consensus
  // shrinks to the outlets that updated rather than averaging two seasons (DECISION 1).
  const c = consensusFor({ one: "B", two: "S" }, sources, scales, "mplus", "s2");
  assert.equal(c.perSource.length, 1, "only the S2-verified source feeds the mean");
  assert.equal(c.perSource[0].source, "two");
  assert.equal(c.tier, "S");
  // The rule cuts BOTH ways: pre-launch (live season s1) an outlet that flipped EARLY
  // to S2 opinions is equally out — its letters describe a game nobody is playing yet.
  const pre = consensusFor({ one: "B", two: "S" }, sources, scales, "mplus", "s1");
  assert.equal(pre.perSource.length, 1);
  assert.equal(pre.perSource[0].source, "one");
  // Absent seasonVerified = never checked = assumed current: today nothing changes.
  const untagged = [{ id: "u", name: "U", kind: "tier-list", scale: "x", pages: [{ bracket: "mplus" }] }];
  assert.equal(consensusFor({ u: "A" }, untagged, scales, "mplus", "s2").perSource.length, 1);
});

test("sourceSeasonOk is bracket-scoped — an M+ flip does not vouch for the raid page", () => {
  const src = { pages: [
    { bracket: "mplus", seasonVerified: "s2" },
    { bracket: "raid", seasonVerified: "s1" },
  ] };
  assert.equal(sourceSeasonOk(src, "mplus", "s2"), true);
  assert.equal(sourceSeasonOk(src, "raid", "s2"), false);
  // No bracket given (registry-level question): any lagging page marks the source.
  assert.equal(sourceSeasonOk(src, null, "s2"), false);
});

test("PHASES is the single era vocabulary and carries the current cycle", () => {
  // Pinning today's values, so the launch flip is a deliberate edit that fails this
  // test and updates it in the same commit — the same pattern as SNAPSHOT_PHASE.
  assert.equal(PHASES.liveSeason, "s1");
  assert.equal(PHASES.ptr?.marker, "12.1 PTR");
  assert.equal(PHASES.ptrSunset, false);
});
