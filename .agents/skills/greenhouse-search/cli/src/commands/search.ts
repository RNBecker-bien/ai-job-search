import { defineCommand, option } from "@bunli/core"
import { z } from "zod"
import { apiFetch, boardUrl, toJobCard, writeError, type GreenhouseBoard, type JobCard } from "../helpers.js"
import { COMPANIES, findCompany } from "../companies.js"

export const search = defineCommand({
  name: "search",
  description: "Search job listings across Greenhouse-hosted company boards",
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
      description: "Max age of posting in days (filters on updated_at)",
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
        const board = await apiFetch<GreenhouseBoard>(boardUrl(target.slug))
        if (!board) continue
        for (const job of board.jobs) {
          allCards.push(toJobCard(target.slug, target.label, job))
        }
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
      if (flags.jobage !== undefined) {
        const cutoff = Date.now() - flags.jobage * 24 * 60 * 60 * 1000
        results = results.filter((r) => {
          if (!r.date) return true
          const t = Date.parse(r.date)
          return Number.isNaN(t) ? true : t >= cutoff
        })
      }

      const total = results.length
      const start = (flags.page - 1) * flags.limit
      const paged = results.slice(start, start + flags.limit)

      const output = {
        meta: { total, page: flags.page, perPage: flags.limit },
        results: paged,
      }

      if (flags.format === "json") {
        console.log(JSON.stringify(output, null, 2))
      } else if (flags.format === "table") {
        outputTable(paged)
      } else {
        outputPlain(paged)
      }
    } catch (err) {
      writeError(err instanceof Error ? err.message : String(err), "API_ERROR")
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
    console.log(`date: ${r.date ?? "-"}`)
    console.log(`url: ${r.url}`)
    if (r.description) console.log(`description: ${r.description}`)
    console.log("")
  }
}
