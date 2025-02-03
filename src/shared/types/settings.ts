import { settingsConfig } from "shared/constants";

type Config = typeof settingsConfig;

// Get all sections
export type PrefrenceSection = keyof Config;

// Get all settings with preferences from a section
type GetSectionSettings<T> = T extends { settings: readonly any[] }
  ? Extract<T["settings"][number], { prefrence: string }>
  : never;

// Get the value type for a setting based on its type and default value
type GetSettingValue<T> = T extends { type: "boolean"; defaultValue: boolean }
  ? boolean
  : T extends { type: "string"; defaultValue: string }
  ? string
  : T extends { type: "number"; defaultValue: number }
  ? number
  : T extends { type: "select"; options: readonly any[]; defaultValue: any }
  ? T["defaultValue"]
  : never;

// Build the preferences type from the config
export type PrefrenceValues = {
  [S in PrefrenceSection]: {
    [P in GetSectionSettings<Config[S]> as P["prefrence"]]: GetSettingValue<P>;
  };
};

// Create path type for updating preferences
export type PrefrencePath = {
  [S in PrefrenceSection]: `${S}.${GetSectionSettings<Config[S]>["prefrence"]}`;
}[PrefrenceSection];
