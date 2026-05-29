import prisma from "@/lib/db";
import type { ExperienceBracket } from "./experience";
import { COUNTRIES } from "./options";

/**
 * ============================================================================
 * CURATED SALARY BENCHMARK SEED DATA
 * ============================================================================
 * These numbers are *rough estimates* assembled for product/demo purposes —
 * NOT authoritative market data. They are annual gross base salaries in the
 * local currency for each location. City rows have a concrete city; rows with
 * `city: null` are country-level aggregates.
 *
 * Real "community" data (source = "community") is layered on top of these by
 * the weekly `compute-analytics` Inngest cron, which aggregates opted-in user
 * salaries. The seed rows always use source = "benchmark".
 * ============================================================================
 */

export type BenchmarkSeedRow = {
  jobRole: string;
  city: string | null;
  country: string;
  experienceBracket: ExperienceBracket;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  sampleSize: number;
  currency: string;
};

/** Anchor median (3-5 yrs) by role, in USD at a top US metro. */
const ROLE_ANCHOR_USD: Record<string, number> = {
  "Software Engineer": 165000,
  "Frontend Engineer": 150000,
  "Backend Engineer": 158000,
  "Product Manager": 170000,
  "Product Designer": 140000,
  "UX Designer": 130000,
  "Data Scientist": 160000,
  "Data Analyst": 110000,
  "Marketing Manager": 120000,
  "Sales Manager": 125000,
};

/**
 * Per-country economics: `level` is the local market level relative to the US
 * anchor (in USD terms); `fx` converts USD into the local currency. Together
 * `level * fx` scales the USD anchor into a realistic local-currency figure.
 */
const COUNTRY_ECON: Record<string, { level: number; fx: number }> = {
  "United States": { level: 1.0, fx: 1 },
  India: { level: 0.18, fx: 83 },
  "United Kingdom": { level: 0.62, fx: 0.79 },
  Australia: { level: 0.72, fx: 1.5 },
  "New Zealand": { level: 0.6, fx: 1.65 },
  Canada: { level: 0.72, fx: 1.36 },
  Singapore: { level: 0.85, fx: 1.35 },
  Germany: { level: 0.7, fx: 0.92 },
  Ireland: { level: 0.78, fx: 0.92 },
  "United Arab Emirates": { level: 0.8, fx: 3.67 },
};

/** Cost-of-living multiplier per metro (relative to its country anchor city). */
const CITY_COL: Record<string, number> = {
  // US
  "San Francisco": 1.0, "New York": 0.98, Seattle: 0.95, Boston: 0.92,
  "Los Angeles": 0.9, Austin: 0.85, Chicago: 0.85,
  // India
  Bengaluru: 1.0, Mumbai: 1.0, "Delhi NCR": 0.97, Hyderabad: 0.92,
  Pune: 0.9, Chennai: 0.88, Kolkata: 0.8,
  // UK
  London: 1.0, Cambridge: 0.9, Edinburgh: 0.85, Bristol: 0.83, Manchester: 0.82,
  // Australia
  Sydney: 1.0, Melbourne: 0.95, Canberra: 0.92, Brisbane: 0.88, Perth: 0.88,
  // New Zealand
  Auckland: 1.0, Wellington: 0.95, Christchurch: 0.88,
  // Canada
  Toronto: 1.0, Vancouver: 0.98, Ottawa: 0.9, Montreal: 0.88,
  // Singapore
  Singapore: 1.0,
  // Germany
  Munich: 1.05, Frankfurt: 1.02, Berlin: 1.0, Hamburg: 0.98,
  // Ireland
  Dublin: 1.0, Cork: 0.9,
  // UAE
  Dubai: 1.0, "Abu Dhabi": 0.98,
};

/** Multiplier applied to the 3-5 median to derive each bracket's median. */
const BRACKET_FACTOR: Record<ExperienceBracket, number> = {
  "0-2": 0.72,
  "3-5": 1.0,
  "6-9": 1.32,
  "10+": 1.7,
};

function round(n: number): number {
  // Round to the nearest 1000 to keep numbers tidy.
  return Math.round(n / 1000) * 1000;
}

// Covers every country/metro offered in the pickers. Numbers are rough
// estimates of annual gross base salary in local currency — a sane fallback
// when AI / community data isn't available for a slice.
function buildSeed(): BenchmarkSeedRow[] {
  const rows: BenchmarkSeedRow[] = [];
  const brackets = Object.keys(BRACKET_FACTOR) as ExperienceBracket[];
  const roles = Object.keys(ROLE_ANCHOR_USD);

  for (const country of COUNTRIES) {
    const econ = COUNTRY_ECON[country.country] ?? { level: 0.5, fx: 1 };
    // Each metro, plus a country-level (city = null) aggregate.
    const places: { name: string | null; col: number }[] = [
      ...country.cities.map((name) => ({ name, col: CITY_COL[name] ?? 0.9 })),
      { name: null, col: 0.88 },
    ];

    for (const role of roles) {
      const anchorLocal = ROLE_ANCHOR_USD[role] * econ.level * econ.fx;
      for (const place of places) {
        for (const bracket of brackets) {
          const p50 = round(anchorLocal * place.col * BRACKET_FACTOR[bracket]);
          rows.push({
            jobRole: role,
            city: place.name,
            country: country.country,
            experienceBracket: bracket,
            p25: round(p50 * 0.82),
            p50,
            p75: round(p50 * 1.22),
            p90: round(p50 * 1.5),
            sampleSize: place.name === null ? 600 : 180,
            currency: country.currency,
          });
        }
      }
    }
  }

  return rows;
}

/** The full curated benchmark dataset (estimates — see file header). */
export const SALARY_BENCHMARKS: BenchmarkSeedRow[] = buildSeed();

/**
 * Upserts every curated benchmark row with source = "benchmark". Safe to run
 * repeatedly (idempotent on the unique [jobRole, city, country, bracket, source]
 * key). Used by `prisma/seed` and can be triggered manually.
 */
export async function upsertSalaryBenchmarks(): Promise<{ upserted: number }> {
  let upserted = 0;
  for (const row of SALARY_BENCHMARKS) {
    // Postgres treats NULL as distinct in unique constraints, so a compound
    // upsert keyed on a null `city` (country-level rows) would never match an
    // existing row. Use a manual find-then-update/create to stay idempotent.
    const existing = await prisma.salaryBenchmark.findFirst({
      where: {
        jobRole: row.jobRole,
        city: row.city,
        country: row.country,
        experienceBracket: row.experienceBracket,
        source: "benchmark",
      },
      select: { id: true },
    });

    if (existing) {
      await prisma.salaryBenchmark.update({
        where: { id: existing.id },
        data: {
          p25: row.p25,
          p50: row.p50,
          p75: row.p75,
          p90: row.p90,
          sampleSize: row.sampleSize,
          currency: row.currency,
        },
      });
    } else {
      await prisma.salaryBenchmark.create({
        data: {
          jobRole: row.jobRole,
          city: row.city,
          country: row.country,
          experienceBracket: row.experienceBracket,
          p25: row.p25,
          p50: row.p50,
          p75: row.p75,
          p90: row.p90,
          sampleSize: row.sampleSize,
          currency: row.currency,
          source: "benchmark",
        },
      });
    }
    upserted += 1;
  }
  return { upserted };
}

const sameCity = (a: string | null, b: string | null) =>
  (a ?? "").toLowerCase() === (b ?? "").toLowerCase();

// Common role aliases → our canonical dataset role, so free-typed titles still
// resolve (e.g. "Software Developer" → "Software Engineer").
const ROLE_SYNONYMS: Record<string, string> = {
  "software developer": "Software Engineer",
  "software engineer": "Software Engineer",
  sde: "Software Engineer",
  "full stack engineer": "Software Engineer",
  "full-stack engineer": "Software Engineer",
  developer: "Software Engineer",
  "frontend engineer": "Frontend Engineer",
  "front end engineer": "Frontend Engineer",
  "frontend developer": "Frontend Engineer",
  "ui engineer": "Frontend Engineer",
  "backend engineer": "Backend Engineer",
  "back end engineer": "Backend Engineer",
  "backend developer": "Backend Engineer",
  "product manager": "Product Manager",
  pm: "Product Manager",
  "product designer": "Product Designer",
  designer: "Product Designer",
  "ux designer": "UX Designer",
  "ui/ux designer": "UX Designer",
  "ui designer": "UX Designer",
  "data scientist": "Data Scientist",
  "ml engineer": "Data Scientist",
  "data analyst": "Data Analyst",
  analyst: "Data Analyst",
  "marketing manager": "Marketing Manager",
  marketing: "Marketing Manager",
  "sales manager": "Sales Manager",
  sales: "Sales Manager",
};

const KNOWN_ROLE_NAMES = Object.keys(ROLE_ANCHOR_USD);

/** Maps a free-typed job title onto a canonical dataset role, or null. */
export function canonicalRole(role?: string | null): string | null {
  if (!role) return null;
  const key = role.trim().toLowerCase();
  if (ROLE_SYNONYMS[key]) return ROLE_SYNONYMS[key];
  const exact = KNOWN_ROLE_NAMES.find((r) => r.toLowerCase() === key);
  return exact ?? null;
}

/**
 * Looks up a curated benchmark row from the in-code dataset. Used as a fallback
 * by the insight engine so insights work even before the SalaryBenchmark table
 * has been seeded in the database.
 */
export function findSeedBenchmark(
  jobRole: string,
  city: string | null,
  country: string,
  bracket: ExperienceBracket
): BenchmarkSeedRow | undefined {
  return SALARY_BENCHMARKS.find(
    (r) =>
      r.jobRole === jobRole &&
      sameCity(r.city, city) &&
      r.country === country &&
      r.experienceBracket === bracket
  );
}

/** Curated sample size for a role × location (any bracket), for fallbacks. */
export function seedSampleSize(
  jobRole: string,
  city: string | null,
  country: string
): number | undefined {
  return SALARY_BENCHMARKS.find(
    (r) => r.jobRole === jobRole && sameCity(r.city, city) && r.country === country
  )?.sampleSize;
}
