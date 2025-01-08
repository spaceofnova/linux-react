import { Window } from "@/components/Window";
import { usePrefrencesStore } from "@/stores/prefrencesStore";
import { useWindowStore } from "@/stores/windowStore";
import fs from "@zenfs/core";
import { AnimatePresence } from "motion/react";
import { useEffect, useRef, useCallback, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Link } from "./ui/link";

export const WindowManager = () => {
  const { windows, activeWindowId, focusWindow, closeWindow } =
    useWindowStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefrences = usePrefrencesStore((state) => state.prefrences);
  const updatePrefrence = usePrefrencesStore((state) => state.updatePrefrence);
  const [wallpaperReady, setWallpaperReady] = useState(false);
  const [select, setSelect] = useState({
    isSelecting: false,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

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
    updatePrefrence("developer.debugMode", !prefrences.developer?.debugMode);
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

    if (prefrences.appearance?.userWallpaper) {
      try {
        const imageData = fs.readFileSync(prefrences.appearance?.userWallpaper);
        const blob = new Blob([imageData], { type: "image/*" });
        const url = URL.createObjectURL(blob);

        const img = new Image();
        img.src = url;
        img.onload = () => {
          drawImageCover(img, ctx);
          URL.revokeObjectURL(url);
          setWallpaperReady(true);
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
    } else {
      console.log("No wallpaper set");
    }
  }, [prefrences.appearance?.userWallpaper, drawImageCover, wallpaperReady]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!select.isSelecting) return;

      const width = e.clientX - select.x;
      const height = e.clientY - select.y;

      setSelect({
        ...select,
        width,
        height,
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (select.isSelecting) return;

      setSelect({
        isSelecting: true,
        x: e.clientX,
        y: e.clientY,
        width: 0,
        height: 0,
      });
    };

    const handleMouseUp = () => {
      setSelect({
        isSelecting: false,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      });
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, [select]);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div ref={containerRef} className="h-full w-full fixed z-0">
          <canvas
            ref={canvasRef}
            className="h-full w-full fixed z-0 transition-all duration-500"
            style={{
              filter: wallpaperReady ? "blur(0px)" : "blur(12px)",
              opacity: wallpaperReady ? 1 : 0,
            }}
          />
          {prefrences.developer?.debugMode && (
            <div className="fixed top-0 left-0 z-0">
              <p>Debug Mode Enabled!</p>
              <pre>Window Count: {windows.length}</pre>
              <pre>{activeWindowId}</pre>
              <pre>
                {JSON.stringify(
                  windows.find((w) => w.id === activeWindowId),
                  null,
                  2
                )}
              </pre>
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
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>
          <Link href="settings:appearance">Change Wallpaper</Link>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
