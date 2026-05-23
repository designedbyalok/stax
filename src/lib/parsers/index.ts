import { fetchHtml, FetchTimeoutError } from "./fetch";
import { ParseResult, SourcePlatform } from "./types";
import { parseGreenhouse } from "./greenhouse";
import { parseLever } from "./lever";
import { parseIndeed } from "./indeed";
import { parseWorkday } from "./workday";
import { parseLinkedIn } from "./linkedin";
import { parseGeneric } from "./generic";
import { companyFromDomain } from "./extract";

export type { ParseResult, SourcePlatform } from "./types";

type ParserEntry = {
  source: SourcePlatform;
  match: (host: string) => boolean;
  parse: (url: string, html: string) => ParseResult | Promise<ParseResult>;
};

const PARSERS: ParserEntry[] = [
  {
    source: "GREENHOUSE",
    match: (h) => h.includes("greenhouse.io") || h.includes("job-boards.greenhouse.io"),
    parse: parseGreenhouse,
  },
  {
    source: "LEVER",
    match: (h) => h.includes("lever.co"),
    parse: parseLever,
  },
  {
    source: "WORKDAY",
    match: (h) => h.includes("myworkdayjobs.com") || h.includes("myworkday.com"),
    parse: parseWorkday,
  },
  {
    source: "INDEED",
    match: (h) => h.includes("indeed.com"),
    parse: parseIndeed,
  },
  {
    source: "LINKEDIN",
    match: (h) => h.includes("linkedin.com"),
    parse: parseLinkedIn,
  },
];

export function detectSource(url: string): SourcePlatform {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return PARSERS.find((p) => p.match(host))?.source ?? "OTHER";
  } catch {
    return "OTHER";
  }
}

export async function parseJobUrl(url: string): Promise<ParseResult> {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return {
      success: false,
      partial: false,
      source: "OTHER",
      fields: {},
      uncertainFields: [],
      originalUrl: url,
      error: "Invalid URL",
    };
  }

  const matched = PARSERS.find((p) => p.match(host));

  try {
    const html = await fetchHtml(url);
    const result = matched
      ? await matched.parse(url, html)
      : parseGeneric(url, html);

    if (!result.success && !result.fields.companyName) {
      // Always preserve a company guess from the domain so the manual-entry
      // fallback isn't completely empty.
      result.fields.companyName = companyFromDomain(url);
    }
    return result;
  } catch (err) {
    const isTimeout = err instanceof FetchTimeoutError;
    return {
      success: false,
      partial: false,
      source: matched?.source ?? "OTHER",
      fields: {
        companyName: companyFromDomain(url),
      },
      uncertainFields: [],
      originalUrl: url,
      error: isTimeout
        ? "Couldn't read the posting in time. Add the details yourself."
        : "We couldn't read this one. Fill in the rest.",
    };
  }
}
