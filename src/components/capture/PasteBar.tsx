"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-client";
import { useCaptureStore } from "./capture-store";

const LOADING_PHASES = [
  "Reading the job posting…",
  "Pulling out details…",
  "Almost there…",
];

export function PasteBar() {
  const captureState = useCaptureStore((s) => s.state);
  const start = useCaptureStore((s) => s.start);
  const showSkeleton = useCaptureStore((s) => s.showSkeleton);
  const resolve = useCaptureStore((s) => s.resolve);
  const toManual = useCaptureStore((s) => s.toManual);

  const [value, setValue] = useState("");
  const [phaseIdx, setPhaseIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const skeletonTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const mutation = useMutation({
    mutationFn: (url: string) => api.parseUrl(url),
    onSuccess: (data) => {
      resolve(data);
      setValue("");
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : "Couldn't parse this URL.";
      toast.error(msg);
      toManual({ originalUrl: value }, msg);
      setValue("");
    },
  });

  const isParsing = captureState.kind === "parsing";

  useEffect(() => {
    if (!isParsing) {
      if (skeletonTimerRef.current) clearTimeout(skeletonTimerRef.current);
      if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
      setPhaseIdx(0);
      return;
    }
    skeletonTimerRef.current = setTimeout(() => showSkeleton(), 1500);
    phaseTimerRef.current = setInterval(() => {
      setPhaseIdx((i) => (i + 1) % LOADING_PHASES.length);
    }, 1200);
    return () => {
      if (skeletonTimerRef.current) clearTimeout(skeletonTimerRef.current);
      if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
    };
  }, [isParsing, showSkeleton]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "v") {
        const active = document.activeElement;
        if (
          active?.tagName !== "INPUT" &&
          active?.tagName !== "TEXTAREA" &&
          !(active as HTMLElement | null)?.isContentEditable
        ) {
          inputRef.current?.focus();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const url = value.trim();
    if (!url) return;
    try {
      new URL(url);
    } catch {
      toast.error("That doesn't look like a URL.");
      return;
    }
    start(url);
    mutation.mutate(url);
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="relative">
        {isParsing ? (
          <Loader2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground animate-spin pointer-events-none z-10" />
        ) : (
          <Link2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none z-10" />
        )}
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={
            isParsing
              ? LOADING_PHASES[phaseIdx]
              : "Paste a job link to capture it…"
          }
          disabled={isParsing}
          autoComplete="off"
          spellCheck={false}
          className="pl-7 h-8 text-[13px] md:text-[13px] bg-background"
        />
      </div>
    </form>
  );
}
