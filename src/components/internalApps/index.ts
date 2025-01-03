import { AppType } from "@/types/storeTypes";
import { FilesApp } from "./files";
import { AppStore } from "./store";

export const internalApps: AppType[] = [
  {
    id: "com.system.store",
    name: "App Store",
    version: "1.0",
    folderPath: "appstore",
    internal: true,
    windowOptions: {
      title: "App Store",
      ReactElement: AppStore,
    },
  },
  {
    id: "com.system.files",
    name: "Files",
    version: "1.0",
    folderPath: "files",
    internal: true,
    windowOptions: {
      title: "Files",
      ReactElement: FilesApp,
    },
  },
];

// {
//   id: "com.system.settings",
//   title: "Settings",

//   reactElement: <SettingsApp id={"com.system.settings"} />,
// },
// {
//   id: "com.system.about",
//   title: "About",
//   reactElement: <AboutApp id={"com.system.about"} />,
// },
// {
//   id: "com.system.welcome",
//   title: "Welcome",
//   reactElement: <WelcomeApp id={"com.system.welcome"} />,
// },
