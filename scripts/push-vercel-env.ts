/**
 * Push .env.local variables to Vercel (production + preview).
 * Fixes DIRECT_URL to Supabase session pooler (port 5432) for migrations.
 *
 * Usage: bun scripts/push-vercel-env.ts
 */
import { execSync, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const PRODUCTION_URL = "https://stax-virid.vercel.app";

function parseEnvFile(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  const text = readFileSync(path, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function fixDirectUrl(poolerUrl: string): string {
  const pseudo = poolerUrl.replace(/^postgresql:/, "http:");
  const u = new URL(pseudo);
  const password = u.password;
  if (!password || !u.username) throw new Error("DATABASE_URL missing credentials");
  // Prisma migrations need session-mode pooler (5432), not transaction pooler (6543).
  return `postgresql://${u.username}:${encodeURIComponent(password)}@${u.hostname}:5432/postgres`;
}

function updateEnvFile(path: string, key: string, value: string) {
  const text = readFileSync(path, "utf8");
  const re = new RegExp(`^${key}=.*$`, "m");
  const line = `${key}="${value}"`;
  writeFileSync(
    path,
    re.test(text) ? text.replace(re, line) : `${text.trimEnd()}\n${line}\n`,
    "utf8"
  );
}

function addEnv(key: string, value: string, environments: string[]) {
  const cwd = resolve(__dirname, "..");
  for (const env of environments) {
    try {
      execSync(`vercel env rm ${key} ${env} --yes`, { stdio: "pipe", cwd });
    } catch {
      // not present
    }
    const result = spawnSync(
      "vercel",
      ["env", "add", key, env, "--value", value, "--yes"],
      { cwd, encoding: "utf8" }
    );
    if (result.status !== 0) {
      console.error(result.stderr || result.stdout);
      throw new Error(`vercel env add ${key} ${env} failed`);
    }
  }
}

const root = resolve(__dirname, "..");
const localPath = resolve(root, ".env.local");
const local = parseEnvFile(localPath);

if (!local.DATABASE_URL) {
  throw new Error(".env.local missing DATABASE_URL");
}

const directUrl = fixDirectUrl(local.DATABASE_URL);

// Fix local files so future migrations use the direct host.
updateEnvFile(localPath, "DIRECT_URL", directUrl);
updateEnvFile(resolve(root, ".env"), "DIRECT_URL", directUrl);

const vars: Record<string, string> = { ...local };
vars.DIRECT_URL = directUrl;
vars.AUTH_URL = PRODUCTION_URL;

const skip = new Set(["VERCEL_OIDC_TOKEN", "INNGEST_DEV"]);
const environments = ["production", "preview"];

console.log(`Pushing ${Object.keys(vars).length} variables to Vercel (${environments.join(", ")})…`);
console.log(`DIRECT_URL → session pooler :5432`);
console.log(`AUTH_URL → ${PRODUCTION_URL}`);

for (const [key, value] of Object.entries(vars)) {
  if (skip.has(key) || !value) continue;
  console.log(`→ ${key}`);
  addEnv(key, value, environments);
}

console.log("Done.");
