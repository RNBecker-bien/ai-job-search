# myKelly (Kelly Services) Jobs URL Reference

Public, unauthenticated endpoints on `www.mykelly.com` — the candidate-facing job board
for Kelly Services / Kelly Science, Engineering, Technology & Telecom staffing. No
`robots.txt` file exists on this host (404), so no path restrictions are declared.

## Search

The `/job-search/` page itself is a client-rendered shell (WordPress + FacetWP); the
actual results come from a stateless POST endpoint the page's JS calls:

```
POST https://www.mykelly.com/wp-json/facetwp/v1/refresh
Content-Type: application/json
```

Body (no cookies, no nonce, no prior GET required — confirmed stateless):

```json
{
  "action": "facetwp_refresh",
  "data": {
    "facets": { "keyword": "<query>", "city_or_postal_code": "<location>" },
    "frozen_facets": {},
    "http_params": { "get": {}, "uri": "job-search", "url_vars": [] },
    "template": "jobs",
    "extras": { "pager": true },
    "soft_refresh": 0,
    "is_bfcache": 0,
    "first_load": 0,
    "paged": <page>
  }
}
```

- `facets.keyword` — free-text query, WordPress default-search relevance ranking (not a
  strict AND of terms). Also works with a bare numeric `job_id` as the entire keyword
  string — returns exactly that one listing (used by `detail` to resolve a bare ID to
  its permalink; see below).
- `facets.city_or_postal_code` — **do not attempt to drive this with plain text.** It is
  a FacetWP "proximity" facet: the live site geocodes the typed text into lat/lng via
  the **Google Places Autocomplete API** client-side before submitting, and the refresh
  endpoint expects those coordinates, not the raw string. Sending free text here is
  silently ignored (confirmed: identical result count/order to a request with the field
  omitted). The CLI always sends `""` and has no `--location` flag; folding a city into
  `facets.keyword` instead does nudge matching results higher in relevance order — it
  does **not** filter them out (confirmed: `"research associate Indianapolis"` returned
  the same 5 results as `"research associate"` alone, just reordered) — so a result's
  `location` field must still be checked, not assumed from the query.
- `paged` — 1-indexed page number. 10 results per page (fixed).
- Other facet keys exist (`job_type`, `employment_type`, `category`, `country`,
  `remoteon_site`, `resume_filter_not_required`) but are not exposed as CLI flags in v1 —
  omit them from the body entirely rather than sending empty arrays; FacetWP tolerates
  missing keys fine.

Response shape:

```json
{
  "facets": { ... },
  "template": "<HTML fragment containing one <data id=\"sf-cp-job-info-<jobId>\" value=\"<url-encoded JSON>\" wp-permalink=\"...\"> block per listing>",
  "settings": { "pager": { "page": 1, "per_page": 10, "total_rows": 483, "total_pages": 49 } }
}
```

Each listing's full record is a `www-form-urlencoded`-style JSON blob (note: spaces are
literal `+`, so decode with `str.replace(/\+/g, " ")` **before** `decodeURIComponent`,
not `decodeURIComponent` alone) in the `value` attribute of its `<data
id="sf-cp-job-info-<N>">` tag. **`<N>` here is Kelly's internal WordPress post ID, not
the ATS job ID** — confirmed by comparing it against the `job_id` field inside the JSON
blob and the number embedded in that same listing's own `wp-permalink`, which never
match `<N>`. Use the `job_id` field as the canonical ID (it's what `detail` and the
permalink both key on); the wrapper's `<N>` is otherwise unused. Relevant keys inside
that JSON (all values are 1-element arrays, WordPress custom-field convention):

| Key | Meaning |
|-----|---------|
| `job_id` | Numeric ATS job ID (matches the `<data>` tag's id suffix) |
| `job_title` | Title |
| `_job_location` | `"City, ST, United States"` |
| `_company_name` | Almost always `"Kelly Services"` — the staffing agency; the actual end client is usually anonymized ("a cutting-edge client") and only named, if at all, in the full description |
| `salary` | Often `"0"` (unset) |
| `target_payrate` | Numeric hourly rate when set, e.g. `"19.93"` |
| `employment_type` | `Temporary` \| `Temp to Hire` \| `Direct Hire` |
| `job_type` | `Full Time` \| `Part Time` \| `Per Diem` |
| `published_date` | RFC-1123 string, e.g. `"Fri, 31 Jul 2026 19:05:05 GMT"` |
| `industry`, `experience_level`, `education_level` | Free-text classification fields |

The sibling `wp-permalink="..."` attribute on the same `<data>` tag is the listing's
detail-page URL.

## Detail

```
GET https://www.mykelly.com/job/<numeric-id>-<slug>/
```

**The slug is not cosmetic here** (unlike BioSpace) — an ID with the wrong or missing
slug 404s. `detail` must therefore be given either a full permalink (which `search`
already returns as each result's `url`), or resolve a bare ID first by POSTing the same
FacetWP search above with `facets.keyword` set to the bare ID string — it reliably
returns exactly one match (`total_rows: 1`) whose `wp-permalink` is the real URL.

The detail page embeds two `<script type="application/ld+json">` blocks: a Yoast SEO
`@graph` block (WebPage/WebSite/Organization — not useful here) and a **second, separate
block** with `"@type": "JobPosting"` at the top level — parse the one matching that type,
not the graph. It has:

```json
{
  "@type": "JobPosting",
  "title": "...",
  "description": "...(HTML, HTML-entity-encoded)...",
  "datePosted": "2026-08-03T15:40:05+00:00",
  "validThrough": "2026-09-02T23:59:59+00:00",
  "hiringOrganization": { "name": "Kelly Services" },
  "jobLocation": { "address": { "addressLocality": "...", "addressRegion": "...", "postalCode": "...", "addressCountry": "US" } },
  "baseSalary": { "currency": "USD", "value": { "value": 48, "unitText": "HOUR" } },
  "employmentType": "[\"FULL_TIME\"]"
}
```

This description is the full, human-written posting text (pay range, responsibilities,
qualifications) — richer than the search-result JSON blob, which only carries the
compact ATS record.

## Notes

- No authentication, no rate-limit response observed during testing; the CLI still backs
  off on 429/5xx like every other portal skill in this repo.
- `--jobage` has no server-side parameter, but `published_date` **is** reliably present
  on every search result (unlike BioSpace), so the CLI filters client-side by parsing
  that RFC-1123 date and comparing to now. Document this distinction from `biospace-search`.
- Kelly's own `robots.txt` returns 404 (does not exist) — no declared crawl restrictions,
  unlike LinkedIn/BioSpace which have explicit files.
