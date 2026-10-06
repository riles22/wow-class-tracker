/* Publish-side admission for refresh skill logs. HEAD is the owner-reviewed allowlist;
   neither artifact filenames nor the mutable Git index may extend it. */
import { execFileSync } from "node:child_process";
import { lstatSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCOPE = ".claude/skills/";
const isLog = file => /^\.claude\/skills\/[^/]+\/log\.md$/.test(file);
const splitPaths = output => output.split("\0").filter(Boolean);
const lines = text => new Set(text.replace(/\r/g, "").split("\n").filter(line => line.trim()));
// A buffer overflow on a large log must not turn a warning into a failed publish.
const gitIn = root => args => execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 });
const logsAt = (git, rev) => splitPaths(git(["ls-tree", "-r", "--name-only", "-z", rev, "--", SCOPE])).filter(isLog);

/* SIZE (audit 2026-10-04, F11). A Read of a file over READ_GATE_BYTES returns nothing, and
   the recovery agent and local runs read these logs whole. Local runs read a Windows
   checkout, which stores CRLF: one byte per line more than the LF blob the runner sees, so
   size is measured that way. The warning line sits 62,144 bytes under the gate, about
   eleven days of ptr-watch, the fastest-growing log, at its 2026-09-29..10-06 rate of
   5.4 KB a day. Like the retention check below, it warns and never fails. */
export const READ_GATE_BYTES = 262_144;
export const LOG_WARN_BYTES = 200_000;
export const checkoutBytes = text => Buffer.byteLength(String(text).replace(/\r?\n/g, "\r\n"));
export const skillOf = file => file.split("/").at(-2);
const n = bytes => bytes.toLocaleString("en-US");
export const sizeWarning = ({ file, bytes }) => `${JSON.stringify(file)} is ${n(bytes)} bytes in a Windows checkout, past the ${n(LOG_WARN_BYTES)}-byte warning line (a Read returns nothing over ${n(READ_GATE_BYTES)}) — in a local or interactive run (a nightly cannot commit SKILL.md), move any lesson that lives only in old entries into SKILL.md, then prune to the newest ~20`;

/* The logs over `limit`, given each log's current text. */
export function oversizedLogs(files, textOf, limit = LOG_WARN_BYTES) {
  return files.map(file => ({ file, bytes: checkoutBytes(textOf(file)) })).filter(log => log.bytes > limit);
}

/* The same measurement for every log in a commit (the nightly digest's view). */
export function oversizedLogsAt(rev, root = ROOT) {
  const git = gitIn(root);
  return oversizedLogs(logsAt(git, rev), file => git(["show", `${rev}:${file}`]));
}

export function checkSkillLogs(root = ROOT, { stage = false } = {}) {
  const git = gitIn(root);
  const allowed = logsAt(git, "HEAD");
  const changed = splitPaths(git(["diff", "--no-renames", "--name-only", "-z", "HEAD", "--", SCOPE]));
  const staged = splitPaths(git(["diff", "--cached", "--no-renames", "--name-only", "-z", "HEAD", "--", SCOPE]));
  // Include ignored untracked paths too: artifact upload does not honor .gitignore.
  const untracked = splitPaths(git(["ls-files", "--others", "-z", "--", SCOPE]))
    .filter(file => file.endsWith("/log.md")); // only log.md files travel in the artifact
  const candidates = [...new Set([...changed, ...staged, ...untracked])];
  const unknown = candidates.filter(file => !allowed.includes(file));
  if (unknown.length) throw new Error(`Unapproved skill paths in refresh output: ${unknown.map(JSON.stringify).join(", ")}`);

  const warnings = [];
  const current = new Map();
  for (const file of candidates) {
    // A missing or replaced log is not a legitimate content-only refresh. Reject links
    // in every parent too, before reading a path supplied by the artifact.
    const parts = file.split("/");
    for (let i = 1; i <= parts.length; i++) {
      const stat = lstatSync(path.join(root, ...parts.slice(0, i)));
      if (stat.isSymbolicLink() || (i === parts.length ? !stat.isFile() : !stat.isDirectory())) {
        throw new Error(`Skill log must be a regular file inside real directories: ${JSON.stringify(file)}`);
      }
    }
    const text = readFileSync(path.join(root, file), "utf8");
    current.set(file, text);
    const was = lines(git(["show", `HEAD:${file}`]));
    const now = lines(text);
    if (!was.size) continue;
    const kept = [...was].filter(line => now.has(line)).length;
    const pct = Math.round(kept / was.size * 100);
    if (pct < 20) warnings.push(`${JSON.stringify(file)} retained only ${pct}% of its previous lines — check the diff before trusting this run precedent`);
  }
  // A log this run did not change is identical to HEAD, so its size is read from HEAD
  // rather than from a working-tree path the checks above never examined.
  for (const log of oversizedLogs(allowed, file => current.get(file) ?? git(["show", `HEAD:${file}`]))) {
    warnings.push(sizeWarning(log));
  }
  // Git pathspec magic is disabled for each literal path. Recheck at staging time so
  // wildcard expansion cannot admit a path added after Gate 0.
  if (stage) git(["add", "--", "data/", "dist/", ...allowed.map(file => `:(literal)${file}`)]);
  return { allowed, changed: candidates, warnings };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = checkSkillLogs(ROOT, { stage: process.argv.includes("--stage") });
    for (const warning of result.warnings) console.log(`::warning::${warning}`);
  } catch (error) {
    console.error(`Skill-log boundary: ${error.message}`);
    process.exitCode = 1;
  }
}
