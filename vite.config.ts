import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
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
    react({
      // @ts-ignore
      babel: {
        plugins: [["babel-plugin-react-compiler", { target: "19" }]],
      },
    }),
  ],
  resolve: {
    alias: {
      "src": path.resolve(__dirname, "./src"),
      "apps": path.resolve(__dirname, "./src/apps"),
      "desktop": path.resolve(__dirname, "./src/desktop"),
      "installer": path.resolve(__dirname, "./src/installer"),
      "shared": path.resolve(__dirname, "./src/shared"),
      "system": path.resolve(__dirname, "./src/system")
    },
  },
});
