import { useWindowStore } from "@/stores/windowStore";
import { WindowType } from "@/types/storeTypes";
import { Rnd } from "react-rnd";
import React, { useCallback, useEffect, useState } from "react";
import { easings } from "@/lib/easings";
import { Maximize2Icon, ShrinkIcon, X } from "lucide-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/appstore";
import fs from "@zenfs/core";
import { usePrefrencesStore } from "@/stores/prefrencesStore";
import { MotionView } from "./ui/View";

export const Window: React.FC<WindowType> = ({ ...windowProps }) => {
  // Early return if no id
  if (!windowProps.id) return null;

  // State
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [iframeDoc, setIframeDoc] = useState<string | null>(null);
  const prefrences = usePrefrencesStore.getState().prefrences;

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
    closeWindow(windowProps.id!);
    focusWindow(null);
  }, [windowProps.id, closeWindow, focusWindow]);

  // Effects
  useEffect(() => {
    if (windowProps.filePath && !windowProps.ReactElement) {
      try {
        const folderPath = apps.find(
          (app) => app.id === windowProps.id
        )?.folderPath;
        const html = fs.readFileSync(
          `${folderPath}/${windowProps.filePath}`,
          "utf-8"
        );
        setIframeDoc(html);
      } catch (e) {
        console.error(`Failed to read file: ${e}`);
      }
    }
  }, [windowProps.id, windowProps.filePath, windowProps.ReactElement, apps]);

  // Render helpers
  const renderControls = () => (
    <div className="h-8 w-full px-2 inline-flex justify-between items-center border-b titlebar">
      <p>{windowProps.title}</p>
      <div className="inline-flex items-center gap-2">
        {!windowProps.noResize && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            title={windowProps.isMaximized ? "Restore" : "Maximize"}
            onClick={() =>
              !windowProps.isMaximized
                ? maximizeWindow(windowProps.id!)
                : restoreWindow(windowProps.id!)
            }
          >
            {!windowProps.isMaximized ? (
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
        windowProps.noControls ? "h-full" : "h-[calc(100%-2rem)]"
      } overflow-scroll`}
    >
      {windowProps.ReactElement ? (
        <windowProps.ReactElement windowProps={{ ...windowProps }} />
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
      disableDragging={windowProps.isMaximized}
      onDragStart={() => setIsDragging(true)}
      style={{ zIndex: windowProps.zIndex }}
      size={{
        width: windowProps.size?.width ?? 200,
        height: windowProps.size?.height ?? 200,
      }}
      position={windowProps.position}
      onDragStop={(_e, d) => {
        moveWindow(windowProps.id!, d, false);
        setIsDragging(false);
      }}
      onResizeStop={(_e, _direction, ref, _delta, position) => {
        resizeWindow(
          windowProps.id!,
          {
            width: parseInt(ref.style.width),
            height: parseInt(ref.style.height),
          },
          position
        );
      }}
      enableResizing={!windowProps.noResize}
      onMouseDown={() => focusWindow(windowProps.id!)}
      dragHandleClassName={"titlebar"}
    >
      <MotionView
        className="w-full h-full"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2, ease: easings.easeOutExpo }}
        data-window-id={windowProps.id}
      >
        {!windowProps.noControls && renderControls()}
        <ErrorBoundary errorMessage="An error occurred while rendering the window.">
          {renderContent()}
        </ErrorBoundary>
      </MotionView>
    </Rnd>
  );
};
