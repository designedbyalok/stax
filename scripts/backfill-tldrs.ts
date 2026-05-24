/**
 * One-off backfill: generate the full AI summary (headline + bullets +
 * responsibilities + qualifications + keywords) for every Application
 * that has a jobDescription and is missing any of those pieces.
 *
 * Run with:  bun run scripts/backfill-tldrs.ts
 *
 * Reads from .env.local (same database the app uses). Idempotent —
 * re-running only touches rows that are still missing a TL;DR or were
 * generated before the richer schema landed.
 */
import "dotenv/config";
import { config } from "dotenv";
config({ path: ".env.local", override: true });

import { PrismaClient } from "@prisma/client";
import { generateJobTldr } from "../src/lib/ai/tldr";

const prisma = new PrismaClient();

// Polite throttle: don't slam Gemini if there are hundreds of rows.
// Gemini Flash free tier is 15 RPM; paid is 1k. 600ms between calls
// keeps us well under either.
const DELAY_MS = 600;

async function main() {
  // A row needs backfill if it has a JD AND either:
  //   - no headline yet (never summarized), OR
  //   - has headline but the new array fields are still empty (summarized
  //     before responsibilities/qualifications/keywords existed).
  const apps = await prisma.application.findMany({
    where: {
      jobDescription: { not: null },
      deletedAt: null,
      OR: [
        { tldrHeadline: null },
        { responsibilities: { isEmpty: true } },
        { qualifications: { isEmpty: true } },
        { keywords: { isEmpty: true } },
      ],
    },
    select: {
      id: true,
      companyName: true,
      roleTitle: true,
      jobDescription: true,
    },
  });

  console.log(`Found ${apps.length} applications needing a TL;DR.`);

  let done = 0;
  let skipped = 0;
  let failed = 0;

  for (const app of apps) {
    const idx = done + skipped + failed + 1;
    process.stdout.write(
      `[${idx}/${apps.length}] ${app.companyName} — ${app.roleTitle} … `
    );

    try {
      const tldr = await generateJobTldr(app.jobDescription ?? "");
      if (!tldr) {
        console.log("skipped (too short / Gemini failed)");
        skipped++;
      } else {
        await prisma.application.update({
          where: { id: app.id },
          data: {
            tldrHeadline: tldr.headline,
            tldrBullets: tldr.bullets,
            responsibilities: tldr.responsibilities,
            qualifications: tldr.qualifications,
            keywords: tldr.keywords,
          },
        });
        console.log("ok");
        done++;
      }
    } catch (err) {
      console.log(`failed: ${err instanceof Error ? err.message : err}`);
      failed++;
    }

    await sleep(DELAY_MS);
  }

  console.log(`\nDone — ${done} written, ${skipped} skipped, ${failed} failed.`);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
