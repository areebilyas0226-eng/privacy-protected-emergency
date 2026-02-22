import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import pool from "./db.js";
import qrRoutes from "./routes/qr.routes.js";
import emergencyRoutes from "./routes/emergency.routes.js";
import otpRoutes from "./routes/otp.routes.js";
import maskedRoutes from "./routes/masked.routes.js";
import adminRoutes from "./routes/admin.routes.js";

dotenv.config();

const app = express();

/* =========================
   REQUIRED ENV VALIDATION
========================= */
if (!process.env.PORT) {
  console.error("PORT not provided by Railway");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not defined");
  process.exit(1);
}

const PORT = process.env.PORT;

/* =========================
   TRUST PROXY
========================= */
app.set("trust proxy", 1);

/* =========================
   SECURITY
========================= */
app.use(helmet());

/* =========================
   CORS
========================= */
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);

/* =========================
   BODY PARSER
========================= */
app.use(express.json({ limit: "10kb" }));

/* =========================
   RATE LIMITING
========================= */
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false
  })
);

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30
});

/* =========================
   ROUTES
========================= */
app.use("/api/qr", qrRoutes(pool));
app.use("/api/emergency", emergencyRoutes(pool));
app.use("/api/otp", otpRoutes(pool));
app.use("/api/masked", maskedRoutes(pool));
app.use("/api/admin", adminLimiter, adminRoutes(pool));

/* =========================
   ROOT
========================= */
app.get("/", (req, res) => {
  res.status(200).json({ message: "API running" });
});

/* =========================
   HEALTH CHECK (Railway Critical)
========================= */
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({
      status: "ok",
      db: "connected",
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("Health check DB error:", err);
    res.status(500).json({
      status: "error",
      db: "disconnected"
    });
  }
});

/* =========================
   404
========================= */
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

/* =========================
   GLOBAL ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

/* =========================
   START SERVER
========================= */
let server;

const startServer = async () => {
  try {
    // Validate DB before listening
    await pool.query("SELECT 1");
    console.log("Database connected successfully");

    server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  }
};

startServer();

/* =========================
   GRACEFUL SHUTDOWN
========================= */
const shutdown = async () => {
  console.log("Shutdown signal received");

  if (server) {
    server.close(async () => {
      try {
        await pool.end();
        console.log("Database pool closed");
        process.exit(0);
      } catch (err) {
        console.error("Error during shutdown:", err);
        process.exit(1);
      }
    });
  }
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);