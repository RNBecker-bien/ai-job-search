import { SITE_BASE, htmlFetch, parseJobDetail, resolveIdToUrl, writeError } from "../helpers.js"

export interface DetailOpts {
  id: string
  format: "json" | "plain"
}

/** Accept a full mykelly.com job URL, or a bare numeric job ID. */
function extractIdAndUrl(input: string): { id: string; url: string | null } {
  if (/^\d+$/.test(input)) return { id: input, url: null }
  const urlMatch = input.match(/\/job\/(\d+)-/)
  if (urlMatch) {
    const url = input.startsWith("http") ? input : `${SITE_BASE}${input}`
    return { id: urlMatch[1], url }
  }
  return { id: input, url: null }
}

export async function runDetail(opts: DetailOpts): Promise<number> {
  const { id, url: givenUrl } = extractIdAndUrl(opts.id)
  if (!/^\d+$/.test(id)) {
    writeError(`Could not parse a job ID from "${opts.id}"`, "BAD_ID")
    return 1
  }
  try {
    // Kelly's permalink slug is not cosmetic — a bare ID must be resolved to its real
    // URL via a keyword search before the detail page can be fetched.
    const url = givenUrl ?? (await resolveIdToUrl(id))
    if (!url) {
      writeError("Job not found", "NOT_FOUND")
      return 1
    }
    const html = await htmlFetch(url)
    if (!html) {
      writeError("Job not found", "NOT_FOUND")
      return 1
    }
    const job = parseJobDetail(html, id, url)

    if (opts.format === "plain") {
      const lines = [
        job.title,
        `${job.company || "—"} · ${job.location || "—"}`,
        job.salary ? `Salary: ${job.salary}` : "",
        job.employmentType ? `Employment: ${job.employmentType}` : "",
        job.date ? `Posted: ${job.date}` : "",
        job.validThrough ? `Valid through: ${job.validThrough}` : "",
        "",
        job.description || "(no description)",
        "",
        `URL: ${job.url}`,
      ].filter((l) => l !== "")
      process.stdout.write(lines.join("\n") + "\n")
    } else {
      process.stdout.write(JSON.stringify(job, null, 2) + "\n")
    }
    return 0
  } catch (e) {
    writeError(e instanceof Error ? e.message : String(e), "DETAIL_FAILED")
    return 1
  }
}
