import { Size } from "re-resizable";
import { Position } from "react-rnd";

export interface AppType {
  name: string;
  version: string | number;
  path: string;
}

export interface AppStoreType {
  apps: AppType[];
  launchApp: (appname: string) => void;
  setApps: (apps: AppType[]) => void;
  addApp: (app: AppType) => void;
}

/* Types for the WM */

export interface WindowType {
  id: string;
  title: string;
  position: Position;
  isFocused: boolean;
  isMaximized: boolean;
  isMinimized: boolean;
  size?: Size | undefined;
  prevSize?: Size;
  prevPos?: Position;
  zIndex?: number;
  content?: string | JSX.Element | Element;
}

export interface WindowStoreType {
  windows: WindowType[];
  activeWindowId: string | null;
  createWindow: (window: WindowType) => void;
  focusWindow: (id: string | null) => void;
  closeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  moveWindow: (id: string, position: Position, relative: boolean) => void;
  resizeWindow: (id: string, Size: Size, newpos: Position) => void;
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
