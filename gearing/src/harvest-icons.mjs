// Download every item icon once and inline it as base64.
//
// The app is meant to work with no network at view time, so icons are embedded
// rather than hot-linked to wow.zamimg.com. 36px ("medium") keeps the whole set
// to a few hundred KB, which is a fair price for a local tool.
//
//   node src/harvest-icons.mjs
//
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SIZE = "medium";
const URL = (n) => `https://wow.zamimg.com/images/wow/icons/${SIZE}/${n}.jpg`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const read = async (f) => JSON.parse(await readFile(join(ROOT, "data", f), "utf8"));
const raid = await read("raid-items.json");
const dung = await read("dungeon-items.json");
const tier = await read("tier-items.json");

const items = [...raid.bosses.flatMap((b) => b.items), ...dung.dungeons.flatMap((d) => d.items),
  ...tier.sets.flatMap((set) => set.items)];
const names = [...new Set(items.map((i) => i.icon).filter(Boolean))];
console.log(`${items.length} items reference ${names.length} unique icons`);
if (!names.length) {
  console.error("no icon names found -- re-run the item harvesters first so `icon` is captured");
  process.exit(1);
}

const icons = {};
let bytes = 0, missing = [];
for (let i = 0; i < names.length; i += 8) {
  await Promise.all(names.slice(i, i + 8).map(async (n) => {
    try {
      const r = await fetch(URL(n), { headers: { "user-agent": "Mozilla/5.0 (wow-s2-gearing)" } });
      if (!r.ok) { missing.push(n); return; }
      const buf = Buffer.from(await r.arrayBuffer());
      bytes += buf.length;
      icons[n] = buf.toString("base64");
    } catch { missing.push(n); }
  }));
  await sleep(90);
  if (i % 80 === 0) process.stdout.write(".");
}
console.log("");

const out = {
  source: `wow.zamimg.com item icons (${SIZE}, 36px), inlined as base64 so the app needs no network`,
  harvestedAt: new Date().toISOString().slice(0, 10),
  size: SIZE,
  counts: { unique: names.length, fetched: Object.keys(icons).length, missing: missing.length },
  missing,
  icons,
};
await mkdir(join(ROOT, "data"), { recursive: true });
await writeFile(join(ROOT, "data", "icons.json"), JSON.stringify(out), "utf8");

console.log(`wrote data/icons.json`);
console.log(`  ${Object.keys(icons).length}/${names.length} icons · ${Math.round(bytes / 1024)} KB raw · ${Math.round(bytes * 1.34 / 1024)} KB base64`);
if (missing.length) console.log(`  missing: ${missing.slice(0, 6).join(", ")}${missing.length > 6 ? " ..." : ""}`);
