import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  position: z.number().int().min(0).max(99).optional(),
});

export async function PATCH(request: Request, { params }: Params) {
  const authResult = await requireUserId();
  if (!authResult.ok) return authResult.response;
  const { id } = await params;

  const existing = await prisma.column.findFirst({
    where: { id, userId: authResult.userId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const column = await prisma.column.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ column });
}

export async function DELETE(_req: Request, { params }: Params) {
  const authResult = await requireUserId();
  if (!authResult.ok) return authResult.response;
  const userId = authResult.userId;
  const { id } = await params;

  const existing = await prisma.column.findFirst({
    where: { id, userId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Find a fallback column for any cards in this one.
  const fallback = await prisma.column.findFirst({
    where: { userId, id: { not: id }, isArchive: false },
    orderBy: { position: "asc" },
    select: { id: true },
  });
  if (!fallback) {
    return NextResponse.json(
      { error: "Can't delete your only column." },
      { status: 400 }
    );
  }

  await prisma.$transaction([
    prisma.application.updateMany({
      where: { columnId: id, userId },
      data: { columnId: fallback.id },
    }),
    prisma.column.delete({ where: { id } }),
  ]);

  return NextResponse.json({ ok: true });
}
