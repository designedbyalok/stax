"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { api } from "@/lib/api-client";
import { track } from "@/lib/analytics";
import { useCaptureStore } from "./capture-store";

export function ManualEntryForm() {
  const captureState = useCaptureStore((s) => s.state);
  const cancel = useCaptureStore((s) => s.cancel);
  const toManual = useCaptureStore((s) => s.toManual);

  const queryClient = useQueryClient();
  const columnsQuery = useQuery({
    queryKey: ["columns"],
    queryFn: () => api.listColumns().then((r) => r.columns),
  });
  const visibleColumns = (columnsQuery.data ?? []).filter((c) => !c.isArchive);

  const [columnId, setColumnId] = useState<string>("");
  const [draft, setDraft] = useState({
    roleTitle: "",
    companyName: "",
    location: "",
    salaryRange: "",
    originalUrl: "",
  });

  const open = captureState.kind === "manual";

  useEffect(() => {
    if (captureState.kind === "manual") {
      setDraft({
        roleTitle: "",
        companyName: captureState.prefill.companyName ?? "",
        location: "",
        salaryRange: "",
        originalUrl: captureState.prefill.originalUrl ?? "",
      });
      setColumnId(visibleColumns[0]?.id ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const mutation = useMutation({
    mutationFn: api.createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      track("job_added", { source: "manual" });
      toast.success("Job added.");
      cancel();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Couldn't save job.");
    },
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!draft.roleTitle.trim() || !draft.companyName.trim()) {
      toast.error("Role title and company are required.");
      return;
    }
    mutation.mutate({
      roleTitle: draft.roleTitle.trim(),
      companyName: draft.companyName.trim(),
      location: draft.location.trim() || null,
      salaryRange: draft.salaryRange.trim() || null,
      originalUrl: draft.originalUrl.trim() || null,
      sourcePlatform: "MANUAL",
      columnId: columnId || undefined,
    });
  }

  const selectedColumnName =
    visibleColumns.find((c) => c.id === columnId)?.name ??
    visibleColumns[0]?.name ??
    "";

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => toManual({})}>
        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
        Add job
      </Button>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o) {
            mutation.reset();
            cancel();
          }
        }}
      >
        <DialogContent className="!flex !flex-col p-0 gap-0 overflow-hidden !w-[min(440px,calc(100vw-2rem))] !max-w-[440px]">
          <DialogHeader className="px-5 pt-5 pb-3 border-b">
            <DialogTitle className="text-sm font-medium">Add a job</DialogTitle>
            {captureState.kind === "manual" && captureState.error && (
              <p className="text-xs text-muted-foreground mt-1">
                {captureState.error}
              </p>
            )}
          </DialogHeader>

          <form className="px-5 py-4 space-y-3.5" onSubmit={onSubmit}>
            <Field label="Role title" required>
              <Input
                value={draft.roleTitle}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, roleTitle: e.target.value }))
                }
                placeholder="Senior Frontend Engineer"
                required
              />
            </Field>
            <Field label="Company" required>
              <Input
                value={draft.companyName}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, companyName: e.target.value }))
                }
                placeholder="Vercel"
                required
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Location">
                <Input
                  value={draft.location}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, location: e.target.value }))
                  }
                  placeholder="Remote"
                />
              </Field>
              <Field label="Salary">
                <Input
                  value={draft.salaryRange}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, salaryRange: e.target.value }))
                  }
                  placeholder="$140k–160k"
                />
              </Field>
            </div>
            <Field label="URL">
              <Input
                value={draft.originalUrl}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, originalUrl: e.target.value }))
                }
                type="url"
                placeholder="https://…"
              />
            </Field>
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
            <div className="flex justify-end gap-1.5 pt-2">
              <Button type="button" size="sm" variant="ghost" onClick={cancel}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving…" : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}
