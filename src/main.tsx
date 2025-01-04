import "@/index.css";
import { configure } from "@zenfs/core";
import { createRoot } from "react-dom/client";
import { IndexedDB } from "@zenfs/dom";

import { WindowManager } from "@/components/WMDisplay";
import { setupWindowEventHandlers } from "@/functions/dispatcher";
import { ThemeProvider } from "@/stores/themestore";
import Dock from "@/components/MagicDock";
import { Toaster } from "@/components/ui/sonner";
import { SetupAppsWatcher } from "@/stores/appstore";
import { LoadPrefrences, usePrefrencesStore } from "@/stores/prefrencesStore";
import { useWindowStore } from "@/stores/windowStore";
import WelcomeApp from "@/components/internalApps/WelcomeApp";
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
    if (prefrences.showWelcomeApp) {
      useWindowStore.getState().createWindow({
        id: "com.app.welcome",
        title: "Welcome",
        position: {
          x: window.innerWidth / 2 - 150,
          y: window.innerHeight / 2 - 200,
        },
        size: { width: 300, height: 400 },
        ReactElement: WelcomeApp,
        noResize: true,
      });
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
