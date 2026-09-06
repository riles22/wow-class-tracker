/* Deterministic pre-agent transcript stage (owner-approved 2026-07-17).
 *
 * The ONLY process holding TRANSCRIPT_API_KEY (Supadata). Runs BEFORE the nightly
 * agents: reads the agent-maintained queue data/pending-transcripts.json, fetches
 * each video's YouTube captions through the Supadata API (mode=native — YouTube's
 * own captions, the same source yt-dlp read before datacenter IPs were bot-walled),
 * and writes per-video chunk files + an honest summary into transcript-fetch/
 * (gitignored). The agents never see the key — they distill from the files.
 *
 * Contract mirrors fetch-wcl.mjs: total (never throws), always exits 0 once the
 * summary is written; degraded verdicts surface as ::warning here and in the
 * agents' manifest rows. A missing key is a CLEAN skip (verdict no-credentials) —
 * the secret is optional until the owner configures it.
 *
 * Requests have a deadline and are reserved in durable operational state before
 * any network call. See docs/transcript-operations.md for artifact persistence,
 * optional rolling allowance, and review of uncertain provider outcomes.
 */
import { readFile, writeFile, mkdir, rename, readdir, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { newState, validateState, requestBudget, usageOf, prepareBatch, recordOutcome,
  finishBatch, encryptTranscript, decryptTranscript } from './transcript-state.mjs';

export const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
export const VALID_ID = /^[A-Za-z0-9_-]{11}$/; // YouTube video id — the only queue field that reaches a URL
export const PER_RUN_CAP = 25;
export const API_BASE = "https://api.supadata.ai/v1/transcript";
export const REQUEST_TIMEOUT_MS = 45_000;
export const RUN_TIMEOUT_MS = 6 * 60_000;

const sleep = ms => new Promise(r => setTimeout(r, ms));

/* Normalize a Supadata success payload to timestamped chunks, or null when the
   shape is unusable for take-distillation (text=true strings, async job ids,
   empty captions). offset/duration are milliseconds (TranscriptChunk contract). */
export function chunksOf(payload) {
  if (!payload || !Array.isArray(payload.content) || payload.content.length === 0) return null;
  const chunks = payload.content
    .filter(c => c && typeof c.text === "string" && c.text.trim() !== "" && Number.isFinite(c.offset))
    .map(c => ({ text: c.text, offset: c.offset, duration: Number.isFinite(c.duration) ? c.duration : 0 }));
  return chunks.length ? chunks : null;
}

/* Map one fetch outcome to a per-video status + whether the run should stop early
   (credential/limit failures burn the remaining budget for nothing). */
export function statusOf(httpStatus, body) {
  const code = body && typeof body.error === "string" ? body.error : null;
  if (httpStatus === 200) return { status: "fetched", stop: false };
  // A 403 WITHOUT Supadata's JSON error envelope is an egress/proxy/CDN block, not a
  // key verdict (2026-07-17: a sandbox proxy 403 masqueraded as "unauthorized") —
  // report it as blocking so nobody rotates a healthy key over network plumbing.
  if (httpStatus === 401 || code === "unauthorized") return { status: "unauthorized", stop: true };
  if (httpStatus === 403) return code ? { status: "unauthorized", stop: true } : { status: "blocked-403", stop: true };
  if (httpStatus === 402 || httpStatus === 429 || code === "limit-exceeded" || code === "upgrade-required") return { status: "limit-exceeded", stop: true };
  if (httpStatus === 404 || code === "transcript-unavailable" || code === "not-found") return { status: "unavailable", stop: false };
  if (httpStatus === 0) return { status: "network-failed", stop: false };
  // Unknown provider error strings can echo credentials or request details.
  // Public operational receipts keep only the numeric HTTP outcome.
  return { status: `error:${Number.isInteger(httpStatus) ? httpStatus : 0}`, stop: false };
}

/* Overall verdict from per-video results: the worst credential-shaped problem wins,
   plain content problems (unavailable/empty) still count as an ok run. */
export function verdictOf(results, hadKey) {
  if (!hadKey) return "no-credentials";
  const statuses = Object.values(results);
  if (statuses.includes("unauthorized")) return "unauthorized";
  if (statuses.includes("limit-exceeded")) return "limit-exceeded";
  if (statuses.includes("review-required")) return "review-required";
  if (statuses.includes("budget-deferred")) return "budget-deferred";
  if (statuses.includes("provider-cooldown")) return "provider-cooldown";
  if (statuses.includes("request-timeout")) return "network-failed";
  if (statuses.length && statuses.every(s => s === "network-failed" || s === "blocked-403")) return "network-failed";
  return "ok";
}

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function fetchOne(id, key, { fetchImpl = fetch, timeoutMs = REQUEST_TIMEOUT_MS } = {}) {
  const url = `${API_BASE}?url=${encodeURIComponent(`https://youtu.be/${id}`)}&lang=en&mode=native`;
  const controller = new AbortController();
  let timer;
  try {
    // One deadline covers connection AND response body. Promise.race also bounds
    // a stalled body reader; AbortController cancels the underlying fetch.
    return await Promise.race([
      (async () => {
        const res = await fetchImpl(url, { signal: controller.signal,
          headers: { "x-api-key": key, "user-agent": UA, accept: "application/json" } });
        const body = await res.json().catch(() => null);
        return { httpStatus: res.status, body, retryAfter: res.headers?.get('retry-after') ?? null };
      })(),
      new Promise(resolve => { timer = setTimeout(() => {
        controller.abort();
        resolve({ httpStatus: 0, body: null, timedOut: true });
      }, timeoutMs); }),
    ]);
  } catch (e) {
    // Network details can contain secrets from a proxy; persist only the outcome.
    return { httpStatus: 0, body: { error: "network" } };
  } finally {
    clearTimeout(timer);
  }
}

export async function collectBatch({ state, plan, queue, key, now = Date.now,
  fetchImpl = fetch, persist = async () => {}, writeTranscript = async () => {},
  sleepImpl = sleep, requestTimeoutMs = REQUEST_TIMEOUT_MS, runTimeoutMs = RUN_TIMEOUT_MS }) {
  validateState(state);
  if (!state.reservation || state.reservation.runKey !== plan.runKey
      || JSON.stringify(state.reservation.videoIds) !== JSON.stringify(plan.videoIds))
    throw new Error('Transcript plan does not match its durable reservation');
  const started = now();
  const summary = { attemptedAt: new Date(started).toISOString(), source: 'supadata', mode: 'native',
    offsetUnit: 'ms', requested: 0, fetched: 0, cached: 0,
    perVideo: { ...plan.perVideo }, verdict: 'ok', note: '' };
  for (const id of Object.keys(summary.perVideo)) {
    if (summary.perVideo[id].startsWith('cached:')) {
      if (!key) { summary.perVideo[id] = 'cache-locked'; continue; }
      try {
        await writeTranscript(id, decryptTranscript(state.cache[id], key));
        summary.cached++;
      } catch {
        summary.perVideo[id] = 'review-required';
        state.videos[id] = { status: 'review-required', failures: state.videos[id]?.failures ?? 0,
          nextAttemptAt: null, reason: 'Cached caption cannot be decrypted or written; restore the prior key/cache before considering a duplicate request' };
      }
    }
  }
  if (!key) {
    summary.verdict = "no-credentials";
    summary.note = 'TRANSCRIPT_API_KEY not configured — queued videos stay pending';
  } else {
    for (const id of plan.videoIds) {
      if (now() - started >= runTimeoutMs) { summary.note = 'Stage deadline reached; remaining queue untouched'; break; }
      const video = queue.find(v => v?.id === id);
      if (!video) continue;
      summary.requested++;
      const { httpStatus, body, retryAfter, timedOut } = await fetchOne(id, key, {
        fetchImpl, timeoutMs: Math.min(requestTimeoutMs, runTimeoutMs - (now() - started)),
      });
      let { status, stop } = statusOf(httpStatus, body);
      if (timedOut) status = 'request-timeout';
      let transcript = null;
      if (status === "fetched") {
        const chunks = chunksOf(body);
        if (chunks) {
          transcript = {
            id, creator: video.creator ?? null, title: video.title ?? null,
            lang: body.lang ?? "en", availableLangs: body.availableLangs ?? [],
            fetchedAt: new Date(now()).toISOString(), source: "supadata", offsetUnit: "ms", chunks,
          };
          summary.perVideo[id] = `fetched:${chunks.length}`;
          summary.fetched++;
        } else {
          status = body?.jobId ? 'async-deferred' : 'empty';
          summary.perVideo[id] = status;
        }
      } else {
        summary.perVideo[id] = status;
      }
      recordOutcome(state, id, status, { now: now(), retryAfter,
        transcript: transcript ? encryptTranscript(transcript, key) : null });
      if (state.videos[id].status === 'review-required') summary.perVideo[id] = 'review-required';
      await persist(state); // save both outcomes and successful captions before later work
      if (transcript) await writeTranscript(id, transcript);
      if (stop) { summary.note = `stopped early on ${status} (${id}) — remaining queue untouched`; break; }
      if (id !== plan.videoIds.at(-1)) await sleepImpl(Math.min(1100, Math.max(0, runTimeoutMs - (now() - started))));
    }
  }
  for (const id of plan.videoIds) if (summary.perVideo[id] === 'reserved') summary.perVideo[id] = 'not-attempted';
  finishBatch(state, now());
  await persist(state);
  summary.usage = usageOf(state, now(), plan.budget);
  summary.retry = Object.fromEntries(Object.entries(state.videos).filter(([id]) => Object.hasOwn(summary.perVideo, id)));
  summary.verdict = verdictOf(summary.perVideo, Boolean(key));
  return summary;
}

async function atomicJson(file, value) {
  await writeFile(`${file}.tmp`, JSON.stringify(value, null, 2) + '\n');
  await rename(`${file}.tmp`, file);
}

async function main() {
  const outDir = path.join(rootDir, 'transcript-fetch');
  await mkdir(outDir, { recursive: true });
  const stateFile = path.join(outDir, 'state.json');
  const planFile = path.join(outDir, 'plan.json');
  const queueDoc = JSON.parse(await readFile(path.join(rootDir, 'data', 'pending-transcripts.json'), 'utf8'));
  if (!Array.isArray(queueDoc?.videos)) throw new Error('Transcript queue is unreadable; no requests sent');
  const queue = queueDoc.videos;
  const now = Date.now();
  const runKey = process.env.GITHUB_RUN_ID
    ? `${process.env.GITHUB_RUN_ID}-${process.env.GITHUB_RUN_ATTEMPT || '1'}` : `local-${now}`;
  let state;
  try { state = validateState(JSON.parse(await readFile(stateFile, 'utf8'))); }
  catch (error) {
    if (error.code !== 'ENOENT' || !(process.argv.includes('--initialize') || process.env.TRANSCRIPT_STATE_INITIALIZE === 'true'))
      throw new Error('Transcript state unavailable or corrupt; restore it or explicitly initialize the first installation');
    state = newState(now);
  }
  const fetchOnly = process.argv.includes('--fetch');
  let plan;
  if (!fetchOnly) {
    ({ state, plan } = prepareBatch(state, queue, { now, runKey, perRunCap: PER_RUN_CAP,
      budget: requestBudget(process.env.TRANSCRIPT_REQUEST_BUDGET),
      retryIds: process.env.TRANSCRIPT_RETRY_IDS || '' }));
    // Previous-run output must not be presented as freshly fetched in this run.
    for (const name of await readdir(outDir)) {
      if (/^[A-Za-z0-9_-]{11}\.json$/.test(name)) await unlink(path.join(outDir, name));
    }
    await unlink(path.join(outDir, 'summary.json')).catch(error => { if (error.code !== 'ENOENT') throw error; });
    await atomicJson(stateFile, state);
    await atomicJson(planFile, plan);
    if (process.argv.includes('--prepare')) {
      console.log(`transcript reservation: ${plan.videoIds.length} requests; upload before --fetch`);
      return;
    }
  } else {
    plan = JSON.parse(await readFile(planFile, 'utf8'));
    if (plan.runKey !== runKey) throw new Error('Transcript reservation belongs to another run');
  }
  const summary = await collectBatch({ state, plan, queue, key: process.env.TRANSCRIPT_API_KEY || '',
    persist: value => atomicJson(stateFile, value),
    writeTranscript: (id, value) => atomicJson(path.join(outDir, `${id}.json`), value),
  });
  await atomicJson(path.join(outDir, 'summary.json'), summary);
  console.log(`transcript fetch: verdict=${summary.verdict} fetched=${summary.fetched}/${summary.requested}, cached=${summary.cached} (queue ${queue.length})`);
  if (summary.verdict !== "ok" && summary.verdict !== "no-credentials")
    console.log(`::warning::transcript fetch degraded — ${summary.verdict}: ${summary.note || "see transcript-fetch/summary.json"}`);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) await main();
