import { useWindowStore } from "@/stores/windowStore";
import { WindowType } from "@/types/storeTypes";
import { Rnd } from "react-rnd";
import React, { useCallback } from "react";
import { motion } from "motion/react";
import { easings } from "@/variables/easings";

export const Window: React.FC<WindowType> = ({
  id,
  title,
  x,
  y,
  width,
  height,
  isFocused,
  zIndex,
}) => {
  const { focusWindow, closeWindow, moveWindow, resizeWindow } =
    useWindowStore();

  const handleClose = useCallback(() => {
    closeWindow(id);
    focusWindow(null);
  }, [id, closeWindow, focusWindow]);

  return (
    <Rnd
      style={{ zIndex: zIndex }}
      size={{
        width,
        height,
      }}
      position={{ x, y }}
      onDragStop={(e, d) => {
        moveWindow(id, d.x, d.y, false);
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        resizeWindow(
          id,
          parseInt(ref.style.width),
          parseInt(ref.style.height),
          position
        );
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
      </motion.div>
    </Rnd>
  );
};
