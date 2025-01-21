import { View } from "@/components/ui/View";

import { useAppStore } from "@/stores/appstore";

import { AppType } from "@/types/storeTypes";

import fs from "@zenfs/core";
import { cn } from "@/lib/utils";
import { usePrefrencesStore } from "@/stores/prefrencesStore";
import { ErrorBoundary } from "./ErrorBoundary";

const AppIcon = ({ app }: { app: AppType }) => {
  const launchApp = useAppStore.getState().launchApp;
  const getIconData = () => {
    try {
      const iconData = fs.readFileSync(
        app.icon ?? "/system/assets/ui/" + app.id + ".svg",
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
      onClick={() => launchApp(app.id)}
      className="h-full aspect-square flex items-center justify-center p-1 rounded-sm hover:scale-[1.25] transition-all duration-200 ease-in-out"
      dangerouslySetInnerHTML={{ __html: getIconData() }}
    />
  );
};

const Dock = () => {
  const prefrences = usePrefrencesStore((state) => state.prefrences);
  const apps = useAppStore.getState().getApps();
  return (
    <ErrorBoundary>
      <View
        className={cn(
          "bg-background fixed bottom-2 left-1/2 -translate-x-1/2 flex gap-2 items-center border-t p-2",
          prefrences.dock.iconSize === "mini"
            ? "h-12"
            : prefrences.dock.iconSize === "small"
            ? "h-14"
            : prefrences.dock.iconSize === "medium"
            ? "h-16"
            : "h-20"
        )}
      >
        {apps.map((app, index) => (
          <AppIcon app={app} key={index} />
        ))}
      </View>
    </ErrorBoundary>
  );
};

export default Dock;
