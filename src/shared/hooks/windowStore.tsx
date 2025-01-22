import { create } from "zustand";
import { WindowStoreType, WindowType } from "shared/types/storeTypes";
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
    const maxZIndex = Math.max(
      ...useWindowStore.getState().windows.map((w) => w.zIndex || 0),
      -1
    );
    const newWindow = {
      ...window,
      position: window.position || { x: 100, y: 100 },
      size: window.size || { width: 400, height: 300 },
      zIndex: maxZIndex + 1,
    };
    set((state) => ({
      windows: [...state.windows, newWindow],
      activeWindowId: window.id,
    }));
  },

  focusWindow: (id) => {
    set((state) => {
      if (!id) {
        return { activeWindowId: null };
      }

      // If window is already focused, don't update zIndex
      if (state.activeWindowId === id) {
        return state;
      }

      // Find the window to focus
      const windowToFocus = state.windows.find((window) => window.id === id);
      if (!windowToFocus) return state;

      // Get the highest z-index
      const maxZIndex = Math.max(...state.windows.map((w) => w.zIndex || 0));

      // Update only the z-index of the focused window
      const updatedWindows = state.windows.map((window) =>
        window.id === id ? { ...window, zIndex: maxZIndex + 1 } : window
      );

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
      const activeWindowId = isAnyWindowLeft
        ? newWindows[newWindows.length - 1].id
        : null;

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
    // Minimum Y position to ensure window stays below browser chrome
    const MIN_Y_POSITION = 0; // Typically browser chrome is around 32px height
    const MAX_Y_POSITION = window.innerHeight - 64;
    const MAX_X_POSITION = window.innerWidth - 64;
    const MIN_X_POSITION = 0;

    if (relative) {
      set((state) => {
        const updatedWindows = state.windows.map((window) =>
          window.id === id
            ? {
                ...window,
                position: {
                  x: Math.max(
                    MIN_X_POSITION,
                    Math.min(
                      MAX_X_POSITION,
                      window.position?.x || 0 + position.x
                    )
                  ),
                  y: Math.max(
                    MIN_Y_POSITION,
                    Math.min(
                      MAX_Y_POSITION,
                      (window.position?.y || 0) + position.y
                    )
                  ),
                },
              }
            : window
        );
        return { windows: updatedWindows };
      });
    } else {
      set((state) => {
        const updatedWindows = state.windows.map((window) =>
          window.id === id
            ? {
                ...window,
                position: {
                  x: Math.max(
                    MIN_X_POSITION,
                    Math.min(MAX_X_POSITION, position.x)
                  ),
                  y: Math.max(
                    MIN_Y_POSITION,
                    Math.min(MAX_Y_POSITION, position.y)
                  ),
                },
              }
            : window
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
  updateWindow: (id, updates) => {
    set((state) => {
      const updatedWindows = state.windows.map((window) =>
        window.id === id ? { ...window, ...updates } : window
      );
      return { windows: updatedWindows };
    });
  },
}));
