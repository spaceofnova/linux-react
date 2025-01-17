import { create } from "zustand";

export interface ProgramContext {
  shouldStop: boolean;
  log: (message: string) => void;
  clear: () => void;
  writeScreen: (lines: string[]) => void;
  getTerminalSize: () => { cols: number; rows: number };
}

interface TerminalStore {
  programRunning: boolean;
  lines: string[];
  commandHistory: string[];
  historyIndex: number;
  currentInput: string;
  cursorPosition: number;
  dimensions: { cols: number; rows: number };
  autoScrollEnabled: boolean;
  debugLoggingEnabled: boolean;
  addLine: (line: string) => void;
  updateLastLine: (line: string) => void;
  setProgramRunning: (running: boolean) => void;
  programContext: ProgramContext | null;
  createProgramContext: () => ProgramContext;
  addToHistory: (command: string) => void;
  moveHistory: (direction: "up" | "down") => string;
  setInput: (input: string) => void;
  setCursor: (position: number) => void;
  setDimensions: (dimensions: { cols: number; rows: number }) => void;
  setAutoScroll: (enabled: boolean) => void;
  setDebugLogging: (enabled: boolean) => void;
  log: (message: string, ...args: any[]) => void;
}

export const useTerminalStore = create<TerminalStore>((set, get) => ({
  programRunning: false,
  lines: [],
  commandHistory: [],
  historyIndex: -1,
  currentInput: "",
  cursorPosition: 0,
  dimensions: { cols: 80, rows: 24 }, // Default terminal size
  autoScrollEnabled: true,
  debugLoggingEnabled: false,
  programContext: null,
  addLine: (line) => set((state) => ({ lines: [...state.lines, line] })),
  updateLastLine: (line) =>
    set((state) => {
      const newLines = [...state.lines];
      if (newLines.length > 0) {
        newLines[newLines.length - 1] = line;
      } else {
        newLines.push(line);
      }
      return { lines: newLines };
    }),
  setProgramRunning: (running) => {
    set((state) => {
      if (!running && state.programContext) {
        state.programContext.shouldStop = true;
      }
      return { programRunning: running };
    });
  },
  createProgramContext: () => {
    const context: ProgramContext = {
      shouldStop: false,
      log: (message: string) => get().addLine(message),
      clear: () => set({ lines: [] }),
      writeScreen: (lines: string[]) => set({ lines }),
      getTerminalSize: () => get().dimensions,
    };
    set({ programContext: context, programRunning: true });
    return context;
  },
  addToHistory: (command) =>
    set((state) => ({
      commandHistory: [...state.commandHistory, command],
      historyIndex: state.commandHistory.length,
    })),
  moveHistory: (direction) => {
    const state = get();
    if (state.commandHistory.length === 0) return "";

    let newIndex = state.historyIndex;
    if (direction === "up") {
      newIndex = Math.max(0, state.historyIndex - 1);
    } else {
      newIndex = Math.min(state.commandHistory.length, state.historyIndex + 1);
    }

    set({ historyIndex: newIndex });
    return newIndex < state.commandHistory.length
      ? state.commandHistory[newIndex]
      : "";
  },
  setInput: (input) => set({ currentInput: input }),
  setCursor: (position) => set({ cursorPosition: position }),
  setDimensions: (dimensions) => set({ dimensions }),
  setAutoScroll: (enabled) => set({ autoScrollEnabled: enabled }),
  setDebugLogging: (enabled) => set({ debugLoggingEnabled: enabled }),
  log: (message: string, ...args: any[]) => {
    if (get().debugLoggingEnabled) {
      console.log(`[${new Date().toISOString()}] ${message}`, ...args);
    }
  },
})); 