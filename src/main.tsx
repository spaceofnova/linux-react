import "@/index.css";
import { configure } from "@zenfs/core";
import { createRoot } from "react-dom/client";
import { IndexedDB } from "@zenfs/dom";

import { WindowManager } from "@/components/WMDisplay";
import { setupWindowEventHandlers } from "@/functions/dispatcher";
import { ThemeProvider } from "@/stores/themestore";
import Dock from "@/components/MagicDock";
import { Toaster } from "@/components/ui/sonner";
import { SetupAppsWatcher, useAppStore } from "@/stores/appstore";
import { LoadPrefrences, usePrefrencesStore } from "@/stores/prefrencesStore";
import Setup from "@/components/Setup";

await configure({
  mounts: {
    "/": IndexedDB,
  },
});

const setupLock = localStorage.getItem("setuplock");

const functions = () => {
  if (!setupLock) return;

  const showWelcomeApp = () => {
    const prefrences = usePrefrencesStore.getState().prefrences;
    if (
      prefrences.hidden?.showWelcomeApp === true ||
      prefrences.hidden?.showWelcomeApp === undefined
    ) {
      setTimeout(() => {
        useAppStore.getState().launchApp("com.system.welcome");
      }, 700);
    }
  };

  SetupAppsWatcher();
  setupWindowEventHandlers();
  LoadPrefrences();
  showWelcomeApp();
};

functions();

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <div>
      {setupLock === null ? (
        <Setup />
      ) : (
        <>
          <WindowManager />
          <Dock />
          <Toaster />
        </>
      )}
    </div>
  </ThemeProvider>
);
