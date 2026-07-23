import { defineCommand, option } from "@bunli/core"
import { z } from "zod"
import { fetchJobDetail, parseCompositeId, stripTags, writeError } from "../helpers.js"
import { baseHost } from "../companies.js"

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
  description: "Fetch full job listing detail by composite id (<company>:<externalPath>) or Workday job URL",
  options: {
    format: option(z.enum(["json", "plain"]).default("json"), {
      description: "Output format: json, plain",
    }),
  },
  handler: async ({ positional, flags, signal }) => {
    if (signal.aborted) return

    const idArg = positional[0]
    if (!idArg) {
      writeError("Job id (<company>:<externalPath>) or URL is required", "MISSING_REQUIRED")
      process.exit(1)
    }

    const parsed = parseCompositeId(idArg)
    if (!parsed) {
      writeError(`Could not parse "${idArg}" as <company>:<externalPath> or a Workday job URL`, "INVALID_ID")
      process.exit(1)
    }

    try {
      const detailData = await fetchJobDetail(parsed.company, parsed.externalPath)
      if (!detailData) {
        writeError("Job not found", "NOT_FOUND")
        process.exit(1)
      }

      if (signal.aborted) return

      const info = detailData.jobPostingInfo
      const data: DetailResult = {
        id: `${parsed.company.slug}:${parsed.externalPath}`,
        title: info.title,
        company: parsed.company.label,
        location: info.location ?? null,
        date: info.postedOn ?? info.startDate ?? null,
        url: `${baseHost(parsed.company)}${parsed.externalPath}`,
        description: info.jobDescription ? stripTags(info.jobDescription) : null,
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
