import { COMPANIES, type CompanyEntry } from "./companies.js"

export function writeError(error: string, code: string): void {
  process.stderr.write(JSON.stringify({ error, code }) + "\n")
}

async function fetchWithRetry(url: string): Promise<Response> {
  const maxRetries = 6
  let delay = 500
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; imperativecare-cli/1.0)" },
      signal: AbortSignal.timeout(15000),
      redirect: "follow",
    })
    if (response.status === 429 || response.status >= 500) {
      if (attempt === maxRetries) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`)
      }
      const jitter = Math.floor(Math.random() * 500)
      await new Promise((resolve) => setTimeout(resolve, delay + jitter))
      delay = Math.min(delay * 2, 5000)
      continue
    }
    return response
  }
  throw new Error("Request failed after max retries")
}

/** Fetches a page and returns its HTML, or null on 404/410 (JazzHR returns 410 Gone for closed/unknown postings). */
async function fetchHtml(url: string): Promise<string | null> {
  const response = await fetchWithRetry(url)
  if (response.status === 404 || response.status === 410) return null
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`)
  }
  return response.text()
}

export { fetchHtml }

export interface JobCard {
  id: string
  title: string
  company: string | null
  location: string | null
  date: string | null
  url: string
  department: string | null
  description: string | null
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#8217;/g, "’")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8211;/g, "–")
    .replace(/&#160;/g, " ")
    .replace(/&nbsp;/g, " ")
}

function stripTags(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim()
}

export { stripTags, decodeHtmlEntities }

/**
 * Parses the ApplyToJob (JazzHR) `/apply` listing page. Each posting is a
 * `<li class="list-group-item">` block containing a title link (whose href
 * carries the opaque token, e.g. /apply/32CBp7t1Fy/RD-Engineer-I) and a
 * `list-inline` block with a map-marker location and a sitemap department.
 * There is no posting date anywhere on this page or the detail page.
 */
export function parseJobList(html: string, company: CompanyEntry): JobCard[] {
  const cards: JobCard[] = []
  // Each posting is an outer <li class="list-group-item"> that itself contains
  // nested <li> elements (map-marker, sitemap) inside a list-inline <ul>. A
  // naive non-greedy match up to the first "</li>" would stop at one of those
  // inner closing tags, so anchor on the "</ul>" that ends the nested list —
  // it only appears once per posting, right before the outer "</li>".
  const itemRe = /<li class="list-group-item">([\s\S]*?)<\/ul>\s*<\/li>/g
  let itemMatch: RegExpExecArray | null
  while ((itemMatch = itemRe.exec(html)) !== null) {
    const block = itemMatch[1]

    const linkMatch = block.match(
      /<a href="(https?:\/\/[^"]*\/apply\/([A-Za-z0-9]+)\/[^"]*)">\s*([\s\S]*?)\s*<\/a>/,
    )
    if (!linkMatch) continue
    const [, url, token, rawTitle] = linkMatch
    const title = decodeHtmlEntities(rawTitle.replace(/\s+/g, " ").trim())

    const locationMatch = block.match(/fa-map-marker['"][^>]*><\/i>([^<]*)<\/li>/)
    const location = locationMatch ? decodeHtmlEntities(locationMatch[1].trim()) || null : null

    const deptMatch = block.match(/fa-sitemap['"][^>]*><\/i>([^<]*)<\/li>/)
    const department = deptMatch ? decodeHtmlEntities(deptMatch[1].trim()) || null : null

    cards.push({
      id: `${company.slug}:${token}`,
      title,
      company: company.label,
      location,
      date: null,
      url,
      department,
      description: null,
    })
  }
  return cards
}

export interface JobDetail extends JobCard {
  employmentType: string | null
  experience: string | null
}

/** Parses a single ApplyToJob posting page (`/apply/<token>`). */
export function parseJobDetail(html: string, company: CompanyEntry, token: string, url: string): JobDetail | null {
  const titleMatch = html.match(/<div class='job-header'>[\s\S]*?<h2>([\s\S]*?)<\/h2>/)
  if (!titleMatch) return null
  const title = decodeHtmlEntities(titleMatch[1].replace(/\s+/g, " ").trim())

  const attrBlockMatch = html.match(/<div class="job-attributes-container">([\s\S]*?)<\/div>\s*<\/div>\s*<div class="social-tools">/)
  const attrBlock = attrBlockMatch ? attrBlockMatch[1] : html

  const locationMatch = attrBlock.match(/title="Location">\s*<i[^>]*><\/i>([^<]*)</)
  const location = locationMatch ? decodeHtmlEntities(locationMatch[1].trim()) || null : null

  const deptMatch = attrBlock.match(/title="Department">\s*<i[^>]*><\/i>([^<]*)</)
  const department = deptMatch ? decodeHtmlEntities(deptMatch[1].trim()) || null : null

  const typeMatch = attrBlock.match(/title="Type">\s*<i[^>]*><\/i>([^<]*)</)
  const employmentType = typeMatch ? decodeHtmlEntities(typeMatch[1].trim()) || null : null

  const expMatch = attrBlock.match(/title="Experience">\s*<i[^>]*><\/i>([^<]*)</)
  const experience = expMatch ? decodeHtmlEntities(expMatch[1].trim()) || null : null

  const descMatch = html.match(/id="job-description">([\s\S]*?)<\/div>\s*<div class="resumator-mobile-apply-wrapper/)
  const description = descMatch ? stripTags(descMatch[1]) || null : null

  return {
    id: `${company.slug}:${token}`,
    title,
    company: company.label,
    location,
    date: null,
    url,
    department,
    description,
    employmentType,
    experience,
  }
}

/** Splits a composite "<companySlug>:<token>" id, or extracts both from an applytojob.com URL (keyed by ATS subdomain there). */
export function parseCompositeId(idOrUrl: string): { company: CompanyEntry; token: string } | null {
  const urlMatch = idOrUrl.match(/([a-z0-9-]+)\.applytojob\.com\/apply\/([A-Za-z0-9]+)/i)
  if (urlMatch) {
    const company = COMPANIES.find((c) => c.subdomain === urlMatch[1].toLowerCase())
    if (!company) return null
    return { company, token: urlMatch[2] }
  }

  const compositeMatch = idOrUrl.match(/^([a-z0-9-]+):([A-Za-z0-9]+)$/)
  if (compositeMatch) {
    const company = COMPANIES.find((c) => c.slug === compositeMatch[1])
    if (!company) return null
    return { company, token: compositeMatch[2] }
  }

  return null
}
