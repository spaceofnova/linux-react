import { settingsPages } from "shared/constants";

export type Config = typeof settingsPages;

export type Preferences = {
  appearance: {
    userWallpaper: string;
    blurEffects: boolean;
  };
  taskbar: {
    smallIcons: boolean;
  };
  display: {
    screenZoom: number;
  };
  developer: {
    debugMode: boolean;
  };
};
