"use client";

import { useQuery } from "@tanstack/react-query";
import { api, ApiColumn } from "@/lib/api-client";
import { Pip } from "@/components/ui/pip";
import { cn } from "@/lib/utils";

// Map well-known column names to stage tint slugs defined in
// globals.css (the [data-stage="..."] selector). Anything not in
// the map gets a neutral pip from column.color.
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

// Segmented stage picker for the capture / manual entry modal.
// Renders one pill per non-archived column from the user's
// pipeline (so users with custom columns get accurate options).
export function StageSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (columnId: string) => void;
}) {
  const columnsQuery = useQuery({
    queryKey: ["columns"],
    queryFn: () => api.listColumns().then((r) => r.columns),
  });
  const columns: ApiColumn[] = (columnsQuery.data ?? []).filter(
    (c) => !c.isArchive
  );

  if (!columns.length) {
    return (
      <div className="text-[12px] text-muted-foreground">
        Loading stages…
      </div>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Add to column"
      className="grid auto-cols-fr grid-flow-col gap-0.5 p-0.5 bg-muted/60 rounded-md overflow-x-auto scroll-soft"
    >
      {columns.map((c) => {
        const active = c.id === value;
        const slug = STAGE_BY_NAME[c.name.toLowerCase().trim()];
        return (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={active}
            data-stage={slug}
            onClick={() => onChange(c.id)}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 h-[30px] px-3 rounded-[5px]",
              "text-[12px] font-medium whitespace-nowrap transition-colors",
              active
                ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Pip
              size={6}
              color={slug ? undefined : c.color || "hsl(var(--muted-foreground))"}
            />
            {c.name}
          </button>
        );
      })}
    </div>
  );
}
