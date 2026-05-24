import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";

export async function GET(req: NextRequest) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;

  const questions = await prisma.interviewQuestion.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: "desc" },
    include: { application: true },
  });

  return NextResponse.json({ questions });
}

export async function POST(req: NextRequest) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;

  const body = await req.json();

  const question = await prisma.interviewQuestion.create({
    data: {
      userId: auth.userId,
      applicationId: body.applicationId || null,
      questionText: body.questionText,
      yourAnswer: body.yourAnswer || null,
      tags: body.tags || [],
      isFrequent: body.isFrequent || false,
    },
    include: { application: true },
  });

  return NextResponse.json({ question });
}
