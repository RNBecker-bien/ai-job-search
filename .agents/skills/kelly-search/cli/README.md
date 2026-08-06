# kelly-cli

CLI for searching jobs on **myKelly** (www.mykelly.com), Kelly Services' candidate job
board — includes their Science, Engineering, Technology & Telecom staffing division, a
strong source of contract-to-hire and temp-to-hire life-sciences roles.

**Data source**: myKelly's FacetWP-powered `/job-search/` results, driven directly via
its backing `wp-json/facetwp/v1/refresh` POST endpoint (stateless — no cookies or nonce
required). Detail pages are normal WordPress posts embedding a `schema.org/JobPosting`
JSON-LD block.
**Authentication**: None required.
**Dependencies**: None (plain `bun` + `fetch`). `bun install` is optional and only pulls dev type defs.

## Installation

```bash
cd .agents/skills/kelly-search/cli
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
# Research associate roles, nudged toward Irvine, CA
bun run src/cli.ts search -q "research associate Irvine" --format table

# Clinical research roles posted in the last 14 days
bun run src/cli.ts search -q "clinical research" --jobage 14 --format table

# Lab technician roles, nudged toward California
bun run src/cli.ts search -q "lab technician California" --format table

# Full detail for one job (bare numeric ID — resolved internally to its real URL)
bun run src/cli.ts detail 10324490 --format plain
```

See `../SKILL.md` for the full flag reference.

## Search flags

| Flag | Alias | Description |
|------|-------|--------------|
| `--query` | `-q` | Keywords (title / skill / role). No separate location flag — fold a city/state into this instead; it re-ranks, doesn't filter (see `../url-reference.md`). |
| `--jobage` | | Posted within N days — filtered client-side against each listing's real `published_date`. |
| `--page` | | 1-indexed page (10 results/page). |
| `--limit` | `-n` | Cap results emitted. |
| `--format` | | `json` \| `table` \| `plain`. |

## A note on `detail`

Unlike this repo's other portal skills, a Kelly job's URL slug is **not** cosmetic — the
numeric ID alone 404s. Passing a bare ID to `detail` costs one extra request internally
(a keyword search on the ID itself, which reliably returns exactly that job) to resolve
the real permalink before fetching it. Passing a full URL (as returned by `search`)
skips that step.
