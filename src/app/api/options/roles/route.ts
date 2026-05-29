import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { KNOWN_ROLES } from "@/lib/insights/options";
import { requireUserId } from "@/lib/api";

export async function GET() {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;

  try {
    const dbRoles = await prisma.salaryBenchmark.findMany({
      select: { jobRole: true },
      distinct: ["jobRole"],
    });

    const dynamicRoles = dbRoles.map((r) => r.jobRole);
    // Merge database roles with hardcoded base roles, deduplicate, and sort alphabetically
    const allRoles = Array.from(new Set([...KNOWN_ROLES, ...dynamicRoles])).sort();

    return NextResponse.json({ roles: allRoles });
  } catch (err) {
    console.error("Failed to fetch roles:", err);
    return NextResponse.json({ roles: KNOWN_ROLES });
  }
}
