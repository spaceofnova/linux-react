import { create } from "zustand";
import { AppStoreType } from "@/types/storeTypes";

export const useAppStore = create<AppStoreType>()((set) => ({
  apps: [],
  setApps: (apps) => set({ apps }),
  addApp: (app) => set({ apps: [...useAppStore.getState().apps, app] }),
}));
