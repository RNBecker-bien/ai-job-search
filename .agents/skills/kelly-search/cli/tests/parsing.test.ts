import { describe, expect, test } from "bun:test";
import { parseJobCards, parseJobDetail, withinJobAge, type JobCard } from "../src/helpers";

/** Build a raw `value="..."` attribute the way Kelly's PHP does: urlencode(json_encode(...)),
 * i.e. spaces become literal `+`, not `%20`. */
function encodeFormJSON(obj: Record<string, string[]>): string {
  const json = JSON.stringify(obj);
  return encodeURIComponent(json).replace(/%20/g, "+");
}

/**
 * `wpPostId` (the `sf-cp-job-info-<N>` wrapper suffix) is Kelly's internal WordPress
 * post ID and is deliberately different from `job_id` in every fixture below — Kelly's
 * real markup has these diverge, and the parser must use `job_id` (the one that
 * actually appears in the permalink), not the wrapper suffix. See helpers.ts.
 */
function jobDataTag(wpPostId: string, fields: Record<string, string[]>, permalink: string): string {
  return `<data id="sf-cp-job-info-${wpPostId}" value="${encodeFormJSON(fields)}" wp-permalink="${permalink}"></data>`;
}

describe("parseJobCards", () => {
  test("decodes a form-urlencoded job-info blob with literal + for spaces, using job_id (not the wrapper's WP post ID)", () => {
    const html = jobDataTag(
      "3746019",
      {
        job_id: ["10324490"],
        job_title: ["Research Associate"],
        _company_name: ["Kelly Services"],
        _job_location: ["Pasadena, CA, United States"],
        salary: ["0"],
        target_payrate: ["48"],
        employment_type: ["Temporary"],
        published_date: ["Fri, 31 Jul 2026 19:05:05 GMT"],
      },
      "https://www.mykelly.com/job/10324490-research-associate-pasadena-ca-united-states/",
    );
    const cards = parseJobCards(html);
    expect(cards).toHaveLength(1);
    expect(cards[0]).toMatchObject({
      id: "10324490",
      title: "Research Associate",
      company: "Kelly Services",
      location: "Pasadena, CA, United States",
      salary: "$48/hr",
      employmentType: "Temporary",
      date: "Fri, 31 Jul 2026 19:05:05 GMT",
      url: "https://www.mykelly.com/job/10324490-research-associate-pasadena-ca-united-states/",
    });
  });

  test("prefers the salary field over target_payrate when salary is set and non-zero", () => {
    const html = jobDataTag(
      "1",
      { job_id: ["501"], job_title: ["Lab Tech"], salary: ["45000 - 55000 USD"], target_payrate: ["22"] },
      "https://www.mykelly.com/job/501-lab-tech/",
    );
    expect(parseJobCards(html)[0].salary).toBe("45000 - 55000 USD");
  });

  test("salary is null when both salary and target_payrate are zero/absent", () => {
    const html = jobDataTag(
      "2",
      { job_id: ["502"], job_title: ["Assembler"], salary: ["0"] },
      "https://www.mykelly.com/job/502-assembler/",
    );
    expect(parseJobCards(html)[0].salary).toBeNull();
  });

  test("target_payrate already carrying its own $ and unit is not double-formatted", () => {
    const html = jobDataTag(
      "3",
      { job_id: ["503"], job_title: ["Scientist"], salary: ["0"], target_payrate: ["$24-25/hour"] },
      "https://www.mykelly.com/job/503-scientist/",
    );
    expect(parseJobCards(html)[0].salary).toBe("$24-25/hour");
  });

  test("one malformed data blob does not break parsing of the rest", () => {
    const bad = `<data id="sf-cp-job-info-999" value="not-valid-json%22" wp-permalink="https://www.mykelly.com/job/999-x/"></data>`;
    const good = jobDataTag(
      "111",
      { job_id: ["10111"], job_title: ["Machine Operator"] },
      "https://www.mykelly.com/job/10111-machine-operator/",
    );
    const cards = parseJobCards(bad + good);
    expect(cards).toHaveLength(1);
    expect(cards[0].id).toBe("10111");
  });

  test("a blob missing job_id entirely is skipped", () => {
    const html = jobDataTag("222", { job_title: ["No ID Job"] }, "https://www.mykelly.com/job/222-no-id/");
    expect(parseJobCards(html)).toHaveLength(0);
  });

  test("no matches returns empty array", () => {
    expect(parseJobCards("<html><body>No jobs found</body></html>")).toHaveLength(0);
  });
});

describe("withinJobAge", () => {
  const card = (date: string | null): JobCard => ({
    id: "1", title: "t", company: null, location: null, salary: null, employmentType: null, date, url: "https://x",
  });

  test("9999 (default/unset) always passes", () => {
    expect(withinJobAge(card(null), 9999)).toBe(true);
  });

  test("null date fails any real jobage filter", () => {
    expect(withinJobAge(card(null), 7)).toBe(false);
  });

  test("recent RFC-1123 date passes a wide window", () => {
    const today = new Date().toUTCString();
    expect(withinJobAge(card(today), 30)).toBe(true);
  });

  test("old date fails a narrow window", () => {
    const old = new Date(Date.now() - 90 * 86400 * 1000).toUTCString();
    expect(withinJobAge(card(old), 7)).toBe(false);
  });
});

describe("parseJobDetail", () => {
  test("parses the JobPosting JSON-LD block and skips the Yoast @graph block", () => {
    const html = `
      <script type="application/ld+json" class="yoast-schema-graph">{"@context":"https://schema.org","@graph":[{"@type":"WebPage"}]}</script>
      <script type="application/ld+json">{
        "@type": "JobPosting",
        "title": "Research Associate",
        "description": "&lt;p&gt;Do science.&lt;/p&gt;&lt;ul&gt;&lt;li&gt;PCR&lt;/li&gt;&lt;/ul&gt;",
        "datePosted": "2026-08-03T15:40:05+00:00",
        "validThrough": "2026-09-02T23:59:59+00:00",
        "hiringOrganization": { "name": "Kelly Services" },
        "jobLocation": { "address": { "addressLocality": "Pasadena", "addressRegion": "California" } },
        "baseSalary": { "currency": "USD", "value": { "value": 48, "unitText": "HOUR" } },
        "employmentType": "[\\"FULL_TIME\\"]"
      }</script>`;
    const job = parseJobDetail(html, "10324490", "https://www.mykelly.com/job/10324490-x/");
    expect(job.title).toBe("Research Associate");
    expect(job.company).toBe("Kelly Services");
    expect(job.location).toBe("Pasadena, California");
    expect(job.date).toBe("2026-08-03T15:40:05+00:00");
    expect(job.validThrough).toBe("2026-09-02T23:59:59+00:00");
    expect(job.salary).toBe("USD 48/hour");
    expect(job.employmentType).toBe("FULL_TIME");
    expect(job.description).toContain("Do science.");
    expect(job.description).toContain("PCR");
  });

  test("missing JobPosting block falls back to defaults without throwing", () => {
    const job = parseJobDetail("<html><body>nothing here</body></html>", "42", "https://www.mykelly.com/job/42-x/");
    expect(job.title).toBe("(untitled)");
    expect(job.description).toBeNull();
    expect(job.id).toBe("42");
  });
});
