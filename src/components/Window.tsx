import { useWindowStore } from "@/stores/windowStore";
import { WindowType } from "@/types/storeTypes";
import { Rnd } from "react-rnd";
import React, { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { easings } from "@/variables/easings";
import { Maximize2Icon, ShrinkIcon, X } from "lucide-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/appstore";
import fs from "@zenfs/core";

export const Window: React.FC<WindowType> = ({
  id,
  title,
  position,
  size,
  isFocused,
  zIndex,
  isMaximized,
  noControls,
  filePath,
  noResize,
  ReactElement,
}) => {
  // State
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [iframeDoc, setIframeDoc] = useState<string | null>(null);

  // Store hooks
  const {
    focusWindow,
    closeWindow,
    moveWindow,
    resizeWindow,
    maximizeWindow,
    restoreWindow,
  } = useWindowStore();
  const apps = useAppStore.getState().getApps();

  // Handlers
  const handleClose = useCallback(() => {
    if (!id) return;
    closeWindow(id);
    focusWindow(null);
  }, [id, closeWindow, focusWindow]);

  // Effects
  useEffect(() => {
    if (id && filePath && !ReactElement) {
      try {
        const folderPath = apps.find((app) => app.id === id)?.folderPath;
        const html = fs.readFileSync(`${folderPath}/${filePath}`, "utf-8");
        setIframeDoc(html);
      } catch (e) {
        console.error(`Failed to read file: ${e}`);
      }
    }
  }, [id, filePath, ReactElement, apps]);

  if (!id) return null;

  // Render helpers
  const renderControls = () => (
    <div className="h-8 w-full px-2 inline-flex justify-between items-center border-b titlebar">
      <p>{title}</p>
      <div className="inline-flex items-center gap-2">
        {!noResize && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            title={isMaximized ? "Restore" : "Maximize"}
            onClick={() =>
              !isMaximized ? maximizeWindow(id) : restoreWindow(id)
            }
          >
            {!isMaximized ? (
              <Maximize2Icon size={6} />
            ) : (
              <ShrinkIcon size={6} />
            )}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleClose}
          title="Close"
        >
          <X size={6} />
        </Button>
      </div>
    </div>
  );

  const renderContent = () => (
    <div
      className={`w-full ${
        noControls ? "h-full" : "h-[calc(100%-2rem)]"
      } overflow-scroll`}
    >
      {ReactElement ? (
        <ReactElement id={id} />
      ) : iframeDoc ? (
        <iframe
          srcDoc={iframeDoc}
          style={{ pointerEvents: isDragging ? "none" : "all" }}
          className="w-full h-full"
        />
      ) : (
        <div className="w-full h-full bg-background">
          <p>No content found</p>
        </div>
      )}
    </div>
  );

  // Main render
  return (
    <Rnd
      minWidth={200}
      minHeight={200}
      disableDragging={isMaximized}
      onDragStart={() => setIsDragging(true)}
      style={{ zIndex }}
      size={{ width: size?.width ?? 200, height: size?.height ?? 200 }}
      position={position}
      onDragStop={(_e, d) => {
        moveWindow(id, d, false);
        setIsDragging(false);
      }}
      onResizeStop={(_e, _direction, ref, _delta, position) => {
        resizeWindow(
          id,
          {
            width: parseInt(ref.style.width),
            height: parseInt(ref.style.height),
          },
          position
        );
      }}
      enableResizing={!noResize}
      onMouseDown={() => focusWindow(id)}
      dragHandleClassName={noControls ? "drag" : "titlebar"}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2, ease: easings.easeOutExpo }}
        style={{ width: "100%", height: "100%" }}
        className={`bg-background border ${isMaximized ? "" : "rounded-sm"} ${
          isFocused ? "border-primary" : ""
        }`}
        id={`window-${id}`}
      >
        {!noControls && renderControls()}
        <ErrorBoundary errorMessage="An error occurred while rendering the window.">
          {renderContent()}
        </ErrorBoundary>
      </motion.div>
    </Rnd>
  );
};
