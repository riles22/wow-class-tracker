# Archon aggregate access request

Status: ready for Riley to send, per owner decision2026-09-05; not sent.

To: support@warcraftlogs.com

Subject: Supported daily aggregate access for a small WoW spec tracker

Hello Archon team,

I maintain a personal, publicly accessible WoW Class Tracker at https://riles22.github.io/wow-class-tracker/. It compares attributed class/spec tier lists and quantitative measurements, preserves source dates, and links readers back to the providers. It refreshes once daily through GitHub Actions.

I would like to ask whether you offer a supported endpoint, JSON/CSV export, or other approved way to retrieve and display these Archon aggregates for the current WoW season:

- Raid throughput tier letters by spec/role, currently Heroic all-bosses, with Mythic and individual-boss cuts kept separate.
- Mythic+ score tier letters by spec/role, for the +10 and higher, this-week, all-dungeons cut and individual dungeons.
- Published numeric throughput/score measurements and sample counts, including the selected raid 95th-percentile DPS/HPS statistics, plus raid survivability tiers where available.

We need the exact statistic definition, difficulty/key range, time window, season/partition, encounter, class/spec identifier, publication timestamp, sample count, and value/tier for each cut. Missing coverage should remain explicitly missing. We would retain attribution and links, cache the result, and follow your request limits and redistribution requirements.

Ordinary requests currently receive verification challenges. We would prefer an approved integration and are not seeking to bypass those challenges. Our existing Warcraft Logs client-credentials API access works for supported WoW leaderboard metrics; those sampled leaderboards do not reproduce Archon's published aggregates, so we keep them separately labeled.

Is an approved aggregate feed or export available for this use? If so, what access process, attribution/licensing conditions, refresh limits, and costs apply? Please do not activate a paid service; I would review any pricing first. If there is no public interface, is there a supported manual export or another contact for this request?

Thank you,
Riley

---

Recipient verified against Archon's [official support guidance](https://www.archon.gg/wow/articles/news/now-supporting-fellowship-logging-builds-and-database). This request does not imply that a feed or license is already available.
