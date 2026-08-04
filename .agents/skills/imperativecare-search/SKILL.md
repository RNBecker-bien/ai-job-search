---
name: imperativecare-search
version: 1.0.0
description: >
  Use this skill to search live job listings at Imperative Care — a
  Campbell, CA neurovascular/stroke-device company hosting its careers page
  on the ApplyToJob (JazzHR) applicant tracking system — by scraping the
  public, unauthenticated careers site. Extensible to more JazzHR-hosted
  employers by editing a registry file. Trigger phrases: Imperative Care
  jobs, Imperative Care careers, ApplyToJob job board, JazzHR job board,
  neurovascular device jobs, stroke device jobs, endovascular device jobs,
  R&D engineer medical device jobs.
context: fork
enabled: true  # set to false to keep this portal installed but have /scrape skip it
allowed-tools: Bash(bun run .agents/skills/imperativecare-search/cli/src/cli.ts *)
---

# Imperative Care Search Skill

Search live job listings from Imperative Care's ApplyToJob (JazzHR) careers
site (`imperativecare.applytojob.com`) — a fixed registry of one company
today, extensible to any other JazzHR-hosted employer. No authentication
needed; this scrapes the same public HTML pages a browser loads (there is no
JSON API behind this ATS).

## When to use this skill

- Search open roles at Imperative Care by keyword
- Filter by location (e.g. Campbell, CA)
- Get the full description of a specific posting

## Commands

### Search job listings

```bash
bun run .agents/skills/imperativecare-search/cli/src/cli.ts search [flags]
```

Key flags:
- `--company <slug>` / `-c <slug>` — `imperativecare` or `all` (default). Only one company is registered today.
- `--query <text>` / `-q <text>` — keyword filter on job title (substring match)
- `--location <text>` / `-l <text>` — location filter (substring match, e.g. `Campbell`, `California`)
- `--jobage <days>` — **accepted but has no effect.** This ATS exposes no posting date anywhere on the listing or detail page; a note is added to `meta.jobageIgnored` when passed.
- `--page <n>` — 1-indexed page (client-side pagination)
- `--limit <n>` / `-n <n>` — results per page. Default 25.
- `--format json|table|plain` — default `json`

> **No server-side search.** The careers site returns its full current
> job list on every call; `--query`/`--location` filter client-side after
> fetching. This is fast (the board is small, ~30 postings) but means an
> empty `--query` still returns every open role.

### Fetch full job detail

```bash
bun run .agents/skills/imperativecare-search/cli/src/cli.ts detail <id|url> [--format json|plain]
```

`id` is the composite `<company-slug>:<token>` from a `search` result (e.g.
`imperativecare:32CBp7t1Fy`). You may also pass the full
`applytojob.com` job URL. Returns the full HTML-stripped description plus
employment type and experience level (detail-page-only fields not present in
`search` results).

## Usage examples

```bash
# All R&D engineering roles
bun run .agents/skills/imperativecare-search/cli/src/cli.ts search -q "R&D Engineer" --format table

# Everything open, filtered to Campbell, CA
bun run .agents/skills/imperativecare-search/cli/src/cli.ts search --location Campbell --format table

# Quality roles
bun run .agents/skills/imperativecare-search/cli/src/cli.ts search -q "quality" --format table

# Entry-level R&D Engineer I posting
bun run .agents/skills/imperativecare-search/cli/src/cli.ts search -q "Engineer, I" --format table

# Full detail for a specific posting
bun run .agents/skills/imperativecare-search/cli/src/cli.ts detail imperativecare:32CBp7t1Fy --format plain
```

## Output formats

| Format | Best for |
|--------|----------|
| `json` | Default — programmatic use, passing a result's `id` to `detail` |
| `table` | Quick human-readable scanning |
| `plain` | Reading a single job's full detail (`detail` command) |

All errors are written to **stderr** as `{ "error": "...", "code": "..." }` and the process exits with code `1`.

## Adding another JazzHR/ApplyToJob-hosted company

Edit `.agents/skills/imperativecare-search/cli/src/companies.ts` and add
`{ slug, label, subdomain }`. The subdomain is the token in the company's
careers URL (`<subdomain>.applytojob.com/apply/...`). See that file's
comment and `cli/README.md` for the verification curl command.

## Notes

- Data is scraped from the public `<subdomain>.applytojob.com/apply` and
  `/apply/<token>` pages — no credentials required. `robots.txt` disallows
  only `/cb` and blocks only `SemrushBot`/`dotbot` outright; the paths this
  CLI uses are not disallowed for a normal user agent.
- **No posting date exists anywhere on this ATS** — `date` is always `null`
  in results; `--jobage` is accepted for interface consistency with the
  other portal skills but has no effect.
- Job ids are composite (`<company-slug>:<token>`) so `search --company all`
  results stay unambiguous when passed to `detail`.
- A bad/expired job token returns HTTP 410 (Gone), not 404 — both are
  treated as "not found."
- Registry currently covers `imperativecare` only (confirmed live
  2026-08-01, platform confirmed as JazzHR via `robots.txt`'s
  `app.jazz.co` sitemap reference).
