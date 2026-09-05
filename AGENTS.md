# Working agreements

- Make a plan before edits.
- Prefer minimal diffs.
- Run unit tests relevant to changed files.
- Ask before adding new dependencies.

<!-- Generated agent adapter: start -->
## Project instructions

Read and follow [CLAUDE.md](CLAUDE.md) before working on this project. It is the
canonical project guide; its relative paths resolve from the repository root.

Skill procedures are maintained in `.claude/skills/*/SKILL.md`. The matching
`.agents/skills/*/SKILL.md` files are generated entry points: open their linked
canonical procedure before following a skill. Resolve that procedure's relative
resources against its canonical directory, including its tracked `log.md`.

Edit canonical procedures directly. After changing skill discovery metadata or
adding a skill, run `node src/sync-agent-instructions.mjs --write` and commit the
adapters. Verify them with `node src/sync-agent-instructions.mjs --check`.
Keep these working agreements and any personal preamble outside the generated
markers; regeneration preserves them. Never put credentials in an adapter.
<!-- Generated agent adapter: end -->
