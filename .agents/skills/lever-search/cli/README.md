# lever-cli

Zero-dependency CLI that queries the public [Lever Postings API](https://help.lever.co/hc/en-us/articles/360003215931-Job-Postings-API)
(`api.lever.co/v0/postings/<site>`) for a fixed registry of companies (see `src/companies.ts`).
No authentication required.

## Usage

```bash
bun install
bun run src/cli.ts search -q "manufacturing engineer" --location California --format table
bun run src/cli.ts detail penumbrainc:270ab137-6144-4126-aced-a4d4094048d6 --format plain
```

## Adding a company

Add `{ slug, label }` to `src/companies.ts`. Find the slug from the company's
careers URL: `jobs.lever.co/<slug>`. Confirm it resolves before adding:

```bash
curl -s "https://api.lever.co/v0/postings/<slug>?mode=json&limit=1" | head -c 200
```

## Tests

```bash
bun run test        # live smoke tests against the real API
bun run typecheck
```
