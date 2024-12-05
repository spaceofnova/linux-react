import "./index.css";
import { access, constants, configure, mkdirSync } from "@zenfs/core";

import { createRoot } from "react-dom/client";
import { IndexedDB } from "@zenfs/dom";

import { WindowManager } from "@/components/WMDisplay";

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

createRoot(document.getElementById("root")!).render(<WindowManager />);
