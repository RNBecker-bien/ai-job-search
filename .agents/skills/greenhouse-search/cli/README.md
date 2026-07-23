# greenhouse-cli

Zero-dependency CLI that queries the public [Greenhouse Job Board API](https://developers.greenhouse.io/job-board.html)
(`boards-api.greenhouse.io`) for a fixed registry of companies (see `src/companies.ts`).
No authentication required.

## Usage

```bash
bun install
bun run src/cli.ts search -q "quality engineer" --location California --format table
bun run src/cli.ts detail billiontoone:4713218005 --format plain
```

## Adding a company

Add `{ slug, label }` to `src/companies.ts`. Find the slug from the company's
careers URL: `job-boards.greenhouse.io/<slug>/jobs/...` or `boards.greenhouse.io/<slug>`.
Confirm it resolves before adding:

```bash
curl -s "https://boards-api.greenhouse.io/v1/boards/<slug>/jobs?content=true" | head -c 200
```

## Tests

```bash
bun run test        # live smoke tests against the real API
bun run typecheck
```
