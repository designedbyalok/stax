import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";

export async function GET() {
  const authResult = await requireUserId();
  if (!authResult.ok) return authResult.response;
  const userId = authResult.userId;

  const now = new Date();

  const reminders = await prisma.reminder.findMany({
    where: {
      userId,
      status: { in: ["PENDING", "SNOOZED"] },
      OR: [
        { status: "PENDING" },
        { status: "SNOOZED", snoozedUntil: { lte: now } },
      ],
      application: { deletedAt: null },
    },
    include: {
      application: {
        select: {
          id: true,
          roleTitle: true,
          companyName: true,
          columnId: true,
          column: { select: { name: true } },
        },
      },
    },
    orderBy: [{ dueAt: "asc" }],
  });

  return NextResponse.json({
    reminders: reminders.map((r) => ({
      id: r.id,
      type: r.type,
      status: r.status,
      dueAt: r.dueAt.toISOString(),
      snoozedUntil: r.snoozedUntil?.toISOString() ?? null,
      application: {
        id: r.application.id,
        roleTitle: r.application.roleTitle,
        companyName: r.application.companyName,
        columnName: r.application.column.name,
      },
    })),
  });
}
