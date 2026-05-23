"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { CornerDownRight, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiActivity } from "@/lib/api-client";

const TYPE_DOT: Record<ApiActivity["type"], string> = {
  CREATED: "bg-foreground/30",
  STATUS_CHANGED: "bg-foreground/40",
  CONTACT_ADDED: "bg-foreground/30",
  NOTE_ADDED: "bg-foreground/30",
  USER_EVENT: "bg-foreground/60",
};

export function Timeline({
  applicationId,
  activities,
}: {
  applicationId: string;
  activities: ApiActivity[];
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");

  const createMutation = useMutation({
    mutationFn: (description: string) => api.createActivity(applicationId, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", applicationId] });
      setDraft("");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Couldn't add event.");
    },
  });

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = draft.trim();
    if (!value) return;
    createMutation.mutate(value);
  }

  return (
    <div className="space-y-2">
      <Label>Timeline</Label>

      <form onSubmit={submit} className="flex gap-1.5">
        <div className="relative flex-1">
          <CornerDownRight className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Log an event — e.g. Had screen with Sarah"
            className="pl-7"
          />
        </div>
        <Button
          type="submit"
          size="sm"
          variant="outline"
          disabled={!draft.trim() || createMutation.isPending}
          aria-label="Add event"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </form>

      {activities.length === 0 ? (
        <p className="text-[12px] text-muted-foreground pt-1">No events yet.</p>
      ) : (
        <ol className="relative pl-3 space-y-2.5 mt-1">
          <span
            className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-border"
            aria-hidden
          />
          {activities.map((a) => (
            <li key={a.id} className="relative flex items-start gap-2.5">
              <span
                className={`absolute -left-3 top-1.5 w-2 h-2 rounded-full ring-2 ring-background ${TYPE_DOT[a.type]}`}
                aria-hidden
              />
              <div className="flex-1 min-w-0">
                <div className="text-[12px] text-foreground leading-snug">
                  {a.description}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
