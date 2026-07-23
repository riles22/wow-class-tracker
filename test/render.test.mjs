import { test } from "node:test";
import assert from "node:assert/strict";
import { fightLabels, metricRanks, outlookFor, movementFor, snapshotStateOf, pickBaseline, dummyDomeScores, classifyHighlight, projectionFor, historySeries, specBuildChanges } from "../src/render.mjs";

test("specBuildChanges: official lines grouped by build, spec-prefix attribution identical to the outlook's", () => {
  const builds = { builds: [
    { date: "2026-07-14", forumPostNumber: 14, forumUrl: "https://example.com/t/1/14",
      highlights: [
        "Havoc Demon Hunter Inertia effect now increases damage by 12% (was 18%).",
        "Devourer Demon Hunter Hungering Slash bug fixed.",
        "Demon Hunter (class-wide) Sigils radius increased.", // class-wide: excluded from spec lists
        "Survival Hunter Flamefang-Pitch removed."
      ] },
    { date: "2026-07-01", forumPostNumber: 9, forumUrl: "https://example.com/t/1/9",
      highlights: ["Havoc Demon Hunter Blade Dance damage increased by 6%."] },
    { date: "2026-06-24", forumPostNumber: 5, highlights: ["Feral Druid energy regen up."] }
  ] };
  const havoc = specBuildChanges({ class: "Demon Hunter", spec: "Havoc" }, builds);
  assert.equal(havoc.length, 2); // the 06-24 build has no Havoc lines and is omitted
  assert.deepEqual(havoc.map(b => b.date), ["2026-07-14", "2026-07-01"]); // newest first, per feed order
  assert.deepEqual(havoc[0].lines, ["Inertia effect now increases damage by 12% (was 18%)."]); // prefix stripped, rest verbatim
  assert.equal(havoc[0].forumPostNumber, 14);
  assert.equal(havoc[0].forumUrl, "https://example.com/t/1/14");

  // Anchored prefixes: "Demon Hunter" lines never leak into Hunter specs, and
  // class-wide lines belong to the build feed, not any one spec's fact list.
  const survival = specBuildChanges({ class: "Hunter", spec: "Survival" }, builds);
  assert.deepEqual(survival[0].lines, ["Flamefang-Pitch removed."]);
  assert.equal(survival.length, 1);
  assert.ok(!havoc[0].lines.some(l => l.includes("Sigils")));
  assert.deepEqual(specBuildChanges({ class: "Warrior", spec: "Arms" }, builds), []);
});

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

test("snapshotStateOf round-trips into movementFor (shared key format cannot drift)", () => {
  const scales = { consensus: { bands: [{ tier: "S", min: 88 }, { tier: "A", min: 58 }, { tier: "B", min: 0 }] } };
  const spec = {
    class: "C", spec: "S", role: "DPS",
    consensus: { raid: { tier: "A" }, mplus: { tier: "B" } },
    metrics: [{ source: "warcraftlogs", bracket: "raid", name: "Median rDPS", value: 100, rank: 4 }],
    ptrDummy: { rank: 7, of: 23, score: 61, targets: { "1": 1 } }
  };
  // Snapshot the state exactly as snapshot.mjs would, then move the world and re-compare.
  const snap = { date: "2026-07-01", specs: snapshotStateOf([spec]) };
  assert.equal(snap.specs["C|S"].ranks["warcraftlogs|raid|Median rDPS"], 4);
  assert.deepEqual(snap.specs["C|S"].dummy, { rank: 7, score: 61 });
  const moved = {
    ...spec,
    consensus: { raid: { tier: "S" }, mplus: { tier: "B" } },
    metrics: [{ source: "warcraftlogs", bracket: "raid", name: "Median rDPS", value: 120, rank: 1 }],
    ptrDummy: { rank: 3, of: 23, score: 74, targets: { "1": 1 } }
  };
  movementFor([moved], scales, snap);
  assert.deepEqual(moved.movement, { raid: { delta: 1, was: "A", since: "2026-07-01" } });
  assert.equal(moved.metrics[0].rankDelta, 3);
  assert.equal(moved.ptrDummy.rankDelta, 4); // climbed 7 → 3
  assert.equal(moved.ptrDummy.since, "2026-07-01");
});

test("pickBaseline skips snapshots identical to the present state (post-refresh snapshots)", () => {
  const spec = {
    class: "C", spec: "S", role: "DPS",
    consensus: { raid: { tier: "A" }, mplus: { tier: "B" } },
    metrics: [{ source: "x", bracket: "raid", name: "M", value: 1, rank: 2 }]
  };
  const identical = { date: "2026-07-06", specs: snapshotStateOf([spec]) };            // the CI-rebuild case
  const older = { date: "2026-07-04", specs: { "C|S": { consensus: { raid: "B", mplus: "B" }, ranks: { "x|raid|M": 5 } } } };
  // Newest matches current state → must fall through to the older, differing baseline.
  assert.equal(pickBaseline([spec], [identical, older]), older);
  // Only identical snapshots → no usable baseline (honest zero movement).
  assert.equal(pickBaseline([spec], [identical]), null);
  // No history at all.
  assert.equal(pickBaseline([spec], []), null);
  // An old snapshot that predates the dummy section is compared without it (not "different" by absence).
  const preDummySpec = { ...spec, ptrDummy: { rank: 5, of: 23, score: 50, targets: { "1": 1 } } };
  const preDummySnap = { date: "2026-07-01", specs: snapshotStateOf([spec]) }; // no dummy stored
  assert.equal(pickBaseline([preDummySpec], [preDummySnap]), null, "dummy-only additions must not fake a baseline diff");
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

test("classifyHighlight: resource terms invert direction; '(was N%)' idiom decides by value", () => {
  // plain stat direction
  assert.equal(classifyHighlight("Obliterate damage increased by 8%."), "buff");
  assert.equal(classifyHighlight("Kingsbane damage reduced by 15%."), "nerf");
  // resource/tempo inversion — the old word-count called both of these wrong
  assert.equal(classifyHighlight("Deathmark's cooldown has been reduced by 30 seconds."), "buff");
  assert.equal(classifyHighlight("Fan of Knives Energy cost increased by 5."), "nerf");
  // "X by N% (was M%)" — the verb lies, the values don't
  assert.equal(classifyHighlight("Deathmark increases the damage of your Rupture by 75% (was 100%)."), "nerf");
  assert.equal(classifyHighlight("Shrouded Suffocation increases Garrote damage by 30% (was 20%)."), "buff");
  assert.equal(classifyHighlight("Deal Fate now has a 60% chance to grant a combo point (was 100%)."), "nerf");
  // resource + (was) inversion: a longer cooldown is a nerf even though the value rose
  assert.equal(classifyHighlight("Vendetta cooldown increased to 3 minutes (was 2)."), "nerf");
  // no signal
  assert.equal(classifyHighlight("Poison Bomb's visual has been adjusted."), null);
});

test("fightLabels: a spec with no comparable sims gets tag null, not 'Flexible'", () => {
  const specs = [
    mk("Full1", { "1": 100000, "3": 150000, "8": 300000 }),
    mk("Full2", { "1": 120000, "3": 160000, "8": 520000 }),
    mk("OnlyFive", { "5": 230000 }), // no canonical counts at all
  ];
  fightLabels(specs);
  assert.equal(specs[2].fightProfile.tag, null);
  assert.deepEqual(specs[2].fightProfile.labels, { st: null, cleave: null, aoe: null });
});

test("outlookFor: the writeup verdict always drives the arrow (auto-confirm policy)", () => {
  const builds = { builds: [{
    date: "2026-06-30",
    specsAffected: ["Outlaw Rogue"],
    highlights: ["Outlaw Rogue — Dispatch damage reduced by 10%."]
  }] };
  // Policy 2026-07-06: writeups are attributed distillations and count as confirmed on
  // landing — the verdict outranks the tuning-line balance, even against a nerf line,
  // and even if a legacy draft flag is somehow present.
  const withVerdict = outlookFor({ class: "Rogue", spec: "Outlaw", ptr: { verdict: "Positive" } }, builds);
  assert.equal(withVerdict.direction, "up");
  assert.match(withVerdict.basis, /PTR read: Positive/);
  const legacyDraft = outlookFor({ class: "Rogue", spec: "Outlaw", ptr: { verdict: "Positive", draft: true } }, builds);
  assert.equal(legacyDraft.direction, "up");
  // No writeup at all → the tuning balance still decides.
  const none = outlookFor({ class: "Rogue", spec: "Outlaw", ptr: null }, builds);
  assert.equal(none.direction, "down");
});

test("snapshot enrichment (scores/projection) never disturbs movement semantics", () => {
  const spec = {
    class: "X", spec: "A", role: "DPS",
    consensus: { raid: { tier: "A", score: 71 }, mplus: { tier: "B", score: 55 } },
    metrics: [{ source: "s", bracket: "raid", name: "m", rank: 2, value: 1, of: 5 }],
    projection: { raid: { tier: "A", score: 74, confidence: "high", basis: "x" }, mplus: null }
  };
  const now = snapshotStateOf([spec]);
  assert.equal(now["X|A"].scores.raid, 71, "enriched snapshot carries exact scores");
  assert.equal(now["X|A"].projection.raid.score, 74);
  assert.equal(now["X|A"].projection.raid.basis, undefined, "bulky basis strings stay out of history");
  // identical classic state but WILDLY different enrichment → still not a movement baseline
  const then = structuredClone(now);
  then["X|A"].scores = { raid: 5, mplus: 5 };
  then["X|A"].projection = { raid: { tier: "C", score: 5, confidence: "low" }, mplus: null };
  assert.equal(pickBaseline([spec], [{ date: "2026-07-01", specs: then }]), null,
    "scores/projection differences alone must not create a baseline (movement is tier/rank-grained)");
});

test("historySeries: tier-only history maps to band midpoints; enriched history is exact", () => {
  const scales = { consensus: { bands: [
    { tier: "S", min: 88 }, { tier: "A", min: 70 }, { tier: "B", min: 50 }, { tier: "C", min: 0 }
  ] } };
  const spec = { class: "X", spec: "A" };
  const snaps = [ // deliberately newest-first, as loadData returns them
    { date: "2026-07-09", specs: { "X|A": { consensus: { raid: "A", mplus: "B" }, scores: { raid: 73, mplus: 51 },
      projection: { raid: { tier: "A", score: 80, confidence: "high" }, mplus: null } } } },
    { date: "2026-07-01", specs: { "X|A": { consensus: { raid: "S", mplus: null }, ranks: {} } } } // pre-enrichment
  ];
  const h = historySeries([spec], scales, snaps);
  assert.deepEqual(h.dates, ["2026-07-01", "2026-07-09"], "series runs oldest → newest");
  assert.deepEqual(h.enriched, [false, true], "the UI needs the reconstruction boundary to draw honestly");
  assert.deepEqual(h.specs["X|A"].raid, [94, 73]); // S midpoint (88..100 → 94), then exact
  assert.deepEqual(h.specs["X|A"].mplus, [null, 51]); // unrated stays null, never guessed
  assert.deepEqual(h.specs["X|A"].projRaid, [null, 80]); // projection history starts at enrichment
});

const PROJ_SCALES = { consensus: { bands: [
  { tier: "S", min: 88 }, { tier: "A", min: 70 }, { tier: "B", min: 50 }, { tier: "C", min: 0 }
] } };

test("projectionFor: full-signal math is exact and transparent", () => {
  const spec = {
    class: "X", spec: "Full", role: "DPS",
    consensus: { raid: { score: 80 } },
    metrics: [{ bracket: "raid", name: "12.1 PTR raid testing score (normalized)", rank: 1, of: 27 }],
    ptrDummy: { score: 90 },
    outlook: { direction: "up" }
  };
  const notes = [
    { class: "X", spec: "Full", sentiment: "negative", date: "2026-07-01" },
    { class: "X", spec: "Full", sentiment: "positive", date: "2026-07-08" } // newest wins
  ];
  const p = projectionFor(spec, "raid", PROJ_SCALES, notes);
  // emp = (100*2 + 90*1)/3 = 96.67; base = .55*80 + .45*96.67 = 87.5; +7 up +3 note = 97.5 → 98
  assert.equal(p.score, 98);
  assert.equal(p.tier, "S");
  assert.equal(p.confidence, "high"); // testing + dummy + outlook = 3 signals
  assert.match(p.basis, /live baseline 80/);
  assert.match(p.basis, /raid-testing pct 100/);
  assert.match(p.basis, /Dummy Dome 90/);
  assert.match(p.basis, /outlook \+7/);
  assert.match(p.basis, /meta read \+3/);
});

test("projectionFor: prior-only, PTR-only, and no-data cases stay honest", () => {
  const priorOnly = projectionFor({ class:"X", spec:"P", role:"DPS", consensus:{ raid:{ score: 62 } } }, "raid", PROJ_SCALES);
  assert.equal(priorOnly.score, 62); // weights renormalize to the one component
  assert.equal(priorOnly.confidence, "prior-only");
  const ptrOnly = projectionFor({ class:"X", spec:"Q", role:"DPS",
    metrics: [{ bracket:"raid", name:"12.1 PTR raid testing score (normalized)", rank: 27, of: 27 }] }, "raid", PROJ_SCALES);
  assert.equal(ptrOnly.score, 0); // bottom of the testing field, nothing else
  assert.equal(ptrOnly.confidence, "low");
  assert.equal(projectionFor({ class:"X", spec:"R", role:"DPS" }, "raid", PROJ_SCALES), null, "nothing to project from → null, not a guess");
});

test("projectionFor: meta nudge is bracket-scoped and skips superseded notes", () => {
  const spec = { class:"X", spec:"S", role:"DPS", consensus:{ raid:{score:50}, mplus:{score:50} } };
  const notes = [
    { class:"X", spec:"S", sentiment:"positive", date:"2026-07-08", patchContext:"Season 2 PTR — raid testing outlook" },
    { class:"X", spec:"S", sentiment:"negative", date:"2026-07-06", patchContext:"Season 2 PTR — M+ outlook" }
  ];
  // izen's raid read must never color the M+ projection under his name (and vice versa)
  assert.equal(projectionFor(spec, "raid", PROJ_SCALES, notes).score, 53);
  const mplus = projectionFor(spec, "mplus", PROJ_SCALES, notes);
  assert.equal(mplus.score, 47);
  assert.match(mplus.basis, /meta read −3/);
  // a retracted (superseded) newest note must not nudge — matches the drawer's filter
  const sup = projectionFor(spec, "raid", PROJ_SCALES, [
    { class:"X", spec:"S", sentiment:"positive", date:"2026-07-09", superseded:true, patchContext:"raid outlook" },
    { class:"X", spec:"S", sentiment:"negative", date:"2026-07-05", patchContext:"raid outlook" }
  ]);
  assert.equal(sup.score, 47);
  // an UNDATED note must never win the newest-read sort (it stringifies to "undefined",
  // which sorts above every ISO date descending) — the dated negative read must prevail
  const undated = projectionFor(spec, "raid", PROJ_SCALES, [
    { class:"X", spec:"S", sentiment:"positive", patchContext:"raid outlook" },
    { class:"X", spec:"S", sentiment:"negative", date:"2026-07-05", patchContext:"raid outlook" }
  ]);
  assert.equal(undated.score, 47, "undated note must not beat a dated one");
});

test("projectionFor: M+ uses the role's own zone-56 series; shifts clamp to 0–100", () => {
  const healer = {
    class:"X", spec:"H", role:"Healer",
    consensus: { mplus: { score: 4 } },
    metrics: [
      { bracket:"mplus", name:"Median HPS (12.1 PTR M+ testing)", rank: 7, of: 7 },
      { bracket:"mplus", name:"Median rDPS (12.1 PTR M+ testing)", rank: 1, of: 27 } // wrong series — must be ignored for healers
    ],
    outlook: { direction: "down" }
  };
  const p = projectionFor(healer, "mplus", PROJ_SCALES, [{ class:"X", spec:"H", sentiment:"negative", date:"2026-07-08" }]);
  // emp = HPS pct 0 (last of 7); base = .55*4 + .45*0 = 2.2; −7 −3 → clamped at 0
  assert.equal(p.score, 0);
  assert.equal(p.tier, "C");
  const tank = {
    class:"X", spec:"T", role:"Tank",
    metrics: [{ bracket:"mplus", name:"Median rDPS (12.1 PTR M+ testing, tank)", rank: 1, of: 6 }]
  };
  assert.equal(projectionFor(tank, "mplus", PROJ_SCALES).score, 100); // top of the tank field
});

const dd = (spec, targets, role = "DPS") => ({ class: "X", spec, role, ptrDummy: { source: "warcraftlogs", targets } });

test("dummyDomeScores: composite = mean within-role percentile; rank ties break deterministically", () => {
  const specs = [
    dd("Top",    { "1": 300, "5": 300 }),
    dd("Mid",    { "1": 200, "5": 200 }),
    dd("Bottom", { "1": 100, "5": 100 }),
  ];
  dummyDomeScores(specs);
  const by = n => specs.find(s => s.spec === n).ptrDummy;
  assert.equal(by("Top").score, 100);    // 100th pct at both counts
  assert.equal(by("Bottom").score, 0);   // 0th pct at both counts
  assert.equal(by("Mid").score, 50);
  assert.deepEqual([by("Top").rank, by("Top").of], [1, 3]);
  assert.deepEqual(by("Top").perCount, { "1": 100, "5": 100 });
});

test("dummyDomeScores: coverage floor — partial-coverage specs keep percentiles but get no rank", () => {
  const specs = [
    dd("Full1",   { "1": 300, "2": 300, "3": 300, "5": 300 }),
    dd("Full2",   { "1": 200, "2": 200, "3": 200, "5": 200 }),
    dd("Full3",   { "1": 150, "2": 150, "3": 150, "5": 150 }),
    dd("OneOnly", { "5": 999 }),                       // field max at 5T — omission must not rank it
    dd("TwoOnly", { "1": 250, "5": 250 }),             // 2 of 4 < floor(3)
  ];
  dummyDomeScores(specs);
  const by = n => specs.find(s => s.spec === n).ptrDummy;
  assert.equal(by("OneOnly").rank, undefined, "single-count spec must not receive a composite rank");
  assert.equal(by("OneOnly").score, undefined);
  assert.deepEqual(by("OneOnly").perCount, { "5": 100 }, "per-count percentile is still computed");
  assert.deepEqual(by("OneOnly").coverage, { have: 1, of: 4 });
  assert.equal(by("TwoOnly").rank, undefined, "2-of-4 coverage is below the floor");
  assert.equal(by("Full1").of, 3, "ranked field = only the specs meeting the floor");
});

test("dummyDomeScores: non-DPS specs are excluded from the field entirely", () => {
  const specs = [
    dd("D1", { "1": 300, "5": 300 }),
    dd("D2", { "1": 200, "5": 200 }),
    dd("Healy", { "1": 999, "5": 999 }, "Healer"),
  ];
  dummyDomeScores(specs);
  assert.equal(specs[2].ptrDummy.score, undefined, "healer must not be scored");
  assert.equal(specs[0].ptrDummy.of, 2, "field size excludes the healer");
  assert.equal(specs[0].ptrDummy.score, 100, "healer's big numbers must not deflate DPS percentiles");
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
