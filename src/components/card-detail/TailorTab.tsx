"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Lightbulb,
  Sparkles,
} from "@/components/icons";
import { toast } from "sonner";
import {
  api,
  ApiApplication,
  ApiApplicationDetail,
  MatchDetails,
} from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TailorTab({
  card,
  detail,
}: {
  card: ApiApplication;
  detail: ApiApplicationDetail | null | undefined;
}) {
  const queryClient = useQueryClient();
  const resume = detail?.resume;
  const hasJD =
    !!detail?.jobDescription && detail.jobDescription.trim().length >= 80;

  // matchDetails lives on the full detail record (omitted from the
  // slim board payload). Fall back to card.matchScore for the badge.
  const match = (detail?.matchDetails ?? null) as MatchDetails | null;
  const score = match?.score ?? card.matchScore ?? null;

  const tailorMutation = useMutation({
    mutationFn: () => api.tailorApplication(card.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", card.id] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Resume analyzed");
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Analysis failed"),
  });

  if (!resume) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-lg">No Resume Attached</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Attach a resume in the Documents tab, then return here to run the
            AI Tailor.
          </p>
        </div>
      </div>
    );
  }

  const isPending = tailorMutation.isPending;

  return (
    <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
      {/* Run card */}
      <div className="rounded-lg border bg-card p-5 space-y-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              AI Resume Tailor
            </h3>
            <p className="text-sm text-muted-foreground">
              Score{" "}
              <span className="font-medium text-foreground">{resume.name}</span>{" "}
              against the {card.companyName} job description.
            </p>
          </div>
          {score != null && <ScoreRing score={score} />}
        </div>

        {!hasJD && (
          <div className="flex items-start gap-2 text-[13px] text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 rounded-md px-3 py-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              This job has no description saved, so there&apos;s nothing to
              compare against. Add one in the Overview tab first.
            </span>
          </div>
        )}

        <div className="pt-4 border-t">
          <Button
            className="w-full gap-2"
            disabled={isPending || !hasJD}
            onClick={() => tailorMutation.mutate()}
          >
            <Sparkles className={cn("w-4 h-4", isPending && "animate-pulse")} />
            {isPending
              ? "Analyzing…"
              : match
                ? "Re-run analysis"
                : "Run AI Tailor"}
          </Button>
          {match && (
            <p className="text-[11px] text-muted-foreground text-center mt-2">
              Last run {timeAgo(match.generatedAt)}
            </p>
          )}
        </div>
      </div>

      {/* Results */}
      {match ? (
        <>
          {match.summary && (
            <p className="text-[13px] text-foreground/90 leading-relaxed px-1">
              {match.summary}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Panel title="Matched skills" tone="success">
              {match.matchedSkills.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {match.matchedSkills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <Empty>No clear overlaps found.</Empty>
              )}
            </Panel>

            <Panel title="Missing keywords" tone="warning">
              {match.missingKeywords.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {match.missingKeywords.map((k) => (
                    <span
                      key={k}
                      className="px-2 py-0.5 rounded-sm text-[11px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              ) : (
                <Empty>Nothing major missing.</Empty>
              )}
            </Panel>
          </div>

          <Panel title="Suggestions" icon={<Lightbulb className="h-3.5 w-3.5" />}>
            <ul className="space-y-2">
              {match.suggestions.map((s, i) => (
                <li key={s} className="flex gap-2 text-[13px] text-foreground/90">
                  <span className="text-muted-foreground/50 select-none">
                    {i + 1}.
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </>
      ) : (
        !isPending && (
          <div className="text-center text-[13px] text-muted-foreground px-6 py-8">
            Run the tailor to see your match score, the skills that line up,
            gaps to close, and concrete edits.
          </div>
        )
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const tone =
    score >= 75
      ? "text-emerald-600"
      : score >= 50
        ? "text-amber-600"
        : "text-rose-600";
  return (
    <div className="flex flex-col items-end shrink-0">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
        Match
      </span>
      <span className={cn("text-2xl font-bold tabular-nums leading-none", tone)}>
        {score}
        <span className="text-sm font-semibold">%</span>
      </span>
    </div>
  );
}

function Panel({
  title,
  children,
  tone,
  icon,
}: {
  title: string;
  children: React.ReactNode;
  tone?: "success" | "warning";
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-md border bg-muted/30 p-3 space-y-2">
      <div
        className={cn(
          "flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider",
          tone === "success"
            ? "text-emerald-700 dark:text-emerald-400"
            : tone === "warning"
              ? "text-amber-700 dark:text-amber-400"
              : "text-muted-foreground"
        )}
      >
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <span className="text-xs text-muted-foreground italic">{children}</span>;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
