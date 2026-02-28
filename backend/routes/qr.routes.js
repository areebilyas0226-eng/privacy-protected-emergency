import express from "express";

export default function qrRoutes(pool) {
  const router = express.Router();

  function normalize(code) {
    return code?.trim() || null;
  }

  function getClientIP(req) {
    return (
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      req.ip ||
      "unknown"
    );
  }

  /* =========================
     CREATE QR
  ========================= */
  router.post("/", async (req, res) => {
    let { qr_code, type } = req.body;

    if (!qr_code || !type) {
      return res.status(400).json({ message: "qr_code and type required" });
    }

    qr_code = normalize(qr_code);

    try {
      const result = await pool.query(
        `INSERT INTO qr_tags (qr_code, type, status)
         VALUES ($1, $2, 'inactive')
         RETURNING id, qr_code, type, status`,
        [qr_code, type]
      );

      return res.status(201).json(result.rows[0]);

    } catch (err) {
      if (err.code === "23505") {
        return res.status(400).json({ message: "QR already exists" });
      }

      console.error("CREATE QR ERROR:", err);
      return res.status(500).json({ message: "Server error" });
    }
  });

  /* =========================
     ACTIVATE QR
  ========================= */
  router.post("/:code/activate", async (req, res) => {
    const code = normalize(req.params.code);

    if (!code) {
      return res.status(400).json({ message: "Invalid QR code" });
    }

    try {
      // Check existing status first
      const existing = await pool.query(
        `SELECT status FROM qr_tags WHERE qr_code = $1`,
        [code]
      );

      if (!existing.rows.length) {
        return res.status(404).json({ message: "QR not found" });
      }

      if (existing.rows[0].status === "active") {
        return res.status(400).json({ message: "Already activated" });
      }

      const result = await pool.query(
        `UPDATE qr_tags
         SET status = 'active',
             activated_at = NOW(),
             subscription_expires_at = NOW() + INTERVAL '30 days'
         WHERE qr_code = $1
         RETURNING *`,
        [code]
      );

      return res.json({
        message: "QR activated successfully",
        qr: result.rows[0]
      });

    } catch (err) {
      console.error("ACTIVATE ERROR:", err);
      return res.status(500).json({ message: "Server error" });
    }
  });

  /* =========================
     PUBLIC RESOLVER
  ========================= */
  router.get("/p/:code", async (req, res) => {
    const code = normalize(req.params.code);

    if (!code) {
      return res.status(400).json({ message: "Invalid QR code" });
    }

    try {
      const qrResult = await pool.query(
        `SELECT id, type
         FROM qr_tags
         WHERE qr_code = $1
           AND status = 'active'
           AND subscription_expires_at > NOW()`,
        [code]
      );

      if (!qrResult.rows.length) {
        return res.status(404).json({ message: "QR not active or expired" });
      }

      const qr = qrResult.rows[0];
      let profile = null;

      if (qr.type === "vehicle") {
        const r = await pool.query(
          `SELECT vehicle_number, model, blood_group
           FROM vehicle_profiles
           WHERE qr_tag_id = $1`,
          [qr.id]
        );
        profile = r.rows[0];
      }

      if (qr.type === "pet") {
        const r = await pool.query(
          `SELECT pet_name, breed
           FROM pet_profiles
           WHERE qr_tag_id = $1`,
          [qr.id]
        );
        profile = r.rows[0];
      }

      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      // Log view
      pool.query(
        `INSERT INTO emergency_logs (qr_tag_id, action_type, caller_ip)
         VALUES ($1, 'view', $2)`,
        [qr.id, getClientIP(req)]
      ).catch(console.error);

      return res.json({
        type: qr.type,
        data: profile
      });

    } catch (err) {
      console.error("PUBLIC RESOLVER ERROR:", err);
      return res.status(500).json({ message: "Server error" });
    }
  });

  /* =========================
     ADMIN FETCH
  ========================= */
  router.get("/:code", async (req, res) => {
    const code = normalize(req.params.code);

    if (!code) {
      return res.status(400).json({ message: "Invalid QR code" });
    }

    try {
      const result = await pool.query(
        `SELECT * FROM qr_tags WHERE qr_code = $1`,
        [code]
      );

      if (!result.rows.length) {
        return res.status(404).json({ message: "QR not found" });
      }

      return res.json(result.rows[0]);

    } catch (err) {
      console.error("ADMIN FETCH ERROR:", err);
      return res.status(500).json({ message: "Server error" });
    }
  });

  return router;
}