import { useProcessStore } from "shared/hooks/processStore";
import { ProcessConsole } from "./ProcessConsole";
import { Button } from "shared/components/ui/button";
import { useState } from "react";

export const ProcessesApp = () => {
  const processes = useProcessStore((state) => state.processes);
  const { killProcess, stopProcess } = useProcessStore();
  const [stoppingProcesses, setStoppingProcesses] = useState<number[]>([]);

  const handleStop = async (pid: number) => {
    setStoppingProcesses((prev) => [...prev, pid]);
    try {
      const stopped = await stopProcess(pid);
      if (!stopped) {
        // Process prevented stopping
        console.log("Process prevented stopping");
      }
    } finally {
      setStoppingProcesses((prev) => prev.filter((id) => id !== pid));
    }
  };

  return (
    <div className="enable-user-select overflow-y-auto w-full h-full p-4 space-y-4">
      <h1 className="text-2xl font-bold">Processes</h1>
      {processes.map((process) => (
        <div key={process.pid} className="border rounded-lg p-4 space-y-2">
          <h2 className="text-xl font-semibold">{process.name}</h2>
          <p className="text-sm text-muted-foreground">
            Path: {process.startPath}
          </p>
          <p className="text-sm">Status: {process.status}</p>
          {process.status === "error" && (
            <pre className="bg-red-500/10 p-2 rounded text-sm text-red-500">
              {process.error}
            </pre>
          )}
          <p className="text-sm text-muted-foreground">
            Started: {new Date(process.startTime).toLocaleString()}
          </p>
          <ProcessConsole pid={process.pid} />
          <div className="pt-2">
            <h3 className="text-sm font-semibold mb-2">Controls:</h3>
            <div className="flex gap-2">
              <Button
                onClick={() => handleStop(process.pid)}
                variant="outline"
                disabled={stoppingProcesses.includes(process.pid)}
              >
                {stoppingProcesses.includes(process.pid)
                  ? "Stopping..."
                  : "Stop"}
              </Button>
              <Button
                onClick={() => killProcess(process.pid)}
                variant="destructive"
              >
                Kill
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
