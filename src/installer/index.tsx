import { Button } from "shared/components/ui/button";
import {
  SetupConfig,
  fetchSetupConfig,
  ConfigSource,
} from "installer/lib/setup-config";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "shared/components/ui/card";
import { Page1 } from "installer/pages/Page1";
import { FilesystemSetup } from "installer/pages/FilesystemSetup";
import { InstallOptions } from "installer/pages/InstallOptions";
import { MainInstall } from "installer/pages/MainInstall";
import { ProgressIndicator } from "installer/components/ProgressIndicator";
import { Finish } from "installer/pages/Finish";
import { DynamicPage } from "installer/components/DynamicPage";

interface SetupProps {
  configSource?: ConfigSource;
}

const Setup = ({ configSource }: SetupProps) => {
  const [currentPath, setCurrentPath] = useState("/");
  const [config, setConfig] = useState<SetupConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfigFile = async (file: File) => {
    try {
      setLoading(true);
      const text = await file.text();
      const config = await fetchSetupConfig({
        type: "local",
        path: URL.createObjectURL(
          new Blob([text], { type: "application/json" })
        ),
      });
      setConfig(config);
    } catch (err) {
      console.error("Failed to load configuration file:", err);
      setError(
        "Failed to load configuration file. Make sure it's a valid JSON file."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSetupConfig(configSource)
      .then(setConfig)
      .catch((err) => {
        console.error("Failed to load setup configuration:", err);
        setError("Failed to load setup configuration");
      })
      .finally(() => setLoading(false));
  }, [configSource]);

  const renderRoute = () => {
    if (!config) return null;

    switch (currentPath) {
      case "/":
        return (
          <Page1
            onNavigate={setCurrentPath}
            config={config}
            onLoadConfig={loadConfigFile}
          />
        );
      case "/filesystem":
        return <FilesystemSetup onNavigate={setCurrentPath} config={config} />;
      case "/options":
        return <InstallOptions onNavigate={setCurrentPath} config={config} />;
      case "/install":
        return <MainInstall onNavigate={setCurrentPath} config={config} />;
      case "/finish":
        return <Finish config={config} />;
      default:
        return (
          <DynamicPage
            currentPath={currentPath}
            config={config}
            onNavigate={setCurrentPath}
            onLoadConfig={loadConfigFile}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-lg font-bold text-destructive">Setup Error</p>
        <p className="text-sm text-destructive">
          {error || "Configuration not available"}
        </p>
        <Button onClick={() => window.location.reload()} variant="destructive">
          Retry Setup
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen p-8">
      <Card className="h-3/4 w-1/2">
        <CardContent className="flex flex-col h-full">
          {currentPath != "/" && (
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">
              {config.branding.title}
            </CardTitle>
          </CardHeader>
          )}
          {renderRoute()}
          <ProgressIndicator
            steps={config.steps}
            currentStep={
              currentPath === "/" ? "welcome" : currentPath.replace("/", "")
            }
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Setup;
