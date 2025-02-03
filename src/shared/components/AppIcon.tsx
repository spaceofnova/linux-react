import { useAppStore } from "shared/hooks/appstore";
import fs from "@zenfs/core";

export const AppIcon = ({
  appId,
  className,
  doLaunch = true,
}: {
  appId: string;
  className?: string;
  doLaunch?: boolean;
}) => {
  const launchApp = useAppStore.getState().launchApp;
  const app = useAppStore
    .getState()
    .getApps()
    .find((app) => app.id === appId);

  if (!app) return null;

  const handleClick = () => {
    launchApp(app.id);
  };

  const getIconData = () => {
    try {
      const iconData = fs.readFileSync(
        app.icon ?? "/system/assets/ui/" + appId + ".svg",
        "utf-8"
      );

      return iconData;
    } catch (error) {
      return `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 16 16">
   <path style="fill:currentColor" d="M 8 1 A 7 7 0 0 0 1 8 A 7 7 0 0 0 8 15 A 7 7 0 0 0 15 8 A 7 7 0 0 0 8 1 z M 8 3.75 A 1.25 1.25 0 0 1 9.25 5 A 1.25 1.25 0 0 1 8 6.25 A 1.25 1.25 0 0 1 6.75 5 A 1.25 1.25 0 0 1 8 3.75 z M 7 7 L 9 7 L 9 12 L 7 12 L 7 7 z"/>
  </svg>`;
    }
  };

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: getIconData() }}
    />
  );
};
