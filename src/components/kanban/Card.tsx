"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MapPin, Sparkles } from "lucide-react";
import { ApiApplication } from "@/lib/api-client";
import { cn } from "@/lib/utils";

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

  const sourceLabel = card.sourcePlatform ? SOURCE_LABEL[card.sourcePlatform] : null;

  if (isDragging && !isOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-muted/30 border-2 border-dashed border-primary/30 rounded-xl px-5 py-4 opacity-50 select-none min-h-[160px]"
      />
    );
  }

  // Format the applied date or fallback to created at
  const dateObj = card.appliedAt ? new Date(card.appliedAt) : new Date(card.createdAt);
  const dateString = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={{
        ...style,
        ...(card.logoColor ? { borderTopWidth: 4, borderTopColor: card.logoColor } : { borderTopWidth: 4, borderTopColor: 'transparent' })
      }}
      {...(isOverlay ? {} : attributes)}
      {...(isOverlay ? {} : listeners)}
      onClick={onClick}
      className={cn(
        "group bg-card text-card-foreground p-5 rounded-xl border shadow-sm cursor-grab active:cursor-grabbing select-none transition-all duration-200",
        "hover:shadow-md hover:border-primary/20",
        isOverlay && "shadow-2xl ring-1 ring-primary/20 cursor-grabbing rotate-[2deg] scale-105 z-50",
        !card.logoColor && "border-t-border"
      )}
    >
      {/* Header: Logo, Company Name, Status/Match */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 border shadow-sm overflow-hidden p-1.5">
            {card.companyLogoUrl ? (
              <img src={card.companyLogoUrl} alt={card.companyName} className="w-full h-full object-contain" />
            ) : (
              <span className="text-sm font-bold text-muted-foreground">{card.companyName.charAt(0)}</span>
            )}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground truncate">{card.companyName}</div>
            <div className="text-[11px] text-muted-foreground truncate">{dateString}</div>
          </div>
        </div>
        
        {card.matchScore != null ? (
          <span className="shrink-0 inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/30 dark:text-green-400">
            {card.matchScore}% Match
          </span>
        ) : (
          <span className="shrink-0 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            Active
          </span>
        )}
      </div>

      {/* Body: Role Title & Image placeholder if any */}
      <div className="mb-4">
        <h3 className="text-base font-bold leading-snug line-clamp-2 text-foreground">
          {card.roleTitle}
        </h3>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {sourceLabel && (
          <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {sourceLabel}
          </span>
        )}
        {card.location && (
          <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium text-muted-foreground max-w-[120px] truncate">
            {card.location}
          </span>
        )}
        {card.salaryRange && (
          <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {card.salaryRange}
          </span>
        )}
      </div>

      {/* Footer Stats */}
      <div className="flex items-center gap-4 pt-4 border-t mt-auto text-[11px] text-muted-foreground font-medium">
        {card.tldrHeadline ? (
          <div className="flex items-center gap-1.5 line-clamp-1" title={card.tldrHeadline}>
            <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="truncate">{card.tldrHeadline}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            View details
          </div>
        )}
      </div>
    </div>
  );
}
