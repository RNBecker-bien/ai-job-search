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
- **biospace-search** — BioSpace job board (biotech/pharma/clinical research industry-specific)

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

**Restructured 2026-08-12**, based on a full-dataset `/rank` analysis across 352 tracked postings (138 scored) rather than a single day's sample: grouped every seen posting by which category its title matched and compared average `/rank` score, verdict distribution, and (separately) actual application outcomes.

- **R&D/Product Development/Systems Engineer titles** (previously buried inside the old Priority 4 grab-bag) had the best average score of any cluster (52.9, five Good-Fit hits out of eleven ranked) and is now its own **Priority 1**.
- **Semiconductor & Instrumentation** (old Priority 2) and **Automation & Adjacent** (old Priority 7) both showed small-sample but consistently real hits (no Weak/Poor verdicts in either), so both are promoted into the top tier as **Priority 2** and **Priority 3**.
- A pattern that had never been a tracked category at all - **instrument/control software engineering and bioinformatics-adjacent titles** ("Control Software Engineer," "Bioinformatician," "Calibration Technician") - turned up three of the five best-ever ranked hits (Collabera 77.0 Strong Fit, Mass General Brigham Bioinformatician I 71.5 Good Fit, Aureka Biotechnologies Control Software Engineer 62.4 Good Fit) purely incidentally, through generic searches. It is now an explicit **Priority 4**.
- **Regulatory Affairs / Clinical Specialist** titles (a subset of the old Priority 4) scored worst of any cluster (29.4 average, 4-for-4 Weak/Poor across two separate samples) and are **dropped entirely** - not a years-of-experience problem, the day-to-day (compliance/documentation, sales-support) fights the behavioral profile regardless of title tier.
- **Contract-to-Hire/Staffing** (old Priority 3) is folded into **Research & R&D Associate Roles** (now Priority 5) - nearly identical role type, and Priority 3's own sample was too thin (32.9 average, n=4) to justify staying separate. *(2026-08-20: staffing-agency/contract-to-hire targeting removed from Priority 5 entirely at the user's request - see that section.)*
- **Field Service** (old Priority 1) and **Quality & Test** (old Priority 5, previously demoted based on a single-day sample that turned out to undersell it once the full dataset was checked) both move to a second tier (Priority 6, 7) - reliable volume and real Moderate/Good hits, but lower ceiling than the Priority 1-4 cluster.
- **Broader Biomedical Engineering** (Priority 8) and **Computer Vision & Applications Science** (Priority 9) stay last - real but infrequent hits, small sample sizes.

**Caveat updated 2026-08-20:** as of the 2026-08-12 restructuring, 8 of 36 tracked applications had a resolved outcome, all 8 rejections, with zero interviews reached regardless of predicted `/rank` score - the note below reflects that state. Since then, **Petal Surgical (Priority 1, Associate R&D Engineer - Acoustics, Therapy, 71.0 Good Fit) has broken the pattern**: phone screen (2026-08-18) -> advancement email from the hiring manager (2026-08-19) -> NDA signed and a CEO screening call being scheduled (2026-08-20), the furthest any tracked application has progressed. This is the first real (if still incomplete) evidence that predicted fit *can* convert, and it lines up with the literal-tool-overlap signal noted in `04-job-evaluation.md`'s calibration section - see the Priority 1 note below. Still n=1 on genuine progress; the original caveat text is preserved below for context and should be revisited again once Petal Surgical resolves (offer/rejection) or another application reaches a comparable stage.

Original 2026-08-12 note: only 8 of 36 tracked applications have a resolved outcome, and **all 8 are rejections, spread across nearly every category, with zero interviews reached regardless of predicted `/rank` score** (the highest-ever score, BillionToOne's 80.2, was rejected after a skills assessment; several Good-Fit-scored applications were rejected too). This ordering reflects *predicted fit* from posting text, which has not yet been shown to correlate with *actual conversion*. Revisit this ordering's premise, not just its ranking, once more outcomes resolve - if rejections keep landing evenly across every category regardless of score, the bottleneck may not be query targeting at all.

### Entry-Level Language Bias

Across both categories, the single strongest signal for genuine fit turned out to be explicit posting language, not title conventions. A "Research Associate II" can gate at 3-5 years; a "Laboratory Service Engineer 1" can require zero. So:

- **Prefer queries that search for the phrase, not just the title.** Where a category below doesn't already include one, add a variant with `"0-2 years"`, `"entry level"`, `"no experience required"`, `"recent graduate"`, or `"early career"` alongside the role keyword - these phrases in the posting text are a far more reliable signal than "Associate," "I," or "Junior" in the title, all of which this run showed can still gate high.
- **Don't downgrade a hit for lacking a seniority-sounding title** - "Laboratory Service Engineer 1" and "Junior Process Engineer" both cleared the gate cleanly despite plain titles. Read the qualifications section, not the title, before excluding.
- **Do downgrade a hit that has an entry-sounding title but no explicit low-experience language** - flag it for a `detail` fetch before presenting; several "Associate Scientist" and "Research Associate II" postings this run turned out to require 3-5 years despite reading as entry-level on the surface.

### Priority 1: R&D, Product Development & Systems Engineer Titles

**Top-performing category in the full-dataset review (2026-08-12): 52.9 average score, 5 Good-Fit verdicts out of 11 ranked, only 2 Poor.** Promoted out of the old Priority 4 grab-bag (which mixed these titles with Regulatory Affairs/Clinical Specialist - now dropped, see above) because it's the strongest cluster on its own. Real hits: Imperative Care R&D Engineer I (71.0), Petal Surgical Associate R&D Engineer (71.0), Penumbra R&D Engineer (68.0), Mizuho OSI Systems Engineer (65.8), Medtronic R&D Engineer I (61.5). Apply the Entry-Level Language Bias rule above - fetch `detail` before presenting, since "R&D Engineer II" and "Systems Engineer II" postings from staffing agencies have shown up mixed into search results for these same titles and typically gate above the 3-year cap.

**Signal confirmed 2026-08-20: literal bioinstrumentation tool-name overlap.** Petal Surgical (71.0 Good Fit) is now the furthest-advanced application ever tracked (phone screen -> hiring-manager advancement -> NDA signed -> CEO screening call, see the outcomes caveat above), on a posting whose stated tools (oscilloscope, function generator, ultrasound transducer, AD620 instrumentation amplifier) matched the BIEN130L coursework in `01-candidate-profile.md` almost literally. `04-job-evaluation.md`'s calibration section flagged this as a hypothesis with n=1; it's still n=1 on a resolved outcome, but the continued advancement makes it worth actively querying for rather than waiting to encounter it incidentally. Query the specific instruments and device categories the coursework covers (oscilloscope, signal generator, ultrasound, acoustics, bioinstrumentation, instrumentation amplifier), not just the generic "R&D Engineer" title.

```
site:linkedin.com/jobs "R&D Engineer" OR "R&D Engineer I" entry level medical device OR biomedical California
site:linkedin.com/jobs "Product Development Engineer" entry level medical device OR biomedical California
site:linkedin.com/jobs "Systems Engineer" OR "System Engineer" entry level medical device OR biomedical California
site:linkedin.com/jobs "Manufacturing Engineer" OR "Manufacturing Engineer I" entry level medical device OR biotech California
site:linkedin.com/jobs "Design Engineer" entry level medical device California
site:linkedin.com/jobs "R&D Engineer" OR "Associate R&D Engineer" acoustics OR ultrasound OR "signal processing" medical device California
site:linkedin.com/jobs "Bioinstrumentation Engineer" OR "Instrumentation Engineer" entry level medical device California
```

### Priority 2: Semiconductor & Broader Instrumentation (Non-Biomedical)

Your fluidics/embedded-control/instrumentation skill set transfers directly
to semiconductor-equipment and general instrumentation companies, which pull
from a different applicant pool than "biomedical devices" and may not carry
the same industry-lab-experience expectations that have sunk past
biomedical-specific applications. Tested 2026-08-05/06 - real hits found
(Semiconductor Process Engineer Associate – Entry Level in Goleta; Applied
Materials' 2026 New College Grad reqs in Santa Clara, now covered by
`workday-search`; Lam Research Laboratory Service Engineer 1 explicitly
states "no previous professional experience"; Sanmina Junior Process
Engineer and Tetra Tech/TIGA Automation Specialist both state "0-2 years"
outright).

```
site:linkedin.com/jobs "Equipment Engineer" entry level semiconductor California
site:linkedin.com/jobs "Process Engineer" OR "Process Technician" entry level semiconductor California
site:linkedin.com/jobs "Field Service Engineer" OR "Field Service Technician" entry level semiconductor equipment California
site:linkedin.com/jobs "New College Grad" semiconductor OR instrumentation engineer California
site:linkedin.com/jobs "Laboratory Service Engineer" OR "Lab Service Engineer" semiconductor OR instrumentation California
site:linkedin.com/jobs "Automation Engineer" OR "Automation Specialist" "0-2 years" California
site:linkedin.com/jobs "Junior Process Engineer" OR "Junior Engineer" semiconductor OR instrumentation California
```

Note: this category is deliberately broader than the "biomedical devices/diagnostics/genomics"
target-sector framing in CLAUDE.md. As of 2026-08-12, Richard is explicitly open to adjacent
high-tech sectors beyond biomedical (e.g. semiconductor, defense/national-security/aerospace)
where the hands-on hardware/instrumentation work is the same even if the industry differs -
this is no longer an automatic Career Alignment penalty (see `04-job-evaluation.md`). Still
worth a one-line note to the user on presentation so the sector shift is visible, not silently
assumed.

### Priority 3: Automation & Adjacent Roles

Promoted from old Priority 7 (2026-08-12) - small sample but zero Weak/Poor verdicts
across every ranked hit, including a genuine Good Fit (Natera Laboratory Automation
Engineer, 61.0) and a strong Moderate (Tetra Tech/TIGA Automation Specialist, 53.3,
explicit "0-2 years"). Adjacent roles you could pivot into, including robotics/automation.

```
site:linkedin.com/jobs "Automation Engineer" biomedical OR devices California
site:linkedin.com/jobs "Automation Specialist" OR "Automation Technician" "0-2 years" OR entry level California
site:linkedin.com/jobs "Automation Controls Engineer" entry level medical device OR biotech California
```

### Priority 4: Instrument/Control Software Engineering & Bioinformatics

**New category (2026-08-12).** Never a tracked priority before, but the single
highest-density source of top hits once the full `seen_jobs.json` dataset was reviewed
by category: Collabera's medical-device algorithm QC engineer (77.0, Strong Fit), Mass
General Brigham's Bioinformatician I (71.5, Good Fit), and Aureka Biotechnologies'
Control Software Engineer - LabVIEW System Control (62.4, Good Fit) all fell outside
every other named category and had only ever surfaced incidentally through broad
generic searches. These titles map directly onto the Phenotypic computer-vision/data
pipeline work and the LabVIEW/embedded-instrumentation coursework - worth querying
for explicitly rather than hoping they turn up.

```
site:linkedin.com/jobs "Control Software Engineer" OR "Instrument Control Engineer" medical device OR biomedical OR diagnostics California
site:linkedin.com/jobs "Bioinformatician" OR "Bioinformatics" entry level OR "0-2 years" California
site:linkedin.com/jobs "Calibration Technician" biomedical OR diagnostics OR medical device California
site:linkedin.com/jobs "LabVIEW" engineer OR technician medical device OR instrumentation California
```

### Priority 5: Research & R&D Associate Roles

Staffing-agency/contract-to-hire targeting removed from this category (2026-08-20, at the
user's request) - `kelly-search` has been dropped from the portal list above and the
contract-to-hire query variants below were cut. These queries now target direct-hire
Research/R&D Associate roles that match your domain expertise in fluidics,
instrumentation, and COMSOL-based modeling, and include the highest single `/rank` score
ever recorded (BillionToOne Research Associate, 80.2 Strong Fit - though ultimately
rejected after a skills assessment, see the outcomes caveat above).

**Verify the experience floor before presenting.** "Associate Researcher" and "Research
Associate II" titles have gated at 2-4+ years in the qualifications section despite
reading as entry-level on the title alone - always fetch `detail` before presenting.

```
site:linkedin.com/jobs "Research Associate" fluidics OR microfluidics California
site:linkedin.com/jobs "R&D Associate" OR "R&D Technician" instrumentation California
site:indeed.com "Research Associate" biomedical devices California
site:linkedin.com/jobs "Research Associate" "0-2 years" OR "entry level" California
```

Do not drift toward Clinical Research Coordinator/Associate titles here - that's the same
monitoring/compliance work already evaluated as a poor fit (Abbott CRA I, 2026-08-04).

### Priority 6: Field Service / Technical Support

Demoted from old Priority 1 (2026-08-12) - not because it stopped producing hits (52
seen, 31 ranked, still your highest-volume category), but because the full-dataset
review showed it caps at Moderate Fit (only 1 Good Fit ever, out of 31 ranked; zero
Strong Fit) versus Priority 1-4's higher ceiling. Still a lower-barrier entry point that
leans on hands-on troubleshooting strength (a listed behavioral strength) rather than
the industry-lab-experience gap that's sunk past direct-hire R&D applications (see
Calibration in `04-job-evaluation.md`). High-volume hiring category at Dexcom, Tandem,
and iRhythm specifically (all now covered by `workday-search`). Canon USA and Thermo
Fisher both run explicit I/II/III tiers where Level I requires little to no prior
experience - search the generic title and check the tier in `detail`, since tier is
rarely visible in the search snippet. **Watch for heavy travel** - roughly a third of
this category's hits get vetoed on the 50% travel deal-breaker at `/rank` time.

```
site:linkedin.com/jobs "Field Service Engineer" entry level medical device OR diagnostics California
site:linkedin.com/jobs "Biomedical Field Service Engineer" California
site:linkedin.com/jobs "Field Service Technician" medical device OR diagnostics California
site:linkedin.com/jobs "Technical Support Engineer" OR "Field Applications Engineer" entry level instrumentation California
site:linkedin.com/jobs "Field Service Engineer I" OR "Field Service Technician I" California
```

### Priority 7: Quality & Test Engineering

**Reinstated 2026-08-12** - originally demoted on 2026-08-06 based on a single day's
zero-high-fit sample, but the full-dataset review found that sample was too small to
be representative: 68 seen, 21 ranked, including a real Good Fit (Abbott Quality
Engineer, 63.5) and three more Moderate hits in the 48-52 range. Entry-level
quality/test roles at biomedical device and diagnostics companies.

```
site:linkedin.com/jobs "Quality Engineer" California
site:linkedin.com/jobs "Quality Control Specialist" California
site:linkedin.com/jobs "Test Engineer" fluidics OR instrumentation California
site:indeed.com "Quality Engineer" biomedical devices California
```

### Priority 8: Broader Biomedical Engineering

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
site:linkedin.com/jobs "Validation Engineer" OR "Test Engineer" medical device OR instrumentation California
site:linkedin.com/jobs "V&V Engineer" OR "Verification and Validation Engineer" entry level medical device California
site:linkedin.com/jobs "NPI Engineer" OR "NPI Test Engineer" entry level medical device California
"Rotational Development Program" OR "Engineering Leadership Program" medical device new grad
```

**"Sustaining Engineer"/"Sustaining Engineering" removed from this category's queries
(2026-08-12)** - went 2-for-2 Weak/Poor in the full-dataset review (Jupiter Endovascular
39.5, Cryoport Systems 29.1), both gated on real years-of-experience floors (2-3 years
minimum despite plain titles) and centered on supplier-quality/change-control/QMS
documentation work rather than hands-on R&D. Not worth the `detail`-fetch cost until the
pattern reverses.

Tested 2026-08-05: V&V, NPI, and rotational-program queries all surfaced real
entry-level or 0-2-year postings (Bionano Genomics V&V, J&J NPI Test Engineer,
named rotational programs at J&J/Integra LifeSciences/Abbott/Cardinal
Health/Thermo Fisher) and are worth running regularly. "Signal Processing
Engineer" and "Photonics Engineer"/"Optical Engineer" were tried as keywords
too but returned mostly defense/semiconductor noise with little biomedical
relevance — skip them as standalone search terms; if you want that angle,
check company-specific listings directly (e.g. Genalyte for photonics) rather
than a generic keyword search.

### Priority 9: Computer Vision & Applications Science (Biological/Scientific)

Matches your Phenotypic computer vision work and microbial phenotyping domain, plus applications-facing roles common at diagnostics/genomics companies. Applications Scientist and Field Applications Scientist queries stay scoped to biomedical/life-sciences employers to avoid generic sales-engineering results. Tested 2026-08-06: several "Applications Scientist" and "Field Application Scientist" hits gated at 3-5+ years or a Master's/PhD floor despite reading as approachable on the title alone (Gator Bio, Stellaromics, both Thermo Fisher FAS roles) - always fetch `detail` before presenting from this category, same caution as Priority 5's contract-to-hire listings.

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
site:linkedin.com/jobs "Technical Applications Scientist" "entry level" OR "1 year" biomedical OR biotech California
```

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
