import { describe, test, expect } from "bun:test";
import { runCLI, parseJSON } from "./helpers";

// These hit the real network (jobs.biospace.com). Kept minimal — one search,
// one detail lookup — per the repo's "keep volume low" convention.

describe("BioSpace CLI live smoke test", () => {
  test("search returns real results with non-null id/title/url", async () => {
    const result = await runCLI(["search", "-q", "research associate", "-l", "california", "--limit", "5"]);
    const parsed = parseJSON<{ meta: { count: number }; results: Array<{ id: string; title: string; url: string }> }>(result);
    expect(parsed.results.length).toBeGreaterThan(0);
    for (const job of parsed.results) {
      expect(job.id).toBeTruthy();
      expect(job.title).toBeTruthy();
      expect(job.url).toMatch(/^https:\/\/jobs\.biospace\.com\/job\//);
    }
  }, 30000);

  test("detail returns a readable description for a real listing", async () => {
    const search = await runCLI(["search", "-q", "research associate", "-l", "california", "--limit", "1"]);
    const parsed = parseJSON<{ results: Array<{ id: string }> }>(search);
    expect(parsed.results.length).toBeGreaterThan(0);
    const id = parsed.results[0].id;

    const detail = await runCLI(["detail", id]);
    const job = parseJSON<{ title: string; description: string | null }>(detail);
    expect(job.title).toBeTruthy();
    expect(job.description).toBeTruthy();
    expect(job.description).not.toMatch(/<[a-z][\s\S]*>/i);
  }, 30000);
});
