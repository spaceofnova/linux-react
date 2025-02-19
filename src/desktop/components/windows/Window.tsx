import { useWindowStore } from "shared/hooks/windowStore";
import { WindowType } from "shared/types/storeTypes";
import { Rnd } from "react-rnd";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Maximize2Icon, MinusIcon, X } from "lucide-react";
import { ErrorBoundary } from "shared/components/ErrorBoundary";
import { useAppStore } from "shared/hooks/appstore";
import { MotionView } from "shared/components/ui/View";
import { readFileSync } from "@zenfs/core";
import { cn } from "shared/utils/cn";
import { type Position, type Size } from "shared/types/general";

// Move store actions outside component to prevent re-renders
const windowActions = {
  focus: (id: string) => useWindowStore.getState().focusWindow(id),
  close: (id: string) => {
    useWindowStore.getState().closeWindow(id);
    useWindowStore.getState().focusWindow(null);
  },
  maximize: (id: string) => useWindowStore.getState().maximizeWindow(id),
  restore: (id: string) => useWindowStore.getState().restoreWindow(id),
  move: (id: string, position: Position, relative: boolean) =>
    useWindowStore.getState().moveWindow(id, position, relative),
  resize: (id: string, size: Size, position: Position) =>
    useWindowStore.getState().resizeWindow(id, size, position),
  minimize: (id: string) => useWindowStore.getState().minimizeWindow(id),
};

export const Window = React.memo<WindowType>((props) => {
  const { id, title } = props;
  // Replace state with ref
  const isDraggingRef = useRef(false);
  const [iframeDoc, setIframeDoc] = useState<string | null>(null);

  // Effects
  useEffect(() => {
    if (props.filePath && !props.ReactElement) {
      try {
        const apps = useAppStore.getState().getApps();
        const folderPath = apps.find((app) => app.id === id)?.folderPath;
        if (folderPath) {
          const html = readFileSync(`${folderPath}/${props.filePath}`, "utf-8");
          setIframeDoc(html);
        }
      } catch (e) {
        console.error(`Failed to read file: ${e}`);
      }
    }
  }, [id, props.filePath, props.ReactElement]);

  const handleMaximize = useCallback(() => {
    if (props.isMaximized) {
      windowActions.restore(id);
    } else {
      windowActions.maximize(id);
    }
  }, [id, props.isMaximized]);

  const handleClose = useCallback(() => {
    windowActions.close(id);
    props.onClose?.();
  }, [id]);

  const renderControls = () => (
    <div className="h-7 w-full inline-flex justify-between items-center titlebar rounded-t-lg overflow-hidden">
      <div className="inline-flex items-center gap-1.5 pl-1.5">
        <p className="text-xs font-medium">{title}</p>
      </div>
      <div className="flex items-center h-full">
        <button
          className="h-7 w-11 flex items-center justify-center hover:bg-white/10"
          onClick={() => windowActions.minimize(id)}
          title="Minimize"
        >
          <MinusIcon className="h-3.5 w-3.5" />
        </button>
        {!props.noResize && (
          <button
            className="h-7 w-11 flex items-center justify-center hover:bg-white/10"
            onClick={handleMaximize}
            title={props.isMaximized ? "Restore" : "Maximize"}
          >
            <Maximize2Icon className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          className="h-7 w-11 flex items-center justify-center hover:bg-red-500/60"
          onClick={handleClose}
          title="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );

  const renderContent = () => (
    <div
      className={cn(
        "w-full",
        props.noControls ? "h-full" : "h-[calc(100%-1.75rem)]"
      )}
    >
      {props.ReactElement ? (
        <props.ReactElement windowProps={props} />
      ) : iframeDoc ? (
        <iframe
          srcDoc={iframeDoc}
          style={{ pointerEvents: isDraggingRef.current ? "none" : "all" }}
          className="w-full h-full"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <p>No content found</p>
        </div>
      )}
    </div>
  );

  return (
    <Rnd
      minWidth={280}
      minHeight={120}
      disableDragging={props.isMaximized}
      onDragStart={() => {
        isDraggingRef.current = true;
      }}
      style={{
        zIndex: props.zIndex,
      }}
      size={{
        width: props.size?.width ?? 800,
        height: props.size?.height ?? 500,
      }}
      position={props.position}
      onDragStop={(_e, d) => {
        windowActions.move(id, d, false);
        isDraggingRef.current = false;
      }}
      onResizeStop={(_e, _direction, ref, _delta, position) => {
        windowActions.resize(
          id,
          {
            width: parseInt(ref.style.width),
            height: parseInt(ref.style.height),
          },
          position
        );
      }}
      enableResizing={!props.noResize}
      onMouseDown={() => windowActions.focus(id)}
      dragHandleClassName="titlebar"
    >
      <MotionView
        className={cn(
          "w-full h-full flex flex-col border",
          props.isFocused ? undefined : "opacity-90"
        )}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.1, ease: [0.4, 0, 0.2, 1] }}
      >
        {!props.noControls && renderControls()}
        <ErrorBoundary errorMessage="An error occurred while rendering the window.">
          {renderContent()}
        </ErrorBoundary>
      </MotionView>
    </Rnd>
  );
});
