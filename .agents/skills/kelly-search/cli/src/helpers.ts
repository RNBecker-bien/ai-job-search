// Data source: www.mykelly.com (Kelly Services candidate job board, WordPress +
// FacetWP). Search is a stateless POST to FacetWP's refresh endpoint (no cookies, no
// nonce, no prior GET required — confirmed by testing). Detail pages are normal
// WordPress single-post pages that require the *correct* permalink slug, not just the
// numeric ID — see url-reference.md.

export const SEARCH_URL = "https://www.mykelly.com/wp-json/facetwp/v1/refresh"
export const SITE_BASE = "https://www.mykelly.com"

export function writeError(error: string, code: string): void {
  process.stderr.write(JSON.stringify({ error, code }) + "\n")
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

async function fetchWithBackoff(url: string, init: RequestInit): Promise<Response> {
  const maxRetries = 6
  let delay = 500
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, { ...init, signal: AbortSignal.timeout(15000) })
    if (response.status === 429 || response.status >= 500) {
      if (attempt === maxRetries) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`)
      }
      const jitter = Math.floor(Math.random() * 500)
      await new Promise((r) => setTimeout(r, delay + jitter))
      delay = Math.min(delay * 2, 8000)
      continue
    }
    return response
  }
  throw new Error("Request failed after max retries")
}

/** GET a page's HTML. Returns "" on a 404. */
export async function htmlFetch(url: string): Promise<string> {
  const response = await fetchWithBackoff(url, {
    headers: {
      "User-Agent": UA,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
    redirect: "follow",
  })
  if (response.status === 404) return ""
  if (!response.ok) throw new Error(`Request failed: ${response.status} ${response.statusText}`)
  return response.text()
}

export interface FacetWPResponse {
  template: string
  settings?: { pager?: { page: number; per_page: number; total_rows: number; total_pages: number } }
}

/** POST a FacetWP keyword/location search. */
export async function facetSearch(keyword: string, location: string, paged: number): Promise<FacetWPResponse> {
  const body = {
    action: "facetwp_refresh",
    data: {
      facets: { keyword, city_or_postal_code: location },
      frozen_facets: {},
      http_params: { get: {}, uri: "job-search", url_vars: [] },
      template: "jobs",
      extras: { pager: true },
      soft_refresh: 0,
      is_bfcache: 0,
      first_load: 0,
      paged,
    },
  }
  const response = await fetchWithBackoff(SEARCH_URL, {
    method: "POST",
    headers: {
      "User-Agent": UA,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(`Request failed: ${response.status} ${response.statusText}`)
  const text = await response.text()
  try {
    return JSON.parse(text) as FacetWPResponse
  } catch {
    throw new Error("FacetWP returned a non-JSON response")
  }
}

export interface JobCard {
  id: string
  title: string
  company: string | null
  location: string | null
  salary: string | null
  employmentType: string | null
  date: string | null
  url: string
}

export interface JobDetail extends JobCard {
  description: string | null
  validThrough: string | null
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

/**
 * Decode the `value="..."` attribute of a `<data id="sf-cp-job-info-…">` tag: it is
 * www-form-urlencoded (literal `+` for spaces), not plain percent-encoding, so `+` must
 * be converted to a space *before* decodeURIComponent — decodeURIComponent alone leaves
 * literal `+` characters in place.
 */
function decodeFormJSON(raw: string): Record<string, string[]> | null {
  try {
    const decoded = decodeURIComponent(raw.replace(/\+/g, " "))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

function first(fields: Record<string, string[]>, key: string): string | null {
  const v = fields[key]
  return Array.isArray(v) && typeof v[0] === "string" && v[0] !== "" ? v[0] : null
}

/**
 * `target_payrate` is inconsistently formatted at the source: sometimes a bare number
 * ("48"), sometimes already carries a "$" and/or a rate unit ("$24-25/hour",
 * "$30-45 per hour"). Only add what's actually missing so we never double up.
 */
function formatPayrate(raw: string): string {
  let s = raw.trim()
  if (!s.includes("$")) s = `$${s}`
  if (!/\/\s*hr\b|\/\s*hour\b|per\s*hour/i.test(s)) s = `${s}/hr`
  return s
}

/** Parse a search response's `template` HTML into job cards. */
export function parseJobCards(templateHtml: string): JobCard[] {
  const results: JobCard[] = []
  const re = /<data id="sf-cp-job-info-\d+" value="([^"]*)"[^>]*wp-permalink="([^"]*)"/g
  let m: RegExpExecArray | null
  while ((m = re.exec(templateHtml)) !== null) {
    const [, rawValue, permalink] = m
    const fields = decodeFormJSON(rawValue)
    if (!fields) continue
    const title = first(fields, "job_title")
    if (!title) continue
    // The `sf-cp-job-info-<N>` wrapper ID is Kelly's internal WordPress post ID, which
    // does NOT match the ATS `job_id` used in the listing's own permalink URL — use
    // job_id as the canonical id so it round-trips through `detail`.
    const id = first(fields, "job_id")
    if (!id) continue

    const payrate = first(fields, "target_payrate")
    const salaryField = first(fields, "salary")
    const salary =
      salaryField && salaryField !== "0"
        ? salaryField
        : payrate && payrate !== "0"
          ? formatPayrate(payrate)
          : null

    results.push({
      id,
      title,
      company: first(fields, "_company_name"),
      location: first(fields, "_job_location"),
      salary,
      employmentType: first(fields, "employment_type"),
      date: first(fields, "published_date"),
      url: decodeHtmlEntities(permalink),
    })
  }
  return results
}

/** Resolve a bare numeric job ID to its permalink URL via a keyword search on the ID. */
export async function resolveIdToUrl(id: string): Promise<string | null> {
  const resp = await facetSearch(id, "", 1)
  const cards = parseJobCards(resp.template)
  const match = cards.find((c) => c.id === id)
  return match ? match.url : null
}

/** Parse the detail page's schema.org JobPosting JSON-LD block (not the Yoast @graph one). */
export function parseJobDetail(html: string, id: string, url: string): JobDetail {
  let title = "(untitled)"
  let description: string | null = null
  let date: string | null = null
  let validThrough: string | null = null
  let company: string | null = null
  let location: string | null = null
  let salary: string | null = null
  let employmentType: string | null = null

  const scriptRe = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
  let sm: RegExpExecArray | null
  while ((sm = scriptRe.exec(html)) !== null) {
    let data: unknown
    try {
      data = JSON.parse(sm[1].trim())
    } catch {
      continue
    }
    if (!data || typeof data !== "object" || (data as { "@type"?: string })["@type"] !== "JobPosting") continue

    const d = data as Record<string, unknown>
    if (typeof d.title === "string") title = d.title
    if (typeof d.description === "string") {
      const withBreaks = decodeHtmlEntities(d.description)
        .replace(/<\s*br\s*\/?>/gi, "\n")
        .replace(/<\/(p|li|ul|ol|div|h\d)>/gi, "\n")
      description = decodeHtmlEntities(stripTags(withBreaks)).replace(/\n{3,}/g, "\n\n").trim() || null
    }
    if (typeof d.datePosted === "string") date = d.datePosted
    if (typeof d.validThrough === "string") validThrough = d.validThrough
    const org = d.hiringOrganization as { name?: string } | undefined
    if (org && typeof org.name === "string") company = org.name
    const place = d.jobLocation as { address?: Record<string, string> } | undefined
    if (place?.address) {
      location = [place.address.addressLocality, place.address.addressRegion].filter(Boolean).join(", ") || null
    }
    const base = d.baseSalary as { currency?: string; value?: { value?: number; unitText?: string } } | undefined
    if (base?.value?.value !== undefined) {
      const unit = base.value.unitText ? base.value.unitText.toLowerCase() : ""
      salary = `${base.currency ?? "USD"} ${base.value.value}${unit ? `/${unit}` : ""}`
    }
    if (typeof d.employmentType === "string") {
      try {
        const parsed = JSON.parse(d.employmentType)
        employmentType = Array.isArray(parsed) ? parsed.join(", ") : String(parsed)
      } catch {
        employmentType = d.employmentType
      }
    }
    break
  }

  return {
    id,
    title,
    company,
    location,
    salary,
    employmentType,
    date,
    url,
    description,
    validThrough,
  }
}

/** Client-side jobage filter: keep cards whose published_date is within N days of now. */
export function withinJobAge(card: JobCard, days: number): boolean {
  if (!days || days >= 9999) return true
  if (!card.date) return false
  const posted = new Date(card.date).getTime()
  if (isNaN(posted)) return false
  const cutoff = Date.now() - days * 86400 * 1000
  return posted >= cutoff
}
