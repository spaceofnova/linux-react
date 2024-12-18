import { create } from "zustand";
import { AppStoreType, AppType } from "@/types/storeTypes";
import fs from "@zenfs/core";

const defualtApps: AppType[] = [
  {
    name: "Terminal",
    version: "1.0",
    path: "/data/apps/terminal.js",
  },
];
async function loadAndRunJsFile(filePath: string): Promise<unknown> {
  try {
    // Read the file content
    const scriptContent = fs.readFileSync(filePath, "utf-8");

    // Create a function from the script content
    const AsyncFunction = Object.getPrototypeOf(
      async function () {}
    ).constructor;
    const executedScript = new AsyncFunction("fs", scriptContent);

    // Execute the script, passing the filesystem as a parameter
    return await executedScript(fs);
  } catch (error) {
    console.error("Error loading or executing script:", error);
    throw error;
  }
}
export const useAppStore = create<AppStoreType>()((set) => ({
  apps: defualtApps,
  launchApp: (appname) => {
    const app = useAppStore.getState().apps.find((app) => app.name === appname);
    if (app) loadAndRunJsFile(app.path);
  },
  setApps: (apps) => set({ apps }),
  addApp: (app) => set({ apps: [...useAppStore.getState().apps, app] }),
}));
