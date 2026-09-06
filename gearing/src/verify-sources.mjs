// Independent weekly evidence checks. Never overwrites game facts or their dates.
// Changed tooltips/rules require a reviewed baseline; loot harvests run in scratch.
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, writeFile, mkdir, mkdtemp, copyFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getText, TOOLTIP } from "./lib-wowhead.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const run = promisify(execFile);
const json = async (path) => JSON.parse(await readFile(path, "utf8"));
export const digest = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
export const plain = (html) => html.replace(/<[^>]*>/g, " ").replace(/&#(\d+);/g,
  (_, n) => String.fromCodePoint(Number(n))).replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
  .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/\s+/g, " ").trim();

export function tierBonuses(html, className, specs) {
  const out = [];
  const blocks = [...html.matchAll(/<!--itemeffectspec(\d+):\d+-->([\s\S]*?)<!--itemeffectspec-->/g)];
  for (const [, specId, block] of blocks) {
    const found = /^\(([24])\) Set ([^:]+):\s*(.+)$/.exec(plain(block));
    if (!found || !specs.some((spec) => spec.class === className && spec.spec === found[2]))
      throw new Error(`Unrecognized ${className} set-bonus specialization or text`);
    const spell = /\/spell=(\d+)\//.exec(block)?.[1];
    if (!spell) throw new Error(`Missing ${className} set-bonus spell identity`);
    out.push({ class: className, spec: found[2], pieces: Number(found[1]), specId, spell,
      text: found[3] });
  }
  const expected = specs.filter((spec) => spec.class === className).flatMap((spec) =>
    [2, 4].map((pieces) => `${spec.spec}:${pieces}`));
  const keys = out.map((row) => `${row.spec}:${row.pieces}`);
  if (keys.length !== expected.length || new Set(keys).size !== keys.length
    || expected.some((key) => !keys.includes(key))) throw new Error(`Incomplete ${className} bonus coverage`);
  return out.sort((a, b) => `${a.spec}:${a.pieces}`.localeCompare(`${b.spec}:${b.pieces}`));
}

export function catalystGuide(html) {
  const match = /WH\.markup\.printHtml\(\s*("(?:\\.|[^"\\])*")\s*,\s*"guide-body"/.exec(html);
  if (!match) throw new Error("Catalyst guide body absent (blocked page or parser change)");
  // Exclude mutable navigation, comments, cosmetic item lists and appearance tables.
  const body = JSON.parse(match[1]);
  const end = body.search(/\[h[1-6][^\]]*\]Midnight Season 2 Cosmetic Tier Set Armor List/i);
  if (end < 0) throw new Error("Catalyst guide scope boundary absent");
  const text = plain(body.slice(0, end).replace(/\[\/?[^\]]+\]/g, " "));
  if (!/Veteran/.test(text) || !/two weeks/.test(text) || !/profession-crafted/.test(text)
    || !/secondary stats/.test(text)) throw new Error("Catalyst guide lacks expected rule sections");
  return text;
}

export function itemScope(kind, doc) {
  const item = ({ html, ...fields }) => fields;
  if (kind === "raid") return doc.bosses.map((boss) => ({ boss: boss.boss,
    name: boss.name, items: boss.items.map(item) }));
  if (kind === "dungeons") return doc.dungeons.map((dungeon) => ({ name: dungeon.name,
    items: dungeon.items.map(item) }));
  if (kind === "tier") return doc.sets.map((set) => ({ class: set.class, setId: set.setId,
    items: set.items.map(item) }));
  if (kind === "allocations") return doc.items;
  throw new Error(`Unknown item scope: ${kind}`);
}

export function compareEvidence(observed, reviewed, inputDigest) {
  if (!reviewed) return { status: "review-required", reason: "No reviewed source baseline" };
  if (reviewed.inputDigest !== inputDigest)
    return { status: "review-required", reason: "Curated facts changed since source review" };
  if (digest(observed) !== reviewed.digest)
    return { status: "review-required", reason: "Source text changed; compare evidence before changing facts" };
  return { status: "verified", reason: "Current source text matches the reviewed baseline" };
}

async function inputDigests(root) {
  const [tracker, catalyst] = await Promise.all([
    json(join(root, "..", "data", "specs.json")), json(join(root, "data", "catalyst-rules.json")),
  ]);
  return { tierBonuses: digest(tracker.map(({ class: cls, spec, tierSet }) => ({ class: cls, spec, tierSet }))),
    catalystRules: digest(catalyst) };
}

export async function verifySources({ root = ROOT, outDir, skipLoot = false,
  fetchText = getText, runHarvester = run } = {}) {
  outDir ||= await mkdtemp(join(tmpdir(), "wow-gearing-verification-"));
  await mkdir(outDir, { recursive: true });
  const data = join(root, "data"), staged = join(outDir, "staged");
  await mkdir(staged, { recursive: true });
  const [tier, tracker, rules, inputs] = await Promise.all([
    json(join(data, "tier-items.json")), json(join(root, "..", "data", "specs.json")),
    json(join(data, "catalyst-rules.json")), inputDigests(root),
  ]);
  let baseline = {};
  try { baseline = await json(join(data, "source-review.json")); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  let prior = null;
  try { prior = await currentVerification(await json(join(data, "source-verification.json")), root); }
  catch { /* An absent or invalid prior receipt cannot provide historical verification. */ }
  function lastSuccessful(name) {
    const group = prior?.groups[name];
    if (!group?.lastVerifiedAt) return null;
    if (group.status !== "verified") return group.lastSuccessfulVerification ?? null;
    const { lastVerifiedAt, inputDigest, sourceDigest, sources } = group;
    return { lastVerifiedAt, inputDigest, sourceDigest, ...(sources ? { sources } : {}),
      baselineDigest: prior.baselineDigest };
  }
  const historical = (name) => {
    const last = lastSuccessful(name);
    return { lastVerifiedAt: last?.lastVerifiedAt ?? null,
      ...(last ? { lastSuccessfulVerification: last } : {}) };
  };
  await writeFile(join(outDir, "reviewed-baseline.json"), JSON.stringify(baseline, null, 2));
  const observedAt = new Date().toISOString(), groups = {}, evidence = {};
  async function fetchEvidence(url, parse) {
    const body = await fetchText(url, 2, { timeoutMs: 10_000 });
    if (!body) throw new Error(`Source unavailable: ${url}`);
    const receipt = { url, observedAt: new Date().toISOString(), sha256:
      createHash("sha256").update(body).digest("hex") };
    await writeFile(join(outDir, `${digest(url)}.json`), JSON.stringify({ ...receipt, body }, null, 2));
    return { ...receipt, value: parse(body) };
  }
  async function check(name, collect) {
    try {
      evidence[name] = await collect();
      const value = evidence[name].map(({ url, value }) => ({ url, value }));
      groups[name] = { ...compareEvidence(value, baseline[name], inputs[name]),
        inputDigest: inputs[name], sourceDigest: digest(value), sources: evidence[name].map(({ value, ...r }) => r),
        ...historical(name) };
      if (groups[name].status === "verified") {
        groups[name].lastVerifiedAt = observedAt;
        delete groups[name].lastSuccessfulVerification;
      }
    } catch (error) {
      groups[name] = { status: "unreachable", reason: error.message,
        ...historical(name) };
    }
  }
  await check("tierBonuses", async () => {
    if (tier.sets.length !== 13 || tracker.length !== 40) throw new Error("Expected 13 classes and 40 specs");
    const receipts = [];
    for (const set of tier.sets) {
      const id = set.items.find((item) => item.slot === "Head")?.id;
      if (!id) throw new Error(`Missing ${set.class} head item`);
      receipts.push(await fetchEvidence(TOOLTIP(id), (body) => {
        const response = JSON.parse(body);
        return tierBonuses(response.tooltip, set.class, tracker);
      }));
    }
    return receipts;
  });
  await check("catalystRules", async () => {
    const receipts = [await fetchEvidence(rules.sources.catalystGuide, catalystGuide)];
    for (const [type, id, expected] of [["currency", "3465", "Venomblight Manaflux"],
      ["achievement", "62872", "Midnight Season 2: Serpent Scion"]]) {
      receipts.push(await fetchEvidence(`https://nether.wowhead.com/tooltip/${type}/${id}?locale=0`, (body) => {
        const result = JSON.parse(body);
        if (result.name !== expected || !result.tooltip) throw new Error(`Unexpected ${type} identity`);
        return plain(result.tooltip);
      }));
    }
    return receipts;
  });
  const jobs = [["raid", "raid-items.json", "harvest-raid.mjs"],
    ["dungeons", "dungeon-items.json", "harvest-dungeons.mjs"],
    ["tier", "tier-items.json", "harvest-tier.mjs"],
    ["allocations", "catalyst-stat-allocations.json", "harvest-catalyst-allocations.mjs"]];
  await mkdir(join(outDir, "baseline-items"), { recursive: true });
  for (const [, file] of jobs) {
    await copyFile(join(data, file), join(staged, file));
    await copyFile(join(data, file), join(outDir, "baseline-items", file));
  }
  for (const [kind, file, script] of jobs) {
    if (skipLoot) { groups[kind] = { status: "not-checked", reason: "Loot checks skipped explicitly" }; continue; }
    const before = await json(join(data, file));
    try {
      const env = { ...process.env, WOW_GEARING_DATA_DIR: staged,
        WOW_GEARING_EVIDENCE_DIR: join(outDir, "loot-evidence"),
        WOW_GEARING_PROPOSAL_DIR: outDir,
        WOW_ACCEPT_LOOT_CHANGES: "", WOW_ACCEPT_TIER_CHANGES: "", WOW_ACCEPT_CATALYST_ALLOCATION_CHANGES: "" };
      const result = await runHarvester(process.execPath, [join(root, "src", script)], {
        env, timeout: 5 * 60_000, maxBuffer: 2_000_000, windowsHide: true,
      });
      await writeFile(join(outDir, `${kind}.log`), result.stdout + result.stderr);
      const after = await json(join(staged, file));
      const inputDigest = digest(itemScope(kind, before)), sourceDigest = digest(itemScope(kind, after));
      groups[kind] = { status: inputDigest === sourceDigest ? "verified" : "review-required",
        reason: inputDigest === sourceDigest ? "Loot membership and parsed item fields match" : "Item fields changed; review staged data",
        inputDigest, sourceDigest, ...(inputDigest === sourceDigest ? { lastVerifiedAt: observedAt } : historical(kind)),
        scope: kind === "allocations" ? "Secondary-stat allocation fingerprints" : "Loot membership and item tooltip fields; excludes set-bonus prose and hard-coded item-level ladders" };
    } catch (error) {
      await writeFile(join(outDir, `${kind}.log`), String(error.stdout || "") + String(error.stderr || error.message));
      groups[kind] = { status: "unverified", reason: "Harvester rejected the source or exceeded its deadline; previous game data retained",
        inputDigest: digest(itemScope(kind, before)), ...historical(kind) };
    }
  }
  groups.rewardLadders = { status: "manual-review", reason: "Raid/M+ item-level tables and the owner-supplied reward chart require a separate source review; item fetches do not renew them" };
  const report = { schemaVersion: 1, observedAt, baselineDigest: digest(baseline), groups,
    caveat: "Verification confirms unchanged reviewed source content, not that every tooltip agrees with official notes. Source conflicts and dated caveats remain intact." };
  const sourceChanges = [];
  for (const [kind, sources] of Object.entries(evidence)) for (const source of sources) {
    const before = baseline[kind]?.sources?.find((prior) => prior.url === source.url)?.value ?? null;
    if (digest(before) !== digest(source.value)) sourceChanges.push({ kind, url: source.url, before, after: source.value });
  }
  await writeFile(join(outDir, "source-changes.json"), JSON.stringify(sourceChanges, null, 2) + "\n");
  await writeFile(join(outDir, "report.json"), JSON.stringify(report, null, 2) + "\n");
  await writeFile(join(outDir, "observations.json"), JSON.stringify({ inputs, evidence }, null, 2) + "\n");
  await writeFile(join(outDir, "summary.md"), `Gearing verification ${observedAt}\n\n`
    + Object.entries(groups).map(([id, group]) => `- **${id}: ${group.status}** — ${group.reason}`).join("\n") + "\n");
  return { report, outDir };
}

export async function acceptReview(outDir, note, root = ROOT) {
  if (!note?.trim()) throw new Error("A review note is required; read the raw source observations first");
  const [report, observations, currentInputs] = await Promise.all([json(join(outDir, "report.json")),
    json(join(outDir, "observations.json")), inputDigests(root)]);
  if (digest(currentInputs) !== digest(observations.inputs)) throw new Error("Curated facts changed after collection; collect again");
  const baseline = { schemaVersion: 1, reviewedAt: new Date().toISOString(), note };
  for (const name of ["tierBonuses", "catalystRules"]) {
    if (!observations.evidence[name] || !["verified", "review-required"].includes(report.groups[name]?.status))
      throw new Error(`Cannot approve failed or incomplete ${name} evidence`);
    const observed = observations.evidence[name].map(({ url, value }) => ({ url, value }));
    baseline[name] = { inputDigest: observations.inputs[name], digest: digest(observed),
      verifiedAt: report.observedAt, sources: observed };
  }
  await writeFile(join(root, "data", "source-review.json"), JSON.stringify(baseline, null, 2) + "\n");
  return baseline;
}

// A receipt can describe current inputs only while its scoped hash still matches them.
export async function currentVerification(report, root = ROOT) {
  if (!report) return null;
  validateReport(report);
  const baseline = await json(join(root, "data", "source-review.json"));
  const result = structuredClone(report), inputs = await inputDigests(root);
  for (const [kind, file] of [["raid", "raid-items.json"], ["dungeons", "dungeon-items.json"],
    ["tier", "tier-items.json"], ["allocations", "catalyst-stat-allocations.json"]])
    inputs[kind] = digest(itemScope(kind, await json(join(root, "data", file))));
  const bound = (kind, group, baselineDigest) => {
    const sourceReviewed = !["tierBonuses", "catalystRules"].includes(kind)
      || (baseline[kind]?.digest === group.sourceDigest && baseline[kind]?.inputDigest === inputs[kind]
        && digest(baseline[kind].sources) === group.sourceDigest
        && digest((baseline[kind].sources || []).map((source) => source.url))
          === digest((group.sources || []).map((source) => source.url)));
    return group.inputDigest === inputs[kind] && baselineDigest === digest(baseline) && sourceReviewed
      && (group.inputDigest === group.sourceDigest || ["tierBonuses", "catalystRules"].includes(kind));
  };
  for (const [kind, group] of Object.entries(result.groups)) {
    if (group.lastSuccessfulVerification && !bound(kind, group.lastSuccessfulVerification,
      group.lastSuccessfulVerification.baselineDigest)) {
      delete group.lastSuccessfulVerification;
      if (group.status !== "verified") group.lastVerifiedAt = null;
    }
    if (group.status === "verified" && !bound(kind, group, report.baselineDigest)) {
      group.status = "review-required";
      group.reason = "Published facts changed after the last source verification";
      group.lastVerifiedAt = null;
    }
  }
  return result;
}

export function validateReport(report, now = Date.now()) {
  const keys = ["tierBonuses", "catalystRules", "raid", "dungeons", "tier", "allocations", "rewardLadders"];
  const hash = (value) => typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
  const time = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)
    && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value && Date.parse(value) <= now + 60_000;
  if (report?.schemaVersion !== 1 || !time(report.observedAt) || !hash(report.baselineDigest)
    || !report.groups || Object.keys(report.groups).length !== keys.length || keys.some((key) => !report.groups[key]))
    throw new Error("Invalid gearing verification report schema, timestamp or coverage");
  for (const [key, group] of Object.entries(report.groups)) {
    if (!["verified", "review-required", "unreachable", "unverified", "manual-review", "not-checked"].includes(group.status)
      || typeof group.reason !== "string" || !group.reason
      || group.lastVerifiedAt != null && (!time(group.lastVerifiedAt) || group.lastVerifiedAt > report.observedAt))
      throw new Error(`Invalid ${key} verification status or timestamp`);
    if (key === "rewardLadders" && group.status !== "manual-review")
      throw new Error("Reward ladders cannot be verified by item collection");
    if (group.status !== "verified" && group.lastVerifiedAt != null && !group.lastSuccessfulVerification)
      throw new Error(`Missing ${key} historical verification binding`);
    const receipts = group.status === "verified" ? [group] : [];
    if (group.lastSuccessfulVerification) {
      const last = group.lastSuccessfulVerification;
      if (!hash(last.baselineDigest) || last.lastVerifiedAt !== group.lastVerifiedAt)
        throw new Error(`Invalid ${key} historical verification binding`);
      receipts.push(last);
    }
    for (const receipt of receipts) {
      if (!hash(receipt.inputDigest) || !hash(receipt.sourceDigest) || !time(receipt.lastVerifiedAt))
        throw new Error(`Missing ${key} source verification fingerprint`);
      if (["tierBonuses", "catalystRules"].includes(key)) {
        const count = key === "tierBonuses" ? 13 : 3;
        if (!Array.isArray(receipt.sources) || receipt.sources.length !== count || new Set(receipt.sources.map((s) => s.url)).size !== count
          || receipt.sources.some((s) => !hash(s.sha256) || !time(s.observedAt)
            || !/^https:\/\/(?:www|nether)\.wowhead\.com\//.test(s.url)))
          throw new Error(`Incomplete ${key} source receipts`);
      }
    }
  }
  return report;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2), option = (name) => args[args.indexOf(name) + 1];
  if (args.includes("--accept-reviewed")) {
    await acceptReview(resolve(option("--accept-reviewed")), option("--note"));
    console.log("Saved reviewed source baseline; rerun verification to publish a current receipt.");
  } else {
    const { report, outDir } = await verifySources({ outDir: args.includes("--out") ? resolve(option("--out")) : undefined,
      skipLoot: args.includes("--skip-loot") });
    console.log(await readFile(join(outDir, "summary.md"), "utf8"));
    console.log(`Evidence: ${outDir}`);
    if (Object.values(report.groups).some((group) => !["verified", "manual-review"].includes(group.status))) process.exitCode = 1;
  }
}
