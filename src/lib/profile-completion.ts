/**
 * Single source of truth for profile completion. Pure + dependency-free so it
 * can run on the server (API routes, Inngest) and the client (nav ring,
 * onboarding progress, profile checklist) without pulling in Prisma.
 */

export type ProfileCompletionInput = {
  name?: string | null;
  photoUrl?: string | null;
  jobRole?: string | null;
  city?: string | null;
  country?: string | null;
  yearsExperience?: number | null;
  currentSalary?: number | null;
  bio?: string | null;
};

export type CompletionFieldKey =
  | "name"
  | "photo"
  | "jobRole"
  | "city"
  | "country"
  | "yearsExperience"
  | "currentSalary"
  | "bio";

export const PROFILE_FIELD_LABELS: Record<CompletionFieldKey, string> = {
  name: "Your name",
  photo: "Profile photo",
  jobRole: "Job role",
  city: "City",
  country: "Country",
  yearsExperience: "Years of experience",
  currentSalary: "Current salary",
  bio: "Short bio",
};

/**
 * Relative weights per field. They do not need to sum to 100 — the computed
 * percent is normalised against the total weight.
 */
export const PROFILE_FIELD_WEIGHTS: Record<CompletionFieldKey, number> = {
  name: 15,
  photo: 10,
  jobRole: 20,
  city: 12,
  country: 12,
  yearsExperience: 12,
  currentSalary: 9,
  bio: 10,
};

export type ProfileCompletion = {
  percent: number;
  completed: CompletionFieldKey[];
  missing: { key: CompletionFieldKey; label: string }[];
  weights: Record<CompletionFieldKey, number>;
};

function isFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return !Number.isNaN(value);
  return Boolean(value);
}

export function computeProfileCompletion(
  profile: ProfileCompletionInput
): ProfileCompletion {
  const presence: Record<CompletionFieldKey, boolean> = {
    name: isFilled(profile.name),
    photo: isFilled(profile.photoUrl),
    jobRole: isFilled(profile.jobRole),
    city: isFilled(profile.city),
    country: isFilled(profile.country),
    yearsExperience: isFilled(profile.yearsExperience),
    currentSalary: isFilled(profile.currentSalary),
    bio: isFilled(profile.bio),
  };

  const keys = Object.keys(PROFILE_FIELD_WEIGHTS) as CompletionFieldKey[];
  const totalWeight = keys.reduce((sum, k) => sum + PROFILE_FIELD_WEIGHTS[k], 0);

  let earned = 0;
  const completed: CompletionFieldKey[] = [];
  const missing: { key: CompletionFieldKey; label: string }[] = [];

  for (const key of keys) {
    if (presence[key]) {
      earned += PROFILE_FIELD_WEIGHTS[key];
      completed.push(key);
    } else {
      missing.push({ key, label: PROFILE_FIELD_LABELS[key] });
    }
  }

  const percent = totalWeight === 0 ? 0 : Math.round((earned / totalWeight) * 100);

  return { percent, completed, missing, weights: PROFILE_FIELD_WEIGHTS };
}
