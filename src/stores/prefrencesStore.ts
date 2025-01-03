import { create } from "zustand";
import { fs } from "@zenfs/core";

interface Prefrences {
  debugMode?: boolean;
  showWelcomeApp?: boolean;
  userWallpaper?: string;
}

const CONFIG_PATH = "/home/user.json";
const DEFAULT_PREFRENCES: Prefrences = {
  showWelcomeApp: true,
  userWallpaper: "/home/wallpaper.jpg",
};

const configFileStorage = {
  load: (): Prefrences => {
    try {
      const exists = fs.existsSync(CONFIG_PATH);
      if (!exists) {
        return DEFAULT_PREFRENCES;
      }
      const data = fs.readFileSync(CONFIG_PATH, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Failed to load preferences:", error);
      return DEFAULT_PREFRENCES;
    }
  },

  save: (preferences: Prefrences) => {
    try {
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(preferences, null, 2));
    } catch (error) {
      console.error("Failed to save preferences:", error);
    }
  },

  watch: () => {
    let isUpdating = false;
    fs.watch(CONFIG_PATH, (eventType) => {
      // Prevent multiple rapid updates and infinite loops
      if (isUpdating || eventType !== "change") return;

      isUpdating = true;
      try {
        const newPreferences = configFileStorage.load();
        const currentPreferences = usePrefrencesStore.getState().prefrences;

        // Only update if the content actually changed
        if (
          JSON.stringify(currentPreferences) !== JSON.stringify(newPreferences)
        ) {
          usePrefrencesStore.getState().setPrefrences(newPreferences);
        }
      } catch (error) {
        console.error("Error watching preferences file:", error);
      } finally {
        isUpdating = false;
      }
    });
  },

  init: () => {
    // Create config file if it doesn't exist
    if (!fs.existsSync(CONFIG_PATH)) {
      configFileStorage.save(DEFAULT_PREFRENCES);
    }
    // Start watching for changes
    configFileStorage.watch();
  },
};

interface PrefrencesStoreType {
  prefrences: Prefrences;
  setPrefrences: (prefrences: Prefrences) => void;
  updatePrefrence: (
    key: keyof Prefrences,
    value: Prefrences[keyof Prefrences]
  ) => void;
}

export const usePrefrencesStore = create<PrefrencesStoreType>()((set) => ({
  prefrences: {
    showWelcomeApp: true,
  },
  setPrefrences: (prefrences: Prefrences) => {
    set({ prefrences });
    configFileStorage.save(prefrences);
  },
  updatePrefrence: (
    key: keyof Prefrences,
    value: Prefrences[keyof Prefrences]
  ) => {
    set((state) => {
      const newPrefrences = { ...state.prefrences, [key]: value };
      configFileStorage.save(newPrefrences);
      return { prefrences: newPrefrences };
    });
  },
}));

// Modified LoadPrefrences to also initialize file watching
export const LoadPrefrences = () => {
  configFileStorage.init();
  const loadedPreferences = configFileStorage.load();
  usePrefrencesStore.getState().setPrefrences(loadedPreferences);
};
