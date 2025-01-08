import { settingsConfig } from "@/lib/constants";

export type SettingType = "boolean" | "string" | "number" | "select" | "button";

export interface BaseSettingConfig {
  type: SettingType;
  label: string;
  hidden?: boolean;
  prefrence?: string;
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

type InferSettingValue<T> = T extends { type: "boolean" }
  ? boolean
  : T extends { type: "string" }
    ? string
    : T extends { type: "number" }
      ? number
      : T extends { type: "select"; options: readonly (infer O)[] }
        ? O
        : never;

export type PrefrenceValues = {
  [K in PrefrenceSection]: {
    [P in GetPrefrencePaths<Config[K] & SettingSection>]?: InferSettingValue<
      Extract<Config[K]["settings"][number], { prefrence: P }>
    >;
  };
};
