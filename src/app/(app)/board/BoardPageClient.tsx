"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, formatDistanceToNowStrict } from "date-fns";
import Board from "@/components/kanban/Board";
import { PasteBar } from "@/components/capture/PasteBar";
import { PreviewCard } from "@/components/capture/PreviewCard";
import { DuplicateDialog } from "@/components/capture/DuplicateDialog";
import { ManualEntryForm } from "@/components/capture/ManualEntryForm";
import { StatsStrip } from "@/components/stats/StatsStrip";
import { SearchFilters } from "@/components/filters/SearchFilters";
import { RemindersBell } from "@/components/reminders/RemindersBell";
import { useSelectedCard } from "@/components/kanban/selected-card-store";
import { api } from "@/lib/api-client";

export default function BoardPageClient() {
  const select = useSelectedCard((s) => s.select);

  // The "Last update X ago" line in the hero uses the most recently
  // updated application as the heartbeat. Reads from the same cache
  // the Board itself uses, so no extra request.
  const appsQuery = useQuery({
    queryKey: ["applications"],
    queryFn: () => api.listApplications().then((r) => r.applications),
  });

  const heroMeta = useMemo(() => {
    const apps = appsQuery.data ?? [];
    const active = apps.length; // server already filters deleted
    const today = format(new Date(), "EEEE, MMM d");
    const mostRecent = apps
      .slice()
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
    const lastUpdate = mostRecent
      ? formatDistanceToNowStrict(new Date(mostRecent.updatedAt), {
          addSuffix: true,
        })
      : null;
    return { active, today, lastUpdate };
  }, [appsQuery.data]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Top bar — slim, single-row */}
      <header className="px-6 h-[52px] border-b border-border flex items-center justify-between gap-4 shrink-0 bg-card">
        <div className="flex items-center gap-1.5 text-[14px] text-muted-foreground">
          <span>Workspace</span>
          <ChevronRightInline />
          <span className="text-foreground font-semibold">Pipeline</span>
        </div>
        <div className="flex items-center gap-2">
          <RemindersBell />
          <ManualEntryForm />
        </div>
      </header>

      {/* Canvas — fixed hero/stats, board fills remaining height */}
      <div className="px-6 pt-5 pb-2 shrink-0">
        {/* Hero */}
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <h1 className="text-[18px] font-semibold tracking-[-0.01em] leading-[1.3] text-foreground">
              Pipeline{" "}
              <span className="font-normal text-muted-foreground">
                · {heroMeta.active} active{" "}
                {heroMeta.active === 1 ? "application" : "applications"}
              </span>
            </h1>
            <div className="flex items-center gap-2 mt-1 text-[12px] text-muted-foreground">
              <span>{heroMeta.today}</span>
              {heroMeta.lastUpdate && (
                <>
                  <span className="w-[3px] h-[3px] rounded-full bg-muted-foreground/50" />
                  <span>
                    Last update{" "}
                    <span className="text-foreground font-medium">
                      {heroMeta.lastUpdate}
                    </span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-3">
          <StatsStrip />
        </div>

        {/* Capture */}
        <div className="mb-3">
          <PasteBar />
        </div>

        {/* Filter row */}
        <div className="mb-3">
          <SearchFilters />
        </div>
      </div>

      {/* Board fills the remaining height, with its own horizontal
          scroll. Right-edge fade hints at off-screen columns. */}
      <div className="relative flex-1 min-h-0 px-6 pb-4">
        <Board />
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 bottom-4 w-20"
          style={{
            background:
              "linear-gradient(90deg, transparent, hsl(var(--background)) 85%)",
          }}
        />
      </div>

      <PreviewCard />
      <DuplicateDialog onOpenExisting={(id) => select(id)} />
    </div>
  );
}

function ChevronRightInline() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3 h-3 text-muted-foreground/70"
      aria-hidden
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
