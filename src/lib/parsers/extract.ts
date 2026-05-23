import * as cheerio from "cheerio";

type CheerioAPI = cheerio.CheerioAPI;

/**
 * JSON-LD JobPosting schema — schema.org standard. Most reputable ATS use it.
 * See: https://schema.org/JobPosting
 */
type JsonLdJobPosting = {
  "@type"?: string | string[];
  title?: string;
  description?: string;
  hiringOrganization?: { name?: string; logo?: string | { url?: string } };
  jobLocation?:
    | {
        address?: {
          addressLocality?: string;
          addressRegion?: string;
          addressCountry?: string | { name?: string };
        };
      }
    | Array<{
        address?: {
          addressLocality?: string;
          addressRegion?: string;
          addressCountry?: string | { name?: string };
        };
      }>;
  baseSalary?: {
    value?: {
      minValue?: number;
      maxValue?: number;
      unitText?: string;
      value?: number;
    };
    currency?: string;
  };
};

export function extractJsonLdJobPosting($: CheerioAPI): JsonLdJobPosting | null {
  const scripts = $('script[type="application/ld+json"]').toArray();
  for (const el of scripts) {
    const raw = $(el).contents().text();
    if (!raw) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      continue;
    }
    const candidates = Array.isArray(parsed) ? parsed : [parsed];
    for (const c of candidates) {
      const t = (c as JsonLdJobPosting)["@type"];
      const type = Array.isArray(t) ? t.join(" ") : t;
      if (typeof type === "string" && type.toLowerCase().includes("jobposting")) {
        return c as JsonLdJobPosting;
      }
      // Some sites wrap inside @graph.
      const graph = (c as { "@graph"?: unknown[] })["@graph"];
      if (Array.isArray(graph)) {
        for (const node of graph) {
          const nt = (node as JsonLdJobPosting)["@type"];
          const ntype = Array.isArray(nt) ? nt.join(" ") : nt;
          if (typeof ntype === "string" && ntype.toLowerCase().includes("jobposting")) {
            return node as JsonLdJobPosting;
          }
        }
      }
    }
  }
  return null;
}

export function locationFromJobPosting(jp: JsonLdJobPosting): string | undefined {
  const first = Array.isArray(jp.jobLocation) ? jp.jobLocation[0] : jp.jobLocation;
  if (!first?.address) return undefined;
  const a = first.address;
  const country =
    typeof a.addressCountry === "string"
      ? a.addressCountry
      : a.addressCountry?.name;
  const parts = [a.addressLocality, a.addressRegion, country].filter(Boolean);
  return parts.length ? parts.join(", ") : undefined;
}

export function salaryFromJobPosting(jp: JsonLdJobPosting): string | undefined {
  const v = jp.baseSalary?.value;
  if (!v) return undefined;
  const currency = jp.baseSalary?.currency || "";
  const fmt = (n: number) =>
    n >= 1000 ? `${Math.round(n / 1000)}k` : n.toString();
  if (v.minValue && v.maxValue) {
    return `${currency} ${fmt(v.minValue)} – ${fmt(v.maxValue)}`.trim();
  }
  if (v.value) return `${currency} ${fmt(v.value)}`.trim();
  return undefined;
}

export function logoFromJobPosting(jp: JsonLdJobPosting): string | undefined {
  const logo = jp.hiringOrganization?.logo;
  if (!logo) return undefined;
  if (typeof logo === "string") return logo;
  return logo.url;
}

export function ogMeta($: CheerioAPI, property: string): string | undefined {
  const v = $(`meta[property="${property}"]`).attr("content");
  return v?.trim() || undefined;
}

export function metaName($: CheerioAPI, name: string): string | undefined {
  const v = $(`meta[name="${name}"]`).attr("content");
  return v?.trim() || undefined;
}

export function strip(text?: string | null): string | undefined {
  if (!text) return undefined;
  const cleaned = text.replace(/\s+/g, " ").trim();
  return cleaned || undefined;
}

export function companyFromDomain(url: string): string | undefined {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const root = host.split(".")[0];
    if (!root) return undefined;
    return root.charAt(0).toUpperCase() + root.slice(1);
  } catch {
    return undefined;
  }
}
