---
name: paste-discord
description: Fold manually-pasted theorycrafter content (Discord posts, class-server analysis, anything the tracker may not fetch) into the tracker's creator-take layer, and into spec writeups only while a PTR cycle is open, with full provenance. Use when Riley pastes raw text from a class Discord or says "here's an update from Discord", "paste-in", "add this take", "I read this in <server>".
---

# Paste-in — Discord and other unfetchable sources

Hard rule 6 says Discord is **never fetched** (auth + TOS). That rule is about fetching, not
about knowing: the class Discords are where the best 12.1 theorycrafting actually happens,
and Riley reads them. This skill is the sanctioned path for that content — a human reads it,
pastes it, and it lands with provenance strong enough that a stranger can judge it.

## What this skill is defending against

Three failure modes, in order of how easy they are to commit:

1. **Presenting Riley's read as the source's read.** The verdict must be the *source's*, never
   the distiller's. This is the same rule the writeup layer already lives by, and pasting
   makes it easier to break, because the raw text is right there and paraphrasing shades into
   editorializing.
2. **Undated content.** A Discord post has no page to date. Riley is the *only* possible
   source of that date, and once the writeup lands the chance to record it is gone forever —
   that is exactly how 17 existing writeups ended up permanently undateable.
3. **Republishing someone's words.** Copying a private-community post verbatim into a public
   repo is a different problem from fetching it, and a worse one socially. Distill; don't
   transcribe.

## Procedure

### 1. Take the paste into scratch, never into the repo

Write the raw text to the session scratchpad. **Do not commit it, and do not add it under
`data/`** — Gate 0 fails the night on new files there anyway, and the raw text is not the
deliverable. It exists only long enough to distill from.

### 2. Collect the provenance triple — who / where / when

**Server names (owner-confirmed, 2026-07-31).** These are the Discords Riley actually reads,
per class — use them for the `(<Server>)` part of `sourceLabel` unless a paste explicitly
names a different server:

| Class | Server | Notes |
|---|---|---|
| Warrior | Skyhold | |
| Paladin | Hammer of Wrath | |
| Hunter | Trueshot Lodge | **Riley does not use Warcraft Hunter's Union** — never attribute a paste there (it stays in the registry as a community link only) |
| Rogue | Ravenholdt | |
| Priest | Warcraft Priests | |
| Death Knight | Acherus | Blood-specific content: Death's Advance |
| Shaman | Earthshrine | Resto-specific content: Ancestral Guidance (attribution only — not in the registry until a verified invite is supplied) |
| Warlock | Council of the Black Harvest | |
| Monk | Peak of Serenity | |
| Druid | Dreamgrove | |
| Demon Hunter | The Fel Hammer | |
| Evoker | Wyrmrest Temple | |
| Mage | Altered Time | |

A paste with no server named gets the class's server from this table. A spec-scoped server
(Death's Advance, Ancestral Guidance) is used only when the content is clearly from there —
when in doubt, the class server is the honest default.

Every pasted item needs all three before anything is written:

- **who** — the person, with their credential if they have one ("Clarius", "Archimtiros
  (SimC dev, Icy Veins Arms author)")
- **where** — the server, and the channel if it narrows things ("Hammer of Wrath
  #theorycrafting")
- **when** — the date the source *said* it. If Riley only remembers reading it, the date they
  read it is honest and acceptable — it bounds the age correctly. **Ask if it wasn't given.**
  Never infer it from context, and never use today's date as a stand-in.

If a link exists — a Wowhead article, a HackMD, a forum post — prefer the link. `source` beats
`sourceLabel` every time, because the reader can check it.

### 3. Decide which lane it belongs in

| The paste is… | Lane | Shape |
|---|---|---|
| A spec's overall read of the open PTR cycle's patch (what changed, is it better or worse) — **open cycle only**, see below | `spec.ptr` writeup in `data/specs.json` | `verdict` · `theme` · `summary` · `changes[]` · `set2`/`set4` · `watch` · `sourceLabel`/`source` · **`asOf`** |
| One cited opinion from a named specialist | `takes[]` in `data/creator-takes.json` | scoped to specs that creator is credible on; needs a `url` on a `TAKE_HOSTS` host |
| A cross-class season/meta read from a general creator | `metaNotes[]` in `data/creator-takes.json` | author must be in `generalCreators[]`; needs a `url` on a `TAKE_HOSTS` host |
| A tuning change from an official build, hotfix or patch notes | **Not this skill** — `ptr-watch` logs it from the official post (live ones as feed entries with `realm: "live"`, never into `spec.ptr`) | the official post is canonical; Discord is hearsay about it |

That last row matters. If the paste is someone *relaying* patch notes, go get the notes. Only
the person's *analysis* belongs here.

**`spec.ptr` belongs to an OPEN PTR cycle only (`PHASES.ptr` non-null)**, the same limit as
ptr-watch step 4. It is the cycle's pre-launch writeup; the 12.1 writeups on file are the
closed cycle's record. While `PHASES.ptr` is null (the case since the 2026-08-18 flip, with
12.1.5 live inside Season 2), a paste never writes `spec.ptr`: no new writeup, no `changes[]`
line, no `watch` edit, no `verdict` change, no rewrite of an existing writeup from the pasted
read. That holds however good the read is and whichever patch it discusses: a read of the
live game, 12.1.5 included, is a live read, not PTR material. ptr-watch's set-bonus
exception (its dated "(pre-<date> …)" caveat on `ptr.set2`/`ptr.set4` after an official
set-bonus change) belongs to ptr-watch and comes from the official notes, never from a paste.
The only `spec.ptr` edit a paste may still make is step 4's provenance repair, which adds no
content.

**Where a read goes while no cycle is open:**

- **`takes[]`**, when the author is a registered specialist for that class in
  `community.json` (`classes[].creators`, inside their `specs` scope) **and** the same read
  exists in a linkable form on a `TAKE_HOSTS` host (`src/validate.mjs`). Validation requires a
  `url` on every take, and Discord and Google Docs are not on that list, so a HackMD page, a
  Wowhead article or a video of the same read qualifies and the Discord post alone does not.
  Frame it as watch-creators step 4 does: `patchContext` "Season 2 live (12.1.5) — …" by that
  step's release-date rule (never "PTR", never a new season), `date` = the day the source said
  it, `sentiment` = the source's own read, `bracket` when the source names one, and supersede
  that creator's older take in the same lens.
- **`metaNotes[]`**, only when the author is a `generalCreators[]` entry and the read has a
  `TAKE_HOSTS` link. That is rare for a class-Discord post.
- Either one renders in the spec drawer as a cited live-era read and moves no forecast:
  `expertRead` is dormant while `PHASES.ptr` is null, and the rendered forecast is the frozen
  2026-08-11 artifact.
- **Otherwise the run report** (the session's closing report to Riley): an unlinkable Discord
  post, or an author not registered for that class and spec, has no honest lane on the site
  between cycles. Report who / where / when, a one-line gist in the tracker's words (never the
  pasted text), and why it did not land. Registering or rescoping the author is Riley's edit
  (Gotchas). Never force the read into `spec.ptr`, `takes[]` or `metaNotes[]` to keep it.

### 4. Write it

New writeups, and every writeup edit except the provenance repair below, happen only while a
PTR cycle is open (step 3). A take follows watch-creators step 4 for its shape, framing and
supersession.

- `asOf` is **required** on every new writeup — validation fails the build without it. The
  pre-2026-07-26 writeups are grandfathered in `UNDATED_WRITEUPS` (`src/validate.mjs`);
  **that list may only shrink.** If a paste supplies the real date for one of them, remove
  its name from the list in the same edit. That is **provenance repair**, and it is allowed
  whether or not a cycle is open, because it adds no content: the date is the one the
  writeup's own source gave for the read the writeup already carries, so it falls on or
  before 2026-07-26. `verdict`, `summary`, `changes[]`, `watch` and `set2`/`set4` stay as
  they are, and the attribution still names the same source (adding that source's own URL
  is part of the repair; see Gotchas). A newer post by the same person is a new read, not
  that date: route it by step 3.
- `sourceLabel` format (writeups only; a take needs a `url`):
  `"<Who> (<Server>) — Discord"`, e.g. `"Clarius (Hammer of Wrath) — Discord"`. Add the
  channel when it disambiguates.
- The **verdict is the source's**. If the paste doesn't clearly support Positive / Mixed /
  Negative, say so and ask — do not split the difference to make it fit.
- If the source is uncertain or hedging, that belongs in `watch`, not smoothed out of the
  `summary`.
- Distill into the tracker's own words. Short direct quotes are fine when the phrasing *is*
  the point; wholesale copying is not.

### 5. Verify and finish

```
npm run test:quiet && npm run build
```

Then, per the project rule, if data changed: `node src/snapshot.mjs`.

Show Riley the diff before committing — this is an interactive workflow, so rule 5
(plan-first) applies in full.

## Gotchas

- **`data/community-overrides.json` is owner-only.** If a paste implies a creator should be
  added or rescoped, that is Riley's edit, not the agent's. Gate 0 fails the night on an
  agent edit there.
- **A paste is not a tier.** Nothing here ever writes `ratings` or feeds the consensus —
  only `tier-list` sources do that (hard rule 3). A Discord post saying "Fury is S-tier" is a
  take, not a tier.
- **Creator scope is enforced.** `takes[]` validation rejects an author writing about a spec
  outside their `specs` scope in `community.json`. A Frost DK authority does not lend
  credibility to Blood.
- **Host allowlists are real.** A URL on a host not in `WRITEUP_HOSTS` / `TAKE_HOSTS`
  (`src/validate.mjs`) fails the run red. That is deliberate: adding a host is a reviewed code
  edit, not something to route around by dropping the link and using `sourceLabel` instead.
- **Some grandfathered writeups (8 on 2026-09-26) cite "Wowhead 12.1 class preview" with no
  URL.** If a paste session is happening anyway, that is the cheapest moment to supply those
  links and dates — it upgrades them from unverifiable attribution to checkable citation. It
  is step 4's provenance repair, so it is allowed between cycles too: the link is the
  preview article the writeup was distilled from, the date is that article's own date, and
  nothing else in the writeup changes.
