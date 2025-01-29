import { Window } from "desktop/components/windows/Window";
import { usePrefrencesStore } from "shared/hooks/prefrencesStore";
import { useWindowStore } from "shared/hooks/windowStore";
import { AnimatePresence } from "motion/react";
import { useEffect, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export const WindowManager = () => {
  // Get all window data directly
  const windows = useWindowStore((state) => state.windows);
  const activeWindowId = useWindowStore((state) => state.activeWindowId);
  const { focusWindow, closeWindow } = useWindowStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const prefrences = usePrefrencesStore((state) => state.prefrences);
  const updatePrefrence = usePrefrencesStore((state) => state.updatePrefrence);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      // Only run if there's actually a window focused
      if (activeWindowId !== null && containerRef.current?.contains(e.target as Node) === false) {
        focusWindow(null);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [focusWindow, activeWindowId]);

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
