"use client";

import { create } from "zustand";

interface ProfileModalState {
  open: boolean;
  openModal: () => void;
  close: () => void;
}

// Global profile-modal store, mirroring the settings-modal store. Lives at app
// layout level so the sidebar avatar (or anywhere) can pop it without routing.
export const useProfileModal = create<ProfileModalState>((set) => ({
  open: false,
  openModal: () => set({ open: true }),
  close: () => set({ open: false }),
}));
