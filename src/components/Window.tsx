import { useWindowStore } from "@/stores/windowStore";
import { WindowType } from "@/types/storeTypes";
import { Rnd } from "react-rnd";
import React, { useCallback } from "react";
import { motion } from "motion/react";
import { easings } from "@/variables/easings";
import { Maximize2Icon, ShrinkIcon, X } from "lucide-react";

export const Window: React.FC<WindowType> = ({
  id,
  title,
  position,
  size,
  isFocused,
  zIndex,
  isMaximized,
  content,
}) => {
  const {
    focusWindow,
    closeWindow,
    moveWindow,
    resizeWindow,
    maximizeWindow,
    restoreWindow,
  } = useWindowStore();

  const handleClose = useCallback(() => {
    closeWindow(id);
    focusWindow(null);
  }, [id, closeWindow, focusWindow]);

  return (
    <Rnd
      minWidth={200}
      minHeight={200}
      disableDragging={isMaximized}
      style={{ zIndex: zIndex }}
      size={{ width: size?.width ?? 200, height: size?.height ?? 200 }}
      position={position}
      onDragStop={(_e, d) => {
        moveWindow(id, d, false);
      }}
      onResizeStop={(_e, _direction, ref, _delta, position) => {
        const size = {
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
        };

        resizeWindow(id, size, position);
      }}
      onMouseDown={() => focusWindow(id)}
      dragHandleClassName="window-titlebar"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2, ease: easings.easeOutExpo }}
        style={{
          width: "100%",
          height: "100%",
        }}
        className={`window ${isFocused ? "foc" : ""}`}
        id={`window-${id}`}
      >
        <div className="window-titlebar">
          <div className="window-title">{title}</div>
          <div className="window-controls">
            <button
              className="window-button window-maximize flex justify-center items-center"
              onClick={() =>
                !isMaximized ? maximizeWindow(id) : restoreWindow(id)
              }
            >
              {!isMaximized ? (
                <Maximize2Icon size={8} />
              ) : (
                <ShrinkIcon size={8} />
              )}
            </button>
            <button
              className="window-button window-close flex justify-center items-center"
              onClick={handleClose}
            >
              <X size={10} />
            </button>
          </div>
        </div>
        <div
          className="window-content"
          dangerouslySetInnerHTML={{ __html: content || "" }}
        />
      </motion.div>
    </Rnd>
  );
};
