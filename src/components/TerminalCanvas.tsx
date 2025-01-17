import { useRef, useEffect } from "react";

const TerminalCanvas = ({ lines }: { lines: string[] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Set text properties
    context.font = "16px monospace";
    context.fillStyle = "white";
    context.textBaseline = "top";

    // Render each line to the canvas
    lines.forEach((line, index) => {
      context.fillText(line, 10, index * 20); // 10px padding and 20px line height
    });
  }, [lines]); // Re-run the effect whenever `lines` changes

  return <canvas ref={canvasRef} />;
};

export default TerminalCanvas;
