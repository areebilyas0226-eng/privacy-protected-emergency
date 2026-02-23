import express from "express";

export default function qrRoutes(pool) {
  const router = express.Router();
  const ALLOWED_CONTACT_ACTIONS = ["sms", "call"];

  function getClientIP(req) {
    return (
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      req.ip ||
      "unknown"
    );
  }

  function normalize(code) {
    return code?.trim().toUpperCase() || null;
  }

  /* =========================
     TEST
  ========================= */
  router.get("/test", (req, res) => {
    res.json({ message: "QR route working" });
  });

  /* =========================
     CREATE QR
  ========================= */
  router.post("/", async (req, res) => {
    let { qr_code, type } = req.body;

    if (!qr_code || !type)
      return res.status(400).json({ message: "qr_code and type required" });

    qr_code = normalize(qr_code);

    try {
      const result = await pool.query(
        `INSERT INTO qr_tags (qr_code, type, status)
         VALUES ($1, $2, 'inactive')
         RETURNING id, qr_code, type, status`,
        [qr_code, type]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      if (err.code === "23505")
        return res.status(400).json({ message: "QR already exists" });

      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  /* =========================
     PUBLIC RESOLVER
     /api/qr/p/:code
  ========================= */
  router.get("/p/:code", async (req, res) => {
    const code = normalize(req.params.code);
    if (!code) return res.status(400).json({ message: "Invalid QR code" });

    try {
      const qrResult = await pool.query(
        `SELECT id, type
         FROM qr_tags
         WHERE qr_code = $1
           AND status = 'active'
           AND (expires_at IS NULL OR expires_at > NOW())`,
        [code]
      );

      if (!qrResult.rows.length)
        return res.status(404).json({ message: "QR not found or inactive" });

      const qr = qrResult.rows[0];
      let profile;

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

      if (!profile)
        return res.status(404).json({ message: "Profile not found" });

      pool.query(
        `INSERT INTO emergency_logs (qr_tag_id, action_type, caller_ip)
         VALUES ($1, 'view', $2)`,
        [qr.id, getClientIP(req)]
      ).catch(console.error);

      res.json({ type: qr.type, data: profile });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  /* =========================
     ADMIN FETCH
  ========================= */
  router.get("/:code", async (req, res) => {
    const code = normalize(req.params.code);
    if (!code) return res.status(400).json({ message: "Invalid QR code" });

    try {
      const result = await pool.query(
        `SELECT * FROM qr_tags WHERE qr_code = $1`,
        [code]
      );

      if (!result.rows.length)
        return res.status(404).json({ message: "QR not found" });

      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  return router;
}