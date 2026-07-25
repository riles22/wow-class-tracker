import { test } from "node:test";
import assert from "node:assert/strict";
import { applyCommunityOverrides } from "../src/apply-community-overrides.mjs";

test("cross-class creators expand only into their declared class/spec scopes", () => {
  const community = {
    verified: "2026-07-01",
    classes: [
      { class: "Druid", creators: [{ name: "Existing" }] },
      { class: "Priest", creators: [] },
      { class: "Mage", creators: [] }
    ]
  };
  const registry = {
    creators: [{
      name: "Healer Expert",
      url: "https://www.youtube.com/@example",
      verifiedDate: "2026-07-16",
      scopes: [
        { class: "Druid", specs: ["Restoration"] },
        { class: "Priest", specs: ["Discipline", "Holy"] }
      ]
    }]
  };

  const result = applyCommunityOverrides(community, registry);
  assert.deepEqual(result.classes[0].creators.at(-1).specs, ["Restoration"]);
  assert.deepEqual(result.classes[1].creators.at(-1).specs, ["Discipline", "Holy"]);
  assert.equal(result.classes[2].creators.length, 0);
  assert.equal(result.verified, "2026-07-16");
  assert.equal(community.classes[0].creators.length, 1, "input must not be mutated");
});

test("invalid class scopes fail instead of silently dropping authority", () => {
  const community = { classes: [{ class: "Druid", creators: [] }] };
  const registry = {
    creators: [{
      name: "Healer Expert",
      url: "https://www.youtube.com/@example",
      scopes: [{ class: "Unknown", specs: ["Restoration"] }]
    }]
  };
  assert.throws(() => applyCommunityOverrides(community, registry), /unknown class/);
});

test("removing a scope RETRACTS the injected creator (audit 2026-07-24, C8)", () => {
  const community = { classes: [
    { class: "Rogue", creators: [{ name: "HandCurated", url: "https://youtube.com/@hand", credential: "kept" }] },
    { class: "Mage", creators: [] },
  ] };
  const registry = { creators: [
    { name: "Injected", url: "https://youtube.com/@inj", credential: "c",
      scopes: [{ class: "Rogue", specs: ["Outlaw"] }, { class: "Mage", specs: ["Frost"] }] },
  ] };

  const first = applyCommunityOverrides(community, registry);
  const names = c => first.classes.find(x => x.class === c).creators.map(x => x.name);
  assert.deepEqual(names("Rogue").sort(), ["HandCurated", "Injected"]);
  assert.deepEqual(names("Mage"), ["Injected"]);
  // injected entries are marked so a later run can tell them from hand-curated ones
  assert.equal(first.classes[0].creators.find(c => c.name === "Injected").managedBy, "overrides");
  assert.equal(first.classes[0].creators.find(c => c.name === "HandCurated").managedBy, undefined);

  // Narrow the registry to Rogue only, then re-apply to the PREVIOUS OUTPUT — which is
  // what the nightly does, since community.json carries the last run's injections.
  const narrowed = { creators: [{ ...registry.creators[0], scopes: [{ class: "Rogue", specs: ["Outlaw"] }] }] };
  const second = applyCommunityOverrides(first, narrowed);
  const names2 = c => second.classes.find(x => x.class === c).creators.map(x => x.name);
  assert.deepEqual(names2("Mage"), [], "dropping a scope must retract the creator, not strand it");
  assert.deepEqual(names2("Rogue").sort(), ["HandCurated", "Injected"]);

  // …and deleting the registry entry entirely retracts everywhere, without touching
  // the hand-curated creator that was never ours to manage.
  const third = applyCommunityOverrides(second, { creators: [] });
  assert.deepEqual(third.classes.find(x => x.class === "Rogue").creators.map(c => c.name), ["HandCurated"]);
});
