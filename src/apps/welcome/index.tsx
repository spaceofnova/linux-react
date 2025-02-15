import {Button} from "shared/components/ui/button";
import {Checkbox} from "shared/components/ui/checkbox";
import {useAppStore} from "shared/hooks/appstore";
import {useWindowStore} from "shared/hooks/windowStore";
import {useRegistryStore} from "shared/hooks/registry.ts";

const WelcomeApp = () => {
    const closeWindow = useWindowStore((state) => state.closeWindow);
    const launchApp = useAppStore((state) => state.launchApp);
    const showWelcomeApp = useRegistryStore((state) => state.getKey("/system/welcome"));
    const {setKey} = useRegistryStore();

    const handleCheckedChange = (checked: boolean) => {
        setKey("/system/welcome", checked);
    };
    return (
        <div className="flex flex-col h-full w-full p-2 text-center titlebar">
            <div className="flex flex-col gap-3 p-2">
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
                        checked={showWelcomeApp}
                        onCheckedChange={handleCheckedChange}
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
