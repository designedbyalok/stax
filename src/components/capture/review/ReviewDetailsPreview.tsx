import { Sparkles } from "@/components/icons";
import { LiveCardPreview } from "../LiveCardPreview";
import type { ReviewDraft, ReviewMode } from "./types";

type ReviewDetailsPreviewProps = {
  mode: ReviewMode;
  draft: ReviewDraft;
  companyLogoUrl?: string | null;
  sourcePlatform: string;
  columnName: string | null;
  jobDescription?: string | null;
};

export function ReviewDetailsPreview({
  mode,
  draft,
  companyLogoUrl,
  sourcePlatform,
  columnName,
  jobDescription,
}: ReviewDetailsPreviewProps) {
  return (
    <div className="hidden md:flex flex-col gap-3 p-[18px] bg-gradient-to-b from-[hsl(var(--background))] to-[hsl(var(--muted))] border-l border-border overflow-y-auto scroll-soft">
      <LiveCardPreview
        roleTitle={draft.roleTitle}
        companyName={draft.companyName}
        companyLogoUrl={companyLogoUrl}
        location={draft.location.trim() || null}
        salaryRange={draft.salaryRange.trim() || null}
        jobType={draft.jobType || null}
        sourcePlatform={sourcePlatform}
        columnName={columnName}
      />

      {mode === "paste" && jobDescription && (
        <div className="rounded-[10px] bg-card border border-border p-3 text-[12px] space-y-2">
          <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
            <Sparkles className="h-3 w-3" strokeWidth={2} />
            Also pulled · won't appear on the card
          </div>
          <p className="text-foreground/85 line-clamp-4 leading-relaxed">
            {jobDescription.slice(0, 280)}
            {jobDescription.length > 280 ? "…" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
