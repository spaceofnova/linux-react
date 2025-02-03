import { Terminal } from "@xterm/xterm";
import { registry } from "./commands";
import fs from "@zenfs/core";
import path from "path-browserify";

// Get user's home directory
const HOME_DIR = '/home';
if (!fs.existsSync(HOME_DIR)) {
  fs.mkdirSync(HOME_DIR, { recursive: true });
}

export interface TitleChangeEvent {
  type: 'command' | 'directory';
  value: string;
}

export class TerminalBackend {
  private terminal: Terminal;
  private currentLine = '';
  private commandHistory: string[] = [];
  private historyIndex = -1;
  private currentCommand: { cleanup?: () => void } | null = null;
  private currentDirectory = HOME_DIR;
  private onTitleChange?: (event: TitleChangeEvent) => void;

  constructor(terminal: Terminal, onTitleChange?: (event: TitleChangeEvent) => void) {
    this.terminal = terminal;
    this.onTitleChange = onTitleChange;
    this.init();
  }

  private init() {
    this.terminal.writeln('Welcome to the terminal!');
    this.terminal.writeln('Type "help" for a list of commands');
    this.updateTitle();
    this.prompt();

    this.terminal.onData(this.handleData);
  }

  private updateTitle(command?: string) {
    if (command) {
      this.onTitleChange?.({ type: 'command', value: command });
    } else {
      // Replace home directory with ~ in the display
      const displayPath = this.currentDirectory.startsWith(HOME_DIR) 
        ? this.currentDirectory.replace(HOME_DIR, '~')
        : this.currentDirectory;
      this.onTitleChange?.({ type: 'directory', value: displayPath });
    }
  }

  private prompt() {
    // Replace home directory with ~ in the prompt
    const displayPath = this.currentDirectory.startsWith(HOME_DIR) 
      ? this.currentDirectory.replace(HOME_DIR, '~')
      : this.currentDirectory;
    this.terminal.write(`${displayPath}$ `);
  }

  private handleData = (data: string) => {
    const ord = data.charCodeAt(0);

    // Handle Ctrl+C
    if (ord === 3) {
      if (this.currentCommand?.cleanup) {
        this.currentCommand.cleanup();
        this.currentCommand = null;
      }
      this.terminal.write('^C');
      this.currentLine = '';
      this.updateTitle();
      this.prompt();
      return;
    }

    if (ord === 13) { // Enter
      this.terminal.write('\r\n');
      this.handleCommand(this.currentLine);
      this.currentLine = '';
    } else if (ord === 127) { // Backspace
      if (this.currentLine.length > 0) {
        this.currentLine = this.currentLine.slice(0, -1);
        this.terminal.write('\b \b');
      }
    } else if (ord === 27) { // ESC sequence
      // Handle arrow keys
      if (data === '\x1b[A') { // Up arrow
        if (this.historyIndex < this.commandHistory.length - 1) {
          this.historyIndex++;
          this.currentLine = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
          this.terminal.write('\x1b[2K\r');
          this.prompt();
          this.terminal.write(this.currentLine);
        }
      } else if (data === '\x1b[B') { // Down arrow
        if (this.historyIndex > 0) {
          this.historyIndex--;
          this.currentLine = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
          this.terminal.write('\x1b[2K\r');
          this.prompt();
          this.terminal.write(this.currentLine);
        } else if (this.historyIndex === 0) {
          this.historyIndex = -1;
          this.currentLine = '';
          this.terminal.write('\x1b[2K\r');
          this.prompt();
        }
      }
    } else if (ord < 32) { // Control characters
      return;
    } else { // Regular input
      this.currentLine += data;
      this.terminal.write(data);
      this.updateTitle(this.currentLine);
    }
  };

  private async handleCommand(commandLine: string) {
    if (!commandLine.trim()) {
      this.prompt();
      return;
    }

    // Add to history
    this.commandHistory.push(commandLine.trim());
    this.historyIndex = -1;

    // Split command and arguments
    const [cmdName, ...args] = commandLine.trim().split(/\s+/);
    const command = registry.get(cmdName);

    if (!command) {
      this.terminal.writeln(`Command not found: ${cmdName}`);
      this.updateTitle();
      this.prompt();
      return;
    }

    try {
      const result = await command.execute({ 
        terminal: this.terminal, 
        args,
        setDirectory: (dir: string) => {
          this.currentDirectory = dir;
          this.updateTitle();
        },
        getCurrentDirectory: () => this.currentDirectory
      });
      if (typeof result === 'function') {
        this.currentCommand = { cleanup: result };
      }
    } catch (error) {
      if (error instanceof Error) {
        this.terminal.writeln(`Error: ${error.message}`);
      }
    }

    if (!this.currentCommand?.cleanup) {
      this.updateTitle();
      this.prompt();
    }
  }

  public dispose() {
    if (this.currentCommand?.cleanup) {
      this.currentCommand.cleanup();
    }
  }

  public getCurrentDirectory(): string {
    return this.currentDirectory;
  }

  public setCurrentDirectory(dir: string): boolean {
    try {
      // Resolve ~ to home directory
      const resolvedPath = dir.startsWith('~') 
        ? path.join(HOME_DIR, dir.slice(1))
        : dir;

      // Check if directory exists
      if (!fs.existsSync(resolvedPath)) {
        return false;
      }

      // Check if it's a directory
      const stats = fs.statSync(resolvedPath);
      if (!stats.isDirectory()) {
        return false;
      }

      this.currentDirectory = resolvedPath;
      this.updateTitle();
      return true;
    } catch (error) {
      return false;
    }
  }
} 