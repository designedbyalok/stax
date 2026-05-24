"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { MapPin } from "lucide-react";
import { ApiApplication } from "@/lib/api-client";
import { KanbanCard } from "./Card";
import { cn } from "@/lib/utils";

interface ColumnProps {
  column: { id: string; title: string; color?: string };
  cards: ApiApplication[];
  onCardClick: (card: ApiApplication) => void;
  showEmptyHint?: boolean;
  showPlaceholders?: boolean;
}

// Example placeholder cards shown on a brand-new account's empty board.
// Per AC-05 in the PRD: they disappear on first real save.
const PLACEHOLDERS = [
  {
    roleTitle: "Senior Product Designer",
    companyName: "Linear",
    location: "Remote",
  },
  {
    roleTitle: "Frontend Engineer",
    companyName: "Vercel",
    location: "San Francisco",
  },
];

export function Column({
  column,
  cards,
  onCardClick,
  showEmptyHint,
  showPlaceholders,
}: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "Column", column },
  });

  return (
    <div className="flex flex-col flex-shrink-0 w-72">
      <div className="flex items-center justify-between px-1 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-foreground tracking-tight">
            {column.title}
          </span>
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {cards.length}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        style={column.color ? { borderTopWidth: 3, borderTopColor: column.color } : {}}
        className={cn(
          "flex-1 flex flex-col gap-1.5 rounded-md p-1.5 min-h-[120px] transition-colors",
          isOver ? "bg-foreground/[0.04]" : "bg-muted/30"
        )}
      >
        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              onClick={() => onCardClick(card)}
            />
          ))}
        </SortableContext>

        {cards.length === 0 && showPlaceholders && (
          <div className="space-y-1.5">
            {PLACEHOLDERS.map((p, i) => (
              <PlaceholderCard key={i} {...p} />
            ))}
          </div>
        )}

        {cards.length === 0 && showEmptyHint && !showPlaceholders && (
          <div className="text-[11px] text-muted-foreground text-center py-4 px-2">
            Paste a job link to get started.
          </div>
        )}
      </div>
    </div>
  );
}

function PlaceholderCard({
  roleTitle,
  companyName,
  location,
}: {
  roleTitle: string;
  companyName: string;
  location: string;
}) {
  return (
    <div className="px-3 py-2.5 rounded-md border border-dashed bg-transparent select-none pointer-events-none">
      <div className="text-[13px] font-medium leading-snug text-muted-foreground/80">
        {roleTitle}
      </div>
      <div className="text-[12px] text-muted-foreground/60 mt-0.5">
        {companyName}
      </div>
      <div className="flex items-center gap-1 mt-2 text-[11px] text-muted-foreground/50">
        <MapPin className="h-3 w-3 shrink-0" strokeWidth={1.75} />
        {location}
      </div>
    </div>
  );
}
