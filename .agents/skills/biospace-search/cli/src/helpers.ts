// Data source: jobs.biospace.com (Madgex-powered board). No authentication required.
// Search returns server-rendered HTML (one <li class="lister__item"> per posting);
// detail returns a page embedding a schema.org/JobPosting JSON-LD block plus a
// secondary GTM dataLayer block that carries salary/apply-link fields the JSON-LD omits.

export const SEARCH_BASE = "https://jobs.biospace.com/jobs"
export const DETAIL_BASE = "https://jobs.biospace.com/job"

export function writeError(error: string, code: string): void {
  process.stderr.write(JSON.stringify({ error, code }) + "\n")
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

/** Fetch HTML with exponential backoff on 429/5xx. Returns "" on a 404. */
export async function htmlFetch(url: string): Promise<string> {
  const maxRetries = 6
  let delay = 500
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    })
    if (response.status === 429 || response.status >= 500) {
      if (attempt === maxRetries) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`)
      }
      const jitter = Math.floor(Math.random() * 500)
      await new Promise((r) => setTimeout(r, delay + jitter))
      delay = Math.min(delay * 2, 8000)
      continue
    }
    if (response.status === 404) return ""
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`)
    }
    return response.text()
  }
  throw new Error("Request failed after max retries")
}

export interface JobCard {
  id: string
  title: string
  company: string | null
  location: string | null
  salary: string | null
  date: string | null
  url: string
}

export interface JobDetail extends JobCard {
  description: string | null
  employmentType: string | null
  validThrough: string | null
  applyUrl: string | null
  jobRef: string | null
}

function numericEntity(cp: number): string {
  return cp >= 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : ""
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => numericEntity(parseInt(dec, 10)))
    .replace(/&#[xX]([0-9a-fA-F]+);/g, (_, hex) => numericEntity(parseInt(hex, 16)))
    .replace(/&nbsp;/g, " ")
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

function clean(html: string): string {
  return decodeHtmlEntities(stripTags(html))
}

/** Slugify a free-text location into the path segment BioSpace expects (best-effort). */
export function locationSlug(location: string | undefined): string | null {
  if (!location) return null
  const slug = location
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return slug || null
}

/**
 * Parse the search-results page: a flat list of <li class="lister__item"> cards.
 * We split on that opening tag and parse each chunk independently so one malformed
 * card cannot break the rest.
 */
export function parseJobCards(html: string): JobCard[] {
  const results: JobCard[] = []
  const chunks = html.split(/<li class="lister__item/).slice(1)

  for (const chunk of chunks) {
    const idMatch = chunk.match(/id="item-(\d+)"/)
    if (!idMatch) continue
    const id = idMatch[1]

    const titleMatch = chunk.match(
      /<h3 class="lister__header">[\s\S]*?href="\s*([^"]*?)\s*"[^>]*>[\s\S]*?<span>([\s\S]*?)<\/span>/i,
    )
    if (!titleMatch) continue
    const href = decodeHtmlEntities(titleMatch[1].trim())
    const title = clean(titleMatch[2])
    if (!title) continue
    const url = href.startsWith("http") ? href : `https://jobs.biospace.com${href}`

    const companyMatch = chunk.match(
      /class="lister__meta-item lister__meta-item--recruiter">([\s\S]*?)<\/li>/i,
    )
    const company = companyMatch ? clean(companyMatch[1]) || null : null

    const locationMatch = chunk.match(
      /class="lister__meta-item lister__meta-item--location">([\s\S]*?)<\/li>/i,
    )
    const location = locationMatch ? clean(locationMatch[1]) || null : null

    const salaryMatch = chunk.match(
      /class="lister__meta-item lister__meta-item--salary">([\s\S]*?)<\/li>/i,
    )
    const salary = salaryMatch ? clean(salaryMatch[1]) || null : null

    results.push({ id, title, company, location, salary, date: null, url })
  }

  return results
}

/** Parse the single-job detail page: schema.org JSON-LD plus the GTM dataLayer. */
export function parseJobDetail(html: string, id: string): JobDetail {
  let title = "(untitled)"
  let description: string | null = null
  let date: string | null = null
  let validThrough: string | null = null
  let company: string | null = null
  let location: string | null = null
  let employmentType: string | null = null

  const ldMatch = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/i,
  )
  if (ldMatch) {
    try {
      const data = JSON.parse(ldMatch[1].trim())
      if (typeof data.title === "string") title = data.title
      if (typeof data.description === "string") {
        const withBreaks = data.description
          .replace(/<\s*br\s*\/?>/gi, "\n")
          .replace(/<\/(p|li|ul|ol|div|h\d)>/gi, "\n")
        description = decodeHtmlEntities(stripTags(withBreaks)).replace(/\n{3,}/g, "\n\n").trim() || null
      }
      if (typeof data.datePosted === "string") date = data.datePosted
      if (typeof data.validThrough === "string") validThrough = data.validThrough
      if (data.hiringOrganization && typeof data.hiringOrganization.name === "string") {
        company = data.hiringOrganization.name
      }
      const place = Array.isArray(data.jobLocation) ? data.jobLocation[0] : null
      const addr = place?.address
      if (addr) {
        location = [addr.addressLocality, addr.addressRegion].filter(Boolean).join(", ") || null
      }
      if (typeof data.employmentType === "string") {
        try {
          const parsed = JSON.parse(data.employmentType)
          employmentType = Array.isArray(parsed) ? parsed.join(", ") : String(parsed)
        } catch {
          employmentType = data.employmentType
        }
      }
    } catch {
      // Malformed JSON-LD: fall through with whatever defaults we have.
    }
  }

  let salary: string | null = null
  let applyUrl: string | null = null
  let jobRef: string | null = null
  const gtmMatch = html.match(/ClientGoogleTagManagerDataLayer\s*=\s*(\[[\s\S]*?\])\s*\n\s*<\/script>/)
  if (gtmMatch) {
    try {
      const layer = JSON.parse(gtmMatch[1])
      const entry = Array.isArray(layer) ? layer[0] : null
      if (entry) {
        if (typeof entry.SalaryDescription === "string") {
          salary = entry.SalaryDescription.trim() || null
        }
        if (typeof entry.ApplicationURL === "string") applyUrl = entry.ApplicationURL
        if (typeof entry.JobRef === "string") jobRef = entry.JobRef
        if (!company && typeof entry.recruiter === "string") company = entry.recruiter
        if (!location && typeof entry.LocationDescription === "string") location = entry.LocationDescription
      }
    } catch {
      // Malformed dataLayer JSON: salary/applyUrl stay null.
    }
  }

  return {
    id,
    title,
    company,
    location,
    salary,
    date,
    url: `${DETAIL_BASE}/${id}/`,
    description,
    employmentType,
    validThrough,
    applyUrl,
    jobRef,
  }
}
