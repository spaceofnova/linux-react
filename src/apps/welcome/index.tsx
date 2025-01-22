import { Button } from "shared/components/ui/button";
import { Checkbox } from "shared/components/ui/checkbox";
import { useAppStore } from "shared/hooks/appstore";
import { usePrefrencesStore } from "shared/hooks/prefrencesStore";
import { useWindowStore } from "shared/hooks/windowStore";

const WelcomeApp = () => {
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const launchApp = useAppStore((state) => state.launchApp);
  const prefrences = usePrefrencesStore((state) => state.prefrences);
  const updatePrefrence = usePrefrencesStore((state) => state.updatePrefrence);
  return (
    <div className="flex flex-col h-full w-full p-4 text-center titlebar">
      <div className="flex flex-col gap-3">
        <h1 className="text-xl font-bold">Welcome to Linux-React!</h1>
        <p>This is a simple app that links to some helpful resources.</p>
        <p>
          Feel free to explore the app store and start creating your own apps.
        </p>
        <p>Happy coding!</p>
      </div>
      <div className="mt-auto flex flex-col gap-2 w-full">
        <div className="flex items-center gap-2">
          <Checkbox
            id="startup1"
            checked={prefrences.hidden?.showWelcomeApp || false}
            onCheckedChange={(checked: boolean) =>
              updatePrefrence("hidden.showWelcomeApp", checked)
            }
          />
          <label
            htmlFor="startup1"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Show this message on startup
          </label>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => closeWindow("com.system.welcome")}
        >
          Close
        </Button>
        <Button
          className="w-full"
          onClick={() => {
            launchApp("com.system.store");
            closeWindow("com.system.welcome");
          }}
        >
          Open App Store
        </Button>
      </div>
    </div>
  );
};

export default WelcomeApp;
