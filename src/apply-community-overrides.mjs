import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const clone = value => JSON.parse(JSON.stringify(value));

export function applyCommunityOverrides(community, registry) {
  const output = clone(community);
  const classes = new Map((output.classes ?? []).map(entry => [entry.class, entry]));

  /* Reconcile so the override file is the single source of truth for what it injects.
     Without reconciliation the applier only ever ADDED: narrowing a creator's scopes, or
     deleting the entry outright, left the previously-injected creator in community.json
     forever (audit 2026-07-24, C8). Only entries this applier wrote are reconciled —
     hand-curated creators carry no marker and are never touched.

     Retraction happens AFTER the upsert, not before it. Sweeping first meant every
     re-injected creator was `push`ed back at the end of its array, so appending one
     hand-curated creator to a class silently reordered community.json — and Gate 0, which
     compares the whole file, then failed the night and blamed the agent for a reorder the
     applier itself produced (audit 2026-07-25). Upserting in place keeps positions stable;
     the sole write is the value at the index the entry already occupies. */
  const reinjected = new Map(); // class → names this run actually injected

  for (const creator of registry?.creators ?? []) {
    const { scopes, ...base } = creator;
    if (!base.name || !base.url || !Array.isArray(scopes) || scopes.length === 0) {
      throw new Error(`invalid community override creator ${JSON.stringify(base.name ?? null)}`);
    }

    for (const scope of scopes) {
      const entry = classes.get(scope.class);
      if (!entry) throw new Error(`community override references unknown class "${scope.class}"`);
      if (!Array.isArray(scope.specs) || scope.specs.length === 0) {
        throw new Error(`community override ${base.name}/${scope.class} needs at least one spec`);
      }

      const creators = entry.creators ?? (entry.creators = []);
      const scoped = { ...base, specs: [...scope.specs], managedBy: "overrides" };
      // Name match wins regardless of who wrote the existing entry — same capture
      // behaviour as before this change, deliberately: refusing on collision would make
      // any community.json that already has a same-named curator unbuildable.
      const index = creators.findIndex(existing => existing.name === base.name);
      if (index >= 0) creators[index] = scoped;
      else creators.push(scoped);
      if (!reinjected.has(scope.class)) reinjected.set(scope.class, new Set());
      reinjected.get(scope.class).add(base.name);
    }

    if (base.verifiedDate && (!output.verified || base.verifiedDate > output.verified)) {
      output.verified = base.verifiedDate;
    }
  }

  // Retract what this applier wrote and no longer injects. Survivors keep their position;
  // only genuine removals change the array.
  for (const entry of output.classes ?? []) {
    if (!Array.isArray(entry.creators)) continue;
    const keep = reinjected.get(entry.class) ?? EMPTY;
    entry.creators = entry.creators.filter(c => c.managedBy !== "overrides" || keep.has(c.name));
  }

  return output;
}
const EMPTY = new Set();

export async function applyCommunityOverridesToFile(root) {
  const communityPath = path.join(root, "data", "community.json");
  const registryPath = path.join(root, "data", "community-overrides.json");
  const [community, registry] = await Promise.all([
    readFile(communityPath, "utf8").then(JSON.parse),
    readFile(registryPath, "utf8").then(JSON.parse)
  ]);
  const output = applyCommunityOverrides(community, registry);
  const next = JSON.stringify(output, null, 2) + "\n";
  const current = await readFile(communityPath, "utf8");
  if (current !== next) await writeFile(communityPath, next, "utf8");
  return current !== next;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const changed = await applyCommunityOverridesToFile(root);
  console.log(changed ? "✓ community overrides applied" : "✓ community overrides already current");
}
