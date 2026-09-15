import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, readdirSync, existsSync, symlinkSync, renameSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { RECEIPT_FILES, producerContext, packReceipts, verifyReceipts, installReceipts,
  verifyArtifact, sealCaptions, openCaptions } from '../src/collector-receipts.mjs';

const context = producerContext({ GITHUB_REPOSITORY: 'owner/tracker', GITHUB_RUN_ID: '12345',
  GITHUB_RUN_ATTEMPT: '2', GITHUB_SHA: 'a'.repeat(40) });
const key = 'ab'.repeat(32);
const caption = { id: 'abcdefghijk', fetchedAt: '2026-09-12T12:00:00.000Z',
  chunks: [{ offset: 100, text: 'private caption sentinel, never upload in plaintext' }] };
const sha = value => createHash('sha256').update(value).digest('hex');
function fixture(t) {
  const dir = mkdtempSync(path.join(tmpdir(), 'collector-receipts-test-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const root = path.join(dir, 'source'), bundle = path.join(dir, 'bundle'), target = path.join(dir, 'target');
  mkdirSync(target); mkdirSync(root);
  for (const relative of RECEIPT_FILES.filter(file => file !== 'transcript-fetch/handoff.json')) {
    const file = path.join(root, relative); mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify({ receipt: relative, verdict: 'unreachable' }) + '\n');
  }
  writeFileSync(path.join(root, 'transcript-fetch', `${caption.id}.json`), JSON.stringify(caption));
  // Operational state and secrets must never join the public handoff bundle.
  writeFileSync(path.join(root, 'transcript-fetch/state.json'), JSON.stringify({ providerKey: 'secret sentinel' }));
  const { manifestSha256 } = packReceipts({ root, bundle, context, key });
  return { dir, root, bundle, target, manifestSha256 };
}

test('collector bundle preserves degraded receipts, transports encrypted captions and isolates canonical data on publication', t => {
  const f = fixture(t);
  assert.equal(verifyReceipts({ ...f, context }).size, RECEIPT_FILES.length);
  const envelopeText = readFileSync(path.join(f.bundle, 'transcript-fetch/handoff.json'), 'utf8');
  assert.ok(!envelopeText.includes('private caption sentinel'));
  assert.ok(!existsSync(path.join(f.bundle, 'transcript-fetch/state.json')));
  assert.deepEqual(openCaptions(JSON.parse(envelopeText), key, context), { [caption.id]: caption });
  const result = installReceipts({ ...f, root: f.target, context, key, agent: true });
  assert.equal(result.captions, 1);
  assert.deepEqual(JSON.parse(readFileSync(path.join(f.target, `transcript-fetch/${caption.id}.json`))), caption);
  assert.equal(JSON.parse(readFileSync(path.join(f.target, 'wcl-fetch/evidence.json'))).verdict, 'unreachable');
  writeFileSync(path.join(f.target, 'data/specs.json'), 'agent edits retained');
  installReceipts({ ...f, root: f.target, context });
  assert.equal(readFileSync(path.join(f.target, 'data/specs.json'), 'utf8'), 'agent edits retained');
});

test('substitution of a receipt and matching agent-authored manifest cannot defeat the producer digest', t => {
  const f = fixture(t);
  const target = path.join(f.bundle, 'wcl-fetch/evidence.json');
  writeFileSync(target, '{"verdict":"success"}\n');
  assert.throws(() => verifyReceipts({ ...f, context }), /substituted or damaged/);
  const manifestFile = path.join(f.bundle, 'collector-manifest.json');
  const manifest = JSON.parse(readFileSync(manifestFile));
  const row = manifest.files.find(row => row.path === 'wcl-fetch/evidence.json');
  row.sha256 = sha(readFileSync(target)); row.bytes = readFileSync(target).length;
  writeFileSync(manifestFile, JSON.stringify(manifest));
  assert.throws(() => installReceipts({ ...f, root: f.target, context }), /trusted producer digest/);
  assert.deepEqual(readdirSync(f.target), [], 'reject before writing any receipt');
});

test('wrong commit, run and attempt cannot reuse an otherwise authentic bundle', t => {
  const f = fixture(t);
  for (const changed of [{ commitSha: 'b'.repeat(40) }, { runId: '12346' }, { runAttempt: '3' }, { repository: 'other/tracker' }])
    assert.throws(() => verifyReceipts({ ...f, context: { ...context, ...changed } }), /another repository, commit, run or attempt/);
  assert.throws(() => verifyReceipts({ ...f, context, manifestSha256: '' }), /digest is missing/);
});

test('extra files, missing files and path traversal fail even when a manifest has an accepted digest', t => {
  const f = fixture(t);
  writeFileSync(path.join(f.bundle, 'injected.json'), '{}');
  assert.throws(() => verifyReceipts({ ...f, context }), /additional files/);
  rmSync(path.join(f.bundle, 'injected.json'));
  const missing = path.join(f.bundle, 'official-notes/pending.json');
  const saved = readFileSync(missing); rmSync(missing);
  assert.throws(() => verifyReceipts({ ...f, context }), /missing or additional files/);
  writeFileSync(missing, saved);
  const manifestFile = path.join(f.bundle, 'collector-manifest.json');
  const manifest = JSON.parse(readFileSync(manifestFile));
  manifest.files[0].path = '../outside.json';
  writeFileSync(manifestFile, JSON.stringify(manifest));
  assert.throws(() => verifyReceipts({ ...f, context, manifestSha256: sha(readFileSync(manifestFile)) }), /inventory/);
});

test('a missing or damaged caption handoff key fails before installing collector data', t => {
  const f = fixture(t);
  for (const invalid of ['', 'bad', 'cd'.repeat(32)]) {
    assert.throws(() => installReceipts({ ...f, root: f.target, context, key: invalid, agent: true }));
    assert.deepEqual(readdirSync(f.target), []);
  }
  const sealed = sealCaptions({ [caption.id]: caption }, key, context);
  assert.throws(() => openCaptions(sealed, key, { ...context, runAttempt: '3' }), /different collector run/);
  sealed.tag = Buffer.alloc(16).toString('base64');
  assert.throws(() => openCaptions(sealed, key, context));
});

test('a substituted artifact ID, archive digest or producer identity is rejected without a name search fallback', async () => {
  const artifact = { id: 9876, name: 'collector-receipts-2', digest: `sha256:${'c'.repeat(64)}`, expired: false,
    workflow_run: { id: 12345, head_sha: context.commitSha } };
  const opts = { context, artifactId: '9876', artifactDigest: 'c'.repeat(64), token: 'read-token',
    fetchImpl: async (url, init) => {
      assert.equal(url, 'https://api.github.com/repos/owner/tracker/actions/artifacts/9876');
      assert.equal(init.headers.authorization, 'Bearer read-token');
      return { ok: true, json: async () => artifact };
    } };
  await verifyArtifact(opts);
  for (const [field, value] of [['id', 9877], ['name', 'collector-receipts-1'], ['expired', true], ['digest', `sha256:${'d'.repeat(64)}`],
    ['workflow_run', { id: 9999, head_sha: context.commitSha }], ['workflow_run', { id: 12345, head_sha: 'b'.repeat(40) }]]) {
    await assert.rejects(() => verifyArtifact({ ...opts, fetchImpl: async () => ({ ok: true, json: async () => ({ ...artifact, [field]: value }) }) }), /metadata differs/);
  }
  await assert.rejects(() => verifyArtifact({ ...opts, fetchImpl: async () => ({ ok: false, status: 404 }) }), /unavailable/);
  await assert.rejects(() => verifyArtifact({ ...opts, artifactId: '' }), /ID, digest/);
});

test('collector bundles reject symlink or junction receipt directories', t => {
  const f = fixture(t);
  const target = path.join(f.bundle, 'wcl-fetch');
  const saved = path.join(f.dir, 'saved-wcl');
  renameSync(target, saved); symlinkSync(saved, target, 'junction');
  assert.throws(() => verifyReceipts({ ...f, context }), /nonregular|regular files/);
});
