import express, { type Express } from "express";
import path from "path";
import fs from "fs";

export function serveStatic(app: Express) {
  // Pfad zum gebauten Frontend
  const distPath = path.resolve(__dirname, "../client/dist");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find frontend build directory: ${distPath}. Did you run the client build?`
    );
  }

  // Statische Dateien (JS, CSS, Assets)
  app.use(express.static(distPath));

  // SPA-Fallback → index.html
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}
