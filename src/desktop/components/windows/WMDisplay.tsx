import { Window } from "desktop/components/windows/Window";
import { useWindowStore } from "shared/hooks/windowStore";
import { AnimatePresence } from "motion/react";
import { useEffect, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useRegistryStore } from "shared/hooks/registry.ts";

export const WindowManager = () => {
  // Get all window data directly
  const windows = useWindowStore((state) => state.windows);
  const activeWindowId = useWindowStore((state) => state.activeWindowId);
  const { focusWindow, closeWindow } = useWindowStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const { getKey, setKey } = useRegistryStore();
  const debugMode = getKey("/developer/debugMode");

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      // Only unfocus if click is directly on the container background
      if (e.target === containerRef.current && activeWindowId !== null) {
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
    setKey("/developer/debugMode", !debugMode);
  });

  return (
    <div ref={containerRef}>
      {debugMode && (
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
