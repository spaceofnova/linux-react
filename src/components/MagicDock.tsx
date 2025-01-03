import { useAppStore } from "@/stores/appstore";
import { Button } from "@/components/ui/button";
import { LocalAppInstall } from "./AddApp";

const Dock = () => {
  const apps = useAppStore.getState().getApps();
  const launchApp = useAppStore.getState().launchApp;
  return (
    <div className="h-9 w-full bg-background fixed bottom-0 flex gap-2 items-center border-t">
      {apps.map((app, index) => (
        <Button
          variant="secondary"
          size="icon"
          key={index}
          onClick={() => launchApp(app.id)}
        >
          {app.name.charAt(0).toUpperCase()}
        </Button>
      ))}
      <LocalAppInstall />
    </div>
  );
};

export default Dock;
