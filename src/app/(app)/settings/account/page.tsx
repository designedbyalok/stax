"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";

const TIMEZONES = [
  "UTC",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export default function AccountSettings() {
  const queryClient = useQueryClient();
  const settingsQuery = useQuery({
    // Same key the Board uses so the cache is shared.
    queryKey: ["userSettings"],
    queryFn: api.getUserSettings,
  });

  const [timezone, setTimezone] = useState("UTC");

  useEffect(() => {
    if (settingsQuery.data) {
      setTimezone(settingsQuery.data.timezone ?? "UTC");
    }
  }, [settingsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () => api.updateUserSettings({ timezone }),
    onSuccess: () => {
      toast.success("Saved.");
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Couldn't save."),
  });

  const email = settingsQuery.data?.email;

  if (settingsQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Section title="Account Details">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </Section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Section title="Account Details">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email ?? ""} disabled readOnly />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="timezone">Timezone</Label>
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-muted-foreground">
              Used to schedule the weekly digest at the right hour.
            </p>
          </div>
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
      </Section>

      <Section title="Session">
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Log out
        </Button>
      </Section>
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
