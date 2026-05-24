"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { track } from "@/lib/analytics";
import { useCaptureStore } from "./capture-store";
import {
  ReviewDetailsModal,
  type ReviewDraft,
} from "./ReviewDetailsModal";

// Manual entry flow. Shares the ReviewDetailsModal with the paste
// flow but runs in `manual` mode — no AI badges, optional URL,
// employment + URL fields visible.
export function ManualEntryForm() {
  const captureState = useCaptureStore((s) => s.state);
  const cancel = useCaptureStore((s) => s.cancel);
  const toManual = useCaptureStore((s) => s.toManual);

  const queryClient = useQueryClient();

  const open = captureState.kind === "manual";

  const initialDraft: Partial<ReviewDraft> =
    captureState.kind === "manual"
      ? {
          roleTitle: "",
          companyName: captureState.prefill.companyName ?? "",
          location: "",
          salaryRange: "",
          jobType: "",
          originalUrl: captureState.prefill.originalUrl ?? "",
        }
      : {};

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

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => toManual({})}>
        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
        Add job
      </Button>

      <ReviewDetailsModal
        open={open}
        onOpenChange={(o) => {
          if (!o) {
            mutation.reset();
            cancel();
          }
        }}
        mode="manual"
        initialDraft={initialDraft}
        isPending={mutation.isPending}
        onSave={({ draft, columnId }) => {
          mutation.mutate({
            roleTitle: draft.roleTitle.trim(),
            companyName: draft.companyName.trim(),
            location: draft.location.trim() || null,
            salaryRange: draft.salaryRange.trim() || null,
            jobType: draft.jobType || null,
            originalUrl: draft.originalUrl.trim() || null,
            sourcePlatform: "MANUAL",
            columnId: columnId || undefined,
          });
        }}
      />
    </>
  );
}
