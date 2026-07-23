import { COMPANIES, baseHost, cxsBase, type CompanyEntry } from "./companies.js"

export function writeError(error: string, code: string): void {
  process.stderr.write(JSON.stringify({ error, code }) + "\n")
}

export interface WorkdayJobPosting {
  title: string
  externalPath: string
  locationsText?: string | null
  postedOn?: string | null
  bulletFields?: string[]
}

export interface WorkdaySearchResponse {
  total: number
  jobPostings: WorkdayJobPosting[]
}

export interface WorkdayJobDetail {
  jobPostingInfo: {
    title: string
    jobDescription?: string | null
    location?: string | null
    postedOn?: string | null
    startDate?: string | null
    timeType?: string | null
    jobReqId?: string | null
    externalUrl?: string | null
  }
}

async function fetchWithRetry(url: string, init: RequestInit): Promise<Response> {
  const maxRetries = 6
  let delay = 500
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, { ...init, signal: AbortSignal.timeout(15000) })
    if (response.status === 429 || response.status >= 500) {
      if (attempt === maxRetries) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }
      const jitter = Math.floor(Math.random() * 500)
      await new Promise((resolve) => setTimeout(resolve, delay + jitter))
      delay = Math.min(delay * 2, 5000)
      continue
    }
    return response
  }
  throw new Error("API request failed after max retries")
}

/**
 * Workday's CXS jobs endpoint requires POST with a JSON body (GET is rejected).
 * searchText does keyword search server-side; there is no location parameter
 * that's stable across tenants, so location filtering happens client-side on
 * `locationsText`.
 */
export async function searchJobs(
  company: CompanyEntry,
  searchText: string,
  limit: number,
  offset: number,
): Promise<WorkdaySearchResponse | null> {
  const url = `${cxsBase(company)}/jobs`
  const response = await fetchWithRetry(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0 (compatible; workday-cli/1.0)" },
    body: JSON.stringify({ appliedFacets: {}, limit, offset, searchText }),
  })
  if (response.status === 404) return null
  if (!response.ok) {
    throw new Error(`API request failed for ${company.label}: ${response.status} ${response.statusText}`)
  }
  return response.json() as Promise<WorkdaySearchResponse>
}

/** externalPath already starts with "/job/..."; the detail endpoint is cxsBase + externalPath, fetched with GET. */
export async function fetchJobDetail(company: CompanyEntry, externalPath: string): Promise<WorkdayJobDetail | null> {
  const url = `${cxsBase(company)}${externalPath}`
  const response = await fetchWithRetry(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; workday-cli/1.0)" },
  })
  if (response.status === 404) return null
  if (!response.ok) {
    throw new Error(`API request failed for ${company.label}: ${response.status} ${response.statusText}`)
  }
  return response.json() as Promise<WorkdayJobDetail>
}

export interface JobCard {
  id: string
  title: string
  company: string | null
  location: string | null
  date: string | null
  url: string
  description: string | null
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
}

function stripTags(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim()
}

export { stripTags }

export function toJobCard(company: CompanyEntry, posting: WorkdayJobPosting): JobCard {
  return {
    id: `${company.slug}:${posting.externalPath}`,
    title: posting.title,
    company: company.label,
    location: posting.locationsText ?? null,
    date: posting.postedOn ?? null,
    url: `${baseHost(company)}${posting.externalPath}`,
    description: null,
  }
}

/** Splits a composite "<companySlug>:<externalPath>" id, or extracts both from a myworkdayjobs.com job URL. */
export function parseCompositeId(idOrUrl: string): { company: CompanyEntry; externalPath: string } | null {
  if (idOrUrl.includes("myworkdayjobs.com")) {
    const jobIdx = idOrUrl.indexOf("/job/")
    if (jobIdx === -1) return null
    const externalPath = idOrUrl.substring(jobIdx)
    const host = idOrUrl.replace(/^https?:\/\//, "").split("/")[0]
    const company = COMPANIES.find((c) => host.startsWith(`${c.subdomain}.${c.wd}.`))
    if (!company) return null
    return { company, externalPath }
  }

  const sepIdx = idOrUrl.indexOf(":/job/")
  if (sepIdx === -1) return null
  const slug = idOrUrl.substring(0, sepIdx)
  const externalPath = idOrUrl.substring(sepIdx + 1)
  const company = COMPANIES.find((c) => c.slug === slug)
  if (!company) return null
  return { company, externalPath }
}
