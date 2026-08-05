import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  buildCuratedGear,
  catalogEnhancementCandidate,
  curatedSelectionReportId,
  extractActorSeed,
  extractActorTalents,
  extractPermanentEnhancements,
  guideWeights,
  pinnedCandidateTalents,
  reviewedEnhancementSource,
  sealBundleProfiles,
} from "../src/curate-simc-profiles.mjs";

const armorSlots = ["Head", "Shoulder", "Chest", "Hands", "Legs"];

function item(id, name, slot, type, primary = "Int", secondaries = ["Haste", "Mast"]) {
  return {
    id: String(id), name, slot, type, primary, secondaries,
    secondaryRatings: { [secondaries[0]]: 70, [secondaries[1]]: 30 },
    tertiaries: [], uniqueEquipped: false,
  };
}

function fixture() {
  const tier = armorSlots.map((slot, index) =>
    item(100 + index, `Tier ${slot}`, slot, "Cloth", "Int", ["Crit", "Vers"]));
  const raid = armorSlots.map((slot, index) =>
    item(200 + index, `Raid ${slot}`, slot, "Cloth"));
  raid.push(
    item(210, "Raid Neck", "Neck", null, null),
    item(211, "Raid Back", "Back", "Cloth"),
    item(212, "Raid Wrist", "Wrist", "Cloth"),
    item(213, "Raid Waist", "Waist", "Cloth"),
    item(214, "Raid Feet", "Feet", "Cloth"),
    item(215, "First Ring", "Finger", null, null),
    item(216, "Second Ring", "Finger", null, null, ["Mast", "Crit"]),
    item(217, "First Trinket", "Trinket", null, "Int", []),
    item(218, "Second Trinket", "Trinket", null, "Int", []),
    item(219, "Caster Staff", "Two-Hand", "Staff", "Int"),
  );
  const spec = {
    class: "Mage", spec: "Frost", role: "DPS", armor: "Cloth",
    statPriority: { primary: "Intellect", secondaries: ["Haste", "Mast", "Crit", "Vers"] },
    weaponLoadouts: [{
      id: "two-hand",
      hands: {
        mainHand: { required: true, occupiesBothHands: true,
          inventorySlots: ["Two-Hand"], itemTypes: ["Staff"] },
        offHand: { mustBeEmpty: true },
      },
    }],
  };
  return {
    spec,
    raidData: { bosses: [{ name: "Test Boss", items: raid }] },
    dungeonData: { dungeons: [] },
    tierData: { sets: [{ class: "Mage", name: "Test Tier", items: tier }] },
    allocations: { items: {} },
    eligibility: { items: {} },
    policy: {
      curationPolicyId: "test-policy", itemLevel: 334, tierPieces: 4,
      trinketIdsByPrimary: { Intellect: ["217", "218"] },
    },
  };
}

function enhancementSource(slots = {
  Head: { gem_id: "240983" },
  Shoulder: { enchant: "amirdrassils_grace_2" },
  MainHand: { enchant_id: "8039" },
}) {
  return {
    candidateId: "mage-frost-source",
    generatorFile: "MID2_Generate_Mage.simc",
    sourceProfileName: "MID2_Mage_Frost",
    generatorSha256: "a".repeat(64),
    slots,
  };
}

test("guide order is converted into proportional seed weights", () => {
  assert.deepEqual(guideWeights({ secondaries: ["Mast", "Crit", "Haste", "Vers"] }),
    { Crit: 0.75, Haste: 0.5, Mast: 1, Vers: 0.25 });
});

test("curated gear chooses exactly four Catalyst-aware tier slots on one legal setup", () => {
  const data = fixture();
  const gear = buildCuratedGear({ ...data, priority: data.spec.statPriority,
    weaponLoadoutId: "two-hand", enhancementSource: enhancementSource() });
  assert.equal(gear.tierPieces, 4);
  assert.equal(gear.redirectedBaseItemIds.length, 4);
  assert.equal(new Set(gear.redirectedBaseItemIds).size, 4);
  assert.equal(gear.tertiaryRatingsPresent, false);
  assert.match(gear.lines.join("\n"), /redirected_base_stats=200/);
  assert.match(gear.lines.join("\n"), /main_hand=caster_staff,id=219,ilevel=334/);
  assert.match(gear.lines.join("\n"), /^head=.*gem_id=240983$/m);
  assert.match(gear.lines.join("\n"), /^shoulders=.*enchant=amirdrassils_grace_2$/m);
  assert.match(gear.lines.join("\n"), /^main_hand=.*enchant_id=8039$/m);
  assert.doesNotMatch(gear.lines.join("\n"), /bonus_id|off_hand=/);
  assert(gear.items.some((entry) => Object.keys(entry.enhancements).length));
  assert(gear.items.every((entry) => entry.enhancementSource.candidateId === "mage-frost-source"));
  assert.match(gear.gearPlanSha256, /^[a-f0-9]{64}$/);
});

test("one catalog-pinned enhancement source is transferred identically and changes the gear hash", () => {
  const data = fixture();
  const common = { ...data, priority: data.spec.statPriority, weaponLoadoutId: "two-hand" };
  const first = buildCuratedGear({ ...common, enhancementSource: enhancementSource() });
  const repeated = buildCuratedGear({ ...common, enhancementSource: enhancementSource() });
  const changed = buildCuratedGear({ ...common, enhancementSource: enhancementSource({
    Head: { gem_id: "240967" }, Shoulder: { enchant: "amirdrassils_grace_2" },
    MainHand: { enchant_id: "8039" },
  }) });
  assert.deepEqual(first.lines, repeated.lines);
  assert.equal(first.gearPlanSha256, repeated.gearPlanSha256);
  assert.notEqual(first.gearPlanSha256, changed.gearPlanSha256);
  assert.deepEqual(first.items.map(({ slot, id }) => ({ slot, id })),
    changed.items.map(({ slot, id }) => ({ slot, id })));
});

test("actor permanent enhancements normalize slots and reject empty, conflicting, or unsafe maps", () => {
  const generator = [
    'mage="MID2_Mage_Frost"', "race=troll", "talents=ABC123",
    "head=old,id=1,gem_id=240983", "shoulders=old,id=2,enchant=amirdrassils_grace_2",
    "main_hand=old,id=3,enchant_id=8039", "save=old.simc",
  ].join("\n");
  assert.deepEqual(extractPermanentEnhancements(generator, "MID2_Mage_Frost"), {
    Head: { gem_id: "240983" },
    Shoulder: { enchant: "amirdrassils_grace_2" },
    MainHand: { enchant_id: "8039" },
  });
  assert.throws(() => extractPermanentEnhancements(
    'mage="MID2_Mage_Frost"\nrace=troll\ntalents=ABC\nhead=old,id=1\nsave=x.simc',
    "MID2_Mage_Frost"), /enhancement map is empty/);
  assert.throws(() => extractPermanentEnhancements(
    'mage="MID2_Mage_Frost"\nrace=troll\ntalents=ABC\nhead=x,id=1,enchant=foo,enchant_id=2\nsave=x.simc',
    "MID2_Mage_Frost"), /conflicts between enchant and enchant_id/);
  assert.throws(() => extractPermanentEnhancements(
    'mage="MID2_Mage_Frost"\nrace=troll\ntalents=ABC\nhead=x,id=1,gem_id=1\/..\nsave=x.simc',
    "MID2_Mage_Frost"), /unsafe gem_id/);
});

test("reviewed enhancement and official talent pins bind to catalog candidates", () => {
  const generatorText = [
    'mage="MID2_Mage_Frost"', "race=troll", "talents=ABC123",
    "head=old,id=1,gem_id=240983", "save=old.simc",
  ].join("\n");
  const candidate = {
    candidateId: "mage-frost-source", sourceProfileName: "MID2_Mage_Frost",
    generatorFile: "MID2_Generate_Mage.simc", talentSourceMode: "official-generator",
    talents: "ABC123",
  };
  const logical = {
    profileId: "mage-frost-general", enhancementSourceCandidateId: candidate.candidateId,
    candidates: [candidate], enhancementPlan: {
      sourceCandidateId: candidate.candidateId, generatorFile: candidate.generatorFile,
      sourceProfileName: candidate.sourceProfileName, generatorSha256: "a".repeat(64),
      slots: { Head: { gem_id: "240983" } },
    },
  };
  assert.equal(catalogEnhancementCandidate(logical), candidate);
  assert.equal(extractActorTalents(generatorText, candidate.sourceProfileName), "ABC123");
  assert.equal(pinnedCandidateTalents(generatorText, candidate), "ABC123");
  assert.deepEqual(reviewedEnhancementSource(logical, candidate, {
    text: generatorText, sha256: "a".repeat(64),
  }).slots, logical.enhancementPlan.slots);
  assert.throws(() => catalogEnhancementCandidate({ ...logical,
    enhancementSourceCandidateId: "mage-frost-missing" }), /not in its catalog candidates/);
  assert.throws(() => pinnedCandidateTalents(generatorText, { ...candidate, talents: "DIFFERENT" }),
    /differ from its pinned official generator actor/);
  assert.throws(() => reviewedEnhancementSource({ ...logical, enhancementPlan: {
    ...logical.enhancementPlan, slots: { Head: { gem_id: "240967" } },
  } }, candidate, { text: generatorText, sha256: "a".repeat(64) }),
  /reviewed enhancement map differs/);
});

test("selected Catalyst allocation-source tertiaries are retained and hashed", () => {
  const data = fixture();
  const base = buildCuratedGear({ ...data, priority: data.spec.statPriority,
    weaponLoadoutId: "two-hand", enhancementSource: enhancementSource() });
  data.allocations.items["200"] = {
    allocations: { Haste: 70, Mast: 30 },
    tertiaries: ["Avoidance"], tertiaryRatings: { Avoidance: 42 },
  };
  const tertiary = buildCuratedGear({ ...data, priority: data.spec.statPriority,
    weaponLoadoutId: "two-hand", enhancementSource: enhancementSource() });
  const head = tertiary.items.find((entry) => entry.slot === "Head");
  assert.deepEqual(head.tertiaries, ["Avoidance"]);
  assert.deepEqual(head.tertiaryRatings, { Avoidance: 42 });
  assert.equal(tertiary.tertiaryRatingsPresent, true);
  assert.notEqual(tertiary.gearPlanSha256, base.gearPlanSha256);
  assert.match(tertiary.lines.join("\n"), /redirected_base_stats=200/);
});

test("v2 catalog pins every talent, actor projection, enhancement, profile, and selection id", async () => {
  const catalog = JSON.parse(await readFile(new URL("../data/simc-curation-catalog.json",
    import.meta.url), "utf8"));
  const candidates = catalog.logicalProfiles.flatMap((logical) => logical.candidates);
  assert.equal(catalog.defaultCurationPolicyId, "midnight-s2-raid-catalyst-v2");
  assert.equal(catalog.logicalProfiles.length, 26);
  assert.equal(candidates.length, 44);
  assert.equal(new Set(candidates.map((candidate) => candidate.profileFile)).size, 44);
  assert(candidates.every((candidate) => /_Enhanced\.simc$/.test(candidate.profileFile)
    && /^[A-Za-z0-9+/=]+$/.test(candidate.talents)
    && /^[a-f0-9]{64}$/.test(candidate.actorProjectionSha256)));
  for (const logical of catalog.logicalProfiles) {
    assert.equal(catalogEnhancementCandidate(logical).candidateId,
      logical.enhancementPlan.sourceCandidateId);
    assert(Object.keys(logical.enhancementPlan.slots).length > 0);
    assert.match(logical.expectedGearPlanSha256, /^[a-f0-9]{64}$/);
    const reportId = curatedSelectionReportId(logical.curationPolicyId, logical.profileId,
      "raid-st", logical.candidates[0].candidateId);
    assert.match(reportId, /^[a-z0-9-]+-selection$/);
    assert(reportId.startsWith("midnight-s2-raid-catalyst-v2-"));
  }
});

test("actor extraction handles nested commented generators and replaces only reviewed inputs", () => {
  const generator = [
    '# # mage="MID2_Mage_Frost_Test"',
    "# # level=90",
    "# # race=troll",
    "# # spec=frost",
    "# # role=spell",
    "# # talents=OLD",
    "# # flask=old_flask",
    "",
    "# # head=old_head,id=1",
    '# # save="old.simc"',
  ].join("\n");
  const seed = extractActorSeed(generator, "MID2_Mage_Frost_Test", {
    talents: "CURRENT",
    race: "void_elf",
    level: 90,
    actorName: "MID2_Curated_Mage_Frost_Test",
    gearLines: ["head=new_head,id=2,ilevel=334"],
    profileFile: "MID2_Mage_Frost_Test_Curated.simc",
    provenanceComments: ["Curated test"],
  });
  assert.match(seed, /^# Curated test/m);
  assert.match(seed, /mage="MID2_Curated_Mage_Frost_Test"/);
  assert.match(seed, /^level=90$/m);
  assert.match(seed, /^race=void_elf$/m);
  assert.match(seed, /^talents=CURRENT$/m);
  assert.match(seed, /^head=new_head,id=2,ilevel=334$/m);
  assert.match(seed, /^save=MID2_Mage_Frost_Test_Curated\.simc$/m);
  assert.doesNotMatch(seed, /OLD|old_flask|old_head|old\.simc/);
});

test("bundle sealing makes retained curation provenance part of the profile hash", async () => {
  const root = await mkdtemp(join(tmpdir(), "simc-curator-seal-"));
  try {
    const profileRoot = join(root, "profiles");
    await mkdir(profileRoot);
    const profilePath = join(profileRoot, "Curated.simc");
    const original = Buffer.from('mage="MID2_Curated_Test"\nspec=frost\ntalents=TEST\n');
    await writeFile(profilePath, original);
    const candidate = {
      profileFile: "Curated.simc", profilePath,
      profileSha256: createHash("sha256").update(original).digest("hex"),
      gearSetId: "policy-profile", generatorActorName: "MID2_Mage_Frost",
      generatorSource: "https://example.com/MID2_Generate_Mage.simc",
      generatorSha256: "1".repeat(64), talentSource: "https://example.com/talents",
      gearPlanSha256: "2".repeat(64),
    };
    const bundlePath = join(root, "bundle.json");
    await writeFile(bundlePath, `${JSON.stringify({ schemaVersion: 1, profiles: [{
      scenarios: [{ candidates: [candidate] }, { candidates: [{ ...candidate }] }],
    }] }, null, 2)}\n`);
    assert.deepEqual(await sealBundleProfiles(bundlePath), { bundle: bundlePath, profiles: 1 });
    const sealed = await readFile(profilePath, "utf8");
    assert.match(sealed, /^# Curated same-gear profile: policy-profile/m);
    assert.match(sealed, /^# Upstream actor name: MID2_Mage_Frost/m);
    const bundle = JSON.parse(await readFile(bundlePath, "utf8"));
    const expectedHash = createHash("sha256").update(Buffer.from(sealed)).digest("hex");
    assert.equal(bundle.profiles[0].scenarios[0].candidates[0].profileSha256, expectedHash);
    assert.equal(bundle.profiles[0].scenarios[1].candidates[0].profileSha256, expectedHash);
    await sealBundleProfiles(bundlePath);
    assert.equal(await readFile(profilePath, "utf8"), sealed);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("bundle sealing rejects a profile path outside its profiles directory", async () => {
  const root = await mkdtemp(join(tmpdir(), "simc-curator-seal-escape-"));
  try {
    await mkdir(join(root, "profiles"));
    const victimPath = join(root, "Victim.simc");
    const original = Buffer.from('mage="MID2_Curated_Test"\n');
    await writeFile(victimPath, original);
    const candidate = {
      profileFile: "Victim.simc", profilePath: victimPath,
      profileSha256: createHash("sha256").update(original).digest("hex"),
      gearSetId: "policy-profile", generatorActorName: "MID2_Mage_Frost",
      generatorSource: "https://example.com/MID2_Generate_Mage.simc",
      generatorSha256: "1".repeat(64), talentSource: "https://example.com/talents",
      gearPlanSha256: "2".repeat(64),
    };
    const bundlePath = join(root, "bundle.json");
    await writeFile(bundlePath, `${JSON.stringify({ schemaVersion: 1, profiles: [{
      scenarios: [{ candidates: [candidate] }],
    }] }, null, 2)}\n`);
    await assert.rejects(() => sealBundleProfiles(bundlePath), /outside the bundle profiles directory/);
    assert.deepEqual(await readFile(victimPath), original);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
