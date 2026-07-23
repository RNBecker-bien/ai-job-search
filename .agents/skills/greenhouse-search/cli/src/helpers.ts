export function writeError(error: string, code: string): void {
  process.stderr.write(JSON.stringify({ error, code }) + "\n")
}

export function boardUrl(companySlug: string): string {
  return `https://boards-api.greenhouse.io/v1/boards/${companySlug}/jobs?content=true`
}

export function jobUrl(companySlug: string, jobId: string): string {
  return `https://boards-api.greenhouse.io/v1/boards/${companySlug}/jobs/${jobId}?content=true`
}

export async function apiFetch<T>(url: string): Promise<T | null> {
  const maxRetries = 6
  let delay = 500
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; greenhouse-cli/1.0)" },
      signal: AbortSignal.timeout(15000),
    })
    if (response.status === 404) return null
    if (response.status === 429 || response.status >= 500) {
      if (attempt === maxRetries) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }
      const jitter = Math.floor(Math.random() * 500)
      await new Promise((resolve) => setTimeout(resolve, delay + jitter))
      delay = Math.min(delay * 2, 5000)
      continue
    }
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }
    return response.json() as Promise<T>
  }
  throw new Error("API request failed after max retries")
}

export interface GreenhouseJob {
  id: number
  title: string
  absolute_url: string
  location?: { name?: string | null } | null
  updated_at?: string | null
  first_published?: string | null
  content?: string | null
  company_name?: string | null
}

export interface GreenhouseBoard {
  jobs: GreenhouseJob[]
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

export function toJobCard(companySlug: string, companyLabel: string, job: GreenhouseJob, descLimit = 300): JobCard {
  const description = job.content ? stripTags(job.content).substring(0, descLimit) || null : null
  return {
    id: `${companySlug}:${job.id}`,
    title: job.title,
    company: job.company_name ?? companyLabel,
    location: job.location?.name ?? null,
    date: job.updated_at ?? job.first_published ?? null,
    url: job.absolute_url,
    description,
  }
}

export function fullDescription(job: GreenhouseJob): string | null {
  return job.content ? stripTags(job.content) : null
}

/** Splits a composite "<companySlug>:<jobId>" id, or extracts both from a Greenhouse URL. */
export function parseCompositeId(idOrUrl: string): { companySlug: string; jobId: string } | null {
  const urlMatch = idOrUrl.match(/greenhouse\.io\/(?:v1\/boards\/)?([a-z0-9-]+)\/jobs\/(\d+)/i)
  if (urlMatch) return { companySlug: urlMatch[1], jobId: urlMatch[2] }

  const compositeMatch = idOrUrl.match(/^([a-z0-9-]+):(\d+)$/i)
  if (compositeMatch) return { companySlug: compositeMatch[1], jobId: compositeMatch[2] }

  return null
}
