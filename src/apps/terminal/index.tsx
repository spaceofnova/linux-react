import { Button } from "shared/components/ui/button";
import { useWindowStore } from "shared/hooks/windowStore";
import { WindowType } from "shared/types/storeTypes";
import { Maximize2Icon, X, Plus } from "lucide-react";
import React, { useRef, useEffect, useState } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { WebglAddon } from "@xterm/addon-webgl";
import { TerminalBackend } from "./backend";
import { cn } from "shared/utils/cn";

const ROOT_DIR = '/';

interface TerminalInstance {
  id: string;
  title: string;
  terminal: XTerm | null;
  backend: TerminalBackend | null;
  fitAddon: FitAddon | null;
}

function Terminal({ 
  instance,
  onTitleChange,
  isActive
}: { 
  instance: TerminalInstance;
  onTitleChange: (title: string) => void;
  isActive: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || instance.terminal) return;

    const terminal = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Consolas, "Courier New", monospace',
      allowProposedApi: true,
      allowTransparency: true,
      theme: {
        background: "black",
      },
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    const webglAddon = new WebglAddon();

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webLinksAddon);
    terminal.loadAddon(webglAddon);

    terminal.open(containerRef.current);
    fitAddon.fit();

    const backend = new TerminalBackend(terminal, (event) => {
      if (event.type === 'directory') {
        onTitleChange(event.value);
      } else if (event.value) {
        onTitleChange(event.value);
      }
    });

    const debouncedFit = debounce(() => {
      fitAddon.fit();
      terminal.scrollToBottom();
    }, 25);

    window.addEventListener("resize", debouncedFit);
    const resizeObserver = new ResizeObserver(debouncedFit);

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current.parentElement as Element);
    }

    setTimeout(debouncedFit, 100);

    // Store references in the instance
    instance.terminal = terminal;
    instance.backend = backend;
    instance.fitAddon = fitAddon;

    return () => {
      window.removeEventListener("resize", debouncedFit);
      resizeObserver.disconnect();
      webglAddon.dispose();
      backend.dispose();
      terminal.dispose();
      
      // Clear references
      instance.terminal = null;
      instance.backend = null;
      instance.fitAddon = null;
    };
  }, []);

  // Refit terminal when tab becomes active
  useEffect(() => {
    if (isActive && instance.fitAddon) {
      instance.fitAddon.fit();
    }
  }, [isActive]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full h-full overflow-hidden",
        !isActive && "hidden"
      )}
      style={{
        padding: "4px",
        backgroundColor: "black",
      }}
    />
  );
}

export function TerminalHeader({ windowProps, tabs, activeTab, onNewTab, onCloseTab, onTabClick, onCloseWindow }: { 
  windowProps: WindowType;
  tabs: TerminalInstance[];
  activeTab: string;
  onNewTab: () => void;
  onCloseTab: (id: string) => void;
  onTabClick: (id: string) => void;
  onCloseWindow: () => void;
}) {
  const { maximizeWindow, restoreWindow } = useWindowStore();

  return (
    <div className="h-10 w-full px-2 inline-flex justify-between items-center border-b titlebar">
      <div className="flex-1 flex items-center gap-1">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabClick(tab.id)}
              className={cn(
                "px-3 h-8 flex items-center gap-2 rounded-md text-sm transition-colors",
                "hover:bg-muted/50",
                activeTab === tab.id && "bg-muted"
              )}
            >
              {tab.title}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
              >
                <X size={12} />
              </Button>
            </button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onNewTab}
        >
          <Plus size={16} />
        </Button>
      </div>
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
          onClick={onCloseWindow}
          title="Close"
        >
          <X size={6} />
        </Button>
      </div>
    </div>
  );
}

const debounce = (fn: Function, ms = 100) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

export default function TerminalApp({
  windowProps,
}: {
  windowProps: WindowType;
}) {
  const [terminals, setTerminals] = useState<TerminalInstance[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const { closeWindow, focusWindow } = useWindowStore();

  const createNewTab = () => {
    const id = `terminal-${Date.now()}`;
    const newTerminal: TerminalInstance = {
      id,
      title: "Terminal",
      terminal: null,
      backend: null,
      fitAddon: null
    };
    setTerminals(prev => [...prev, newTerminal]);
    setActiveTab(id);
  };

  useEffect(() => {
    createNewTab();
  }, []);

  const handleCloseTab = (tabId: string) => {
    const terminal = terminals.find(t => t.id === tabId);
    if (terminal) {
      terminal.backend?.dispose();
      terminal.terminal?.dispose();
    }

    setTerminals(prev => prev.filter(t => t.id !== tabId));
    
    if (activeTab === tabId) {
      const remainingTabs = terminals.filter(t => t.id !== tabId);
      if (remainingTabs.length > 0) {
        setActiveTab(remainingTabs[remainingTabs.length - 1].id);
      } else {
        createNewTab();
      }
    }
  };

  const handleCloseWindow = () => {
    // Clean up all terminals
    terminals.forEach(terminal => {
      terminal.backend?.dispose();
      terminal.terminal?.dispose();
    });
    closeWindow(windowProps.id!);
    focusWindow(null);
  };

  const updateTabTitle = (title: string) => {
    setTerminals(prev => prev.map(term => 
      term.id === activeTab ? { ...term, title } : term
    ));
  };

  return (
    <div className="flex flex-col h-full bg-black">
      <TerminalHeader 
        windowProps={windowProps}
        tabs={terminals}
        activeTab={activeTab}
        onNewTab={createNewTab}
        onCloseTab={handleCloseTab}
        onTabClick={setActiveTab}
        onCloseWindow={handleCloseWindow}
      />
      <div className="flex-1 relative">
        {terminals.map(term => (
          <Terminal
            key={term.id}
            instance={term}
            onTitleChange={updateTabTitle}
            isActive={activeTab === term.id}
          />
        ))}
      </div>
    </div>
  );
}
