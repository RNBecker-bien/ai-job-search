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
  { slug: "pfizer", label: "Pfizer", subdomain: "pfizer", wd: "wd1", tenant: "pfizer", site: "PfizerCareers" },
  { slug: "novartis", label: "Novartis", subdomain: "novartis", wd: "wd3", tenant: "novartis", site: "Novartis_Careers" },
  // "vertexinc.wd1.myworkdayjobs.com/VertexInc" also resolves but is the
  // unrelated tax-software company Vertex Inc, not Vertex Pharmaceuticals —
  // don't swap the tenant below for that one.
  { slug: "vertex", label: "Vertex Pharmaceuticals", subdomain: "vrtx", wd: "wd501", tenant: "vrtx", site: "Vertex_Careers" },
  { slug: "regeneron", label: "Regeneron", subdomain: "regeneron", wd: "wd1", tenant: "regeneron", site: "Careers" },
  { slug: "resilience", label: "Resilience", subdomain: "resilience", wd: "wd1", tenant: "resilience", site: "Resilience_Careers" },
  { slug: "neurocrine", label: "Neurocrine Biosciences", subdomain: "neurocrine", wd: "wd5", tenant: "neurocrine", site: "Neurocrinecareers" },
  { slug: "baxter", label: "Baxter", subdomain: "baxter", wd: "wd1", tenant: "baxter", site: "baxter" },
  { slug: "biocryst", label: "BioCryst Pharmaceuticals", subdomain: "biocryst", wd: "wd501", tenant: "biocryst", site: "External" },
  { slug: "jnj", label: "Johnson & Johnson", subdomain: "jj", wd: "wd5", tenant: "jj", site: "jj" },
  { slug: "tandem", label: "Tandem Diabetes Care", subdomain: "tandemdiabetes", wd: "wd12", tenant: "tandemdiabetes", site: "tandemdiabetes" },
  { slug: "dexcom", label: "Dexcom", subdomain: "dexcom", wd: "wd1", tenant: "dexcom", site: "Dexcom" },
  { slug: "irhythm", label: "iRhythm Technologies", subdomain: "irhythmtech", wd: "wd5", tenant: "irhythmtech", site: "iRhythm" },
  { slug: "insulet", label: "Insulet", subdomain: "insulet", wd: "wd5", tenant: "insulet", site: "insuletcareers" },
  { slug: "appliedmaterials", label: "Applied Materials", subdomain: "amat", wd: "wd1", tenant: "amat", site: "External" },
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
