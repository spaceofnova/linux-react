import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SetupConfig } from "@/lib/setup-config";
import fs from "@zenfs/core";
import { Loader2, LucideCheck } from "lucide-react";
import { FC, useEffect, useState } from "react";

interface MainInstallProps {
  onNavigate: (path: string) => void;
  config: SetupConfig;
}

interface InstallStep {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  error?: string;
}

export const MainInstall: FC<MainInstallProps> = ({ onNavigate, config }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<InstallStep[]>(() => 
    config.installationSteps.map(step => ({
      id: step.id,
      title: step.title,
      status: 'pending'
    }))
  );
  const [isInstalling, setIsInstalling] = useState(true);

  const updateStepStatus = (index: number, status: InstallStep['status'], error?: string) => {
    setSteps(prev => prev.map((step, i) => 
      i === index ? { ...step, status, error } : step
    ));
  };

  const setupFilesystem = async () => {
    try {
      // Create required directories
      for (const dir of config.filesystem.directories) {
        if (!fs.existsSync(dir.path)) {
          fs.mkdirSync(dir.path, { recursive: true });
        }
      }

      // Create required files
      for (const file of config.filesystem.files) {
        fs.writeFileSync(file.path, file.content);
      }
      return true;
    } catch (error) {
      console.error('Error setting up filesystem:', error);
      return false;
    }
  };

  const installApps = async () => {
    try {
      const selectedAppsStr = localStorage.getItem('selectedApps');
      if (!selectedAppsStr) return false;

      const selectedApps = JSON.parse(selectedAppsStr);
      const appsToInstall = config.recommendedApps.filter(app => 
        selectedApps[app.id] || app.required
      );

      // Sort by install order
      appsToInstall.sort((a, b) => (a.installOrder || 0) - (b.installOrder || 0));

      for (const app of appsToInstall) {
        // Create app directory if specified
        if (app.directories) {
          for (const dir of app.directories) {
            if (!fs.existsSync(dir.path)) {
              fs.mkdirSync(dir.path, { recursive: true });
            }
          }
        }

        // Create app files if specified
        if (app.files) {
          for (const file of app.files) {
            fs.writeFileSync(file.path, file.content);
          }
        }
      }
      return true;
    } catch (error) {
      console.error('Error installing apps:', error);
      return false;
    }
  };

  const runInstallStep = async (index: number) => {
    const step = config.installationSteps[index];
    updateStepStatus(index, 'running');

    try {
      let success = true;
      switch (step.id) {
        case 'fs-init':
          success = await setupFilesystem();
          break;
        case 'app-install':
          success = await installApps();
          break;
        default:
          // Simulate other steps with timeout
          await new Promise(resolve => setTimeout(resolve, step.timeout));
          break;
      }

      if (success) {
        updateStepStatus(index, 'completed');
        if (index < steps.length - 1) {
          setCurrentStepIndex(index + 1);
        } else {
          setIsInstalling(false);
        }
      } else {
        throw new Error(config.errorMessages.installError);
      }
    } catch (error) {
      updateStepStatus(index, 'error', error instanceof Error ? error.message : 'Unknown error');
      setIsInstalling(false);
    }
  };

  useEffect(() => {
    if (isInstalling) {
      runInstallStep(currentStepIndex);
    }
  }, [currentStepIndex, isInstalling]);

  const progress = (steps.filter(step => step.status === 'completed').length / steps.length) * 100;

  return (
    <div className="flex flex-col gap-4 flex-1 p-4">
      <h2 className="text-xl font-bold">Installing...</h2>
      <Progress value={progress} className="w-full" />
      
      <div className="flex flex-col gap-2 flex-1">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center gap-2">
            {step.status === 'running' && <Loader2 className="h-4 w-4 animate-spin" />}
            {step.status === 'completed' && <LucideCheck className="h-4 w-4 text-green-500" />}
            {step.status === 'error' && <span className="text-red-500">×</span>}
            <span className={
              step.status === 'error' ? 'text-red-500' :
              step.status === 'completed' ? 'text-green-500' :
              step.status === 'running' ? 'text-blue-500' :
              'text-muted-foreground'
            }>
              {step.title}
            </span>
            {step.error && <span className="text-sm text-red-500">({step.error})</span>}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={() => onNavigate("/options")} 
          disabled={isInstalling}
        >
          Back
        </Button>
        <Button 
          onClick={() => onNavigate("/finish")} 
          disabled={isInstalling || steps.some(step => step.status === 'error')}
        >
          {isInstalling ? 'Installing...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}; 