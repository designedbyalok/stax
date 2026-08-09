import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

const CONTACT_ROLES = ["RECRUITER", "HIRING_MANAGER", "REFERRER", "OTHER"] as const;

const createSchema = z.object({
  name: z.string().trim().min(1).max(200),
  role: z.enum(CONTACT_ROLES).default("OTHER"),
  email: z.email().max(200).optional().nullable().or(z.literal("")),
  phone: z.string().max(100).optional().nullable().or(z.literal("")),
  notes: z.string().trim().max(5000).optional().nullable(),
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

  const contact = await prisma.contact.create({
    data: {
      applicationId: id,
      name: parsed.data.name,
      role: parsed.data.role,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      notes: parsed.data.notes || null,
    },
  });

  await prisma.activity.create({
    data: {
      applicationId: id,
      type: "CONTACT_ADDED",
      description: `Added contact: ${parsed.data.name}`,
    },
  });

  return NextResponse.json({ contact }, { status: 201 });
}
