import { useRef, useEffect, useState } from "react";
import html2canvas from "html2canvas";

const vertexShaderSource = `
  attribute vec2 position;
  attribute vec2 texcoord;
  varying vec2 vTexCoord;
  void main() {
    vTexCoord = texcoord;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  varying vec2 vTexCoord;
  uniform sampler2D uTexture;
  void main() {
    vec4 color = texture2D(uTexture, vTexCoord);
    gl_FragColor = color;
  }
`;

interface ReactCanvasRenderProps {
  children: React.ReactNode;
  height?: string | number; // Optional height prop
}

const ReactCanvasRender: React.FC<ReactCanvasRenderProps> = ({ children, height = "100vh" }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const [captured, setCaptured] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Initialize WebGL context
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Ensure canvas is properly sized
    const updateCanvasSize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      
      // Get container dimensions
      const containerRect = containerRef.current.getBoundingClientRect();
      console.log("📦 Container size:", containerRect.width, "x", containerRect.height);
      
      if (containerRect.width === 0 || containerRect.height === 0) {
        console.warn("⚠️ Container has zero dimensions");
        return;
      }

      // Update canvas dimensions
      canvasRef.current.width = containerRect.width;
      canvasRef.current.height = containerRect.height;
      setDimensions({ width: containerRect.width, height: containerRect.height });
      
      console.log("📏 Canvas size in DOM:", containerRect.width, "x", containerRect.height);

      // If we have a GL context, update the viewport
      if (glRef.current) {
        glRef.current.viewport(0, 0, containerRect.width, containerRect.height);
      }
    };

    // Initial size update
    requestAnimationFrame(() => {
      updateCanvasSize();
    });

    console.log("🔍 Attempting WebGL initialization...");
    const contextAttributes: WebGLContextAttributes = {
      alpha: true,
      antialias: true,
      depth: false, // We don't need depth for 2D rendering
      failIfMajorPerformanceCaveat: false,
      powerPreference: "default",
      premultipliedAlpha: true,
      preserveDrawingBuffer: true,
      stencil: false
    };

    const gl = canvasRef.current.getContext("webgl", contextAttributes);
    
    if (!gl) {
      console.error("❌ WebGL initialization failed");
      return;
    }

    // Store GL context for later use
    glRef.current = gl;

    // Clear with transparency
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Enable alpha blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Listen for resize
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(canvasRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Handle html2canvas and rendering
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current || !glRef.current) return;

    const gl = glRef.current;
    const container = containerRef.current;

    // Make sure content is visible during capture
    container.style.visibility = 'visible';
    container.style.opacity = '1';
    container.style.zIndex = '1';

    setTimeout(() => {
      const options = {
        backgroundColor: null,
        allowTaint: true,
        useCORS: true,
        foreignObjectRendering: true,
        removeContainer: false,
        logging: true,
        imageTimeout: 0,
        scale: window.devicePixelRatio || 1,
        ignoreElements: (element: Element) => {
          return element === canvasRef.current;
        }
      };

      console.log("📸 Starting canvas capture...");
      html2canvas(container, options).then((canvas) => {
        console.log("🖼️ Canvas captured:", canvas.width, "x", canvas.height);
        if (canvas.width === 0 || canvas.height === 0) {
          console.error("❌ Canvas capture failed - zero dimensions");
          return;
        }

        try {
          // Create and set up texture
          const texture = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_2D, texture);
          
          // Set texture parameters
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

          // Upload the texture
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);

          // Compile shader helper function
          const compileShader = (source: string, type: number): WebGLShader | null => {
            const shader = gl.createShader(type);
            if (!shader) return null;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
              console.error(`Shader Error: ${gl.getShaderInfoLog(shader)}`);
              return null;
            }
            return shader;
          };

          // Set up shaders and program
          const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
          const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
          if (!vertexShader || !fragmentShader) return;

          const program = gl.createProgram();
          if (!program) return;
          gl.attachShader(program, vertexShader);
          gl.attachShader(program, fragmentShader);
          gl.linkProgram(program);
          gl.useProgram(program);

          // Set up geometry and texture coordinates
          const positions = new Float32Array([
            -1, -1,  // Bottom left
             1, -1,  // Bottom right
            -1,  1,  // Top left
             1,  1   // Top right
          ]);

          const texcoords = new Float32Array([
            0, 1,    // Bottom left
            1, 1,    // Bottom right
            0, 0,    // Top left
            1, 0     // Top right
          ]);

          // Set up position buffer
          const positionBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
          const positionAttrib = gl.getAttribLocation(program, "position");
          gl.enableVertexAttribArray(positionAttrib);
          gl.vertexAttribPointer(positionAttrib, 2, gl.FLOAT, false, 0, 0);

          // Set up texcoord buffer
          const texcoordBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, texcoords, gl.STATIC_DRAW);
          const texcoordAttrib = gl.getAttribLocation(program, "texcoord");
          gl.enableVertexAttribArray(texcoordAttrib);
          gl.vertexAttribPointer(texcoordAttrib, 2, gl.FLOAT, false, 0, 0);

          // Set up texture
          const textureLocation = gl.getUniformLocation(program, "uTexture");
          gl.uniform1i(textureLocation, 0);

          // Clear and draw
          gl.clearColor(0.0, 0.0, 0.0, 0.0);
          gl.clear(gl.COLOR_BUFFER_BIT);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

          // After successful render, make original content invisible but keep it interactive
          container.style.opacity = '0';
          container.style.visibility = 'visible'; // Keep it visible for events
          container.style.zIndex = '1';
          setCaptured(true);

        } catch (error) {
          console.error("❌ Error during WebGL rendering:", error);
          // Show original content if render fails
          container.style.visibility = 'visible';
          container.style.opacity = '1';
          container.style.zIndex = '1';
        }
      });
    }, 100);
  }, []);

  return (
    <div style={{ 
      position: "relative", 
      width: "100%", 
      height, 
      minHeight: typeof height === 'number' ? `${height}px` : height,
      overflow: "hidden",
      background: "transparent"
    }}>
      <div 
        ref={containerRef} 
        style={{ 
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          visibility: "visible",
          opacity: captured ? 0 : 1,
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          background: "transparent",
          transition: "opacity 0.2s ease-in-out"
        }}
        data-testid="content-container"
      >
        {children}
      </div>
      <canvas 
        ref={canvasRef} 
        width={dimensions.width || 500} 
        height={dimensions.height || 500} 
        style={{ 
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
          zIndex: captured ? 1 : -1,
          background: "transparent",
          pointerEvents: "none", // Allow events to pass through
          touchAction: "none"    // Prevent touch event issues
        }}
        data-testid="webgl-canvas"
      />
    </div>
  );
};

export default ReactCanvasRender;




export const WebGLTest = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const gl = canvasRef.current.getContext("webgl");

    if (!gl) {
      console.error("WebGL failed to initialize");
      return;
    }

    gl.clearColor(0.0, 1.0, 0.0, 1.0); // Green screen
    gl.clear(gl.COLOR_BUFFER_BIT);
  }, []);

  return <canvas ref={canvasRef} width={500} height={500} />;
};

