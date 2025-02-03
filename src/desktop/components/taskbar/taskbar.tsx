import { View } from "shared/components/ui/View";
import { useAppStore } from "shared/hooks/appstore";
import { cn } from "shared/utils/cn";
import { usePrefrencesStore } from "shared/hooks/prefrencesStore";
import { AppIcon } from "shared/components/AppIcon";
import { useWindowStore } from "src/shared/hooks/windowStore";

const Taskbar = () => {
  const prefrences = usePrefrencesStore((state) => state.prefrences);
  const apps = useAppStore.getState().getApps();
  const activeWindowId = useWindowStore((state) => state.activeWindowId);

  const handleClick = (appId: string) => {
    useAppStore.getState().launchApp(appId);
  };

  return (
    <View className="fixed bottom-0 left-0 w-full flex h-12 items-center z-[10000]">
      {apps.map((app) => {
        const isActive = activeWindowId === app.id;

        return (
          <div
            key={app.id}
            onClick={() => handleClick(app.id)}
            className={cn(
              "p-2 px-3 hover:bg-white/10",
              isActive && "bg-white/20"
            )}  
          >
            <AppIcon
              appId={app.id}

              className={prefrences.taskbar?.smallIcons ? "h-7 w-7" : "h-8 w-8"}
            />
          </div>
        );
      })}
    </View>
  );
};

export default Taskbar;
