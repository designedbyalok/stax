"use client";

import { useQuery } from "@tanstack/react-query";
import { Search, X, ChevronDown } from "@/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useFilterStore,
  hasActiveFilters,
  DateRange,
  SourceFilter,
} from "@/lib/filter-store";
import { api } from "@/lib/api-client";

const DATE_LABEL: Record<DateRange, string> = {
  all: "Any date",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
};

const SOURCE_OPTIONS: { value: SourceFilter; label: string }[] = [
  { value: "all", label: "All sources" },
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "GREENHOUSE", label: "Greenhouse" },
  { value: "LEVER", label: "Lever" },
  { value: "WORKDAY", label: "Workday" },
  { value: "INDEED", label: "Indeed" },
  { value: "OTHER", label: "Web" },
  { value: "MANUAL", label: "Manual" },
];

export function SearchFilters() {
  const columnsQuery = useQuery({
    queryKey: ["columns"],
    queryFn: () => api.listColumns().then((r) => r.columns),
  });
  const visibleColumns = (columnsQuery.data ?? []).filter((c) => !c.isArchive);

  const query = useFilterStore((s) => s.query);
  const setQuery = useFilterStore((s) => s.setQuery);
  const columnIds = useFilterStore((s) => s.columnIds);
  const toggleColumn = useFilterStore((s) => s.toggleColumn);
  const clearColumns = useFilterStore((s) => s.clearColumns);
  const source = useFilterStore((s) => s.source);
  const setSource = useFilterStore((s) => s.setSource);
  const dateRange = useFilterStore((s) => s.dateRange);
  const setDateRange = useFilterStore((s) => s.setDateRange);
  const reset = useFilterStore((s) => s.reset);

  const filters = useFilterStore.getState();
  const active = hasActiveFilters(filters);

  const sourceLabel = SOURCE_OPTIONS.find((o) => o.value === source)?.label ?? "All sources";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search company, role, notes…"
            className="pl-8"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm" className="gap-1.5">
                <span>
                  Status
                  {columnIds.size > 0 && (
                    <span className="ml-1 text-muted-foreground">
                      · {columnIds.size}
                    </span>
                  )}
                </span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-48">
            {/* DropdownMenuLabel is Base UI's Menu.GroupLabel under the hood
                — it requires a Menu.Group ancestor or it throws #31 in prod. */}
            <DropdownMenuGroup>
              <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {visibleColumns.map((c) => (
                <DropdownMenuCheckboxItem
                  key={c.id}
                  checked={columnIds.has(c.id)}
                  onCheckedChange={() => toggleColumn(c.id)}
                >
                  {c.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuGroup>
            {columnIds.size > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={clearColumns}>
                  Clear
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm" className="gap-1.5">
                <span>{DATE_LABEL[dateRange]}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Applied</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.keys(DATE_LABEL) as DateRange[]).map((d) => (
                <DropdownMenuItem
                  key={d}
                  onClick={() => setDateRange(d)}
                >
                  {DATE_LABEL[d]}
                  {dateRange === d && (
                    <span className="ml-auto text-muted-foreground">✓</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm" className="gap-1.5">
                <span>{sourceLabel}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Source</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {SOURCE_OPTIONS.map((o) => (
                <DropdownMenuItem key={o.value} onClick={() => setSource(o.value)}>
                  {o.label}
                  {source === o.value && (
                    <span className="ml-auto text-muted-foreground">✓</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {active && (
        <div className="flex flex-wrap items-center gap-1.5">
          {query.trim() && (
            <Chip onRemove={() => setQuery("")}>“{query.trim()}”</Chip>
          )}
          {[...columnIds].map((id) => {
            const col = visibleColumns.find((c) => c.id === id);
            if (!col) return null;
            return (
              <Chip key={id} onRemove={() => toggleColumn(id)}>
                {col.name}
              </Chip>
            );
          })}
          {dateRange !== "all" && (
            <Chip onRemove={() => setDateRange("all")}>
              {DATE_LABEL[dateRange]}
            </Chip>
          )}
          {source !== "all" && (
            <Chip onRemove={() => setSource("all")}>{sourceLabel}</Chip>
          )}
          <Button
            variant="ghost"
            size="xs"
            onClick={reset}
            className="text-muted-foreground"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}

function Chip({
  children,
  onRemove,
}: {
  children: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 h-6 pl-2 pr-1 rounded-md border bg-muted/40 text-[12px]">
      {children}
      <button
        type="button"
        onClick={onRemove}
        className="inline-flex items-center justify-center w-4 h-4 rounded text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06]"
        aria-label="Remove filter"
      >
        <X className="h-3 w-3" strokeWidth={1.75} />
      </button>
    </span>
  );
}
