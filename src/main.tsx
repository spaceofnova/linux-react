// Components
import { Desktop } from "./components/Desktop";
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
import { ErrorBoundary } from "./components/ErrorBoundary";
import { MainErrorFault } from "./components/bigError";

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
  LoadPrefrences();
  SetupAppsWatcher();
  setupWindowEventHandlers();
  showWelcomeApp();
};

functions();

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <div>
      {setupLock === null ? (
        <Setup />
      ) : (
        <ErrorBoundary errorComponent={MainErrorFault}>
          <Desktop />
          <WindowManager />
          <Notifications />
        </ErrorBoundary>
      )}
    </div>
  </ThemeProvider>
);