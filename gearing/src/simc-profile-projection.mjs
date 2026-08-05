import { createHash } from "node:crypto";

const GEAR_KEYS = new Set([
  "head", "neck", "shoulder", "shoulders", "back", "chest", "wrist", "wrists", "hands",
  "waist", "legs", "feet", "finger1", "finger2", "trinket1", "trinket2", "main_hand",
  "off_hand",
]);
const REVIEWED_SEPARATELY = new Set(["talents"]);
const CURATION_COMMENTS = [
  "# Curated same-gear profile:",
  "# Upstream actor name:",
  "# Upstream actor/APL:",
  "# Upstream generator SHA-256:",
  "# Talent source:",
  "# Gear plan SHA-256:",
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assignment(line) {
  const match = line.match(/^\s*([a-z][a-z0-9_.]*)(\+?=)\s*(.*?)\s*$/i);
  return match ? { key: match[1].toLowerCase(), operator: match[2], value: match[3] } : null;
}

function unquote(value) {
  const text = String(value || "").trim();
  if ((text.startsWith('"') && text.endsWith('"'))
    || (text.startsWith("'") && text.endsWith("'"))) return text.slice(1, -1);
  return text;
}

export function canonicalActorProjection(profileBytes, actorName) {
  assert(typeof actorName === "string" && actorName.trim(),
    "actor projection requires a materialized actor name");
  const text = Buffer.isBuffer(profileBytes) ? profileBytes.toString("utf8") : String(profileBytes);
  const projected = [];
  let sawActor = false;
  let sawActions = false;
  for (const sourceLine of text.replace(/\r\n/g, "\n").split("\n")) {
    const line = sourceLine.trim();
    if (!line) continue;
    if (CURATION_COMMENTS.some((prefix) => line.startsWith(prefix))
      || line === "# Gear Summary" || /^# (?:gear_|set_bonus=)/.test(line)) continue;
    const entry = assignment(line);
    if (!entry) {
      projected.push(line);
      continue;
    }
    if (GEAR_KEYS.has(entry.key) || REVIEWED_SEPARATELY.has(entry.key)) continue;
    let value = entry.value.trim();
    if (unquote(value) === actorName) {
      assert(!sawActor, "actor projection contains duplicate materialized actor declarations");
      value = "<actor>";
      sawActor = true;
    }
    if (entry.key === "actions" || entry.key.startsWith("actions.")) sawActions = true;
    projected.push(`${entry.key}${entry.operator}${value}`);
  }
  assert(sawActor, "actor projection lacks the materialized actor declaration");
  assert(sawActions, "actor projection lacks a default action priority list");
  return `${projected.join("\n")}\n`;
}

export function actorProjectionSha256(profileBytes, actorName) {
  return createHash("sha256").update(canonicalActorProjection(profileBytes, actorName)).digest("hex");
}
