import { Button } from "@/components/ui/button";
import { commands } from "@/functions/unix";
import { useWindowStore } from "@/stores/windowStore";
import { WindowType } from "@/types/storeTypes";
import { Maximize2Icon, SettingsIcon, ShrinkIcon, X } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { useTerminalStore } from "./store";

export function TerminalHeader({ windowProps }: { windowProps: WindowType }) {
  const { maximizeWindow, restoreWindow, closeWindow, focusWindow } = useWindowStore();

  const handleClose = () => {
    closeWindow(windowProps.id!);
    focusWindow(null);
  };

  return (
    <div className="h-8 w-full px-2 inline-flex justify-between items-center border-b titlebar">
      <p>Terminal</p>
      <div className="inline-flex items-center gap-2">
      <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => {}}
          title="Settings"
        >
          <SettingsIcon size={6} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          title={windowProps.isMaximized ? "Restore" : "Maximize"}
          onClick={() =>
            !windowProps.isMaximized
              ? maximizeWindow(windowProps.id!)
              : restoreWindow(windowProps.id!)
          }
        >
          {!windowProps.isMaximized ? (
            <Maximize2Icon size={6} />
          ) : (
            <ShrinkIcon size={6} />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleClose}
          title="Close"
        >
          <X size={6} />
        </Button>
      </div>
    </div>
  );
}

export default function TerminalApp({ windowProps }: { windowProps: WindowType }) {
  const lines = useTerminalStore((state) => state.lines);
  const programRunning = useTerminalStore((state) => state.programRunning);
  const currentInput = useTerminalStore((state) => state.currentInput);
  const cursorPosition = useTerminalStore((state) => state.cursorPosition);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);

  // Auto-scroll to bottom when lines change or input changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines, currentInput]);

  // Cursor blink effect
  const [showCursor, setShowCursor] = useState(true);
  useEffect(() => {
    if (!focused) return;
    const interval = setInterval(() => setShowCursor((prev) => !prev), 530);
    return () => clearInterval(interval);
  }, [focused]);

  const handleRunCommand = async (commandLine: string) => {
    if (!commandLine.trim()) return;

    useTerminalStore.getState().addLine(`$ ${commandLine}`);
    useTerminalStore.getState().addToHistory(commandLine);
    useTerminalStore.getState().setInput("");
    useTerminalStore.getState().setCursor(0);

    const [commandName, ...args] = commandLine.trim().split(/\s+/);
    const command = commands.find((c) => c.name === commandName);

    if (!command) {
      useTerminalStore.getState().addLine(`Command not found: ${commandName}`);
      return;
    }

    try {
      const context = useTerminalStore.getState().createProgramContext();
      const result = await command.command(context, ...args);
      if (result) {
        useTerminalStore.getState().addLine(result);
      }
    } catch (error) {
      if (error instanceof Error) {
        useTerminalStore.getState().addLine(error.message);
      }
    } finally {
      useTerminalStore.getState().setProgramRunning(false);
      useTerminalStore.getState().programContext = null;
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // Program control shortcuts - these work even when a program is running
    if (e.ctrlKey) {
      switch (e.key.toLowerCase()) {
        case "c":
          e.preventDefault();
          if (programRunning) {
            useTerminalStore.getState().setProgramRunning(false);
            useTerminalStore.getState().addLine("^C");
          }
          return;
        case "z":
          e.preventDefault();
          if (programRunning) {
            useTerminalStore.getState().setProgramRunning(false);
            useTerminalStore.getState().addLine("^Z");
            // TODO: Add job control system for background processes
          }
          return;
      }
    }

    // If a program is running, don't handle other keyboard input
    if (programRunning) return;

    // Command line editing shortcuts
    if (e.ctrlKey) {
      switch (e.key.toLowerCase()) {
        case "a": // Move to beginning of line
          e.preventDefault();
          useTerminalStore.getState().setCursor(0);
          return;
        case "e": // Move to end of line
          e.preventDefault();
          useTerminalStore.getState().setCursor(currentInput.length);
          return;
        case "u": // Clear from cursor to start of line
          e.preventDefault();
          const newInput = currentInput.slice(cursorPosition);
          useTerminalStore.getState().setInput(newInput);
          useTerminalStore.getState().setCursor(0);
          return;
        case "k": // Clear from cursor to end of line
          e.preventDefault();
          useTerminalStore
            .getState()
            .setInput(currentInput.slice(0, cursorPosition));
          return;
        case "w": // Delete word before cursor
          e.preventDefault();
          const beforeCursor = currentInput.slice(0, cursorPosition);
          const afterCursor = currentInput.slice(cursorPosition);
          const lastWord = beforeCursor.replace(/\w+\s*$/, "");
          useTerminalStore.getState().setInput(lastWord + afterCursor);
          useTerminalStore.getState().setCursor(lastWord.length);
          return;
        case "l": // Clear screen
          e.preventDefault();
          useTerminalStore.getState().lines = [];
          return;
      }
    }

    // Alt (Option) shortcuts
    if (e.altKey) {
      switch (e.key.toLowerCase()) {
        case "b": // Move backward one word
          e.preventDefault();
          const beforeCursorB = currentInput.slice(0, cursorPosition);
          const newPosB = beforeCursorB.search(/\w+\s*$/);
          if (newPosB !== -1) {
            useTerminalStore.getState().setCursor(newPosB);
          }
          return;
        case "f": // Move forward one word
          e.preventDefault();
          const afterCursorF = currentInput.slice(cursorPosition);
          const nextWordF = afterCursorF.match(/\s*\w+/);
          if (nextWordF) {
            useTerminalStore
              .getState()
              .setCursor(cursorPosition + nextWordF[0].length);
          }
          return;
      }
    }

    // Regular command line handling
    if (e.key === "Enter") {
      handleRunCommand(currentInput);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const command = useTerminalStore.getState().moveHistory("up");
      useTerminalStore.getState().setInput(command);
      useTerminalStore.getState().setCursor(command.length);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const command = useTerminalStore.getState().moveHistory("down");
      useTerminalStore.getState().setInput(command);
      useTerminalStore.getState().setCursor(command.length);
    } else if (e.key === "ArrowLeft") {
      if (e.ctrlKey) {
        // Move backward one word
        const beforeCursor = currentInput.slice(0, cursorPosition);
        const newPos = beforeCursor.search(/\w+\s*$/);
        if (newPos !== -1) {
          useTerminalStore.getState().setCursor(newPos);
        }
      } else {
        useTerminalStore.getState().setCursor(Math.max(0, cursorPosition - 1));
      }
    } else if (e.key === "ArrowRight") {
      if (e.ctrlKey) {
        // Move forward one word
        const afterCursor = currentInput.slice(cursorPosition);
        const nextWord = afterCursor.match(/\s*\w+/);
        if (nextWord) {
          useTerminalStore
            .getState()
            .setCursor(cursorPosition + nextWord[0].length);
        } else {
          useTerminalStore.getState().setCursor(currentInput.length);
        }
      } else {
        useTerminalStore
          .getState()
          .setCursor(Math.min(currentInput.length, cursorPosition + 1));
      }
    } else if (e.key === "Backspace") {
      if (cursorPosition > 0) {
        const newInput =
          currentInput.slice(0, cursorPosition - 1) +
          currentInput.slice(cursorPosition);
        useTerminalStore.getState().setInput(newInput);
        useTerminalStore.getState().setCursor(cursorPosition - 1);
      }
    } else if (e.key === "Delete") {
      if (cursorPosition < currentInput.length) {
        const newInput =
          currentInput.slice(0, cursorPosition) +
          currentInput.slice(cursorPosition + 1);
        useTerminalStore.getState().setInput(newInput);
      }
    } else if (e.key === "Home") {
      useTerminalStore.getState().setCursor(0);
    } else if (e.key === "End") {
      useTerminalStore.getState().setCursor(currentInput.length);
    } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      const newInput =
        currentInput.slice(0, cursorPosition) +
        e.key +
        currentInput.slice(cursorPosition);
      useTerminalStore.getState().setInput(newInput);
      useTerminalStore.getState().setCursor(cursorPosition + 1);
    }
  };

  useEffect(() => {
    if (focused) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [focused, currentInput, cursorPosition, programRunning]);

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      <TerminalHeader windowProps={windowProps} />
      <div
        className="h-full flex flex-col bg-black font-mono p-1 overflow-auto"
        onClick={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        tabIndex={0}
      >
        <div
          ref={terminalRef}
          className="flex-1 overflow-auto whitespace-pre-wrap break-all"
        >
          {lines.map((line, index) => (
            <div key={index}>{line}</div>
          ))}
          {!programRunning && (
            <div>
              $ {currentInput.slice(0, cursorPosition)}
              <span
                className={`bg-white text-black ${
                  showCursor && focused ? "opacity-100" : "opacity-0"
                }`}
              >
                {currentInput[cursorPosition] || " "}
              </span>
              {currentInput.slice(cursorPosition + 1)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
