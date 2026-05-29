import prisma from "@/lib/db";
import type { ExperienceBracket } from "./experience";

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

type RoleBase = {
  jobRole: string;
  // p50 base salary at the 3-5 bracket for the "anchor" location of each country
  anchorP50: number;
};

/** Anchor median (3-5 yrs) by role, expressed in USD for US anchor city (SF). */
const ROLES: RoleBase[] = [
  { jobRole: "Software Engineer", anchorP50: 165000 },
  { jobRole: "Frontend Engineer", anchorP50: 158000 },
  { jobRole: "Backend Engineer", anchorP50: 162000 },
  { jobRole: "Product Manager", anchorP50: 170000 },
  { jobRole: "Product Designer", anchorP50: 145000 },
  { jobRole: "UX Designer", anchorP50: 135000 },
  { jobRole: "Data Scientist", anchorP50: 160000 },
  { jobRole: "Data Analyst", anchorP50: 115000 },
  { jobRole: "Marketing Manager", anchorP50: 125000 },
  { jobRole: "Sales Manager", anchorP50: 130000 },
];

type LocationConfig = {
  country: string;
  currency: string;
  // Cities with a cost-of-living multiplier applied to the USD anchor, plus a
  // currency conversion factor to express numbers in local currency.
  cities: { name: string | null; col: number }[];
  // Multiplier converting USD anchor into local currency.
  fx: number;
};

const LOCATIONS: LocationConfig[] = [
  {
    country: "United States",
    currency: "USD",
    fx: 1,
    cities: [
      { name: "San Francisco", col: 1.0 },
      { name: "New York", col: 0.95 },
      { name: "Austin", col: 0.8 },
      { name: null, col: 0.82 }, // country-level
    ],
  },
  {
    country: "United Kingdom",
    currency: "GBP",
    fx: 0.5, // rough: UK tech base sits well below US even before FX
    cities: [
      { name: "London", col: 1.0 },
      { name: null, col: 0.85 },
    ],
  },
  {
    country: "India",
    currency: "INR",
    fx: 22, // USD anchor * 0.18 (local level) * ~120 INR/USD ≈ 22x in absolute INR
    cities: [
      { name: "Bangalore", col: 1.0 },
      { name: "Mumbai", col: 0.92 },
      { name: null, col: 0.85 },
    ],
  },
];

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

function buildSeed(): BenchmarkSeedRow[] {
  const rows: BenchmarkSeedRow[] = [];
  const brackets = Object.keys(BRACKET_FACTOR) as ExperienceBracket[];

  for (const role of ROLES) {
    for (const loc of LOCATIONS) {
      for (const city of loc.cities) {
        for (const bracket of brackets) {
          const p50 = round(
            role.anchorP50 * loc.fx * city.col * BRACKET_FACTOR[bracket]
          );
          rows.push({
            jobRole: role.jobRole,
            city: city.name,
            country: loc.country,
            experienceBracket: bracket,
            p25: round(p50 * 0.82),
            p50,
            p75: round(p50 * 1.22),
            p90: round(p50 * 1.5),
            // Country-level rows aggregate more samples than single cities.
            sampleSize: city.name === null ? 600 : 180,
            currency: loc.currency,
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
