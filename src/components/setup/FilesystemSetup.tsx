import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { SetupConfig } from "@/lib/setup-config";
import { UI_ASSETS_URL } from "@/lib/constants";
import fs from "@zenfs/core";
import JSZip from "jszip";
import { Loader2, HardDrive, Trash2, Download } from "lucide-react";
import { FC, useEffect, useState } from "react";

interface FilesystemSetupProps {
  onNavigate: (path: string) => void;
  config: SetupConfig;
}

interface DriveInfo {
  id: string;
  name: string;
  used: number;
  total: number;
  hasData: boolean;
}

export const FilesystemSetup: FC<FilesystemSetupProps> = ({ onNavigate, config }) => {
  const [drive, setDrive] = useState<DriveInfo | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [downloadAssets, setDownloadAssets] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const scanDrive = async () => {
    setIsScanning(true);
    try {
      const driveSizeGB = config.systemRequirements.driveSize || 16;
      const total = driveSizeGB * 1024 * 1024 * 1024;

      // Check actual root directory
      const exists = fs.existsSync("/");
      const contents = exists ? fs.readdirSync("/") : [];
      const hasData = contents.length > 1;
      const used = hasData ? Math.min(total, contents.length * 1024 * 1024 * 100) : 0;

      setDrive({
        id: 'root',
        name: 'System Drive',
        used,
        total,
        hasData
      });
    } catch (error) {
      console.error("Error scanning drive:", error);
    } finally {
      setIsScanning(false);
    }
  };

  const clearDrive = async () => {
    setIsClearing(true);
    try {
      if (fs.existsSync("/")) {
        fs.rmSync("/", { recursive: true, force: true });
      }
      fs.mkdirSync("/", { recursive: true });

      // Update drive state
      setDrive(prev => prev ? { ...prev, used: 0, hasData: false } : null);
    } catch (error) {
      console.error("Error clearing drive:", error);
    } finally {
      setIsClearing(false);
    }
  };

  const downloadUIAssets = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    
    try {
      const response = await fetch(UI_ASSETS_URL);
      const blob = await response.blob();
      setDownloadProgress(33); // Show some progress for download

      // Load zip file
      const zip = new JSZip();
      const zipContents = await zip.loadAsync(blob);
      setDownloadProgress(66); // Show progress for zip loading

      // Create system directory if it doesn't exist
      if (!fs.existsSync("/system")) {
        fs.mkdirSync("/system", { recursive: true });
      }

      // Extract files
      const totalFiles = Object.keys(zipContents.files).length;
      let processedFiles = 0;

      for (const [relativePath, zipEntry] of Object.entries(zipContents.files)) {
        if (!zipEntry.dir) {
          const content = await zipEntry.async('arraybuffer');
          const targetPath = `/system/${relativePath}`;
          
          // Create parent directories if they don't exist
          const parentDir = targetPath.substring(0, targetPath.lastIndexOf('/'));
          if (!fs.existsSync(parentDir)) {
            fs.mkdirSync(parentDir, { recursive: true });
          }

          // Write file using Uint8Array directly
          fs.writeFileSync(targetPath, new Uint8Array(content));
        }

        processedFiles++;
        // Show remaining progress (66-100%) for extraction
        setDownloadProgress(66 + ((processedFiles / totalFiles) * 34));
      }

      localStorage.setItem('uiAssetsDownloaded', 'true');
    } catch (error) {
      console.error("Error downloading and extracting UI assets:", error);
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const handleContinue = async () => {
    if (drive && !drive.hasData) {
      if (downloadAssets && !localStorage.getItem('uiAssetsDownloaded')) {
        await downloadUIAssets();
      }
      localStorage.setItem('driveSize', String(config.systemRequirements.driveSize || 16));
      localStorage.setItem('selectedDrive', drive.id);
      onNavigate("/options");
    }
  };

  useEffect(() => {
    scanDrive();
  }, []);

  if (isScanning || !drive) {
    return (
      <div className="flex flex-col gap-4 flex-1 p-4 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p>Scanning drive...</p>
      </div>
    );
  }

  const formatSize = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  const driveSizeGB = config.systemRequirements.driveSize || 16;

  return (
    <div className="flex flex-col gap-4 flex-1 p-4">
      <h2 className="text-xl font-bold">Select Installation Drive</h2>
      <p className="text-sm text-muted-foreground">
        The drive must be empty or cleared before continuing with the installation.
      </p>

      <div className="flex-1">
        <Card
          className={`p-4 cursor-pointer hover:border-primary transition-colors ${
            !drive.hasData ? 'border-primary ring-1 ring-primary' : ''
          }`}
        >
          <div className="flex items-center gap-4">
            <HardDrive className={`h-12 w-12 transition-colors ${
              !drive.hasData ? 'text-primary' : ''
            }`} />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">{drive.name} ({driveSizeGB}GB)</h3>
                  <p className="text-sm text-muted-foreground">
                    {drive.hasData ? "Contains existing data" : "Ready for installation"}
                  </p>
                </div>
                {drive.hasData && (
                  <Button
                    variant="destructive"
                    onClick={clearDrive}
                    disabled={isClearing}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Drive
                  </Button>
                )}
              </div>
              <div className="mt-4">
                <Progress 
                  value={(drive.used / drive.total) * 100} 
                  className={`h-3 transition-colors ${
                    !drive.hasData ? 'bg-primary/20' : ''
                  }`}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>Used: {formatSize(drive.used)}</span>
                <span>Total: {formatSize(drive.total)}</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-6">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="download-assets" 
              checked={downloadAssets}
              onCheckedChange={(checked) => setDownloadAssets(checked === true)}
              disabled={isDownloading}
            />
            <label
              htmlFor="download-assets"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Download UI assets now
            </label>
          </div>
          {downloadAssets && isDownloading && (
            <div className="mt-2">
              <Progress value={downloadProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Downloading UI assets... {downloadProgress.toFixed(0)}%
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => onNavigate("/")}>
          Back
        </Button>
        <Button 
          onClick={handleContinue}
          disabled={drive.hasData || isClearing || isDownloading}
        >
          {isDownloading ? (
            <>
              <Download className="h-4 w-4 mr-2 animate-bounce" />
              Downloading...
            </>
          ) : (
            'Continue'
          )}
        </Button>
      </div>
    </div>
  );
}; 