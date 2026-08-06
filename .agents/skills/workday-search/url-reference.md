# Workday CXS (Candidate Experience Service) API reference

Public, unauthenticated JSON API backing Workday-hosted careers sites. Not
officially documented by Workday; behavior reverse-engineered from the
browsable careers pages' own XHR calls. Sits behind Akamai bot management on
some tenants.

## Search jobs (POST required — GET is rejected)

```
POST https://<subdomain>.<wd-shard>.myworkdayjobs.com/wday/cxs/<tenant>/<site>/jobs
Content-Type: application/json

{"appliedFacets":{},"limit":20,"offset":0,"searchText":"quality engineer"}
```

Response shape:

```json
{
  "total": 1663,
  "jobPostings": [
    {
      "title": "Senior Director Engineering",
      "externalPath": "/job/US---California---Thousand-Oaks/Senior-Director-Engineering_R-249191",
      "locationsText": "US - California - Thousand Oaks",
      "postedOn": "Posted Today",
      "bulletFields": ["R-249191"]
    }
  ],
  "facets": [...]
}
```

- `searchText` is genuine server-side full-text search.
- `limit` is capped at **20** server-side — `limit > 20` returns `HTTP 400`. Confirmed on the Amgen tenant; treated as a global cap in this CLI since Workday's CXS implementation is shared across tenants.
- `appliedFacets` can filter by location/category/etc, but facet IDs (opaque
  hashes) differ per tenant and must be discovered from the `facets` array of
  an unfiltered response — not stable enough to hardcode, so this CLI filters
  location client-side on `locationsText` instead.
- `postedOn` is a relative string ("Posted Today", "Posted 3 Days Ago"), not
  an absolute date — there is no absolute posting date in the search response.

## Job detail (GET)

```
GET https://<subdomain>.<wd-shard>.myworkdayjobs.com/wday/cxs/<tenant>/<site><externalPath>
```

`externalPath` already starts with `/job/...`, so it's appended directly
after the tenant/site segment (no extra `/job/` prefix). Response:

```json
{
  "jobPostingInfo": {
    "title": "...",
    "jobDescription": "<p>...</p>",
    "location": "...",
    "postedOn": "...",
    "jobReqId": "...",
    "externalUrl": "..."
  }
}
```

## Per-tenant identifiers

A tenant is identified by four values, all visible in its careers URL
(`https://<subdomain>.<wd-shard>.myworkdayjobs.com/<site>`):

| slug | subdomain | shard | tenant | site |
|------|-----------|-------|--------|------|
| biogen | biibhr | wd3 | biibhr | external |
| amgen | amgen | wd1 | amgen | Careers |
| abbott | abbott | wd5 | abbott | abbottcareers |
| genentech | roche | wd3 | roche | ROG-A2O-GENE |
| tandem | tandemdiabetes | wd12 | tandemdiabetes | tandemdiabetes |
| dexcom | dexcom | wd1 | dexcom | Dexcom |
| irhythm | irhythmtech | wd5 | irhythmtech | iRhythm |
| insulet | insulet | wd5 | insulet | insuletcareers |
| appliedmaterials | amat | wd1 | amat | External |

All four confirmed live as of 2026-07-22 via the POST search endpoint above.
`tandem`, `dexcom`, `irhythm`, and `insulet` confirmed live 2026-08-05.
`appliedmaterials` confirmed live 2026-08-06 — note its total open-req count
runs in the thousands and is mostly non-US/non-entry-level, so scope queries
with `-q` and `--location` rather than pulling unfiltered.

## Known non-working tenant: Eli Lilly

`lilly.wd5.myworkdayjobs.com` (tenant `lilly`) returns `HTTP 422` from the
CXS `/jobs` endpoint regardless of which `site` value is tried (`LLY`, `lly`,
`Lilly`, `LLY_Lilly`, `External`, ...) — including plausible values seen in
public URLs like `/en-us/lly`. This looks like Lilly's Workday deployment
rejecting the API path itself (possibly requiring headers this CLI
deliberately doesn't try to spoof, like Referer/Origin, to avoid impersonating
a browser session). Not included in the registry; Eli Lilly openings are
covered by the WebSearch `site:` fallback in
`.claude/skills/job-scraper/search-queries.md` instead.

## Notes

- No credentials required for any of the above.
- Akamai bot management can rate-limit or block a tenant's CXS endpoint
  without warning; `search --company all` in this CLI tolerates one tenant
  failing and reports it in `meta.failedCompanies` rather than aborting the
  whole search.
- Keep request volume low — this is the same public API a browser uses, not
  a bulk data feed.
