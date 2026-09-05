import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { OFFICIAL_NOTE_SOURCES, postIdentity, sectionIdentity, pendingLedger, validateOfficialNotes } from "./official-notes.mjs";

export function checkOfficialNotes({ ledger, evidence, baseLedger, specs, ptrBuilds, now = Date.now() }) {
  const errors = validateOfficialNotes(ledger, { specs, ptrBuilds, requireResolved: true, now }), warnings = [];
  if (!ledger) errors.push("Official-note ledger is missing");
  const stamp = Date.parse(evidence?.checkedAt);
  if (evidence?.schemaVersion !== 1 || !evidence.sources || !Number.isFinite(stamp) || stamp > +now + 300000 || +now - stamp > 36 * 3600000) return { errors: [...errors, "Official-note evidence is missing, stale, or from the future"], warnings };
  if (Object.keys(evidence.sources).length !== OFFICIAL_NOTE_SOURCES.length) errors.push("Official-note evidence source inventory differs");
  for (const config of OFFICIAL_NOTE_SOURCES) {
    const receipt = evidence.sources[config.id], current = ledger?.sources?.[config.id];
    if (!receipt || receipt.topicId !== config.topicId || receipt.patch !== config.patch || receipt.era !== config.era || !["success", "unreachable", "invalid"].includes(receipt.status)) { errors.push(`${config.id}: evidence identity/status invalid`); continue; }
    if (receipt.status !== "success") {
      if (!baseLedger?.sources?.[config.id] || JSON.stringify(current) !== JSON.stringify(baseLedger.sources[config.id])) errors.push(`${config.id}: unreachable source must preserve committed ledger unchanged`);
      if (receipt.status === "invalid") errors.push(`${config.id}: official source identity/layout/inventory invalid; parser or source configuration needs review (${receipt.details ?? "invalid receipt"})`);
      else warnings.push(`${config.id}: ordinary source fetch failed; prior evidence retained (${receipt.details ?? "unreachable"})`);
      continue;
    }
    if (current?.checkedAt !== evidence.checkedAt || !Array.isArray(receipt.posts) || !receipt.posts.length || JSON.stringify(current?.posts?.map(postIdentity)) !== JSON.stringify(receipt.posts.map(postIdentity))) errors.push(`${config.id}: ledger does not match trusted current source revision/section inventory`);
    const expected = pendingLedger(evidence, baseLedger ?? undefined).sources[config.id];
    const removals = source => (source?.removedSections ?? []).map(s => ({ ...sectionIdentity(s), removedAt: s.removedAt }));
    if (JSON.stringify(removals(current)) !== JSON.stringify(removals(expected))) errors.push(`${config.id}: removed-section review inventory differs from committed history`);
  }
  return { errors, warnings };
}

async function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const args = process.argv.slice(2), base = args.find(a => a.startsWith("--base="))?.slice(7) ?? "HEAD";
  const evidencePath = args.find(a => a.startsWith("--evidence="))?.slice(11) ?? "official-notes/evidence.json";
  if (args.some(a => !a.startsWith("--base=") && !a.startsWith("--evidence=")) || !/^[a-zA-Z0-9_./~-]+$/.test(base) || base.startsWith("-")) throw new Error("Usage: check-official-notes.mjs [--base=HEAD] [--evidence=official-notes/evidence.json]");
  const read = async p => JSON.parse(await readFile(path.resolve(root, p), "utf8"));
  let baseLedger = null;
  // Missing in the first rollout is valid only when both current sources fetched.
  const exists = execFileSync("git", ["ls-tree", base, "--", "data/official-notes.json"], { cwd: root, encoding: "utf8" }).trim();
  if (exists) baseLedger = JSON.parse(execFileSync("git", ["show", `${base}:data/official-notes.json`], { cwd: root, encoding: "utf8" }));
  const [ledger, evidence, specs, ptrBuilds] = await Promise.all([read("data/official-notes.json"), read(evidencePath), read("data/specs.json"), read("data/ptr-builds.json")]);
  const result = checkOfficialNotes({ ledger, evidence, baseLedger, specs, ptrBuilds });
  for (const warning of result.warnings) console.warn(`WARNING: ${warning}`);
  if (result.errors.length) throw new Error(result.errors.join("\n"));
  console.log("Official-note revisions, section dispositions and applied references verified.");
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(error.message); process.exitCode = 1; });
