import { jsx as _jsx } from "react/jsx-runtime";
import "./index.css";
import { configure } from "@zenfs/core";
import { createRoot } from "react-dom/client";
import { IndexedDB } from "@zenfs/dom";
import { WindowManager } from "@/components/WMDisplay";
await configure({
    mounts: {
        "/data": IndexedDB,
    },
});
createRoot(document.getElementById("root")).render(_jsx(WindowManager, {}));
