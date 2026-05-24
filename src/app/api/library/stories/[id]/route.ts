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

  const existing = await prisma.starStory.findUnique({ where: { id } });
  if (!existing || existing.userId !== auth.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const story = await prisma.starStory.update({
    where: { id },
    data: {
      title: body.title !== undefined ? body.title : undefined,
      situation: body.situation !== undefined ? body.situation : undefined,
      task: body.task !== undefined ? body.task : undefined,
      action: body.action !== undefined ? body.action : undefined,
      result: body.result !== undefined ? body.result : undefined,
      tags: body.tags !== undefined ? body.tags : undefined,
      workedWell: body.workedWell !== undefined ? body.workedWell : undefined,
    },
  });

  return NextResponse.json({ story });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;
  const { id } = await params;

  const existing = await prisma.starStory.findUnique({ where: { id } });
  if (!existing || existing.userId !== auth.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.starStory.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
