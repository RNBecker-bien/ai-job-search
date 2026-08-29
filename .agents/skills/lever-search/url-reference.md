# Lever Postings API reference

Public, unauthenticated JSON API. Official docs:
https://help.lever.co/hc/en-us/articles/360003215931-Job-Postings-API

## List postings for a site

```
GET https://api.lever.co/v0/postings/<site-slug>?mode=json
```

Response is a bare JSON array (not wrapped in an object) of posting objects.

```json
[
  {
    "id": "270ab137-6144-4126-aced-a4d4094048d6",
    "text": "Manufacturing Engineer I - Metals",
    "categories": {
      "commitment": "Full-time",
      "department": "Engineering",
      "location": "Roseville, CA",
      "team": "Manufacturing Engineers",
      "allLocations": ["Roseville, CA"]
    },
    "createdAt": 1778103248865,
    "country": "US",
    "workplaceType": "on-site",
    "descriptionPlain": "...",
    "description": "<p>...</p>",
    "descriptionBodyPlain": "...",
    "additionalPlain": "What We Offer\n...",
    "hostedUrl": "https://jobs.lever.co/<site-slug>/270ab137-...",
    "applyUrl": "https://jobs.lever.co/<site-slug>/270ab137-.../apply"
  }
]
```

## Single posting detail

```
GET https://api.lever.co/v0/postings/<site-slug>/<posting-id>?mode=json
```

Returns the same object shape as one array entry above. 404 if the posting id
doesn't exist on that site or has since closed.

## Notes

- No server-side search or location filtering — the API always returns the
  full current list of open postings for a site. This CLI does all filtering
  (`--query`, `--location`, `--jobage`) client-side after fetching, same
  pattern as `greenhouse-search`.
- No pagination on the source API; the CLI paginates client-side over the
  filtered result set.
- `createdAt` is a Unix epoch **milliseconds** timestamp, not an ISO string —
  the CLI converts it to ISO 8601 for the `date` field.
- Full description text is split across up to three plain-text fields
  (`descriptionPlain`, `descriptionBodyPlain`, `additionalPlain` — the last is
  usually benefits/EEO boilerplate); the CLI joins whichever are present.
- Site tokens (`site-slug`) are stable identifiers chosen by each company at
  Lever setup time and appear directly in their public careers URL:
  `jobs.lever.co/<site-slug>`.
- `robots.txt` at `api.lever.co` allows `/` with `Crawl-delay: 1` — a
  genuinely public API, not a scrape.
- Confirmed live site token as of 2026-08-26: `penumbrainc` (Penumbra, Inc.).
