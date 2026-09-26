import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runProbe, KITHIX } from "../src/wcl-probe.mjs";
import { LIVE_LEADERBOARDS } from "../src/wcl-live.mjs";

/* The probe is dispatch-only and credentialed; these tests drive it with a mocked query.
   zonesToday() mirrors the partitions and difficulties the 2026-09-25 zone probe recorded
   for zones 53 and 55. */
const roster = JSON.parse(await readFile(new URL("../data/specs.json", import.meta.url), "utf8"));
const ok = data => ({ status: 200, json: { data } });
const storedRaid = roster.flatMap(s => (s.metrics ?? []).filter(m => m.bracket === "raid" && m.sample?.kind === "leaderboard-entries")
  .map(m => ({ key: `${s.class}|${s.spec}`, encounterId: m.sample.encounterId })));
const storedSpecs = new Set(storedRaid.map(r => r.key)), storedCuts = new Set(storedRaid.map(r => `${r.key}|${r.encounterId}`));
const stored = encounterId => storedRaid.filter(r => r.encounterId === encounterId).length;
function zonesToday() {
  const [raid, mplus] = LIVE_LEADERBOARDS.brackets;
  return [
    { id: raid.zoneId, name: raid.zoneName, frozen: false,
      partitions: [{ id: 1, name: "12.1", compactName: "12.1", default: true }],
      difficulties: [{ id: 5, name: "Mythic", sizes: [20] }, { id: 4, name: "Heroic", sizes: [] },
        { id: 3, name: "Normal", sizes: [] }, { id: 1, name: "LFR", sizes: [] }],
      encounters: [...raid.encounters, ...raid.excludedEncounters] },
    { id: mplus.zoneId, name: mplus.zoneName, frozen: false,
      partitions: [{ id: 1, name: "Season 2", compactName: "S2", default: true }],
      difficulties: [{ id: 10, name: "Dungeon", sizes: [5] }], encounters: mplus.encounters },
  ];
}
const page = count => ({ page: 1, count, hasMorePages: false, rankings: Array.from({ length: count }, () =>
  ({ class: "X", spec: "Y", amount: 1, name: "PRIVATE-PLAYER-NAME", report: { code: "PRIVATE-REPORT-ID" } })) });
function fakeQuery({ zones = zonesToday(), kithix = () => page(0), aliases = () => page(0), record = [] } = {}) {
  return async expression => {
    record.push(expression);
    if (expression.includes("expansions")) return ok({ worldData: { expansions: [{ id: 7, name: "Midnight", zones }] } });
    const spaced = expression.match(/encounter\(id: (\d+)\)/), compact = expression.match(/encounter\(id:(\d+)\)/);
    const id = Number((spaced ?? compact)[1]);
    const zoneId = id === KITHIX.id ? 53 : LIVE_LEADERBOARDS.brackets.find(c => c.encounters.some(e => e.id === id)).zoneId;
    const encounter = { id, zone: { id: zoneId } };
    if (spaced) {
      const partition = Number(expression.match(/partition: (\d+)/)[1]);
      for (const m of expression.matchAll(/(s\d+): characterRankings\(metric: \w+, className: ("[^"]+"), specName: ("[^"]+")/g))
        encounter[m[1]] = aliases({ partition, encounterId: id, className: JSON.parse(m[2]), specName: JSON.parse(m[3]) });
    } else {
      const arg = name => { const v = expression.match(new RegExp(`${name}:(\\d+)`)); return v ? Number(v[1]) : null; };
      encounter.characterRankings = id === KITHIX.id ? kithix(arg("partition"), arg("difficulty"), arg("size")) : page(3);
      if (encounter.characterRankings?.status) return encounter.characterRankings;
    }
    return ok({ worldData: { encounter } });
  };
}
async function probe(options) {
  const lines = [], record = [];
  const result = await runProbe({ query: fakeQuery({ ...options, record }), roster, log: line => lines.push(line), pause: async () => {} });
  const json = lines.slice(1).map(line => JSON.parse(line));
  return { ...result, lines, record, json };
}

test("today's zone shape: no supersession, the smoke checks send the same queries as before, and Kith'ix is mapped", async () => {
  const { failures, lines, record, json } = await probe();
  assert.equal(failures, 0);
  assert.deepEqual(json.find(l => l.zone === 53 && l.recipe).supersededBy, null);
  assert.deepEqual(json.find(l => l.zone === 55 && l.recipe).supersededBy, null);
  // Byte-for-byte the pre-2026-09-25 smoke queries, now derived from LIVE_LEADERBOARDS.
  const smoke = record.filter(q => /encounter\(id:(3470|12993)\)/.test(q));
  assert.deepEqual(smoke, ["dps", "hps"].map(m => `{worldData{encounter(id:3470){id zone{id}\n      characterRankings(metric:${m},page:1,partition:1,difficulty:5,size:20)}}}`)
    .concat(["dps", "hps"].map(m => `{worldData{encounter(id:12993){id zone{id}\n      characterRankings(metric:${m},page:1,partition:1,difficulty:10,size:5,bracket:9)}}}`)));
  const matrix = json.filter(l => l.encounter === KITHIX.id && l.trigger === undefined);
  assert.deepEqual(matrix.map(l => [l.partition, l.difficulty, l.size]), [[1, 5, 20], [1, 5, null], [1, 4, null], [1, 3, null], [1, 1, null]]);
  assert.ok(matrix.every(l => l.entries === 0 && l.zone === 53 && l.graphqlErrors === 0));
  const trigger = json.find(l => l.trigger === "mythic-entries");
  assert.deepEqual([trigger.partition, trigger.difficulty, trigger.size, trigger.specs, trigger.withEntries, trigger.atMinimum], [1, 5, 20, 40, 0, 0]);
  assert.equal(trigger.shortOfTrigger, storedSpecs.size);
  assert.ok(record.filter(q => q.includes("encounter(id: 3513)")).every(q => q.includes("partition: 1,") && q.includes("difficulty: 5, size: 20")));
  // Parity is only measured on a partition that is not already pinned.
  assert.equal(json.some(l => l.trigger === "parity"), false);
  assert.equal(record.filter(q => /encounter\(id: (?!3513)/.test(q)).length, 0);
  assert.ok(!lines.join("\n").includes("PRIVATE-"));
});

test("a new raid partition is reported by the collector's own guard, with Kith'ix and parity counts for the trigger", async () => {
  const zones = zonesToday();
  zones[0].partitions.push({ id: 2, name: "fixture partition", compactName: "fixture", default: false });
  const [first] = roster.filter(s => storedCuts.has(`${s.class}|${s.spec}|3470`));
  const compact = s => s.replace(/ /g, "");
  const { failures, json, record } = await probe({ zones,
    kithix: (partition, difficulty, size) => page(partition === 2 && difficulty === 5 && size === 20 ? 40 : 0),
    // Partition 2 has 12 entries everywhere except one stored (spec, boss) cut, which has 5.
    aliases: ({ partition, encounterId, className, specName }) => page(partition !== 2 ? 0
      : encounterId === 3470 && className === compact(first.class) && specName === compact(first.spec) ? 5 : 12) });
  assert.equal(failures, 0);
  assert.deepEqual(json.find(l => l.zone === 53 && l.recipe).supersededBy, [{ id: 2, name: "fixture partition" }]);
  const matrix = json.filter(l => l.encounter === KITHIX.id && l.trigger === undefined);
  assert.equal(matrix.length, 10);
  assert.equal(matrix.find(l => l.partition === 2 && l.difficulty === 5 && l.size === 20).entries, 40);
  const [pinned, fresh] = json.filter(l => l.trigger === "mythic-entries");
  assert.equal(pinned.partition, 1); assert.equal(pinned.shortOfTrigger, storedSpecs.size);
  assert.deepEqual([fresh.partition, fresh.atMinimum, fresh.shortOfTrigger, fresh.short.length, fresh.minimum], [2, 40, 0, 0, LIVE_LEADERBOARDS.minSamples]);
  const parity = json.find(l => l.trigger === "parity");
  assert.equal(parity.partition, 2); assert.equal(parity.encounters.length, 8); assert.equal(parity.missing, 1);
  const boss = parity.encounters.find(e => e.encounter === 3470);
  assert.deepEqual([boss.storedToday, boss.atMinimum, boss.missing, boss.missingSpecs], [stored(3470), 39, 1, [`${first.class} ${first.spec}`]]);
  assert.ok(record.filter(q => q.includes("characterRankings(metric: ") && q.includes("partition: 2,")).length === 8 + 8 * 8);
});

test("a refused combination is reported, not counted; a transport failure is counted", async () => {
  const refused = await probe({ kithix: (_p, difficulty) => difficulty === 1 ? { error: "Invalid partition\nspecified" } : page(0) });
  assert.equal(refused.failures, 0);
  assert.equal(refused.json.find(l => l.encounter === KITHIX.id && l.difficulty === 1).error, "Invalid partition specified");
  const down = await probe({ kithix: (_p, difficulty) => difficulty === 4 ? { status: 503 } : page(0) });
  assert.equal(down.failures, 1);
});
