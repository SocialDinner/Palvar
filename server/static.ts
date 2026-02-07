import express, { type Express } from "express";
import path from "path";
import fs from "fs";

export function serveStatic(app: Express) {
  // Pfad zum Frontend (client-Ordner)
  const clientPath = path.resolve(__dirname, "../client");

  if (!fs.existsSync(clientPath)) {
    throw new Error(`Could not find the client directory: ${clientPath}`);
  }

  // Statische Dateien aus public ausliefern
  app.use(express.static(clientPath));

  // Alle anderen GET-Anfragen → index.html
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
}
