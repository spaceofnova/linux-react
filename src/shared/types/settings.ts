import { settingsConfig } from "shared/constants";

export type SettingType = "boolean" | "string" | "number" | "select" | "button";

export interface BaseSettingConfig {
  type: SettingType;
  label: string;
  hidden?: boolean;
  prefrence?: string;
  secondaryLabel?: string;
}

export interface BooleanSettingConfig extends BaseSettingConfig {
  type: "boolean";
}

export interface StringSettingConfig extends BaseSettingConfig {
  type: "string";
}

export interface NumberSettingConfig extends BaseSettingConfig {
  type: "number";
  min?: number;
  max?: number;
  step?: number;
}

export interface SelectSettingConfig extends BaseSettingConfig {
  type: "select";
  options: readonly string[];
}

export interface ButtonSettingConfig extends BaseSettingConfig {
  type: "button";
  onClick: () => void;
}

export type SettingConfig =
  | BooleanSettingConfig
  | StringSettingConfig
  | NumberSettingConfig
  | SelectSettingConfig
  | ButtonSettingConfig;

export interface SettingSection {
  description: string;
  settings: SettingConfig[];
}

type Config = typeof settingsConfig;
export type PrefrenceSection = keyof Config;

// Get all preference paths from settings
type GetPrefrencePaths<T extends SettingSection> =
  T["settings"][number] extends infer Setting
    ? Setting extends { prefrence: string }
      ? Setting["prefrence"]
      : never
    : never;

// Create a union type of all possible section.setting combinations
export type PrefrencePath = {
  [S in PrefrenceSection]: `${S}.${GetPrefrencePaths<Config[S] & SettingSection>}`;
}[PrefrenceSection];

export interface PrefrenceValues {
  display: {
    screenZoom: string;
  };
  dock: {
    autoHideDock: boolean;
    iconSize: string;
  };
  developer: {
    debugMode: boolean;
  };
  appearance: {
    userWallpaper: string;
    blurEffects: boolean;
  };
  hidden: {
    showWelcomeApp: boolean;
  };
}
