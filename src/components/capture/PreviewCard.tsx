"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { track } from "@/lib/analytics";
import { useCaptureStore } from "./capture-store";
import {
  ReviewDetailsModal,
  type ReviewDraft,
} from "./ReviewDetailsModal";

// Paste flow: shows after /api/parse/url returns. Hands off to
// the shared ReviewDetailsModal in `paste` mode so the UI matches
// the manual-entry form.
export function PreviewCard() {
  const state = useCaptureStore((s) => s.state);
  const cancel = useCaptureStore((s) => s.cancel);
  const queryClient = useQueryClient();

  const open = state.kind === "preview";

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

  // Fields the parser filled in count as "AI filled"; fields that
  // came back empty don't get a badge.
  const fields = state.fields;
  const aiFilledFields = Object.entries(fields)
    .filter(([k, v]) => typeof v === "string" && v.trim().length > 0)
    .map(([k]) => k);

  const initialDraft: Partial<ReviewDraft> = {
    roleTitle: fields.roleTitle ?? "",
    companyName: fields.companyName ?? "",
    location: fields.location ?? "",
    salaryRange: fields.salaryRange ?? "",
    jobType: "",
    originalUrl: state.url,
  };

  return (
    <ReviewDetailsModal
      open={open}
      onOpenChange={(o) => !o && cancel()}
      mode="paste"
      initialDraft={initialDraft}
      uncertainFields={state.uncertainFields}
      aiFilledFields={aiFilledFields}
      source={state.source}
      companyLogoUrl={fields.companyLogoUrl ?? null}
      jobDescription={fields.jobDescription ?? null}
      isPending={mutation.isPending}
      onSave={({ draft, columnId, companyLogoUrl, jobDescription }) => {
        mutation.mutate({
          roleTitle: draft.roleTitle.trim(),
          companyName: draft.companyName.trim(),
          location: draft.location.trim() || null,
          salaryRange: draft.salaryRange.trim() || null,
          jobType: draft.jobType || null,
          originalUrl: state.url,
          jobDescription,
          companyLogoUrl,
          sourcePlatform: state.source,
          columnId: columnId || undefined,
        });
      }}
    />
  );
}
