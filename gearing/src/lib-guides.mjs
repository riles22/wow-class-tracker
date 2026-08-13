/* Shared normalization + consensus math for the guide-harvest layer (Phase B,
   docs/gearing-s2-scope.md decisions G9-G14).

   WHY THIS EXISTS. Three human-authored guides and one log-derived source all describe the
   same 40 specs and the same ~350 items, and every one of them uses its own vocabulary for
   slots, its own free-text for drop sources, and its own axis for scoping a stat priority.
   The harvesters must agree on those normalizations exactly, or "how many guides name this
   item" silently counts the same pick twice or misses it. So the normalizations live here,
   once, with tests — never inside a harvester.

   Nothing in this file fetches. Harvesters fetch; this decides what a fetched string MEANS. */

/* ---------- slots ----------
   Canonical vocabulary is the one already in gearing/data (raid-items.json / dungeon-items.json)
   and mirrored by SLOT_ORDER in app.template.html. Guides do NOT use it:
     · Icy Veins  — "Helm", "Cloak", "Bracers", "Ring", "Main Hand", plus Shirt/Tabard placeholders
     · Wowhead    — armour-class-qualified ("Cloth Legs", "Mail Helm", "Plate Feet") and
                    weapon-subtype-qualified ("1H Axe", "2H Mace", "Ranged Bow", "Off-Hand Weapon")
     · Method     — close to Icy Veins, occasionally "Weapon"
   Everything collapses onto SLOTS below. Shirt and Tabard are deliberately DROPPED, not
   mapped: they carry no stats, Icy Veins ships them as empty placeholder cells, and a pick
   there is never a gearing decision. */
export const SLOTS = ["Head", "Neck", "Shoulder", "Back", "Chest", "Wrist", "Hands", "Waist",
  "Legs", "Feet", "Finger", "Trinket", "Main Hand", "One-Hand", "Two-Hand", "Off Hand",
  "Held In Off-hand", "Ranged"];

export const IGNORED_SLOTS = new Set(["shirt", "tabard"]);

/* Armour classes and weapon subtypes that Wowhead prefixes/suffixes onto a slot label. They
   are real information (they gate eligibility) but they are NOT the slot, and the item's own
   tooltip already carries them — so they are stripped here rather than parsed. */
const ARMOR_WORDS = ["cloth", "leather", "mail", "plate"];
const WEAPON_WORDS = ["axe", "sword", "mace", "dagger", "staff", "polearm", "warglaive",
  "fist weapon", "bow", "gun", "crossbow", "wand", "shield", "weapon"];

const SLOT_ALIASES = new Map(Object.entries({
  helm: "Head", head: "Head", helmet: "Head",
  neck: "Neck", necklace: "Neck", amulet: "Neck",
  shoulder: "Shoulder", shoulders: "Shoulder", spaulders: "Shoulder",
  back: "Back", cloak: "Back", cape: "Back",
  chest: "Chest", robe: "Chest", tunic: "Chest",
  wrist: "Wrist", wrists: "Wrist", bracers: "Wrist", bracer: "Wrist",
  hands: "Hands", gloves: "Hands", glove: "Hands", gauntlets: "Hands",
  waist: "Waist", belt: "Waist",
  legs: "Legs", pants: "Legs", leggings: "Legs",
  feet: "Feet", boots: "Feet", "foot": "Feet",
  finger: "Finger", ring: "Finger", rings: "Finger", "ring 1": "Finger", "ring 2": "Finger",
  trinket: "Trinket", trinkets: "Trinket", "trinket 1": "Trinket", "trinket 2": "Trinket",
  "main hand": "Main Hand", mainhand: "Main Hand", "main-hand": "Main Hand",
  "one hand": "One-Hand", "one-hand": "One-Hand", "1h": "One-Hand",
  "two hand": "Two-Hand", "two-hand": "Two-Hand", "2h": "Two-Hand", twohand: "Two-Hand",
  "off hand": "Off Hand", offhand: "Off Hand", "off-hand": "Off Hand",
  "held in off-hand": "Held In Off-hand", "held in off hand": "Held In Off-hand",
  ranged: "Ranged",
}));

/* Unicode hygiene. Method writes typographic apostrophes (Nek’zali, Kings’ Rest) where
   Wowhead writes straight ones — measured 2026-08-12. Left unnormalized, every Method boss
   name silently fails to join and G10's bracket-matched vote quietly loses a source. Also
   folds NBSP and the various dashes, which appear in all three sources' free text. */
/* HTML entities are decoded FIRST. Method ships the bytes `Nek&rsquo;zali`, not the raw
   character (measured 2026-08-13), so folding the character alone never fires — there is
   no apostrophe to fold until the entity is decoded. Undecoded, matchKey reduces
   "King&rsquo;s Rest" to "kingrsquos rest" and every Method boss join fails silently. */
const ENTITIES = new Map(Object.entries({
  rsquo: "’", lsquo: "‘", apos: "'", quot: '"', ldquo: "“", rdquo: "”",
  amp: "&", lt: "<", gt: ">", nbsp: " ", ndash: "–", mdash: "—",
  hellip: "…", eacute: "é", uuml: "ü", deg: "°",
}));

export const decodeEntities = (value) => String(value ?? "")
  .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
  .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
  .replace(/&([a-z]+);/gi, (whole, name) => ENTITIES.get(name.toLowerCase()) ?? whole);

export const normalizeText = (value) => decodeEntities(value)
  .normalize("NFKC")
  .replace(/[‘’ʼ′]/g, "'")
  .replace(/[“”]/g, '"')
  .replace(/[‐-―−]/g, "-")
  .replace(/ /g, " ")
  .replace(/\s+/g, " ")
  .trim();

const slotKey = (value) => normalizeText(value).toLowerCase()
  .replace(/[.,]/g, "")
  .replace(/\s+\d+$/, (m) => m)   // keep "ring 1" distinguishable before alias lookup
  .trim();

/* Returns a canonical slot, or null for a label we deliberately ignore (shirt/tabard).
   THROWS on an unrecognised label: a guide inventing a slot we cannot place is a parser
   bug or a page redesign, and silently dropping the row would shrink a consensus count
   with nothing to show for it. Same reasoning as the boss-name rule below. */
export function normalizeSlot(raw, { where = "" } = {}) {
  const key = slotKey(raw);
  if (!key) throw new Error(`normalizeSlot: empty slot label${where ? ` (${where})` : ""}`);
  if (IGNORED_SLOTS.has(key)) return null;
  if (SLOT_ALIASES.has(key)) return SLOT_ALIASES.get(key);

  // Strip an armour-class or weapon-subtype qualifier and retry: "Cloth Legs" -> "Legs",
  // "1H Axe" -> "One-Hand", "Off-Hand Weapon" -> "Off Hand", "Ranged Bow" -> "Ranged".
  let rest = key;
  for (const word of [...ARMOR_WORDS, ...WEAPON_WORDS]) {
    rest = rest.replace(new RegExp(`(^|\\s)${word}(\\s|$)`, "g"), " ").trim();
  }
  rest = rest.replace(/\s+/g, " ").trim();
  if (rest && rest !== key) {
    if (IGNORED_SLOTS.has(rest)) return null;
    if (SLOT_ALIASES.has(rest)) return SLOT_ALIASES.get(rest);
  }
  // A bare weapon subtype with no slot word: Wowhead writes "1H Axe" / "2H Mace".
  if (/^1h\b/.test(key)) return "One-Hand";
  if (/^2h\b/.test(key)) return "Two-Hand";
  if (/^ranged\b/.test(key)) return "Ranged";
  if (/^shield$/.test(rest || key)) return "Off Hand";

  /* A qualified label ends with the slot noun, so try progressively shorter SUFFIXES.
     Ula'tek's panel prefixes the set name ("Venomcursed Cloth Helm" -> "venomcursed helm"
     after the armour word goes), and guides prefix difficulty or tier words the same way.
     Suffix-matching is safe because every multi-word alias ("main hand", "off hand") is
     itself matched above before we get here. */
  const words = (rest || key).split(" ").filter(Boolean);
  for (let start = Math.max(0, words.length - 2); start < words.length; start++) {
    const suffix = words.slice(start).join(" ");
    if (IGNORED_SLOTS.has(suffix)) return null;
    if (SLOT_ALIASES.has(suffix)) return SLOT_ALIASES.get(suffix);
  }

  throw new Error(`normalizeSlot: unrecognised slot "${raw}"${where ? ` (${where})` : ""} — `
    + "add an alias here rather than dropping the row (docs/gearing-s2-scope.md Phase B)");
}

/* ---------- brackets (G10) ----------
   A source's vote on an item is decided by the list matching that ITEM's own bracket, with
   "overall" as the fallback when an outlet publishes no bracket-specific list. */
export const BRACKETS = ["raid", "mplus", "overall"];

export function normalizeBracket(raw) {
  const key = normalizeText(raw).toLowerCase();
  if (!key) return "overall";
  // "Best Gear from the Raids" — PLURAL. Four Method specs head their raid list that way
  // (Prot Paladin, Balance Druid, Destruction Warlock, Devourer DH); without it they
  // collide at "overall" and the harvester refuses the page. Measured: 36/40 -> 40/40.
  if (/\b(raid|raids|raiding)\b/.test(key)) return "raid";
  if (/(mythic\s*\+|mythic plus|m\+|dungeon|dungeons)/.test(key)) return "mplus";
  if (/\boverall\b|\bgeneral\b|\bbest in slot\b/.test(key)) return "overall";
  return "overall";
}

/* An item's own bracket, from the shape gearing already stores (kind: raid | mplus). */
export const bracketOfItem = (item) => (item?.kind === "mplus" ? "mplus" : "raid");

/* ---------- drop sources ----------
   Icy Veins writes free text that collides with itself ("The Coiled Altar" / "Coiled Altar",
   "Nek'zali" / "Nek'zali the Soulcoiler", "Crafted by Leatherworking" / "Leatherworking",
   and both orderings of "Catalyst + X"). Wowhead and Method link the boss's own guide, so
   their names are cleaner but still differ in punctuation. Everything is matched against OUR
   harvested roster rather than a hand-written list, so the canonical names move with the
   data instead of drifting from it. */
/* Icy Veins writes the profession either way round — "Crafted by Leatherworking" and a bare
   "Leatherworking" both appear in the same 140-node sample, and a bare one is not a boss. */
const PROFESSIONS = new Set(["blacksmithing", "leatherworking", "tailoring", "jewelcrafting",
  "engineering", "alchemy", "enchanting", "inscription"]);
const CRAFTED = /^(crafted by |crafted$|crafting|profession)/;
const CATALYST = /catalyst/;
/* Non-drop sources the guides name alongside bosses. Each is a real answer to "where does
   this come from" and none is a boss, so forcing them onto the roster would be a false
   attribution. Measured in the 2026-08-13 full-roster dry runs. */
const NON_DROP = [
  [/\bgreat vault\b/, "vault"],
  [/\bbo[ep]\b|\btrash drop\b|\bworld drop\b/, "boe"],
  [/\bpvp\b|\bconquest\b|\bhonor\b/, "pvp"],
  [/\bdelve\b/, "delve"],
];
/* A guide often names two sources for one pick — "The Great Vault or Entombed Sentinels",
   "Catalyst + Coiled Altar", and both orderings of the latter. Split on the shared idiom
   so each part can be resolved on its own terms. */
const SPLIT_IDIOM = /\s*(?:\+|\/|\bor\b)\s*/i;

export function rosterFrom(raid, dungeons) {
  const bosses = [], dungeonNames = [];
  for (const boss of raid?.bosses ?? []) {
    const names = [boss.name, ...(boss.dropAliases ?? [])].filter(Boolean);
    bosses.push({ kind: "raid", canonical: boss.name, ordinal: boss.boss, names });
  }
  /* The raid INSTANCE itself is a legitimate answer — Icy Veins writes "Venomous Abyss" for
     a pick it does not attribute to one boss. Emitting only bosses made that unresolvable
     (measured: Outlaw Rogue's whole BiS page failed on it). Listed after the bosses so a
     boss name always wins the join. */
  if (raid?.instance) {
    bosses.push({ kind: "raid-instance", canonical: raid.instance, names: [raid.instance] });
  }
  for (const dungeon of dungeons?.dungeons ?? []) {
    dungeonNames.push({ kind: "mplus", canonical: dungeon.name,
      names: [dungeon.name, ...(dungeon.encounters ?? [])].filter(Boolean) });
  }
  return [...bosses, ...dungeonNames];
}

const matchKey = (value) => normalizeText(value).toLowerCase().replace(/^the\s+/, "").replace(/[^a-z0-9 ]/g, "");

/* Resolve a guide's free-text drop label to a canonical source.
   Returns { kind, canonical } for a matched boss/dungeon, or a typed non-drop record for
   crafted/catalyst text. THROWS on anything else — per the scope, an unmatchable name is a
   hard error rather than a dropped row, because a dropped row is a vote that vanishes
   without trace. Callers that legitimately expect misses pass { soft: true }. */
export function resolveDropSource(raw, roster, { soft = false, where = "" } = {}) {
  const text = normalizeText(raw);
  if (!text) return null;
  /* Markers are tested against the FULL text, parentheticals included. A trailing "(…)" is
     sometimes an aside ("Jewelcrafting ( see note )") and sometimes the whole meaning
     ("King's Rest (Catalyst)") — stripping before typing turned the second into a plain
     dungeon and silently lost the catalyst fact. So: type first, strip only for lookup. */
  const lower = text.toLowerCase();

  /* Catalyst, in every form the three guides write it: "Catalyst + X", "X + Catalyst",
     "X/Catalyst" and the parenthetical "X (Catalyst)". Strip the marker wherever it sits
     and resolve what remains as the base — the place you actually farm. */
  if (CATALYST.test(lower)) {
    const withoutMarker = text
      .replace(/\s*\(\s*catalyst[^)]*\)\s*/i, " ")
      .split(SPLIT_IDIOM).map((part) => part.trim())
      .filter((part) => part && !CATALYST.test(part.toLowerCase()));
    const base = withoutMarker.length ? resolveDropSource(withoutMarker[0], roster, { soft: true }) : null;
    return { kind: "catalyst", canonical: text, base: base?.canonical ?? null,
      baseKind: base?.kind ?? null };
  }

  for (const [pattern, kind] of NON_DROP) if (pattern.test(lower)) {
    // "The Great Vault or Entombed Sentinels" names a real boss alongside a non-drop route;
    // keep the boss when there is one, so the pick still attaches to a source.
    const parts = text.split(SPLIT_IDIOM).map((part) => part.trim()).filter(Boolean);
    for (const part of parts) {
      if (pattern.test(part.toLowerCase())) continue;
      const resolved = resolveDropSource(part, roster, { soft: true });
      if (resolved) return { ...resolved, via: kind, canonicalRaw: text };
    }
    return { kind, canonical: text };
  }

  // Now the aside strip, for profession and roster lookup only.
  const bare = text.replace(/\s*\([^)]*\)\s*$/, "").trim() || text;
  const bareLower = bare.toLowerCase();
  if (CRAFTED.test(bareLower) || PROFESSIONS.has(bareLower)) return { kind: "crafted", canonical: bare };
  const key = matchKey(bare);
  let best = null;
  for (const entry of roster) {
    for (const name of entry.names) {
      const candidate = matchKey(name);
      if (!candidate) continue;
      if (candidate === key) return { kind: entry.kind, canonical: entry.canonical };
      // A guide's short form ("Nek'zali") against our full name ("Nek'zali the Soulcoiler").
      if (candidate.startsWith(key + " ") || key.startsWith(candidate + " ")) {
        const score = Math.min(candidate.length, key.length);
        if (!best || score > best.score) best = { kind: entry.kind, canonical: entry.canonical, score };
      }
    }
  }
  if (best) return { kind: best.kind, canonical: best.canonical };
  if (soft) return null;
  throw new Error(`resolveDropSource: "${raw}" matches no harvested boss or dungeon`
    + `${where ? ` (${where})` : ""} — fix the roster join rather than dropping the pick`);
}

/* ---------- builds (G12) ----------
   The union across sources needs a SYNTHETIC id, because two outlets can publish the same
   variant name and the client currently matches builds by name alone (Phase-A recon). */
export const slugify = (value) => normalizeText(value).toLowerCase()
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export const buildId = (source, label) => `${source}:${slugify(label) || "general"}`;

/* Soft caps live inside the priority label itself ("Haste to 18%", "Critical Strike to 40%").
   Captured as data even where v1 only displays them (scope, Phase B). */
export function parseSoftCap(label) {
  const text = normalizeText(label);
  // Percentage idiom: "Haste to 18%", "Critical Strike to 40%".
  const pct = text.match(/^(.*?)\s+to\s+([\d.]+)\s*(%|percent)?$/i);
  if (pct && Number.isFinite(Number(pct[2]))) {
    return { stat: pct[1].trim(), value: Number(pct[2]), unit: pct[3] ? "%" : null, text };
  }
  /* RATING idiom, a genuinely different quantity: "Haste (until 1800 rating)" (Discipline
     Priest) and "Haste (to 1100)" (Subtlety Rogue). Found by the full-roster dry run
     2026-08-13; without this the caps for those specs were unmodelled data. Unit is
     recorded as "rating" — a rating cap and a percentage cap must never be compared. */
  const rating = text.match(/^(.*?)\s*\(\s*(?:until|to|at)\s+([\d,.]+)\s*(rating)?\s*\)$/i);
  if (rating) {
    const value = Number(rating[2].replace(/,/g, ""));
    if (Number.isFinite(value)) {
      return { stat: rating[1].trim(), value, unit: rating[3] ? "rating" : "rating", text };
    }
  }
  return null;
}

/* ---------- consensus (G9 + G10) ----------
   Pure, so Phase C can wire it into the UI without re-deriving it, and so the counting rules
   are testable without a browser.

   picks: [{ source, bracket, slot, itemId, endorsement: "bis" | "alternative" }]
   item:  { id, kind }  — the item's own bracket decides which list votes (G10)

   Returns TWO counts that never sum (G9), plus who cast each, so a surface can name them. */
export function consensusForItem(picks, item, { sources = null } = {}) {
  const itemId = String(item?.id ?? item);
  const bracket = bracketOfItem(item);
  const bySource = new Map();
  for (const pick of picks ?? []) {
    if (String(pick.itemId) !== itemId) continue;
    if (sources && !sources.includes(pick.source)) continue;
    // G10: the bracket-matching list wins; "overall" is the fallback, never an extra vote.
    const rank = pick.bracket === bracket ? 2 : pick.bracket === "overall" ? 1 : 0;
    if (rank === 0) continue;
    const held = bySource.get(pick.source);
    // A stronger endorsement, or a better-matching list, replaces what that source held.
    const strength = pick.endorsement === "bis" ? 2 : 1;
    if (!held || rank > held.rank || (rank === held.rank && strength > held.strength)) {
      bySource.set(pick.source, { rank, strength, endorsement: pick.endorsement, bracket: pick.bracket });
    }
  }
  const picksBy = [], alternativesBy = [];
  for (const [source, held] of bySource) {
    (held.endorsement === "bis" ? picksBy : alternativesBy).push(source);
  }
  picksBy.sort(); alternativesBy.sort();
  return { picks: picksBy.length, alternatives: alternativesBy.length, picksBy, alternativesBy };
}

/* Ordering key for G1: consensus first (BiS picks, then alternatives), stat fit as the
   tiebreak the caller supplies. Deliberately returns a comparator INPUT rather than sorting,
   so Phase C keeps ownership of what "stat fit" means. */
export const consensusRank = (consensus) =>
  (consensus?.picks ?? 0) * 1000 + (consensus?.alternatives ?? 0);

/* ---------- ranking (G15) and the default build (G17) ----------
   Phase C's ordering, kept here as pure functions so the rules are testable without a DOM
   and so the client cannot quietly grow a second opinion about what "rank 1" means. */

/* Which band a candidate sits in. THE MEASURED SHAPE THAT DRIVES THIS: guides name roughly
   one item per slot per list, so a slot holds 1-3 named candidates against 5-15 that no
   guide mentions. Strict gating would let a single passing "alternative" mention bury a
   materially better-statted item across that unnamed majority, so only a BiS PICK is
   promoted outright; an alternative competes on stat fit and merely breaks ties. */
export const BAND = { PICK: 2, PLAIN: 1 };

export const bandOf = (consensus) => ((consensus?.picks ?? 0) > 0 ? BAND.PICK : BAND.PLAIN);

/* Order candidates for one slot. `entries` are { item, consensus, fit } where `fit` is
   whatever the caller's stat model produced (higher is better) — this function deliberately
   does NOT know how fit is computed, so custom weights (G6) flow through unchanged.
   Item level is absent on purpose: G16 makes it a column, never an ordering term. */
export function rankCandidates(entries) {
  return entries.slice().sort((a, b) => {
    const band = bandOf(b.consensus) - bandOf(a.consensus);
    if (band) return band;
    if (bandOf(a.consensus) === BAND.PICK) {
      const picks = (b.consensus?.picks ?? 0) - (a.consensus?.picks ?? 0);
      if (picks) return picks;
      const alts = (b.consensus?.alternatives ?? 0) - (a.consensus?.alternatives ?? 0);
      if (alts) return alts;
    }
    const fit = (b.fit ?? 0) - (a.fit ?? 0);
    if (fit) return fit;
    // Within the plain band an alternative endorsement is the TIEBREAK, never a promotion.
    const alts = (b.consensus?.alternatives ?? 0) - (a.consensus?.alternatives ?? 0);
    if (alts) return alts;
    return String(a.item?.name ?? "").localeCompare(String(b.item?.name ?? ""));
  });
}

/* G17: default to a build whose scoping more than one SOURCE publishes, else the first
   published variant. Corroboration is keyed on the scoping axes the guides actually state
   (hero talent + bracket), never on the label text, which each outlet words differently. */
export const scopeKey = (build) =>
  [slugify(build?.heroTalent ?? ""), slugify(build?.bracket ?? "")].join("|");

export function defaultBuildFor(builds) {
  const list = builds ?? [];
  if (!list.length) return null;
  const sourcesByScope = new Map();
  for (const build of list) {
    const key = scopeKey(build);
    if (!key.replace("|", "")) continue;   // wholly unscoped variants cannot corroborate
    if (!sourcesByScope.has(key)) sourcesByScope.set(key, new Set());
    sourcesByScope.get(key).add(build.source);
  }
  let best = null;
  for (const build of list) {
    const backers = sourcesByScope.get(scopeKey(build))?.size ?? 0;
    if (backers > 1 && (!best || backers > best.backers)) best = { build, backers };
  }
  return best?.build ?? list[0];
}

/* ---------- the game plan (G2, G18-G21) ----------
   "Which bosses and dungeons are worth my week." Pure, so the two value components can be
   tested without a DOM and so the client cannot grow a second opinion about either.

   THE TWO COMPONENTS NEVER MERGE (G2). `coverage` answers "how many of my ranked slots does
   this source improve"; `delta` answers "how much item level would I actually gain". They are
   returned side by side, never summed, and the caller picks ONE as the sort key and says which
   (G18). */

/* One entry per plannable source. Raid is per BOSS and M+ per DUNGEON (G20) — you kill a boss
   but you run a dungeon, so that is the unit each reader plans around. The caller supplies the
   grouping and each item's attainable item level, because both come from data this module
   deliberately does not read (`boss.dropLevels`, `DUNG.keyLevels`, `maxAttainable`). */
export function planForSources(entries, { rankedBySlot = new Map(), worn = null } = {}) {
  const plans = [];
  for (const entry of entries ?? []) {
    const bySlot = new Map();
    for (const item of entry.items ?? []) {
      const slot = item.slot;
      if (!slot) continue;
      const ranked = rankedBySlot.get(slot) ?? [];
      const position = ranked.findIndex((id) => String(id) === String(item.id));
      if (position < 0) continue;               // not one of this spec's ranked candidates
      if (!bySlot.has(slot)) bySlot.set(slot, []);
      bySlot.get(slot).push({ ...item, position });
    }

    /* G19: coverage counts SLOTS, depth counts the extra options within them. Three Back
       items is one slot covered and two depth — you can only wear one. */
    const coveredSlots = [...bySlot.keys()].sort();
    const coverage = coveredSlots.length;
    const depth = [...bySlot.values()].reduce((sum, items) => sum + items.length - 1, 0);
    const bestPosition = Math.min(...[...bySlot.values()]
      .flatMap((items) => items.map((item) => item.position)), Infinity);

    /* G21: the delta is measured at each source's HIGHEST attainable, and the basis label
       travels with the number so it can never read as a promise about the difficulty this
       reader runs. Without worn gear the delta is null — not zero, which would sort as if
       measured (G2: the page says so rather than guessing). */
    let delta = null, deltaBySlot = null, basis = null;
    if (worn) {
      deltaBySlot = {};
      delta = 0;
      for (const [slot, items] of bySlot) {
        const best = items.reduce((a, b) =>
          ((b.attainableIlvl ?? 0) > (a.attainableIlvl ?? 0) ? b : a));
        /* A slot the caller did not state is UNMEASURABLE, not empty. Reading it as item
           level 0 reported the candidate's whole item level as gain — a slot the paste
           simply did not mention would then dominate the plan. The caller decides what an
           unmentioned slot means (the client fills ranked slots with the same stated
           fallback the Upgrade checker uses); here it is skipped. */
        if (worn[slot] == null) continue;
        const gain = (best.attainableIlvl ?? 0) - Number(worn[slot]);
        if (gain > 0) { deltaBySlot[slot] = gain; delta += gain; }
        if (best.basisLabel && !basis) basis = best.basisLabel;
      }
    } else {
      const anyBasis = [...bySlot.values()].flat().find((item) => item.basisLabel);
      basis = anyBasis?.basisLabel ?? null;
    }

    plans.push({ source: entry.source, coverage, depth, coveredSlots, delta, deltaBySlot,
      basis, bestPosition: Number.isFinite(bestPosition) ? bestPosition : null });
  }
  return plans;
}

/* G18: the caller names the key; this only orders. `by` is "coverage" or "delta", and asking
   for a delta sort when no gear is pasted falls back to coverage rather than ordering by null. */
export function sortPlans(plans, by = "coverage") {
  const useDelta = by === "delta" && (plans ?? []).some((plan) => plan.delta != null);
  return (plans ?? []).slice().sort((a, b) => {
    if (useDelta) {
      const delta = (b.delta ?? -1) - (a.delta ?? -1);
      if (delta) return delta;
    }
    const coverage = b.coverage - a.coverage;
    if (coverage) return coverage;
    const depth = b.depth - a.depth;
    if (depth) return depth;
    // A source holding a higher-ranked item beats one holding more low-ranked ones.
    const best = (a.bestPosition ?? 99) - (b.bestPosition ?? 99);
    if (best) return best;
    return String(a.source?.name ?? "").localeCompare(String(b.source?.name ?? ""));
  });
}

export const planSortedBy = (by, plans) =>
  (by === "delta" && (plans ?? []).some((plan) => plan.delta != null)) ? "delta" : "coverage";
