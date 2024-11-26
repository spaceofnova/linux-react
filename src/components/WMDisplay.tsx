import { Window } from "@/components/Window";
import { useWindowStore } from "@/stores/windowStore";
import { AnimatePresence } from "motion/react";
import { useEffect } from "react";

export const WindowManager = () => {
  const { windows, activeWindowId, moveWindow, focusWindow, createWindow } =
    useWindowStore();

  useEffect(() => {
    const handleMouseDown = (e) => {
      if (!(e.target as HTMLElement).getAttribute("data-id")) {
        focusWindow(null);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  });

  const spawnWindow = () => {
    createWindow("New Window");
  };

  const moveWinTest = () => {
    moveWindow(windows[0].id, -10, 0, true);
  };

  return (
    <div>
      <pre>{JSON.stringify(windows, null, 2)}</pre>
      <pre>{activeWindowId}</pre>
      <button onClick={spawnWindow}>Spawn</button>
      <button onClick={moveWinTest}>Move</button>
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
