# Gearing source reconciliation — 2026-09-30

Prepared locally against `601e034de0382d14d2b0bd4b6e9345d8aa95a33b`. This review does not publish, merge, deploy, or dispatch a workflow.

## Evidence and result

The September 24 workflow artifact contained 329 raw source receipts. Every stored SHA-256 matched its response body, all 80 tier bonuses re-parsed exactly, and every staged item scope matched the existing canonical dataset. Its raid and dungeon logs identify failed guide retrievals; its tier log identifies an unavailable class-set page. These were collection failures, not demonstrated parser defects.

Ordinary Wowhead access succeeded on September 30. The existing verifier collected 732 raw receipts, all independently hash-checked. Its unchanged membership, ownership, completeness and parsing gates admitted 101 raid drops, 205 dungeon items across all eight dungeons, and 65 tier items across all 13 classes. Five current item tooltips differ in their effects; no other parsed fields differ. No parser or validation threshold was changed.

## Reviewed item changes

| Item | Before | After |
| --- | --- | --- |
| Preternatural Antivenom (270171) | Healing cap 184,090 | Healing cap 322,156 |
| Font of Venomous Rage (270168) | Target damage 1,088,387; splash 191,540 | Target damage 1,360,484; splash 239,425 |
| Unstable Felheart Crystal (250255) | Absorb 536,392; cooldown 2 minutes | Absorb 847,500; cooldown 90 seconds |
| Mycolic Medicine (250248) | Initial heal 70,124; mushroom heal 40,071 | Initial heal 110,797; mushroom heal 63,312 |
| Seed of Radiant Hope (250254) | Periodic expression [25,785 × 8]; burst 232,091; cooldown 90 seconds | Periodic expression [36,098 × 8]; burst 324,927; cooldown 60 seconds |

Values are retained from each item's own tooltip at its existing stored item level; this does not infer a ranking or compare unlike item levels. The Seed expression remains unevaluated in the data. Four healing-trinket changes match [Blizzard's September 22 tuning announcement](https://us.forums.blizzard.com/en/wow/t/midnight-season-2-trinket-tuning-september-22/2349649). Font's values are directly verified against its current tooltip; this review does not attribute them to that announcement or invent a tuning date. Proc rates absent from tooltips are not filled from the announcement.

Only those five item records are replaced, including their matching raw tooltip HTML. Their original dataset harvest dates remain unchanged. The two allocation fingerprints for 270168 and 270171 receive the same effect corrections; all 316 allocation distributions, each with a 7,000-point budget, are identical. The allocation harvester initially refused those two changed fingerprints, as designed; the reviewed proposal was compared field-by-field before local promotion. No acceptance override was supplied to unattended collection.

Exact source-response identities:

| Item | Tooltip URL | SHA-256 |
| --- | --- | --- |
| 270171 | https://nether.wowhead.com/tooltip/item/270171?locale=0 | `802bd5778cd2272cba0d061c19e7e4951db14c3f08213c1d9a4ce1c400c4666f` |
| 270168 | https://nether.wowhead.com/tooltip/item/270168?locale=0 | `d15cc8850dd1fc868ff98c0baaf938ffee7ae234ab4e5ea89fdc31662980f467` |
| 250255 | https://nether.wowhead.com/tooltip/item/250255?locale=0 | `48936ce8b1f1d0194db0a6811a9c12d1a8000afe07fb33809c626bca09723117` |
| 250248 | https://nether.wowhead.com/tooltip/item/250248?locale=0 | `0ba0adace2248590602a6df5d055f7ea05a4146d0aa7307312b46e59a1bc0bab` |
| 250254 | https://nether.wowhead.com/tooltip/item/250254?locale=0 | `cc85d5470419b2f935f7304ce8fd17f65a01e769b5fe75f52657644ead641cc9` |

## Tier and Catalyst review binding

All 80 freshly collected bonuses produce the same source digest as the September 6 reviewed baseline: `579bf9bac02759808af7a84d530db7dfc2fae8b4d2146f90409d1b6bbb68f85c`.

The prior tracker input digest `ed39ec19eafb5953d373231ceceffa088bc57b18947bc8b70da3de194094926d` is reproduced exactly from the roster in commit `7a6cea35578d792df8ab36affa3896372a2f282b`. Comparing it with the current digest `c1d35c125d559e732c59ca528941e4aab282a17c66df4dc2969c967aa7eed085` identifies only four changed tier-set records:

- Protection Paladin: September 15 Consecration first-tick behavior-fix annotation
- Holy Priest: September 15 Renewed Vigor three-stack cap annotation
- Arms Warrior: September 9 Winding Up Cooldown Manager annotation
- Protection Warrior: September 9 Vengeful Shield Cooldown Manager annotation

Each prior printed bonus is retained verbatim as a prefix, and the existing official-note ledger records the corresponding applied source sections. The accompanying source links and `asOf` values are retained. No tracker bonus or numerical coefficient is changed by this preparation.

The Catalyst guide, currency 3465 and achievement 62872 were all fetched and parsed successfully. Together they reproduce the reviewed digest `6472ac55d7159f4b0e5fc2bc85d5e80fb50b79077ff1cc1697c5e2eb5315b71c`. The existing `--accept-reviewed` command was used only after that complete review; its requirement for both complete groups is unchanged. The Demonology official-note conflict, dated Retribution coefficients and preview-dependent socket caveat remain intact.

## Boundaries

- The owner-supplied August 18 reward chart is unchanged. Venomstone stays visibly labeled as a pre-launch estimate, and reward ladders remain a separate manual review
- Icy Veins ordinary access returned HTTP 403; its September 22 dataset and dates remain unchanged
- Method was already verified September 29 and is unchanged
- No tracker metrics, ratings, manifest, history, forecast, S1 archive, retired PTR data, source thresholds, workflow, account, permission or security setting is changed
- Generated HTML is rebuilt through the repository's own commands, never hand-edited

Final post-change collection, guide-refresh results and validation are recorded in the accompanying review package.

## Scoped dataset hashes

SHA-256 of JSON-serialized `itemScope`, excluding original harvest dates, raw tooltip HTML and reward-level tables:

| Dataset | Before | Prepared after |
| --- | --- | --- |
| raid-items.json | `a35a278c022f9151d3a280cd713d2ec00392326435b45fdc64d3128ad64db503` | `7713ffce7f7bb83a63e094ece30959ae3c3acef79627239072a0995b24d5c3e9` |
| dungeon-items.json | `30371b1f5625bc85f49b5ff1d44a1ea5e38f12a8fac95e70f8d63537118c76bd` | `b48c04b907776b11e63967dfb8fddd1427b562098ac4c1af4bc41b8360a55041` |
| tier-items.json | `97646fbc85fd17a1dc72a10fb6d969ac4a9b19c61655000267fb8eed6db6846f` | `97646fbc85fd17a1dc72a10fb6d969ac4a9b19c61655000267fb8eed6db6846f` |
| catalyst-stat-allocations.json | `ef8e10352b15d7329db3c6594095207fc6b1231a4747cb06f122f28f74c42ef6` | `e43dd981c36b6da0022ab2ed17ecec910d6c973e04bcd7c69916cbeff64d3040` |

## Wowhead guide recovery

The unchanged guide harvester completed all 40 specs with zero verified absences and no retrieval failures. Its full-roster date advances from September 22 to September 30. Admission still finds 83 priorities and 627 BiS rows, with no coverage loss. Every record carries an actual September 30 verification; publication dates remain author-controlled.

Three content changes were retained from the source:

- [Restoration Druid](https://www.wowhead.com/guide/classes/druid/restoration/bis-gear): one recommended ring changes from Alluring Bubbleband to crafted Masterwork Sin'dorei Band
- [Devastation Evoker](https://www.wowhead.com/guide/classes/evoker/devastation/enchants-gems-pve-dps): ring enchant changes from Nature's Fury to Eyes of the Eagle
- [Holy Priest](https://www.wowhead.com/guide/classes/priest/holy/stat-priority-pve-healer): one Oracle priority note changes its comfortable Haste reference from approximately 20% to approximately 30%; the parsed secondary-stat order is unchanged

Four actual author dates advance: Restoration Druid September 8 → September 22; Arcane Mage August 18 → September 26; Holy Paladin August 25 → September 24; Assassination Rogue September 6 → September 24. Other publisher dates remain untouched.

## Final verification

A new complete collection after the reviewed promotion, observed from `2026-09-30T04:59:12.883Z`, validates all six automated groups: tier bonuses, Catalyst rules, raid, dungeons, tier items and allocations. All 732 raw response hashes were checked again. The compact report is bound to the current reviewed baseline and scoped datasets; it was copied only after `currentVerification()` retained six verified groups. Reward ladders still report `manual-review`.

Validation on the repository's CI-major runtime, Node 22.23.3:

- `npm run test:quiet`: 696 total, 632 passed, 0 failed, 64 skipped
- `npm run gearing:test`: 79 total, 73 passed, 0 failed, 6 skipped
- `npm run gearing:build`, `npm run build`, `npm run validate`, guide admission and spec-sync `--check`: passed
- Generated gearing copies are byte-identical; offline fetch-declaration checks and `git diff --check` pass

The 64 full-suite skips are 63 browser assertions and the existing freeze-season skip. Browser assertions were attempted separately, but Chromium cannot launch because this execution environment rejects its local process socket. The supported cloud browser also rejects the local preview URL. Browser behavior is therefore **not verified for this preparation**; no browser requirement or assertion was changed. The initial host Node 24 run additionally exposed a pre-existing quiet-reporter self-test incompatibility; matching CI's Node 22 resolves that non-browser failure without repository changes.

Nothing has been published. Publishing requires separate authorization; browser CI should pass for the eventual exact commit before merge/deployment.
