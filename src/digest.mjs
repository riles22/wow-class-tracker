/* Per-run change digest (owner-requested 2026-07-17): compares two committed data
 * states through the SAME derivation the site uses (render.mjs buildPayload) and
 * emits a compact markdown summary — tier moves (consensus, our 12.1 projection,
 * and each tier-list source), new creator takes/meta notes, new PTR builds,
 * writeup-verdict changes, and the run's health line from the manifest.
 *
 * The publish job posts this as a comment on the pinned "Nightly digest" issue;
 * GitHub's own notification mail delivers it to the subscribed owner. Deterministic,
 * no AI, no credentials beyond the workflow's GITHUB_TOKEN.
 *
 * Usage: node src/digest.mjs <oldRev> <newRev>     (e.g. HEAD^ HEAD)
 */
import { execFileSync } from "node:child_process";
import { buildPayload } from "./render.mjs";

const keyOf = s => `${s.class}|${s.spec}`;
const TIER_LABEL = { raid: "Raid", mplus: "M+" };

/* ---------- pure diff helpers (unit-tested) ---------- */

/* Tier movements across both brackets for consensus, projection, and every
   tier-list source. Old/new are buildPayload outputs. */
export function tierMoves(oldPayload, newPayload) {
  const oldBy = new Map(oldPayload.specs.map(s => [keyOf(s), s]));
  const srcNames = new Map((newPayload.sources ?? []).filter(s => s.kind === "tier-list").map(s => [s.id, s.name]));
  const moves = [];
  for (const s of newPayload.specs) {
    const o = oldBy.get(keyOf(s));
    if (!o) continue;
    const parts = [];
    for (const b of ["raid", "mplus"]) {
      const ct = t => t?.tier ?? null;
      if (ct(o.consensus?.[b]) !== ct(s.consensus?.[b]) && (ct(o.consensus?.[b]) || ct(s.consensus?.[b])))
        parts.push(`consensus ${TIER_LABEL[b]} ${ct(o.consensus?.[b]) ?? "—"} → ${ct(s.consensus?.[b]) ?? "—"}`);
      if (ct(o.projection?.[b]) !== ct(s.projection?.[b]) && (ct(o.projection?.[b]) || ct(s.projection?.[b])))
        parts.push(`our 12.1 ${TIER_LABEL[b]} ${ct(o.projection?.[b]) ?? "—"} → ${ct(s.projection?.[b]) ?? "—"}`);
      for (const [id, name] of srcNames) {
        const ov = o.ratings?.[b]?.[id] ?? null, nv = s.ratings?.[b]?.[id] ?? null;
        if (ov !== nv && (ov || nv)) parts.push(`${name} ${TIER_LABEL[b]} ${ov ?? "—"} → ${nv ?? "—"}`);
      }
    }
    if (parts.length) moves.push({ spec: `${s.spec} ${s.class}`, parts });
  }
  return moves;
}

/* Entries present in `now` but not in `was`, by an identity function. */
export function newEntries(was, now, identity) {
  const seen = new Set((was ?? []).map(identity));
  return (now ?? []).filter(e => !seen.has(identity(e)));
}

export function verdictChanges(oldPayload, newPayload) {
  const oldBy = new Map(oldPayload.specs.map(s => [keyOf(s), s]));
  const out = [];
  for (const s of newPayload.specs) {
    const o = oldBy.get(keyOf(s));
    const ov = o?.ptr?.verdict ?? null, nv = s.ptr?.verdict ?? null;
    if (o && ov !== nv) out.push(`${s.spec} ${s.class}: ${ov ?? "no writeup"} → ${nv ?? "no writeup"}`);
  }
  return out;
}

const cap = (arr, n, line) => arr.slice(0, n).map(line).concat(arr.length > n ? [`- …and ${arr.length - n} more`] : []);

export function digestMarkdown({ oldPayload, newPayload, manifest, runUrl }) {
  const takeId = t => `${t.creator}|${t.spec}|${t.url}`;
  const noteId = n => `${n.creator}|${n.spec}|${n.patchContext}|${n.url}`;
  const buildId = b => String(b.forumPostNumber ?? `${b.date}|${b.label}`);
  const moves = tierMoves(oldPayload, newPayload);
  const takes = newEntries(oldPayload.creatorTakes?.takes, newPayload.creatorTakes?.takes, takeId).filter(t => !t.superseded);
  const notes = newEntries(oldPayload.creatorTakes?.metaNotes, newPayload.creatorTakes?.metaNotes, noteId).filter(n => !n.superseded);
  const builds = newEntries(oldPayload.ptrBuilds?.builds, newPayload.ptrBuilds?.builds, buildId);
  const verdicts = verdictChanges(oldPayload, newPayload);

  const lines = [];
  if (manifest?.summary) lines.push(`> ${manifest.summary}`);
  if (runUrl) lines.push(`> [workflow run](${runUrl})`);
  lines.push("");

  if (moves.length) {
    lines.push(`**Tier moves (${moves.length} spec${moves.length === 1 ? "" : "s"}):**`);
    lines.push(...cap(moves, 14, m => `- **${m.spec}** — ${m.parts.join(" · ")}`), "");
  }
  if (builds.length) {
    lines.push(`**New PTR build${builds.length === 1 ? "" : "s"}:**`);
    lines.push(...builds.map(b => `- ${b.date} — ${b.label}${b.forumUrl ? ` ([notes](${b.forumUrl}))` : ""}`), "");
  }
  if (verdicts.length) lines.push(`**Writeup verdicts:**`, ...verdicts.map(v => `- ${v}`), "");
  if (takes.length) {
    lines.push(`**New creator takes (${takes.length}):**`);
    lines.push(...cap(takes, 12, t => `- **${t.creator}** on ${t.spec} ${t.class} (${t.sentiment}): ${String(t.claim ?? "").slice(0, 140)}${t.url ? ` — [watch](${t.url})` : ""}`), "");
  }
  if (notes.length) {
    lines.push(`**New meta-outlook notes (${notes.length}):**`);
    lines.push(...cap(notes, 8, n => `- **${n.creator}** on ${n.spec} ${n.class} (${n.sentiment}, ${n.patchContext}): ${String(n.note ?? "").slice(0, 120)}`), "");
  }
  if (!moves.length && !takes.length && !notes.length && !builds.length && !verdicts.length) {
    lines.push("Quiet run: every source re-verified fresh — no tier moves, no new takes, no new builds. (That's honest stability, not a stuck pipeline.)");
  }
  const degraded = (manifest?.sources ?? []).filter(r => r.result && r.result !== "success");
  if (degraded.length) lines.push(`_Health: ${degraded.length} source${degraded.length === 1 ? "" : "s"} degraded (${degraded.map(r => r.source).join(", ")}) — details in the run manifest._`);
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/* ---------- rev loading (main only — git is the data source) ---------- */

const showJson = (rev, file) => JSON.parse(execFileSync("git", ["show", `${rev}:data/${file}`], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }));

export function payloadAt(rev) {
  const data = {
    specs: showJson(rev, "specs.json"), sources: showJson(rev, "sources.json"),
    scales: showJson(rev, "scales.json"), community: null,
    ptrBuilds: showJson(rev, "ptr-builds.json"), creatorTakes: showJson(rev, "creator-takes.json"),
    encounterTiers: null, historySnapshot: null, historySnapshots: [],
  };
  return buildPayload(data);
}

const isMain = process.argv[1] && process.argv[1].endsWith("digest.mjs");
if (isMain) {
  const [oldRev, newRev] = [process.argv[2] ?? "HEAD^", process.argv[3] ?? "HEAD"];
  let manifest = null;
  try { manifest = showJson(newRev, "run-manifest.json"); } catch { /* digest still renders without it */ }
  const runUrl = process.env.DIGEST_RUN_URL || null;
  console.log(digestMarkdown({ oldPayload: payloadAt(oldRev), newPayload: payloadAt(newRev), manifest, runUrl }));
}
