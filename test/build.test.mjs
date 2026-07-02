import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { build } from "../src/build.mjs";
import { buildPayload } from "../src/render.mjs";
import { loadData } from "../src/validate.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("build produces a self-contained dist/index.html", async () => {
  const result = await build(ROOT);
  const html = await readFile(result.outPath, "utf8");

  assert.equal(result.specCount, 40);
  assert.ok(html.includes("Curse of Ula'tek"));
  assert.ok(!html.includes("__DATA_JSON__"), "placeholder must be replaced");
  // Spot-check that data made it in:
  for (const name of ["Outlaw", "Devourer", "Mistweaver", "Beast Mastery"]) {
    assert.ok(html.includes(name), `missing spec ${name}`);
  }
  // Script-injection safety: the payload must not contain a raw "<".
  const payloadLine = html.split("\n").find(l => l.includes("const DATA ="));
  assert.ok(payloadLine, "DATA constant missing");
  assert.ok(!payloadLine.slice(payloadLine.indexOf("=")).includes("</"), "payload must escape < characters");
});

test("payload decorates every spec with consensus for both brackets", async () => {
  const data = await loadData(ROOT);
  const payload = buildPayload(data);
  assert.equal(payload.specs.length, data.specs.length);
  for (const spec of payload.specs) {
    assert.ok("raid" in spec.consensus && "mplus" in spec.consensus, `${spec.spec}: consensus missing`);
    // Rated brackets produce a consensus object; fully unrated ones produce null.
    const rated = Object.values(spec.ratings?.raid ?? {}).some(t => t != null);
    assert.equal(spec.consensus.raid !== null, rated, `${spec.class} ${spec.spec} raid consensus mismatch`);
  }
  assert.equal(payload.meta.specCount, 40);
  assert.equal(payload.meta.trackedCount, data.specs.filter(s => s.ptr).length);
  assert.ok(payload.meta.latestSnapshot >= "2026-06-15");
});
