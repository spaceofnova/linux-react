import { create } from "zustand";
import { WindowStoreType, WindowType } from "@/types/storeTypes";
import { customAlphabet } from "nanoid";
const alphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const nanoid = customAlphabet(alphabet, 12);

const defaultWindow: WindowType = {
  id: nanoid(),
  title: "File Manager",
  position: { x: 100, y: 100 },
  size: { width: 300, height: 200 },
  isFocused: false,
  isMaximized: false,
  isMinimized: false,
  content: "test",
};

export const useWindowStore = create<WindowStoreType>()((set) => ({
  windows: [defaultWindow],
  activeWindowId: null,

  createWindow: ({
    id,
    title,
    position,
    size,
    isFocused,
    isMaximized,
    isMinimized,
    content,
  }: WindowType) => {
    const newWindowId = id || nanoid();
    const newWindow = {
      id: newWindowId,
      title,
      position,
      size,
      content,
      isFocused,
      isMaximized,
      isMinimized,
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
              position: { x: 0, y: 0 },
              prevSize: win.size,
              prevPos: win.position,
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
          ? { ...window, isMinimized: true, position: window.prevPos }
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
              position: window.prevPos,
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
                  x: window.position.x + position.x,
                  y: window.position.y + position.y,
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
