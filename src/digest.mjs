/* Per-run change digest (owner-requested 2026-07-17): compares two committed data
 * states through the SAME derivation the site uses (render.mjs buildPayload) and
 * emits a compact markdown summary — tier moves (consensus, our 12.1 projection,
 * and each tier-list source), creator-video activity (distilled / skipped /
 * queued, from the pending-transcripts queue diff), new creator takes/meta
 * notes, new PTR builds, writeup-verdict changes, and the run's health line
 * from the manifest.
 *
 * The publish job posts this as a comment on the pinned "Nightly digest" issue;
 * GitHub's own notification mail delivers it to the subscribed owner. Deterministic,
 * no AI, no credentials beyond the workflow's GITHUB_TOKEN.
 *
 * Usage: node src/digest.mjs <oldRev> <newRev>     (e.g. HEAD^ HEAD)
 */
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
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

/* Video-lane activity from the pending-transcripts queue diff. A video that left
   the queue was either distilled (some new take/metaNote cites its id) or
   transcript-verified out of scope; a video that entered it waits for the next
   deterministic transcript run. Queue files may be null at revs predating the lane.
   Callers must pass the UNFILTERED new take/note lists: a take superseded in the
   same run still proves its video was distilled. Id extraction covers every URL
   shape the validator's TAKE_HOSTS allowlist admits (youtu.be/<id> plus
   youtube.com watch?v= / embed / shorts / live). */
const videoId = url => {
  const m = String(url ?? "").match(/youtu\.be\/([\w-]+)/) ??
    String(url ?? "").match(/[?&]v=([\w-]+)/) ??
    String(url ?? "").match(/\/(?:embed|shorts|live)\/([\w-]+)/);
  return m ? m[1] : null;
};
export function videoActivity(oldPending, newPending, newTakes, newNotes) {
  const oldVids = oldPending?.videos ?? [], newVids = newPending?.videos ?? [];
  const queued = newEntries(oldVids, newVids, v => v.id);
  const cleared = newEntries(newVids, oldVids, v => v.id);
  const citedIds = new Set();
  for (const e of [...(newTakes ?? []), ...(newNotes ?? [])]) {
    const id = videoId(e.url);
    if (id) citedIds.add(id);
  }
  return {
    distilled: cleared.filter(v => citedIds.has(v.id)),
    skipped: cleared.filter(v => !citedIds.has(v.id)),
    queued,
    waiting: newVids.filter(v => !queued.some(q => q.id === v.id)),
  };
}

/* The digest is the ONE place third-party text reaches a rendered surface without an
   escaper: YouTube video titles, creator names and take/note claims all originate outside
   this repo and land in a GitHub comment that renders Markdown. A title containing
   `[x](javascript:…)` becomes a link, and an embedded newline breaks out of its bullet and
   can forge new sections (audit 2026-07-24, S1). Collapse whitespace, then escape the
   Markdown control set. Deliberately NOT applied to URL targets — those are already
   https-validated and host-allowlisted, and escaping them would break the links. */
const md = s => String(s ?? "")
  .replace(/\s*\n\s*/g, " ")
  .replace(/([\\`*_[\]()#>|!~])/g, "\\$1")
  .trim();

export function digestMarkdown({ oldPayload, newPayload, manifest, runUrl, oldPending = null, newPending = null }) {
  const takeId = t => `${t.creator}|${t.spec}|${t.url}`;
  const noteId = n => `${n.creator}|${n.spec}|${n.patchContext}|${n.url}`;
  const buildId = b => String(b.forumPostNumber ?? `${b.date}|${b.label}`);
  const moves = tierMoves(oldPayload, newPayload);
  const takesAll = newEntries(oldPayload.creatorTakes?.takes, newPayload.creatorTakes?.takes, takeId);
  const notesAll = newEntries(oldPayload.creatorTakes?.metaNotes, newPayload.creatorTakes?.metaNotes, noteId);
  const takes = takesAll.filter(t => !t.superseded);
  const notes = notesAll.filter(n => !n.superseded);
  const builds = newEntries(oldPayload.ptrBuilds?.builds, newPayload.ptrBuilds?.builds, buildId);
  const verdicts = verdictChanges(oldPayload, newPayload);

  const lines = [];
  if (manifest?.summary) lines.push(`> ${md(manifest.summary)}`);
  if (runUrl) lines.push(`> [workflow run](${runUrl})`);
  lines.push("");

  if (moves.length) {
    lines.push(`**Tier moves (${moves.length} spec${moves.length === 1 ? "" : "s"}):**`);
    lines.push(...cap(moves, 14, m => `- **${m.spec}** — ${m.parts.join(" · ")}`), "");
  }
  if (builds.length) {
    lines.push(`**New PTR build${builds.length === 1 ? "" : "s"}:**`);
    lines.push(...builds.map(b => `- ${b.date} — ${md(b.label)}${b.forumUrl ? ` ([notes](${b.forumUrl}))` : ""}`), "");
  }
  if (verdicts.length) lines.push(`**Writeup verdicts:**`, ...verdicts.map(v => `- ${v}`), "");
  const vids = videoActivity(oldPending, newPending, takesAll, notesAll);
  const watch = v => `[watch](https://youtu.be/${v.id})`;
  if (vids.distilled.length || vids.skipped.length || vids.queued.length || vids.waiting.length) {
    lines.push(`**Creator videos:**`);
    lines.push(...vids.distilled.map(v => `- Distilled — takes below: **${md(v.creator)}** — “${md(v.title)}” (${watch(v)})`));
    lines.push(...vids.skipped.map(v => `- Checked & skipped — transcript verified out of scope, no PvE tier/meta content: **${md(v.creator)}** — “${md(v.title)}” (${watch(v)})`));
    lines.push(...vids.queued.map(v => `- Queued for the next transcript run: **${md(v.creator)}** — “${md(v.title)}” (${v.published ? `published ${v.published}, ` : ""}${watch(v)})`));
    if (vids.waiting.length) lines.push(`- Still waiting in the queue: ${vids.waiting.map(v => `**${md(v.creator)}** “${md(v.title)}”`).join(" · ")}`);
    lines.push("");
  }
  if (takes.length) {
    lines.push(`**New creator takes (${takes.length}):**`);
    lines.push(...cap(takes, 12, t => `- **${md(t.creator)}** on ${md(t.spec)} ${md(t.class)} (${md(t.sentiment)}): ${md(t.claim).slice(0, 140)}${t.url ? ` — [watch](${t.url})` : ""}`), "");
  }
  if (notes.length) {
    lines.push(`**New meta-outlook notes (${notes.length}):**`);
    lines.push(...cap(notes, 8, n => `- **${md(n.creator)}** on ${md(n.spec)} ${md(n.class)} (${md(n.sentiment)}, ${md(n.patchContext)}): ${md(n.note).slice(0, 120)}`), "");
  }
  const videoChange = vids.distilled.length || vids.skipped.length || vids.queued.length;
  const degraded = (manifest?.sources ?? []).filter(r => r.result && r.result !== "success");
  if (!moves.length && !takes.length && !notes.length && !builds.length && !verdicts.length && !videoChange) {
    // "Every source re-verified fresh" was emitted on ANY no-change run, including one
    // where nothing arrived at all — the most comforting possible wording for the least
    // healthy possible night (audit 2026-07-24, A4). Say which it actually was.
    lines.push(degraded.length
      ? `Quiet run — but ${degraded.length} of ${manifest.sources.length} source${degraded.length === 1 ? " was" : "s were"} degraded this run (${degraded.map(r => r.source).join(", ")}). The tracker did not move because that data did not arrive, not because the field is stable.`
      : "Quiet run: every source re-verified fresh — no tier moves, no new takes, no new builds. (That's honest stability, not a stuck pipeline.)");
  }
  if (degraded.length) lines.push(`_Health: ${degraded.length} source${degraded.length === 1 ? "" : "s"} degraded (${degraded.map(r => r.source).join(", ")}) — details in the run manifest._`);
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/* ---------- rev loading (main only — git is the data source) ---------- */

const showJson = (rev, file) => JSON.parse(execFileSync("git", ["show", `${rev}:data/${file}`], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }));

/* The newest frozen forecast artifact AT THAT REV, mirroring loadData's selection. Without
   it the digest builds payloads whose forecast column is the LIVE recomputation, and every
   post-flip digest would narrate "our 12.1" moves on a lane the published page no longer
   renders (measured: 0/80 divergence once the artifact is passed; the whole gap was this).
   Absent dir/file → null, exactly like loadData. */
const frozenForecastAt = rev => {
  try {
    const names = execFileSync("git", ["ls-tree", "--name-only", rev, "data/forecasts/"], { encoding: "utf8" })
      .split("\n").map(l => l.trim()).filter(l => /frozen-\d{4}-\d{2}-\d{2}\.json$/.test(l)).sort();
    const newest = names.at(-1);
    return newest ? JSON.parse(execFileSync("git", ["show", `${rev}:${newest}`], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })) : null;
  } catch { return null; }
};

export function payloadAt(rev) {
  const data = {
    specs: showJson(rev, "specs.json"), sources: showJson(rev, "sources.json"),
    scales: showJson(rev, "scales.json"), community: null,
    ptrBuilds: showJson(rev, "ptr-builds.json"), creatorTakes: showJson(rev, "creator-takes.json"),
    encounterTiers: null, historySnapshot: null, historySnapshots: [],
    frozenForecast: frozenForecastAt(rev),
  };
  return buildPayload(data);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const [oldRev, newRev] = [process.argv[2] ?? "HEAD^", process.argv[3] ?? "HEAD"];
  let manifest = null;
  try { manifest = showJson(newRev, "run-manifest.json"); } catch { /* digest still renders without it */ }
  const pendingAt = rev => { try { return showJson(rev, "pending-transcripts.json"); } catch { return null; } };
  const runUrl = process.env.DIGEST_RUN_URL || null;
  console.log(digestMarkdown({ oldPayload: payloadAt(oldRev), newPayload: payloadAt(newRev), manifest, runUrl,
    oldPending: pendingAt(oldRev), newPending: pendingAt(newRev) }));
}
