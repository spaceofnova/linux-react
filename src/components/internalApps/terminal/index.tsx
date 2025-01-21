import { Button } from "@/components/ui/button";
import { useWindowStore } from "@/stores/windowStore";
import { WindowType } from "@/types/storeTypes";
import { Maximize2Icon, X } from "lucide-react";
import { useRef, useEffect } from "react";
import { Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { WebglAddon } from '@xterm/addon-webgl';
import { TerminalBackend } from './backend';
import { View } from "@/components/ui/View";

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
          onClick={() =>
            !windowProps.isMaximized
              ? maximizeWindow(windowProps.id!)
              : restoreWindow(windowProps.id!)
          }
        >
          {!windowProps.isMaximized ? (
            <Maximize2Icon size={6} />
          ) : (
            <Maximize2Icon size={6} className="rotate-45" />
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

// Debounce helper function
const debounce = (fn: Function, ms = 100) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

export default function TerminalApp({ windowProps }: { windowProps: WindowType }) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const backendRef = useRef<TerminalBackend | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize xterm.js
    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Consolas, "Courier New", monospace',
      allowProposedApi: true,
      allowTransparency: true,
      theme: {
        background: '#000000',
      }
    });

    // Initialize addons
    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    const webglAddon = new WebglAddon();

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webLinksAddon);
    terminal.loadAddon(webglAddon);
    // Store refs
    xtermRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // Open terminal in container
    terminal.open(terminalRef.current);
    fitAddon.fit();

    // Initialize backend
    backendRef.current = new TerminalBackend(terminal);

    // Create debounced resize handler
    const debouncedFit = debounce(() => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
        terminal.scrollToBottom();
      }
    }, 25);

    // Handle resize
    window.addEventListener('resize', debouncedFit);
    const resizeObserver = new ResizeObserver(() => {
      debouncedFit();
    });
    
    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current.parentElement as Element);
    }

    // Initial fit after a short delay to ensure proper sizing
    setTimeout(debouncedFit, 100);

    // Cleanup
    return () => {
      window.removeEventListener('resize', debouncedFit);
      resizeObserver.disconnect();
      webglAddon.dispose();
      backendRef.current?.dispose();
      terminal.dispose();
    };
  }, []);

  return (
    <View className="flex flex-col h-full">
      <TerminalHeader windowProps={windowProps} />
      <div 
        ref={terminalRef}
        className="flex-1 overflow-hidden"
        style={{ 
          width: '100%',
          height: 'calc(100% - 32px)', // Subtract header height
          padding: '4px',
          backgroundColor: '#000'
        }}
      />
    </View>
  );
}
