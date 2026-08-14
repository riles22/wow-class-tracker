import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile, writeFile, mkdtemp, mkdir, cp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { lastSeasonVerifiedCommit, freezeSeason, ARCHIVE } from "../src/freeze-season.mjs";
import { PHASES, sourceSeasonOk, seasonRank } from "../src/normalize.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* These tests read real git history. The nightly's publish job checks out at fetch-depth 0
   (which is why freeze-season lives there and not agent-side), but a shallow CI checkout
   cannot answer the question at all — so probe once and skip rather than fail red on an
   environment fact that says nothing about the code. */
const deepHistory = (() => {
  try {
    const n = execFileSync("git", ["rev-list", "--count", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim();
    return Number(n) > 5;
  } catch { return false; }
})();

const archive = JSON.parse(await readFile(path.join(ROOT, ARCHIVE), "utf8").catch(() => "null"));
const registry = JSON.parse(await readFile(path.join(ROOT, "data/sources.json"), "utf8"));

test("every frozen record re-derives byte-identically from the commit it names", { skip: !deepHistory || !archive }, () => {
  // The record's whole claim is "these are the letters this outlet published at this
  // commit". If the letters and the sha ever disagree, the consensus is quietly serving
  // numbers with a false receipt — and nothing on the page would look wrong.
  let checked = 0;
  for (const [season, bySource] of Object.entries(archive)) {
    for (const [sourceId, brackets] of Object.entries(bySource)) {
      for (const [bracket, rec] of Object.entries(brackets)) {
        const specs = JSON.parse(execFileSync("git", ["show", `${rec.fromCommit}:data/specs.json`],
          { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 28 }));
        const rederived = {};
        for (const spec of specs) {
          const tier = spec.ratings?.[bracket]?.[sourceId];
          if (tier !== undefined) rederived[`${spec.class}|${spec.spec}`] = tier;
        }
        assert.deepEqual(rec.letters, rederived,
          `${season}/${sourceId}/${bracket} does not match its own commit ${rec.fromCommit.slice(0, 7)}`);
        checked++;
      }
    }
  }
  assert.ok(checked > 0, "the archive exists but holds no records to verify");
});

test("a frozen record's commit really is the newest one still describing the live season", { skip: !deepHistory || !archive }, t => {
  // Guards against freezing too early (losing the outlet's last real update) or too late
  // (freezing letters that already describe the next season).
  let checked = 0;
  for (const [season, bySource] of Object.entries(archive)) {
    if (season !== PHASES.liveSeason) continue;
    for (const [sourceId, brackets] of Object.entries(bySource)) {
      for (const [bracket, rec] of Object.entries(brackets)) {
        const found = lastSeasonVerifiedCommit(sourceId, bracket, { cwd: ROOT, liveSeason: season });
        assert.equal(found.sha, rec.fromCommit,
          `${sourceId}/${bracket}: archive names ${rec.fromCommit.slice(0, 7)}, derivation finds ${found.sha.slice(0, 7)}`);
        checked++;
      }
    }
  }
  /* Announce the expiry instead of passing on an empty loop. The season filter is right —
     only the LIVE season's records are re-derivable, since the walk needs commits that
     verified that season — but it silently admits nothing the moment liveSeason advances:
     the archive is keyed by the season being LEFT, and with seasonOrder ["s1","s2"] no "s2"
     record can exist until "s3" is appended at the 12.2 cycle (aheadSeasonFor throws on an
     unknown id, and the runbook says the same: "the s2 archive stays empty until an outlet
     leaves s2"). So at the 08-18 flip this would go from checking 4 records to checking 0
     while still reporting green. Its two siblings already guard this way — line 48 asserts
     checked > 0, and the still-live test below calls t.skip — this one just never did. */
  if (checked === 0) {
    t.skip(`no frozen records for the live season "${PHASES.liveSeason}" — nothing to re-derive, so this assertion has expired until an outlet leaves the current season`);
  }
});

test("only a source that has actually moved ahead is frozen", () => {
  /* Two failure directions, and asserting only the first is what let the BEHIND bug ship.
     `sourceSeasonOk === false` says "not describing the live season", which is equally true
     of an outlet that has moved ON and one that is LAGGING. Freezing a laggard writes its
     stale letters as a permanent record in an append-only archive (measured at the 12.1
     flip: 159 letters, 36 of 80 consensus letters moved). So assert the real invariant —
     at least one page of the bracket has moved PAST the live season. That covers a fully
     flipped outlet and a mid-rebuild split alike, and excludes a laggard. */
  if (!archive) return;
  const liveRank = seasonRank(PHASES.liveSeason);
  for (const [season, bySource] of Object.entries(archive)) {
    if (season !== PHASES.liveSeason) continue;
    for (const [sourceId, brackets] of Object.entries(bySource)) {
      const source = registry.find(s => s.id === sourceId);
      assert.ok(source, `${sourceId} is frozen but not in the registry`);
      for (const bracket of Object.keys(brackets)) {
        assert.equal(sourceSeasonOk(source, bracket, season), false,
          `${sourceId}/${bracket} still describes ${season} — it must not carry a frozen record`);
        const moved = (source.pages ?? [])
          .filter(p => p.bracket === bracket)
          .some(p => { const r = seasonRank(p.seasonVerified); return r != null && r > liveRank; });
        assert.ok(moved,
          `${sourceId}/${bracket} carries a frozen record but no page has moved past ${season} — a LAGGING outlet must never be frozen, it must drop out of the consensus until it catches up`);
      }
    }
  }
});

test("freezeSeason refuses to freeze an outlet that is merely BEHIND", { skip: !deepHistory }, async () => {
  /* The regression test for the headline fix. The pre-fix code froze a LAGGING outlet from
     e65332a — the commit that ADDED `seasonVerified`, where no page carried it — because
     `sourceSeasonOk` is vacuously true wherever the field is absent. Measured at the 12.1
     flip, that wrote 159 letters of stale opinion into an append-only archive and moved 36
     of 80 consensus letters. Reverting the ahead/behind split must turn this red.

     The lagging registry is CONSTRUCTED here, not borrowed from whichever outlet happens to
     be lagging today. The literal ["method/raid", "method/mplus", "archon/raid",
     "archon/mplus"] this replaces was written when method and archon were both s1, and it
     went red on 2026-08-14 for a reason that was not a defect at all: Method rebuilt both
     lists for Season 2, so it was no longer behind. That is the SECOND time this file has
     been broken by pinning a fixture to live registry state — see the derivation note on
     "a source that never left the live season needs no freeze", which lost its own
     hardcoded list when Icy Veins flipped on 2026-08-11.

     Deriving the expected set from the registry instead would fix the staleness but buy a
     worse failure: once every outlet has flipped (the S2 transition, which is exactly when
     this invariant matters most) the derived set is EMPTY and the test passes vacuously,
     guarding nothing. Constructing the laggard keeps the guard permanent and independent of
     registry drift — the same throwaway-copy mutation the split test below already uses.
     Note the walk still runs against REAL git history, so reverting the gate fails loudly
     either way: it freezes real letters for an outlet that qualifies at HEAD, or throws
     "Refusing to guess" for one that never described s2. */
  const dir = await mkdtemp(path.join(tmpdir(), "freeze-test-"));
  try {
    await cp(path.join(ROOT, "data"), path.join(dir, "data"), { recursive: true });
    await cp(path.join(ROOT, ".git"), path.join(dir, ".git"), { recursive: true });

    const srcPath = path.join(dir, "data", "sources.json");
    const reg = JSON.parse(await readFile(srcPath, "utf8"));
    const laggards = [];
    for (const source of reg) {
      if (source.kind !== "tier-list" || (source.era ?? "live") !== "live") continue;
      for (const pg of source.pages ?? []) pg.seasonVerified = "s1";      // every page BEHIND s2
      for (const bracket of [...new Set((source.pages ?? []).map(p => p.bracket))].filter(Boolean)) {
        laggards.push(`${source.id}/${bracket}`);
      }
    }
    assert.ok(laggards.length > 0, "fixture needs at least one live-era tier-list source to lag");
    await writeFile(srcPath, JSON.stringify(reg, null, 2) + "\n");

    const res = await freezeSeason(dir, { liveSeason: "s2", today: "2026-08-18" });
    assert.deepEqual(res.added, [], "a lagging outlet must not be frozen at the flip");
    assert.deepEqual(res.behind.slice().sort(), laggards.slice().sort(),
      "every lagging source/bracket must be reported as behind, and nothing else");
    const written = JSON.parse(await readFile(path.join(dir, ARCHIVE), "utf8"));
    assert.equal(written.s2, undefined, "no s2 records may be written while every outlet is behind");
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test("freezeSeason DOES freeze a bracket whose pages are split mid-rebuild", { skip: !deepHistory }, async () => {
  /* `aheadSeasonFor` returns null for a split bracket (never mix two seasons in one forecast
     term) — but that is a different question from whether to preserve the outlet's last
     single-season letters. consensusFor has already dropped it, so skipping the freeze would
     recompose the mean and publish a registry decision as spec movement (measured on a staged
     Archon raid flip: 40 cells lose a contributor, 9 published letters move).

     The split is CONSTRUCTED on both sides — subject derived, and every page of the bracket
     written explicitly. Writing only `raidPages[0].seasonVerified = "s2"` and trusting the
     comment "the rest stay s1" was true when this was authored and silently stops being a
     split the moment that outlet flips: with every archon page already s2, setting one to s2
     changes nothing, the bracket reads AHEAD rather than split, and the assertion goes red for
     a reason that is not a defect. Measured 2026-08-14 by simulating the pre-flip end state
     (all four outlets on s2). Same lesson as the two fixtures above it in this file. */
  const dir = await mkdtemp(path.join(tmpdir(), "freeze-split-"));
  try {
    await cp(path.join(ROOT, "data"), path.join(dir, "data"), { recursive: true });
    await cp(path.join(ROOT, ".git"), path.join(dir, ".git"), { recursive: true });
    const srcPath = path.join(dir, "data", "sources.json");
    const reg = JSON.parse(await readFile(srcPath, "utf8"));
    const subject = reg.find(s => s.kind === "tier-list" && (s.era ?? "live") === "live" &&
      s.pages?.filter(p => p.bracket === "raid").length > 1);
    assert.ok(subject, "fixture needs a live-era tier list with a multi-page raid bracket to split");
    const raidPages = subject.pages.filter(p => p.bracket === "raid");
    for (const p of raidPages) p.seasonVerified = "s1";   // the bracket sits on the live season…
    raidPages[0].seasonVerified = "s2";                   // …except one page that has moved on
    await writeFile(srcPath, JSON.stringify(reg, null, 2) + "\n");

    /* The archive is append-only, so a subject that ALREADY carries a frozen s1 record would
       land in `kept` and never in `added` — which is what the freeze assertion below measures.
       The old fixture dodged this by naming archon, the one outlet that happened to be
       unfrozen; that is the same pin this rewrite removes. Drop the subject's record instead,
       so the freeze is genuinely exercised whoever the subject turns out to be. */
    const archivePath = path.join(dir, ARCHIVE);
    const arch = JSON.parse(await readFile(archivePath, "utf8").catch(() => "{}"));
    for (const bySource of Object.values(arch)) delete bySource?.[subject.id];
    await writeFile(archivePath, JSON.stringify(arch, null, 2) + "\n");

    const pair = `${subject.id}/raid`;
    const res = await freezeSeason(dir, { liveSeason: "s1", today: "2026-08-12" });
    assert.ok(res.split.includes(pair), "a split bracket must be reported as split, not behind");
    assert.ok(!res.behind.includes(pair), "a split bracket is leaving, not lagging");
    assert.ok(res.added.some(a => a.source === subject.id && a.bracket === "raid"),
      "a split bracket must be frozen so the consensus keeps its composition while it rebuilds");
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test("the walk refuses to guess when no commit describes the season", { skip: !deepHistory }, () => {
  // No commit has ever described a season "s3", so there is no honest freeze point. The
  // failure mode this guards against is writing an EMPTY record, which would drop the
  // source from the consensus while looking like a successful freeze.
  assert.throws(
    () => lastSeasonVerifiedCommit("wowhead", "raid", { cwd: ROOT, liveSeason: "s3", max: 50 }),
    /Refusing to guess/);
  // An unknown source id is the same class of error, never a silent empty.
  assert.throws(
    () => lastSeasonVerifiedCommit("not-a-source", "raid", { cwd: ROOT, max: 50 }),
    /Refusing to guess/);
});

test("the walk refuses a commit that never LABELLED the season, even though sourceSeasonOk would accept it", async () => {
  /* Coverage for the OTHER half of the 2026-08-11 freeze fix — the half that requires an
     EXPLICIT `seasonVerified === liveSeason` rather than `sourceSeasonOk`, which is vacuously
     true wherever the field is absent. freeze-season.mjs claims "reverting either half of the
     fix must turn this red"; measured on 2026-08-14, that was FALSE. Relaxing
     `explicitlyVerifiedAt` back to accepting unlabelled pages passed the entire suite.

     The reason is subtle and would only have got worse silently: the sibling "refuses to
     guess" test walks `max: 50`, but `seasonVerified` entered the registry at e65332a, by
     then 95 first-parent commits back. The walk gave up before ever reaching the unlabelled
     era, so the vacuous check was never exercised. Raising that bound is not the fix either —
     the distance to the unlabelled frontier GROWS with every commit, so any literal bound
     re-arms the same trap, and walking all 340 commits costs ~7.5s.

     So the history is SYNTHETIC: two commits, the older one carrying pages with no
     `seasonVerified` at all. Asking for a season nothing ever labelled must throw. With the
     vacuous check restored the walk accepts that older commit instead and this goes red in
     ~50ms, independent of how the real repo's history grows. */
  const dir = await mkdtemp(path.join(tmpdir(), "freeze-walk-"));
  try {
    const run = (...args) => execFileSync("git", args, { cwd: dir, encoding: "utf8" });
    run("init", "-q", "-b", "master");
    run("config", "user.email", "test@example.invalid");
    run("config", "user.name", "test");
    const page = extra => [{ id: "x", kind: "tier-list", pages: [{ bracket: "raid", role: "All", url: "https://example.invalid/x", snapshot: "2026-01-01", ...extra }] }];
    await mkdir(path.join(dir, "data"), { recursive: true });
    await writeFile(path.join(dir, "data", "sources.json"), JSON.stringify(page({}), null, 2) + "\n");
    run("add", "-A"); run("commit", "-qm", "unlabelled: no seasonVerified anywhere");
    await writeFile(path.join(dir, "data", "sources.json"), JSON.stringify(page({ seasonVerified: "s1" }), null, 2) + "\n");
    run("add", "-A"); run("commit", "-qm", "labelled s1");

    // s1 IS explicitly labelled at HEAD, so that resolves normally...
    assert.equal(lastSeasonVerifiedCommit("x", "raid", { cwd: dir, liveSeason: "s1", max: 10 }).sha,
      run("rev-parse", "HEAD").trim(), "the explicitly labelled season must resolve to HEAD");
    // ...but s2 was never labelled by any commit, and the unlabelled ancestor must NOT stand in.
    assert.throws(
      () => lastSeasonVerifiedCommit("x", "raid", { cwd: dir, liveSeason: "s2", max: 10 }),
      /Refusing to guess/,
      "an unlabelled commit must never satisfy the walk — that is how 159 stale letters reached the append-only archive");
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test("a source that never left the live season needs no freeze", { skip: !deepHistory }, t => {
  /* The still-live set is DERIVED, never hardcoded. It was a literal ["icyveins","method",
     "archon"] until 2026-08-11, when the nightly correctly flipped Icy Veins to s2 and this
     assertion went red on a stale premise — a failure that only surfaces AFTER the flipping
     commit lands, and only in a deep checkout, so the publish gate is the first thing to see
     it. Deleting the flipped id would just re-arm the same trap for method and archon.

     Read the registry from `git show HEAD:` rather than the working tree: in the publish job
     the tree is the refresh agent's artifact overlay and can disagree with the commit whose
     history `lastSeasonVerifiedCommit` walks, which would make this spuriously red (or
     vacuously green) for reasons that say nothing about the code. */
  const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim();
  const atHead = JSON.parse(execFileSync("git", ["show", `${head}:data/sources.json`],
    { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 28 }));

  let checked = 0;
  for (const source of atHead.filter(s => s.kind === "tier-list" && (s.era ?? "live") === "live")) {
    for (const bracket of [...new Set((source.pages ?? []).map(p => p.bracket))].filter(Boolean)) {
      /* Select with the predicate PRODUCTION uses, not the looser `sourceSeasonOk`. The walk
         requires an explicit `seasonVerified === liveSeason`; selecting on sourceSeasonOk —
         which is vacuously true where the field is absent — would pull in a source that has
         simply never been era-verified (a newly registered outlet, before its first
         refresh-tiers run) and turn a legitimate publish red with "Refusing to guess". */
      const pages = (source.pages ?? []).filter(p => p.bracket === bracket);
      if (!pages.every(p => p.seasonVerified === PHASES.liveSeason)) continue;
      const found = lastSeasonVerifiedCommit(source.id, bracket, { cwd: ROOT, liveSeason: PHASES.liveSeason });
      assert.equal(found.sha, head,
        `${source.id}/${bracket} still describes ${PHASES.liveSeason}, so HEAD must already qualify`);
      checked++;
    }
  }
  /* Once every outlet has flipped there is nothing left to check. That is a REAL event with a
     date — the Season-2 transition — not a defect, so it must not fail the publish gate:
     Gate 1 runs this suite, and a hard failure here would block every night between the last
     outlet flipping and the owner flipping PHASES.liveSeason. Skipping reports the expiry
     just as loudly without costing a publishable night. */
  if (checked === 0) {
    t.skip("no live-season source/bracket pairs remain — every outlet has moved ahead, so this assertion has expired and should be retired with the season transition");
  }
});
