import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  const authResult = await requireUserId();
  if (!authResult.ok) return authResult.response;
  const { id } = await params;

  const existing = await prisma.application.findFirst({
    where: { id, userId: authResult.userId, deletedAt: { not: null } },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.application.update({
    where: { id },
    data: { deletedAt: null },
  });

  return NextResponse.json({ ok: true });
}
