/* The gearing subproject's season vocabulary, in ONE place (Phase E, decisions G22-G25).

   WHY THIS EXISTS. Ten harvesters, the validator, the build and the page each carried their
   own copy of "which patch is this, is the season open yet, does Wowhead serve these items
   from the /ptr/ namespace". At the 08-18 launch every one of those had to be found and
   edited by hand, which is exactly the class of one-shot the tracker already solved for
   itself with `PHASES` in src/normalize.mjs. Launch day is now a config edit here plus a
   harvest, and nothing else.

   DELIBERATELY NOT IMPORTED FROM THE TRACKER. gearing/ is self-contained by design
   (gearing/README.md) — the only coupling is read-only, harvest-specs reading the tracker's
   specs.json. Duplicating four fields is the price of that independence, and the pinned test
   in test/season.test.mjs fails if the two ever disagree about the live season. */

export const SEASON = {
  id: "s2",
  patch: "12.1",
  label: "Season 2",
  instance: "The Venomous Abyss",

  /* Blizzard's own date: "Week of August 18: Normal, Heroic, Mythic, and Raid Finder Wing 1"
     (the blue post Wowhead mirrored; Wowhead's own guide prose says the 11th and is wrong —
     measured 2026-08-12, and its own sticky comments dispute it). US 08-18, EU 08-19. */
  opensAt: "2026-08-18",

  /* The season's item-level ceiling. Was hardcoded in the page subhead; the ladder tables in
     data/ are the real source, so this is the ONE place a human states it. */
  maxItemLevel: 344,

  /* Wowhead serves unreleased items from a /ptr/ namespace and links them with
     `domain=ptr`. Both vanish at launch. Harvesters must ACCEPT both spellings either way —
     a stale link outlives the flip — but only EMIT the live one once this is null. */
  wowheadNamespace: "ptr",
};

/* Calendar facts, taken as arguments so nothing here reads the clock implicitly. Every
   caller passes a date it can explain; the page passes the reader's, the harvesters pass
   the run's. */
export const seasonHasOpened = (today, season = SEASON) =>
  String(today ?? "") >= season.opensAt;

/* Does this harvest predate the season it claims to describe? The staleness banner (G23)
   turns on exactly this, and it is the honest question — not "how old is the data", which
   would make a page harvested 2 days before launch look fresher than one harvested 5 days
   after it. */
export const dataPredatesSeason = (harvestedAt, season = SEASON) =>
  !!harvestedAt && String(harvestedAt) < season.opensAt;

/* G23: what the page must say, given a harvest date and today. Returns null when there is
   nothing to disclose, so a caller can render the banner or not without restating the rule. */
export function stalenessNotice(harvestedAt, today, season = SEASON) {
  if (!harvestedAt) {
    return { state: "unharvested", season: season.label,
      detail: `No harvest has run for ${season.label}.` };
  }
  if (!seasonHasOpened(today, season)) return null;          // pre-launch: the caveat is true
  if (!dataPredatesSeason(harvestedAt, season)) return null;  // harvested after the open: fine
  return {
    state: "predates-season",
    season: season.label,
    harvestedAt,
    opensAt: season.opensAt,
    detail: `${season.label} opened ${season.opensAt}; this data was harvested ${harvestedAt}, `
      + "before the season went live, so item levels and drop assignments may have changed.",
  };
}

/* G24: a guide pick naming content this season does not contain cannot be acted on — it
   would put an unreachable item in a list whose whole job is telling you what to go and get.
   Dropped, and COUNTED, so the staleness is disclosed per source rather than absorbed.
   `resolve` is the caller's roster lookup (lib-guides' resolveDropSource with soft:true). */
export function partitionStalePicks(picks, resolve) {
  const kept = [], dropped = [];
  for (const pick of picks ?? []) {
    // A pick with no source text at all is not evidence of staleness — it is just unlabelled,
    // and the harvesters already refuse a run that cannot name its sources.
    if (!pick?.sourceText) { kept.push(pick); continue; }
    (resolve(pick.sourceText) ? kept : dropped).push(pick);
  }
  return { kept, dropped };
}

export const staleDisclosure = (bySource) => Object.entries(bySource ?? {})
  .filter(([, dropped]) => dropped > 0)
  .map(([source, dropped]) => ({ source, dropped }))
  .sort((a, b) => b.dropped - a.dropped || a.source.localeCompare(b.source));
