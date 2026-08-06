---
name: greenhouse-search
version: 1.0.0
description: >
  Use this skill to search live job listings at BillionToOne, Natera, Twist
  Bioscience, Amyris, and Cala Health — biomedical/diagnostics/genomics/
  synthetic-biology/neuromodulation companies that host their careers page on
  Greenhouse — via Greenhouse's public JSON job-board API. Covers all five
  with one CLI (extensible to more Greenhouse-hosted companies by editing a
  registry file). Trigger phrases: BillionToOne jobs, Natera jobs, Natera
  careers, Twist Bioscience jobs, Twist Bioscience careers, Amyris jobs,
  Amyris careers, Cala Health jobs, Cala Health careers, Greenhouse job
  board, molecular diagnostics jobs, prenatal testing jobs, genomics company
  jobs, DNA synthesis jobs, cell-free DNA jobs, synthetic biology jobs,
  neuromodulation jobs.
context: fork
enabled: true  # set to false to keep this portal installed but have /scrape skip it
allowed-tools: Bash(bun run .agents/skills/greenhouse-search/cli/src/cli.ts *)
---

# Greenhouse Search Skill

Search live job listings from Greenhouse's public Job Board API
(`boards-api.greenhouse.io`) across a fixed registry of target companies —
currently **BillionToOne**, **Natera**, **Twist Bioscience**, **Amyris**, and
**Cala Health**. No authentication needed; this is a genuinely public,
unauthenticated JSON API, not a scrape.

## When to use this skill

- Search open roles at BillionToOne, Natera, Twist Bioscience, or Amyris by keyword
- Filter by location (e.g. California, remote)
- Filter by recency (posted/updated within N days)
- Get the full description of a specific posting

## Commands

### Search job listings

```bash
bun run .agents/skills/greenhouse-search/cli/src/cli.ts search [flags]
```

Key flags:
- `--company <slug>` / `-c <slug>` — `billiontoone`, `natera`, `twistbioscience`, `amyrisinc`, `calahealth`, or `all` (default). Omit to search all five.
- `--query <text>` / `-q <text>` — keyword filter on job title (substring match)
- `--location <text>` / `-l <text>` — location filter (substring match, e.g. `California`, `Remote`, `Menlo Park`)
- `--jobage <days>` — only postings updated within N days
- `--page <n>` — 1-indexed page (client-side pagination)
- `--limit <n>` / `-n <n>` — results per page. Default 25.
- `--format json|table|plain` — default `json`

> **No server-side search.** These companies' Greenhouse boards return their
> full current job list on every call; `--query`/`--location`/`--jobage` all
> filter client-side after fetching. This is fast (boards are small) but
> means an empty `--query` still returns every open role.

### Fetch full job detail

```bash
bun run .agents/skills/greenhouse-search/cli/src/cli.ts detail <id|url> [--format json|plain]
```

`id` is the composite `<company-slug>:<job-id>` from a `search` result (e.g.
`billiontoone:4713218005`). You may also pass the full `job-boards.greenhouse.io`
URL. Returns the full HTML-stripped description and posting metadata.

## Usage examples

```bash
# Quality/test engineering roles across all four companies
bun run .agents/skills/greenhouse-search/cli/src/cli.ts search -q "quality" --format table

# Everything open at Natera in California
bun run .agents/skills/greenhouse-search/cli/src/cli.ts search --company natera --location California --format table

# Research associate roles posted in the last 14 days
bun run .agents/skills/greenhouse-search/cli/src/cli.ts search -q "research associate" --jobage 14 --format table

# Remote roles at Twist Bioscience
bun run .agents/skills/greenhouse-search/cli/src/cli.ts search --company twistbioscience --location Remote --format table

# Full detail for a specific posting
bun run .agents/skills/greenhouse-search/cli/src/cli.ts detail billiontoone:4713218005 --format plain
```

## Output formats

| Format | Best for |
|--------|----------|
| `json` | Default — programmatic use, passing a result's `id` to `detail` |
| `table` | Quick human-readable scanning |
| `plain` | Reading a single job's full detail (`detail` command) |

All errors are written to **stderr** as `{ "error": "...", "code": "..." }` and the process exits with code `1`.

## Adding another Greenhouse-hosted company

Edit `.agents/skills/greenhouse-search/cli/src/companies.ts` and add
`{ slug, label }`. The slug is the token in the company's careers URL
(`job-boards.greenhouse.io/<slug>/...`). See that file's comment and
`cli/README.md` for the verification curl command.

## Notes

- Data is from the public `boards-api.greenhouse.io` API — no credentials required.
- Job ids are composite (`<company-slug>:<job-id>`) so `search --company all` results stay unambiguous when passed to `detail`.
- `date` reflects the posting's `updated_at` (falls back to `first_published`).
- Registry currently covers `billiontoone`, `natera`, `twistbioscience` (confirmed 2026-07-22), `amyrisinc` (confirmed 2026-07-27), and `calahealth` (confirmed 2026-08-05) — companies confirmed to run their careers page on Greenhouse. Applied Medical, Cedars-Sinai, and Quest Diagnostics were checked and do **not** use Greenhouse; they're covered by the WebSearch `site:` fallback in `.claude/skills/job-scraper/search-queries.md` instead.
- Amyris emerged from Chapter 11 bankruptcy in May 2024 and is still stabilizing financially as of 2026 — its Greenhouse board is live and hiring, but factor that history into any application decision.
