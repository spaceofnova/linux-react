import { create } from "zustand";

export interface TerminalLine {
  text: string;
  color?: string;
}

export interface ProgramContext {
  log: (text: string, color?: string) => void;
  clear: () => void;
  writeScreen: (lines: string[]) => void;
  shouldStop: boolean;
  setShouldStop: (value: boolean) => void;
}

interface TerminalState {
  lines: TerminalLine[];
  currentInput: string;
  cursorPosition: number;
  programRunning: boolean;
  programContext: ProgramContext | null;
  commandHistory: string[];
  historyIndex: number;
  autoScrollEnabled: boolean;
  debugLoggingEnabled: boolean;
  dimensions: { cols: number; rows: number };
  addLine: (text: string, color?: string) => void;
  setInput: (input: string) => void;
  setCursor: (position: number) => void;
  setProgramRunning: (running: boolean) => void;
  addToHistory: (command: string) => void;
  moveHistory: (direction: "up" | "down") => string;
  setAutoScroll: (enabled: boolean) => void;
  setDebugLogging: (enabled: boolean) => void;
  setDimensions: (dimensions: { cols: number; rows: number }) => void;
  log: (message: string, ...args: any[]) => void;
  createProgramContext: () => ProgramContext;
}

export const useTerminalStore = create<TerminalState>((set, get) => ({
  lines: [],
  currentInput: "",
  cursorPosition: 0,
  programRunning: false,
  programContext: null,
  commandHistory: [],
  historyIndex: -1,
  autoScrollEnabled: true,
  debugLoggingEnabled: false,
  dimensions: { cols: 0, rows: 0 },

  addLine: (text: string, color?: string) =>
    set((state) => ({
      lines: [...state.lines, { text, color }],
    })),

  setInput: (input: string) => set({ currentInput: input }),
  setCursor: (position: number) => set({ cursorPosition: position }),
  setProgramRunning: (running: boolean) => set({ programRunning: running }),

  addToHistory: (command: string) =>
    set((state) => ({
      commandHistory: [...state.commandHistory, command],
      historyIndex: state.commandHistory.length,
    })),

  moveHistory: (direction: "up" | "down") => {
    const state = get();
    if (state.commandHistory.length === 0) return state.currentInput;

    let newIndex = state.historyIndex;
    if (direction === "up") {
      newIndex = Math.max(0, state.historyIndex - 1);
    } else {
      newIndex = Math.min(state.commandHistory.length, state.historyIndex + 1);
    }

    set({ historyIndex: newIndex });
    return newIndex === state.commandHistory.length
      ? ""
      : state.commandHistory[newIndex];
  },

  setAutoScroll: (enabled: boolean) => set({ autoScrollEnabled: enabled }),
  setDebugLogging: (enabled: boolean) => set({ debugLoggingEnabled: enabled }),
  setDimensions: (dimensions) => set({ dimensions }),

  log: (message: string, ...args: any[]) => {
    const state = get();
    if (state.debugLoggingEnabled) {
      console.log(message, ...args);
    }
  },

  createProgramContext: () => {
    const state = get();
    let shouldStop = false;

    const context: ProgramContext = {
      log: (text: string, color?: string) => {
        get().addLine(text, color);
      },
      clear: () => {
        set({ lines: [] });
      },
      writeScreen: (lines: string[]) => {
        set({ lines: lines.map(text => ({ text })) });
      },
      get shouldStop() {
        return shouldStop;
      },
      setShouldStop: (value: boolean) => {
        shouldStop = value;
      }
    };

    set({ programContext: context, programRunning: true });
    return context;
  },
})); 