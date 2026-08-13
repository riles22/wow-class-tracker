import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { SEASON, dataPredatesSeason, partitionStalePicks, seasonHasOpened, staleDisclosure,
  stalenessNotice } from "../src/season.mjs";

test("the gearing season config agrees with the tracker's own PHASES", async () => {
  /* gearing/ is self-contained on purpose, so it duplicates four fields rather than
     importing across the boundary. This is the pin that stops the two drifting: if the
     tracker flips liveSeason and gearing does not, launch day ships two answers. */
  const normalize = await readFile(new URL("../../src/normalize.mjs", import.meta.url), "utf8");
  const liveSeason = /liveSeason:\s*"([^"]+)"/.exec(normalize)?.[1];
  const labels = /seasonLabels:\s*\{([^}]*)\}/.exec(normalize)?.[1] ?? "";
  // Parsed with a literal regex rather than one built from a template string — a dynamic
  // one needs escaped backslashes that are easy to lose in transit, and losing one here
  // silently turns the pin into a test that can never fail.
  const patchForSeason = Object.fromEntries(
    [...labels.matchAll(/(\w+):\s*"([^"]+)"/g)].map((m) => [m[1], m[2]]))[SEASON.id];
  assert.ok(liveSeason, "could not read PHASES.liveSeason — the pin needs updating");
  assert.equal(SEASON.patch, patchForSeason,
    `gearing says ${SEASON.id} is patch ${SEASON.patch}; the tracker says ${patchForSeason}`);
});

test("season-open is a calendar fact taken as an argument, never read from the clock", () => {
  assert.equal(seasonHasOpened("2026-08-17"), false);
  assert.equal(seasonHasOpened("2026-08-18"), true, "the season opens ON the stated day");
  assert.equal(seasonHasOpened("2026-09-01"), true);
  assert.equal(seasonHasOpened(null), false);
});

test("staleness asks whether the harvest predates the season, not how old it is", () => {
  // A harvest 2 days BEFORE launch is stale; one 5 days after is not. Plain age inverts this.
  assert.equal(dataPredatesSeason("2026-08-16"), true);
  assert.equal(dataPredatesSeason("2026-08-23"), false);

  // Before launch the pre-launch caveat is TRUE, so there is nothing to disclose.
  assert.equal(stalenessNotice("2026-08-02", "2026-08-13"), null);
  // After launch, with pre-launch data, the page must say so.
  const notice = stalenessNotice("2026-08-02", "2026-08-19");
  assert.equal(notice.state, "predates-season");
  assert.match(notice.detail, /opened 2026-08-18/);
  assert.match(notice.detail, /harvested 2026-08-02/);
  // A post-launch harvest clears it with no further action.
  assert.equal(stalenessNotice("2026-08-19", "2026-08-25"), null);
  assert.equal(stalenessNotice(null, "2026-08-19").state, "unharvested");
});

test("G24: a pick naming content this season does not hold is dropped and counted", () => {
  // Measured 2026-08-13: Method cites Skyreach / Pit of Saron / Magisters' Terrace on four
  // specs, and an Icy Veins page still names Nexus King Salhadaar (an S1 raid boss).
  const inSeason = new Set(["The Coiled Altar", "Kings' Rest"]);
  const resolve = (text) => (inSeason.has(text) ? { canonical: text } : null);
  const picks = [
    { itemId: "1", sourceText: "The Coiled Altar" },
    { itemId: "2", sourceText: "Skyreach" },
    { itemId: "3", sourceText: "Nexus King Salhadaar" },
    { itemId: "4", sourceText: "Kings' Rest" },
  ];
  const { kept, dropped } = partitionStalePicks(picks, resolve);
  assert.deepEqual(kept.map((p) => p.itemId), ["1", "4"]);
  assert.deepEqual(dropped.map((p) => p.sourceText), ["Skyreach", "Nexus King Salhadaar"]);
});

test("an unlabelled pick is not evidence of staleness and is never dropped for it", () => {
  // The harvesters already refuse a run that cannot name its sources; silently discarding
  // an unlabelled pick here would double-punish the same condition and lose a real vote.
  const { kept, dropped } = partitionStalePicks([{ itemId: "1", sourceText: "" }], () => null);
  assert.equal(kept.length, 1);
  assert.equal(dropped.length, 0);
  assert.deepEqual(partitionStalePicks(null, () => null), { kept: [], dropped: [] });
});

test("the disclosure names every source that lost picks, worst first", () => {
  assert.deepEqual(staleDisclosure({ method: 7, icyveins: 1, wowhead: 0 }),
    [{ source: "method", dropped: 7 }, { source: "icyveins", dropped: 1 }]);
  assert.deepEqual(staleDisclosure({}), []);
});

test("the PTR namespace is config, and both spellings must always parse", () => {
  // A stale /ptr/ link outlives the flip, so harvesters accept both regardless; the config
  // only decides what we EMIT. Pinned so the launch edit is one field, not a code sweep.
  assert.equal(SEASON.wowheadNamespace, "ptr", "still pre-launch as of this commit");
  assert.match(String(SEASON.maxItemLevel), /^\d+$/);
  assert.equal(SEASON.opensAt, "2026-08-18");
});

/* ---------- G22: the lair-boss guard, proven non-vacuous ---------- */

test("a lair declared as a raid boss's drop alias is refused", async () => {
  /* This guard currently never fires against committed data, because the lair split is a
     LAUNCH-HARVEST step and `raid.lairs` is still absent (see the scope doc's G22 note). A
     guard that cannot fire is a guard nobody has tested, so it is exercised here against a
     synthesised pair — the exact arrangement that let Nymrissa Wavecaller sit inside raid
     boss 1 unnoticed, which would send a reader to the wrong instance for four items. */
  const { validateData } = await import("../src/validate-data.mjs");
  const base = async (name) => JSON.parse(await readFile(new URL(`../data/${name}`, import.meta.url), "utf8"));
  const [raid, specs, dungeons, sheet, statOverrides, statBaseline, weaponProficiency,
    itemEligibility, tier, catalyst, catalystAllocations,
    guidePicks, guidePriorities, archonUsage] = await Promise.all([
    base("raid-items.json"), base("specs.json"), base("dungeon-items.json"),
    base("sheet-rewards.json"), base("stat-priority-overrides.json"),
    base("stat-priority-baseline.json"), base("weapon-proficiency.json"),
    base("item-eligibility-overrides.json"), base("tier-items.json"),
    base("catalyst-rules.json"), base("catalyst-stat-allocations.json"),
    base("guide-picks.json"), base("guide-priorities.json"), base("archon-usage.json"),
  ]);
  const data = { raid, specs, dungeons, sheet, statOverrides, statBaseline, weaponProficiency,
    itemEligibility, tier, catalyst, catalystAllocations,
    guidePicks, guidePriorities, archonUsage };

  // Committed data validates today.
  assert.doesNotThrow(() => validateData(data));

  // Declare the lair as its own source while a raid boss still claims it as an alias.
  const conflicted = JSON.parse(JSON.stringify(data));
  conflicted.raid.lairs = [{ key: "tidebound-grotto", name: "Nymrissa Wavecaller",
    instance: "Tidebound Grotto", lockout: "separate", items: [] }];
  assert.throws(() => validateData(conflicted), /claims lair boss .* as a drop alias/,
    "the arrangement G22 replaced must not be able to come back");

  /* Dropping the alias ALONE is not enough, and finding that out is the point: the alias was
     MASKING four misfiled items. Remove it and their own `droppedBy: "Nymrissa Wavecaller"`
     immediately reads as an unexpected source under Nek'zali. The two halves must move
     together, which is exactly why G22's data step belongs to the launch harvest and not to
     a hand edit. */
  const aliasOnly = JSON.parse(JSON.stringify(conflicted));
  aliasOnly.raid.bosses[0].dropAliases =
    aliasOnly.raid.bosses[0].dropAliases.filter((a) => a !== "Nymrissa Wavecaller");
  assert.throws(() => validateData(aliasOnly), /has unexpected source Nymrissa Wavecaller/,
    "the alias was hiding misfiled items — removing it alone must not pass");

  /* Moving the items too is still not the whole job, and this assertion is the executable
     statement of what the launch harvest must do in ONE coordinated step. Relocating them
     changes each item's `sourceKey` (boss ordinal -> lair key) and the raid drop counts, so
     the reviewed stat-allocation fingerprint and the summary counts both have to be re-cut.
     That is a re-review of harvested data, which is precisely why G22's data half is a
     harvest action rather than something to hand-edit green before launch. */
  const moved = JSON.parse(JSON.stringify(aliasOnly));
  const relocated = [];
  for (const boss of moved.raid.bosses) {
    boss.items = (boss.items || []).filter((item) => {
      if (item.droppedBy !== "Nymrissa Wavecaller") return true;
      relocated.push(item);
      return false;
    });
  }
  assert.equal(relocated.length, 3, "three of the four sit under Nek'zali by droppedBy");
  moved.raid.lairs[0].items = relocated;

  let remaining = [];
  try { validateData(moved); } catch (error) { remaining = error.message.split("\n- ").slice(1); }
  assert.ok(remaining.some((line) => /raid summary counts are stale/.test(line)),
    "the harvest must re-cut raid counts");
  assert.equal(remaining.filter((line) => /Catalyst fingerprint drifted/.test(line)).length, 3,
    "…and re-review the stat-allocation fingerprint for each relocated item");
  assert.ok(!remaining.some((line) => /drop alias|unexpected source/.test(line)),
    "…but the alias and misfiling errors are gone, which is the half this decision fixes");

  // A lair that does not declare its separate lockout is refused: that field is the whole
  // reason it is not simply a ninth boss.
  const sameLockout = JSON.parse(JSON.stringify(moved));
  sameLockout.raid.lairs[0].lockout = "shared";
  assert.throws(() => validateData(sameLockout), /must declare lockout "separate"/);
});
