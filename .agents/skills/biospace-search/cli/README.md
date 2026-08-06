# biospace-cli

CLI for searching jobs on **BioSpace** (jobs.biospace.com), the biotech / pharma /
clinical research industry job board ("The Home of the Life Sciences Industry").

**Data source**: BioSpace's public `/jobs/` search pages and `/job/<id>/` detail pages
(Madgex-powered job board). Search results are server-rendered HTML; detail pages embed a
`schema.org/JobPosting` JSON-LD block.
**Authentication**: None required.
**Dependencies**: None (plain `bun` + `fetch`). `bun install` is optional and only pulls dev type defs.

## Installation

```bash
cd .agents/skills/biospace-search/cli
bun install   # optional — only installs TypeScript dev types
```

The CLI runs without any install because it has zero runtime dependencies.

## Commands

| Command | Description |
|---------|-------------|
| `search` | Search for job listings |
| `detail` | Fetch full detail for a single job listing |

`search` accepts `--format json|table|plain` (default `json`); `detail` accepts `--format json|plain`.
All errors are written to **stderr** as `{ "error": "...", "code": "..." }` with exit code `1`.

## Quick examples

```bash
# Research associate roles in Irvine, CA
bun run src/cli.ts search -q "research associate" -l "Irvine, CA" --format table

# Contract-to-hire roles anywhere in California
bun run src/cli.ts search -q "contract to hire" -l california --format table

# Nationwide, no location filter
bun run src/cli.ts search -q "quality engineer" --format table

# Full detail for one job
bun run src/cli.ts detail 3065576 --format plain
```

See `../SKILL.md` for the full flag reference.

## Search flags

| Flag | Alias | Description |
|------|-------|--------------|
| `--query` | `-q` | Keywords (title / skill / role). |
| `--location` | `-l` | State, city, or region. Best-effort slug match against BioSpace's own facet terms — omit to search nationwide. |
| `--jobage` | | Accepted but **not supported** by BioSpace's search page — no effect (see `url-reference.md`). |
| `--page` | | 1-indexed page (20 results/page). |
| `--limit` | `-n` | Cap results emitted. |
| `--format` | | `json` \| `table` \| `plain`. |
