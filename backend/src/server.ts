import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import prisma from "./config/db";

import authRoutes from "./routes/auth.routes";
import complaintRoutes from "./routes/complaint.routes";
import adminRoutes from "./routes/admin.routes";
import studentRoutes from "./routes/student.routes";
import aiRoutes from "./routes/ai.routes";
import modulesRoutes from "./routes/modules.routes";
import safetyRoutes from "./routes/safety.routes";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

import path from "path";
import fs from "fs";

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS Configuration
const envOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((o) => o.trim().replace(/\/$/, ""))
  .filter(Boolean);

const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
];

const allowedOrigins = Array.from(new Set([...envOrigins, ...defaultOrigins]));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".netlify.app") ||
        origin.endsWith(".onrender.com") ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy violation for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body Parser with size limit
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Rate Limiter for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 200,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again after 15 minutes." },
});
app.use("/api", apiLimiter);

// Root & Health Check
app.get("/", (_req, res) => {
  res.json({
    name: "A+ Plane API",
    status: "online",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "OK",
      database: "connected",
      message: "Backend and database are healthy and responding.",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Health check database query error:", error?.message || error);
    res.status(503).json({
      status: "ERROR",
      database: "disconnected",
      message: "Database connection check failed.",
      detail: process.env.NODE_ENV !== "production" ? error?.message : undefined,
    });
  }
});

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api", modulesRoutes);
app.use("/api/safety", safetyRoutes);

// Full-stack static asset serving & SPA routing if frontend build is present
const clientBuildPaths = [
  path.resolve(__dirname, "../../frontend/dist"),
  path.resolve(__dirname, "../public"),
  path.resolve(__dirname, "public"),
];

const foundClientPath = clientBuildPaths.find((p) => fs.existsSync(path.join(p, "index.html")));

if (foundClientPath) {
  app.use(express.static(foundClientPath));
  app.get("*", (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(foundClientPath, "index.html"));
  });
}

// 404 Handler for undefined API routes
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "API endpoint not found." });
});

// Centralized Error Handling Middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled Server Error:", err?.message || err);

  const status = typeof err.status === "number" ? err.status : 500;
  const message =
    status >= 500 && process.env.NODE_ENV === "production"
      ? "Internal Server Error. Please contact college support."
      : err.message || "An unexpected error occurred.";

  res.status(status).json({ message });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`🚀 A+ Plane backend running on http://localhost:${PORT}`);
});

// Graceful Shutdown
function handleShutdown(signal: string) {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log("Database disconnected. Server closed cleanly.");
      process.exit(0);
    } catch {
      process.exit(1);
    }
  });
}

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));

export default app;