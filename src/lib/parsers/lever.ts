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
 * Lever URLs: https://jobs.lever.co/<company>/<id>
 * Static HTML, structured DOM with classes like .posting-headline, .posting-categories.
 */
export function parseLever(url: string, html: string): ParseResult {
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

  if (!fields.roleTitle) {
    fields.roleTitle = strip(
      $(".posting-headline h2").first().text() || $("h2").first().text()
    );
  }
  if (!fields.companyName) {
    fields.companyName = companyFromLeverUrl(url);
    if (fields.companyName) uncertain.push("companyName");
  }
  if (!fields.location) {
    fields.location = strip(
      $(".posting-categories .location").first().text() ||
        $(".sort-by-time .posting-category").first().text()
    );
  }
  fields.jobDescription = strip(
    $(".section-wrapper").text() || $(".posting-page").text()
  );

  const hasCore = !!(fields.roleTitle && fields.companyName);
  return {
    success: hasCore,
    partial: hasCore && (!fields.location || !fields.jobDescription),
    source: "LEVER",
    fields,
    uncertainFields: uncertain,
    originalUrl: url,
  };
}

function companyFromLeverUrl(url: string): string | undefined {
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
