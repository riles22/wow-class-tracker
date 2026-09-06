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
  let failure;
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
      failure = `HTTP ${r.status}`;
    } catch (error) { failure = error.message; }
    if (attempt < tries) await new Promise((resolve) => setTimeout(resolve, attempt * 800));
  }
  throw new Error(`fetch failed for ${url}: ${failure || "no attempts"}`);
}

/** curl transport for hosts whose TLS fingerprinting 403s Node's fetch but passes curl —
 *  Wowhead does exactly this (measured 2026-08-18: Node fetch 403 in 123ms, plain curl 200).
 *  Same retry/spacing contract as fetchText. */
export async function fetchTextCurl(url, { tries = 3, delayMs = 1500, timeoutMs = 30 } = {}) {
  const { execFile } = await import("node:child_process");
  const run = () => new Promise((resolve) => {
    execFile("curl", ["-sS", "--max-time", String(timeoutMs), "-L", "--write-out", "\n%{http_code}", url],
      { maxBuffer: 32 * 1024 * 1024, windowsHide: true },
      (error, stdout) => {
        const match = stdout?.match(/\n(\d{3})$/);
        resolve({ error, status: match ? Number(match[1]) : null,
          text: match ? stdout.slice(0, match.index) : null });
      });
  });
  let failure;
  for (let attempt = 1; attempt <= tries; attempt++) {
    const { error, status, text } = await run();
    if (!error && status === 404) return null;
    if (!error && status >= 200 && status < 300 && text && text.length > 1000) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return text;
    }
    failure = error?.message || `HTTP ${status ?? "unknown"}${status === 200 ? ": response too short" : ""}`;
    if (attempt < tries) await new Promise((resolve) => setTimeout(resolve, attempt * 800));
  }
  throw new Error(`curl fetch failed for ${url}: ${failure || "no attempts"}`);
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
  /* Global enhancement name authority: every (id -> display-name) vote across every
     source and spec. A single source's text/href mismatch (Method's "Farstrider's
     Swiftness" anchor on the Hunt id, 2026-08-18 review) then loses to the other
     thirteen specs' spelling even in a cell where it is the only mention. */
  const enhGlobalNames = new Map();
  const enhVote = (cand) => {
    const key = cand.id != null ? `i${cand.id}` : `s${cand.spellId}`;
    const clean = String(cand.name).replace(/^formula:\s*/i, "").replace(/^enchant [a-z' -]+ - /i, "").trim();
    if (!clean) return;
    const votes = enhGlobalNames.get(key) || new Map();
    votes.set(clean, (votes.get(clean) || 0) + 1);
    enhGlobalNames.set(key, votes);
  };
  for (const g of Object.values(guides)) {
    for (const rec of Object.values(g.specs || {})) {
      const enh = rec.enhancements;
      if (!enh) continue;
      for (const e of enh.enchants ?? []) for (const c of e.candidates ?? []) enhVote(c);
      for (const lane of ["unique", "filler"]) for (const c of enh.gems?.[lane] ?? []) enhVote(c);
      for (const [cat, list] of Object.entries(enh.consumables ?? {}))
        if (cat !== "note") for (const c of list ?? []) enhVote(c);
    }
  }
  const enhGlobalName = (cand) => {
    const votes = enhGlobalNames.get(cand.id != null ? `i${cand.id}` : `s${cand.spellId}`);
    if (!votes) return null;
    return [...votes.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
  };
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
    /* Enhancements consensus (Riley, 2026-08-18): same distinct-sources counting the
       gear candidates get, applied to enchants (per slot), gems (unique/filler) and
       consumables (per category). mentions[src] records the candidate's POSITION in
       that source's published order (0 = its primary rec) so ties on count break on
       best published position, never on an invented score. Per-source prose notes are
       carried verbatim, keyed by section — conditionality stays prose (G7 reasoning). */
    const enhCell = () => ({});
    /* JOIN KEY IS THE NORMALIZED NAME, not the id (adversarial review 2026-08-18):
       the three guides cite different quality-rank ids — and sometimes the Formula:
       recipe id — for the SAME enchant, which fragmented one true 3/3 into 2/3 + 1/3
       rows in ~119 cells (Thalassian Phoenix Oil, Eyes of the Eagle three ways). The
       "Formula: " and "Enchant <Slot> - " prefixes are stripped for keying AND for
       display; item-vs-spell citations of one recommendation join the same way. */
    const enhKey = (name) => nameKey(String(name)
      .replace(/^formula:\s*/i, "").replace(/^enchant [a-z' -]+ - /i, ""));
    const enhDisplay = (name) => String(name)
      .replace(/^formula:\s*/i, "").replace(/^enchant [a-z' -]+ - /i, "").trim();
    const enhAdd = (cell, cand, srcId, pos) => {
      if (!cand?.name || cand.name.length < 4) return; // fragment guard (belt+braces)
      const k = enhKey(cand.name);
      if (!k) return;
      const entry = (cell[k] = cell[k] || {
        ...(cand.id != null ? { id: String(cand.id) } : { spellId: String(cand.spellId) }),
        name: enhDisplay(cand.name), mentions: {}, nameVotes: {},
      });
      const voteName = enhGlobalName(cand) ?? enhDisplay(cand.name);
      entry.nameVotes[voteName] = (entry.nameVotes[voteName] || 0) + 1;
      if (!(srcId in entry.mentions) || pos < entry.mentions[srcId]) entry.mentions[srcId] = pos;
    };
    const enhRank = (cell) => Object.values(cell).map((e) => {
      // display name = the most-voted spelling across sources (fixes a lone source's
      // text/href mismatch, e.g. Method's "Farstrider's Swiftness" for the Hunt id)
      const { nameVotes, ...rest } = e;
      const name = Object.entries(nameVotes).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
      return { ...rest, name, consensus: Object.keys(e.mentions).length,
        bestPos: Math.min(...Object.values(e.mentions)) };
    }).sort((a, b) => b.consensus - a.consensus || a.bestPos - b.bestPos
      || a.name.localeCompare(b.name));
    const enchantCells = {}; const gemCells = { unique: enhCell(), filler: enhCell() };
    const consumableCells = {}; const enhNotes = {};
    let enhSources = 0;
    for (const [srcId, g] of Object.entries(guides)) {
      const enh = g.specs[key]?.enhancements;
      if (!enh) continue;
      enhSources += 1;
      const note = (section, text) => {
        if (text) (enhNotes[section] = enhNotes[section] || []).push({ source: srcId, note: text });
      };
      for (const e of enh.enchants ?? []) {
        const cell = (enchantCells[e.slot] = enchantCells[e.slot] || enhCell());
        (e.candidates ?? []).forEach((cand, pos) => enhAdd(cell, cand, srcId, pos));
        note(`enchant:${e.slot}`, e.note);
      }
      if (enh.gems) {
        (enh.gems.unique ?? []).forEach((cand, pos) => enhAdd(gemCells.unique, cand, srcId, pos));
        (enh.gems.filler ?? []).forEach((cand, pos) => enhAdd(gemCells.filler, cand, srcId, pos));
        note("gems", enh.gems.note);
      }
      if (enh.consumables) {
        for (const [cat, list] of Object.entries(enh.consumables)) {
          if (cat === "note") { note("consumables", enh.consumables.note); continue; }
          const cell = (consumableCells[cat] = consumableCells[cat] || enhCell());
          (list ?? []).forEach((cand, pos) => enhAdd(cell, cand, srcId, pos));
        }
      }
    }
    const enhancements = enhSources === 0 ? null : {
      sources: enhSources,
      enchants: Object.entries(enchantCells).map(([slot, cell]) => ({ slot, candidates: enhRank(cell) })),
      // unique wins over filler: a unique-equipped meta gem must never also render as
      // "socket in every remaining socket" (adversarial review 2026-08-18)
      gems: (() => {
        const unique = enhRank(gemCells.unique);
        const uniqueKeys = new Set(unique.map((g) => enhKey(g.name)));
        return { unique, filler: enhRank(gemCells.filler).filter((g) => !uniqueKeys.has(enhKey(g.name))) };
      })(),
      consumables: Object.fromEntries(Object.entries(consumableCells).map(([cat, cell]) => [cat, enhRank(cell)])),
      notes: enhNotes,
    };
    payload.specs[key] = { builds, candidates, trinketTiers,
      ...(enhancements ? { enhancements } : {}) };
  }
  const buildCounts = Object.values(payload.specs).map((x) => x.builds.length);
  if (buildCounts.length && Math.min(...buildCounts) < 1)
    throw new Error("a spec has zero guide builds — harvest incomplete");
  return payload;
}

/* ---- Enhancements lane (Riley, 2026-08-18): shared contract ----------------------
   Each guide harvester may attach an `enhancements` block to its per-spec record:
     { enchants: [{ slot, candidates: [cand...], note? }],
       gems: { unique: [cand...], filler: [cand...], note? },
       consumables: { <key from ENHANCEMENT_CONSUMABLE_KEYS>: [cand...], note? } }
   where cand = { id: "<numeric item id>", name } OR { spellId: "<numeric>", name }
   (weapon imbues are spells on some sources). Candidates keep the SOURCE's published
   order — first is that source's primary recommendation. A category a source does not
   publish is simply ABSENT (Holy Paladin genuinely has no augment rune) — never
   invented, never an error. Weapon oils/imbues normalize into consumables.weaponBuff
   whatever section the source printed them in, so cross-source consensus can join.
   Prose conditionality (hero-talent exceptions, bracket alternatives) stays in the
   free-text note fields — the axes are ragged across sources, the same reason G7
   refused a scope grid for builds. */
export const ENHANCEMENT_CONSUMABLE_KEYS = [
  "flask", "combatPotion", "manaPotion", "healthPotion", "food", "augmentRune",
  "weaponBuff", "tea",
];

const validCand = (c) => c && typeof c.name === "string" && c.name.length > 0
  && ((/^\d+$/.test(String(c.id ?? "")) ? 1 : 0) + (/^\d+$/.test(String(c.spellId ?? "")) ? 1 : 0) === 1);

export function validateEnhancements(enh, label) {
  const fail = (msg) => { throw new Error(`${label}: enhancements ${msg}`); };
  if (enh == null) return;
  if (typeof enh !== "object") fail("must be an object");
  for (const key of Object.keys(enh))
    if (!["enchants", "gems", "consumables"].includes(key)) fail(`unknown key ${key}`);
  for (const e of enh.enchants ?? []) {
    if (!CANONICAL_SLOTS.has(e.slot) && !["Main Hand", "Off Hand"].includes(e.slot))
      fail(`enchant slot "${e.slot}" is not canonical`);
    if (!Array.isArray(e.candidates) || !e.candidates.length || !e.candidates.every(validCand))
      fail(`enchant candidates malformed for slot ${e.slot}`);
    if (e.note != null && typeof e.note !== "string") fail(`enchant note for ${e.slot} not a string`);
  }
  if (enh.gems != null) {
    for (const lane of ["unique", "filler"]) {
      const list = enh.gems[lane];
      if (list != null && (!Array.isArray(list) || !list.every(validCand))) fail(`gems.${lane} malformed`);
    }
    for (const key of Object.keys(enh.gems))
      if (!["unique", "filler", "note"].includes(key)) fail(`gems has unknown key ${key}`);
  }
  if (enh.consumables != null) {
    for (const key of Object.keys(enh.consumables)) {
      if (key === "note") continue;
      if (!ENHANCEMENT_CONSUMABLE_KEYS.includes(key)) fail(`consumables has unknown key ${key}`);
      const list = enh.consumables[key];
      if (!Array.isArray(list) || !list.length || !list.every(validCand)) fail(`consumables.${key} malformed`);
    }
  }
}
