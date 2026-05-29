import prisma from "@/lib/db";
import type { ExperienceBracket } from "./experience";
import { findSeedBenchmark, seedSampleSize } from "./benchmarks";
import { currencyForCountry } from "./options";
import { generateSalaryEstimate } from "./ai-insights";

/**
 * Core salary-insight computation. Blends curated benchmark data with
 * community (real opted-in user) data, computes where a given salary lands as
 * a percentile, and counts comparable profiles. Designed to be cheap on read:
 * a handful of indexed queries, no N+1.
 */

export type SalaryDistribution = {
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  median: number;
  sampleSize: number;
  source: "community" | "benchmark" | "ai";
  currency: string;
};

export type SalaryPosition = {
  percentile: number; // 0-100
  label: string;
};

export type DistributionQuery = {
  jobRole: string;
  city?: string | null;
  country: string;
  bracket: ExperienceBracket;
};

/** Community rows are only trusted once they have at least this many samples. */
const COMMUNITY_MIN_SAMPLE = 5;

/** Below this many real comparables we fall back to the benchmark sampleSize. */
const COMPARABLE_MIN = 5;

/**
 * Returns the blended salary distribution for a role × location × bracket.
 *
 * Lookup is scoped by city when one is supplied (city-level), otherwise to the
 * country-level aggregate (rows where city is null). For each scope we prefer
 * a community row with a healthy sample size, falling back to the curated
 * benchmark row. Returns null when no data exists for the slice.
 */
export async function getDistribution(
  query: DistributionQuery,
  opts: { allowAi?: boolean; forceAi?: boolean } = {}
): Promise<SalaryDistribution | null> {
  // A forced refresh skips caches and regenerates the requested slice with AI.
  if (opts.forceAi) {
    return generateAndCache(query);
  }

  const direct = await lookupDistribution(query);
  if (direct) return direct;
  // When we don't have the exact metro, fall back to the country-level
  // (nationwide) aggregate so the insight still renders.
  if (query.city) {
    const countryLevel = await lookupDistribution({ ...query, city: null });
    if (countryLevel) return countryLevel;
  }

  // Nothing cached or curated — generate on demand with AI and cache it.
  if (opts.allowAi) {
    return generateAndCache(query);
  }
  return null;
}

async function lookupDistribution(
  query: DistributionQuery
): Promise<SalaryDistribution | null> {
  const { jobRole, city, country, bracket } = query;

  const rows = await prisma.salaryBenchmark.findMany({
    where: {
      jobRole,
      country,
      experienceBracket: bracket,
      city: city ?? null,
    },
  });

  // Prefer healthy community data, then a curated benchmark, then a cached AI
  // estimate.
  const community = rows.find(
    (r) => r.source === "community" && r.sampleSize >= COMMUNITY_MIN_SAMPLE
  );
  const chosen =
    community ??
    rows.find((r) => r.source === "benchmark") ??
    rows.find((r) => r.source === "ai");

  if (chosen) {
    return {
      p25: chosen.p25,
      p50: chosen.p50,
      p75: chosen.p75,
      p90: chosen.p90,
      median: chosen.p50,
      sampleSize: chosen.sampleSize,
      source:
        chosen.source === "community"
          ? "community"
          : chosen.source === "ai"
            ? "ai"
            : "benchmark",
      currency: chosen.currency,
    };
  }

  // In-code curated dataset (covers India out of the box, no DB seed needed).
  const seed = findSeedBenchmark(jobRole, city ?? null, country, bracket);
  if (seed) {
    return {
      p25: seed.p25,
      p50: seed.p50,
      p75: seed.p75,
      p90: seed.p90,
      median: seed.p50,
      sampleSize: seed.sampleSize,
      source: "benchmark",
      currency: seed.currency,
    };
  }

  return null;
}

/**
 * Generates an AI salary estimate for the slice and caches it as a
 * source="ai" SalaryBenchmark row (idempotent on the role×city×country×bracket
 * key). Returns null if the AI call fails so the UI can degrade gracefully.
 */
async function generateAndCache(
  query: DistributionQuery
): Promise<SalaryDistribution | null> {
  const { jobRole, city, country, bracket } = query;
  const currency = currencyForCountry(country);
  const est = await generateSalaryEstimate({ jobRole, city: city ?? null, country, bracket, currency });
  if (!est) return null;

  const data = {
    p25: est.p25,
    p50: est.p50,
    p75: est.p75,
    p90: est.p90,
    sampleSize: est.comparableCount,
    currency: est.currency,
  };

  // Upsert (manual, since a null city can't use the compound unique key).
  try {
    const existing = await prisma.salaryBenchmark.findFirst({
      where: { jobRole, city: city ?? null, country, experienceBracket: bracket, source: "ai" },
      select: { id: true },
    });
    if (existing) {
      await prisma.salaryBenchmark.update({ where: { id: existing.id }, data });
    } else {
      await prisma.salaryBenchmark.create({
        data: { jobRole, city: city ?? null, country, experienceBracket: bracket, source: "ai", ...data },
      });
    }
  } catch (err) {
    console.warn("Failed to cache AI salary estimate:", err);
  }

  return {
    p25: est.p25,
    p50: est.p50,
    p75: est.p75,
    p90: est.p90,
    median: est.p50,
    sampleSize: est.comparableCount,
    source: "ai",
    currency: est.currency,
  };
}

function labelForPercentile(percentile: number): string {
  if (percentile >= 90) return "Top 10%";
  if (percentile >= 75) return "Top 25%";
  if (percentile >= 50) return "Above median";
  if (percentile >= 25) return "Below median";
  return "Bottom 25%";
}

/**
 * Estimates where `salary` falls within a distribution as a 0-100 percentile,
 * using piecewise-linear interpolation across the p25/p50/p75/p90 anchors.
 * Salaries below p25 or above p90 are extrapolated with the nearest segment
 * slope and clamped to [0, 100].
 */
export function computeSalaryPosition(
  salary: number,
  distribution: Pick<SalaryDistribution, "p25" | "p50" | "p75" | "p90">
): SalaryPosition {
  const { p25, p50, p75, p90 } = distribution;

  // Anchor points: (salary value, percentile).
  const anchors: { value: number; pct: number }[] = [
    { value: p25, pct: 25 },
    { value: p50, pct: 50 },
    { value: p75, pct: 75 },
    { value: p90, pct: 90 },
  ];

  const interp = (
    s: number,
    a: { value: number; pct: number },
    b: { value: number; pct: number }
  ): number => {
    if (b.value === a.value) return a.pct;
    const t = (s - a.value) / (b.value - a.value);
    return a.pct + t * (b.pct - a.pct);
  };

  let percentile: number;
  if (salary <= anchors[0].value) {
    // Below p25: extrapolate down using the p25→p50 slope.
    percentile = interp(salary, anchors[0], anchors[1]);
  } else if (salary >= anchors[anchors.length - 1].value) {
    // Above p90: extrapolate up using the p75→p90 slope.
    percentile = interp(salary, anchors[2], anchors[3]);
  } else {
    percentile = anchors[anchors.length - 1].pct;
    for (let i = 0; i < anchors.length - 1; i++) {
      if (salary >= anchors[i].value && salary <= anchors[i + 1].value) {
        percentile = interp(salary, anchors[i], anchors[i + 1]);
        break;
      }
    }
  }

  percentile = Math.max(0, Math.min(100, Math.round(percentile)));
  return { percentile, label: labelForPercentile(percentile) };
}

export type ComparableQuery = {
  jobRole: string;
  city?: string | null;
  country: string;
};

/**
 * Counts real UserProfiles matching the role × location. When too few real
 * profiles exist we fall back to the curated benchmark sampleSize so the UI
 * always has a meaningful "comparable" figure. `isReal` reports whether the
 * returned count came from actual user data.
 */
export async function comparableCount(
  query: ComparableQuery
): Promise<{ count: number; isReal: boolean }> {
  const { jobRole, city, country } = query;

  const real = await prisma.userProfile.count({
    where: {
      jobRole,
      country,
      ...(city ? { city } : {}),
    },
  });

  if (real >= COMPARABLE_MIN) {
    return { count: real, isReal: true };
  }

  const benchmark = await prisma.salaryBenchmark.findFirst({
    where: {
      jobRole,
      country,
      city: city ?? null,
      source: "benchmark",
    },
    select: { sampleSize: true },
  });

  const size = benchmark?.sampleSize ?? seedSampleSize(jobRole, city ?? null, country);
  return { count: size ?? real, isReal: false };
}
