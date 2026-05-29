import prisma from "@/lib/db";
import type { ExperienceBracket } from "./experience";

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
  source: "community" | "benchmark";
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

  if (rows.length === 0) return null;

  const community = rows.find(
    (r) => r.source === "community" && r.sampleSize >= COMMUNITY_MIN_SAMPLE
  );
  const benchmark = rows.find((r) => r.source === "benchmark");

  const chosen = community ?? benchmark ?? rows[0];

  return {
    p25: chosen.p25,
    p50: chosen.p50,
    p75: chosen.p75,
    p90: chosen.p90,
    median: chosen.p50,
    sampleSize: chosen.sampleSize,
    source: chosen.source === "community" ? "community" : "benchmark",
    currency: chosen.currency,
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

  return { count: benchmark?.sampleSize ?? real, isReal: false };
}
