// The weekly guide refresh's verdict on its three harvests (the last step of
// gearing-refresh.yml). A harvest that stopped after three consecutive transport failures
// (a 403, the AWS WAF challenge, timeouts) leaves `blocked` in its staging file: the site
// walled the runner and the published guide stays as it was. That warns rather than fails,
// because the freshness heartbeat already ages each guide against its 30-day limit (owner
// decision 2026-10-28). Any other unsuccessful harvest fails the run, and so does an outcome
// or staging file this script cannot read.
import { appendFileSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { GEARING_GUIDE_SOURCES } from "./check-gearing-guides.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** `outcomes` maps each source id to its harvest step's outcome, `stages` to its parsed
 *  `gearing/.guide-work/<id>.json` (null when absent), and `verifiedThrough` to the
 *  published guide's harvestedAt, which only adds context to the message. */
export function surfaceGuideRefresh(outcomes, stages = {}, verifiedThrough = {}) {
  const summary = [], warnings = [], errors = [];
  for (const [id, name] of Object.entries(GEARING_GUIDE_SOURCES)) {
    const outcome = outcomes[id] || "missing";
    const stage = stages[id];
    const blocked = stage?.sourceId === id && typeof stage.blocked?.reason === "string"
      && stage.blocked.reason ? stage.blocked : null;
    const kept = `published guide unchanged${verifiedThrough[id] ? `, verified through ${verifiedThrough[id]}` : ""}`;
    if (outcome === "success") {
      summary.push(`${name}: verified`);
    } else if (outcome === "failure" && blocked) {
      summary.push(`${name}: blocked, ${kept}`);
      warnings.push(`${name}: blocked (${blocked.reason}); ${kept}`);
    } else {
      summary.push(`${name}: ${outcome}, ${kept}`);
      errors.push(`${name}: harvest ${outcome} and not a transport block; ${kept}. Review the gearing-guide-staging artifact.`);
    }
  }
  return { summary, warnings, errors };
}

/** A workflow command reads to the end of its line, so the message is kept to one. */
export const workflowCommand = (kind, message) =>
  `::${kind}::${String(message).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A")}`;

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const read = (path) => {
    try { return JSON.parse(readFileSync(join(ROOT, path), "utf8")); }
    catch { return null; } // a published harvest removes its staging; anything unreadable fails closed
  };
  const each = (value) => Object.fromEntries(Object.keys(GEARING_GUIDE_SOURCES).map((id) => [id, value(id)]));
  const { summary, warnings, errors } = surfaceGuideRefresh(
    each((id) => process.env[id.toUpperCase()]),
    each((id) => read(`gearing/.guide-work/${id}.json`)),
    each((id) => read(`gearing/data/guides/${id}.json`)?.harvestedAt ?? null));
  if (process.env.GITHUB_STEP_SUMMARY)
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary.map((line) => `- ${line}\n`).join(""));
  for (const line of summary) console.log(line);
  for (const message of warnings) console.log(workflowCommand("warning", message));
  for (const message of errors) console.log(workflowCommand("error", message));
  if (errors.length) process.exitCode = 1;
}
