import { create } from "zustand";
import { WindowStoreType, WindowType } from "shared/types/storeTypes";
import { toast } from "sonner";
import { Position } from "shared/types/general.ts";

// Internal position cache
const positionCache = new Map();

// Internal helpers
const getCachedPosition = (id: string, defaultPos: Position) => {
  if (positionCache.has(id)) {
    return positionCache.get(id);
  }
  positionCache.set(id, defaultPos);
  return defaultPos;
};

const clampPosition = (position: Position) => {
  const MIN_Y_POSITION = 0;
  const MAX_Y_POSITION = window.innerHeight - 64;
  const MAX_X_POSITION = window.innerWidth - 64;
  const MIN_X_POSITION = 0;

  return {
    x: Math.max(MIN_X_POSITION, Math.min(MAX_X_POSITION, position.x)),
    y: Math.max(MIN_Y_POSITION, Math.min(MAX_Y_POSITION, position.y)),
  };
};

export const useWindowStore = create<WindowStoreType>()((set, get) => ({
  windows: [],
  activeWindowId: null,

  // Original API maintained

  createWindow: ({ ...window }: Partial<WindowType>): string => {
    if (!window.id) {
      toast.error("Failed to launch window, no ID provided");
      throw new Error("Window ID is required");
    }

    // Check existing window
    if (get().windows.find((w) => w.id === window.id)) {
      get().focusWindow(window.id);
      return window.id;
    }

    const maxZIndex = Math.max(...get().windows.map((w) => w.zIndex || 0), -1);
    const defaultPosition = window.position || { x: 100, y: 100 };
    const position = getCachedPosition(window.id, defaultPosition);

    const newWindow: WindowType = {
      id: window.id,
      position,
      size: window.size || { width: 540, height: 400 },
      zIndex: maxZIndex + 1,
      title: window.title || window.id,
      ...window,
    };

    set((state) => ({
      windows: [...state.windows, newWindow],
      activeWindowId: window.id,
    }));
    return window.id;
  },
  focusWindow: (id) => {
    set((state) => {
      if (!id) return { activeWindowId: null };
      if (state.activeWindowId === id) return state;

      const windowIndex = state.windows.findIndex((w) => w.id === id);
      if (windowIndex === -1) return state;

      const maxZIndex = state.windows.reduce(
        (max, w) => Math.max(max, w.zIndex || 0),
        0
      );

      const updatedWindows = [...state.windows];
      updatedWindows[windowIndex] = {
        ...state.windows[windowIndex],
        zIndex: maxZIndex + 1,
      };

      return {
        windows: updatedWindows,
        activeWindowId: id,
      };
    });
  },

  closeWindow: (id) => {
    // Cache position before closing
    const window = get().windows.find((w) => w.id === id);
    if (window?.position) {
      positionCache.set(id, window.position);
    }

    // Original behavior maintained
    set((state) => {
      const newWindows = state.windows.filter((w) => w.id !== id);
      const activeWindowId =
        newWindows.length > 0 ? newWindows[newWindows.length - 1].id : null;

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
      const updatedWindows = state.windows.map((win) =>
        win.id === id
          ? {
              ...win,
              isMinimized: true,
              position: win.prevPos || { x: 0, y: 0 },
            }
          : win
      );
      return { windows: updatedWindows };
    });
  },

  restoreWindow: (id) => {
    set((state) => {
      const updatedWindows = state.windows.map((win) =>
        win.id === id
          ? {
              ...win,
              isMaximized: false,
              size: win.prevSize,
              position: getCachedPosition(id, win.prevPos || { x: 0, y: 0 }),
            }
          : win
      );
      return { windows: updatedWindows };
    });
  },

  moveWindow: (id, position, relative) => {
    const currentWindow = get().windows.find((w) => w.id === id);
    if (!currentWindow) return;

    const currentPos = currentWindow.position || { x: 0, y: 0 };
    const newPosition = relative
      ? clampPosition({
          x: currentPos.x + position.x,
          y: currentPos.y + position.y,
        })
      : clampPosition(position);

    // Update cache
    positionCache.set(id, newPosition);

    // Only update if position changed
    if (currentPos.x !== newPosition.x || currentPos.y !== newPosition.y) {
      set((state) => ({
        windows: state.windows.map((win) =>
          win.id === id ? { ...win, position: newPosition } : win
        ),
      }));
    }
  },

  resizeWindow: (id, size, newpos) => {
    const clampedPosition = clampPosition(newpos);
    positionCache.set(id, clampedPosition);

    set((state) => ({
      windows: state.windows.map((win) =>
        win.id === id ? { ...win, size, position: clampedPosition } : win
      ),
    }));
  },

  onClose: (id, callback) => {
    set((state) => ({
      windows: state.windows.map((win) =>
        win.id === id ? { ...win, onClose: callback } : win
      ),
    }));
  },

  updateWindow: (id, updates) => {
    // Cache position if it's being updated
    if (updates.position) {
      positionCache.set(id, updates.position);
    }

    set((state) => ({
      windows: state.windows.map((win) =>
        win.id === id ? { ...win, ...updates } : win
      ),
    }));
  },
}));
