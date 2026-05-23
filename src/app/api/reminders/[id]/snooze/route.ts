import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

const schema = z.object({
  days: z.number().int().min(1).max(90),
});

export async function POST(request: Request, { params }: Params) {
  const authResult = await requireUserId();
  if (!authResult.ok) return authResult.response;
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const reminder = await prisma.reminder.findFirst({
    where: { id, userId: authResult.userId },
    select: { id: true },
  });
  if (!reminder) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const snoozedUntil = new Date(Date.now() + parsed.data.days * 86_400_000);
  await prisma.reminder.update({
    where: { id },
    data: { status: "SNOOZED", snoozedUntil },
  });

  return NextResponse.json({ ok: true });
}
