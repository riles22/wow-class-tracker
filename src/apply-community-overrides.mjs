import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const clone = value => JSON.parse(JSON.stringify(value));

export function applyCommunityOverrides(community, registry) {
  const output = clone(community);
  const classes = new Map((output.classes ?? []).map(entry => [entry.class, entry]));

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
      const scoped = { ...base, specs: [...scope.specs] };
      const index = creators.findIndex(existing => existing.name === base.name);
      if (index >= 0) creators[index] = scoped;
      else creators.push(scoped);
    }

    if (base.verifiedDate && (!output.verified || base.verifiedDate > output.verified)) {
      output.verified = base.verifiedDate;
    }
  }

  return output;
}

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
