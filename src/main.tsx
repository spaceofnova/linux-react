// Components
import { Desktop } from "./components/Desktop";
import Dock from "@/components/MagicDock";
import { Notifications } from "@/components/NotificationDisplay";
import Setup from "@/components/Setup";
import { ThemeProvider } from "@/stores/themestore";
import { WindowManager } from "@/components/WMDisplay";

// Functions
import { setupWindowEventHandlers } from "@/functions/dispatcher";
import { SetupAppsWatcher, useAppStore } from "@/stores/appstore";
import { LoadPrefrences, usePrefrencesStore } from "@/stores/prefrencesStore";

// Types
import { configure } from "@zenfs/core";
import { IndexedDB } from "@zenfs/dom";
import { createRoot } from "react-dom/client";

// Other
import "@/index.css";

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
          <Desktop />
          <WindowManager />
          <Dock />
          <Notifications />
        </>
      )}
    </div>
  </ThemeProvider>
);
