import * as cheerio from "cheerio";
import { ParseResult, ParseFields } from "./types";
import {
  extractJsonLdJobPosting,
  locationFromJobPosting,
  salaryFromJobPosting,
  logoFromJobPosting,
  strip,
} from "./extract";

/**
 * Indeed renders heavy JS but ships JSON-LD JobPosting in initial HTML
 * for most postings. We lean on that.
 */
export function parseIndeed(url: string, html: string): ParseResult {
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
    fields.jobDescription = strip(stripHtml(jp.description));
  } else {
    // Indeed sometimes hides the post behind a Cloudflare/bot wall.
    // Fall back to the visible h1/title and let the user fix the rest.
    fields.roleTitle = strip($("h1").first().text());
    if (fields.roleTitle) uncertain.push("roleTitle");
  }

  const hasCore = !!(fields.roleTitle && fields.companyName);
  return {
    success: hasCore,
    partial: hasCore && (!fields.location || !fields.jobDescription),
    source: "INDEED",
    fields,
    uncertainFields: uncertain,
    originalUrl: url,
  };
}

function stripHtml(s: string | undefined | null): string | undefined {
  if (!s) return undefined;
  return s.replace(/<[^>]+>/g, " ");
}
