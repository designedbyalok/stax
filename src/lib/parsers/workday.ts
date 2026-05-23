import * as cheerio from "cheerio";
import { ParseResult, ParseFields } from "./types";
import {
  extractJsonLdJobPosting,
  locationFromJobPosting,
  salaryFromJobPosting,
  logoFromJobPosting,
  ogMeta,
  strip,
  companyFromDomain,
} from "./extract";

/**
 * Workday is a JS-heavy SPA. The initial HTML usually has OG meta tags + a
 * JSON-LD JobPosting block for SEO, even though the body is rendered client-side.
 *
 * URLs look like:
 *   https://<company>.wd1.myworkdayjobs.com/<career-site>/job/<location>/<title>_<jobId>
 */
export function parseWorkday(url: string, html: string): ParseResult {
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

  // OG fallback — Workday SEO usually sets og:title and og:site_name.
  if (!fields.roleTitle) {
    fields.roleTitle = strip(ogMeta($, "og:title") || $("title").first().text());
    if (fields.roleTitle) uncertain.push("roleTitle");
  }
  if (!fields.companyName) {
    fields.companyName =
      strip(ogMeta($, "og:site_name")) || companyFromWorkdayUrl(url);
    if (fields.companyName) uncertain.push("companyName");
  }
  // Location often encoded in the URL path: /job/<location>/<title>_<id>
  if (!fields.location) {
    fields.location = locationFromWorkdayUrl(url);
    if (fields.location) uncertain.push("location");
  }

  const hasCore = !!(fields.roleTitle && fields.companyName);
  return {
    success: hasCore,
    partial: hasCore && (!fields.location || !fields.jobDescription),
    source: "WORKDAY",
    fields,
    uncertainFields: uncertain,
    originalUrl: url,
  };
}

function companyFromWorkdayUrl(url: string): string | undefined {
  try {
    const host = new URL(url).hostname; // <company>.wd1.myworkdayjobs.com
    const sub = host.split(".")[0];
    if (!sub) return companyFromDomain(url);
    return sub.charAt(0).toUpperCase() + sub.slice(1);
  } catch {
    return undefined;
  }
}

function locationFromWorkdayUrl(url: string): string | undefined {
  try {
    const path = new URL(url).pathname.split("/").filter(Boolean);
    // Pattern: <career-site> / "job" / <location> / <title>_<id>
    const idx = path.indexOf("job");
    const loc = idx >= 0 ? path[idx + 1] : undefined;
    if (!loc) return undefined;
    return decodeURIComponent(loc).replace(/-/g, " ");
  } catch {
    return undefined;
  }
}
