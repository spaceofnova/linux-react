import { useState } from "react";
import fs from "@zenfs/core";
import JSZip from "jszip";
import { useAppStore } from "shared/hooks/appstore";
import { toast } from "sonner";

const AddAppUI = () => {
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      setFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const contents = e.target?.result as ArrayBuffer;
          setBuffer(contents);
        } catch (e) {
          toast.error("Failed to read file: " + (e as Error).message);
        }
      };
      reader.onerror = () => {
        toast.error("Failed to read file");
      };
      reader.readAsArrayBuffer(file);
    } catch (e) {
      toast.error("Failed to process file: " + (e as Error).message);
    }
  };

  const handleInstall = async () => {
    try {
      if (!buffer) return;

      const zip = new JSZip();
      const contents = await zip.loadAsync(buffer);

      if (!contents.files["metadata.json"]) {
        toast.error("Invalid app package: missing metadata.json");
        return;
      }

      const metadataContent = await contents.files["metadata.json"].async(
        "text"
      );
      let metadata;
      try {
        metadata = JSON.parse(metadataContent);
      } catch (e) {
        toast.error("Invalid metadata.json format" + (e as Error).message);
        return;
      }

      if (
        !metadata.name ||
        !metadata.version ||
        !metadata.description ||
        !metadata.id
      ) {
        toast.error("Invalid metadata: missing required fields");
        return;
      }

      const appsPath = "/apps";
      const appPath = `${appsPath}/${metadata.id}`;

      try {
        if (!fs.existsSync(appsPath)) {
          fs.mkdirSync(appsPath, 0o777);
        }
        fs.mkdirSync(appPath, 0o777);

        for (const [filename, file] of Object.entries(contents.files)) {
          if (!file.dir) {
            const content = await file.async("uint8array");
            const filePath = `${appPath}/${filename}`;
            const dirPath = filePath.substring(0, filePath.lastIndexOf("/"));
            if (!fs.existsSync(dirPath)) {
              fs.mkdirSync(dirPath, 0o777);
            }
            fs.writeFile(filePath, content);
          }
        }

        useAppStore.getState().addLocalApp({
          id: metadata.id,
          name: metadata.name,
          version: metadata.version,
          description: metadata.description,
          folderPath: appPath,
        });

        toast.success("App installed successfully");
        setFile(null);
        setBuffer(null);
      } catch (e) {
        toast.error("Failed to install app: " + (e as Error).message);
      }
    } catch (e) {
      toast.error("Failed to process app package: " + (e as Error).message);
    }
  };

  return !file ? (
    <div>
      <Input type="file" onChange={handleFileUpload} accept=".lra" />
    </div>
  ) : (
    <div>
      <p>Install {file.name}?</p>
      <div className="flex gap-4">
        <Button onClick={handleInstall}>Install</Button>
        <Button onClick={() => setFile(null)}>Cancel</Button>
      </div>
    </div>
  );
};

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "shared/components/ui/dialog";
import { Button } from "shared/components/ui/button";
import { Input } from "shared/components/ui/input";

const LocalAppInstall = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Install Local App</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Install Local App</DialogTitle>
          <DialogDescription>
            This let's you install a local app not from the store
          </DialogDescription>
        </DialogHeader>
        <AddAppUI />
      </DialogContent>
    </Dialog>
  );
};

export { AddAppUI, LocalAppInstall };
