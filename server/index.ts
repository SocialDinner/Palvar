import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { createServer } from "http";
import path from "path";

const app = express();
const httpServer = createServer(app);

// Typ-Erweiterung für rawBody
declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// Middleware für JSON und URL Encoded
app.use(
  express.json({
    verify: (req: Request, _res: Response, buf: Buffer) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: false }));

// Logging Funktion
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// Request Logging Middleware für /api
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  let capturedJsonResponse: Record<string, any> | undefined;

  // Original res.json speichern
  const originalResJson = res.json.bind(res);

  // Override res.json
  res.json = function (bodyJson: any) {
    capturedJsonResponse = bodyJson;
    return originalResJson(bodyJson);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      let logLine = `${req.method} ${req.path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Routes registrieren
    await registerRoutes(httpServer, app);

    // Error Middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      throw err;
    });

    // Production Static-Serving
    if (process.env.NODE_ENV === "production") {
      const distPath = path.join(process.cwd(), "dist/public");
      app.use(express.static(distPath));
      app.get("*", (_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    } else {
      // Development: Vite HMR
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
    }

    // Server starten
    const port = parseInt(process.env.PORT || "5000", 10);
    const host = process.env.HOST || "0.0.0.0";

    httpServer.listen({ port, host }, () =>
      log(`Server running at http://${host}:${port}`)
    );
  } catch (err) {
    console.error("Fehler beim Starten des Servers:", err);
    process.exit(1);
  }
})();
