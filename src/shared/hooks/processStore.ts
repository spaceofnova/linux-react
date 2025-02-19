import { create } from "zustand";
import fs from "@zenfs/core";
import { createSandbox, type Process } from "shared/processAPI";

const processEventBus = new EventTarget();

type ProcessMessage = {
  pid: number;
  message: string;
};

type ProcessStoreType = {
  processes: Process[];
  getProcess: (pid: number) => Process | undefined;
  startProcess: (startPath: string) => Promise<void>;
  stopProcess: (pid: number) => Promise<boolean>;
  killProcess: (pid: number) => void;
};

export const useProcessStore = create<ProcessStoreType>((set, get) => ({
  processes: [],

  getProcess: (pid: number) => {
    return get().processes.find((p) => p.pid === pid);
  },

  startProcess: async (startPath) => {
    const name = startPath.split("/").pop();
    if (!name) return;

    // Check if process already exists with this path and is running
    const existingProcess = get().processes.find(
      (p) => p.startPath === startPath && p.status === "running",
    );
    if (existingProcess) {
      console.log("Process already running:", existingProcess.pid);
      return;
    }

    try {
      const scriptContent = await fs.promises.readFile(startPath, "utf-8");
      const pid = Math.floor(Math.random() * 10000);

      const process: Process = {
        pid,
        name,
        startPath,
        startTime: Date.now(),
        status: "initializing",
        windows: [],
        sendMessage: (message: string) => {
          const event = new CustomEvent("process-message", {
            detail: { pid: process.pid, message },
          });
          processEventBus.dispatchEvent(event);
        },
        addEventListener: (callback: (message: string) => void) => {
          const handler = (e: Event) => {
            const customEvent = e as CustomEvent<ProcessMessage>;
            if (customEvent.detail.pid === process.pid) {
              callback(customEvent.detail.message);
            }
          };
          (callback as any)._handler = handler;
          processEventBus.addEventListener("process-message", handler, {
            capture: false,
            once: false,
            passive: true,
          });
        },
        removeEventListener: (callback: (message: string) => void) => {
          const handler = (callback as any)._handler;
          if (handler) {
            processEventBus.removeEventListener("process-message", handler, {
              capture: false,
            });
          }
        },
      };

      const sandbox = createSandbox(process);
      process.sandbox = sandbox;

      // Add process to state before running script
      set((state) => ({
        processes: [...state.processes, process],
      }));

      // Wait for next tick to ensure event listeners are set up
      await new Promise((resolve) => setTimeout(resolve, 0));

      try {
        const scriptFunction = new Function(
          "sandbox",
          "scriptContent",
          `
          try {
            with (sandbox) {
              //# sourceURL=process-${process.pid}.js
              ${scriptContent}
            }
          } catch (error) {
            if (error instanceof Error) {
              const stack = error.stack || '';
              const lines = stack.split('\\n').map(line => line.trim());
              const errorInfo = {
                message: error.message,
                name: error.name,
                stack: lines,
                source: scriptContent.split('\\n')
              };
              throw JSON.stringify(errorInfo);
            }
            throw error;
          }
        `,
        );

        // Update status
        set((state) => ({
          processes: state.processes.map((p) =>
            p.pid === pid ? { ...p, status: "running" } : p,
          ),
        }));

        scriptFunction(sandbox, scriptContent);
      } catch (error) {
        let errorInfo;

        try {
          errorInfo = JSON.parse(
            error instanceof Error ? error.message : String(error),
          );
        } catch {
          errorInfo = {
            message: error instanceof Error ? error.message : String(error),
            name: error instanceof Error ? error.name : "Error",
            stack:
              error instanceof Error
                ? error.stack?.split("\n").map((line) => line.trim())
                : [],
            source: scriptContent.split("\n"),
          };
        }

        const errorMessage = [
          `${errorInfo.name}: ${errorInfo.message}`,
          "",
          "Stack trace:",
          ...(errorInfo.stack || []),
          "",
          "Source:",
          ...(errorInfo.source || []).map(
            (line: string, i: number) => `${i + 1}: ${line}`,
          ),
        ].join("\n");

        // Update error status
        set((state) => ({
          processes: state.processes.map((p) =>
            p.pid === pid ? { ...p, status: "error", error: errorMessage } : p,
          ),
        }));

        process.sendMessage(
          JSON.stringify({
            type: "error",
            data: {
              ...errorInfo,
              formatted: errorMessage,
            },
          }),
        );
      }
    } catch (error) {
      console.error("Failed to start process:", error);
    }
  },

  stopProcess: async (pid) => {
    return new Promise((resolve) => {
      set((state) => {
        const process = state.processes.find((p) => p.pid === pid);
        if (!process) {
          resolve(false);
          return state;
        }

        // Send close request to process
        process.sendMessage(JSON.stringify({ type: "close-request" }));

        // Check if process has a close handler
        if (process.sandbox?.closeHandler) {
          const shouldClose = process.sandbox.closeHandler();

          // If process prevents closing, return without changes
          if (!shouldClose) {
            resolve(false);
            return state;
          }
        }

        // Clean up process resources
        if (process.sandbox) {
          // This will trigger the exit handler which cleans up all resources
          process.sandbox.exit(0);
        }

        resolve(true);
        return {
          processes: state.processes.filter((p) => p.pid !== pid),
        };
      });
    });
  },

  killProcess: (pid) => {
    set((state) => {
      const process = state.processes.find((p) => p.pid === pid);
      if (!process) return state;

      // Force immediate termination
      if (process.sandbox) {
        // This will trigger the exit handler which cleans up all resources
        process.sandbox.exit(0);
      }

      return {
        processes: state.processes.filter((p) => p.pid !== pid),
      };
    });
  },
}));
