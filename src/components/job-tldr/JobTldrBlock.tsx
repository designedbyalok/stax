"use client";

import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function JobTldrBlock({
  headline,
  bullets,
  responsibilities = [],
  qualifications = [],
  keywords = [],
  defaultOpen = true,
  loading = false,
}: {
  headline: string | null;
  bullets: string[] | null;
  responsibilities?: string[];
  qualifications?: string[];
  keywords?: string[];
  /** Whether the detail (responsibilities / qualifications / keywords)
   *  starts expanded. The headline + bullets are always shown. */
  defaultOpen?: boolean;
  /** The summary is still being generated in the background — show a
   *  shimmer placeholder instead of nothing. */
  loading?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const hasHeadline = Boolean(headline);
  const hasBullets = Boolean(bullets && bullets.length > 0);
  const hasInsights =
    responsibilities.length > 0 || qualifications.length > 0 || keywords.length > 0;

  // Pending state: a summary is on its way (job description present,
  // background generation not finished). Show a labelled shimmer.
  if (!hasHeadline && !hasBullets && !hasInsights) {
    if (!loading) return null;
    return (
      <div className="rounded-md border bg-muted/30 px-4 py-3 space-y-3">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[var(--tint-strong,hsl(220_91%_60%))] animate-pulse" strokeWidth={2} />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Generating summary…
          </span>
        </div>
        <div className="space-y-2" aria-hidden>
          <div className="h-3 w-3/4 rounded bg-foreground/10 animate-pulse" />
          <div className="h-2.5 w-full rounded bg-foreground/[0.07] animate-pulse" />
          <div className="h-2.5 w-5/6 rounded bg-foreground/[0.07] animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-muted/30 px-4 py-3 space-y-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-1.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/30 rounded-sm"
      >
        <Sparkles
          className="h-3.5 w-3.5 text-[var(--tint-strong,hsl(220_91%_60%))]"
          strokeWidth={2}
        />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          AI Powered Summary
        </span>
        {hasInsights && (
          <ChevronDown
            className={cn(
              "ml-auto h-3.5 w-3.5 text-muted-foreground/60 transition-transform duration-200",
              open ? "rotate-180" : "rotate-0"
            )}
            strokeWidth={2}
          />
        )}
      </button>

      {(hasHeadline || hasBullets) && (
        <div className="space-y-2">
          {hasHeadline && (
            <p className="text-[13px] font-medium text-foreground leading-snug">
              {headline}
            </p>
          )}
          {hasBullets && (
            <ul className="text-[12px] text-muted-foreground space-y-1 leading-relaxed">
              {bullets!.map((b, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="text-foreground/40 select-none">·</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {open && hasInsights && (
        <>
          {(responsibilities.length > 0 || qualifications.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-3">
              {responsibilities.length > 0 && (
                <DetailList title="Responsibilities" items={responsibilities} />
              )}
              {qualifications.length > 0 && (
                <DetailList title="Qualifications" items={qualifications} />
              )}
            </div>
          )}

          {keywords.length > 0 && (
            <div className="border-t pt-3 space-y-2">
              <h4 className="text-[12px] font-medium text-foreground">Keywords</h4>
              <div className="flex flex-wrap gap-1.5">
                {keywords.map((k, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 text-[11px] rounded-sm font-medium"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="space-y-1.5">
      <h4 className="text-[12px] font-medium text-foreground">{title}</h4>
      <ul className="text-[12px] text-muted-foreground space-y-1 pl-3 list-disc">
        {items.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    </div>
  );
}
