import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;
  
  const { applicationId } = await params;

  let checklist = await prisma.interviewChecklist.findUnique({
    where: { applicationId },
  });

  if (!checklist) {
    // Return empty defaults if it doesn't exist yet
    return NextResponse.json({
      checklist: {
        applicationId,
        items: [],
        notes: "",
        reflection: "",
        questionsToAsk: [],
      }
    });
  }

  return NextResponse.json({ checklist });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;
  
  const { applicationId } = await params;
  const body = await req.json();

  const checklist = await prisma.interviewChecklist.upsert({
    where: { applicationId },
    create: {
      applicationId,
      items: body.items ?? [],
      notes: body.notes ?? "",
      reflection: body.reflection ?? "",
      questionsToAsk: body.questionsToAsk ?? [],
    },
    update: {
      ...(body.items !== undefined && { items: body.items }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.reflection !== undefined && { reflection: body.reflection }),
      ...(body.questionsToAsk !== undefined && { questionsToAsk: body.questionsToAsk }),
    },
  });

  return NextResponse.json({ checklist });
}
