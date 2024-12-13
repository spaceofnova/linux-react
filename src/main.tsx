import "./index.css";
import { access, constants, configure, mkdirSync } from "@zenfs/core";

import { createRoot } from "react-dom/client";
import { IndexedDB } from "@zenfs/dom";

import { WindowManager } from "@/components/WMDisplay";
import TEMP__StyleEditor from "@/components/TEMP__StyleEditor";
import { setupWindowEventHandlers } from "./functions/dispatcher";
import { ThemeProvider } from "./stores/themestore";

await configure({
  mounts: {
    "/data": IndexedDB,
  },
});

const setup = () => {
  const dirs = ["/data/themes", "/data/apps"];
  dirs.forEach((dir) => {
    try {
      access(dir, constants.F_OK, (err) => {
        if (err) {
          mkdirSync(dir);
        }
      });
    } catch (error) {
      console.error(`Failed to create directory ${dir}:`, error);
    }
  });
};

setup();
setupWindowEventHandlers();

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <TEMP__StyleEditor />
    <WindowManager />
  </ThemeProvider>
);
