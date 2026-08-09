import "server-only";
import prisma from "@/lib/db";
import { APPLICATION_LIST_SELECT } from "@/lib/application-select";

// Server-side data loaders that mirror the JSON shapes returned by the
// matching /api routes. Used to prefetch React Query caches in server
// components so the first paint already has the data.
//
// The JSON shape must match what the client receives via the API client —
// any divergence shows up as a flash when the client re-fetches.

export async function loadApplications(userId: string) {
  // Mirror the /api/applications GET shape exactly (shared LIST_SELECT)
  // so the SSR-prefetched cache matches the client payload and stays
  // small — heavy text/JSON columns are excluded.
  return prisma.application.findMany({
    where: { userId, deletedAt: null },
    orderBy: [{ columnId: "asc" }, { position: "asc" }],
    select: APPLICATION_LIST_SELECT,
  });
}

export async function loadColumns(userId: string) {
  return prisma.column.findMany({
    where: { userId },
    orderBy: { position: "asc" },
  });
}

export async function loadUserSettings(userId: string) {
  const [settings, user] = await Promise.all([
    prisma.userSettings.findUnique({
      where: { userId },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, timezone: true },
    }),
  ]);
  return {
    digestEnabled: settings?.digestEnabled ?? true,
    digestDay: settings?.digestDay ?? 1,
    digestHour: settings?.digestHour ?? 9,
    staleDaysApplied: settings?.staleDaysApplied ?? 7,
    staleDaysInterview: settings?.staleDaysInterview ?? 5,
    name: user?.name ?? "",
    email: user?.email ?? "",
    timezone: user?.timezone ?? "UTC",
  };
}

export async function loadReminders(userId: string) {
  const now = new Date();
  const reminders = await prisma.reminder.findMany({
    where: {
      userId,
      status: { in: ["PENDING", "SNOOZED"] },
      OR: [
        { status: "PENDING" },
        { status: "SNOOZED", snoozedUntil: { lte: now } },
      ],
      application: { deletedAt: null },
    },
    include: {
      application: {
        select: {
          id: true,
          roleTitle: true,
          companyName: true,
          columnId: true,
          column: { select: { name: true } },
        },
      },
    },
    orderBy: [{ dueAt: "asc" }],
  });

  return reminders.map((r) => ({
    id: r.id,
    type: r.type,
    status: r.status,
    dueAt: r.dueAt.toISOString(),
    snoozedUntil: r.snoozedUntil?.toISOString() ?? null,
    application: {
      id: r.application.id,
      roleTitle: r.application.roleTitle,
      companyName: r.application.companyName,
      columnName: r.application.column.name,
    },
  }));
}

import { computeProfileCompletion } from "@/lib/profile-completion";

export async function loadProfile(userId: string) {
  const [profile, user] = await Promise.all([
    prisma.userProfile.findUnique({
      where: { userId },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
  ]);

  const completion = computeProfileCompletion({
    name: user?.name ?? null,
    photoUrl: profile?.photoUrl ?? null,
    jobRole: profile?.jobRole ?? null,
    city: profile?.city ?? null,
    country: profile?.country ?? null,
    yearsExperience: profile?.yearsExperience ?? null,
    currentSalary: profile?.currentSalary ?? null,
    bio: profile?.bio ?? null,
  });

  return {
    id: profile?.id ?? "",
    userId: profile?.userId ?? userId,
    name: user?.name ?? null,
    jobRole: profile?.jobRole ?? null,
    jobFamily: profile?.jobFamily ?? null,
    city: profile?.city ?? null,
    country: profile?.country ?? null,
    yearsExperience: profile?.yearsExperience ?? null,
    currentSalary: profile?.currentSalary ?? null,
    salaryCurrency: profile?.salaryCurrency ?? "USD",
    photoUrl: profile?.photoUrl ?? null,
    bio: profile?.bio ?? null,
    onboardingStep: profile?.onboardingStep ?? 0,
    onboardingCompletedAt: profile?.onboardingCompletedAt?.toISOString() ?? null,
    onboardingSkippedAt: profile?.onboardingSkippedAt?.toISOString() ?? null,
    createdAt: profile?.createdAt.toISOString() ?? new Date().toISOString(),
    updatedAt: profile?.updatedAt.toISOString() ?? new Date().toISOString(),
    completion,
  };
}

export async function loadUser(userId: string) {
  const [user, googleIntegration] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        timezone: true,
        inboundEmailToken: true,
      },
    }),
    prisma.googleIntegration.findUnique({
      where: { userId },
      select: { id: true, email: true, createdAt: true },
    }),
  ]);

  return { ...user, googleIntegration: googleIntegration ? {
    id: googleIntegration.id,
    email: googleIntegration.email,
    createdAt: googleIntegration.createdAt.toISOString()
  } : null };
}
