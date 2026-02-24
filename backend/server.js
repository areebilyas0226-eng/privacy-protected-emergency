import dotenv from "dotenv";
dotenv.config();

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
   PORT (Railway strict)
========================= */
const PORT = process.env.PORT;

if (!PORT) {
  console.error("PORT not defined by environment");
  process.exit(1);
}

/* =========================
   APP INIT
========================= */
const app = express();
app.set("trust proxy", 1);

/* =========================
   HEALTHCHECK FIRST
========================= */
app.get("/health", (req, res) => {
  return res.status(200).send("OK");
});

app.get("/", (req, res) => {
  return res.status(200).send("OK");
});

/* =========================
   MIDDLEWARE
========================= */
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10kb" }));

/* =========================
   RATE LIMIT (API ONLY)
========================= */
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200
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
   404
========================= */
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

/* =========================
   ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

/* =========================
   START SERVER
========================= */
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

/* =========================
   DB CONNECT (NON BLOCKING)
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