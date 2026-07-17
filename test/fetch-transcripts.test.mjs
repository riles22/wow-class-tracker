import { test } from "node:test";
import assert from "node:assert/strict";
import { VALID_ID, chunksOf, statusOf, verdictOf, PER_RUN_CAP } from "../src/fetch-transcripts.mjs";

/* The deterministic transcript stage's pure logic — the id gate is a security
   boundary (queue ids are agent-written and reach the request URL), and the
   verdict mapping drives what the agents put in the manifest. */

test("VALID_ID accepts real YouTube ids and rejects anything URL-shaped", () => {
  assert.ok(VALID_ID.test("Rmkxzb1QQSQ"));
  assert.ok(VALID_ID.test("vK-qyvXOVYM"));
  assert.ok(!VALID_ID.test("short"));
  assert.ok(!VALID_ID.test("https://evil"));
  assert.ok(!VALID_ID.test("abc/def&x=1"));
  assert.ok(!VALID_ID.test("aaaaaaaaaaaa")); // 12 chars
});

test("chunksOf normalizes timestamped content and rejects unusable shapes", () => {
  const good = chunksOf({ content: [
    { text: "hello", offset: 0, duration: 1200, lang: "en" },
    { text: "world", offset: 1200, duration: 900 },
    { text: "   ", offset: 2100, duration: 1 },          // blank dropped
    { text: "late", offset: "nan", duration: 5 },        // non-finite offset dropped
  ]});
  assert.deepEqual(good, [
    { text: "hello", offset: 0, duration: 1200 },
    { text: "world", offset: 1200, duration: 900 },
  ]);
  assert.equal(chunksOf({ content: "plain text mode" }), null); // text=true shape
  assert.equal(chunksOf({ content: [] }), null);
  assert.equal(chunksOf({ jobId: "job_123" }), null);           // async job shape
  assert.equal(chunksOf(null), null);
});

test("statusOf maps credential and limit failures to stop-early", () => {
  assert.deepEqual(statusOf(200, {}), { status: "fetched", stop: false });
  assert.deepEqual(statusOf(401, null), { status: "unauthorized", stop: true });
  assert.deepEqual(statusOf(403, { error: "unauthorized" }), { status: "unauthorized", stop: true });
  assert.deepEqual(statusOf(429, null), { status: "limit-exceeded", stop: true });
  assert.deepEqual(statusOf(402, { error: "limit-exceeded" }), { status: "limit-exceeded", stop: true });
  assert.deepEqual(statusOf(404, { error: "transcript-unavailable" }), { status: "unavailable", stop: false });
  assert.deepEqual(statusOf(0, { error: "network" }), { status: "network-failed", stop: false });
  assert.equal(statusOf(500, { error: "internal-error" }).status, "error:internal-error");
});

test("verdictOf: missing key wins, then credential problems, then all-network, else ok", () => {
  assert.equal(verdictOf({}, false), "no-credentials");
  assert.equal(verdictOf({ a: "fetched:10", b: "unauthorized" }, true), "unauthorized");
  assert.equal(verdictOf({ a: "fetched:10", b: "limit-exceeded" }, true), "limit-exceeded");
  assert.equal(verdictOf({ a: "network-failed", b: "network-failed" }, true), "network-failed");
  assert.equal(verdictOf({ a: "fetched:10", b: "unavailable", c: "network-failed" }, true), "ok");
  assert.equal(verdictOf({}, true), "ok"); // empty queue with a key is a clean run
});

test("per-run cap stays inside the free-tier monthly budget", () => {
  assert.ok(PER_RUN_CAP <= 25, "cap must respect the 100-req/month free tier");
});
