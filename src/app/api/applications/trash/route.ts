import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";

export async function GET() {
  const authResult = await requireUserId();
  if (!authResult.ok) return authResult.response;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000);

  const applications = await prisma.application.findMany({
    where: {
      userId: authResult.userId,
      deletedAt: { gte: thirtyDaysAgo, not: null },
    },
    orderBy: { deletedAt: "desc" },
  });

  return NextResponse.json({ applications });
}
