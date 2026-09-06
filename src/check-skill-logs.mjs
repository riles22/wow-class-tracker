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

export function checkSkillLogs(root = ROOT, { stage = false } = {}) {
  const git = args => execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const allowed = splitPaths(git(["ls-tree", "-r", "--name-only", "-z", "HEAD", "--", SCOPE])).filter(isLog);
  const changed = splitPaths(git(["diff", "--no-renames", "--name-only", "-z", "HEAD", "--", SCOPE]));
  const staged = splitPaths(git(["diff", "--cached", "--no-renames", "--name-only", "-z", "HEAD", "--", SCOPE]));
  // Include ignored untracked paths too: artifact upload does not honor .gitignore.
  const untracked = splitPaths(git(["ls-files", "--others", "-z", "--", SCOPE]))
    .filter(file => file.endsWith("/log.md")); // only log.md files travel in the artifact
  const candidates = [...new Set([...changed, ...staged, ...untracked])];
  const unknown = candidates.filter(file => !allowed.includes(file));
  if (unknown.length) throw new Error(`Unapproved skill paths in refresh output: ${unknown.map(JSON.stringify).join(", ")}`);

  const warnings = [];
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
    const was = lines(git(["show", `HEAD:${file}`]));
    const now = lines(readFileSync(path.join(root, file), "utf8"));
    if (!was.size) continue;
    const kept = [...was].filter(line => now.has(line)).length;
    const pct = Math.round(kept / was.size * 100);
    if (pct < 20) warnings.push(`${JSON.stringify(file)} retained only ${pct}% of its previous lines — check the diff before trusting this run precedent`);
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
