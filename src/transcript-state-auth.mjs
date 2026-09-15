/* Durable collector state crosses workflow runs, so a workflow/artifact name is
 * insufficient producer proof. Keep this key in collector-only steps: the agent
 * receives the unrelated caption HANDOFF key, never this signing key. */
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { lstat, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

export const STATE_WORKFLOW = '.github/workflows/nightly.yml';
export const AUTH_DOMAIN = 'wow-class-tracker/transcript-state-auth/v1\0';
const ALGORITHM = 'hmac-sha256';
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const positiveId = value => /^[1-9]\d*$/.test(String(value ?? '')) && Number.isSafeInteger(Number(value));

// One-time migration receipts independently downloaded and hashed on 2026-09-15.
// IDs alone are insufficient: every raw byte and the verified producer must match.
// Never extend this list from a downloaded artifact, environment variable or CLI.
export const LEGACY_STATE_ARTIFACTS = Object.freeze([
  Object.freeze({ artifactId: '10298937863', repository: 'riles22/wow-class-tracker',
    workflow: STATE_WORKFLOW, runId: '34697196941', phase: 'complete',
    stateSha256: '293574d6ca31d19b36d0e422bcd2f16178f8e2b1fa9c6207bc1a93787e800e78' }),
  Object.freeze({ artifactId: '10403723590', repository: 'riles22/wow-class-tracker',
    workflow: STATE_WORKFLOW, runId: '34987153606', phase: 'complete',
    stateSha256: 'a1da6db8dc2c4088e4277cb74c0fc07eccf554eda9f61c3181fdd361d3f341a7' }),
]);

export function validateSigningKey(key) {
  if (typeof key !== 'string' || !/^[a-fA-F0-9]{64}$/.test(key))
    throw new Error('TRANSCRIPT_STATE_SIGNING_KEY must be an independent 32-byte hexadecimal key');
  return Buffer.from(key, 'hex');
}

function contextOf(input, { requireAttempt = true } = {}) {
  if (!input || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(input.repository ?? '')
      || input.workflow !== STATE_WORKFLOW || !positiveId(input.runId)
      || !['reserved', 'complete'].includes(input.phase)
      || ((requireAttempt || input.runAttempt !== undefined) && !positiveId(input.runAttempt)))
    throw new Error('Transcript state requires its repository, nightly workflow, run, attempt and phase');
  return { repository: input.repository, workflow: input.workflow, runId: String(input.runId),
    ...(input.runAttempt === undefined ? {} : { runAttempt: String(input.runAttempt) }), phase: input.phase };
}

function rawBytes(bytes) {
  if (!Buffer.isBuffer(bytes) || !bytes.length) throw new Error('Nonempty raw transcript state bytes are required');
  return bytes;
}

function signature(bytes, context, key) {
  // Fixed-position JSON framing plus a domain separator prevents concatenation and
  // cross-protocol ambiguity. Authenticate the raw file, not reserialized JSON.
  const header = JSON.stringify([1, ALGORITHM, context.repository, context.workflow,
    context.runId, context.runAttempt, context.phase, bytes.length]);
  return createHmac('sha256', key).update(AUTH_DOMAIN).update(header).update('\0').update(bytes).digest('hex');
}

export function signState({ stateBytes, context, key }) {
  const signingKey = validateSigningKey(key), bytes = rawBytes(stateBytes), producer = contextOf(context);
  return { schemaVersion: 1, algorithm: ALGORITHM, context: producer,
    stateSha256: digest(bytes), signature: signature(bytes, producer, signingKey) };
}

export function verifyLegacyState({ stateBytes, context, artifactId }, trustedEntries = LEGACY_STATE_ARTIFACTS) {
  // The explicit entries argument allows synthetic pure-helper tests. The CLI and
  // normal verifier always use the fixed source-controlled migration receipts.
  const expected = contextOf(context, { requireAttempt: false }), bytes = rawBytes(stateBytes);
  if (!positiveId(artifactId)) throw new Error('An exact transcript artifact ID is required');
  const sha256 = digest(bytes);
  const receipt = trustedEntries.find(entry => entry.artifactId === String(artifactId)
    && ['repository', 'workflow', 'runId', 'phase'].every(field => entry[field] === expected[field])
    && entry.stateSha256 === sha256);
  if (!receipt) throw new Error('Unsigned transcript state is not an exact reviewed migration receipt');
  return { verified: true, mode: 'legacy-sha256', stateSha256: sha256 };
}

export function verifyState({ stateBytes, authentication, context, artifactId, key }) {
  const signingKey = validateSigningKey(key), bytes = rawBytes(stateBytes);
  const expected = contextOf(context, { requireAttempt: false });
  if (!positiveId(artifactId)) throw new Error('An exact transcript artifact ID is required');
  // Only an absent file enters migration. A present null/malformed/bad envelope is
  // a failure, even if its state bytes happen to match a reviewed legacy receipt.
  if (authentication === undefined) return verifyLegacyState({ stateBytes: bytes, context: expected, artifactId });
  if (!authentication || authentication.schemaVersion !== 1 || authentication.algorithm !== ALGORITHM
      || Object.keys(authentication).sort().join(',') !== 'algorithm,context,schemaVersion,signature,stateSha256'
      || !/^[a-f0-9]{64}$/.test(authentication.signature ?? '')
      || !/^[a-f0-9]{64}$/.test(authentication.stateSha256 ?? '')
      || !authentication.context || Object.keys(authentication.context).sort().join(',') !== 'phase,repository,runAttempt,runId,workflow')
    throw new Error('Transcript state authentication envelope is invalid');
  const producer = contextOf(authentication.context);
  if (Object.entries(expected).some(([field, value]) => producer[field] !== value))
    throw new Error('Transcript state authentication belongs to another producer or phase');
  const wanted = Buffer.from(signature(bytes, producer, signingKey), 'hex');
  if (!timingSafeEqual(wanted, Buffer.from(authentication.signature, 'hex'))
      || digest(bytes) !== authentication.stateSha256)
    throw new Error('Transcript state authentication failed; refusing restored state');
  return { verified: true, mode: ALGORITHM, stateSha256: authentication.stateSha256,
    runAttempt: producer.runAttempt };
}

export async function verifyArtifactProducer({ context, artifactId, runAttempt, token, fetchImpl = fetch }) {
  const expected = contextOf({ ...context, runAttempt });
  if (!positiveId(artifactId) || !token) throw new Error('Artifact ID and read-only Actions token are required for producer verification');
  const get = async suffix => {
    const response = await fetchImpl(`https://api.github.com/repos/${expected.repository}/${suffix}`, {
      signal: AbortSignal.timeout(20_000), headers: { authorization: `Bearer ${token}`,
        accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28',
        'user-agent': 'wow-class-tracker-transcript-state-auth' },
    });
    if (!response.ok) throw new Error(`Transcript state producer lookup failed (HTTP ${response.status})`);
    return response.json();
  };
  const artifact = await get(`actions/artifacts/${artifactId}`);
  if (String(artifact.id) !== String(artifactId) || artifact.expired !== false
      || artifact.name !== `transcript-state-${expected.phase}`
      || String(artifact.workflow_run?.id) !== expected.runId)
    throw new Error('Transcript state artifact metadata differs from its authenticated producer');
  const listing = await get(`actions/runs/${expected.runId}/attempts/${expected.runAttempt}/jobs?per_page=100`);
  if (!Array.isArray(listing.jobs) || !Number.isSafeInteger(listing.total_count)
      || listing.total_count < 1 || listing.total_count !== listing.jobs.length)
    throw new Error('Transcript collector job history is incomplete');
  const collectors = listing.jobs.filter(job => job.name === 'collect');
  if (collectors.length !== 1) throw new Error('Transcript state lacks one trusted collector job for its signed attempt');
  const collector = collectors[0];
  // Creation timestamps have second precision. Refuse the completion second itself:
  // accepting an ambiguous boundary could admit an agent upload after collect ends.
  // A failed/cancelled collector's saved reservation remains recoverable.
  const second = value => typeof value === 'string' ? Math.floor(Date.parse(value) / 1000) : NaN;
  const created = second(artifact.created_at), started = second(collector.started_at), ended = second(collector.completed_at);
  if (String(collector.run_id) !== expected.runId || collector.status !== 'completed'
      || (collector.run_attempt !== undefined && String(collector.run_attempt) !== expected.runAttempt)
      || ![created, started, ended].every(Number.isFinite) || ended <= started
      || created < started || created >= ended)
    throw new Error('Transcript state was not uploaded during its signed collector attempt; refusing replay');
}

export async function verifyRestoredState(options) {
  const result = verifyState(options);
  if (result.mode === ALGORITHM)
    await verifyArtifactProducer({ ...options, runAttempt: result.runAttempt });
  return result;
}

async function readRegular(file) {
  const info = await lstat(file);
  if (!info.isFile() || info.isSymbolicLink()) throw new Error('Transcript state inputs must be regular files');
  return readFile(file);
}

async function main() {
  const mode = process.argv[2];
  if (!['check-key', 'sign', 'verify'].includes(mode))
    throw new Error('Usage: transcript-state-auth.mjs check-key|sign|verify');
  const { values } = parseArgs({ args: process.argv.slice(3), allowPositionals: false,
    options: Object.fromEntries(['state', 'authentication', 'repository', 'workflow', 'run-id', 'run-attempt', 'phase', 'artifact-id']
      .map(name => [name, { type: 'string' }])) });
  const key = process.env.TRANSCRIPT_STATE_SIGNING_KEY;
  validateSigningKey(key);
  if (mode === 'check-key') {
    if (Object.keys(values).length) throw new Error('check-key does not accept file or producer arguments');
    return;
  }
  if (!values.state || !values.authentication) throw new Error('--state and --authentication are required');
  if (path.resolve(values.state) === path.resolve(values.authentication))
    throw new Error('State and authentication must be separate files');
  const context = { repository: values.repository, workflow: values.workflow, runId: values['run-id'],
    runAttempt: values['run-attempt'], phase: values.phase };
  const stateBytes = await readRegular(values.state);
  if (mode === 'sign') {
    if (values['artifact-id'] !== undefined) throw new Error('Artifact IDs are assigned after signing');
    const authentication = signState({ stateBytes, context, key });
    await writeFile(values.authentication, JSON.stringify(authentication, null, 2) + '\n', { mode: 0o600 });
    console.log(`Authenticated transcript ${context.phase} state for run ${context.runId}, attempt ${context.runAttempt}`);
  } else {
    let authentication;
    try {
      const bytes = await readRegular(values.authentication);
      try { authentication = JSON.parse(bytes.toString('utf8')); }
      catch { throw new Error('Transcript state authentication file is not valid JSON'); }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    const result = await verifyRestoredState({ stateBytes, authentication, context,
      artifactId: values['artifact-id'], key, token: process.env.GITHUB_TOKEN });
    console.log(`Verified transcript state from artifact ${values['artifact-id']} (${result.mode})`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
