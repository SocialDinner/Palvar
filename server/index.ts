import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import { createServer } from "http";
import path from "path";
import { registerRoutes } from "./routes";

const app = express();
const httpServer = createServer(app);

/* -------------------------------------------------------------------------- */
/*                              RawBody Typing                                */
/* -------------------------------------------------------------------------- */
declare module "http" {
  interface IncomingMessage {
    rawBody?: Buffer;
  }
}

/* -------------------------------------------------------------------------- */
/*                               Middlewares                                  */
/* -------------------------------------------------------------------------- */
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

/* -------------------------------------------------------------------------- */
/*                                   Logging                                  */
/* -------------------------------------------------------------------------- */
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

/* -------------------------------------------------------------------------- */
/*                        API Request Logging (/api)                           */
/* -------------------------------------------------------------------------- */
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  let capturedJsonResponse: unknown;

  const originalJson = res.json.bind(res);

  res.json = (body: any) => {
    capturedJsonResponse = body;
    return originalJson(body);
  };

  res.on("finish", () => {
    if (!req.path.startsWith("/api")) return;

    const duration = Date.now() - start;
    let line = `${req.method} ${req.path} ${res.statusCode} in ${duration}ms`;

    if (capturedJsonResponse) {
      try {
        line += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      } catch {
        /* ignore circular JSON */
      }
    }

    log(line);
  });

  next();
});

/* -------------------------------------------------------------------------- */
/*                               App Bootstrap                                 */
/* -------------------------------------------------------------------------- */
(async () => {
  try {
    await registerRoutes(httpServer, app);

    /* ---------------------------- Error Handling --------------------------- */
    app.use(
      (err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err?.status ?? err?.statusCode ?? 500;
        const message = err?.message ?? "Internal Server Error";
        res.status(status).json({ message });
      },
    );

    /* --------------------------- Production Build --------------------------- */
    if (process.env.NODE_ENV === "production") {
      const distPath = path.resolve(process.cwd(), "dist/public");

      app.use(express.static(distPath));

      app.get("*", (_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    } else {
      /* ------------------------------ Dev (Vite) ---------------------------- */
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
    }

    /* ------------------------------ Start Server ---------------------------- */
    const port = Number(process.env.PORT) || 5000;
    const host = process.env.HOST || "0.0.0.0";

    httpServer.listen(port, host, () => {
      log(`Server running at http://${host}:${port}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
})();
