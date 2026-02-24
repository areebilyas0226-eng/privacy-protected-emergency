import express from "express";

export default function profileRoutes(pool) {
  const router = express.Router();

  router.get("/:type/:qrId", async (req, res) => {
    try {
      const { type, qrId } = req.params;

      if (!["vehicle", "pet"].includes(type)) {
        return res.status(400).json({
          message: "Invalid profile type"
        });
      }

      const table =
        type === "vehicle"
          ? "vehicle_profiles"
          : "pet_profiles";

      const result = await pool.query(
        `SELECT * FROM ${table} WHERE qr_id = $1 LIMIT 1`,
        [qrId]
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