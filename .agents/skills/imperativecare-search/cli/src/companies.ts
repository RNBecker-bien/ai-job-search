export interface CompanyEntry {
  slug: string
  label: string
  /** ApplyToJob/JazzHR subdomain, e.g. "imperativecare" in imperativecare.applytojob.com */
  subdomain: string
}

/**
 * ApplyToJob (JazzHR) careers sites confirmed live. Add an entry here to
 * cover another JazzHR-hosted employer — no other code changes needed. Find
 * the subdomain from the company's careers URL:
 * <subdomain>.applytojob.com/apply/...
 */
export const COMPANIES: CompanyEntry[] = [
  { slug: "imperativecare", label: "Imperative Care", subdomain: "imperativecare" },
]

export function findCompany(slug: string): CompanyEntry | undefined {
  return COMPANIES.find((c) => c.slug === slug)
}

/** Looks up by ATS subdomain (used when parsing an applytojob.com URL, which carries the subdomain, not the slug). */
export function findCompanyBySubdomain(subdomain: string): CompanyEntry | undefined {
  return COMPANIES.find((c) => c.subdomain === subdomain)
}

export function baseHost(company: CompanyEntry): string {
  return `https://${company.subdomain}.applytojob.com`
}

export function listUrl(company: CompanyEntry): string {
  return `${baseHost(company)}/apply`
}

export function detailUrl(company: CompanyEntry, token: string): string {
  return `${baseHost(company)}/apply/${token}`
}
