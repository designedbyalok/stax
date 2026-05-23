"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MapPin } from "lucide-react";
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

  if (isDragging && !isOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-16 w-full bg-foreground/[0.06] rounded-md border border-dashed border-border"
      />
    );
  }

  const sourceLabel = card.sourcePlatform ? SOURCE_LABEL[card.sourcePlatform] : null;

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      {...(isOverlay ? {} : attributes)}
      {...(isOverlay ? {} : listeners)}
      onClick={onClick}
      className={cn(
        "group bg-card text-card-foreground px-3 py-2.5 rounded-md border cursor-grab active:cursor-grabbing select-none",
        "hover:border-foreground/20 hover:bg-foreground/[0.02] transition-colors",
        isOverlay && "shadow-lg ring-1 ring-foreground/10 cursor-grabbing rotate-[1deg]"
      )}
    >
      <div className="text-[13px] font-medium leading-snug line-clamp-2 text-foreground">
        {card.roleTitle}
      </div>
      <div className="text-[12px] text-muted-foreground mt-0.5 line-clamp-1">
        {card.companyName}
      </div>
      {(card.location || sourceLabel) && (
        <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
          {card.location && (
            <span className="inline-flex items-center gap-1 min-w-0">
              <MapPin className="h-3 w-3 shrink-0" strokeWidth={1.75} />
              <span className="truncate">{card.location}</span>
            </span>
          )}
          {card.location && sourceLabel && <span className="opacity-50">·</span>}
          {sourceLabel && <span>{sourceLabel}</span>}
        </div>
      )}
    </div>
  );
}
