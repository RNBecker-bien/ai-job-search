import { describe, expect, test } from "bun:test";
import { parseJobCards, parseJobDetail, locationSlug } from "../src/helpers";

function searchCard(id: string, title: string, company: string, location: string): string {
  return `<li class="lister__item cf" id="item-${id}">
    <div class="lister__details cf">
      <h3 class="lister__header"><a
        href="
        /job/${id}/${title.toLowerCase().replace(/\s+/g, "-")}/
        " class="js-clickable-area-link"><span>${title}</span></a></h3>
      <ul class="lister__meta">
        <li class="lister__meta-item lister__meta-item--location">${location}</li>
        <li class="lister__meta-item lister__meta-item--salary">70000 - 90000 USD</li>
        <li class="lister__meta-item lister__meta-item--recruiter">${company}</li>
      </ul>
      <p class="lister__description js-clamp-2">A short snippet.</p>
    </div>
  </li>`;
}

describe("parseJobCards", () => {
  test("parses id, title, company, location, salary, url from a card", () => {
    const html = searchCard("3065576", "Research Associate I", "AbbVie", "Irvine, CA");
    const cards = parseJobCards(html);
    expect(cards).toHaveLength(1);
    expect(cards[0]).toMatchObject({
      id: "3065576",
      title: "Research Associate I",
      company: "AbbVie",
      location: "Irvine, CA",
      salary: "70000 - 90000 USD",
      date: null,
    });
    expect(cards[0].url).toBe("https://jobs.biospace.com/job/3065576/research-associate-i/");
  });

  test("one malformed card does not break parsing of the rest", () => {
    const bad = `<li class="lister__item cf" id="item-999"><div>no title here</div></li>`;
    const good = searchCard("111", "Lab Technician", "Bio-Rad", "Hercules, CA");
    const cards = parseJobCards(bad + good);
    expect(cards).toHaveLength(1);
    expect(cards[0].id).toBe("111");
  });

  test("empty html returns no results", () => {
    expect(parseJobCards("<html><body>No jobs found</body></html>")).toHaveLength(0);
  });
});

describe("parseJobDetail", () => {
  test("parses schema.org JSON-LD and GTM dataLayer fields", () => {
    const html = `
      <script type="application/ld+json">
      {
        "@type": "JobPosting",
        "title": "Research Associate I",
        "description": "<p>Do science.</p><ul><li>PCR</li></ul>",
        "datePosted": "2026-08-05T03:16:21.693Z",
        "validThrough": "2026-09-04T03:59:59.000Z",
        "hiringOrganization": { "name": "AbbVie" },
        "jobLocation": [{ "address": { "addressLocality": "Irvine", "addressRegion": "California" } }],
        "employmentType": "[\\"FULL_TIME\\"]"
      }
      </script>
      <script>
      var ClientGoogleTagManagerDataLayer = [
        { "SalaryDescription": "70000 - 90000 USD", "ApplicationURL": "https://careers.abbvie.com/apply/123", "JobRef": "abc-123", "recruiter": "AbbVie" }
      ]
      </script>`;
    const job = parseJobDetail(html, "3065576");
    expect(job.title).toBe("Research Associate I");
    expect(job.company).toBe("AbbVie");
    expect(job.location).toBe("Irvine, California");
    expect(job.date).toBe("2026-08-05T03:16:21.693Z");
    expect(job.validThrough).toBe("2026-09-04T03:59:59.000Z");
    expect(job.employmentType).toBe("FULL_TIME");
    expect(job.salary).toBe("70000 - 90000 USD");
    expect(job.applyUrl).toBe("https://careers.abbvie.com/apply/123");
    expect(job.jobRef).toBe("abc-123");
    expect(job.description).toContain("Do science.");
    expect(job.description).toContain("PCR");
    expect(job.url).toBe("https://jobs.biospace.com/job/3065576/");
  });

  test("missing JSON-LD falls back to defaults without throwing", () => {
    const job = parseJobDetail("<html><body>nothing here</body></html>", "42");
    expect(job.title).toBe("(untitled)");
    expect(job.description).toBeNull();
    expect(job.salary).toBeNull();
    expect(job.id).toBe("42");
  });
});

describe("locationSlug", () => {
  test("lowercases and hyphenates", () => {
    expect(locationSlug("Irvine, CA")).toBe("irvine-ca");
    expect(locationSlug("California")).toBe("california");
  });
  test("undefined/empty returns null", () => {
    expect(locationSlug(undefined)).toBeNull();
    expect(locationSlug("")).toBeNull();
  });
});
