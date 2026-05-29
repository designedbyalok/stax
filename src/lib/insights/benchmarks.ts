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
  // p50 annual base salary (INR) at the 3-5 bracket for the anchor metro.
  anchorP50: number;
};

/** Anchor median (3-5 yrs) by role, in INR for the anchor metro (Bengaluru). */
const ROLES: RoleBase[] = [
  { jobRole: "Software Engineer", anchorP50: 2000000 },
  { jobRole: "Frontend Engineer", anchorP50: 1800000 },
  { jobRole: "Backend Engineer", anchorP50: 1900000 },
  { jobRole: "Product Manager", anchorP50: 2800000 },
  { jobRole: "Product Designer", anchorP50: 1700000 },
  { jobRole: "UX Designer", anchorP50: 1500000 },
  { jobRole: "Data Scientist", anchorP50: 2200000 },
  { jobRole: "Data Analyst", anchorP50: 1200000 },
  { jobRole: "Marketing Manager", anchorP50: 1600000 },
  { jobRole: "Sales Manager", anchorP50: 1600000 },
];

type LocationConfig = {
  country: string;
  currency: string;
  // Metros with a cost-of-living multiplier applied to the INR anchor.
  cities: { name: string | null; col: number }[];
  // Multiplier converting the anchor into local currency (1 = already local).
  fx: number;
};

// Coverage is focused on the top Indian metros (anchor: Bengaluru). Numbers are
// rough estimates of annual gross base salary in INR.
const LOCATIONS: LocationConfig[] = [
  {
    country: "India",
    currency: "INR",
    fx: 1,
    cities: [
      { name: "Bengaluru", col: 1.0 },
      { name: "Mumbai", col: 1.0 },
      { name: "Delhi NCR", col: 0.97 },
      { name: "Hyderabad", col: 0.92 },
      { name: "Pune", col: 0.9 },
      { name: "Chennai", col: 0.88 },
      { name: "Kolkata", col: 0.8 },
      { name: null, col: 0.9 }, // country-level
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

const KNOWN_ROLE_NAMES = ROLES.map((r) => r.jobRole);

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
