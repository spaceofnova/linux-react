import { useAppStore } from "shared/hooks/appstore";
import fs from "@zenfs/core";
import React, { useState, useEffect } from "react";

const DEFAULT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 16 16">
  <path style="fill:currentColor" d="M 8 1 A 7 7 0 0 0 1 8 A 7 7 0 0 0 8 15 A 7 7 0 0 0 15 8 A 7 7 0 0 0 8 1 z M 8 3.75 A 1.25 1.25 0 0 1 9.25 5 A 1.25 1.25 0 0 1 8 6.25 A 1.25 1.25 0 0 1 6.75 5 A 1.25 1.25 0 0 1 8 3.75 z M 7 7 L 9 7 L 9 12 L 7 12 L 7 7 z"/>
</svg>`;

interface AppIconProps {
  appId: string;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

export const AppIcon: React.FC<AppIconProps> = React.forwardRef(
  ({ appId, className }, ref) => {
    const [iconData, setIconData] = useState<string>(DEFAULT_ICON);
    const app = useAppStore
      .getState()
      .getApps()
      .find((app) => app.id === appId);

    useEffect(() => {
      if (!app) return;

      const loadIconData = async () => {
        try {
          const iconPath = app.icon ?? `/system/assets/ui/${appId}.svg`;
          const data = await new Promise<string>((resolve, reject) => {
            fs.readFile(iconPath, (error, data) => {
              if (error || !data) {
                reject(new Error("Failed to load icon"));
                return;
              }
              resolve(data.toString());
            });
          });

          setIconData(data);
        } catch (error) {
          console.error("Error loading app icon:", error);
          setIconData(DEFAULT_ICON);
        }
      };

      loadIconData();
    }, [app, appId]);

    if (!app) return null;

    return (
      <div
        ref={ref}
        className={className}
        dangerouslySetInnerHTML={{ __html: iconData }}
      />
    );
  }
);

AppIcon.displayName = "AppIcon";
