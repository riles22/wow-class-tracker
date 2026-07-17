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
 * Free-tier budget: 100 requests/month → hard per-run cap below; the queue is the
 * single source of what is wanted, and only the agent edits the queue.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
export const VALID_ID = /^[A-Za-z0-9_-]{11}$/; // YouTube video id — the only queue field that reaches a URL
export const PER_RUN_CAP = 25;
export const API_BASE = "https://api.supadata.ai/v1/transcript";

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
  if (httpStatus === 401 || httpStatus === 403 || code === "unauthorized") return { status: "unauthorized", stop: true };
  if (httpStatus === 429 || code === "limit-exceeded" || code === "upgrade-required") return { status: "limit-exceeded", stop: true };
  if (httpStatus === 404 || code === "transcript-unavailable" || code === "not-found") return { status: "unavailable", stop: false };
  if (httpStatus === 0) return { status: "network-failed", stop: false };
  return { status: `error:${code ?? httpStatus}`, stop: false };
}

/* Overall verdict from per-video results: the worst credential-shaped problem wins,
   plain content problems (unavailable/empty) still count as an ok run. */
export function verdictOf(results, hadKey) {
  if (!hadKey) return "no-credentials";
  const statuses = Object.values(results);
  if (statuses.includes("unauthorized")) return "unauthorized";
  if (statuses.includes("limit-exceeded")) return "limit-exceeded";
  if (statuses.length && statuses.every(s => s === "network-failed")) return "network-failed";
  return "ok";
}

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function fetchOne(id, key) {
  const url = `${API_BASE}?url=${encodeURIComponent(`https://youtu.be/${id}`)}&lang=en&mode=native`;
  try {
    const res = await fetch(url, { headers: { "x-api-key": key, "user-agent": UA, accept: "application/json" } });
    const body = await res.json().catch(() => null);
    return { httpStatus: res.status, body };
  } catch (e) {
    return { httpStatus: 0, body: { error: "network", details: String(e?.message ?? e) } };
  }
}

async function main() {
  const outDir = path.join(rootDir, "transcript-fetch");
  await mkdir(outDir, { recursive: true });
  const key = process.env.TRANSCRIPT_API_KEY || "";
  const summary = { attemptedAt: new Date().toISOString(), source: "supadata", mode: "native",
    offsetUnit: "ms", requested: 0, fetched: 0, perVideo: {}, verdict: "ok", note: "" };

  let queue = [];
  try {
    const q = JSON.parse(await readFile(path.join(rootDir, "data", "pending-transcripts.json"), "utf8"));
    queue = Array.isArray(q?.videos) ? q.videos : [];
  } catch (e) {
    summary.note = `queue unreadable (${String(e?.message ?? e)}) — nothing fetched`;
  }

  if (!key) {
    summary.verdict = "no-credentials";
    summary.note = summary.note || `TRANSCRIPT_API_KEY not configured — ${queue.length} queued video(s) stay pending (owner: add the repo secret to activate this lane)`;
  } else {
    const batch = queue.slice(0, PER_RUN_CAP);
    if (queue.length > batch.length) summary.note = `queue ${queue.length} > per-run cap ${PER_RUN_CAP} — ${queue.length - batch.length} left for the next run`;
    for (const video of batch) {
      const id = String(video?.id ?? "");
      if (!VALID_ID.test(id)) { summary.perVideo[id || "(missing-id)"] = "invalid-id"; continue; }
      summary.requested++;
      const { httpStatus, body } = await fetchOne(id, key);
      const { status, stop } = statusOf(httpStatus, body);
      if (status === "fetched") {
        const chunks = chunksOf(body);
        if (chunks) {
          await writeFile(path.join(outDir, `${id}.json`), JSON.stringify({
            id, creator: video.creator ?? null, title: video.title ?? null,
            lang: body.lang ?? "en", availableLangs: body.availableLangs ?? [],
            fetchedAt: summary.attemptedAt, source: "supadata", offsetUnit: "ms", chunks,
          }, null, 2));
          summary.perVideo[id] = `fetched:${chunks.length}`;
          summary.fetched++;
        } else {
          summary.perVideo[id] = body?.jobId ? "async-deferred" : "empty";
        }
      } else {
        summary.perVideo[id] = status;
      }
      if (stop) { summary.note = `stopped early on ${status} (${id}) — remaining queue untouched`; break; }
      await sleep(1100); // polite pacing well inside any per-minute limit
    }
  }

  summary.verdict = verdictOf(summary.perVideo, Boolean(key));
  await writeFile(path.join(outDir, "summary.json"), JSON.stringify(summary, null, 2));
  console.log(`transcript fetch: verdict=${summary.verdict} fetched=${summary.fetched}/${summary.requested} (queue ${queue.length})`);
  if (summary.verdict !== "ok" && summary.verdict !== "no-credentials")
    console.log(`::warning::transcript fetch degraded — ${summary.verdict}: ${summary.note || "see transcript-fetch/summary.json"}`);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) await main();
