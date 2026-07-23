import { defineCommand, option } from "@bunli/core"
import { z } from "zod"
import { searchJobs, toJobCard, writeError, type JobCard } from "../helpers.js"
import { COMPANIES, findCompany } from "../companies.js"

export const search = defineCommand({
  name: "search",
  description: "Search job listings across Workday-hosted company career sites",
  options: {
    company: option(z.string().default("all"), {
      short: "c",
      description: `Company slug to search, or "all" (default). Known slugs: ${COMPANIES.map((c) => c.slug).join(", ")}`,
    }),
    query: option(z.string().default(""), {
      short: "q",
      description: "Keyword search (server-side full-text on the Workday tenant)",
    }),
    location: option(z.string().optional(), {
      short: "l",
      description: "Location filter (case-insensitive substring match against posting location, applied client-side)",
    }),
    page: option(z.coerce.number().int().min(1).default(1), {
      description: "Page number (1-indexed)",
    }),
    limit: option(z.coerce.number().int().min(1).max(20).default(20), {
      description: "Results per page, per company when --company all. Workday caps this at 20 server-side.",
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

    const offset = (flags.page - 1) * flags.limit
    const failures: string[] = []

    try {
      const allCards: JobCard[] = []
      for (const target of targets) {
        try {
          const response = await searchJobs(target, flags.query, flags.limit, offset)
          if (!response) continue
          for (const posting of response.jobPostings) {
            allCards.push(toJobCard(target, posting))
          }
        } catch (err) {
          // A single tenant being down/blocked (e.g. Akamai bot protection) shouldn't
          // fail the whole multi-company search — record it and keep going.
          failures.push(target.label)
        }
      }

      if (signal.aborted) return

      let results = allCards
      if (flags.location) {
        const l = flags.location.toLowerCase()
        results = results.filter((r) => r.location?.toLowerCase().includes(l))
      }

      const output = {
        meta: { page: flags.page, perPage: flags.limit, failedCompanies: failures.length > 0 ? failures : undefined },
        results,
      }

      if (flags.format === "json") {
        console.log(JSON.stringify(output, null, 2))
      } else if (flags.format === "table") {
        outputTable(results)
      } else {
        outputPlain(results)
      }

      if (failures.length === targets.length && targets.length > 0) {
        writeError(`All targeted Workday tenants failed: ${failures.join(", ")}`, "API_ERROR")
        process.exit(1)
      }
    } catch (err) {
      writeError(err instanceof Error ? err.message : String(err), "API_ERROR")
      process.exit(1)
    }
  },
})

function outputTable(results: JobCard[]): void {
  console.log("id                                                             title                                    company     location")
  for (const r of results) {
    const id = r.id.substring(0, 62).padEnd(63)
    const title = r.title.substring(0, 40).padEnd(40)
    const company = (r.company ?? "-").substring(0, 11).padEnd(11)
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
    console.log("")
  }
}
