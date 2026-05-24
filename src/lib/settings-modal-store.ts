"use client";

import { create } from "zustand";

export type SettingsSection =
  | "account"
  | "appearance"
  | "pipeline"
  | "notifications"
  | "integrations"
  | "trash";

interface SettingsModalState {
  open: boolean;
  section: SettingsSection;
  openModal: (section?: SettingsSection) => void;
  setSection: (section: SettingsSection) => void;
  close: () => void;
}

// Global settings-modal store. Lives at app layout level so any
// page can pop the modal without a route change.
export const useSettingsModal = create<SettingsModalState>((set) => ({
  open: false,
  section: "account",
  openModal: (section) =>
    set({ open: true, ...(section ? { section } : {}) }),
  setSection: (section) => set({ section }),
  close: () => set({ open: false }),
}));
