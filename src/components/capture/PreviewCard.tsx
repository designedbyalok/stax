"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { track } from "@/lib/analytics";
import { useCaptureStore } from "./capture-store";
import {
  ReviewDetailsModal,
  type ReviewDraft,
} from "./review/ReviewDetailsModal";

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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      track("job_added", {
        source: state.kind === "preview" ? state.source : "url",
      });
      toast.success("Job saved.");

      // The TL;DR is generated server-side in the background (after()),
      // so it isn't in the row we just created. Nudge the board to
      // refetch a couple of times so the card's summary footer fills
      // in within seconds instead of waiting for staleTime to expire.
      if (variables.jobDescription) {
        [3000, 8000].forEach((delay) =>
          setTimeout(
            () => queryClient.invalidateQueries({ queryKey: ["applications"] }),
            delay
          )
        );
      }

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
  const aiFilledFields: string[] = [];
  for (const [k, v] of Object.entries(fields)) {
    if (typeof v === "string" && v.trim().length > 0) {
      aiFilledFields.push(k);
    }
  }

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
