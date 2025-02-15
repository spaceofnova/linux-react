// Components
import { Desktop } from "src/desktop";
import { Notifications } from "desktop/components/notification";
import Setup from "installer/index";
import { WindowManager } from "desktop/components/windows/WMDisplay";
import CorruptError from "shared/components/CorruptError";

// Functions
import { SetupAppsWatcher, useAppStore } from "shared/hooks/appstore";

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
import { useRegistryStore } from "shared/hooks/registry.ts";

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
    if (useRegistryStore.getState().getKey("/system/welcome") === true) {
      setTimeout(() => {
        useAppStore.getState().launchApp("com.system.welcome");
      }, 700);
    }
  };

  useRegistryStore.getState().loadRegistry();
  SetupAppsWatcher();
  showWelcomeApp();
};

functions();

const App = () => {
  if (setupLock === null) {
    return <Setup />;
  }

  if (!validateFileStructure()) {
    return <CorruptError />;
  }

  return (
    <ErrorBoundary errorComponent={MainErrorFault}>
      <LazyMotion features={domAnimation}>
        <Desktop />
        <WindowManager />
        <Taskbar />
        <Notifications />
      </LazyMotion>
    </ErrorBoundary>
  );
};
createRoot(document.getElementById("root")!).render(<App />);
