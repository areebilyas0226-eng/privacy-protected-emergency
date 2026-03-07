import express from "express";

export default function profileRoutes(pool) {
  const router = express.Router();

  /* ================= GET PROFILE BY QR ================= */

  router.get("/:type/:qrCode", async (req, res) => {
    try {
      const { type, qrCode } = req.params;

      if (!["vehicle", "pet"].includes(type)) {
        return res.status(400).json({ message: "Invalid profile type" });
      }

      // find qr_tag_id from qr_code
      const qrResult = await pool.query(
        `SELECT id FROM qr_tags WHERE qr_code=$1 LIMIT 1`,
        [qrCode]
      );

      if (qrResult.rowCount === 0) {
        return res.status(404).json({ message: "QR not found" });
      }

      const qrTagId = qrResult.rows[0].id;

      const table =
        type === "vehicle"
          ? "vehicle_profiles"
          : "pet_profiles";

      const result = await pool.query(
        `SELECT * FROM ${table} WHERE qr_tag_id=$1 LIMIT 1`,
        [qrTagId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          message: "Profile not found"
        });
      }

      return res.json(result.rows[0]);

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Server error"
      });
    }
  });

  return router;
}