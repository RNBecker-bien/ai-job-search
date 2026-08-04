# imperativecare-cli

Zero-extra-parsing CLI that scrapes the public ApplyToJob (JazzHR) careers
site for a fixed registry of companies (see `src/companies.ts`). No
authentication required — these are the same pages a browser loads. There is
no JSON API backing this ATS; the listing and detail pages are server-rendered
HTML, parsed here with chunked regexes so one malformed card can't break the
rest.

## Usage

```bash
bun install
bun run src/cli.ts search -q "engineer" --format table
bun run src/cli.ts detail imperativecare:32CBp7t1Fy --format plain
```

## Adding a company

Add `{ slug, label, subdomain }` to `src/companies.ts`. Find the subdomain
from the company's careers URL: `<subdomain>.applytojob.com/apply/...`.
Confirm it resolves before adding:

```bash
curl -s "https://<subdomain>.applytojob.com/apply" | grep -o 'apply/[A-Za-z0-9]*/[A-Za-z0-9%-]*' | head
```

## Notes

- No posting date is exposed anywhere on the listing or detail page for this
  ATS — `date` is always `null` and `--jobage` is accepted but has no effect.
- Bad/expired job tokens return HTTP 410 (Gone), not 404 — both are treated
  as "not found" by `fetchHtml`.
- The URL's trailing title slug (e.g. `/RD-Engineer-I`) is cosmetic; JazzHR
  resolves the posting from the opaque token alone.

## Tests

```bash
bun run test        # live smoke tests against the real site
bun run typecheck
```
