// Delve item harvesting is intentionally retired.
//
// The current Wowhead Season 2 Delves guide does not expose a scoped, enumerable
// per-item loot table. Scanning every item link on the page mixed incidental links
// with rewards and previously produced an empty dataset, so writing from that source
// would be fail-open. Delve item-level rewards remain available through
// data/sheet-rewards.json; the main build does not consume data/delve-items.json.

throw new Error("Delve item harvesting is retired: no authoritative scoped per-item loot table is available.");
