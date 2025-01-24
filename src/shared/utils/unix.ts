/*
 /$$   /$$ /$$   /$$ /$$$$$$ /$$   /$$       /$$$$$$$  /$$$$$$$$ /$$$$$$$  /$$        /$$$$$$   /$$$$$$  /$$$$$$$$
| $$  | $$| $$$ | $$|_  $$_/| $$  / $$      | $$__  $$| $$_____/| $$__  $$| $$       /$$__  $$ /$$__  $$| $$_____/
| $$  | $$| $$$$| $$  | $$  |  $$/ $$/      | $$  \ $$| $$      | $$  \ $$| $$      | $$  \ $$| $$  \__/| $$      
| $$  | $$| $$ $$ $$  | $$   \  $$$$/       | $$$$$$$/| $$$$$   | $$$$$$$/| $$      | $$$$$$$$| $$      | $$$$$   
| $$  | $$| $$  $$$$  | $$    >$$  $$       | $$__  $$| $$__/   | $$____/ | $$      | $$__  $$| $$      | $$__/   
| $$  | $$| $$\  $$$  | $$   /$$/\  $$      | $$  \ $$| $$      | $$      | $$      | $$  | $$| $$    $$| $$      
|  $$$$$$/| $$ \  $$ /$$$$$$| $$  \ $$      | $$  | $$| $$$$$$$$| $$      | $$$$$$$$| $$  | $$|  $$$$$$/| $$$$$$$$
 \______/ |__/  \__/|______/|__/  |__/      |__/  |__/|________/|__/      |________/|__/  |__/ \______/ |________/
                      
Simple functions to use as unix command replacments


(isnt the ascii art so pretty 😁)
*/

import axios from "axios";
import fs from "@zenfs/core";
import path from "path-browserify";
import { useState } from "react";
import JSZip from 'jszip';

// Helper function to extract URLs from HTML content
const extractUrls = (html: string, baseUrl: string): string[] => {
  const urls: string[] = [];
  const urlRegex = /(?:href|src)=["'](.*?)["']/g;
  let match;

  while ((match = urlRegex.exec(html)) !== null) {
    let url = match[1];
    // Skip data URLs, anchors, and javascript
    if (
      url.startsWith("data:") ||
      url.startsWith("#") ||
      url.startsWith("javascript:")
    ) {
      continue;
    }
    // Convert relative URLs to absolute
    if (!url.startsWith("http")) {
      const base = new URL(baseUrl);
      if (url.startsWith("/")) {
        url = `${base.protocol}//${base.host}${url}`;
      } else {
        url = `${base.protocol}//${base.host}${base.pathname.replace(
          /[^/]*$/,
          ""
        )}${url}`;
      }
    }
    urls.push(url);
  }
  return [...new Set(urls)]; // Remove duplicates
};

// Helper function to get content type from response
const getContentType = (response: any): string => {
  return response.headers["content-type"]?.toLowerCase() || "";
};

export const wget = async (
  url: string,
  options?: {
    outputDir?: string;
    filename?: string;
    recursive?: boolean;
    maxDepth?: number;
  },
  currentDepth: number = 0,
  log?: (message: string) => void
): Promise<string> => {
  const logMessage = (message: string) => {
    if (log) {
      log(message);
    } else {
      console.log(message);
    }
  };

  try {
    // Determine filename from URL if not provided
    const defaultFilename = url.split("/").pop() || "index.html";
    const filename = options?.filename || defaultFilename;

    // Determine output directory
    const outputDir = options?.outputDir || ".";

    // Create full output path
    const outputPath = path.join(outputDir, filename);

    // Create directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    logMessage(`Attempting to download: ${url}`);
    logMessage(`--${new Date().toISOString()}--  ${url}`);
    logMessage(`Saving to: '${outputPath}'`);

    // Fetch the data
    const response = await axios({
      method: "GET",
      url: url,
      responseType: "arraybuffer",
      headers: {
        Accept: "*/*",
      },
      onDownloadProgress: (progressEvent) => {
        const totalSize = progressEvent.total || 0;
        const downloadedSize = progressEvent.loaded;

        if (totalSize) {
          const progress = Math.round((downloadedSize / totalSize) * 100);
          const downloaded = (downloadedSize / 1024).toFixed(2);
          const total = (totalSize / 1024).toFixed(2);
          logMessage(`${progress}% [${downloaded}K/${total}K]`);
        } else {
          logMessage(`${(downloadedSize / 1024).toFixed(2)}K downloaded`);
        }
      },
    });

    // Write the file directly
    fs.writeFileSync(outputPath, new Uint8Array(response.data));
    logMessage(`'${outputPath}' saved`);

    // Handle recursive downloading
    if (
      options?.recursive &&
      (options.maxDepth === undefined || currentDepth < options.maxDepth) &&
      getContentType(response).includes("html")
    ) {
      const html = new TextDecoder().decode(response.data);
      const urls = extractUrls(html, url);

      // Create a subdirectory for recursive downloads
      const subDir = path.join(outputDir, filename.replace(/\.[^/.]+$/, ""));

      // Download each URL recursively
      for (const linkedUrl of urls) {
        try {
          await wget(
            linkedUrl,
            {
              ...options,
              outputDir: subDir,
              filename: undefined, // Let it auto-generate from URL
            },
            currentDepth + 1,
            log
          );
        } catch (error) {
          logMessage(`Failed to download: ${linkedUrl}`);
          // Continue with other URLs even if one fails
        }
      }
    }

    return outputPath;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.message.includes("CORS") || error.code === "ERR_NETWORK") {
        const message = `Error: Cannot download ${url} due to CORS restrictions.\nThis is a browser security feature that prevents downloading from sites that don't explicitly allow it.\nTip: You might need to:\n1. Use a URL that supports CORS\n2. Or download through a CORS proxy\n3. Or use the site's official API if available`;
        logMessage(message);
        throw new Error(message);
      }
      throw new Error(`wget failed: ${error.message}`);
    }
    if (error instanceof Error) {
      throw new Error(`wget failed: ${error.message}`);
    }
    throw new Error("wget failed with unknown error");
  }
};

export const massDownload = async (
  jsonUrl: string,
  onProgress?: (progress: number, total: number, currentFile?: string, currentDirectory?: string) => void
): Promise<string> => {
  console.log(`Attempting to fetch download manifest from: ${jsonUrl}`);
  // Get download.json and parse it
  const response = await axios.get(jsonUrl);
  const downloadJson = response.data;

  // Extract the base URL from metadata
  const baseUrl = downloadJson.find(
    (item: any) => item.type === "metadata"
  )?.hosturl;
  if (!baseUrl) {
    throw new Error("No host URL found in metadata");
  }

  // Calculate total files
  const totalFiles = downloadJson.reduce((acc: number, entry: any) => 
    entry.type !== "metadata" ? acc + (entry.files?.length || 0) : acc, 0
  );
  console.log(`Found ${totalFiles} files to download from ${baseUrl}`);
  let completedFiles = 0;

  // Process each directory entry
  for (const entry of downloadJson) {
    // Skip metadata entry
    if (entry.type === "metadata") continue;

    const outputDir = entry.outputDir || '.';
    console.log(`Processing directory: ${outputDir}`);
    
    // Download each file in the directory
    for (const filename of entry.files || []) {
      const fileUrl = `${baseUrl}/${filename}`;
      console.log(`Attempting to download: ${fileUrl}`);
      await wget(fileUrl, {
        outputDir: outputDir,  // Use the cleaned outputDir
        filename: path.basename(filename),  // Only use the filename part, not the full path
      });
      completedFiles++;
      console.log(`Successfully downloaded: ${filename} (${completedFiles}/${totalFiles})`);
      onProgress?.(completedFiles, totalFiles, filename, outputDir);
    }
  }

  return `Successfully downloaded ${completedFiles} files`;
};

export const useDownload = () => {
  const [status, setStatus] = useState<'pending' | 'inProgress' | 'finished'>('pending');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    completed: number;
    total: number;
    percentage: number;
    currentFile: string;
    currentDirectory: string;
  }>({
    completed: 0,
    total: 0,
    percentage: 0,
    currentFile: '',
    currentDirectory: ''
  });

  const startDownload = async ({
    url,
    isZip = false,
    zipOptions = {
      outputDir: '.'  // Default to current directory
    }
  }: {
    url: string;
    isZip?: boolean;
    zipOptions?: {
      outputDir?: string;
    }
  }): Promise<void> => {
    try {
      setStatus('inProgress');
      setProgress({
        completed: 0,
        total: 0,
        percentage: 0,
        currentFile: '',
        currentDirectory: ''
      });

      // Create a wrapper for the progress callback
      const onProgress = (completed: number, total: number, currentFile?: string, currentDirectory?: string) => {
        setProgress({
          completed,
          total,
          percentage: Math.round((completed / total) * 100),
          currentFile: currentFile || '',
          currentDirectory: currentDirectory || ''
        });
      };

      if (isZip) {
        const response = await axios.get(url, {
          responseType: 'arraybuffer',
          onDownloadProgress: (progressEvent) => {
            onProgress(progressEvent.loaded, progressEvent.total || progressEvent.loaded, 'Downloading zip...', '');
          }
        });

        // Load zip contents
        const zip = await new JSZip().loadAsync(response.data);
        const totalFiles = Object.keys(zip.files).length;
        let completed = 0;

        // Extract files with proper typing
        for (const [filename, zipFile] of Object.entries(zip.files)) {
          if (!zipFile.dir) {
            const content = await zipFile.async('uint8array');
            // Use the provided output directory
            const fullPath = path.join(zipOptions.outputDir || '.', filename);
            const dir = path.dirname(fullPath);
            
            // Create directory if it doesn't exist
            await fs.promises.mkdir(dir, { recursive: true });
            
            // Write file to the correct location
            await fs.promises.writeFile(fullPath, content);
            completed++;
            onProgress(completed, totalFiles, filename, dir);
          }
        }
      } else {
        // Handle regular JSON manifest downloads
        await massDownload(url, (completed, total, currentFile, currentDirectory) => {
          onProgress(completed, total, currentFile, currentDirectory);
        });
      }
      
      setStatus('finished');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
      setStatus('pending');
    }
  };

  return {
    status,
    error,
    progress,
    startDownload
  };
};