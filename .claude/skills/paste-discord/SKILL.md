---
name: paste-discord
description: Fold manually-pasted theorycrafter content (Discord posts, class-server analysis, anything the tracker may not fetch) into the tracker's writeup and creator-take layers with full provenance. Use when Riley pastes raw text from a class Discord or says "here's an update from Discord", "paste-in", "add this take", "I read this in <server>".
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
| A spec's overall 12.1 read (what changed, is it better or worse) | `spec.ptr` writeup in `data/specs.json` | `verdict` · `theme` · `summary` · `changes[]` · `set2`/`set4` · `watch` · `sourceLabel`/`source` · **`asOf`** |
| One cited opinion from a named specialist | `takes[]` in `data/creator-takes.json` | scoped to specs that creator is credible on |
| A cross-class season/meta read from a general creator | `metaNotes[]` in `data/creator-takes.json` | author must be in `generalCreators[]` |
| A tuning change from an official build | **Not this skill** — `ptr-watch`, from the forum thread | the forum post is canonical; Discord is hearsay about it |

That last row matters. If the paste is someone *relaying* patch notes, go get the notes. Only
the person's *analysis* belongs here.

### 4. Write it

- `asOf` is **required** on every new writeup — validation fails the build without it. The
  29 pre-2026-07-26 writeups are grandfathered in `UNDATED_WRITEUPS` (`src/validate.mjs`);
  **that list may only shrink.** If a paste supplies the real date for one of them, remove
  its name from the list in the same edit.
- `sourceLabel` format: `"<Who> (<Server>) — Discord"`, e.g.
  `"Clarius (Hammer of Wrath) — Discord"`. Add the channel when it disambiguates.
- The **verdict is the source's**. If the paste doesn't clearly support Positive / Mixed /
  Negative, say so and ask — do not split the difference to make it fit.
- If the source is uncertain or hedging, that belongs in `watch`, not smoothed out of the
  `summary`.
- Distill into the tracker's own words. Short direct quotes are fine when the phrasing *is*
  the point; wholesale copying is not.

### 5. Verify and finish

```
npm test && npm run build
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
- **14 of the grandfathered writeups cite "Wowhead 12.1 class preview" with no URL.** If a
  paste session is happening anyway, that is the cheapest moment to supply those links and
  dates — it upgrades 14 writeups from unverifiable attribution to checkable citation.
