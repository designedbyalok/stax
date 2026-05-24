import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  
  const body = await req.json();

  // Verify ownership
  const existing = await prisma.interviewQuestion.findUnique({ where: { id } });
  if (!existing || existing.userId !== auth.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const question = await prisma.interviewQuestion.update({
    where: { id },
    data: {
      question: body.question !== undefined ? body.question : undefined,
      yourAnswer: body.yourAnswer !== undefined ? body.yourAnswer : undefined,
      tags: body.tags !== undefined ? body.tags : undefined,
      isFrequent: body.isFrequent !== undefined ? body.isFrequent : undefined,
    },
    include: { application: true },
  });

  return NextResponse.json({ question });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;
  const { id } = await params;

  const existing = await prisma.interviewQuestion.findUnique({ where: { id } });
  if (!existing || existing.userId !== auth.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.interviewQuestion.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
