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
  return {
    digestEnabled: settings.digestEnabled,
    digestDay: settings.digestDay,
    digestHour: settings.digestHour,
    staleDaysApplied: settings.staleDaysApplied,
    staleDaysInterview: settings.staleDaysInterview,
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
    prisma.userProfile.upsert({
      where: { userId },
      update: {},
      create: { userId },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
  ]);

  const completion = computeProfileCompletion({
    name: user?.name ?? null,
    photoUrl: profile.photoUrl,
    jobRole: profile.jobRole,
    city: profile.city,
    country: profile.country,
    yearsExperience: profile.yearsExperience,
    currentSalary: profile.currentSalary,
    bio: profile.bio,
  });

  return {
    id: profile.id,
    userId: profile.userId,
    name: user?.name ?? null,
    jobRole: profile.jobRole,
    jobFamily: profile.jobFamily,
    city: profile.city,
    country: profile.country,
    yearsExperience: profile.yearsExperience,
    currentSalary: profile.currentSalary,
    salaryCurrency: profile.salaryCurrency,
    photoUrl: profile.photoUrl,
    bio: profile.bio,
    onboardingStep: profile.onboardingStep,
    onboardingCompletedAt: profile.onboardingCompletedAt?.toISOString() ?? null,
    onboardingSkippedAt: profile.onboardingSkippedAt?.toISOString() ?? null,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
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
