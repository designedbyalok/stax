import prisma from "@/lib/db";
import { inngest } from "../client";
import { toExperienceBracket, EXPERIENCE_BRACKETS } from "@/lib/insights/experience";
import type { ExperienceBracket } from "@/lib/insights/experience";
import { upsertSalaryBenchmarks } from "@/lib/insights/benchmarks";

/**
 * Weekly community-benchmark aggregation. Mondays at 03:00 UTC.
 *
 * Buckets opted-in user salaries by jobRole × city × country × experience
 * bracket, computes p25/p50/p75/p90 + count, and upserts SalaryBenchmark rows
 * with source = "community". These are preferred over curated "benchmark" rows
 * by the insight engine once they reach a healthy sample size. Groups smaller
 * than 3 are skipped to protect privacy and avoid noise.
 */

const MIN_GROUP = 3;

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const rank = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(rank);
  const hi = Math.ceil(rank);
  if (lo === hi) return sorted[lo];
  const weight = rank - lo;
  return Math.round(sorted[lo] * (1 - weight) + sorted[hi] * weight);
}

type GroupKey = string;

function keyOf(
  jobRole: string,
  city: string | null,
  country: string,
  bracket: ExperienceBracket
): GroupKey {
  return JSON.stringify([jobRole, city, country, bracket]);
}

export const computeAnalytics = inngest.createFunction(
  {
    id: "compute-analytics",
    retries: 2,
    triggers: [{ cron: "0 3 * * 1" }],
  },
  async ({ step }) => {
    // Make sure the curated benchmark rows exist so a fresh database is never
    // empty (idempotent — safe to run every week).
    const seeded = await step.run("seed-benchmarks", () => upsertSalaryBenchmarks());

    // Pull every profile that has the fields needed to be aggregated.
    const profiles = await step.run("load-profiles", async () =>
      prisma.userProfile.findMany({
        where: {
          jobRole: { not: null },
          country: { not: null },
          currentSalary: { not: null },
          yearsExperience: { not: null },
        },
        select: {
          jobRole: true,
          city: true,
          country: true,
          yearsExperience: true,
          currentSalary: true,
          salaryCurrency: true,
        },
      })
    );

    // Bucket into role × city × country × bracket groups. Each profile feeds
    // both its city-level group (when a city is set) and the country-level
    // group (city = null), so country aggregates stay populated.
    const groups = new Map<
      GroupKey,
      {
        jobRole: string;
        city: string | null;
        country: string;
        bracket: ExperienceBracket;
        salaries: number[];
        currency: string;
      }
    >();

    const add = (
      jobRole: string,
      city: string | null,
      country: string,
      bracket: ExperienceBracket,
      salary: number,
      currency: string
    ) => {
      const k = keyOf(jobRole, city, country, bracket);
      const existing = groups.get(k);
      if (existing) {
        existing.salaries.push(salary);
      } else {
        groups.set(k, { jobRole, city, country, bracket, salaries: [salary], currency });
      }
    };

    for (const p of profiles) {
      if (
        !p.jobRole ||
        !p.country ||
        p.currentSalary == null ||
        p.yearsExperience == null
      ) {
        continue;
      }
      const bracket = toExperienceBracket(p.yearsExperience);
      const currency = p.salaryCurrency ?? "USD";
      if (p.city) {
        add(p.jobRole, p.city, p.country, bracket, p.currentSalary, currency);
      }
      add(p.jobRole, null, p.country, bracket, p.currentSalary, currency);
    }

    const rows = Array.from(groups.values())
      .filter((g) => g.salaries.length >= MIN_GROUP)
      .map((g) => {
        const sorted = [...g.salaries].sort((a, b) => a - b);
        return {
          jobRole: g.jobRole,
          city: g.city,
          country: g.country,
          experienceBracket: g.bracket,
          p25: percentile(sorted, 25),
          p50: percentile(sorted, 50),
          p75: percentile(sorted, 75),
          p90: percentile(sorted, 90),
          sampleSize: sorted.length,
          currency: g.currency,
        };
      });

    const written = await step.run("upsert-community-benchmarks", async () => {
      let count = 0;
      for (const row of rows) {
        // Postgres treats NULL as distinct in unique constraints, so a compound
        // upsert keyed on a null `city` would never match an existing row. Do a
        // manual find-then-update/create to keep country-level rows idempotent.
        const existing = await prisma.salaryBenchmark.findFirst({
          where: {
            jobRole: row.jobRole,
            city: row.city,
            country: row.country,
            experienceBracket: row.experienceBracket,
            source: "community",
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
              source: "community",
            },
          });
        }
        count += 1;
      }
      return count;
    });

    return {
      benchmarksSeeded: seeded.upserted,
      profilesScanned: profiles.length,
      groupsConsidered: groups.size,
      bracketsTracked: EXPERIENCE_BRACKETS.length,
      communityRowsWritten: written,
    };
  }
);
