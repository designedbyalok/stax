import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";

const MAX_COLUMNS = 10;

const createSchema = z.object({
  name: z.string().trim().min(1).max(80),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export async function GET() {
  const authResult = await requireUserId();
  if (!authResult.ok) return authResult.response;

  const columns = await prisma.column.findMany({
    where: { userId: authResult.userId },
    orderBy: { position: "asc" },
  });

  return NextResponse.json({ columns });
}

export async function POST(request: Request) {
  const authResult = await requireUserId();
  if (!authResult.ok) return authResult.response;
  const userId = authResult.userId;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const count = await prisma.column.count({ where: { userId } });
  if (count >= MAX_COLUMNS) {
    return NextResponse.json(
      { error: `Up to ${MAX_COLUMNS} columns allowed.` },
      { status: 400 }
    );
  }

  const lastNonArchive = await prisma.column.findFirst({
    where: { userId, isArchive: false },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const column = await prisma.column.create({
    data: {
      userId,
      name: parsed.data.name,
      color: parsed.data.color ?? "#94A3B8",
      position: (lastNonArchive?.position ?? -1) + 1,
      isArchive: false,
    },
  });

  return NextResponse.json({ column }, { status: 201 });
}
