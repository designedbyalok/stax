import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";

export async function POST() {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;

  await prisma.googleIntegration.deleteMany({
    where: { userId: auth.userId },
  });

  return NextResponse.json({ ok: true });
}
