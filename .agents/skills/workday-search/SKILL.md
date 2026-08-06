---
name: workday-search
version: 1.0.0
description: >
  Use this skill to search live job listings at Biogen, Amgen, Abbott,
  Genentech, Pfizer, Novartis, Vertex Pharmaceuticals, Regeneron, Resilience,
  Neurocrine Biosciences, Baxter, BioCryst Pharmaceuticals, Johnson & Johnson,
  Tandem Diabetes Care, Dexcom, iRhythm Technologies, Insulet, and Applied
  Materials — large biomedical/pharma/diagnostics/medtech/semiconductor-
  equipment companies that host their careers site on Workday — via Workday's
  public CXS JSON API. Covers all seventeen with one CLI (extensible to more
  Workday-hosted companies by editing a registry file). Trigger phrases:
  Biogen jobs, Biogen careers, Amgen jobs, Amgen careers, Abbott jobs, Abbott
  careers, Genentech jobs, Genentech careers, Pfizer jobs, Novartis jobs,
  Vertex Pharmaceuticals jobs, Regeneron jobs, Resilience jobs, Neurocrine
  jobs, Baxter jobs, BioCryst jobs, Tandem Diabetes jobs, Dexcom jobs,
  iRhythm jobs, Insulet jobs, Applied Materials jobs, Workday job board,
  pharma company jobs, medtech company careers, biotech company careers,
  semiconductor equipment careers.
context: fork
enabled: true  # set to false to keep this portal installed but have /scrape skip it
allowed-tools: Bash(bun run .agents/skills/workday-search/cli/src/cli.ts *)
---

# Workday Search Skill

Search live job listings from Workday's public CXS (Candidate Experience
Service) JSON API across a fixed registry of target companies — currently
**Biogen**, **Amgen**, **Abbott**, **Genentech**, **Pfizer**, **Novartis**,
**Vertex Pharmaceuticals**, **Regeneron**, **Resilience**, **Neurocrine
Biosciences**, **Baxter**, **BioCryst Pharmaceuticals**, **Johnson &
Johnson**, **Tandem Diabetes Care**, **Dexcom**, **iRhythm Technologies**,
**Insulet**, and **Applied Materials**. No authentication needed. Workday
sites are behind Akamai bot management, so treat this as best-effort: a
single tenant can start blocking non-browser traffic without warning (see
Notes).

## When to use this skill

- Search open roles at any registered company by keyword
- Filter by location (e.g. California, remote)
- Get the full description of a specific posting

## Commands

### Search job listings

```bash
bun run .agents/skills/workday-search/cli/src/cli.ts search [flags]
```

Key flags:
- `--company <slug>` / `-c <slug>` — `biogen`, `amgen`, `abbott`, `genentech`, `pfizer`, `novartis`, `vertex`, `regeneron`, `resilience`, `neurocrine`, `baxter`, `biocryst`, `jnj`, `tandem`, `dexcom`, `irhythm`, `insulet`, `appliedmaterials`, or `all` (default).
- `--query <text>` / `-q <text>` — keyword search (genuine server-side full-text on the Workday tenant)
- `--location <text>` / `-l <text>` — location filter (substring match against `locationsText`, applied client-side — Workday's location facets are opaque per-tenant IDs, not stable enough to hardcode)
- `--page <n>` — 1-indexed page
- `--limit <n>` / `-n <n>` — results per page, **per company** when `--company all`. Default 20, **hard-capped at 20** (Workday rejects `limit > 20` server-side with HTTP 400).
- `--format json|table|plain` — default `json`

> **Multi-company resilience**: when searching `all`, a single tenant failing
> (e.g. blocked by Akamai) does not abort the whole search — it's dropped
> from results and listed in `meta.failedCompanies`. Searching one named
> company that fails exits 1 with a JSON error.

### Fetch full job detail

```bash
bun run .agents/skills/workday-search/cli/src/cli.ts detail <id|url> [--format json|plain]
```

`id` is the composite `<company-slug>:<externalPath>` from a `search` result
(e.g. `amgen:/job/US---California---Thousand-Oaks/Senior-Director-Engineering_R-249191`).
You may also pass the full myworkdayjobs.com job URL. Returns the full
HTML-stripped description and posting metadata.

## Usage examples

```bash
# Quality/manufacturing roles across all four companies
bun run .agents/skills/workday-search/cli/src/cli.ts search -q "quality engineer" --format table

# Everything open at Amgen in California
bun run .agents/skills/workday-search/cli/src/cli.ts search --company amgen --location California --format table

# Genentech roles matching "automation"
bun run .agents/skills/workday-search/cli/src/cli.ts search --company genentech -q automation --format table

# Remote roles across all companies
bun run .agents/skills/workday-search/cli/src/cli.ts search --location Remote --format table

# Full detail for a specific posting
bun run .agents/skills/workday-search/cli/src/cli.ts detail "amgen:/job/US---California---Thousand-Oaks/Senior-Director-Engineering_R-249191" --format plain
```

## Output formats

| Format | Best for |
|--------|----------|
| `json` | Default — programmatic use, passing a result's `id` to `detail` |
| `table` | Quick human-readable scanning |
| `plain` | Reading a single job's full detail (`detail` command) |

All errors are written to **stderr** as `{ "error": "...", "code": "..." }` and the process exits with code `1`.

## Adding another Workday-hosted company

Edit `.agents/skills/workday-search/cli/src/companies.ts` and add an entry
with `slug`, `label`, `subdomain`, `wd` (shard), `tenant`, and `site` — all
visible in the company's careers URL. See `cli/README.md` for the curl check
to confirm the CXS endpoint resolves before adding it (some tenants reject
this API outright — see Notes).

## Notes

- **`limit` is hard-capped at 20** — Workday's CXS `/jobs` endpoint returns `HTTP 400` for `limit > 20`. Use `--page` to page further into results instead of raising `--limit`.
- Data is from the public Workday CXS API — no credentials required, but it is
  the same API a browser uses, not an official bulk data feed. Keep request
  volume low.
- `postedOn` is a relative string ("Posted Today", "Posted 3 Days Ago") in
  search results — Workday's search response has no absolute posting date.
- Job ids are composite (`<company-slug>:<externalPath>`) so `search --company all` results stay unambiguous when passed to `detail`.
- Registry currently covers `biogen`, `amgen`, `abbott`, `genentech`,
  `pfizer`, `novartis`, `vertex`, `regeneron`, `resilience`, `neurocrine`,
  `baxter`, `biocryst`, `jnj` — confirmed live as of 2026-07-27 (the original
  four as of 2026-07-22) — plus `tandem`, `dexcom`, `irhythm`, `insulet`
  (medtech/diagnostics companies) and `appliedmaterials` (semiconductor
  equipment, has explicit New College Grad reqs), all confirmed live
  2026-08-05/06. **Eli Lilly was tried and dropped**: its tenant
  (`lilly.wd5.myworkdayjobs.com`) returns `HTTP 422` from the CXS jobs
  endpoint no matter which site slug is used, suggesting it blocks this API
  path entirely. Eli Lilly is covered by the WebSearch `site:` fallback in
  `.claude/skills/job-scraper/search-queries.md` instead.
- The `vertex` slug is Vertex **Pharmaceuticals**
  (`vrtx.wd501.myworkdayjobs.com/Vertex_Careers`), not the unrelated
  tax-software company Vertex Inc, which also resolves on Workday
  (`vertexinc.wd1.myworkdayjobs.com/VertexInc`) under a similar-looking URL —
  verified during setup that the two are distinct tenants with distinct job
  postings.
