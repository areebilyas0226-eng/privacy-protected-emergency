import express from "express";

export default function emergencyRoutes(pool) {

  const router = express.Router();

  /*
  =====================================================
  GET /api/emergency/:code
  Fetch emergency information for QR scan
  =====================================================
  */

  router.get("/:code", async (req, res) => {

    try {

      /* ==========================
      VALIDATE QR INPUT
      ========================== */

      let code = req.params.code;

      if (!code) {
        return res.status(400).json({
          status: "invalid_qr",
          owner_name: null,
          owner_mobile: null,
          vehicle_number: null,
          model: null,
          blood_group: null,
          emergency_contact: null,
          ambulance: "108",
          police: "100",
          fire: "101"
        });
      }

      code = code.trim();

      const qrPattern = /^[A-Za-z0-9\-]+$/;

      if (!qrPattern.test(code)) {
        return res.status(400).json({
          status: "invalid_qr"
        });
      }

      /* ==========================
      FETCH QR + PROFILE
      ========================== */

      let result;

      try {

        result = await pool.query(
          `
          SELECT
            q.id,
            q.status,
            q.expires_at,

            p.owner_name,
            p.owner_mobile,
            p.vehicle_number,
            p.model,
            p.blood_group,
            p.emergency_contact

          FROM qr_tags q
          LEFT JOIN vehicle_profiles p
          ON q.id = p.qr_tag_id

          WHERE q.qr_code = $1
          LIMIT 1
          `,
          [code]
        );

      } catch (sqlErr) {

        console.error("SQL ERROR:", sqlErr);

        return res.status(500).json({
          status: "server_error"
        });

      }

      /* ==========================
      QR NOT FOUND
      ========================== */

      if (!result.rows || result.rows.length === 0) {

        return res.json({
          status: "not_found",
          owner_name: null,
          owner_mobile: null,
          vehicle_number: null,
          model: null,
          blood_group: null,
          emergency_contact: null,
          ambulance: "108",
          police: "100",
          fire: "101"
        });

      }

      const qr = result.rows[0];
      const now = new Date();

      /* ==========================
      QR INACTIVE
      ========================== */

      if (qr.status !== "active") {

        return res.json({
          status: "inactive",
          owner_name: null,
          owner_mobile: null,
          vehicle_number: null,
          model: null,
          blood_group: null,
          emergency_contact: null,
          ambulance: "108",
          police: "100",
          fire: "101"
        });

      }

      /* ==========================
      SUBSCRIPTION EXPIRED
      ========================== */

      if (qr.expires_at && new Date(qr.expires_at) < now) {

        return res.json({
          status: "expired",
          owner_name: null,
          owner_mobile: null,
          vehicle_number: null,
          model: null,
          blood_group: null,
          emergency_contact: null,
          ambulance: "108",
          police: "100",
          fire: "101"
        });

      }

      /* ==========================
      PROFILE MISSING
      ========================== */

      if (!qr.owner_mobile) {

        return res.json({
          status: "profile_missing",
          owner_name: null,
          owner_mobile: null,
          vehicle_number: null,
          model: null,
          blood_group: null,
          emergency_contact: null,
          ambulance: "108",
          police: "100",
          fire: "101"
        });

      }

      /* ==========================
      LOG SCAN EVENT
      ========================== */

      try {

        await pool.query(
          `
          INSERT INTO emergency_logs
          (qr_tag_id, action_type, caller_ip)
          VALUES ($1,'scan',$2)
          `,
          [qr.id, req.ip || null]
        );

      } catch (logErr) {

        console.error("Emergency scan log failed:", logErr);

      }

      /* ==========================
      SUCCESS RESPONSE
      ========================== */

      return res.json({

        status: "active",

        owner_name: qr.owner_name || "",
        owner_mobile: qr.owner_mobile || "",

        vehicle_number: qr.vehicle_number || "",
        model: qr.model || "",

        blood_group: qr.blood_group || "",
        emergency_contact: qr.emergency_contact || "",

        ambulance: "108",
        police: "100",
        fire: "101"

      });

    } catch (err) {

      console.error("EMERGENCY ROUTE ERROR:", err);

      return res.status(500).json({
        status: "server_error"
      });

    }

  });

  return router;

}