import { Window } from "@/components/Window";
import { useWindowStore } from "@/stores/windowStore";
import { AnimatePresence } from "motion/react";
import { useEffect, useRef } from "react";
import TEMP__StyleEditor from "./TEMP__StyleEditor";

export const WindowManager = () => {
  const { windows, activeWindowId, moveWindow, focusWindow, createWindow } =
    useWindowStore();
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

  const spawnWindow = () => {
    createWindow("New Window");
  };

  const moveWinTest = () => {
    moveWindow(windows[0].id, -10, 0, true);
  };

  return (
    <div ref={containerRef}>
      <pre>{JSON.stringify(windows, null, 2)}</pre>
      <pre>{activeWindowId}</pre>
      <button onClick={spawnWindow}>Spawn</button>
      <button onClick={moveWinTest}>Move</button>
      <TEMP__StyleEditor />
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
