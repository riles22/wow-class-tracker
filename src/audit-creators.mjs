/* Creator / expert-layer audit — `npm run audit:creators`.
 *
 * The qualitative layer grew to 76 creators across three surfaces (classes[].creators,
 * generalCreators[], takes[]/metaNotes[]) with rules that live in prose: scope entries to
 * what a creator actually covers, keep general creators out of takes[], supersede a
 * creator's older take on the same spec, give every transcribable creator a channelId.
 * Validation enforces SHAPE; nothing enforced these. A 2026-08-08 sweep found four HIGH
 * defects that all passed `npm run validate`, including two the tracker had been carrying
 * silently for weeks (Azortharion and Gamz flagged transcribable with no channelId, so
 * RSS discovery skipped them every single run).
 *
 * This is a REPORT, not a gate: it exits 0 unless --strict is passed. Several findings are
 * judgement calls a human should read rather than a bot should block on.
 *
 *   node src/audit-creators.mjs            # report
 *   node src/audit-creators.mjs --strict   # exit 1 if any HIGH finding
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expertRead, PROJECTION_VERSION, EXPERT_QUORUM } from "./render.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const j = f => JSON.parse(readFileSync(path.join(ROOT, f), "utf8"));
const community = j("data/community.json");
const specs = j("data/specs.json");
const tk = j("data/creator-takes.json");
const takes = tk.takes ?? [];
const metaNotes = tk.metaNotes ?? [];

const findings = [];
const add = (sev, area, msg) => findings.push({ sev, area, msg });

const creators = [];
for (const cls of community.classes ?? [])
  for (const cr of cls.creators ?? []) creators.push({ ...cr, class: cls.class });
const generalNames = new Set((community.generalCreators ?? []).map(g => g.name));
const specsOf = {};
for (const s of specs) (specsOf[s.class] ??= []).push(s.spec);
const liveTakes = takes.filter(t => !t.superseded);

/* HIGH — a transcribable creator with no channelId is invisible to RSS discovery. The
   flag advertises a video lane that the pipeline cannot actually poll. */
for (const c of creators)
  if (c.transcribable !== false && !c.channelId)
    add("HIGH", "discovery", `${c.class}/${c.name}: transcribable but no channelId — RSS discovery skips it every run`);

/* HIGH — specs[] naming a spec the class does not have is a silent no-op everywhere. */
for (const c of creators)
  for (const sp of c.specs ?? [])
    if (!(specsOf[c.class] ?? []).includes(sp))
      add("HIGH", "scope", `${c.class}/${c.name}: scoped to "${sp}", which is not a ${c.class} spec`);

/* HIGH — the firewall, both directions. A creator holding specialist takes[] AND sitting
   in generalCreators[] is counted twice by projectionFor: once in the expert lane (up to
   ±12 where the cell is prior-only) and again as the ±3 meta nudge. validate.mjs blocks
   this since 2026-08-08; kept here so the audit reports the whole picture in one place. */
for (const t of liveTakes)
  if (generalNames.has(t.creator))
    add("HIGH", "firewall", `take for ${t.spec} ${t.class} attributed to generalCreator "${t.creator}" — one voice would vote twice`);
for (const n of metaNotes)
  if (!generalNames.has(n.creator))
    add("HIGH", "firewall", `metaNote for ${n.spec} ${n.class} from "${n.creator}", who is not a generalCreator`);

/* HIGH — a take citing a creator the registry does not know. Found once for real: Porom
   was the cited source of the Arcane 12.1 writeup with no community.json entry at all. */
const known = new Set(creators.map(c => c.name));
for (const t of takes)
  if (!known.has(t.creator) && !generalNames.has(t.creator))
    add("HIGH", "registry", `take for ${t.spec} ${t.class} cites "${t.creator}" — no community.json entry`);

/* HIGH — a live take outside its own creator's declared scope. */
for (const t of liveTakes) {
  const c = creators.find(x => x.name === t.creator && x.class === t.class);
  if (c?.specs && !c.specs.includes(t.spec))
    add("HIGH", "scope", `live take ${t.creator} on ${t.spec} ${t.class}, but he is scoped to ${c.specs.join("/")}`);
}

/* MED — supersession. Only DIFFERENT-dated live takes for one (creator, spec, lens) are a
   defect: expertRead averages a creator's live takes, so a stale one dilutes the current
   read. Several claims sharing ONE date are a single video legitimately yielding several
   discrete claims, which the procedure explicitly allows — never flagged. */
const groups = new Map();
for (const t of liveTakes) {
  const k = `${t.creator}|${t.class}|${t.spec}|${t.bracket ?? "unscoped"}`;
  (groups.get(k) ?? groups.set(k, []).get(k)).push(t.date ?? "");
}
for (const [k, dates] of groups) {
  const uniq = [...new Set(dates)];
  if (uniq.length > 1)
    add("MED", "supersede", `${k.replace(/\|/g, " · ")}: live takes on ${uniq.sort().join(" and ")} — the newer should have superseded the older`);
}

/* MED — reference-only entries whose link is a video platform: a possibly-lost lane. */
for (const c of creators)
  if (c.transcribable === false && /youtube\.com|youtu\.be/i.test(c.url ?? ""))
    add("MED", "flags", `${c.class}/${c.name}: transcribable:false but its url is YouTube — check whether a transcript lane was given up`);

/* MED — unscoped entry on a multi-spec class whose takes do not cover every spec. Not
   automatically wrong (Kalamazi legitimately covers all three Warlock specs) — it is the
   PHANTOM-authority check: an entry implying breadth the content does not show. */
for (const c of creators) {
  if (c.specs || (specsOf[c.class] ?? []).length < 2) continue;
  const touched = new Set(liveTakes.filter(t => t.creator === c.name && t.class === c.class).map(t => t.spec));
  const missing = (specsOf[c.class] ?? []).filter(s => !touched.has(s));
  if (missing.length)
    add("MED", "scope", `${c.class}/${c.name}: unscoped (implies all ${specsOf[c.class].length} specs) but silent on ${missing.join(", ")}`);
}

/* INFO — duplicates, yield, and per-bracket expert coverage. */
for (const cls of community.classes ?? []) {
  const seen = new Map();
  for (const cr of cls.creators ?? []) seen.set(cr.name, (seen.get(cr.name) ?? 0) + 1);
  for (const [n, k] of seen) if (k > 1) add("HIGH", "duplicate", `${cls.class} lists "${n}" ${k} times`);
}
for (const c of creators)
  if (c.transcribable !== false && !takes.some(t => t.creator === c.name))
    add("INFO", "yield", `${c.class}/${c.name}: transcribable, zero takes ever`);
for (const s of specs)
  for (const b of ["raid", "mplus"])
    if (!expertRead(s, takes, b))
      add("INFO", "coverage", `${s.spec} ${s.class} ${b}: no expert panel (expertRead null)`);

const n = sev => findings.filter(f => f.sev === sev).length;
console.log(`ROSTER  ${creators.length} class entries · ${new Set(creators.map(c => c.name)).size} distinct · ${generalNames.size} generalCreators`);
console.log(`TAKES   ${takes.length} total · ${liveTakes.length} live · ${metaNotes.length} metaNotes`);
console.log(`MODEL   PROJECTION_VERSION ${PROJECTION_VERSION} · EXPERT_QUORUM ${EXPERT_QUORUM}`);
console.log(`\nFINDINGS  HIGH ${n("HIGH")} · MED ${n("MED")} · INFO ${n("INFO")}\n`);
for (const sev of ["HIGH", "MED", "INFO"]) {
  const rows = findings.filter(f => f.sev === sev);
  if (!rows.length) continue;
  console.log(`--- ${sev} (${rows.length}) ---`);
  for (const f of rows) console.log(`  [${f.area}] ${f.msg}`);
  console.log("");
}
if (!findings.length) console.log("✓ creator layer clean");
if (process.argv.includes("--strict") && n("HIGH")) {
  console.error(`✗ ${n("HIGH")} HIGH finding(s)`);
  process.exit(1);
}
