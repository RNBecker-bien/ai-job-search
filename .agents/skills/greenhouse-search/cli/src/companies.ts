export interface CompanyEntry {
  slug: string
  label: string
}

/**
 * Board tokens confirmed live against boards-api.greenhouse.io. Add an entry
 * here to cover a new Greenhouse-hosted employer — no other code changes
 * needed. Find a company's token from its careers URL, e.g.
 * job-boards.greenhouse.io/<token>/jobs/... or boards.greenhouse.io/<token>.
 */
export const COMPANIES: CompanyEntry[] = [
  { slug: "billiontoone", label: "BillionToOne" },
  { slug: "natera", label: "Natera" },
  { slug: "twistbioscience", label: "Twist Bioscience" },
  { slug: "amyrisinc", label: "Amyris" },
  { slug: "calahealth", label: "Cala Health" },
]

export function findCompany(slug: string): CompanyEntry | undefined {
  return COMPANIES.find((c) => c.slug === slug)
}
