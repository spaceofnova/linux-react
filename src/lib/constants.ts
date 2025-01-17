import { showFilePicker } from "@/components/FilePicker";
import { useNotificationStore } from "@/stores/notifications";
import { usePrefrencesStore } from "@/stores/prefrencesStore";
export const settingsConfig = {
  appearance: {
    description: "Customize the look and feel of your desktop",
    settings: [
      {
        type: "string" as const,
        label: "Wallpaper URL",
        prefrence: "userWallpaper",
      },
      {
        type: "button" as const,
        label: "Select Wallpaper from File",
        secondaryLabel: "Select",
        onClick: async () => {
          const filePath = await showFilePicker();
          if (filePath) {
            usePrefrencesStore
              .getState()
              .updatePrefrence("appearance.userWallpaper", filePath);
          }
        },
      },
      {
        type: "boolean" as const,
        label: "Transparency Effects",
        prefrence: "blurEffects",
      },
    ],
  },
  dock: {
    description: "Customize the look and feel of your dock",
    settings: [
      {
        type: "boolean" as const,
        label: "Auto Hide Dock",
        prefrence: "autoHideDock",
      },
      {
        type: "select" as const,
        label: "Icon Size",
        prefrence: "iconSize",
        options: ["mini", "small", "medium", "large"] as const,
        valueMap: {
          mini: 12,
          small: 16,
          medium: 24,
          large: 32,
        },
      },
    ],
  },
  display: {
    description: "Display settings",
    settings: [
      {
        type: "select" as const,
        label: "Screen Zoom",
        prefrence: "screenZoom",
        options: ["90%", "100%", "125%", "150%", "175%", "200%"] as const,
        valueMap: {
          "90%": 0.9,
          "100%": 1,
          "125%": 1.25,
          "150%": 1.5,
          "175%": 1.75,
          "200%": 2,
        },
      },
      {
        type: "button" as const,
        label: "Reset Zoom",
        onClick: () => {
          console.log("Resetting zoom...");
        },
      },
    ],
  },
  developer: {
    description: "Advanced settings for developers",
    settings: [
      {
        type: "boolean" as const,
        label: "Debug Mode",
        prefrence: "debugMode",
      },
      {
        type: "button" as const,
        label: "Spawn Test Notification",
        secondaryLabel: "Spawn",
        onClick: () => {
          useNotificationStore.getState().notify({
            message: "This is a test notification",
            type: "info",
            duration: 5000,
          });
        },
      },
    ],
  },
  hidden: {
    description: "Hidden settings",
    settings: [
      {
        type: "boolean" as const,
        label: "Show Welcome App",
        prefrence: "showWelcomeApp",
        hidden: true,
      },
    ],
  },
} as const;
