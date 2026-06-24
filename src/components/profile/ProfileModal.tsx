"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import { Camera, Check, Loader2, LogOut, Settings, Sparkles, TrendingUp, User, X } from "@/components/icons";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api, ApiProfile, ProfilePatch } from "@/lib/api-client";
import { useProfileModal } from "@/lib/profile-modal-store";
import { useSettingsModal } from "@/lib/settings-modal-store";
import { computeProfileCompletion } from "@/lib/profile-completion";
import {
  KNOWN_COUNTRIES,
  CURRENCIES,
  citiesForCountry,
  currencyForCountry,
  countryForCity,
} from "@/lib/insights/options";
import { ProfileAvatarRing } from "./ProfileAvatarRing";

const InsightsPanel = dynamic(
  () => import("./InsightsPanel").then((m) => m.InsightsPanel),
  { ssr: false, loading: () => <Skeleton className="h-40 w-full" /> }
);

type Tab = "profile" | "insights";

type Form = {
  name: string;
  jobRole: string;
  city: string;
  country: string;
  yearsExperience: string;
  currentSalary: string;
  salaryCurrency: string;
  bio: string;
};

function toForm(p: ApiProfile): Form {
  return {
    name: p.name ?? "",
    jobRole: p.jobRole ?? "",
    city: p.city ?? "",
    country: p.country ?? "",
    yearsExperience: p.yearsExperience != null ? String(p.yearsExperience) : "",
    currentSalary: p.currentSalary != null ? String(p.currentSalary) : "",
    salaryCurrency: p.salaryCurrency ?? "INR",
    bio: p.bio ?? "",
  };
}

function diffPatch(prev: Form, next: Form): ProfilePatch {
  const patch: ProfilePatch = {};
  if (prev.name !== next.name) patch.name = next.name.trim() || null;
  if (prev.jobRole !== next.jobRole) patch.jobRole = next.jobRole.trim() || null;
  if (prev.city !== next.city) patch.city = next.city.trim() || null;
  if (prev.country !== next.country) patch.country = next.country.trim() || null;
  if (prev.yearsExperience !== next.yearsExperience) {
    const n = parseInt(next.yearsExperience, 10);
    patch.yearsExperience = Number.isFinite(n) ? n : null;
  }
  if (prev.currentSalary !== next.currentSalary) {
    const n = parseInt(next.currentSalary.replace(/[,\s]/g, ""), 10);
    patch.currentSalary = Number.isFinite(n) ? n : null;
  }
  if (prev.salaryCurrency !== next.salaryCurrency) patch.salaryCurrency = next.salaryCurrency || null;
  if (prev.bio !== next.bio) patch.bio = next.bio.trim() || null;
  return patch;
}

type SaveState = "idle" | "saving" | "saved" | "error";

export function ProfileModal() {
  const open = useProfileModal((s) => s.open);
  const close = useProfileModal((s) => s.close);
  const openSettings = useSettingsModal((s) => s.openModal);
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<Tab>("profile");
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.getProfile().then((r) => r.profile),
    enabled: open,
  });

  const [form, setForm] = useState<Form | null>(null);
  const savedRef = useRef<Form | null>(null);
  const seededId = useRef<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile && seededId.current !== profile.id) {
      const f = toForm(profile);
      setForm(f);
      savedRef.current = f;
      seededId.current = profile.id;
      setSaveState("idle");
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (patch: ProfilePatch) => api.updateProfile(patch),
    onSuccess: ({ profile: updated }) => {
      qc.setQueryData(["profile"], updated);
      qc.invalidateQueries({ queryKey: ["insights"] });
    },
  });

  useEffect(() => {
    if (!form || !savedRef.current) return;
    const patch = diffPatch(savedRef.current, form);
    if (Object.keys(patch).length === 0) return;
    setSaveState("saving");
    const snapshot = form;
    const t = setTimeout(() => {
      updateMutation.mutate(patch, {
        onSuccess: () => {
          savedRef.current = snapshot;
          setSaveState("saved");
        },
        onError: () => setSaveState("error"),
      });
    }, 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const set = (patch: Partial<Form>) => setForm((f) => (f ? { ...f, ...patch } : f));

  // Picking a city auto-selects the country it belongs to (+ its currency).
  const onCityChange = (city: string) =>
    setForm((f) => {
      if (!f) return f;
      const next = { ...f, city };
      const inferred = countryForCity(city);
      if (inferred) {
        next.country = inferred;
        next.salaryCurrency = currencyForCountry(inferred);
      }
      return next;
    });

  // Changing country resets a city that doesn't belong to it.
  const onCountryChange = (country: string) =>
    setForm((f) => {
      if (!f) return f;
      const cities = citiesForCountry(country);
      return {
        ...f,
        country,
        salaryCurrency: currencyForCountry(country),
        city: f.city && cities.includes(f.city) ? f.city : "",
      };
    });

  const completion = useMemo(
    () =>
      computeProfileCompletion({
        name: form?.name,
        photoUrl: profile?.photoUrl,
        jobRole: form?.jobRole,
        city: form?.city,
        country: form?.country,
        yearsExperience: form?.yearsExperience ? Number(form.yearsExperience) : null,
        currentSalary: form?.currentSalary ? Number(form.currentSalary) : null,
        bio: form?.bio,
      }),
    [form, profile?.photoUrl]
  );

  // Insights need at least a role to anchor a benchmark (city is optional — we
  // fall back to the all-India aggregate when it's missing/unknown).
  const hasEssentials = Boolean(form?.jobRole?.trim());

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
      qc.setQueryData<ApiProfile | undefined>(["profile"], (old) =>
        old ? { ...old, photoUrl } : old
      );
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Photo updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const firstName = (form?.name ?? "").trim().split(/\s+/)[0] || "Your profile";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "!w-[min(860px,calc(100vw-2rem))] sm:!max-w-[860px]",
          "!p-0 !gap-0 h-[min(680px,calc(100vh-2rem))]",
          "rounded-xl border bg-card shadow-2xl flex flex-row overflow-hidden"
        )}
      >
        <DialogTitle className="sr-only">Your profile</DialogTitle>

        {/* Rail */}
        <aside className="w-[224px] shrink-0 border-r bg-muted/30 flex flex-col">
          <div className="flex flex-col items-center px-5 pt-6 pb-4 text-center">
            <div className="relative">
              <ProfileAvatarRing name={form?.name} photoUrl={profile?.photoUrl} percent={completion.percent} size={68} strokeWidth={3.5} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full border bg-background shadow hover:bg-muted disabled:opacity-60"
                aria-label="Change photo"
              >
                {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickPhoto} />
            </div>
            <div className="mt-3 w-full truncate text-sm font-semibold">{firstName}</div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary motion-safe:transition-all motion-safe:duration-500"
                style={{ width: `${completion.percent}%` }}
              />
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">{completion.percent}% complete</div>
          </div>

          <nav className="flex-1 space-y-0.5 px-3">
            <RailItem icon={User} label="Profile" active={tab === "profile"} onClick={() => setTab("profile")} />
            <RailItem icon={TrendingUp} label="Insights" active={tab === "insights"} onClick={() => setTab("insights")} />
          </nav>

          <div className="space-y-0.5 border-t p-3">
            <RailItem
              icon={Settings}
              label="Settings"
              onClick={() => {
                close();
                openSettings();
              }}
            />
            <RailItem icon={LogOut} label="Log out" onClick={() => signOut({ callbackUrl: "/login" })} />
          </div>
        </aside>

        {/* Content */}
        <div className="relative flex flex-1 flex-col overflow-hidden bg-card">
          <div className="flex items-center justify-between border-b px-6 py-3.5">
            <h2 className="text-[15px] font-semibold tracking-[-0.005em]">
              {tab === "profile" ? "Profile" : "Career insights"}
            </h2>
            <div className="flex items-center gap-3">
              {tab === "profile" && <SaveStatus state={saveState} />}
              <Button variant="ghost" size="icon-sm" onClick={close} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scroll-soft p-6">
            {!form ? (
              <div className="space-y-3">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : tab === "profile" ? (
              <ProfileForm
                form={form}
                set={set}
                onCityChange={onCityChange}
                onCountryChange={onCountryChange}
                missing={completion.missing}
              />
            ) : hasEssentials ? (
              <InsightsPanel />
            ) : (
              <InsightsGate onComplete={() => setTab("profile")} />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RailItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof User;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-[13px] font-medium transition-colors",
        active
          ? "bg-background text-foreground"
          : "text-foreground/75 hover:bg-background/60 hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
      {label}
    </button>
  );
}

function ProfileForm({
  form,
  set,
  onCityChange,
  onCountryChange,
  missing,
}: {
  form: Form;
  set: (patch: Partial<Form>) => void;
  onCityChange: (city: string) => void;
  onCountryChange: (country: string) => void;
  missing: { key: string; label: string }[];
}) {
  const cityChoices = citiesForCountry(form.country);
  const { data: rolesData } = useQuery({
    queryKey: ["roles"],
    queryFn: () => api.getRoles().then((r) => r.roles),
  });
  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full name" className="sm:col-span-2">
          <Input value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Jane Doe" />
        </Field>
        <Field label="Job role">
          <Input list="role-options" value={form.jobRole} onChange={(e) => set({ jobRole: e.target.value })} placeholder="Product Designer" />
          <datalist id="role-options">{(rolesData ?? []).map((r) => <option key={r} value={r} />)}</datalist>
        </Field>
        <Field label="Country">
          <Select value={form.country || undefined} onValueChange={(v) => onCountryChange(v ?? "")}>
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="Select country…" />
            </SelectTrigger>
            <SelectContent>
              {KNOWN_COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="City">
          <Select value={form.city || undefined} onValueChange={(v) => onCityChange(v ?? "")} disabled={!form.country}>
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder={form.country ? "Select city…" : "Choose a country first"} />
            </SelectTrigger>
            <SelectContent>
              {cityChoices.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Years of experience">
          <Input type="number" min={0} max={60} value={form.yearsExperience} onChange={(e) => set({ yearsExperience: e.target.value })} placeholder="5" />
        </Field>
        <Field label="Current salary (annual)" className="sm:col-span-2">
          <div className="flex gap-2">
            <Select value={form.salaryCurrency || undefined} onValueChange={(v) => set({ salaryCurrency: v ?? "USD" })}>
              <SelectTrigger className="h-9 w-[92px] shrink-0">
                <SelectValue placeholder="Cur" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="number" min={0} value={form.currentSalary} onChange={(e) => set({ currentSalary: e.target.value })} placeholder="2000000" className="flex-1" />
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Private — never shown to anyone. Used only anonymously in aggregate insights.
          </p>
        </Field>
        <Field label="Short bio" className="sm:col-span-2">
          <Textarea rows={3} value={form.bio} onChange={(e) => set({ bio: e.target.value })} placeholder="A sentence about what you do." />
        </Field>
      </section>

      {missing.length > 0 && (
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Complete your profile</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {missing.map((m) => (
              <span key={m.key} className="rounded-full border border-dashed px-2.5 py-1 text-xs text-muted-foreground">
                {m.label}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function InsightsGate({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Sparkles className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold">Unlock your insights</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        Add your <span className="font-medium text-foreground">job role</span> to see how your pay compares with
        peers — add your city too for metro-level numbers.
      </p>
      <Button className="mt-5" size="sm" onClick={onComplete}>
        Complete your profile
      </Button>
    </div>
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function SaveStatus({ state }: { state: SaveState }) {
  if (state === "saving")
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" /> Saving…
      </span>
    );
  if (state === "saved")
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
        <Check className="h-3 w-3 text-emerald-600" /> Saved
      </span>
    );
  if (state === "error") return <span className="text-[11px] text-amber-600">Save failed</span>;
  return null;
}
