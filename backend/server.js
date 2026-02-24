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

/* =========================
   PORT
========================= */
const PORT = process.env.PORT;
if (!PORT) {
  console.error("PORT not defined");
  process.exit(1);
}

/* =========================
   APP INIT
========================= */
const app = express();
app.set("trust proxy", 1);

/* =========================
   HEALTHCHECK
========================= */
app.get("/health", (_, res) => res.status(200).send("OK"));
app.get("/", (_, res) => res.status(200).send("OK"));

/* =========================
   SECURITY
========================= */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://your-frontend-domain.com"
    ],
    credentials: true
  })
);
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

/* =========================
   RATE LIMITERS
========================= */

const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_, res) =>
    res.status(429).json({ message: "Too many requests" })
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_, res) =>
    res.status(429).json({ message: "Admin rate limit exceeded" })
});

app.use("/api", publicLimiter);

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
  res.status(404).json({ message: "Route not found" });
});

/* =========================
   ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error("Server error:", err);

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