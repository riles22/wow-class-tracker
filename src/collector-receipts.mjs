// The collector is a separate job. Its immutable artifact ID, archive digest and
// manifest digest arrive through job outputs, never through agent-authored files.
import { createHash, createCipheriv, createDecipheriv, hkdfSync, randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, lstatSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const RECEIPT_FILES = Object.freeze([
  'wcl-fetch/evidence.json', 'wcl-fetch/updates.json', 'source-health/evidence.json',
  'metrics-fetch/evidence.json', 'metrics-fetch/updates.json',
  'official-notes/evidence.json', 'official-notes/pending.json',
  'published-evidence/evidence.json', 'data/specs.json', 'data/wcl-coverage.json',
  'transcript-fetch/summary.json', 'transcript-fetch/handoff.json',
]);
const MANIFEST = 'collector-manifest.json';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const ID = /^[A-Za-z0-9_-]{11}$/;
const digestOf = value => typeof value === 'string' && /^(?:sha256:)?[a-f0-9]{64}$/.test(value)
  ? value.replace(/^sha256:/, '') : null;

export function producerContext(env = process.env) {
  const context = { repository: env.GITHUB_REPOSITORY, runId: env.GITHUB_RUN_ID,
    runAttempt: env.GITHUB_RUN_ATTEMPT, commitSha: env.GITHUB_SHA };
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(context.repository ?? '')
    || !/^[1-9][0-9]*$/.test(context.runId ?? '') || !/^[1-9][0-9]*$/.test(context.runAttempt ?? '')
    || !/^[a-f0-9]{40}$/.test(context.commitSha ?? '')) throw new Error('Invalid collector producer context');
  return context;
}

export function validateHandoffKey(key) {
  if (!/^[a-f0-9]{64}$/i.test(key ?? ''))
    throw new Error('TRANSCRIPT_HANDOFF_KEY must be a separately generated 32-byte hexadecimal secret');
}
const handoffKey = (key, context) => {
  validateHandoffKey(key);
  return hkdfSync('sha256', Buffer.from(key, 'hex'), Buffer.from(`${context.runId}:${context.runAttempt}`),
    'wow-class-tracker collector caption handoff v1', 32);
};

export function sealCaptions(captions, key, context) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', handoffKey(key, context), iv);
  cipher.setAAD(Buffer.from(JSON.stringify(context)));
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(captions), 'utf8'), cipher.final()]);
  return { schemaVersion: 1, algorithm: 'aes-256-gcm', context, iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'), ciphertext: ciphertext.toString('base64') };
}

export function openCaptions(envelope, key, context) {
  if (envelope?.schemaVersion !== 1 || envelope.algorithm !== 'aes-256-gcm'
    || JSON.stringify(envelope.context) !== JSON.stringify(context)) throw new Error('Caption handoff belongs to a different collector run');
  const decipher = createDecipheriv('aes-256-gcm', handoffKey(key, context), Buffer.from(envelope.iv, 'base64'));
  decipher.setAAD(Buffer.from(JSON.stringify(context)));
  decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));
  const captions = JSON.parse(Buffer.concat([decipher.update(Buffer.from(envelope.ciphertext, 'base64')), decipher.final()]).toString('utf8'));
  if (!captions || Array.isArray(captions) || typeof captions !== 'object'
    || Object.entries(captions).some(([id, item]) => !ID.test(id) || item?.id !== id || !Array.isArray(item.chunks)))
    throw new Error('Invalid caption handoff contents');
  return captions;
}

function regularFile(root, relative) {
  let current = root;
  const segments = relative.split('/');
  for (const [index, segment] of segments.entries()) {
    current = path.join(current, segment);
    const stat = lstatSync(current);
    if (stat.isSymbolicLink() || (index === segments.length - 1 ? !stat.isFile() : !stat.isDirectory()))
      throw new Error(`Collector path must contain only real directories and regular files: ${relative}`);
  }
  return current;
}
function inventory(root, prefix = '') {
  return readdirSync(path.join(root, prefix), { withFileTypes: true }).flatMap(entry => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isSymbolicLink() || (!entry.isDirectory() && !entry.isFile())) throw new Error('Collector bundle contains a nonregular path');
    return entry.isDirectory() ? inventory(root, relative) : [relative];
  }).sort();
}
function writeRegular(root, relative, bytes) {
  const segments = relative.split('/');
  let parent = root;
  for (const segment of segments.slice(0, -1)) {
    parent = path.join(parent, segment);
    mkdirSync(parent, { recursive: true });
    const stat = lstatSync(parent);
    if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error(`Unsafe collector destination: ${relative}`);
  }
  const target = path.join(root, relative);
  try { regularFile(root, relative); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  writeFileSync(target, bytes);
}

export function packReceipts({ root, bundle, context, key }) {
  validateHandoffKey(key); // fail before output; workflow also checks before any provider request
  const captions = {};
  for (const name of readdirSync(path.join(root, 'transcript-fetch'))) {
    if (!/^[A-Za-z0-9_-]{11}\.json$/.test(name)) continue;
    const caption = JSON.parse(readFileSync(regularFile(root, `transcript-fetch/${name}`), 'utf8'));
    if (caption.id !== name.slice(0, -5) || !Array.isArray(caption.chunks)) throw new Error('Invalid collected caption');
    captions[caption.id] = caption;
  }
  const handoff = Buffer.from(JSON.stringify(sealCaptions(captions, key, context)) + '\n');
  mkdirSync(bundle, { recursive: true });
  if (readdirSync(bundle).length) throw new Error('Collector bundle directory must be empty');
  const files = RECEIPT_FILES.map(relative => {
    const bytes = relative === 'transcript-fetch/handoff.json' ? handoff : readFileSync(regularFile(root, relative));
    writeRegular(bundle, relative, bytes);
    return { path: relative, sha256: hash(bytes), bytes: bytes.length };
  });
  const manifest = Buffer.from(JSON.stringify({ schemaVersion: 1, context, files }, null, 2) + '\n');
  writeRegular(bundle, MANIFEST, manifest);
  return { manifestSha256: hash(manifest) };
}

export function verifyReceipts({ bundle, context, manifestSha256 }) {
  if (!digestOf(manifestSha256)) throw new Error('Trusted collector manifest digest is missing');
  const bytes = readFileSync(regularFile(bundle, MANIFEST));
  if (hash(bytes) !== digestOf(manifestSha256)) throw new Error('Collector manifest differs from the trusted producer digest');
  const manifest = JSON.parse(bytes);
  if (manifest.schemaVersion !== 1 || JSON.stringify(manifest.context) !== JSON.stringify(context))
    throw new Error('Collector manifest belongs to another repository, commit, run or attempt');
  if (!Array.isArray(manifest.files) || manifest.files.length !== RECEIPT_FILES.length
    || manifest.files.some((file, i) => file?.path !== RECEIPT_FILES[i] || !digestOf(file.sha256)
      || !Number.isSafeInteger(file.bytes) || file.bytes < 1)) throw new Error('Unexpected collector receipt inventory');
  if (JSON.stringify(inventory(bundle)) !== JSON.stringify([...RECEIPT_FILES, MANIFEST].sort()))
    throw new Error('Collector bundle has missing or additional files');
  const verified = new Map();
  for (const file of manifest.files) {
    const content = readFileSync(regularFile(bundle, file.path));
    if (content.length !== file.bytes || hash(content) !== file.sha256) throw new Error(`Collector receipt was substituted or damaged: ${file.path}`);
    verified.set(file.path, content);
  }
  return verified;
}

export async function verifyArtifact({ context, artifactId, artifactDigest, token, fetchImpl = fetch }) {
  if (!/^[1-9][0-9]*$/.test(String(artifactId ?? '')) || !Number.isSafeInteger(Number(artifactId))
    || !digestOf(artifactDigest) || !token) throw new Error('Trusted collector artifact ID, digest and read token are required');
  const response = await fetchImpl(`https://api.github.com/repos/${context.repository}/actions/artifacts/${artifactId}`, {
    signal: AbortSignal.timeout(20_000), headers: { authorization: `Bearer ${token}`,
      accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28', 'user-agent': 'wow-class-tracker-collector' },
  });
  if (!response.ok) throw new Error(`Trusted collector artifact is unavailable (HTTP ${response.status})`);
  const artifact = await response.json();
  if (artifact.id !== Number(artifactId) || artifact.name !== `collector-receipts-${context.runAttempt}` || artifact.expired
    || artifact.digest !== `sha256:${digestOf(artifactDigest)}`
    || String(artifact.workflow_run?.id) !== context.runId || artifact.workflow_run?.head_sha !== context.commitSha)
    throw new Error('Collector artifact metadata differs from trusted producer outputs');
}

export function installReceipts({ bundle, root, context, manifestSha256, agent = false, key }) {
  const verified = verifyReceipts({ bundle, context, manifestSha256 });
  // Authenticate/decrypt everything before writing even the first destination.
  const captions = agent ? openCaptions(JSON.parse(verified.get('transcript-fetch/handoff.json')), key, context) : {};
  for (const [relative, bytes] of verified) {
    if (!agent && (relative.startsWith('data/') || relative.startsWith('transcript-fetch/'))) continue;
    if (relative === 'transcript-fetch/handoff.json') continue;
    writeRegular(root, relative, bytes);
  }
  for (const [id, caption] of Object.entries(captions)) writeRegular(root, `transcript-fetch/${id}.json`, JSON.stringify(caption) + '\n');
  return { files: verified.size, captions: Object.keys(captions).length };
}

async function main() {
  const mode = process.argv[2];
  if (mode === 'check-key') { validateHandoffKey(process.env.TRANSCRIPT_HANDOFF_KEY); return; }
  const context = producerContext();
  const bundle = process.env.COLLECTOR_BUNDLE_DIR;
  if (!bundle || !path.isAbsolute(bundle)) throw new Error('An absolute COLLECTOR_BUNDLE_DIR is required');
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  if (mode === 'pack') {
    const result = packReceipts({ root, bundle, context, key: process.env.TRANSCRIPT_HANDOFF_KEY });
    if (!process.env.GITHUB_OUTPUT) throw new Error('GITHUB_OUTPUT is required');
    const { appendFileSync } = await import('node:fs');
    appendFileSync(process.env.GITHUB_OUTPUT, `manifest_sha256=${result.manifestSha256}\n`);
    console.log(`Sealed ${RECEIPT_FILES.length} collector files for run ${context.runId}, attempt ${context.runAttempt}`);
  } else if (['install-agent', 'install-publish'].includes(mode)) {
    await verifyArtifact({ context, artifactId: process.env.COLLECTOR_ARTIFACT_ID,
      artifactDigest: process.env.COLLECTOR_ARTIFACT_DIGEST, token: process.env.GITHUB_TOKEN });
    const result = installReceipts({ bundle, root, context, manifestSha256: process.env.COLLECTOR_MANIFEST_SHA256,
      agent: mode === 'install-agent', key: process.env.TRANSCRIPT_HANDOFF_KEY });
    console.log(`Verified ${result.files} collector files for ${context.commitSha}; materialized ${result.captions} caption files`);
  } else throw new Error('Usage: collector-receipts.mjs check-key|pack|install-agent|install-publish');
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
