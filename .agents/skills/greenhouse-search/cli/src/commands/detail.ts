import { defineCommand, option } from "@bunli/core"
import { z } from "zod"
import { apiFetch, fullDescription, jobUrl, parseCompositeId, writeError, type GreenhouseJob } from "../helpers.js"
import { findCompany } from "../companies.js"

interface DetailResult {
  id: string
  title: string
  company: string | null
  location: string | null
  date: string | null
  url: string
  description: string | null
}

export const detail = defineCommand({
  name: "detail",
  description: "Fetch full job listing detail by composite id (<company>:<jobId>) or Greenhouse URL",
  options: {
    format: option(z.enum(["json", "plain"]).default("json"), {
      description: "Output format: json, plain",
    }),
  },
  handler: async ({ positional, flags, signal }) => {
    if (signal.aborted) return

    const idArg = positional[0]
    if (!idArg) {
      writeError("Job id (<company>:<jobId>) or URL is required", "MISSING_REQUIRED")
      process.exit(1)
    }

    const parsed = parseCompositeId(idArg)
    if (!parsed) {
      writeError(`Could not parse "${idArg}" as <company>:<jobId> or a Greenhouse job URL`, "INVALID_ID")
      process.exit(1)
    }

    try {
      const job = await apiFetch<GreenhouseJob>(jobUrl(parsed.companySlug, parsed.jobId))
      if (!job) {
        writeError("Job not found", "NOT_FOUND")
        process.exit(1)
      }

      if (signal.aborted) return

      const company = findCompany(parsed.companySlug)
      const data: DetailResult = {
        id: `${parsed.companySlug}:${job.id}`,
        title: job.title,
        company: job.company_name ?? company?.label ?? parsed.companySlug,
        location: job.location?.name ?? null,
        date: job.updated_at ?? job.first_published ?? null,
        url: job.absolute_url,
        description: fullDescription(job),
      }

      if (flags.format === "json") {
        console.log(JSON.stringify(data, null, 2))
      } else {
        outputPlain(data)
      }
    } catch (err) {
      writeError(err instanceof Error ? err.message : String(err), "API_ERROR")
      process.exit(1)
    }
  },
})

function outputPlain(data: DetailResult): void {
  console.log(`id: ${data.id}`)
  console.log(`title: ${data.title}`)
  console.log(`company: ${data.company ?? "-"}`)
  console.log(`location: ${data.location ?? "-"}`)
  console.log(`date: ${data.date ?? "-"}`)
  console.log(`url: ${data.url}`)
  console.log("")
  if (data.description) console.log(data.description)
}
