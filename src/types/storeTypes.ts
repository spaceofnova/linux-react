import { Position } from "react-rnd";

export interface AppType {
  name: string;
  version: string | number;
  location: string;
}

export interface AppStoreType {
  apps: AppType[];
  setApps: (apps: AppType[]) => void;
  addApp: (app: AppType) => void;
}

/* Types for the WM */

export interface WindowType {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isFocused: boolean;
  isMaximized: boolean;
  isMinimized: boolean;
  zIndex?: number;
}

export interface WindowStoreType {
  windows: WindowType[];
  activeWindowId: string | null;
  createWindow: (title: string) => void;
  focusWindow: (id: string) => void;
  closeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  moveWindow: (id: string, x: number, y: number, relative: boolean) => void;
  resizeWindow: (
    id: string,
    width: number | string,
    height: number | string,
    newpos: Position
  ) => void;
}

export interface Colors {
  primary: string;
}

export interface ThemeStoreType {
  theme: string;
  colors: Colors;
  setTheme: (theme: string) => void;
  setColors: (colors: Colors) => void;
}
