# paste-discord run log

Keep the newest ~20 entries; prune older ones when appending. What must survive pruning:
which specs have had a pasted writeup, and any date a paste supplied for a previously
grandfathered writeup (that is how `UNDATED_WRITEUPS` in `src/validate.mjs` shrinks —
if the removal is recorded nowhere, nobody can tell a supplied date from a guessed one).

- 2026-07-26 (skill created, interactive — Opus 5) · No pastes yet. Created alongside the
  `ptr.asOf` requirement so the two land together: the gate makes a date mandatory on every
  new writeup, and this skill is where the date comes from, since Discord content is never
  fetched (hard rule 6) and the reader is the only party who knows when it was said.

  **Starting state, for whoever runs this first.** 29 writeups exist, **none dated**. 12
  carry a `source` URL; 17 are `sourceLabel`-only. Of those 17: **14 say "Wowhead 12.1 class
  preview"** — a public article stored as unclickable text, so those are upgradeable to a
  real citation the moment someone supplies the URL — and **3 are genuinely unlinkable**:
  Paladin Holy (Clarius, Hammer of Wrath), Paladin Protection (Woliance & Fluttershy, Hammer
  of Wrath), and the three Warrior specs (Archimtiros / Mwahi, Skyhold — guide-byline
  authority, `transcribable: false` territory).

  All 29 are grandfathered in `UNDATED_WRITEUPS`. Their dates are **not** recoverable:
  the Wowhead previews' article dates were never recorded, and hard rule 1 forbids filling
  them in from memory. They get dates only by someone supplying them or by the writeup being
  redone from a fresh, dated read.
