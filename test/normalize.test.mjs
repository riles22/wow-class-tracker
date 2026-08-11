import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreFor, consensusTier, consensusFor, isLiveEra, ptrTierSources, PHASES, sourceSeasonOk,
  seasonRank, aheadSeasonFor, nextPatchTierSources, frozenLettersFor } from "../src/normalize.mjs";

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
  /* label ≠ marker is the launch-day split: `label` (display) drops " PTR" the moment the
     patch ships (2026-08-11 ~22:00 UTC) while `marker` (data key — metric names, takeEra,
     PTR_METRIC_NAMES) is frozen for the cycle. This pin makes the label flip a deliberate
     one-line edit and guards the marker against being flipped along with it. */
  assert.equal(PHASES.ptr?.label, "12.1 PTR");
  assert.equal(PHASES.patchName, "Curse of Ula'tek");
  assert.equal(PHASES.ptrSunset, false);
});

/* ---- the season-ahead predicate + the frozen lane (2026-08-09) ---------------------
   Wowhead published its Season-2 lists before Season 2 existed, which the pipeline had no
   vocabulary for: seasons were only ever compared for EQUALITY, so "behind" and "ahead"
   were the same fact. These pin both directions. */

const aheadScales = {
  scales: { s: { tiers: ["S", "A", "B"], values: { S: 100, A: 70, B: 40 } } },
  consensus: { bands: [{ tier: "S", min: 88 }, { tier: "A", min: 58 }, { tier: "B", min: 0 }], spreadThreshold: 22 }
};
const mk = (id, pages, extra = {}) => ({ id, name: id, kind: "tier-list", scale: "s", pages, ...extra });

test("seasonRank orders the declared seasons and refuses an unknown id", () => {
  assert.equal(seasonRank("s1"), 0);
  assert.equal(seasonRank("s2"), 1);
  assert.equal(seasonRank("s3"), null, "an undeclared season must not sort — it must be visible as unknown");
  // Declared, never string-compared: "s10" would sort below "s2" lexically.
  assert.equal(seasonRank("s10", ["s1", "s2", "s10"]), 2);
});

test("aheadSeasonFor is bracket-scoped: an M+-only flip is a next-patch opinion in M+ and nothing in raid", () => {
  const src = mk("w", [{ bracket: "mplus", seasonVerified: "s2" }, { bracket: "raid", seasonVerified: "s1" }]);
  assert.equal(aheadSeasonFor(src, "mplus", "s1"), "s2");
  assert.equal(aheadSeasonFor(src, "raid", "s1"), null);
  // ...and the same source is still a normal consensus member in the bracket it has not flipped.
  assert.equal(sourceSeasonOk(src, "raid", "s1"), true);
  assert.equal(sourceSeasonOk(src, "mplus", "s1"), false);
});

test("aheadSeasonFor refuses a half-flipped bracket rather than mixing two seasons in one term", () => {
  // raid DPS has flipped, raid Healer has not: the outlet is mid-rebuild.
  const src = mk("w", [
    { bracket: "raid", role: "DPS", seasonVerified: "s2" },
    { bracket: "raid", role: "Healer", seasonVerified: "s1" }
  ]);
  assert.equal(aheadSeasonFor(src, "raid", "s1"), null, "half-flipped is not an ahead opinion");
  assert.equal(sourceSeasonOk(src, "raid", "s1"), false, "and it is out of the consensus too — it goes dark, never mixed");
});

test("a partially-labelled bracket is an error, not a silent not-ahead", () => {
  // seasonVerified is agent-writable; an unwritten field must never be a silent switch
  // over a third of every raid forecast.
  const src = mk("w", [{ bracket: "raid", seasonVerified: "s2" }, { bracket: "raid" }]);
  assert.throws(() => aheadSeasonFor(src, "raid", "s1"), /mixes season-verified and unverified/);
  // Absent on EVERY page is different: "never checked" is read as current.
  assert.equal(aheadSeasonFor(mk("u", [{ bracket: "raid" }]), "raid", "s1"), null);
});

test("aheadSeasonFor refuses an unknown season rather than sorting it last", () => {
  assert.throws(() => aheadSeasonFor(mk("w", [{ bracket: "raid", seasonVerified: "s9" }]), "raid", "s1"),
    /unknown season "s9"/);
});

test("a source is never both a consensus member and a next-patch input", () => {
  // Exhaustive over every labelling a two-page source can carry, in both brackets, at
  // both live seasons. Mutual exclusion is structural (aheadSeasonFor requires exactly
  // the condition that makes sourceSeasonOk false) — this pins it against future edits.
  const labels = ["s1", "s2", undefined];
  let checked = 0;
  for (const raid of labels) for (const mplus of labels) for (const live of ["s1", "s2"]) {
    const src = mk("w", [
      { bracket: "raid", ...(raid ? { seasonVerified: raid } : {}) },
      { bracket: "mplus", ...(mplus ? { seasonVerified: mplus } : {}) }
    ]);
    for (const bracket of ["raid", "mplus"]) {
      const inConsensus = sourceSeasonOk(src, bracket, live);
      const inNextPatch = nextPatchTierSources([src], bracket, live).length > 0;
      assert.ok(!(inConsensus && inNextPatch),
        "double-counted: raid=" + raid + " mplus=" + mplus + " live=" + live + " bracket=" + bracket);
      checked++;
    }
  }
  assert.equal(checked, 36);
});

test("at liveSeason s2 a season-ahead source re-enters the consensus and leaves the next-patch term", () => {
  const src = mk("w", [{ bracket: "raid", seasonVerified: "s2" }]);
  assert.equal(nextPatchTierSources([src], "raid", "s1").length, 1);
  assert.equal(sourceSeasonOk(src, "raid", "s1"), false);
  // The whole point of keying on season rather than era: the flip needs no owner action.
  assert.equal(nextPatchTierSources([src], "raid", "s2").length, 0);
  assert.equal(sourceSeasonOk(src, "raid", "s2"), true);
});

test("an era:ptr list stays a next-patch input regardless of season", () => {
  const ptr = mk("x-ptr", [{ bracket: "mplus", seasonVerified: "s2" }], { era: "ptr" });
  assert.equal(nextPatchTierSources([ptr], "mplus", "s1").length, 1);
  // NOTE: era:"ptr" does NOT self-repair at the flip — it still occupies the next-patch
  // slot while describing the season we are running. That is the documented 08-18 one-shot
  // (retype or merge icyveins-ptr); this test states the behaviour so the flip cannot
  // silently inherit it.
  assert.equal(nextPatchTierSources([ptr], "mplus", "s2").length, 1);
});

test("PHASES.seasonOrder contains liveSeason and every season the labels declare", () => {
  assert.ok(PHASES.seasonOrder.includes(PHASES.liveSeason));
  for (const season of Object.keys(PHASES.seasonLabels)) assert.ok(PHASES.seasonOrder.includes(season), season);
  // The live label must be the live season's own label, or a next-season column would
  // inherit the wrong patch string.
  assert.equal(PHASES.liveLabel, PHASES.seasonLabels[PHASES.liveSeason]);
});

test("a season-ahead source contributes its frozen final-season letters instead of dropping out", () => {
  const srcs = [mk("a", [{ bracket: "raid", seasonVerified: "s1" }]), mk("w", [{ bracket: "raid", seasonVerified: "s2" }])];
  const ratings = { a: "A", w: "S" };  // w's CURRENT letter describes s2 and must not be used
  const without = consensusFor(ratings, srcs, aheadScales, "raid", "s1");
  assert.equal(without.perSource.length, 1, "no archive -> the outlet simply drops out, as before");

  const frozen = { w: { tier: "B", frozenAt: "2026-08-08" } };
  const withFrozen = consensusFor(ratings, srcs, aheadScales, "raid", "s1", frozen);
  assert.equal(withFrozen.perSource.length, 2);
  assert.equal(withFrozen.frozenCount, 1);
  const w = withFrozen.perSource.find(p => p.source === "w");
  assert.equal(w.tier, "B", "the FROZEN letter, never the live s2 one");
  assert.equal(w.lane, "frozen");
  assert.equal(w.frozenAsOf, "2026-08-08");
  assert.equal(withFrozen.perSource.find(p => p.source === "a").lane, undefined, "live contributors carry no lane key");
  assert.equal(withFrozen.score, 55);  // (70 + 40) / 2
});

test("the frozen lane is never consulted for a source that still describes the live season", () => {
  const srcs = [mk("a", [{ bracket: "raid", seasonVerified: "s1" }])];
  const c = consensusFor({ a: "A" }, srcs, aheadScales, "raid", "s1", { a: { tier: "B", frozenAt: "2020-01-01" } });
  assert.equal(c.perSource[0].tier, "A", "a live source uses its live letter even if an archive record exists");
  assert.equal(c.frozenCount, 0);
});

test("the frozen lane goes cold by itself when liveSeason advances", () => {
  const srcs = [mk("w", [{ bracket: "raid", seasonVerified: "s2" }])];
  const archive = { s1: { w: { raid: { frozenAt: "2026-08-08", letters: { "Death Knight|Blood": "B" } } } } };
  // At s1 the record is found and used...
  assert.deepEqual(frozenLettersFor(archive, "Death Knight|Blood", "raid", "s1"), { w: { tier: "B", frozenAt: "2026-08-08" } });
  // ...and at s2 the lookup lands on a season that does not exist, so nothing is consulted.
  assert.equal(frozenLettersFor(archive, "Death Knight|Blood", "raid", "s2"), null);
  const at2 = consensusFor({ w: "S" }, srcs, aheadScales, "raid", "s2", frozenLettersFor(archive, "Death Knight|Blood", "raid", "s2"));
  assert.equal(at2.perSource[0].tier, "S", "post-flip the outlet is simply live again");
  assert.equal(at2.frozenCount, 0);
});

test("the frozen lane is bracket-scoped and a missing letter degrades to the live-only mean", () => {
  const srcs = [mk("a", [{ bracket: "raid", seasonVerified: "s1" }]),
                mk("w", [{ bracket: "raid", seasonVerified: "s2" }])];
  // Archive holds M+ only: raid must not borrow it.
  const archive = { s1: { w: { mplus: { frozenAt: "2026-08-08", letters: { "X|Y": "B" } } } } };
  assert.equal(frozenLettersFor(archive, "X|Y", "raid", "s1"), null);
  const c = consensusFor({ a: "A", w: "S" }, srcs, aheadScales, "raid", "s1", frozenLettersFor(archive, "X|Y", "raid", "s1"));
  assert.equal(c.perSource.length, 1, "no raid record -> the live-only mean, never an invented letter");
  assert.equal(c.frozenCount, 0);
});

test("consensusFor with no frozen argument is unchanged from before the lane existed", () => {
  const srcs = [mk("a", [{ bracket: "raid" }]), mk("b", [{ bracket: "raid" }])];
  const c = consensusFor({ a: "S", b: "B" }, srcs, aheadScales, "raid", "s1");
  assert.equal(c.tier, "A");
  assert.equal(c.score, 70);
  assert.equal(c.spread, 60);
  assert.equal(c.frozenCount, 0);
  assert.ok(c.perSource.every(p => p.lane === undefined));
});
