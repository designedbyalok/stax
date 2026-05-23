import * as cheerio from "cheerio";
import { ParseResult, ParseFields } from "./types";
import {
  extractJsonLdJobPosting,
  locationFromJobPosting,
  salaryFromJobPosting,
  logoFromJobPosting,
  strip,
  companyFromDomain,
} from "./extract";

/**
 * Greenhouse-hosted job posts are static HTML and ship JSON-LD JobPosting.
 * URLs look like:
 *   https://boards.greenhouse.io/<company>/jobs/<id>
 *   https://job-boards.greenhouse.io/<company>/jobs/<id>
 */
export function parseGreenhouse(url: string, html: string): ParseResult {
  const $ = cheerio.load(html);
  const fields: ParseFields = {};
  const uncertain: (keyof ParseFields)[] = [];

  const jp = extractJsonLdJobPosting($);
  if (jp) {
    fields.roleTitle = strip(jp.title);
    fields.companyName = strip(jp.hiringOrganization?.name);
    fields.location = locationFromJobPosting(jp);
    fields.salaryRange = salaryFromJobPosting(jp);
    fields.companyLogoUrl = logoFromJobPosting(jp);
  }

  // Greenhouse-specific fallbacks.
  if (!fields.roleTitle) {
    fields.roleTitle = strip($(".app-title").first().text() || $("h1").first().text());
  }
  if (!fields.companyName) {
    fields.companyName =
      strip($(".company-name").first().text()) || companyFromGreenhouseUrl(url);
    if (fields.companyName) uncertain.push("companyName");
  }
  if (!fields.location) {
    fields.location = strip($(".location").first().text());
  }
  fields.jobDescription = strip($("#content").text() || $(".job-post").text());

  const hasCore = !!(fields.roleTitle && fields.companyName);
  return {
    success: hasCore,
    partial: hasCore && (!fields.location || !fields.jobDescription),
    source: "GREENHOUSE",
    fields,
    uncertainFields: uncertain,
    originalUrl: url,
  };
}

function companyFromGreenhouseUrl(url: string): string | undefined {
  try {
    const path = new URL(url).pathname.split("/").filter(Boolean);
    const slug = path[0];
    if (!slug) return companyFromDomain(url);
    return slug
      .split("-")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
  } catch {
    return undefined;
  }
}
