# Search Queries for Job Scraper

<!-- SETUP: Customize these queries based on your skills, target roles, and location -->

## Installed portal CLIs (primary for `/scrape`)

`/scrape` discovers every portal skill under `.agents/skills/*/SKILL.md` and runs its CLI first. Shipped country-agnostic CLIs include `linkedin-search` and `freehire-search`; Danish demos and any skill you add with `/add-portal` are included the same way. You do **not** need a matching `site:` line below for those CLIs to run.

The `site:` query templates in this file are the **WebSearch fallback** — for portals without a CLI, company career pages, or when a CLI fails.

**Language scope:** write every query category in every language listed in your CLAUDE.md Languages table (typically 1-2, sometimes more). A posting requiring a language you have *not* declared, as a job condition, is excluded before scoring; a posting requiring a *higher level* than you declared in a language you *do* work in is flagged for your own judgment, not excluded — see `04-job-evaluation.md`'s Language Gate, the single source of truth for this rule. Translate each category's keywords rather than machine-translating word-for-word (e.g. "Frontend Developer" -> "Desarrollador Frontend", not a literal word-for-word translation) if you work in more than one language.

## Search Sites

Primary (portal CLIs installed under `.agents/skills/` — `/scrape` runs these directly, no `site:` query needed):
- **greenhouse-search** — BillionToOne, Natera, Twist Bioscience, Amyris, Cala Health (public Greenhouse JSON API)
- **workday-search** — Biogen, Amgen, Abbott, Genentech, Pfizer, Novartis, Vertex Pharmaceuticals, Regeneron, Resilience, Neurocrine Biosciences, Baxter, BioCryst Pharmaceuticals, Johnson & Johnson, Tandem Diabetes Care, Dexcom, iRhythm Technologies, Insulet, Applied Materials (public Workday CXS JSON API)
- **linkedin-search** / **freehire-search** — general-purpose, country-agnostic
- **biospace-search** — BioSpace job board (biotech/pharma/clinical research industry-specific); carries contract and contract-to-hire listings alongside permanent roles
- **kelly-search** — myKelly (Kelly Services staffing, incl. Kelly Science, Engineering, Technology & Telecom); strong source of temp-to-hire and contract-to-hire placements. No working location filter — fold a city/state into the query text instead (see its SKILL.md)

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
  - Quest Diagnostics, Cellectis — Oracle Cloud HCM, no public JSON API identified
  - AbbVie — SmartRecruiters-hosted (careers.smartrecruiters.com/abbvie), not yet integrated as a CLI
  - Acadia Pharmaceuticals — custom career site (acadia.com/en-us/careers/job-board), no ATS platform identified
  - AccelBio, Advion, Bedrock Therapeutics — small/early-stage companies, no formal ATS found (direct-apply or email-based)
  - BioMarin, Axiom Bio, Siemens Healthineers, and similar biomedical device/diagnostics/genomics companies
  - Novan — defunct as of 2025 (Chapter 11 bankruptcy 2023, assets sold to Ligand Pharmaceuticals, now in liquidation); not a viable employer, do not search
  - JenaValve Technology — custom career site (jenavalve.com/careers), Irvine CA, no ATS platform identified
  - Acutus Medical — custom career site (acutusmedical.com/us/careers), Carlsbad CA, no ATS platform identified
  - Genalyte — JazzHR-hosted (genalyte.applytojob.com), San Diego CA
  - Biocept — custom career site (biocept.com/careers), San Diego CA, no ATS platform identified
  - Retia Medical — no online ATS found; apply by emailing resume/cover letter to careers@retiamedical.com; verify current HQ location before applying
  - Cepheid (Danaher subsidiary) — Danaher's own careers portal (jobs.danaher.com/global/en/cepheid), Sunnyvale CA, not a standalone Workday/Greenhouse tenant
  - bioMérieux — Durham NC, ATS platform unconfirmed
  - iCAD — HQ Nashua NH (outside target regions), but maintains a San Jose CA office; ATS platform unconfirmed (careers.icad.com)
  - Cynosure (merged with Lutronic in 2024, now Cynosure Lutronic under Hahn & Company) — CA openings seen in Fremont and San Francisco; ATS platform unconfirmed

## Query Categories

Queries are grouped by priority. Write **each category in every language from your Languages table** (see Language scope above). Each query should be combined with your location terms (California, Carmel-to-Sonoma corridor, San Diego, Chicago, Boston, New York, Raleigh, or "remote") where the site supports it.

**Organize by function, not job title.** The same underlying work carries different titles across companies and markets (a "Data Scientist" role at one employer may be posted as "Insights Analyst" or "Data Consultant" at another). Name each priority category after the function it covers, and list several plausible job titles as query variants within that category rather than betting an entire priority tier on one exact title string.

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

Wider net for general biomedical/instrumentation engineering roles. Titles below lean
into hands-on troubleshooting/instrumentation strength rather than pure QC/compliance
documentation work, which has scored weaker in past applications despite matching on
paper (see the Calibration section in `04-job-evaluation.md`).

```
site:linkedin.com/jobs "biomedical engineer" entry level California
site:indeed.com "instrumentation engineer" entry level California
site:linkedin.com/jobs "Engineer I" fluidics OR instrumentation California
site:linkedin.com/jobs "Field Service Engineer" biomedical OR diagnostics OR medical device California
site:linkedin.com/jobs "Automation Technician" OR "Automation Associate" biotech OR medical device California
site:linkedin.com/jobs "Instrumentation Technician" biomedical OR diagnostics California
site:linkedin.com/jobs "Sustaining Engineering" OR "Sustaining Engineer" medical device OR diagnostics California
site:linkedin.com/jobs "Validation Engineer" OR "Test Engineer" medical device OR instrumentation California
site:linkedin.com/jobs "V&V Engineer" OR "Verification and Validation Engineer" entry level medical device California
site:linkedin.com/jobs "NPI Engineer" OR "NPI Test Engineer" entry level medical device California
"Rotational Development Program" OR "Engineering Leadership Program" medical device new grad
```

Tested 2026-08-05: V&V, NPI, and rotational-program queries all surfaced real
entry-level or 0-2-year postings (Bionano Genomics V&V, J&J NPI Test Engineer,
named rotational programs at J&J/Integra LifeSciences/Abbott/Cardinal
Health/Thermo Fisher) and are worth running regularly. "Signal Processing
Engineer" and "Photonics Engineer"/"Optical Engineer" were tried as keywords
too but returned mostly defense/semiconductor noise with little biomedical
relevance — skip them as standalone search terms; if you want that angle,
check company-specific listings directly (e.g. Genalyte for photonics) rather
than a generic keyword search.

### Priority 5: Computer Vision & Applications Science (Biological/Scientific)

Matches your Phenotypic computer vision work and microbial phenotyping domain, plus applications-facing roles common at diagnostics/genomics companies. Applications Scientist and Field Applications Scientist queries stay scoped to biomedical/life-sciences employers to avoid generic sales-engineering results.

```
site:linkedin.com/jobs "Bioimage Analyst" OR "Imaging Scientist" California
site:linkedin.com/jobs "Image Analysis Scientist" biomedical OR life sciences California
site:linkedin.com/jobs "Computer Vision Engineer" biomedical OR life sciences OR diagnostics California
site:linkedin.com/jobs "Machine Vision Engineer" biomedical OR life sciences California
site:linkedin.com/jobs "Microbiology Automation" OR "High-Throughput Screening" imaging California
site:linkedin.com/jobs "Phenotyping" biological OR microbial California
site:linkedin.com/jobs "Microfluidics Engineer" OR "Fluidics Engineer" California
site:linkedin.com/jobs "Applications Scientist" diagnostics OR genomics OR biomedical California
site:linkedin.com/jobs "Field Applications Scientist" diagnostics OR genomics OR biomedical California
site:linkedin.com/jobs "Process Development Associate" OR "Process Engineer I" biopharma OR biotech California
site:linkedin.com/jobs "Lab Automation Engineer" OR "Automation Technician" biotech OR life sciences California
site:linkedin.com/jobs "Product Applications Engineer" biomedical OR life sciences California
site:linkedin.com/jobs "Data Analyst" life sciences OR biotech California
site:linkedin.com/jobs "Biomedical Engineer I" OR "Associate Engineer" California
```

### Priority 6: Contract-to-Hire / Staffing-Agency Roles (Kelly, BioSpace)

Strategic pivot: entry-level industry lab experience is the recurring gap flagged
across past rejections (see Calibration in `04-job-evaluation.md`). A contract-to-hire
or temp-to-hire placement is a faster way to get that experience on record than
repeated direct-hire applications in the same weak-conversion band. Fold
"contract to hire" / "temp to hire" directly into the query text — `kelly-search` and
`biospace-search` don't expose it as a separate filter flag.

```
site:linkedin.com/jobs "Research Associate" "contract to hire" OR "temp to hire" California
research associate contract to hire Irvine
lab technician temp to hire California
automation technician contract to hire biotech
```

Do not drift toward Clinical Research Coordinator/Associate titles here even via
staffing agencies — that's the same monitoring/compliance work already evaluated as a
poor fit (Abbott CRA I, 2026-08-04), and staffing packaging doesn't change the day-to-day.

### Priority 7: Field Service / Technical Support

Lower-barrier entry point that leans on hands-on troubleshooting strength
(a listed behavioral strength) rather than the industry-lab-experience gap
that's sunk past direct-hire R&D applications (see Calibration in
`04-job-evaluation.md`). High-volume hiring category at Dexcom, Tandem, and
iRhythm specifically (all now covered by `workday-search`). Tested
2026-08-05/06 — real entry-level hits found (X-Ray Field Service Engineer –
Entry Level in San Diego; high volume of Biomedical Field Service Engineer
postings nationally).

```
site:linkedin.com/jobs "Field Service Engineer" entry level medical device OR diagnostics California
site:linkedin.com/jobs "Biomedical Field Service Engineer" California
site:linkedin.com/jobs "Field Service Technician" medical device OR diagnostics California
site:linkedin.com/jobs "Technical Support Engineer" OR "Field Applications Engineer" entry level instrumentation California
```

### Priority 8: Semiconductor & Broader Instrumentation (Non-Biomedical)

Your fluidics/embedded-control/instrumentation skill set transfers directly
to semiconductor-equipment and general instrumentation companies, which pull
from a different applicant pool than "biomedical devices" and may not carry
the same industry-lab-experience expectations that have sunk past
biomedical-specific applications. Tested 2026-08-05/06 — real hits found
(Semiconductor Process Engineer Associate – Entry Level in Goleta; Applied
Materials' 2026 New College Grad reqs in Santa Clara, now covered by
`workday-search`).

```
site:linkedin.com/jobs "Equipment Engineer" entry level semiconductor California
site:linkedin.com/jobs "Process Engineer" OR "Process Technician" entry level semiconductor California
site:linkedin.com/jobs "Field Service Engineer" OR "Field Service Technician" entry level semiconductor equipment California
site:linkedin.com/jobs "New College Grad" semiconductor OR instrumentation engineer California
```

Note: this category is deliberately broader than the "biomedical devices/diagnostics/genomics"
target-sector framing in CLAUDE.md — flag any resulting company to the user before drafting
if it's unclear whether it still fits the target-sector intent, since Career Alignment scoring
(see `04-job-evaluation.md`) assumes a biomedical/robotics direction.

## Location Filter

When evaluating results, verify the job location fits your preferences. Define acceptable areas:
- Ideal: California - Carmel to Sonoma corridor (Central Coast, Bay Area, North Bay)
- Ideal: San Diego, CA
- Acceptable: Remote (any location)
- Borderline: Other California metro areas (Los Angeles, Sacramento, Orange County) - open to relocating
- Deal-breaker (not location, but related): more than 50% travel required

## Language Filter

Your working languages and levels are in CLAUDE.md's Languages table. When filtering scraped results, apply `04-job-evaluation.md`'s Language Gate: a posting requiring a language you haven't declared at all is excluded; a posting requiring a higher level than you declared in a language you do work in is not excluded, flag it clearly instead (see `job-scraper/SKILL.md`'s Step 3 "Quick Fit Assessment" for how the flag surfaces in `/scrape` output). Postings simply *written* in a language you don't work in, that don't require it on the job, are fine.

## Employer Type Filter

**Industry only - exclude universities and academic institutions entirely.** Do not present postings at universities, colleges, or academic research institutions (e.g. Duke University, Northwestern University, NC State University), regardless of fit score. This applies to `/scrape` presentation, `/rank` candidate selection, and any other workflow that surfaces jobs from `seen_jobs.json` - a university posting should never reach the user as a live option.

## Experience & Degree Filter

**Strictly entry-level: 2-3 years of experience maximum, no advanced degree requirement.** Exclude any posting that:
- States a minimum experience requirement above 3 years (e.g. "5+ years", "3-5 years" where the floor exceeds 3)
- Requires a Master's degree or PhD as a stated minimum qualification (a Master's/PhD listed as "preferred" rather than required is fine to keep, but flag it)
- Uses a seniority-implying title without an entry-level track explicitly offered (e.g. "Senior Scientist", "Principal Engineer", "Director") - unless the posting explicitly states a "II" or higher is one of several open levels alongside an entry-level "I" track

This is a hard filter, not just a scoring input - a posting that fails it should not be presented, regardless of how well its skills match.

## Date Filter

Only include jobs posted within the last 14 days, or with an application deadline that has not yet passed. If a posting date cannot be determined, include it but flag as "date unknown".

## Adapting Queries

If the user specifies a focus area, select queries from the matching category and also generate 2-3 custom queries for that focus. For example:
- "/scrape [focus_area]" -> relevant category queries + custom focus-specific queries
