import { Terminal } from "@xterm/xterm";
import { registry } from "./commands";

export class TerminalBackend {
  private terminal: Terminal;
  private currentLine = '';
  private commandHistory: string[] = [];
  private historyIndex = -1;
  private currentCommand: { cleanup?: () => void } | null = null;

  constructor(terminal: Terminal) {
    this.terminal = terminal;
    this.init();
  }

  private init() {
    this.terminal.writeln('Welcome to Terminal');
    this.terminal.writeln('Type "help" for a list of commands');
    this.prompt();

    this.terminal.onData(this.handleData);
  }

  private prompt() {
    this.terminal.write('\r\n$ ');
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
          this.terminal.write('\x1b[2K\r$ ' + this.currentLine);
        }
      } else if (data === '\x1b[B') { // Down arrow
        if (this.historyIndex > 0) {
          this.historyIndex--;
          this.currentLine = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
          this.terminal.write('\x1b[2K\r$ ' + this.currentLine);
        } else if (this.historyIndex === 0) {
          this.historyIndex = -1;
          this.currentLine = '';
          this.terminal.write('\x1b[2K\r$ ');
        }
      }
    } else if (ord < 32) { // Control characters
      return;
    } else { // Regular input
      this.currentLine += data;
      this.terminal.write(data);
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
      this.prompt();
      return;
    }

    try {
      const result = await command.execute({ terminal: this.terminal, args });
      if (typeof result === 'function') {
        this.currentCommand = { cleanup: result };
      }
    } catch (error) {
      if (error instanceof Error) {
        this.terminal.writeln(`Error: ${error.message}`);
      }
    }

    if (!this.currentCommand?.cleanup) {
      this.prompt();
    }
  }

  public dispose() {
    if (this.currentCommand?.cleanup) {
      this.currentCommand.cleanup();
    }
  }
} 