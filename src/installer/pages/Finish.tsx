import { Button } from "shared/components/ui/button";
import { SetupConfig } from "installer/lib/setup-config";
import { LucideCheck } from "lucide-react";
import { FC, useEffect, useState } from "react";

interface FinishProps {
  config: SetupConfig;
}

export const Finish: FC<FinishProps> = ({ config }) => {
  const [installedApps, setInstalledApps] = useState<string[]>([]);

  useEffect(() => {
    const selectedAppsStr = localStorage.getItem('selectedApps');
    if (selectedAppsStr) {
      const selectedApps = JSON.parse(selectedAppsStr);
      const apps = config.recommendedApps
        .filter(app => selectedApps[app.id] || app.required)
        .map(app => app.name);
      setInstalledApps(apps);
    }
  }, [config.recommendedApps]);

  const handleFinish = () => {
    localStorage.setItem("setuplock", "true");
    window.location.reload();
  };

  return (
    <div className="flex flex-col gap-4 flex-1 p-4">
      <div className="flex items-center gap-2">
        <LucideCheck className="h-6 w-6 text-green-500" />
        <h2 className="text-xl font-bold">Installation Complete!</h2>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground">The following components were installed:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Base System Files</li>
          {installedApps.map((app, index) => (
            <li key={index}>{app}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <p className="text-sm text-muted-foreground">
          Your system is now ready to use. Click the button below to start using your new system.
        </p>
      </div>

      <div className="mt-auto">
        <Button onClick={handleFinish} className="w-full">
          Start Using System
        </Button>
      </div>
    </div>
  );
}; 