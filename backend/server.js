import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import pool from "./db.js";

import qrRoutes from "./routes/qr.routes.js";
import emergencyRoutes from "./routes/emergency.routes.js";
import otpRoutes from "./routes/otp.routes.js";
import maskedRoutes from "./routes/masked.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import profileRoutes from "./routes/profiles.routes.js";
import publicRoutes from "./routes/public.routes.js";
import tagRoutes from "./routes/tag.routes.js";

/* =========================
APP INIT
========================= */

const app = express();
app.set("trust proxy", 1);

const PORT = process.env.PORT || 8080;

/* =========================
SECURITY
========================= */

app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

/* =========================
REQUEST LOGGING
========================= */

app.use((req, res, next) => {
  console.log(req.method, req.originalUrl);
  next();
});

/* =========================
CORS
========================= */

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);

      console.warn("Blocked by CORS:", origin);
      return cb(null, false);
    },
    credentials: true
  })
);

/* =========================
HEALTHCHECK
========================= */

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.get("/", (req, res) => {
  res.status(200).send("API Running");
});

/* =========================
RATE LIMIT
========================= */

const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300
});

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5
});

app.use("/api", publicLimiter);

/* =========================
ROUTES
========================= */

app.use("/api/qr", qrRoutes(pool));
app.use("/api/emergency", emergencyRoutes(pool));
app.use("/api/profile", profileRoutes(pool));
app.use("/api/otp", otpRoutes(pool));
app.use("/api/masked", maskedRoutes(pool));
app.use("/api/tags", tagRoutes(pool));

app.use("/api/admin/login", adminLoginLimiter);
app.use("/api/admin", adminRoutes(pool));

app.use("/", publicRoutes(pool));

/* =========================
404
========================= */

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/* =========================
ERROR HANDLER
========================= */

app.use((err, req, res, next) => {
  console.error("Server error:", err);

  res.status(500).json({
    message: "Internal server error"
  });
});

/* =========================
START SERVER
========================= */

const startServer = async () => {
  try {

    await pool.query("SELECT 1");
    console.log("Database connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log("Server running on port", PORT);
    });

  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
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