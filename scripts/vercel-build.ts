/**
 * Vercel production build.
 *
 * Prisma migrations require a direct Postgres connection. Supabase pooler URLs
 * (DATABASE_URL) reject migrate deploy — use DIRECT_URL when auto-migrating.
 * Set SKIP_DB_MIGRATE=1 to skip migrations entirely.
 */
import { execSync } from "node:child_process";

function run(command: string, env?: Record<string, string>) {
  execSync(command, {
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
}

const skipMigrate = process.env.SKIP_DB_MIGRATE === "1";
const directUrl = process.env.DIRECT_URL;

if (!skipMigrate && directUrl) {
  console.log("[vercel-build] Running prisma migrate deploy (via DIRECT_URL)…");
  run("bunx prisma migrate deploy", { DATABASE_URL: directUrl });
} else if (!skipMigrate && process.env.VERCEL === "1") {
  console.warn(
    "[vercel-build] Skipping prisma migrate deploy — DIRECT_URL is not set. " +
      "Runtime uses DATABASE_URL (pooler). Add DIRECT_URL for auto-migrations, " +
      "or set SKIP_DB_MIGRATE=1."
  );
}

run("next build");
