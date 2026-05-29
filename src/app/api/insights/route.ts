import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";
import { toExperienceBracket } from "@/lib/insights/experience";
import {
  getDistribution,
  computeSalaryPosition,
  comparableCount,
} from "@/lib/insights/engine";

export async function GET(req: NextRequest) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;

  const profile = await prisma.userProfile.findUnique({
    where: { userId: auth.userId },
  });

  // Need at least role + country to anchor any benchmark.
  if (!profile?.jobRole || !profile.country) {
    return NextResponse.json({ needsProfile: true });
  }

  const { searchParams } = new URL(req.url);
  const scopeParam = searchParams.get("scope");
  // Default scope: city if the user has one, else country.
  const requestedScope: "city" | "country" =
    scopeParam === "country" || scopeParam === "city"
      ? scopeParam
      : profile.city
        ? "city"
        : "country";

  // City override (e.g. exploring another market); ignored at country scope.
  const cityOverride = searchParams.get("city");
  const city =
    requestedScope === "country"
      ? null
      : (cityOverride ?? profile.city ?? null);
  // If they asked for city scope but no city is available, fall back to country.
  const scope: "city" | "country" = city ? requestedScope : "country";

  const country = profile.country;
  const jobRole = profile.jobRole;
  const years = profile.yearsExperience ?? 0;
  const bracket = toExperienceBracket(years);

  const [distribution, comparable] = await Promise.all([
    getDistribution({ jobRole, city, country, bracket }),
    comparableCount({ jobRole, city, country }),
  ]);

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
    comparableCount: comparable.count,
    comparableIsReal: comparable.isReal,
    distribution,
    position,
    currency: distribution?.currency ?? profile.salaryCurrency ?? null,
    source: distribution?.source ?? null,
    refreshedAt: new Date().toISOString(),
  });
}
