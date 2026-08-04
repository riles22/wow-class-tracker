// Ingest Norumu's community Season 2 item-level sheet (the one Icy Veins featured).
//
// POLICY: this sheet is CORROBORATION, never a sole authority we present as confirmed.
// The author marks uncertain cells in red text and notes "Red text is inferred information
// and needs confirmation" -- CSV export strips colour, so we cannot tell which. Therefore
// every independently checked anchor is classified, and tracks with no independent
// anchor are marked sheet-only:
//
//   confirmed  - also present in data we harvested independently from Wowhead, and agreeing
//   conflict   - present in both and DISAGREEING (surfaced loudly; never silently merged)
//   sheet-only - only this sheet has it; carried, but flagged provisional in the UI
//
//   node src/harvest-sheet.mjs
//
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHEET_ID = "1BCDWQvv_HFRO97s8UCQr_7vwz0pFXQw6gbTBgM1VeOg";
const GID = "1935597385";          // Midnight Season 2
const GID_S1 = "1360188519";       // Midnight Season 1, same layout -- used only for comparison
const csvUrl = (gid) => `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;
const URL = csvUrl(GID);

// ---- minimal CSV parser (quoted fields, embedded commas and newlines) ----
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; }
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
const num = (s) => { const m = clean(s).match(/^(\d{3})$/); return m ? +m[1] : null; };

// Column layout, read off the sheet's two header rows.
// NOTE: "Crafted Equipment" is a merged header spanning columns 6-7, but every value
// lives in column 6 (verified: column 7 is empty in all 36 rows). Do not add a second
// crafted column back -- it produced an always-empty track.
const COLS = {
  track: 1, ilvl: 2,
  world: 5, crafted: 6, venomstone: 8,
  preyHunt: 9, preyVault: 10,
  delveCoffer: 11, delveTrove: 12, delveVault: 13,
  dungeonDrop: 14, dungeonVault: 15,
  raidDrop: 16, raidVault: 17,
};

console.log("Fetching Norumu's Season 2 item-level sheet ...");
const res = await fetch(URL, { headers: { "user-agent": "Mozilla/5.0" } });
if (!res.ok) { console.error(`sheet fetch failed: ${res.status}`); process.exit(1); }
const csv = await res.text();
if (/^\s*<html/i.test(csv)) { console.error("sheet is not publicly readable"); process.exit(1); }

const rows = parseCsv(csv);
const buckets = {};
for (const k of Object.keys(COLS)) if (k !== "ilvl" && k !== "track") buckets[k] = [];
const ladder = [];
const trackStart = {};

for (const r of rows) {
  const ilvl = num(r[COLS.ilvl]);
  if (!ilvl) continue;
  ladder.push(ilvl);
  const t = clean(r[COLS.track]);
  if (t) trackStart[t] = ilvl;
  for (const [key, idx] of Object.entries(COLS)) {
    if (key === "ilvl" || key === "track") continue;
    const v = clean(r[idx]);
    if (v) buckets[key].push({ ilvl, label: v });
  }
}

// ---- cross-validate against what we harvested ourselves ----
const [dung, raid] = await Promise.all([
  readFile(join(ROOT, "data", "dungeon-items.json"), "utf8").then(JSON.parse),
  readFile(join(ROOT, "data", "raid-items.json"), "utf8").then(JSON.parse),
]);
const checks = [];
const add = (what, ours, theirs) => checks.push({
  what, ours, theirs,
  status: ours != null && theirs != null && ours === theirs ? "confirmed" : "conflict",
});

// the ladder itself: 334 must be present and 335 absent (our earlier correction)
add("Myth 6/6 on the ladder", true, ladder.includes(334));
add("335 absent from the ladder", true, !ladder.includes(335));
add("Myth 8 = 341 present", true, ladder.includes(341));
add("season max 344 present", true, ladder.includes(344));
for (const [t, v] of Object.entries({ Adventurer: 266, Veteran: 279, Champion: 292, Hero: 305, Myth: 318 }))
  add(`${t} track starts at ${v}`, v, trackStart[t] ?? null);

// M+ key levels: compare our harvested key-level table to the sheet's dungeon columns.
const sheetDrop = new Map(buckets.dungeonDrop.map((x) => [x.label, x.ilvl]));
const sheetVault = new Map(buckets.dungeonVault.map((x) => [x.label, x.ilvl]));
const findIn = (map, re) => { for (const [k, v] of map) if (re.test(k)) return v; return null; };
const keyLevel = (re, reward) => (dung.keyLevels || []).find((row) => re.test(row.key || ""))?.[reward] ?? null;
add("M0 end-of-dungeon", keyLevel(/^Mythic 0$/i, "end"), findIn(sheetDrop, /Mythic \/ M0/i));
add("M+10 end-of-dungeon", keyLevel(/^\+10\b/i, "end"), findIn(sheetDrop, /\+10 or higher/i));
add("M0 vault", keyLevel(/^Mythic 0$/i, "vault"), findIn(sheetVault, /^Mythic$/i));
add("M+10 vault", keyLevel(/^\+10\b/i, "vault"), findIn(sheetVault, /\+10 or higher/i));

// Raid drops: compare the sheet to the independently harvested per-boss ladders.
// The raid dataset does not contain vault rewards, so raidVault remains provisional.
const raidLevel = (boss, need) => (boss.dropLevels || []).find((row) => row.need === need)?.ilvl ?? null;
const raidLevels = (need, bosses = raid.bosses || []) => bosses.map((boss) => raidLevel(boss, need))
  .filter(Number.isFinite);
const baseRaidLevel = (need) => {
  const values = raidLevels(need);
  return values.length ? Math.min(...values) : null;
};
const bossNumbers = (raid.bosses || []).map((boss) => boss.boss).filter(Number.isFinite);
const finalBossNumber = bossNumbers.length ? Math.max(...bossNumbers) : null;
const finalTwoBosses = finalBossNumber == null ? []
  : raid.bosses.filter((boss) => boss.boss >= finalBossNumber - 1);
const finalTwoMythicLevels = [...new Set(raidLevels("Mythic", finalTwoBosses))];
const finalTwoMythicLevel = finalTwoMythicLevels.length === 1 ? finalTwoMythicLevels[0] : null;
add("Raid Finder drops", baseRaidLevel("LFR"),
  (buckets.raidDrop.find((x) => /Raid Finder/i.test(x.label)) || {}).ilvl ?? null);
add("Heroic raid drops", baseRaidLevel("Heroic"),
  (buckets.raidDrop.find((x) => /^Heroic$/i.test(x.label)) || {}).ilvl ?? null);
add("last 2 Mythic bosses", finalTwoMythicLevel,
  (buckets.raidDrop.find((x) => /Last 2 Mythic/i.test(x.label)) || {}).ilvl ?? null);

// Prey was independently confirmed from warcraft.wiki.gg's Season 2 page earlier
// (Normal 266 -> vault 279, Hard 279 -> 292, Nightmare 292 -> 305), so it is not sheet-only.
const preyAt = (bucket, re) => (bucket.find((x) => re.test(x.label)) || {}).ilvl ?? null;
add("Prey: Normal hunt = 266", 266, preyAt(buckets.preyHunt, /Normal/i));
add("Prey: Hard hunt = 279", 279, preyAt(buckets.preyHunt, /Hard/i));
add("Prey: Nightmare hunt = 292", 292, preyAt(buckets.preyHunt, /Nightmare/i));
add("Prey: Nightmare vault = 305", 305, preyAt(buckets.preyVault, /Nightmare/i));

// ---- Season 1 tab: used only to explain the season-over-season shift ----
// Blizzard's headline is "+46 ilvl". Per-rank deltas actually alternate 45/46 because both
// ladders snap to the game's discrete item-level grid, so neither figure is wrong. Capturing
// this closes a discrepancy that otherwise looks like a data error.
let seasonShift = null;
try {
  const s1csv = await (await fetch(csvUrl(GID_S1), { headers: { "user-agent": "Mozilla/5.0" } })).text();
  if (!/^\s*<html/i.test(s1csv)) {
    const s1rows = parseCsv(s1csv);
    const s1ladder = [], s1TrackStart = {};
    for (const r of s1rows) {
      const l = num(r[COLS.ilvl]);
      if (!l) continue;
      s1ladder.push(l);
      const t = clean(r[COLS.track]);
      if (t) s1TrackStart[t] = l;
    }
    const rankRun = (start) => {
      const i = s1ladder.indexOf(start);
      return i < 0 ? [] : s1ladder.slice(i, i + 6);
    };
    const s1Myth = rankRun(s1TrackStart.Myth);
    const s2Myth = (() => { const i = ladder.indexOf(trackStart.Myth); return i < 0 ? [] : ladder.slice(i, i + 6); })();
    const deltas = s1Myth.map((v, i) => (s2Myth[i] ?? 0) - v).filter((d) => d > 0);
    seasonShift = {
      season1Ladder: s1ladder,
      season1TrackStart: s1TrackStart,
      mythSeason1: s1Myth, mythSeason2: s2Myth,
      perRankDelta: deltas,
      headline: 46,
      explanation: deltas.length
        ? `Blizzard's headline shift is +46, but per-rank deltas are ${[...new Set(deltas)].sort().join("/")} `
          + "because both ladders snap to the discrete item-level grid. Neither figure is an error."
        : "could not compute per-rank deltas",
    };
    add("Season 1 Myth 6/6 = 289", 289, s1Myth[5] ?? null);
  }
} catch { /* comparison tab is optional */ }

const conflicts = checks.filter((c) => c.status === "conflict");

// sources the sheet is ALONE on -- carried, but flagged provisional in the UI
const SHEET_ONLY = ["world", "crafted", "venomstone",
  "delveCoffer", "delveTrove", "delveVault", "raidVault"];

// guard: an empty track means a column mapping drifted, so fail loudly rather than
// quietly shipping a blank column
const empty = Object.entries(buckets).filter(([, v]) => !v.length).map(([k]) => k);
const fatal = [];
if (empty.length) fatal.push(`empty reward track(s): ${empty.join(", ")} -- check the column mapping`);
for (const conflict of conflicts)
  fatal.push(`${conflict.what}: generated=${conflict.ours ?? "missing"}, sheet=${conflict.theirs ?? "missing"}`);
if (fatal.length) {
  throw new Error(`refusing to overwrite data/sheet-rewards.json:\n  ${fatal.join("\n  ")}`);
}

const out = {
  source: "Community Season 2 item-level sheet by Norumu (featured by Icy Veins)",
  sourceUrl: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit#gid=${GID}`,
  harvestedAt: new Date().toISOString().slice(0, 10),
  policy: "Corroboration only. Values unique to this sheet are marked provisional because the author flags inferred cells in red text, which CSV export strips.",
  authorCaveats: ["Red text is inferred information and needs confirmation", "Still need Vaults of Atal'Utek info"],
  tabs: { season2: GID, season1: GID_S1 },
  ladder,
  trackStart,
  seasonShift,
  validation: { total: checks.length, confirmed: checks.length - conflicts.length, conflicts },
  sheetOnlyKeys: SHEET_ONLY,
  rewards: buckets,
};

await mkdir(join(ROOT, "data"), { recursive: true });
await writeFile(join(ROOT, "data", "sheet-rewards.json"), JSON.stringify(out, null, 2), "utf8");

console.log(`\nladder: ${ladder.length} item levels, ${ladder[0]} -> ${ladder[ladder.length - 1]}`);
console.log(`cross-validation: ${checks.length - conflicts.length}/${checks.length} agree with our own harvest`);
for (const c of checks) console.log(`  ${c.status === "confirmed" ? "ok " : "!! "} ${c.what}  (ours=${c.ours} sheet=${c.theirs})`);
console.log("\nreward tracks captured:");
for (const [k, v] of Object.entries(buckets))
  console.log(`  ${k.padEnd(13)} ${String(v.length).padStart(2)} rows  ${SHEET_ONLY.includes(k) ? "[sheet-only -> provisional]" : "[has corroborated anchors]"}`);
console.log(`\nwrote data/sheet-rewards.json`);
if (conflicts.length) console.log(`\n!! ${conflicts.length} CONFLICT(S) -- resolve before trusting those values`);
