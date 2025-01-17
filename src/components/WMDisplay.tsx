import { Window } from "@/components/Window";
import { usePrefrencesStore } from "@/stores/prefrencesStore";
import { useWindowStore } from "@/stores/windowStore";
import { AnimatePresence } from "motion/react";
import { useEffect, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export const WindowManager = () => {
  const { windows, activeWindowId, focusWindow, closeWindow } =
    useWindowStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const prefrences = usePrefrencesStore((state) => state.prefrences);
  const updatePrefrence = usePrefrencesStore((state) => state.updatePrefrence);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current?.contains(e.target as Node) === false) {
        focusWindow(null);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [focusWindow]);

  useHotkeys("ctrl+q, command+q", (e) => {
    e.preventDefault();
    if (activeWindowId) closeWindow(activeWindowId);
  });

  useHotkeys("alt+shift+d", () => {
    updatePrefrence("developer.debugMode", !prefrences.developer?.debugMode);
  });

  return (
    <div ref={containerRef}>
      {prefrences.developer?.debugMode && (
        <div className="fixed top-0 left-0 z-0">
          <p>Debug Mode Enabled!</p>
          <pre>Window Count: {windows.length}</pre>
          <pre>{activeWindowId}</pre>
          <pre>
            {JSON.stringify(
              windows.find((w) => w.id === activeWindowId),
              null,
              2
            )}
          </pre>
        </div>
      )}
      <AnimatePresence>
        {windows.map((window) => (
          <Window
            key={window.id}
            {...window}
            isFocused={window.id === activeWindowId}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
