/* Data validation: every rule the build depends on. Returns a list of
   human-readable errors; the build aborts if any are present. */

import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { aheadSeasonFor, isLiveEra, PHASES, scoreFor } from "./normalize.mjs";
import { specBuildChanges } from "./render.mjs";

const ROLES = new Set(["DPS", "Healer", "Tank"]);
const BRACKETS = new Set(["raid", "mplus"]);
const VERDICTS = new Set(["Positive", "Mixed", "Negative"]);

/* Writeups that predate the ptr.asOf requirement (2026-07-26). Every one of these was
   distilled without recording when its source actually said it, and the date is no longer
   recoverable: 14 cite a Wowhead class preview whose article date nobody wrote down, 3 cite
   unlinkable Discord/guide-author posts, and hard rule 1 forbids filling any of it in from
   memory. So they are grandfathered rather than back-dated with a guess.

   THIS LIST MAY ONLY SHRINK. Removing a name is how a writeup gets a real date — either
   because someone supplied the source's date, or because the writeup was rewritten from a
   fresh, dated read. Never add to it: a new undated writeup is exactly what the gate exists
   to stop. */
const UNDATED_WRITEUPS = new Set([
  "Death Knight|Unholy", "Demon Hunter|Devourer", "Demon Hunter|Vengeance",
  "Hunter|Beast Mastery", "Hunter|Marksmanship", "Hunter|Survival", "Mage|Arcane", "Mage|Fire",
  "Mage|Frost", "Monk|Mistweaver", "Monk|Windwalker", "Paladin|Retribution", "Priest|Discipline", "Priest|Shadow", "Rogue|Assassination",
  "Rogue|Outlaw", "Rogue|Subtlety", "Shaman|Enhancement", "Warrior|Protection"
]);
const KINDS = new Set(["tier-list", "metrics", "notes-feed", "reference", "community"]);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
// Creator-take URLs come from an autonomous nightly pipeline over untrusted transcripts —
// beyond https-only they must point at a host the pipeline actually cites.
/* kalamazi.gg: a specialist creator's own written guide site, the linkable form of an
   author already tracked as a Warlock video authority. Added to TAKE_HOSTS rather than
   WRITEUP_HOSTS only — its pages are guides (tier sets, hero-talent choice, per-boss spec
   recommendations), not patch verdicts, so they may source a take but must not be turned
   into a `ptr` writeup. Reviewed + approved by Riley 2026-08-10, who pointed at the site.
   Currency was verified rather than assumed: all three Warlock tier-set texts on the site
   match this repo's stored Season 2 sets exactly, including Demonology's corrected
   250%/225% from the 2026-07-31 build, and JSON-LD dateModified was same-day. */
/* wingsisup.com: same shape as kalamazi.gg above and added for the same reason — the written
   guide site of an already-registered specialist (Ellesmere, Holy Paladin), whose /quickview
   page moved from the 12.0.5 build to a Midnight Season 2 one. TAKE_HOSTS only, NOT
   WRITEUP_HOSTS: it is a build/rotation guide, not a patch verdict. It was already trusted in
   SITE_HOSTS as a Paladin community link. Reviewed + approved by Riley 2026-08-10, who pointed
   at the page. Currency verified rather than assumed: the page carries no date of any kind (no
   Last-Modified, no JSON-LD), so it was cross-checked instead — its build images are named
   quickview-build-12_1-{mplus,raid}.png, and its tier-set commentary (Infusion of Light on
   Flash of Light inside Virtue windows; Holy Light weaving to regenerate procs) is coherent
   only against this repo's stored Season 2 Holy Paladin set. */
const TAKE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "hackmd.io", "wowhead.com", "www.wowhead.com",
  "kalamazi.gg", "www.kalamazi.gg", "wingsisup.com"]);
// Same principle extended repo-wide (2026-07-18 portfolio audit): every URL field the
// nightly agent can write is pinned to hosts a human approved here. validate.mjs is
// code — the nightly cannot publish changes to it — so widening a list is inherently
// a reviewed edit. New legit host → the run fails red → add it here with eyes on it.
const BLIZZARD_FORUM_HOSTS = new Set(["us.forums.blizzard.com", "eu.forums.blizzard.com"]);
// PTR writeup provenance: theorycrafter platforms + the ecosystem's known guide/sim/log sites.
const WRITEUP_HOSTS = new Set([...TAKE_HOSTS, ...BLIZZARD_FORUM_HOSTS,
  "icy-veins.com", "www.icy-veins.com", "method.gg", "www.method.gg",
  "questionablyepic.com", "www.questionablyepic.com", "bloodmallet.com",
  "simulationcraft.org", "www.simulationcraft.org", "raidbots.com", "www.raidbots.com",
  "liquidarmory.com", "www.liquidarmory.com", "archon.gg", "www.archon.gg",
  "raider.io", "murlok.io", "mythicstats.com", "wowmeta.com",
  "warcraftlogs.com", "www.warcraftlogs.com",
  /* Long-form theorycrafter guides published as public Google Docs rather than on a guide
     site — e.g. Kyrasis' "[12.1] Advanced Blood DK Guide for M+" (Death's Advance), which is
     the linkable form of an author we otherwise cite only as an unlinkable Discord post.
     Reviewed + approved by Riley 2026-08-09. Writeup/creator provenance ONLY: deliberately
     not added to TAKE_HOSTS, so the nightly's transcript pipeline cannot cite a doc. */
  "docs.google.com",
]);
const DISCORD_HOSTS = new Set(["discord.gg", "discord.com", "www.discord.com"]);
// Creator channel/author pages: video platforms + guide sites that carry bylines.
const CREATOR_HOSTS = new Set([...WRITEUP_HOSTS, "twitch.tv", "www.twitch.tv"]);
/* Class community sites — the last agent-writable URL field that was https-only but not
   host-allowlisted, contradicting CLAUDE.md's "host allowlists on every agent-writable URL
   field" (audit 2026-07-24, S2). Seeded from the eight hosts already in use, so it lands
   green; a new legitimate community site fails the run red and is added here as a reviewed
   edit, exactly like every other allowlist in this file. */
const SITE_HOSTS = new Set([
  // azortharion.com added 2026-07-31: the Hunter sims site, requested by the owner while
  // pasting Trueshot Lodge content. Azortharion is already a registered whole-class Hunter
  // creator (community.json) and his HackMD is already a site here.
  // kalamazi.gg added 2026-08-10: the Warlock guide site of an already-registered
  // whole-class Warlock creator, pointed at by the owner. Same shape as azortharion.com
  // above — a tracked creator's own written guide hub.
  "azortharion.com", "docs.google.com", "github.com", "hackmd.io", "kalamazi.gg",
  "www.kalamazi.gg", "spiritbloom.pro",
  "warcraftpriests.github.io", "wingsisup.com", "www.dreamgrove.gg", "www.peakofserenity.com"
]);
const WOWHEAD_HOSTS = new Set(["wowhead.com", "www.wowhead.com"]);
const ICYVEINS_HOSTS = new Set(["icy-veins.com", "www.icy-veins.com"]);
const httpsUrl = v => { try { return new URL(v).protocol === "https:"; } catch { return false; } };
// Shape-valid ≠ real: "2026-99-99" matches the regex but is not a date. Round-trip
// through Date.UTC so month/day overflow is rejected instead of silently normalized.
const isRealDate = v => {
  const [y, m, d] = v.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
};

/* opts.fullRoster: enforce the real 40-spec Midnight roster — used by the CLI, the build,
   and the apply-* merge scripts (which operate on the repo's real data), but not by unit
   fixtures, which validate small synthetic datasets. */
export function validateData({ specs, sources, scales, community, ptrBuilds, creatorTakes, encounterTiers, historySnapshots, pendingTranscripts, seasonFinal, frozenForecast }, opts = {}) {
  const errors = [];
  // Every date in the data is a claim about when something was fetched or published —
  // none may sit in the future. +1 day of skew allowed: a nightly UTC run can honestly
  // stamp "tomorrow" relative to a validator still on the previous local day.
  const today = opts.now ?? new Date().toISOString().slice(0, 10);
  const maxDate = new Date(new Date(today + "T00:00:00Z").getTime() + 86400000).toISOString().slice(0, 10);
  const isoOk = (v, what) => {
    if (v == null) return;
    if (!ISO_DATE.test(v)) { errors.push(`${what} must be YYYY-MM-DD, got "${v}"`); return; }
    if (!isRealDate(v)) { errors.push(`${what} is not a real calendar date, got "${v}"`); return; }
    if (v > maxDate) errors.push(`${what} is future-dated ("${v}", allowed through ${maxDate}) — data can't be newer than now`);
  };
  const urlOk = (v, what) => { if (v != null && !httpsUrl(v)) errors.push(`${what} must be a valid https:// URL, got "${v}"`); };
  // Host pinning on top of urlOk — fires only on parseable https URLs, so a value
  // that is broken outright gets one error (urlOk's), not two.
  const hostOk = (v, hosts, what) => { if (v != null && httpsUrl(v) && !hosts.has(new URL(v).host)) errors.push(`${what} host "${new URL(v).host}" is not in the approved host allowlist`); };

  if (opts.fullRoster) {
    if (specs.length !== 40) errors.push(`specs.json: Midnight roster must be exactly 40 specs (got ${specs.length})`);
    if (!specs.some(s => s.class === "Demon Hunter" && s.spec === "Devourer")) {
      errors.push("specs.json: Midnight roster must include Demon Hunter / Devourer");
    }
  }

  // --- scales ---
  const bands = scales?.consensus?.bands;
  if (!Array.isArray(bands) || bands.length === 0) {
    errors.push("scales.json: consensus.bands must be a non-empty array");
  } else {
    for (let i = 1; i < bands.length; i++) {
      if (bands[i].min >= bands[i - 1].min) {
        errors.push(`scales.json: consensus.bands must be sorted by descending min (band ${i})`);
      }
    }
    if (bands.at(-1).min !== 0) errors.push("scales.json: last consensus band must have min 0");
  }
  if (typeof scales?.consensus?.spreadThreshold !== "number") {
    errors.push("scales.json: consensus.spreadThreshold must be a number");
  }
  for (const [scaleId, scale] of Object.entries(scales?.scales ?? {})) {
    if (!Array.isArray(scale.tiers) || scale.tiers.length === 0) {
      errors.push(`scales.json: scale "${scaleId}" must define a non-empty tiers array`);
      continue;
    }
    for (const tier of scale.tiers) {
      if (typeof scale.values?.[tier] !== "number") {
        errors.push(`scales.json: scale "${scaleId}" tier "${tier}" has no numeric value`);
      }
    }
  }

  // --- sources ---
  const tierSources = new Map();
  const liveTierSources = new Set();
  const allSources = new Set();
  for (const source of sources) {
    if (!source.id || !source.name) errors.push(`sources.json: source missing id or name (${JSON.stringify(source.id)})`);
    if (allSources.has(source.id)) errors.push(`sources.json: duplicate source id "${source.id}"`);
    allSources.add(source.id);
    if (!KINDS.has(source.kind)) errors.push(`sources.json: source "${source.id}" has unknown kind "${source.kind}"`);
    urlOk(source.url, `sources.json: source "${source.id}" url`);
    /* `summary` is READER copy and `methodology` is not (2026-08-08). Seventeen methodology
       strings totalling ~5,900 chars existed and only FOUR ever reached even a tooltip; the
       other thirteen — every tier list, plus Warcraft Logs, Murlok, Robydoby, WoWMeta,
       Mythicstats and SimulationCraft — reached no surface at all. They could not simply be
       shown either: they have accreted maintenance narrative (the warcraftlogs one carries
       "an earlier note here claiming PTR zones are HTML-only was wrong and is corrected"),
       which is exactly right for a maintainer and useless to a visitor.
       So: every source states, in one short sentence a reader can act on, what its number or
       letter MEANS. Required, because a source whose meaning is not stated is a source the
       page is asking people to trust blindly. Length-capped so it cannot drift back into a
       changelog. */
    if (typeof source.summary !== "string" || !source.summary.trim()) {
      errors.push(`sources.json: source "${source.id}" needs a short reader-facing summary — one sentence on what its number or letter MEANS (methodology is maintainer prose and is not shown)`);
    } else if (source.summary.length > 260) {
      errors.push(`sources.json: source "${source.id}" summary is ${source.summary.length} chars — cap is 260; the long-form belongs in methodology`);
    }
    for (const page of source.pages ?? []) {
      urlOk(page.url, `sources.json: source "${source.id}" page url`);
      isoOk(page.snapshot, `sources.json: source "${source.id}" page snapshot`);
      // `published` is the date the PAGE states about itself (JSON-LD dateModified, a
      // "Last updated" string, Archon's lastUpdated) as opposed to `snapshot`, which an
      // agent writes. Optional, but it is the only one that can contradict a run: WoWMeta
      // served a 2026-03-23 prerender under nightly `snapshot: "2026-07-31"` stamps for a
      // week. It may never be in the future, and never predate nothing — see dataHealth.
      isoOk(page.published, `sources.json: source "${source.id}" page published`);
      if (page.published && page.snapshot && page.published > page.snapshot) {
        errors.push(`sources.json: source "${source.id}" page published ${page.published} is newer than its snapshot ${page.snapshot} — a page cannot publish after it was fetched`);
      }
      // `seasonVerified` records which SEASON the page described at refresh — the
      // era-verify observation, stored (S2 transition, DECISION 1). A page whose season
      // does not match PHASES.liveSeason drops its source from that bracket's consensus,
      // so a typo here must fail red rather than silently keep a stale list averaged in.
      if (page.seasonVerified != null && !["s1", "s2"].includes(page.seasonVerified)) {
        errors.push(`sources.json: source "${source.id}" page seasonVerified must be "s1" or "s2", got "${page.seasonVerified}"`);
      }
    }
    // `era` marks a source whose ratings describe a patch we are not running. Only "ptr"
    // is gated today; the default (absent) is "live". A typo'd value must fail loudly
    // rather than default to live — a PTR list silently averaged into the 12.0.7
    // consensus is precisely the dishonesty the era lane exists to prevent.
    if (source.era !== undefined && source.era !== "live" && source.era !== "ptr") {
      errors.push(`sources.json: source "${source.id}" has unknown era "${source.era}" (expected "live" or "ptr")`);
    }
    if (source.kind === "tier-list") {
      if (!scales.scales?.[source.scale]) {
        errors.push(`sources.json: source "${source.id}" references unknown scale "${source.scale}"`);
      }
      tierSources.set(source.id, source);
      if (isLiveEra(source)) liveTierSources.add(source.id);
    }
  }
  if (tierSources.size === 0) errors.push("sources.json: no tier-list sources defined");
  // The consensus is composed of LIVE-era tier lists only (consensusFor). A registry
  // holding nothing but PTR lists would build a page whose every consensus cell is "—"
  // while the toggles still promise one, so this is an error, not a quiet empty column.
  if (tierSources.size > 0 && liveTierSources.size === 0) {
    errors.push("sources.json: no LIVE-era tier-list sources defined — the consensus would have nothing to average");
  }

  /* --- season-final.json: the frozen final-season letters (2026-08-09) ---
     These letters go straight into the published consensus for any outlet that has moved
     ahead of the live season, so they need the same gates the live ratings get: a real
     roster spec, a tier that resolves through that source's own scale, and a source that
     could legitimately have been in the consensus. A bad record here is invisible on the
     page — it renders as an ordinary letter — which is exactly why it is validated. */
  if (seasonFinal != null) {
    if (typeof seasonFinal !== "object" || Array.isArray(seasonFinal)) {
      errors.push("season-final.json: must be an object keyed by season");
    } else {
      const roster = new Set((specs ?? []).map(s => `${s.class}|${s.spec}`));
      const order = PHASES.seasonOrder ?? [];
      for (const [season, bySource] of Object.entries(seasonFinal)) {
        if (!order.includes(season)) {
          errors.push(`season-final.json: unknown season "${season}" — add it to PHASES.seasonOrder`);
          continue;
        }
        for (const [sourceId, brackets] of Object.entries(bySource ?? {})) {
          const source = tierSources.get(sourceId);
          if (!source) {
            errors.push(`season-final.json: "${sourceId}" is not a tier-list source — only a consensus contributor can be frozen`);
            continue;
          }
          // An era:"ptr" list describes a patch we do not run BY DEFINITION; it was never
          // in the consensus, so it has no final-season letters to freeze.
          if (!isLiveEra(source)) {
            errors.push(`season-final.json: "${sourceId}" is era:"ptr" — a PTR list never fed the live consensus, so freezing it would inject letters that were never there`);
            continue;
          }
          for (const [bracket, rec] of Object.entries(brackets ?? {})) {
            const at = `season-final.json: ${season}/${sourceId}/${bracket}`;
            if (!rec || typeof rec !== "object") { errors.push(`${at}: record must be an object`); continue; }
            if (!/^[0-9a-f]{40}$/.test(rec.fromCommit ?? "")) {
              errors.push(`${at}: fromCommit must be a full 40-hex commit sha (it is the record's own receipt)`);
            }
            if (rec.frozenAt && rec.lastSeasonVerifiedSnapshot && rec.lastSeasonVerifiedSnapshot > rec.frozenAt) {
              errors.push(`${at}: lastSeasonVerifiedSnapshot ${rec.lastSeasonVerifiedSnapshot} is after frozenAt ${rec.frozenAt} — a source cannot be frozen before the letters it froze`);
            }
            const letters = rec.letters ?? {};
            if (!Object.keys(letters).length) errors.push(`${at}: has no letters — an empty freeze silently drops the source from the consensus`);
            for (const [specKey, tier] of Object.entries(letters)) {
              if (!roster.has(specKey)) { errors.push(`${at}: "${specKey}" is not a roster spec`); continue; }
              if (tier === null) continue;   // explicitly unrated, as in the live ratings
              // Narrow catch: scoreFor throws only for an unknown scale or an undefined
              // tier. A bare `catch` here once swallowed a missing import and reported it
              // as 80 bad tiers, so re-throw anything that is not that.
              try { scoreFor(scales, source.scale, tier); }
              catch (error) {
                if (!/^(Unknown scale|Tier )/.test(error.message)) throw error;
                errors.push(`${at}: tier "${tier}" for ${specKey} is not in scale "${source.scale}"`);
              }
            }
          }
        }
      }
    }
  }

  // --- specs ---
  const seen = new Set();
  for (const spec of specs) {
    const key = `${spec.class} / ${spec.spec}`;
    if (seen.has(key)) errors.push(`specs.json: duplicate spec ${key}`);
    seen.add(key);
    if (!ROLES.has(spec.role)) errors.push(`specs.json: ${key} has invalid role "${spec.role}"`);

    for (const [bracket, ratings] of Object.entries(spec.ratings ?? {})) {
      if (!BRACKETS.has(bracket)) {
        errors.push(`specs.json: ${key} has unknown bracket "${bracket}"`);
        continue;
      }
      for (const [sourceId, tier] of Object.entries(ratings)) {
        const source = tierSources.get(sourceId);
        if (!source) {
          errors.push(`specs.json: ${key} ${bracket} rating from unknown source "${sourceId}"`);
          continue;
        }
        if (tier !== null && scales.scales[source.scale]?.values?.[tier] === undefined) {
          errors.push(`specs.json: ${key} ${bracket}.${sourceId} tier "${tier}" not in scale "${source.scale}"`);
        }
      }
    }

    const metricKeys = new Set();
    for (const metric of spec.metrics ?? []) {
      if (!allSources.has(metric.source)) errors.push(`specs.json: ${key} metric from unknown source "${metric.source}"`);
      if (!BRACKETS.has(metric.bracket)) errors.push(`specs.json: ${key} metric has invalid bracket "${metric.bracket}"`);
      if (typeof metric.name !== "string" || !metric.name) errors.push(`specs.json: ${key} metric missing name`);
      // All current series are non-negative magnitudes; NaN/Infinity must never reach the page.
      if (!Number.isFinite(metric.value) || metric.value < 0) errors.push(`specs.json: ${key} metric "${metric.name}" value must be a finite non-negative number`);
      if (metric.era != null && !["live", "ptr"].includes(metric.era)) errors.push(`specs.json: ${key} metric "${metric.name}" era must be "live" or "ptr"`);
      // Era gating (hard rule 3) must agree with the display-name convention both ways:
      // a "12.1 PTR"-named series may not claim live, and an era:"ptr" series must say PTR in its name.
      if (PHASES.ptr && metric.name?.includes(PHASES.ptr.marker) && metric.era === "live") errors.push(`specs.json: ${key} metric "${metric.name}" is named ${PHASES.ptr.marker} but tagged era "live"`);
      if (metric.era === "ptr" && !/PTR/.test(metric.name ?? "")) errors.push(`specs.json: ${key} metric "${metric.name}" is era "ptr" but its name carries no PTR label`);
      /* A PTR-NAMED row must be era-EXPLICIT, not inference-reliant (2026-08-12). metricEra's
         fallback infers "ptr" from the name via PHASES.ptr.marker — and PHASES.ptr goes NULL
         at the phase flip, at which point every inference-reliant row silently leaks into the
         live view while its explicitly-tagged siblings stay gated (measured: 5 of 12 PTR
         metric families rode the inference). The marker guard above dies with PHASES.ptr for
         the same reason, so this rule matches the NAME, which survives the flip. */
      if (/\bPTR\b/.test(metric.name ?? "") && metric.era == null) errors.push(`specs.json: ${key} metric "${metric.name}" is PTR-named but carries no explicit era — name inference dies at the phase flip, so PTR rows must be tagged era: "ptr" (apply-metrics preserves it)`);
      /* asOf is REQUIRED, not optional (audit 2026-08-14). check-refresh dates a metric family
         by its min-th-freshest row precisely so one fresh row cannot vouch for a stale cut —
         but rows with no asOf were skipped rather than counted as stale, so the whole design
         was bypassable through the sanctioned write path. Proven: a 47-row wcl-live-raid
         refresh carrying unchanged stale values, with asOf on exactly ONE row, was accepted by
         apply-metrics.mjs (which runs validateData internally and refuses on any error) and the
         family then probed as fresh. No grandfather set is needed — every committed metric row
         already carries a date. Same shape as the mandatory ptr.source rule. */
      if (metric.asOf == null) errors.push(`specs.json: ${key} metric "${metric.name}" needs an asOf date — the coverage gate dates a family by its min-th-freshest row, and an undated row cannot be counted as stale`);
      isoOk(metric.asOf, `specs.json: ${key} metric "${metric.name}" asOf`);
      const mkey = `${metric.source}|${metric.bracket}|${metric.name}`;
      if (metricKeys.has(mkey)) errors.push(`specs.json: ${key} duplicate metric (${mkey}) — the upsert key must be unique per spec`);
      metricKeys.add(mkey);
    }

    if (spec.fightProfile != null) {
      const fp = spec.fightProfile;
      if (!allSources.has(fp.source)) errors.push(`specs.json: ${key} fightProfile from unknown source "${fp.source}"`);
      isoOk(fp.asOf, `specs.json: ${key} fightProfile.asOf`);
      const targets = Object.entries(fp.targets ?? {});
      if (targets.length === 0) errors.push(`specs.json: ${key} fightProfile.targets must be a non-empty object`);
      for (const [count, dps] of targets) {
        if (!/^\d+$/.test(count) || !Number.isFinite(dps) || dps < 0) {
          errors.push(`specs.json: ${key} fightProfile target "${count}" must map a numeric target count to finite non-negative DPS`);
        }
      }
    }

    if (spec.playstyle != null) {
      const ps = spec.playstyle;
      if (!["Melee", "Ranged"].includes(ps.range)) errors.push(`specs.json: ${key} playstyle.range must be "Melee" or "Ranged"`);
      for (const attr of ["mobility", "utility"]) {
        if (!Number.isInteger(ps[attr]) || ps[attr] < 1 || ps[attr] > 5) errors.push(`specs.json: ${key} playstyle.${attr} must be an integer 1–5`);
      }
      if (ps.complexity != null && (!Number.isInteger(ps.complexity) || ps.complexity < 1 || ps.complexity > 5)) {
        errors.push(`specs.json: ${key} playstyle.complexity must be an integer 1–5`);
      }
      if (ps.meleeCapable != null && typeof ps.meleeCapable !== "boolean") {
        errors.push(`specs.json: ${key} playstyle.meleeCapable must be a boolean`);
      }
    }

    if (spec.ptrDummy != null) {
      isoOk(spec.ptrDummy.asOf, `specs.json: ${key} ptrDummy.asOf`);
      const targets = Object.entries(spec.ptrDummy.targets ?? {});
      if (targets.length === 0) errors.push(`specs.json: ${key} ptrDummy.targets must be a non-empty object`);
      for (const [count, dps] of targets) {
        if (!/^\d+$/.test(count) || !Number.isFinite(dps) || dps < 0) errors.push(`specs.json: ${key} ptrDummy target "${count}" must map a numeric target count to finite non-negative DPS`);
      }
    }

    if (spec.tierSet != null) {
      for (const pc of ["set2", "set4"]) {
        if (spec.tierSet[pc] != null && typeof spec.tierSet[pc] !== "string") errors.push(`specs.json: ${key} tierSet.${pc} must be a string`);
      }
      urlOk(spec.tierSet.source, `specs.json: ${key} tierSet.source`);
      hostOk(spec.tierSet.source, WRITEUP_HOSTS, `specs.json: ${key} tierSet.source`);
      isoOk(spec.tierSet.asOf, `specs.json: ${key} tierSet.asOf`);
    }

    if (spec.survivability != null) {
      if (typeof spec.survivability.tier !== "string" || !spec.survivability.tier) errors.push(`specs.json: ${key} survivability needs a tier string`);
      if (spec.survivability.source && !allSources.has(spec.survivability.source)) errors.push(`specs.json: ${key} survivability from unknown source "${spec.survivability.source}"`);
    }

    if (spec.ptr != null) { // omitted ptr == null ptr: every consumer treats both as "not tracked"
      if (!VERDICTS.has(spec.ptr?.verdict)) errors.push(`specs.json: ${key} ptr.verdict "${spec.ptr?.verdict}" invalid`);
      if (typeof spec.ptr?.summary !== "string" || !spec.ptr.summary) errors.push(`specs.json: ${key} ptr.summary missing`);
      if (!Array.isArray(spec.ptr?.changes) || spec.ptr.changes.length === 0) errors.push(`specs.json: ${key} ptr.changes must be a non-empty array`);
      urlOk(spec.ptr.source, `specs.json: ${key} ptr.source`);
      hostOk(spec.ptr.source, WRITEUP_HOSTS, `specs.json: ${key} ptr.source`);
      // Provenance rule: every writeup is an attributed distillation — since verdicts
      // auto-confirm (no review gate), the attribution IS the honesty and is mandatory.
      if (!spec.ptr.source && !spec.ptr.sourceLabel) errors.push(`specs.json: ${key} writeup needs a source URL or sourceLabel`);
      // …and WHEN the source said it. Without a date, a read from three weeks ago is
      // presented exactly like last night's, and nothing on the page can age it: the
      // staleness banner reads metric/sim/dummy dates and never sees writeups at all.
      // It matters most for the unlinkable ones — a Discord post has no page to date, so
      // the person pasting it is the only possible source of the date, and by the time the
      // writeup lands the chance to record it is gone.
      // NB: `key` is the human-readable "Class / Spec"; the grandfather list is keyed on the
      // pipe form used everywhere else (snapshots, movement maps), so build it explicitly.
      if (spec.ptr.asOf != null) isoOk(spec.ptr.asOf, `specs.json: ${key} ptr.asOf`);
      else if (!UNDATED_WRITEUPS.has(`${spec.class}|${spec.spec}`)) {
        errors.push(`specs.json: ${key} writeup needs ptr.asOf (the date the SOURCE said it — the article's date, or the day you read the Discord post). Only the ${UNDATED_WRITEUPS.size} pre-2026-07-26 writeups listed in UNDATED_WRITEUPS may omit it, and that list may only shrink`);
      }
    }
  }

  /* --- sim-tier uniformity across a source's fight profiles (2026-08-15) ---
     `fightLabels` (render.mjs) pools every DPS spec's fightProfile into ONE flat array and
     derives the ST/cleave/AoE strength labels and the row tag as within-role PERCENTILES.
     That pool carries no provenance, so it cannot tell one sim tier from another — and the
     tiers are not comparable: measured 2026-08-15, bloodmallet's Season-2 MID2 charts run a
     mean 1.79x its MID1 charts (range 1.114-2.563), varying by BOTH spec and target count.

     Merging a partial re-sim is therefore not "slightly stale data", it is a label that
     reports WHICH SPECS THE SOURCE HAS RE-SIMMED. Measured on the 14-of-27 roster available
     the day this landed: all 24 "strong" labels would go to the 14 re-simmed specs and none
     to the other 12, 21 of 26 specs would move a label, and two specs would publish as
     "Low-sims" purely for not having been re-simmed yet.

     The existing gates do not catch this. check-refresh's value-move guard measures the
     MAGNITUDE of a change and takes a human `value_move_ack` — so the night that ack is
     supplied for a legitimate wholesale tier adoption is exactly the night a partial merge
     would sail through. This check targets the mixing directly and takes no ack.

     Absent counts as its own value on purpose: today's 26 profiles predate the field, so a
     pool of all-untiered passes, an all-MID2 pool passes, and the mixed state fails. It also
     fails closed if a source stops publishing its tier mid-adoption. */
  const tiersBySource = new Map();
  for (const spec of specs) {
    const fp = spec.fightProfile;
    if (fp == null) continue;
    if (!tiersBySource.has(fp.source)) tiersBySource.set(fp.source, new Map());
    const seen = tiersBySource.get(fp.source);
    const tier = fp.tier ?? null;
    if (!seen.has(tier)) seen.set(tier, []);
    seen.get(tier).push(`${spec.class} ${spec.spec}`);
  }
  for (const [source, seen] of tiersBySource) {
    if (seen.size <= 1) continue;
    const groups = [...seen.entries()]
      .sort((a, b) => b[1].length - a[1].length)
      .map(([tier, list]) => `${tier ?? "(no tier recorded)"} x${list.length} (e.g. ${list.slice(0, 3).join(", ")})`);
    errors.push(
      `specs.json: fightProfile pool for "${source}" mixes ${seen.size} sim tiers — ${groups.join(" | ")}. ` +
      `The build derives ST/cleave/AoE labels as within-role percentiles over this pool with no provenance key, ` +
      `so a mixed pool publishes "which specs were re-simmed" as if it were spec strength. ` +
      `Adopt a new tier WHOLESALE across every spec of this source, or not at all.`
    );
  }

  // --- community registry ---
  const specsByClass = new Map();
  for (const s of specs) {
    if (!specsByClass.has(s.class)) specsByClass.set(s.class, new Set());
    specsByClass.get(s.class).add(s.spec);
  }
  const seenClasses = new Set();
  for (const entry of community?.classes ?? []) {
    if (!entry.class) errors.push("community.json: class entry missing class name");
    if (seenClasses.has(entry.class)) errors.push(`community.json: duplicate class entry "${entry.class}"`);
    seenClasses.add(entry.class);
    if (!entry.discord?.name || !entry.discord?.url) errors.push(`community.json: ${entry.class} discord needs name + url`);
    urlOk(entry.discord?.url, `community.json: ${entry.class} discord url`);
    hostOk(entry.discord?.url, DISCORD_HOSTS, `community.json: ${entry.class} discord url`);
    for (const alt of entry.altDiscords ?? []) {
      if (!alt.name || !alt.url) errors.push(`community.json: ${entry.class} altDiscord needs name + url`);
      urlOk(alt.url, `community.json: ${entry.class} altDiscord "${alt.name}" url`);
      hostOk(alt.url, DISCORD_HOSTS, `community.json: ${entry.class} altDiscord "${alt.name}" url`);
    }
    for (const site of entry.sites ?? []) {
      urlOk(site.url, `community.json: ${entry.class} site "${site.name}" url`);
      hostOk(site.url, SITE_HOSTS, `community.json: ${entry.class} site "${site.name}"`);
    }
    const seenCreators = new Set();
    for (const creator of entry.creators ?? []) {
      if (!creator.name || !creator.url) errors.push(`community.json: ${entry.class} creator needs name + url`);
      // Duplicate creators in one class would double-attribute takes (creatorScope below
      // keys on class|name) and double-render in the drawer.
      if (seenCreators.has(creator.name)) errors.push(`community.json: ${entry.class} has duplicate creator "${creator.name}"`);
      seenCreators.add(creator.name);
      urlOk(creator.url, `community.json: ${entry.class} creator "${creator.name}" url`);
      hostOk(creator.url, CREATOR_HOSTS, `community.json: ${entry.class} creator "${creator.name}" url`);
      isoOk(creator.verifiedDate, `community.json: ${entry.class} creator "${creator.name}" verifiedDate`);
      // Optional spec scoping: a creator credible on only some of a class's specs.
      // Absent = whole class. Each listed spec must be a real spec of that class.
      if (creator.specs != null) {
        if (!Array.isArray(creator.specs) || creator.specs.length === 0) {
          errors.push(`community.json: ${entry.class} creator "${creator.name}" specs must be a non-empty array when present`);
        } else {
          for (const sp of creator.specs) {
            if (!specsByClass.get(entry.class)?.has(sp)) {
              errors.push(`community.json: ${entry.class} creator "${creator.name}" scoped to "${sp}" which is not a ${entry.class} spec`);
            }
          }
        }
      }
    }
    for (const site of entry.sites ?? []) {
      if (!site.name || !site.url) errors.push(`community.json: ${entry.class} site needs name + url`);
    }
  }
  // General-coverage creators (cross-class PTR news lane — e.g. izen). Deliberately a
  // SEPARATE list from classes[].creators: they are never per-spec take authorities
  // (the take-scope check below only reads classes[].creators, so a general creator
  // can't lend authority to a spec take by construction).
  const seenGeneral = new Set();
  for (const gc of community?.generalCreators ?? []) {
    if (!gc.name || !gc.url) errors.push(`community.json: generalCreators entry needs name + url`);
    if (seenGeneral.has(gc.name)) errors.push(`community.json: duplicate general creator "${gc.name}"`);
    seenGeneral.add(gc.name);
    urlOk(gc.url, `community.json: general creator "${gc.name}" url`);
    hostOk(gc.url, CREATOR_HOSTS, `community.json: general creator "${gc.name}" url`);
    isoOk(gc.verifiedDate, `community.json: general creator "${gc.name}" verifiedDate`);
  }

  // --- creator takes (qualitative layer) ---
  const specKeys = new Set(specs.map(s => `${s.class}|${s.spec}`));
  // Authority model: a take may only be attributed to a creator registered for that class
  // in community.json, and within their specs scope when one is declared.
  const creatorScope = new Map(); // "class|creator" -> specs[]|null (null = whole class)
  for (const entry of community?.classes ?? [])
    for (const creator of entry.creators ?? [])
      creatorScope.set(`${entry.class}|${creator.name}`, creator.specs ?? null);
  // Since PROJECTION_VERSION v7 the take lane FEEDS THE MODEL (expertRead), so the fields
  // the estimator reads are gated like every other model input (2026-08-04 external audit:
  // a single-field sentiment mutation crossed tier boundaries with nothing failing red).
  const TAKE_SENTIMENTS = new Set(["buff", "nerf", "neutral", "mixed"]);
  const TAKE_BRACKETS = new Set(["raid", "mplus", "both"]);
  for (const take of creatorTakes?.takes ?? []) {
    if (!specKeys.has(`${take.class}|${take.spec}`)) errors.push(`creator-takes.json: take references unknown spec ${take.class} / ${take.spec}`);
    if (!take.creator || !take.claim || !take.url) errors.push(`creator-takes.json: take for ${take.spec} needs creator + claim + url`);
    if (take.creator && take.class) {
      const scopeKey = `${take.class}|${take.creator}`;
      if (!creatorScope.has(scopeKey)) errors.push(`creator-takes.json: "${take.creator}" has a ${take.class} take but no ${take.class} entry in community.json`);
      else { const scope = creatorScope.get(scopeKey); if (scope && !scope.includes(take.spec)) errors.push(`creator-takes.json: "${take.creator}" take for ${take.class}/${take.spec} is outside their declared specs scope [${scope.join(", ")}]`); }
    }
    if (!TAKE_SENTIMENTS.has(take.sentiment)) errors.push(`creator-takes.json: take for ${take.spec} sentiment "${take.sentiment}" invalid (buff|nerf|neutral|mixed) — it is a model input since v7`);
    // patchContext carries BOTH the era gate (PHASES.ptr.marker match) and the bracket
    // scope heuristic; a take without one would silently vanish from the expert read.
    if (!take.patchContext || typeof take.patchContext !== "string") errors.push(`creator-takes.json: take for ${take.spec} needs a patchContext string (era-gates and bracket-scopes the expert read)`);
    if (take.bracket != null && !TAKE_BRACKETS.has(take.bracket)) errors.push(`creator-takes.json: take for ${take.spec} bracket "${take.bracket}" invalid (raid|mplus|both, or omit for the patchContext heuristic)`);
    if (take.superseded != null && typeof take.superseded !== "boolean") errors.push(`creator-takes.json: take for ${take.spec} superseded must be a boolean when present`);
    if (!take.date) errors.push(`creator-takes.json: take for ${take.spec} needs a date (orders the panel's newest read)`);
    isoOk(take.date, `creator-takes.json: take for ${take.spec} date`);
    if (take.url != null) {
      // Take URLs flow from untrusted transcripts through the nightly LLM into clickable
      // hrefs — https only AND a known citation host, so a smuggled URL fails CI.
      if (!httpsUrl(take.url)) errors.push(`creator-takes.json: take for ${take.spec} url must be https:// (got "${take.url}")`);
      else if (!TAKE_HOSTS.has(new URL(take.url).host)) errors.push(`creator-takes.json: take for ${take.spec} url host "${new URL(take.url).host}" not in the citation allowlist`);
    }
  }

  // --- meta-outlook notes (general-creator qualitative layer) ---
  // INVERSE of the take authority model above: metaNotes may ONLY be authored by a
  // generalCreators entry (the cross-class PTR-news lane — e.g. izen). This keeps the
  // news-lane generalists firewalled out of the specialist take/consensus layers while
  // still surfacing their per-spec season/meta OUTLOOK opinion in a separate, clearly
  // labeled lane. A specialist take belongs in takes[] (class-scoped creator); a broad
  // "this spec looks good/bad for the season" read belongs here.
  const generalCreatorNames = new Set((community?.generalCreators ?? []).map(g => g.name));
  /* The firewall was only enforced in ONE direction (metaNotes must come FROM a general
     creator); nothing stopped a general creator from also holding specialist takes[].
     Found 2026-08-08 by a creator audit, after Dratnos was added to generalCreators while
     his Warrior takes stayed live — and `npm run validate` passed. That state double-counts
     one voice: once in the expert lane (up to ±12 on a prior-only cell) and again as the
     ±3 meta nudge. CLAUDE.md states the separation is "by construction"; this is the
     construction. Dual membership is now red in both directions. */
  for (const take of creatorTakes?.takes ?? []) {
    if (take.creator && generalCreatorNames.has(take.creator)) {
      errors.push(`creator-takes.json: take for ${take.spec} ${take.class} is attributed to "${take.creator}", who is a generalCreators entry — a creator may hold specialist takes[] OR cross-class metaNotes[], never both, or the projection counts one voice twice`);
    }
  }
  const META_SENTIMENTS = new Set(["positive", "negative", "neutral", "mixed"]);
  for (const note of creatorTakes?.metaNotes ?? []) {
    if (!specKeys.has(`${note.class}|${note.spec}`)) errors.push(`creator-takes.json: metaNote references unknown spec ${note.class} / ${note.spec}`);
    if (!note.creator || !note.note || !note.url) errors.push(`creator-takes.json: metaNote for ${note.spec} needs creator + note + url`);
    if (note.creator && !generalCreatorNames.has(note.creator)) errors.push(`creator-takes.json: metaNote creator "${note.creator}" must be a generalCreators entry — specialist per-spec takes belong in takes[], not metaNotes[]`);
    if (!META_SENTIMENTS.has(note.sentiment)) errors.push(`creator-takes.json: metaNote for ${note.spec} sentiment "${note.sentiment}" invalid (positive|negative|neutral|mixed)`);
    // date is MANDATORY, not optional: projectionFor picks the newest-dated metaNote to
    // drive the ±3 nudge, and an undated note would sort above every dated one.
    if (!note.date) errors.push(`creator-takes.json: metaNote for ${note.spec} needs a date (drives the projection's newest-read nudge)`);
    isoOk(note.date, `creator-takes.json: metaNote for ${note.spec} date`);
    if (note.url != null) {
      if (!httpsUrl(note.url)) errors.push(`creator-takes.json: metaNote for ${note.spec} url must be https:// (got "${note.url}")`);
      else if (!TAKE_HOSTS.has(new URL(note.url).host)) errors.push(`creator-takes.json: metaNote for ${note.spec} url host "${new URL(note.url).host}" not in the citation allowlist`);
    }
  }

  // --- PTR build feed ---
  const rosterNames = new Set(specs.map(s => `${s.spec} ${s.class}`));
  const classNames = new Set(specs.map(s => s.class));
  urlOk(ptrBuilds?.thread, "ptr-builds.json: thread");
  hostOk(ptrBuilds?.thread, BLIZZARD_FORUM_HOSTS, "ptr-builds.json: thread");
  for (const build of ptrBuilds?.builds ?? []) {
    if (build.date == null) errors.push("ptr-builds.json: build missing date");
    else isoOk(build.date, `ptr-builds.json: build date`);
    /* Entry kind (2026-08-02). The feed was built around official forum BUILD posts and
       required forumUrl on every entry — which made a PTR HOTFIX unaddable, because
       hotfixes are pushed between builds and the forum thread never carries them. They
       are real 12.1 tuning (Ride the Lightning +59%, Wowhead news=382321, 2026-07-31),
       so their absence was a coverage hole every gate reported as green. A hotfix cites
       the Wowhead round-up instead; each kind must carry the citation it actually has,
       and neither may be cited to a source it does not come from. */
    /* "patch-notes" (2026-08-07) is the consolidated launch notes — the authoritative
       statement of what actually ships, published as a standalone blue post rather than a
       reply in the PTR thread, so it legitimately has no forumPostNumber. It is NOT a
       build: its lines restate the whole patch as one paragraph per spec, which is why
       outlookFor excludes it from the tally (see the comment there). */
    const kind = build.kind ?? "build";
    if (kind !== "build" && kind !== "hotfix" && kind !== "patch-notes") {
      errors.push(`ptr-builds.json: entry ${build.date} has unknown kind "${build.kind}" (expected "build", "hotfix" or "patch-notes")`);
    }
    if (kind === "build" && !build.forumUrl) errors.push(`ptr-builds.json: build ${build.date} missing forumUrl`);
    if (kind === "patch-notes" && !build.forumUrl && !build.wowheadUrl) {
      errors.push(`ptr-builds.json: patch-notes ${build.date} needs a forumUrl or wowheadUrl — the notes are a published post and must be citable`);
    }
    if (kind === "hotfix") {
      if (!build.wowheadUrl) errors.push(`ptr-builds.json: hotfix ${build.date} missing wowheadUrl — a hotfix has no forum post, so the Wowhead round-up is its citation`);
      if (build.forumUrl) errors.push(`ptr-builds.json: hotfix ${build.date} carries a forumUrl — hotfixes are not forum build posts and must not be cited as one`);
      if (build.forumPostNumber != null) errors.push(`ptr-builds.json: hotfix ${build.date} carries a forumPostNumber — there is no forum post to number`);
    }
    for (const u of ["forumUrl", "wowheadUrl", "icyveinsUrl"]) urlOk(build[u], `ptr-builds.json: build ${build.date} ${u}`);
    // The feed's canonical source is the official forum thread; the news links are
    // site-specific by definition — any other host means a fabricated citation.
    hostOk(build.forumUrl, BLIZZARD_FORUM_HOSTS, `ptr-builds.json: build ${build.date} forumUrl`);
    hostOk(build.wowheadUrl, WOWHEAD_HOSTS, `ptr-builds.json: build ${build.date} wowheadUrl`);
    hostOk(build.icyveinsUrl, ICYVEINS_HOSTS, `ptr-builds.json: build ${build.date} icyveinsUrl`);
    // Each entry must resolve against the roster ("Spec Class") or a class-wide prefix
    // ("Class (…)"), otherwise outlookFor silently never counts it.
    for (const e of build.specsAffected ?? []) {
      const classWide = [...classNames].some(c => e.startsWith(`${c} (`));
      if (!rosterNames.has(e) && !classWide) errors.push(`ptr-builds.json: build ${build.date} specsAffected "${e}" matches no roster spec or "Class (" prefix`);
    }
    // --- coverage gate (2026-08-01) ---
    // specsAffected and highlights are written independently, and nothing forced them to
    // agree. Build #1 recorded 39 affected specs but only 6 highlight lines, so 30 specs'
    // 12.1 changes reached no drawer and never entered the outlook tally — invisible for
    // six weeks, because every field was individually well-formed. Builds #6/#10/#11 had
    // the same shape. Rule: a spec named in specsAffected must actually receive a line.
    // Class-wide entries are exempt (they are scoped by membership, not by their own
    // line), and a build with no highlights at all is a legitimate no-tuning post.
    // Reachability is asked of specBuildChanges itself, never re-implemented here: the
    // drawer's rule includes class-wide lines scoped by build membership, and a gate with
    // its own copy of the rule would drift from the surface it is supposed to protect.
    if ((build.highlights ?? []).length) {
      const missing = (build.specsAffected ?? [])
        .filter(e => rosterNames.has(e))
        .filter(e => {
          const spec = specs.find(s => `${s.spec} ${s.class}` === e);
          /* Ask about THIS BUILD, not "any entry sharing its date" (audit 2026-08-14). The
             old form matched on `x.date === build.date`, so where two entries share a day —
             2026-07-31 carries three and 2026-07-08 two — a spec covered by one sibling
             satisfied the gate for the other, and an entry could name a spec it never
             touched. Passing a single-build feed keeps specBuildChanges' own routing
             (class-wide lines are still scoped by THIS build's membership) while making the
             question per-entry, which is what "specsAffected and highlights must agree"
             means. Verified to fire on nothing in the committed feed: 0 specs were being
             credited by a sibling, so this tightens the rule without moving today's result.
             If it ever does fire, check the DATA first — an entry naming a spec it has no
             line for is usually a mis-scoped specsAffected, not a gate that is too strict. */
          return spec && !specBuildChanges(spec, { builds: [build] }).length;
        });
      if (missing.length) {
        errors.push(`ptr-builds.json: build ${build.date} lists ${missing.length} spec(s) in specsAffected with no highlight line — they would reach no drawer: ${missing.slice(0, 6).join(", ")}${missing.length > 6 ? ", …" : ""}`);
      }
    }
  }

  // --- tier-set upkeep gate (2026-07-21) ---
  // The spec card's "Season 2 tier set" box renders spec.tierSet as fact; builds keep
  // revising set bonuses, and before this gate nothing forced the field to follow
  // (every card but one still showed the 06-18 datamine on 07-21). Rule: when a build's
  // highlights name a spec next to a set keyword, that spec's tierSet.asOf must be on
  // or after the build date. A re-verify that finds the wording unchanged still bumps
  // asOf with the build's source — cheap, and it keeps the card's "datamined <date>"
  // label honest. False positives only ever cost that same re-verify.
  // "class set" was added 2026-08-02: the 07-16 healer hotfix wrote the Preservation
  // Evoker 2-set change as "Class set triggers Living Flame at 100% value (was 150%)" —
  // no "tier", no piece count, no "bonus" — so it named a spec beside a real set
  // revision and the gate stayed green. Blizzard uses "class set" and "tier set"
  // interchangeably in blue posts, so match both rather than relying on the feed
  // normalising the wording.
  const SET_KEYWORD = /\b(?:tier|class)[ -]sets?\b|\b[24][ -](?:set|piece)\b|\b[24]\s?pc\b|\bset bonus/i;
  for (const spec of specs) {
    // Both highlight conventions in the wild: the feed's "Spec Class — …" prefix and
    // the skill-documented "(Class — Spec)" suffix (em-dash or hyphen).
    const name = `${spec.spec} ${spec.class}`;
    const names = [name, `(${spec.class} — ${spec.spec})`, `(${spec.class} - ${spec.spec})`];
    const dated = (ptrBuilds?.builds ?? []).filter(b => ISO_DATE.test(b.date ?? ""));
    const newestNamed = dated
      .filter(b => (b.highlights ?? []).some(h => typeof h === "string" && names.some(n => h.includes(n)) && SET_KEYWORD.test(h)))
      .reduce((m, b) => (b.date > m ? b.date : m), "");
    /* CLASS-WIDE set lines count too (audit 2026-08-14). The matcher above only sees a
       spec's own NAME, but `specBuildChanges` also routes "Warrior (class-wide) — …" lines
       to every spec of the class, so a set bonus revised class-wide reached all three
       drawers while owing no `tierSet.asOf` upkeep from any of them. Rather than restate
       the routing rule here — it is subtle (a "Class (…)" line is only whole-class when it
       carries the class-wide sentinel; otherwise it is a HERO-TREE scope that attaches only
       where specsAffected names the spec) and a second copy would drift — ask
       specBuildChanges directly, so the gate sees exactly the lines the drawer shows.
       Latent when written: the feed carried 0 such lines, so this fires on nothing today. */
    const newestRouted = specBuildChanges(spec, { builds: dated })
      .filter(b => (b.lines ?? []).some(l => l.classWide && SET_KEYWORD.test(l.text)))
      .reduce((m, b) => (b.date > m ? b.date : m), "");
    const newest = newestRouted > newestNamed ? newestRouted : newestNamed;
    if (newest && !(spec.tierSet?.asOf >= newest)) {
      errors.push(`specs.json: ${name} tierSet.asOf ${spec.tierSet?.asOf ?? "(absent)"} predates the ${newest} build whose notes touched this tier set — update tierSet (set2/set4/asOf/source) alongside the build entry`);
    }
  }

  // --- history snapshots (movement baselines + the freshness heartbeat's proof of life) ---
  // The nightly agent's whole data/ tree travels to the publish job, so a snapshot it
  // wrote is committed like any data file. A future-dated snapshot would permanently
  // silence the staleness heartbeat (checkFreshness trusts historySnapshots[0].date)
  // and corrupt every movement baseline — reject it like any other future-dated claim.
  for (const snap of historySnapshots ?? []) {
    isoOk(snap?.date, "data/history: snapshot date");
    if (snap?.date == null) errors.push("data/history: snapshot missing its date field");
    if (snap?.specs == null || typeof snap.specs !== "object") errors.push(`data/history: snapshot ${snap?.date ?? "?"} has no specs state`);
  }

  // --- encounter tiers (per-boss / per-dungeon Archon tiers; a whole displayed file) ---
  if (encounterTiers != null) {
    isoOk(encounterTiers.asOf, "encounter-tiers.json: asOf");
    const archon = scales.scales?.archon;
    for (const bracket of ["raid", "mplus"]) {
      for (const [slug, enc] of Object.entries(encounterTiers[bracket] ?? {})) {
        if (typeof enc.name !== "string" || !enc.name) errors.push(`encounter-tiers.json: ${bracket}/${slug} needs a name`);
        for (const [k, tier] of Object.entries(enc.tiers ?? {})) {
          const [cls, sp] = k.split("|");
          if (!specKeys.has(`${cls}|${sp}`)) errors.push(`encounter-tiers.json: ${bracket}/${slug} references unknown spec "${k}"`);
          if (archon && archon.values?.[tier] === undefined) errors.push(`encounter-tiers.json: ${bracket}/${slug} "${k}" tier "${tier}" not in the archon scale`);
        }
      }
    }
  }

  // --- pending transcript queue (agent-maintained; ids reach the deterministic
  // fetch step's URLs, so the 11-char id shape is a hard requirement here) ---
  if (pendingTranscripts != null) {
    const vids = pendingTranscripts.videos;
    if (!Array.isArray(vids)) {
      errors.push("pending-transcripts.json: videos must be an array");
    } else {
      const seen = new Set();
      for (const v of vids) {
        const label = `pending-transcripts.json: video "${v?.id ?? "?"}"`;
        if (typeof v?.id !== "string" || !/^[A-Za-z0-9_-]{11}$/.test(v.id)) errors.push(`${label} needs an 11-char YouTube id`);
        else if (seen.has(v.id)) errors.push(`${label} is queued twice`);
        else seen.add(v.id);
        if (typeof v?.creator !== "string" || !v.creator) errors.push(`${label} needs a creator`);
        if (typeof v?.title !== "string" || !v.title) errors.push(`${label} needs a title`);
        isoOk(v?.published, `${label} published`);
        isoOk(v?.queuedAt, `${label} queuedAt`);
      }
    }

    /* seen[] closes the OTHER half of the same problem (2026-08-08). skipped[] made
       "transcript read, nothing to distil" durable, but DISCOVERY still re-derived its
       seen-set by regex over log.md prose — which matched any 11-char token and had
       accumulated 231 ordinary English words ("residential", "substantial",
       "speculative") among 950 entries, making the set impossible to reconcile against
       anything. seen[] is the structured remainder: ids considered by an earlier run that
       carry no richer record. A distilled video is cited by its take's url, a verified
       reject lives in skipped[], a waiting one in videos[] — everything else belongs here,
       and the seen-set is now the union of those four with no prose involved. */
    const seenLane = pendingTranscripts.seen;
    if (seenLane != null) {
      if (!Array.isArray(seenLane)) {
        errors.push("pending-transcripts.json: seen must be an array of video ids");
      } else {
        const dupe = new Set();
        const queuedIds = new Set(Array.isArray(vids) ? vids.map(v => v?.id) : []);
        for (const id of seenLane) {
          if (typeof id !== "string" || !/^[A-Za-z0-9_-]{11}$/.test(id)) {
            errors.push(`pending-transcripts.json: seen entry ${JSON.stringify(id)} is not an 11-char YouTube id`);
            continue;
          }
          if (dupe.has(id)) errors.push(`pending-transcripts.json: seen id "${id}" listed twice`);
          dupe.add(id);
          // A queued video is NOT done; listing it as seen would strand it in the queue.
          if (queuedIds.has(id)) errors.push(`pending-transcripts.json: "${id}" is both queued in videos[] and marked seen[]`);
        }
      }
    }

    // skipped[] is the durable record of videos whose transcript WAS read and which were
    // deliberately not distilled. Before it existed, "verified-skipped" lived only in
    // log.md prose, so every run re-derived its seen-set by regex and any miss re-queued
    // the video — Shadarek's comedy tier list came back three times (2026-07-31 fix).
    const skipped = pendingTranscripts.skipped;
    if (skipped != null) {
      if (!Array.isArray(skipped)) {
        errors.push("pending-transcripts.json: skipped must be an array");
      } else {
        const seenSkip = new Set();
        const queued = new Set(Array.isArray(vids) ? vids.map(v => v?.id) : []);
        for (const s of skipped) {
          const label = `pending-transcripts.json: skipped "${s?.id ?? "?"}"`;
          if (typeof s?.id !== "string" || !/^[A-Za-z0-9_-]{11}$/.test(s.id)) errors.push(`${label} needs an 11-char YouTube id`);
          else if (seenSkip.has(s.id)) errors.push(`${label} is listed twice`);
          else seenSkip.add(s.id);
          if (queued.has(s.id)) errors.push(`${label} is both queued and skipped — it must be one or the other`);
          if (typeof s?.creator !== "string" || !s.creator) errors.push(`${label} needs a creator`);
          // the reason is the whole point: a bare id would be indistinguishable from a bug
          if (typeof s?.reason !== "string" || s.reason.length < 10) errors.push(`${label} needs a reason (why the transcript yielded nothing)`);
          isoOk(s?.verifiedAt, `${label} verifiedAt`);
        }
      }
    }
  }

  /* --- the frozen forecast artifact (DECISION 2's render source) ---
     `frozenForecastActive` treats a wrong `kind` as "not a frozen forecast" — a gate, not
     an error — so a valid-JSON-but-wrong-shape artifact would silently disable the frozen
     lane post-flip and the column would quietly recompute off the settled consensus, the
     exact substitution this lane forbids. Shape errors must therefore be RED here, before
     any build can render from (or silently ignore) the file. Absent artifact stays valid:
     that is the whole pre-freeze history of the project. */
  if (frozenForecast != null) {
    const ff = frozenForecast, where = "data/forecasts/frozen-*.json";
    if (ff.kind !== "frozen-forecast") errors.push(`${where}: kind must be "frozen-forecast" (got ${JSON.stringify(ff.kind)}) — a mis-kinded artifact silently disables the frozen render lane`);
    isoOk(ff.date, `${where} date`);
    if (typeof ff.phase !== "string" || !ff.phase) errors.push(`${where}: needs a non-empty phase string — activation compares it against SNAPSHOT_PHASE`);
    if (!ff.cells || typeof ff.cells !== "object" || Array.isArray(ff.cells)) {
      errors.push(`${where}: needs a cells object keyed by "Class|Spec"`);
    } else {
      const specKeySet = new Set((specs ?? []).map(s => `${s.class}|${s.spec}`));
      for (const [key, cell] of Object.entries(ff.cells)) {
        if (!specKeySet.has(key)) errors.push(`${where}: cell "${key}" is not a roster spec`);
        for (const bracket of ["raid", "mplus"]) {
          const c = cell?.[bracket];
          if (c == null) continue;   // a declined bracket is an honest null
          if (typeof c.tier !== "string" || typeof c.score !== "number" || !Number.isFinite(c.score)) {
            errors.push(`${where}: cell "${key}" ${bracket} must carry {tier: string, score: finite number} or null`);
          }
        }
      }
    }
  }

  return errors;
}

export async function loadData(root) {
  const read = async name => JSON.parse(await readFile(path.join(root, "data", name), "utf8"));
  const [specs, sources, scales, community, ptrBuilds, creatorTakes, encounterTiers] = await Promise.all([
    read("specs.json"), read("sources.json"), read("scales.json"),
    read("community.json"), read("ptr-builds.json"), read("creator-takes.json"),
    read("encounter-tiers.json")
  ]);
  // History snapshots from data/history/, newest first. The cap bounds two consumers:
  // movement baselines (pickBaseline stops at the first DIFFERING snapshot, so any cap
  // ≥ a few days is plenty there) AND the drawer Timeline sparklines + the post-launch
  // forecast report card (historySeries), which want the WHOLE pre-launch window. At
  // daily cadence 120 covers ~4 months (the full 12.1-PTR → early-S2 horizon) without
  // truncating the Timeline as the season runs long. A missing directory means "no
  // history yet"; any OTHER failure (unreadable/corrupt JSON) throws — a corrupt history
  // file must error, not silently zero the movement feature.
  let historySnapshots = [];
  try {
    const dir = path.join(root, "data", "history");
    const files = (await readdir(dir)).filter(f => f.endsWith(".json")).sort().reverse().slice(0, 120);
    historySnapshots = await Promise.all(files.map(async f => JSON.parse(await readFile(path.join(dir, f), "utf8"))));
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  // Transcript queue is optional (repos without the transcript lane), but corrupt
  // JSON must error, not silently drop the queue.
  let pendingTranscripts = null;
  try {
    pendingTranscripts = await read("pending-transcripts.json");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  // Frozen final-season letters (data/season-final.json). Optional — absent means no
  // outlet has moved ahead of the live season yet, which reproduces the pre-2026-08-09
  // consensus exactly. Corrupt JSON must error rather than silently un-freeze a source,
  // because the silent failure mode is a consensus that quietly loses a contributor.
  let seasonFinal = null;
  try {
    seasonFinal = await read("season-final.json");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  /* The frozen pre-launch forecast artifact (data/forecasts/frozen-<date>.json, written
     once by `snapshot.mjs --frozen`; Gate-0 immutable). DECISION 2: after the phase flip
     this file — not the live projection machinery — is the render source for the forecast
     column, so the page keeps showing the forecast that was actually declared instead of
     recomputing one off the settled consensus (measured: 37 of 80 letters would silently
     differ — a forecast that already knows the answer). buildPayload decides WHEN it
     applies (artifact phase vs SNAPSHOT_PHASE); this only loads it. Newest artifact wins
     if several exist. Absent dir/file → null (the whole pre-freeze history of the
     project); corrupt JSON throws — silently dropping the record would silently switch
     the column back to live recomputation, which is the exact failure this lane exists
     to prevent. */
  let frozenForecast = null;
  try {
    const fDir = path.join(root, "data", "forecasts");
    const newest = (await readdir(fDir)).filter(f => /^frozen-\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort().at(-1);
    if (newest) frozenForecast = JSON.parse(await readFile(path.join(fDir, newest), "utf8"));
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  return { specs, sources, scales, community, ptrBuilds, creatorTakes, encounterTiers,
           historySnapshot: historySnapshots[0] ?? null, historySnapshots, pendingTranscripts,
           seasonFinal, frozenForecast };
}

/* SEASON-AHEAD BUT NEVER RE-MERGED — a WARNING, deliberately not an error (audit 2026-08-14).

   `seasonVerified` is a statement about the PAGE; the letters live in spec.ratings and are
   written by a separate merge step. When an outlet moves season, era-verify records the flip
   immediately — but if the merge cannot land, the registry says "this outlet describes the
   next season" while the stored letters are still last season's. consensusFor is protected
   from that split by the frozen lane; the FORECAST is not: nextPatchTierSources admits the
   outlet on the strength of the page, and ptrTierRead then reads last season's letters as a
   next-patch opinion at weight .30.

   The signature is exact and cheap to test: an outlet's stored letters being IDENTICAL to its
   own frozen final-season record on every spec, when a genuine re-merge moves 19-29 of 40.
   Measured 2026-08-14 across all six ahead source×bracket pairs — method/raid 28 moved,
   method/mplus 22, wowhead/raid 29, wowhead/mplus 19, icyveins/raid 23, and icyveins/mplus
   0 of 40. That one is the real thing: its S2 pages publish S+/B+ while the `icyveins` scale
   has five bands, so the merge is blocked pending an owner edit to scales.json (flip runbook
   step 3/4).

   WHY A WARNING. The condition is true right now, so an error would fail validate, the build
   and the nightly publish gate every night until the 08-18 re-merge — buying strictness by
   breaking the pipeline for four days. Promote it to an error once icyveins/mplus is clean;
   the check itself does not change, only the caller's reaction to it. */
const MIN_COMPARED = 10;
export function seasonLetterWarnings({ specs, sources, seasonFinal }, liveSeason = PHASES.liveSeason) {
  const warnings = [];
  for (const source of sources ?? []) {
    if (source.kind !== "tier-list" || !isLiveEra(source)) continue;
    for (const bracket of ["raid", "mplus"]) {
      if (aheadSeasonFor(source, bracket, liveSeason) == null) continue;
      const frozen = seasonFinal?.[liveSeason]?.[source.id]?.[bracket]?.letters;
      if (!frozen) continue; // nothing to compare against; the archive test covers absence
      let compared = 0, identical = 0;
      for (const spec of specs ?? []) {
        const was = frozen[`${spec.class}|${spec.spec}`];
        if (was === undefined) continue;
        compared++;
        if ((spec.ratings?.[bracket]?.[source.id] ?? null) === was) identical++;
      }
      if (compared >= MIN_COMPARED && identical === compared) {
        warnings.push(`${source.id}/${bracket}: page verifies as season-ahead, but all ${compared} stored letters are identical to its frozen ${liveSeason} record — the letters were never re-merged, so the 12.1 forecast is reading ${liveSeason} letters as a next-patch opinion`);
      }
    }
  }
  return warnings;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const data = await loadData(root);
  const errors = validateData(data, { fullRoster: true });
  if (errors.length) {
    console.error(`✗ ${errors.length} validation error(s):`);
    for (const error of errors) console.error("  - " + error);
    process.exit(1);
  }
  const warnings = seasonLetterWarnings(data);
  for (const warning of warnings) console.warn("⚠ " + warning);
  console.log(`✓ data valid — ${data.specs.length} specs, ${data.specs.filter(s => s.ptr).length} PTR-tracked${warnings.length ? ` (${warnings.length} warning${warnings.length === 1 ? "" : "s"})` : ""}`);
}
