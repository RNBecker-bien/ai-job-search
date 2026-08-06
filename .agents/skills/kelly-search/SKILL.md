---
name: kelly-search
version: 1.0.0
description: >
  Use this skill to search live job listings on myKelly (www.mykelly.com), Kelly
  Services' candidate job board, including its Science, Engineering, Technology &
  Telecom staffing division. Invoke for Kelly Services jobs, temp-to-hire jobs,
  contract-to-hire jobs, staffing agency jobs, or life-sciences/scientific staffing
  roles in the US — Kelly is one of the largest life-sciences staffing agencies and
  regularly carries research associate, lab technician, and clinical research roles
  as contract-to-hire placements. Trigger phrases: Kelly Services, myKelly, temp to
  hire, contract to hire, staffing agency jobs, Kelly Science jobs.
context: fork
enabled: true  # set to false to keep this portal installed but have /scrape skip it
allowed-tools: Bash(bun run .agents/skills/kelly-search/cli/src/cli.ts *)
---

# myKelly (Kelly Services) Search Skill

Search live job listings from myKelly, Kelly Services' candidate-facing job board — a
strong source of temp-to-hire and contract-to-hire roles, including through their
Science, Engineering, Technology & Telecom division. No authentication, no API key, and
**zero runtime dependencies** — it runs with just `bun`.

## When to use this skill

- Search for staffing-agency job openings, optionally filtered by location
- Find contract-to-hire and temp-to-hire postings specifically — Kelly's own
  `employment_type` field distinguishes `Temporary`, `Temp to Hire`, and `Direct Hire`
- Get the full description, pay rate, and posting date for a specific job listing

## Commands

### Search job listings

```bash
bun run .agents/skills/kelly-search/cli/src/cli.ts search [flags]
```

Key flags:
- `--query <text>` / `-q <text>` — keyword search (title, skill, role). Recommended.
  **There is no separate location flag** — Kelly's location facet requires
  Google-geocoded coordinates the CLI can't produce (see `url-reference.md`). Fold a
  city or state into `--query` instead (e.g. `"research associate Irvine"`); this
  nudges matching results higher in relevance order but does **not** filter out other
  locations, so always check each result's `location` field.
- `--jobage <days>` — posted within N days, filtered client-side against each listing's
  real posting date (Kelly's search reliably exposes this per result, unlike some other
  portal skills in this repo — see `url-reference.md`).
- `--page <n>` — page number (1-indexed, 10 results per page).
- `--limit <n>` / `-n <n>` — cap total results emitted (client-side).
- `--format json|table|plain` — default `json`.

### Fetch full job detail

```bash
bun run .agents/skills/kelly-search/cli/src/cli.ts detail <id|url> [--format json|plain]
```

`id` is the numeric job ID from `search` results (e.g. `10324490`), or a full
`mykelly.com/job/...` URL. A bare ID costs one extra internal lookup to resolve its real
URL first (Kelly's permalink slug is not cosmetic — see the CLI's README). Returns the
full description, pay rate, employment type, and posting/expiry dates.

## Usage examples

```bash
# Research associate roles, nudged toward Irvine, CA
bun run .agents/skills/kelly-search/cli/src/cli.ts search -q "research associate Irvine" --format table

# Clinical research roles posted in the last 14 days
bun run .agents/skills/kelly-search/cli/src/cli.ts search -q "clinical research" --jobage 14 --format table

# Lab technician roles, nudged toward California
bun run .agents/skills/kelly-search/cli/src/cli.ts search -q "lab technician California" --format table

# Full detail for a specific job
bun run .agents/skills/kelly-search/cli/src/cli.ts detail 10324490 --format plain
```

## Output formats

| Format | Best for |
|--------|----------|
| `json` | Default — programmatic use, passing IDs to `detail` |
| `table` | Quick human-readable scanning |
| `plain` | Reading a single job's full detail (`detail` command) |

All errors are written to **stderr** as `{ "error": "...", "code": "..." }` and the process exits with code `1`.

## Notes

- Data is from myKelly's public `/job-search/` results (via its own backing API) and
  `/job/<id>-<slug>/` detail pages. No credentials required.
- Page size is fixed at 10 results per page.
- `company` in search results is almost always `"Kelly Services"` itself — the actual
  end client is usually anonymized in the listing and sometimes named only in the full
  description (fetch `detail` to check).
- The CLI retries 429/5xx with exponential backoff, matching every other portal skill in
  this repo.
- Job IDs are numeric (e.g. `10324490`); unlike this repo's other portal skills, the URL
  slug after the ID is **not** cosmetic — see the `detail` note above.
