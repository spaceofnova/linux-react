import { useEffect, useRef, useState } from "react";

export default function FPSGraph() {
  const [fps, setFps] = useState<number[]>([]);
  const [frameTime, setFrameTime] = useState(0);
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const framesCountRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(performance.now());
  const maxDataPoints = 30;
  const updateInterval = 200;

  useEffect(() => {
    const updateFPS = () => {
      const currentTime = performance.now();
      framesCountRef.current++;

      // Update FPS calculation every updateInterval
      if (currentTime - lastUpdateRef.current >= updateInterval) {
        const elapsedTime = currentTime - lastUpdateRef.current;
        const currentFps = Math.round((framesCountRef.current * 1000) / elapsedTime);
        const avgFrameTime = elapsedTime / framesCountRef.current;
        
        setFps(prev => {
          const newFps = [...prev, currentFps];
          if (newFps.length > maxDataPoints) {
            newFps.shift();
          }
          return newFps;
        });
        setFrameTime(avgFrameTime);

        // Reset counters
        framesCountRef.current = 0;
        lastUpdateRef.current = currentTime;
      }

      frameRef.current = requestAnimationFrame(updateFPS);
    };

    frameRef.current = requestAnimationFrame(updateFPS);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed left-2 top-2 bg-background/80 backdrop-blur p-2 rounded-lg">
      <div className="flex items-end h-24 gap-0.5">
        {fps.map((value, i) => (
          <div
            key={i}
            className="w-1 bg-primary"
            style={{
              height: `${Math.min(100, value)}%`,
            }}
          />
        ))}
      </div>
      <div className="text-xs text-center mt-1">
        {fps.length > 0 ? `${fps[fps.length - 1]} FPS` : '-- FPS'}
        <span className="text-muted-foreground ml-2">
          ({frameTime.toFixed(1)}ms)
        </span>
      </div>
    </div>
  );
}
