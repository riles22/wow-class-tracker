/* Supported WoW leaderboard observations. These are the first <=100 ranked
   ENTRIES for each spec and encounter, not population medians or unique players.
   This module never writes data and never retains player/report identifiers. */
import { PHASES } from "./normalize.mjs";

export const LIVE_LEADERBOARDS = {
  version: 1, season: "s2", label: "12.1", liveSince: "2026-08-18",
  minSamples: 10, maxSamples: 100, batchSize: 5, pauseMs: 600,
  maxRunMs: 12 * 60_000, maxConsecutiveFailures: 3, budgetEveryBatches: 16,
  budgetReserve: 50, estimatedPointsPerCut: 1,
  brackets: [
    { key: "wcl-leaderboard-raid", bracket: "raid", zoneId: 53, zoneName: "The Venomous Abyss",
      partition: 1, partitionName: "12.1", difficulty: 5, size: 20, minRows: 200,
      encounters: [
        { id: 3470, name: "Nek'zali the Soulcoiler" }, { id: 3445, name: "Entombed Sentinels" },
        { id: 3455, name: "Vashnik the Malignant" }, { id: 3497, name: "The Lost Explorers" },
        { id: 3420, name: "Sszorak" }, { id: 3421, name: "The Twin Fangs" },
        { id: 3429, name: "The Coiled Altar" }, { id: 3492, name: "Ula'tek" },
      ],
      // WCL lists this world boss in the raid zone and even returns Mythic-filtered
      // rankings for it. Successful API output alone cannot establish raid membership.
      excludedEncounters: [{ id: 3379, name: "Nymrissa Wavecaller" }],
    },
    { key: "wcl-leaderboard-mplus", bracket: "mplus", zoneId: 55, zoneName: "Mythic+ Season 2",
      partition: 1, partitionName: "Season 2", difficulty: 10, size: 5, minRows: 280,
      keystoneLevel: 10, rankingBracket: 9,
      bracketMetadata: { min: 2, max: 30, bucket: 1, type: "Keystone Level" },
      encounters: [
        { id: 12993, name: "Altar of Fangs" }, { id: 12825, name: "Den of Nalorakk" },
        { id: 61762, name: "Kings' Rest" }, { id: 12813, name: "Murder Row" },
        { id: 112521, name: "Ruby Life Pools" }, { id: 61877, name: "Temple of Sethraliss" },
        { id: 12859, name: "The Blinding Vale" }, { id: 12923, name: "Voidscar Arena" },
      ], excludedEncounters: [],
    },
  ],
};

export const expectedMetricName = (cfg, encounter, metric) =>
  `Leaderboard median ${metric.toUpperCase()} (S2 ${cfg.bracket === "raid" ? "Mythic" : `M+${cfg.keystoneLevel}`}: ${encounter.name}, top 100)`;
const canonical = value => typeof value === "string" ? value.replace(/[\s-]+/g, "").toLowerCase() : "";
const sameName = (a, b) => typeof a === "string" && a.replace(/[‘’]/g, "'") === b.replace(/[‘’]/g, "'");
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const metricFor = spec => spec.role === "Healer" ? "hps" : "dps";
const identity = (spec, encounter) => ({ class: spec.class, spec: spec.spec, encounterId: encounter.id });
const cleanError = value => String(value ?? "Unknown query failure").replace(/[\r\n]+/g, " ").slice(0, 200);

function checkRoster(roster) {
  const counts = { DPS: 27, Healer: 7, Tank: 6 };
  if (!Array.isArray(roster) || roster.length !== 40 || new Set(roster.map(s => `${s.class}|${s.spec}`)).size !== 40
    || Object.entries(counts).some(([role, count]) => roster.filter(s => s.role === role).length !== count)
    || !roster.some(s => s.class === "Demon Hunter" && s.spec === "Devourer")
    || roster.some(s => !/^[A-Za-z ]+$/.test(s.class) || !/^[A-Za-z ]+$/.test(s.spec))) throw new Error("Live WCL collection requires the complete 40-spec Midnight roster");
}

function zoneQuery(cfg) {
  return `{ worldData { zone(id: ${cfg.zoneId}) { id name frozen partitions { id name } difficulties { id sizes } encounters { id name }${cfg.keystoneLevel ? " brackets { min max bucket type }" : ""} } } }`;
}
function zoneValid(zone, cfg) {
  if (zone?.id !== cfg.zoneId || !sameName(zone.name, cfg.zoneName) || zone.frozen !== false
    || !Array.isArray(zone.partitions) || !zone.partitions.some(p => p?.id === cfg.partition && sameName(p.name, cfg.partitionName))
    || !Array.isArray(zone.difficulties) || !zone.difficulties.some(d => d?.id === cfg.difficulty && Array.isArray(d.sizes) && d.sizes.includes(cfg.size))
    || !Array.isArray(zone.encounters) || new Set(zone.encounters.map(e => e?.id)).size !== zone.encounters.length) return false;
  const allowed = [...cfg.encounters, ...cfg.excludedEncounters];
  if (cfg.encounters.some(e => !zone.encounters.some(z => z?.id === e.id && sameName(z.name, e.name)))
    || zone.encounters.some(z => !allowed.some(e => e.id === z?.id && sameName(z.name, e.name)))) return false;
  if (cfg.keystoneLevel) {
    if (Object.entries(cfg.bracketMetadata).some(([field, value]) => zone.brackets?.[field] !== value)) return false;
    if (1 + (cfg.keystoneLevel - zone.brackets.min) / zone.brackets.bucket !== cfg.rankingBracket) return false;
  }
  return true;
}
function rankingQuery(cfg, encounter, specs) {
  const aliases = specs.map((spec, index) => `s${index}: characterRankings(metric: ${metricFor(spec)}, className: ${JSON.stringify(spec.class.replace(/ /g, ""))}, specName: ${JSON.stringify(spec.spec.replace(/ /g, ""))}, page: 1, partition: ${cfg.partition}, difficulty: ${cfg.difficulty}, size: ${cfg.size}${cfg.keystoneLevel ? `, bracket: ${cfg.rankingBracket}` : ""})`);
  return `{ worldData { encounter(id: ${encounter.id}) { id zone { id } ${aliases.join(" ")} } } }`;
}
function graphErrors(response) {
  const errors = response?.json?.errors;
  if (errors === undefined) return [];
  return Array.isArray(errors) ? errors : [{ message: "Malformed GraphQL errors" }];
}

function readCut(raw, { spec, cfg, encounter, observedAt, minSamples, maxSamples }) {
  if (!raw || raw.page !== 1 || !Array.isArray(raw.rankings) || !Number.isInteger(raw.count)
    || raw.count !== raw.rankings.length || typeof raw.hasMorePages !== "boolean"
    || raw.rankings.length > maxSamples || (raw.hasMorePages && raw.rankings.length !== maxSamples)) throw new Error("Unexpected page/count/pagination shape");
  const start = Date.parse(LIVE_LEADERBOARDS.liveSince), end = Date.parse(observedAt), values = [], starts = [];
  for (const [i, row] of raw.rankings.entries()) {
    if (canonical(row?.class) !== canonical(spec.class) || canonical(row?.spec) !== canonical(spec.spec)) throw new Error("Ranking class/spec does not match requested spec");
    if (!Number.isFinite(row.amount)) throw new Error("Ranking amount is not a finite number");
    if (row.amount <= 0) throw new Error("Ranking amount must be positive");
    if (!Number.isSafeInteger(row.startTime) || !Number.isFinite(new Date(row.startTime).getTime())) throw new Error("Ranking run timestamp is not a valid epoch-millisecond integer");
    if (row.startTime < start) throw new Error(`Ranking run predates the live season (${new Date(row.startTime).toISOString()} < ${LIVE_LEADERBOARDS.liveSince})`);
    if (row.startTime > end) throw new Error(`Ranking run timestamp is in the future (${new Date(row.startTime).toISOString()} > observed ${observedAt})`);
    if (i && row.amount > values[i - 1]) throw new Error("Ranking values are not ordered from highest to lowest");
    if (cfg.keystoneLevel && (row.hardModeLevel !== cfg.keystoneLevel || row.bracketData !== cfg.keystoneLevel)) throw new Error("Returned keystone level differs from the reviewed +10 cut");
    values.push(row.amount); starts.push(row.startTime);
  }
  const samples = values.length, oldestRun = samples ? new Date(Math.min(...starts)).toISOString() : null;
  const newestRun = samples ? new Date(Math.max(...starts)).toISOString() : null;
  const receipt = { ...identity(spec, encounter), status: samples < minSamples ? "sparse" : "success", samples,
    metric: metricFor(spec), hasMorePages: raw.hasMorePages, observedAt, oldestRun, newestRun };
  if (samples < minSamples) return { receipt: { ...receipt, detail: samples ? `Only ${samples} entries; minimum is ${minSamples}` : "No ranked entries" }, row: null };
  const middle = Math.floor(samples / 2), median = samples % 2 ? values[middle] : (values[middle - 1] + values[middle]) / 2;
  const row = { class: spec.class, spec: spec.spec, source: "warcraftlogs", bracket: cfg.bracket, era: "live",
    name: expectedMetricName(cfg, encounter, metricFor(spec)), value: Math.round(median), unit: metricFor(spec).toUpperCase(), n: samples,
    asOf: newestRun.slice(0, 10), sample: { kind: "leaderboard-entries", cap: maxSamples, metric: metricFor(spec),
      zoneId: cfg.zoneId, encounterId: encounter.id, partition: cfg.partition, difficulty: cfg.difficulty, size: cfg.size,
      ...(cfg.keystoneLevel ? { keystoneLevel: cfg.keystoneLevel } : {}), observedAt, oldestRun, newestRun, hasMorePages: raw.hasMorePages } };
  return { receipt: { ...receipt, value: row.value, asOf: row.asOf }, row };
}

export async function collectLeaderboards({ roster, query, pause = sleep, now = () => new Date(), phases = PHASES,
  maxRunMs = LIVE_LEADERBOARDS.maxRunMs, clock = () => performance.now() } = {}) {
  checkRoster(roster);
  if (typeof query !== "function") throw new Error("Live WCL collector requires a credential-scoped query function");
  const getNow = typeof now === "function" ? now : () => now;
  const observed = () => { const date = new Date(getNow()); if (!Number.isFinite(+date)) throw new Error("Invalid collection timestamp"); return date.toISOString(); };
  const began = clock(), attemptedAt = observed(), updates = { metrics: [] }, brackets = {};
  let abortReason = null, consecutiveFailures = 0, rankedBatches = 0, budgetChecks = 0, queries = 0;
  const scheduledCuts = LIVE_LEADERBOARDS.brackets.reduce((n, cfg) => n + cfg.encounters.length * roster.length, 0);
  let processedCuts = 0;
  const request = async expression => {
    const remaining = maxRunMs - (clock() - began);
    if (remaining <= 0) { abortReason = "Collection exceeded its 12-minute deadline"; return null; }
    await pause(LIVE_LEADERBOARDS.pauseMs);
    const afterPause = maxRunMs - (clock() - began);
    if (afterPause <= 0) { abortReason = "Collection exceeded its 12-minute deadline"; return null; }
    let timer;
    try {
      queries++;
      const response = await Promise.race([query(expression), new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("Collection deadline exceeded")), afterPause);
      })]);
      if (response?.status !== 200 || !response.json || (graphErrors(response).length && !response.json.data)) {
        consecutiveFailures++;
        if (consecutiveFailures >= LIVE_LEADERBOARDS.maxConsecutiveFailures) abortReason = "Stopped after three consecutive transport/API failures";
      } else consecutiveFailures = 0;
      return response;
    } catch (error) {
      consecutiveFailures++;
      if (/deadline/i.test(error.message)) abortReason = "Collection exceeded its 12-minute deadline";
      else if (consecutiveFailures >= LIVE_LEADERBOARDS.maxConsecutiveFailures) abortReason = "Stopped after three consecutive transport/API failures";
      return { status: 0, json: null, error: cleanError(error.message) };
    } finally { clearTimeout(timer); }
  };
  const checkBudget = async () => {
    budgetChecks++;
    const response = await request("{ rateLimitData { limitPerHour pointsSpentThisHour pointsResetIn } }");
    const rate = response?.json?.data?.rateLimitData;
    if (response?.status !== 200 || graphErrors(response).length || !Number.isFinite(rate?.limitPerHour)
      || !Number.isFinite(rate?.pointsSpentThisHour) || rate.limitPerHour <= 0 || rate.pointsSpentThisHour < 0) {
      abortReason ??= "Rate budget could not be verified; remaining cuts withheld"; return;
    }
    // Conservative bound: one point per remaining cut plus a reserve for other
    // credentialed work. Check again during collection rather than trusting startup.
    const needed = (scheduledCuts - processedCuts) * LIVE_LEADERBOARDS.estimatedPointsPerCut + LIVE_LEADERBOARDS.budgetReserve;
    if (rate.limitPerHour - rate.pointsSpentThisHour < needed) abortReason = "Insufficient hourly query budget for the remaining bounded collection";
  };
  const phaseOk = phases?.liveSeason === LIVE_LEADERBOARDS.season && phases?.liveLabel === LIVE_LEADERBOARDS.label
    && phases?.liveSince === LIVE_LEADERBOARDS.liveSince;
  if (phaseOk) await checkBudget();
  for (const cfg of LIVE_LEADERBOARDS.brackets) {
    const receipt = brackets[cfg.key] = { status: "partial", rows: 0, zoneId: cfg.zoneId, bracket: cfg.bracket,
      partition: cfg.partition, difficulty: cfg.difficulty, size: cfg.size, minRows: cfg.minRows,
      ...(cfg.keystoneLevel ? { keystoneLevel: cfg.keystoneLevel, rankingBracket: cfg.rankingBracket } : {}),
      attemptedAt, cuts: [], omissions: [], failures: [] };
    let zoneError = phaseOk ? null : "Live phase differs from the reviewed S2 leaderboard configuration";
    if (!zoneError && !abortReason) {
      const discovery = await request(zoneQuery(cfg));
      if (discovery?.status !== 200 || graphErrors(discovery).length) zoneError = "Zone discovery failed";
      else if (!zoneValid(discovery.json?.data?.worldData?.zone, cfg)) zoneError = "Zone identity/season/encounter/difficulty/keystone metadata differs from reviewed configuration";
      else receipt.discoveryVerified = true;
    }
    for (const encounter of cfg.encounters) {
      for (let offset = 0; offset < roster.length; offset += LIVE_LEADERBOARDS.batchSize) {
        const specs = roster.slice(offset, offset + LIVE_LEADERBOARDS.batchSize);
        if (!zoneError && !abortReason && rankedBatches > 0 && rankedBatches % LIVE_LEADERBOARDS.budgetEveryBatches === 0) await checkBudget();
        let response = null;
        if (!zoneError && !abortReason) { response = await request(rankingQuery(cfg, encounter, specs)); rankedBatches++; }
        const actual = response?.json?.data?.worldData?.encounter, errors = graphErrors(response);
        for (const [index, spec] of specs.entries()) {
          processedCuts++;
          let cut;
          if (zoneError || abortReason || !response || response.status !== 200 || !response.json) {
            cut = { ...identity(spec, encounter), status: zoneError ? "invalid" : "unreachable", samples: 0,
              detail: zoneError ?? abortReason ?? `Query transport failed (HTTP ${response?.status ?? 0})` };
          } else {
            try {
              const relevantErrors = errors.filter(error => !Array.isArray(error?.path) || !error.path.some(p => /^s\d+$/.test(String(p))) || error.path.includes(`s${index}`));
              if (relevantErrors.length) throw new Error("GraphQL ranking error");
              if (actual?.id !== encounter.id || actual?.zone?.id !== cfg.zoneId) throw new Error("Returned encounter/zone identity mismatch");
              const parsed = readCut(actual[`s${index}`], { spec, cfg, encounter, observedAt: observed(),
                minSamples: LIVE_LEADERBOARDS.minSamples, maxSamples: LIVE_LEADERBOARDS.maxSamples });
              cut = parsed.receipt;
              if (parsed.row) { updates.metrics.push(parsed.row); receipt.rows++; }
            } catch (error) { cut = { ...identity(spec, encounter), status: "invalid", samples: 0, detail: cleanError(error.message) }; }
          }
          receipt.cuts.push(cut);
          if (cut.status === "sparse") receipt.omissions.push({ class: cut.class, spec: cut.spec, encounterId: cut.encounterId, samples: cut.samples });
          if (["invalid", "unreachable"].includes(cut.status)) receipt.failures.push({ class: cut.class, spec: cut.spec, encounterId: cut.encounterId, status: cut.status, detail: cut.detail });
        }
      }
    }
    receipt.verifiedCuts = receipt.cuts.filter(c => ["success", "sparse"].includes(c.status)).length;
    receipt.status = receipt.rows >= cfg.minRows && !receipt.failures.length ? "success"
      : receipt.rows || receipt.verifiedCuts ? "partial" : receipt.failures.some(f => f.status === "unreachable") ? "unreachable" : "invalid";
    receipt.detail = `${receipt.rows} median rows; ${receipt.omissions.length} empty/sparse cuts; ${receipt.failures.length} failed/unattempted cuts; minimum ${cfg.minRows} rows${abortReason ? `; ${abortReason}` : ""}`;
  }
  return { brackets, updates, querySummary: { queries, rankedBatches, budgetChecks, elapsedMs: Math.round(clock() - began), abortReason } };
}
