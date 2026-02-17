import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import pool from "./db.js";
import qrRoutes from "./routes/qr.routes.js";
import emergencyRoutes from "./routes/emergency.routes.js";
import otpRoutes from "./routes/otp.routes.js";
import maskedRoutes from "./routes/masked.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/qr", qrRoutes(pool));
app.use("/api/emergency", emergencyRoutes(pool));
app.use("/api/otp", otpRoutes(pool));
app.use("/api/masked", maskedRoutes(pool));

app.get("/", (req, res) => {
  res.send("API running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // 100 requests per IP
  message: "Too many requests. Try again later."
});

app.use(limiter);