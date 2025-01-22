import { Button } from "shared/components/ui/button";
import { SetupConfig } from "installer/lib/setup-config";

interface DynamicPageProps {
  currentPath: string;
  config: SetupConfig;
  onNavigate: (path: string) => void;
  onLoadConfig: (file: File) => void;
}

export const DynamicPage = ({ currentPath, config, onNavigate, onLoadConfig }: DynamicPageProps) => {
  const page = config.pages.find((p) => p.id === currentPath.replace("/", ""));
  
  if (!page) {
    return null;
  }

  const handleAction = (action: string) => {
    switch (action) {
      case "next": {
        const nextPageIndex = config.pages.findIndex((p) => p.id === page.id) + 1;
        if (nextPageIndex < config.pages.length) {
          onNavigate(`/${config.pages[nextPageIndex].id}`);
        }
        break;
      }
      case "back": {
        const prevPageIndex = config.pages.findIndex((p) => p.id === page.id) - 1;
        if (prevPageIndex >= 0) {
          onNavigate(`/${config.pages[prevPageIndex].id}`);
        }
        break;
      }
      case "exit":
      case "finish":
      case "restart": {
        localStorage.setItem("setuplock", "true");
        window.location.reload();
        break;
      }
      default: {
        console.warn("Unknown action:", action);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{page.title}</h2>
        <p className="text-muted-foreground">{page.description}</p>
      </div>

      {page.showConfigLoader && (
        <div className="flex flex-col items-center gap-2">
          <input
            type="file"
            accept=".json"
            onChange={(e) => e.target.files?.[0] && onLoadConfig(e.target.files[0])}
            className="hidden"
            id="config-file"
          />
          <label
            htmlFor="config-file"
            className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Load custom configuration
          </label>
        </div>
      )}

      <div className="flex justify-end gap-4 mt-auto">
        {page.actions.secondary && (
          <Button
            variant="outline"
            onClick={() => handleAction(page.actions.secondary!.action)}
          >
            {page.actions.secondary.text}
          </Button>
        )}
        {page.actions.primary && (
          <Button onClick={() => handleAction(page.actions.primary!.action)}>
            {page.actions.primary.text}
          </Button>
        )}
      </div>
    </div>
  );
}; 