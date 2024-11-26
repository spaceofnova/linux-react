import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { WindowStoreType, WindowType } from "@/types/storeTypes";

const defaultWindow: WindowType = {
  id: uuidv4(),
  title: "Test Name",
  x: 100,
  y: 100,
  width: 300,
  height: 200,
  isFocused: false,
  isMaximized: false,
  isMinimized: false,
};

export const useWindowStore = create<WindowStoreType>()((set) => ({
  windows: [defaultWindow],
  activeWindowId: null,

  createWindow: (title) => {
    const newWindowId = uuidv4();
    const newWindow = {
      id: newWindowId,
      title,
      x: 100,
      y: 100,
      width: 300,
      height: 200,
      isFocused: false,
      isMaximized: false,
      isMinimized: false,
    };
    set((state) => {
      const newWindows = [...state.windows, newWindow];
      return {
        windows: newWindows,
        activeWindowId: newWindowId,
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
      const focusedWindow = updatedWindows.find((window) => window.id === id);
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
              x: 0,
              y: 0,
              width: window.innerWidth,
              height: window.innerHeight,
            }
          : win
      );
      return { windows: updatedWindows };
    });
  },

  minimizeWindow: (id) => {
    set((state) => {
      const updatedWindows = state.windows.map((window) =>
        window.id === id ? { ...window, isMinimized: true } : window
      );
      return { windows: updatedWindows };
    });
  },

  restoreWindow: () => {
    set((state) => {
      const updatedWindows = state.windows.map((window) => ({
        ...window,
        isMaximized: false,
        isMinimized: false,
      }));
      return { windows: updatedWindows };
    });
  },

  moveWindow: (id, x, y, relative) => {
    if (relative) {
      set((state) => {
        const updatedWindows = state.windows.map((window) =>
          window.id === id
            ? { ...window, x: window.x + x, y: window.y + y }
            : window
        );
        return { windows: updatedWindows };
      });
    } else {
      set((state) => {
        const updatedWindows = state.windows.map((window) =>
          window.id === id ? { ...window, x, y } : window
        );
        return { windows: updatedWindows };
      });
    }
  },

  resizeWindow: (id, width, height, newpos) => {
    set((state) => {
      const updatedWindows = state.windows.map((window) =>
        window.id === id
          ? { ...window, width, height, x: newpos.x, y: newpos.y }
          : window
      );
      return { windows: updatedWindows };
    });
  },
}));
