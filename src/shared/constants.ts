import { showFilePicker } from "shared/components/FilePicker";
import { useRegistryStore } from "shared/hooks/registry.ts";
// Define our settings configuration structure
export const settingsPages = [
  {
    title: "Appearance",
    description: "Customize the look and feel of your desktop",
    settings: [
      {
        type: "string",
        label: "Wallpaper URL",
        key: "/user/wallpaper",
        defaultValue: "/system/assets/wallpaper.jpg",
      },
      {
        type: "button",
        label: "Select Wallpaper from File",
        secondaryLabel: "Select",
        onClick: async () => {
          const filePath = await showFilePicker();
          if (filePath) {
            useRegistryStore.getState().setKey("/user/wallpaper", filePath);
          }
        },
      },
      {
        type: "boolean",
        label: "Transparency Effects",
        key: "/system/blur",
        defaultValue: true,
      },
    ],
  },
  {
    title: "Taskbar",
    description: "Customize the look and feel of your taskbar",
    settings: [
      {
        type: "boolean",
        label: "Small Icons",
        key: "/user/taskbar/smallIcons",
        defaultValue: false,
      },
    ],
  },
  {
    title: "Display",
    description: "Display settings",
    settings: [
      {
        type: "select",
        label: "Screen Zoom",
        key: "/user/display/screenZoom",
        options: ["90%", "100%", "125%", "150%", "175%", "200%"],
        defaultValue: "100%",
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
        type: "button",
        label: "Reset Zoom",
        onClick: () => {
          console.log("Resetting zoom...");
        },
      },
    ],
  },
  {
    title: "Developer",
    description: "Advanced settings for developers",
    settings: [
      {
        type: "boolean",
        label: "Debug Mode",
        key: "/developer/debugMode",
        defaultValue: false,
      },
    ],
  },
];

export const UI_ASSETS_URL =
  "https://cdn.jsdelivr.net/gh/spaceofnova/linux-react-data-store@main/ui-assets.zip";

export const APPS_DIRECTORY = "/apps";
