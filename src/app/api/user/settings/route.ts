import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";

const patchSchema = z.object({
  digestEnabled: z.boolean().optional(),
  digestDay: z.number().int().min(0).max(6).optional(),
  digestHour: z.number().int().min(0).max(23).optional(),
  staleDaysApplied: z.number().int().min(1).max(60).optional(),
  staleDaysInterview: z.number().int().min(1).max(60).optional(),
  timezone: z.string().min(1).max(64).optional(),
  name: z.string().trim().min(1).max(80).optional(),
});

export async function GET() {
  const authResult = await requireUserId();
  if (!authResult.ok) return authResult.response;
  const userId = authResult.userId;

  const [settings, user] = await Promise.all([
    prisma.userSettings.upsert({
      where: { userId },
      update: {},
      create: { userId },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, timezone: true },
    }),
  ]);

  return NextResponse.json({
    digestEnabled: settings.digestEnabled,
    digestDay: settings.digestDay,
    digestHour: settings.digestHour,
    staleDaysApplied: settings.staleDaysApplied,
    staleDaysInterview: settings.staleDaysInterview,
    name: user?.name ?? "",
    email: user?.email ?? "",
    timezone: user?.timezone ?? "UTC",
  });
}

export async function PATCH(request: Request) {
  const authResult = await requireUserId();
  if (!authResult.ok) return authResult.response;
  const userId = authResult.userId;

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

  const settingsUpdate = {
    ...(data.digestEnabled !== undefined && { digestEnabled: data.digestEnabled }),
    ...(data.digestDay !== undefined && { digestDay: data.digestDay }),
    ...(data.digestHour !== undefined && { digestHour: data.digestHour }),
    ...(data.staleDaysApplied !== undefined && { staleDaysApplied: data.staleDaysApplied }),
    ...(data.staleDaysInterview !== undefined && {
      staleDaysInterview: data.staleDaysInterview,
    }),
  };

  const userUpdate = {
    ...(data.timezone !== undefined && { timezone: data.timezone }),
    ...(data.name !== undefined && { name: data.name }),
  };

  await prisma.$transaction([
    prisma.userSettings.upsert({
      where: { userId },
      update: settingsUpdate,
      create: { userId, ...settingsUpdate },
    }),
    ...(Object.keys(userUpdate).length > 0
      ? [prisma.user.update({ where: { id: userId }, data: userUpdate })]
      : []),
  ]);

  return NextResponse.json({ ok: true });
}
