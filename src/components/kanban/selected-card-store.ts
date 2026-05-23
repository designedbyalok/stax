import { create } from "zustand";

type Store = {
  selectedCardId: string | null;
  select: (id: string | null) => void;
};

export const useSelectedCard = create<Store>((set) => ({
  selectedCardId: null,
  select: (id) => set({ selectedCardId: id }),
}));
