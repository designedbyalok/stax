import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

const createSchema = z.object({
  description: z.string().trim().min(1).max(2000),
});

export async function POST(request: Request, { params }: Params) {
  const authResult = await requireUserId();
  if (!authResult.ok) return authResult.response;
  const { id } = await params;

  const owned = await prisma.application.findFirst({
    where: { id, userId: authResult.userId, deletedAt: null },
    select: { id: true },
  });
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

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

  const activity = await prisma.activity.create({
    data: {
      applicationId: id,
      type: "USER_EVENT",
      description: parsed.data.description,
    },
  });

  return NextResponse.json({ activity }, { status: 201 });
}
