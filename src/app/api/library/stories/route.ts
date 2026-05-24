import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";

export async function GET(req: NextRequest) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;

  const stories = await prisma.starStory.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ stories });
}

export async function POST(req: NextRequest) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;

  const body = await req.json();

  const story = await prisma.starStory.create({
    data: {
      userId: auth.userId,
      title: body.title,
      situation: body.situation || "",
      task: body.task || "",
      action: body.action || "",
      result: body.result || "",
      tags: body.tags || [],
      workedWell: body.workedWell || false,
    },
  });

  return NextResponse.json({ story });
}
