# Search Queries for Job Scraper

<!-- SETUP: Customize these queries based on your skills, target roles, and location -->

## Installed portal CLIs (primary for `/scrape`)

`/scrape` discovers every portal skill under `.agents/skills/*/SKILL.md` and runs its CLI first. Shipped country-agnostic CLIs include `linkedin-search` and `freehire-search`; Danish demos and any skill you add with `/add-portal` are included the same way. You do **not** need a matching `site:` line below for those CLIs to run.

The `site:` query templates in this file are the **WebSearch fallback** — for portals without a CLI, company career pages, or when a CLI fails.

## Search Sites

Primary (portal CLIs installed under `.agents/skills/` — `/scrape` runs these directly, no `site:` query needed):
- **greenhouse-search** — BillionToOne, Natera, Twist Bioscience (public Greenhouse JSON API)
- **workday-search** — Biogen, Amgen, Abbott, Genentech (public Workday CXS JSON API)
- **linkedin-search** / **freehire-search** — general-purpose, country-agnostic

Secondary (no CLI available — WebSearch `site:` fallback):
- **linkedin.com/jobs** - LinkedIn job listings (filter: California / United States)
- **indeed.com** - general US job board
- **glassdoor.com** - general US job board, also useful for company research
- Individual target-company career pages for companies without a portal CLI:
  - Illumina, Bio-Rad, Agilent — Workday-hosted but not yet added to `workday-search`'s registry
  - Applied Medical — custom career site (careers.appliedmedical.com/north-america/jobs), no ATS API identified
  - Cedars-Sinai — careers.cshs.org, ATS platform unconfirmed
  - Avid Bioservices — Jobvite-hosted (jobs.jobvite.com/avidbio/jobs), server-rendered HTML, no JSON API found
  - Eli Lilly — Workday-hosted but its CXS API rejects requests outright (see `.agents/skills/workday-search/url-reference.md`)
  - Quest Diagnostics — Oracle Cloud HCM (careers.questdiagnostics.com), no public JSON API identified
  - BioMarin, Axiom Bio, and similar biomedical device/diagnostics/genomics companies

## Query Categories

Queries are grouped by priority. Each query should be combined with your location terms (California, Carmel-to-Novato corridor, San Diego, or "remote") where the site supports it.

### Priority 1: Quality & Test Engineering

These match your strongest and most desired near-term direction - entry-level quality/test roles at biomedical device and diagnostics companies.

```
site:linkedin.com/jobs "Quality Engineer" California
site:linkedin.com/jobs "Quality Control Specialist" California
site:linkedin.com/jobs "Test Engineer" fluidics OR instrumentation California
site:indeed.com "Quality Engineer" biomedical devices California
```

### Priority 2: Research & R&D Associate Roles

These match your domain expertise in fluidics, instrumentation, and COMSOL-based modeling.

```
site:linkedin.com/jobs "Research Associate" fluidics OR microfluidics California
site:linkedin.com/jobs "R&D Associate" OR "R&D Technician" instrumentation California
site:indeed.com "Research Associate" biomedical devices California
```

### Priority 3: Automation & Adjacent Roles

Adjacent roles you could pivot into, including robotics/automation.

```
site:linkedin.com/jobs "Automation Engineer" biomedical OR devices California
site:linkedin.com/jobs "Scientist" fluidics OR microfluidics California
```

### Priority 4: Broader Biomedical Engineering

Wider net for general biomedical/instrumentation engineering roles.

```
site:linkedin.com/jobs "biomedical engineer" entry level California
site:indeed.com "instrumentation engineer" entry level California
site:linkedin.com/jobs "Engineer I" fluidics OR instrumentation California
```

## Location Filter

When evaluating results, verify the job location fits your preferences. Define acceptable areas:
- Ideal: California - Carmel to Novato corridor (Central Coast, Bay Area, North Bay)
- Ideal: San Diego, CA
- Acceptable: Remote (any location)
- Borderline: Other California metro areas (Los Angeles, Sacramento, Orange County) - open to relocating
- Deal-breaker (not location, but related): more than 50% travel required

## Date Filter

Only include jobs posted within the last 14 days, or with an application deadline that has not yet passed. If a posting date cannot be determined, include it but flag as "date unknown".

## Adapting Queries

If the user specifies a focus area, select queries from the matching category and also generate 2-3 custom queries for that focus. For example:
- "/scrape [focus_area]" -> relevant category queries + custom focus-specific queries
