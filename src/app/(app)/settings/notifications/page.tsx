"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function NotificationsSettings() {
  const queryClient = useQueryClient();
  const settingsQuery = useQuery({
    queryKey: ["user", "settings"],
    queryFn: api.getUserSettings,
  });

  const [digestEnabled, setDigestEnabled] = useState(true);
  const [digestDay, setDigestDay] = useState(1);
  const [digestHour, setDigestHour] = useState(9);
  const [staleApplied, setStaleApplied] = useState(7);
  const [staleInterview, setStaleInterview] = useState(5);

  useEffect(() => {
    if (settingsQuery.data) {
      setDigestEnabled(settingsQuery.data.digestEnabled);
      setDigestDay(settingsQuery.data.digestDay);
      setDigestHour(settingsQuery.data.digestHour);
      setStaleApplied(settingsQuery.data.staleDaysApplied);
      setStaleInterview(settingsQuery.data.staleDaysInterview);
    }
  }, [settingsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      api.updateUserSettings({
        digestEnabled,
        digestDay,
        digestHour,
        staleDaysApplied: staleApplied,
        staleDaysInterview: staleInterview,
      }),
    onSuccess: () => {
      toast.success("Saved.");
      queryClient.invalidateQueries({ queryKey: ["user", "settings"] });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Couldn't save."),
  });

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
              checked={digestEnabled}
              onChange={(e) => setDigestEnabled(e.target.checked)}
              className="w-9 h-5 accent-foreground"
            />
          </label>

          {digestEnabled && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="digest-day">Day</Label>
                <select
                  id="digest-day"
                  value={digestDay}
                  onChange={(e) => setDigestDay(Number(e.target.value))}
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
                  value={digestHour}
                  onChange={(e) => setDigestHour(Number(e.target.value))}
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
              value={staleApplied}
              onChange={(e) => setStaleApplied(Number(e.target.value))}
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
              value={staleInterview}
              onChange={(e) => setStaleInterview(Number(e.target.value))}
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
