# BioSpace Jobs URL Reference

Public, unauthenticated pages on `jobs.biospace.com` (the Madgex-powered job board for
BioSpace, "The Home of the Life Sciences Industry"). `robots.txt` allows `/jobs/*` and
`/job/*` — only `/invalid-request/`, `/analytics/`, `*/emailjob/*`, and `*/previewjob/*`
are disallowed, none of which this skill touches.

## Search

```
GET https://jobs.biospace.com/jobs/{location}/{page}/?Keywords={query}
```

- `{location}` — **optional** path segment. Best-effort: state names (`california`,
  `massachusetts`), city names (`irvine`, `san-diego`), and some region/hotbed slugs work;
  unrecognized slugs simply return few or no results rather than erroring. Omit the segment
  entirely to search nationwide.
- `{page}` — **optional** path segment, 1-indexed. Omit for page 1. Combines with location:
  `/jobs/california/2/?Keywords=...`.
- `Keywords` — free-text query parameter (capital K in the site's own form, but the site
  accepts lowercase `keywords` too, e.g. on its own "next page" links).

20 results per page (fixed; not configurable via a parameter).

Results are server-rendered HTML — each posting is an `<li class="lister__item ..."
id="item-<jobId>">` block. Per-card fields and their anchors:

| Field | Anchor |
|-------|--------|
| id | `id="item-<jobId>"` on the `<li>` |
| title | `<h3 class="lister__header"><a href="...">​<span>TITLE</span></a></h3>` |
| detail URL | the `href` on that same `<a>` (relative, e.g. `/job/<id>/<slug>/`) |
| company | `<li class="lister__meta-item lister__meta-item--recruiter">COMPANY</li>` |
| location | `<li class="lister__meta-item lister__meta-item--location">LOCATION</li>` |
| salary | `<li class="lister__meta-item lister__meta-item--salary">SALARY</li>` (often absent) |
| description snippet | `<p class="lister__description js-clamp-2">...</p>` |
| date posted | **not reliably present on the list page.** A `<p class="badge ... " title="Added in the last N days">New</p>` appears only on very recently posted jobs and is absent on most cards — not usable as a general date field. Fetch `detail` for an exact date. |

## Detail

```
GET https://jobs.biospace.com/job/{id}/{slug}/
```

The detail page embeds a `schema.org/JobPosting` JSON-LD block (`<script
type="application/ld+json">`) that is the primary parse target:

```json
{
  "@type": "JobPosting",
  "title": "...",
  "description": "<br />Company Description<br />...(HTML)...",
  "datePosted": "2026-08-05T03:16:21.693Z",
  "validThrough": "2026-09-04T03:59:59.000Z",
  "hiringOrganization": { "name": "AbbVie" },
  "jobLocation": [{ "address": { "addressLocality": "...", "addressRegion": "...", "addressCountry": "US" } }],
  "employmentType": "[\"FULL_TIME\"]"
}
```

A second, non-standard block (`ClientGoogleTagManagerDataLayer`, a `<script>` earlier in
`<head>`) carries fields the JSON-LD omits: `SalaryDescription`, `ApplicationURL` (the
external apply link), `JobRef`, `recruiter`. The CLI parses both and merges them.

## Notes

- No authentication required; no rate-limit response observed during testing, but the CLI
  still backs off on 429/5xx like every other portal skill in this repo.
- The `{id}` in the detail URL is numeric (e.g. `3065576`); the `{slug}` after it is
  cosmetic and can be replaced with anything (or omitted) — the site resolves by ID alone.
- `--jobage` (posted-within-N-days) has **no portal-side parameter** and is not
  client-side filterable from the search page (see date-posted note above) — the flag is
  accepted for interface consistency but has no effect. `SKILL.md` documents this.
