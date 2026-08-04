import { defineCommand, option } from "@bunli/core"
import { z } from "zod"
import { fetchHtml, parseJobDetail, parseCompositeId, writeError, type JobDetail } from "../helpers.js"
import { detailUrl } from "../companies.js"

export const detail = defineCommand({
  name: "detail",
  description: "Fetch full job listing detail by composite id (<company>:<token>) or applytojob.com URL",
  options: {
    format: option(z.enum(["json", "plain"]).default("json"), {
      description: "Output format: json, plain",
    }),
  },
  handler: async ({ positional, flags, signal }) => {
    if (signal.aborted) return

    const idArg = positional[0]
    if (!idArg) {
      writeError("Job id (<company>:<token>) or URL is required", "MISSING_REQUIRED")
      process.exit(1)
    }

    const parsed = parseCompositeId(idArg)
    if (!parsed) {
      writeError(`Could not parse "${idArg}" as <company>:<token> or an applytojob.com job URL`, "INVALID_ID")
      process.exit(1)
    }

    try {
      const url = detailUrl(parsed.company, parsed.token)
      const html = await fetchHtml(url)
      if (!html) {
        writeError("Job not found", "NOT_FOUND")
        process.exit(1)
      }

      if (signal.aborted) return

      const data = parseJobDetail(html, parsed.company, parsed.token, url)
      if (!data) {
        writeError("Could not parse job detail page", "PARSE_ERROR")
        process.exit(1)
      }

      if (flags.format === "json") {
        console.log(JSON.stringify(data, null, 2))
      } else {
        outputPlain(data)
      }
    } catch (err) {
      writeError(err instanceof Error ? err.message : String(err), "FETCH_ERROR")
      process.exit(1)
    }
  },
})

function outputPlain(data: JobDetail): void {
  console.log(`id: ${data.id}`)
  console.log(`title: ${data.title}`)
  console.log(`company: ${data.company ?? "-"}`)
  console.log(`location: ${data.location ?? "-"}`)
  console.log(`department: ${data.department ?? "-"}`)
  console.log(`employment type: ${data.employmentType ?? "-"}`)
  console.log(`experience: ${data.experience ?? "-"}`)
  console.log(`date: ${data.date ?? "-"}`)
  console.log(`url: ${data.url}`)
  console.log("")
  if (data.description) console.log(data.description)
}
