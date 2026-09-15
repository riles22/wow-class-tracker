/* Explicit repair from a provenance-checked completed artifact. Resolve only
 * matching, authenticated successes; never replace the ledger or approve retry. */
import { readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateState, decryptTranscript } from './transcript-state.mjs';

export function reconcileState(input, completed, { artifactId, runId, key, now = Date.now() }) {
  const state = structuredClone(validateState(input));
  validateState(completed);
  if (!Number.isSafeInteger(artifactId) || artifactId < 1 || !Number.isSafeInteger(runId) || runId < 1
      || completed.reservation !== null || Date.parse(completed.updatedAt) > Date.parse(state.updatedAt))
    throw new Error('Reconciliation requires an older completed receipt and its verified artifact/run IDs');
  const resolved = [];
  for (const attempt of state.attempts) {
    if (!['reserved', 'review-required'].includes(attempt.outcome)) continue;
    if (!new RegExp(`^${runId}-[1-9]\\d*$`).test(attempt.runKey)) continue;
    const matches = completed.attempts.filter(a => a.videoId === attempt.videoId
      && a.runKey === attempt.runKey && a.at === attempt.at);
    if (matches.length !== 1 || matches[0].outcome !== 'fetched') continue;
    const cached = completed.cache[attempt.videoId];
    if (!cached || completed.videos[attempt.videoId]?.status !== 'fetched'
        || Date.parse(cached.fetchedAt) < Date.parse(attempt.at)
        || Date.parse(cached.fetchedAt) > Date.parse(completed.updatedAt))
      throw new Error('Completed success lacks its matching encrypted caption receipt');
    try { if (!key) throw new Error(); decryptTranscript(cached, key); }
    catch { throw new Error('Cannot authenticate the completed caption; request remains held for review'); }
    attempt.outcome = 'fetched';
    // A later attempt may still be unresolved. Do not let an older cached result
    // bypass its review hold or replace any newer per-video retry information.
    const later = state.attempts.some(a => a !== attempt && a.videoId === attempt.videoId
      && Date.parse(a.at) >= Date.parse(attempt.at));
    if (!later) {
      state.videos[attempt.videoId] = structuredClone(completed.videos[attempt.videoId]);
      state.cache[attempt.videoId] = structuredClone(cached);
    }
    resolved.push({ videoId: attempt.videoId, runKey: attempt.runKey });
  }
  if (resolved.length) {
    state.updatedAt = new Date(now).toISOString();
    state.reconciliations = [...(state.reconciliations ?? []), { artifactId, runId, at: state.updatedAt, resolved }];
  }
  return { state: validateState(state), resolved };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2), option = name => args[args.indexOf(name) + 1];
  for (const name of ['--state', '--completed', '--receipt-artifact-id', '--receipt-run-id'])
    if (!args.includes(name) || !option(name)) throw new Error(`Missing ${name}`);
  const statePath = path.resolve(option('--state'));
  const result = reconcileState(JSON.parse(await readFile(statePath, 'utf8')),
    JSON.parse(await readFile(path.resolve(option('--completed')), 'utf8')), {
      artifactId: Number(option('--receipt-artifact-id')), runId: Number(option('--receipt-run-id')),
      key: process.env.TRANSCRIPT_API_KEY,
    });
  await writeFile(`${statePath}.tmp`, JSON.stringify(result.state, null, 2) + '\n');
  await rename(`${statePath}.tmp`, statePath);
  console.log(`Reconciled ${result.resolved.length} completed transcript request(s) from artifact ${option('--receipt-artifact-id')}; no provider requests made`);
}
