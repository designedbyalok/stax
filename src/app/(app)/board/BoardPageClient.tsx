"use client";

import Board from "@/components/kanban/Board";
import { PasteBar } from "@/components/capture/PasteBar";
import { PreviewCard } from "@/components/capture/PreviewCard";
import { DuplicateDialog } from "@/components/capture/DuplicateDialog";
import { ManualEntryForm } from "@/components/capture/ManualEntryForm";
import { StatsStrip } from "@/components/stats/StatsStrip";
import { SearchFilters } from "@/components/filters/SearchFilters";
import { RemindersBell } from "@/components/reminders/RemindersBell";
import { useSelectedCard } from "@/components/kanban/selected-card-store";

export default function BoardPageClient() {
  const select = useSelectedCard((s) => s.select);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <header className="px-6 h-12 border-b flex items-center justify-between gap-4 shrink-0">
        <h1 className="text-sm font-semibold tracking-tight">Board</h1>
        <div className="flex items-center gap-2">
          <RemindersBell />
          <ManualEntryForm />
        </div>
      </header>

      <div className="px-6 py-3 border-b bg-muted/20 shrink-0 flex items-center gap-6">
        <div className="flex-1 max-w-md">
          <PasteBar />
        </div>
        <div className="hidden md:block">
          <StatsStrip />
        </div>
      </div>

      <div className="px-6 py-3 border-b shrink-0">
        <SearchFilters />
      </div>

      <div className="flex-1 overflow-hidden px-6 py-4">
        <Board />
      </div>

      <PreviewCard />
      <DuplicateDialog onOpenExisting={(id) => select(id)} />
    </div>
  );
}
