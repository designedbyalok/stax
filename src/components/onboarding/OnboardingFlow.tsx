"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Loader2 } from "@/components/icons";
import { api, ProfilePatch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  citiesForCountry,
  currencyForCountry,
  countryForCity,
} from "@/lib/insights/options";
import { OnboardingStepContent } from "./OnboardingStepContent";
import { EMPTY, fromProfile, patchFor, STEP_IDS } from "./types";
import type { Form } from "./types";

export function OnboardingFlow() {
  const router = useRouter();
  const qc = useQueryClient();
  const [form, setForm] = useState<Form>(EMPTY);
  const [step, setStep] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: rolesData } = useQuery({
    queryKey: ["roles"],
    queryFn: () => api.getRoles().then((r) => r.roles),
  });

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
            className="h-full rounded-full bg-primary motion-safe:transition-[width] motion-safe:duration-500"
            style={{ width: `${Math.max(progress, 4)}%` }}
          />
        </div>
        <button
          onClick={skipAll}
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
          disabled={busy}
        >
          Skip for now
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div key={id} className="w-full max-w-md motion-safe:animate-[app-fade-in-up_0.3s_ease]">
          <OnboardingStepContent
            stepId={id}
            form={form}
            set={set}
            onCityChange={onCityChange}
            onCountryChange={onCountryChange}
            rolesData={rolesData}
            fileRef={fileRef}
            uploading={uploading}
            onPickPhoto={onPickPhoto}
          />

          {/* Nav */}
          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              disabled={step === 0 || busy}
              className={cn(step === 0 && "invisible")}
            >
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
