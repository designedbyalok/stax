import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";
import { toExperienceBracket } from "@/lib/insights/experience";
import { countryForCity, canonicalCity, currencyForCountry } from "@/lib/insights/options";
import { canonicalRole } from "@/lib/insights/benchmarks";
import { getDistribution, computeSalaryPosition } from "@/lib/insights/engine";

// Below this many real comparable profiles, the headline count falls back to
// the distribution's sample size (curated/AI estimate).
const REAL_COMPARABLE_MIN = 5;

export async function GET(req: NextRequest) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;

  const profile = await prisma.userProfile.findUnique({
    where: { userId: auth.userId },
  });

  const { searchParams } = new URL(req.url);

  // A role is the only hard requirement. Country is inferred from a known city
  // and defaults to India (our current coverage), so insights still render.
  const roleOverride = searchParams.get("role");
  const baseRole = roleOverride || profile?.jobRole;
  const jobRole = canonicalRole(baseRole) ?? baseRole ?? null;
  if (!profile || !jobRole) {
    return NextResponse.json({ needsProfile: true });
  }
  const country = profile.country || countryForCity(profile.city) || "India";

  const scopeParam = searchParams.get("scope");
  // Default scope: city if the user has one, else country.
  const requestedScope: "city" | "country" =
    scopeParam === "country" || scopeParam === "city"
      ? scopeParam
      : profile.city
        ? "city"
        : "country";

  // City override (e.g. exploring another market); ignored at country scope.
  // Canonicalize free-typed names ("Bangalore" → "Bengaluru"); unknown metros
  // resolve to null so the engine falls back to the all-India aggregate.
  const cityOverride = searchParams.get("city");
  const requestedCity =
    requestedScope === "country" ? null : (cityOverride ?? profile.city ?? null);
  const city = canonicalCity(requestedCity);
  const scope: "city" | "country" = city ? requestedScope : "country";

  const years = profile.yearsExperience ?? 0;
  const bracket = toExperienceBracket(years);

  // `?refresh=1` (the "Generate insight" button) forces a fresh AI estimate.
  const forceAi = searchParams.get("refresh") === "1";

  let distribution;
  try {
    distribution = await getDistribution(
      { jobRole, city, country, bracket },
      { allowAi: true, forceAi }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to generate AI estimate" }, { status: 400 });
  }

  // Headline pool: prefer real comparable profiles; otherwise use the
  // distribution's sample size (curated or AI-estimated).
  const realCount = await prisma.userProfile.count({
    where: { jobRole, country, ...(city ? { city } : {}) },
  });
  const comparableIsReal = realCount >= REAL_COMPARABLE_MIN;
  const comparableCount = comparableIsReal
    ? realCount
    : (distribution?.sampleSize ?? realCount);

  const position =
    profile.currentSalary != null && distribution
      ? computeSalaryPosition(profile.currentSalary, distribution)
      : null;

  return NextResponse.json({
    needsProfile: false,
    role: jobRole,
    city,
    country,
    scope,
    bracket,
    comparableCount,
    comparableIsReal,
    distribution,
    position,
    currency: distribution?.currency ?? currencyForCountry(country) ?? profile.salaryCurrency ?? null,
    source: distribution?.source ?? null,
    refreshedAt: new Date().toISOString(),
  });
}
