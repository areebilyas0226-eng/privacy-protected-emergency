import express from "express";
import rateLimit from "express-rate-limit";
import { generateOTP, otpExpiry } from "../services/otp.service.js";

export default function otpRoutes(pool) {
  const router = express.Router();

  // =========================
  // Rate Limiter (IP based)
  // =========================
  const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many OTP attempts. Try later." }
  });

  // =========================
  // Send OTP
  // =========================
  router.post("/send", otpLimiter, async (req, res) => {
    let { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({ message: "Mobile required" });
    }

    mobile = mobile.trim();

    const otp = generateOTP();

    try {
      // 🔴 Invalidate previous OTPs for this mobile
      await pool.query(
        `
        UPDATE otp_verifications
        SET verified = true
        WHERE mobile = $1
          AND verified = false
        `,
        [mobile]
      );

      // 🔴 Insert fresh OTP
      await pool.query(
        `
        INSERT INTO otp_verifications
        (mobile, otp_code, expires_at, verified)
        VALUES ($1, $2, $3, false)
        `,
        [mobile, otp, otpExpiry()]
      );

      // TODO: Integrate MSG91 here
      console.log("OTP:", otp);

      return res.json({
        message: "OTP sent successfully"
      });

    } catch (error) {
      console.error("OTP send error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // =========================
  // Verify OTP
  // =========================
  router.post("/verify", async (req, res) => {
    let { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({
        message: "mobile and otp required"
      });
    }

    mobile = mobile.trim();

    try {
      const result = await pool.query(
        `
        SELECT id
        FROM otp_verifications
        WHERE mobile = $1
          AND otp_code = $2
          AND expires_at > NOW()
          AND verified = false
        ORDER BY created_at DESC
        LIMIT 1
        `,
        [mobile, otp]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({
          message: "Invalid or expired OTP"
        });
      }

      // 🔴 Mark only that OTP as verified
      await pool.query(
        `
        UPDATE otp_verifications
        SET verified = true
        WHERE id = $1
        `,
        [result.rows[0].id]
      );

      return res.json({
        message: "OTP verified successfully"
      });

    } catch (error) {
      console.error("OTP verify error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  return router;
}