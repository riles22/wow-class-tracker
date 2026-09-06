/* Run BEFORE downloading refresh output onto the publish checkout. The immutable
   workflow SHA is the refresh input baseline; newer owner data/log edits must not
   be replaced by an artifact produced from that older state. Code-only advances
   remain safe to rebuild against. No artifact-written value supplies this SHA. */
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const protectedPath = file => file.startsWith("data/")
  || /^\.claude\/skills\/(?:[^/]+\/)*log\.md$/.test(file);

export function checkRefreshBase(root = ROOT, { baseSha = process.env.REFRESH_BASE_SHA } = {}) {
  if (typeof baseSha !== "string" || !/^[a-f0-9]{40}$/i.test(baseSha))
    throw new Error("REFRESH_BASE_SHA must be the immutable workflow's full 40-character commit SHA");
  const git = args => execFileSync("git", args, { cwd: root, encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"], maxBuffer: 10 * 1024 * 1024 });
  let headSha;
  try {
    if (git(["cat-file", "-t", baseSha]).trim() !== "commit")
      throw new Error("refresh baseline is not a commit");
    headSha = git(["rev-parse", "--verify", "HEAD^{commit}"]).trim();
    git(["merge-base", "--is-ancestor", baseSha, headSha]);
  } catch {
    throw new Error("Refresh base is missing, is not a commit, or is not an ancestor of publish HEAD; start a new refresh on current master");
  }
  // --no-renames reports both sides of moves, so moving data outside its directory
  // cannot hide a deletion. NUL delimiters preserve whitespace and unusual names.
  const changed = git(["diff", "--no-renames", "--name-only", "-z", baseSha, headSha,
    "--", "data/", ".claude/skills/"]).split("\0").filter(Boolean).filter(protectedPath);
  if (changed.length)
    throw new Error(`Publish HEAD has newer data or skill-log edits: ${changed.map(JSON.stringify).join(", ")}; refusing to overlay an older refresh artifact. Start a new refresh on current master`);
  return { baseSha, headSha };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 2) throw new Error("usage: REFRESH_BASE_SHA=<workflow commit> node src/check-refresh-base.mjs");
    const result = checkRefreshBase();
    console.log(`Refresh base ${result.baseSha} admitted against publish HEAD ${result.headSha}; no newer data or skill-log edits`);
  } catch (error) {
    console.error(`Refresh-base boundary: ${error.message}`);
    process.exitCode = 1;
  }
}
