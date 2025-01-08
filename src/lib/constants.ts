export const settingsConfig = {
  appearance: {
    description: "Customize the look and feel of your desktop",
    settings: [
      {
        type: "string" as const,
        label: "Wallpaper URL",
        prefrence: "userWallpaper",
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
        label: "Clear Cache",
        onClick: () => {
          console.log("Clearing cache...");
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
