import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;
  
  const { id } = await params;

  const document = await prisma.document.findUnique({
    where: { id, userId: auth.userId },
    include: {
      _count: {
        select: {
          resumeApplications: true,
          coverLetterApplications: true,
        },
      },
    },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json({ document });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;
  
  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.document.findUnique({
    where: { id, userId: auth.userId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  let document;
  await prisma.$transaction(async (tx) => {
    if (body.isPrimary && !existing.isPrimary) {
      await tx.document.updateMany({
        where: { userId: auth.userId, type: existing.type, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    document = await tx.document.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
        ...(body.isPrimary !== undefined ? { isPrimary: body.isPrimary } : {}),
      },
    });
  });

  return NextResponse.json({ document });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;
  
  const { id } = await params;

  const document = await prisma.document.findUnique({
    where: { id, userId: auth.userId },
    include: {
      resumeApplications: true,
      coverLetterApplications: true,
    },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const affectedCards = [
    ...document.resumeApplications.map((a) => a.companyName + " - " + a.roleTitle),
    ...document.coverLetterApplications.map((a) => a.companyName + " - " + a.roleTitle),
  ];

  await prisma.$transaction(async (tx) => {
    // Nullify references
    if (document.type === "RESUME") {
      await tx.application.updateMany({
        where: { resumeId: id },
        data: { resumeId: null },
      });
    } else {
      await tx.application.updateMany({
        where: { coverLetterId: id },
        data: { coverLetterId: null },
      });
    }

    // Delete record
    await tx.document.delete({ where: { id } });
  });

  // Delete from storage
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "documents";
  await supabase.storage.from(bucket).remove([document.storageKey]);

  return NextResponse.json({ ok: true, affectedCards });
}
