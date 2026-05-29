"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Camera, Loader2, Sparkles } from "lucide-react";
import { api, ApiProfile, ProfilePatch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ProfileAvatarRing } from "@/components/profile/ProfileAvatarRing";
import {
  KNOWN_ROLES,
  KNOWN_COUNTRIES,
  CURRENCIES,
  citiesForCountry,
  currencyForCountry,
  countryForCity,
} from "@/lib/insights/options";

type Form = {
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

const STEP_IDS = ["welcome", "name", "photo", "role", "location", "experience", "salary", "finish"] as const;

const EMPTY: Form = {
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

function fromProfile(p: ApiProfile): Form {
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

function patchFor(form: Form): ProfilePatch {
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

export default function OnboardingPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [form, setForm] = useState<Form>(EMPTY);
  const [step, setStep] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Resume from wherever the user left off.
  useEffect(() => {
    let active = true;
    api
      .getProfile()
      .then(({ profile }) => {
        if (!active) return;
        setForm(fromProfile(profile));
        setStep(Math.min(Math.max(profile.onboardingStep, 0), STEP_IDS.length - 1));
      })
      .catch(() => {})
      .finally(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, []);

  const set = (patch: Partial<Form>) => setForm((f) => ({ ...f, ...patch }));

  const onCityChange = (city: string) =>
    setForm((f) => {
      const inferred = countryForCity(city);
      const next = { ...f, city };
      if (inferred) {
        next.country = inferred;
        next.salaryCurrency = currencyForCountry(inferred);
      }
      return next;
    });

  const onCountryChange = (country: string) =>
    setForm((f) => {
      const cities = citiesForCountry(country);
      return {
        ...f,
        country,
        salaryCurrency: currencyForCountry(country),
        city: f.city && cities.includes(f.city) ? f.city : "",
      };
    });

  const persist = async (extra: ProfilePatch) => {
    const { profile } = await api.updateProfile({ ...patchFor(form), ...extra });
    qc.setQueryData(["profile"], profile);
  };

  const goNext = async () => {
    if (step >= STEP_IDS.length - 1) return;
    const next = step + 1;
    setBusy(true);
    try {
      await persist({ onboardingStep: next });
      setStep(next);
    } catch {
      setStep(next); // don't trap the user on a transient save error
    } finally {
      setBusy(false);
    }
  };

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const finish = async () => {
    setBusy(true);
    try {
      await persist({ onboardingStep: STEP_IDS.length - 1, onboardingCompleted: true });
      qc.invalidateQueries({ queryKey: ["insights"] });
      router.push("/board");
    } catch {
      router.push("/board");
    }
  };

  const skipAll = async () => {
    setBusy(true);
    try {
      await persist({ onboardingSkipped: true });
    } catch {
      /* best effort */
    }
    router.push("/board");
  };

  const onPickPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    try {
      setUploading(true);
      const { photoUrl } = await api.uploadProfilePhoto(file);
      set({ photoUrl });
      qc.invalidateQueries({ queryKey: ["profile"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const id = STEP_IDS[step];
  const progress = Math.round((step / (STEP_IDS.length - 1)) * 100);

  // Enter advances (except on textarea / when busy).
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !(e.target instanceof HTMLTextAreaElement) && !busy) {
      e.preventDefault();
      if (id === "finish") finish();
      else goNext();
    }
  };

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/20" onKeyDown={onKeyDown}>
      {/* Top bar: progress + skip */}
      <div className="flex items-center gap-4 px-6 pt-6">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary motion-safe:transition-all motion-safe:duration-500"
            style={{ width: `${Math.max(progress, 4)}%` }}
          />
        </div>
        <button onClick={skipAll} className="text-xs font-medium text-muted-foreground hover:text-foreground" disabled={busy}>
          Skip for now
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div key={id} className="w-full max-w-md motion-safe:animate-[app-fade-in-up_0.3s_ease]">
          {id === "welcome" && (
            <Center>
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="h-7 w-7" />
              </div>
              <h1 className="mt-5 text-2xl font-semibold tracking-tight">Let’s set up your profile</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                A few quick questions help us show you how you compare — salary ranges, demand, and where you stand
                for your role and city. You can skip anytime.
              </p>
            </Center>
          )}

          {id === "name" && (
            <StepShell title="What’s your name?" subtitle="So we can address you properly.">
              <Input autoFocus value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Jane Doe" />
            </StepShell>
          )}

          {id === "photo" && (
            <StepShell title="Add a profile photo" subtitle="Optional — a friendly face goes a long way.">
              <div className="flex flex-col items-center gap-4">
                <ProfileAvatarRing name={form.name} photoUrl={form.photoUrl} percent={0} size={96} strokeWidth={0} gap={0} />
                <Button variant="secondary" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                  {form.photoUrl ? "Change photo" : "Upload photo"}
                </Button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickPhoto} />
              </div>
            </StepShell>
          )}

          {id === "role" && (
            <StepShell title="What do you do?" subtitle="Your current or target job role.">
              <Input autoFocus list="ob-roles" value={form.jobRole} onChange={(e) => set({ jobRole: e.target.value })} placeholder="Product Designer" />
              <datalist id="ob-roles">{KNOWN_ROLES.map((r) => <option key={r} value={r} />)}</datalist>
            </StepShell>
          )}

          {id === "location" && (
            <StepShell title="Where are you based?" subtitle="We compare you against your local market.">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Country</Label>
                  <Select value={form.country || undefined} onValueChange={(v) => onCountryChange(v ?? "")}>
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue placeholder="Select country…" />
                    </SelectTrigger>
                    <SelectContent>
                      {KNOWN_COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">City</Label>
                  <Select value={form.city || undefined} onValueChange={(v) => onCityChange(v ?? "")} disabled={!form.country}>
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue placeholder={form.country ? "Select city…" : "Choose a country first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {citiesForCountry(form.country).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </StepShell>
          )}

          {id === "experience" && (
            <StepShell title="How much experience?" subtitle="Total years in your field.">
              <Input
                autoFocus
                type="number"
                min={0}
                max={60}
                value={form.yearsExperience}
                onChange={(e) => set({ yearsExperience: e.target.value })}
                placeholder="5"
              />
            </StepShell>
          )}

          {id === "salary" && (
            <StepShell title="Current salary" subtitle="Optional — and completely private.">
              <div className="flex gap-2">
                <Select value={form.salaryCurrency || undefined} onValueChange={(v) => set({ salaryCurrency: v ?? "USD" })}>
                  <SelectTrigger className="h-9 w-[92px] shrink-0">
                    <SelectValue placeholder="Cur" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input autoFocus type="number" min={0} value={form.currentSalary} onChange={(e) => set({ currentSalary: e.target.value })} placeholder="2000000" className="flex-1" />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Your salary is never shown to anyone. It’s only ever used anonymously, blended into aggregate ranges —
                which is what powers your “where do I stand” insight.
              </p>
            </StepShell>
          )}

          {id === "finish" && (
            <Center>
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="h-7 w-7" />
              </div>
              <h1 className="mt-5 text-2xl font-semibold tracking-tight">You’re all set{form.name ? `, ${form.name.split(/\s+/)[0]}` : ""}!</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {form.jobRole && form.city
                  ? `We’ll show you how you compare with other ${form.jobRole}s in ${form.city}. Tweak anything later from your profile.`
                  : "You can complete or edit your profile anytime from the avatar in the sidebar."}
              </p>
            </Center>
          )}

          {/* Nav */}
          <div className="mt-8 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={goBack} disabled={step === 0 || busy} className={cn(step === 0 && "invisible")}>
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
            </Button>
            <div className="flex items-center gap-2">
              {id !== "welcome" && id !== "finish" && (
                <Button variant="ghost" size="sm" onClick={goNext} disabled={busy}>
                  Skip
                </Button>
              )}
              {id === "finish" ? (
                <Button onClick={finish} disabled={busy}>
                  {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Go to my board
                </Button>
              ) : (
                <Button onClick={goNext} disabled={busy}>
                  {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {id === "welcome" ? "Get started" : "Continue"}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="text-center">{children}</div>;
}

function StepShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}
