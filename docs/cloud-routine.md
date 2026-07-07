# ⛔ SUPERSEDED — see `.github/workflows/nightly.yml`

> **2026-07-07:** The claude.ai cloud-routine approach below is retired. Two test runs
> proved the routine itself worked but could never publish: the Claude-for-GitHub
> connector is **read-only** (every push 403s, even to its own scratch branch), and its
> permission level isn't user-upgradable. The nightly now runs as a **GitHub Actions
> workflow** (`.github/workflows/nightly.yml`) — Claude Code headless on a GitHub runner,
> which always has write access to its own repo. Secrets live in
> Settings → Secrets → Actions: `CLAUDE_CODE_OAUTH_TOKEN` (from `claude setup-token`,
> ~1-year validity — renew it), `WCL_CLIENT_ID`, `WCL_CLIENT_SECRET`.
> This file is kept for the routine-prompt history only.

# Cloud routine: nightly tracker refresh (machine-off automation)

Setup lives at **claude.ai/code/routines** → New routine. Settings:

| Setting | Value |
|---|---|
| Repository | `riles22/wow-class-tracker` (authorize the GitHub App when asked) |
| **Branch pushes** | **Enable "Allow unrestricted branch pushes"** for this repo. This is the fix for the first run landing nothing: by default routines push a `claude/…` branch and open a PR, which never triggers the deploy (that fires only on a push to `master`). With the toggle on, the routine's `git push origin master` in step 5 works. |
| Environment secrets | `WCL_CLIENT_ID` and `WCL_CLIENT_SECRET` — the Warcraft Logs API client (register free at warcraftlogs.com/api/clients if you haven't). Lets the metrics refresh authenticate as you via the sanctioned API instead of scraping HTML from a datacenter IP. |
| Environment | Network access ON (default); no setup script needed (`pip install -U yt-dlp` happens in-run) |
| Trigger | Schedule → Daily → 3:10 AM local |
| After saving | **Run once immediately** — the first run doubles as the cloud-connectivity test; read its report's CLOUD CONNECTIVITY section |

The local `wow-ptr-watch` scheduled task should be **disabled** once the cloud routine's
first run pushes to master successfully (two independent pushers risk duplicate takes);
keep it for manual runs.

**Creator takes during a machine-off stretch:** yt-dlp transcript fetches are the one part
likely to fail from a cloud IP (YouTube bot-blocks datacenters). That's acceptable — the
routine logs those videos as "pending" and moves on; creator takes are the non-time-critical
opinion layer and batch-catch-up on the next local run. Everything time-sensitive (PTR
builds, tuning, raid-testing logs, tiers, metrics-via-API) flows regardless.

## Routine prompt (paste verbatim)

You maintain the WoW Midnight 12.1 PTR spec tracker in riles22/wow-class-tracker (this
cloud session has the repo checked out; run `git pull origin master` first and work on
master). The public site riles22.github.io/wow-class-tracker auto-deploys from master via
the repo's GitHub Actions.

Read CLAUDE.md (the project contract) before acting. The refresh skills live in the repo
at .claude/skills/ — ptr-watch, watch-creators, refresh-tiers, refresh-metrics — each
SKILL.md has the exact procedure, verified fetch recipes, and hard-won gotchas; follow
them exactly.

Every run:

1. PTR watch (.claude/skills/ptr-watch/SKILL.md): Wowhead news RSS + the official forum
   thread (URL in data/ptr-builds.json) for PTR builds newer than the newest logged one;
   Warcraft Logs zone 54 (PTR raid testing) and zone 52 (Dummy Dome) with the skill's
   change detection (re-ingest only when total parse counts increased); distill new spec
   writeups per the auto-confirm policy — faithful distillation of the SOURCE's verdict,
   mandatory source URL or sourceLabel.

2. Creators watch (.claude/skills/watch-creators/SKILL.md): poll the creator YouTube RSS
   feeds in data/community.json, title-filter for Midnight/12.1 relevance, fetch
   transcripts with yt-dlp (install first: `python3 -m pip install -U yt-dlp`), distill
   cited per-spec takes. CLOUD CAVEAT: YouTube may bot-block datacenter IPs. If transcript
   downloads fail after the skill's normal retries, do NOT hammer — record the new video
   IDs as "pending (cloud IP blocked)" in the skill's log.md, skip their distillation, and
   say so in the report.

3. Weekly freshness: if the newest tier-list `snapshot` date in data/sources.json is more
   than 6 days old, also run .claude/skills/refresh-tiers/SKILL.md; if the newest live
   (non-PTR) metric `asOf` in data/specs.json is more than 6 days old, also run
   .claude/skills/refresh-metrics/SKILL.md. For Warcraft Logs, use the sanctioned v2 API
   authenticated with the WCL_CLIENT_ID / WCL_CLIENT_SECRET environment variables (the
   refresh-metrics skill documents the OAuth flow); do not scrape the HTML endpoint from
   this environment. Be a polite guest on every source.

4. Run `npm test && npm run build`. If either fails: `git checkout -- data/ dist/`, report
   the failure with the error output, and do NOT commit or push.

5. If any data/ file changed this run: `node src/snapshot.mjs`, then stage EXPLICITLY —
   `git add data/ dist/ ".claude/skills/*/log.md"` (never `git add -A`) — commit with a
   concise one-line summary ("Nightly refresh <date>: <what changed>"), ending the message
   with: Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
   Then push to master. If the push is rejected, `git pull --rebase` once and push again;
   if it still fails, report it — NEVER force-push or rewrite history. If only the skill
   logs changed, commit and push "Nightly refresh <date>: no updates" the same way.

6. Finish with a report: builds found · zone-54 and zone-52 state · videos processed and
   takes added · weekly refreshes run (or skipped as fresh) · whether you pushed · and a
   CLOUD CONNECTIVITY section listing each endpoint you hit and whether it worked from
   this environment (Wowhead RSS, Blizzard forum JSON, WCL statistics, YouTube RSS,
   yt-dlp transcripts, tier-list pages when refreshed).

Hard rules (also in CLAUDE.md): all game data is fetched live, never from model memory —
Midnight postdates every model's training cutoff, so anything unfetchable stays absent
rather than guessed; if nothing is new anywhere, change no data; never hand-edit
dist/index.html; PTR-quality data stays era-labeled and out of live baselines; creator
takes are cited opinion and never move a tier; be a polite guest (single fetches, sleep
between yt-dlp requests, backoff on 404s instead of hammering).
