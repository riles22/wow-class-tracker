import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, createHmac } from 'node:crypto';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { AUTH_DOMAIN, STATE_WORKFLOW, LEGACY_STATE_ARTIFACTS, signState, verifyState,
  verifyLegacyState, validateSigningKey, verifyRestoredState } from '../src/transcript-state-auth.mjs';

const key = 'a1'.repeat(32);
const context = { repository: 'riles22/wow-class-tracker', workflow: STATE_WORKFLOW,
  runId: '35000000001', runAttempt: '2', phase: 'reserved' };
const stateBytes = Buffer.from('{"attempts":[{"outcome":"review-required"}],"private":"do not log this state"}\n');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const expected = () => { const { runAttempt, ...rest } = context; return rest; };
const options = () => ({ stateBytes, context: expected(), artifactId: '10500000001', key });
const artifact = { id: 10500000001, name: 'transcript-state-reserved', expired: false,
  workflow_run: { id: 35000000001 }, created_at: '2026-09-15T10:01:00Z' };
const collector = { id: 70000000001, name: 'collect', run_id: 35000000001, run_attempt: 2,
  status: 'completed', conclusion: 'success', started_at: '2026-09-15T10:00:00Z', completed_at: '2026-09-15T10:05:00Z' };
const responses = () => ({
  [`https://api.github.com/repos/${context.repository}/actions/artifacts/10500000001`]: artifact,
  [`https://api.github.com/repos/${context.repository}/actions/runs/${context.runId}/attempts/2/jobs?per_page=100`]:
    { total_count: 1, jobs: [collector] },
});

test('state authentication signs raw bytes with a separate domain and retains the producer attempt across reruns', () => {
  const authentication = signState({ stateBytes, context, key });
  const result = verifyState({ ...options(), authentication });
  assert.equal(result.mode, 'hmac-sha256');
  assert.equal(result.runAttempt, '2', 'do not replace the signed attempt with a later run API attempt');
  assert.equal(authentication.stateSha256, sha256(stateBytes));
  // An independently framed HMAC verifies that key decoding, byte framing and
  // domain separation are interoperable rather than only self-consistent.
  const frame = JSON.stringify([1, 'hmac-sha256', context.repository, STATE_WORKFLOW,
    '35000000001', '2', 'reserved', stateBytes.length]);
  const tag = createHmac('sha256', Buffer.from(key, 'hex')).update(AUTH_DOMAIN).update(frame)
    .update('\0').update(stateBytes).digest('hex');
  assert.equal(authentication.signature, tag);
  assert.notEqual(authentication.signature, createHmac('sha256', Buffer.from(key, 'hex')).update(stateBytes).digest('hex'));
});

test('changed bytes, a forged digest, a handoff key and producer/phase replay all fail closed', () => {
  const authentication = signState({ stateBytes, context, key });
  const changed = Buffer.from(stateBytes.toString().replace('review-required', 'fetched'));
  assert.throws(() => verifyState({ ...options(), stateBytes: changed, authentication }), /authentication failed/);
  assert.throws(() => verifyState({ ...options(), stateBytes: changed,
    authentication: { ...authentication, stateSha256: sha256(changed) } }), /authentication failed/);
  assert.throws(() => verifyState({ ...options(), authentication, key: 'b2'.repeat(32) }), /authentication failed/);
  assert.throws(() => verifyState({ ...options(), authentication,
    stateBytes: Buffer.from(JSON.stringify(JSON.parse(stateBytes))) }), /authentication failed/, 'JSON whitespace is authenticated');
  for (const changedContext of [{ repository: 'other/tracker' }, { runId: '35000000002' },
    { phase: 'complete' }, { runAttempt: '3' }])
    assert.throws(() => verifyState({ ...options(), authentication, context: { ...expected(), ...changedContext } }), /another producer or phase/);
  assert.throws(() => verifyState({ ...options(), authentication,
    context: { ...expected(), workflow: '.github/workflows/other.yml' } }), /nightly workflow/);
  const forged = structuredClone(authentication); forged.context.runAttempt = '3';
  assert.throws(() => verifyState({ ...options(), authentication: forged }), /authentication failed/);
});

test('missing keys, malformed signatures, unknown envelope versions and missing context never authenticate', () => {
  const authentication = signState({ stateBytes, context, key });
  for (const invalid of ['', undefined, 'abcd', 'z'.repeat(64)]) {
    assert.throws(() => validateSigningKey(invalid), /SIGNING_KEY/);
    assert.throws(() => verifyState({ ...options(), authentication, key: invalid }), /SIGNING_KEY/);
  }
  for (const invalid of [null, {}, { ...authentication, signature: '' }, { ...authentication, schemaVersion: 2 },
    { ...authentication, signature: 'zz'.repeat(32) }, { ...authentication, extra: true },
    { ...authentication, context: { ...context, runAttempt: '0' } },
    { ...authentication, context: { ...context, runAttempt: undefined } }])
    assert.throws(() => verifyState({ ...options(), authentication: invalid }));
  assert.throws(() => signState({ stateBytes, context: expected(), key }), /attempt/);
  assert.throws(() => verifyState({ ...options(), authentication, artifactId: '' }), /artifact ID/);
});

test('legacy migration binds an exact artifact, raw digest and producer with no generic unsigned fallback', () => {
  assert.deepEqual(LEGACY_STATE_ARTIFACTS.map(entry => [entry.artifactId, entry.runId, entry.phase, entry.stateSha256]), [
    ['10298937863', '34697196941', 'complete', '293574d6ca31d19b36d0e422bcd2f16178f8e2b1fa9c6207bc1a93787e800e78'],
    ['10403723590', '34987153606', 'complete', 'a1da6db8dc2c4088e4277cb74c0fc07eccf554eda9f61c3181fdd361d3f341a7'],
  ]);
  assert.ok(Object.isFrozen(LEGACY_STATE_ARTIFACTS) && LEGACY_STATE_ARTIFACTS.every(Object.isFrozen));
  const trusted = [{ ...expected(), artifactId: '10500000001', stateSha256: sha256(stateBytes) }];
  assert.equal(verifyLegacyState(options(), trusted).mode, 'legacy-sha256');
  for (const change of [{ artifactId: '10500000002' }, { stateBytes: Buffer.concat([stateBytes, Buffer.from(' ')]) },
    { context: { ...expected(), runId: '35000000002' } }, { context: { ...expected(), phase: 'complete' } },
    { context: { ...expected(), repository: 'other/tracker' } }])
    assert.throws(() => verifyLegacyState({ ...options(), ...change }, trusted), /exact reviewed migration receipt/);
  assert.throws(() => verifyState(options()), /exact reviewed migration receipt/, 'production verifier has no injected allowlist');
  for (const entry of LEGACY_STATE_ARTIFACTS) {
    const opts = { ...options(), context: entry, artifactId: entry.artifactId };
    assert.throws(() => verifyState(opts), /exact reviewed migration receipt/, 'a real legacy ID alone grants nothing');
    assert.throws(() => verifyState({ ...opts, authentication: null }), /envelope is invalid/, 'present bad auth cannot fall back');
  }
});

test('restoration binds signed attempts to the actual collector upload window and rejects same-run agent replays', async () => {
  const authentication = signState({ stateBytes, context, key });
  const run = async (changedArtifact = {}, changedJob = {}, changedListing = {}) => {
    const data = responses(), calls = [];
    data[Object.keys(data)[0]] = { ...artifact, ...changedArtifact };
    data[Object.keys(data)[1]] = { total_count: 1, jobs: [{ ...collector, ...changedJob }], ...changedListing };
    const result = await verifyRestoredState({ ...options(), authentication, token: 'read-token',
      fetchImpl: async (url, init) => {
        calls.push(url); assert.equal(init.headers.authorization, 'Bearer read-token');
        assert.ok(Object.hasOwn(data, url), `unexpected request: ${url}`);
        return { ok: true, json: async () => data[url] };
      } });
    assert.equal(calls.length, 2);
    return result;
  };
  assert.equal((await run()).verified, true);
  assert.equal((await run({}, { conclusion: 'cancelled' })).verified, true, 'interrupted collector reservations remain recoverable');
  for (const changed of [{ created_at: '2026-09-15T10:06:00Z' },
    { created_at: '2026-09-15T10:05:00Z' }, { created_at: '2026-09-15T09:59:59Z' }])
    await assert.rejects(() => run(changed), /refusing replay/, 'new agent uploads cannot reuse an older collector signature');
  await assert.rejects(() => run({ created_at: '2026-09-15T10:05:00Z' },
    { completed_at: '2026-09-15T10:05:00.999Z' }), /refusing replay/, 'subsecond completion cannot admit a same-second replay');
  for (const changed of [{ run_attempt: 3 }, { run_id: 35000000002 }, { status: 'in_progress', completed_at: null }])
    await assert.rejects(() => run({}, changed), /refusing replay/);
  await assert.rejects(() => run({}, { name: 'refresh' }), /trusted collector job/);
  await assert.rejects(() => run({}, {}, { jobs: [collector, collector], total_count: 2 }), /one trusted collector/);
  await assert.rejects(() => run({}, {}, { total_count: 101 }), /history is incomplete/);
  await assert.rejects(() => run({ workflow_run: { id: 35000000002 } }), /metadata differs/);
  await assert.rejects(() => run({ name: 'transcript-state-complete' }), /metadata differs/);
  await assert.rejects(() => verifyRestoredState({ ...options(), authentication }), /read-only Actions token/);
  await assert.rejects(() => verifyRestoredState({ ...options(), authentication, token: 'read-token',
    fetchImpl: async () => ({ ok: false, status: 503 }) }), /producer lookup failed/);
});

test('CLI signs and verifies a sibling receipt without changing or printing state; unsigned or damaged files fail', t => {
  const dir = mkdtempSync(path.join(tmpdir(), 'transcript-state-auth-test-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const state = path.join(dir, 'state.json'), authentication = path.join(dir, 'authentication.json');
  writeFileSync(state, stateBytes);
  // Inject a transport in the child process, never a production CLI escape hatch.
  const preload = path.join(dir, 'mock-actions.mjs');
  writeFileSync(preload, `const data = ${JSON.stringify(responses())}; globalThis.fetch = async url => {
    if (!Object.hasOwn(data, url)) throw new Error('Unexpected test request');
    return { ok: true, json: async () => data[url] }; };`);
  const script = fileURLToPath(new URL('../src/transcript-state-auth.mjs', import.meta.url));
  const base = ['--state', state, '--authentication', authentication, '--repository', context.repository,
    '--workflow', STATE_WORKFLOW, '--run-id', context.runId, '--phase', context.phase];
  const run = (args, env = {}) => spawnSync(process.execPath, ['--import', pathToFileURL(preload).href, script, ...args], {
    encoding: 'utf8', env: { ...process.env, TRANSCRIPT_STATE_SIGNING_KEY: key, GITHUB_TOKEN: 'read-token', ...env }, timeout: 10_000,
  });
  assert.equal(run(['check-key']).status, 0);
  assert.notEqual(run(['check-key'], { TRANSCRIPT_STATE_SIGNING_KEY: '', TRANSCRIPT_HANDOFF_KEY: key }).status, 0);
  assert.notEqual(run(['verify', ...base, '--artifact-id', '10500000001']).status, 0, 'unknown unsigned state fails');
  const signed = run(['sign', ...base, '--run-attempt', '2']);
  assert.equal(signed.status, 0, signed.stderr);
  assert.ok(existsSync(authentication));
  assert.deepEqual(readFileSync(state), stateBytes, 'only the authentication sibling is written');
  const verified = run(['verify', ...base, '--artifact-id', '10500000001']);
  assert.equal(verified.status, 0, verified.stderr);
  assert.doesNotMatch(signed.stdout + signed.stderr + verified.stdout + verified.stderr, /do not log|a1a1a1/);
  writeFileSync(state, Buffer.concat([stateBytes, Buffer.from(' ')]));
  assert.notEqual(run(['verify', ...base, '--artifact-id', '10500000001']).status, 0);
  writeFileSync(authentication, '{');
  assert.match(run(['verify', ...base, '--artifact-id', '10500000001']).stderr, /not valid JSON/);
  assert.notEqual(run(['sign', ...base]).status, 0, 'sign requires an explicit producer attempt');
});
