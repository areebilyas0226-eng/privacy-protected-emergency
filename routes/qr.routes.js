import express from "express";
import { generateOTP, otpExpiry } from "../services/otp.service.js";

export default function qrRoutes(pool) {
  const router = express.Router();

  // =========================
  // Test route
  // =========================
  router.get("/test", (req, res) => {
    return res.json({ message: "QR route working" });
  });

  // =========================
  // Create QR
  // =========================
  router.post("/", async (req, res) => {
    const { qr_code, type } = req.body;

    if (!qr_code || !type) {
      return res.status(400).json({
        message: "qr_code and type required"
      });
    }

    try {
      const result = await pool.query(
        `INSERT INTO qr_tags (qr_code, type, status)
         VALUES ($1, $2, 'inactive')
         RETURNING id, qr_code, type, status`,
        [qr_code, type]
      );

      return res.status(201).json({
        message: "QR created",
        data: result.rows[0]
      });

    } catch (error) {
      console.error("QR create error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // =========================
  // Get QR
  // =========================
  router.get("/:code", async (req, res) => {
    const { code } = req.params;

    try {
      const result = await pool.query(
        `
        SELECT 
          q.id,
          q.qr_code,
          q.type,
          q.status,
          q.activated_at,
          q.expires_at,
          v.vehicle_number,
          v.owner_mobile,
          v.blood_group,
          v.model
        FROM qr_tags q
        LEFT JOIN vehicle_profiles v
          ON q.id = v.qr_tag_id
        WHERE q.qr_code = $1
        `,
        [code]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "QR not found" });
      }

      const qr = result.rows[0];

      if (qr.status !== "active") {
        return res.status(403).json({ message: "QR not activated" });
      }

      if (qr.expires_at && new Date(qr.expires_at) < new Date()) {
        return res.status(403).json({ message: "QR expired" });
      }

      return res.json(qr);

    } catch (error) {
      console.error("QR fetch error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // =========================
  // Send OTP (Bound to QR)
  // =========================
  router.post("/:code/send-otp", async (req, res) => {
    const { code } = req.params;
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({ message: "Mobile required" });
    }

    try {
      const qrResult = await pool.query(
        `SELECT id FROM qr_tags WHERE qr_code = $1`,
        [code]
      );

      if (qrResult.rows.length === 0) {
        return res.status(404).json({ message: "QR not found" });
      }

      const qrId = qrResult.rows[0].id;
      const otp = generateOTP();

      await pool.query(
        `INSERT INTO otp_verifications 
         (qr_tag_id, mobile, otp, expires_at, verified)
         VALUES ($1, $2, $3, $4, false)`,
        [qrId, mobile, otp, otpExpiry()]
      );

      return res.json({
        message: "OTP sent",
        debug_otp: otp // REMOVE in production
      });

    } catch (error) {
      console.error("OTP send error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // =========================
  // Activate QR (STRICT + QR BOUND)
  // =========================
  router.post("/:code/activate", async (req, res) => {
    const { code } = req.params;
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({
        message: "mobile and otp required"
      });
    }

    try {
      // 1️⃣ Get QR ID first
      const qrResult = await pool.query(
        `SELECT id FROM qr_tags WHERE qr_code = $1`,
        [code]
      );

      if (qrResult.rows.length === 0) {
        return res.status(404).json({ message: "QR not found" });
      }

      const qrId = qrResult.rows[0].id;

      // 2️⃣ Strict OTP verification (BOUND TO QR)
      const otpCheck = await pool.query(
        `
        SELECT id FROM otp_verifications
        WHERE qr_tag_id = $1
          AND mobile = $2
          AND otp = $3
          AND expires_at > NOW()
          AND verified = false
        ORDER BY created_at DESC
        LIMIT 1
        `,
        [qrId, mobile, otp]
      );

      if (otpCheck.rows.length === 0) {
        return res.status(403).json({
          message: "Invalid or expired OTP"
        });
      }

      // 3️⃣ Mark OTP used
      await pool.query(
        `
        UPDATE otp_verifications
        SET verified = true
        WHERE id = $1
        `,
        [otpCheck.rows[0].id]
      );

      // 4️⃣ Activate QR
      const result = await pool.query(
        `
        UPDATE qr_tags
        SET status = 'active',
            activated_at = NOW()
        WHERE id = $1
          AND status != 'active'
        RETURNING id, qr_code, type, status, activated_at
        `,
        [qrId]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({
          message: "Already active"
        });
      }

      return res.json({
        message: "QR activated successfully",
        data: result.rows[0]
      });

    } catch (error) {
      console.error("QR activate error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  return router;
}