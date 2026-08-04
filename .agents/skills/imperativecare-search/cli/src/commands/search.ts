import { defineCommand, option } from "@bunli/core"
import { z } from "zod"
import { fetchHtml, parseJobList, writeError, type JobCard } from "../helpers.js"
import { COMPANIES, findCompany, listUrl } from "../companies.js"

export const search = defineCommand({
  name: "search",
  description: "Search job listings across ApplyToJob (JazzHR)-hosted company careers pages",
  options: {
    company: option(z.string().default("all"), {
      short: "c",
      description: `Company slug to search, or "all" (default). Known slugs: ${COMPANIES.map((c) => c.slug).join(", ")}`,
    }),
    query: option(z.string().optional(), {
      short: "q",
      description: "Keyword filter on job title (case-insensitive substring match)",
    }),
    location: option(z.string().optional(), {
      short: "l",
      description: "Location filter (case-insensitive substring match against posting location)",
    }),
    jobage: option(z.coerce.number().optional(), {
      description: "Unsupported on this ATS: postings carry no date anywhere on the site. Accepted but ignored (a note is added to meta).",
    }),
    page: option(z.coerce.number().int().min(1).default(1), {
      description: "Page number (1-indexed, client-side pagination)",
    }),
    limit: option(z.coerce.number().int().min(1).default(25), {
      description: "Results per page (client-side)",
    }),
    format: option(z.enum(["json", "table", "plain"]).default("json"), {
      description: "Output format: json, table, plain",
    }),
  },
  handler: async ({ flags, signal }) => {
    let targets = COMPANIES
    if (flags.company !== "all") {
      const found = findCompany(flags.company)
      if (!found) {
        writeError(
          `Unknown company slug "${flags.company}". Known slugs: ${COMPANIES.map((c) => c.slug).join(", ")}`,
          "UNKNOWN_COMPANY",
        )
        process.exit(1)
      }
      targets = [found]
    }

    if (signal.aborted) return

    try {
      const allCards: JobCard[] = []
      for (const target of targets) {
        const html = await fetchHtml(listUrl(target))
        if (!html) continue
        allCards.push(...parseJobList(html, target))
      }

      if (signal.aborted) return

      let results = allCards
      if (flags.query) {
        const q = flags.query.toLowerCase()
        results = results.filter((r) => r.title.toLowerCase().includes(q))
      }
      if (flags.location) {
        const l = flags.location.toLowerCase()
        results = results.filter((r) => r.location?.toLowerCase().includes(l))
      }

      const total = results.length
      const start = (flags.page - 1) * flags.limit
      const paged = results.slice(start, start + flags.limit)

      const meta: Record<string, unknown> = { total, page: flags.page, perPage: flags.limit }
      if (flags.jobage !== undefined) {
        meta.jobageIgnored = "This ATS exposes no posting date on the listing or detail page; --jobage was accepted but had no effect."
      }

      const output = { meta, results: paged }

      if (flags.format === "json") {
        console.log(JSON.stringify(output, null, 2))
      } else if (flags.format === "table") {
        outputTable(paged)
      } else {
        outputPlain(paged)
      }
    } catch (err) {
      writeError(err instanceof Error ? err.message : String(err), "FETCH_ERROR")
      process.exit(1)
    }
  },
})

function outputTable(results: JobCard[]): void {
  console.log("id                          title                                    company              location")
  for (const r of results) {
    const id = r.id.substring(0, 27).padEnd(28)
    const title = r.title.substring(0, 40).padEnd(40)
    const company = (r.company ?? "-").substring(0, 20).padEnd(20)
    const location = r.location ?? "-"
    console.log(`${id} ${title} ${company} ${location}`)
  }
}

function outputPlain(results: JobCard[]): void {
  for (const r of results) {
    console.log(`id: ${r.id}`)
    console.log(`title: ${r.title}`)
    console.log(`company: ${r.company ?? "-"}`)
    console.log(`location: ${r.location ?? "-"}`)
    console.log(`department: ${r.department ?? "-"}`)
    console.log(`date: ${r.date ?? "-"}`)
    console.log(`url: ${r.url}`)
    console.log("")
  }
}
