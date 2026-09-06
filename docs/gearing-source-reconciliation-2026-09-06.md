# Gearing source reconciliation — 2026-09-06

The weekly verification implementation found and independently rechecked 22 current item changes (13 raid, 9 dungeon). Every changed parsed field matches its own freshly fetched Wowhead tooltip; no item IDs or loot ownership changed. Four structural corrections were also corroborated against the current item pages: Cuirass 271876 uses Mastery, Chausses 271878 uses Critical Strike, Aqirbane Reliquary 268265 splits its budget equally across all four secondaries, and Zatha'tek 271093 is One-Hand. The other differences are current effect tuning.

The allocation pass changed nine of 316 fingerprints. Raw item-level-1000 tooltips reproduce each allocation exactly; all budgets remain 7,000. Six changed fingerprints only synchronize item effects or slot, and three update the verified secondary-stat distribution. No allocation acceptance override is used in unattended runs.

Canonical promotion replaces reviewed item records and allocation records only. Original harvest/review dates, reward-level ladders and owner-supplied chart data stay unchanged. The separate current source-verification receipt identifies the scoped fresh checks.

Scoped dataset SHA-256 (JSON of itemScope; excludes timestamps, raw HTML and reward tables):

| Dataset | Before | Proposed after |
| --- | --- | --- |
| raid-items.json | 205fd416483af3809e5bf20c4e369908e40a955ae7b73dbbed707954ef069087 | a35a278c022f9151d3a280cd713d2ec00392326435b45fdc64d3128ad64db503 |
| dungeon-items.json | 6f252a08490bea7dbfa36169ece4c347990743647941aa5fb5ae190a01300aef | 30371b1f5625bc85f49b5ff1d44a1ea5e38f12a8fac95e70f8d63537118c76bd |
| catalyst-stat-allocations.json | 270fc8322acbfb25c5e4df23e9b3c2a77bbad3eb070d7f50f7be6024d76a2588 | ef8e10352b15d7329db3c6594095207fc6b1231a4747cb06f122f28f74c42ef6 |

Changed item fields and exact source-response hashes:

| Item | Changed fields | Tooltip response SHA-256 |
| --- | --- | --- |
| [270162 Soulcoiler Ritual Vessel](https://nether.wowhead.com/tooltip/item/270162?locale=0) | effect, effects | 41d5fc50f2d4fd35508f60a31e6a2b1786ec5faad64aab9c898bdeda6718a467 |
| [270160 First Mate's Shellward](https://nether.wowhead.com/tooltip/item/270160?locale=0) | effect, effects | 4dbd425f2dc41b6ef2a1b52e2f1e9a8b52cc4909b7ababaeb5d2feda5162a45a |
| [270166 Vashnik's Sanguine Rancor](https://nether.wowhead.com/tooltip/item/270166?locale=0) | effect, effects | 08cef3046bad01624ffb655a88719436ec5fc6e886ff73de950bc8aca73f3421 |
| [270161 Fang of Umbral Malignance](https://nether.wowhead.com/tooltip/item/270161?locale=0) | effect, effects | cd63d579c6175c6108a0e35337a1d72950979d90a34fd291f814ab47931f6584 |
| [270174 Idol of the Howling Nexus](https://nether.wowhead.com/tooltip/item/270174?locale=0) | effect, effects | 693c76e7f2ef9784cc0135aead98c15319f5b5a78b6c9a65d774a439196ecd50 |
| [270171 Preternatural Antivenom](https://nether.wowhead.com/tooltip/item/270171?locale=0) | effect, effects | 5b7d103c7ebf6212056f4d1b79a94ff020945234eaa2f84b2397e80936cd49b4 |
| [270170 Vexhul's Everflowing Gland](https://nether.wowhead.com/tooltip/item/270170?locale=0) | effect, effects | f53951e215b75372e6e6564748383120d4d1c4f4f444d565a2480e20e2537611 |
| [270169 Hex Lord's Dooming Idol](https://nether.wowhead.com/tooltip/item/270169?locale=0) | effect, effects | 51b3c8ee0e53085f3965097d4daa4f4972dd89d4102ac287cb2fed30a28b9a35 |
| [271876 Awoken Dreadfang Cuirass](https://nether.wowhead.com/tooltip/item/271876?locale=0) | secondaries, secondaryRatings, effect, effects | 4a84cbe1a64bedcbaa3d12eec57ba6445fe9f3b865b5b9feecdf4bd2ea771202 |
| [271878 Chausses of Unbound Rancor](https://nether.wowhead.com/tooltip/item/271878?locale=0) | secondaries, secondaryRatings, effect, effects | 0f82116b9e24f51db1acb2ea544fa0f785e21f755dbfeaa529d7a521259d8f1b |
| [271093 Zatha'tek, Breath of Corruption](https://nether.wowhead.com/tooltip/item/271093?locale=0) | slot | 4ea086e78fe922bc6a84e1b5414a45ed547cd3f6d8594226a85917c02f979040 |
| [268265 Aqirbane Reliquary](https://nether.wowhead.com/tooltip/item/268265?locale=0) | secondaries, secondaryRatings, effects | 79e0618505c02baa9c9745f521f5bc6fa8a37b61ce5e3322543cbdfb005bbe98 |
| [270168 Font of Venomous Rage](https://nether.wowhead.com/tooltip/item/270168?locale=0) | effect, effects | 8c6d395a5d44368f08eceba7c8f51c3596fe2f232daf7cc83713dff7852e9724 |
| [273795 Coiled Fangstone](https://nether.wowhead.com/tooltip/item/273795?locale=0) | effect, effects | 3cac9eb179e5c73d16272889ca3ce0686249309e2f4e9cbcd773e2f6593b9e8e |
| [273794 Knot of Writhing Serpents](https://nether.wowhead.com/tooltip/item/273794?locale=0) | effect, effects | 2a60caa0830be3bb60d7e7c2528d48bf0cf4196cbac7ca1f46253b0990ace47f |
| [250255 Unstable Felheart Crystal](https://nether.wowhead.com/tooltip/item/250255?locale=0) | effect, effects | 388c724dd65e6247a6539cbd4ee5d715d8effd467fefc4eda0c5f564bb85dbb2 |
| [250248 Mycolic Medicine](https://nether.wowhead.com/tooltip/item/250248?locale=0) | effect, effects | fd17d25ba69b5b39e8643d283c4c11a194e3c941b52d5c40e8f1186f3113c27e |
| [250259 Sapling of the Dawnroot](https://nether.wowhead.com/tooltip/item/250259?locale=0) | effect, effects | bbcf7bca913d91498f7ffbfb619bb6c32d2f8af1e18b391ae070f46bb0298839 |
| [250245 Tumor of the Swarm](https://nether.wowhead.com/tooltip/item/250245?locale=0) | effect, effects | 046e3bc98060f5bc691c78d1505e41b6f90c3e32465f5ca4b522e3b47def0281 |
| [250224 Mindpiercer's Sigil](https://nether.wowhead.com/tooltip/item/250224?locale=0) | effect, effects | 9ffd75784d6821157c4294aa3a5d308c7b18f9669138f893fd3eb21cfa486764 |
| [158374 Tiny Electromental in a Jar](https://nether.wowhead.com/tooltip/item/158374?locale=0) | effect, effects | 916d84f7e561ea5f89b26745c360267aa950ae6427f6b70d0f05a2d9a7c4e958 |
| [193748 Kyrakka's Searing Embers](https://nether.wowhead.com/tooltip/item/193748?locale=0) | effect, effects | a002f1a8fdfb1109512ec5e7f7541a07263de5c756306926d60de7955c8bc2b8 |

Changed allocation fingerprints: 193748, 268265, 270168, 270169, 270171, 270174, 271093, 271876, 271878.

Evidence was collected into `%TEMP%/wow-gearing-verification-sep6-full/` (`item-changes.json`, `allocation-changes.json`, raw SHA-256 receipts, and proposed complete datasets). Recurring workflow runs preserve the equivalent artifact for 90 days. Source hashes above identify the reviewed local observations; a scheduled verification must collect again rather than restamp them.
