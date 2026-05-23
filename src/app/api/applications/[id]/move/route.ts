import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";
import { midpoint, nextPositionAfter } from "@/lib/positions";

type Params = { params: Promise<{ id: string }> };

const moveSchema = z.object({
  columnId: z.string().min(1),
  // Optional: id of the card we should be placed BEFORE in the new column.
  // If null/undefined we go to the bottom.
  beforeId: z.string().optional().nullable(),
});

export async function POST(request: Request, { params }: Params) {
  const authResult = await requireUserId();
  if (!authResult.ok) return authResult.response;
  const userId = authResult.userId;
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = moveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const card = await prisma.application.findFirst({
    where: { id, userId, deletedAt: null },
    include: { column: true },
  });
  if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const targetColumn = await prisma.column.findFirst({
    where: { id: parsed.data.columnId, userId },
  });
  if (!targetColumn) {
    return NextResponse.json({ error: "Column not found" }, { status: 404 });
  }

  // Compute new position.
  let newPosition: number;
  if (parsed.data.beforeId) {
    const before = await prisma.application.findFirst({
      where: { id: parsed.data.beforeId, userId, columnId: targetColumn.id, deletedAt: null },
      select: { position: true },
    });
    if (!before) {
      return NextResponse.json({ error: "Anchor card not found" }, { status: 404 });
    }
    const previous = await prisma.application.findFirst({
      where: {
        userId,
        columnId: targetColumn.id,
        deletedAt: null,
        position: { lt: before.position },
        id: { not: id },
      },
      orderBy: { position: "desc" },
      select: { position: true },
    });
    newPosition = midpoint(previous?.position ?? null, before.position);
  } else {
    const last = await prisma.application.findFirst({
      where: {
        userId,
        columnId: targetColumn.id,
        deletedAt: null,
        id: { not: id },
      },
      orderBy: { position: "desc" },
      select: { position: true },
    });
    newPosition = nextPositionAfter(last?.position ?? null);
  }

  const movedColumn = card.columnId !== targetColumn.id;

  await prisma.application.update({
    where: { id },
    data: {
      columnId: targetColumn.id,
      position: newPosition,
      ...(movedColumn &&
        targetColumn.name.toLowerCase() === "applied" &&
        !card.appliedAt && { appliedAt: new Date() }),
      ...(movedColumn &&
        targetColumn.isArchive && { archivedAt: new Date() }),
      ...(movedColumn && {
        activities: {
          create: {
            type: "STATUS_CHANGED",
            description: `Moved to ${targetColumn.name}`,
            metadata: { fromColumnId: card.columnId, toColumnId: targetColumn.id },
          },
        },
      }),
    },
  });

  return NextResponse.json({ ok: true });
}
