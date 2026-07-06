import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, cp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { applyRatings } from "../src/apply-ratings.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let root;

before(async () => {
  root = await mkdtemp(path.join(tmpdir(), "tracker-ratings-"));
  await cp(path.join(ROOT, "data"), path.join(root, "data"), { recursive: true });
});
after(async () => { await rm(root, { recursive: true, force: true }); });

const specsPath = () => path.join(root, "data", "specs.json");
const input = async rows => {
  const p = path.join(root, "ratings.json");
  await writeFile(p, JSON.stringify(rows));
  return p;
};

test("an unmatched ratings row refuses the merge and leaves specs.json untouched", async () => {
  const before_ = await readFile(specsPath(), "utf8");
  const p = await input([
    { class: "Rogue", spec: "Outlaw", bracket: "raid", source: "icyveins", tier: "A" },
    { class: "Mage", spec: "Chronomancer", bracket: "raid", source: "icyveins", tier: "S" } // not a spec
  ]);
  await assert.rejects(applyRatings(p, root), /did not match any spec — nothing written/);
  assert.equal(await readFile(specsPath(), "utf8"), before_);
});

test("a tier outside the source's scale fails validation and writes nothing", async () => {
  const before_ = await readFile(specsPath(), "utf8");
  const p = await input([{ class: "Rogue", spec: "Outlaw", bracket: "raid", source: "icyveins", tier: "SS" }]);
  await assert.rejects(applyRatings(p, root), /failed validation — nothing written/);
  assert.equal(await readFile(specsPath(), "utf8"), before_);
});

test("a valid row lands in ratings[bracket][source], creating the path as needed", async () => {
  const p = await input([{ class: "Rogue", spec: "Outlaw", bracket: "mplus", source: "icyveins", tier: "B" }]);
  const result = await applyRatings(p, root);
  assert.equal(result.applied, 1);
  const specs = JSON.parse(await readFile(specsPath(), "utf8"));
  assert.equal(specs.find(s => s.class === "Rogue" && s.spec === "Outlaw").ratings.mplus.icyveins, "B");
});
