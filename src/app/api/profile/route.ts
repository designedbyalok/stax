import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";
import { computeProfileCompletion } from "@/lib/profile-completion";
import type { Prisma } from "@prisma/client";

/** Serialises a UserProfile (+ the owning user's name) plus its completion. */
async function serialize(userId: string) {
  // Upsert so a row always exists; pull the user's name for completion + payload.
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

export async function GET() {
  const authResult = await requireUserId();
  if (!authResult.ok) return authResult.response;

  const profile = await serialize(authResult.userId);
  return NextResponse.json({ profile });
}

const patchSchema = z.object({
  name: z.string().trim().min(1).max(80).nullable().optional(),
  jobRole: z.string().trim().max(120).nullable().optional(),
  jobFamily: z.string().trim().max(120).nullable().optional(),
  city: z.string().trim().max(120).nullable().optional(),
  country: z.string().trim().max(120).nullable().optional(),
  yearsExperience: z.number().int().min(0).max(80).nullable().optional(),
  currentSalary: z.number().int().min(0).max(100_000_000).nullable().optional(),
  salaryCurrency: z.string().trim().length(3).toUpperCase().nullable().optional(),
  bio: z.string().trim().max(2000).nullable().optional(),
  onboardingStep: z.number().int().min(0).max(20).optional(),
  onboardingCompleted: z.boolean().optional(),
  onboardingSkipped: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  const authResult = await requireUserId();
  if (!authResult.ok) return authResult.response;
  const userId = authResult.userId;

  let body: unknown;
  try {
    body = await req.json();
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

  // `name` lives on User, not UserProfile — split it out.
  if (data.name !== undefined) {
    await prisma.user.update({
      where: { id: userId },
      data: { name: data.name },
    });
  }

  const profileData: Prisma.UserProfileUpdateInput = {};
  if (data.jobRole !== undefined) profileData.jobRole = data.jobRole;
  if (data.jobFamily !== undefined) profileData.jobFamily = data.jobFamily;
  if (data.city !== undefined) profileData.city = data.city;
  if (data.country !== undefined) profileData.country = data.country;
  if (data.yearsExperience !== undefined)
    profileData.yearsExperience = data.yearsExperience;
  if (data.currentSalary !== undefined)
    profileData.currentSalary = data.currentSalary;
  if (data.salaryCurrency !== undefined)
    profileData.salaryCurrency = data.salaryCurrency;
  if (data.bio !== undefined) profileData.bio = data.bio;
  if (data.onboardingStep !== undefined)
    profileData.onboardingStep = data.onboardingStep;

  // Onboarding lifecycle flags map to timestamps.
  if (data.onboardingCompleted !== undefined) {
    profileData.onboardingCompletedAt = data.onboardingCompleted
      ? new Date()
      : null;
  }
  if (data.onboardingSkipped !== undefined) {
    profileData.onboardingSkippedAt = data.onboardingSkipped ? new Date() : null;
  }

  const createData: Prisma.UserProfileCreateInput = {
    user: { connect: { id: userId } },
    jobRole: data.jobRole ?? undefined,
    jobFamily: data.jobFamily ?? undefined,
    city: data.city ?? undefined,
    country: data.country ?? undefined,
    yearsExperience: data.yearsExperience ?? undefined,
    currentSalary: data.currentSalary ?? undefined,
    salaryCurrency: data.salaryCurrency ?? undefined,
    bio: data.bio ?? undefined,
    onboardingStep: data.onboardingStep ?? undefined,
    onboardingCompletedAt:
      data.onboardingCompleted === true ? new Date() : undefined,
    onboardingSkippedAt: data.onboardingSkipped === true ? new Date() : undefined,
  };

  await prisma.userProfile.upsert({
    where: { userId },
    update: profileData,
    create: createData,
  });

  const profile = await serialize(userId);
  return NextResponse.json({ profile });
}
