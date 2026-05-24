"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Bell, Clock, X, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { api, ApiReminder } from "@/lib/api-client";
import { useSelectedCard } from "@/components/kanban/selected-card-store";

const TYPE_LABEL: Record<ApiReminder["type"], string> = {
  AUTO_FOLLOWUP: "Follow up",
  NEXT_ACTION_DUE: "Next action due",
  INTERVIEW_PREP_DUE: "Interview prep",
};

export function RemindersBell() {
  const queryClient = useQueryClient();
  const select = useSelectedCard((s) => s.select);

  const remindersQuery = useQuery({
    queryKey: ["reminders"],
    queryFn: () => api.listReminders().then((r) => r.reminders),
    refetchInterval: 60_000,
  });

  const reminders = remindersQuery.data ?? [];
  const visible = reminders.filter((r) => r.status === "PENDING" || r.status === "SNOOZED");
  const count = visible.length;

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
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Couldn't run detection.");
    },
  });

  const snoozeMutation = useMutation({
    mutationFn: ({ id, days }: { id: string; days: number }) =>
      api.snoozeReminder(id, days),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Couldn't snooze.");
    },
  });

  const dismissMutation = useMutation({
    mutationFn: (id: string) => api.dismissReminder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Couldn't dismiss.");
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Reminders"
            className="relative"
          >
            <Bell className="h-4 w-4" strokeWidth={1.75} />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] rounded-full bg-foreground text-background text-[9px] font-bold flex items-center justify-center px-1">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-[320px] p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <DropdownMenuLabel className="px-0 py-0 text-sm font-medium">
            Reminders
          </DropdownMenuLabel>
          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => runMutation.mutate()}
            disabled={runMutation.isPending}
          >
            {runMutation.isPending ? "Scanning…" : "Scan now"}
          </Button>
        </div>

        {visible.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs text-muted-foreground">
            No reminders. You&apos;re all caught up.
          </div>
        ) : (
          <ul className="max-h-[360px] overflow-y-auto py-1">
            {visible.map((r) => (
              <li
                key={r.id}
                className="px-3 py-2 hover:bg-muted/40 group cursor-pointer"
                onClick={() => select(r.application.id)}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium truncate">
                      {r.application.roleTitle}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {r.application.companyName} · {r.application.columnName}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" strokeWidth={1.75} />
                      <span>
                        {r.type === "INTERVIEW_PREP_DUE" ? (
                          <span className="text-primary font-medium">Open prep tab</span>
                        ) : (
                          TYPE_LABEL[r.type]
                        )}
                        {" · "}
                        {formatDistanceToNow(new Date(r.dueAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <div
                    className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      className="text-muted-foreground hover:text-foreground w-auto px-1.5 text-[10px]"
                      aria-label="Snooze 3 days"
                      onClick={() => snoozeMutation.mutate({ id: r.id, days: 3 })}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      3d
                    </Button>
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Dismiss"
                      onClick={() => dismissMutation.mutate(r.id)}
                    >
                      <X className="h-3 w-3" strokeWidth={1.75} />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
