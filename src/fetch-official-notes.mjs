/* Fetch ordinary public Discourse JSON before the agent runs. Receipts are passed
   separately to publish; the agent can resolve sections, never invent receipts. */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { OFFICIAL_NOTE_SOURCES, postReceipt, pendingLedger } from "./official-notes.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fetchError = (message, noteStatus) => Object.assign(new Error(message), { noteStatus });
export async function fetchNoteJSON(url, fetchImpl = fetch) {
  let response;
  try { response = await fetchImpl(url, { signal: AbortSignal.timeout(20000), headers: { Accept: "application/json", "User-Agent": "WoW-Class-Tracker/1.0 (+https://github.com/riles22/wow-class-tracker)" } }); }
  catch (error) { throw fetchError(error.message, "unreachable"); }
  if (!response.ok) throw fetchError(`HTTP ${response.status}`, "unreachable");
  if (response.url && new URL(response.url).origin !== "https://us.forums.blizzard.com") throw fetchError("Unexpected redirect origin", "invalid");
  if (!/json/i.test(response.headers.get("content-type") ?? "")) throw fetchError("Expected public Discourse JSON", "unreachable");
  const reader = response.body.getReader(); let size = 0, chunks = [];
  try {
    while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > 4_000_000) throw fetchError("Official JSON exceeds 4 MB limit", "invalid"); chunks.push(value); }
  } catch (error) {
    throw error.noteStatus ? error : fetchError(error.message, "unreachable");
  } finally { await reader.cancel().catch(() => {}); }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw fetchError("Invalid JSON in official response", "invalid"); }
}

export async function fetchOfficialNotes({ specs, previous, fetchJSON = fetchNoteJSON, now = new Date() }) {
  const evidence = { schemaVersion: 1, checkedAt: now.toISOString(), sources: {} };
  // Sources are independent. A failed source retains its prior ledger byte-for-byte.
  for (const source of OFFICIAL_NOTE_SOURCES) {
    const identity = { topicId: source.topicId, patch: source.patch, era: source.era };
    let received = false;
    try {
      const topic = await fetchJSON(`https://us.forums.blizzard.com/en/wow/t/${source.topicId}.json`);
      received = true;
      if (topic.id !== source.topicId || !Array.isArray(topic.post_stream?.posts)) throw new Error("Topic identity or post stream changed");
      if (source.era === "ptr" ? !topic.title?.includes(`${source.patch} PTR Development Notes`) : !/Midnight Hotfixes/i.test(topic.title ?? "")) throw new Error("Official topic title no longer matches the configured patch/source");
      let posts = topic.post_stream.posts;
      if (source.mode === "staff-posts") {
        const stream = topic.post_stream.stream;
        if (!Array.isArray(stream) || stream.length > 400 || new Set(stream).size !== stream.length) throw new Error("Incomplete or oversized post inventory");
        const missing = stream.filter(id => !posts.some(p => p.id === id));
        for (let i = 0; i < missing.length; i += 20) {
          const wanted = missing.slice(i, i + 20), query = wanted.map(id => `post_ids%5B%5D=${id}`).join("&");
          const more = await fetchJSON(`https://us.forums.blizzard.com/en/wow/t/${source.topicId}/posts.json?${query}`);
          if (!wanted.every(id => more.post_stream?.posts?.some(p => p.id === id))) throw new Error("Post inventory fetch incomplete");
          posts = posts.concat(more.post_stream.posts);
        }
      } else posts = posts.filter(p => p.post_number === 1);
      posts = posts.filter(p => p.staff === true && p.cooked?.trim());
      if (!posts.some(p => p.post_number === 1) || posts.some(p => p.topic_id !== source.topicId)) throw new Error("Official starter post missing or foreign post returned");
      const receipts = posts.sort((a, b) => a.post_number - b.post_number).map(p => postReceipt(p, source, specs));
      evidence.sources[source.id] = { ...identity, status: "success", posts: receipts };
    } catch (error) {
      const status = error.noteStatus ?? (/^HTTP \d{3}\b/.test(error.message) || !received ? "unreachable" : "invalid");
      evidence.sources[source.id] = { ...identity, status, details: String(error.message).slice(0, 300), posts: [] };
    }
  }
  return { evidence, pending: pendingLedger(evidence, previous) };
}

export async function main(root = ROOT) {
  const specs = JSON.parse(await readFile(path.join(root, "data/specs.json"), "utf8"));
  let previous;
  try { previous = JSON.parse(await readFile(path.join(root, "data/official-notes.json"), "utf8")); } catch (error) { if (error.code !== "ENOENT") throw error; }
  const result = await fetchOfficialNotes({ specs, previous });
  const dir = path.join(root, "official-notes"); await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "evidence.json"), JSON.stringify(result.evidence, null, 2) + "\n");
  await writeFile(path.join(dir, "pending.json"), JSON.stringify(result.pending, null, 2) + "\n");
  for (const [id, source] of Object.entries(result.evidence.sources)) console.log(`${id}: ${source.status}; ${source.posts.reduce((n, p) => n + p.sections.length, 0)} class sections${source.details ? `; ${source.details}` : ""}`);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error.message); process.exitCode = 1; });
