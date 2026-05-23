import * as cheerio from "cheerio";
import { ParseResult, ParseFields } from "./types";
import {
  extractJsonLdJobPosting,
  locationFromJobPosting,
  salaryFromJobPosting,
  logoFromJobPosting,
  ogMeta,
  metaName,
  strip,
  companyFromDomain,
} from "./extract";

export function parseGeneric(url: string, html: string): ParseResult {
  const $ = cheerio.load(html);
  const fields: ParseFields = {};
  const uncertain: (keyof ParseFields)[] = [];

  const jp = extractJsonLdJobPosting($);
  if (jp) {
    fields.roleTitle = strip(jp.title);
    fields.companyName = strip(jp.hiringOrganization?.name);
    fields.location = locationFromJobPosting(jp);
    fields.salaryRange = salaryFromJobPosting(jp);
    fields.jobDescription = strip(stripHtml(jp.description));
    fields.companyLogoUrl = logoFromJobPosting(jp);
  }

  // OpenGraph fallbacks.
  if (!fields.roleTitle) {
    fields.roleTitle = strip(ogMeta($, "og:title") || $("title").first().text());
    if (fields.roleTitle) uncertain.push("roleTitle");
  }
  if (!fields.companyName) {
    fields.companyName =
      strip(ogMeta($, "og:site_name")) || companyFromDomain(url);
    if (fields.companyName) uncertain.push("companyName");
  }
  if (!fields.jobDescription) {
    fields.jobDescription =
      strip(ogMeta($, "og:description") || metaName($, "description"));
    if (fields.jobDescription) uncertain.push("jobDescription");
  }
  if (!fields.companyLogoUrl) {
    fields.companyLogoUrl = strip(ogMeta($, "og:image"));
  }

  const hasAny = Object.values(fields).some(Boolean);

  return {
    success: hasAny,
    partial: hasAny && (!fields.roleTitle || !fields.companyName),
    source: "OTHER",
    fields,
    uncertainFields: uncertain,
    originalUrl: url,
  };
}

function stripHtml(s: string | undefined | null): string | undefined {
  if (!s) return undefined;
  return s.replace(/<[^>]+>/g, " ");
}
