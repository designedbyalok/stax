import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";

export async function GET(req: NextRequest) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;

  const events = await prisma.calendarEvent.findMany({
    where: { userId: auth.userId },
    include: { application: true },
    orderBy: { startTime: "asc" },
  });

  return NextResponse.json({ events });
}
