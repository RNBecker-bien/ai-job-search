export interface CompanyEntry {
  slug: string
  label: string
  /** Workday subdomain, e.g. "biibhr" in biibhr.wd3.myworkdayjobs.com */
  subdomain: string
  /** Workday shard, e.g. "wd3" in biibhr.wd3.myworkdayjobs.com */
  wd: string
  /** Workday tenant name used in /wday/cxs/<tenant>/ */
  tenant: string
  /** Workday site name used in /wday/cxs/<tenant>/<site>/ */
  site: string
}

/**
 * Workday CXS tenants confirmed live via POST /wday/cxs/<tenant>/<site>/jobs.
 * Add an entry here to cover a new Workday-hosted employer. Find the values
 * by opening the company's careers page (usually <subdomain>.wdN.myworkdayjobs.com/<site>)
 * and confirming the CXS endpoint resolves — see cli/README.md for the check.
 */
export const COMPANIES: CompanyEntry[] = [
  { slug: "biogen", label: "Biogen", subdomain: "biibhr", wd: "wd3", tenant: "biibhr", site: "external" },
  { slug: "amgen", label: "Amgen", subdomain: "amgen", wd: "wd1", tenant: "amgen", site: "Careers" },
  { slug: "abbott", label: "Abbott", subdomain: "abbott", wd: "wd5", tenant: "abbott", site: "abbottcareers" },
  { slug: "genentech", label: "Genentech", subdomain: "roche", wd: "wd3", tenant: "roche", site: "ROG-A2O-GENE" },
]

export function findCompany(slug: string): CompanyEntry | undefined {
  return COMPANIES.find((c) => c.slug === slug)
}

export function baseHost(company: CompanyEntry): string {
  return `https://${company.subdomain}.${company.wd}.myworkdayjobs.com`
}

export function cxsBase(company: CompanyEntry): string {
  return `${baseHost(company)}/wday/cxs/${company.tenant}/${company.site}`
}
