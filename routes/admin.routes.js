import express from "express";
import adminAuth from "../middleware/adminAuth.js";

export default function adminRoutes(pool) {
  const router = express.Router();

  /* =========================================
     🔐 ADMIN AUTH (Middleware Based)
  ========================================= */
  router.use(adminAuth);

  /* =========================================
     1️⃣ EXTEND / ACTIVATE SUBSCRIPTION
  ========================================= */
  router.post("/subscription/:code", async (req, res) => {
    const { code } = req.params;
    const months = parseInt(req.body.months);

    if (!months || months < 1) {
      return res.status(400).json({
        message: "Valid months required"
      });
    }

    try {
      const result = await pool.query(
        `
        UPDATE qr_tags
        SET 
          status = 'active',
          activated_at = COALESCE(activated_at, NOW()),
          expires_at = 
            CASE 
              WHEN expires_at IS NULL OR expires_at < NOW()
              THEN NOW() + ($2 * INTERVAL '1 month')
              ELSE expires_at + ($2 * INTERVAL '1 month')
            END
        WHERE qr_code = $1
        RETURNING id, qr_code, status, activated_at, expires_at
        `,
        [code, months]
      );

      if (!result.rows.length) {
        return res.status(404).json({ message: "QR not found" });
      }

      const qr = result.rows[0];

      await pool.query(
        `
        INSERT INTO subscription_logs (qr_tag_id, months_added)
        VALUES ($1, $2)
        `,
        [qr.id, months]
      );

      return res.json({
        message: "Subscription updated",
        data: qr
      });

    } catch (error) {
      console.error("Subscription update error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  /* =========================================
     2️⃣ LIST ALL QR CODES (PAGINATED)
  ========================================= */
  router.get("/qrs", async (req, res) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = 50;
    const offset = (page - 1) * limit;

    try {
      const result = await pool.query(
        `
        SELECT 
          q.qr_code,
          q.type,
          q.status,
          q.activated_at,
          q.expires_at,
          q.created_at,
          v.vehicle_number,
          v.owner_mobile
        FROM qr_tags q
        LEFT JOIN vehicle_profiles v
          ON q.id = v.qr_tag_id
        ORDER BY q.created_at DESC
        LIMIT $1 OFFSET $2
        `,
        [limit, offset]
      );

      return res.json({
        page,
        count: result.rows.length,
        data: result.rows
      });

    } catch (error) {
      console.error("QR list error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  /* =========================================
     3️⃣ EXPIRED SUBSCRIPTIONS
  ========================================= */
  router.get("/expired", async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT qr_code, expires_at
        FROM qr_tags
        WHERE expires_at IS NOT NULL
          AND expires_at < NOW()
        ORDER BY expires_at ASC
        `
      );

      return res.json(result.rows);

    } catch (error) {
      console.error("Expired list error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  /* =========================================
     4️⃣ EMERGENCY ACTIVITY LOGS (PAGINATED)
  ========================================= */
  router.get("/logs", async (req, res) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = 100;
    const offset = (page - 1) * limit;

    try {
      const result = await pool.query(
        `
        SELECT *
        FROM emergency_logs
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
        `,
        [limit, offset]
      );

      return res.json({
        page,
        count: result.rows.length,
        data: result.rows
      });

    } catch (error) {
      console.error("Logs fetch error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  return router;
}