import { Window } from "@/components/Window";
import { useWindowStore } from "@/stores/windowStore";
import { AnimatePresence } from "motion/react";
import { useEffect, useRef } from "react";

export const WindowManager = () => {
  const { windows, activeWindowId, focusWindow } = useWindowStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        focusWindow(null);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [focusWindow]);

  return (
    <div ref={containerRef} className="bg-blue-400">
      <pre>Window Count: {windows.length}</pre>
      <pre>{activeWindowId}</pre>
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
