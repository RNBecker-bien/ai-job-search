---
name: lever-search
version: 1.0.0
description: >
  Use this skill to search live job listings at Penumbra, Inc. — a medical
  device (neurovascular/thrombectomy) company that hosts its careers page on
  Lever — via Lever's public JSON Postings API. Covers Penumbra with one CLI
  (extensible to more Lever-hosted employers by editing a registry file).
  Trigger phrases: Penumbra jobs, Penumbra careers, Lever job board, jobs.lever.co,
  medical device manufacturing engineer jobs, neurovascular device jobs,
  thrombectomy device jobs.
context: fork
enabled: true  # set to false to keep this portal installed but have /scrape skip it
allowed-tools: Bash(bun run .agents/skills/lever-search/cli/src/cli.ts *)
---

# Lever Search Skill

Search live job listings from Lever's public Postings API (`api.lever.co`)
across a fixed registry of target companies — currently **Penumbra, Inc.**
No authentication needed; this is a genuinely public, unauthenticated JSON
API, not a scrape (`api.lever.co/robots.txt` allows `/` with a 1-second
crawl delay).

## When to use this skill

- Search open roles at Penumbra by keyword
- Filter by location (e.g. California, Alameda)
- Filter by recency (posted within N days)
- Get the full description of a specific posting

## Commands

### Search job listings

```bash
bun run .agents/skills/lever-search/cli/src/cli.ts search [flags]
```

Key flags:
- `--company <slug>` / `-c <slug>` — `penumbrainc` or `all` (default). Only one company is registered today.
- `--query <text>` / `-q <text>` — keyword filter on job title (substring match)
- `--location <text>` / `-l <text>` — location filter (substring match, e.g. `California`, `Alameda`, `Roseville`)
- `--jobage <days>` — only postings created within N days
- `--page <n>` — 1-indexed page (client-side pagination)
- `--limit <n>` / `-n <n>` — results per page. Default 25.
- `--format json|table|plain` — default `json`

> **No server-side search.** Penumbra's Lever site returns its full current
> job list on every call; `--query`/`--location`/`--jobage` all filter
> client-side after fetching. This is fast (the board is small, under 100
> postings) but means an empty `--query` still returns every open role.

### Fetch full job detail

```bash
bun run .agents/skills/lever-search/cli/src/cli.ts detail <id|url> [--format json|plain]
```

`id` is the composite `<company-slug>:<posting-id>` from a `search` result
(e.g. `penumbrainc:270ab137-6144-4126-aced-a4d4094048d6`). You may also pass
the full `jobs.lever.co` URL. Returns the full plain-text description and
posting metadata.

## Usage examples

```bash
# Manufacturing/R&D engineering roles at Penumbra
bun run .agents/skills/lever-search/cli/src/cli.ts search -q "engineer" --format table

# Everything open at Penumbra in California
bun run .agents/skills/lever-search/cli/src/cli.ts search --company penumbrainc --location California --format table

# Roles posted in the last 14 days
bun run .agents/skills/lever-search/cli/src/cli.ts search --jobage 14 --format table

# Full detail for a specific posting
bun run .agents/skills/lever-search/cli/src/cli.ts detail penumbrainc:270ab137-6144-4126-aced-a4d4094048d6 --format plain
```

## Output formats

| Format | Best for |
|--------|----------|
| `json` | Default — programmatic use, passing a result's `id` to `detail` |
| `table` | Quick human-readable scanning |
| `plain` | Reading a single job's full detail (`detail` command) |

All errors are written to **stderr** as `{ "error": "...", "code": "..." }` and the process exits with code `1`.

## Adding another Lever-hosted company

Edit `.agents/skills/lever-search/cli/src/companies.ts` and add
`{ slug, label }`. The slug is the token in the company's careers URL
(`jobs.lever.co/<slug>`). See that file's comment and `cli/README.md` for
the verification curl command.

## Notes

- Data is from the public `api.lever.co` API — no credentials required.
- Job ids are composite (`<company-slug>:<posting-id>`, where `posting-id` is
  a UUID) so `search --company all` results stay unambiguous when passed to
  `detail`.
- `date` reflects the posting's `createdAt` field, converted from Unix
  milliseconds to ISO 8601.
- Registry currently covers `penumbrainc` (confirmed 2026-08-26) — a company
  confirmed to run its careers page on Lever. See
  `.claude/skills/job-scraper/search-queries.md` for other target companies
  still on the WebSearch `site:` fallback because their ATS platform isn't
  yet confirmed or CLI-integrated.
