interface Size {
  width: number;
  height: number;
}

interface Position {
  x: number;
  y: number;
}

export declare interface AppType {
  /** Unique identifier for the app */
  id: string;
  /** Display name of the app */
  name: string;
  /** App version */
  version: string | number;
  /** Optional description of the app's functionality */
  description?: string;
  /** Path to app's folder on disk */
  folderPath?: string;
  /** Window configuration options */
  windowOptions?: WindowType;
  /** Whether this is a built-in system app */
  internal?: boolean;
  /** Path or URL to app icon */
  icon?: string;
  /** Deep link protocol handler (aka "files" for files:// links) */
  deepLink?: string;
}

export declare interface AppStoreType {
  apps: AppType[];
  launchApp: (appID: string) => void;
  setApps: (apps: AppType[]) => void;
  addApp: (app: AppType) => void;
  removeApp: (appID: string) => void;
}

/* Types for the WM */
export declare interface WindowType {
  // Core window properties
  /** Unique identifier for the window */
  id?: string;
  /** Title displayed in window title bar */
  title: string;
  /** React component to render as window content */
  ReactElement?: React.ComponentType<any>;
  /** Path to HTML file to load in iframe */
  filePath?: string;
  /** Path to window icon */
  icon?: string;
  /** Deep link passed to window */
  deepLink?: string;

  // Position and size
  /** Window position coordinates */
  position?: Position;
  /** Window dimensions */
  size?: Size | undefined;
  /** Previous window position before maximize */
  prevPos?: Position;
  /** Previous window size before maximize */
  prevSize?: Size;
  /** Window stack order */
  zIndex?: number;

  // Window state
  /** Whether window has active focus */
  isFocused?: boolean;
  /** Whether window is maximized */
  isMaximized?: boolean;
  /** Whether window is minimized */
  isMinimized?: boolean;

  // Window behavior flags
  /** Hide window controls (title bar) */
  noControls?: boolean;
  /** Disable window resizing */
  noResize?: boolean;

  // File picker specific
  /** Whether window is in file picker mode */
  pickerMode?: boolean;
  /** Allowed file extensions when in picker mode */
  fileTypes?: string[];
  /** Allow selecting multiple files */
  allowMultiple?: boolean;
  /** Currently selected file path */
  selectedFile?: string;
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

export interface NotificationType {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning' | 'default';
  duration?: number;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  store?: boolean;
}

type NotificationInput = Omit<NotificationType, 'id'>;

export interface NotificationStoreType {
  notifications: NotificationType[];
  notify: (notification: NotificationInput) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}
