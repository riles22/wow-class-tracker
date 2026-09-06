/* The two public numeric feeds deliberately have separate recipes. Neither recipe
   reads tier letters, chart-height percentages, or the Mythicstats /meta widget. */
export const STABLE_SERIES = Object.freeze({
  murlok: { name: "Top-50 avg M+ rating (ceiling)", unit: "rating" },
  mythicstats: { name: "Top-2000 keys representation", unit: "%" },
});
export const ROLE_COUNTS = Object.freeze({ DPS: 27, Healer: 7, Tank: 6 });
export const metricKey = row => `${row.class}|${row.spec}`;
const normalize = value => String(value).toLowerCase().replace(/[-\s]+/g, " ").trim();
const text = html => html.replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, " ")
  .replace(/<[^>]*>/g, " ").replace(/&(?:nbsp|#160);/gi, " ")
  .replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim();
const hasClass = (attrs, name) => (attrs.class ?? "").split(/\s+/).includes(name);
export function attributes(value) {
  const result = {};
  for (const item of value.matchAll(/([^\s=<>/]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s<>]+))/g)) {
    const name = item[1].toLowerCase();
    if (Object.hasOwn(result, name)) throw new Error(`Duplicate HTML attribute ${name}`);
    result[name] = item[2] ?? item[3] ?? item[4];
  }
  return result;
}
export function validDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
export function validateRoster(roster) {
  if (!Array.isArray(roster) || roster.length !== 40 || new Set(roster.map(metricKey)).size !== 40
    || Object.entries(ROLE_COUNTS).some(([role, count]) => roster.filter(s => s.role === role).length !== count)
    || !roster.some(s => s.class === "Demon Hunter" && s.spec === "Devourer")) {
    throw new Error("Expected the complete 40-spec Midnight roster (27 DPS / 7 healers / 6 tanks)");
  }
}
function safeBody(html) {
  if (typeof html !== "string" || Buffer.byteLength(html) > 2 * 1024 * 1024) throw new Error("Unexpected HTML body size");
  if (/Just a moment|human verification|verify you are human|cf-chl-/i.test(html)) throw new Error("Source verification wall");
  return html.replace(/<!--[^]*?-->/g, "").replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "");
}
function sourceDate(value, checkedAt) {
  if (!validDate(value) || value > checkedAt.slice(0, 10)) throw new Error(`Invalid or future source date: ${value}`);
  return value;
}
function metric(spec, source, value, asOf) {
  return { class: spec.class, spec: spec.spec, source, bracket: "mplus", ...STABLE_SERIES[source], value, asOf };
}

export function parseMurlok(html, { roster, role, liveSeason, checkedAt }) {
  validateRoster(roster);
  html = safeBody(html);
  if (!Object.hasOwn(ROLE_COUNTS, role)) throw new Error(`Unknown Murlok role ${role}`);
  const title = text(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
  const season = title.match(/\bMidnight Season (\d+)\b/i)?.[1];
  if (!season || `s${season}` !== liveSeason || !title.includes("Mythic+")) throw new Error("Murlok season/content could not be verified");
  const dates = [...html.matchAll(/<time\b([^>]*)>([\s\S]*?)<\/time>/gi)]
    .filter(m => /^Updated\b/i.test(text(m[2]))).map(m => attributes(m[1]).datetime);
  if (dates.length !== 1 || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(dates[0])
    || Number.isNaN(Date.parse(dates[0])) || Date.parse(dates[0]) > Date.parse(checkedAt)) {
    throw new Error("Murlok is missing one valid source-owned update timestamp");
  }
  const asOf = sourceDate(dates[0].slice(0, 10), checkedAt);
  const roleRoster = roster.filter(s => s.role === role);
  const byLabel = new Map(roleRoster.map(s => [normalize(`${s.spec} ${s.class}`), s]));
  const rows = [], ranks = [], seen = new Set();
  for (const anchor of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const attrs = attributes(anchor[1]);
    if (!hasClass(attrs, "meta-item")) continue;
    const labels = [...anchor[2].matchAll(/<div\b([^>]*)>([^<>]*)<\/div>/gi)]
      .filter(m => hasClass(attributes(m[1]), "h3")).map(m => text(m[2]));
    const spec = byLabel.get(normalize(labels[1]));
    const numeric = [...anchor[2].matchAll(/<li\b([^>]*)>([\s\S]*?)<\/li>/gi)]
      .filter(m => hasClass(attributes(m[1]), "vi-media-object")).map(m => text(m[2]));
    if (labels.length !== 2 || !/^\d+$/.test(labels[0]) || !spec || seen.has(metricKey(spec))
      || numeric.length !== 1 || !/^\d+(?:\.\d+)?$/.test(numeric[0])) throw new Error("Malformed, duplicate, or unmatched Murlok leaderboard row");
    const expectedPath = `/${spec.class.toLowerCase().replace(/ /g, "-")}/${spec.spec.toLowerCase().replace(/ /g, "-")}/m+`;
    if (attrs.href !== expectedPath) throw new Error(`Murlok href/label mismatch for ${metricKey(spec)}`);
    const value = Math.round(Number(numeric[0]));
    if (value <= 0 || value > 10000) throw new Error("Murlok rating is outside the supported range");
    seen.add(metricKey(spec)); ranks.push(Number(labels[0])); rows.push(metric(spec, "murlok", value, asOf));
  }
  if (rows.length !== ROLE_COUNTS[role] || ranks.some((rank, i) => rank !== i + 1)) {
    throw new Error(`Partial Murlok ${role} leaderboard: ${rows.length}/${ROLE_COUNTS[role]} rows or non-contiguous ranks`);
  }
  if (rows.some((row, i) => i && row.value > rows[i - 1].value)) throw new Error("Murlok rating order disagrees with leaderboard ranks");
  return { rows, sourceAsOf: asOf, sourceTimestamp: dates[0], dateBasis: "source-time-datetime", roleCounts: { [role]: rows.length } };
}

export function parseMythicstats(html, { roster, liveSeason, checkedAt, finalUrl, publishedAt = null }) {
  validateRoster(roster);
  html = safeBody(html);
  const periodId = new URL(finalUrl).pathname.match(/^\/period\/(\d+)\/?$/)?.[1];
  const title = text(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
  const heading = title.match(/^Period (\d+) MID(\d+)\b/);
  if (!periodId || heading?.[1] !== periodId || `s${heading?.[2]}` !== liveSeason) throw new Error("Mythicstats period/season could not be verified");
  if (!/\bTop 2000 keys, 10000 characters\b/.test(text(html))) throw new Error("Mythicstats top-2000 population could not be verified");
  const sections = [...html.matchAll(/<section\b[^>]*>([\s\S]*?)<\/section>/gi)]
    .filter(m => [...m[1].matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)].some(h => text(h[1]) === "Spec representation in top keys"));
  if (sections.length !== 1) throw new Error("Missing or ambiguous Mythicstats representation section");
  const chart = sections[0][1];
  const groups = [...chart.matchAll(/<p\b[^>]*>\s*(Ranged|Melee|Tank|Healer) specs \((\d+(?:\.\d+)?)%\)\s*<\/p>\s*<ul\b[^>]*>([\s\S]*?)<\/ul>/gi)];
  if (groups.length !== 4 || new Set(groups.map(g => g[1])).size !== 4) throw new Error("Missing or duplicated Mythicstats role group");
  const byLabel = new Map(roster.map(s => [normalize(`${s.spec} ${s.class}`), s]));
  const updateTimes = [...html.matchAll(/<time\b([^>]*)>([\s\S]*?)<\/time>/gi)]
    .filter(m => /^(?:Last )?Updated\b/i.test(text(m[2]))).map(m => attributes(m[1]).datetime);
  if (updateTimes.length > 1) throw new Error("Ambiguous Mythicstats source update timestamp");
  const timestamp = updateTimes.length ? updateTimes[0] : publishedAt;
  if (timestamp !== null && (typeof timestamp !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(timestamp)
    || !Number.isFinite(Date.parse(timestamp)) || Date.parse(timestamp) > Date.parse(checkedAt))) throw new Error("Invalid or future Mythicstats source update timestamp");
  const asOf = timestamp ? sourceDate(timestamp.slice(0, 10), checkedAt) : sourceDate(checkedAt.slice(0, 10), checkedAt);
  const rows = [], seen = new Set(), roleCounts = { DPS: 0, Tank: 0, Healer: 0 }, roleTotals = {}, printedTotals = {};
  for (const group of groups) {
    const groupRows = [];
    for (const entry of group[3].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)) {
      const images = [...entry[1].matchAll(/<img\b([^>]*)>/gi)].map(m => attributes(m[1]));
      const values = [...entry[1].matchAll(/<span\b([^>]*)>([^<>]*)<\/span>/gi)]
        .filter(m => hasClass(attributes(m[1]), "mt-1")).map(m => text(m[2]));
      const spec = byLabel.get(normalize(images[0]?.alt));
      if (images.length !== 1 || !spec || seen.has(metricKey(spec)) || values.length !== 1 || !/^\d+(?:\.\d)?$/.test(values[0])) {
        throw new Error("Malformed, duplicate, or unmatched Mythicstats representation row");
      }
      const expectedRole = ["Melee", "Ranged"].includes(group[1]) ? "DPS" : group[1];
      if (spec.role !== expectedRole || (expectedRole === "DPS" && spec.playstyle?.range !== group[1])) throw new Error(`Mythicstats role mismatch for ${metricKey(spec)}`);
      const value = Number(values[0]);
      if (value > 100) throw new Error("Mythicstats share is outside 0–100%");
      seen.add(metricKey(spec)); roleCounts[spec.role]++; groupRows.push(metric(spec, "mythicstats", value, asOf));
    }
    const total = groupRows.reduce((sum, row) => sum + row.value, 0), printed = Number(group[2]);
    if (!groupRows.length || Math.abs(total - printed) > groupRows.length * 0.05 + 0.051) throw new Error(`Mythicstats ${group[1]} rows disagree with its printed share`);
    rows.push(...groupRows); roleTotals[group[1]] = Number(total.toFixed(1)); printedTotals[group[1]] = printed;
  }
  // One-decimal row rounding can account for at most 0.05 per published spec.
  const sum = rows.reduce((total, row) => total + row.value, 0);
  if (rows.length < 25 || rows.length > 40 || Object.entries(roleCounts).some(([role, n]) => n < 1 || n > ROLE_COUNTS[role])
    || Math.abs(sum - 100) > rows.length * 0.05 + 0.051 || Math.abs(printedTotals.Tank - 20) > 0.1
    || Math.abs(printedTotals.Healer - 20) > 0.1 || Math.abs(printedTotals.Melee + printedTotals.Ranged - 60) > 0.2) {
    throw new Error("Mythicstats is incomplete or not the representation-share series");
  }
  const allListRows = [...chart.matchAll(/<li\b/gi)].length;
  if (allListRows !== rows.length) throw new Error("Unparsed rows in Mythicstats representation section");
  return { rows, sourceAsOf: timestamp ? asOf : null, sourceTimestamp: updateTimes[0] ?? null,
    dateBasis: updateTimes.length ? "source-time-datetime" : publishedAt ? "source-last-modified" : "observed-undated-source",
    periodId, roleCounts, roleTotals, printedTotals, sum: Number(sum.toFixed(1)),
    omittedSpecs: roster.filter(s => !seen.has(metricKey(s))).map(metricKey) };
}
