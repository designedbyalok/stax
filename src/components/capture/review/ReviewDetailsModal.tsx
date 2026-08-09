"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { ReviewDetailsForm } from "./ReviewDetailsForm";
import { ReviewDetailsPreview } from "./ReviewDetailsPreview";
import { normalizeDraft, type ReviewDetailsModalProps } from "./types";

export function ReviewDetailsModal({
  open,
  onOpenChange,
  mode,
  initialDraft,
  uncertainFields = [],
  aiFilledFields = [],
  source,
  companyLogoUrl,
  jobDescription,
  isPending,
  onSave,
}: ReviewDetailsModalProps) {
  const uncertain = new Set(uncertainFields);
  const aiFilled = new Set(aiFilledFields);

  const columnsQuery = useQuery({
    queryKey: ["columns"],
    queryFn: () => api.listColumns().then((r) => r.columns),
  });
  const visibleColumns = (columnsQuery.data ?? []).filter((c) => !c.isArchive);

  const [draft, setDraft] = useState(() => normalizeDraft(initialDraft));
  const [columnId, setColumnId] = useState<string>("");
  const [sourcePlatform, setSourcePlatform] = useState<string>(source ?? "MANUAL");

  useEffect(() => {
    if (!open) return;
    setDraft(normalizeDraft(initialDraft));
    setColumnId(visibleColumns[0]?.id ?? "");
    setSourcePlatform(source ?? (mode === "manual" ? "MANUAL" : "OTHER"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function attemptSave() {
    if (!draft.roleTitle.trim() || !draft.companyName.trim()) return;
    onSave({
      draft,
      columnId,
      companyLogoUrl: companyLogoUrl ?? null,
      jobDescription: jobDescription ?? null,
    });
  }

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        attemptSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, draft, columnId, sourcePlatform]);

  const selectedColumnName = visibleColumns.find((c) => c.id === columnId)?.name ?? null;
  const urlForFooter = mode === "paste" ? draft.originalUrl : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "!w-[min(760px,calc(100vw-2rem))] sm:!max-w-[760px]",
          "!p-0 !gap-0 max-h-[calc(100vh-2rem)]",
          "rounded-2xl border bg-card shadow-2xl overflow-hidden",
          "grid grid-cols-1 md:grid-cols-[1.15fr_1fr] grid-rows-[1fr_auto]"
        )}
      >
        <DialogTitle className="sr-only">
          {mode === "paste" ? "Review the details" : "Add a job"}
        </DialogTitle>

        <ReviewDetailsForm
          mode={mode}
          draft={draft}
          onDraftChange={setDraft}
          sourcePlatform={sourcePlatform}
          onSourcePlatformChange={setSourcePlatform}
          columnId={columnId}
          onColumnIdChange={setColumnId}
          companyLogoUrl={companyLogoUrl}
          uncertainFields={uncertain}
          aiFilledFields={aiFilled}
          onClose={() => onOpenChange(false)}
        />

        <ReviewDetailsPreview
          mode={mode}
          draft={draft}
          companyLogoUrl={companyLogoUrl}
          sourcePlatform={sourcePlatform}
          columnName={selectedColumnName}
          jobDescription={jobDescription}
        />

        <div className="col-span-full flex items-center justify-between gap-3 px-5 py-3 border-t border-border bg-muted/30">
          {urlForFooter ? (
            <a
              href={urlForFooter}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-[12px] text-muted-foreground hover:text-foreground hover:underline min-w-0 max-w-[55%] truncate"
              title={urlForFooter}
            >
              <span className="truncate">{urlForFooter}</span>
            </a>
          ) : (
            <span className="text-[12px] text-muted-foreground">
              {mode === "manual" ? "No source URL" : ""}
            </span>
          )}

          <div className="flex items-center gap-1.5 shrink-0">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={attemptSave}
              disabled={isPending || !draft.roleTitle.trim() || !draft.companyName.trim()}
              className="gap-2"
            >
              {isPending ? "Saving…" : mode === "paste" ? "Save to pipeline" : "Add job"}
              <span className="opacity-60 text-[11px] font-medium tracking-wider">⌘↵</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { ReviewDraft, ReviewMode, ReviewDetailsModalProps } from "./types";
