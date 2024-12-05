import { useWindowStore } from "@/stores/windowStore";
import { WindowType } from "@/types/storeTypes";
import { Rnd } from "react-rnd";
import React, { useCallback } from "react";
import { motion } from "motion/react";
import { easings } from "@/variables/easings";
import { Maximize2Icon, Minimize2Icon } from "lucide-react";

export const Window: React.FC<WindowType> = ({
  id,
  title,
  position,
  size,
  isFocused,
  zIndex,
  isMaximized,
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
      style={{ zIndex: zIndex }}
      size={{ width: size.width, height: size.height }}
      position={position}
      onDragStop={(e, d) => {
        moveWindow(id, d.x, d.y, false);
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        const size = {
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
        };

        resizeWindow(id, size, position);
      }}
      onMouseDown={() => focusWindow(id)}
    >
      <motion.div
        data-id={id}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2, ease: easings.easeOutExpo }}
        style={{
          backgroundColor: isFocused ? "green" : "red",
          width: "100%",
          height: "100%",
        }}
        className="shadow-xl"
      >
        {title}
        {isFocused ? "true" : "false"}
        <button onClick={handleClose}>Close me</button>
        {isMaximized ? (
          <button onClick={() => restoreWindow(id)}>
            <Minimize2Icon />
          </button>
        ) : (
          <button onClick={() => maximizeWindow(id)}>
            <Maximize2Icon />
          </button>
        )}
      </motion.div>
    </Rnd>
  );
};
