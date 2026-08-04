// Pure Icy Veins stat-priority parsing. Kept separate from the network harvester so
// article-heading patch detection and list extraction can be regression-tested.

const STAT_LINE = /^(Intellect|Agility|Strength|Stamina|Mastery|Crit\.? Strike|Critical Strike|Haste|Versatility|Armor|Leech|Speed|Avoidance)\.?$/i;
const NORM = {
  "crit. strike": "Crit", "critical strike": "Crit",
  mastery: "Mast", haste: "Haste", versatility: "Vers",
};
const PRIMARY = new Set(["intellect", "agility", "strength"]);

const textOnly = (html) => html.replace(/<[^>]+>/g, " ")
  .replace(/&mdash;|&#8212;/gi, "—").replace(/&nbsp;/gi, " ")
  .replace(/\s+/g, " ").trim();

export function articlePatch(html) {
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1];
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1];
  const articleHeading = textOnly(h1 || title || "");
  return (articleHeading.match(/(?:—|-)\s*(\d+\.\d+(?:\.\d+)?)(?:\s|$)/) || [])[1] ?? null;
}

export function extractPriority(html) {
  const lines = html
    .replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<[^>]+>/g, "\n").replace(/&nbsp;/g, " ")
    .split("\n").map((s) => s.trim()).filter((s) => s.length > 1);

  const patch = articlePatch(html);
  let run = [];
  const start = lines.findIndex((s) => /good guideline for stats/i.test(s));
  if (start >= 0) {
    for (let i = start + 1; i < Math.min(start + 22, lines.length); i++) {
      if (STAT_LINE.test(lines[i])) run.push(lines[i].replace(/\.$/, ""));
      else if (run.length) break;
    }
  }
  if (run.length < 2) {
    run = [];
    for (let i = 0; i < lines.length; i++) {
      const cur = [];
      let j = i;
      while (j < lines.length && STAT_LINE.test(lines[j])) cur.push(lines[j++].replace(/\.$/, ""));
      if (cur.length > run.length) run = cur;
      if (cur.length) i = j;
    }
  }
  if (run.length < 3) return { priority: null, patch };

  const primary = run.find((s) => PRIMARY.has(s.toLowerCase())) ?? null;
  const secondaries = run
    .filter((s) => !PRIMARY.has(s.toLowerCase()) && !/stamina|armor|leech|speed|avoidance/i.test(s))
    .map((s) => NORM[s.toLowerCase()] ?? s);
  return { priority: { primary, secondaries }, patch };
}
