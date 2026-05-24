"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Clock, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api, ApiReminder } from "@/lib/api-client";
import { useSelectedCard } from "@/components/kanban/selected-card-store";
import { CardDrawer } from "@/components/card-detail/CardDrawer";
import { UnmatchedInbox } from "@/components/email/UnmatchedInbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

const SNOOZE_DAYS = [3, 7, 14];

const TYPE_LABEL: Record<ApiReminder["type"], string> = {
  AUTO_FOLLOWUP: "Follow up",
  NEXT_ACTION_DUE: "Next action due",
  STALE_APPLICATION: "Stale application",
  CUSTOM: "Reminder",
  INTERVIEW_PREP_DUE: "Interview prep",
};

export default function RemindersPage() {
  const queryClient = useQueryClient();
  const select = useSelectedCard((s) => s.select);
  const selectedId = useSelectedCard((s) => s.selectedCardId);

  const remindersQuery = useQuery({
    queryKey: ["reminders"],
    queryFn: () => api.listReminders().then((r) => r.reminders),
    refetchInterval: 60_000,
  });

  const appsQuery = useQuery({
    queryKey: ["applications"],
    queryFn: () => api.listApplications().then((r) => r.applications),
  });

  const reminders = (remindersQuery.data ?? []).filter(
    (r) => r.status === "PENDING" || r.status === "SNOOZED"
  );

  const runMutation = useMutation({
    mutationFn: api.runRemindersDetection,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast.success(
        data.created > 0
          ? `${data.created} new reminder${data.created > 1 ? "s" : ""}.`
          : "You're all caught up."
      );
    },
  });

  const snoozeMutation = useMutation({
    mutationFn: ({ id, days }: { id: string; days: number }) =>
      api.snoozeReminder(id, days),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reminders"] }),
  });

  const dismissMutation = useMutation({
    mutationFn: (id: string) => api.dismissReminder(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reminders"] }),
  });

  const selectedCard =
    appsQuery.data?.find((a) => a.id === selectedId) ?? null;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <header className="px-6 h-12 border-b flex items-center justify-between gap-4 shrink-0">
        <h1 className="text-sm font-semibold tracking-tight">Reminders</h1>
        <Button
          size="sm"
          variant="outline"
          disabled={runMutation.isPending}
          onClick={() => runMutation.mutate()}
        >
          {runMutation.isPending ? "Scanning…" : "Scan now"}
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-8">
          <UnmatchedInbox />
          
          <div>
            <div className="flex items-center gap-2 px-1 mb-3">
              <Clock className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold tracking-tight">Reminders</h2>
            </div>
            {remindersQuery.isLoading ? (
            <div className="space-y-1.5 mt-2">
              <Skeleton className="h-[76px] w-full rounded-md" />
              <Skeleton className="h-[76px] w-full rounded-md" />
              <Skeleton className="h-[76px] w-full rounded-md" />
            </div>
          ) : reminders.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-sm text-muted-foreground">
                No reminders. You&apos;re all caught up.
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Hit “Scan now” to check for stale applications.
              </p>
            </div>
          ) : (
            <ul className="space-y-1.5">
              {reminders.map((r) => (
                <li
                  key={r.id}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-md border bg-card hover:border-foreground/15 cursor-pointer transition-colors"
                  onClick={() => select(r.application.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium truncate">
                      {r.application.roleTitle}
                    </div>
                    <div className="text-[12px] text-muted-foreground truncate">
                      {r.application.companyName} · {r.application.columnName}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" strokeWidth={1.75} />
                      <span>
                        {TYPE_LABEL[r.type]} ·{" "}
                        {formatDistanceToNow(new Date(r.dueAt), { addSuffix: true })}
                        {r.status === "SNOOZED" && r.snoozedUntil && (
                          <>
                            {" · snoozed until "}
                            {new Date(r.snoozedUntil).toLocaleDateString()}
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                  <div
                    className="flex items-center gap-1 opacity-0 group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button type="button" size="xs" variant="ghost">
                            Snooze
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Snooze for</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {SNOOZE_DAYS.map((days) => (
                          <DropdownMenuItem
                            key={days}
                            onClick={() => snoozeMutation.mutate({ id: r.id, days })}
                          >
                            {days} day{days > 1 ? "s" : ""}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => dismissMutation.mutate(r.id)}
                      aria-label="Dismiss"
                    >
                      <X className="h-3 w-3" strokeWidth={1.75} />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          </div>
        </div>
      </div>

      <CardDrawer
        card={selectedCard}
        isOpen={!!selectedCard}
        onClose={() => select(null)}
      />
    </div>
  );
}
