import { create } from "zustand";

type GlobePov = { lat: number; lng: number; altitude: number };

type GlobeStore = {
  pov: GlobePov | null;
  setPov: (pov: GlobePov) => void;
};

export const useGlobeStore = create<GlobeStore>((set) => ({
  pov: null,
  setPov: (pov) => set({ pov }),
}));
