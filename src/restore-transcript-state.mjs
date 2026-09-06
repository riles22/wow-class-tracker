/* Locate the latest immutable pre-agent state, including failed/cancelled runs.
 * The workflow downloads the returned artifact with actions/download-artifact.
 * Lookup failure is fatal: falling back to empty state could repeat paid calls. */
import { appendFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const STATE_ARTIFACTS = ['transcript-state-reserved', 'transcript-state-complete'];

export async function locateState({ repository, token, allowInitialize = false, fetchImpl = fetch }) {
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
  const lists = await Promise.all(STATE_ARTIFACTS.map(name => get(`actions/artifacts?name=${name}&per_page=100`)));
  if (lists.some(v => !Array.isArray(v.artifacts) || !Number.isInteger(v.total_count)))
    throw new Error('Transcript artifact listing is malformed');
  const artifacts = lists.flatMap(v => v.artifacts).filter(a => STATE_ARTIFACTS.includes(a.name));
  if (!artifacts.length) {
    if (lists.some(v => v.total_count !== 0)) throw new Error('Transcript state history is inaccessible');
    if (!allowInitialize) throw new Error('No transcript state artifact found; explicit first-install initialization is required');
    return { found: false, initialize: true };
  }
  // Artifact IDs increase independently of workflow conclusion and rerun attempt.
  // Never fall back to older state when the newest receipt cannot be trusted.
  const artifact = artifacts.sort((a, b) => b.id - a.id)[0];
  if (!Number.isSafeInteger(artifact.id) || artifact.expired || !Number.isSafeInteger(artifact.workflow_run?.id))
    throw new Error('Latest transcript state is expired or invalid; recover it before sending more requests');
  const run = await get(`actions/runs/${artifact.workflow_run.id}`);
  if (run.path !== '.github/workflows/nightly.yml' || run.head_branch !== 'master'
      || !['schedule', 'workflow_dispatch'].includes(run.event)
      || run.repository?.full_name !== repository || run.head_repository?.full_name !== repository)
    throw new Error('Latest transcript state did not come from the trusted master nightly workflow');
  return { found: true, initialize: false, artifact_id: artifact.id, run_id: artifact.workflow_run.id };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const found = await locateState({ repository: process.env.GITHUB_REPOSITORY, token: process.env.GITHUB_TOKEN,
    allowInitialize: process.env.TRANSCRIPT_STATE_ALLOW_INITIALIZE === 'true' });
  if (!process.env.GITHUB_OUTPUT) throw new Error('GITHUB_OUTPUT is required');
  await appendFile(process.env.GITHUB_OUTPUT, Object.entries(found).map(([k, v]) => `${k}=${v}\n`).join(''));
  console.log(found.found ? `Restore transcript state from run ${found.run_id}, artifact ${found.artifact_id}`
    : 'No transcript state artifacts exist: explicit first-install initialization enabled');
}
