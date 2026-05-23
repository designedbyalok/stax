import { create } from "zustand";

export type DateRange = "all" | "7d" | "30d" | "90d";
export type SourceFilter = string | "all"; // SourcePlatform enum value or "all"

type Filters = {
  query: string;
  columnIds: Set<string>;
  source: SourceFilter;
  dateRange: DateRange;
};

type Store = Filters & {
  setQuery: (q: string) => void;
  toggleColumn: (id: string) => void;
  clearColumns: () => void;
  setSource: (s: SourceFilter) => void;
  setDateRange: (d: DateRange) => void;
  reset: () => void;
};

export const useFilterStore = create<Store>((set, get) => ({
  query: "",
  columnIds: new Set<string>(),
  source: "all",
  dateRange: "all",
  setQuery: (q) => set({ query: q }),
  toggleColumn: (id) => {
    const next = new Set(get().columnIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    set({ columnIds: next });
  },
  clearColumns: () => set({ columnIds: new Set() }),
  setSource: (s) => set({ source: s }),
  setDateRange: (d) => set({ dateRange: d }),
  reset: () =>
    set({
      query: "",
      columnIds: new Set(),
      source: "all",
      dateRange: "all",
    }),
}));

export function hasActiveFilters(s: Filters): boolean {
  return (
    !!s.query.trim() ||
    s.columnIds.size > 0 ||
    s.source !== "all" ||
    s.dateRange !== "all"
  );
}
