import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

const CONTACT_ROLES = ["RECRUITER", "HIRING_MANAGER", "REFERRER", "OTHER"] as const;

const patchSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  role: z.enum(CONTACT_ROLES).optional(),
  email: z.string().max(200).optional().nullable(),
  notes: z.string().trim().max(5000).optional().nullable(),
});

async function loadOwnedContact(userId: string, contactId: string) {
  return prisma.contact.findFirst({
    where: {
      id: contactId,
      application: { userId, deletedAt: null },
    },
  });
}

export async function PATCH(request: Request, { params }: Params) {
  const authResult = await requireUserId();
  if (!authResult.ok) return authResult.response;
  const { id } = await params;

  const existing = await loadOwnedContact(authResult.userId, id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

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

  const data = parsed.data;
  const contact = await prisma.contact.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.role !== undefined && { role: data.role }),
      ...(data.email !== undefined && { email: data.email || null }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
    },
  });

  return NextResponse.json({ contact });
}

export async function DELETE(_req: Request, { params }: Params) {
  const authResult = await requireUserId();
  if (!authResult.ok) return authResult.response;
  const { id } = await params;

  const existing = await loadOwnedContact(authResult.userId, id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.contact.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
