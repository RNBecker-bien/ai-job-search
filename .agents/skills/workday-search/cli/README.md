# workday-cli

Zero-dependency CLI that queries the public Workday CXS (Candidate Experience
Service) API for a fixed registry of company tenants (see `src/companies.ts`).
No authentication required, but Workday sites sit behind Akamai bot
protection — a tenant can start rate-limiting or blocking non-browser traffic
without warning. `search --company all` tolerates one tenant failing without
aborting the others; a single-tenant search surfaces the failure directly.

## Usage

```bash
bun install
bun run src/cli.ts search -q "quality engineer" --location California --format table
bun run src/cli.ts detail "amgen:/job/US---California---Thousand-Oaks/Senior-Director-Engineering_R-249191" --format plain
```

## Adding a company

Add an entry to `src/companies.ts` with `slug`, `label`, `subdomain`, `wd`
(shard), `tenant`, and `site`. Find these from the company's careers URL —
`<subdomain>.<wd>.myworkdayjobs.com/<site>` — then confirm the CXS endpoint
resolves before adding:

```bash
curl -s -X POST "https://<subdomain>.<wd>.myworkdayjobs.com/wday/cxs/<tenant>/<site>/jobs" \
  -H "Content-Type: application/json" \
  -d '{"appliedFacets":{},"limit":1,"offset":0,"searchText":""}'
```

A `200` with a `jobPostings` array confirms it. A `422` regardless of the
`site` value you try usually means the tenant blocks this API entirely (this
happened with Eli Lilly during initial setup — every site slug tried
returned 422, so it was dropped from the registry rather than shipped broken).

## Tests

```bash
bun run test        # live smoke tests against the real API
bun run typecheck
```
