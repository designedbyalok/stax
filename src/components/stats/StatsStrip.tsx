"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, ApiApplication, ApiColumn } from "@/lib/api-client";
import { StatCard } from "./StatCard";

// Derives all four stats + lightweight sparkline series from the
// shared ["applications"] + ["columns"] caches — no network call
// of its own. Sparklines use real per-day buckets where possible
// (Applied + Active), and reasonable approximations otherwise.

type StatModel = {
  label: string;
  value: number;
  pipColor: string;
  delta: React.ReactNode;
  sparkline: number[];
};

const PIP = {
  active: "hsl(220 9% 46%)",
  week: "hsl(217 91% 60%)",
  waiting: "hsl(32 95% 44%)",
  upcoming: "hsl(262 83% 58%)",
};

export function StatsStrip() {
  const applicationsQuery = useQuery({
    queryKey: ["applications"],
    queryFn: () => api.listApplications().then((r) => r.applications),
  });
  const columnsQuery = useQuery({
    queryKey: ["columns"],
    queryFn: () => api.listColumns().then((r) => r.columns),
  });

  const stats: StatModel[] = useMemo(
    () => computeStats(applicationsQuery.data, columnsQuery.data),
    [applicationsQuery.data, columnsQuery.data]
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
      {stats.map((s) => (
        <StatCard
          key={s.label}
          label={s.label}
          value={s.value}
          pipColor={s.pipColor}
          delta={s.delta}
          sparkline={s.sparkline}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Derivation
// ─────────────────────────────────────────────────────────────

function computeStats(
  apps: ApiApplication[] | undefined,
  columns: ApiColumn[] | undefined
): StatModel[] {
  const empty: StatModel[] = [
    { label: "Active", value: 0, pipColor: PIP.active, delta: " ", sparkline: [] },
    { label: "Applied this week", value: 0, pipColor: PIP.week, delta: " ", sparkline: [] },
    { label: "Awaiting response", value: 0, pipColor: PIP.waiting, delta: " ", sparkline: [] },
    { label: "Upcoming interviews", value: 0, pipColor: PIP.upcoming, delta: " ", sparkline: [] },
  ];
  if (!apps || !columns) return empty;

  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  const WEEK = 7 * DAY;
  const THREE_DAYS = 3 * DAY;

  const findCol = (name: string) =>
    columns.find((c) => c.name.toLowerCase() === name.toLowerCase() && !c.isArchive);

  const appliedCol = findCol("Applied");
  const phoneScreenCol = findCol("Phone Screen");
  const interviewCol = findCol("Interview");
  const rejectedCol = findCol("Rejected");

  const excludedIds = new Set(
    [rejectedCol?.id, ...columns.filter((c) => c.isArchive).map((c) => c.id)].filter(
      Boolean
    ) as string[]
  );

  // Active
  const activeApps = apps.filter((a) => !excludedIds.has(a.columnId));
  const totalActive = activeApps.length;

  // Active trend (14-day): count applications whose createdAt falls in
  // each day. Real-data signal, decorative but truthful.
  const activeSpark = bucketByDay(activeApps.map((a) => a.createdAt), 14);

  // Applied this week
  const appliedThisWeek = appliedCol
    ? apps.filter(
        (a) => a.appliedAt && now - new Date(a.appliedAt).getTime() < WEEK
      ).length
    : 0;
  const appliedSpark = bucketByDay(
    apps.map((a) => a.appliedAt).filter((x): x is string => !!x),
    14
  );
  const appliedLastWeek = appliedCol
    ? apps.filter((a) => {
        if (!a.appliedAt) return false;
        const t = new Date(a.appliedAt).getTime();
        return t < now - WEEK && t > now - 2 * WEEK;
      }).length
    : 0;
  const appliedDelta = appliedThisWeek - appliedLastWeek;

  // Awaiting response: in Applied column for 3+ days
  const awaitingApps = appliedCol
    ? apps.filter((a) => {
        if (a.columnId !== appliedCol.id) return false;
        if (a.appliedAt) return now - new Date(a.appliedAt).getTime() > THREE_DAYS;
        return now - new Date(a.updatedAt).getTime() > THREE_DAYS;
      })
    : [];
  const awaitingResponse = awaitingApps.length;
  const awaitingNudgeToday = awaitingApps.filter((a) => {
    const baseT = a.appliedAt
      ? new Date(a.appliedAt).getTime()
      : new Date(a.updatedAt).getTime();
    return now - baseT > 7 * DAY;
  }).length;

  // Upcoming interviews
  const interviewIds = new Set(
    [phoneScreenCol?.id, interviewCol?.id].filter(Boolean) as string[]
  );
  const upcomingInterviewApps = apps.filter((a) => {
    if (!interviewIds.has(a.columnId)) return false;
    if (!a.nextActionDate) return false;
    const t = new Date(a.nextActionDate).getTime();
    return t >= now && t <= now + WEEK;
  });
  const upcomingInterviews = upcomingInterviewApps.length;
  const nextInterview = upcomingInterviewApps
    .slice()
    .sort(
      (a, b) =>
        new Date(a.nextActionDate as string).getTime() -
        new Date(b.nextActionDate as string).getTime()
    )[0];

  return [
    {
      label: "Active",
      value: totalActive,
      pipColor: PIP.active,
      delta: <span>Across {columns.filter((c) => !c.isArchive && c.id !== rejectedCol?.id).length} stages</span>,
      sparkline: activeSpark,
    },
    {
      label: "Applied this week",
      value: appliedThisWeek,
      pipColor: PIP.week,
      delta:
        appliedDelta === 0 ? (
          <span>Same as last week</span>
        ) : appliedDelta > 0 ? (
          <span>
            <span className="text-emerald-600 font-medium">↑ {appliedDelta}</span> vs last week
          </span>
        ) : (
          <span>
            <span className="text-amber-700 font-medium">↓ {Math.abs(appliedDelta)}</span> vs last week
          </span>
        ),
      sparkline: appliedSpark,
    },
    {
      label: "Awaiting response",
      value: awaitingResponse,
      pipColor: PIP.waiting,
      delta:
        awaitingNudgeToday > 0 ? (
          <span>
            <b className="text-foreground font-medium">{awaitingNudgeToday}</b>{" "}
            {awaitingNudgeToday === 1 ? "needs" : "need"} a nudge today
          </span>
        ) : (
          <span>All recent — no nudges yet</span>
        ),
      sparkline: [],
    },
    {
      label: "Upcoming interviews",
      value: upcomingInterviews,
      pipColor: PIP.upcoming,
      delta: nextInterview ? (
        <span>
          Next · <b className="text-foreground font-medium">{nextInterview.companyName}</b>
        </span>
      ) : (
        <span>None scheduled</span>
      ),
      sparkline: [],
    },
  ];
}

// Returns a length-`days` array of counts: items per day in the
// `days`-day window ending today (oldest → newest).
function bucketByDay(isoDates: string[], days: number): number[] {
  const DAY = 24 * 60 * 60 * 1000;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const buckets = new Array(days).fill(0);
  for (const iso of isoDates) {
    const t = new Date(iso).getTime();
    const idx = days - 1 - Math.floor((todayStart.getTime() - t) / DAY);
    if (idx >= 0 && idx < days) buckets[idx]++;
  }
  return buckets;
}
