"use client";

import { memo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { MoreHorizontalIcon, Add01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { ApiApplication } from "@/lib/api-client";
import { KanbanCard } from "./Card";
import { Pip } from "@/components/ui/pip";
import { cn } from "@/lib/utils";

interface ColumnProps {
  column: { id: string; name: string; color?: string | null };
  cards: ApiApplication[];
  // Stable callback so React.memo holds across drags.
  onCardSelect: (id: string) => void;
  showEmptyHint?: boolean;
  showPlaceholders?: boolean;
  onAddCard?: () => void;
}

// Map column names to the stage tint slugs defined in globals.css.
// Anything that doesn't match falls back to the user-defined color.
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

const PLACEHOLDERS = [
  { roleTitle: "Senior Product Designer", companyName: "Linear", location: "Remote" },
  { roleTitle: "Frontend Engineer", companyName: "Vercel", location: "San Francisco" },
];

function ColumnImpl({
  column,
  cards,
  onCardSelect,
  showEmptyHint,
  showPlaceholders,
  onAddCard,
}: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "Column", column },
  });

  const stageSlug = STAGE_BY_NAME[column.name.toLowerCase().trim()];
  const pipColor = stageSlug
    ? undefined // pip reads from --tint-strong via [data-stage]
    : column.color || "hsl(var(--muted-foreground))";

  return (
    <div
      className="flex flex-col flex-shrink-0 w-[280px]"
      data-stage={stageSlug}
    >
      <div className="flex items-center gap-2 px-1 pb-1 pt-0.5 group/colhead">
        <Pip color={pipColor} />
        <span className="text-[13px] font-semibold text-foreground tracking-[-0.01em]">
          {column.name}
        </span>
        <span className="text-[12px] text-muted-foreground/80 font-medium tabular-nums">
          {cards.length}
        </span>
        <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover/colhead:opacity-100 transition-opacity">
          {onAddCard && (
            <button
              type="button"
              onClick={onAddCard}
              className="w-[22px] h-[22px] grid place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              title="Add card"
            >
              <Icon icon={Add01Icon} size={14} strokeWidth={2} />
            </button>
          )}
          <button
            type="button"
            className="w-[22px] h-[22px] grid place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title="Column options"
          >
            <Icon icon={MoreHorizontalIcon} size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 flex flex-col gap-2 rounded-lg p-1 min-h-[120px] transition-colors",
          isOver ? "bg-[hsl(var(--foreground)/0.04)]" : "bg-transparent"
        )}
      >
        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <KanbanCard key={card.id} card={card} onSelect={onCardSelect} />
          ))}
        </SortableContext>

        {cards.length === 0 && showPlaceholders && (
          <div className="space-y-2">
            {PLACEHOLDERS.map((p, i) => (
              <PlaceholderCard key={i} {...p} />
            ))}
          </div>
        )}

        {cards.length === 0 && !showPlaceholders && (
          <div
            className={cn(
              "rounded-[10px] border border-dashed border-foreground/15 p-3.5 text-center text-[12px] text-muted-foreground/80",
              showEmptyHint ? "" : "opacity-70"
            )}
          >
            {showEmptyHint ? "Paste a job link to get started." : "Drop a card here"}
          </div>
        )}
      </div>
    </div>
  );
}

// Memoized so a drag on one column doesn't re-render the others.
// Relies on Board passing a stable `column` (the cached ApiColumn),
// stable `cards` arrays (from the memoized cardsByColumn map), and a
// stable `onCardSelect`.
export const Column = memo(ColumnImpl);

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
    <div className="px-3 py-2.5 rounded-[10px] border border-dashed border-foreground/15 bg-transparent select-none pointer-events-none">
      <div className="text-[13px] font-medium leading-snug text-muted-foreground/80">
        {roleTitle}
      </div>
      <div className="text-[12px] text-muted-foreground/60 mt-0.5">
        {companyName}
      </div>
      <div className="text-[11px] text-muted-foreground/50 mt-2">{location}</div>
    </div>
  );
}
