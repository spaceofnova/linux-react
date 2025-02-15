import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "shared/components/ui/context-menu";
import { useRegistryStore } from "shared/hooks/registry";

import fs from "@zenfs/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAppStore } from "shared/hooks/appstore";

export const Desktop = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [wallpaperReady, setWallpaperReady] = useState(false);
  const { getKey } = useRegistryStore();
  const wallpaper = getKey("/user/wallpaper");

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
    [],
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

    if (wallpaper) {
      try {
        const imageData = fs.readFileSync(wallpaper);
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
  }, [wallpaper, drawImageCover, wallpaperReady]);

  return (
    <>
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
    </>
  );
};
