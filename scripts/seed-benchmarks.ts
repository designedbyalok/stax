/**
 * Seeds the SalaryBenchmark table with the curated benchmark dataset
 * (src/lib/insights/benchmarks.ts) — the rows that power Career Insights.
 *
 * Run with:  bun run scripts/seed-benchmarks.ts
 *   (or:     bun run db:seed)
 *
 * Reads from .env.local (same database the app uses). Idempotent — safe to
 * re-run; existing rows are updated in place. Run this once after applying the
 * migration. The weekly `compute-analytics` Inngest cron also re-seeds, so
 * production self-heals on its next tick.
 */
import "dotenv/config";
import { config } from "dotenv";
config({ path: ".env.local", override: true });

import { upsertSalaryBenchmarks } from "../src/lib/insights/benchmarks";

async function main() {
  console.log("Seeding SalaryBenchmark rows…");
  const { upserted } = await upsertSalaryBenchmarks();
  console.log(`✓ Upserted ${upserted} benchmark rows.`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .then(() => process.exit(0));
