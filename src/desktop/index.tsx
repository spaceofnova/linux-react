import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "shared/components/ui/context-menu";
import { usePrefrencesStore } from "shared/hooks/prefrencesStore";
import Dock from "./components/taskbar/taskbar";

import fs from "@zenfs/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAppStore } from "shared/hooks/appstore";

export const Desktop = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefrences = usePrefrencesStore((state) => state.prefrences);
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
      if (e.target !== canvas) return;
      
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
    <>
      {/* {select.isSelecting && (
        <div
          style={{
            position: "fixed",
            left: select.width < 0 ? select.x + select.width : select.x,
            top: select.height < 0 ? select.y + select.height : select.y,
            width: Math.abs(select.width),
            height: Math.abs(select.height),
            border: "1px solid white/10",
            backgroundColor: "rgba(153, 209, 255, 0.3)",
            zIndex: 10,
            pointerEvents: "none",
            boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.3)",
          }}
        />
      )} */}
      <ContextMenu>
        <ContextMenuTrigger>
          <div ref={containerRef} className="h-full w-full fixed bg-black">
            <canvas
              ref={canvasRef}
              className="h-full w-full fixed z-0 transition-all duration-500"
            />
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem
            className="cursor-pointer"
            onClick={() =>
              useAppStore.getState().launchDeepLink("settings:appearance")
            }
          >
            <p>Change Wallpaper</p>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <Dock />
    </>
  );
};
