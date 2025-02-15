import { create } from "zustand";
import fs from "@zenfs/core";

const REGISTRY_FILE = "registry.db";

// 🏗️ Default Key-Value Pairs (Editable)
const DEFAULT_REGISTRY = {
  "/system/welcome": true,
  "/system/blur": true,
  "/user/wallpaper": "/system/assets/wallpaper.jpg",
};

interface RegistryState {
  keys: Record<string, any>;
  loadRegistry: () => void;
  getKey: (key: string) => any;
  setKey: (key: string, value: any) => void;
  deleteKey: (key: string) => void;
  exportRegistry: (cb: (data: string) => void) => void;
  importRegistry: (jsonString: string) => void;
}

export const useRegistryStore = create<RegistryState>((set, get) => ({
  keys: {},

  loadRegistry: () => {
    fs.readFile(REGISTRY_FILE, (err, data) => {
      if (err) {
        console.warn("Registry not found, initializing with defaults.");
        fs.writeFile(REGISTRY_FILE, JSON.stringify(DEFAULT_REGISTRY), () => {});
        set({ keys: DEFAULT_REGISTRY });
        return;
      }
      try {
        if (!data || data.length === 0 || !data.toString()) {
          // 🛠️ Check for empty string
          console.warn("Registry file is empty, initializing with defaults.");
          fs.writeFile(
            REGISTRY_FILE,
            JSON.stringify(DEFAULT_REGISTRY),
            () => {},
          );
          set({ keys: DEFAULT_REGISTRY });
          return;
        }
        const parsedData = JSON.parse(data.toString());
        set({ keys: { ...DEFAULT_REGISTRY, ...parsedData } }); // 🛠️ Merge defaults
      } catch (error) {
        console.error("Registry file corrupted. Resetting...", error);
        fs.writeFile(REGISTRY_FILE, JSON.stringify(DEFAULT_REGISTRY), () => {});
        set({ keys: DEFAULT_REGISTRY });
      }
    });
  },

  getKey: (key) => get().keys[key] ?? undefined,

  setKey: (key, value) => {
    const newData = { ...get().keys, [key]: value };
    fs.writeFile(REGISTRY_FILE, JSON.stringify(newData), (err) => {
      if (err) return console.error("Failed to write registry:", err);
      set({ keys: newData });
    });
  },

  deleteKey: (key) => {
    const newData = { ...get().keys };
    delete newData[key];
    fs.writeFile(REGISTRY_FILE, JSON.stringify(newData), (err) => {
      if (err) return console.error("Failed to write registry:", err);
      set({ keys: newData });
    });
  },

  exportRegistry: (cb) => {
    fs.readFile(REGISTRY_FILE, (err, data) => {
      if (err) {
        console.error("Failed to export registry:", err);
        return cb("{}");
      }
      if (!data || data.length === 0) {
        console.warn("Registry file is empty, initializing empty.");
        fs.writeFile(REGISTRY_FILE, JSON.stringify({}), () => {});
        return cb("{}");
      }
      cb(data.toString());
    });
  },

  importRegistry: (jsonString) => {
    try {
      const parsedData = JSON.parse(jsonString);
      fs.writeFile(REGISTRY_FILE, JSON.stringify(parsedData), (err) => {
        if (err) return console.error("Failed to import registry:", err);
        set({ keys: { ...DEFAULT_REGISTRY, ...parsedData } }); // 🛠️ Merge with defaults
      });
    } catch (error) {
      console.error("Invalid JSON format, import failed.", error);
    }
  },
}));
