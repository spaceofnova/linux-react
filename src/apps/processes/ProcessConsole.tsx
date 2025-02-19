// ProcessConsole.tsx
import { useEffect, useState } from "react";
import { useProcessStore } from "shared/hooks/processStore";

interface ProcessConsoleProps {
  pid: number;
}

export const ProcessConsole = ({ pid }: ProcessConsoleProps) => {
  const [messages, setMessages] = useState<{ type: string; data: any }[]>([]);
  const process = useProcessStore((state) => state.getProcess(pid));

  useEffect(() => {
    if (!process) {
      window.console.log("No process found for pid:", pid);
      return;
    }

    window.console.log("Setting up listener for pid:", pid);

    const handleMessage = (message: string) => {
      window.console.log("ProcessConsole received message:", message);
      try {
        const parsed = JSON.parse(message);
        window.console.log("Parsed message:", parsed);
        setMessages((prev) => [...prev, parsed]);
      } catch (e) {
        window.console.log("Failed to parse message:", e);
      }
    };

    process.addEventListener(handleMessage);

    return () => {
      window.console.log("Cleaning up listener for pid:", pid);
      process.removeEventListener(handleMessage);
    };
  }, [process, pid]);

  window.console.log("Current messages:", messages);

  return (
    <div className="bg-muted p-4 rounded-lg font-mono text-sm">
      <div className="font-bold mb-2">
        Console Output: ({messages.length} messages)
      </div>
      {messages.length === 0 ? (
        <div className="text-muted-foreground">No output yet</div>
      ) : (
        messages.map((msg, i) => {
          switch (msg.type) {
            case "log":
              return (
                <div key={i} className="text-foreground">
                  {Array.isArray(msg.data) ? msg.data.join(" ") : msg.data}
                </div>
              );
            case "error":
              return (
                <div key={i} className="text-red-500">
                  {Array.isArray(msg.data) ? msg.data.join(" ") : msg.data}
                </div>
              );
            case "warn":
              return (
                <div key={i} className="text-yellow-500">
                  {Array.isArray(msg.data) ? msg.data.join(" ") : msg.data}
                </div>
              );
            case "message":
              return (
                <div key={i} className="text-blue-500">
                  Message: {JSON.stringify(msg.data)}
                </div>
              );
            default:
              return (
                <div key={i} className="text-gray-500">
                  Unknown message type: {msg.type}
                </div>
              );
          }
        })
      )}
    </div>
  );
};
