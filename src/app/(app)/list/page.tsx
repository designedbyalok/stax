"use client";

import { ApplicationList } from "@/components/list/ApplicationList";
import { ManualEntryForm } from "@/components/capture/ManualEntryForm";
import { PreviewCard } from "@/components/capture/PreviewCard";
import { DuplicateDialog } from "@/components/capture/DuplicateDialog";
import { SearchFilters } from "@/components/filters/SearchFilters";
import { RemindersBell } from "@/components/reminders/RemindersBell";
import { useSelectedCard } from "@/components/kanban/selected-card-store";

export default function ListPage() {
  const select = useSelectedCard((s) => s.select);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <header className="px-6 h-12 border-b flex items-center justify-between gap-4 shrink-0">
        <h1 className="text-sm font-semibold tracking-tight">List</h1>
        <div className="flex items-center gap-2">
          <RemindersBell />
          <ManualEntryForm />
        </div>
      </header>

      <div className="px-6 py-3 border-b shrink-0">
        <SearchFilters />
      </div>

      <div className="flex-1 overflow-hidden">
        <ApplicationList />
      </div>

      <PreviewCard />
      <DuplicateDialog onOpenExisting={(id) => select(id)} />
    </div>
  );
}
