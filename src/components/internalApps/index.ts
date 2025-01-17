import { AppType } from "@/types/storeTypes";
import { FilesApp } from "./files";
import { AppStore } from "./store";
import SettingsApp from "./settings";
import WelcomeApp from "./WelcomeApp";
import TerminalApp from "./terminal";

export const internalApps: AppType[] = [
  {
    id: "com.system.store",
    deepLink: "store",
    name: "App Store",
    version: "1.0",
    internal: true,
    windowOptions: {
      title: "App Store",
      ReactElement: AppStore,
    },
  },
  {
    id: "com.system.files",
    deepLink: "files",
    name: "Files",
    version: "1.0",
    internal: true,
    windowOptions: {
      title: "Files",
      ReactElement: FilesApp,
    },
  },
  {
    id: "com.system.settings",
    deepLink: "settings",
    name: "Settings",
    version: "1.0",
    internal: true,
    windowOptions: {
      title: "Settings",
      ReactElement: SettingsApp,
    },
  },
  {
    id: "com.system.welcome",
    name: "Welcome",
    version: "1.0",
    internal: true,
    windowOptions: {
      title: "Welcome",
      position: {
        x: window.innerWidth / 2 - 150,
        y: window.innerHeight / 2 - 200,
      },
      size: { width: 300, height: 400 },
      ReactElement: WelcomeApp,
      noResize: true,
      noControls: true,
    },
  },
  {
    id: "com.system.terminal",
    deepLink: "term",
    name: "Terminal",
    version: "1.0",
    internal: true,
    windowOptions: {
      title: "Terminal",
      ReactElement: TerminalApp,
      noControls: true,
    },
  },
];
