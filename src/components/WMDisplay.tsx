import { Window } from "@/components/Window";
import { usePrefrencesStore } from "@/stores/prefrencesStore";
import { useWindowStore } from "@/stores/windowStore";
import fs from "@zenfs/core";
import { AnimatePresence } from "motion/react";
import { useEffect, useRef, useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export const WindowManager = () => {
  const { windows, activeWindowId, focusWindow, closeWindow } =
    useWindowStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefrences = usePrefrencesStore((state) => state.prefrences);
  const updatePrefrence = usePrefrencesStore((state) => state.updatePrefrence);

  const drawImageCover = useCallback(
    (img: HTMLImageElement, ctx: CanvasRenderingContext2D) => {
      const canvas = ctx.canvas;
      const imgRatio = img.width / img.height;
      const canvasRatio = canvas.width / canvas.height;

      let drawWidth = canvas.width;
      let drawHeight = canvas.height;
      let offsetX = 0;
      let offsetY = 0;

      if (canvasRatio > imgRatio) {
        drawHeight = canvas.width / imgRatio;
        offsetY = -(drawHeight - canvas.height) / 2;
      } else {
        drawWidth = canvas.height * imgRatio;
        offsetX = -(drawWidth - canvas.width) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    },
    []
  );

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current?.contains(e.target as Node) === false) {
        focusWindow(null);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [focusWindow]);

  useHotkeys("ctrl+q, command+q", (e) => {
    e.preventDefault();
    if (activeWindowId) closeWindow(activeWindowId);
  });

  useHotkeys("alt+shift+d", () => {
    updatePrefrence("debugMode", !prefrences.debugMode);
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !fs) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();

    if (prefrences.userWallpaper) {
      try {
        const imageData = fs.readFileSync(prefrences.userWallpaper);
        const blob = new Blob([imageData], { type: "image/jpeg" });
        const url = URL.createObjectURL(blob);

        const img = new Image();
        img.src = url;
        img.onload = () => {
          drawImageCover(img, ctx);
          URL.revokeObjectURL(url);
        };

        const handleResize = () => {
          setCanvasSize();
          drawImageCover(img, ctx);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
      } catch (error) {
        console.error("Error loading wallpaper:", error);
      }
    }
  }, [prefrences.userWallpaper, drawImageCover]);

  return (
    <div ref={containerRef} className="h-full w-full fixed z-0">
      <canvas ref={canvasRef} className="h-full w-full fixed z-0" />
      {prefrences.debugMode && (
        <div className="fixed top-0 left-0 z-0">
          <p>Debug Mode Enabled!</p>
          <pre>Window Count: {windows.length}</pre>
          <pre>{activeWindowId}</pre>
        </div>
      )}
      <AnimatePresence>
        {windows.map((window) => (
          <Window
            key={window.id}
            {...window}
            isFocused={window.id === activeWindowId}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
