import { Camera, Loader2, Sparkles } from "@/components/icons";
import { ProfileAvatarRing } from "@/components/profile/ProfileAvatarRing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  KNOWN_COUNTRIES,
  CURRENCIES,
  citiesForCountry,
} from "@/lib/insights/options";
import type { Form, StepId } from "./types";
import { Center, StepShell } from "./StepShell";

type OnboardingStepContentProps = {
  stepId: StepId;
  form: Form;
  set: (patch: Partial<Form>) => void;
  onCityChange: (city: string) => void;
  onCountryChange: (country: string) => void;
  rolesData: string[] | undefined;
  fileRef: React.RefObject<HTMLInputElement | null>;
  uploading: boolean;
  onPickPhoto: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function OnboardingStepContent({
  stepId,
  form,
  set,
  onCityChange,
  onCountryChange,
  rolesData,
  fileRef,
  uploading,
  onPickPhoto,
}: OnboardingStepContentProps) {
  switch (stepId) {
    case "welcome":
      return (
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
      );

    case "name":
      return (
        <StepShell title="What’s your name?" subtitle="So we can address you properly.">
          <Input
            autoFocus
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="Jane Doe"
          />
        </StepShell>
      );

    case "photo":
      return (
        <StepShell title="Add a profile photo" subtitle="Optional — a friendly face goes a long way.">
          <div className="flex flex-col items-center gap-4">
            <ProfileAvatarRing
              name={form.name}
              photoUrl={form.photoUrl}
              percent={0}
              size={96}
              strokeWidth={0}
              gap={0}
            />
            <Button variant="secondary" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Camera className="mr-2 h-4 w-4" />
              )}
              {form.photoUrl ? "Change photo" : "Upload photo"}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPickPhoto}
            />
          </div>
        </StepShell>
      );

    case "role":
      return (
        <StepShell title="What do you do?" subtitle="Your current or target job role.">
          <Input
            autoFocus
            list="ob-roles"
            value={form.jobRole}
            onChange={(e) => set({ jobRole: e.target.value })}
            placeholder="Product Designer"
          />
          <datalist id="ob-roles">
            {(rolesData ?? []).map((r: string) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </StepShell>
      );

    case "location":
      return (
        <StepShell title="Where are you based?" subtitle="We compare you against your local market.">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Country</Label>
              <Select value={form.country || undefined} onValueChange={(v) => onCountryChange(v ?? "")}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Select country…" />
                </SelectTrigger>
                <SelectContent>
                  {KNOWN_COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">City</Label>
              <Select
                value={form.city || undefined}
                onValueChange={(v) => onCityChange(v ?? "")}
                disabled={!form.country}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder={form.country ? "Select city…" : "Choose a country first"} />
                </SelectTrigger>
                <SelectContent>
                  {citiesForCountry(form.country).map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </StepShell>
      );

    case "experience":
      return (
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
      );

    case "salary":
      return (
        <StepShell title="Current salary" subtitle="Optional — and completely private.">
          <div className="flex gap-2">
            <Select
              value={form.salaryCurrency || undefined}
              onValueChange={(v) => set({ salaryCurrency: v ?? "USD" })}
            >
              <SelectTrigger className="h-9 w-[92px] shrink-0">
                <SelectValue placeholder="Cur" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              autoFocus
              type="number"
              min={0}
              value={form.currentSalary}
              onChange={(e) => set({ currentSalary: e.target.value })}
              placeholder="2000000"
              className="flex-1"
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Your salary is never shown to anyone. It’s only ever used anonymously, blended into aggregate ranges —
            which is what powers your “where do I stand” insight.
          </p>
        </StepShell>
      );

    case "finish":
      return (
        <Center>
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">
            You’re all set{form.name ? `, ${form.name.split(/\s+/)[0]}` : ""}!
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {form.jobRole && form.city
              ? `We’ll show you how you compare with other ${form.jobRole}s in ${form.city}. Tweak anything later from your profile.`
              : "You can complete or edit your profile anytime from the avatar in the sidebar."}
          </p>
        </Center>
      );
  }
}
