import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  // WICHTIG: Vite sucht index.html DIREKT hier
  root: path.resolve(__dirname, "client"),

  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },

  build: {
    // Frontend-Build landet hier → Express serviert das
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
});
