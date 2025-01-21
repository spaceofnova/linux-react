import { Button } from "@/components/ui/button";
import { SetupConfig } from "@/lib/setup-config";
import { FC } from "react";

interface Page1Props {
  onNavigate: (path: string) => void;
  config: SetupConfig;
  onLoadConfig: (file: File) => void;
}

export const Page1: FC<Page1Props> = ({ onNavigate, config, onLoadConfig }) => {
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onLoadConfig(file);
    }
  };

  return (
    <div className="flex flex-col gap-8 flex-1 p-4 items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{config.branding.title}</h1>
        <p className="text-xl text-muted-foreground">{config.branding.welcomeMessage}</p>
      </div>

      <div className="flex flex-col gap-4 w-64">
        <Button size="lg" onClick={() => onNavigate("/filesystem")} className="w-full">
          Start Setup
        </Button>

        <div className="relative">
          <input
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
            id="config-file"
          />
          <label htmlFor="config-file">
            <Button variant="outline" size="lg" className="w-full" asChild>
              <span>Load Custom Config</span>
            </Button>
          </label>
        </div>
      </div>
    </div>
  );
}; 