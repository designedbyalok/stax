"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, ApiApplication, ApiColumn } from "@/lib/api-client";

type Stat = {
  label: string;
  value: number | string;
};

// Stats used to hit a dedicated /api/stats/summary endpoint that re-ran the
// same `count()` queries against the rows the client already had in cache.
// We now derive everything from the shared ["applications"] + ["columns"]
// caches — zero network calls, and stats stay consistent with whatever's
// visibly on the board.
export function StatsStrip() {
  // useQuery with the existing keys: if the Board page has already fetched
  // these (common case), this is a synchronous cache read. On standalone
  // pages it does a fetch but populates the same shared cache.
  const applicationsQuery = useQuery({
    queryKey: ["applications"],
    queryFn: () => api.listApplications().then((r) => r.applications),
  });
  const columnsQuery = useQuery({
    queryKey: ["columns"],
    queryFn: () => api.listColumns().then((r) => r.columns),
  });

  const stats: Stat[] = useMemo(
    () => computeStats(applicationsQuery.data, columnsQuery.data),
    [applicationsQuery.data, columnsQuery.data]
  );

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

function computeStats(
  apps: ApiApplication[] | undefined,
  columns: ApiColumn[] | undefined
): Stat[] {
  const placeholder: Stat[] = [
    { label: "Active", value: "—" },
    { label: "Applied this week", value: "—" },
    { label: "Awaiting response", value: "—" },
    { label: "Upcoming interviews", value: "—" },
  ];
  if (!apps || !columns) return placeholder;

  const now = Date.now();
  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
  const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;

  const findColumn = (name: string) =>
    columns.find(
      (c) => c.name.toLowerCase() === name.toLowerCase() && !c.isArchive
    );

  const appliedCol = findColumn("Applied");
  const phoneScreenCol = findColumn("Phone Screen");
  const interviewCol = findColumn("Interview");
  const rejectedCol = findColumn("Rejected");

  const excludedIds = new Set(
    [rejectedCol?.id, ...columns.filter((c) => c.isArchive).map((c) => c.id)].filter(
      Boolean
    ) as string[]
  );

  const totalActive = apps.filter((a) => !excludedIds.has(a.columnId)).length;

  const appliedThisWeek = appliedCol
    ? apps.filter(
        (a) => a.appliedAt && now - new Date(a.appliedAt).getTime() < ONE_WEEK
      ).length
    : 0;

  const awaitingResponse = appliedCol
    ? apps.filter((a) => {
        if (a.columnId !== appliedCol.id) return false;
        if (a.appliedAt)
          return now - new Date(a.appliedAt).getTime() > THREE_DAYS;
        return now - new Date(a.updatedAt).getTime() > THREE_DAYS;
      }).length
    : 0;

  const interviewIds = new Set(
    [phoneScreenCol?.id, interviewCol?.id].filter(Boolean) as string[]
  );
  const upcomingInterviews = apps.filter((a) => {
    if (!interviewIds.has(a.columnId)) return false;
    if (!a.nextActionDate) return false;
    const t = new Date(a.nextActionDate).getTime();
    return t >= now && t <= now + ONE_WEEK;
  }).length;

  return [
    { label: "Active", value: totalActive },
    { label: "Applied this week", value: appliedThisWeek },
    { label: "Awaiting response", value: awaitingResponse },
    { label: "Upcoming interviews", value: upcomingInterviews },
  ];
}
