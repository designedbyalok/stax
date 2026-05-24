"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, ChevronsUpDown, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { api, ApiColumn } from "@/lib/api-client";
import { CardDrawer } from "@/components/card-detail/CardDrawer";
import { useSelectedCard } from "@/components/kanban/selected-card-store";
import { useFilteredApplications } from "@/lib/use-filtered-applications";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandAvatar } from "@/components/ui/brand-avatar";
import { Pip } from "@/components/ui/pip";

// Map well-known column names to stage tint slugs (same source of
// truth as the kanban Column / StageSelector).
const STAGE_BY_NAME: Record<string, string> = {
  saved: "saved",
  applied: "applied",
  "phone screen": "phone",
  interview: "interview",
  "on-site": "interview",
  onsite: "interview",
  offer: "offer",
  rejected: "rejected",
  closed: "rejected",
};

type SortKey =
  | "company"
  | "role"
  | "status"
  | "location"
  | "salary"
  | "applied"
  | "next";
type SortDir = "asc" | "desc";

const HEADERS: { key: SortKey; label: string; className?: string }[] = [
  { key: "company", label: "Company", className: "w-[180px]" },
  { key: "role", label: "Role" },
  { key: "status", label: "Status", className: "w-[120px]" },
  { key: "location", label: "Location", className: "w-[140px]" },
  { key: "salary", label: "Salary", className: "w-[120px]" },
  { key: "applied", label: "Applied", className: "w-[100px]" },
  { key: "next", label: "Next action", className: "w-[180px]" },
];

export function ApplicationList() {
  const columnsQuery = useQuery({
    queryKey: ["columns"],
    queryFn: () => api.listColumns().then((r) => r.columns),
  });
  const appsQuery = useQuery({
    queryKey: ["applications"],
    queryFn: () => api.listApplications().then((r) => r.applications),
  });

  const selectedId = useSelectedCard((s) => s.selectedCardId);
  const setSelectedId = useSelectedCard((s) => s.select);

  const [sortKey, setSortKey] = useState<SortKey>("applied");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const columnsById = useMemo(() => {
    const map = new Map<string, ApiColumn>();
    for (const c of columnsQuery.data ?? []) map.set(c.id, c);
    return map;
  }, [columnsQuery.data]);

  const filteredApps = useFilteredApplications(appsQuery.data);

  const rows = useMemo(() => {
    const items = filteredApps.map((a) => {
      const column = columnsById.get(a.columnId);
      return {
        app: a,
        company: a.companyName,
        role: a.roleTitle,
        status: column?.name ?? "—",
        location: a.location ?? "",
        salary: a.salaryRange ?? "",
        applied: a.appliedAt ? new Date(a.appliedAt).getTime() : 0,
        appliedDisplay: a.appliedAt ? format(new Date(a.appliedAt), "MMM d") : "—",
        next: a.nextAction
          ? a.nextAction + (a.nextActionDate ? ` · ${format(new Date(a.nextActionDate), "MMM d")}` : "")
          : "—",
        nextSort: a.nextActionDate ? new Date(a.nextActionDate).getTime() : 0,
      };
    });

    items.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "company":
          cmp = a.company.localeCompare(b.company);
          break;
        case "role":
          cmp = a.role.localeCompare(b.role);
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
        case "location":
          cmp = a.location.localeCompare(b.location);
          break;
        case "salary":
          cmp = a.salary.localeCompare(b.salary);
          break;
        case "applied":
          cmp = a.applied - b.applied;
          break;
        case "next":
          cmp = a.nextSort - b.nextSort;
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return items;
  }, [filteredApps, columnsById, sortKey, sortDir]);

  const selectedCard =
    appsQuery.data?.find((a) => a.id === selectedId) ?? null;

  if (appsQuery.isLoading || columnsQuery.isLoading) {
    return (
      <div className="h-full overflow-auto">
        <table className="w-full text-[13px] border-separate border-spacing-0">
          <thead className="sticky top-0 z-10 bg-background">
            <tr>
              {HEADERS.map((h) => (
                <th key={h.key} className={cn("text-left text-[11px] font-medium text-muted-foreground tracking-wide px-3 py-2 border-b", h.className)}>
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i}>
                <td className="px-3 py-2.5 border-b"><Skeleton className="h-4 w-32" /></td>
                <td className="px-3 py-2.5 border-b"><Skeleton className="h-4 w-48" /></td>
                <td className="px-3 py-2.5 border-b"><Skeleton className="h-5 w-20" /></td>
                <td className="px-3 py-2.5 border-b"><Skeleton className="h-4 w-24" /></td>
                <td className="px-3 py-2.5 border-b"><Skeleton className="h-4 w-16" /></td>
                <td className="px-3 py-2.5 border-b"><Skeleton className="h-4 w-12" /></td>
                <td className="px-3 py-2.5 border-b"><Skeleton className="h-4 w-32" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
        No applications yet. Add one from the board.
      </div>
    );
  }

  return (
    <>
      <div className="h-full overflow-auto">
        <table className="w-full text-[13px] border-separate border-spacing-0">
          <thead className="sticky top-0 z-10 bg-background">
            <tr>
              {HEADERS.map((h) => {
                const active = sortKey === h.key;
                const Icon = active
                  ? sortDir === "asc"
                    ? ChevronUp
                    : ChevronDown
                  : ChevronsUpDown;
                return (
                  <th
                    key={h.key}
                    className={cn(
                      "text-left text-[11px] font-medium text-muted-foreground tracking-wide px-3 py-2 border-b cursor-pointer select-none",
                      h.className
                    )}
                    onClick={() => toggleSort(h.key)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {h.label}
                      <Icon
                        className={cn(
                          "h-3 w-3",
                          active ? "text-foreground" : "text-muted-foreground/50"
                        )}
                        strokeWidth={1.75}
                      />
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.app.id}
                onClick={() => setSelectedId(row.app.id)}
                className="hover:bg-muted/40 cursor-pointer"
              >
                <td className="px-3 py-2.5 border-b font-medium max-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <BrandAvatar
                      name={row.company}
                      src={row.app.companyLogoUrl}
                      tint={row.app.logoColor}
                      size={22}
                      className="rounded"
                    />
                    <span className="truncate">{row.company}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 border-b text-foreground max-w-0">
                  <div className="truncate">{row.role}</div>
                  {row.app.tldrHeadline && (
                    <div
                      className="flex items-center gap-1 mt-0.5 text-[11px] text-muted-foreground min-w-0"
                      title={row.app.tldrHeadline}
                    >
                      <Sparkles
                        className="h-2.5 w-2.5 shrink-0 text-violet-500"
                        strokeWidth={2}
                      />
                      <span className="truncate">{row.app.tldrHeadline}</span>
                    </div>
                  )}
                </td>
                <td className="px-3 py-2.5 border-b">
                  <span
                    data-stage={STAGE_BY_NAME[row.status.toLowerCase().trim()]}
                    className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[11px] bg-muted text-foreground"
                  >
                    <Pip
                      size={6}
                      color={
                        STAGE_BY_NAME[row.status.toLowerCase().trim()]
                          ? undefined
                          : columnsById.get(row.app.columnId)?.color ||
                            "hsl(var(--muted-foreground))"
                      }
                    />
                    {row.status}
                  </span>
                </td>
                <td className="px-3 py-2.5 border-b text-muted-foreground truncate max-w-0">
                  {row.location || "—"}
                </td>
                <td className="px-3 py-2.5 border-b text-muted-foreground truncate max-w-0">
                  {row.salary || "—"}
                </td>
                <td className="px-3 py-2.5 border-b text-muted-foreground tabular-nums">
                  {row.appliedDisplay}
                </td>
                <td className="px-3 py-2.5 border-b text-muted-foreground truncate max-w-0">
                  {row.next}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CardDrawer
        card={selectedCard}
        isOpen={!!selectedCard}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}
