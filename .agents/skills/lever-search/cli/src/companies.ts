export interface CompanyEntry {
  slug: string
  label: string
}

/**
 * Lever site tokens confirmed live against api.lever.co/v0/postings/<slug>.
 * Add an entry here to cover a new Lever-hosted employer — no other code
 * changes needed. Find a company's slug from its careers URL, e.g.
 * jobs.lever.co/<slug>.
 */
export const COMPANIES: CompanyEntry[] = [
  { slug: "penumbrainc", label: "Penumbra, Inc." },
]

export function findCompany(slug: string): CompanyEntry | undefined {
  return COMPANIES.find((c) => c.slug === slug)
}
