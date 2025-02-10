import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from '@tailwindcss/vite'

import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: "esnext",
  },
  esbuild: {
    target: "esnext",
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
    },
  },
  plugins: [
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: {
      src: path.resolve(__dirname, "./src"),
      apps: path.resolve(__dirname, "./src/apps"),
      desktop: path.resolve(__dirname, "./src/desktop"),
      installer: path.resolve(__dirname, "./src/installer"),
      shared: path.resolve(__dirname, "./src/shared"),
      system: path.resolve(__dirname, "./src/system"),
    },
  },
});
