import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useRegistryStore } from "shared/hooks/registry";
import fs from "@zenfs/core";
import { DesktopContextMenu } from "./contextMenu";

interface SelectionBoxState {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

// Custom hook for wallpaper handling
const useWallpaper = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  drawImageCover: (img: HTMLImageElement, ctx: CanvasRenderingContext2D) => void
): boolean => {
  const [wallpaperReady, setWallpaperReady] = useState<boolean>(false);
  const { getKey } = useRegistryStore();
  const wallpaper = getKey("/user/wallpaper");
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !fs) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setCanvasSize = (): void => {
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
        imgRef.current = img;
        img.src = url;

        img.onload = (): void => {
          drawImageCover(img, ctx);
          URL.revokeObjectURL(url);
          setWallpaperReady(true);
        };

        const handleResize = (): void => {
          setCanvasSize();
          if (imgRef.current) {
            drawImageCover(imgRef.current, ctx);
          }
        };

        window.addEventListener("resize", handleResize);
        return () => {
          window.removeEventListener("resize", handleResize);
          URL.revokeObjectURL(url);
        };
      } catch (error) {
        console.error("Error loading wallpaper:", error);
      }
    }
  }, [wallpaper, drawImageCover, canvasRef]);

  return wallpaperReady;
};

const SelectionBox = memo(
  ({
    isSelecting,
    selectionBox,
  }: {
    isSelecting: boolean;
    selectionBox: SelectionBoxState;
  }) => {
    if (!isSelecting) return null;

    const left = Math.min(selectionBox.startX, selectionBox.endX);
    const top = Math.min(selectionBox.startY, selectionBox.endY);
    const width = Math.abs(selectionBox.endX - selectionBox.startX);
    const height = Math.abs(selectionBox.endY - selectionBox.startY);

    return (
      <div
        className="absolute border border-[#99d1ff] bg-[#99d1ff]/30 pointer-events-none z-10"
        style={{
          left: `${left}px`,
          top: `${top}px`,
          width: `${width}px`,
          height: `${height}px`,
        }}
      />
    );
  }
);

SelectionBox.displayName = "SelectionBox";

// Main Desktop component
export const Desktop = memo(() => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [selectionBox, setSelectionBox] = useState<SelectionBoxState>({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
  });

  const drawImageCover = useCallback(
    (img: HTMLImageElement, ctx: CanvasRenderingContext2D): void => {
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

  useWallpaper(canvasRef as React.RefObject<HTMLCanvasElement>, drawImageCover);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>): void => {
      if (e.button !== 0) return;

      const { clientX, clientY } = e;
      setIsSelecting(true);
      setSelectionBox({
        startX: clientX,
        startY: clientY,
        endX: clientX,
        endY: clientY,
      });
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>): void => {
      if (!isSelecting) return;

      setSelectionBox((prev) => ({
        ...prev,
        endX: e.clientX,
        endY: e.clientY,
      }));
    },
    [isSelecting]
  );

  const handleMouseUp = useCallback((): void => {
    setIsSelecting(false);
  }, []);

  return (
    <DesktopContextMenu>
      <div
        ref={containerRef}
        className="fixed inset-0 bg-black"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <canvas
          ref={canvasRef}
          className="fixed inset-0 z-0 transition-all duration-500"
        />
        <SelectionBox isSelecting={isSelecting} selectionBox={selectionBox} />
      </div>
    </DesktopContextMenu>
  );
});

Desktop.displayName = "Desktop";

export default Desktop;
