import { ApiProfile, ProfilePatch } from "@/lib/api-client";

export type Form = {
  name: string;
  jobRole: string;
  city: string;
  country: string;
  yearsExperience: string;
  currentSalary: string;
  salaryCurrency: string;
  bio: string;
  photoUrl: string | null;
};

export const STEP_IDS = [
  "welcome",
  "name",
  "photo",
  "role",
  "location",
  "experience",
  "salary",
  "finish",
] as const;

export type StepId = (typeof STEP_IDS)[number];

export const EMPTY: Form = {
  name: "",
  jobRole: "",
  city: "",
  country: "",
  yearsExperience: "",
  currentSalary: "",
  salaryCurrency: "INR",
  bio: "",
  photoUrl: null,
};

export function fromProfile(p: ApiProfile): Form {
  return {
    name: p.name ?? "",
    jobRole: p.jobRole ?? "",
    city: p.city ?? "",
    country: p.country ?? "",
    yearsExperience: p.yearsExperience != null ? String(p.yearsExperience) : "",
    currentSalary: p.currentSalary != null ? String(p.currentSalary) : "",
    salaryCurrency: p.salaryCurrency ?? "INR",
    bio: p.bio ?? "",
    photoUrl: p.photoUrl,
  };
}

export function patchFor(form: Form): ProfilePatch {
  const years = parseInt(form.yearsExperience, 10);
  const salary = parseInt(form.currentSalary.replace(/[,\s]/g, ""), 10);
  return {
    name: form.name.trim() || null,
    jobRole: form.jobRole.trim() || null,
    city: form.city.trim() || null,
    country: form.country.trim() || null,
    yearsExperience: Number.isFinite(years) ? years : null,
    currentSalary: Number.isFinite(salary) ? salary : null,
    salaryCurrency: form.salaryCurrency || null,
    bio: form.bio.trim() || null,
  };
}
