# watch-creators run log

Keep the newest ~20 entries; prune older ones when appending — and MEAN it. Pruned
2026-08-15 (these four logs held 64-78 entries each, and none had ever been pruned): watch-creators had
reached 270KB, over the Read tool's 262,144-byte gate, so a bare Read of it returned NOTHING.

This file holds NO machine state. The seen-set moved to structured data on 2026-08-08
(pending-transcripts.json seen[]/skipped[]/videos[] plus take urls) precisely because
regexing ids out of this prose absorbed 231 ordinary English words into a 950-entry set;
parse counts are logged "for the record" behind no gate. It is narrative memory, and it is
prunable. Durable RULES belong in SKILL.md, not here — the 2026-08-15 prune had to promote
~31KB of parser traps out of the prune range first, because they existed nowhere else.

Entries are sorted NEWEST FIRST by date. Two forms are in use ("- <date>" and "## <date>"),
they interleave, and refresh-tiers was chronologically scrambled before this prune — so sort
by parsed DATE, never by position. Do not cite lines of this file by NUMBER from anywhere
else; grep for a phrase (docs/s2-flip-runbook.md used to do that and would have broken).

## 2026-08-31 (local, scheduled) — caption 429 on its FIFTH consecutive day; queue held at 5, nothing distilled

- **The anonymous residential caption lane is still 429.** One probe only, on the queue's head
  (`pdYpGLyZ7VM`, LBNinja7), with the skill's pinned recipe (`--extractor-args
  youtube:player_client=android --write-auto-subs --sub-langs en --sub-format json3
  --sleep-requests 1.5`, yt-dlp at the `requirements.txt` pin 2026.07.04). The info endpoint
  answered fine — webpage and android player API both fetched, subtitle track `en` detected and
  selected — and then the `timedtext` request failed `HTTP Error 429: Too Many Requests`. That
  is the IP-scoped abuse-flag shape, not throttling: the block sits on captions alone while
  metadata flows. **No retries, no client-shuffling, no backoff ladder, and no second video** —
  with the flag up, probing the other four would only spend goodwill on the one endpoint still
  answering.
- **Day five, and the relapse is now longer than the remission.** Clear 08-25 and 08-26; blocked
  08-27, 08-28, 08-29, 08-30 and 08-31. The 08-27 reading — that the 08-25 clearing was a
  remission rather than a fix — has five days behind it. **The residential yt-dlp caption lane
  should no longer be planned around**, and a scheduled run cannot fix it by trying harder.
- **The authenticated fallback still has no usable credential, and this run re-checked rather
  than assuming.** `~/Downloads/cookies.txt` is the SAME file the 08-30 run characterised:
  792 bytes, mtime Aug 24 21:24, and its first line is `# robots.txt file for YouTube`. It is a
  robots.txt, not a Netscape cookie export — no cookie records, no youtube.com domain. Only the
  file's size, mtime and first line were read, which is all that is needed to tell an export
  from a non-export; no browser cookie store was touched, and none should be. **If Riley wants
  this lane available to scheduled runs it needs a genuine Netscape-format export from a
  private window** — the 08-24 file will never work regardless of who reads it.
- **Queue deliberately UNCHANGED at 5** (`pdYpGLyZ7VM` LBNinja7, `z_dKoGx_FIk` Kalamazi,
  `bDElWkJxvtY` izen, `xYXkZA1L490` YoDaTV, `1qclgMKPdz4` Whispyr). **Nothing moved to
  `skipped[]`**: a skip is a DURABLE claim that the transcript was read and held nothing, and a
  transport 429 is not that — writing one would permanently retire a video nobody has read. All
  five carry keyword-shaped titles the nightly's own filtered discovery already queued, and they
  drain through Supadata on a different network path, proven unaffected by this flag.
- **No unfiltered breadth sweep, on purpose** (the 08-27 → 08-30 reasoning, unchanged): the
  local run's breadth privilege is that yt-dlp is free, and with captions 429ing a wider sweep
  yields no transcripts and therefore no takes. It would only spend the info endpoint's goodwill.
- **0 takes, 0 metaNotes, 0 videos distilled or skipped.** `creator-takes.json` and
  `pending-transcripts.json` are both byte-identical to HEAD.

## 2026-08-30 (local, scheduled) — the caption 429 is on its FOURTH consecutive day; queue held at 5, nothing distilled

- **One caption probe, one 429, stopped there** — the skill's rule, not a judgement call.
  `--list-subs` on the queued Whispyr video `1qclgMKPdz4` succeeded and returned the full
  auto-caption language table, so captions exist and the info endpoint is healthy; the single
  caption download that followed returned `ERROR: Unable to download video subtitles for 'en':
  HTTP Error 429: Too Many Requests`. That is the persistent IP-scoped abuse-flag shape on
  `timedtext`, not throttling. No retries, no client-shuffling, no backoff ladder.
- **Day four puts this PAST the skill's 24–72h decay window.** The relapse pattern is now
  clear 08-25, clear 08-26, blocked 08-27, 08-28, 08-29 and 08-30. The 08-27 reading — that
  the 08-25 clearing was a remission rather than a fix — has four days behind it. The
  residential yt-dlp caption lane cannot be treated as a reliable catch-up route, and a
  scheduled run cannot fix that by trying harder.
- **The authenticated fallback was again NOT usable, and the reason is now a FILE reason, not
  a harness one.** The `cookies.txt` in `~/Downloads` that the 08-28 run recorded as
  present-but-unreadable was read this run — and it is **not a cookie export at all**: 792
  bytes whose entire content is a `robots.txt` (`User-agent:` / `Disallow:` / `Sitemap:`
  lines, no cookie records, no youtube.com domain). So even with the permission question
  settled the owner-approved lane has no usable credential on disk. If Riley wants that lane
  available to scheduled runs, it needs a genuine Netscape-format export from a private
  window — the 08-24 file will never work no matter who can read it.
- **Queue deliberately UNCHANGED at 5** (`pdYpGLyZ7VM` LBNinja7, `z_dKoGx_FIk` Kalamazi,
  `bDElWkJxvtY` izen, `xYXkZA1L490` YoDaTV, `1qclgMKPdz4` Whispyr). Nothing moved to
  `skipped[]`: a skip is a DURABLE claim that the transcript was read and held nothing, and a
  transport 429 is not that. All five are keyword-shaped titles the nightly's own filtered
  discovery already queued, and they drain through Supadata on a different network path —
  proven unaffected by this flag by the 08-30 nightly, which fetched 2 of 3 while this lane
  was blocked.
- **No unfiltered breadth sweep, on purpose** (the 08-27/08-28/08-29 reasoning, unchanged):
  the local run's breadth privilege is that yt-dlp is free, and with captions 429ing a wider
  sweep yields no transcripts and therefore no takes — it would only spend the info endpoint's
  goodwill on the one service still answering.
- 0 takes, 0 metaNotes, 0 verified skips. `data/creator-takes.json` and
  `data/pending-transcripts.json` are both untouched.

## 2026-08-30 (nightly, CI runner) — 2 bracket-split Havoc takes; 1 verified-skipped; 4 queued

All **44** transcribable channels polled via the YouTube RSS endpoint, 0 failures, 15 entries
each = **660 videos**. `media:description` parsed alongside every title. No YouTube or
transcript-API request was made by this agent.

- **Seen-set recomputed as the four-lane union** (`seen` 549 + `skipped` 415 + `videos` 3 +
  every `youtu.be` id in a take or metaNote) = **1,216 ids**, leaving **238 unseen**, all inside
  the cycle bound **2026-06-18** (the OLDEST `ptr-builds` date, not `builds[0]`). 196 pass the
  nightly keyword filter.
- **Transcript step:** `transcript-fetch/summary.json` attemptedAt 2026-08-30T14:57:53Z, verdict
  **`ok`**, 3 requested / **2** fetched.
- **DISTILLED — Shadarek, `s508k-L7ims` "Havoc BUFFED AGAIN! | Sep 1st Class Tuning"**
  (170 chunks, ~6m12s, published 2026-08-28). A scripted, self-anchored read that splits by
  bracket, so **two takes**:
  · **Havoc / raid — buff.** The flat 4% aura buff on a spec he already called "pretty okay",
    plus a trinket correction he published the same day: **Font of Venomous Rage** was
    under-simming because SimC modelled the tooltip's four ticks when it actually ticks five —
    base tick 217,676 → 272,096, his average crit ~630k → 787k, roughly 25% missing. He now
    rates it his best on-use over Heart of Ula'tek (drops from Ula'tek, timers matching that
    fight's ~2:15 / 4:45 / 9:30 burns, cleaves; his own casts 2M and 4.7M, ~1.7M DPS in that
    window), amplifiable inside Inertia and potion windows. Conclusion: "incredibly good spot",
    "very well off in raid for the season".
  · **Havoc / M+ — buff.** Havoc "seems pretty good right now" and the extra 4% "will go a long
    way"; the buff roughly pays for dropping Glaive Tempest for Isolated Prey (≈4% overall lost
    against ≈10% single target gained), which he calls a newly available option.
  His **2026-08-22 whole-spec "both" take was superseded** by the pair — the Obli 08-23/08-28
  precedent for a bracket-split replacing a `both` read.
  **Devourer got NO take**: the only mention is that Havoc/Devourer stats now roll into
  Vengeance, a gear remark and not a read. The eleven other specs he names (Frost DK, Feral,
  Balance, Resto Druid, BM, Survival, Fire, Frost Mage, Mistweaver, Windwalker, Prot Paladin)
  are him reading the tuning notes aloud, outside his registered scope — including the Frost
  Mage "getting laid on Twin Fang on Mythic World First" line, which is a fight artifact twice
  over. `latest` advanced to state what was distilled.
- **VERIFIED-SKIPPED — Critcake, `UfjdyqXGbeM`** (255 chunks, ~26m): a commentated pug key run of
  the same shape as `if8kxRXBzSA`, skipped 08-28. His scripted intro is 4-set/gear housekeeping
  ("the spec still works even though I don't have ideal stats"); the rest is callouts, banter and
  chat answers. Three strength-adjacent lines tested and all failed — "I like the feel of Fury
  four piece … feels good" is feel not placement; "I felt like I would have done better as
  slayer" sits after a speaker-change marker; and the one genuinely comparative line, *"is arms
  and fury damage comparable. Yes,"* / *"keys."*, straddles a speaker boundary and cannot be
  attributed from the caption track. His 08-26 Fury M+ take stands as the current read. If he
  restates the Arms/Fury 4-set comparison in a scripted video, distil it then.
- **`pdYpGLyZ7VM`** (LBNinja7, "Healers Buffed AGAIN!! | 12.1 Tuning") came back `unavailable`
  from Supadata and **stays queued**.
- **QUEUED 4**, deliberately narrow against the **100-request MONTHLY** budget rather than the
  25-per-run cap: Kalamazi `z_dKoGx_FIk` (Warlock sims, all three specs), izen `bDElWkJxvtY`
  (general → metaNotes lane, Sept 1 tuning), YoDaTV `xYXkZA1L490` (M+ patch notes + tier-list
  update, tank-scoped — the coverage-poor role), Whispyr `1qclgMKPdz4` (Assassination, "Fatebound
  is BACK"). Shadarek's `DJCr5_KFzcM` "new BiS Gear Setup and Post-Buff Sims" was deliberately
  NOT queued — gear-shaped, same creator+spec distilled tonight.
- The remaining ~192 keyword-passing candidates are a **BUDGET cut** and were left **UNSEEN** so
  the next run reconsiders them. **Nothing was added to `seen[]` tonight.**

## 2026-08-29 (nightly, CI runner) — 4 takes from one pre-fetched transcript; 3 queued

All **44** transcribable channels polled via the YouTube RSS endpoint, 0 failures, 15 entries
each = **660 videos**. `media:description` parsed alongside every title, which settled three of
tonight's triage calls at zero transcript cost. No YouTube or transcript-API request was made by
this agent.

- **Transcript step:** `transcript-fetch/summary.json` attemptedAt 2026-08-29T15:17:21Z, verdict
  **`ok`**, 1 requested / 1 fetched — the single video the 08-28 run queued.
- **Obli, `n0H4JFE6Suc` "What did the buffs do for Frost DK?"** (205 caption chunks, 6m32s,
  published 2026-08-28T13:20Z) — his first raid week on BOTH Death Knights after the August 25
  pass, argued from his own logs on a 311-ilvl Frost main against a lower-geared Unholy alt, both
  on the 4-piece. It splits cleanly by bracket, which is why it is **four takes and not two**:
  · **Frost / raid — negative.** Falls away as fights lengthen ("just not it" on anything not
    killed fast); the two-target cleave he had expected to be its strength is the one place it
    merely does okay (Basilik the Malignant, the Lost Explorers) and Unholy does that better.
    Hard evidence is a within-player comparison, not a tier list — his worse-geared Unholy alt
    out-damaged his Frost main. Asks for a flat **10–15%**, sized off his own Hiz'garak log
    against an Arcane Mage at the same percentile, and wants the season's Obliterate change
    reverted plus a pass on Breath of Sindragosa's primary hit.
  · **Frost / M+ — positive.** "In Mythic+ we're actually doing pretty good", roughly level with
    Unholy, raised as the reason raid tuning must not overshoot into keys.
  · **Unholy / raid — positive.** Little opening burst but scales up as the encounter runs, with
    execute creeping higher, so San'layn is good for Mythic and can creep up to match meta
    classes; "Unholy can do everything Frost can do but better". NEW BUG he says has been live
    all tier: target damage amplifiers (he names Syzygy's Dig In, and Soul Reaper) do **not**
    apply to Blightfall's eruption damage, which is why the build currently only matches Rider.
  · **Unholy / M+ — positive.** "Very good", a teeny bit ahead of Frost.
  Both specs are inside his declared Frost/Unholy scope; Blood is untouched.
- **Superseded four prior Obli takes, each within the same lens** — Frost raid and Frost M+ from
  08-23, Unholy raid and Unholy M+ from 08-25. His `latest` line was rewritten to what was
  actually distilled, not to the newest upload.
- **Declined on the list-mention rule:** the Arcane Mage 176k figure and the Marksmanship Hunter
  comparison are the yardsticks of his own buff arithmetic, not reads on those specs.
- **Timing worth recording:** the video predates the September 1 tuning announcement by nine
  hours, and that pass gives Frost DK exactly the shape he asks for (Howling Blast +15%,
  Obliterate +15%, Frost Strike +20%, melee +10%). The take is his read on 08-28 and was NOT
  edited to anticipate it.
- **Queue:** `n0H4JFE6Suc` removed from `videos[]` (distilled, so its take url is its record and
  no weaker lane may hold it — the precedence ladder). Three appended:
  · Shadarek `s508k-L7ims` "Havoc BUFFED AGAIN! | Sep 1st Class Tuning" (Havoc/Devourer scope);
  · Critcake `UfjdyqXGbeM` "SLAYER FURY IS SO BACK" — queued on its DESCRIPTION ("Season 2 4-set
    acquired. Slayer Fury is back on the menu"), a placement claim, where his 08-28 pug-key video
    was correctly skipped as a commentated run;
  · LBNinja7 `pdYpGLyZ7VM` "Healers Buffed AGAIN!! | 12.1 Tuning" — description cites the Sept 1
    blue post, and this creator carries five healer specs across four classes.
- **Accounting:** seen-set union **1,213**; **228** unseen in-cycle videos of which **135** pass
  the nightly keyword filter. The **132 not queued stay UNSEEN**, not written to `seen[]` — a
  budget cut is exactly the dismissal class that must remain reconsiderable. Nightly keyword
  filtering kept, per Supadata's 100-request MONTHLY tier.
- **Two deliberate non-queues worth naming.** Both Supatease items ("12.1 MAJOR Class Changes BIG
  Update", "THE NEW META IS COMING") are from the creator SKILL.md names as the PvP-framing trap,
  and both titles are the exact shape it warns about. Dalaran Gaming's `seRL4jirX9E` "Talent
  Squish, New Modes, & Huge Patch Roadmap" is a LEAD about future plans; the forum and blue
  tracker carry no 12.2 PTR announcement tonight, so it is not corroborated and was not treated
  as a source. Shadarek's `DJCr5_KFzcM` (BiS gear setup + post-buff sims) was left unseen as
  gear-shaped and redundant with `s508k-L7ims` for the same buff window.

## 2026-08-29 (local, scheduled) — the caption 429 is on its THIRD consecutive day; queue held at 1, nothing distilled

- **Discovery ran in full and is the useful half of this run.** All **44** transcribable
  channels polled via the YouTube RSS endpoint, **0 feed failures**, 15 entries each.
  Unfiltered by title per the local-run rule, bounded by DATE at the cycle's opening build
  — derived as `Math.min(...builds.map(b => b.date))` = **2026-06-18**, not read off
  `builds[0]`, which is now the 2026-08-28 tuning pass and would have cut the sweep to a
  single day. Seen-set union recomputed rather than trusted: **1213** ids across the four
  lanes. **227 unseen in-cycle videos** stand after the bound.
- **The caption transport is still dead.** `--list-subs` on the queued Obli video
  `n0H4JFE6Suc` succeeded (full auto-caption language table, so captions exist and the info
  endpoint is healthy), and then **exactly one** caption download was spent, per the
  one-probe rule: `HTTP Error 429: Too Many Requests`. That is the persistent IP-scoped
  abuse-flag shape on `timedtext`, not throttling — third consecutive day, and the skill's
  24–72h decay window is now at its far end. Stopped the caption lane immediately; no
  retries, no client-shuffling, no backoff ladder.
- **Nothing was queued, deliberately, and this is the part worth not getting wrong.** The
  queue is drained by Supadata against a 100-request MONTHLY budget, so it stays
  keyword-filtered even on a local run — "fetch broadly, queue narrowly". The keyword-shaped
  titles in tonight's 227 (Shadarek "Havoc BUFFED AGAIN! | Sep 1st Class Tuning", LBNinja7
  "Healers Buffed AGAIN!! | 12.1 Tuning", Dalaran Gaming "New Buffs For Season 2! Class
  Tuning Coming with Weekly Reset") are ones **the nightly's own filtered discovery will
  queue by itself**, so hand-queueing them here would duplicate the nightly rather than add
  reach. The ones the nightly genuinely cannot see are the non-keyword titles — and those I
  could not fetch either, since the transport is down. So there was nothing this run could
  usefully add to the queue, and it stays at **1** (`n0H4JFE6Suc`, Obli, queued 08-28).
- **All 227 stay UNSEEN, on purpose.** This was a transport failure, and budget/transport
  dismissals never enter `seen[]` — that lane takes durable judgments only. Marking tonight's
  sweep seen would silently abandon a 227-video backlog and reproduce exactly the
  Tactyks/J-Funk failure. They will be reconsidered next run.
- **Leads noticed but NOT distilled** (they are ptr-watch's lane, and were verified there
  against the canonical forum post rather than off a video title): several creators posted
  on the September 1 class tuning pass within hours of the announcement. That pass is now
  logged in `data/ptr-builds.json` from **forum topic 2342331 read at version 3** — see
  ptr-watch/log.md. No take or metaNote was minted from any video title; a title is a lead,
  never a source.
- 0 takes, 0 metaNotes, 0 verified skips this run. `data/creator-takes.json` and
  `data/pending-transcripts.json` are both untouched.


## 2026-08-28 (nightly, CI runner) — 5 pre-fetched transcripts read: 3 takes, 7 metaNotes, 2 verified skips

- **Discovery:** all **44** transcribable channels polled via the YouTube RSS endpoint, 0
  failures, 15 entries each = 660 videos. Seen-set union (pending `seen[]` + `skipped[]` +
  `videos[]` + every `youtu.be/<id>` in a take or metaNote url) = **1,212**. Unseen **220**,
  all of them inside the cycle bound (2026-06-18, `Math.min` over `ptr-builds.json` — taken as
  a DATE, never an index); **130** pass the nightly keyword filter. The filter stays on, per the
  100-request MONTHLY Supadata budget; the 129 not queued stay UNSEEN rather than being written
  to `seen[]`, because a budget cut is exactly the dismissal class that must remain
  reconsiderable.
- **Transcripts:** all five queued videos were pre-fetched by the deterministic step
  (`transcript-fetch/summary.json` attemptedAt 2026-08-28T21:14:27Z, verdict **ok**, 5
  requested / 5 fetched). No YouTube or transcript-API request was made by this agent.
- **izen `x429ozbMXnQ` — "Season 2 Mythic+ Meta | Best Performing Specs and...Surprises"
  (2026-08-27, 26 min) → 7 metaNotes, M+ lens.** Arcane Mage positive (Prismatic Bolt proccing
  off Arcane Blast; "good at all points"), Arms Warrior positive (Slayer over Colossus after
  Tactical Edge began proccing Sudden Death; AoE back at War Within levels; 50 Bladestorms in
  28 minutes), Elemental Shaman positive (number one on average score; Voltaic Blaze + Purging
  Flames make Lava Burst a 5–6 target button; weak tankiness), Holy Paladin positive (gapping
  Resto Shaman by ~100 average score; top keys are essentially all Lightsmith), Blood DK
  positive (clear advantage among tanks off the score chart), Restoration Shaman **mixed** (the
  only real alternative, better on flat rot healing, much weaker spot and single-target), and
  Assassination Rogue **mixed** — logged mixed rather than positive because izen calls it "the
  first asterisk of the season": very high average score he cannot explain beyond four
  consecutive flat percentage buffs, and a lopsided profile that is much weaker on forced
  single target. Six prior izen M+ notes superseded (five from 08-25, Resto Shaman's from
  08-21); same lens, newer read.
  Deliberately NOT distilled: **Outlaw Rogue**, whose only appearance is the score-swap caveat
  (run keys as Assassination, swap to Outlaw, keep the score) — a scoring artifact, not a
  strength read; and **Marksmanship / Shadow Priest / Holy**, which appear solely as bare
  comparators in one enumeration (the list-mention rule).
- **AutomaticJak `l1qKWWYZGZE` — "This NEW Holy Priest Build Dominates" (2026-08-26, 11.5 min)
  → 2 RAID takes.** Holy Priest **buff**: he recommends Holy over Disc for 99% of raiders on
  the Venomous Abyss fights so far, calls it still one of the highest HPS specs in the game,
  and backs it with his own Lost Explorers log where his effective-healing-required-per-second
  was third from the bottom of the raid; immobility is the named cost, and he splits Oracle
  (≤20) from Archon (~30). Discipline Priest **nerf**: the same comparison run the other way —
  Holy is "much safer and less stressful" than Disc in this raid — closing with a direct ask to
  buff Disc via an Atonement modifier for dungeons. Both supersede his 08-21 raid takes on the
  same specs.
  ⚠️ **His M+ read was deliberately NOT logged, and this is the flag, not a decision.** The
  video contains a substantive M+ passage ("we've done 17s as holy… around like an A tier
  healer right now", weak AoE healing, verse-stacking to survive) — but AutomaticJak is the
  bylined author of the **Wowhead M+ healer tier list**, one of our four consensus sources, and
  he literally states a tier. Logging it would feed `consensusFor` and `expertRead` from one
  voice on the same cell, the Tactyks firewall shape. His existing 08-21 M+ takes were left
  live: pre-existing entries are an owner decision, flag never retire.
- **Musguete `ps4If_WbBPQ` — "Outlaw feels INSANE in Season 2! 12.1 Guide" (2026-08-27, 8 min)
  → 1 RAID take, buff.** Mostly a rotation/stat/talent update, which is normally the
  guide-shaped no-take case, but it carries an explicit placement claim with a mechanism: many
  of the new raid's bosses are two- and three-target cleave and Outlaw performs really well
  there, so he expects to keep seeing it raided; off his own meters, sustained damage is
  consistent and high outside burst and the opener burst is notably bigger than Season 1's. His
  live M+ Outlaw take (08-04) and the unscoped PTR-era tuning take (07-31) were left alone —
  different lenses, and a naive `bracket ?? "both"` retirement is the documented over-supersede
  failure.
- **Verified skips (2), both moved to `skipped[]` with reasons:** AutomaticJak `rGk2fajsQ1g`
  "Disc Priest in 60 Seconds" — 32 chunks, 59 seconds, pure how-to, no comparative read (and a
  Disc read from him IS on file from the same window, so nothing is lost); Critcake
  `if8kxRXBzSA` "+16 Murder Row" — 201 chunks, 31m20s of a commentated pug key run whose three
  strength-adjacent lines all fail the test ("I love slayer arms" is enjoyment, "Arms is very
  good on it" is one fight, and the tank-meta / Windwalker remarks answer chat about specs
  outside his declared Arms/Fury scope). No neutral take was minted to record having watched
  either.
- **Queued (1):** Obli `n0H4JFE6Suc` "What did the buffs do for Frost DK?" (2026-08-28). Queued
  on its DESCRIPTION rather than its title — "Frost got buffed with this reset but has it
  actually done anything for us in the raid? Short answer, no" is a raid-scoped spec-strength
  read in Obli's declared Frost/Unholy scope. Queue depth is now 1.
- **Considered and left unseen** (keyword/budget cut, reconsiderable next run): Bicepspump
  `_7W3AVF1p8c` Unholy DK rotation guide and Jedith `DbXY5OnAxoU` Havoc build/opener guide (both
  guide-shaped); Supatease `pLFqCP68UhY` "THE NEW META IS COMING" and `jBXCc2bTTDs` "Midnight
  PVP Tier List Season 2 Update" (PvP lens, the documented title trap); Dalaran Gaming
  `seRL4jirX9E` "Blizzard Just Revealed Huge Changes…" (design-news commentary from a class
  creator); the MadSkillzzTV and LBNinja7 healer streams and the YoDaTV / Bansherz / Shindigg /
  J-Funk key-and-raid PoV runs.


## 2026-08-28 (local, scheduled) — the caption 429 is on its SECOND consecutive day; queue held at 5, nothing distilled

**Videos processed: 0. Takes added: 0. MetaNotes added: 0. Queue: 5 → 5 (unchanged).**

- **One caption probe, one 429, stopped there** — the skill's rule, not a judgement call.
  `x429ozbMXnQ` (izen, "Season 2 Mythic+ Meta") at the pinned yt-dlp with the documented flags:
  metadata resolved normally (formats listed, "Downloading subtitles: en" reached) and ONLY the
  `timedtext` request failed, `HTTP Error 429: Too Many Requests`. That is the IP-scoped abuse-flag
  signature diagnosed 08-24, not the datacenter bot wall and not transient throttling. No retry loop.
- **This is day two of the current relapse** (clear 08-25 and 08-26, back 08-27, still blocked
  08-28). The 08-27 reading that the 08-25 clearing was a remission rather than a fix now has a
  second day behind it: the residential lane cannot be treated as a reliable catch-up route.
- **The authenticated fallback was NOT usable this run, and for a new reason worth recording.**
  A `cookies.txt` Riley exported on 08-24 is still on disk, so unlike 08-27 the file existed — but
  this session's permission layer refused the read, and working around a credential-access denial
  is not something a scheduled run should do. Recording it so the next run knows the blocker was
  the harness, not a missing file. If Riley wants the authenticated lane available to scheduled
  runs, that needs an explicit allowance rather than an agent finding a way round.
- **Queue deliberately UNCHANGED at 5** (`x429ozbMXnQ`, `ps4If_WbBPQ`, `rGk2fajsQ1g`,
  `l1qKWWYZGZE`, `if8kxRXBzSA`). Nothing moved to `skipped[]`: a skip is a DURABLE claim that the
  transcript was read and held nothing, and a transport 429 is not that. They drain through
  Supadata on the next nightly — a different network path, unaffected by this flag, and proven so
  by the 08-27 nightly which fetched 3 of 3 while this lane was blocked.
- **No unfiltered breadth sweep, on purpose** (the 08-27 reasoning, unchanged): the local run's
  breadth privilege is that yt-dlp is free, and with captions 429ing a wider sweep yields no
  transcripts and therefore no takes — the only thing it could produce is more QUEUE entries, which
  spend the nightly's 100/month Supadata budget. Counts stand: `seen[]` 549, `skipped[]` 413.


## 2026-08-27 (nightly) — the Supadata lane came back clean and all three queued videos distilled: 7 takes, and Kalamazi's post-buff Warlock read is a real reversal

**Videos processed: 3 (all three from `transcript-fetch/`, verdict `ok`, 3 requested / 3
fetched). Takes added: 7. MetaNotes added: 0. Superseded: 6. Queue: 3 drained, 5 appended.**

- **The 08-23/24 caption 429 that blocked the 08-27 local run is irrelevant here** — the nightly
  does not touch YouTube. `transcript-fetch/summary.json` (attemptedAt 2026-08-27T20:43:53Z)
  reads `fetched:543`, `fetched:209` and `fetched:41` chunks for the three queued ids. No
  transcript API or YouTube request was made by this agent.
- **KALAMAZI — `A7ZMRYQALHw`, "Is Demo OP? Warlock Buffs Are Changing Things!" (2026-08-26),
  4 takes.** This is the after-the-fact counterpart to his 08-22 preview, read off live
  Venomous Abyss logs filtered to the previous 24–48 hours, and it reverses the preview's central
  prediction: he had asked whether buffed Demonology could take fights off Destruction and
  answered probably not. **Demonology raid (buff)** — taking over the stacked-cleave bosses
  (Nek'zali, Heroic Vashnik, the Coiled Altar, Ula'tek), with Tomb Sentinels staying Destruction
  and two Mythic fights a toss-up he expects to drift. **Demonology M+ (buff)** — "cranking",
  "gapping in many keys", with utility (bad kick, no raid or party buff) as the only stated
  brake. **Destruction raid (mixed)** and **Destruction M+ (mixed)** — it keeps its high end
  (Havoc cleave "insane this patch", a rank-one Altar of Fangs key that same day) but loses the
  default slot; his own words on the Coiled Altar are that it "just sort of ended up not being
  what we thought at all". His four prior live Warlock takes on those exact lenses (Demonology
  raid + M+ 08-22, Destruction raid 08-17, Destruction M+ 08-22) are superseded.
  **Affliction was deliberately NOT distilled.** The only Affliction material is fight-shaped —
  top raw-damage logs on Ula'tek, a "wouldn't fault you playing either" on the Coiled Altar — and
  a fight artifact is not a spec read. His 08-22 raid and 08-17 M+ Affliction takes stay live and
  untouched. A co-streamer is present from ~464s; nothing he says is distilled, including the
  "10%" buff figure, which is his question and which Kalamazi answers with an explicit "I'm not
  sure exactly".
- **CRITCAKE — `inGFY23zA-c`, "FURY IS UNDERRATED. +17 Den of Nalorakk" (2026-08-26), 1 take.**
  A key run that carries a genuine comparative read, which is exactly why the nightly's title
  filter is a poor instrument and this one was queued anyway. Logged **Fury / M+ / mixed**, not
  buff: he says Fury is currently out-damaging his Arms, then undercuts the comparison himself
  three ways — old two-piece, Arms-itemised gear pulled from his bags, and "I am mashing buttons
  a lot harder when I'm playing Fury, so I think that's why we're doing more damage" — and his
  one concrete negative is that Fury's single target is behind Arms until the new 4-set lands.
  **No Arms take was minted from it.** Arms appears only as the comparator in a claim its author
  discounts, and reading a negative into that would manufacture a signal. His 08-10 Fury take is
  bracket "both" and was NOT superseded — different lens, and it is a pre-season read this one
  does not replace.
- **AUTOMATICJAK — `wgwLOufz5r8`, "RWF Healer Comp Explained" (2026-08-27), 2 takes.** A short
  clip; identity is anchored by its own description ("Explaining the benefits of the RWF Healer
  Comp's we're seeing"), not by the caption track, which names no speaker.
  **Restoration Shaman / raid / buff** — he is "quite a bit of a believer" and wants it on the
  race comp books, arguing Spirit Link against the Coiled Altar's stacking rot plus heal absorbs.
  **Preservation Evoker / raid / mixed** — a real RWF possibility with named upside (Time Spiral,
  other healers wanting a Rescue, Zephyr damage reduction) but he is "a little skeptical" it beats
  the other three healers on mitigation, so this is not the clean positive the first half sounds
  like. Both supersede his 08-15 raid reads on the same specs.
  ⚠️ **The PRIEST material was declined.** The clip's opening "this priest kind of has it all …
  power infusion" never names Discipline or Holy, and a bare class token is not a spec. Two of the
  ability references in that passage (Rescue, Zephyr) are Evoker's, not Priest's, which is exactly
  how a flattened read mis-attributes.
- **Discovery: all 44 transcribable channels polled, 0 RSS failures**, 15 entries each. Seen-set
  union (pending `seen[]` + `skipped[]` + `videos[]` + every take/metaNote url) = **1,207**;
  199 unseen videos, all of them inside the cycle bound (2026-06-18, the oldest
  `ptr-builds.json` date). Nightly mode, so the keyword filter stays — the free Supadata tier is
  100 requests per MONTH and an unfiltered nightly would burn it in two runs.
- **Queued 5**, chosen for spec-analytical content rather than title keywords alone, with the
  `media:description` read on each: `x429ozbMXnQ` izen "Season 2 Mythic+ Meta | Best Performing
  Specs and...Surprises" (2026-08-27 — the metaNotes archetype, description lists per-spec
  chapters); `ps4If_WbBPQ` Musguete "Outlaw feels INSANE in Season 2!" (Outlaw is in his declared
  scope); `rGk2fajsQ1g` AutomaticJak "Disc Priest in 60 Seconds" and `l1qKWWYZGZE` "This NEW Holy
  Priest Build Dominates"; `if8kxRXBzSA` Critcake "+16 Murder Row — Slayer Arms" (his key runs
  demonstrably carry reads — see tonight's Fury take).
  **The other 194 stay UNSEEN, not `seen[]`** — they are a budget/keyword cut, which is precisely
  the dismissal class that must remain reconsiderable. Bicepspump's "How To Play Unholy DK in
  Midnight (12.1)" is the clearest example: it passes the keyword filter, but its own description
  calls it a "Beginner Rotation Guide", and guide-shaped content has never yielded a take. It was
  not queued and not retired.
- **Firewall notes, unchanged and still awaiting Riley** (flag, never retire): AutomaticJak
  authors the Wowhead M+ healer tier list, flagged on 08-27; tonight's two takes are both RAID,
  so nothing new was added on that side. If either queued Priest video turns out to be an M+
  read, that decision lands before it is logged.


## 2026-08-27 (local, scheduled) — the caption 429 is BACK after two clear days; queue held at 3, nothing distilled

- **The residential yt-dlp caption lane is 429-blocked again.** All three queued ids attempted once
  each at the pinned version with the documented flags
  (`--extractor-args "youtube:player_client=android" --write-auto-subs --sub-langs en --sub-format json3`):
  `A7ZMRYQALHw`, `inGFY23zA-c`, `wgwLOufz5r8` — every one `ERROR: Unable to download video subtitles
  for 'en': HTTP Error 429: Too Many Requests`. Stopped there; no retry loop, per the skill.
- **Same signature as the 2026-08-23/24 flag, not the datacenter bot wall.** Metadata resolved
  normally on all three (formats listed, `Downloading subtitles: en` reached) and ONLY the
  `timedtext` request 429s — which is the IP-scoped abuse flag, diagnosed 08-24. It had cleared on
  **08-25** and was still clear on **08-26** ("one try, no 429"); it has returned on **08-27**. Two
  clear days then a relapse means the 08-25 clearing was a remission, not a fix, and the residential
  lane cannot be treated as a reliable catch-up route.
- **Not escalated to the authenticated fallback, and that is the rule rather than a judgement
  call.** The owner-approved lane needs a `cookies.txt` Riley exports himself
  (`--cookies-from-browser chrome` is dead on this machine — App-Bound Encryption, yt-dlp issue
  10927), and browser cookie stores are never read directly. This was an unattended scheduled run
  with no owner present, so there was nothing to escalate to.
- **Queue deliberately UNCHANGED at 3** (`videos[]` still `A7ZMRYQALHw` / `inGFY23zA-c` /
  `wgwLOufz5r8`). Nothing was moved to `skipped[]`: a skip entry is a DURABLE verified claim that the
  transcript was read and held nothing, and a transport 429 is not that. They drain through Supadata
  in the next nightly, which is a different network path and unaffected by this flag.
- **No unfiltered breadth sweep this run, on purpose.** The local run's breadth privilege is that
  yt-dlp is free — with captions 429ing, a wider sweep yields no transcripts and therefore no takes,
  and the only thing it could produce is more QUEUE entries, which spend the nightly's 100/month
  Supadata budget on the 27th. The nightly already queued the three highest-value candidates with
  `media:description` evidence. `takes` stays 553, `metaNotes` 374, `seen[]` 549, `skipped[]` 413.


## 2026-08-27 (nightly) — all 44 feeds polled clean; 194 unseen in-cycle videos, 3 queued; a NEW byline-firewall finding covering 23 live takes

- **Discovery: 44 of 44 transcribable creators polled, zero RSS errors, zero retries needed.** 15
  entries each. Every creator entry carries a `channelId`, so nothing was skipped for the
  advertised-but-unpolled reason the 2026-08-08 audit found. Seen-set rebuilt from STRUCTURED DATA
  only — `pending-transcripts.json` `seen[]` (549) + `skipped[]` (413) + `videos[]` (0) plus every
  `youtu.be/<id>` in a take or metaNote url — **union 1,204**. Cycle bound derived as
  `min(builds[].date)` = **2026-06-18**, taken as a DATE and not an index (the file is newest-first;
  `builds[0]` is tonight's 08-26 hotfix and using it would cut the sweep to nothing).
- **194 unseen videos on or after the cycle bound; 130 pass the class/spec/12.1/Season keyword
  filter.** This is a NIGHTLY, so the keyword filter STAYS — Supadata's free tier is 100 requests
  per MONTH and it is the 27th, so breadth belongs in a local run. **Nothing was marked `seen[]`**:
  every non-queued video here is a budget or title dismissal, which the skill says stays UNSEEN so
  the backlog remains auditable and a local run can reconsider it. `seen[]` 549 and `skipped[]` 413
  are unchanged.
- **QUEUED 3** (`videos[]` 0 → 3; the deterministic step ran before this agent and found the queue
  empty, so these drain tomorrow). All three were settled with `media:description` alongside the
  title, at zero transcript cost:
  · **`A7ZMRYQALHw`** Kalamazi, 2026-08-26, "Is Demo OP? Warlock Buffs Are Changing Things!" —
    description "These buffs might have been a bit bigger than we think." An explicit spec-strength
    read on the 08-25 Warlock pass, from a creator scoped to ALL three Warlock specs.
  · **`inGFY23zA-c`** Critcake, 2026-08-26, "FURY IS UNDERRATED. +17 Den of Nalorakk — Midnight M+
    Season 2 (week 2)" — description "Very curious how Arms and Fury will compare in keys when I get
    the new 4 set." A comparative claim between the two specs he is scoped to, not a run-of-the-mill
    key POV.
  · **`wgwLOufz5r8`** AutomaticJak, 2026-08-27, "RWF Healer Comp Explained" — description
    "Explaining the benefits of the RWF Healer Comp's we're seeing!" Cross-healer comparative
    analysis, and **RAID-framed** (race to world first), which matters given the firewall finding
    below: anything distilled from it must be `bracket: "raid"`.
- **NOT queued, with reasons, so the judgment is auditable rather than a silent budget cut.**
  · **Guide-shaped** (documented zero yield — all four of yesterday's skips were this shape):
    Musguete `ps4If_WbBPQ` Outlaw Season 2 guide, Jedith `DbXY5OnAxoU` Havoc build/opener/rotation,
    Pkpawner `XcrYnSEChws` Windwalker Heroic Ula'tek play-by-play, AutomaticJak `l1qKWWYZGZE` Holy
    Priest build and `rGk2fajsQ1g` "Disc Priest in 60 Seconds" (both descriptions point at his
    Wowhead build pages), plus the Tactyks/Megasett/Sha boss and dungeon guides.
  · **Gearing / vault PSAs** (the Whispyr precedent — an item- or gear-level claim is not a spec
    read): Shadarek `I43UP1GXjGY`, Whispyr `EvMNv-r1gz0`, Sha `RVMHl9aaTcs`, izen `rEEvSn87I44`,
    Kalamazi `Q5z3PKbFsWk`, Dalaran Gaming `ZW5YlVxR0-U`.
  · **Supatease** `3NY5ClgSKSE` "Fire Mage is THE Spec To Play" and `gnKOwGJC0mA` "I Was Wrong About
    Destro Lock" — doubly out: he is a PvP creator (the documented rule is that a PvP creator
    answering "best spec" is still a PvP read), and Fire Mage / Destruction are outside his
    registered scope (Affliction Warlock, Arms + Protection Warrior, all Shaman) in any case. Left
    UNSEEN rather than `seen[]`, since PvP-framing read off a title is a guess, not a durable fact.
  · **Stream / POV / RWF-recap shells**, the bulk of the 194: Bansherz key POVs, Critcake and
    Clandon and Shindigg raid-night streams, Dratnos and Maximum daily RWF recaps, Sha and Megasett
    "keys later" shells.
- ⚠ **NEW FINDING — the byline firewall is wider than Tactyks, and it is flagged for Riley, not
  acted on.** Reading each Wowhead tier-list page's byline while era-verifying tonight (see the
  refresh-tiers entry) shows **four registered creators author pages that feed `consensusFor`**:
  **Dratnos** (raid DPS *and* raid tank), **tettles** (M+ DPS), **AutomaticJak** (M+ healer),
  **YoDaTV** (M+ tank). Only Tactyks/Method has ever been recorded this way. The rule is that such a
  creator is firewalled from the bracket they author, or one voice feeds both the consensus letters
  and `expertRead` on the same cell. Measured exposure in the CURRENT take set: **23 live takes** in
  the authored bracket — **Dratnos 3** (two unscoped `both` on Arms/Fury dated 08-15, one raid Arms
  08-16), **tettles 4** (two M+ dated 08-08, two unscoped), **AutomaticJak 7** M+ (five 08-15 healer
  tier-list reads, two 08-21 Priest reads), **YoDaTV 9** M+ (his whole 08-22 tank/M+ tier-list
  update). Per the standing rule — *flag, never retire* — nothing was superseded or narrowed.
  Icy Veins' pages are bylined "Petko", not a registered creator, so that source is clean; Method's
  M+ list is Tactyks, already handled.
  Practical consequence taken tonight: the one healer video queued is raid-framed, so it cannot add
  to AutomaticJak's M+ exposure while the question is open.
- **Nothing distilled, so no `latest` field was advanced** — the rule is that `latest` states what
  is KNOWN, and overwriting one with a fresh title trades information for recency. `takes` stays
  553, `metaNotes` 374, newest 2026-08-25.


## 2026-08-26 (local) — queue drained 5 → 0; izen's week-one video → 12 metaNotes; the other four are guide-shaped skips

- **The caption lane is still healthy.** One sanctioned probe first (`i5751gjXrDs`) returned a 216 KB json3 on the first
  try, no 429, no retry — so the 08-25 clearing of the IP-scoped `timedtext` abuse flag is holding two days on. Nothing
  client-side changed: pinned yt-dlp 2026.07.04, `player_client=android`, `--sleep-requests 3` with a 5s gap between
  videos. All five queued ids drained; `videos[]` is **5 → 0**.
- **`i5751gjXrDs`** (izen, 2026-08-25, 11m14s, "Season 2 Week 1 Raid & Mythic+ Meta & Specs Popularity") → **12 metaNotes**,
  all era-framed "Season 2 live", split 4 raid / 8 M+. This is his first read with a full week of LIVE results behind it.
  · **Raid** — Arms and Arcane **positive** (he says the specs expected to be good are being confirmed good, naming those
  two as predictably among the best performers). Shadow Priest and Balance Druid **mixed**, deliberately not positive:
  he raises their high placement only to explain it away as an artifact of which bosses have been killed, since the
  cleave-and-DoT specs excel on the early encounters the bulk of guilds have reached, and he says outright there is
  "room for some misleading". Marking those two positive would invert his actual point.
  · **M+** — his predicted comp (Blood, Holy Paladin, Arms, Arcane, Elemental) is holding at almost 42% of top groups, so
  **Blood DK, Holy Paladin, Arms, Arcane and Elemental positive**; Elemental specifically as the caster that survived the
  three-way contest. **Devourer negative** — it lost that contest and sits behind Elemental by "a pretty large gap",
  which is a genuine reversal of his own 08-21 positive. **Protection Warrior and Restoration Druid negative** — both
  named as specs players report being declined for at +10, let alone +12.
- **DECLINED, recorded so the judgment is auditable.** Five candidate reads were dropped on the list-mention rule and
  the ASR rule: **Destruction Warlock** (named once, only inside the enumeration "the cleave dot specs like destro and
  shadow priest and balance" — Shadow and Balance each get a second, separate mention and Destruction does not);
  **Marksmanship Hunter** (a single hedged "even specs like marksmanship being quite high in fact", immediately undercut
  and never returned to); an ASR token rendered **"death"** in the same early-boss list, ambiguous between Devastation
  and a Death Knight spec and therefore not written as a name (the `djVmUT8w0fU` Frost DK precedent);
  **Balance Druid in the M+ lane** (named only inside the three-candidate enumeration — the raid lane clears the bar,
  the M+ lane does not); and the **pure-melee comp roster** (Outlaw, Feral, Brewmaster) plus "the recently buffed rogue
  specs perhaps windwalker monk", all bare enumerations with no individual predicate.
- **12 supersessions, same-lens only.** Raid: his 08-17 pre-launch RAID predictions for Arms, Arcane, Shadow, Balance.
  M+: his 08-21 week-one M+ notes for Blood, Holy Paladin, Arms, Arcane, Elemental, Devourer, and his 08-16 pre-launch
  M+ tier-list notes for Prot Warrior and Resto Druid (neither was covered by the 08-21 video). His **08-22 tuning-pass**
  notes for Resto Druid and Prot Warrior were deliberately LEFT LIVE — that is a different lens, and the two claims are
  complementary rather than contradictory: the tuning pass buffed Resto Druid while players are still declining it.
- **Four guide-shaped verified skips**, which is the documented expectation for this content type, not a shortfall:
  `J2tP3uynoiM` NeekapHere (Ret guide UPDATE — Herald over Templar, four-piece weaving, trinket amendments; its tier-set
  claim is already carried by his 08-22 take, so distilling would duplicate it with a weaker source), `w4MTlSOTaLM`
  AutomaticJak (Holy Paladin how-to; its only strength-adjacent line is the "feels more powerful than ever" opener,
  the new-set-beats-old-set shape that would fire for every spec guide and would have superseded his richer comparative
  tier-list read), `unV9EKXb820` LBNinja7 and `y6K0fV8O9u4` Megasett (both Mistweaver raid how-tos; their only
  strength-adjacent lines are ability-level — Revival being weak, mastery having been buffed — not spec-level).
  `skipped[]` is **409 → 413**.
- **Measured effect: 0 letters moved.** The post-run snapshot is byte-identical to the nightly's own `2026-08-26.json`,
  so no consensus tier, metric rank or projection score changed. That is the expected and correct outcome — the
  general-creator meta nudge is gated on ≥2 creators agreeing unanimously, and izen is one voice, so this lane is
  display-only. Recorded because "12 metaNotes landed" reads like movement and is not.


## 2026-08-26 (nightly) — 44/44 feeds polled; Obli's Blightfall video distilled into 2 Unholy takes; 5 queued

**Discovery:** 44 unique channel ids resolved from `community.json` (76 class-creator entries with
`transcribable !== false` and a `channelId`, plus the 3 generalCreators, deduped), all polled with
retry/backoff — **44 of 44 HTTP 200, 0 failures**. Seen-set built as STRUCTURED DATA from the four
lanes (`seen[]`/`skipped[]`/`videos[]` + every `youtu.be` id in a take or metaNote url): **1199 ids**.
**175 unseen** videos surfaced, every one of them on or after the cycle bound **2026-06-18** (derived
as `Math.min` over ptr-builds dates, never `builds[0]`); 104 keyword-relevant.

**Distilled 1 video** — the one the deterministic step pre-fetched (`transcript-fetch/summary.json`
verdict `ok`, requested 1 / fetched 1, 346 chunks). This agent contacted neither YouTube nor any
transcript API.

**Obli `djVmUT8w0fU`** "Talking shop about Blightfall + NEW UNHOLY BUGS!!", 2026-08-25 → **2 takes**,
both Unholy DK, both inside his registered `[Frost, Unholy]` scope:
- **M+ / buff** — "for keys we're looking really, really strong", argued off his own +12 Altar of
  Fangs run (≈470k on trash, ≈323k dungeon-wide, execute damage *rising* because San'layn amplifies
  plague damage as health drops). Capped by his own comparison: an Arcane Mage does ≈500k where he
  does 470k. He credits the 4-piece explicitly.
- **Raid / mixed** — "not doing too bad once you get your set", good on cleave and add windows, weak
  on pure single target and during the weakened-heart phase, with Necrotic Coil still bugged so it
  cannot hit the Venomous Heart at all (and the attempted fix having made it melee-range).

Superseded within the same lens only: his 08-23 Unholy **M+** take and his 08-20 Unholy **raid** take.
His live Frost takes are a different spec and were left alone. `videos[]` record dropped in the same
edit — and validation caught it when the first attempt forgot, which is the one-record rule earning
its keep.

**DECLINED, recorded so the judgment is auditable:** the same transcript contains one passing clause
about **Frost DK** — "I think a Frost DK would do really well here if the tuning just got turned up
ever so slightly, but it's not great". Not distilled: it is a single fight-specific hypothetical, the
ASR mangles the spec name ("frost decay"), and the video's publication date straddles the August 25
Frost buff, so its currency is ambiguous. Obli's `latest` was advanced to state what is now KNOWN.

**Queued 5** (nightly keeps the keyword filter — Supadata is 100 requests/MONTH):
`i5751gjXrDs` izen "Season 2 Week 1 Raid & Mythic+ Meta & Specs Popularity" (highest value in the
sweep; its own chapter list names *Raid Specs Popularity* and *M+ Top Specs* — the metaNotes
archetype), `J2tP3uynoiM` NeekapHere Retribution 12.1 PvE guide update, `w4MTlSOTaLM` AutomaticJak
Holy Paladin S2 guide, `unV9EKXb820` LBNinja7 Mistweaver S2 raid guide, `y6K0fV8O9u4` Megasett
Mistweaver 12.1 raid guide.

**`media:description` parsed alongside every title** and it settled the borderline cases at zero
transcript cost: Supatease's "THE META IS EVOLVING" / "THE NEW META IS COMING" / "Fire Mage is THE
Spec To Play" all have descriptions that merely copy the title — the clip-short shape — from a
PvP channel whose meta reads have repeatedly triaged out, so none were queued; Pkpawner's Windwalker
video is explicitly a Heroic Ula'tek boss guide and Jedith's Havoc video a sponsored
opener/rotation how-to; Dratnos' RWF recaps sit outside his registered Warrior specialist scope.

**Nothing was added to `seen[]`.** Every one of those is a budget or judgment dismissal rather than a
durable fact about the video, so they stay genuinely unexamined and will be reconsidered next run.
Expect the unseen count to stay high; that is the accounting working, not a backlog rotting.


## 2026-08-25 (nightly, 2nd run of the day) — 44/44 feeds polled, no transcript lane, ONE video queued

- **Discovery**: all **44 unique channels** behind the 79 transcribable creator entries polled via
  `feeds/videos.xml`, 44/44 HTTP 200 after retry/backoff, **0 failures, 660 videos**. Seen-set
  rebuilt from the four machine lanes only (seen[] 549 · skipped[] 409 · videos[] 0 · take/metaNote
  urls) → **149 unseen, all in-cycle** against the computed bound (oldest `ptr-builds.json` date,
  2026-06-18, taken as a DATE not an index). 106 of them match the nightly keyword filter.
- **Transcripts: none available.** `transcript-fetch/summary.json` reads verdict `ok`,
  `requested 0` — the deterministic step ran at 15:51:05Z against an empty queue. This agent holds
  no transcript credentials and contacted no caption endpoint. **0 takes, 0 metaNotes, 0
  supersessions; `creator-takes.json` byte-identical.**
- **Queued exactly one**: Obli `djVmUT8w0fU` "Talking shop about Blightfall + NEW UNHOLY BUGS!! /
  Unholy DK Midnight Update 12.1" (08-25). Chosen on its `media:description`, not its title —
  it promises Blightfall's "strengths and weaknesses in raid and M+", a spec-strength read inside
  Obli's registered Frost/Unholy scope.
- **The other 105 keyword matches were deliberately NOT queued and deliberately NOT marked seen.**
  Supadata is 100 requests a MONTH and we are six days from month end, so the queue takes the
  video most likely to yield a take, not everything that mentions a class. What was passed over is
  the shapes with a long verified-skip record here (counts recomputed from `skipped[]`, not
  remembered): stream VODs and key/raid POV clips — Bansherz **32**, Shindigg **11**, Maximum **11**,
  Critcake **7**; boss/dungeon guides — Tactyks **20**, Megasett **19**; spec build walkthroughs —
  NeekapHere **18**, LBNinja7 **13**, AutomaticJak **10**, Jedith **7**; and Supatease, **19 of whose
  39 skips are explicitly PvP-framed**. Dratnos' RWF recaps are the same story: **6** of his 18 skips
  are recap episodes, days 0-2 of this very race among them. Leaving them
  UNSEEN is the point: a budget/triage dismissal is not durable, so the next run reconsiders them,
  whereas seen[] would abandon them silently.
- **General lane**: izen's newest (`5m_K51fnwhc`, 08-22) and Zorthas' (`x0fxEWTq3Pw`, 08-18) are
  both already distilled — nothing new for `metaNotes`.


## 2026-08-25 (local) — THE 429 HAS CLEARED after three days; queue drained 2 → 0, 5 takes

- **The headline is transport, not content: the anonymous `timedtext` caption lane WORKS again.**
  The 08-24 addendum predicted the IP-scoped abuse flag would decay after 24–72h of zero caption
  traffic, and it did — the last anonymous caption attempts were 08-24, and the single sanctioned
  probe tonight returned a 192 KB json3 on the first try, no retry, no backoff. Spending exactly
  ONE probe before committing to a sweep is what made this cheap to discover. **Nothing
  client-side was changed**: same pinned yt-dlp 2026.07.04, same `player_client=android`, nothing
  installed or upgraded. That is the point — the 08-24 elimination chain concluded no client
  change could beat the flag, and correspondingly no client change was needed to un-beat it.
- **Both queued videos drained; `videos[]` is 2 → 0**, the first empty queue since 08-22. Paced
  `--sleep-requests 3` with a 5s gap between the two, on the reasoning that the flag was likely
  triggered by combined caption VOLUME from this egress IP — the lane is healthy, not proven
  durable.
- **`LoCCPjj7J6c`** (Dalaran Gaming, 2026-08-24, 9m01s, "If You Aren't Playing These 5 Specs in
  Season 2…") → **4 takes**, all era-framed "Season 2 live":
  · **Arcane Mage — both — buff** (t=235). The standout Mage spec; credits the 12.1 rework
  (Prismatic Bolt) for boss/AoE/cleave damage that "inches" it ahead of Fire and Frost, and reads
  the defensive rework (Refractive Images, improved Prismatic Barrier, Improved Warding) as
  leaving it no longer the squishiest Mage, which he thinks helps specifically in M+.
  · **Subtlety Rogue — raid — buff** (t=435) and **— mplus — buff** (t=465), deliberately
  bracket-SPLIT because his read genuinely differs by bracket: unmatched pure single-target boss
  damage in raid, versus "only ever so slightly behind Assassination and only at the highest key
  levels" in dungeons.
  · **Assassination Rogue — mplus — buff** (t=470). A little better than Subtlety at the most
  record-breaking keys, with Subtlety the more popular pick below that ceiling.
- **`igWiPoYPlV4`** (Musguete, 2026-08-24, 9m25s, "Assassination Rogue is Broken! Season 2 Guide")
  → **1 take**: **Assassination — both — buff** (t=140). **This id was explicitly NOT queued on
  08-24 as guide-shaped** ("its description is explicit how-to-play"), and tonight's nightly
  queued it anyway. The local lane resolves the disagreement for free: the transcript IS mostly
  how-to-play (rotation, energy, macros, talents, stats) **but it opens and closes on his own
  spec-strength read** — damage "really, really good" with intense output outside the burst window
  and a lot of sustain, and he does not believe the spec is going away. So the guide-shaped rule
  held as a prior and failed on the particular: verified by transcript, it yields a take. Worth
  remembering that the rule says *verify by transcript, then skip* — not *skip on the description*.
- **THREE SUBSTANTIVE READS WERE DELIBERATELY NOT DISTILLED, and this is the flag for Riley.**
  Dalaran's five picks are Blood Death Knight (tank), Holy Paladin (healer), Arcane Mage, Arms
  Warrior and Subtlety Rogue — but he is registered only under Druid, Hunter, Mage, Rogue and
  Shaman, so **Death Knight, Paladin and Warrior are outside his scope entirely** and were left
  alone rather than silently widened. Two of the three are a TANK and a HEALER raid read, which is
  the thinnest lane this project has. His Blood DK read in particular is emphatic (strongest and
  most popular tank of the season, "a tier of its own", more runs than several other tanks
  combined). **Scope widening is an owner call, not an agent one** — flagged here, not acted on.
- **Also deliberately not distilled:** Outlaw Rogue. "Subtlety, assassination, and hey, even
  outlaw rogue are all performing really well" is a bare enumeration, which the list-mention rule
  excludes. And Fire/Frost Mage: "inches them ahead of fire mages and frost mages" is a
  comparative about ARCANE, not a read on either of them.
- **Superseded 3, same lens only:** Dalaran's 2026-06-26 Arcane (both-lens, PTR-era) and his
  2026-08-17 Subtlety **raid**; Musguete's 2026-08-15 Assassination **both**. Two live takes were
  deliberately LEFT ALONE because superseding them would be the Kalamazi trap in reverse —
  Dalaran's 08-15 Assassination **both** take (my new one is `mplus`, a narrower lens, and
  retiring a both-take with it would silently drop his raid read) and Musguete's 08-04
  Assassination **mplus** take (my new one is `both`, and that direction is the documented
  over-supersede error). New Subtlety `mplus` take supersedes nothing — no live M+-lens take
  existed.
- **Verification pass done, 13 anchors** — every claim re-checked against its OWN transcript,
  whitespace-normalised because the ASR drops spaces at segment seams (a naive grep reported 5
  false misses: "improvedwarding", "cannot be matched" spanning a seam). All 13 present. No
  number moved off its referent; the one figure I chose not to carry is Musguete's "2 to 3% less
  DPS on Fate Bound", a hero-talent build comparison rather than a spec-strength claim.
- **Lane hygiene:** both ids removed from `videos[]` on distillation, and each asserted absent
  from `seen[]` and `skipped[]` first (the merge script throws rather than proceeding) — the
  precedence ladder holds. `seen` 549 and `skipped` 409 unchanged.
- **`latest` advanced** for Dalaran Gaming (5 class entries, one channel) and Musguete — each to a
  video THIS run distilled, with the out-of-scope reads named in Dalaran's line so the omission is
  visible from the registry.
- **NO BREADTH SWEEP, deliberately.** The unfiltered date-bound sweep is now affordable again in
  principle, and I did not run it: the 08-24 diagnosis names combined caption VOLUME from this
  egress IP as the likely trigger, and a ~140-video sweep on the first day the flag lifted is the
  exact shape that set it. The backlog stays UNSEEN and reconsiderable, as it has for three runs.
  **Recommend staging it** — a capped newest-first batch on a later run, never keyword-filtered as
  the limiter — rather than resuming at full width.


## 2026-08-25 (nightly) — 44 feeds, 0 errors; MadSkillzzTV's 9h33m week-one healer stream → 4 takes

- **Discovery:** 44 channels (41 class + 3 general), every one HTTP 200 on the FIRST attempt, 0
  feed errors, no backoff. Seen-set rebuilt from the four structured lanes (seen 549 + skipped 409
  + videos + take/metaNote youtu.be ids = **1,196**), never from log prose. 660 entries → **142
  unseen inside the cycle bound 2026-06-18** (derived with `Math.min` over ptr-builds dates, not
  an index), 0 unseen predating it.
- **Distilled `qG-So9pnRBQ`** (MadSkillzzTV, published 2026-08-22, 9h33m, Supadata verdict "ok")
  into **4 takes**, all inside his registered healer scope, all era-framed "Season 2 live":
  · **Holy Paladin — raid — mixed** (t=27600). "Paladin felt very strong"; repeating what he said
  in PTR testing, every ability visibly moves the healing bars in a way he says is not true of
  other healers; he reads that as unsustainable and guesses a 5–8% nerf off the heroic-week logs.
  **`mixed`, not `buff`** — the read points both ways, and mixed correctly abstains rather than
  asserting a direction he did not give.
  · **Holy Paladin — mplus — buff** and **Restoration Shaman — mplus — buff** (t=9720). He names
  those two as the pair "going to probably dominate" keys. Note the bracket: he contrasts
  "probably not in mythic" with "in raid it's all right", so "mythic" there means Mythic+, not
  Mythic raid.
  · **Holy Priest — both — buff** (t=33720). Asked point-blank whether Restoration Shaman or Holy
  Priest is better, he answers both are "doing quite well" and relatively easy.
- **Deliberately NOT distilled from the same stream**, and worth recording because a 9-hour VOD
  invites over-mining: the "this is really bad this season" passage at 162m — the chat question it
  answers never appears in the caption track, and pinning it on Preservation Evoker because he
  happens to be playing one is inference; and the tier-set comparisons at 481m, because "new set
  beats old set" is a gear claim, not a spec-strength read.
- **Superseded 3, same lens only:** his 08-09 Resto Shaman M+, 08-12 Holy Paladin M+, 08-15 Holy
  Priest both-bracket. His 08-04 Resto Shaman **raid** take is a different lens and stays live.
  The new Holy Paladin raid take supersedes nothing — he had no live raid take on it.
- **Lane hygiene:** `qG-So9pnRBQ` removed from `videos[]` on distillation and confirmed absent
  from `seen[]` and `skipped[]` (the precedence ladder — distilled beats both).
- **Queued 2** for the next drain, keyword-filtered as the nightly lane requires against the
  100-request monthly budget: `LoCCPjj7J6c` (Dalaran Gaming, "If You Aren't Playing These 5 Specs
  in Season 2…", inside his Druid/Hunter/Mage/Rogue/Shaman scope) and `igWiPoYPlV4` (Musguete,
  "Assassination Rogue is Broken! Season 2 Guide", inside his Assassination scope).
- **Nothing retired to `seen[]`** — no dismissal this run was durable. The other ~140 unseen are
  launch-week and RWF stream VODs, boss/dungeon/UI guides, spec how-tos and Supatease clip-shaped
  uploads whose `media:description` merely repeats the title; all stay unseen so the next run
  reconsiders them.
- **`latest` NOT advanced for MadSkillzzTV** — his entry is `managedBy: "overrides"` and
  `data/community-overrides.json` is owner-curated and off-limits to this agent (Gate 0 applies it
  before the boundary diff, so an agent edit reds the night). Flagged for Riley instead.
- yt-dlp not invoked (settled 2026-07-17 datacenter bot wall); nothing installed or upgraded.


## 2026-08-24 (local) — the 429 is DAY TWO and now DIAGNOSED; 1 of 2 queued videos drained through Riley's session, 3 takes

**Yesterday's "worth watching" happened.** The 08-23 local entry recorded the `timedtext` caption
429 and said that if it persisted across days the residential lane stops being a reliable catch-up
path. It persisted. Two consecutive local runs, two disjoint video sets, same failure — so this
should now be read as a standing transport condition, not throttling to be retried around.
Nothing distilled; no data file changed.

- **Attempted**: the two ids the nightly queued today — `3E_EY7ULmkw` (Dalaran Gaming, "Midnight
  Season 2 Patch Notes: Up To 350% Increases Dropping Next Reset!", 18m53s) and `qG-So9pnRBQ`
  (MadSkillzzTV, "12.1 Healer M+ & Raid | Holy Paladin & Preservation Evoker", a 9h33m `was_live`
  VOD). Both are in-scope specialists: MadSkillzzTV carries Holy Paladin and Preservation Evoker
  in `specs`, so that VOD is squarely on-lens for two healer specs.
- **Same caption-endpoint-specific shape as 08-23, re-derived rather than assumed.** `--list-subs`
  succeeded on **both** (each publishes `en-orig` + `en` in json3) and the info fetch resolved
  formats and metadata on every call — durations, `live_status` and channel names all read clean.
  Only the subtitle download 429s. Not the datacenter bot wall; that message never appeared.
- **Four caption requests, all 429.** `3E_EY7ULmkw` three times — with `player_client=android`,
  then WITHOUT it (the `MdvcFzV0tmI` precedent the gotcha names), then with `--retries 4
  --retry-sleep 25 --sleep-requests 3` as a paced ladder — and `qG-So9pnRBQ` once. The documented
  single retry was spent on the first video and failed, which is where the gotcha says to stop
  rather than deepen; the second video was probed only to establish that the block is
  ENDPOINT-wide rather than per-video, which it is.
- **yt-dlp is at the pin** (2026.07.04 == `requirements.txt`); nothing installed or upgraded. The
  SABR format-skip and "no impersonate target" warnings accompany every call and are not the cause.
- **Both stay in `videos[]` and were deliberately NOT retired.** A transport failure is a transport
  dismissal and stays UNSEEN; filing them in `seen[]` would silently abandon two in-scope videos,
  one of them the only healer-raid VOD in the queue. `pending-transcripts.json` is untouched —
  queue count 2 before, 2 after.
- **No discovery sweep**, same reasoning as 08-23: the nightly's ran ~3h earlier (44/44 feeds
  clean, 117 unseen inside the cycle bound) and there is no transcript path to act on the result.
- **OWNER DECISION SURFACING, not an agent call.** With the residential lane down two days running,
  Supadata's **100 requests per MONTH** is currently the only working transcript route — and the
  nightly spent 5 of them today (it distilled 4 videos: 14 takes + 14 metaNotes). If the 429
  persists, the planned unfiltered breadth sweep has no lane to run in, because breadth was
  affordable precisely because yt-dlp was free. Flagging for Riley rather than deciding it here:
  the options are to keep the nightly's keyword filter tight and accept narrower coverage, to
  raise the Supadata tier, or to leave the lane dormant until the 429 clears on its own.
- **SAME-DAY ADDENDUM — the cause is settled: an IP-scoped abuse flag on the timedtext service,
  diagnosed interactively with Riley present.** The elimination chain, so no future run re-runs it:
  the pinned yt-dlp 2026.07.04 with `--js-runtimes node` (challenge solving enabled, warning gone)
  still 429s; the LATEST yt-dlp (2026.08.19, scratch venv, repo pin untouched) with a working
  `curl_cffi` Chrome TLS impersonation target still 429s (note: fresh `curl_cffi` on Python 3.10
  needs `typing_extensions` installed or it import-fails and yt-dlp silently reports "no
  impersonate target"); an in-page browser `fetch` of the signed caption URL from youtube.com
  itself returns 429 with Google's "Sorry..." abuse page; and — decisive — the REAL YouTube player
  with CC on, sending fully-attested requests carrying a valid `pot=` (PO/BotGuard) token, gets
  429 and renders no captions. Nothing client-side can beat that; the flag is keyed on the IP, not
  the tool, and is scoped to timedtext only (watch pages, player API, `--list-subs`, streams and
  RSS all healthy). It hit Riley's other YouTube project the same day — shared egress IP, and the
  combined caption volume of the two projects is the likely trigger, with retries keeping it warm.
  Consequences for this lane: an upgraded/reconfigured client is NOT the fix and should not be
  attempted; the flag should decay after 24-72h of ZERO caption traffic from this IP (or
  immediately on an ISP IP rotation), so local runs should spend AT MOST one cheap probe —
  `--list-subs` is never rate-limited and proves nothing about timedtext, so the probe that
  matters is a single caption request on one queued id, stopped on the first 429 with no retry.
  Today's whole diagnosis cost ~6 well-spaced caption requests. Supadata is unaffected (their
  infra, not this IP), which the nightly's 5/5 drain already demonstrated.
- **EVENING ADDENDUM 2 — the flag exempts AUTHENTICATED traffic, and 1 of the 2 queued videos
  was drained through Riley's logged-in session (owner-approved).** Interactive testing settled
  the remaining questions and every finding is now codified in SKILL.md step 2's authenticated-
  fallback block (owner-approved 2026-08-24) — the durable facts live THERE; this is the run
  record. In brief: logged-in `timedtext` returns 200 from this IP while every anonymous client
  429s; `--cookies-from-browser chrome` is dead (App-Bound Encryption, yt-dlp issue 10927, pin
  and latest alike); a bare or borrowed-pot `baseUrl` fetch returns an EMPTY 200 (PO tokens are
  content-bound); and `get_transcript` is not a lane (anonymous 400 even with SAPISIDHASH; 400
  for YouTube's own UI on long was_live VODs).
- **Distilled `3E_EY7ULmkw`** (Dalaran Gaming, "Midnight Season 2 Patch Notes: Up To 350%
  Increases Dropping Next Reset!", 2026-08-22, 18m53s, 1,091 caption events) — fetched by
  replaying the player's own pot-bearing timedtext URL inside Riley's session, per the new
  fallback. His read of the announced Aug-25 tuning pass. **3 takes, all mplus-scoped**: Resto
  Druid `buff` (t=128; supersedes his own 08-18 mplus take, same creator+spec+lens across tuning
  passes), BM Hunter `buff` (t=247), Frost Mage `mixed` (t=301 — buffs walked, but 'maybe a
  little bit better, who knows really'). Every number in every claim re-verified against the
  transcript AND against the logged 08-22 build entry's own highlight lines before commit; all
  agree. **Not distilled, deliberately**: the Warlock deep-dive (his most substantive analysis —
  'I wonder if this will be enough to possibly bring affliction to the forefront of the overall
  meta') is OUTSIDE his registered scope (Druid/Hunter/Mage/Rogue/Shaman) — scope-widening
  evidence for a human, per the rules, not a take; he also calls Preservation 'my favorite
  healer', same disposition. Everything from t=676 on is the PvP section and triages out,
  including all the Rogue and Shaman material — so his two strongest registry classes yield
  nothing tonight, which is the PvP rule working, not a miss. Survival Hunter's '4%, not crazy,
  but it is a buff' was left unminted (filler-neutral territory). `latest` advanced on all five
  of his class entries; id removed from `videos[]` (the take urls are its record).
- **`qG-So9pnRBQ` (MadSkillzzTV, 9h33m was_live VOD) stays QUEUED** — it is exactly the
  no-browser-route case above (SABR in-band captions, get_transcript 400 on YouTube's own UI).
  The nightly's Supadata drain is its designed path; queue count 2 -> 1.


## 2026-08-24 (nightly) — 4 videos distilled: 14 takes + 14 metaNotes, the first distillation night in three

**Discovery:** 44 channels polled (41 class-lane + 3 general), **every one HTTP 200 on the first
attempt**, 0 feed errors, no backoff. Seen-set rebuilt from the four structured lanes (seen[] +
skipped[] + videos[] + take/metaNote urls = **1,191 ids**), never from log prose. 660 feed entries
-> **117 unseen inside the cycle bound 2026-06-18** (`Math.min` over ptr-builds.json, not an
index), 0 unseen predating it.

**Distilled** from the five pre-fetched transcripts (summary.json verdict "ok", 5/5 fetched):

- **leak, `9XtfT9ka2B0`** "Survival Hunter is DOOMED" -> a raid take and an M+ take, both `nerf`.
  His argument is a tier-set TIMING one and worth keeping straight: a now-fixed launch bug let
  Survival pull catalyst charges off the 2-piece, so the competitive Survival logs already run
  the S2 4-piece — meaning no week-two surge for it while the specs above it gain theirs *and*
  take buffs in the same pass. Third worst in raid, second worst in M+, on his read.
- **Obli, `R7kYD23sDQs`** -> Frost raid (`mixed`), Frost M+ (`buff`), Unholy M+ (`mixed`). He
  prices the August 25 package at ~7.3% and welcomes it while saying it does not move Frost in a
  raid tier he calls unfriendly to both DK specs; in keys he expects it to close the ~10% gap to
  Unholy. The Unholy take is the Blightful-over-Rider consistency argument. **The dungeon name in
  his log comparison was left out of the claim**: ASR renders it "Ultra Fangs", and writing a
  mangled name as a name is exactly what the rule forbids — the numbers stand without it.
- **YoDaTV, `1wxoNsiyCtM`** -> **nine** M+ takes, all inside his registered scope: Vengeance to
  A+ and frontrunner for tank damage on the 24% mastery line, Blood DK still the tankiest tank
  (he rejects the key-22 one-shot speculation outright), Guardian next after VDH on untapped
  apex-talent potential, Retribution up from B to A+ on its tier-set buff, Brewmaster and
  Protection Warrior and Protection Paladin left low, Arms and Holy Paladin held in the top
  group. **Everything outside his scope was left undistilled** — his rogue, shaman, Windwalker,
  mage, warlock, hunter, evoker, Mistweaver and Feral reads are substantive and none of them are
  his to carry here.
- **izen, `5m_K51fnwhc`** "FIRST Buffs & Nerfs of Season 2" -> **14 metaNotes**, era-framed
  "Season 2 live", never "Season 2 PTR". Reads it as a pass aimed at the bottom (Frost DK, Havoc,
  Survival, Affliction, Demonology), judges the three tank lines too small to matter, splits the
  Resto Druid and Preservation packages as better for M+ than raid, and flags the 30% Rain of
  Fire buff for an already-fine Destruction as the pass's curious one. His closing "why isn't
  Arms/Arcane/Elemental nerfed, why isn't Mistweaver buffed" passage was NOT distilled: he is
  voicing what players will ask, not stating a read.

**Skipped (durable):** **Kalamazi `xg5sxI6LspI`** "HUGE Warlock Buffs Announced!" — 4,741 chunks,
3h24m, and it is the unedited RWF-week **stream VOD of the same day** as `BdzA4HWaUSc`, whose
edited version was distilled on 08-22 into four live Kalamazi takes. Every Warlock read in it is
already carried and thinner here (Destro still his high-end M+ pick at t=5602, Rain of Fire the
biggest M+ change at t=5627, Demo the pug pick at t=813, a passing raid line at t=1760).
Distilling would duplicate one creator/spec/date/lens with a weaker source and force superseding
a richer take with a poorer one. Recorded so nobody re-opens it: **redundant, not off-topic.**

**Superseded 16 records, same lens only** — 12 takes (leak's 07-24 directional Survival read;
Obli's 08-20 Frost "both" and 08-06 Unholy M+; one per YoDaTV spec) and 4 izen **general-lens**
metaNotes (Frost DK 08-15, Havoc 08-06, Retribution 08-06, Affliction 07-09). His bracket-scoped
08-16 M+ and 08-17 raid sets are a different lens and stay live. leak's second 07-24 take is a
hero-tree mechanics note rather than a standing claim, and stays live.

**Retired 3 to seen[] as durable SCOPE dismissals only** — `czPW0XwrzhQ` (Dalaran Gaming, "5v5
1v1 Duels - PvP" in the title, and Havoc is outside his scope anyway), `Pq9NJVn-SQc` and
`sb7LNHsCD2Q` (Supatease, "PVP Tier List" and "New PVP Enchant"). Each is a fact about the video.

**Queued 2** for the next Supadata drain, keyword-filtered as the nightly lane requires against
the 100-request monthly budget: `qG-So9pnRBQ` (MadSkillzzTV, healer M+ and raid on Holy Paladin
and Preservation — the thin lane) and `3E_EY7ULmkw` (Dalaran Gaming, the August 25 patch notes).
Guide-shaped uploads were deliberately NOT queued even where the title tempts — Megasett's
"Mistweaver 12.1 Raid Guide", LBNinja7's Mistweaver raid guide, Musguete's "Assassination Rogue
is Broken! Season 2 Guide" (its description is explicit how-to-play) — because guide content
yields no take by the standing rule and the queue is drained by the paid API. Two Supatease
uploads ("THE NEW META IS COMING", "I Was Wrong About Warrior") were left UNSEEN rather than
queued or retired: both have a media:description that merely repeats the title, the clip shape,
and his last two verified transcripts were both PvP-framed. The other ~110 unseen stay unseen on
purpose, so the next run reconsiders every one of them.

**`latest` advanced** for Obli, leak, YoDaTV (6 class entries, one channel) and izen — each to a
video THIS run distilled. yt-dlp was not invoked at all: the settled 2026-07-17 datacenter bot
wall makes it useless from a runner, and nothing was installed or upgraded.


## 2026-08-23 (local) — the residential yt-dlp caption lane is 429-BLOCKED; 5 queued videos left queued, 0 distilled

**New transport finding, and it matters because draining the queue from a residential IP is the
main reason local runs exist: `timedtext` caption downloads now return HTTP 429 from home, while
the metadata/info endpoint is completely healthy.** Nothing distilled; no data file changed.

- **Attempted**: the five ids the nightly queued today — R7kYD23sDQs (Obli), 9XtfT9ka2B0 (leak),
  xg5sxI6LspI (Kalamazi), 5m_K51fnwhc (izen), 1wxoNsiyCtM (YoDaTV).
- **The failure is caption-endpoint-specific — not the bot wall, and not a missing track.**
  `--list-subs` succeeded for **all five** (each publishes `en-orig` + `en` in json3, and
  `--list-subs` is never rate-limited, which is what makes it the right probe), and the info
  fetch resolved formats on every call. Only the subtitle download 429s. This is NOT the
  2026-07-17 datacenter "Sign in to confirm you're not a bot" wall — that message never appeared.
- **The documented single retry was spent and failed.** Per the 2026-08-06 / 08-14 gotcha an
  isolated 429 alongside a successful info fetch is transient throttling, so `R7kYD23sDQs` was
  retried **without** `player_client=android` (the `MdvcFzV0tmI` precedent): still 429. A third
  attempt on `xg5sxI6LspI` after ~20 minutes of unrelated work as a natural cooldown: still 429.
  Three caption requests, all blocked — the "retries deepen" shape, so it was stopped there
  rather than deepened into a backoff ladder.
- **yt-dlp is at the pin** (2026.07.04 == `requirements.txt` `yt-dlp==2026.7.4`); nothing was
  installed or upgraded. Two warnings accompany every call and are NOT the cause: the
  android-client SABR format skip, and "no impersonate target is available".
- **The five stay in `videos[]` and were deliberately NOT retired.** A transport failure is a
  transport dismissal, which stays UNSEEN — filing them in `seen[]` would silently abandon five
  in-scope analysis videos. The nightly's Supadata drain picks them up on its next run.
- **No discovery sweep.** The nightly's ran 3h earlier (44/44 feeds clean, 105 unseen inside the
  cycle bound), so re-running it would only re-derive the same list with no transcript path to
  act on it.
- **Worth watching**: if this 429 persists across days, the residential lane stops being a
  reliable catch-up path and the 100-request/month Supadata budget becomes the only route —
  which would change how the next breadth sweep should be planned.


## 2026-08-23 (nightly) — 44 feeds clean, 0 distilled (the queue arrived empty), 5 queued, 3 retired

**Discovery complete: 44/44 channels HTTP 200 on the first attempt, 0 feed errors, no backoff
needed. 0 takes and 0 metaNotes — not a judgment call, there was nothing to read:
`transcript-fetch/summary.json` reports `requested: 0, fetched: 0, verdict "ok"`, because the
queue was already empty when the deterministic step ran.**

- **Seen-set rebuilt from the four structured lanes**, never from log prose: `seen[]` 543 +
  `skipped[]` 408 + `videos[]` 0 + every `youtu.be` id in a take or metaNote url (232 distinct)
  → **1,183 ids**. 660 feed entries across 44 channels; **105 unseen and inside the cycle bound
  2026-06-18** (the OLDEST date in ptr-builds.json, derived with `Math.min`, not an index — the
  file is newest-first and `builds[0]` is the 08-22 tuning entry). 0 unseen entries predate the
  bound.
- **`media:description` did the triage again, and settled one candidate in each direction.**
  · It SAVED `1wxoNsiyCtM` (YoDaTV, "A NEW Tank Meta on the Horizon? Patch Notes and Tierlist
    Update for 12.1 Mythic+!"), whose description is the bare-Twitch shape that usually reads
    as a restream. Checking the channel's own conventions settled it: YoDaTV titles raw VOD
    restreams **"yodatv on twitch"** with a bare `twitch.tv/yodatv` description, while edited
    uploads get a real title plus the "come watch me live" boilerplate — so the boilerplate is
    not evidence of a restream on THIS channel. Queued.
  · It CONFIRMED three PvP retirements outright (below).
- **QUEUED 5**, keyword-filtered as the nightly lane requires against the 100-request MONTHLY
  budget (`PER_RUN_CAP` 25 is only the per-run guard). All five are edited analysis uploads
  about the August 25 tuning pass or the week-one meta:
  · `R7kYD23sDQs` Obli — "Frost DK BUFFED! + What am I crafting?"; the description is itself a
    spec-strength read ("you're likely still going to play Unholy in keys due to its tankiness
    and range even if both specs did the same damage"). In scope: Obli is registered Frost +
    Unholy.
  · `9XtfT9ka2B0` leak — "Survival Hunter is DOOMED in Midnight Season 2."; description states
    the thesis ("a 4% aura buff is not nearly enough … no damage niche to excel at"). leak is
    registered Survival Hunter.
  · `xg5sxI6LspI` Kalamazi — "HUGE Warlock Buffs Announced!" (unscoped entry, and the four
    Maximum panels confirmed him as Warlock-wide).
  · `5m_K51fnwhc` izen — "FIRST Buffs & Nerfs of Season 2 | Weekly Reset Balance Tuning #1";
    per-spec impact framing, so this is the **metaNotes** lane, not `takes[]`.
  · `1wxoNsiyCtM` YoDaTV — see above; attribution will be limited to his registered Blood.
- **RETIRED 3 to `seen[]`, durable SCOPE dismissals only** — each self-identifies as PvP in the
  title AND description, which is a fact about the video rather than a budget cut:
  `nAVBL7mSGsQ` (Supatease, "12.1 PVP Tier List Update (Prediction Week 2)"), `wSlgCYK8Bxo`
  (Supatease, "New Elite PVP Weapons 12.1") and `qmEnXITZFUs` (Dalaran Gaming, "Paladins Are
  Still A Walking TERROR In Season 2! (5v5 1v1 Duels) - PvP WoW: Midnight 12.1").
- **The remaining ~97 stay UNSEEN on purpose.** They are overwhelmingly launch-week stream
  VODs and boss/dungeon guides — "M+ Farming", "[drops] Key Gearing Day", "HEROIC SPLITS",
  "rsham/hpal keys", "Venomous Abyss TIPS AND TRICKS", "Mistweaver Raid Guide", the Dratnos
  and Maximum RWF day-recaps — plus two ambiguous Supatease titles whose only description is
  the title repeated ("New Changes INCOMING", "CHANGES TODAY OR NOT"). Guide-shaped content
  yields no take under the standing rule, and a budget or shape dismissal must NOT be absorbed
  into `seen[]`, so next run reconsiders every one of them. One deliberate borderline pass:
  `3E_EY7ULmkw` (Dalaran Gaming, "Midnight Season 2 Patch Notes: Up To 350% Increases Dropping
  Next Reset!") is not PvP-titled and could carry a Druid read, but it is a notes read-through
  from a channel whose other output is duels — left unseen as the weakest of six candidates
  rather than spending the sixth request on it.
- **yt-dlp: one metadata probe, refused, backed off immediately.** `yt-dlp --skip-download
  --print` on `1wxoNsiyCtM` returned "Sign in to confirm you're not a bot" — the settled
  2026-07-17 datacenter bot wall, still in force, so the Supadata queue is the only path from a
  runner. No retry, no second video, nothing installed or upgraded (pinned 2026.07.04).
- No creator showed coverage outside their registered specs, so nothing is flagged for a scope
  widening. No supersession was needed because no take was added, and no `latest` was advanced
  — rule (c): it moves only to a video actually distilled.


## 2026-08-22 (LOCAL run, ~16:1x-16:4xZ — scheduled residential catch-up, ~5h after the nightly) — queue DRAINED 7 → 0: 7 takes, 14 metaNotes, 1 verified skip, 2 retired

**Every queued video resolved this run — nothing handed forward.** The nightly (11:20Z) had done
discovery and queued 5; two older ids it reported as Supadata `unavailable` turned out to have no
caption track at all, which is a durable fact and closes that loop rather than re-spending requests
on it every night.

- **TRANSCRIPTS (yt-dlp, residential, pinned 2026.07.04):** 5 of 7 returned auto-captions on the
  first pass, paced with `--sleep-requests 1.5`, **no 429 of either kind**. The two failures were
  probed with `--list-subs` (never rate-limited) and both answered *"has no automatic captions /
  has no subtitles"* — `POENnO-sGog` (Shadarek, Nemesis delve-boss kill) and `1LfW9JXNRsI`
  (Harrek, delve boss solo). No caption track of any kind is the durable shape SKILL.md names for
  `seen[]`, so both left `videos[]` for it. This also explains the nightly's Supadata
  `unavailable` on the same two ids: there is nothing upstream to fetch, and left queued they
  would have spent a request a night against a 100/month budget (the `bqVHzvKJCuA` precedent).
- **DISTILLED 4 videos → 7 takes + 14 metaNotes, every one superseding exactly one prior live
  record (7 and 14, 1:1, no over- or under-supersession):**
  - `sIu3Kjo8ggI` **Shadarek** → Havoc `buff` and Devourer `mixed`, both `both`. Havoc takes the
    flat 3% aura buff he says lands where he hoped; Devourer is the one DH spec the August 25 pass
    does not touch and his Void's Guard/Annihilator recommendation is unchanged.
  - `BdzA4HWaUSc` **Kalamazi** (filmed at the RWF venue) → Affliction raid `mixed`, Demonology
    raid + M+ `buff`, Destruction M+ `buff`. **No Destruction RAID take was written**: he says the
    pass changes little for Destruction in raid, which does not revise his 08-17 raid read, and
    inventing a `neutral` there would have retired a live take to record a non-change.
  - `y77i8M9dCSw` **NeekapHere** → Retribution `buff`, `both`. He is explicit it is *only a
    moderate* raid and M+ buff that puts Ret where you would normally expect to find it.
  - `OyIp5Ua0Qo4` **izen** → **14 M+ metaNotes** (week-one representation checked against his own
    pre-season predictions). Curated against the popularity-is-not-power rule: Beast Mastery and
    Demonology are logged `negative` precisely *because* he separates their high early
    representation from their power placement, and Windwalker/Outlaw `positive` because he defends
    them against low early numbers. **Dropped as list-mentions or single-data-point artifacts:**
    Retribution (its clause turns on an ASR token that could be "Ret" or "Wrath"), Assassination
    ("the highest key so far was done by one"), Brewmaster/Feral (membership in one comp),
    Preservation (bare tier placement), Frost/Unholy DK (a comp-conflict aside). **No raid
    metaNotes** — he says the raid picture is still under construction.
- **VERIFIED SKIP: `xHUTjrulyrA` (Supatease, "12.1 Class Tuning Did Your Spec Survive?")** →
  `skipped[]`. The nightly queued it deliberately to settle by transcript rather than by title, and
  the transcript settles it: the PvE half is note-reading with almost no evaluation, and every
  directional opinion is in the notes' PvP section, which he works through as a PvP player. Nothing
  falls in his registered scope either. Same answer as `kGsd9cMmBCc` the same day — two Supatease
  tuning videos, both PvP-lens, both settled by transcript and not by title.
- **VERIFICATION PASS (read-only, against each video's own captions) changed three claims before
  commit** — worth recording because all three are the ASR failure modes SKILL.md names:
  (a) Shadarek's *"I think with with it's going to be a lot more competitive now too"* has no
  recoverable referent, so the clause was dropped rather than guessed; (b) Kalamazi said "other
  **classes** get nerfed", not specs; (c) the Destruction M+ take's *"30% on 15% of your damage"*
  figure and its *"doubt this puts them in meta"* line both sit inside an unscripted exchange with
  people at the venue — **ASR gives no speakers**, so both were removed and the ceiling is now
  reported as left open rather than attributed to him. What survives rests only on first-person,
  self-anchored lines.
- **`latest` advanced for all four distilled creators** (Shadarek, Kalamazi, NeekapHere, izen) to
  what this run actually established, not to a bare title. `verifiedDate` deliberately NOT touched:
  across the registry it lags `latest`, so it means "entry/link last verified", and advancing it
  would have quietly redefined the field.
- **One test fixture fixed, and it is an era-vocabulary bug rather than a data problem.**
  `ui-invariants` *"a spec with takes but no writeup"* selected its fixture with
  `patchContext.includes("PTR")`. Demonology Warlock is the only writeup-less spec, and
  superseding Kalamazi's 08-17 PTR-era reads with correct **live-era** 08-22 ones emptied that
  filter — the fixture assumed a vocabulary the 2026-08-18 era-framing rule retired. Its assertion
  body already branches on `PHASES.ptr`; the selector now does too (PTR filter while a cycle is
  open, any live take between cycles). The invariant is unchanged and all 26 UI invariants pass
  under real Playwright.
- No creator showed coverage outside their registered specs, so nothing is flagged for widening.
  `pending-transcripts.json`: **videos 7 → 0**, skipped 407 → 408, seen 541 → 543.


## 2026-08-22 (nightly) — 1 transcript read → 0 takes (PvP), 5 queued, 44 channels clean

**Discovery clean; the one transcript available this run was a PvP stream, so it yielded nothing
and was retired to `skipped[]` rather than mined for a take.**

- **DISCOVERY: 44 unique channels polled** (41 class-lane + 3 general), every one HTTP 200 on the
  first attempt, **0 RSS failures**, no retries needed and no backoff spent. Seen-set rebuilt from
  the four structured lanes (`seen[]` + `skipped[]` + `videos[]` + every `youtu.be` id in a take or
  metaNote url) — never from log prose. **85 entries came back unseen and in-cycle** (bound =
  2026-06-18, the OLDEST date in ptr-builds.json, derived not indexed).
- **`media:description` parsed alongside every title**, and it did most of the triage again: the
  large majority of the 85 are launch-week stream VODs with bare-Twitch or streamlabs descriptions
  ("M+ spam", "HEROIC SPLITS", "keys + raid tonight", RWF day-N splits). Those carry no
  spec-strength read under the standing guide-shaped/key-run rules and were left **UNSEEN**, not
  retired — an unverified shape dismissal is exactly what `seen[]` must not absorb, and leaving
  them unseen is what keeps the next run's accounting auditable.
- **DISTILLED: nothing. `kGsd9cMmBCc` (Supatease, "DISCOVERING THE BEST CLASSES 12.1", 08-18) →
  `skipped[]`.** The deterministic step fetched it (5,413 chunks, ~172k chars; the other two queued
  ids came back `unavailable`). Read in full: it is a **PvP stream** — arena lobbies, Training
  Grounds, duels, DR talk — with 46 "PvP", 10 "arena", 4 "battleground" and 6 "rated" against 0
  "Mythic+"; its 3 "mythic plus" mentions are about mount/transmog rewards and PvP participation,
  and its 4 "tier list" mentions are his own PvP prediction list, a racial-tier-list joke and chat
  teasing him. Precisely the 2026-08-09 shape: a PvP creator answering "the best classes" is still
  a PvP read, and the title is no defence. **0 takes, 0 metaNotes, no `latest` advanced** — and no
  filler `neutral` minted to record that the video was watched.
- **QUEUED 5**, keyword-filtered as the nightly lane requires (Supadata free tier = 100 requests per
  MONTH; last night's summary read `ok`, so there is headroom, but the queue stays narrow):
  `sIu3Kjo8ggI` (Shadarek, "Havoc is BUFFED | August 25th Class Tuning", 08-22),
  `BdzA4HWaUSc` (Kalamazi, "MASSIVE Warlock Buffs Announced! What Do They Mean?", 08-22),
  `y77i8M9dCSw` (NeekapHere, "Retribution Paladin 4-Piece Is FINALLY Worth Using", 08-22),
  `OyIp5Ua0Qo4` (izen, "Season 2 Mythic+ Meta Picks | Week 1 Early Choices", 08-21 — the metaNotes
  lane), `xHUTjrulyrA` (Supatease, "12.1 Class Tuning Did Your Spec Survive?", 08-22 — queued to
  settle by transcript whether his tuning content is PvP-framed like `kGsd9cMmBCc`, rather than
  guessing from the title in either direction). All five are analysis videos about the August 25
  tuning pass or the week-1 M+ meta, i.e. the content most likely to carry a real read.
  `xg5sxI6LspI` (Kalamazi, "HUGE Warlock Buffs Announced!", same day, generic link-block
  description) was NOT queued as the probable clip/restream of `BdzA4HWaUSc`, and left unseen.
- **RETIRED 2 ids to `seen[]` as durable SCOPE dismissals only**: `vn9QRw-zkoo` (Dalaran Gaming,
  "WoW 12.1 Rogue PvP Guide - ALL 3 SPECS Starter Guide") and `6zjh3PbfBno` (same channel,
  "Assassination Rogues Are Back To DELETING People! (5v5 1v1 Duels) - PvP"). Both self-identify as
  PvP in title AND description, which is a fact about the video rather than a budget cut.
- **`POENnO-sGog` and `1LfW9JXNRsI` stay queued** (both `unavailable` from Supadata this run) — they
  are neither distilled nor transcript-verified, so removing them would lose the backlog.
- yt-dlp was NOT used and NOT installed or upgraded: this is a nightly runner behind the settled
  datacenter bot wall, so the queue is the only path. No creator showed coverage outside their
  registered specs (nothing was distilled), so no scope widening is flagged, and no supersession was
  needed because no take was added.


## 2026-08-21 (nightly CI, second run of the day)

**Discovery complete and clean; distillation impossible. 0 takes, 0 metaNotes, 0 `latest`
advanced. 3 videos queued, 6 ids retired to `seen[]`.**

`transcript-fetch/summary.json` reports verdict **"ok"** with requested 0 / fetched 0 — not a
credential problem: `data/pending-transcripts.json` `videos[]` was EMPTY when the deterministic
step ran, because the 11:00Z run drained to zero and the 2026-08-21 local run cleared the rest.
So the step had nothing to drain and this agent holds no transcript credentials. Everything
queued below is for the NEXT run's deterministic step.

**Discovery: 44 unique channels polled (41 class-lane + 3 general), every one HTTP 200 on the
first attempt, 0 feed errors, 660 entries.** Seen-set rebuilt from the four structured lanes
(`seen[]` + `skipped[]` + `videos[]` + every `youtu.be/<id>` in a take or metaNote url) — never
from this file's prose — and measured at **1,167 ids**. 72 entries came back unseen.

`media:description` was parsed alongside every title, and it did most of the triage. The unseen
72 are almost entirely launch-week **stream VODs**: bare-Twitch-link descriptions (Shindigg,
Critcake, Bansherz, Clandon, Sha, Megasett, Maximum, Tactyks), key-run and split POVs, and
`streamlabs.com` boilerplate. Those carry no spec-strength read by the standing rules
(key-run/guide-shaped precedent), and they were left **UNSEEN** rather than retired — an
unverified budget/shape dismissal is exactly what `seen[]` must not absorb.

**Queued (3), keyword-filtered as the nightly lane requires (Supadata is 100 requests/MONTH):**
- `kGsd9cMmBCc` Supatease, "DISCOVERING THE BEST CLASSES 12.1" (2026-08-18). Queued to SETTLE the
  standing question rather than guess it: he is registered as a class-change-roundup authority
  (scoped Shaman all / Affliction / Arms+Protection Warrior), but the 2026-08-09 precedent is that
  his "best classes" content keeps turning out PvP-framed. One transcript answers it durably,
  either as a take or as a `skipped[]` record.
- `POENnO-sGog` Shadarek, "Azta'rec Nemesis Delve Boss Kill | Havoc Demon Hunter" (2026-08-20) —
  in-scope specs (Havoc/Devourer), solo content that may carry a spec read.
- `1LfW9JXNRsI` Harrek, "Midnight Season Two Delve Boss: Azta'rek — Restoration Shaman Solo"
  (2026-08-19) — Wowhead's Resto Shaman guide author. NOTE for whoever distils it: his own
  description compares the BOSS to Nullaeus and the TWW bosses, which is a boss read, not a spec
  read. Do not mint a Resto Shaman take out of it unless the transcript carries a spec-specific
  comparative claim.

**Retired to `seen[]` (6) — durable SCOPE dismissals only:** five explicitly PvP videos, out of
scope for a PvE tracker by their own titles and descriptions — Supatease `Ln9u8uDpP7E` "PVP Data
Analysis Week 1 Season 2", `BKpNGRtiDpc` "Honest Thoughts on PVP 12.1", `KeiluPpDWCQ` "This Is
Why PVE'rs Hate PVP", `DrleLy1u2dI` "World PVP Still Fun in 2026?", and Dalaran Gaming
`jzNfwI-tr_g` "5V5 1V1 DUELS IN MIDNIGHT" — plus MadSkillzzTV `ELRklBVajH4` "12.1 Best M+
Addon?", whose description states it is an EXBoss **addon** preview, i.e. content that cannot
contain a spec-strength read.

Supatease's four remaining ambiguous titles (`-NmzE6Pnqfo`, `QmTbOMRFJjQ`, `M0K2d-jzFas`,
`-0UpYyH_L58`, plus `RA9ysZxxRuE`) were left UNSEEN on purpose: spending a second and third
Supadata request on the same open question before the first one answers it is the wrong order.
Re-evaluate them once `kGsd9cMmBCc` comes back.

**yt-dlp was NOT usable and was not hammered.** One metadata probe (`--skip-download --print`, no
subtitle flags) on `ELRklBVajH4` returned the datacenter bot wall — "Sign in to confirm you're not
a bot" — which is the settled 2026-07-17 finding; the run stopped there rather than retrying. The
practical cost is that live_status and duration could not be read, so no Short or in-progress
stream could be retired on a measured fact tonight.

No creator demonstrated coverage outside their registered `specs`, so nothing is flagged for a
scope widening. No supersession was needed (no take was added).


## 2026-08-21 (SKILL.md step 4a — the operational half of the one-record rule)

**The check landed without the instruction that keeps a run from tripping it.** `0acbfae`
documented the precedence ladder and enforced it, but never said what to DO at the moment of
action. Added as step **4a**, deliberately parallel to step 4's "do this EVERY time you add a
take, it is not optional" — because it is the same kind of mandatory bookkeeping attached to
the same event.

- **The rule:** distilling a video makes its take/metaNote url that video's record, so if the
  id is still in `seen[]`, `skipped[]` or `videos[]`, remove it from that lane in the SAME
  edit. Placed at step 4a rather than in the lane description at step 2, because step 2 is read
  when you are deciding where something goes and step 4 is read when you are writing a take —
  and this fires on the write.
- **Why it needed saying:** five of the seven collisions the check found got there by exactly
  this route — considered at discovery, filed in `seen[]`, later distilled, never removed.
  The nightly dispatched to confirm the check (run 32512032066, green) did NOT exercise it:
  the agent queued 3 videos and added 6 ids to `seen[]` but distilled nothing, so the promotion
  path never ran. The check was proven not to break a night; it was not proven to catch a live
  agent's mistake. This guidance is what stops the first agent that takes that path from
  discovering the rule via a red run.
- **The asymmetry is spelled out** because it decides whether you can just delete: dropping
  from `seen[]` is lossless (bare id list), dropping from `skipped[]` destroys a `reason`, so
  the finding gets restated in this log first — the `aqe2LKeMIqQ` precedent.
- **Also covers the re-open direction**: a `skipped[]` video that yields a take on re-open
  loses its skip entry, because "nothing to distil" stops being true of it. That is what the
  Musguete re-open did for five ids, and it is now written down rather than inferred.

**Corrected a number I got wrong, in the same pass.** `okaZqAQVRN0` carries **39** live
metaNotes, not 40 — a miscount off a terminal listing that I propagated into the `0acbfae`
commit message, this log, and two places in SKILL.md. Verified against the data (39 then, 39
now); SKILL.md and the log line are fixed, the commit message stands because history is not
rewritten. The `x0fxEWTq3Pw` figure of 24 was checked at the same time and is correct.
The `1167 → 1167` seen-set measurement is now labelled as what it is — a reading taken across
the fix, not a constant. It is 1176 after tonight's nightly, and it grows with the roster.


## 2026-08-21 (cross-lane collisions — SEVEN, not two; validation gap closed)

**The two I reported were a sample, not the set.** Measuring every lane pair before writing
any fix turned up **seven** ids carrying two records at once, and `npm run validate` reported
clean on all of them. Data fixed, and the gap between what SKILL.md promised and what
validate.mjs did is closed.

- **What was actually enforced:** `videos[]`∩`seen[]` and `videos[]`∩`skipped[]`. That is all.
  The SKILL.md sentence "refuses to let an id sit in both lanes" sat in the `skipped[]`
  paragraph and read as covering every pair — it never did. Unenforced: `skipped[]`∩`seen[]`,
  and distilled∩anything.
- **The seven:**
  - `6MlSd4nBtrI` (Dratnos) — `skipped[]` + `seen[]`.
  - `aqe2LKeMIqQ` (Tettles) — distilled + `skipped[]`.
  - `HP3H1aDcQCo`, `Li67ghcCJo4`, `jlbQAmQMRCM`, `okaZqAQVRN0`, `x0fxEWTq3Pw` — distilled +
    `seen[]`, **all five previously unknown**. These are not marginal: `okaZqAQVRN0` carries
    **39 live izen metaNotes** and `x0fxEWTq3Pw` carries 24 from Zorthas. (Corrected
    2026-08-21: the 0acbfae commit message and this line both said 40 — a miscount off a
    terminal listing. The count was 39 then and is 39 now; the commit message stands as
    written since history is not rewritten.)
- **The rule, which the code now enforces:** the lanes are a PRECEDENCE LADDER, not tags —
  distilled (cited by its take/metaNote url) > `skipped[]` > `seen[]`, with `videos[]` meaning
  "still waiting" and overlapping none. An examined video carries exactly ONE record. This was
  always the stated intent — the `seen[]` comment in validate.mjs already spelled the ladder
  out ("everything else belongs here") — it just was not checked.
- **Six of seven were lossless.** `seen[]` is a bare id list, so dropping a redundant entry
  discards no information. **Verified the seen-set union is byte-identical: 1167 → 1167, zero
  ids stopped being examined.** This is deduplication, not forgetting — which matters, because
  the whole point of the union is that anything outside it is genuinely unexamined.
- **The seventh lost prose, so it is preserved here.** `aqe2LKeMIqQ` (Tettles, "Stream VOD")
  left `skipped[]`, and its reason read: *"Livestream VOD whose only spec reads are one-line
  replies to chat — no sustained analysis to distil. Transcript verified 2026-07-30 (local
  run)."* The video IS distilled — a Balance Druid take at `t=10036`, ~2.8 hours in — so
  `skipped[]` ("nothing to distil") contradicted it. The take url is now its only record.
  **The 07-30 finding still stands and is why this VOD should not be re-mined**: one take was
  taken from it and the remainder is chat replies.
- **The error message names the fix**, because a collision otherwise leaves you guessing which
  lane is authoritative: it prints "Keep <lane>, drop <lane>" derived from the ladder.
- **The test was mutation-checked**, not just run: neutering the four `collide()` calls makes it
  red (`not ok 19`), restoring them makes it green. It also asserts the committed file is clean,
  so it reds if the lanes drift apart again. `src/validate.mjs` is CODEOWNERS-owned
  (`@riles22`), so this is a reviewed code edit and its own commit.

