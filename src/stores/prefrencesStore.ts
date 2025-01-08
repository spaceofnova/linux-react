import { create } from "zustand";
import { fs } from "@zenfs/core";
import { PrefrenceValues } from "@/types/settings";

const CONFIG_PATH = "/home/user.json";
const DEFAULT_PREFRENCES: PrefrenceValues = {
  display: {
    screenZoom: "100%",
  },
  developer: {
    debugMode: false,
  },
  appearance: {
    userWallpaper: "/home/wallpaper.jpg",
  },
  hidden: {
    showWelcomeApp: true,
  },
};

const configFileStorage = {
  load: (): PrefrenceValues => {
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

  save: (preferences: PrefrenceValues) => {
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

type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}${"" extends P ? "" : "."}${P}`
    : never
  : never;

type Prev = [
  never,
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  ...0[],
];

type Paths<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends object
    ? {
        [K in keyof T]-?: K extends string | number
          ? `${K}` | Join<K, Paths<T[K], Prev[D]>>
          : never;
      }[keyof T]
    : "";

type NestedKeyOf<T> = Paths<T>;

type PathValue<T, P extends string> = P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? PathValue<T[Key], Rest>
    : unknown
  : P extends keyof T
    ? T[P]
    : unknown;

interface PrefrencesStoreType {
  prefrences: PrefrenceValues;
  setPrefrences: (prefrences: PrefrenceValues) => void;
  updatePrefrence: <P extends NestedKeyOf<PrefrenceValues>>(
    path: P,
    value: PathValue<PrefrenceValues, P>
  ) => void;
}

export const usePrefrencesStore = create<PrefrencesStoreType>()((set) => ({
  prefrences: DEFAULT_PREFRENCES,
  setPrefrences: (prefrences: PrefrenceValues) => {
    set({ prefrences });
    configFileStorage.save(prefrences);
  },
  updatePrefrence: <P extends NestedKeyOf<PrefrenceValues>>(
    path: P,
    value: PathValue<PrefrenceValues, P>
  ) => {
    set((state) => {
      const newPrefrences = { ...state.prefrences };
      const keys = path.split(".");
      let current = newPrefrences as Record<string, unknown>;

      // Navigate to the nested object
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in current)) {
          current[key] = {};
        }
        current = current[key] as Record<string, unknown>;
      }

      // Set the value
      const lastKey = keys[keys.length - 1];
      current[lastKey] = value;

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
