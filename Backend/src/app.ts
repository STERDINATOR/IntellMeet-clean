import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import { ZodError } from "zod";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.routes.js";
import { domainRouter } from "./routes/domain.routes.js";
import { aiRouter } from "./routes/ai.routes.js";

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ 
    origin: (origin, callback) => {
      // Allow requests from localhost and 127.0.0.1 on any port (development)
      if (!origin || origin.includes("localhost") || origin.includes("127.0.0.1")) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy violation"));
      }
    },
    credentials: true 
  }));
  app.use(cookieParser());
  app.use(express.json({ limit: "2mb" }));
  app.use(morgan("dev"));

  app.get("/health", (_req, res) => res.json({ ok: true, service: "intellmeet-backend" }));
  app.use("/api/auth", authRouter);
  app.use("/api/ai", aiRouter);
  app.use("/api", domainRouter);

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (err instanceof ZodError) return res.status(400).json({ message: "Validation failed", issues: err.issues });
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  });

  return app;
}
