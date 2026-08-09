"use client";

import { useEffect, useReducer } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type NotificationSettings = {
  digestEnabled: boolean;
  digestDay: number;
  digestHour: number;
  staleApplied: number;
  staleInterview: number;
};

type Action =
  | { type: "sync"; payload: NotificationSettings }
  | { type: "setDigestEnabled"; value: boolean }
  | { type: "setDigestDay"; value: number }
  | { type: "setDigestHour"; value: number }
  | { type: "setStaleApplied"; value: number }
  | { type: "setStaleInterview"; value: number };

const DEFAULT_SETTINGS: NotificationSettings = {
  digestEnabled: true,
  digestDay: 1,
  digestHour: 9,
  staleApplied: 7,
  staleInterview: 5,
};

function settingsReducer(state: NotificationSettings, action: Action): NotificationSettings {
  switch (action.type) {
    case "sync":
      return action.payload;
    case "setDigestEnabled":
      return { ...state, digestEnabled: action.value };
    case "setDigestDay":
      return { ...state, digestDay: action.value };
    case "setDigestHour":
      return { ...state, digestHour: action.value };
    case "setStaleApplied":
      return { ...state, staleApplied: action.value };
    case "setStaleInterview":
      return { ...state, staleInterview: action.value };
    default:
      return state;
  }
}

export default function NotificationsSettings() {
  const queryClient = useQueryClient();
  const settingsQuery = useQuery({
    queryKey: ["userSettings"],
    queryFn: api.getUserSettings,
  });

  const [settings, dispatch] = useReducer(settingsReducer, DEFAULT_SETTINGS);

  useEffect(() => {
    if (settingsQuery.data) {
      dispatch({
        type: "sync",
        payload: {
          digestEnabled: settingsQuery.data.digestEnabled,
          digestDay: settingsQuery.data.digestDay,
          digestHour: settingsQuery.data.digestHour,
          staleApplied: settingsQuery.data.staleDaysApplied,
          staleInterview: settingsQuery.data.staleDaysInterview,
        },
      });
    }
  }, [settingsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      api.updateUserSettings({
        digestEnabled: settings.digestEnabled,
        digestDay: settings.digestDay,
        digestHour: settings.digestHour,
        staleDaysApplied: settings.staleApplied,
        staleDaysInterview: settings.staleInterview,
      }),
    onSuccess: () => {
      toast.success("Saved.");
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Couldn't save."),
  });

  if (settingsQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Section title="Weekly digest">
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
        </Section>
        <Section title="Auto follow-up thresholds">
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </Section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Section title="Weekly digest">
        <div className="space-y-4">
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <div>
              <div className="text-[13px] font-medium">Email digest</div>
              <div className="text-xs text-muted-foreground">
                Get a once-a-week summary of your follow-ups and upcoming interviews.
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.digestEnabled}
              onChange={(e) =>
                dispatch({ type: "setDigestEnabled", value: e.target.checked })
              }
              className="w-9 h-5 accent-foreground"
            />
          </label>

          {settings.digestEnabled && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="digest-day">Day</Label>
                <select
                  id="digest-day"
                  value={settings.digestDay}
                  onChange={(e) =>
                    dispatch({ type: "setDigestDay", value: Number(e.target.value) })
                  }
                  className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring"
                >
                  {DAYS.map((d, i) => (
                    <option key={d} value={i}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="digest-hour">Hour (your time)</Label>
                <select
                  id="digest-hour"
                  value={settings.digestHour}
                  onChange={(e) =>
                    dispatch({ type: "setDigestHour", value: Number(e.target.value) })
                  }
                  className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring"
                >
                  {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                    <option key={h} value={h}>
                      {h.toString().padStart(2, "0")}:00
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </Section>

      <Section title="Auto follow-up thresholds">
        <p className="text-xs text-muted-foreground mb-3">
          When should we surface a follow-up reminder?
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="stale-applied">After applying</Label>
            <select
              id="stale-applied"
              value={settings.staleApplied}
              onChange={(e) =>
                dispatch({ type: "setStaleApplied", value: Number(e.target.value) })
              }
              className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring"
            >
              {[3, 5, 7, 10, 14].map((d) => (
                <option key={d} value={d}>
                  {d} days
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stale-interview">After an interview</Label>
            <select
              id="stale-interview"
              value={settings.staleInterview}
              onChange={(e) =>
                dispatch({ type: "setStaleInterview", value: Number(e.target.value) })
              }
              className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring"
            >
              {[2, 3, 5, 7, 10].map((d) => (
                <option key={d} value={d}>
                  {d} days
                </option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      <div>
        <Button
          size="sm"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-[13px] font-semibold">{title}</h2>
      <div className="rounded-md border bg-card p-4">{children}</div>
    </section>
  );
}
