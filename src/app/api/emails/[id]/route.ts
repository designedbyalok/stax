import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;
  
  const { id } = await params;

  const emailEvent = await prisma.emailEvent.findUnique({
    where: { id, userId: auth.userId },
  });

  if (!emailEvent) {
    return NextResponse.json({ error: "Email event not found" }, { status: 404 });
  }

  return NextResponse.json({ emailEvent });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;
  
  const [{ id }, body] = await Promise.all([params, req.json()]);

  const emailEvent = await prisma.emailEvent.findUnique({
    where: { id, userId: auth.userId },
  });

  if (!emailEvent) {
    return NextResponse.json({ error: "Email event not found" }, { status: 404 });
  }

  // Allow reassigning to a different application
  if (body.applicationId !== undefined) {
    const updated = await prisma.$transaction(async (tx) => {
      // Create new activity on new card
      if (body.applicationId) {
        await tx.activity.create({
          data: {
            applicationId: body.applicationId,
            type: "EMAIL_RECEIVED",
            description: `Email assigned: ${emailEvent.subject}`,
            metadata: {
              senderEmail: emailEvent.senderEmail,
              senderName: emailEvent.senderName,
              emailEventId: emailEvent.id,
              manuallyAssigned: true,
            },
          },
        });
      }

      return tx.emailEvent.update({
        where: { id },
        data: {
          applicationId: body.applicationId,
          // When manually reassigned, it is no longer "autoAttached" (or we just keep it as a manual confirmation)
        },
      });
    });

    return NextResponse.json({ emailEvent: updated });
  }

  return NextResponse.json({ emailEvent });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;
  
  const { id } = await params;

  await prisma.emailEvent.deleteMany({
    where: { id, userId: auth.userId },
  });

  return NextResponse.json({ ok: true });
}
