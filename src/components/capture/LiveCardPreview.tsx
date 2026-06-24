"use client";

import { Globe, MapPin } from "@/components/icons";
import { format } from "date-fns";
import { BrandAvatar } from "@/components/ui/brand-avatar";
import { Pill } from "@/components/ui/pill";
import { AINote } from "@/components/ui/ai-note";
import { LiveDot } from "@/components/ui/live-dot";
import { cn } from "@/lib/utils";

const STAGE_BY_NAME: Record<string, string> = {
  saved: "saved",
  applied: "applied",
  "phone screen": "phone",
  interview: "interview",
  "on-site": "interview",
  onsite: "interview",
  offer: "offer",
  rejected: "rejected",
  closed: "rejected",
};

const SOURCE_LABEL: Record<string, string> = {
  LINKEDIN: "LinkedIn",
  GREENHOUSE: "Greenhouse",
  LEVER: "Lever",
  WORKDAY: "Workday",
  INDEED: "Indeed",
  OTHER: "Web",
  MANUAL: "Manual",
};

// Read-only mini card that mirrors what the user will see on
// the board once they save. Updates as the form fields change.
export function LiveCardPreview({
  roleTitle,
  companyName,
  companyLogoUrl,
  logoColor,
  location,
  salaryRange,
  jobType,
  sourcePlatform,
  columnName,
}: {
  roleTitle: string;
  companyName: string;
  companyLogoUrl?: string | null;
  logoColor?: string | null;
  location?: string | null;
  salaryRange?: string | null;
  jobType?: string | null;
  sourcePlatform?: string | null;
  columnName?: string | null;
}) {
  const slug = columnName
    ? STAGE_BY_NAME[columnName.toLowerCase().trim()]
    : undefined;
  const sourceLabel = sourcePlatform ? SOURCE_LABEL[sourcePlatform] : null;
  const todayLabel = format(new Date(), "MMM d");
  const footerStage = columnName ?? "Saved";

  return (
    <div data-stage={slug} className="space-y-2">
      <div className="flex items-center justify-between text-[12px] text-muted-foreground font-medium">
        <span>Live preview</span>
        <span className="inline-flex items-center gap-1.5 text-emerald-600">
          <LiveDot />
          Updates as you type
        </span>
      </div>

      <div
        className={cn(
          "relative isolate bg-card text-card-foreground rounded-[10px] border border-border overflow-hidden"
        )}
      >
        {/* Persistent left accent stripe for the preview — gives the
            card the same "in-its-column" feel as the real kanban. */}
        <span
          aria-hidden
          className="absolute left-0 top-2.5 bottom-2.5 w-[2px] rounded-r-sm bg-[var(--tint-strong,hsl(var(--foreground)/0.4))]"
        />

        <div className="relative z-10 p-3 pb-2.5">
          <div className="flex items-start gap-2.5 mb-2.5">
            <BrandAvatar
              name={companyName || "Company"}
              src={companyLogoUrl}
              tint={logoColor}
              size={28}
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-[14px] font-semibold text-foreground leading-[1.35] tracking-[-0.005em] line-clamp-2">
                {roleTitle || (
                  <span className="text-muted-foreground/60">Role title</span>
                )}
              </h3>
              <p className="text-[12px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <span className="truncate">
                  {companyName || (
                    <span className="text-muted-foreground/60">Company</span>
                  )}
                </span>
              </p>
            </div>
          </div>

          {(location || salaryRange || jobType) && (
            <div className="flex items-center gap-1.5 flex-wrap mt-1">
              {location && (
                <Pill icon={<MapPin />} className="max-w-[180px]">
                  {location}
                </Pill>
              )}
              {salaryRange && <Pill>{salaryRange}</Pill>}
              {jobType && <Pill>{prettyJobType(jobType)}</Pill>}
            </div>
          )}

          <div className="mt-2">
            <AINote text="Captured just now · ready to track" tone="default" />
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between gap-2 px-3 py-2 border-t border-border text-[12px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 min-w-0">
            <Globe className="h-3 w-3 shrink-0 opacity-70" strokeWidth={2} />
            <span className="truncate">
              {sourceLabel ? `${sourceLabel} · ` : ""}
              saved {todayLabel}
            </span>
          </span>
          <span className="shrink-0">{footerStage}</span>
        </div>
      </div>
    </div>
  );
}

function prettyJobType(t: string) {
  return t
    .toLowerCase()
    .split("_")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("-");
}
