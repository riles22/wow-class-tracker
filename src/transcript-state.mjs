/* Trusted operational state, kept outside canonical game data and saved before
 * agents run. A reservation counts conservatively until a completed run proves
 * whether a request was sent. An uncertain request is never retried silently. */
import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from 'node:crypto';
export const STATE_VERSION = 1;
export const WINDOW_MS = 30 * 86400_000;
export const HISTORY_MS = 90 * 86400_000;
const DAY = 86400_000;
const ID = /^[A-Za-z0-9_-]{11}$/;
const iso = ms => new Date(ms).toISOString();
const time = value => typeof value === 'string' && Number.isFinite(Date.parse(value));
const own = (object, key) => Object.hasOwn(object, key) ? object[key] : undefined;
const cacheKey = (key, salt) => hkdfSync('sha256', key, salt, 'wow-class-tracker transcript cache v1', 32);

export function encryptTranscript(transcript, key) {
  const salt = randomBytes(16), iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', cacheKey(key, salt), iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(transcript), 'utf8'), cipher.final()]);
  return { id: transcript.id, fetchedAt: transcript.fetchedAt, chunks: transcript.chunks.length,
    algorithm: 'aes-256-gcm', salt: salt.toString('base64'), iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'), data: data.toString('base64') };
}

export function decryptTranscript(cached, key) {
  const decipher = createDecipheriv('aes-256-gcm', cacheKey(key, Buffer.from(cached.salt, 'base64')),
    Buffer.from(cached.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(cached.tag, 'base64'));
  const transcript = JSON.parse(Buffer.concat([decipher.update(Buffer.from(cached.data, 'base64')), decipher.final()]).toString('utf8'));
  if (transcript.id !== cached.id || transcript.fetchedAt !== cached.fetchedAt
      || !Array.isArray(transcript.chunks) || transcript.chunks.length !== cached.chunks)
    throw new Error('Cached caption metadata does not match its encrypted content');
  return transcript;
}

export function newState(now) {
  return { schemaVersion: STATE_VERSION, createdAt: iso(now), updatedAt: iso(now),
    attempts: [], videos: {}, cache: {}, provider: null, reservation: null };
}

export function validateState(state) {
  if (!state || state.schemaVersion !== STATE_VERSION || !time(state.createdAt)
      || !time(state.updatedAt) || !Array.isArray(state.attempts)
      || !state.videos || Array.isArray(state.videos) || !state.cache || Array.isArray(state.cache))
    throw new Error('Transcript state is invalid; refusing to reset usage history');
  for (const a of state.attempts) {
    if (!a || !ID.test(a.videoId) || !time(a.at) || typeof a.runKey !== 'string'
        || typeof a.outcome !== 'string') throw new Error('Invalid transcript attempt');
  }
  for (const [id, v] of Object.entries(state.videos)) {
    if (!ID.test(id) || !v || typeof v.status !== 'string' || !Number.isInteger(v.failures)
        || v.failures < 0 || (v.nextAttemptAt !== null && !time(v.nextAttemptAt)))
      throw new Error('Invalid transcript retry state');
  }
  for (const [id, v] of Object.entries(state.cache)) {
    if (!ID.test(id) || v?.id !== id || !time(v.fetchedAt) || v.algorithm !== 'aes-256-gcm'
        || !Number.isInteger(v.chunks) || v.chunks < 1
        || ['salt', 'iv', 'tag', 'data'].some(k => typeof v[k] !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(v[k])))
      throw new Error('Invalid encrypted transcript cache');
  }
  if (state.provider && (!time(state.provider.nextAttemptAt) || typeof state.provider.status !== 'string'))
    throw new Error('Invalid provider cooldown');
  if (state.reservation && (typeof state.reservation.runKey !== 'string'
      || !time(state.reservation.at) || !Array.isArray(state.reservation.videoIds)
      || state.reservation.videoIds.some(id => !ID.test(id)))) throw new Error('Invalid transcript reservation');
  return state;
}

export function requestBudget(value) {
  if (value === undefined || value === null || value === '') return null;
  if (!/^\d+$/.test(String(value)) || !Number.isSafeInteger(Number(value)))
    throw new Error('TRANSCRIPT_REQUEST_BUDGET must be a nonnegative integer, or unset');
  return Number(value);
}

export function usageOf(state, now, budget = null) {
  const recent = state.attempts.filter(a => Date.parse(a.at) > now - WINDOW_MS);
  return { windowDays: 30, limit: budget, countedRequests: recent.length,
    uncertainRequests: recent.filter(a => ['reserved', 'review-required'].includes(a.outcome)).length,
    remaining: budget === null ? null : Math.max(0, budget - recent.length) };
}

export function prepareBatch(input, queue, { now, runKey, perRunCap = 25, budget = null, retryIds = '' }) {
  const state = structuredClone(validateState(input));
  // A previous reservation may have sent requests before a cancelled runner died.
  // Retain its charge allowance and hold those videos until an operator reviews it.
  if (state.reservation) {
    for (const id of state.reservation.videoIds) {
      const a = state.attempts.find(a => a.runKey === state.reservation.runKey && a.videoId === id);
      if (a?.outcome === 'reserved') {
        a.outcome = 'review-required';
        state.videos[id] = { status: 'review-required', failures: (own(state.videos, id)?.failures ?? 0) + 1,
          nextAttemptAt: null, reason: 'Previous run ended with an unresolved request reservation' };
      }
    }
  }
  state.attempts = state.attempts.filter(a => Date.parse(a.at) > now - HISTORY_MS);
  const ids = new Set(queue.map(v => String(v?.id ?? '')).filter(id => ID.test(id)));
  const reviewedIds = retryIds.trim() ? retryIds.split(',').map(id => id.trim()) : [];
  for (const id of new Set(reviewedIds)) {
    if (!ID.test(id) || !ids.has(id) || own(state.videos, id)?.status !== 'review-required')
      throw new Error(`Reviewed retry ${id} must identify a queued video currently held for review`);
    state.videos[id] = { ...state.videos[id], status: 'retry-approved', nextAttemptAt: iso(now),
      reviewedAt: iso(now), reason: 'Operator approved retry after reviewing possible prior consumption' };
    delete state.cache[id]; // only explicit review can replace an unreadable encrypted cache
  }
  // Cached content is needed only until publication removes the video from queue.
  for (const id of Object.keys(state.cache)) if (!ids.has(id)) delete state.cache[id];
  const selected = [], perVideo = {};
  const usage = usageOf(state, now, budget);
  const allowance = Math.min(perRunCap, usage.remaining ?? perRunCap);
  for (const v of queue) {
    const id = String(v?.id ?? '');
    if (!ID.test(id)) { perVideo[id || '(missing-id)'] = 'invalid-id'; continue; }
    if (Object.hasOwn(perVideo, id)) continue;
    if (own(state.cache, id)) { perVideo[id] = `cached:${state.cache[id].chunks}`; continue; }
    const previous = own(state.videos, id);
    if (previous?.status === 'review-required') { perVideo[id] = 'review-required'; continue; }
    if (state.provider && Date.parse(state.provider.nextAttemptAt) > now) {
      perVideo[id] = 'provider-cooldown'; continue;
    }
    if (previous?.nextAttemptAt && Date.parse(previous.nextAttemptAt) > now) {
      perVideo[id] = 'retry-wait'; continue;
    }
    if (selected.length >= allowance) {
      perVideo[id] = usage.remaining !== null && selected.length >= usage.remaining ? 'budget-deferred' : 'cap-deferred';
      continue;
    }
    selected.push(id);
    perVideo[id] = 'reserved';
    state.attempts.push({ videoId: id, runKey, at: iso(now), outcome: 'reserved' });
  }
  state.reservation = { runKey, at: iso(now), videoIds: selected };
  state.updatedAt = iso(now);
  return { state, plan: { runKey, preparedAt: iso(now), videoIds: selected, perVideo, budget } };
}

export function retryAfterMs(value, now) {
  if (!value) return 0;
  if (/^\d+$/.test(value)) return Number(value) * 1000;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed - now) : 0;
}

export function recordOutcome(state, id, outcome, { now, retryAfter = null, transcript = null }) {
  const a = state.attempts.find(a => a.runKey === state.reservation?.runKey && a.videoId === id);
  if (!a || a.outcome !== 'reserved') throw new Error('Request lacks its trusted reservation');
  const failures = (own(state.videos, id)?.failures ?? 0) + 1;
  const ambiguous = ['network-failed', 'request-timeout', 'empty', 'async-deferred'].includes(outcome)
    || outcome.startsWith('error:');
  const next = { status: ambiguous ? 'review-required' : outcome, failures, nextAttemptAt: null };
  if (own(state.videos, id)?.reviewedAt) next.reviewedAt = state.videos[id].reviewedAt;
  a.outcome = next.status;
  if (ambiguous) next.reason = `${outcome}: provider may have consumed a request; no automatic retry`;
  if (outcome === 'fetched') {
    if (!transcript) throw new Error('Fetched outcome must include the transcript');
    state.cache[id] = transcript;
    next.failures = 0;
  } else if (outcome === 'unavailable') {
    next.nextAttemptAt = iso(now + Math.min(7 * DAY, DAY * 2 ** Math.min(failures - 1, 3)));
  } else if (['limit-exceeded', 'unauthorized', 'blocked-403'].includes(outcome)) {
    const delay = Math.max(DAY, retryAfterMs(retryAfter, now));
    next.nextAttemptAt = iso(now + delay);
    state.provider = { status: outcome, nextAttemptAt: next.nextAttemptAt };
  }
  state.videos[id] = next;
  state.updatedAt = iso(now);
}

export function finishBatch(state, now) {
  const runKey = state.reservation?.runKey;
  // This completed process knows these reservations never reached the network.
  state.attempts = state.attempts.filter(a => a.runKey !== runKey || a.outcome !== 'reserved');
  state.reservation = null;
  state.updatedAt = iso(now);
  return state;
}
