"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

type Stat = {
  label: string;
  value: number | string;
};

export function StatsStrip() {
  const query = useQuery({
    queryKey: ["stats", "summary"],
    queryFn: api.getStatsSummary,
    refetchInterval: 60_000,
  });

  const stats: Stat[] = [
    { label: "Active", value: query.data?.totalActive ?? "—" },
    { label: "Applied this week", value: query.data?.appliedThisWeek ?? "—" },
    { label: "Awaiting response", value: query.data?.awaitingResponse ?? "—" },
    { label: "Upcoming interviews", value: query.data?.upcomingInterviews ?? "—" },
  ];

  return (
    <div className="flex items-center gap-6 px-1">
      {stats.map((s) => (
        <div key={s.label} className="flex items-baseline gap-1.5">
          <span className="text-[13px] font-semibold tabular-nums text-foreground">
            {s.value}
          </span>
          <span className="text-[11px] text-muted-foreground">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
