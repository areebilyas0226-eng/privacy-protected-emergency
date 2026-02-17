import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

import pool from "./db.js";
import qrRoutes from "./routes/qr.routes.js";
import emergencyRoutes from "./routes/emergency.routes.js";
import otpRoutes from "./routes/otp.routes.js";
import maskedRoutes from "./routes/masked.routes.js";

dotenv.config();

const app = express();

/* =========================
   Global Rate Limiter
========================= */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests. Try again later."
});

app.use(cors());
app.use(express.json());
app.use(limiter);

/* =========================
   Routes
========================= */
app.use("/api/qr", qrRoutes(pool));
app.use("/api/emergency", emergencyRoutes(pool));
app.use("/api/otp", otpRoutes(pool));
app.use("/api/masked", maskedRoutes(pool));

/* =========================
   Root
========================= */
app.get("/", (req, res) => {
  res.status(200).send("API running");
});

/* =========================
   Health Check (Single Source)
========================= */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "Vahan Tag",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

/* =========================
   Railway Port Binding
========================= */
const PORT = process.env.PORT;

if (!PORT) {
  console.error("PORT is not defined.");
  process.exit(1);
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});