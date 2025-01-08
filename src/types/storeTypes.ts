interface Size {
  width: number;
  height: number;
}

interface Position {
  x: number;
  y: number;
}

export interface AppType {
  id: string;
  name: string;
  version: string | number;
  description?: string;
  folderPath?: string;
  windowOptions?: WindowType;
  internal?: boolean;
  icon?: string;
  deepLink?: string;
}

export interface AppStoreType {
  apps: AppType[];
  launchApp: (appID: string) => void;
  setApps: (apps: AppType[]) => void;
  addApp: (app: AppType) => void;
  removeApp: (appID: string) => void;
}

/* Types for the WM */

export interface WindowType {
  id?: string;
  title: string;
  position?: Position;
  isFocused?: boolean;
  isMaximized?: boolean;
  isMinimized?: boolean;
  size?: Size | undefined;
  prevSize?: Size;
  prevPos?: Position;
  zIndex?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ReactElement?: React.ComponentType<any>;
  noControls?: boolean;
  filePath?: string;
  noResize?: boolean;
  icon?: string;
  deepLink?: string;
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
  updateWindow: (id: string, updates: Partial<WindowType>) => void;
}
