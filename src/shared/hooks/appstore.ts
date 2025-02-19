import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { AppType } from "shared/types/storeTypes";
import fs from "@zenfs/core";
import { toast } from "sonner";
import { useWindowStore } from "./windowStore";
import { internalApps } from "apps/index";
import { APPS_DIRECTORY } from "shared/constants";
// Helper function to combine internal and local apps
const getApps = (localApps: AppType[], internalApps: AppType[]): AppType[] => {
  return [...internalApps, ...localApps];
};

type AppStoreState = {
  localApps: AppType[];
  internalApps: AppType[];
  enabledInternalApps: string[];
};

type AppStoreActions = {
  setLocalApps: (apps: AppType[]) => void;
  addLocalApp: (app: AppType) => boolean;
  enableInternalApp: (appID: string) => void;
  disableInternalApp: (appID: string) => void;
  removeLocalApp: (appID: string) => AppType[];
  launchApp: (appID: string) => Promise<void>;
  getApps: () => AppType[];
  launchDeepLink: (deepLink: string) => Promise<void>;
};

export const useAppStore = create<AppStoreState & AppStoreActions>()(
  persist(
    (set, get) => ({
      localApps: [],
      internalApps: [...internalApps],
      enabledInternalApps: [
        "com.system.terminal",
        "com.system.store",
        "com.system.files",
        "com.system.settings",
        "com.system.welcome",
        "com.system.processes",
      ],

      // Actions
      getApps: () => {
        const enabledApps = get()
          .enabledInternalApps.map((id) =>
            get().internalApps.find((app) => app.id === id),
          )
          .filter((app): app is AppType => app !== undefined);
        return getApps(get().localApps, enabledApps);
      },

      enableInternalApp: (appID: string) => {
        set({ enabledInternalApps: [...get().enabledInternalApps, appID] });
      },

      disableInternalApp: (appID: string) => {
        set({
          enabledInternalApps: get().enabledInternalApps.filter(
            (id) => id !== appID,
          ),
        });
      },

      setLocalApps: (apps) => set({ localApps: apps }),

      addLocalApp: (app): boolean => {
        const exists = get().localApps.some((a) => a.id === app.id);
        if (!exists) {
          set({ localApps: [...get().localApps, app] });
        }
        return exists;
      },

      removeLocalApp: (appID): AppType[] => {
        const newApps = get().localApps.filter((app) => app.id !== appID);
        fs.rmSync(`${APPS_DIRECTORY}/${appID}`, {
          recursive: true,
          force: true,
        });
        set({ localApps: newApps });
        return newApps;
      },
      launchDeepLink: async (deepLink): Promise<void> => {
        const app = get()
          .getApps()
          .find((app) => app.deepLink === deepLink.split(":")[0]);
        if (!app) {
          toast.error(`App ${deepLink} not found`, {
            dismissible: true,
            action: {
              label: "Close",
              onClick: () => toast.dismiss(),
            },
          });
          return;
        }
        const windowOptions = app.windowOptions || {
          title: app.name,
          id: app.id,
          position: { x: 100, y: 100 },
          size: { width: 600, height: 450 },
          filePath: "index.html",
        };

        const window = useWindowStore
          .getState()
          .windows.find((window) => window.id === app.id);

        if (window && window.id) {
          useWindowStore.getState().updateWindow(window.id, {
            deepLink: deepLink.split(":")[1],
          });
          useWindowStore.getState().focusWindow(window.id);
          return;
        }

        try {
          useWindowStore.getState().createWindow({
            id: app.id,
            deepLink: deepLink.split(":")[1],
            ...windowOptions,
          });
        } catch (error) {
          console.error(`Failed to launch ${app.name}:`, error);
        }
      },

      launchApp: async (appID) => {
        const app = get()
          .getApps()
          .find((app) => app.id === appID);

        if (!app) {
          toast.error(`App ${appID} not found`, {
            dismissible: true,
            action: {
              label: "Close",
              onClick: () => toast.dismiss(),
            },
          });
          return;
        }

        const windowOptions = app.windowOptions || {
          title: app.name,
          id: app.id,
          position: { x: 100, y: 100 },
          size: { width: 600, height: 450 },
          filePath: "index.html",
        };

        try {
          useWindowStore.getState().createWindow({
            id: app.id,
            ...windowOptions,
          });
        } catch (error) {
          console.error(`Failed to launch ${app.name}:`, error);
        }
      },
    }),
    {
      name: "apps-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        localApps: state.localApps,
        enabledInternalApps: state.enabledInternalApps,
      }), // Only persist neccesary data
    },
  ),
);

// App registration and watching functions
export const registerApps = async () => {
  const files = fs.readdirSync(APPS_DIRECTORY);

  for (const dir of files) {
    const appPath = `${APPS_DIRECTORY}/${dir}`;
    const metadataPath = `${appPath}/metadata.json`;
    const indexPath = `${appPath}/index.html`;

    if (fs.existsSync(metadataPath) && fs.existsSync(indexPath)) {
      try {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));

        if (
          metadata.id &&
          metadata.name &&
          metadata.version &&
          metadata.description
        ) {
          const exists = useAppStore
            .getState()
            .getApps()
            .find((app) => app.id === metadata.id);

          if (!exists) {
            useAppStore.getState().addLocalApp({
              ...metadata,
              folderPath: appPath,
            });
            console.log(`Registered app: ${metadata.name}`);
          }
        } else {
          console.error(
            `Invalid metadata.json for app ${dir}: missing required fields`,
          );
        }
      } catch (e) {
        console.error(`Failed to register app ${dir}:`, e);
      }
    }
  }
};

export const SetupAppsWatcher = () => {
  checkAppIntegrity();

  fs.watch(APPS_DIRECTORY, (event) => {
    if (event === "change") {
      checkAppIntegrity();
      registerApps();
    }
  });
};

export const checkAppIntegrity = () => {
  const files = fs.readdirSync(APPS_DIRECTORY);

  const localApps = useAppStore.getState().localApps;

  // Remove invalid app directories
  files.forEach((file) => {
    const appPath = `${APPS_DIRECTORY}/${file}`;
    const indexPath = `${appPath}/index.html`;
    const metadataPath = `${appPath}/metadata.json`;

    try {
      if (!fs.existsSync(indexPath) || !fs.existsSync(metadataPath)) {
        fs.rmSync(appPath, { recursive: true, force: true });
      }
    } catch (e) {
      console.error(`Failed to check app integrity for ${file}:`, e);
    }
  });

  // Remove apps from store that don't exist on disk
  localApps.forEach((app) => {
    const appPath = `${APPS_DIRECTORY}/${app.id}`;
    const indexPath = `${appPath}/index.html`;

    if (!fs.existsSync(appPath) || !fs.existsSync(indexPath)) {
      useAppStore.getState().removeLocalApp(app.id);
    }
  });
  registerApps();
};
