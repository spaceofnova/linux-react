import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SetupConfig } from "@/lib/setup-config";
import { FC, useState } from "react";

interface InstallOptionsProps {
  onNavigate: (path: string) => void;
  config: SetupConfig;
}

export const InstallOptions: FC<InstallOptionsProps> = ({ onNavigate, config }) => {
  const [selectedApps, setSelectedApps] = useState(() => 
    config.recommendedApps.reduce((acc, app) => {
      acc[app.id] = app.default || app.required || false;
      return acc;
    }, {} as Record<string, boolean>)
  );

  const handleAppToggle = (appId: string) => {
    const app = config.recommendedApps.find(a => a.id === appId);
    if (app?.required) return; // Can't toggle required apps
    setSelectedApps(prev => ({ ...prev, [appId]: !prev[appId] }));
  };

  const handleContinue = () => {
    // Store selected apps in localStorage for the installation step
    localStorage.setItem('selectedApps', JSON.stringify(selectedApps));
    onNavigate("/install");
  };

  return (
    <div className="flex flex-col gap-4 flex-1 p-4">
      <h2 className="text-xl font-bold">Installation Options</h2>
      <div className="flex flex-col gap-4 flex-1">
        {config.recommendedApps.map((app) => (
          <div key={app.id} className="flex items-start space-x-3 space-y-0">
            <Checkbox
              id={app.id}
              checked={selectedApps[app.id]}
              onCheckedChange={() => handleAppToggle(app.id)}
              disabled={app.required}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor={app.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {app.name}
                {app.required && <span className="text-xs text-muted-foreground ml-2">(Required)</span>}
              </label>
              <p className="text-sm text-muted-foreground">
                {app.description} {app.size && `(${app.size})`}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => onNavigate("/")}>Back</Button>
        <Button onClick={handleContinue}>Continue</Button>
      </div>
    </div>
  );
}; 