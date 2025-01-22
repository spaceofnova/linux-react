import path from "path-browserify";
import { useAppStore } from "shared/hooks/appstore";
import fs from "@zenfs/core";

export function extractMetadataFromCompiledJS(filePath: string) {
  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const metadataRegex = /\/\*! #METADATA#\s*([\s\S]*?)\*\//;
    const match = fileContent.match(metadataRegex);

    if (match) {
      const metadataText = match[1];
      const metadata: Record<string, string> = {};

      const lines = metadataText.trim().split("\n");
      lines.forEach((line) => {
        const [key, value] = line.split(":").map((s) => s.trim());
        if (key && value) {
          metadata[key] = value;
        }
      });

      return metadata;
    }

    return null;
  } catch (error) {
    console.error("Error reading file:", error);
    return null;
  }
}

export function collectCompiledFileMetadata(directoryPath: string) {
  try {
    const files = fs.readdirSync(directoryPath);

    files.forEach((file) => {
      if (file.endsWith(".app")) {
        const fullPath = path.join(directoryPath, file);
        const metadata = extractMetadataFromCompiledJS(fullPath);

        if (!metadata) return;
        if (metadata) {
          console.log("Found metadata for file:", file);
          console.log("Metadata:", metadata);
          useAppStore.getState().addLocalApp({
            id: metadata.id,
            name: metadata.name || "App",
            folderPath: fullPath,
            version: metadata.version || "1.0",
          });
        }
      }
    });
  } catch (error) {
    console.error("Error collecting compiled file metadata:", error);
  }
}

export function registerApps() {
  const appsDirectory = "/apps";
  collectCompiledFileMetadata(appsDirectory);
}

export function getAppMetadataFromPath(path: string) {
  const metaData = fs.readFileSync(path + "/metadata.json", "utf8");
  return JSON.parse(metaData);
}
