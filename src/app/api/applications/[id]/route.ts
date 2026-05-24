import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

const optionalString = (max: number) =>
  z.string().trim().max(max).nullable().optional();

const patchSchema = z.object({
  roleTitle: z.string().trim().min(1).max(200).optional(),
  companyName: z.string().trim().min(1).max(200).optional(),
  location: optionalString(200),
  salaryRange: optionalString(200),
  originalUrl: z.string().url().max(2000).nullable().optional(),
  jobDescription: optionalString(50_000),
  notes: optionalString(50_000),
  resumeVersion: optionalString(200),
  coverLetterVersion: optionalString(200),
  nextAction: optionalString(500),
  nextActionDate: z.string().datetime().nullable().optional(),
  appliedAt: z.string().datetime().nullable().optional(),
});

export async function GET(_req: Request, { params }: Params) {
  const authResult = await requireUserId();
  if (!authResult.ok) return authResult.response;
  const { id } = await params;

  const application = await prisma.application.findFirst({
    where: { id, userId: authResult.userId, deletedAt: null },
    include: {
      contacts: { orderBy: { createdAt: "asc" } },
      activities: { orderBy: { createdAt: "desc" }, take: 50 },
      resume: { select: { id: true, name: true, filename: true, mimeType: true, isPrimary: true, type: true } },
      coverLetter: { select: { id: true, name: true, filename: true, mimeType: true, isPrimary: true, type: true } },
      emailEvents: { orderBy: { date: "desc" } },
      calendarEvents: true,
    },
  });
  if (!application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ application });
}

export async function PATCH(request: Request, { params }: Params) {
  const authResult = await requireUserId();
  if (!authResult.ok) return authResult.response;
  const { id } = await params;

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

  const existing = await prisma.application.findFirst({
    where: { id, userId: authResult.userId, deletedAt: null },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data = parsed.data;
  const application = await prisma.application.update({
    where: { id },
    data: {
      ...(data.roleTitle !== undefined && { roleTitle: data.roleTitle }),
      ...(data.companyName !== undefined && { companyName: data.companyName }),
      ...(data.location !== undefined && { location: data.location || null }),
      ...(data.salaryRange !== undefined && { salaryRange: data.salaryRange || null }),
      ...(data.originalUrl !== undefined && { originalUrl: data.originalUrl || null }),
      ...(data.jobDescription !== undefined && { jobDescription: data.jobDescription || null }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
      ...(data.resumeVersion !== undefined && { resumeVersion: data.resumeVersion || null }),
      ...(data.coverLetterVersion !== undefined && {
        coverLetterVersion: data.coverLetterVersion || null,
      }),
      ...(data.resumeId !== undefined && { resumeId: data.resumeId || null }),
      ...(data.coverLetterId !== undefined && { coverLetterId: data.coverLetterId || null }),
      ...(data.nextAction !== undefined && { nextAction: data.nextAction || null }),
      ...(data.nextActionDate !== undefined && {
        nextActionDate: data.nextActionDate ? new Date(data.nextActionDate) : null,
      }),
      ...(data.appliedAt !== undefined && {
        appliedAt: data.appliedAt ? new Date(data.appliedAt) : null,
      }),
    },
  });

  return NextResponse.json({ application });
}

export async function DELETE(_req: Request, { params }: Params) {
  const authResult = await requireUserId();
  if (!authResult.ok) return authResult.response;
  const { id } = await params;

  const existing = await prisma.application.findFirst({
    where: { id, userId: authResult.userId, deletedAt: null },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.application.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
