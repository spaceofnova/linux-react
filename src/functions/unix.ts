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
import { ProgramContext } from "@/components/internalApps/terminal/store";
import { useState } from "react";
import { ANSIParser } from "@/lib/terminal/colors";

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

export const cowsay = (message: string): string => {
  if (!message) {
    return "Error: Message is required";
  }
  const bubbleWidth = Math.min(message.length + 2, 40);
  const lines = [];

  // Create speech bubble
  lines.push(" " + "_".repeat(bubbleWidth));

  // Split message into lines of max 38 characters
  const words = message.split(" ");
  let currentLine = "";
  const messageLines = [];

  for (const word of words) {
    if (currentLine.length + word.length + 1 <= 38) {
      currentLine += (currentLine ? " " : "") + word;
    } else {
      messageLines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    messageLines.push(currentLine);
  }

  // Add message lines to bubble
  messageLines.forEach((line, i) => {
    const isFirst = i === 0;
    const isLast = i === messageLines.length - 1;
    const prefix =
      messageLines.length === 1 ? "<" : isFirst ? "/" : isLast ? "\\" : "|";
    const suffix =
      messageLines.length === 1 ? ">" : isFirst ? "\\" : isLast ? "/" : "|";
    lines.push(` ${prefix} ${line.padEnd(bubbleWidth - 4)} ${suffix}`);
  });

  lines.push(" " + "-".repeat(bubbleWidth));
  lines.push("        \\   ^__^");
  lines.push("         \\  (oo)\\_______");
  lines.push("            (__)\\       )\\/\\");
  lines.push("                ||----w |");
  lines.push("                ||     ||");

  return lines.join("\n");
};

// Parse command line arguments with flags
const parseArgs = (args: string[]): { [key: string]: string } => {
  const result: { [key: string]: string } = {};
  let i = 0;
  let foundMainArg = false;

  while (i < args.length) {
    const arg = args[i];
    if (!foundMainArg && !arg.startsWith("-")) {
      result["_"] = arg;
      foundMainArg = true;
      i += 1;
    } else if (arg.startsWith("-")) {
      const flag = arg.slice(1);
      if (i + 1 < args.length && !args[i + 1].startsWith("-")) {
        result[flag] = args[i + 1];
        i += 2;
      } else {
        result[flag] = "true";
        i += 1;
      }
    } else {
      // If we haven't found a main argument yet and this isn't a flag, it must be the URL
      if (!foundMainArg) {
        result["_"] = arg;
        foundMainArg = true;
      }
      i += 1;
    }
  }
  return result;
};

export const massDownload = async (
  jsonUrl: string,
  onProgress?: (progress: number, total: number) => void
): Promise<string> => {
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
  let completedFiles = 0;

  // Process each directory entry
  for (const entry of downloadJson) {
    // Skip metadata entry
    if (entry.type === "metadata") continue;

    // Download each file in the directory
    for (const filename of entry.files || []) {
      const fileUrl = `${baseUrl}/${filename}`;
      await wget(fileUrl, {
        outputDir: entry.outputDir,
        filename: filename,
      });
      completedFiles++;
      onProgress?.(completedFiles, totalFiles);
    }
  }

  return "Downloaded";
};

export const useDownload = () => {
  const [status, setStatus] = useState<'pending' | 'inProgress' | 'finished'>('pending');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ completed: number; total: number }>({ completed: 0, total: 0 });

  const startDownload = async (jsonUrl: string): Promise<void> => {
    try {
      setStatus('inProgress');
      setProgress({ completed: 0, total: 0 });
      await massDownload(jsonUrl, (completed, total) => {
        setProgress({ completed, total });
      });
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

export const help = (cmd: string): string => {
  const command = commands.find((c) => c.name === cmd);
  if (!command) {
    return "Command not found";
  }
  return `${command.name}: ${command.description}\nUsage: ${command.usage}`;
};

export const loggingTest = async (context: ProgramContext): Promise<string> => {
  let counter = 0;
  while (counter < 100 && !context.shouldStop) {
    context.log(
      `Log message #${counter++} at ${new Date().toLocaleTimeString()}`
    );
    await new Promise((resolve) => setTimeout(resolve, 1));
  }
  return counter < 100 ? "Logging test stopped" : "Logging test complete";
};

export const colors = (context: ProgramContext): string => {
  const lines: string[] = [];

  // Color ramp test
  lines.push("[1m](Color Ramp Test:)[0m]");
  const pattern = "/\\/\\/\\/\\/\\";
  const repeatedPattern = pattern.repeat(8);
  
  for (let colnum = 0; colnum < 77; colnum++) {
    const r = Math.round(255 - (colnum * 255 / 76));
    let g = Math.round((colnum * 510 / 76));
    const b = Math.round((colnum * 255 / 76));
    if (g > 255) g = 510 - g;
    
    lines.push(`[${r};${g};${b}m](${repeatedPattern[colnum % repeatedPattern.length]})[0m]\n`);
  }

  // Grayscale ramp
  lines.push("[1m](Grayscale Ramp (256 levels):)[0m]");
  let grayscale = "";
  for (let i = 0; i < 256; i += 2) {
    grayscale += `[${i};${i};${i}m]( )[0m]`;
    if (i % 16 === 0) grayscale += "\n";
  }
  lines.push(grayscale);

  // Color fade text
  lines.push("[1m](Smooth Color Fade Text:)[0m]");
  const text = "This text smoothly transitions through the rainbow!";
  let fadeText = "";
  for (let i = 0; i < text.length; i++) {
    const progress = i / text.length;
    const [r1, g1, b1] = hslToRgb(progress * 360, 1, 0.5);
    fadeText += `[${r1};${g1};${b1}m](${text[i]})[0m]`;
    if ((i + 1) % 50 === 0) fadeText += "\n";
  }
  lines.push(fadeText);

  return lines.join("\n");
};

// Helper function to convert HSL to RGB
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h / 360 + 1/3);
    g = hue2rgb(p, q, h / 360);
    b = hue2rgb(p, q, h / 360 - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

export const echo = (context: ProgramContext, ...args: string[]): string => {
  // Join all arguments with spaces, preserving quotes if they were used
  return args.join(' ');
};

export const commands = [
  {
    name: "wget",
    description: "Download files from the internet",
    usage: "wget [-r] [-d max_depth] [-o output_dir] [-f filename] <url>",
    command: async (context: ProgramContext, ...args: string[]) => {
      const parsedArgs = parseArgs(args);
      return wget(parsedArgs["_"], {
        recursive: parsedArgs["r"] === "true",
        maxDepth: parsedArgs["d"] ? parseInt(parsedArgs["d"]) : undefined,
        outputDir: parsedArgs["o"],
        filename: parsedArgs["f"],
      });
    },
  },
  {
    name: "cowsay",
    description: "Let a cow say your message",
    usage: "cowsay <message>",
    command: (context: ProgramContext, ...args: string[]) => {
      return cowsay(args.join(" "));
    },
  },
  {
    name: "download",
    description: "Let's you mass download files via a download.json",
    usage: "download <json_url>",
    command: (context: ProgramContext, ...args: string[]) => {
      const parsedArgs = parseArgs(args);
      return massDownload(parsedArgs["_"]);
    },
  },
  {
    name: "help",
    description: "Show help for a command or list all commands",
    usage: "help <command>",
    command: (context: ProgramContext, ...args: string[]) => {
      return help(args.join(" "));
    },
  },
  {
    name: "ltest",
    description: "Test logging",
    usage: "ltest",
    command: async (context: ProgramContext) => {
      return await loggingTest(context);
    },
  },
  {
    name: "donut",
    description: "Display a spinning ASCII donut animation",
    usage: "donut [-debug]",
    command: async (context: ProgramContext, ...args: string[]) => {
      const parsedArgs = parseArgs(args);
      const debug = parsedArgs["debug"] === "true";
      
      let A = 0,
        B = 0;
      let frameCount = 0;
      let lastFrameTime = performance.now();
      let frameTimeSum = 0;
      let frameTimeMax = 0;
      let frameTimes: number[] = [];
      const FRAME_TIME_WINDOW = 100; // Track last 100 frames for smoother averages
      
      while (!context.shouldStop) {
        const currentTime = performance.now();
        const frameTime = currentTime - lastFrameTime;
        lastFrameTime = currentTime;

        // Update frame time stats
        if (debug) {
          frameTimeMax = Math.max(frameTimeMax, frameTime);
          frameTimes.push(frameTime);
          if (frameTimes.length > FRAME_TIME_WINDOW) {
            frameTimes.shift();
          }
          frameTimeSum = frameTimes.reduce((a, b) => a + b, 0);
        }

        A += 0.07;
        B += 0.03;
        frameCount++;

        const b = Array(1760).fill(" ");
        const z = Array(1760).fill(0);

        for (let j = 0; j < 6.28; j += 0.07) {
          for (let i = 0; i < 6.28; i += 0.02) {
            const c = Math.sin(i),
              d = Math.cos(j),
              e = Math.sin(A),
              f = Math.sin(j),
              g = Math.cos(A),
              h = d + 2;
            const D = 1 / (c * h * e + f * g + 5);
            const l = Math.cos(i),
              m = Math.cos(B),
              n = Math.sin(B);
            const t = c * h * g - f * e;
            const x = Math.floor(40 + 30 * D * (l * h * m - t * n));
            const y = Math.floor(12 + 15 * D * (l * h * n + t * m));
            const o = x + 80 * y;
            const N = Math.floor(
              8 * ((f * e - c * d * g) * m - c * d * e - f * g - l * d * n)
            );

            if (y < 22 && y >= 0 && x >= 0 && x < 79 && D > z[o]) {
              z[o] = D;
              b[o] = ".,-~:;=!*#$@"[N > 0 ? N : 0];
            }
          }
        }
        context.clear();
        
        let stats = "";
        if (debug) {
          const avgFrameTime = frameTimeSum / frameTimes.length;
          const currentFps = Math.round(1000 / frameTime);
          const avgFps = Math.round(1000 / avgFrameTime);
          stats = `Frame: ${frameCount} | Current: ${currentFps}fps (${frameTime.toFixed(1)}ms) | Avg: ${avgFps}fps (${avgFrameTime.toFixed(1)}ms) | Max: ${frameTimeMax.toFixed(1)}ms`;
        }
        
        if (stats) {
          b.splice(0, stats.length, ...stats.split(""));
        }
        context.writeScreen(b.join("").replace(/(.{80})/g, "$1\n").split("\n"));
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      return "Donut animation stopped";
    },
  },
  {
    name: "colors",
    description: "Display a demonstration of 24-bit color support",
    usage: "colors",
    command: colors,
  },
  {
    name: "echo",
    description: "Display a line of text, supporting ANSI color sequences",
    usage: "echo [text...]",
    command: (context: ProgramContext, ...args: string[]) => {
      return echo(context, ...args);
    },
  },
];
