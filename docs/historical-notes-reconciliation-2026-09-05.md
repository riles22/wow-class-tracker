# Historical official-note reconciliation — September 5, 2026

The 59 post-launch PvE class sections previously marked as an unreviewed historical baseline have now been compared with the existing feed. All material tuning and bug fixes in those sections are already represented: 28 sections have direct hotfix coverage, 23 have scheduled-announcement coverage, and eight combine the two. This includes all 16 sections mentioning set bonuses. Replaying those announcements into the feed would duplicate changes already used by the tracker.

A separate check of current item tooltips found **four current tier-set descriptions that need correction**, plus one attribution note and three archived-commentary caveats. These findings do not create new tuning announcements: September 5 is the verification date, not an inferred effective date.

The read-only review proposed the changes below. The main writer subsequently applied the four current descriptions, Demonology provenance clarification, archived commentary caveats, and all59 ledger reason clarifications. No tuning feed entry, source effective date, disposition, consensus letter, or frozen forecast was changed.

## Evidence and scope

The [official running hotfix compilation](https://us.forums.blizzard.com/en/wow/t/world-of-warcraft-midnight-hotfixes-september-4/2336376/1) was freshly retrieved through ordinary public Discourse JSON on **2026-09-05 at 19:36:55 UTC**, HTTP 200. Topic 2336376, post 1, version 31, last edited **2026-09-05T01:21:46.173Z**; cooked-body SHA-256 `443e3bd1e9d278a5993dd634c88b4587fc65b66d1c7b439437a967ae6d058635`. That body exactly matched the existing isolated evidence receipt, whose preserved headings and nested lists were used for the section-by-section comparison.

The three relevant scheduled announcements were also freshly retrieved at **19:40:08 UTC**, all HTTP 200:

| Existing feed date | Effective date | Official source | Current revision |
| --- | --- | --- | --- |
| 2026-08-15 | 2026-08-18 | [Topic 2336820](https://us.forums.blizzard.com/en/wow/t/class-tuning-incoming-august-18/2336820), post 1 | v5; edited August 18 |
| 2026-08-22 | 2026-08-25 | [Topic 2339812](https://us.forums.blizzard.com/en/wow/t/class-tuning-incoming-august-25/2339812), post 1 | v2; edited August 24 |
| 2026-08-28 | 2026-09-01 | [Topic 2342331](https://us.forums.blizzard.com/en/wow/t/class-tuning-incoming-september-1/2342331), post 1 | v4; edited August 31 |

The current-bonus check fetched one ordinary Wowhead item-tooltip response per relevant class: 12 items covering the 14 distinct specs in the priority sections, all HTTP 200 around **19:42:17 UTC**. The three items underlying corrections were fetched again at **19:46:53 UTC**, with identical response hashes. Item IDs came from the project's existing verified tier-item inventory. These are **Wowhead database tooltips**, not Blizzard prose or measured in-game behavior.

The review covers the 59 `Classes` sections dated August 18–September 3. It does not relabel the 29 historical PvP sections or nine pre-launch sections, and it does not alter the two already-applied September 4 sections. The isolated 12.1.5 preview remains outside this work.

## Exact current-bonus corrections

For the following four specs, update `tierSet.asOf` to `2026-09-05` as a verification date and cite the linked current item. Preserve unrelated fields and the existing dated bug-fix amendments. Do not append a feed highlight claiming these were newly announced changes.

1. **Affliction Warlock:** move the Seed of Corruption clause from 2pc to 4pc and include the tooltip's Wither alternative in 2pc. Proposed `set2`: “Agony deals 15% more damage, and Corruption or its Wither replacement deals 25% more damage.” Proposed `set4`: “Each active Unstable Affliction increases spell and ability damage by 2%, up to 6%. Seed of Corruption also applies Unstable Affliction to its target at 20% effectiveness. (2026-08-20 hotfix: corrected the set-granted Unstable Affliction failing to grant a Wither stack.)” The current item associates these with spells **1296568 (2pc)** and **1296569 (4pc)**. [Warlock item 271546](https://www.wowhead.com/item=271546), [retrieved tooltip](https://nether.wowhead.com/tooltip/item/271546?locale=0).

2. **Restoration Druid:** remove the Nature's Swiftness guarantee from `set2`; it is already correctly present in `set4`. Proposed `set2`: “Rejuvenation has a 15% chance to grant Genesis. Genesis increases healing from all your heal over time effects by 15% for 8 seconds, and multiple applications can overlap.” Keep the existing 4pc wording and eight-second extension. The tooltip associates Rejuvenation with **1296609 (2pc)** and Nature's Swiftness/Tranquility/Incarnation or Convoke with **1296610 (4pc)**. [Druid item 271528](https://www.wowhead.com/item=271528), [retrieved tooltip](https://nether.wowhead.com/tooltip/item/271528?locale=0).

3. **Arcane Mage:** change the 4pc cap from 40% to **24%** and remove the outdated parenthetical saying the cap was carried forward because the tuning notes did not restate it. Proposed `set4`: “Each Arcane Missiles wave increases the damage of your next Arcane Blast, Arcane Pulse, or Prismatic Bolt by 3%, up to 24%.” The tooltip explicitly states both values under **1296582 (4pc)**; the cap is not calculated from an assumed stack count. The existing 2pc extra missile and 5% damage bonus are correct. [Mage item 271564](https://www.wowhead.com/item=271564), [retrieved tooltip](https://nether.wowhead.com/tooltip/item/271564?locale=0).

4. **Fire Mage:** change only the 4pc Pyroclasm damage bonus from 20% to **25%**; the cast-time reduction remains **20%**. Proposed `set4`: “Pyroclasm reduces Flamestrike and Pyroblast cast time by 20%, and its damage bonus increases by 25%.” These are the separate values printed under **1296584 (4pc)**. Keep the existing 2pc text and August 31 Hot Streak bug-fix amendment. [Mage item 271564](https://www.wowhead.com/item=271564), [retrieved tooltip](https://nether.wowhead.com/tooltip/item/271564?locale=0).

## Demonology: keep the effect in 4pc, clarify the evidence

Both the fresh [August 18 announcement](https://us.forums.blizzard.com/en/wow/t/class-tuning-incoming-august-18/2336820) and the [running compilation](https://us.forums.blizzard.com/en/wow/t/world-of-warcraft-midnight-hotfixes-september-4/2336376/1) still label the automatic Implode change as a 2-set change. The current [Warlock item tooltip](https://nether.wowhead.com/tooltip/item/271546?locale=0) instead explicitly associates **1296573 (2pc)** with Wild Imp damage +10% and Implosion damage +20%, and **1296574 (4pc)** with the energy-depletion proc: 20% chance, 350% main-target effectiveness, 315% other-target effectiveness.

The stored slot placement and current values are therefore corroborated by the current tooltip. Retain them. Replace the long unresolved-placement aside with: “(Verified 2026-09-05 against the current item tooltip, which assigns this effect to the 4-piece bonus. Blizzard's August 18 tuning prose labels the same effect as 2-piece.)” Keep the older July tooltip-correction history in the feed rather than repeating it in the current bonus paragraph. Set `asOf` to the verification date and source to [item 271546](https://www.wowhead.com/item=271546). This resolves which description the current database assigns to each slot; it does not claim Blizzard corrected its prose or establish an unobserved game change.

## The 16 set-related sections

Dates in the second column identify existing entries in `data/ptr-builds.json`. An arrow connects announcement date to effective date; those earlier stored dates are legitimate and should remain unchanged unless the bonus is independently reverified above. “Correct” describes the represented incremental change, not a blanket certification of every historical sentence.

| Official section | Existing coverage | Set reconciliation |
| --- | --- | --- |
| September 3 — Priest | September 3 hotfix | Holy 2pc Renew/Renewed Vigor fix and dated amendment already stored. |
| September 1 — Monk | August 28 → September 1 | Mistweaver activation chance 25%, replacing 20%, already stored. |
| August 31 — Mage | August 31 hotfix | Fire 2pc Hot Streak fix already stored; separate current 4pc value correction above. |
| August 26 — Demon Hunter | August 26 hotfix | Devourer Soulburst display fix and amendment already stored. |
| August 25 — Druid | August 22 → August 25 | Restoration Genesis extension of eight seconds already stored; separate 2pc duplication correction above. |
| August 25 — Paladin | August 22 → August 25 | Retribution Divine Arbiter increases already stored. |
| August 20 — Warlock | August 20 hotfix | Affliction set-granted Unstable Affliction/Wither fix already stored; separate slot correction above. |
| August 18 — Death Knight | August 15 → August 18; August 18 hotfix | Frost per-stack attack speed 1% and Icy Death Torrent 2% match current tooltip; other Blood changes covered. |
| August 18 — Demon Hunter | August 15 → August 18 | Devourer two fragments and Reap 10% match current tooltip. |
| August 18 — Hunter | August 15 → August 18 | Beast Mastery 30% cleave/20% primary-target Cobra Shot values match current tooltip. Pet-size change is cosmetic. |
| August 18 — Mage | August 15 → August 18 | Arcane Missiles 5% and per-wave 3% already stored; current cap correction above. |
| August 18 — Monk | August 15 → August 18 | Earlier relative activation increase already logged; later August 28 absolute 25% value supersedes it. |
| August 18 — Rogue | August 15 → August 18; August 18 hotfix | Subtlety 60% effect matches current tooltip; separate Shadow Dance/Lingering Darkness fixes covered. |
| August 18 — Shaman | August 18 hotfix; August 15 → August 18 | Elemental Overcharge consumption fix/amendment and Enhancement tuning already stored. |
| August 18 — Warlock | August 15 → August 18; August 18 hotfix | Demonology 350%/315% already stored; slot evidence clarified above. Other class/spec fixes covered. |
| August 18 — Warrior | August 15 → August 18; August 18 hotfix | Fury Bloodthirst 10%, Recklessness 3% up to 6% match current tooltip; Protection fix covered. |

Five of these set changes were logged directly as hotfixes; eleven also involve already-recorded scheduled announcements. Current tooltip wording does not print Mistweaver's proc chance, so the later explicit official 25% value remains the source for that amendment.

## All 59 review receipts

The ignored preparation file `official-notes/historical-reviewed-reasons.json` contains **59 rows**, each with its exact ledger section ID and SHA-256, prior disposition/reason, proposed replacement reason, and matching existing build date/kind/topic/highlight indexes and text. Apply **only `row.reason` to the corresponding `resolution.reason` after verifying the ID/hash and prior reason still match**. Preserve the `irrelevant` disposition: its revised explanation means “already represented; do not apply twice,” not “these PvE changes are unimportant.” Evidence arrays are review material, not new canonical `references` or feed entries. No validator relaxation for cross-date scheduled references is needed.

| Source date | Sections reviewed | Existing entries used |
| --- | ---: | --- |
| September 3 | 2 | September 3 hotfix |
| September 2 | 3 | September 2 hotfix |
| September 1 | 10 | August 28 announcement and September 1 hotfix |
| August 31 | 6 | August 31 hotfix |
| August 26 | 5 | August 26 hotfix |
| August 25 | 10 | August 22 announcement and August 25 hotfix |
| August 20 | 6 | August 20 hotfix |
| August 19 | 5 | August 19 hotfix |
| August 18 | 12 | August 15 announcement and August 18 hotfix |

The remaining 43 sections include the nested hero-talent notes, class-wide notes, and new same-day fixes alongside scheduled tuning. No material omission was found. In particular, Warlock's August 18 and August 20 Hellcaller fixes remain class-scoped rather than being arbitrarily assigned to one spec. Hunters' cosmetic Hydra pet-size reduction is an explicit exclusion. PvP-only sections remain outside this PvE reconciliation.

## Archived commentary caveats

Preserve the attributed older commentary and append dated context rather than rewriting its verdict:

- **Devourer `ptr.set4`:** append “(Historical pre-August-18 values: the live set now generates 2 Soul Fragments and increases Reap damage by 10%; the quoted evaluation concerns the earlier design.)”
- **Arcane `ptr.set2`:** append “(Historical pre-August-18 value: the live Arcane Missiles damage bonus is 5%.)”
- **Arcane `ptr.set4`:** append “(Historical pre-August-18 values: the current tooltip, verified 2026-09-05, gives 3% per wave up to 24%.)”
- **Beast Mastery `ptr.set4`:** retain the existing older caveat and append “(Further updated for August 18: live values are 30% Beast Cleave effectiveness or 20% additional primary-target damage per stack.)”

These are three affected archived writeups, with four text fields. Keep their source, sentiment, verdict, forecast inputs, and frozen outputs intact.

## Receipt hashes and integration checks

The three rechecked current-item response SHA-256 values are:

- Druid 271528: `1222c6aa7a3f009d1461949d51baab27f31862d9386b2952ea7bb8b34b0363ea`
- Mage 271564: `e4321969eae363209ec532080958fcae7c76fcc1e927363688cbdbf95c1a7792`
- Warlock 271546: `7b2623798f2f50bb119f8a5915f91f13b2f333ceedae6be6faba9ff7a2df42b4`

After the main writer applies approved changes, regenerate gearing's derived specs and artifact, run the normal validation/unit suite and build, and verify no change to consensus or frozen forecasts. The historical-reason edit alone must change no ledger identity, inventory, hash, source check time, or disposition; the tier-set correction must reach both published pages. This report and preparation JSON were checked for the expected 59 unique section IDs, unchanged source hashes, and 16 set-related rows; no full build was run by this read-only canonical-data review.
