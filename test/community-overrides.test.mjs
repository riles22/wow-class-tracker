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
