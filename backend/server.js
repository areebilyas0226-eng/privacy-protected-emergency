import dotenv from "dotenv";
dotenv.config();

/* =========================
   IMPORTS
========================= */
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import pool from "./db.js";
import qrRoutes from "./routes/qr.routes.js";
import emergencyRoutes from "./routes/emergency.routes.js";
import otpRoutes from "./routes/otp.routes.js";
import maskedRoutes from "./routes/masked.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import profileRoutes from "./routes/profiles.routes.js";

/* =========================
   PORT (Railway Safe)
========================= */
const PORT = process.env.PORT || 5000;

/* =========================
   APP INIT
========================= */
const app = express();
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
  "http://localhost:4173",
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
   GLOBAL RATE LIMIT
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
app.use("/api/profile", profileRoutes(pool));
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
   HEALTH CHECK
========================= */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime()
  });
});

/* =========================
   404 HANDLER
========================= */
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

/* =========================
   ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

/* =========================
   START SERVER
========================= */
const startServer = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("Database connected");
  } catch (err) {
    console.error("Database connection failed:", err);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

/* =========================
   GRACEFUL SHUTDOWN
========================= */
const shutdown = async () => {
  console.log("Shutdown signal received");

  try {
    await pool.end();
    console.log("Database pool closed");
  } catch (err) {
    console.error("Shutdown DB error:", err);
  }

  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);