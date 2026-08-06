import { describe, test, expect } from "bun:test";
import { runCLI, parseJSON } from "./helpers";

// These hit the real network (www.mykelly.com). Kept minimal — one search, one detail
// lookup — per the repo's "keep volume low" convention.

describe("Kelly CLI live smoke test", () => {
  test("search returns real results with non-null id/title/url", async () => {
    const result = await runCLI(["search", "-q", "research associate Irvine", "--limit", "5"]);
    const parsed = parseJSON<{ meta: { count: number }; results: Array<{ id: string; title: string; url: string }> }>(result);
    expect(parsed.results.length).toBeGreaterThan(0);
    for (const job of parsed.results) {
      expect(job.id).toBeTruthy();
      expect(job.title).toBeTruthy();
      expect(job.url).toMatch(/^https:\/\/www\.mykelly\.com\/job\//);
    }
  }, 30000);

  test("detail resolves a bare ID to its real URL and returns a readable description", async () => {
    const search = await runCLI(["search", "-q", "research associate", "-l", "california", "--limit", "1"]);
    const parsed = parseJSON<{ results: Array<{ id: string }> }>(search);
    expect(parsed.results.length).toBeGreaterThan(0);
    const id = parsed.results[0].id;

    const detail = await runCLI(["detail", id]);
    const job = parseJSON<{ title: string; description: string | null; url: string }>(detail);
    expect(job.title).toBeTruthy();
    expect(job.description).toBeTruthy();
    expect(job.description).not.toMatch(/<[a-z][\s\S]*>/i);
    expect(job.url).toContain(id);
  }, 30000);
});
