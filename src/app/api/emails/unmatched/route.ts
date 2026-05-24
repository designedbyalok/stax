import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";

export async function GET(req: NextRequest) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;

  const emails = await prisma.emailEvent.findMany({
    where: { 
      userId: auth.userId,
      applicationId: null,
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ emails });
}
