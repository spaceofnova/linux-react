import { Colors, ThemeStoreType } from "@/types/storeTypes";
import { create } from "zustand";

const defualtColors: Colors = {
  primary: "#ff0000",
};

export const useTheme = create<ThemeStoreType>((set) => ({
  theme: "ark-light",
  colors: defualtColors,
  setTheme: (theme) => set({ theme }),
  setColors: (colors) => set({ colors }),
}));
