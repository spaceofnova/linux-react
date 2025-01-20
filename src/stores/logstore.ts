import { create } from "zustand";

interface LogStore {
  logs: string[];
  log: (log: string) => void;
}

export const useLogStore = create<LogStore>()((set) => ({
  logs: [],
  log: (log: string) => set((state) => ({ logs: [...state.logs, log] })),
})); 