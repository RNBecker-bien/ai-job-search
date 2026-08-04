# ApplyToJob (JazzHR) careers site reference

Public, unauthenticated, server-rendered HTML pages. No JSON API was found —
`robots.txt` confirms the underlying platform is Jazz (JazzHR):

```
Sitemap: http://app.jazz.co/feeds/google/xml/0
```

Confirmed via direct inspection 2026-08-01.

## robots.txt

```
User-agent: SemrushBot
User-agent: dotbot
Disallow: /

User-agent: *
Disallow: /cb
```

Only `SemrushBot`/`dotbot` are blocked outright, and only `/cb` is disallowed
for everyone else — `/apply` (listing) and `/apply/<token>` (detail) are not
disallowed for a normal user agent.

## List all open postings

```
GET https://<subdomain>.applytojob.com/apply
```

Returns one `<li class="list-group-item">` per posting:

```html
<li class="list-group-item">
    <h3 class='list-group-item-heading'>
        <a href="https://imperativecare.applytojob.com/apply/32CBp7t1Fy/RD-Engineer-I">
            R&amp;D Engineer, I                                    </a>
    </h3>
    <ul class='list-inline list-group-item-text'>
        <li><i class='fa fa-map-marker'></i>Campbell, CA</li>
        <li><i class='fa fa-sitemap'></i>R&amp;D Devices</li>
    </ul>
</li>
```

- The opaque **token** (`32CBp7t1Fy`) in the href is the stable job id; the
  trailing title slug (`RD-Engineer-I`) is cosmetic and ignored by the ATS.
- Location comes from the `fa-map-marker` list item, department from the
  `fa-sitemap` list item — both live inside the same posting's `<li>`, so no
  cross-block state tracking is needed despite the visual grouping by
  department heading (`<div class="department-heading">`) in the rendered page.
- No pagination observed — the full open-roles list renders on one page for
  this company's board size (~30 postings as of 2026-08-01).
- No posting date anywhere on this page.

## Single posting detail

```
GET https://<subdomain>.applytojob.com/apply/<token>
```

The trailing slug is optional and ignored (`/apply/<token>/anything` and
`/apply/<token>` both resolve the same posting). A bad/expired token returns
**HTTP 410 Gone** (not 404).

Relevant markup:

```html
<div class='job-header'>
    <div class='container'>
        <h2>R&amp;D Engineer, I</h2>
        <div class="job-attributes-container">
            <div title="Location"><i class='fa fa-map-marker'></i>Campbell, CA</div>
            <div id='resumator-job-employment' title="Type"><i class='fa fa-clock-o'></i>Full Time</div>
            <div title="Department"><i class='fa fa-sitemap'></i>R&amp;D Devices</div>
            <div id='resumator-job-experience' title="Experience"><i class='fa fa-graduation-cap'></i>Experienced</div>
        </div>
    </div>
</div>
...
<div class='col col-xs-7 description' id="job-description">
    <!-- full HTML job description, heavily inline-styled (Word/Google-Docs paste) -->
</div>
```

- Description HTML is dense inline-styled markup (looks like it was pasted
  from Word/Google Docs) — stripped with a generic tag-stripper, not anchored
  to specific class names.
- No posting date anywhere on this page either.
- Employment type and experience level are available here but not on the
  listing page.

## Notes

- Confirmed live subdomain: `imperativecare` (2026-08-01).
- No credentials required; this is the same page a browser loads.
- Keep request volume low — a handful of requests per search, not a crawl.
