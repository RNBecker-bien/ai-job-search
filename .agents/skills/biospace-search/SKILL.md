---
name: biospace-search
version: 1.0.0
description: >
  Use this skill to search live job listings on BioSpace (jobs.biospace.com), the
  biotech, pharmaceutical, and clinical-research industry job board covering the US
  life-sciences market. Invoke for biotech jobs, pharma jobs, life sciences jobs,
  clinical research jobs, research associate openings, lab jobs, or any biotech/pharma
  hiring search — including contract-to-hire and temp-to-hire listings that BioSpace
  carries alongside permanent roles. Trigger phrases: biospace, biotech jobs, pharma
  jobs, life sciences jobs, clinical research jobs, research associate jobs.
context: fork
enabled: true  # set to false to keep this portal installed but have /scrape skip it
allowed-tools: Bash(bun run .agents/skills/biospace-search/cli/src/cli.ts *)
---

# BioSpace Search Skill

Search live job listings from BioSpace's public job board — biotech, pharmaceutical, and
clinical-research roles across the US. No authentication, no API key, and **zero runtime
dependencies** — it runs with just `bun`.

## When to use this skill

- Search for biotech/pharma/life-sciences job openings, optionally filtered by location
- Find contract-to-hire and temp-to-hire postings (BioSpace's own staffing-partner
  listings carry these explicitly, e.g. titles tagged "(Contract/Temporary)")
- Get the full description, salary, and apply link for a specific job listing

## Commands

### Search job listings

```bash
bun run .agents/skills/biospace-search/cli/src/cli.ts search [flags]
```

Key flags:
- `--query <text>` / `-q <text>` — keyword search (title, skill, role). Recommended.
- `--location <text>` / `-l <text>` — state, city, or region, e.g. `"california"`,
  `"Irvine, CA"`, `"massachusetts"`. Best-effort match against BioSpace's own facet
  terms; omit to search nationwide.
- `--jobage <days>` — accepted for interface consistency with other portal skills, but
  **BioSpace's search page has no date-posted filter or reliable per-listing date**, so
  this flag currently has no effect. Use `detail` on a specific listing to see its exact
  posting date.
- `--page <n>` — page number (1-indexed, 20 results per page).
- `--limit <n>` / `-n <n>` — cap total results emitted (client-side).
- `--format json|table|plain` — default `json`.

### Fetch full job detail

```bash
bun run .agents/skills/biospace-search/cli/src/cli.ts detail <id|url> [--format json|plain]
```

`id` is the numeric job ID from `search` results (e.g. `3065576`). You may also pass a
full BioSpace `/job/<id>/...` URL. Returns the full description, salary range (when
posted), employment type, posting/expiry dates, and the external apply link.

## Usage examples

```bash
# Research associate roles in Irvine, CA
bun run .agents/skills/biospace-search/cli/src/cli.ts search -q "research associate" -l "Irvine, CA" --format table

# Contract-to-hire roles anywhere in California
bun run .agents/skills/biospace-search/cli/src/cli.ts search -q "contract to hire" -l california --format table

# Quality engineer roles, nationwide
bun run .agents/skills/biospace-search/cli/src/cli.ts search -q "quality engineer" --format table

# Full detail for a specific job
bun run .agents/skills/biospace-search/cli/src/cli.ts detail 3065576 --format plain
```

## Output formats

| Format | Best for |
|--------|----------|
| `json` | Default — programmatic use, passing IDs to `detail` |
| `table` | Quick human-readable scanning |
| `plain` | Reading a single job's full detail (`detail` command) |

All errors are written to **stderr** as `{ "error": "...", "code": "..." }` and the process exits with code `1`.

## Notes

- Data is from BioSpace's public `/jobs/` and `/job/<id>/` pages — no credentials
  required, and `robots.txt` allows both paths.
- Page size is fixed at 20 results per page.
- The CLI retries 429/5xx with exponential backoff, matching every other portal skill in
  this repo.
- `--location` is a best-effort path-segment slug (BioSpace's own facet links use terms
  like state names and cities) — an unrecognized term returns few or no results rather
  than erroring, so don't over-trust it for obscure place names.
- Job IDs are numeric (e.g. `3065576`); the URL segment after the ID is cosmetic and can
  be anything — BioSpace resolves by ID alone.
