import { test } from "node:test";
import assert from "node:assert/strict";
import { VALID_ID, chunksOf, statusOf, verdictOf, PER_RUN_CAP, fetchOne, collectBatch } from "../src/fetch-transcripts.mjs";
import { newState, prepareBatch, usageOf, recordOutcome, finishBatch, validateState, requestBudget } from '../src/transcript-state.mjs';
import { locateState } from '../src/restore-transcript-state.mjs';

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
  // 403 without Supadata's JSON envelope = egress/proxy block, never a key verdict
  assert.deepEqual(statusOf(403, null), { status: "blocked-403", stop: true });
  assert.deepEqual(statusOf(429, null), { status: "limit-exceeded", stop: true });
  assert.deepEqual(statusOf(402, null), { status: "limit-exceeded", stop: true });
  assert.deepEqual(statusOf(402, { error: "limit-exceeded" }), { status: "limit-exceeded", stop: true });
  assert.deepEqual(statusOf(404, { error: "transcript-unavailable" }), { status: "unavailable", stop: false });
  assert.deepEqual(statusOf(0, { error: "network" }), { status: "network-failed", stop: false });
  assert.equal(statusOf(500, { error: "internal-error" }).status, "error:500");
});

test("verdictOf: missing key wins, then credential problems, then all-network, else ok", () => {
  assert.equal(verdictOf({}, false), "no-credentials");
  assert.equal(verdictOf({ a: "fetched:10", b: "unauthorized" }, true), "unauthorized");
  assert.equal(verdictOf({ a: "fetched:10", b: "limit-exceeded" }, true), "limit-exceeded");
  assert.equal(verdictOf({ a: "network-failed", b: "network-failed" }, true), "network-failed");
  assert.equal(verdictOf({ a: "blocked-403" }, true), "network-failed"); // proxy 403 ≠ bad key
  assert.equal(verdictOf({ a: "fetched:10", b: "unavailable", c: "network-failed" }, true), "ok");
  assert.equal(verdictOf({}, true), "ok"); // empty queue with a key is a clean run
});

test("per-run cap remains25 without assuming the provider's billing plan", () => {
  assert.equal(PER_RUN_CAP, 25);
  assert.equal(requestBudget(''), null);
  assert.equal(requestBudget('0'), 0);
  assert.equal(requestBudget('100'), 100);
  assert.throws(() => requestBudget('100 calls'));
});

const NOW = Date.parse('2026-09-06T00:00:00.000Z');
const VIDEO = 'Rmkxzb1QQSQ', VIDEO2 = 'vK-qyvXOVYM';
const queue = [{ id: VIDEO, creator: 'test', title: 'test video' }, { id: VIDEO2 }];
const response = (status, body, retryAfter = null) => ({ status, ok: status >= 200 && status < 300,
  json: async () => body, headers: { get: name => name === 'retry-after' ? retryAfter : null } });
const caption = { content: [{ text: 'Actual caption', offset: 0, duration: 500 }], lang: 'en' };
const prep = (state = newState(NOW), videos = queue, options = {}) => prepareBatch(state, videos,
  { now: NOW, runKey: '1-1', ...options });

test('legacy queue migration preserves metadata, deduplicates IDs and rejects invalid IDs before reserving', () => {
  const { state, plan } = prep(undefined, [...queue, queue[0], { id: '../../secret' }, { id: 'constructor' }]);
  assert.deepEqual(plan.videoIds, [VIDEO, VIDEO2, 'constructor']);
  assert.equal(state.attempts.length, 3);
  assert.equal(plan.perVideo['../../secret'], 'invalid-id');
  assert.equal(usageOf(state, NOW).limit, null);
  assert.equal(queue[0].title, 'test video');
  assert.throws(() => validateState({ schemaVersion: 1 }), /invalid/i);
});

test('rolling allowance includes unresolved reservations and does not reset at a calendar month boundary', () => {
  const old = prep(undefined, [queue[0]], { now: NOW - 7 * 86400_000, runKey: 'older' }).state;
  const { state, plan } = prep(old, queue, { budget: 1 });
  assert.equal(state.videos[VIDEO].status, 'review-required');
  assert.equal(plan.videoIds.length, 0);
  assert.equal(plan.perVideo[VIDEO2], 'budget-deferred');
  assert.equal(usageOf(state, NOW, 1).countedRequests, 1);
  assert.equal(usageOf(state, NOW + 31 * 86400_000, 1).countedRequests, 0);
  assert.equal(prep(state, [queue[0]], { now: NOW + 31 * 86400_000 }).plan.perVideo[VIDEO], 'review-required');
});

test('successful transcript cache survives a failed publication without another provider request', async () => {
  const prepared = prep(undefined, [queue[0]]);
  let calls = 0, durable;
  const summary = await collectBatch({ ...prepared, queue, key: 'secret', now: () => NOW,
    fetchImpl: async (url, init) => {
      calls++;
      assert.match(url, /mode=native$/);
      assert.equal(init.headers['x-api-key'], 'secret');
      return response(200, caption);
    }, persist: async state => { durable = structuredClone(state); }, sleepImpl: async () => {} });
  assert.equal(summary.fetched, 1);
  assert.equal(durable.reservation, null);
  assert.equal(JSON.stringify(durable).includes('Actual caption'), false, 'artifact contains no plaintext captions');
  assert.equal(JSON.stringify(durable).includes('secret'), false, 'artifact contains no API key');
  const retry = prep(durable, [queue[0]], { now: NOW + 86400_000, runKey: 'next-run' });
  let restored;
  const cached = await collectBatch({ ...retry, queue, key: 'secret', now: () => NOW + 86400_000,
    fetchImpl: async () => { calls++; throw new Error('must not refetch'); },
    writeTranscript: async (_id, transcript) => { restored = transcript; } });
  assert.equal(calls, 1);
  assert.equal(cached.requested, 0);
  assert.equal(cached.cached, 1);
  assert.equal(restored.chunks[0].text, 'Actual caption');
  assert.equal(restored.fetchedAt, new Date(NOW).toISOString());
  assert.equal(Object.keys(prep(durable, []).state.cache).length, 0, 'published queue removal drops cached caption');
  const rotated = prep(durable, [queue[0]], { runKey: 'rotated-key' });
  const locked = await collectBatch({ ...rotated, queue, key: 'different-key', now: () => NOW,
    fetchImpl: async () => { throw new Error('must not buy a duplicate'); } });
  assert.equal(locked.requested, 0);
  assert.equal(locked.verdict, 'review-required');
  assert.ok(rotated.state.cache[VIDEO], 'recoverable encrypted caption retained');
});

test('missing credentials and early provider stop release only requests known not to have been sent', async () => {
  const absent = prep();
  const noKey = await collectBatch({ ...absent, queue, key: '', now: () => NOW });
  assert.equal(noKey.verdict, 'no-credentials');
  assert.equal(noKey.requested, 0);
  assert.equal(absent.state.attempts.length, 0);
  const prepared = prep();
  let calls = 0;
  const limited = await collectBatch({ ...prepared, queue, key: 'secret', now: () => NOW,
    fetchImpl: async () => { calls++; return response(429, { error: 'limit-exceeded' }, '172800'); } });
  assert.equal(calls, 1);
  assert.equal(limited.perVideo[VIDEO2], 'not-attempted');
  assert.equal(limited.usage.countedRequests, 1);
  assert.equal(prepared.state.provider.nextAttemptAt, new Date(NOW + 2 * 86400_000).toISOString());
  assert.equal(prep(prepared.state, queue, { now: NOW + 86400_000 }).plan.perVideo[VIDEO2], 'provider-cooldown');
});

test('unavailable captions back off across runs; ambiguous request outcomes require review', () => {
  let { state } = prep(undefined, [queue[0]]);
  recordOutcome(state, VIDEO, 'unavailable', { now: NOW });
  finishBatch(state, NOW);
  assert.equal(prep(state, [queue[0]], { now: NOW + 1000 }).plan.perVideo[VIDEO], 'retry-wait');
  ({ state } = prep(state, [queue[0]], { now: NOW + 86400_000, runKey: '2-1' }));
  recordOutcome(state, VIDEO, 'unavailable', { now: NOW + 86400_000 });
  finishBatch(state, NOW + 86400_000);
  assert.equal(state.videos[VIDEO].nextAttemptAt, new Date(NOW + 3 * 86400_000).toISOString());
  for (const status of ['request-timeout', 'network-failed', 'error:internal-error', 'async-deferred', 'empty']) {
    const p = prep(undefined, [queue[0]]);
    recordOutcome(p.state, VIDEO, status, { now: NOW });
    finishBatch(p.state, NOW);
    assert.equal(prep(p.state, [queue[0]], { now: NOW + 10 * 86400_000 }).plan.perVideo[VIDEO], 'review-required');
  }
});

test('operator retry approval releases only named review holds and preserves previous consumption', () => {
  const interrupted = prep().state;
  const reviewed = prep(interrupted, queue, { runKey: '2-1', retryIds: VIDEO });
  assert.deepEqual(reviewed.plan.videoIds, [VIDEO]);
  assert.equal(reviewed.plan.perVideo[VIDEO2], 'review-required');
  assert.equal(reviewed.state.videos[VIDEO].reviewedAt, new Date(NOW).toISOString());
  assert.equal(reviewed.state.attempts.length, 3, 'two uncertain calls plus the approved new reservation');
  assert.throws(() => prep(interrupted, queue, { retryIds: '../../file' }), /must identify/);
  assert.throws(() => prep(undefined, queue, { retryIds: VIDEO }), /currently held/);
});

test('unknown provider errors and transport details cannot echo the API key into public receipts', async () => {
  for (const networkFailure of [false, true]) {
    const prepared = prep(undefined, [queue[0]]);
    const secret = 'test-secret-never-persist';
    const summary = await collectBatch({ ...prepared, queue, key: secret, now: () => NOW,
      fetchImpl: async () => {
        if (networkFailure) throw new Error(`Proxy echoed ${secret}`);
        return response(500, { error: `Provider echoed ${secret}`, details: secret });
      } });
    assert.equal(summary.verdict, 'review-required');
    assert.equal(JSON.stringify({ summary, state: prepared.state }).includes(secret), false);
    assert.match(prepared.state.videos[VIDEO].reason, networkFailure ? /network-failed/ : /error:500/);
  }
});

test('request deadline covers a stalled connection and stalled response body without retries', async () => {
  for (const bodyStalls of [false, true]) {
    let calls = 0, signal;
    const outcome = await fetchOne(VIDEO, 'secret', { timeoutMs: 10, fetchImpl: async (_url, init) => {
      calls++; signal = init.signal;
      if (bodyStalls) return { status: 200, json: () => new Promise(() => {}) };
      return new Promise(() => {});
    } });
    assert.equal(outcome.timedOut, true);
    assert.equal(calls, 1);
    assert.equal(signal.aborted, true);
  }
});

test('stage deadline leaves unsent requests uncharged and partial local state holds interrupted requests', async () => {
  const prepared = prep();
  let clock = NOW, durable, calls = 0;
  const result = await collectBatch({ ...prepared, queue, key: 'secret', now: () => clock, runTimeoutMs: 100,
    fetchImpl: async () => { calls++; clock += 101; return response(200, caption); },
    persist: async state => { durable = structuredClone(state); }, sleepImpl: async () => {} });
  assert.equal(calls, 1);
  assert.equal(result.usage.countedRequests, 1);
  assert.equal(result.perVideo[VIDEO2], 'not-attempted');
  assert.ok(durable.cache[VIDEO]);
  const crashed = prep();
  await assert.rejects(() => collectBatch({ ...crashed, queue, key: 'secret', now: () => NOW,
    fetchImpl: async () => response(200, caption), persist: async () => { throw new Error('disk failed'); } }), /disk failed/);
  // The previously uploaded reservation still holds both requests conservatively.
  const recovered = prep(prep().state, queue, { runKey: '2-1' });
  assert.deepEqual(recovered.plan.videoIds, []);
  assert.equal(recovered.plan.perVideo[VIDEO], 'review-required');
  assert.equal(recovered.plan.perVideo[VIDEO2], 'review-required');
});

const trustedRun = { path: '.github/workflows/nightly.yml', head_branch: 'master', event: 'workflow_dispatch',
  repository: { full_name: 'owner/repo' }, head_repository: { full_name: 'owner/repo' }, conclusion: 'failure' };
function artifactFetch(artifacts, run = trustedRun) {
  return async url => url.includes('/actions/runs/') ? response(200, run)
    : response(200, { total_count: artifacts.filter(a => url.includes(`name=${a.name}&`)).length,
      artifacts: artifacts.filter(a => url.includes(`name=${a.name}&`)) });
}

test('restore chooses newest reservation even after failed publication and refuses stale fallback', async () => {
  const artifacts = [
    { id: 10, name: 'transcript-state-complete', workflow_run: { id: 3 }, expired: false },
    { id: 11, name: 'transcript-state-reserved', workflow_run: { id: 4 }, expired: false },
  ];
  const options = { repository: 'owner/repo', token: 'test', fetchImpl: artifactFetch(artifacts) };
  assert.deepEqual(await locateState(options), { found: true, initialize: false, artifact_id: 11, run_id: 4 });
  artifacts[1].expired = true;
  await assert.rejects(() => locateState(options), /expired/);
  artifacts[1].expired = false;
  await assert.rejects(() => locateState({ ...options, fetchImpl: artifactFetch(artifacts,
    { ...trustedRun, event: 'pull_request' }) }), /trusted master/);
});

test('restore requires explicit first-install initialization and never treats API failures as empty history', async () => {
  const options = { repository: 'owner/repo', token: 'test', fetchImpl: artifactFetch([]) };
  await assert.rejects(() => locateState(options), /explicit first-install/);
  assert.deepEqual(await locateState({ ...options, allowInitialize: true }), { found: false, initialize: true });
  await assert.rejects(() => locateState({ ...options, allowInitialize: true,
    fetchImpl: async () => response(403, null) }), /lookup failed/);
});
