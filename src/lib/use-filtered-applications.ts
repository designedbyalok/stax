import { useMemo } from "react";
import { ApiApplication } from "./api-client";
import { useFilterStore, DateRange } from "./filter-store";

function dateCutoff(range: DateRange): number | null {
  if (range === "all") return null;
  const now = Date.now();
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  return now - days * 24 * 60 * 60 * 1000;
}

export function useFilteredApplications(apps: ApiApplication[] | undefined) {
  const query = useFilterStore((s) => s.query);
  const columnIds = useFilterStore((s) => s.columnIds);
  const source = useFilterStore((s) => s.source);
  const dateRange = useFilterStore((s) => s.dateRange);

  return useMemo(() => {
    if (!apps) return [];
    const q = query.trim().toLowerCase();
    const cutoff = dateCutoff(dateRange);

    return apps.filter((a) => {
      if (q) {
        const haystack = [
          a.companyName,
          a.roleTitle,
          a.notes ?? "",
          a.location ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (columnIds.size > 0 && !columnIds.has(a.columnId)) return false;
      if (source !== "all" && a.sourcePlatform !== source) return false;
      if (cutoff !== null) {
        if (!a.appliedAt) return false;
        if (Date.parse(a.appliedAt) < cutoff) return false;
      }
      return true;
    });
  }, [apps, query, columnIds, source, dateRange]);
}
