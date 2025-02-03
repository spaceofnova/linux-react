// Components
import { Desktop } from "desktop/index";
import { Notifications } from "desktop/components/notification";
import Setup from "installer/index";
import { ThemeProvider } from "shared/hooks/themestore";
import { WindowManager } from "desktop/components/windows/WMDisplay";
import CorruptError from "shared/components/CorruptError";

// Functions
import { SetupAppsWatcher, useAppStore } from "shared/hooks/appstore";
import {
  LoadPrefrences,
  usePrefrencesStore,
} from "shared/hooks/prefrencesStore";

// Types
import { configure } from "@zenfs/core";
import { IndexedDB } from "@zenfs/dom";
import { createRoot } from "react-dom/client";

// Other
import "./index.css";
import { ErrorBoundary } from "shared/components/ErrorBoundary";
import { MainErrorFault } from "shared/components/bigError";
import { validateFileStructure } from "./shared/utils/corruption";
import { LazyMotion, domAnimation } from "motion/react";
import Taskbar from "desktop/components/taskbar/taskbar";

await configure({
  mounts: {
    "/": IndexedDB,
  },
});

const setupLock = localStorage.getItem("setuplock");

const functions = () => {
  if (!validateFileStructure()) {
    return;
  }
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
  showWelcomeApp();
};

functions();

const App = () => {
  return (
    <ThemeProvider>
      {setupLock === null ? (
        <Setup />
      ) : validateFileStructure() ? (
        <ErrorBoundary errorComponent={MainErrorFault}>
          <LazyMotion features={domAnimation}>
            <Desktop />
            <WindowManager />
            <Taskbar />
            <Notifications />
          </LazyMotion>
        </ErrorBoundary>
      ) : (
        <CorruptError />
      )}
    </ThemeProvider>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
