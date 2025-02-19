import { useProcessStore } from "./hooks/processStore";
import { useWindowStore } from "./hooks/windowStore";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyType = any;

type ProcessStatus = "initializing" | "running" | "stopped" | "error";

export type Process = {
  pid: number;
  name: string;
  startPath: string;
  startTime: number;
  status: ProcessStatus;
  error?: string;
  sendMessage: (message: string) => void;
  addEventListener: (callback: (message: string) => void) => void;
  removeEventListener: (callback: (message: string) => void) => void;
  windows: string[];
  sandbox?: AnyType; // Will hold the isolated context
};

type SandboxContext = {
  animationFrames: Set<number>;
  intervals: Set<number>;
  timeouts: Set<number>;
};

interface windowFunctions {
  close: () => void;
  setTitle: (title: string) => void;
  setPosition: (x: number, y: number) => void;
  setSize: (width: number, height: number) => void;
  focus: () => void;
  minimize: () => void;
  restore: () => void;
  onClose: (callback: () => boolean) => void;
}

export class Window implements windowFunctions {
  id: string;
  title: string;
  size: { width: number; height: number };
  position: { x: number; y: number };
  noResize?: boolean;
  constructor(
    options: {
      id?: string;
      title?: string;
      width?: number;
      height?: number;
      x?: number;
      y?: number;
      resizable?: boolean;
    } = {}
  ) {
    this.id = options.id || crypto.randomUUID();
    this.title = options.title || "Window";
    this.size = { width: options.width || 540, height: options.height || 400 };
    this.position = { x: options.x || 100, y: options.y || 100 };
    this.noResize = !options.resizable;

    useWindowStore.getState().createWindow({
      id: this.id,
      title: this.title,
      size: this.size,
      position: this.position,
      noResize: this.noResize,
    });
  }

  close() {
    useWindowStore.getState().closeWindow(this.id);
  }

  onClose(callback: () => boolean) {
    useWindowStore.getState().onClose(this.id, callback);
  }

  setTitle(title: string) {
    useWindowStore.getState().updateWindow(this.id, { title });
  }

  setPosition(x: number, y: number) {
    useWindowStore.getState().moveWindow(this.id, { x, y }, false);
  }

  setSize(width: number, height: number) {
    useWindowStore.getState().resizeWindow(
      this.id,
      { width, height },
      {
        x: 0,
        y: 0,
      }
    );
  }

  focus() {
    useWindowStore.getState().focusWindow(this.id);
  }

  minimize() {
    useWindowStore.getState().minimizeWindow(this.id);
  }

  restore() {
    useWindowStore.getState().restoreWindow(this.id);
  }

  getWindows() {
    return useWindowStore.getState().windows;
  }
}

export function createSandbox(process: Process) {
  // Create sandbox context to track cleanup items
  const context: SandboxContext = {
    animationFrames: new Set(),
    intervals: new Set(),
    timeouts: new Set(),
  };

  const console = {
    log: (...args: AnyType[]) => {
      const message = JSON.stringify({
        type: "log",
        data: args.map((arg) =>
          typeof arg === "object" ? JSON.stringify(arg) : String(arg)
        ),
      });
      window.console.log("Sandbox sending log message:", message);
      process.sendMessage(message);
    },
    error: (...args: AnyType[]) => {
      const message = JSON.stringify({
        type: "error",
        data: args.map((arg) =>
          typeof arg === "object" ? JSON.stringify(arg) : String(arg)
        ),
      });
      window.console.log("Sandbox sending error message:", message);
      process.sendMessage(message);
    },
    warn: (...args: AnyType[]) => {
      const message = JSON.stringify({
        type: "warn",
        data: args.map((arg) =>
          typeof arg === "object" ? JSON.stringify(arg) : String(arg)
        ),
      });
      window.console.log("Sandbox sending warn message:", message);
      process.sendMessage(message);
    },
  };

  class App {
    constructor(public id: string) {}

    on(callback: (message: string) => void) {
      process.addEventListener(callback);
    }
    send(message: string) {
      process.sendMessage(message);
      return this;
    }
    main() {
      return this;
    }
    init() {
      return this;
    }

    exit(code: number = 0) {
      process.sendMessage(
        JSON.stringify({
          type: "exit",
          data: { code },
        })
      );

      // Clean up all resources
      context.intervals.forEach((id) => clearInterval(id));
      context.timeouts.forEach((id) => clearTimeout(id));
      context.animationFrames.forEach((id) => cancelAnimationFrame(id));

      // Clear sets
      context.intervals.clear();
      context.timeouts.clear();
      context.animationFrames.clear();

      // Update process state to stopped
      useProcessStore.getState().killProcess(process.pid);
    }
  }

  return {
    App,
    Window,
    console,
    setTimeout: (
      handler: TimerHandler,
      timeout?: number,
      ...args: AnyType[]
    ): number => {
      const id = window.setTimeout(handler, timeout, ...args);
      context.timeouts.add(id);
      return id;
    },
    clearTimeout: (id: number): void => {
      window.clearTimeout(id);
      context.timeouts.delete(id);
    },
    setInterval: (
      handler: TimerHandler,
      timeout?: number,
      ...args: AnyType[]
    ): number => {
      const id = window.setInterval(handler, timeout, ...args);
      context.intervals.add(id);
      return id;
    },
    clearInterval: (id: number): void => {
      window.clearInterval(id);
      context.intervals.delete(id);
    },
    requestAnimationFrame: (callback: FrameRequestCallback): number => {
      const id = window.requestAnimationFrame((timestamp) => {
        if (context.animationFrames.has(id)) {
          callback(timestamp);
        }
      });
      context.animationFrames.add(id);
      return id;
    },
    cancelAnimationFrame: (id: number): void => {
      window.cancelAnimationFrame(id);
      context.animationFrames.delete(id);
    },
    postMessage: (message: AnyType) => {
      const msg = JSON.stringify({ type: "message", data: message });
      console.log("Sandbox sending postMessage:", msg);
      process.sendMessage(msg);
    },
    onClose: (handler: () => boolean) => {
      process.sandbox.closeHandler = handler;
    },
    exit: (code: number = 0) => {
      process.sendMessage(
        JSON.stringify({
          type: "exit",
          data: { code },
        })
      );

      // Clean up all resources
      context.intervals.forEach((id) => clearInterval(id));
      context.timeouts.forEach((id) => clearTimeout(id));
      context.animationFrames.forEach((id) => cancelAnimationFrame(id));

      // Clear sets
      context.intervals.clear();
      context.timeouts.clear();
      context.animationFrames.clear();

      // Update process state to stopped
      useProcessStore.getState().killProcess(process.pid);
    },
    addEventListener: (type: string, callback: (message: AnyType) => void) => {
      if (type === "message") {
        process.addEventListener((message) => {
          try {
            const data = JSON.parse(message);
            if (data.type === "message") {
              callback(data.data);
            }
          } catch (e) {
            console.error("Failed to parse message:", e);
          }
        });
      }
    },
    removeEventListener: (
      type: string,
      callback: (message: AnyType) => void
    ) => {
      if (type === "message") {
        process.removeEventListener(callback);
      }
    },
  };
}
