import * as cheerio from "cheerio";
import { ParseResult, ParseFields } from "./types";
import { ogMeta, strip } from "./extract";

/**
 * LinkedIn aggressively blocks scraping. Logged-out pages return a thin shell
 * with OG meta tags only. We grab what we can and let the UI degrade gracefully
 * to manual entry.
 *
 * The PRD explicitly accepts low parse rates here.
 */
export function parseLinkedIn(url: string, html: string): ParseResult {
  const $ = cheerio.load(html);
  const fields: ParseFields = {};
  const uncertain: (keyof ParseFields)[] = [];

  // og:title is usually "<Role Title> - <Company> | LinkedIn"
  const ogTitle = ogMeta($, "og:title") || strip($("title").first().text());
  if (ogTitle) {
    const cleaned = ogTitle.replace(/\s*\|\s*LinkedIn\s*$/i, "").trim();
    // Split on " - " or " at " or " | "
    const match = cleaned.match(/^(.+?)\s+(?:-|at|\|)\s+(.+)$/i);
    if (match) {
      fields.roleTitle = strip(match[1]);
      fields.companyName = strip(match[2]);
    } else {
      fields.roleTitle = cleaned;
      uncertain.push("roleTitle");
    }
  }

  fields.jobDescription = strip(ogMeta($, "og:description"));
  if (fields.jobDescription) uncertain.push("jobDescription");

  fields.companyLogoUrl = strip(ogMeta($, "og:image"));

  const hasCore = !!(fields.roleTitle && fields.companyName);
  return {
    success: hasCore,
    partial: true, // LinkedIn parses are always partial — user fills in the rest.
    source: "LINKEDIN",
    fields,
    uncertainFields: uncertain,
    originalUrl: url,
  };
}
