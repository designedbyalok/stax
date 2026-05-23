"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { api } from "@/lib/api-client";
import { track } from "@/lib/analytics";
import { useCaptureStore } from "./capture-store";

const SOURCE_LABEL: Record<string, string> = {
  LINKEDIN: "LinkedIn",
  GREENHOUSE: "Greenhouse",
  LEVER: "Lever",
  WORKDAY: "Workday",
  INDEED: "Indeed",
  OTHER: "the original posting",
};

export function PreviewCard() {
  const state = useCaptureStore((s) => s.state);
  const cancel = useCaptureStore((s) => s.cancel);
  const queryClient = useQueryClient();

  const columnsQuery = useQuery({
    queryKey: ["columns"],
    queryFn: () => api.listColumns().then((r) => r.columns),
  });
  const visibleColumns = (columnsQuery.data ?? []).filter((c) => !c.isArchive);

  const [draft, setDraft] = useState({
    roleTitle: "",
    companyName: "",
    location: "",
    salaryRange: "",
  });
  const [columnId, setColumnId] = useState("");
  const open = state.kind === "preview";

  useEffect(() => {
    if (state.kind !== "preview") return;
    setDraft({
      roleTitle: state.fields.roleTitle ?? "",
      companyName: state.fields.companyName ?? "",
      location: state.fields.location ?? "",
      salaryRange: state.fields.salaryRange ?? "",
    });
    setColumnId(visibleColumns[0]?.id ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.kind, state.kind === "preview" ? state.url : null]);

  const mutation = useMutation({
    mutationFn: api.createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      track("job_added", {
        source: state.kind === "preview" ? state.source : "url",
      });
      toast.success("Job saved.");
      cancel();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Couldn't save job.");
    },
  });

  if (state.kind !== "preview") return null;

  const sourceLabel = SOURCE_LABEL[state.source] ?? "the original posting";
  const uncertain = new Set(state.uncertainFields);
  const selectedColumnName =
    visibleColumns.find((c) => c.id === columnId)?.name ??
    visibleColumns[0]?.name ??
    "";

  function isUncertain(key: string) {
    return uncertain.has(key);
  }

  function onSave() {
    if (!draft.roleTitle.trim() || !draft.companyName.trim()) {
      toast.error("Role title and company are required.");
      return;
    }
    if (state.kind !== "preview") return;
    mutation.mutate({
      roleTitle: draft.roleTitle.trim(),
      companyName: draft.companyName.trim(),
      location: draft.location.trim() || null,
      salaryRange: draft.salaryRange.trim() || null,
      originalUrl: state.url,
      jobDescription: state.fields.jobDescription || null,
      companyLogoUrl: state.fields.companyLogoUrl || null,
      sourcePlatform: state.source,
      columnId: columnId || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && cancel()}>
      <DialogContent className="!flex !flex-col p-0 gap-0 overflow-hidden !w-[min(440px,calc(100vw-2rem))] !max-w-[440px]">
        <DialogHeader className="px-5 pt-5 pb-3 border-b">
          <DialogTitle className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-3.5 w-3.5 text-foreground" strokeWidth={2} />
            Review the details
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Pulled from {sourceLabel}. Fix anything that looks off.
          </p>
        </DialogHeader>

        <div className="px-5 py-4 space-y-3.5">
          <Field label="Role title" uncertain={isUncertain("roleTitle")} required>
            <Input
              value={draft.roleTitle}
              onChange={(e) => setDraft((d) => ({ ...d, roleTitle: e.target.value }))}
              placeholder="Senior Frontend Engineer"
            />
          </Field>
          <Field label="Company" uncertain={isUncertain("companyName")} required>
            <Input
              value={draft.companyName}
              onChange={(e) => setDraft((d) => ({ ...d, companyName: e.target.value }))}
              placeholder="Vercel"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Location" uncertain={isUncertain("location")}>
              <Input
                value={draft.location}
                onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
                placeholder="—"
              />
            </Field>
            <Field label="Salary" uncertain={isUncertain("salaryRange")}>
              <Input
                value={draft.salaryRange}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, salaryRange: e.target.value }))
                }
                placeholder="—"
              />
            </Field>
          </div>

          {visibleColumns.length > 0 && (
            <Field label="Column">
              <Select
                value={columnId || visibleColumns[0]?.id}
                onValueChange={(v) => setColumnId(v ?? "")}
              >
                <SelectTrigger className="h-8 text-[13px]">
                  <span className="truncate">{selectedColumnName}</span>
                </SelectTrigger>
                <SelectContent>
                  {visibleColumns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        </div>

        <div className="px-5 py-3 border-t bg-muted/20 flex items-center gap-3 min-w-0">
          <a
            href={state.url}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-muted-foreground hover:text-foreground hover:underline truncate min-w-0 flex-1"
            title={state.url}
          >
            {state.url}
          </a>
          <div className="flex gap-1.5 shrink-0">
            <Button variant="ghost" size="sm" onClick={cancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={onSave} disabled={mutation.isPending}>
              {mutation.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
  uncertain,
  required,
}: {
  label: string;
  children: React.ReactNode;
  uncertain?: boolean;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Label>
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
        {uncertain && (
          <span
            className="text-[10px] text-amber-600 dark:text-amber-400 font-medium"
            title="Auto-extracted — double-check before saving."
          >
            check
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
