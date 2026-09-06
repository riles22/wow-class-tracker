import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, rm, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:http";
import { runGuideHarvest } from "../src/lib-guide-runner.mjs";
import { buildGuidePayload, fetchText, fetchTextCurl } from "../src/lib-guides.mjs";

const json = async path => JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), "utf8"));
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), "guide-runner-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  t.mock.method(console, "log", () => {});
  t.mock.method(console, "error", () => {});
  const specs = [{ spec: "Frost", class: "Mage" }, { spec: "Holy", class: "Paladin" }];
  const guide = await json("data/guides/icyveins.json");
  guide.specs = Object.fromEntries(specs.map(s => {
    const key = `${s.spec} ${s.class}`;
    const record = structuredClone(guide.specs[key]);
    delete record.verifiedAt; // This fixture deliberately represents a pre-receipt source.
    return [key, record];
  }));
  guide.harvestedAt = "2026-08-01";
  guide.coverage = { specsHarvested: 2, specsAbsent: [] };
  const path = join(root, "data", "guides", "icyveins.json");
  await mkdir(join(root, "data", "guides"), { recursive: true });
  await writeFile(path, JSON.stringify(guide, null, 2) + "\n");
  const trackerPath = join(root, "tracker.json");
  await writeFile(trackerPath, JSON.stringify(specs));
  for (const file of ["raid-items.json", "dungeon-items.json"])
    await writeFile(join(root, "data", file), "{}");
  const bytes = await readFile(path, "utf8");
  return { root, path, specs, guide, bytes,
    read: async () => JSON.parse(await readFile(path, "utf8")),
    run: opts => runGuideHarvest({ sourceId: "icyveins", sourceName: "Icy Veins", dated: true,
      root, trackerPath, args: [], today: "2026-09-04", ...opts }) };
}

test("guide resume with no fetch leaves exact original bytes and dates", async t => {
  const f = await fixture(t);
  let calls = 0;
  await f.run({ harvestSpec: async () => { calls++; throw new Error("must not fetch"); } });
  assert.equal(calls, 0);
  assert.equal(await readFile(f.path, "utf8"), f.bytes);
  await assert.rejects(access(join(f.root, ".guide-work", "icyveins.json")), { code: "ENOENT" });
});

test("failed forced harvest preserves downstream candidates and reports retrieval failures, never absences", async t => {
  const f = await fixture(t);
  const before = buildGuidePayload({ icyveins: f.guide }, f.specs);
  await assert.rejects(f.run({ args: ["--force"], harvestSpec: async () => { throw new Error("HTTP 403"); } }),
    /2 spec retrievals failed; published source unchanged/);
  assert.equal(await readFile(f.path, "utf8"), f.bytes);
  assert.deepEqual(buildGuidePayload({ icyveins: await f.read() }, f.specs), before);
  const stage = JSON.parse(await readFile(join(f.root, ".guide-work", "icyveins.json"), "utf8"));
  assert.deepEqual(stage.verified, {});
  assert.equal(Object.keys(stage.failures).length, 2);
  assert.equal(stage.failures["Frost Mage"].reason, "HTTP 403");
});

test("partial forced failure stages success, resumes only failed specs, and retains mixed-age verification", async t => {
  const f = await fixture(t);
  const before = buildGuidePayload({ icyveins: f.guide }, f.specs);
  await assert.rejects(f.run({ args: ["--force"], harvestSpec: async s => {
    if (s.class === "Paladin") throw new Error("timeout");
    return structuredClone(f.guide.specs[`${s.spec} ${s.class}`]);
  } }), /1 spec retrievals failed/);
  assert.equal(await readFile(f.path, "utf8"), f.bytes);
  assert.deepEqual(buildGuidePayload({ icyveins: await f.read() }, f.specs), before);
  const fetched = [];
  await f.run({ args: ["--force"], today: "2026-09-05", harvestSpec: async s => {
    const key = `${s.spec} ${s.class}`;
    fetched.push(key);
    return structuredClone(f.guide.specs[key]);
  } });
  const out = await f.read();
  assert.deepEqual(fetched, ["Holy Paladin"]);
  assert.equal(out.specs["Frost Mage"].verifiedAt, "2026-09-04");
  assert.equal(out.specs["Holy Paladin"].verifiedAt, "2026-09-05");
  assert.equal(out.harvestedAt, "2026-09-04");
  assert.deepEqual(buildGuidePayload({ icyveins: out }, f.specs).specs, before.specs);
  await assert.rejects(access(join(f.root, ".guide-work", "icyveins.json")), { code: "ENOENT" });
});

test("single-spec verification cannot advance the whole source, and publication dates are independent", async t => {
  const f = await fixture(t);
  await f.run({ args: ["--spec", "Frost Mage"], harvestSpec: async () => structuredClone(f.guide.specs["Frost Mage"]) });
  const out = await f.read();
  assert.equal(out.harvestedAt, "2026-08-01");
  assert.equal(out.specs["Frost Mage"].verifiedAt, "2026-09-04");
  assert.equal(out.specs["Holy Paladin"].verifiedAt, "2026-08-01");
  assert.equal(out.specs["Frost Mage"].published, f.guide.specs["Frost Mage"].published);
});

test("verified absence replaces only that observation; malformed parses never promote", async t => {
  const f = await fixture(t);
  await assert.rejects(f.run({ args: ["--spec", "Frost Mage"], harvestSpec: async () => ({ priorities: [], bis: [] }) }),
    /1 spec retrievals failed/);
  assert.equal(await readFile(f.path, "utf8"), f.bytes);
  await f.run({ args: ["--spec", "Frost Mage"], harvestSpec: async () => null });
  const out = await f.read();
  assert.equal(out.specs["Frost Mage"], undefined);
  assert.equal(out.coverage.specsAbsent[0].verifiedAt, "2026-09-04");
  assert.match(out.coverage.specsAbsent[0].reason, /verified fetch/);
  assert.equal(out.harvestedAt, "2026-08-01");
  assert.doesNotThrow(() => buildGuidePayload({ icyveins: out, other: f.guide }, f.specs));
});

test("single-spec refresh preserves unverified legacy reasons and retries them without claiming freshness", async t => {
  const f = await fixture(t);
  const legacy = structuredClone(f.guide);
  delete legacy.specs["Holy Paladin"];
  legacy.coverage = { specsHarvested: 1, specsAbsent: [{ spec: "Holy Paladin", reason: "HTTP 403" }] };
  await writeFile(f.path, JSON.stringify(legacy));
  await f.run({ args: ["--spec", "Frost Mage"], harvestSpec: async () => structuredClone(f.guide.specs["Frost Mage"]) });
  const partial = await f.read();
  assert.equal(partial.harvestedAt, null);
  assert.deepEqual(partial.coverage.specsAbsent, []);
  assert.deepEqual(partial.coverage.specsPending, [{ spec: "Holy Paladin", reason: "HTTP 403" }]);
  const fetched = [];
  await f.run({ today: "2026-09-05", harvestSpec: async s => {
    const key = `${s.spec} ${s.class}`;
    fetched.push(key);
    return structuredClone(f.guide.specs[key]);
  } });
  const completed = await f.read();
  assert.deepEqual(fetched, ["Holy Paladin"]);
  assert.equal(completed.harvestedAt, "2026-09-04");
  assert.equal(completed.coverage.specsPending, undefined);
});

test("first-run single-spec harvest keeps never-attempted coverage pending and source date null", async t => {
  const f = await fixture(t);
  await rm(f.path);
  await f.run({ args: ["--spec", "Frost Mage"], harvestSpec: async () => structuredClone(f.guide.specs["Frost Mage"]) });
  const out = await f.read();
  assert.equal(out.harvestedAt, null);
  assert.deepEqual(out.coverage.specsAbsent, []);
  assert.equal(out.coverage.specsPending[0].spec, "Holy Paladin");
  assert.match(out.coverage.specsPending[0].reason, /not been verified/);
});

test("fetch transports distinguish origin 404 from HTTP errors and timeouts", async t => {
  const server = createServer((req, res) => {
    if (req.url === "/slow") return;
    res.statusCode = req.url === "/missing" ? 404 : req.url === "/blocked" ? 403 : 200;
    res.end("guide body ".repeat(200));
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  t.after(() => { server.closeAllConnections(); server.close(); });
  const base = `http://127.0.0.1:${server.address().port}`;
  for (const fetcher of [fetchText, fetchTextCurl]) {
    const opts = { tries: 1, delayMs: 0 };
    assert.equal(await fetcher(`${base}/missing`, opts), null);
    await assert.rejects(fetcher(`${base}/blocked`, opts), /HTTP 403/);
    assert.match(await fetcher(`${base}/ok`, opts), /^guide body/);
    await assert.rejects(fetcher(`${base}/slow`, { ...opts, timeoutMs: fetcher === fetchText ? 20 : 0.02 }), /fetch failed/);
  }
});

test("repeated transport refusals stop early and never replace the published guide", async t => {
  const f = await fixture(t);
  await writeFile(join(f.root,"tracker.json"), JSON.stringify([...f.specs,
    {spec:"Arcane",class:"Mage"},{spec:"Fire",class:"Mage"}]));
  let calls = 0;
  await assert.rejects(f.run({ args:["--force"], harvestSpec: async()=>{
    calls++; throw new Error("HTTP 429 Too Many Requests");
  } }), /stopped after three consecutive transport failures/);
  assert.equal(calls,3);
  assert.equal(await readFile(f.path,"utf8"),f.bytes);
  const staging = JSON.parse(await readFile(join(f.root,".guide-work","icyveins.json"),"utf8"));
  assert.equal(Object.keys(staging.failures).length,3);
  assert.deepEqual(staging.verified,{});
});
