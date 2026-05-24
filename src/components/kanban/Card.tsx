"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowRight, Globe, MapPin } from "lucide-react";
import { ApiApplication } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { BrandAvatar } from "@/components/ui/brand-avatar";
import { LiveDot } from "@/components/ui/live-dot";
import { Pill } from "@/components/ui/pill";
import { AINote } from "@/components/ui/ai-note";

interface CardProps {
  card: ApiApplication;
  isOverlay?: boolean;
  onClick?: () => void;
}

const SOURCE_LABEL: Record<string, string> = {
  LINKEDIN: "LinkedIn",
  GREENHOUSE: "Greenhouse",
  LEVER: "Lever",
  WORKDAY: "Workday",
  INDEED: "Indeed",
  OTHER: "Web",
  MANUAL: "Manual",
};

const DAY = 24 * 60 * 60 * 1000;

export function KanbanCard({ card, isOverlay, onClick }: CardProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } =
    useSortable({
      id: card.id,
      data: { type: "Card", card },
    });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  // Empty drag-source placeholder — the dragged item is rendered
  // in a portal'd DragOverlay.
  if (isDragging && !isOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="rounded-[10px] border border-dashed border-foreground/15 bg-transparent min-h-[120px] opacity-50 select-none"
      />
    );
  }

  const sourceLabel = card.sourcePlatform ? SOURCE_LABEL[card.sourcePlatform] : null;
  const tint = card.logoColor ?? null;

  // Footer label: prefer the applied date, fall back to created at.
  const dateLabel = card.appliedAt
    ? `applied ${formatShortDate(card.appliedAt)}`
    : `saved ${formatShortDate(card.createdAt)}`;

  // Live signal: any card touched in the past 24 hours gets a
  // soft pulsing dot next to the company name. Cheap delight.
  const isLive =
    Date.now() - new Date(card.updatedAt).getTime() < DAY && !card.deletedAt;

  // AI nudge selection priority:
  // 1. Match score → success
  // 2. Stale in current column (no recent update, no appliedAt move) → warning
  // 3. TLDR headline → default
  const aiNote = chooseAINote(card);

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      {...(isOverlay ? {} : attributes)}
      {...(isOverlay ? {} : listeners)}
      onClick={onClick}
      className={cn(
        "group relative isolate bg-card text-card-foreground rounded-[10px] border border-border",
        "transition-[border-color,background-color,box-shadow] duration-200 ease-out",
        "cursor-grab active:cursor-grabbing select-none overflow-hidden",
        // Hover border picks up the column's stage tint via the
        // --tint-band variable (set by [data-stage] on the parent
        // Column), so the card visually belongs to its column.
        "hover:border-[var(--tint-band,hsl(var(--foreground)/0.2))] hover:shadow-[var(--shadow-pop)]",
        isOverlay &&
          "shadow-2xl ring-1 ring-foreground/10 cursor-grabbing rotate-[1deg] scale-[1.02] z-50"
      )}
    >
      {/* Left accent stripe — appears on hover, picks up the
          column's stage tint so a hovered card visually belongs
          to its column. Falls back to a neutral ink when there's
          no stage context (e.g. inside the drag overlay). */}
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-2.5 bottom-2.5 w-[2px] rounded-r-sm",
          "opacity-0 scale-y-[0.4] origin-center",
          "group-hover:opacity-100 group-hover:scale-y-100",
          "transition-[opacity,transform] duration-300 ease-out",
          "bg-[var(--tint-strong,hsl(var(--foreground)/0.5))]"
        )}
      />

      <div className="relative z-10 p-3 pb-2.5">
        <div className="flex items-start gap-2.5 mb-2.5">
          <BrandAvatar
            name={card.companyName}
            src={card.companyLogoUrl}
            tint={tint}
            size={28}
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-[14px] font-semibold text-foreground leading-[1.35] tracking-[-0.005em] line-clamp-2">
              {card.roleTitle}
            </h3>
            <p className="text-[12px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <span className="truncate">{card.companyName}</span>
              {isLive && <LiveDot title="Recently updated" />}
            </p>
          </div>
        </div>

        {(card.location || card.salaryRange || card.jobType) && (
          <div className="flex items-center gap-1.5 flex-wrap mt-1">
            {card.location && (
              <Pill
                icon={<MapPin />}
                className="max-w-[180px]"
              >
                {card.location}
              </Pill>
            )}
            {card.salaryRange && <Pill>{card.salaryRange}</Pill>}
            {card.jobType && <Pill>{card.jobType}</Pill>}
          </div>
        )}

        {aiNote && (
          <div className="mt-2">
            <AINote text={aiNote.text} tone={aiNote.tone} />
          </div>
        )}
      </div>

      <div className="relative z-10 flex items-center justify-between gap-2 px-3 py-2 border-t border-border text-[12px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 min-w-0">
          <Globe className="h-3 w-3 shrink-0 opacity-70" strokeWidth={2} />
          <span className="truncate">
            {sourceLabel ? `${sourceLabel} · ${dateLabel}` : dateLabel}
          </span>
        </span>
        <ArrowRight
          className={cn(
            "h-3 w-3 shrink-0 text-muted-foreground/0",
            "transition-all duration-200 ease-out",
            "group-hover:text-foreground/70 group-hover:translate-x-0.5"
          )}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function chooseAINote(
  card: ApiApplication
): { text: string; tone: "default" | "warning" | "success" } | null {
  // Match score nudge
  if (card.matchScore != null && card.matchScore >= 75) {
    return { text: `${card.matchScore}% match · strong fit`, tone: "success" };
  }

  // Stale: applied >9 days ago and still in same column
  if (card.appliedAt) {
    const daysSinceApplied = (Date.now() - new Date(card.appliedAt).getTime()) / DAY;
    if (daysSinceApplied > 9) {
      return {
        text: `Silent for ${Math.floor(daysSinceApplied)} days · nudge today?`,
        tone: "warning",
      };
    }
  }

  // Upcoming interview
  if (card.nextActionDate) {
    const t = new Date(card.nextActionDate).getTime();
    const days = Math.round((t - Date.now()) / DAY);
    if (days >= 0 && days <= 7 && card.nextAction) {
      return {
        text: `${card.nextAction} · ${formatShortDate(card.nextActionDate)}`,
        tone: "default",
      };
    }
  }

  // Fall back to the AI TL;DR headline
  if (card.tldrHeadline) {
    return { text: card.tldrHeadline, tone: "default" };
  }

  return null;
}
