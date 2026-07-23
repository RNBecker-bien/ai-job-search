# Greenhouse Job Board API reference

Public, unauthenticated JSON API. Official docs: https://developers.greenhouse.io/job-board.html

## List jobs for a board

```
GET https://boards-api.greenhouse.io/v1/boards/<company-slug>/jobs?content=true
```

`content=true` includes the full HTML job description inline (`content` field);
omit it for a lighter response with just id/title/location/url.

Response shape:

```json
{
  "jobs": [
    {
      "id": 4713218005,
      "title": "Senior Bioinformatics Engineer, Prenatal",
      "absolute_url": "https://job-boards.greenhouse.io/billiontoone/jobs/4713218005",
      "company_name": "BillionToOne",
      "location": { "name": "Menlo Park, CA" },
      "departments": [...],
      "offices": [...],
      "updated_at": "2026-06-01T12:00:00-07:00",
      "first_published": "2026-05-15T09:00:00-07:00",
      "content": "<p>...</p>",
      "requisition_id": "...",
      "metadata": null
    }
  ]
}
```

## Single job detail

```
GET https://boards-api.greenhouse.io/v1/boards/<company-slug>/jobs/<job-id>?content=true
```

Returns the same job object shape as one array entry above, plus (on some
boards) `questions` for the application form. 404 if the job id doesn't exist
on that board or has since closed.

## Notes

- No server-side search or location filtering — the API always returns the
  full current list of open jobs for a board. This CLI does all filtering
  (`--query`, `--location`, `--jobage`) client-side after fetching.
- No pagination on the source API either; the CLI paginates client-side over
  the filtered result set.
- Board tokens (`company-slug`) are stable identifiers chosen by each company
  at Greenhouse setup time and appear directly in their public careers URLs.
- Confirmed live board tokens as of 2026-07-22: `billiontoone`, `natera`,
  `twistbioscience`.
