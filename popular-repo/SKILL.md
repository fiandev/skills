---
name: popular-repo
description: Find the most popular GitHub repositories for a given period, validate their usefulness, and deliver a social-ready feed with name, a catchy description (max 166 chars), and author. Use when the user asks for trending/popular repos, a repo feed, or social media repo recommendations.
---

# popular-repo

Build a social-media-ready feed of the most popular GitHub repositories.

## When to use

Use this skill when the user wants trending/popular GitHub repositories, a "repo of the day/week" feed, or social content highlighting popular repos.

## Instructions

1. **Search popular repositories.** Use `scripts/repo-trending.ts`, which exports
   `getTrending(period)`. Run it with the requested period — one of
   `1day` (1), `1week` (7), `1month` (30) — defaulting to `1week` when unspecified:
   `bun scripts/repo-trending.ts 1week`.
   It returns `{ period, filter, since, total, repositories[] }`, where each repository
   has `rank`, `name`, `description`, `url`, `stars`, `forks`, `language`,
   `created_at`, `updated_at`. See `github-1week.json` for a sample payload.

2. **Take the top 3–5 repositories by stars.** Sort `repositories` by `stars`
   descending and keep the top 3 to 5. Use 5 when enough qualify, 3 as the minimum.

3. **Validate usefulness of each repo.** For every selected repo, run
   `scripts/repo-details.ts` with its owner and repo name:
   `bun scripts/repo-details.ts <owner> <repo>` or
   `bun scripts/repo-details.ts <owner>/<repo>`.
   Check the returned `stats`, `metadata` (license, topics, last `pushed_at`),
   `features`, and `releases` to confirm the repo is active, non-archived,
   non-disabled, and genuinely useful. Drop any repo that fails validation and
   backfill from the next highest-star candidate, keeping 3–5 total.

4. **Deliver the output.** Default format is **plain text** (readable list, no code
   block). Use another format only when the user explicitly asks for it (e.g. JSON,
   Markdown, table, tweet thread, CSV) and follow their request.

   Every item MUST include exactly these fields, whatever the format:
   - `name` — repo full name (`owner/repo`)
   - `description` — catchy, social-ready description, **max 166 characters**,
     based on but not a verbatim copy of the repo's description
   - `author` — repo author (owner login from `name` or `owner.username`)

   Default plain-text example:
   ```
   1. public-apis/public-apis — by public-apis
      A collective list of free APIs for use in software and web development.
   ```

   JSON example (only when requested):
   ```json
   [
     {
       "name": "public-apis/public-apis",
       "description": "A collective list of free APIs for use in software and web development.",
       "author": "public-apis"
     }
   ]
   ```

## Notes

- Requires network access to the GitHub API; unauthenticated requests are rate-limited
  (search: 10 req/min, core: 60 req/hour).
- Never fabricate stars, repos, or metadata — use only data returned by the scripts.
- Keep descriptions within the 166-character limit; trim rather than overflow.
