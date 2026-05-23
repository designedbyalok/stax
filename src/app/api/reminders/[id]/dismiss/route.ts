import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  const authResult = await requireUserId();
  if (!authResult.ok) return authResult.response;
  const { id } = await params;

  const reminder = await prisma.reminder.findFirst({
    where: { id, userId: authResult.userId },
    select: { id: true },
  });
  if (!reminder) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.reminder.update({
    where: { id },
    data: { status: "DISMISSED" },
  });

  return NextResponse.json({ ok: true });
}
