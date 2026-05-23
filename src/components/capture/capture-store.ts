import { create } from "zustand";
import type { ParseResponse } from "@/lib/api-client";

type ParsedFields = ParseResponse["fields"];
type Duplicate = NonNullable<ParseResponse["duplicate"]>;

export type CaptureState =
  | { kind: "idle" }
  | { kind: "parsing"; url: string; showSkeleton: boolean }
  | {
      kind: "preview";
      url: string;
      fields: ParsedFields;
      uncertainFields: string[];
      source: string;
    }
  | { kind: "manual"; prefill: { companyName?: string; originalUrl?: string }; error?: string }
  | {
      kind: "duplicate";
      duplicate: Duplicate;
      parseResult: ParseResponse;
    };

type Store = {
  state: CaptureState;
  start: (url: string) => void;
  showSkeleton: () => void;
  resolve: (result: ParseResponse) => void;
  cancel: () => void;
  toManual: (
    prefill?: { companyName?: string; originalUrl?: string },
    error?: string
  ) => void;
  saveAsNewFromDuplicate: () => void;
};

export const useCaptureStore = create<Store>((set, get) => ({
  state: { kind: "idle" },
  start: (url) =>
    set({ state: { kind: "parsing", url, showSkeleton: false } }),
  showSkeleton: () => {
    const s = get().state;
    if (s.kind === "parsing") set({ state: { ...s, showSkeleton: true } });
  },
  resolve: (result) => {
    if (result.duplicate) {
      set({ state: { kind: "duplicate", duplicate: result.duplicate, parseResult: result } });
      return;
    }
    if (!result.success) {
      set({
        state: {
          kind: "manual",
          prefill: {
            companyName: result.fields.companyName,
            originalUrl: result.originalUrl,
          },
          error: result.error,
        },
      });
      return;
    }
    set({
      state: {
        kind: "preview",
        url: result.originalUrl,
        fields: result.fields,
        uncertainFields: result.uncertainFields,
        source: result.source,
      },
    });
  },
  cancel: () => set({ state: { kind: "idle" } }),
  toManual: (prefill = {}, error) =>
    set({ state: { kind: "manual", prefill, error } }),
  saveAsNewFromDuplicate: () => {
    const s = get().state;
    if (s.kind !== "duplicate") return;
    const r = s.parseResult;
    if (!r.success) {
      set({
        state: {
          kind: "manual",
          prefill: {
            companyName: r.fields.companyName,
            originalUrl: r.originalUrl,
          },
        },
      });
      return;
    }
    set({
      state: {
        kind: "preview",
        url: r.originalUrl,
        fields: r.fields,
        uncertainFields: r.uncertainFields,
        source: r.source,
      },
    });
  },
}));
