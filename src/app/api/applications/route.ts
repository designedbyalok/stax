import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";
import { nextPositionAfter } from "@/lib/positions";

export async function GET() {
  const authResult = await requireUserId();
  if (!authResult.ok) return authResult.response;

  const applications = await prisma.application.findMany({
    where: { userId: authResult.userId, deletedAt: null },
    orderBy: [{ columnId: "asc" }, { position: "asc" }],
  });

  return NextResponse.json({ applications });
}

const SOURCE_PLATFORMS = [
  "LINKEDIN",
  "GREENHOUSE",
  "LEVER",
  "WORKDAY",
  "INDEED",
  "OTHER",
  "MANUAL",
] as const;

const createSchema = z.object({
  roleTitle: z.string().trim().min(1).max(200),
  companyName: z.string().trim().min(1).max(200),
  location: z.string().trim().max(200).optional().nullable(),
  salaryRange: z.string().trim().max(200).optional().nullable(),
  originalUrl: z.string().url().max(2000).optional().nullable(),
  jobDescription: z.string().trim().max(50_000).optional().nullable(),
  companyLogoUrl: z.string().url().max(2000).optional().nullable(),
  sourcePlatform: z.enum(SOURCE_PLATFORMS).optional().nullable(),
  columnId: z.string().optional(),
});

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

  // Resolve target column — default to "Saved" (lowest non-archive position).
  let columnId = parsed.data.columnId;
  if (columnId) {
    const owned = await prisma.column.findFirst({
      where: { id: columnId, userId },
      select: { id: true },
    });
    if (!owned) {
      return NextResponse.json({ error: "Column not found" }, { status: 404 });
    }
  } else {
    const defaultColumn = await prisma.column.findFirst({
      where: { userId, isArchive: false },
      orderBy: { position: "asc" },
      select: { id: true },
    });
    if (!defaultColumn) {
      return NextResponse.json({ error: "No columns found. Try refreshing." }, { status: 500 });
    }
    columnId = defaultColumn.id;
  }

  const last = await prisma.application.findFirst({
    where: { userId, columnId, deletedAt: null },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const application = await prisma.application.create({
    data: {
      userId,
      columnId,
      position: nextPositionAfter(last?.position ?? null),
      roleTitle: parsed.data.roleTitle,
      companyName: parsed.data.companyName,
      location: parsed.data.location || null,
      salaryRange: parsed.data.salaryRange || null,
      originalUrl: parsed.data.originalUrl || null,
      jobDescription: parsed.data.jobDescription || null,
      companyLogoUrl: parsed.data.companyLogoUrl || null,
      sourcePlatform: parsed.data.sourcePlatform || "MANUAL",
      activities: {
        create: {
          type: "CREATED",
          description: `Created card for ${parsed.data.roleTitle} at ${parsed.data.companyName}`,
        },
      },
    },
  });

  return NextResponse.json({ application }, { status: 201 });
}
