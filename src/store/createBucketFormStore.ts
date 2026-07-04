import { create } from "zustand";

import type { NormalizedPlace } from "@/components/bucket/PlacesAutocomplete";

export type Visibility = "PRIVATE" | "FRIENDS" | "PUBLIC";

type CreateBucketFormStore = {
  title: string;
  description: string;
  place: NormalizedPlace | null;
  placeQuery: string;
  deadlineAt: string;
  difficulty: number;
  excitement: number;
  visibility: Visibility;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setPlace: (place: NormalizedPlace | null) => void;
  setPlaceQuery: (placeQuery: string) => void;
  setDeadlineAt: (deadlineAt: string) => void;
  setDifficulty: (difficulty: number) => void;
  setExcitement: (excitement: number) => void;
  setVisibility: (visibility: Visibility) => void;
  reset: () => void;
};

const initialState = {
  title: "",
  description: "",
  place: null,
  placeQuery: "",
  deadlineAt: "",
  difficulty: 3,
  excitement: 3,
  visibility: "PUBLIC" as Visibility,
};

export const useCreateBucketFormStore = create<CreateBucketFormStore>((set) => ({
  ...initialState,
  setTitle: (title) => set({ title }),
  setDescription: (description) => set({ description }),
  setPlace: (place) => set({ place }),
  setPlaceQuery: (placeQuery) => set({ placeQuery }),
  setDeadlineAt: (deadlineAt) => set({ deadlineAt }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setExcitement: (excitement) => set({ excitement }),
  setVisibility: (visibility) => set({ visibility }),
  reset: () => set(initialState),
}));
