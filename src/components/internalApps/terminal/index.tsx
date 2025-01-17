import { Button } from "@/components/ui/button";
import { commands } from "@/functions/unix";
import { useWindowStore } from "@/stores/windowStore";
import { WindowType } from "@/types/storeTypes";
import { Maximize2Icon, SettingsIcon, ShrinkIcon, X } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { useTerminalStore, TerminalLine } from "./store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Constants for terminal rendering
const CHAR_WIDTH = 9; // Approximate width of a character in pixels
const CHAR_HEIGHT = 16; // Height of a character/line in pixels
const PADDING = 8; // Padding around the terminal content
const FONT_FAMILY = 'Consolas, "Courier New", monospace';

function calculateTerminalDimensions(width: number, height: number) {
  const cols = Math.floor((width - 2 * PADDING) / CHAR_WIDTH);
  const rows = Math.floor((height - 2 * PADDING) / CHAR_HEIGHT);
  return { cols, rows };
}

// Calculate total height needed for all lines
function calculateTotalHeight(lines: (string | TerminalLine)[], currentInput: string, dimensions: { cols: number, rows: number }, programRunning: boolean): number {
  let totalLines = 0;
  
  // Count wrapped lines from history
  for (const line of lines) {
    const text = typeof line === 'string' ? line : line.text;
    totalLines += Math.max(1, Math.ceil(text.length / dimensions.cols));
  }
  
  // Add current input line if not running a program
  if (!programRunning) {
    const inputLine = '$ ' + currentInput;
    totalLines += Math.max(1, Math.ceil(inputLine.length / dimensions.cols));
  }
  
  return (totalLines + 1) * CHAR_HEIGHT + 2 * PADDING; // +1 for the dimensions display
}

// Helper function to wrap text into lines based on terminal width
function wrapText(text: string, cols: number): string[] {
  // If text is short enough, return as is
  if (text.length <= cols) {
    return [text];
  }

  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < text.length; i++) {
    currentLine += text[i];
    if (currentLine.length >= cols) {
      lines.push(currentLine);
      currentLine = '';
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

export function TerminalHeader({ windowProps }: { windowProps: WindowType }) {
  const { maximizeWindow, restoreWindow, closeWindow, focusWindow } = useWindowStore();
  const autoScrollEnabled = useTerminalStore((state) => state.autoScrollEnabled);
  const debugLoggingEnabled = useTerminalStore((state) => state.debugLoggingEnabled);

  const handleClose = () => {
    useTerminalStore.getState().setProgramRunning(false);
    useTerminalStore.getState().programContext = null;
    useTerminalStore.getState().lines = [];
    useTerminalStore.getState().currentInput = "";
    useTerminalStore.getState().cursorPosition = 0;
    closeWindow(windowProps.id!);
    focusWindow(null);
  };

  return (
    <div className="h-8 w-full px-2 inline-flex justify-between items-center border-b titlebar">
      <p>Terminal</p>
      <div className="inline-flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              title="Settings"
            >
              <SettingsIcon size={6} />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="p-2 flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoScrollEnabled}
                  onChange={(e) => useTerminalStore.getState().setAutoScroll(e.target.checked)}
                  className="form-checkbox h-4 w-4"
                />
                Auto-scroll enabled
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={debugLoggingEnabled}
                  onChange={(e) => useTerminalStore.getState().setDebugLogging(e.target.checked)}
                  className="form-checkbox h-4 w-4"
                />
                Debug logging enabled
              </label>
            </div>
          </PopoverContent>
        </Popover>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
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
  const setDimensions = useTerminalStore((state) => state.setDimensions);
  const autoScrollEnabled = useTerminalStore((state) => state.autoScrollEnabled);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);
  const [dimensions, setLocalDimensions] = useState({ cols: 0, rows: 0 });
  const [scrollTop, setScrollTop] = useState(0);

  // Auto-scroll effect
  useEffect(() => {
    if (autoScrollEnabled && canvasRef.current) {
      const totalHeight = calculateTotalHeight(lines, currentInput, dimensions, programRunning);
      const canvasHeight = canvasRef.current.height;
      if (totalHeight > canvasHeight) {
        setScrollTop(totalHeight - canvasHeight);
      }
    }
  }, [lines, currentInput, dimensions, programRunning, autoScrollEnabled]);

  // Handle scroll events
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const totalHeight = calculateTotalHeight(lines, currentInput, dimensions, programRunning);
      const canvasHeight = canvasRef.current?.height || 0;
      const maxScroll = Math.max(0, totalHeight - canvasHeight);
      
      const newScrollTop = Math.min(
        maxScroll,
        Math.max(0, scrollTop + e.deltaY)
      );
      
      setScrollTop(newScrollTop);
      
      // Only update auto-scroll if it's currently enabled
      if (autoScrollEnabled) {
        useTerminalStore.getState().setAutoScroll(newScrollTop >= maxScroll);
      }
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      return () => canvas.removeEventListener('wheel', handleWheel);
    }
  }, [scrollTop, lines, currentInput, dimensions, programRunning, autoScrollEnabled]);

  // Cursor blink effect
  const [showCursor, setShowCursor] = useState(true);
  useEffect(() => {
    if (!focused) return;
    const interval = setInterval(() => setShowCursor((prev) => !prev), 530);
    return () => clearInterval(interval);
  }, [focused]);

  // Separate render function
  const renderTerminal = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    useTerminalStore.getState().log('Rendering terminal, lines:', lines.length);
    useTerminalStore.getState().log('Canvas size:', canvas.width, canvas.height);

    const dpr = window.devicePixelRatio || 1;

    // Clear canvas with proper scaling
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Reset any previous transforms
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // Apply DPI scaling
    ctx.scale(dpr, dpr);

    // Set text properties and check font loading
    ctx.font = `${CHAR_HEIGHT}px ${FONT_FAMILY}`;
    ctx.textBaseline = 'top';
    ctx.imageSmoothingEnabled = false;

    // Test if font is loaded
    const testChar = 'M';
    const metrics = ctx.measureText(testChar);
    useTerminalStore.getState().log('Font metrics for "' + testChar + '":', {
      width: metrics.width,
      height: CHAR_HEIGHT,
      fontFamily: ctx.font,
      actualBoundingBox: {
        ascent: metrics.actualBoundingBoxAscent,
        descent: metrics.actualBoundingBoxDescent,
        left: metrics.actualBoundingBoxLeft,
        right: metrics.actualBoundingBoxRight
      }
    });

    // Render terminal size indicator
    ctx.fillStyle = '#666';
    ctx.fillText(`${dimensions.cols}x${dimensions.rows}`, PADDING, PADDING);
    ctx.fillStyle = '#fff';

    // Calculate visible range
    const startY = PADDING + CHAR_HEIGHT;
    let currentY = startY - scrollTop;

    // Helper function to render text
    const renderText = (text: string, x: number, y: number, color?: string) => {
      ctx.fillStyle = color || '#fff';
      ctx.font = `${CHAR_HEIGHT}px ${FONT_FAMILY}`;
      ctx.fillText(text, x, y);
    };

    // Render previous lines
    for (const line of lines) {
      const wrappedLines = wrapText(typeof line === 'string' ? line : line.text, dimensions.cols);
      for (const wrappedLine of wrappedLines) {
        if (currentY + CHAR_HEIGHT > 0 && currentY < canvas.height / dpr) {
          renderText(wrappedLine, PADDING, currentY, typeof line === 'string' ? undefined : line.color);
        }
        currentY += CHAR_HEIGHT;
      }
    }

    // Render current input line
    if (!programRunning) {
      const prefix = '$ ';
      const fullInputLine = prefix + currentInput;
      renderText(fullInputLine, PADDING, currentY);

      // Draw cursor
      if (showCursor && focused) {
        const cursorX = PADDING + (prefix.length + cursorPosition) * CHAR_WIDTH;
        ctx.fillStyle = '#fff';
        ctx.fillRect(cursorX, currentY, CHAR_WIDTH, CHAR_HEIGHT);
        ctx.fillStyle = '#000';
        ctx.fillText(currentInput[cursorPosition] || ' ', cursorX, currentY);
        ctx.fillStyle = '#fff';
      }
    }
  };

  // Handle canvas resize with debounce
  useEffect(() => {
    let resizeTimeout: number;
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      useTerminalStore.getState().log('Container size:', rect.width, rect.height);
      
      const dpr = window.devicePixelRatio || 1;
      useTerminalStore.getState().log('DPR:', dpr);

      // Set canvas size accounting for DPI
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      // Calculate and update terminal dimensions
      const newDimensions = calculateTerminalDimensions(rect.width, rect.height);
      useTerminalStore.getState().log('New dimensions:', newDimensions);
      
      setLocalDimensions(newDimensions);
      setDimensions(newDimensions);

      // Force a render with the new dimensions
      renderTerminal();
    };

    // Debounced resize handler
    const debouncedResize = () => {
      window.clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(handleResize, 100);
    };

    useTerminalStore.getState().log('Setting up resize handler');
    handleResize();

    // Add resize observer with debounce
    const resizeObserver = new ResizeObserver(debouncedResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.clearTimeout(resizeTimeout);
      resizeObserver.disconnect();
    };
  }, []);

  // Add initial content only once
  useEffect(() => {
    const store = useTerminalStore.getState();
    if (store.lines.length === 0) {
      store.log('Adding initial content');
      store.addLine('Welcome to Terminal');
      store.addLine('Type "help" for a list of commands');
      store.log('Current lines:', store.lines);
    }
  }, []);

  // Update rendering when content changes
  useEffect(() => {
    renderTerminal();
  }, [lines, currentInput, cursorPosition, showCursor, focused, dimensions, programRunning, scrollTop]);

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
        case "v":
          if (e.shiftKey) {
            e.preventDefault();
            navigator.clipboard.readText().then(text => {
              const newInput = currentInput.slice(0, cursorPosition) + text + currentInput.slice(cursorPosition);
              useTerminalStore.getState().setInput(newInput);
              useTerminalStore.getState().setCursor(cursorPosition + text.length);
            });
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
          const newInput = currentInput.slice(0, cursorPosition);
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
    <div className="h-full flex flex-col overflow-hidden bg-black">
      <TerminalHeader windowProps={windowProps} />
      <div
        ref={containerRef}
        className="h-full flex flex-col font-mono overflow-x-auto overflow-y-hidden focus:outline-none relative"
        onClick={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        tabIndex={0}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          style={{ 
            fontSmooth: 'never', 
            WebkitFontSmoothing: 'none',
            imageRendering: 'pixelated'
          }}
        />
      </div>
    </div>
  );
}
