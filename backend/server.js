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

/* =========================
   ENV VALIDATION
========================= */

const requiredEnv = [
  "DATABASE_URL",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD_HASH",
  "JWT_SECRET"
];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.error(`${key} not defined`);
    process.exit(1);
  }
});

const PORT = process.env.PORT || 8080;

/* =========================
   APP INIT
========================= */

const app = express();
app.set("trust proxy", 1);

/* =========================
   SECURITY
========================= */

app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

/* =========================
   CORS (Clean + Safe)
========================= */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, false); // clean rejection
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.options("*", cors());

/* =========================
   HEALTHCHECK
========================= */

app.get("/", (_, res) => {
  res.status(200).send("OK");
});

app.get("/health", async (_, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).send("OK");
  } catch (err) {
    console.error("Health check DB error:", err);
    res.status(500).send("DB DOWN");
  }
});

/* =========================
   RATE LIMITERS
========================= */

const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
});

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Try later." }
});

/* =========================
   API ROUTES (FIRST)
========================= */

app.use("/api", publicLimiter);

app.use("/api/qr", qrRoutes(pool));
app.use("/api/profile", profileRoutes(pool));
app.use("/api/emergency", emergencyRoutes(pool));
app.use("/api/otp", otpRoutes(pool));
app.use("/api/masked", maskedRoutes(pool));

app.use("/api/admin/login", adminLoginLimiter);
app.use("/api/admin", adminRoutes(pool));

/* =========================
   PUBLIC ROUTES (LAST)
========================= */

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
  console.error("Server error:", err.message);

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON body" });
  }

  res.status(500).json({ message: "Internal server error" });
});

/* =========================
   START SERVER
========================= */

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

/* =========================
   DB CHECK
========================= */

pool
  .query("SELECT 1")
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Database connection failed:", err));

/* =========================
   GRACEFUL SHUTDOWN
========================= */

const shutdown = async () => {
  console.log("Shutdown signal received");

  server.close(async () => {
    try {
      await pool.end();
      console.log("Database pool closed");
    } catch (err) {
      console.error("Shutdown DB error:", err);
    }
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);