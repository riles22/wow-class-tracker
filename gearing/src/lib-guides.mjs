// Shared parsing + normalization for the Phase B guide harvesters
// (docs/gearing-s2-scope.md — DECISIONS G1/G4/G7).
//
// Three rules from the scope doc are load-bearing here:
//   1. Boss/dungeon names normalize to OUR canonical harvested roster, and an
//      unmatchable boss-shaped name is a HARD ERROR, never a dropped row.
//   2. Method uses typographic apostrophes (Nek’zali, Kings’ Rest) where Wowhead
//      uses straight ones — every name join goes through normApostrophes().
//   3. Soft caps ("Haste to 18%") are captured as data even though v1 only displays
//      them; the raw label is always kept verbatim beside anything parsed from it.

/** Decode the HTML entities the three sources actually emit (Method uses &rsquo; for its
 *  typographic apostrophes — there is NO raw U+2019 on its pages, recon 2026-08-18). */
export const decodeEntities = (s) => String(s ?? "")
  .replace(/&rsquo;|&#8217;|&lsquo;|&#8216;/gi, "'")
  .replace(/&rdquo;|&#8221;|&ldquo;|&#8220;/gi, '"')
  .replace(/&ndash;|&#8211;|&mdash;|&#8212;/gi, "—")
  .replace(/&nbsp;|&#160;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&quot;/gi, '"');

/** Straighten typographic apostrophes/quotes and collapse whitespace (entities first). */
export const normApostrophes = (s) => decodeEntities(s)
  .replace(/[‘’ʼ´`]/g, "'")
  .replace(/[“”]/g, '"')
  .replace(/\s+/g, " ")
  .trim();

/** Case/apostrophe/whitespace-insensitive key for name joins. Apostrophes are DELETED,
 *  not spaced, so possessive-placement variants join ("King's Rest" — Icy Veins — and
 *  the canonical "Kings' Rest" both key to "kings rest"; found live 2026-08-18). */
export const nameKey = (s) => normApostrophes(s).toLowerCase()
  .replace(/'/g, "").replace(/[^a-z0-9]+/g, " ").trim()
  .replace(/^the\s+/, ""); // leading-article variance: "Blinding Vale" (IV) vs "The Blinding Vale"

/** Canonical slot vocabulary (matches the item harvests). */
export const CANONICAL_SLOTS = new Set(["Head", "Neck", "Shoulder", "Back", "Chest", "Wrist",
  "Hands", "Waist", "Legs", "Feet", "Finger", "Trinket",
  "Main Hand", "Off Hand", "One-Hand", "Two-Hand", "Ranged", "Held In Off-hand"]);
const SLOT_ALIASES = new Map(Object.entries({
  "shoulders": "Shoulder", "shoulder": "Shoulder", "cloak": "Back", "back": "Back",
  "wrists": "Wrist", "wrist": "Wrist", "bracers": "Wrist", "gloves": "Hands", "hands": "Hands",
  "belt": "Waist", "waist": "Waist", "boots": "Feet", "feet": "Feet",
  "ring": "Finger", "rings": "Finger", "ring 1": "Finger", "ring 2": "Finger",
  "finger": "Finger", "finger 1": "Finger", "finger 2": "Finger",
  "trinket": "Trinket", "trinkets": "Trinket", "trinket 1": "Trinket", "trinket 2": "Trinket",
  "head": "Head", "helm": "Head", "neck": "Neck", "amulet": "Neck", "chest": "Chest",
  "legs": "Legs", "pants": "Legs",
  "main hand": "Main Hand", "main-hand": "Main Hand", "mainhand": "Main Hand",
  "off hand": "Off Hand", "off-hand": "Off Hand", "offhand": "Off Hand",
  "weapon": "Main Hand", "two hand": "Two-Hand", "two-hand": "Two-Hand",
  "one hand": "One-Hand", "one-hand": "One-Hand", "ranged": "Ranged",
}));
export function canonicalSlot(label) {
  const key = nameKey(label).replace(/\s+\d+$/, (m) => m); // keep "ring 1" distinct for alias table
  const direct = SLOT_ALIASES.get(nameKey(label));
  if (direct) return direct;
  const stripped = SLOT_ALIASES.get(nameKey(label).replace(/\s*\d+$/, "").trim());
  if (stripped) return stripped;
  // exact canonical form already?
  for (const slot of CANONICAL_SLOTS) if (nameKey(slot) === key) return slot;
  return null;
}

/** Build the canonical join tables from OUR harvested raid/dungeon data. */
export function canonicalRosters(raid, dungeons) {
  const bosses = new Map();   // nameKey -> canonical boss name
  const itemIndex = new Map(); // itemId -> { sourceKind, boss, dungeon, droppedBy }
  const raidSubBosses = new Map(); // nameKey(droppedBy alias) -> canonical boss name
  for (const b of raid.bosses) {
    bosses.set(nameKey(b.name), b.name);
    for (const item of b.items) {
      itemIndex.set(String(item.id),
        { sourceKind: "raid", boss: b.name, dungeon: null, droppedBy: item.droppedBy ?? null });
      // The rewards guide attributes drops by SUB-BOSS names inside multi-part encounters
      // ("Vexhul"/"Ithraz" are The Twin Fangs; "Nymrissa Wavecaller" belongs to boss 1;
      // "Mor'zahi" to The Lost Explorers) — the harvest records them in droppedBy, and
      // guide sources cite them, so they must join to their encounter.
      if (item.droppedBy && nameKey(item.droppedBy) !== nameKey(b.name))
        raidSubBosses.set(nameKey(item.droppedBy), b.name);
    }
  }
  const dungeonNames = new Map();
  const dungeonBosses = new Map(); // nameKey(droppedBy) -> { dungeon, droppedBy }
  for (const d of dungeons.dungeons) {
    dungeonNames.set(nameKey(d.name), d.name);
    for (const item of d.items) {
      itemIndex.set(String(item.id),
        { sourceKind: "dungeon", boss: null, dungeon: d.name, droppedBy: item.droppedBy ?? null });
      if (item.droppedBy)
        dungeonBosses.set(nameKey(item.droppedBy), { dungeon: d.name, droppedBy: item.droppedBy });
    }
  }
  // Unique-token index: every >=5-char word that appears in exactly ONE boss or dungeon
  // name identifies that target. Derived entirely from OUR roster — no invented aliases —
  // and it is what absorbs source typos ("Entomed Sentinels", "Vashnik the Maligant") and
  // decorated fragments ("Tier - Vashnik", "Vashnik (Token)"): the distinctive token
  // survives the mangling. Ambiguous tokens ("altar", "fangs" — each in two names)
  // self-exclude via the uniqueness requirement.
  const tokenCounts = new Map();
  const tokenTarget = new Map();
  const addTokens = (name, target) => {
    for (const tok of nameKey(name).split(" ").filter((t) => t.length >= 5)) {
      tokenCounts.set(tok, (tokenCounts.get(tok) || 0) + 1);
      tokenTarget.set(tok, target);
    }
  };
  for (const b of raid.bosses) addTokens(b.name, { sourceKind: "raid", boss: b.name, dungeon: null, droppedBy: null });
  for (const d of dungeons.dungeons) addTokens(d.name, { sourceKind: "dungeon", boss: null, dungeon: d.name, droppedBy: null });
  const uniqueTokens = new Map([...tokenTarget].filter(([tok]) => tokenCounts.get(tok) === 1));
  const raidName = raid.instance ? nameKey(raid.instance) : null; // "The Venomous Abyss"
  return { bosses, dungeonNames, dungeonBosses, raidSubBosses, itemIndex, uniqueTokens, raidName };
}

/**
 * Resolve a published drop source, preferring the TEXT join but falling back to an
 * ITEM-ID join against our own harvested catalog — a second evidence channel, not a
 * guess. This is what absorbs a source's typo ("Temple of Sethrallis", Method
 * 2026-08-18) or a boss name our droppedBy coverage lacks ("Mor'zahi"): the row keeps
 * its verbatim sourceText, gains the catalog's attribution, and is flagged
 * sourceTextUnmatched so the mismatch stays visible. Only when BOTH channels fail does
 * the hard error propagate — the scope's never-drop rule holds throughout.
 */
export function resolveDropSource(text, itemId, rosters) {
  try {
    const byText = normalizeDropSource(text, rosters);
    // An empty/entity-only source cell ("[npc=268956]" with no anchor text — Wowhead's
    // Disc Priest author) classifies "unknown" without throwing; give the catalog join
    // the same chance it gets on a throw before accepting that.
    if (byText.sourceKind === "unknown" && itemId != null) {
      const hit = rosters.itemIndex.get(String(itemId));
      if (hit) return { ...hit, sourceTextUnmatched: true };
    }
    return byText;
  } catch (error) {
    const hit = itemId != null ? rosters.itemIndex.get(String(itemId)) : null;
    if (hit) return { ...hit, sourceTextUnmatched: true };
    // Third channel: the text matches nothing AND the item is genuinely outside our
    // harvested catalog ("Midnight Falls", "Crown of the Cosmos" — Method). Recording
    // the row as kind "unknown" with its verbatim text is NOT dropping it; the
    // data-invariants test caps how many such rows a source may carry, so recipe
    // drift still trips loudly instead of accumulating silently.
    if (itemId != null) return { sourceKind: "unknown", boss: null, dungeon: null,
      droppedBy: null, sourceTextUnmatched: true };
    throw error;
  }
}

/**
 * Classify a published source string and normalize any boss/dungeon reference in it.
 * Returns { sourceKind, boss, dungeon, droppedBy } — boss/dungeon are canonical names.
 * Throws on a boss-shaped name that matches nothing (the scope's hard-error rule).
 * Non-instance sources (crafted / catalyst / vendor / world / pvp) classify without a join.
 */
export function normalizeDropSource(text, rosters) {
  const raw = normApostrophes(text);
  const key = nameKey(raw);
  if (!key) return { sourceKind: "unknown", boss: null, dungeon: null, droppedBy: null };
  // Suffix/slash decorations observed on Method ("Ula'tek (Catalyst)", "Nek'zali … /
  // Catalyst", "(Tier Token)") ride ON TOP of a boss reference — note the flag, strip
  // the decoration, and keep resolving the boss underneath.
  const viaCatalyst = /\(catalyst\)|\/\s*catalyst\b/i.test(raw);
  const viaTierToken = /\(tier token\)|tier token/i.test(raw);
  const stripped = raw.replace(/\((?:catalyst|tier token)\)/gi, "")
    .replace(/\/\s*catalyst\b/gi, "").trim();
  const strippedKey = nameKey(stripped);
  const decorate = (hit) => ({ ...hit, viaCatalyst: viaCatalyst || undefined,
    viaTierToken: viaTierToken || undefined });

  const NON_INSTANCE = [
    // Lair/world sources outside our per-item harvest. NYMRISSA settled at launch
    // (Phase E, 2026-08-18 evening): her three drops left Nek'zali's live guide table
    // with no raid destination, she has no live boss page, and Icy Veins files her
    // under world bosses — she is a WORLD boss whose loot briefly rode boss 1's PTR
    // table (WCL lists her under zone 53 because zones bundle associated content).
    // Vexhul and Mor'zahi remain true sub-bosses resolved via raidSubBosses.
    [/nymrissa|tidebound grotto|sporefall|rotmire/i, "world"],
    [/^tier set$|tier set\b/i, "tier-token"],
    [/craft|spark of tides|profession|tailoring|blacksmithing|leatherworking|jewelcrafting|engineering|inscription|misc/i, "crafted"],
    [/^catalyst$/i, "catalyst"],
    [/world boss|world drop|world quest/i, "world"],
    [/pvp|conquest|honor/i, "pvp"],
    [/vendor|bronze|currency|renown|reputation/i, "vendor"],
    [/delve/i, "delve"],
    [/great vault|vault/i, "vault"],
    [/boe|bind on equip|trash/i, "boe"],
  ];
  for (const [re, kind] of NON_INSTANCE) if (re.test(stripped))
    return decorate({ sourceKind: kind, boss: null, dungeon: null, droppedBy: null });

  // Try raid boss, then dungeon-by-name, then dungeon-boss (droppedBy) — substring both ways
  // so "Ula'tek — The Venomous Abyss" still resolves.
  for (const [k, name] of rosters.bosses)
    if (strippedKey === k || strippedKey.includes(k) || k.includes(strippedKey))
      return decorate({ sourceKind: "raid", boss: name, dungeon: null, droppedBy: null });
  for (const [k, bossName] of rosters.raidSubBosses ?? [])
    if (strippedKey === k || strippedKey.includes(k))
      return decorate({ sourceKind: "raid", boss: bossName, dungeon: null, droppedBy: raw });
  for (const [k, entry] of rosters.dungeonBosses)
    if (strippedKey === k || strippedKey.includes(k))
      return decorate({ sourceKind: "dungeon", boss: null, dungeon: entry.dungeon, droppedBy: entry.droppedBy });
  for (const [k, name] of rosters.dungeonNames)
    if (strippedKey === k || strippedKey.includes(k))
      return decorate({ sourceKind: "dungeon", boss: null, dungeon: name, droppedBy: null });
  // The raid named as a whole ("The Venomous Abyss" — Method) is a raid attribution
  // without a boss; our own raid-items.json `instance` field supplies the name.
  if (rosters.raidName && (strippedKey === rosters.raidName
      || strippedKey.includes(rosters.raidName) || rosters.raidName.includes(strippedKey)))
    return decorate({ sourceKind: "raid", boss: null, dungeon: null, droppedBy: null });
  // Unique-token pass — absorbs typos and decorations (see canonicalRosters).
  for (const tok of strippedKey.split(" "))
    if (rosters.uniqueTokens?.has(tok))
      return decorate({ ...rosters.uniqueTokens.get(tok), sourceTextFuzzy: true });

  throw new Error(`unmatchable drop source "${raw}" — the scope forbids dropping the row; ` +
    "either the guide names something outside our harvested roster (extend the recipe " +
    "deliberately) or the parse grabbed the wrong text");
}

/** Normalize a published stat-priority run into the canonical vocabulary.
 *  Sources vary: "Critical Strike" / "Crit" (Method) / "Crit. Strike"; "Versatility" /
 *  "Versa" (Method); "Mastery"; and Icy Veins lists may LEAD with "Item Level" — that is
 *  captured as a flag, never mixed into the secondaries (different quantity, G2's rule). */
export function normalizeStatRun(entries) {
  const SEC = { "critical strike": "Crit", "crit strike": "Crit", "crit. strike": "Crit",
    crit: "Crit", haste: "Haste", mastery: "Mast", mast: "Mast",
    versatility: "Vers", versa: "Vers", vers: "Vers" };
  const PRIMARY = new Set(["intellect", "agility", "strength"]);
  let primary = null, leadsWithItemLevel = false;
  const secondaries = [];
  // An entry may itself be a tie or a run ("Haste = Crit" in one Wowhead [li];
  // "Intellect > Mastery = Critical Strike > Haste" in one Method paragraph) —
  // tokenize on the separators first, keeping written order. Ties flatten in order
  // of appearance; the caller keeps `raw` verbatim so nothing is lost.
  // Separators include "/" and repeated ">" ("Crit > Haste/ Mastery >>> Versatility",
  // Method Demonology), and a leading inline label is stripped from each token
  // ("Farseer : Mastery" — Method Elemental writes the scope INSIDE the run) so the
  // first stat is never swallowed by the label (adversarial review, 2026-08-18).
  const tokens = entries.flatMap((raw) => normApostrophes(raw).split(/\s*(?:>=|>+|=|\/|(?:&gt;)+)\s*/))
    // Strip a leading inline label ("Farseer : Mastery") or prose run ending in "is"
    // ("Current stat priority for Single Target is Crit") so the first stat is never
    // swallowed — both shapes measured on Method 2026-08-18.
    .map((tok) => tok.replace(/^[A-Za-z' -]{2,40}:\s*/, "").replace(/^.{0,60}\bis\s+/i, ""));
  for (const rawToken of tokens) {
    const t = rawToken.replace(/[.:]+$/, "").trim();
    const k = t.toLowerCase();
    if (!t) continue;
    if (/^item level$/i.test(t)) { if (!secondaries.length) leadsWithItemLevel = true; continue; }
    if (PRIMARY.has(k)) { primary = primary ?? (t[0].toUpperCase() + t.slice(1).toLowerCase()); continue; }
    if (/^(stamina|armor|leech|speed|avoidance|weapon damage|weapon dps)$/i.test(t)) continue;
    const sec = SEC[k];
    if (sec && !secondaries.includes(sec)) secondaries.push(sec);
  }
  return { primary, secondaries, leadsWithItemLevel };
}

/** Capture soft caps like "Haste to 18%" / "Crit until 40%" from a priority label. */
export function parseSoftCaps(text) {
  const caps = [];
  const re = /\b(Critical Strike|Crit(?:\.\s*Strike)?|Haste|Mastery|Versatility)\s+(?:to|until|up to|cap(?:ped)?\s+at)\s+(\d+(?:\.\d+)?)\s*%/gi;
  const NORM = { "critical strike": "Crit", "crit": "Crit", "crit. strike": "Crit",
    haste: "Haste", mastery: "Mast", versatility: "Vers" };
  let m;
  while ((m = re.exec(normApostrophes(text))) !== null)
    caps.push({ stat: NORM[m[1].toLowerCase()] ?? m[1], value: Number(m[2]), raw: m[0] });
  return caps;
}

/** Shared fetch with retries, a hard timeout, + polite spacing (residential transports). */
export async function fetchText(url, { tries = 3, headers = {}, delayMs = 1500, timeoutMs = 30000 } = {}) {
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(timeoutMs),
        headers: { "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      ...headers } });
      if (r.ok) {
        const text = await r.text();
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return text;
      }
      if (r.status === 404) return null; // a verified absence, not a transport failure
    } catch { /* retry below */ }
    if (attempt < tries) await new Promise((resolve) => setTimeout(resolve, attempt * 800));
  }
  return null;
}

/** curl transport for hosts whose TLS fingerprinting 403s Node's fetch but passes curl —
 *  Wowhead does exactly this (measured 2026-08-18: Node fetch 403 in 123ms, plain curl 200).
 *  Same retry/spacing contract as fetchText. */
export async function fetchTextCurl(url, { tries = 3, delayMs = 1500, timeoutMs = 30 } = {}) {
  const { execFile } = await import("node:child_process");
  const run = () => new Promise((resolve) => {
    execFile("curl", ["-s", "--max-time", String(timeoutMs), "-L", url],
      { maxBuffer: 32 * 1024 * 1024, windowsHide: true },
      (error, stdout) => resolve(error ? null : stdout));
  });
  for (let attempt = 1; attempt <= tries; attempt++) {
    const text = await run();
    if (text && text.length > 1000) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return text;
    }
    if (attempt < tries) await new Promise((resolve) => setTimeout(resolve, attempt * 800));
  }
  return null;
}

/**
 * Build the client's consensus payload from the three harvest files (Phase C, G1/G7/G8).
 * Extracted from build.mjs so tests can feed it broken inputs and pin the loud failures.
 *
 * - builds: the UNION of published combinations, source-labeled (G7). When one source
 *   publishes TWO different orders under one label (Wowhead's "Shado-Pan" twice, raid vs
 *   M+ tab), the ids are uniquified and the labels disambiguated as "(list N)" — never
 *   silently shadowed, never given an invented scope name.
 * - candidates: bucketed by the CATALOG's slot when we know the item (the guides misfile
 *   a handful — Icy Veins puts a Neck under Finger — and the catalog is our canonical
 *   vocabulary); the guide's slot only buckets items outside our catalog.
 * - consensus = distinct sources naming the item for the slot (G1).
 */
export function buildGuidePayload(guides, specs, { itemSlots = new Map(), sourceNames = {} } = {}) {
  const payload = {
    sources: Object.fromEntries(Object.entries(guides).map(([id, g]) =>
      [id, { name: sourceNames[id] || id, harvestedAt: g.harvestedAt }])),
    specs: {},
  };
  for (const s of specs) {
    const key = `${s.spec} ${s.class}`;
    const builds = [];
    const labelCounts = new Map();
    const bySlot = {};
    const trinketTiers = {};
    for (const [srcId, g] of Object.entries(guides)) {
      const rec = g.specs[key];
      if (!rec) continue;
      for (const p of rec.priorities) {
        if (!Array.isArray(p.secondaries) || p.secondaries.length < 2)
          throw new Error(`${srcId}/${key}: malformed priority "${p.label}"`);
        const lk = `${srcId}:${p.label}`;
        labelCounts.set(lk, (labelCounts.get(lk) || 0) + 1);
        builds.push({ id: lk, source: srcId, label: p.label,
          primary: p.primary ?? null, secondaries: p.secondaries,
          leadsWithItemLevel: !!p.leadsWithItemLevel, published: rec.published ?? null });
      }
      for (const r of rec.bis) {
        const inCatalog = itemSlots.has(String(r.itemId));
        const slot = itemSlots.get(String(r.itemId)) || r.slot;
        const cell = (bySlot[slot] = bySlot[slot] || {});
        const entry = (cell[r.itemId] = cell[r.itemId] || { itemId: r.itemId, mentions: {} });
        (entry.mentions[srcId] = entry.mentions[srcId] || []).push(r.list);
        // Out-of-catalog picks have no harvested item row to supply a display name or
        // source kind, so the guide row's own values ride along — the client renders
        // them as "guide picks without drop data" (Riley, 2026-08-18). ONLY the two
        // kinds we can present honestly ride: crafted and world. Everything else
        // out-of-catalog is either the capped-verbatim `unknown` lane (adversarial
        // review 2026-08-18: Method's 63 sourceTextUnmatched rows carry WotLK-era item
        // ids — surfacing them as launch picks would be a false claim) or a stale-id /
        // non-pool raid-dungeon claim we cannot verify; those stay data-only, never
        // rendered. In-catalog entries stay lean; the catalog is their authority.
        if (!inCatalog && !r.sourceTextUnmatched
          && (r.sourceKind === "crafted" || r.sourceKind === "world")) {
          if (!entry.name && r.itemName) entry.name = r.itemName;
          if (!entry.kind && r.sourceKind) entry.kind = r.sourceKind;
        }
      }
      if (rec.trinketTiers?.length)
        trinketTiers[srcId] = rec.trinketTiers.map((t) => ({ tier: t.tier, itemIds: t.itemIds }));
    }
    // Second pass: disambiguate colliding (source,label) build ids.
    const seen = new Map();
    for (const b of builds) {
      if ((labelCounts.get(b.id) || 0) > 1) {
        const n = (seen.get(b.id) || 0) + 1;
        seen.set(b.id, n);
        b.label = `${b.label} (list ${n})`;
        b.id = `${b.id}#${n}`;
      }
    }
    const candidates = Object.fromEntries(Object.entries(bySlot).map(([slot, cell]) => [slot,
      Object.values(cell).map((e) => ({ itemId: e.itemId,
        consensus: Object.keys(e.mentions).length,
        mentions: Object.fromEntries(Object.entries(e.mentions).map(([k, v]) => [k, [...new Set(v)]])),
        // present only on out-of-catalog picks (crafted/world) — see the bis loop above
        ...(e.name ? { name: e.name } : {}), ...(e.kind ? { kind: e.kind } : {}) }))
        .sort((a, b) => b.consensus - a.consensus)]));
    payload.specs[key] = { builds, candidates, trinketTiers };
  }
  const buildCounts = Object.values(payload.specs).map((x) => x.builds.length);
  if (buildCounts.length && Math.min(...buildCounts) < 1)
    throw new Error("a spec has zero guide builds — harvest incomplete");
  return payload;
}
