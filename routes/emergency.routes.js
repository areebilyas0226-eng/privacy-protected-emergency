import express from "express";

export default function emergencyRoutes(pool) {
  const router = express.Router();

  // =========================================
  // 1️⃣ SCAN QR (Fetch Emergency Info Only)
  // =========================================
  router.get("/:code", async (req, res) => {
    const { code } = req.params;

    try {
      const qrResult = await pool.query(
        `
        SELECT id, status, expires_at, type
        FROM qr_tags
        WHERE qr_code = $1
        `,
        [code]
      );

      if (qrResult.rows.length === 0) {
        return res.status(404).json({ message: "QR not found" });
      }

      const qr = qrResult.rows[0];

      if (qr.status !== "active") {
        return res.status(403).json({ message: "QR not activated" });
      }

      if (qr.expires_at && new Date(qr.expires_at) < new Date()) {
        return res.status(403).json({ message: "QR expired" });
      }

      let profile = null;

      if (qr.type === "vehicle") {
        const result = await pool.query(
          `
          SELECT vehicle_number, blood_group, model
          FROM vehicle_profiles
          WHERE qr_tag_id = $1
          `,
          [qr.id]
        );

        if (result.rows.length > 0) {
          profile = result.rows[0];
        }
      }

      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      // 🔹 Log SCAN
      await pool.query(
        `
        INSERT INTO emergency_logs (qr_tag_id, action_type, caller_ip)
        VALUES ($1, 'scan', $2)
        `,
        [qr.id, req.ip]
      );

      return res.json({
        message: "Emergency data fetched",
        type: qr.type,
        data: profile,
        allow_call: true,
        allow_sms: true
      });

    } catch (error) {
      console.error("Emergency fetch error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // =========================================
  // 2️⃣ INITIATE MASKED CALL
  // =========================================
  router.post("/:code/call", async (req, res) => {
    const { code } = req.params;

    try {
      const qrResult = await pool.query(
        `
        SELECT q.id, q.status, v.owner_mobile
        FROM qr_tags q
        JOIN vehicle_profiles v ON q.id = v.qr_tag_id
        WHERE q.qr_code = $1
        `,
        [code]
      );

      if (qrResult.rows.length === 0) {
        return res.status(404).json({ message: "QR not found" });
      }

      const qr = qrResult.rows[0];

      if (qr.status !== "active") {
        return res.status(403).json({ message: "QR not activated" });
      }

      // 🔴 IMPORTANT:
      // Do NOT expose qr.owner_mobile here.
      // Instead, integrate MSG91/Exotel masked call API here.

      // TODO: call masking provider integration

      await pool.query(
        `
        INSERT INTO emergency_logs (qr_tag_id, action_type, caller_ip)
        VALUES ($1, 'call', $2)
        `,
        [qr.id, req.ip]
      );

      return res.json({
        message: "Call initiated",
        status: "processing"
      });

    } catch (error) {
      console.error("Emergency call error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // =========================================
  // 3️⃣ EMERGENCY SMS
  // =========================================
  router.post("/:code/sms", async (req, res) => {
    const { code } = req.params;
    const { message } = req.body;

    if (!message || message.length < 5) {
      return res.status(400).json({ message: "Valid message required" });
    }

    try {
      const qrResult = await pool.query(
        `
        SELECT q.id, q.status, v.owner_mobile
        FROM qr_tags q
        JOIN vehicle_profiles v ON q.id = v.qr_tag_id
        WHERE q.qr_code = $1
        `,
        [code]
      );

      if (qrResult.rows.length === 0) {
        return res.status(404).json({ message: "QR not found" });
      }

      const qr = qrResult.rows[0];

      if (qr.status !== "active") {
        return res.status(403).json({ message: "QR not activated" });
      }

      // TODO: Integrate MSG91 SMS here

      await pool.query(
        `
        INSERT INTO emergency_logs (qr_tag_id, action_type, caller_ip)
        VALUES ($1, 'sms', $2)
        `,
        [qr.id, req.ip]
      );

      return res.json({
        message: "Emergency SMS sent",
        status: "processing"
      });

    } catch (error) {
      console.error("Emergency SMS error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  return router;
}