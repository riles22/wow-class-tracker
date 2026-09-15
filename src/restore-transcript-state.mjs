/* Locate the latest immutable pre-agent state, including failed/cancelled runs.
 * The workflow downloads the returned artifact with actions/download-artifact.
 * Lookup failure is fatal: falling back to empty state could repeat paid calls. */
import { appendFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const STATE_ARTIFACTS = ['transcript-state-reserved', 'transcript-state-complete'];

export async function locateState({ repository, token, allowInitialize = false, reconcileArtifactId = '', fetchImpl = fetch }) {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository ?? '') || !token)
    throw new Error('Repository and read-only Actions token are required to restore transcript state');
  const get = async suffix => {
    const response = await fetchImpl(`https://api.github.com/repos/${repository}/${suffix}`, {
      signal: AbortSignal.timeout(20_000),
      headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json',
        'x-github-api-version': '2022-11-28', 'user-agent': 'wow-class-tracker-transcript-state' },
    });
    if (!response.ok) throw new Error(`Transcript state lookup failed (HTTP ${response.status}); no initialization allowed`);
    return response.json();
  };
  const lists = await Promise.all(STATE_ARTIFACTS.map(async name => {
    const artifacts = [];
    for (let page = 1; page <= 100; page++) {
      const list = await get(`actions/artifacts?name=${name}&per_page=100&page=${page}`);
      if (!Array.isArray(list.artifacts) || !Number.isSafeInteger(list.total_count) || list.total_count < 0
          || list.artifacts.some(a => a.name !== name)) throw new Error('Transcript artifact listing is malformed');
      artifacts.push(...list.artifacts);
      if (new Set(artifacts.map(a => a.id)).size !== artifacts.length)
        throw new Error('Transcript artifact history changed during pagination; retry the lookup');
      if (artifacts.length === list.total_count) return artifacts;
      if (!list.artifacts.length || artifacts.length > list.total_count)
        throw new Error('Transcript state history is inaccessible or changed during lookup');
    }
    throw new Error('Transcript artifact history exceeds the lookup bound');
  }));
  const artifacts = lists.flat();
  if (!artifacts.length) {
    if (reconcileArtifactId) throw new Error('Cannot reconcile without current transcript history');
    if (!allowInitialize) throw new Error('No transcript state artifact found; explicit first-install initialization is required');
    return { found: false, initialize: true };
  }
  // IDs are not clocks: the observed completed upload can have a LOWER ID than
  // its preceding reservation. Use creation time, including failed/cancelled runs.
  for (const a of artifacts) if (!Number.isSafeInteger(a.id) || !Number.isSafeInteger(a.workflow_run?.id)
      || typeof a.created_at !== 'string' || !Number.isFinite(Date.parse(a.created_at)))
    throw new Error('Transcript artifact chronology is invalid; refusing stale fallback');
  artifacts.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  const latest = artifacts.filter(a => Date.parse(a.created_at) === Date.parse(artifacts[0].created_at));
  // GitHub timestamps have second precision. Within one run, the completed
  // phase supersedes its reservation; a tie across runs is not safely ordered.
  if (new Set(latest.map(a => a.workflow_run.id)).size !== 1)
    throw new Error('Latest transcript artifact chronology is ambiguous across runs');
  const completed = latest.filter(a => a.name === 'transcript-state-complete');
  if (completed.length > 1 || (!completed.length && latest.length > 1))
    throw new Error('Latest transcript artifact chronology is ambiguous');
  const artifact = completed[0] ?? latest[0];
  const verify = async a => {
    if (a.expired !== false) throw new Error('Latest transcript state is expired or invalid; recover it before sending more requests');
    const run = await get(`actions/runs/${a.workflow_run.id}`);
    if (run.path !== '.github/workflows/nightly.yml' || run.head_branch !== 'master'
        || !['schedule', 'workflow_dispatch'].includes(run.event)
        || run.repository?.full_name !== repository || run.head_repository?.full_name !== repository)
      throw new Error('Transcript state did not come from the trusted master nightly workflow');
  };
  await verify(artifact);
  const found = { found: true, initialize: false, artifact_id: artifact.id, run_id: artifact.workflow_run.id,
    phase: artifact.name === 'transcript-state-complete' ? 'complete' : 'reserved' };
  if (reconcileArtifactId) {
    if (!/^[1-9]\d*$/.test(String(reconcileArtifactId)) || !Number.isSafeInteger(Number(reconcileArtifactId)))
      throw new Error('Reconciliation requires an exact completed artifact ID');
    const receipt = artifacts.find(a => a.id === Number(reconcileArtifactId));
    if (!receipt || receipt.name !== 'transcript-state-complete')
      throw new Error('Reconciliation receipt is not an accessible completed transcript artifact');
    await verify(receipt);
    Object.assign(found, { reconcile_found: true, reconcile_artifact_id: receipt.id,
      reconcile_run_id: receipt.workflow_run.id });
  }
  return found;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const found = await locateState({ repository: process.env.GITHUB_REPOSITORY, token: process.env.GITHUB_TOKEN,
    allowInitialize: process.env.TRANSCRIPT_STATE_ALLOW_INITIALIZE === 'true',
    reconcileArtifactId: process.env.TRANSCRIPT_RECONCILE_ARTIFACT_ID });
  if (!process.env.GITHUB_OUTPUT) throw new Error('GITHUB_OUTPUT is required');
  await appendFile(process.env.GITHUB_OUTPUT, Object.entries(found).map(([k, v]) => `${k}=${v}\n`).join(''));
  console.log(found.found ? `Restore transcript state from run ${found.run_id}, artifact ${found.artifact_id}`
    : 'No transcript state artifacts exist: explicit first-install initialization enabled');
}
