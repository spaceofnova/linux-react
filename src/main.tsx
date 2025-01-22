// Components
import { Desktop } from "desktop/index";
import { Notifications } from "shared/components/NotificationDisplay";
import Setup from "installer/index";
import { ThemeProvider } from "shared/hooks/themestore";
import { WindowManager } from "desktop/components/windows/WMDisplay";

// Functions
import { setupWindowEventHandlers } from "shared/utils/dispatcher";
import { SetupAppsWatcher, useAppStore } from "shared/hooks/appstore";
import { LoadPrefrences, usePrefrencesStore } from "shared/hooks/prefrencesStore";

// Types
import { configure } from "@zenfs/core";
import { IndexedDB } from "@zenfs/dom";
import { createRoot } from "react-dom/client";

// Other
import "./index.css";
import { ErrorBoundary } from "shared/components/ErrorBoundary";
import { MainErrorFault } from "shared/components/bigError";

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
  // setupWindowEventHandlers();
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