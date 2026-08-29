export function writeError(error: string, code: string): void {
  process.stderr.write(JSON.stringify({ error, code }) + "\n")
}

export function postingsUrl(companySlug: string): string {
  return `https://api.lever.co/v0/postings/${companySlug}?mode=json`
}

export function postingUrl(companySlug: string, postingId: string): string {
  return `https://api.lever.co/v0/postings/${companySlug}/${postingId}?mode=json`
}

export async function apiFetch<T>(url: string): Promise<T | null> {
  const maxRetries = 6
  let delay = 500
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; lever-cli/1.0)" },
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

export interface LeverCategories {
  team?: string | null
  department?: string | null
  location?: string | null
  allLocations?: string[] | null
  commitment?: string | null
}

export interface LeverPosting {
  id: string
  text: string
  categories?: LeverCategories | null
  createdAt?: number | null
  hostedUrl: string
  applyUrl?: string | null
  descriptionPlain?: string | null
  description?: string | null
  descriptionBodyPlain?: string | null
  additionalPlain?: string | null
  country?: string | null
  workplaceType?: string | null
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

export function toJobCard(companySlug: string, companyLabel: string, posting: LeverPosting, descLimit = 300): JobCard {
  const full = fullDescription(posting)
  const description = full ? full.substring(0, descLimit) || null : null
  return {
    id: `${companySlug}:${posting.id}`,
    title: posting.text,
    company: companyLabel,
    location: posting.categories?.location ?? null,
    date: posting.createdAt ? new Date(posting.createdAt).toISOString() : null,
    url: posting.hostedUrl,
    description,
  }
}

export function fullDescription(posting: LeverPosting): string | null {
  const parts = [posting.descriptionPlain, posting.descriptionBodyPlain, posting.additionalPlain].filter(
    (p): p is string => Boolean(p && p.trim()),
  )
  return parts.length ? parts.join("\n\n").trim() : null
}

/** Splits a composite "<companySlug>:<postingId>" id, or extracts both from a Lever URL. */
export function parseCompositeId(idOrUrl: string): { companySlug: string; postingId: string } | null {
  const urlMatch = idOrUrl.match(
    /jobs\.lever\.co\/([a-z0-9-]+)\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
  )
  if (urlMatch) return { companySlug: urlMatch[1], postingId: urlMatch[2] }

  const compositeMatch = idOrUrl.match(/^([a-z0-9-]+):([0-9a-f-]{36})$/i)
  if (compositeMatch) return { companySlug: compositeMatch[1], postingId: compositeMatch[2] }

  return null
}
