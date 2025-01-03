import { create } from "zustand";
import { WindowStoreType, WindowType } from "@/types/storeTypes";
import { toast } from "sonner";

export const useWindowStore = create<WindowStoreType>()((set) => ({
  windows: [],
  activeWindowId: null,

  createWindow: ({ ...window }: WindowType) => {
    if (!window.id) {
      toast.error("Failed to launch window, no ID provided");
      return;
    }
    if (useWindowStore.getState().windows.find((w) => w.id === window.id)) {
      useWindowStore.getState().focusWindow(window.id);
      return;
    }
    const newWindow = {
      ...window,
      position: window.position || { x: 100, y: 100 },
      size: window.size || { width: 400, height: 300 },
    };
    set((state) => {
      const newWindows = [...state.windows, newWindow];
      return {
        windows: newWindows,
        activeWindowId: window.id,
      };
    });
  },

  focusWindow: (id) => {
    set((state) => {
      // First, update focus states for all windows
      const updatedWindows = state.windows.map(
        (window) =>
          window.id === id
            ? { ...window, isFocused: true } // Focus this window
            : { ...window, isFocused: false } // Unfocus others
      );

      // Find the focused window and move it to the end of the array
      const focusedWindow = updatedWindows.find((window) => window.id === id)!;
      const focusedWindowIndex = updatedWindows.indexOf(focusedWindow);

      // Remove the focused window from its current position and add it to the end
      updatedWindows.push(...updatedWindows.splice(focusedWindowIndex, 1));

      return {
        windows: updatedWindows,
        activeWindowId: id,
      };
    });
  },

  closeWindow: (id) => {
    set((state) => {
      const newWindows = state.windows.filter((window) => window.id !== id);
      const isAnyWindowLeft = newWindows.length > 0;
      const activeWindowId = isAnyWindowLeft ? newWindows[0].id : null; // Set the first window as active if any

      return {
        windows: newWindows,
        activeWindowId,
      };
    });
  },

  maximizeWindow: (id) => {
    set((state) => {
      const updatedWindows = state.windows.map((win) =>
        win.id === id
          ? {
              ...win,
              isMaximized: true,
              position: { x: 0, y: 0 },
              prevSize: win.size,
              prevPos: win.position || { x: 0, y: 0 },
              size: {
                width: window.innerWidth,
                height: window.innerHeight,
              },
            }
          : win
      );
      return { windows: updatedWindows };
    });
  },

  minimizeWindow: (id) => {
    set((state) => {
      const updatedWindows = state.windows.map((window) =>
        window.id === id
          ? {
              ...window,
              isMinimized: true,
              position: window.prevPos || { x: 0, y: 0 },
            }
          : window
      );
      return { windows: updatedWindows };
    });
  },

  restoreWindow: (id) => {
    set((state) => {
      const updatedWindows = state.windows.map((window) => ({
        ...(window.id === id
          ? {
              ...window,
              isMaximized: false,
              size: window.prevSize,
              position: window.prevPos || { x: 0, y: 0 },
            }
          : window),
      }));
      return { windows: updatedWindows };
    });
  },

  moveWindow: (id, position, relative) => {
    if (relative) {
      set((state) => {
        const updatedWindows = state.windows.map((window) =>
          window.id === id
            ? {
                ...window,
                position: {
                  x: window.position?.x || 0 + position.x,
                  y: window.position?.y || 0 + position.y,
                },
              }
            : window
        );
        return { windows: updatedWindows };
      });
    } else {
      set((state) => {
        const updatedWindows = state.windows.map((window) =>
          window.id === id ? { ...window, position: position } : window
        );
        return { windows: updatedWindows };
      });
    }
  },

  resizeWindow: (id, size, newpos) => {
    set((state) => {
      const updatedWindows = state.windows.map((window) =>
        window.id === id
          ? { ...window, size, position: { x: newpos.x, y: newpos.y } }
          : window
      );
      return { windows: updatedWindows };
    });
  },
}));
