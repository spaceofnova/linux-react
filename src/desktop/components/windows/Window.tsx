import { useWindowStore } from "shared/hooks/windowStore";
import { WindowType } from "shared/types/storeTypes";
import { Rnd } from "react-rnd";
import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
} from "react";
import { Maximize2Icon, ShrinkIcon, X } from "lucide-react";
import { ErrorBoundary } from "shared/components/ErrorBoundary";
import { Button } from "shared/components/ui/button";
import { useAppStore } from "shared/hooks/appstore";
import fs from "@zenfs/core";
import { MotionView } from "shared/components/ui/View";

type WindowProps = WindowType & {
  isFocused?: boolean;
};

// Move store actions outside component to prevent re-renders
const windowActions = {
  focus: (id: string) => useWindowStore.getState().focusWindow(id),
  close: (id: string) => {
    useWindowStore.getState().closeWindow(id);
    useWindowStore.getState().focusWindow(null);
  },
  maximize: (id: string) => useWindowStore.getState().maximizeWindow(id),
  restore: (id: string) => useWindowStore.getState().restoreWindow(id),
  move: (id: string, position: any, relative: boolean) =>
    useWindowStore.getState().moveWindow(id, position, relative),
  resize: (id: string, size: any, position: any) =>
    useWindowStore.getState().resizeWindow(id, size, position),
};

export const Window = React.memo<WindowProps>((props) => {
  const { id, title } = props;

  // Early return if no id
  if (!id) return null;

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
          const html = fs.readFileSync(
            `${folderPath}/${props.filePath}`,
            "utf-8"
          );
          setIframeDoc(html);
        }
      } catch (e) {
        console.error(`Failed to read file: ${e}`);
      }
    }
  }, [id, props.filePath, props.ReactElement]);

  const renderControls = () => (
    <div className="h-8 w-full px-2 inline-flex justify-between items-center border-b titlebar">
      <p>{title}</p>
      <div className="inline-flex items-center gap-2">
        {!props.noResize && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            title={props.isMaximized ? "Restore" : "Maximize"}
            onClick={() =>
              !props.isMaximized
                ? windowActions.maximize(id)
                : windowActions.restore(id)
            }
          >
            {!props.isMaximized ? (
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
          onClick={() => windowActions.close(id)}
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
        props.noControls ? "h-full" : "h-[calc(100%-2rem)]"
      } overflow-scroll`}
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
        <div className="w-full h-full bg-background">
          <p>No content found</p>
        </div>
      )}
    </div>
  );

  const variants = useMemo(
    () => ({
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.8 },
      transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
    }),
    []
  );

  return (
    <Rnd
      minWidth={200}
      minHeight={200}
      disableDragging={props.isMaximized}
      onDragStart={() => {
        isDraggingRef.current = true;
      }}
      style={{ zIndex: props.zIndex }}
      size={{
        width: props.size?.width ?? 200,
        height: props.size?.height ?? 200,
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
      dragHandleClassName={"titlebar"}
    >
      <MotionView
        className="w-full h-full"
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={variants.transition}
      >
        {!props.noControls && renderControls()}
        <ErrorBoundary errorMessage="An error occurred while rendering the window.">
          {useMemo(() => renderContent(), [props.ReactElement, iframeDoc])}
        </ErrorBoundary>
      </MotionView>
    </Rnd>
  );
});
