import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dataHealth, fightLabels, metricRanks, outlookFor, movementFor, projectionMovementFor, snapshotStateOf, pickBaseline, dummyDomeScores, classifyHighlight, projectionFor, historySeries, specBuildChanges, PROJECTION_VERSION, RANK_VERSION } from "../src/render.mjs";

/* Stamp a fixture snapshot as current-version. An UNSTAMPED snapshot means version 1 —
   every snapshot written before the markers existed came from the v1 formulas — so a
   fixture that means "same version as now" has to say so, exactly like snapshot.mjs does.
   Tests that exercise the CROSS-version path deliberately skip this. */
const cur = snap => ({ ...snap, projectionVersion: PROJECTION_VERSION, rankVersion: RANK_VERSION });

test("specBuildChanges: spec lines by prefix, class-wide lines by build membership", () => {
  const builds = { builds: [
    { date: "2026-07-14", forumPostNumber: 14, forumUrl: "https://example.com/t/1/14",
      specsAffected: ["Havoc Demon Hunter", "Devourer Demon Hunter", "Demon Hunter (class-wide)", "Survival Hunter"],
      highlights: [
        "Havoc Demon Hunter Inertia effect now increases damage by 12% (was 18%).",
        "Devourer Demon Hunter Hungering Slash bug fixed.",
        "Demon Hunter (class-wide) Sigils radius increased.",
        "Survival Hunter Flamefang-Pitch removed."
      ] },
    { date: "2026-07-01", forumPostNumber: 9, forumUrl: "https://example.com/t/1/9",
      specsAffected: ["Havoc Demon Hunter"],
      highlights: ["Havoc Demon Hunter Blade Dance damage increased by 6%."] },
    { date: "2026-06-24", forumPostNumber: 5, specsAffected: ["Feral Druid"],
      highlights: ["Feral Druid energy regen up."] }
  ] };
  const havoc = specBuildChanges({ class: "Demon Hunter", spec: "Havoc" }, builds);
  assert.equal(havoc.length, 2); // the 06-24 build has no Demon Hunter lines and is omitted
  assert.deepEqual(havoc.map(b => b.date), ["2026-07-14", "2026-07-01"]); // newest first, per feed order
  assert.equal(havoc[0].forumPostNumber, 14);
  assert.equal(havoc[0].forumUrl, "https://example.com/t/1/14");

  // Rewritten 2026-07-24 (D6): this used to assert the class-wide line's ABSENCE. Five
  // real class-level highlights reached no drawer at all, and for nine spec-build pairs
  // the class line was the spec's only line, so the build's date vanished with it.
  // Spec lines lose their redundant prefix; class-wide lines keep their full text and
  // are flagged so the UI can mark them as scope, not spec-specific tuning.
  assert.deepEqual(havoc[0].lines, [
    { text: "Inertia effect now increases damage by 12% (was 18%).", classWide: false },
    { text: "Demon Hunter (class-wide) Sigils radius increased.", classWide: true }
  ]);

  // Still anchored: "Demon Hunter (class-wide)" must never leak into a Hunter spec, and
  // Survival's own line is unaffected by the neighbouring class.
  const survival = specBuildChanges({ class: "Hunter", spec: "Survival" }, builds);
  assert.deepEqual(survival.map(b => b.date), ["2026-07-14"]);
  assert.deepEqual(survival[0].lines, [{ text: "Flamefang-Pitch removed.", classWide: false }]);
  assert.ok(!survival[0].lines.some(l => /Sigils/.test(l.text)));
  assert.deepEqual(specBuildChanges({ class: "Warrior", spec: "Arms" }, builds), []);
});

test("specBuildChanges: a class-wide line reaches only the specs that build says it touched", () => {
  // The reason scoping is by specsAffected and not by matching "<Class> (" in the text:
  // "Death Knight (San'layn) …" would otherwise attach to Frost DK, which is not a
  // San'layn spec — and the build data already says so.
  const builds = { builds: [{
    date: "2026-07-21", forumPostNumber: 16,
    specsAffected: ["Blood Death Knight", "Unholy Death Knight"],
    highlights: ["Death Knight (San'layn) Blood-Soaked Ground now reduces physical damage taken by 8% (was 5%)."]
  }] };
  const blood = specBuildChanges({ class: "Death Knight", spec: "Blood" }, builds);
  assert.equal(blood.length, 1);
  assert.equal(blood[0].lines[0].classWide, true);
  assert.equal(blood[0].date, "2026-07-21"); // the build's DATE survives with it

  // Frost DK is omitted from specsAffected, so the line must not reach it
  assert.deepEqual(specBuildChanges({ class: "Death Knight", spec: "Frost" }, builds), []);
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
  const snap = cur({ date: "2026-06-24", specs: { "C|S": {
    consensus: { raid: "B", mplus: "B" }, ranks: { "warcraftlogs|raid|Median rDPS": 5 }
  } } });
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
  const snap = cur({ date: "2026-06-24", specs: { "C|S": { consensus: {}, ranks: {
    "warcraftlogs|raid|Median rDPS": 5, "simulationcraft|raid|Median rDPS": 1
  } } } });
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
  const snap = cur({ date: "2026-07-01", specs: snapshotStateOf([spec]) });
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

test("classifyHighlight: plural resource terms count (audit 2026-07-24 C1)", () => {
  // The real 2026-07-14 Holy Priest line published as a NERF because the trailing "s"
  // killed the word boundary — both of its official lines are buffs.
  assert.equal(classifyHighlight("Flash Heal and Prayer of Healing mana costs reduced by 10%."), "buff");
  assert.equal(classifyHighlight("Rune Strike cooldowns reduced by 5s."), "buff");
  assert.equal(classifyHighlight("Arcane Blast now costs 20 Focus (was 25)."), "buff");
  // singular still behaves exactly as before
  assert.equal(classifyHighlight("Fan of Knives Energy cost increased by 5."), "nerf");
});

test("classifyHighlight: the '(was N <unit>)' idiom, decimals, and unit mismatch (audit L1 / 2026-07-24 C2)", () => {
  // reported by the 2026-07-23 audit, never actioned — a bare unit made the branch miss
  assert.equal(classifyHighlight("Cooldown now 90 sec (was 60 sec)."), "nerf");
  // the clause splitter must not split inside a decimal ("4.5 seconds")
  assert.equal(
    classifyHighlight("Blightburst now causes Putrefy to extend the duration of plagues by 3 seconds (was 4.5 seconds)."),
    "nerf");
  // a trailing phrase inside the paren is fine…
  assert.equal(classifyHighlight("Slayer Opportunist now grants 20% damage (was 10% each)."), "buff");
  // …but a SECOND number in it makes the comparison meaningless — skip, don't guess
  assert.equal(
    classifyHighlight("Star Cascade now has a 30% chance to launch a Starsurge at 50% effectiveness (was 40% at 70%)"),
    null);
  // disagreeing units are incomparable: this is a 3x buff, not a cut from 20 to 1
  assert.equal(classifyHighlight("Hogstrider now lasts 1 minute (was 20 seconds)."), null);
  // …while equivalent units still compare
  assert.equal(classifyHighlight("Cooldown now 90 sec (was 60 seconds)."), "nerf");
});

test("classifyHighlight: a resource DELTA is not a resource LEVEL", () => {
  // A bigger cooldown is a nerf; a bigger cooldown *reduction* is a buff. Both real lines.
  assert.equal(
    classifyHighlight("Scalecommander Wingleader now reduces Deep Breath cooldown by 1s per target struck (was 0.5s)."),
    "buff");
  assert.equal(
    classifyHighlight("Wildfire Shells now grants 5 seconds of Wildfire Bomb cooldown reduction (was 2 seconds)."),
    "buff");
  // the delta rule is scoped to resource clauses, so the plain higher-is-better reading
  // still wins where it is already correct
  assert.equal(
    classifyHighlight("Blood-Soaked Ground now reduces physical damage taken by 8% (was 5%)."),
    "buff");
  assert.equal(classifyHighlight("Deathmark increases the damage of your Rupture by 75% (was 100%)."), "nerf");
});

test("classifyHighlight: bug-fix notes are not tuning direction (audit 2026-07-24 N4)", () => {
  // Blizzard's fix notes are written with tuning verbs; a bare verb count reads them as
  // buffs. This one line published Brewmaster a full tier up in the 12.1 forecast.
  assert.equal(
    classifyHighlight("Brewmaster Monk — Fixed Flurry Strikes' Physical damage not being correctly increased by Bring Me Another or the Venomous Abyss 4-set bonus."),
    null);
  assert.equal(
    classifyHighlight("Arms Warrior Fixed an issue with the 2-set bonus causing Concussive Slam to trigger Mortal Wounds (bug fix)."),
    null);
  // a REAL change in its own sentence still scores, even when a fix rides along after it
  assert.equal(
    classifyHighlight("Restoration Druid — Regrowth healing reduced by 20%; fixed Abundance's bonus crit chance to Regrowth not working."),
    "nerf");
  assert.equal(
    classifyHighlight("Preservation Evoker — Fixed Consume Flame healing not being increased by Grace Period; Fluttering Seedlings healing is now also increased by Titan's Gift."),
    "buff");
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
    cur({ date: "2026-07-09", specs: { "X|A": { consensus: { raid: "A", mplus: "B" }, scores: { raid: 73, mplus: 51 },
      projection: { raid: { tier: "A", score: 80, confidence: "high" }, mplus: null } } } }),
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

test("projectionMovementFor narrates the forecast's own moves and never touches consensus movement", () => {
  const scales = { consensus: { bands: [
    { tier: "S", min: 85 }, { tier: "A", min: 60 }, { tier: "B", min: 40 }, { tier: "C", min: 0 }] } };
  const specs = [
    // projection moved B -> A, consensus stood still
    { class: "Monk", spec: "Brewmaster", consensus: { raid: { tier: "B" } },
      projection: { raid: { tier: "A", score: 64 }, mplus: { tier: "A", score: 66 } } },
    // consensus moved B -> A, projection stood still
    { class: "Mage", spec: "Frost", consensus: { raid: { tier: "A" } },
      projection: { raid: { tier: "B", score: 50 }, mplus: null } },
  ];
  const snapshot = cur({ date: "2026-07-23", specs: {
    "Monk|Brewmaster": { consensus: { raid: "B" }, projection: { raid: { tier: "B", score: 57 }, mplus: { tier: "A", score: 66 } } },
    "Mage|Frost": { consensus: { raid: "B" }, projection: { raid: { tier: "B", score: 50 }, mplus: null } },
  } });

  movementFor(specs, scales, snapshot);
  projectionMovementFor(specs, scales, snapshot);

  // the forecast's own move is now narrated, with its score delta for jitter disclosure
  assert.equal(specs[0].projMovement.raid.was, "B");
  assert.equal(specs[0].projMovement.raid.delta, 1);
  assert.equal(specs[0].projMovement.raid.scoreDelta, 7);
  assert.equal(specs[0].projMovement.mplus, undefined); // unchanged bracket stays silent
  // …and it did NOT invent a consensus move
  assert.equal(specs[0].movement, undefined);

  // the reverse spec: consensus moved, projection did not
  assert.equal(specs[1].movement.raid.was, "B");
  assert.equal(specs[1].projMovement, undefined);
});

test("projectionMovementFor is a no-op before projections() has run (ordering contract)", () => {
  // The first cut of this lived inside movementFor, which runs BEFORE projections() —
  // so spec.projection did not exist yet and it silently produced nothing (audit C3).
  const scales = { consensus: { bands: [{ tier: "A", min: 60 }, { tier: "B", min: 0 }] } };
  const specs = [{ class: "Monk", spec: "Brewmaster", consensus: { raid: { tier: "B" } } }]; // no .projection yet
  const snapshot = cur({ date: "2026-07-23", specs: {
    "Monk|Brewmaster": { consensus: { raid: "B" }, projection: { raid: { tier: "B", score: 57 }, mplus: null } } } });
  projectionMovementFor(specs, scales, snapshot);
  assert.equal(specs[0].projMovement, undefined);
  // Guard the guard: the same call WITH a projection present must narrate, or this test
  // would pass for any reason at all (it once did — the version gate, not the ordering,
  // was what made it green after the markers landed).
  const ready = [{ ...specs[0], projection: { raid: { tier: "A", score: 65 }, mplus: null } }];
  projectionMovementFor(ready, scales, snapshot);
  assert.equal(ready[0].projMovement.raid.was, "B", "the fixture must be capable of producing a move");
});

/* The version markers are load-bearing, not documentation. When PROJECTION_VERSION or
   RANK_VERSION is bumped, the recompute must NOT be published as movement — and the
   sections the bump does not invalidate must keep working. Both halves matter: the naive
   "skip mismatched snapshots" fix passes the first half and silently breaks the second,
   which is how the branch shipped 11 phantom forecast arrows while hiding 9 real
   consensus moves. */
test("a rank-version boundary suppresses rank arrows but still narrates consensus movement", () => {
  const scales = { consensus: { bands: [{ tier: "S", min: 88 }, { tier: "A", min: 58 }, { tier: "B", min: 0 }] } };
  const specs = () => [{
    class: "C", spec: "S", role: "DPS",
    consensus: { raid: { tier: "A" }, mplus: { tier: "B" } },
    metrics: [{ source: "wcl", bracket: "raid", name: "M", value: 1, rank: 2 }],
    ptrDummy: { rank: 3, of: 20, score: 70, targets: { "1": 1 } }
  }];
  const body = { "C|S": { consensus: { raid: "B", mplus: "B" }, ranks: { "wcl|raid|M": 5 }, dummy: { rank: 9, score: 40 } } };

  const sameVersion = movementFor(specs(), scales, cur({ date: "2026-07-23", specs: body }))[0];
  assert.deepEqual(sameVersion.movement, { raid: { delta: 1, was: "B", since: "2026-07-23" } });
  assert.equal(sameVersion.metrics[0].rankDelta, 3, "same version → rank arrows are real");
  assert.equal(sameVersion.ptrDummy.rankDelta, 6);

  // Unstamped == rank v1. The tier move is still true across the boundary; the rank move is not.
  const crossVersion = movementFor(specs(), scales, { date: "2026-07-23", specs: body })[0];
  assert.deepEqual(crossVersion.movement, { raid: { delta: 1, was: "B", since: "2026-07-23" } },
    "consensus tiers are version-independent — suppressing them would hide real movement");
  assert.equal(crossVersion.metrics[0].rankDelta, undefined, "a redefined rank is not a rank change");
  assert.equal(crossVersion.ptrDummy.rankDelta, undefined);
});

test("a rank-version boundary does not stop pickBaseline one snapshot short", () => {
  // The failure this pins: v1 ranks all read as "different", so the newest v1 snapshot looks
  // like a valid baseline and the walk stops there — reporting zero consensus movement for a
  // night that actually moved, while narrating the rank redefinition as change.
  const spec = {
    class: "C", spec: "S", role: "DPS",
    consensus: { raid: { tier: "A" }, mplus: { tier: "B" } },
    metrics: [{ source: "x", bracket: "raid", name: "M", value: 1, rank: 2 }]
  };
  const v1SameTiers = { date: "2026-07-24", specs: { "C|S": { consensus: { raid: "A", mplus: "B" }, ranks: { "x|raid|M": 17 } } } };
  const v1RealMove  = { date: "2026-07-23", specs: { "C|S": { consensus: { raid: "B", mplus: "B" }, ranks: { "x|raid|M": 17 } } } };
  assert.equal(pickBaseline([spec], [v1SameTiers, v1RealMove]), v1RealMove,
    "same tiers + differently-defined ranks is not a difference");
});

test("a projection-version boundary drops forecast arrows and un-splices the timeline", () => {
  const scales = { consensus: { bands: [{ tier: "S", min: 85 }, { tier: "A", min: 60 }, { tier: "B", min: 0 }] } };
  const spec = { class: "Monk", spec: "Brewmaster", consensus: { raid: { tier: "B" } },
    projection: { raid: { tier: "A", score: 64 }, mplus: null } };
  const body = { "Monk|Brewmaster": { consensus: { raid: "B" },
    scores: { raid: 55, mplus: null }, projection: { raid: { tier: "B", score: 52 }, mplus: null } } };

  const same = projectionMovementFor([{ ...spec }], scales, cur({ date: "2026-07-24", specs: body }))[0];
  assert.equal(same.projMovement.raid.was, "B");

  const across = projectionMovementFor([{ ...spec }], scales, { date: "2026-07-24", specs: body })[0];
  assert.equal(across.projMovement, undefined, "our own formula change is not a spec's movement");

  // …and the drawer sparkline must not splice the two formulas into one line.
  const h = historySeries([spec], scales, [{ date: "2026-07-24", specs: body }]);
  assert.deepEqual(h.specs["Monk|Brewmaster"].projRaid, [null], "a v1 projection point is a gap, not a step");
  assert.deepEqual(h.specs["Monk|Brewmaster"].raid, [55], "consensus scores come from the sources — never version-gated");
});

test("snapshot.mjs stamps the versions the readers gate on (writer/reader cannot drift)", async () => {
  // The round-trip test above calls snapshotStateOf directly, which does NOT stamp versions —
  // so it cannot see a drift in the one place that does. Assert against the real writer.
  const src = await readFile(new URL("../src/snapshot.mjs", import.meta.url), "utf8");
  for (const field of ["projectionVersion: PROJECTION_VERSION", "rankVersion: RANK_VERSION"]) {
    assert.ok(src.includes(field), `snapshot.mjs must stamp ${field} — unstamped snapshots read as v1 forever`);
  }
});

test("metricRanks: tied values share a rank (audit 2026-07-24, C6)", () => {
  const m = (name, value) => ({ source: "wcl", bracket: "raid", name, value });
  const specs = [
    { class: "C", spec: "A", role: "DPS", metrics: [m("Median rDPS", 100)] },
    { class: "C", spec: "B", role: "DPS", metrics: [m("Median rDPS", 100)] },
    { class: "C", spec: "C", role: "DPS", metrics: [m("Median rDPS", 100)] },
    { class: "C", spec: "D", role: "DPS", metrics: [m("Median rDPS", 90)] },
  ];
  metricRanks(specs);
  // three identical numbers cannot be #1/#2/#3 — that publishes an ordering the data
  // does not contain, and hands rankPct three different percentiles for one value
  assert.deepEqual(specs.slice(0, 3).map(s => s.metrics[0].rank), [1, 1, 1]);
  assert.equal(specs[3].metrics[0].rank, 4); // competition ranking: next rank skips
  assert.deepEqual(specs.map(s => s.metrics[0].of), [4, 4, 4, 4]);
});

test("projectionFor: a 'Mythic raid' meta note cannot nudge the M+ projection (audit C5)", () => {
  const scales = { consensus: { bands: [{ tier: "S", min: 85 }, { tier: "A", min: 60 }, { tier: "B", min: 0 }] } };
  const spec = { class: "Priest", spec: "Holy", role: "Healer",
    consensus: { raid: { score: 50 }, mplus: { score: 50 } }, metrics: [] };
  const note = { class: "Priest", spec: "Holy", creator: "izen", sentiment: "positive",
    date: "2026-07-20", patchContext: "Season 2 PTR — Mythic raid outlook" };
  // "Mythic raid" used to match the M+ regex via its bare /mythic/ alternative
  const mplus = projectionFor(spec, "mplus", scales, [note]);
  assert.ok(!/meta read/.test(mplus.basis), `M+ must not take a raid note: ${mplus.basis}`);
  const raid = projectionFor(spec, "raid", scales, [note]);
  assert.match(raid.basis, /meta read \+3/);

  // an explicit bracket wins over the text heuristic
  const explicit = { ...note, bracket: "mplus", patchContext: "Season 2 PTR — Mythic raid outlook" };
  assert.match(projectionFor(spec, "mplus", scales, [explicit]).basis, /meta read \+3/);
  assert.ok(!/meta read/.test(projectionFor(spec, "raid", scales, [explicit]).basis));
});

test("metricRanks: a tiny-n row keeps its value but earns no rank (audit 2026-07-24, D7)", () => {
  const m = (n, value) => ({ source: "wcl", bracket: "raid", name: "12.1 PTR raid testing score", value, n });
  const specs = [
    { class: "C", spec: "Big1", role: "DPS", metrics: [m(400, 100)] },
    { class: "C", spec: "Big2", role: "DPS", metrics: [m(120, 90)] },
    { class: "C", spec: "Thin", role: "DPS", metrics: [m(1, 999)] },   // one parse, highest value
    { class: "C", spec: "NoN", role: "DPS", metrics: [{ source: "sim", bracket: "raid", name: "Sim DPS", value: 5 }] },
  ];
  metricRanks(specs);
  // a single-parse median must not be published as #1 of the field…
  assert.equal(specs[2].metrics[0].rank, undefined);
  assert.equal(specs[2].metrics[0].of, undefined);
  assert.equal(specs[2].metrics[0].value, 999, "the measurement itself is still shown");
  // …and must not inflate `of` for the rows that do rank
  assert.deepEqual([specs[0].metrics[0].rank, specs[0].metrics[0].of], [1, 2]);
  assert.deepEqual([specs[1].metrics[0].rank, specs[1].metrics[0].of], [2, 2]);
  // a source that reports no sample size at all (sims, scores) is unaffected
  assert.equal(specs[3].metrics[0].rank, 1);

  // upsert safety: a row that used to rank and now falls below the floor loses its rank
  specs[0].metrics[0].n = 2;
  metricRanks(specs);
  assert.equal(specs[0].metrics[0].rank, undefined, "a stale rank must be cleared, not kept");
});

test("dataHealth stays clock-free and ships what the client needs to age it (audit C7)", () => {
  const mk = asOf => ({ metrics: [{ name: "A", asOf, source: "warcraftlogs" }, { name: "B", asOf, source: "robydoby" }] });
  const frozen = [mk("2026-06-01"), mk("2026-06-01")];
  const h = dataHealth(frozen);

  // Self-relative: everything stalled together, so every gap is 0 and `series` is empty.
  // That is the documented blind spot, and it is NOT closed here — closing it at build
  // time would bake the build date into dist and churn the artifact nightly.
  assert.equal(h.series.length, 0);

  // What IS shipped is the raw material for the browser to redo the comparison against
  // the reader's own clock: every series with its date and source, plus the threshold.
  assert.equal(h.all.length, 2);
  assert.equal(h.staleDays, 7);
  assert.deepEqual(h.all.map(s => s.source).sort(), ["robydoby", "warcraftlogs"]);
  const ref = "2026-07-25";
  const clientStale = h.all.filter(s => (Date.parse(ref) - Date.parse(s.asOf)) / 86400000 > h.staleDays);
  assert.equal(clientStale.length, 2, "the client can see what the build deliberately cannot");

  // A mixed state still resolves self-relatively at build time, sources intact. NOTE the
  // labels must differ: entries are keyed by metric NAME across all specs, keeping the
  // newest date per name — same-named metrics on two specs collapse to one entry.
  const mixed = dataHealth([
    { metrics: [{ name: "Fresh", asOf: "2026-07-25", source: "archon" }] },
    { metrics: [{ name: "Frozen", asOf: "2026-06-01", source: "warcraftlogs" }] },
  ]);
  assert.equal(mixed.latest, "2026-07-25");
  assert.equal(mixed.all.length, 2);
  assert.deepEqual(mixed.series.map(s => s.label), ["Frozen"]);
  assert.equal(mixed.oldest, "2026-06-01");
  assert.equal(mixed.series[0].source, "warcraftlogs");
});

test("dataHealth is a pure function of the data — identical input, identical output", () => {
  // build.mjs used to pass `new Date()` in, which made dist/index.html differ every night
  // even when nothing changed, and publish commits dist.
  const mk = asOf => ({ metrics: [{ name: "A", asOf, source: "warcraftlogs" }] });
  const a = dataHealth([mk("2026-06-01"), mk("2026-07-20")]);
  const b = dataHealth([mk("2026-06-01"), mk("2026-07-20")]);
  assert.deepEqual(a, b);
});
