import React, { useEffect, useRef } from 'react';

interface CanvasImageProps {
   imageData?: ImageData;
  src?: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const CanvasImage: React.FC<CanvasImageProps> = ({
  imageData,
  src,
  width,
  height,
  className,
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (imageData) {
      // If ImageData is provided, render it directly
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      ctx.putImageData(imageData, 0, 0);
    } else if (src) {
      // If src is provided, load and render the image
      const img = new Image();
      img.onload = () => {
        const w = width || img.width;
        const h = height || img.height;
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
      };
      img.src = src;
    }
  }, [imageData, src, width, height]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        display: 'block',
        ...style,
      }}
    />
  );
};
