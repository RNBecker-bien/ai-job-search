import { describe, test, expect } from "bun:test"
import { runCLI, parseJSON } from "./helpers.js"

interface SearchResult {
  meta: { total: number; page: number; perPage: number }
  results: Array<{ id: string; title: string; company: string | null; url: string }>
}

describe("search (live)", () => {
  test("returns results for a known company", async () => {
    const result = await runCLI(["search", "--company", "imperativecare", "--limit", "5"])
    const data = parseJSON<SearchResult>(result)
    expect(data.results.length).toBeGreaterThan(0)
    for (const r of data.results.slice(0, 3)) {
      expect(r.id).toMatch(/^imperativecare:[A-Za-z0-9]+$/)
      expect(r.title.length).toBeGreaterThan(0)
      expect(r.url).toContain("applytojob.com")
    }
  }, 30000)

  test("unknown company slug exits 1 with JSON error on stderr", async () => {
    const result = await runCLI(["search", "--company", "not-a-real-company"])
    expect(result.exitCode).toBe(1)
    const err = JSON.parse(result.stderr)
    expect(err.code).toBe("UNKNOWN_COMPANY")
  }, 15000)
})
