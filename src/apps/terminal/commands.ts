import { Terminal } from '@xterm/xterm';

export interface CommandContext {
  terminal: Terminal;
  args: string[];
}

export type CommandFunction = (context: CommandContext) => void | Promise<void> | Promise<(() => void)>;

export interface Command {
  name: string;
  description: string;
  execute: CommandFunction;
}

class CommandRegistry {
  private commands: Map<string, Command> = new Map();

  register(command: Command) {
    this.commands.set(command.name.toLowerCase(), command);
  }

  get(name: string): Command | undefined {
    return this.commands.get(name.toLowerCase());
  }

  getAll(): Command[] {
    return Array.from(this.commands.values());
  }
}

// Create and export a singleton instance
export const registry = new CommandRegistry();

// Register built-in commands
registry.register({
  name: 'help',
  description: 'Show this help message',
  execute: ({ terminal }) => {
    terminal.writeln('Available commands:');
    registry.getAll().forEach(cmd => {
      terminal.writeln(`  ${cmd.name.padEnd(10)} - ${cmd.description}`);
    });
  }
});

registry.register({
  name: 'clear',
  description: 'Clear the terminal screen',
  execute: ({ terminal }) => {
    terminal.clear();
  }
});

registry.register({
  name: 'echo',
  description: 'Echo the arguments',
  execute: ({ terminal, args }) => {
    terminal.writeln(args.join(' '));
  }
});

// Add after the echo command registration
registry.register({
  name: 'donut',
  description: 'Display a spinning donut. Usage: donut [--debug] [--no-limit]',
  execute: async ({ terminal, args }) => {
    let A = 1, B = 1;
    const showDebug = args.includes('--debug');
    const noLimit = args.includes('--no-limit');

    const MIN_WIDTH = 82;  // Minimum width needed for donut
    const MIN_HEIGHT = showDebug ? 24 : 22;  // Minimum height with/without debug info
    
    // Performance tracking
    let frameCount = 0;
    let lastFrameTime = performance.now();
    let lastFpsUpdate = performance.now();
    const frameTimes: number[] = [];
    const maxFrameTimes = 60; // Track last 60 frames
    
    // Frame limiting
    const targetFPS = 60;
    const frameTime = 1000 / targetFPS;
    let nextFrameTime = performance.now();
    
    terminal.write('\x1b[?25l'); // Hide cursor
    terminal.write('\x1b[2J'); // Clear screen
    
    const DONUT_WIDTH = 80;
    const DONUT_HEIGHT = showDebug ? 18 : 28; // Reserve space for debug info
    let fps = 0;

    const renderTooSmallMessage = (width: number, height: number) => {
      let output = '\x1b[2J\x1b[H'; // Clear screen and move cursor to top-left
      
      const message = [
        '╔════════════════════════════╗',
        '║    Terminal Too Small!     ║',
        '╠════════════════════════════╣',
        '║  Please resize terminal:   ║',
        `║  • Required: ${MIN_WIDTH}x${MIN_HEIGHT}         ║`,
        `║  • Current:  ${width}x${height}${' '.repeat(8 - width.toString().length - height.toString().length)}     ║`,
        '╚════════════════════════════╝'
      ];

      const messageWidth = message[0].length;
      const messageHeight = message.length;
      
      // Center the message
      const padLeft = Math.floor((width - messageWidth) / 2);
      const padTop = Math.floor((height - messageHeight) / 2);
      
      // Add top padding
      output += '\r\n'.repeat(Math.max(0, padTop));
      
      // Add the message with proper padding
      message.forEach(line => {
        output += ' '.repeat(Math.max(0, padLeft)) + line + '\r\n';
      });
      
      return output;
    };
    
    const renderFrame = () => {
      const now = performance.now();
      
      // Frame limiting
      if (!noLimit && now < nextFrameTime) {
        return;
      }
      nextFrameTime = now + frameTime;
      
      // Get terminal dimensions
      const termWidth = terminal.cols;
      const termHeight = terminal.rows;

      // Check if terminal is too small
      if (termWidth < MIN_WIDTH || termHeight < MIN_HEIGHT) {
        terminal.write(renderTooSmallMessage(termWidth, termHeight));
        return;
      }
      
      // Create the frame buffer
      const buffer = [];
      const zbuffer = [];
      let output = '\x1b[2J\x1b[H'; // Clear screen and move cursor to top-left
      
      // Calculate padding to center the donut
      const padLeft = Math.floor((termWidth - DONUT_WIDTH) / 2);
      const padTop = Math.floor((termHeight - DONUT_HEIGHT) / 2);
      
      // Add top padding
      output += '\r\n'.repeat(padTop);
      
      // Initialize buffers for the donut's fixed size
      for (let y = 0; y < DONUT_HEIGHT; y++) {
        for (let x = 0; x < DONUT_WIDTH; x++) {
          const k = y * DONUT_WIDTH + x;
          buffer[k] = ' ';
          zbuffer[k] = 0;
        }
      }
      
      // Calculate rotation matrices
      const cosA = Math.cos(A), sinA = Math.sin(A);
      const cosB = Math.cos(B), sinB = Math.sin(B);
      
      // Theta rotation
      for (let theta = 0; theta < 6.28; theta += 0.07) {
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);
        
        // Phi rotation
        for (let phi = 0; phi < 6.28; phi += 0.02) {
          const sinPhi = Math.sin(phi);
          const cosPhi = Math.cos(phi);
          
          const h = cosTheta + 2; // R1 + R2*cos(theta)
          const D = 1 / (sinPhi * h * sinA + sinTheta * cosA + 5); // 1/z
          const t = sinPhi * h * cosA - sinTheta * sinA; // factored term
          
          const x = Math.floor(40 + 30 * D * (cosPhi * h * cosB - t * sinB));
          const y = Math.floor(11 + 15 * D * (cosPhi * h * sinB + t * cosB));
          const o = x + DONUT_WIDTH * y;
          
          const luminance = Math.floor(8 * (
            (sinTheta * sinA - sinPhi * cosTheta * cosA) * cosB -
            sinPhi * cosTheta * sinA -
            sinTheta * cosA -
            cosPhi * cosTheta * sinB
          ));
          
          if (y < DONUT_HEIGHT && y >= 0 && x >= 0 && x < DONUT_WIDTH - 1 && D > zbuffer[o]) {
            zbuffer[o] = D;
            buffer[o] = ".,-~:;=!*#$@"[luminance > 0 ? luminance : 0];
          }
        }
      }
      
      // Add the donut with left padding
      for (let y = 0; y < DONUT_HEIGHT; y++) {
        const line = buffer.slice(y * DONUT_WIDTH, (y + 1) * DONUT_WIDTH).join('');
        output += ' '.repeat(padLeft) + line + '\r\n';
      }
      
      // Add debug info if enabled
      if (showDebug) {
        frameCount++;
        
        // Calculate frame time
        const frameTime = now - lastFrameTime;
        lastFrameTime = now;
        
        // Keep track of frame times
        frameTimes.push(frameTime);
        if (frameTimes.length > maxFrameTimes) {
          frameTimes.shift();
        }
        
        // Calculate stats
        const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
        const minFrameTime = Math.min(...frameTimes);
        const maxFrameTime = Math.max(...frameTimes);
        
        // Calculate FPS (every second)
        if (now - lastFpsUpdate >= 1000) {
          fps = Math.round((frameCount * 1000) / (now - lastFpsUpdate));
          frameCount = 0;
          lastFpsUpdate = now;
        }
        
        // Add debug info at the bottom
        output += '\r\n';
        output += ' '.repeat(padLeft) + '\x1b[33m=== Debug Info ===\x1b[0m\r\n';
        output += ' '.repeat(padLeft) + `FPS: ${fps}${noLimit ? ' (unlimited)' : ' (limited to 60)'}\r\n`;
        output += ' '.repeat(padLeft) + `Frame Time: ${frameTime.toFixed(2)}ms (avg: ${avgFrameTime.toFixed(2)}ms, min: ${minFrameTime.toFixed(2)}ms, max: ${maxFrameTime.toFixed(2)}ms)\r\n`;
        output += ' '.repeat(padLeft) + `Rotation: A=${A.toFixed(2)}, B=${B.toFixed(2)}\r\n`;
      }
      
      // Write the entire frame at once
      terminal.write(output);
      
      A += 0.07;
      B += 0.03;
    };
    
    // Run the animation loop as fast as possible, frame limiting is done inside renderFrame
    const interval = setInterval(renderFrame, 1);
    
    // Return cleanup function
    return () => {
      clearInterval(interval);
      terminal.write('\x1b[?25h'); // Show cursor
      terminal.write('\x1b[2J'); // Clear screen
    };
  }
});

registry.register({
  name: 'debug',
  description: 'Show debug information. Usage: debug [info|buffer|test|colors|all]',
  execute: ({ terminal, args }) => {
    const mode = args[0]?.toLowerCase() || 'info';

    if (mode === 'info' || mode === 'all') {
      terminal.writeln('\x1b[1;33mTerminal Information:\x1b[0m');
      terminal.writeln(`Dimensions: ${terminal.cols}x${terminal.rows}`);
      terminal.writeln(`Buffer size: ${terminal.cols * terminal.rows} cells`);
      terminal.writeln(`Cursor: ${terminal.buffer.active.cursorX}, ${terminal.buffer.active.cursorY}`);
      terminal.writeln(`Mode: ${terminal.modes.insertMode ? 'Insert' : 'Normal'}`);
      terminal.writeln(`Unicode: ${terminal.unicode.activeVersion}`);
      terminal.writeln(`Terminal Type: xterm.js`);
    }

    if (mode === 'buffer' || mode === 'all') {
      terminal.writeln('\n\x1b[1;33mBuffer Test:\x1b[0m');
      // Draw a box to test buffer boundaries
      const box = '┌' + '─'.repeat(terminal.cols - 2) + '┐\n' +
                 '│' + ' '.repeat(terminal.cols - 2) + '│\n'.repeat(terminal.rows - 2) +
                 '└' + '─'.repeat(terminal.cols - 2) + '┘';
      terminal.write(box);
      terminal.write('\x1b[H'); // Move cursor back to top
    }

    if (mode === 'test' || mode === 'all') {
      terminal.writeln('\n\x1b[1;33mFeature Tests:\x1b[0m');
      // Unicode support
      terminal.writeln('Unicode: ★ ⚡ 🚀 💻 🔧 ⚙️');
      // Line wrapping
      terminal.writeln('Wrapping: ' + '='.repeat(terminal.cols + 10));
      // Cursor movement
      terminal.write('Cursor: ');
      terminal.write('\x1b[1C→\x1b[1D'); // Right and back
      terminal.write('\x1b[1A↑\x1b[1B'); // Up and back
      terminal.writeln('');
    }

    if (mode === 'colors' || mode === 'all') {
      terminal.writeln('\n\x1b[1;33mColor Tests:\x1b[0m');
      // Basic colors
      terminal.writeln('Basic colors:');
      for (let i = 0; i < 8; i++) {
        terminal.write(`\x1b[4${i}m  `);
      }
      terminal.writeln('\x1b[0m');
      for (let i = 0; i < 8; i++) {
        terminal.write(`\x1b[10${i}m  `);
      }
      terminal.writeln('\x1b[0m');

      // Bright colors
      terminal.writeln('Bright colors:');
      for (let i = 0; i < 8; i++) {
        terminal.write(`\x1b[9${i}m  `);
      }
      terminal.writeln('\x1b[0m');
      for (let i = 0; i < 8; i++) {
        terminal.write(`\x1b[10${i}m  `);
      }
      terminal.writeln('\x1b[0m');

      // Text styles
      terminal.writeln('\nText styles:');
      terminal.writeln('\x1b[1mBold\x1b[0m');
      terminal.writeln('\x1b[3mItalic\x1b[0m');
      terminal.writeln('\x1b[4mUnderline\x1b[0m');
      terminal.writeln('\x1b[9mStrikethrough\x1b[0m');
      terminal.writeln('\x1b[7mInverse\x1b[0m');
    }

    if (!['info', 'buffer', 'test', 'colors', 'all'].includes(mode)) {
      terminal.writeln('\x1b[1;31mInvalid debug mode.\x1b[0m');
      terminal.writeln('Available modes: info, buffer, test, colors, all');
    }
  }
});

